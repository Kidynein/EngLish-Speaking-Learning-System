const express = require('express');
const router = express.Router();
const userHistoryController = require('../controllers/userHistoryController');
const { authenticate } = require('../middleware/authMiddleware');

// Route: GET /users/:userId/history with authenticate protection
router.get('/users/:userId/history', authenticate, userHistoryController.getUserHistory);

module.exports = router;