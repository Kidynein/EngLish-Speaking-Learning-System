const Exercise = require('../models/Exercise');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

exports.getAllExercises = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const lessonId = req.query.lessonId || '';
        const type = req.query.type || '';

        const result = await Exercise.getAllFiltered(page, limit, lessonId, type);
        successResponse(res, 200, 'Exercises retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve exercises', error.message);
    }
};


exports.getRandomExercises = async (req, res) => {
    try {
        const result = await Exercise.getRandom(5);
        successResponse(res, 200, 'Random exercises retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve random exercises', error.message);
    }
};

exports.getExercisesByLesson = async (req, res) => {
    try {
        const result = await Exercise.getByLesson(req.params.lessonId, req.query.page, req.query.limit);
        successResponse(res, 200, 'Exercises retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve exercises', error.message);
    }
};

exports.getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) return errorResponse(res, 404, 'Exercise not found');
        successResponse(res, 200, 'Exercise retrieved', exercise);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve exercise', error.message);
    }
};

exports.createExercise = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 400, 'Validation errors', errors.array());

        const { lessonId, contentText, ipaTranscription, referenceAudioUrl, type, orderIndex } = req.body;

        const exerciseId = await Exercise.create({
            lessonId, contentText, ipaTranscription, referenceAudioUrl, type, orderIndex
        });

        const exercise = await Exercise.findById(exerciseId);
        successResponse(res, 201, 'Exercise created successfully', exercise);
    } catch (error) {
        errorResponse(res, 500, 'Failed to create exercise', error.message);
    }
};

exports.updateExercise = async (req, res) => {
    try {
        const { contentText, ipaTranscription, referenceAudioUrl, type, orderIndex } = req.body;

        const updated = await Exercise.update(req.params.id, {
            contentText, ipaTranscription, referenceAudioUrl, type, orderIndex
        });

        if (!updated) return errorResponse(res, 400, 'Update failed or Exercise not found');

        const updatedExercise = await Exercise.findById(req.params.id);
        successResponse(res, 200, 'Exercise updated successfully', updatedExercise);
    } catch (error) {
        errorResponse(res, 500, 'Failed to update exercise', error.message);
    }
};

exports.deleteExercise = async (req, res) => {
    try {
        const deleted = await Exercise.delete(req.params.id);
        if (deleted) successResponse(res, 200, 'Exercise deleted successfully');
        else errorResponse(res, 404, 'Exercise not found');
    } catch (error) {
        errorResponse(res, 500, 'Failed to delete exercise', error.message);
    }
};