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

    static async getAll(page = 1, limit = 10, isActive = true, userId = null, search = '', level = 'all') {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        let query = `
            SELECT t.*, 
            (
                SELECT COUNT(*) 
                FROM Exercises e 
                JOIN Lessons l ON e.lesson_id = l.lesson_id 
                WHERE l.topic_id = t.topic_id
            ) as total_exercises,
            (
                SELECT COUNT(DISTINCT ea.exercise_id) 
                FROM ExerciseAttempts ea 
                JOIN PracticeSessions ps ON ea.session_id = ps.session_id
                JOIN Exercises e ON ea.exercise_id = e.exercise_id
                JOIN Lessons l ON e.lesson_id = l.lesson_id
                WHERE ps.user_id = ? AND l.topic_id = t.topic_id
            ) as completed_exercises
            FROM Topics t
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM Topics t';
        const params = [userId]; // userId for the subquery
        const countParams = [];

        // Build WHERE clause
        const conditions = [];
        if (isActive !== null) {
            conditions.push('t.is_active = ?');
            params.push(isActive);
            countParams.push(isActive);
        }

        if (search) {
            // Match start of string OR start of word (space before) in NAME only
            conditions.push(`(
                t.name LIKE ? OR t.name LIKE ?
            )`);
            const startParam = `${search}%`;
            const wordParam = `% ${search}%`;
            params.push(startParam, wordParam);
            countParams.push(startParam, wordParam);
        }

        if (level && level !== 'all') {
            conditions.push('t.difficulty_level = ?');
            params.push(level);
            countParams.push(level);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        // Sorting logic: In Progress (1) -> Completed (2) -> Not Started (3)
        // Note: Using aliases in ORDER BY is supported in MySQL
        query += ` ORDER BY 
            CASE 
                WHEN completed_exercises > 0 AND completed_exercises < total_exercises THEN 1 
                WHEN completed_exercises = total_exercises AND total_exercises > 0 THEN 2 
                ELSE 3 
            END ASC, 
            t.topic_id ASC
        `;

        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [rows] = await pool.query(query, params);
        const [countResult] = await pool.query(countQuery, countParams);

        // Map and calculate percentage
        const topics = rows.map(row => {
            const model = this._mapToModel(row);
            // Calculate progress
            const total = row.total_exercises || 0;
            const completed = row.completed_exercises || 0;
            // Avoid division by zero
            model.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            // Debug info (optional, remove in prod)
            model.stats = { total, completed };
            return model;
        });

        return {
            topics,
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