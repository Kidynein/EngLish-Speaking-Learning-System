const Progress = require('../models/Progress');
const UserStats = require('../models/UserStats');

exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id; // Fix: Ensure we get userId correctly from token (usually req.user.userId)

        console.log(`[ProgressController] START Fetching for UserID: ${userId}`);

        // Execute all queries in parallel for performance
        const [
            weeklyData,
            topicPerformance,
            userSkills,
            monthlyActivity,
            summaryStats,
            userStats // for streak
        ] = await Promise.all([
            Progress.getWeeklyPerformance(userId),
            Progress.getTopicPerformance(userId),
            Progress.getUserSkills(userId),
            Progress.getMonthlyActivity(userId),
            Progress.getSummaryStats(userId),
            UserStats.findByUserId(userId)
        ]);

        console.log(`[ProgressController] Weekly Rows: ${weeklyData.length}`);
        console.log(`[ProgressController] Topic Rows: ${topicPerformance.length}`);
        console.log(`[ProgressController] Skills Rows: ${userSkills.length}`);

        res.status(200).json({
            status: 'success',
            data: {
                weekly: weeklyData,
                topics: topicPerformance,
                skills: userSkills,
                monthly: monthlyActivity,
                summary: {
                    ...summaryStats,
                    streak: userStats ? userStats.currentStreak : 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching progress data:', error);
        console.error(error.stack);
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
};
