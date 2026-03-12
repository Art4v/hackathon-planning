# main.py — Simple Stock Data REST API
# A minimal FastAPI app that returns live stock data for any ticker symbol.

from fastapi import FastAPI, HTTPException
import yfinance as yf
import csv
import os
import threading
from datetime import datetime
from zoneinfo import ZoneInfo

# Create the FastAPI application instance
app = FastAPI(title="Stock Data API")

# Clear old CSV data on startup
import shutil
if os.path.exists("data"):
    shutil.rmtree("data")

# Dict mapping uppercase ticker -> threading.Event (set = stop signal)
active_trackers: dict[str, threading.Event] = {}


def is_market_open() -> bool:
    """Check if US stock market is currently open (Mon-Fri 9:30 AM - 4:00 PM ET)."""
    now = datetime.now(ZoneInfo("America/New_York"))
    # Weekend check
    if now.weekday() >= 5:
        return False
    # Time check: 9:30 AM to 4:00 PM ET
    market_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
    market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
    return market_open <= now < market_close


def backfill_history(ticker: str) -> int:
    """Fetch last 24h of 1-minute intraday data and append to CSV. Returns rows written."""
    stock = yf.Ticker(ticker.upper())
    info = stock.info
    history = stock.history(period="2d", interval="1m")

    if history.empty:
        return 0

    name = info.get("shortName", "N/A")
    market_cap = info.get("marketCap", None)

    os.makedirs("data", exist_ok=True)
    filepath = f"data/{ticker.upper()}.csv"
    headers = [
        "timestamp", "ticker", "name", "current_price",
        "day_high", "day_low", "volume", "market_cap",
    ]
    file_exists = os.path.exists(filepath)

    rows_written = 0
    with open(filepath, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        if not file_exists:
            writer.writeheader()
        for ts, row in history.iterrows():
            entry = {
                "timestamp": ts.isoformat(),
                "ticker": ticker.upper(),
                "name": name,
                "current_price": row["Close"],
                "day_high": row["High"],
                "day_low": row["Low"],
                "volume": int(row["Volume"]),
                "market_cap": market_cap,
            }
            writer.writerow(entry)
            rows_written += 1

    return rows_written


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
    """Background loop that fetches stock data every 10s during market hours."""
    while not stop_event.is_set():
        if is_market_open():
            fetch_and_save(ticker)
            stop_event.wait(10)       # poll every 10s during market hours
        else:
            stop_event.wait(60)       # check once per minute when market is closed


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

    # Seed CSV with last 24h of intraday data
    history_rows = backfill_history(ticker_upper)

    stop_event = threading.Event()
    active_trackers[ticker_upper] = stop_event
    thread = threading.Thread(
        target=tracking_loop, args=(ticker_upper, stop_event), daemon=True
    )
    thread.start()

    return {
        "status": "tracking",
        "ticker": ticker_upper,
        "interval_seconds": 10,
        "history_rows": history_rows,
    }


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
