const pool = require('../config/database');

class Exercise {
    // Helper để format dữ liệu trả về (tùy chọn, giúp code JS sạch hơn)
    static _mapToModel(row) {
        if (!row) return null;
        return {
            id: row.exercise_id,
            lessonId: row.lesson_id,
            contentText: row.content_text,
            ipaTranscription: row.ipa_transcription,
            referenceAudioUrl: row.reference_audio_url,
            type: row.type,
            orderIndex: row.order_index,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async getAll(page = 1, limit = 10) {
        // Ép kiểu số để tránh lỗi SQL nếu input là string
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        // Dùng pool.query trực tiếp
        const [rows] = await pool.query(
            'SELECT * FROM Exercises LIMIT ? OFFSET ?',
            [limitNum, offset]
        );
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM Exercises');

        return {
            exercises: rows, // Có thể bọc rows.map(this._mapToModel) nếu muốn
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async getAllFiltered(page = 1, limit = 10, lessonId = '', type = '') {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        let query = 'SELECT * FROM Exercises WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM Exercises WHERE 1=1';
        const params = [];
        const countParams = [];

        if (lessonId) {
            query += ' AND lesson_id = ?';
            countQuery += ' AND lesson_id = ?';
            params.push(lessonId);
            countParams.push(lessonId);
        }

        if (type) {
            query += ' AND type = ?';
            countQuery += ' AND type = ?';
            params.push(type);
            countParams.push(type);
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [rows] = await pool.query(query, params);
        const [countResult] = await pool.query(countQuery, countParams);

        return {
            exercises: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async getByLesson(lessonId, page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query(
            'SELECT * FROM Exercises WHERE lesson_id = ? LIMIT ? OFFSET ?',
            [lessonId, limitNum, offset]
        );
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM Exercises WHERE lesson_id = ?',
            [lessonId]
        );

        return {
            exercises: rows,
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async findById(exerciseId) {
        const [rows] = await pool.query(
            'SELECT * FROM Exercises WHERE exercise_id = ?',
            [exerciseId]
        );
        return rows[0] || null; // Trả về null nếu không tìm thấy thay vì undefined
    }

    static async create(data) {
        // Nhận vào object data thay vì liệt kê từng tham số (Clean Code)
        const { lessonId, contentText, ipaTranscription, referenceAudioUrl, type, orderIndex } = data;

        const [result] = await pool.query(
            'INSERT INTO Exercises (lesson_id, content_text, ipa_transcription, reference_audio_url, type, order_index) VALUES (?, ?, ?, ?, ?, ?)',
            [lessonId, contentText, ipaTranscription, referenceAudioUrl, type, orderIndex]
        );
        return result.insertId;
    }

    static async update(exerciseId, data) {
        const allowedFields = {
            content_text: data.contentText,
            ipa_transcription: data.ipaTranscription,
            reference_audio_url: data.referenceAudioUrl,
            type: data.type,
            order_index: data.orderIndex
        };

        const updates = [];
        const values = [];

        for (const [column, value] of Object.entries(allowedFields)) {
            if (value !== undefined) { // Chỉ update những trường có giá trị truyền vào
                updates.push(`${column} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return false;

        values.push(exerciseId);
        const query = `UPDATE Exercises SET ${updates.join(', ')}, updated_at = NOW() WHERE exercise_id = ?`;

        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async delete(exerciseId) {
        const [result] = await pool.query('DELETE FROM Exercises WHERE exercise_id = ?', [exerciseId]);
        return result.affectedRows > 0;
    }
}

module.exports = Exercise;