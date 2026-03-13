# UniHack Preparation

This repo documents my preparation for **UniHack** — a university hackathon. It covers hands-on experiments across web dev, backend APIs, and ML/data science to build skills before the competition.

## What's Inside

### `claude_code_test/` — Initial Experimentation with Claude Code
This directory was used as a sandbox for learning how to work effectively with Claude Code as an AI-assisted development tool. The focus was on understanding Claude Code's features before applying them to more serious projects.

**Claude Code features explored:**
- **Memory** — tested persistent memory across sessions, teaching Claude project conventions and file structure so context carried over between conversations
- **Tasks** — used the task list system to break work into tracked steps, helping manage multi-part builds without losing progress
- **CLAUDE.md** — experimented with project-level instruction files to shape Claude's behaviour and enforce conventions automatically

**Applications built while learning these features:**
- **`tictactoe.html`** — Classic tic-tac-toe game (first Claude Code experiment)
- **`shooter/shooter.html`** — Top-down retro shooter (NEON ASSAULT) with 5 levels, multiple enemy types, and a high score system persisted via localStorage
- **`index.html`** — Playground/landing page

All apps are single self-contained HTML files with embedded CSS and JS, rendered entirely via the HTML5 Canvas API with no external dependencies.

Skills practiced: Claude Code workflow, AI-assisted development, HTML5 Canvas API, game state machines, browser-based rendering.

### `fast_api/` — Backend API Development
Building a persistent REST API with Python.

- **FastAPI** for routing and request validation (Pydantic models)
- **Supabase** (Postgres) as the database — replacing in-memory storage with a real persistent backend
- **python-dotenv** for secret management

Skills practiced: REST API design, CRUD operations, connecting a Python backend to a cloud database, environment variable hygiene.

See [`fast_api/README.md`](fast_api/README.md) for setup instructions.

### `login_page/` — Full-Stack Authentication with FastAPI
A complete login/signup/dashboard web app built with FastAPI and Supabase, learning how to wire a Python backend to a cloud database with real session management. Built entirely by hand without AI assistance.

- **`main.py`** — FastAPI app with GET/POST routes for login, signup, dashboard, and logout
- **`templates/`** — Jinja2 HTML templates (login, signup, dashboard)
- **`static/`** — Static assets (CSS, etc.)
- **FastAPI** for routing, **Supabase** (Postgres) for persistence, **SessionMiddleware** for auth, **python-dotenv** for secrets

Skills practiced: FastAPI routing, Jinja2 templating, session-based authentication, password hashing, Supabase integration, environment variable hygiene.

### `ML-stock-price-prediction/` — Machine Learning & Quantitative Finance
Experimenting with statistical and ML models for financial data.

- Monte Carlo simulations for price path forecasting
- GARCH models for volatility estimation
- Formula scripts exploring quantitative strategies

Skills practiced: NumPy/pandas data pipelines, statistical modelling, financial simulation.

### `api-integration/` — Stock Data & Live Tracking REST API
A FastAPI backend providing live stock data, continuous background tracking, and financial news ingestion.

- **`main.py`** — Endpoints for spot quotes (`/stock/{ticker}`), live tracking (`POST/DELETE /track/{ticker}`), and financial news (`POST/DELETE /finnews`)
- **yfinance** for real-time market data (no API key required); **Finnhub** for financial news (API key via `.env`)
- Background threads auto-backfill 24 hours of 1-minute history on tracker start; market-hours aware (Mon–Fri 9:30–16:00 ET)
- Tracked data persisted to `data/{TICKER}.csv`; news to `financial_news/financial news.csv`

Skills practiced: FastAPI routing, background threads, third-party API integration, CSV persistence, environment variable hygiene, error handling.

### `ui_planning/` — Dashboard UI Prototypes
Interactive desktop-style dashboard demos for the Canary AI trading platform, built with React (CDN) and GSAP animations.

- **`dashboard_sky_demo.html`** — Main entry point for the animated sky dashboard with draggable windows
- **`components/`** — Modular React components (SkyLayer, Dock, AppWindow, content panels)
- **`animations/gsapAnimations.js`** — GSAP-powered animation utilities (cloud drift, bird flight, hover effects, window transitions)
- Uses GSAP Draggable for window drag, custom resize handlers, and CDN-loaded React with Babel standalone

Skills practiced: GSAP animation library, React component architecture, drag-and-drop UI, modular file structure without build tools.

### `prediction/optimizer/` — Efficient Frontier Portfolio Optimizer
C++ program that computes optimal portfolio allocation across AAPL, TSLA, and BOBS using mean-variance optimization on the efficient frontier.

- **`portfolio_optimizer.cpp`** — single-file optimizer: reads price CSVs, computes log returns, builds the efficient frontier via grid search, and outputs trade recommendations
- **`Makefile`** — build with `g++ -std=c++17` and Eigen headers
- Uses **Eigen** (header-only) for matrix math; supports `balanced`, `risk_averse`, and `risk_agg` strategies via `--risk_strat` CLI arg

Skills practiced: C++17, linear algebra (Eigen), mean-variance portfolio theory, efficient frontier computation, CSV parsing, minimal JSON state management.

## Contributors

| Name | Role |
|------|------|
| Aarav | Project Lead |

## Why This Repo

Hackathons reward teams that can move fast across the full stack. This repo is a space to:
- Build and break things quickly
- Get comfortable with tools before the pressure of a competition
- Document patterns and decisions for easy reference during the hackathon
