const Lesson = require('../models/Lesson');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

exports.getAllLessons = async (req, res) => {
    try {
        const result = await Lesson.getAll(req.query.page, req.query.limit);
        successResponse(res, 200, 'Lessons retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve lessons', error.message);
    }
};

exports.getLessonsByTopic = async (req, res) => {
    try {
        const result = await Lesson.getByTopic(req.params.topicId, req.query.page, req.query.limit);
        successResponse(res, 200, 'Lessons retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve lessons', error.message);
    }
};

exports.getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return errorResponse(res, 404, 'Lesson not found');
        successResponse(res, 200, 'Lesson retrieved', lesson);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve lesson', error.message);
    }
};

exports.createLesson = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 400, 'Validation errors', errors.array());

        const { topicId, title, description, orderIndex } = req.body;

        const lessonId = await Lesson.create({ topicId, title, description, orderIndex });
        const lesson = await Lesson.findById(lessonId);

        successResponse(res, 201, 'Lesson created successfully', lesson);
    } catch (error) {
        errorResponse(res, 500, 'Failed to create lesson', error.message);
    }
};

exports.updateLesson = async (req, res) => {
    try {
        const { title, description, orderIndex } = req.body;
        
        const updated = await Lesson.update(req.params.id, { title, description, orderIndex });
        
        if (!updated) return errorResponse(res, 400, 'Update failed or Lesson not found');

        const updatedLesson = await Lesson.findById(req.params.id);
        successResponse(res, 200, 'Lesson updated successfully', updatedLesson);
    } catch (error) {
        errorResponse(res, 500, 'Failed to update lesson', error.message);
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const deleted = await Lesson.delete(req.params.id);
        if (deleted) successResponse(res, 200, 'Lesson deleted successfully');
        else errorResponse(res, 404, 'Lesson not found');
    } catch (error) {
        errorResponse(res, 500, 'Failed to delete lesson', error.message);
    }
};