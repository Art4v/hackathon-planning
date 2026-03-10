# UniHack Preparation

This repo documents my preparation for **UniHack** — a university hackathon. It covers hands-on experiments across web dev, backend APIs, and ML/data science to build skills before the competition.

## What's Inside

### `claude_code_test/` — Frontend & Game Dev
Experimenting with building interactive browser apps from scratch using HTML5 Canvas.

- **`tictactoe.html`** — Classic tic-tac-toe game
- **`shooter/shooter.html`** — Top-down retro shooter (NEON ASSAULT) with 5 levels, multiple enemy types, and a high score system
- **`index.html`** — Playground/landing page

Skills practiced: HTML5 Canvas API, game state machines, browser-based rendering without external libraries.

### `fast_api/` — Backend API Development
Building a persistent REST API with Python.

- **FastAPI** for routing and request validation (Pydantic models)
- **Supabase** (Postgres) as the database — replacing in-memory storage with a real persistent backend
- **python-dotenv** for secret management

Skills practiced: REST API design, CRUD operations, connecting a Python backend to a cloud database, environment variable hygiene.

See [`fast_api/README.md`](fast_api/README.md) for setup instructions.

### `ML-stock-price-prediction/` — Machine Learning & Quantitative Finance
Experimenting with statistical and ML models for financial data.

- Monte Carlo simulations for price path forecasting
- GARCH models for volatility estimation
- Formula scripts exploring quantitative strategies

Skills practiced: NumPy/pandas data pipelines, statistical modelling, financial simulation.

## Contributors

| Name | Role |
|------|------|
| Aarav | Project Lead |

## Why This Repo

Hackathons reward teams that can move fast across the full stack. This repo is a space to:
- Build and break things quickly
- Get comfortable with tools before the pressure of a competition
- Document patterns and decisions for easy reference during the hackathon
