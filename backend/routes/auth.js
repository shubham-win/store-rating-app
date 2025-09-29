
const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { validateSignup } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

router.post('/register', validateSignup, register);
router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;
