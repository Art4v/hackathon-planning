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

# --- Model: Geometric Brownian Motion ---
def gbm(S0, days, mu=0.02, sigma=0.07):
    dt      = 1 / 252
    sqrt_dt = math.sqrt(dt)
    prices  = [S0]
    S       = S0
    for _ in range(days):
        Z  = np.random.standard_normal()
        S  = S * (1 + mu * dt + sigma * sqrt_dt * Z)
        prices.append(S)
    return prices

# --- Simulate ---
all_paths    = [gbm(S0, DAYS) for _ in range(N_RUNS)]
final_prices = np.array([p[-1] for p in all_paths])
n_profit     = int(np.sum(final_prices >= S0))
n_loss       = N_RUNS - n_profit

# --- y-axis limits ---
all_vals = [v for path in all_paths for v in path]
y_min, y_max = min(all_vals), max(all_vals)
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
    f'Geometric Brownian Motion — Monte Carlo Simulation\n'
    f'{N_RUNS} runs  |  S₀ = ${S0:.0f}  |  {DAYS} trading days  |  '
    f'Profitable: {n_profit} ({100*n_profit/N_RUNS:.1f}%)   Loss: {n_loss} ({100*n_loss/N_RUNS:.1f}%)',
    color='white', fontsize=12, pad=10
)

# --- KDE (right panel) ---
kde         = gaussian_kde(final_prices)
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
out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mc_gbm.png')
plt.savefig(out_path, dpi=150, bbox_inches='tight', facecolor='#111111')
plt.close()
print(f'Saved: {out_path}')
