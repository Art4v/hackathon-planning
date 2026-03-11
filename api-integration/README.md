# Stock Data Tracker API

A FastAPI REST API that tracks stock tickers, fetches daily OHLCV data from Yahoo Finance, stores it in CSVs, and auto-refreshes every 60 seconds.

## Setup

```bash
cd api-integration
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive docs are available at `/docs`.

## Endpoints

### Track a ticker
```bash
curl -X POST http://127.0.0.1:8000/track/AAPL
```

### Stop tracking a ticker
```bash
curl -X DELETE http://127.0.0.1:8000/track/AAPL
```

### Get data as JSON
```bash
curl http://127.0.0.1:8000/data/AAPL
```

### Download CSV
```bash
curl -O http://127.0.0.1:8000/data/AAPL/csv
```

### List tracked tickers
```bash
curl http://127.0.0.1:8000/tracked
```

## How It Works

- **POST /track/{ticker}** validates the ticker against Yahoo Finance, downloads full daily history, saves to `data/{TICKER}.csv`, and adds it to the tracked set.
- **APScheduler** runs a background job every 60 seconds that appends any new daily rows to each tracked ticker's CSV.
- **DELETE /track/{ticker}** stops auto-refreshing but keeps the CSV on disk.
- Data persists across restarts — on startup the API resumes tracking from any CSVs in `data/`.
