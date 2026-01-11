const pool = require('../config/database');

class UserStats {
    static _mapToModel(row) {
        if (!row) return null;
        return {
            userId: row.user_id,
            currentStreak: row.current_streak,
            totalPracticeSeconds: row.total_practice_seconds,
            averageScore: row.average_score,
            lastPracticeDate: row.last_practice_date
        };
    }

    static async findByUserId(userId) {
        // Get base stats from UserStats table
        const [rows] = await pool.query('SELECT * FROM UserStats WHERE user_id = ?', [userId]);

        if (!rows[0]) return null;

        // Calculate realtime average score from ExerciseAttempts
        const [avgResult] = await pool.query(
            `SELECT AVG(ea.score_overall) as avg_score, COUNT(*) as total_attempts
             FROM ExerciseAttempts ea
             JOIN PracticeSessions ps ON ea.session_id = ps.session_id
             WHERE ps.user_id = ?`,
            [userId]
        );

        // Calculate realtime total practice time from PracticeSessions
        const [timeResult] = await pool.query(
            `SELECT COALESCE(SUM(TIMESTAMPDIFF(SECOND, start_time, COALESCE(end_time, start_time))), 0) as total_seconds
             FROM PracticeSessions
             WHERE user_id = ?`,
            [userId]
        );

        // Calculate realtime streak from PracticeSessions
        // Get distinct practice dates ordered by most recent
        const [practiceDates] = await pool.query(
            `SELECT DISTINCT DATE(start_time) as practice_date
             FROM PracticeSessions
             WHERE user_id = ?
             ORDER BY practice_date DESC`,
            [userId]
        );

        let currentStreak = 0;
        if (practiceDates.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if user practiced today or yesterday (to start counting streak)
            const lastPracticeDate = new Date(practiceDates[0].practice_date);
            lastPracticeDate.setHours(0, 0, 0, 0);

            const daysSinceLastPractice = Math.floor((today - lastPracticeDate) / (1000 * 60 * 60 * 24));

            if (daysSinceLastPractice <= 1) {
                // Start counting from the most recent practice date
                currentStreak = 1;
                let expectedDate = new Date(lastPracticeDate);

                for (let i = 1; i < practiceDates.length; i++) {
                    expectedDate.setDate(expectedDate.getDate() - 1);
                    const practiceDate = new Date(practiceDates[i].practice_date);
                    practiceDate.setHours(0, 0, 0, 0);

                    if (practiceDate.getTime() === expectedDate.getTime()) {
                        currentStreak++;
                    } else {
                        break; // Streak broken
                    }
                }
            }
            // If daysSinceLastPractice > 1, streak is 0 (broken)
        }

        const calculatedAvgScore = avgResult[0]?.avg_score || 0;
        const calculatedTotalSeconds = timeResult[0]?.total_seconds || 0;

        return {
            userId: rows[0].user_id,
            currentStreak: currentStreak,
            totalPracticeSeconds: calculatedTotalSeconds,
            averageScore: Math.round(calculatedAvgScore * 100) / 100,
            lastPracticeDate: rows[0].last_practice_date,
            totalAttempts: avgResult[0]?.total_attempts || 0
        };
    }

    static async create(userId) {
        const [result] = await pool.query(
            'INSERT INTO UserStats (user_id, current_streak, total_practice_seconds, average_score, last_practice_date) VALUES (?, 0, 0, 0, NULL)',
            [userId]
        );
        return result.insertId;
    }

    static async updateStats(userId, { streakDays, totalSeconds, avgScore }) {
        const [result] = await pool.query(
            'UPDATE UserStats SET current_streak = ?, total_practice_seconds = ?, average_score = ?, last_practice_date = NOW() WHERE user_id = ?',
            [streakDays, totalSeconds, avgScore, userId]
        );
        return result.affectedRows > 0;
    }

    static async addPracticeTime(userId, seconds) {
        const [result] = await pool.query(
            'UPDATE UserStats SET total_practice_seconds = total_practice_seconds + ?, last_practice_date = NOW() WHERE user_id = ?',
            [seconds, userId]
        );
        return result.affectedRows > 0;
    }

    static async getTopUsers(limit = 10) {
        const [rows] = await pool.query(
            `SELECT u.user_id, u.full_name, u.avatar_url, us.total_practice_seconds, us.average_score, us.current_streak
             FROM UserStats us
             JOIN Users u ON us.user_id = u.user_id
             ORDER BY us.average_score DESC
             LIMIT ?`,
            [Number(limit)]
        );

        // Map custom result cho Leaderboard
        return rows.map(row => ({
            userId: row.user_id,
            fullName: row.full_name,
            avatarUrl: row.avatar_url,
            totalPracticeSeconds: row.total_practice_seconds,
            averageScore: row.average_score,
            currentStreak: row.current_streak
        }));
    }
}

module.exports = UserStats;