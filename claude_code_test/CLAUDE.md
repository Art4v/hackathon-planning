# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Two independent sub-projects, no build system or package manager:

- **`claude_code_test/`** — Browser games as single self-contained HTML files (embedded CSS + JS, HTML5 Canvas, no external assets)
- **`ML-stock-price-prediction/`** — Standalone Python scripts for stochastic stock price simulation

## Running Code

**Python scripts** (require `numpy`):
```bash
python ML-stock-price-prediction/formula_1.py   # Mean reversion (Ornstein-Uhlenbeck)
python ML-stock-price-prediction/formula_2.py   # Geometric Brownian Motion
python ML-stock-price-prediction/formula_3.py   # GARCH volatility model
```
Each script prompts for initial price and number of days, then prints a price table.

**HTML games** — open directly in a browser, no server needed:
- `claude_code_test/tictactoe.html`
- `claude_code_test/shooter/shooter.html`

## Architecture Notes

### ML Stock Price Scripts
Each script exports a single pure function (e.g. `gbm`, `garch`, `mean_reversion`) that takes `S0` (initial price) and `days`, returns a list of prices. All use `dt = 1/252` (one trading day in years) and `numpy` for random draws.

### Browser Games
- All rendering uses the HTML5 Canvas API — no DOM manipulation for game state
- Game loop driven by `requestAnimationFrame`
- `shooter.html` uses a state machine: `MENU → PLAYING → LEVEL_CLEAR → WIN / GAME_OVER`
- High score is persisted via `localStorage`

## Conventions
- New games go in `claude_code_test/` as single `.html` files
- New stock models go in `ML-stock-price-prediction/` following the same function-per-file pattern

## Git Workflow
After completing any meaningful unit of work, commit and push to GitHub so progress is never lost:

```bash
git add <files>
git commit -m "<type>: <short description>"
git push
```

Commit message types: `feat` (new feature/file), `fix` (bug fix), `refactor` (restructure without behavior change), `docs` (documentation only).

Examples of clean commit messages:
- `feat: add snake game to claude_code_test`
- `feat: add jump diffusion stock price model`
- `fix: correct GARCH unconditional variance initialization`

Commit after each self-contained change — don't batch unrelated work into one commit.
