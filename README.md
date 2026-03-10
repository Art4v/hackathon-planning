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
