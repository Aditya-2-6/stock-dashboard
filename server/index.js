const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Import encryption tool
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "DELETE"] }
});

// --- MONGODB CONNECTION ---
const MONGO_URI = "mongodb+srv://admin:admin@cluster0.rv9hb.mongodb.net/Stock";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const SUPPORTED_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 'MSFT', 'AAPL'];

// --- API ROUTES ---

// 1. REGISTER (New Endpoint)
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password (encrypt it)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ 
      email, 
      password: hashedPassword, 
      holdings: [] 
    });
    await newUser.save();

    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// 2. LOGIN (Updated)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(400).json({ error: "User not found. Please register." });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login Success", holdings: user.holdings });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 3. Add Stock
app.post('/add-stock', async (req, res) => {
  const { email, ticker, quantity } = req.body;
  if (!SUPPORTED_STOCKS.includes(ticker)) return res.status(400).json({ error: "Invalid Stock" });

  try {
    const user = await User.findOne({ email });
    const existingIndex = user.holdings.findIndex(h => h.ticker === ticker);
    if (existingIndex > -1) {
      user.holdings[existingIndex].quantity += parseInt(quantity);
    } else {
      user.holdings.push({ ticker, quantity: parseInt(quantity) });
    }
    await user.save();
    res.json({ holdings: user.holdings });
  } catch (error) {
    res.status(500).json({ error: "Database Error" });
  }
});

// 4. Delete Stock
app.post('/delete-stock', async (req, res) => {
  const { email, ticker } = req.body;
  try {
    const user = await User.findOne({ email });
    user.holdings = user.holdings.filter(h => h.ticker !== ticker);
    await user.save();
    res.json({ holdings: user.holdings });
  } catch (error) {
    res.status(500).json({ error: "Delete Failed" });
  }
});

// --- REAL-TIME UPDATES ---
setInterval(() => {
  const stockPrices = {};
  SUPPORTED_STOCKS.forEach(stock => {
    stockPrices[stock] = (Math.random() * (1000 - 100) + 100).toFixed(2);
  });
  io.emit('stockUpdate', stockPrices);
}, 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});