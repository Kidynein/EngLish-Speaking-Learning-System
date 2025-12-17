const pool = require('../config/database');

class Progress {
    // 1. Weekly Performance: Average Session Score per Day (Last 7 Days)
    static async getWeeklyPerformance(userId) {
        const [rows] = await pool.query(`
            SELECT 
                DATE(start_time) as date,
                AVG(session_score) as avg_score
            FROM PracticeSessions
            WHERE user_id = ? 
              AND start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(start_time)
            ORDER BY date ASC
        `, [userId]);
        return rows;
    }

    // 2. Topic Performance: Average Score per Topic
    static async getTopicPerformance(userId) {
        const [rows] = await pool.query(`
            SELECT 
                t.name as topic,
                COALESCE(AVG(ps.session_score), 0) as score
            FROM Topics t
            JOIN PracticeSessions ps ON t.topic_id = ps.topic_id
            WHERE ps.user_id = ?
            GROUP BY t.topic_id, t.name
            ORDER BY score DESC
            LIMIT 6
        `, [userId]);
        return rows;
    }

    // 3. User Skills (Radar Chart)
    static async getUserSkills(userId) {
        // Calculate dynamic skills from ExerciseAttempts table
        const [rows] = await pool.query(`
            SELECT 
                COALESCE(AVG(score_pronunciation), 0) as pronunciation,
                COALESCE(AVG(score_fluency), 0) as fluency,
                COALESCE(AVG(score_confidence), 0) as confidence,
                COALESCE(AVG(score_overall), 0) as overall
            FROM ExerciseAttempts ea
            JOIN PracticeSessions ps ON ea.session_id = ps.session_id
            WHERE ps.user_id = ?
        `, [userId]);

        const data = rows[0];

        // Transform to array format for Radar Chart
        return [
            { skill: 'Pronunciation', value: Number(data.pronunciation) },
            { skill: 'Fluency', value: Number(data.fluency) },
            { skill: 'Confidence', value: Number(data.confidence) },
            { skill: 'Overall', value: Number(data.overall) }
        ];
    }

    // 4. Monthly Activity: Minutes & Sessions per Week (Current Month)
    static async getMonthlyActivity(userId) {
        // Group by Week Number of the current year
        const [rows] = await pool.query(`
            SELECT 
                WEEK(start_time, 1) as week_num,
                COUNT(session_id) as sessions,
                SUM(TIMESTAMPDIFF(MINUTE, start_time, COALESCE(end_time, start_time))) as minutes
            FROM PracticeSessions
            WHERE user_id = ?
              -- AND MONTH(start_time) = MONTH(NOW()) -- Relaxed for debugging
              -- AND YEAR(start_time) = YEAR(NOW())
            GROUP BY week_num
            ORDER BY week_num ASC
        `, [userId]);

        return rows;
    }

    // 5. Summary Stats (Top Cards)
    static async getSummaryStats(userId) {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total_sessions,
                COALESCE(AVG(session_score), 0) as avg_score,
                SUM(TIMESTAMPDIFF(MINUTE, start_time, COALESCE(end_time, start_time))) as total_minutes
            FROM PracticeSessions
            WHERE user_id = ?
        `, [userId]);

        return {
            totalSessions: rows[0].total_sessions,
            avgScore: Math.round(rows[0].avg_score),
            totalMinutes: rows[0].total_minutes || 0
            // streak is handled by UserStats model, usually fetched separately or here if needed
        };
    }
}

module.exports = Progress;
