const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

// Get chatbot config (public info) - no auth required
router.get('/config', chatController.getConfig);

// All routes below require authentication
router.use(authenticate);

// Check access status
router.get('/access', chatController.checkAccess);

// Send message to AI tutor
router.post('/message', chatController.sendMessage);

// Get conversation history
router.get('/history', chatController.getHistory);

// Clear conversation history
router.delete('/history', chatController.clearHistory);

// Quick actions (predefined prompts)
router.post('/quick-action', chatController.quickAction);

module.exports = router;
