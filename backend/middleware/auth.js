
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query('SELECT id, name, email, role, address FROM users WHERE id = ?', [decoded.id], (err, results) => {
      if (err) {
        console.error('DB error in auth:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (!results || results.length === 0) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      req.user = results[0];
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, roleAuth };
