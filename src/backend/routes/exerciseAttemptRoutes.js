const express = require('express');
const router = express.Router();
const exerciseAttemptController = require('../controllers/exerciseAttemptController');
const { authenticate } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const attemptValidation = [
    body('sessionId').isInt().withMessage('Session ID is required'),
    body('exerciseId').isInt().withMessage('Exercise ID is required'),
    body('scoreOverall').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
];

router.get('/', authenticate, exerciseAttemptController.getAllAttempts);
router.get('/session/:sessionId', authenticate, exerciseAttemptController.getAttemptsBySession);
router.get('/user/:userId/stats', authenticate, exerciseAttemptController.getUserStats);
router.get('/:id', authenticate, exerciseAttemptController.getAttemptById);
router.post('/', authenticate, attemptValidation, exerciseAttemptController.submitAttempt);
router.put('/:id', authenticate, exerciseAttemptController.updateAttempt);

module.exports = router;