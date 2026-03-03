import numpy as np
import math
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from scipy.stats import gaussian_kde
import os

plt.style.use('dark_background')

# --- Parameters ---
N_RUNS = 500
S0     = 500.0
DAYS   = 30

np.random.seed(42)

# --- Model: GARCH(1,1) ---
def garch(S0, days, mu=0.05, omega=0.00001, alpha=0.1, beta=0.85):
    dt      = 1 / 252
    sqrt_dt = math.sqrt(dt)
    prices  = [S0]
    S       = S0
    sigma2  = omega / (1 - alpha - beta)   # unconditional variance as seed
    r_prev  = 0.0
    for _ in range(days):
        Z       = np.random.standard_normal()
        sigma2  = omega + alpha * r_prev**2 + beta * sigma2
        sigma2  = max(sigma2, 1e-10)       # numerical floor
        sigma_t = math.sqrt(sigma2)
        epsilon = sigma_t * Z              # daily innovation (sigma_t is already daily vol)
        r       = mu * dt + epsilon        # daily drift + shock; mu*dt not mu*sqrt_dt
        S       = S * (1 + r)
        r_prev  = epsilon                  # GARCH feeds on the innovation, not sqrt_dt-scaled noise
        prices.append(S)
    return prices

# --- Simulate ---
all_paths    = [garch(S0, DAYS) for _ in range(N_RUNS)]
final_prices = np.array([p[-1] for p in all_paths])
n_profit     = int(np.sum(final_prices >= S0))
n_loss       = N_RUNS - n_profit

# --- y-axis limits (clip extreme outliers at 1st/99th percentile for readability) ---
all_finals = final_prices
p1, p99 = np.percentile(all_finals, 1), np.percentile(all_finals, 99)
all_vals = [v for path in all_paths for v in path]
y_min = max(min(all_vals), p1 * 0.90)
y_max = min(max(all_vals), p99 * 1.10)
pad = (y_max - y_min) * 0.05
y_lo, y_hi = y_min - pad, y_max + pad

# --- Layout ---
fig = plt.figure(figsize=(15, 7), facecolor='#111111')
gs  = gridspec.GridSpec(1, 2, width_ratios=[4, 1], wspace=0.03)
ax     = fig.add_subplot(gs[0])
ax_kde = fig.add_subplot(gs[1], sharey=ax)

days_axis = np.arange(DAYS + 1)

# --- Draw paths ---
for path in all_paths:
    colour = '#2ecc71' if path[-1] >= S0 else '#e74c3c'
    ax.plot(days_axis, path, color=colour, alpha=0.12, linewidth=0.5)

ax.axhline(S0, color='white', linestyle='--', linewidth=1, alpha=0.6, label=f'Start ${S0:.0f}')
ax.set_ylim(y_lo, y_hi)
ax.set_facecolor('#111111')
ax.set_xlabel('Trading Day', color='#cccccc', fontsize=11)
ax.set_ylabel('Price ($)',   color='#cccccc', fontsize=11)
ax.tick_params(colors='#cccccc')
for sp in ax.spines.values():
    sp.set_edgecolor('#444444')
ax.legend(facecolor='#1a1a1a', edgecolor='#555555', labelcolor='white', fontsize=9)
ax.set_title(
    f'GARCH(1,1) — Monte Carlo Simulation\n'
    f'{N_RUNS} runs  |  S₀ = ${S0:.0f}  |  {DAYS} trading days  |  '
    f'Profitable: {n_profit} ({100*n_profit/N_RUNS:.1f}%)   Loss: {n_loss} ({100*n_loss/N_RUNS:.1f}%)',
    color='white', fontsize=12, pad=10
)

# --- KDE (right panel) — use clipped final prices for KDE stability ---
clipped_finals = np.clip(final_prices, y_lo, y_hi)
kde         = gaussian_kde(clipped_finals)
price_range = np.linspace(y_lo, y_hi, 600)
density     = kde(price_range)

ax_kde.fill_betweenx(price_range, density, 0,
                     where=(price_range >= S0), color='#2ecc71', alpha=0.35)
ax_kde.fill_betweenx(price_range, density, 0,
                     where=(price_range <  S0), color='#e74c3c', alpha=0.35)
ax_kde.plot(density, price_range, color='white', linewidth=1.2)
ax_kde.axhline(S0, color='white', linestyle='--', linewidth=1, alpha=0.6)
ax_kde.set_facecolor('#111111')
ax_kde.set_xlabel('Density', color='#cccccc', fontsize=9)
ax_kde.set_title('Final\nPrice\nDist.', color='#cccccc', fontsize=9)
ax_kde.tick_params(axis='x', colors='#cccccc', labelsize=7)
ax_kde.yaxis.set_visible(False)
for sp in ax_kde.spines.values():
    sp.set_edgecolor('#444444')

# --- Save ---
out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mc_garch.png')
plt.savefig(out_path, dpi=150, bbox_inches='tight', facecolor='#111111')
plt.close()
print(f'Saved: {out_path}')
