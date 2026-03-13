// portfolio_optimizer.cpp — Efficient Frontier Portfolio Optimizer
// Reads historical price CSVs, computes optimal portfolio via mean-variance
// optimization, and outputs trade recommendations.
//
// Build:  g++ -std=c++17 -O2 -I eigen portfolio_optimizer.cpp -o portfolio_optimizer
// Usage:  ./portfolio_optimizer --risk_strat=balanced

#include <Eigen/Dense>
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

namespace fs = std::filesystem;

// ─── Constants ───────────────────────────────────────────────────────────────

static const int N_ASSETS = 3;
static const double INITIAL_CAPITAL = 1'000'000.0;
static const double WEIGHT_STEP = 0.01;
static const char* TICKERS[N_ASSETS] = {"AAPL", "TSLA", "BOBS"};
static const char* CSV_DIR = "../../api-integration/data/tracking";
static const char* STATE_FILE = "portfolio_state.json";
static const char* TRADES_FILE = "trades.csv";

// ─── CSV Parsing ─────────────────────────────────────────────────────────────

// Parse a CSV line handling quoted fields (e.g. "Tesla, Inc.")
static std::vector<std::string> parse_csv_line(const std::string& line) {
    std::vector<std::string> fields;
    std::string field;
    bool in_quotes = false;
    for (char c : line) {
        if (c == '"') {
            in_quotes = !in_quotes;
        } else if (c == ',' && !in_quotes) {
            fields.push_back(field);
            field.clear();
        } else {
            field += c;
        }
    }
    fields.push_back(field);
    return fields;
}

// Read all current_price values from a ticker CSV, returned in chronological order
static std::vector<double> read_prices(const std::string& ticker) {
    std::string path = std::string(CSV_DIR) + "/" + ticker + ".csv";
    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "ERROR: Cannot open " << path << "\n";
        return {};
    }

    std::string header_line;
    std::getline(file, header_line);

    // Find current_price column index
    auto headers = parse_csv_line(header_line);
    int price_col = -1;
    for (int i = 0; i < (int)headers.size(); i++) {
        if (headers[i] == "current_price") {
            price_col = i;
            break;
        }
    }
    if (price_col < 0) {
        std::cerr << "ERROR: No current_price column in " << path << "\n";
        return {};
    }

    std::vector<double> prices;
    std::string line;
    while (std::getline(file, line)) {
        if (line.empty()) continue;
        auto fields = parse_csv_line(line);
        if (price_col < (int)fields.size()) {
            try {
                prices.push_back(std::stod(fields[price_col]));
            } catch (...) {
                // skip malformed rows
            }
        }
    }

    // CSV has newest first — reverse to chronological order
    std::reverse(prices.begin(), prices.end());
    return prices;
}

// ─── Log Returns ─────────────────────────────────────────────────────────────

static std::vector<double> compute_log_returns(const std::vector<double>& prices) {
    std::vector<double> returns;
    for (size_t i = 1; i < prices.size(); i++) {
        if (prices[i - 1] > 0.0 && prices[i] > 0.0) {
            returns.push_back(std::log(prices[i] / prices[i - 1]));
        }
    }
    return returns;
}

// ─── Mean & Covariance ───────────────────────────────────────────────────────

struct MeanCov {
    Eigen::Vector3d mu;
    Eigen::Matrix3d sigma;
};

static MeanCov compute_mean_cov(const std::vector<double> returns[N_ASSETS], int n) {
    MeanCov mc;
    Eigen::MatrixXd R(n, N_ASSETS);
    for (int j = 0; j < N_ASSETS; j++) {
        for (int i = 0; i < n; i++) {
            R(i, j) = returns[j][i];
        }
    }

    // Mean
    mc.mu = R.colwise().mean();

    // Covariance (sample)
    Eigen::MatrixXd centered = R.rowwise() - mc.mu.transpose();
    mc.sigma = (centered.transpose() * centered) / (n - 1);

    return mc;
}

// ─── Efficient Frontier ──────────────────────────────────────────────────────

struct Portfolio {
    double w[N_ASSETS];
    double expected_return;
    double variance;
};

static std::vector<Portfolio> compute_frontier(const Eigen::Vector3d& mu,
                                                const Eigen::Matrix3d& sigma) {
    std::vector<Portfolio> all_portfolios;
    all_portfolios.reserve(6000);

    int steps = (int)(1.0 / WEIGHT_STEP);
    for (int i = 0; i <= steps; i++) {
        for (int j = 0; j <= steps - i; j++) {
            int k = steps - i - j;
            double w1 = i * WEIGHT_STEP;
            double w2 = j * WEIGHT_STEP;
            double w3 = k * WEIGHT_STEP;

            Eigen::Vector3d w(w1, w2, w3);
            double er = w.dot(mu);
            double var = w.transpose() * sigma * w;

            Portfolio p;
            p.w[0] = w1; p.w[1] = w2; p.w[2] = w3;
            p.expected_return = er;
            p.variance = var;
            all_portfolios.push_back(p);
        }
    }

    // Sort by variance ascending
    std::sort(all_portfolios.begin(), all_portfolios.end(),
              [](const Portfolio& a, const Portfolio& b) {
                  return a.variance < b.variance;
              });

    // Extract efficient frontier: keep only portfolios with strictly increasing return
    std::vector<Portfolio> frontier;
    double max_return = -1e18;
    for (auto& p : all_portfolios) {
        if (p.expected_return > max_return) {
            frontier.push_back(p);
            max_return = p.expected_return;
        }
    }

    return frontier;
}

