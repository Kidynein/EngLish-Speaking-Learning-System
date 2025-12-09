const pool = require('../config/database');

class Topic {
    static _mapToModel(row) {
        if (!row) return null;
        return {
            id: row.topic_id,
            name: row.name,
            description: row.description,
            thumbnailUrl: row.thumbnail_url,
            difficultyLevel: row.difficulty_level,
            isActive: Boolean(row.is_active), // Ép kiểu boolean cho chắc chắn
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async getAll(page = 1, limit = 10, isActive = true) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;
        
        let query = 'SELECT * FROM Topics';
        let countQuery = 'SELECT COUNT(*) as total FROM Topics';
        const params = [];
        const countParams = [];

        if (isActive !== null) {
            query += ' WHERE is_active = ?';
            countQuery += ' WHERE is_active = ?';
            params.push(isActive);
            countParams.push(isActive);
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [rows] = await pool.query(query, params);
        const [countResult] = await pool.query(countQuery, countParams);

        return {
            topics: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async findById(topicId) {
        const [rows] = await pool.query('SELECT * FROM Topics WHERE topic_id = ?', [topicId]);
        return this._mapToModel(rows[0]);
    }

    static async create({ name, description, thumbnailUrl, difficultyLevel }) {
        const [result] = await pool.query(
            'INSERT INTO Topics (name, description, thumbnail_url, difficulty_level, is_active) VALUES (?, ?, ?, ?, ?)',
            [name, description, thumbnailUrl, difficultyLevel, true]
        );
        return result.insertId;
    }

    static async update(topicId, data) {
        const allowedFields = {
            name: data.name,
            description: data.description,
            thumbnail_url: data.thumbnailUrl,
            difficulty_level: data.difficultyLevel,
            is_active: data.isActive
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

        values.push(topicId);
        const query = `UPDATE Topics SET ${updates.join(', ')}, updated_at = NOW() WHERE Topic_id = ?`;
        
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async delete(topicId) {
        const [result] = await pool.query('DELETE FROM Topics WHERE topic_id = ?', [topicId]);
        return result.affectedRows > 0;
    }
}

module.exports = Topic;