const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, role, is_banned, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.put('/:id/ban', adminAuth, async (req, res) => {
  const { is_banned } = req.body;
  try {
    await db.query('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, req.params.id]);
    res.json({ message: is_banned ? 'User banned.' : 'User unbanned.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;