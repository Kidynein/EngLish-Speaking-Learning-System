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
        const search = req.query.search || '';
        const role = req.query.role || '';

        const result = await UserService.getAllUsersFiltered(page, limit, search, role);
        successResponse(res, 200, 'Users retrieved', result);
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};

// Admin: Cập nhật user
exports.updateUser = async (req, res) => {
    try {
        const { fullName, role, isActive } = req.body;
        const user = await UserService.updateUser(req.params.id, { fullName, role, isActive });
        
        if (!user) return errorResponse(res, 400, 'Update failed');
        
        successResponse(res, 200, 'User updated', user);
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};

// Admin: Xóa user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Prevent deleting self
        if (userId == req.user.userId) {
            return errorResponse(res, 400, 'Cannot delete your own account');
        }
        
        const deleted = await UserService.deleteUser(userId);
        if (deleted) successResponse(res, 200, 'User deleted');
        else errorResponse(res, 404, 'User not found');
    } catch (error) {
        errorResponse(res, 500, error.message);
    }
};