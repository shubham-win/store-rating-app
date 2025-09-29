
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Dashboard stats
const getDashboardStats = (req, res) => {
  const queries = [
    'SELECT COUNT(*) as totalUsers FROM users',
    'SELECT COUNT(*) as totalStores FROM stores',
    'SELECT COUNT(*) as totalRatings FROM ratings'
  ];

  Promise.all(queries.map(q =>
    new Promise((resolve, reject) => {
      db.query(q, (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    })
  ))
  .then(([usersResult, storesResult, ratingsResult]) => {
    res.json({
      totalUsers: usersResult.totalUsers,
      totalStores: storesResult.totalStores,
      totalRatings: ratingsResult.totalRatings
    });
  })
  .catch(err => {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Database error' });
  });
};

// Add new user (admin can create user/admin/store_owner)
const addUser = (req, res) => {
  const { name, email, password, address, role = 'user' } = req.body;
  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role],
      (err2, insertRes) => {
        if (err2) {
          console.error('Insert user error:', err2);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
          message: 'User created successfully',
          user: {
            id: insertRes.insertId,
            name, email, address, role
          }
        });
      }
    );
  });
};

// Update user (admin)
const updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, email, address, role } = req.body;
  db.query('SELECT id FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    db.query('UPDATE users SET name = ?, email = ?, address = ?, role = ? WHERE id = ?', [name, email, address, role, userId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'User updated successfully' });
    });
  });
};

// Delete user (admin)
const deleteUser = (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  });
};

// Admin reset user password
const resetUserPassword = (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password is required' });
  bcrypt.hash(password, 10, (err, hashed) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'Password reset successfully' });
    });
  });
};

// Add new store
const addStore = (req, res) => {
  const { name, email, address, owner_id } = req.body;
  db.query('SELECT id, role FROM users WHERE id = ?', [owner_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    if (results[0].role !== 'store_owner') return res.status(400).json({ message: 'User must be a store_owner' });
    db.query('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [name, email, address, owner_id], (err2, insertRes) => {
      if (err2) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({
        message: 'Store created successfully',
        store: { id: insertRes.insertId, name, email, address, owner_id }
      });
    });
  });
};

// Update store (admin)
const updateStore = (req, res) => {
  const storeId = req.params.id;
  const { name, email, address, owner_id } = req.body;
  db.query('SELECT id FROM stores WHERE id = ?', [storeId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Store not found' });
    // if owner_id provided, ensure user exists and is store_owner
    const checkOwner = (cb) => {
      if (!owner_id) return cb(null);
      db.query('SELECT id, role FROM users WHERE id = ?', [owner_id], (err2, ownerRes) => {
        if (err2) return cb(err2);
        if (ownerRes.length === 0) return cb(new Error('Owner not found'));
        if (ownerRes[0].role !== 'store_owner') return cb(new Error('User is not a store_owner'));
        cb(null);
      });
    };
    checkOwner((ownerErr) => {
      if (ownerErr) return res.status(400).json({ message: ownerErr.message });
      db.query('UPDATE stores SET name = ?, email = ?, address = ?, owner_id = ? WHERE id = ?', [name, email, address, owner_id || null, storeId], (err3) => {
        if (err3) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Store updated successfully' });
      });
    });
  });
};

// Delete store (admin)
const deleteStore = (req, res) => {
  const storeId = req.params.id;
  db.query('DELETE FROM stores WHERE id = ?', [storeId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted successfully' });
  });
};

// Get users with filters
const getUsers = (req, res) => {
  const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
  const params = [];
  if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
  if (email) { query += ' AND email LIKE ?'; params.push(`%${email}%`); }
  if (address) { query += ' AND address LIKE ?'; params.push(`%${address}%`); }
  if (role) { query += ' AND role = ?'; params.push(role); }
  const allowedSort = ['name','email','created_at','role'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
  const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortField} ${order}`;
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    const storeOwners = results.filter(u => u.role === 'store_owner');
    if (storeOwners.length === 0) return res.json(results);
    const ownerIds = storeOwners.map(s => s.id);
    db.query(
      `SELECT users.id as owner_id, AVG(stores.average_rating) as owner_avg_rating
       FROM users
       LEFT JOIN stores ON users.id = stores.owner_id
       WHERE users.id IN (?)
       GROUP BY users.id`,
      [ownerIds],
      (err2, ratingResults) => {
        if (err2) return res.status(500).json({ message: 'Database error' });
        const map = {};
        ratingResults.forEach(r => map[r.owner_id] = parseFloat(r.owner_avg_rating || 0).toFixed(2));
        const out = results.map(u => {
          if (u.role === 'store_owner') u.rating = map[u.id] || 0;
          return u;
        });
        res.json(out);
      }
    );
  });
};

// Get stores with filters
const getStores = (req, res) => {
  const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  let query = `SELECT stores.*, users.name AS owner_name, users.email AS owner_email
               FROM stores JOIN users ON stores.owner_id = users.id WHERE 1=1`;
  const params = [];
  if (name) { query += ' AND stores.name LIKE ?'; params.push(`%${name}%`); }
  if (email) { query += ' AND stores.email LIKE ?'; params.push(`%${email}%`); }
  if (address) { query += ' AND stores.address LIKE ?'; params.push(`%${address}%`); }
  const allowedSort = ['name','email','address','average_rating','total_ratings','created_at'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
  const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  query += ` ORDER BY stores.${sortField} ${order}`;
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
};

// Get user details
const getUserDetails = (req, res) => {
  const userId = req.params.id;
  db.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = results[0];
    if (user.role === 'store_owner') {
      db.query('SELECT AVG(average_rating) as average_rating FROM stores WHERE owner_id = ?', [userId], (err2, avgRes) => {
        if (err2) return res.status(500).json({ message: 'Database error' });
        user.rating = parseFloat(avgRes[0].average_rating || 0).toFixed(2);
        res.json(user);
      });
    } else {
      res.json(user);
    }
  });
};

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getStores,
  getUserDetails,
  updateUser,
  deleteUser,
  resetUserPassword,
  updateStore,
  deleteStore
};
