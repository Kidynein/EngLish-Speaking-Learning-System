const pool = require('../config/database');

class ExerciseAttempt {
    static _mapToModel(row) {
        if (!row) return null;
        return {
            id: row.attempt_id,
            sessionId: row.session_id,
            exerciseId: row.exercise_id,
            userAudioUrl: row.user_audio_url,
            scoreOverall: row.score_overall,
            scorePronunciation: row.score_pronunciation,
            scoreFluency: row.score_fluency,
            scoreConfidence: row.score_confidence,
            aiFeedback: row.ai_feedback_json, // MySQL driver thường tự parse JSON nếu cột type là JSON
            createdAt: row.created_at
        };
    }

    static async getAll(page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query('SELECT * FROM exerciseattempts LIMIT ? OFFSET ?', [limitNum, offset]);
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM exerciseattempts');

        return {
            attempts: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async getBySession(sessionId, page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query(
            'SELECT * FROM exerciseattempts WHERE session_id = ? LIMIT ? OFFSET ?',
            [sessionId, limitNum, offset]
        );
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM exerciseattempts WHERE session_id = ?',
            [sessionId]
        );

        return {
            attempts: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async findById(attemptId) {
        const [rows] = await pool.query('SELECT * FROM exerciseattempts WHERE attempt_id = ?', [attemptId]);
        return this._mapToModel(rows[0]);
    }

    // Nhận object để tránh sai sót vị trí tham số
    static async create({ sessionId, exerciseId, userAudioUrl, scoreOverall, scorePronunciation, scoreFluency, scoreConfidence, aiFeedbackJson }) {
        const [result] = await pool.query(
            `INSERT INTO exerciseattempts 
             (session_id, exercise_id, user_audio_url, score_overall, score_pronunciation, score_fluency, score_confidence, ai_feedback_json) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [sessionId, exerciseId, userAudioUrl, scoreOverall, scorePronunciation, scoreFluency, scoreConfidence, aiFeedbackJson]
        );
        return result.insertId;
    }

    static async update(attemptId, data) {
        const allowedFields = {
            user_audio_url: data.userAudioUrl,
            score_overall: data.scoreOverall,
            score_pronunciation: data.scorePronunciation,
            score_fluency: data.scoreFluency,
            score_confidence: data.scoreConfidence,
            ai_feedback_json: data.aiFeedbackJson
        };

        const updates = [];
        const values = [];

        for (const [column, value] of Object.entries(allowedFields)) {
            if (value !== undefined) {
                updates.push(`${column} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return false;

        values.push(attemptId);
        // Lưu ý: Không update created_at, bảng này thường không có updated_at (log lịch sử)
        const query = `UPDATE exerciseattempts SET ${updates.join(', ')} WHERE attempt_id = ?`;
        
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async getUserStats(userId) {
        const [rows] = await pool.query(
            `SELECT 
                AVG(score_overall) as avg_overall_score,
                AVG(score_pronunciation) as avg_pronunciation,
                AVG(score_fluency) as avg_fluency,
                COUNT(*) as total_attempts
             FROM exerciseattempts ea
             JOIN practicesessions ps ON ea.session_id = ps.session_id
             WHERE ps.user_id = ?`,
            [userId]
        );
        // Trả về raw vì đây là object thống kê tổng hợp, không phải model chuẩn
        return rows[0];
    }
}

module.exports = ExerciseAttempt;