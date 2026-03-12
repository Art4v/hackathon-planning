# main.py — Simple Stock Data REST API
# A minimal FastAPI app that returns live stock data for any ticker symbol
# and tracks financial news from Finnhub.

from fastapi import FastAPI, HTTPException
import yfinance as yf
import finnhub
from dotenv import load_dotenv
import csv
import os
import threading
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

# Load environment variables from .env (e.g., FINNHUB_API_KEY)
load_dotenv()

# Create the FastAPI application instance
app = FastAPI(title="Stock Data API")

# Initialize Finnhub client using API key from environment
finnhub_client = finnhub.Client(api_key=os.getenv("FINNHUB_API_KEY", ""))

# Clear old CSV data on startup so each run starts fresh
import shutil
if os.path.exists("data"):
    shutil.rmtree("data")

# Dict mapping uppercase ticker -> threading.Event (set = stop signal)
active_trackers: dict[str, threading.Event] = {}

# News tracker dict — at most one key ("finnews") -> threading.Event
news_tracker: dict[str, threading.Event] = {}

# In-memory set of Finnhub article IDs we've already written to CSV,
# used to deduplicate across polling cycles (news doesn't change every 5s)
seen_news_ids: set[int] = set()


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

    os.makedirs("data/tracking", exist_ok=True)
    filepath = f"data/tracking/{ticker.upper()}.csv"
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
    os.makedirs("data/tracking", exist_ok=True)
    filepath = f"data/tracking/{ticker.upper()}.csv"
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

# ---------------------------------------------------------------------------
# Stock Price Tracking (yfinance)
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Financial News Tracking (Finnhub)
# ---------------------------------------------------------------------------


def _write_news_articles(articles: list) -> int:
    """
    Write a list of Finnhub news articles to CSV, deduplicating by article ID.
    Shared by both backfill_news() and fetch_and_save_news().
    Returns the number of new rows written.
    """
    os.makedirs("data/financial_news", exist_ok=True)
    filepath = "data/financial_news/financial news.csv"
    headers = ["timestamp", "headline", "source", "summary", "url", "category", "related"]
    file_exists = os.path.exists(filepath)

    rows_written = 0
    with open(filepath, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        if not file_exists:
            writer.writeheader()

        for article in articles:
            article_id = article.get("id")
            # Skip articles we've already saved
            if article_id in seen_news_ids:
                continue
            seen_news_ids.add(article_id)

            # Convert unix timestamp to ISO format
            unix_ts = article.get("datetime", 0)
            iso_ts = datetime.fromtimestamp(unix_ts, tz=timezone.utc).isoformat()

            writer.writerow({
                "timestamp": iso_ts,
                "headline": article.get("headline", ""),
                "source": article.get("source", ""),
                "summary": article.get("summary", ""),
                "url": article.get("url", ""),
                "category": article.get("category", ""),
                "related": article.get("related", ""),
            })
            rows_written += 1

    return rows_written


def backfill_news() -> int:
    """
    Fetch the last 2 days of general news from Finnhub and write to CSV.
    The finnhub-python library doesn't expose date params, so we call the
    API directly using the client's session and API key.
    Returns the number of rows written.
    """
    today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
    two_days_ago = (datetime.now(tz=timezone.utc) - timedelta(days=2)).strftime("%Y-%m-%d")

    # Hit the Finnhub /news endpoint with from/to date filters
    resp = finnhub_client._session.get(
        f"{finnhub_client.API_URL}/news",
        params={
            "category": "general",
            "from": two_days_ago,
            "to": today,
            "token": finnhub_client.api_key,
        },
    )
    articles = resp.json() if resp.status_code == 200 else []
    return _write_news_articles(articles)


def fetch_and_save_news() -> int:
    """
    Fetch latest general market news from Finnhub and append new articles to CSV.
    Deduplicates via _write_news_articles. Returns the number of new rows written.
    """
    articles = finnhub_client.general_news('general')
    return _write_news_articles(articles)


def news_tracking_loop(stop_event: threading.Event):
    """Background loop that fetches financial news every 5 seconds until stopped."""
    while not stop_event.is_set():
        fetch_and_save_news()
        stop_event.wait(5)  # poll every 5 seconds


@app.post("/finnews")
def start_news_tracking():
    """Start continuous background tracking of general financial news from Finnhub."""
    if "finnews" in news_tracker:
        raise HTTPException(
            status_code=409,
            detail="Already tracking financial news.",
        )

    # Seed the CSV with the last 2 days of news before starting live polling
    backfill_rows = backfill_news()

    stop_event = threading.Event()
    news_tracker["finnews"] = stop_event
    thread = threading.Thread(
        target=news_tracking_loop, args=(stop_event,), daemon=True
    )
    thread.start()

    return {
        "status": "tracking",
        "source": "finnhub",
        "category": "general",
        "interval_seconds": 5,
        "backfill_rows": backfill_rows,
    }


@app.delete("/finnews")
def stop_news_tracking():
    """Stop the financial news tracking background thread."""
    if "finnews" not in news_tracker:
        raise HTTPException(
            status_code=404,
            detail="Not currently tracking financial news.",
        )

    # Signal the background thread to stop and clean up
    news_tracker["finnews"].set()
    del news_tracker["finnews"]

    return {"status": "stopped", "source": "finnhub"}
