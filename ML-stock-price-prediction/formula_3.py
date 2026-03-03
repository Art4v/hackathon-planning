import numpy as np
import math

def garch(S0, days, mu=0.05, omega=0.00001, alpha=0.1, beta=0.85):
    dt = 1 / 252          # one trading day in years
    sqrt_dt = math.sqrt(dt)

    prices = [S0]
    S = S0
    sigma2 = omega / (1 - alpha - beta)  # unconditional variance as initial
    r_prev = 0.0                          # previous return residual

    for _ in range(days):
        Z = np.random.standard_normal()
        sigma2 = omega + alpha * r_prev**2 + beta * sigma2
        sigma_t = math.sqrt(sigma2)
        epsilon = sigma_t * Z            # daily innovation (sigma_t is already daily vol)
        r = mu * dt + epsilon            # daily drift + shock; mu*dt not mu*sqrt_dt
        S = S * (1 + r)
        r_prev = epsilon                 # GARCH feeds on the innovation, not sqrt_dt-scaled noise
        prices.append(S)

    return prices


if __name__ == "__main__":
    S0 = float(input("Enter initial stock price: "))
    days = int(input("Enter number of days to predict: "))

    prices = garch(S0, days)

    print(f"\n{'Day':<6} {'Price':<12}")
    print("-" * 18)
    for i, price in enumerate(prices):
        print(f"{i:<6} {price:.4f}")
