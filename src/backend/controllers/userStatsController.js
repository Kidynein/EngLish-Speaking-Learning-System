const UserStats = require('../models/UserStats');
const { successResponse, errorResponse } = require('../utils/response');

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.userId;
        const stats = await UserStats.findByUserId(userId);
        if (!stats) return errorResponse(res, 404, 'User stats not found');
        successResponse(res, 200, 'User stats retrieved', stats);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve stats', error.message);
    }
};

exports.getTopUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topUsers = await UserStats.getTopUsers(limit);
        successResponse(res, 200, 'Top users retrieved', topUsers);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve top users', error.message);
    }
};

exports.updateUserStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Destructuring
        const { currentStreak, totalPracticeSeconds, averageScore } = req.body;

        // Truyền Object { streakDays, totalSeconds, avgScore } cho khớp Model
        const updated = await UserStats.updateStats(userId, { 
            streakDays: currentStreak, 
            totalSeconds: totalPracticeSeconds, 
            avgScore: averageScore 
        });

        if (updated) {
            const stats = await UserStats.findByUserId(userId);
            successResponse(res, 200, 'User stats updated', stats);
        } else {
            errorResponse(res, 400, 'Failed to update stats');
        }
    } catch (error) {
        errorResponse(res, 500, 'Failed to update stats', error.message);
    }
};

exports.addPracticeTime = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { seconds } = req.body;

        const updated = await UserStats.addPracticeTime(userId, seconds);

        if (updated) {
            const stats = await UserStats.findByUserId(userId);
            successResponse(res, 200, 'Practice time added', stats);
        } else {
            errorResponse(res, 400, 'Failed to add practice time');
        }
    } catch (error) {
        errorResponse(res, 500, 'Failed to add practice time', error.message);
    }
};