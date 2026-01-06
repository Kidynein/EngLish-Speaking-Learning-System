const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/assessment/analyze
 * @desc    Analyze pronunciation from audio file
 * @access  Private (requires authentication)
 * @body    FormData with:
 *          - audio: Audio file (webm, wav, mp3, etc.)
 *          - targetSentence: The sentence user should have read
 * @returns JSON assessment with scores and word analysis
 */
router.post('/analyze', authenticate, assessmentController.analyzeHandler);

/**
 * @route   POST /api/assessment/transcribe
 * @desc    Transcribe audio to text
 * @access  Private (requires authentication)
 * @body    FormData with audio file
 * @returns Transcribed text
 */
router.post('/transcribe', authenticate, assessmentController.transcribeHandler);

/**
 * @route   GET /api/assessment/health
 * @desc    Check assessment service health
 * @access  Public
 */
router.get('/health', assessmentController.healthCheck);

module.exports = router;
