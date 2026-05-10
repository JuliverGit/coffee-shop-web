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
    // ── BEGIN TRANSACTION (ACID!) ──
    await connection.beginTransaction();

    // 1. Insert order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'pending']
    );
    const orderId = orderResult.insertId;

    // 2. Insert order items + update stock
    for (const item of items) {
      // Check stock
      const [stockRows] = await connection.query(
        'SELECT stock FROM menu_items WHERE id = ?',
        [item.menuItemId]
      );

      if (stockRows.length === 0 || stockRows[0].stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ message: `Insufficient stock for item ID ${item.menuItemId}.` });
      }

      // Insert order item
      await connection.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.menuItemId, item.quantity, item.price]
      );

      // Deduct stock
      await connection.query(
        'UPDATE menu_items SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.menuItemId]
      );
    }

    // ── COMMIT (ACID!) ──
    await connection.commit();

    res.status(201).json({
      orderId: `ORD-${orderId}`,
      status: 'confirmed',
      estimatedTime: 10
    });

  } catch (err) {
    // ── ROLLBACK (ACID!) ──
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
    const [rows] = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', m.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;