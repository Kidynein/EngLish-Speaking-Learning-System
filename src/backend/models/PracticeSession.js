const pool = require('../config/database');

class PracticeSession {
    static _mapToModel(row) {
        if (!row) return null;
        return {
            id: row.session_id,
            userId: row.user_id,
            topicId: row.topic_id,
            sessionScore: row.session_score,
            startTime: row.start_time,
            endTime: row.end_time
        };
    }

    static async getAll(page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query('SELECT * FROM PracticeSessions LIMIT ? OFFSET ?', [limitNum, offset]);
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM PracticeSessions');

        return {
            sessions: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async getByUserId(userId, page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query(
            'SELECT * FROM PracticeSessions WHERE user_id = ? ORDER BY start_time DESC LIMIT ? OFFSET ?',
            [userId, limitNum, offset]
        );
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM PracticeSessions WHERE user_id = ?',
            [userId]
        );

        return {
            sessions: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async findById(sessionId) {
        const [rows] = await pool.query('SELECT * FROM PracticeSessions WHERE session_id = ?', [sessionId]);
        return this._mapToModel(rows[0]);
    }

    static async create(userId, topicId) {
        const [result] = await pool.query(
            'INSERT INTO PracticeSessions (user_id, topic_id, session_score, start_time) VALUES (?, ?, 0, NOW())',
            [userId, topicId]
        );
        return result.insertId;
    }

    static async update(sessionId, data) {
        const allowedFields = {
            session_score: data.sessionScore,
            end_time: data.endTime
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

        values.push(sessionId);
        const query = `UPDATE PracticeSessions SET ${updates.join(', ')} WHERE session_id = ?`;

        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async endSession(sessionId, sessionScore) {
        const [result] = await pool.query(
            'UPDATE PracticeSessions SET session_score = ?, end_time = NOW() WHERE session_id = ?',
            [sessionScore, sessionId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = PracticeSession;