const express = require('express');
const router = express.Router();
const scoringController = require('../controllers/scoringController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment if auth is needed

// POST /api/scoring/submit
// router.post('/submit', protect, scoringController.submitScoring);
router.post('/submit', scoringController.submitScoring);

module.exports = router;
