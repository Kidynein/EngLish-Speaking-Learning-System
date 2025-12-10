const UserService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/response');

// Lấy thông tin cá nhân (Profile)
exports.getProfile = async (req, res) => {
    try {
        // req.user.userId lấy từ middleware authenticate
        const userId = req.params.id || req.user.userId;
        const user = await UserService.getProfile(userId);
        
        if (!user) return errorResponse(res, 404, 'User not found');
        
        successResponse(res, 200, 'Profile retrieved', user);
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // User chỉ sửa được của chính mình
        const user = await UserService.updateProfile(userId, req.body);
        
        if (!user) return errorResponse(res, 400, 'Update failed');
        
        successResponse(res, 200, 'Profile updated', user);
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};

// Admin: Lấy danh sách user
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await UserService.getAllUsers(page, limit);
        successResponse(res, 200, 'Users retrieved', result);
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};

// Admin: Xóa user
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await UserService.deleteUser(req.params.id);
        if (deleted) successResponse(res, 200, 'User deleted');
        else errorResponse(res, 404, 'User not found');
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};