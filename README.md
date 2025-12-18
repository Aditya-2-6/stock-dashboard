# 🚀 FinanceDash - Real-Time Stock Portfolio

A professional, full-stack financial dashboard designed to track real-time stock prices and manage a persistent user portfolio. Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and **Socket.io** for live bi-directional updates.

This application demonstrates a **Hybrid Microservice Architecture**, separating the frontend (Vercel) from the real-time backend (Render).

---

### 🌐 Live Demo
**[Click Here to View Live Project](https://stock-dashboard-aditya.vercel.app/)**

**Backend is hosted on Render and is live.**

*(Note: Since the backend is on a free tier instance, please allow 30-60 seconds for the server to wake up on the initial load if the "Database: Connecting..." badge is visible.)*

---

## ✨ Key Features

* **⚡ Real-Time Market Data:** Stock prices for supported tickers (GOOG, TSLA, AMZN, etc.) update every second via WebSockets without page refreshes.
* **🔐 Secure Authentication:** Full user registration and login system protected by **Bcrypt** password encryption.
* **💾 Full Persistence:** User portfolios, specific holdings, and account details are securely stored in **MongoDB Atlas**.
* **📈 Dynamic Valuation:** The "Total Portfolio Value" recalculates instantly in real-time as market prices fluctuate.
* **🖥️ Professional UI:** Responsive, dark-mode "Glassmorphism" interface built with React and standard CSS.
* **🔄 Sync Across Devices:** Changes made in one window (e.g., buying a stock) update asynchronously across all other open sessions.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), CSS3, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Real-Time** | Socket.io (WebSockets) |
| **Deployment** | Vercel (Client) + Render (Server) |

---

stock-dashboard/
├── client/              # React Frontend
│   ├── src/
│   │   ├── App.jsx      # Main Dashboard Logic
│   │   ├── App.css      # Glassmorphism Styling
│   │   └── ...
│   └── package.json
│
├── server/              # Node.js Backend
│   ├── models/          # MongoDB Schemas (User.js)
│   ├── index.js         # Server Entry (Express + Socket.io)
│   ├── package.json
│   └── .env             # Secrets (Excluded from Git)
│
└── README.md            # Documentation