// ─── Risk Strategy Selection ─────────────────────────────────────────────────

static Portfolio select_portfolio(const std::vector<Portfolio>& frontier,
                                   const std::string& strategy) {
    if (frontier.empty()) {
        std::cerr << "ERROR: Empty frontier\n";
        exit(1);
    }

    if (strategy == "balanced") {
        // Max Sharpe ratio (return / sqrt(variance))
        int best = 0;
        double best_sharpe = -1e18;
        for (int i = 0; i < (int)frontier.size(); i++) {
            double sd = std::sqrt(frontier[i].variance);
            if (sd < 1e-12) continue;
            double sharpe = frontier[i].expected_return / sd;
            if (sharpe > best_sharpe) {
                best_sharpe = sharpe;
                best = i;
            }
        }
        return frontier[best];
    } else if (strategy == "risk_averse") {
        // 25th percentile by variance
        int idx = (int)(0.25 * (frontier.size() - 1));
        return frontier[idx];
    } else if (strategy == "risk_agg") {
        // 80th percentile by variance
        int idx = (int)(0.80 * (frontier.size() - 1));
        return frontier[idx];
    } else {
        std::cerr << "ERROR: Unknown strategy '" << strategy << "'\n";
        std::cerr << "Valid options: balanced, risk_averse, risk_agg\n";
        exit(1);
    }
}

// ─── Minimal JSON State ──────────────────────────────────────────────────────

struct PortfolioState {
    double cash;
    double shares[N_ASSETS];
    double prices[N_ASSETS];
    double total_value;
    bool valid;
};

static std::string trim(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\r\n\"");
    size_t end = s.find_last_not_of(" \t\r\n\"");
    if (start == std::string::npos) return "";
    return s.substr(start, end - start + 1);
}

static PortfolioState load_state() {
    PortfolioState state{};
    state.valid = false;

    std::ifstream file(STATE_FILE);
    if (!file.is_open()) return state;

    std::string content((std::istreambuf_iterator<char>(file)),
                         std::istreambuf_iterator<char>());

    // Minimal JSON parser for our fixed structure
    auto extract_double = [&](const std::string& key) -> double {
        size_t pos = content.find("\"" + key + "\"");
        if (pos == std::string::npos) return 0.0;
        pos = content.find(':', pos);
        if (pos == std::string::npos) return 0.0;
        pos++;
        // Skip whitespace
        while (pos < content.size() && (content[pos] == ' ' || content[pos] == '\t')) pos++;
        size_t end = content.find_first_of(",}\n", pos);
        return std::stod(content.substr(pos, end - pos));
    };

    state.cash = extract_double("cash");
    state.total_value = extract_double("total_value");

    for (int i = 0; i < N_ASSETS; i++) {
        state.shares[i] = extract_double(std::string("shares_") + TICKERS[i]);
        state.prices[i] = extract_double(std::string("price_") + TICKERS[i]);
    }

    state.valid = true;
    return state;
}

static void save_state(const PortfolioState& state) {
    std::ofstream file(STATE_FILE);
    file << "{\n";
    file << "  \"cash\": " << state.cash << ",\n";
    file << "  \"total_value\": " << state.total_value << ",\n";
    for (int i = 0; i < N_ASSETS; i++) {
        file << "  \"shares_" << TICKERS[i] << "\": " << state.shares[i] << ",\n";
        file << "  \"price_" << TICKERS[i] << "\": " << state.prices[i];
        if (i < N_ASSETS - 1) file << ",";
        file << "\n";
    }
    file << "}\n";
}

// ─── Trade Logging ───────────────────────────────────────────────────────────

static void write_trades_header_if_needed() {
    std::ifstream check(TRADES_FILE);
    if (check.good()) return;  // file exists
    check.close();

    std::ofstream file(TRADES_FILE);
    file << "ticker,action,percentage_change,amount_changed,money_change\n";
}

static void append_trade(const std::string& ticker, const std::string& action,
                          double pct_change, double amount_changed, double money_change) {
    std::ofstream file(TRADES_FILE, std::ios::app);
    file << ticker << "," << action << ","
         << pct_change << "," << amount_changed << "," << money_change << "\n";
}

// ─── Main ────────────────────────────────────────────────────────────────────

