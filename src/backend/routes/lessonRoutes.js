const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const lessonValidation = [
    body('topicId').isInt().withMessage('Topic ID must be an integer'),
    body('title').trim().notEmpty().withMessage('Lesson title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('orderIndex').isInt().withMessage('Order index must be an integer')
];

router.get('/', lessonController.getAllLessons);
router.get('/topic/:topicId', lessonController.getLessonsByTopic);
router.get('/:id', lessonController.getLessonById);

// Admin routes
router.post('/', authenticate, authorize('admin'), lessonValidation, lessonController.createLesson);
router.put('/:id', authenticate, authorize('admin'), lessonValidation, lessonController.updateLesson);
router.delete('/:id', authenticate, authorize('admin'), lessonController.deleteLesson);

module.exports = router;