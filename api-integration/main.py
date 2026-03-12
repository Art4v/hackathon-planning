# main.py — Simple Stock Data REST API
# A minimal FastAPI app that returns live stock data for any ticker symbol.

from fastapi import FastAPI, HTTPException
import yfinance as yf
import csv
import os
import threading
from datetime import datetime

# Create the FastAPI application instance
app = FastAPI(title="Stock Data API")

# Dict mapping uppercase ticker -> threading.Event (set = stop signal)
active_trackers: dict[str, threading.Event] = {}


def fetch_and_save(ticker: str) -> dict | None:
    """
    Fetch live stock data for a ticker and append it to a CSV file.
    Returns the response dict, or None if the ticker is invalid.
    """
    stock = yf.Ticker(ticker.upper())
    info = stock.info

    if info.get("currentPrice") is None and info.get("regularMarketPrice") is None:
        return None

    response = {
        "ticker": ticker.upper(),
        "name": info.get("shortName", "N/A"),
        "current_price": info.get("currentPrice") or info.get("regularMarketPrice"),
        "day_high": info.get("dayHigh", None),
        "day_low": info.get("dayLow", None),
        "volume": info.get("volume", None),
        "market_cap": info.get("marketCap", None),
    }

    entry = {"timestamp": datetime.now().isoformat(), **response}
    os.makedirs("data", exist_ok=True)
    filepath = f"data/{ticker.upper()}.csv"
    headers = list(entry.keys())
    file_exists = os.path.exists(filepath)

    with open(filepath, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        if not file_exists:
            writer.writeheader()
        writer.writerow(entry)

    return response


def tracking_loop(ticker: str, stop_event: threading.Event):
    """Background loop that fetches stock data every 10 seconds until stopped."""
    while not stop_event.is_set():
        fetch_and_save(ticker)
        stop_event.wait(10)


@app.get("/stock/{ticker}")
def get_stock(ticker: str):
    """
    Fetch live stock data for a given ticker symbol.
    Returns key metrics like price, day range, volume, and market cap.
    """
    result = fetch_and_save(ticker)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker.upper()}' not found or has no market data.",
        )
    return result


@app.post("/track/{ticker}")
def start_tracking(ticker: str):
    """Start continuous background tracking for a ticker (polls every 10s)."""
    ticker_upper = ticker.upper()

    if ticker_upper in active_trackers:
        raise HTTPException(
            status_code=409,
            detail=f"Already tracking '{ticker_upper}'.",
        )

    # Validate the ticker by fetching once
    result = fetch_and_save(ticker)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker_upper}' not found or has no market data.",
        )

    stop_event = threading.Event()
    active_trackers[ticker_upper] = stop_event
    thread = threading.Thread(
        target=tracking_loop, args=(ticker_upper, stop_event), daemon=True
    )
    thread.start()

    return {"status": "tracking", "ticker": ticker_upper, "interval_seconds": 10}


@app.delete("/track/{ticker}")
def stop_tracking(ticker: str):
    """Stop continuous background tracking for a ticker."""
    ticker_upper = ticker.upper()

    if ticker_upper not in active_trackers:
        raise HTTPException(
            status_code=404,
            detail=f"Not currently tracking '{ticker_upper}'.",
        )

    active_trackers[ticker_upper].set()
    del active_trackers[ticker_upper]

    return {"status": "stopped", "ticker": ticker_upper}


@app.get("/tracking")
def list_tracking():
    """Return all tickers currently being tracked."""
    return {"tracking": list(active_trackers.keys())}
