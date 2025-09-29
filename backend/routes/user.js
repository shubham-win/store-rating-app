
const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const { validatePassword } = require('../middleware/validation');
const userController = require('../controllers/userController');

router.use(auth, roleAuth(['user']));

router.put('/password', validatePassword, userController.updatePassword);
router.get('/stores', userController.getStores);
router.post('/stores/:storeId/rating', userController.submitRating);

module.exports = router;
