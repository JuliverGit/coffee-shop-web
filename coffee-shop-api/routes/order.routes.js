const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// ── PLACE ORDER (ACID Transaction) ──
router.post('/', authMiddleware, async (req, res) => {
  const { items, totalAmount } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // ✅ may payment_method na
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status, payment_method) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, 'pending', 'cash']
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const [stockRows] = await connection.query(
        'SELECT stock FROM menu_items WHERE id = ?',
        [item.menuItemId]
      );

      if (stockRows.length === 0 || stockRows[0].stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ message: `Insufficient stock for item ID ${item.menuItemId}.` });
      }

      await connection.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.menuItemId, item.quantity, item.price]
      );

      await connection.query(
        'UPDATE menu_items SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.menuItemId]
      );
    }

    await connection.commit();

    res.status(201).json({
      orderId: `ORD-${orderId}`,
      status: 'confirmed',
      estimatedTime: 10
    });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Order failed. Please try again.' });
  } finally {
    connection.release();
  }
});

// ── GET USER ORDERS ──
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, total_amount, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.quantity, oi.price, m.name
         FROM order_items oi
         JOIN menu_items m ON oi.menu_item_id = m.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;