const pool = require('../config/database');

class Lesson {
    static _mapToModel(row) {
        if (!row) return null;
        return {
            id: row.lesson_id,
            topicId: row.topic_id,
            title: row.title,
            description: row.description,
            orderIndex: row.order_index,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async getAll(page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query('SELECT * FROM Lessons LIMIT ? OFFSET ?', [limitNum, offset]);
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM Lessons');

        return {
            lessons: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async getByTopic(topicId, page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query(
            'SELECT * FROM Lessons WHERE topic_id = ? LIMIT ? OFFSET ?',
            [topicId, limitNum, offset]
        );
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM Lessons WHERE topic_id = ?',
            [topicId]
        );

        return {
            lessons: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async findById(lessonId) {
        const [rows] = await pool.query('SELECT * FROM Lessons WHERE lesson_id = ?', [lessonId]);
        return this._mapToModel(rows[0]);
    }

    static async create({ topicId, title, description, orderIndex }) {
        const [result] = await pool.query(
            'INSERT INTO Lessons (topic_id, title, description, order_index) VALUES (?, ?, ?, ?)',
            [topicId, title, description, orderIndex]
        );
        return result.insertId;
    }

    static async update(lessonId, data) {
        const allowedFields = {
            title: data.title,
            description: data.description,
            order_index: data.orderIndex
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

        values.push(lessonId);
        const query = `UPDATE Lessons SET ${updates.join(', ')}, updated_at = NOW() WHERE lesson_id = ?`;

        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async delete(lessonId) {
        const [result] = await pool.query('DELETE FROM Lessons WHERE lesson_id = ?', [lessonId]);
        return result.affectedRows > 0;
    }
}

module.exports = Lesson;