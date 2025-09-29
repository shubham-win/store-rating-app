
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

const getStores = (req, res) => {
  const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  const userId = req.user.id;
  let query = `
    SELECT stores.*, ratings.rating as user_rating
    FROM stores
    LEFT JOIN ratings ON stores.id = ratings.store_id AND ratings.user_id = ?
    WHERE 1=1
  `;
  const params = [userId];
  if (search) {
    query += ' AND (stores.name LIKE ? OR stores.address LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  const allowedSort = ['name','email','address','average_rating','total_ratings','created_at'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
  const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  query += ` ORDER BY stores.${sortField} ${order}`;
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
};

const submitRating = (req, res) => {
  const { rating } = req.body;
  const userId = req.user.id;
  const storeId = req.params.storeId;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }

  db.query('SELECT id FROM stores WHERE id = ?', [storeId], (err, storeRows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (storeRows.length === 0) return res.status(404).json({ message: 'Store not found' });

    db.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId], (err2, ratingRows) => {
      if (err2) return res.status(500).json({ message: 'Database error' });
      const proceedUpdateAverage = () => {
        db.query('SELECT AVG(rating) AS avgRating, COUNT(*) AS totalRatings FROM ratings WHERE store_id = ?', [storeId], (err3, avgResult) => {
          if (err3) {
            console.error('Error calculating average rating:', err3);
            return res.status(500).json({ message: 'Database error' });
          }
          const avgRating = parseFloat(avgResult[0].avgRating || 0).toFixed(2);
          const totalRatings = avgResult[0].totalRatings || 0;
          db.query('UPDATE stores SET average_rating = ?, total_ratings = ? WHERE id = ?', [avgRating, totalRatings, storeId], (err4) => {
            if (err4) {
              console.error('Error updating store average:', err4);
              return res.status(500).json({ message: 'Database error' });
            }
            return res.json({ message: ratingRows.length > 0 ? 'Rating updated successfully' : 'Rating submitted successfully' });
          });
        });
      };

      if (ratingRows.length > 0) {
        db.query('UPDATE ratings SET rating = ?, updated_at = NOW() WHERE user_id = ? AND store_id = ?', [rating, userId, storeId], (err5) => {
          if (err5) return res.status(500).json({ message: 'Database error updating rating' });
          proceedUpdateAverage();
        });
      } else {
        db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userId, storeId, rating], (err6) => {
          if (err6) return res.status(500).json({ message: 'Database error inserting rating' });
          proceedUpdateAverage();
        });
      }
    });
  });
};

module.exports = {
  updatePassword,
  getStores,
  submitRating
};
