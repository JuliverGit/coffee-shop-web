const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status != 'cancelled'`
    );
    const [[{ totalOrders }]] = await db.query(
      `SELECT COUNT(*) AS totalOrders FROM orders`
    );
    const [[{ totalUsers }]] = await db.query(
      `SELECT COUNT(*) AS totalUsers FROM users`
    );
    const [[{ totalMenuItems }]] = await db.query(
      `SELECT COUNT(*) AS totalMenuItems FROM menu_items`
    );
    const [dailyOrders] = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count, COALESCE(SUM(total_amount),0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    const [topItems] = await db.query(
      `SELECT m.name, SUM(oi.quantity) AS total_sold
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       GROUP BY oi.menu_item_id
       ORDER BY total_sold DESC
       LIMIT 5`
    );
    const [ordersByStatus] = await db.query(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`
    );

    res.json({ totalRevenue, totalOrders, totalUsers, totalMenuItems, dailyOrders, topItems, ordersByStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;