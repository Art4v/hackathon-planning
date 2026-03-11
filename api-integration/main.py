from contextlib import asynccontextmanager
from pathlib import Path

import pandas as pd
import yfinance as yf
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Globals
# ---------------------------------------------------------------------------
DATA_DIR = Path(__file__).parent / "data"
tracked_tickers: set[str] = set()
scheduler = BackgroundScheduler()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class StockRecord(BaseModel):
    datetime: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class TickerResponse(BaseModel):
    ticker: str
    records: list[StockRecord]


class MessageResponse(BaseModel):
    message: str

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def csv_path(ticker: str) -> Path:
    return DATA_DIR / f"{ticker}.csv"


def fetch_ticker_data(ticker: str) -> pd.DataFrame:
    """Download live 1-minute OHLCV data for *ticker* from Yahoo Finance."""
    df = yf.download(ticker, period="1d", interval="1m", progress=False)
    if df.empty:
        return df
    # yfinance ≥0.2.31 may return multi-level columns for single tickers
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.index.name = "Datetime"
    return df


def save_data(ticker: str, df: pd.DataFrame) -> None:
    """Write *df* to CSV, appending only new rows if the file already exists."""
    path = csv_path(ticker)
    if path.exists():
        existing = pd.read_csv(path, parse_dates=["Datetime"])
        last_date = existing["Datetime"].max()
        new_rows = df[df.index > last_date]
        if new_rows.empty:
            return
        new_rows.to_csv(path, mode="a", header=False)
    else:
        df.to_csv(path)


def update_all_tickers() -> None:
    """Scheduler callback — refresh data for every tracked ticker."""
    for ticker in list(tracked_tickers):
        try:
            df = fetch_ticker_data(ticker)
            if not df.empty:
                save_data(ticker, df)
        except Exception as exc:
            print(f"[scheduler] Error updating {ticker}: {exc}")

# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    DATA_DIR.mkdir(exist_ok=True)
    # Resume tracking from any CSVs already on disk
    for f in DATA_DIR.glob("*.csv"):
        tracked_tickers.add(f.stem.upper())
    scheduler.add_job(update_all_tickers, "interval", seconds=60)
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown(wait=False)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Stock Data Tracker", lifespan=lifespan)


@app.post("/track/{ticker}", response_model=MessageResponse)
def track_ticker(ticker: str):
    ticker = ticker.upper()
    if ticker in tracked_tickers:
        return MessageResponse(message=f"{ticker} is already being tracked.")

    df = fetch_ticker_data(ticker)
    if df.empty:
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")

    save_data(ticker, df)
    tracked_tickers.add(ticker)
    return MessageResponse(message=f"Now tracking {ticker}. {len(df)} rows saved.")


@app.delete("/track/{ticker}", response_model=MessageResponse)
def untrack_ticker(ticker: str):
    ticker = ticker.upper()
    if ticker not in tracked_tickers:
        raise HTTPException(status_code=404, detail=f"{ticker} is not being tracked.")
    tracked_tickers.discard(ticker)
    return MessageResponse(message=f"Stopped tracking {ticker}. CSV data retained.")


@app.get("/data/{ticker}", response_model=TickerResponse)
def get_ticker_data(ticker: str):
    ticker = ticker.upper()
    path = csv_path(ticker)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"No data found for {ticker}.")

    df = pd.read_csv(path)
    records = [
        StockRecord(
            datetime=str(row["Datetime"]),
            open=row["Open"],
            high=row["High"],
            low=row["Low"],
            close=row["Close"],
            volume=row["Volume"],
        )
        for _, row in df.iterrows()
    ]
    return TickerResponse(ticker=ticker, records=records)


@app.get("/data/{ticker}/csv")
def get_ticker_csv(ticker: str):
    ticker = ticker.upper()
    path = csv_path(ticker)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"No CSV found for {ticker}.")
    return FileResponse(path, media_type="text/csv", filename=f"{ticker}.csv")


@app.get("/tracked")
def list_tracked():
    return sorted(tracked_tickers)
