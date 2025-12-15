const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/authMiddleware');

// Validated: Protected route to get user progress
router.get('/', authenticate, progressController.getUserProgress);

module.exports = router;
