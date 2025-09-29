
const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const { validateSignup } = require('../middleware/validation');
const adminController = require('../controllers/adminController');

router.use(auth, roleAuth(['admin']));

router.get('/dashboard', adminController.getDashboardStats);
router.post('/users', validateSignup, adminController.addUser);
router.post('/stores', adminController.addStore);
router.get('/users', adminController.getUsers);
router.get('/stores', adminController.getStores);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/password', adminController.resetUserPassword);
router.put('/stores/:id', adminController.updateStore);
router.delete('/stores/:id', adminController.deleteStore);

module.exports = router;
