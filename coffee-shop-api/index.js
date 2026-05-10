const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes  = require('./routes/auth.routes');
const menuRoutes  = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// ── Middleware ──
app.use(cors({
  origin: 'http://localhost:4200', // Angular dev server
  credentials: true
}));
app.use(express.json());

// ── Routes ──
app.use('/api/auth',   authRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/orders', orderRoutes);

// ── Health Check ──
app.get('/', (req, res) => {
  res.json({ message: 'Remos Coffee API is running! ☕' });
});

// ── Start Server ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});