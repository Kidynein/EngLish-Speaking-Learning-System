const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validation chung cho Create và Update
const topicValidation = [
    body('name').trim().notEmpty().withMessage('Topic name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    // Optional cho phép update từng phần, nhưng nếu gửi lên thì phải đúng định dạng
    body('difficultyLevel').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
];

router.get('/', authenticate, topicController.getAllTopics);
router.get('/:id', topicController.getTopicById);

// Admin routes
router.post('/', authenticate, authorize('admin'), topicValidation, topicController.createTopic);
// Áp dụng validation cho cả update để tránh data rác
router.put('/:id', authenticate, authorize('admin'), topicValidation, topicController.updateTopic);
router.delete('/:id', authenticate, authorize('admin'), topicController.deleteTopic);

module.exports = router;