const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const exerciseValidation = [
    body('lessonId').isInt().withMessage('Lesson ID must be an integer'),
    body('contentText').trim().notEmpty().withMessage('Content text is required'),
    body('type').trim().notEmpty().withMessage('Exercise type is required'),
    body('orderIndex').isInt().withMessage('Order index must be an integer')
];

router.get('/', exerciseController.getAllExercises);
router.get('/lesson/:lessonId', exerciseController.getExercisesByLesson);
router.get('/:id', exerciseController.getExerciseById);

// Admin routes
router.post('/', authenticate, authorize('admin'), exerciseValidation, exerciseController.createExercise);
router.put('/:id', authenticate, authorize('admin'), exerciseValidation, exerciseController.updateExercise);
router.delete('/:id', authenticate, authorize('admin'), exerciseController.deleteExercise);

module.exports = router;