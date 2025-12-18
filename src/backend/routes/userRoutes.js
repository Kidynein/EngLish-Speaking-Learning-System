const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// User routes (Profile cá nhân)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

router.get('/', userController.getAllUsers);
// Admin routes (Quản lý user khác)
router.get('/admin', authenticate, authorize('admin'), userController.getAllUsers);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.get('/:id', authenticate, authorize('admin'), userController.getProfile);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;