import numpy as np
import math

def gbm(S0, days, mu=0.02, sigma=0.07):
    dt = 1 / 252          # one trading day in years
    sqrt_dt = math.sqrt(dt)

    prices = [S0]
    S = S0

    for _ in range(days):
        Z = np.random.standard_normal()
        S = S * (1 + mu * dt + sigma * sqrt_dt * Z)
        prices.append(S)

    return prices


if __name__ == "__main__":
    S0 = float(input("Enter initial stock price: "))
    days = int(input("Enter number of days to predict: "))

    prices = gbm(S0, days)

    print(f"\n{'Day':<6} {'Price':<12}")
    print("-" * 18)
    for i, price in enumerate(prices):
        print(f"{i:<6} {price:.4f}")
