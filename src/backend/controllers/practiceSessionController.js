const PracticeSession = require('../models/PracticeSession');
const ExerciseAttempt = require('../models/ExerciseAttempt');
const UserStats = require('../models/UserStats');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// XP Rewards
const XP_REWARDS = {
    LESSON_COMPLETE: 10,
    STREAK_BONUS: 5,
    PERFECT_SCORE: 15
};

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
        console.log('Starting session for user:', userId, 'topic:', topicId);

        const sessionId = await PracticeSession.create(userId, topicId);
        console.log('Session created with ID:', sessionId);
        const session = await PracticeSession.findById(sessionId);

        successResponse(res, 201, 'Practice session started', session);
    } catch (error) {
        errorResponse(res, 500, 'Failed to start session', error.message);
    }
};

exports.endSession = async (req, res) => {
    try {
        const { sessionScore, durationSeconds = 0 } = req.body;
        const sessionId = req.params.id;
        const userId = req.user.userId;

        console.log('Ending session:', sessionId, 'with score:', sessionScore, 'duration:', durationSeconds);

        // 1. End the session
        const updated = await PracticeSession.endSession(sessionId, sessionScore);
        console.log('Session end result:', updated);
        if (!updated) return errorResponse(res, 400, 'Failed to end session or Session not found');

        // 2. Update UserStats
        let xpEarned = XP_REWARDS.LESSON_COMPLETE; // Base XP for completing lesson

        try {
            // Get current stats
            let currentStats = await UserStats.findByUserId(userId);

            // Create stats if not exists
            if (!currentStats) {
                await UserStats.create(userId);
                currentStats = { totalPracticeSeconds: 0, averageScore: 0, currentStreak: 0 };
            }

            // Calculate new stats
            const newTotalSeconds = (currentStats.totalPracticeSeconds || 0) + durationSeconds;

            // Get all user sessions to calculate average score
            const allSessions = await PracticeSession.getByUserId(userId, 1, 1000);
            const completedSessions = allSessions.sessions ?
                allSessions.sessions.filter(s => s.sessionScore !== null && s.sessionScore > 0) : [];

            let newAvgScore = sessionScore || 0;
            if (completedSessions.length > 0) {
                const totalScore = completedSessions.reduce((sum, s) => sum + (s.sessionScore || 0), 0);
                newAvgScore = totalScore / completedSessions.length;
            }

            // Calculate streak (check if practiced today/yesterday)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastPractice = currentStats.lastPracticeDate ? new Date(currentStats.lastPracticeDate) : null;

            let newStreak = currentStats.currentStreak || 0;
            if (lastPractice) {
                lastPractice.setHours(0, 0, 0, 0);
                const daysDiff = Math.floor((today - lastPractice) / (1000 * 60 * 60 * 24));

                if (daysDiff === 0) {
                    // Same day, keep streak
                } else if (daysDiff === 1) {
                    // Next day, increase streak
                    newStreak += 1;
                    xpEarned += XP_REWARDS.STREAK_BONUS;
                } else {
                    // Streak broken
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            // Bonus XP for perfect score
            if (sessionScore >= 95) {
                xpEarned += XP_REWARDS.PERFECT_SCORE;
            }

            // Update stats
            await UserStats.updateStats(userId, {
                streakDays: newStreak,
                totalSeconds: newTotalSeconds,
                avgScore: Math.round(newAvgScore * 100) / 100
            });

            console.log('UserStats updated:', { newStreak, newTotalSeconds, newAvgScore });
        } catch (statsError) {
            console.error('Failed to update UserStats:', statsError);
        }

        // 3. Add XP to user
        try {
            const xpResult = await User.addXP(userId, xpEarned);
            console.log('XP added:', xpEarned, 'New total:', xpResult.newXP);
        } catch (xpError) {
            console.error('Failed to add XP:', xpError);
        }

        const updatedSession = await PracticeSession.findById(sessionId);
        successResponse(res, 200, 'Practice session ended', {
            ...updatedSession,
            xpEarned
        });
    } catch (error) {
        errorResponse(res, 500, 'Failed to end session', error.message);
    }
};
