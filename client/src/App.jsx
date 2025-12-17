import { useState, useEffect, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

// Handle Cloud or Local URL automatically
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
const socket = io.connect(SOCKET_URL);
const SUPPORTED_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 'MSFT', 'AAPL'];

function App() {
  const [view, setView] = useState("login"); // 'login', 'register', 'dashboard'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [holdings, setHoldings] = useState([]);
  const [prices, setPrices] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  
  // Dashboard states
  const [selectedTicker, setSelectedTicker] = useState(SUPPORTED_STOCKS[0]);
  const [quantity, setQuantity] = useState(1);
  const prevPrices = useRef({});

  useEffect(() => {
    socket.on("stockUpdate", (data) => {
      setPrices((prev) => {
        prevPrices.current = prev;
        return data;
      });
    });
    return () => socket.off("stockUpdate");
  }, []);

  const totalPortfolioValue = useMemo(() => {
    return holdings.reduce((total, stock) => {
      const price = parseFloat(prices[stock.ticker] || 0);
      return total + (price * stock.quantity);
    }, 0).toFixed(2);
  }, [holdings, prices]);

  // --- ACTIONS ---

  const handleRegister = async () => {
    if(!email || !password) return setErrorMsg("Please fill all fields");
    try {
      await axios.post(`${SOCKET_URL}/register`, { email, password });
      alert("Registration Successful! Please Login.");
      setView("login");
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Registration Failed");
    }
  };

  const handleLogin = async () => {
    if(!email || !password) return setErrorMsg("Please fill all fields");
    try {
      const res = await axios.post(`${SOCKET_URL}/login`, { email, password });
      setHoldings(res.data.holdings);
      setView("dashboard");
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Login Failed");
    }
  };

  const handleAddStock = async () => {
    const res = await axios.post(`${SOCKET_URL}/add-stock`, { 
      email, ticker: selectedTicker, quantity 
    });
    setHoldings(res.data.holdings);
  };

  const handleDelete = async (ticker) => {
    const res = await axios.post(`${SOCKET_URL}/delete-stock`, { email, ticker });
    setHoldings(res.data.holdings);
  };

  // --- AUTH SCREENS ---

  if (view === "login" || view === "register") {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Finance<span className="accent">Dash</span></h1>
          <p>{view === "login" ? "Login to Portfolio" : "Create New Account"}</p>
          
          {errorMsg && <div className="error-badge">{errorMsg}</div>}

          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {view === "login" ? (
            <>
              <button onClick={handleLogin}>Login</button>
              <p className="switch-text">
                New here? <span onClick={() => {setView("register"); setErrorMsg("");}}>Register</span>
              </p>
            </>
          ) : (
            <>
              <button onClick={handleRegister} className="btn-outline">Register</button>
              <p className="switch-text">
                Have an account? <span onClick={() => {setView("login"); setErrorMsg("");}}>Login</span>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className="app-container">
      <header className="top-bar">
        <div className="logo">Finance<span className="accent">Dash</span></div>
        <div className="user-info">
          <span>{email}</span>
          <button className="logout-btn" onClick={() => setView("login")}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="stats-row">
          <div className="stat-card">
            <h3>Total Value</h3>
            <div className="stat-value text-green">${totalPortfolioValue}</div>
          </div>
          <div className="stat-card">
            <h3>Holdings</h3>
            <div className="stat-value">{holdings.length}</div>
          </div>
          <div className="stat-card add-stock-card">
            <h3>Add Stock</h3>
            <div className="add-controls">
              <select value={selectedTicker} onChange={(e) => setSelectedTicker(e.target.value)}>
                {SUPPORTED_STOCKS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button onClick={handleAddStock}>+ Buy</button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((stock) => {
                const livePrice = parseFloat(prices[stock.ticker] || 0);
                const prevPrice = parseFloat(prevPrices.current[stock.ticker] || 0);
                const colorClass = livePrice >= prevPrice ? "text-green" : "text-red";
                
                return (
                  <tr key={stock.ticker}>
                    <td className="ticker-cell">{stock.ticker}</td>
                    <td>{stock.quantity}</td>
                    <td className={`live-cell ${colorClass}`}>${livePrice.toFixed(2)}</td>
                    <td className="value-cell">${(livePrice * stock.quantity).toFixed(2)}</td>
                    <td><button className="delete-btn" onClick={() => handleDelete(stock.ticker)}>Sell</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;