# FastAPI + Supabase Statements API

A simple CRUD REST API built with FastAPI, backed by a Supabase Postgres database.

## Prerequisites

- Python 3.8+
- A [Supabase](https://supabase.com) account (free tier is fine)

## 1. Create the Supabase Table

In your Supabase project, open the **SQL Editor** and run:

```sql
create table statements (
  id bigint generated always as identity primary key,
  text text not null
);
```

## 2. Get Your Supabase Credentials

Go to **Project Settings → API** and copy:
- **Project URL** — looks like `https://xxxx.supabase.co`
- **anon / public key** — a long JWT starting with `eyJ...`

## 3. Configure Environment Variables

Copy the example file and fill in your real credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-anon-key-here
```

Never commit `.env` — it is already listed in `.gitignore`.

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Run the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## API Reference

Interactive docs are available at `http://127.0.0.1:8000/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/statements` | List all statements |
| GET | `/statements/{id}` | Get a single statement |
| POST | `/statements` | Create a statement |
| PUT | `/statements/{id}` | Update a statement |
| DELETE | `/statements/{id}` | Delete a statement |

### Example

```bash
# Create
curl -X POST http://127.0.0.1:8000/statements \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello Supabase"}'

# List all
curl http://127.0.0.1:8000/statements
```
