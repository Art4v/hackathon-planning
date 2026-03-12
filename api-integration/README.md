# Stock Data API

A minimal FastAPI REST API that returns live stock data for any ticker symbol using yfinance.

## Setup

```bash
cd api-integration
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload
```

The server starts at `http://localhost:8000`.

## Usage

### Get stock data

```
GET /stock/{ticker}
```

**Example request:**
```
GET http://localhost:8000/stock/AAPL
```

**Example response:**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "current_price": 178.72,
  "day_high": 180.12,
  "day_low": 177.43,
  "volume": 52340000,
  "market_cap": 2780000000000
}
```

### Live Tracking

Start, stop, and list continuous background tracking for any ticker. While tracking is active, the API polls yfinance every 10 seconds and appends each data point to the ticker's CSV file.

**Start tracking:**
```
POST http://localhost:8000/track/AAPL
```
```json
{
  "status": "tracking",
  "ticker": "AAPL",
  "interval_seconds": 10
}
```

**Stop tracking:**
```
DELETE http://localhost:8000/track/AAPL
```
```json
{
  "status": "stopped",
  "ticker": "AAPL"
}
```

**List tracked tickers:**
```
GET http://localhost:8000/tracking
```
```json
{
  "tracking": ["AAPL", "TSLA"]
}
```

- `POST /track/{ticker}` on an already-tracked ticker returns **409 Conflict**.
- `POST /track/{ticker}` with an invalid ticker returns **404**.
- `DELETE /track/{ticker}` on a non-tracked ticker returns **404**.

### Data persistence

Each successful request automatically saves the fetched data to `data/{TICKER}.csv`. Each attribute is a column heading, and repeated requests append new rows to the file. The `data/` directory is created automatically on the first request.

**Invalid ticker → 404:**
```
GET http://localhost:8000/stock/INVALIDXYZ
```
```json
{
  "detail": "Ticker 'INVALIDXYZ' not found or has no market data."
}
```
