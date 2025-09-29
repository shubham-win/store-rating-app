
const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const { validatePassword } = require('../middleware/validation');
const storeOwnerController = require('../controllers/storeOwnerController');

router.use(auth, roleAuth(['store_owner']));

router.put('/password', validatePassword, storeOwnerController.updatePassword);
router.get('/dashboard', storeOwnerController.getDashboard);

module.exports = router;
