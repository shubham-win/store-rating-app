
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = (req, res) => {
  const { name, email, password, address, role = 'user' } = req.body;
  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('DB error register:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      db.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address, role],
        (err2, insertRes) => {
          if (err2) {
            console.error('DB insert error:', err2);
            return res.status(500).json({ message: 'Database error' });
          }
          const token = jwt.sign({ id: insertRes.insertId }, process.env.JWT_SECRET);
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: insertRes.insertId,
              name,
              email,
              role,
              address
            }
          });
        }
      );
    } catch (errHash) {
      console.error('Hash error:', errHash);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('DB error login:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  });
};

const me = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ user: req.user });
};

module.exports = { register, login, me };
