# main.py — Simple Stock Data REST API
# A minimal FastAPI app that returns live stock data for any ticker symbol.

from fastapi import FastAPI, HTTPException
import yfinance as yf
import csv
import os
from datetime import datetime

# Create the FastAPI application instance
app = FastAPI(title="Stock Data API")


@app.get("/stock/{ticker}")
def get_stock(ticker: str):
    """
    Fetch live stock data for a given ticker symbol.
    Returns key metrics like price, day range, volume, and market cap.
    """

    # Create a yfinance Ticker object for the requested symbol
    stock = yf.Ticker(ticker.upper())

    # Pull the "info" dict — this contains all summary data for the stock
    info = stock.info

    # yfinance returns a mostly-empty dict for invalid tickers.
    # We check for a valid market price to confirm the ticker exists.
    if info.get("currentPrice") is None and info.get("regularMarketPrice") is None:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker.upper()}' not found or has no market data.",
        )

    # Build the response using available fields.
    # yfinance sometimes uses different keys, so we fall back between them.
    response = {
        "ticker": ticker.upper(),
        "name": info.get("shortName", "N/A"),
        "current_price": info.get("currentPrice") or info.get("regularMarketPrice"),
        "day_high": info.get("dayHigh", None),
        "day_low": info.get("dayLow", None),
        "volume": info.get("volume", None),
        "market_cap": info.get("marketCap", None),
    }

    # --- Data Persistence ---
    # Build a timestamped entry combining the current time with all stock fields
    entry = {"timestamp": datetime.now().isoformat(), **response}

    # Ensure the data/ directory exists (no-op if it already does)
    os.makedirs("data", exist_ok=True)

    # Path to the per-ticker CSV file (e.g. data/AAPL.csv)
    filepath = f"data/{ticker.upper()}.csv"

    # CSV column headers matching the entry keys
    headers = list(entry.keys())

    # Check if the file already exists so we know whether to write headers
    file_exists = os.path.exists(filepath)

    # Append the new row to the CSV; write headers only if the file is new
    with open(filepath, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        if not file_exists:
            writer.writeheader()
        writer.writerow(entry)

    return response
