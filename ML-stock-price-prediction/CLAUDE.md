# ML Stock Price Prediction — Claude Instructions

## Project Overview
Three standalone Python scripts implementing stochastic stock price prediction models.
Each script is self-contained, takes user input at runtime, and prints a day-by-day price table.

## Files
| File | Model | Key Function |
|------|-------|--------------|
| `formula_1.py` | Mean Reversion (Ornstein-Uhlenbeck on returns) | `mean_reversion(S0, days, theta, mu, sigma)` |
| `formula_2.py` | Geometric Brownian Motion (GBM) | `gbm(S0, days, mu, sigma)` |
| `formula_3.py` | GARCH(1,1) volatility model | `garch(S0, days, mu, omega, alpha, beta)` |

### Monte Carlo Simulations (`monte_carlo/`)
| Script | Output PNG | Model |
|--------|------------|-------|
| `monte_carlo/mc_gbm.py` | `mc_gbm.png` | GBM |
| `monte_carlo/mc_mean_reversion.py` | `mc_mean_reversion.png` | Mean Reversion |
| `monte_carlo/mc_garch.py` | `mc_garch.png` | GARCH(1,1) |

Each simulation script:
- 500 independent runs, S₀ = $500, 30 trading days
- Paths coloured green if final price ≥ $500, red if below
- Dashed white reference line at starting price
- Right panel: KDE of final-price distribution (green above $500, red below), y-axis shared with main plot
- Dark background (`#111111`), saved at 150 dpi
- Seed: `np.random.seed(42)` for reproducibility
- GARCH variant clips y-axis to 1st–99th percentile of final prices to handle fat tails

## Model Details

### formula_1.py — Mean Reversion
- Return `r` reverts toward a long-run mean `mu` at speed `theta`
- Update: `r = r + theta*(mu - r) + sigma*sqrt(dt)*Z`
- Price: `S = S * (1 + r)`
- Default params: `theta=0.01`, `mu=0.02`, `sigma=0.07`

### formula_2.py — Geometric Brownian Motion
- Standard GBM discretised to daily steps
- Update: `S = S * (1 + mu*dt + sigma*sqrt(dt)*Z)`
- Default params: `mu=0.02`, `sigma=0.07`

### formula_3.py — GARCH(1,1)
- Conditional variance evolves as: `sigma2 = omega + alpha*epsilon_prev^2 + beta*sigma2`
- `sigma_t = sqrt(sigma2)` is the **daily** standard deviation — do NOT scale by `sqrt_dt`
- Return per step: `r = mu*dt + epsilon`, where `epsilon = sigma_t * Z` (daily innovation)
- Drift: `mu*dt` (annualized mu scaled to one trading day); NOT `mu*sqrt_dt`
- GARCH feedback: `r_prev = epsilon = sigma_t * Z` (pure innovation, no `sqrt_dt`)
- Initialised at unconditional variance: `omega / (1 - alpha - beta)`
- Default params: `mu=0.05`, `omega=0.00001`, `alpha=0.1`, `beta=0.85`
- **Common bug**: using `sqrt_dt` on both drift and noise inflates drift 15.87× and deflates noise 15.87×, making SNR 252× too large → all paths appear profitable

## Conventions
- Time unit: `dt = 1/252` (one trading day in years)
- All scripts use `numpy` for random draws (`np.random.standard_normal()`) and `math` for `sqrt`
- No external data sources — purely simulation-based
- Output format: left-aligned table with `Day` and `Price` columns, price to 4 decimal places

## Dependencies
```
numpy
matplotlib
scipy
```
Install with: `pip install numpy matplotlib scipy`

## Running a Script
```bash
python formula_1.py   # mean reversion
python formula_2.py   # GBM
python formula_3.py   # GARCH
```
Each prompts for: initial stock price (`S0`) and number of days to simulate.

## Coding Guidelines for Claude
- Keep each model in its own file — do not merge them
- Preserve the `if __name__ == "__main__"` block and interactive `input()` pattern
- Default parameter values are intentionally illustrative; do not change them without explicit instruction
- Do not add external data fetching (e.g. yfinance) unless explicitly requested
- Prefer `math.sqrt` for scalar operations, `np` for random draws (consistent with existing style)

## Maintaining This File
**After every meaningful change to the project, update this CLAUDE.md.** Meaningful changes include:
- Adding, renaming, or deleting a script
- Changing a model's algorithm, update rule, or default parameters
- Adding new dependencies
- Changing the output format or CLI interface
- Any new coding conventions established during a session

Keep entries accurate and concise — do not leave stale information.
