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

        // Extract all fields matching the ERD schema
        const {
            sessionId,
            exerciseId,
            userAudioUrl,      // Can be NULL for Web Speech API
            scoreOverall,
            scorePronunciation,
            scoreFluency,
            scoreConfidence,
            aiFeedbackJson     // JSON string containing word-level feedback
        } = req.body;

        // Validate required fields
        if (!sessionId || !exerciseId) {
            return errorResponse(res, 400, 'sessionId and exerciseId are required');
        }

        // Validate scores (should be between 0-100)
        const scores = [scoreOverall, scorePronunciation, scoreFluency, scoreConfidence];
        const scoreNames = ['scoreOverall', 'scorePronunciation', 'scoreFluency', 'scoreConfidence'];

        for (let i = 0; i < scores.length; i++) {
            const score = scores[i];
            if (score === undefined || score === null) {
                return errorResponse(res, 400, `${scoreNames[i]} is required`);
            }
            if (typeof score !== 'number' || score < 0 || score > 100) {
                return errorResponse(res, 400, `${scoreNames[i]} must be a number between 0 and 100`);
            }
        }

        // Validate aiFeedbackJson is valid JSON string
        if (aiFeedbackJson) {
            try {
                JSON.parse(aiFeedbackJson);
            } catch (err) {
                return errorResponse(res, 400, 'aiFeedbackJson must be a valid JSON string');
            }
        }

        // Create the attempt record
        const attemptId = await ExerciseAttempt.create({
            sessionId,
            exerciseId,
            userAudioUrl: userAudioUrl || null,  // NULL is acceptable for Web Speech API
            scoreOverall: parseFloat(scoreOverall).toFixed(2),
            scorePronunciation: parseFloat(scorePronunciation).toFixed(2),
            scoreFluency: parseFloat(scoreFluency).toFixed(2),
            scoreConfidence: parseFloat(scoreConfidence).toFixed(2),
            aiFeedbackJson: aiFeedbackJson || JSON.stringify({}) // Store as JSON string
        });

        // Retrieve the created attempt
        const attempt = await ExerciseAttempt.findById(attemptId);
        successResponse(res, 201, 'Exercise attempt submitted successfully', attempt);
    } catch (error) {
        console.error('Error in submitAttempt:', error);
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