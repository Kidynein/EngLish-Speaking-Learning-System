const express = require('express');
const router = express.Router();
const practiceSessionController = require('../controllers/practiceSessionController');
const { authenticate } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const sessionValidation = [
    body('topicId').isInt().withMessage('Topic ID is required and must be an integer')
];

const endSessionValidation = [
    body('sessionScore').isFloat({ min: 0, max: 100 }).withMessage('Session score must be between 0 and 100')
];

router.get('/', authenticate, practiceSessionController.getAllSessions);
router.get('/users/:userId', authenticate, practiceSessionController.getUserSessions);
router.get('/:id', authenticate, practiceSessionController.getSessionById);
router.post('/', authenticate, sessionValidation, practiceSessionController.startSession);
router.post('/:id/end', authenticate, endSessionValidation, practiceSessionController.endSession);

module.exports = router;