int main(int argc, char* argv[]) {
    // Parse --risk_strat argument
    std::string strategy = "balanced";
    for (int i = 1; i < argc; i++) {
        std::string arg(argv[i]);
        if (arg.find("--risk_strat=") == 0) {
            strategy = arg.substr(13);
        }
    }

    std::cout << "=== Portfolio Optimizer ===\n";
    std::cout << "Strategy: " << strategy << "\n\n";

    // 1. Read prices
    std::vector<double> prices[N_ASSETS];
    double latest_price[N_ASSETS];
    for (int i = 0; i < N_ASSETS; i++) {
        prices[i] = read_prices(TICKERS[i]);
        if (prices[i].empty()) {
            std::cerr << "ERROR: No price data for " << TICKERS[i] << "\n";
            return 1;
        }
        latest_price[i] = prices[i].back();
        std::cout << TICKERS[i] << ": " << prices[i].size() << " data points, "
                  << "latest=$" << latest_price[i] << "\n";
    }
    std::cout << "\n";

    // 2. Compute log returns
    std::vector<double> returns[N_ASSETS];
    for (int i = 0; i < N_ASSETS; i++) {
        returns[i] = compute_log_returns(prices[i]);
    }

    // Align to minimum length
    size_t min_len = returns[0].size();
    for (int i = 1; i < N_ASSETS; i++) {
        min_len = std::min(min_len, returns[i].size());
    }
    if (min_len < 5) {
        std::cerr << "ERROR: Not enough data points (" << min_len << ") for analysis\n";
        return 1;
    }
    // Trim to aligned length (keep most recent)
    for (int i = 0; i < N_ASSETS; i++) {
        size_t excess = returns[i].size() - min_len;
        if (excess > 0) {
            returns[i].erase(returns[i].begin(), returns[i].begin() + excess);
        }
    }

    std::cout << "Using " << min_len << " aligned return observations\n\n";

    // 3. Mean & covariance
    MeanCov mc = compute_mean_cov(returns, (int)min_len);

    std::cout << "Mean returns (per period):\n";
    for (int i = 0; i < N_ASSETS; i++) {
        printf("  %s: %.6f\n", TICKERS[i], mc.mu(i));
    }
    std::cout << "\nCovariance matrix:\n";
    for (int i = 0; i < N_ASSETS; i++) {
        printf("  ");
        for (int j = 0; j < N_ASSETS; j++) {
            printf("%12.8f ", mc.sigma(i, j));
        }
        printf("\n");
    }
    std::cout << "\n";

    // 4. Compute efficient frontier
    auto frontier = compute_frontier(mc.mu, mc.sigma);
    std::cout << "Efficient frontier: " << frontier.size() << " portfolios\n";

    // 5. Select target portfolio
    Portfolio target = select_portfolio(frontier, strategy);
    std::cout << "Target allocation:\n";
    for (int i = 0; i < N_ASSETS; i++) {
        printf("  %s: %.1f%%\n", TICKERS[i], target.w[i] * 100.0);
    }
    printf("  E[r]=%.6f  Var=%.8f  Std=%.6f\n\n",
           target.expected_return, target.variance, std::sqrt(target.variance));

    // 6. Load or initialize portfolio state
    PortfolioState state = load_state();
    if (!state.valid) {
        std::cout << "Initializing new portfolio with $"
                  << INITIAL_CAPITAL << " equal split\n";
        state.cash = 0.0;
        state.total_value = INITIAL_CAPITAL;
        double alloc_each = INITIAL_CAPITAL / N_ASSETS;
        for (int i = 0; i < N_ASSETS; i++) {
            state.shares[i] = alloc_each / latest_price[i];
            state.prices[i] = latest_price[i];
        }
    }

    // Update prices and total value
    double total_value = state.cash;
    for (int i = 0; i < N_ASSETS; i++) {
        state.prices[i] = latest_price[i];
        total_value += state.shares[i] * latest_price[i];
    }
    state.total_value = total_value;

    std::cout << "Portfolio value: $" << total_value << "\n";

    // Compute current weights
    double current_w[N_ASSETS];
    for (int i = 0; i < N_ASSETS; i++) {
        current_w[i] = (state.shares[i] * latest_price[i]) / total_value;
    }

    // 7. Compute and log trades
    write_trades_header_if_needed();

    std::cout << "\n--- Trades ---\n";
    for (int i = 0; i < N_ASSETS; i++) {
        double target_value = target.w[i] * total_value;
        double current_value = state.shares[i] * latest_price[i];
        double delta_value = target_value - current_value;
        double delta_shares = delta_value / latest_price[i];

        double pct_change = 0.0;
        if (current_value > 1e-9) {
            pct_change = (delta_value / current_value) * 100.0;
        } else if (target_value > 0) {
            pct_change = 100.0;
        }

        std::string action;
        if (delta_value > 0) {
            action = "BUY";
        } else if (delta_value < 0) {
            action = "SELL";
        } else {
            action = "HOLD";
        }

        printf("  %s: %s %.2f shares ($%.2f) [%.1f%%]\n",
               TICKERS[i], action.c_str(),
               std::abs(delta_shares), std::abs(delta_value), pct_change);

        append_trade(TICKERS[i], action, pct_change,
                     std::abs(delta_shares), std::abs(delta_value));

        // Execute the trade
        state.shares[i] += delta_shares;
    }

    // 8. Save updated state
    save_state(state);
    std::cout << "\nState saved to " << STATE_FILE << "\n";
    std::cout << "Trades appended to " << TRADES_FILE << "\n";

    return 0;
}
