const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const adminAuth = require('../middleware/adminAuth');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// ── Upload Setup ──
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  }
});

// ── GET all items ──
router.get('/', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM menu_items ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST add item ──
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  const { name, description, price, category, stock, is_available } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required.' });
  }

  const imageUrl = req.file
    ? `http://localhost:3000/uploads/${req.file.filename}`
    : (req.body.image || '');

  try {
    const [result] = await db.query(
      `INSERT INTO menu_items (name, description, price, image, category, stock, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', price, imageUrl, category, stock ?? 50, is_available ?? 1]
    );
    res.status(201).json({ message: 'Item added.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── PUT update item ──
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  const { name, description, price, category, stock, is_available, image } = req.body;

  const imageUrl = req.file
    ? `http://localhost:3000/uploads/${req.file.filename}`
    : (image || '');

  try {
    await db.query(
      `UPDATE menu_items SET name=?, description=?, price=?, image=?, category=?, stock=?, is_available=? WHERE id=?`,
      [name, description, price, imageUrl, category, stock, is_available, req.params.id]
    );
    res.json({ message: 'Item updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE item ──
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;