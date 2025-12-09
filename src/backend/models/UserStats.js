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
        const [rows] = await pool.query('SELECT * FROM userstats WHERE user_id = ?', [userId]);
        return this._mapToModel(rows[0]);
    }

    static async create(userId) {
        const [result] = await pool.query(
            'INSERT INTO userstats (user_id, current_streak, total_practice_seconds, average_score, last_practice_date) VALUES (?, 0, 0, 0, NULL)',
            [userId]
        );
        return result.insertId;
    }

    static async updateStats(userId, { streakDays, totalSeconds, avgScore }) {
        const [result] = await pool.query(
            'UPDATE userstats SET current_streak = ?, total_practice_seconds = ?, average_score = ?, last_practice_date = NOW() WHERE user_id = ?',
            [streakDays, totalSeconds, avgScore, userId]
        );
        return result.affectedRows > 0;
    }

    static async addPracticeTime(userId, seconds) {
        const [result] = await pool.query(
            'UPDATE userstats SET total_practice_seconds = total_practice_seconds + ?, last_practice_date = NOW() WHERE user_id = ?',
            [seconds, userId]
        );
        return result.affectedRows > 0;
    }

    static async getTopUsers(limit = 10) {
        const [rows] = await pool.query(
            `SELECT u.user_id, u.full_name, u.avatar_url, us.total_practice_seconds, us.average_score, us.current_streak
             FROM userstats us
             JOIN users u ON us.user_id = u.user_id
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