const { successResponse, errorResponse } = require('../utils/response');
const pool = require('../config/database');

exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate || '';
        const endDate = req.query.endDate || '';
        const type = req.query.type || '';

        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        let query = `
            SELECT 
                ea.attempt_id as id,
                ea.created_at as date,
                e.content_text as exerciseContent,
                l.title as lessonName,
                t.name as topicName,
                ea.score_overall as score,
                ea.user_audio_url as audioUrl,
                e.type as exerciseType,
                ps.session_score as sessionScore
            FROM ExerciseAttempts ea
            JOIN PracticeSessions ps ON ea.session_id = ps.session_id
            JOIN Exercises e ON ea.exercise_id = e.exercise_id
            JOIN Lessons l ON e.lesson_id = l.lesson_id
            JOIN Topics t ON l.topic_id = t.topic_id
            WHERE ps.user_id = ?
        `;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM ExerciseAttempts ea
            JOIN PracticeSessions ps ON ea.session_id = ps.session_id
            JOIN Exercises e ON ea.exercise_id = e.exercise_id
            WHERE ps.user_id = ?
        `;

        const params = [userId];
        const countParams = [userId];

        if (startDate) {
            query += ' AND ea.created_at >= ?';
            countQuery += ' AND ea.created_at >= ?';
            params.push(startDate);
            countParams.push(startDate);
        }

        if (endDate) {
            query += ' AND ea.created_at <= ?';
            countQuery += ' AND ea.created_at <= ?';
            params.push(endDate + ' 23:59:59');
            countParams.push(endDate + ' 23:59:59');
        }

        if (type) {
            query += ' AND e.type = ?';
            countQuery += ' AND e.type = ?';
            params.push(type);
            countParams.push(type);
        }

        query += ' ORDER BY ea.created_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [rows] = await pool.query(query, params);
        const [countResult] = await pool.query(countQuery, countParams);

        const history = rows.map(row => ({
            id: row.id,
            date: row.date,
            exerciseContent: row.exerciseContent,
            lessonName: row.lessonName,
            topicName: row.topicName,
            score: row.score,
            audioUrl: row.audioUrl,
            exerciseType: row.exerciseType,
            sessionScore: row.sessionScore
        }));

        successResponse(res, 200, 'User history retrieved', {
            history,
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        });
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};