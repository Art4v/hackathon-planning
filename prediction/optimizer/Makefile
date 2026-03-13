CXX      = g++
CXXFLAGS = -std=c++17 -O2 -I eigen -Wall -Wextra
TARGET   = portfolio_optimizer
SRC      = portfolio_optimizer.cpp

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) -o $@ $<

clean:
	rm -f $(TARGET) $(TARGET).exe

.PHONY: all clean
