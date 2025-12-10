const ExerciseAttempt = require('../models/ExerciseAttempt');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

exports.getAllAttempts = async (req, res) => {
    try {
        const result = await ExerciseAttempt.getAll(req.query.page, req.query.limit);
        successResponse(res, 200, 'Exercise attempts retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve attempts', error.message);
    }
};

exports.getAttemptsBySession = async (req, res) => {
    try {
        const result = await ExerciseAttempt.getBySession(req.params.sessionId, req.query.page, req.query.limit);
        successResponse(res, 200, 'Attempts retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve attempts', error.message);
    }
};

exports.getAttemptById = async (req, res) => {
    try {
        const attempt = await ExerciseAttempt.findById(req.params.id);
        if (!attempt) return errorResponse(res, 404, 'Attempt not found');
        successResponse(res, 200, 'Attempt retrieved', attempt);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve attempt', error.message);
    }
};

exports.submitAttempt = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 400, 'Validation errors', errors.array());

        // Sử dụng destructuring để lấy đúng field
        const {
            sessionId, exerciseId, userAudioUrl, 
            scoreOverall, scorePronunciation, scoreFluency, scoreConfidence, 
            aiFeedbackJson
        } = req.body;

        const attemptId = await ExerciseAttempt.create({
            sessionId, exerciseId, userAudioUrl, 
            scoreOverall, scorePronunciation, scoreFluency, scoreConfidence, 
            aiFeedbackJson
        });

        const attempt = await ExerciseAttempt.findById(attemptId);
        successResponse(res, 201, 'Exercise attempt submitted', attempt);
    } catch (error) {
        errorResponse(res, 500, 'Failed to submit attempt', error.message);
    }
};

exports.updateAttempt = async (req, res) => {
    try {
        const { userAudioUrl, scoreOverall, scorePronunciation, scoreFluency, scoreConfidence, aiFeedbackJson } = req.body;

        const updated = await ExerciseAttempt.update(req.params.id, {
            userAudioUrl, scoreOverall, scorePronunciation, scoreFluency, scoreConfidence, aiFeedbackJson
        });
        
        if (!updated) return errorResponse(res, 400, 'Update failed or Attempt not found');

        const updatedAttempt = await ExerciseAttempt.findById(req.params.id);
        successResponse(res, 200, 'Attempt updated', updatedAttempt);
    } catch (error) {
        errorResponse(res, 500, 'Failed to update attempt', error.message);
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.userId;
        const stats = await ExerciseAttempt.getUserStats(userId);
        successResponse(res, 200, 'User stats retrieved', stats);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve stats', error.message);
    }
};