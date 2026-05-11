const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes  = require('./routes/auth.routes');
const menuRoutes  = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');

const adminStats    = require('./routes/adminStats');
const adminMenu     = require('./routes/adminMenu');
const adminOrders   = require('./routes/adminOrders');
const adminUsers    = require('./routes/adminUsers');
const adminMessages = require('./routes/adminMessages'); // ✅ pataas

const app = express();

// ── Middleware ──
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ── Routes ──
app.use('/api/auth',   authRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/orders', orderRoutes);

// ── Admin Routes ──
app.use('/api/admin/stats',    adminStats);
app.use('/api/admin/menu',     adminMenu);
app.use('/api/admin/orders',   adminOrders);
app.use('/api/admin/users',    adminUsers);
app.use('/api/admin/messages', adminMessages); // ✅ /api/admin/messages

// ── Public Messages Route ──
app.use('/api/messages', adminMessages); // ✅ para sa contact form

// ── Health Check ──
app.get('/', (req, res) => {
  res.json({ message: 'Remos Coffee API is running! ☕' });
});

// ── Start Server ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});