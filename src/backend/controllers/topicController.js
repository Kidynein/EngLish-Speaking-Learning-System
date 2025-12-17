const Topic = require('../models/Topic');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

exports.getAllTopics = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const isActive = req.query.isActive === 'true' ? true : (req.query.isActive === 'false' ? false : null);

        const search = req.query.search || '';
        const level = req.query.level || 'all';

        // Get userId from authenticated user (required for progress calculation)
        const userId = req.user?.userId || null;

        if (!userId) {
            console.warn('[topicController] No userId found - progress will show 0% for all topics');
        }

        const result = await Topic.getAll(page, limit, isActive, userId, search, level);
        successResponse(res, 200, 'Topics retrieved', result);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve topics', error.message);
    }
};

exports.getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return errorResponse(res, 404, 'Topic not found');
        successResponse(res, 200, 'Topic retrieved', topic);
    } catch (error) {
        errorResponse(res, 500, 'Failed to retrieve topic', error.message);
    }
};

exports.createTopic = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 400, 'Validation errors', errors.array());

        // Destructuring để truyền object vào Model
        const { name, description, thumbnailUrl, difficultyLevel } = req.body;

        const topicId = await Topic.create({ name, description, thumbnailUrl, difficultyLevel });
        const topic = await Topic.findById(topicId);

        successResponse(res, 201, 'Topic created successfully', topic);
    } catch (error) {
        errorResponse(res, 500, 'Failed to create topic', error.message);
    }
};

exports.updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, thumbnailUrl, difficultyLevel, isActive } = req.body;

        const updated = await Topic.update(id, { name, description, thumbnailUrl, difficultyLevel, isActive });

        if (!updated) return errorResponse(res, 400, 'No valid fields to update or Topic not found');

        const updatedTopic = await Topic.findById(id);
        successResponse(res, 200, 'Topic updated successfully', updatedTopic);
    } catch (error) {
        errorResponse(res, 500, 'Failed to update topic', error.message);
    }
};

exports.deleteTopic = async (req, res) => {
    try {
        const deleted = await Topic.delete(req.params.id);
        if (deleted) successResponse(res, 200, 'Topic deleted successfully');
        else errorResponse(res, 404, 'Topic not found');
    } catch (error) {
        errorResponse(res, 500, 'Failed to delete topic', error.message);
    }
};