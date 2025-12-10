const PracticeSession = require('../models/PracticeSession');
const ExerciseAttempt = require('../models/ExerciseAttempt');
const { successResponse, errorResponse } = require('../utils/response');

exports.getAllSessions = async (req, res) => {
    try {
        const result = await PracticeSession.getAll(req.query.page, req.query.limit);
        successResponse(res, 200, 'Practice sessions retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve sessions', error.message);
    }
};

exports.getUserSessions = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.userId;
        const result = await PracticeSession.getByUserId(userId, req.query.page, req.query.limit);
        successResponse(res, 200, 'User practice sessions retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve sessions', error.message);
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const session = await PracticeSession.findById(req.params.id);
        if (!session) return errorResponse(res, 404, 'Session not found');

        const attempts = await ExerciseAttempt.getBySession(req.params.id);
        session.attempts = attempts.attempts;

        successResponse(res, 200, 'Session retrieved', session);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve session', error.message);
    }
};

exports.startSession = async (req, res) => {
    try {
        const { topicId } = req.body;
        const userId = req.user.userId;

        const sessionId = await PracticeSession.create(userId, topicId);
        const session = await PracticeSession.findById(sessionId);

        successResponse(res, 201, 'Practice session started', session);
    } catch (error) {
        errorResponse(res, 500, 'Failed to start session', error.message);
    }
};

exports.endSession = async (req, res) => {
    try {
        const { sessionScore } = req.body;

        const updated = await PracticeSession.endSession(req.params.id, sessionScore);
        if (!updated) return errorResponse(res, 400, 'Failed to end session or Session not found');

        const updatedSession = await PracticeSession.findById(req.params.id);
        successResponse(res, 200, 'Practice session ended', updatedSession);
    } catch (error) {
        errorResponse(res, 500, 'Failed to end session', error.message);
    }
};