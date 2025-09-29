
const db = require('../config/database');

const updatePassword = (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;
  const bcrypt = require('bcryptjs');
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Password updated successfully' });
    });
  });
};

const getDashboard = (req, res) => {
  const ownerId = req.user.id;
  db.query('SELECT * FROM stores WHERE owner_id = ?', [ownerId], (err, stores) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!stores || stores.length === 0) return res.json({ stores: [], ratings: [] });

    const storeIds = stores.map(s => s.id);
    db.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id IN (?)
       ORDER BY r.created_at DESC`,
      [storeIds],
      (err2, ratings) => {
        if (err2) return res.status(500).json({ message: 'Database error' });
        res.json({
          stores,
          ratings
        });
      }
    );
  });
};

module.exports = { updatePassword, getDashboard };
