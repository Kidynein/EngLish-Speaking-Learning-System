const express = require('express');
const router = express.Router();
const userStatsController = require('../controllers/userStatsController');
const { authenticate } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const updateStatsValidation = [
    body('currentStreak').isInt().withMessage('Current streak must be an integer'),
    body('totalPracticeSeconds').isInt().withMessage('Total practice seconds must be an integer'),
    body('averageScore').isDecimal().withMessage('Average score must be a number')
];

const practiceTimeValidation = [
    body('seconds').isInt({ min: 1 }).withMessage('Seconds must be a positive integer')
];

router.get('/top-users', userStatsController.getTopUsers);
router.post('/add-practice-time', authenticate, practiceTimeValidation, userStatsController.addPracticeTime);

router.get('/:userId', authenticate, userStatsController.getUserStats);
router.put('/', authenticate, updateStatsValidation, userStatsController.updateUserStats);

module.exports = router;