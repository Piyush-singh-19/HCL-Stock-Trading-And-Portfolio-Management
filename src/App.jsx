import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // =========================
  // BASIC DATA
  // =========================

  const [activePage, setActivePage] = useState("Overview");

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("portfolio_balance");
    return saved ? Number(saved) : 100000;
  });
  useEffect(() => {
    localStorage.setItem("portfolio_balance", balance);
  }, [balance]);
  const [stocks] = useState([
    {
      name: "TCS",
      company: "Tata Consultancy Services",
      price: 3850,
      change: "+1.25%",
    },
    {
      name: "RELIANCE",
      company: "Reliance Industries",
      price: 2950,
      change: "+0.82%",
    },
    {
      name: "INFOSYS",
      company: "Infosys Limited",
      price: 1750,
      change: "+1.10%",
    },
    {
      name: "HDFC BANK",
      company: "HDFC Bank Limited",
      price: 1680,
      change: "-0.35%",
    },
    {
      name: "WIPRO",
      company: "Wipro Limited",
      price: 520,
      change: "+0.64%",
    },
    {
      name: "ITC",
      company: "ITC Limited",
      price: 480,
      change: "-0.22%",
    },
  ]);

  // =========================
  // PORTFOLIO
  // =========================

  const [portfolio, setPortfolio] = useState([]);

  // =========================
  // TRANSACTIONS
  // =========================

  const [transactions, setTransactions] = useState([]);

  // =========================
  // WATCHLIST
  // =========================

  const [watchlist, setWatchlist] = useState(["TCS", "RELIANCE", "INFOSYS"]);

  // =========================
  // POPUP
  // =========================

  const [selectedStock, setSelectedStock] = useState(null);

  const [tradeType, setTradeType] = useState("BUY");

  const [quantity, setQuantity] = useState(1);

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // CHART PERIOD
  // =========================

  const [chartPeriod, setChartPeriod] = useState("1M");

  // =========================
  // NOTIFICATION
  // =========================

  const [message, setMessage] = useState("");

  // =========================
  // OPEN TRADE
  // =========================

  const openTrade = (stock, type) => {
    setSelectedStock(stock);

    setTradeType(type);

    setQuantity(1);
  };

  // =========================
  // CLOSE TRADE
  // =========================

  const closeTrade = () => {
    setSelectedStock(null);

    setQuantity(1);
  };

  // =========================
  // BUY / SELL
  // =========================

  const executeTrade = () => {
    if (!selectedStock) {
      return;
    }

    if (quantity <= 0) {
      alert("Enter a valid quantity.");

      return;
    }

    const total = selectedStock.price * quantity;

    // =========================
    // BUY
    // =========================

    if (tradeType === "BUY") {
      if (total > balance) {
        alert("Insufficient balance.");

        return;
      }

      setBalance(balance - total);

      const existing = portfolio.find(
        (item) => item.name === selectedStock.name,
      );

      if (existing) {
        const updated = portfolio.map((item) => {
          if (item.name === selectedStock.name) {
            return {
              ...item,

              quantity: item.quantity + quantity,
            };
          }

          return item;
        });

        setPortfolio(updated);
      } else {
        setPortfolio([
          ...portfolio,

          {
            name: selectedStock.name,

            company: selectedStock.company,

            price: selectedStock.price,

            quantity: quantity,
          },
        ]);
      }

      // TRANSACTION

      const newTransaction = {
        id: Date.now(),

        type: "BUY",

        stock: selectedStock.name,

        quantity: quantity,

        price: selectedStock.price,

        total: total,

        date: new Date().toLocaleString(),
      };

      setTransactions([newTransaction, ...transactions]);

      setMessage(
        `${quantity} ${selectedStock.name} shares bought successfully`,
      );
    }

    // =========================
    // SELL
    // =========================
    else {
      const existing = portfolio.find(
        (item) => item.name === selectedStock.name,
      );

      if (!existing) {
        alert("You don't own this stock.");

        return;
      }

      if (quantity > existing.quantity) {
        alert(`You only own ${existing.quantity} shares.`);

        return;
      }

      setBalance(balance + total);

      const updated = portfolio
        .map((item) => {
          if (item.name === selectedStock.name) {
            return {
              ...item,

              quantity: item.quantity - quantity,
            };
          }

          return item;
        })
        .filter((item) => item.quantity > 0);

      setPortfolio(updated);

      // TRANSACTION

      const newTransaction = {
        id: Date.now(),

        type: "SELL",

        stock: selectedStock.name,

        quantity: quantity,

        price: selectedStock.price,

        total: total,

        date: new Date().toLocaleString(),
      };

      setTransactions([newTransaction, ...transactions]);

      setMessage(`${quantity} ${selectedStock.name} shares sold successfully`);
    }

    closeTrade();
  };

  // =========================
  // WATCHLIST
  // =========================

  const toggleWatchlist = (stockName) => {
    if (watchlist.includes(stockName)) {
      setWatchlist(watchlist.filter((item) => item !== stockName));
    } else {
      setWatchlist([...watchlist, stockName]);
    }
  };

  // =========================
  // DEPOSIT
  // =========================

  const depositMoney = () => {
    const amount = Number(prompt("Enter amount to deposit:"));

    if (!amount || amount <= 0) {
      return;
    }

    setBalance(balance + amount);

    setMessage(`₹${amount.toLocaleString()} deposited successfully`);
  };

  // =========================
  // INVESTED AMOUNT
  // =========================

  let investedAmount = 0;

  portfolio.forEach((stock) => {
    investedAmount += stock.price * stock.quantity;
  });

  // =========================
  // SEARCH RESULTS
  // =========================

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(search.toLowerCase()) ||
      stock.company.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // PAGE NAVIGATION
  // =========================

  const changePage = (page) => {
    setActivePage(page);

    setMessage("");
  };

  // =========================
  // STOCK CARD
  // =========================

  const StockCard = ({ stock }) => (
    <div className="stock-card">
      <div className="stock-card-top">
        <div>
          <h3>{stock.name}</h3>

          <small>{stock.company}</small>
        </div>

        <span
          className={stock.change.startsWith("-") ? "negative" : "positive"}
        >
          {stock.change}
        </span>
      </div>

      <p className="stock-price">₹{stock.price.toLocaleString()}</p>

      <div className="stock-actions">
        <button className="buy-btn" onClick={() => openTrade(stock, "BUY")}>
          Buy
        </button>

        <button
          className="watch-btn"
          onClick={() => toggleWatchlist(stock.name)}
        >
          {watchlist.includes(stock.name) ? "★" : "☆"}
        </button>
      </div>
    </div>
  );

  // =========================
  // OVERVIEW PAGE
  // =========================

  const Overview = () => (
    <>
      <div className="welcome-row">
        <div>
          <p className="date">TUESDAY, SEPTEMBER 29, 2026</p>

          <h1>
            Good morning, Piyush<span>.</span>
          </h1>

          <p className="welcome-text">
            Here's what's happening with your portfolio today.
          </p>
        </div>

        <div className="action-buttons">
          <button className="deposit-btn" onClick={depositMoney}>
            ↓ &nbsp; Deposit
          </button>

          <button
            className="trade-btn"
            onClick={() => {
              if (stocks.length > 0) {
                openTrade(stocks[0], "BUY");
              }
            }}
          >
            + &nbsp; Trade
          </button>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-label">
            <span>Total portfolio value</span>

            <span>◉</span>
          </div>

          <div className="big-value">
            ₹{(balance + investedAmount).toLocaleString()}
          </div>

          <div className="return-badge">↗ Portfolio</div>

          <span className="card-period">All time</span>
        </div>

        <div className="summary-card">
          <div className="card-label">
            <span>Invested amount</span>

            <span className="green-icon">↗</span>
          </div>

          <div className="big-value">₹{investedAmount.toLocaleString()}</div>

          <div className="positive">Active investments</div>
        </div>

        <div className="summary-card">
          <div className="card-label">
            <span>Buying power</span>

            <span className="bank-icon">▣</span>
          </div>

          <div className="big-value">₹{balance.toLocaleString()}</div>

          <div
            className="funds"
            onClick={depositMoney}
            style={{ cursor: "pointer" }}
          >
            Add funds ↗
          </div>

          <span className="available">Available</span>
        </div>
      </div>

      {/* LOWER */}

      <div className="lower-grid">
        <div className="performance-card">
          <div className="section-header">
            <div>
              <h2>Portfolio performance</h2>

              <p>Track how your investments are doing over time.</p>
            </div>

            <div className="time-buttons">
              {["1D", "1W", "1M", "1Y"].map((period) => (
                <button
                  key={period}
                  className={chartPeriod === period ? "selected" : ""}
                  onClick={() => setChartPeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-info">
            <strong>₹{investedAmount.toLocaleString()}</strong>

            <span>Portfolio</span>

            <small>{chartPeriod}</small>
          </div>

          <div className="chart">
            <div className="y-axis">
              <span>₹1L</span>
              <span>₹75k</span>
              <span>₹50k</span>
              <span>₹25k</span>
            </div>

            <svg viewBox="0 0 700 250" preserveAspectRatio="none">
              <polyline
                points="
                0,190
                50,195
                100,170
                150,180
                200,145
                250,160
                300,125
                350,140
                400,105
                450,120
                500,85
                550,100
                600,70
                650,80
                700,45
                "
                fill="none"
                stroke="#4eb17f"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* WATCHLIST */}

        <div className="watchlist-card">
          <div className="watch-header">
            <div>
              <h2>Watchlist</h2>

              <p>Keep an eye on the market</p>
            </div>

            <button
              className="add-stock"
              onClick={() => changePage("Search stocks")}
            >
              +
            </button>
          </div>

          <div className="watch-items">
            {stocks
              .filter((stock) => watchlist.includes(stock.name))
              .map((stock) => (
                <div className="watch-item" key={stock.name}>
                  <div className="stock-left">
                    <div className="stock-letter">{stock.name[0]}</div>

                    <div>
                      <strong>{stock.name}</strong>

                      <small>{stock.company}</small>
                    </div>
                  </div>

                  <div className="stock-right">
                    <strong>₹{stock.price}</strong>

                    <span
                      className={
                        stock.change.startsWith("-") ? "negative" : "positive"
                      }
                    >
                      {stock.change}
                    </span>
                  </div>

                  <button
                    className="remove"
                    onClick={() => toggleWatchlist(stock.name)}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );

  // =========================
  // PORTFOLIO PAGE
  // =========================

  const PortfolioPage = () => (
    <div>
      <div className="page-heading">
        <h1>My Portfolio</h1>

        <p>Track your current investments.</p>
      </div>

      <div className="portfolio-summary">
        <div>
          <span>Available Balance</span>

          <strong>₹{balance.toLocaleString()}</strong>
        </div>

        <div>
          <span>Invested</span>

          <strong>₹{investedAmount.toLocaleString()}</strong>
        </div>

        <div>
          <span>Stocks</span>

          <strong>{portfolio.length}</strong>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="empty-box">
          <h2>Your portfolio is empty</h2>

          <p>Search stocks and buy your first investment.</p>

          <button
            className="trade-btn"
            onClick={() => changePage("Search stocks")}
          >
            Search Stocks
          </button>
        </div>
      ) : (
        <div className="portfolio-table">
          <div className="table-header">
            <span>Stock</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Value</span>
            <span>Action</span>
          </div>

          {portfolio.map((stock) => (
            <div className="table-row" key={stock.name}>
              <div>
                <strong>{stock.name}</strong>

                <small>{stock.company}</small>
              </div>

              <span>₹{stock.price.toLocaleString()}</span>

              <span>{stock.quantity}</span>

              <strong>
                ₹{(stock.price * stock.quantity).toLocaleString()}
              </strong>

              <button
                className="sell-btn"
                onClick={() => openTrade(stock, "SELL")}
              >
                Sell
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // =========================
  // SEARCH PAGE
  // =========================

  const SearchPage = () => (
    <div>
      <div className="page-heading">
        <h1>Search Stocks</h1>

        <p>Find stocks and add them to your portfolio.</p>
      </div>

      <input
        className="search-input"
        placeholder="Search by company or stock symbol..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="stock-grid">
        {filteredStocks.map((stock) => (
          <StockCard key={stock.name} stock={stock} />
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="empty-box">
          <h2>No stocks found</h2>

          <p>Try another stock symbol.</p>
        </div>
      )}
    </div>
  );

  // =========================
  // TRANSACTIONS PAGE
  // =========================

  const TransactionsPage = () => (
    <div>
      <div className="page-heading">
        <h1>Transactions</h1>

        <p>Your complete trading history.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-box">
          <h2>No transactions yet</h2>

          <p>Your buy and sell transactions will appear here.</p>
        </div>
      ) : (
        <div className="portfolio-table">
          <div className="table-header">
            <span>Type</span>
            <span>Stock</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Date</span>
          </div>

          {transactions.map((transaction) => (
            <div className="table-row" key={transaction.id}>
              <strong
                className={transaction.type === "BUY" ? "positive" : "negative"}
              >
                {transaction.type}
              </strong>

              <strong>{transaction.stock}</strong>

              <span>{transaction.quantity}</span>

              <strong>₹{transaction.total.toLocaleString()}</strong>

              <small>{transaction.date}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // =========================
  // WATCHLIST PAGE
  // =========================

  const WatchlistPage = () => (
    <div>
      <div className="page-heading">
        <h1>Watchlist</h1>

        <p>Stocks you're currently monitoring.</p>
      </div>

      <div className="stock-grid">
        {stocks
          .filter((stock) => watchlist.includes(stock.name))
          .map((stock) => (
            <StockCard key={stock.name} stock={stock} />
          ))}
      </div>

      {watchlist.length === 0 && (
        <div className="empty-box">
          <h2>Your watchlist is empty</h2>

          <button
            className="trade-btn"
            onClick={() => changePage("Search stocks")}
          >
            Find Stocks
          </button>
        </div>
      )}
    </div>
  );

  // =========================
  // SETTINGS
  // =========================

  const SettingsPage = () => (
    <div>
      <div className="page-heading">
        <h1>Settings</h1>

        <p>Manage your account preferences.</p>
      </div>

      <div className="settings-box">
        <div className="setting">
          <div>
            <strong>Account</strong>

            <p>Piyush - Personal account</p>
          </div>

          <button>Edit</button>
        </div>

        <div className="setting">
          <div>
            <strong>Notifications</strong>

            <p>Receive trading notifications</p>
          </div>

          <input type="checkbox" defaultChecked />
        </div>

        <div className="setting">
          <div>
            <strong>Currency</strong>

            <p>Indian Rupee (₹)</p>
          </div>

          <button>₹ INR</button>
        </div>
      </div>
    </div>
  );

  // =========================
  // HELP
  // =========================

  const HelpPage = () => (
    <div>
      <div className="page-heading">
        <h1>Help Center</h1>

        <p>Learn how to use PortfolioPro.</p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <h3>How to buy a stock?</h3>

          <p>
            Go to Search Stocks, select a stock, enter quantity and click Buy
            Stock.
          </p>
        </div>

        <div className="help-card">
          <h3>How to sell?</h3>

          <p>Open Portfolio and click Sell beside the stock you own.</p>
        </div>

        <div className="help-card">
          <h3>How does the balance work?</h3>

          <p>
            This is a simulated trading system. Deposits and trades use virtual
            money.
          </p>
        </div>
      </div>
    </div>
  );

  // =========================
  // SELECT PAGE
  // =========================

  const renderPage = () => {
    if (activePage === "Overview") {
      return <Overview />;
    }

    if (activePage === "Portfolio") {
      return <PortfolioPage />;
    }

    if (activePage === "Search stocks") {
      return <SearchPage />;
    }

    if (activePage === "Transactions") {
      return <TransactionsPage />;
    }

    if (activePage === "Watchlist") {
      return <WatchlistPage />;
    }

    if (activePage === "Settings") {
      return <SettingsPage />;
    }

    if (activePage === "Help center") {
      return <HelpPage />;
    }
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="dashboard">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">↗</div>

          <span>PortfolioPro</span>
        </div>

        <div className="user-card">
          <div className="avatar">PP</div>

          <div className="user-info">
            <strong>Piyush</strong>

            <span>Personal account</span>
          </div>

          <span>˅</span>
        </div>

        <p className="menu-title">WORKSPACE</p>

        <div className="menu">
          {[
            ["Overview", "▦"],
            ["Portfolio", "▤"],
            ["Search stocks", "⌕"],
            ["Transactions", "↓"],
            ["Watchlist", "☆"],
          ].map(([item, icon]) => (
            <button
              key={item}
              className={activePage === item ? "menu-item active" : "menu-item"}
              onClick={() => changePage(item)}
            >
              <span className="menu-icon">{icon}</span>

              <span>{item}</span>

              {item === "Watchlist" && (
                <span className="watch-count">{watchlist.length}</span>
              )}
            </button>
          ))}
        </div>

        <p className="menu-title account-title">ACCOUNT</p>

        <button
          className={
            activePage === "Settings" ? "menu-item active" : "menu-item"
          }
          onClick={() => changePage("Settings")}
        >
          <span className="menu-icon">⚙</span>
          Settings
        </button>

        <button
          className={
            activePage === "Help center" ? "menu-item active" : "menu-item"
          }
          onClick={() => changePage("Help center")}
        >
          <span className="menu-icon">?</span>
          Help center
        </button>
      </aside>

      {/* MAIN */}

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>

            <span>›</span>

            <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="notification">♧</span>

            <div className="profile-small">PP</div>
          </div>
        </header>

        <div className="content">
          {/* SUCCESS MESSAGE */}

          {message && (
            <div className="success-message">
              {message}

              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {renderPage()}
        </div>
      </main>

      {/* TRADE POPUP */}

      {selectedStock && (
        <div className="popup-overlay">
          <div className="buy-popup">
            <h2>
              {tradeType === "BUY" ? "Buy" : "Sell"} {selectedStock.name}
            </h2>

            <p className="popup-price">
              Current Price: ₹{selectedStock.price.toLocaleString()}
            </p>

            {tradeType === "SELL" && (
              <p className="owned-text">
                You own:{" "}
                {portfolio.find((item) => item.name === selectedStock.name)
                  ?.quantity || 0}{" "}
                shares
              </p>
            )}

            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <p className="total-price">
              <span>Total</span>

              <strong>
                ₹{(selectedStock.price * quantity).toLocaleString()}
              </strong>
            </p>

            <div className="popup-buttons">
              <button className="cancel-button" onClick={closeTrade}>
                Cancel
              </button>

              <button
                className={
                  tradeType === "BUY" ? "confirm-button" : "sell-confirm-button"
                }
                onClick={executeTrade}
              >
                {tradeType === "BUY" ? "Buy Stock" : "Sell Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
