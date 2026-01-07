const User = require('../models/User');
const UserStats = require('../models/UserStats');
const bcrypt = require('bcryptjs');

class UserService {
    static async getProfile(userId) {
        const user = await User.findById(userId);
        
        if (!user) {
            return null;
        }
        delete user.passwordHash;

        return user;
    }

    static async updateProfile(userId, data) {
        console.log('[UserService.updateProfile] userId:', userId);
        console.log('[UserService.updateProfile] data:', data);
        
        const updated = await User.update(userId, data);
        console.log('[UserService.updateProfile] updated result:', updated);

        if (!updated) {
            console.log('[UserService.updateProfile] Update returned false');
            return null;
        }

        const user = await User.findById(userId);
        console.log('[UserService.updateProfile] fetched user:', user);
        delete user.passwordHash;
        
        return user;
    }

    static async changePassword(userId, currentPassword, newPassword) {
        // Get user with password hash
        const user = await User.findById(userId);
        if (!user) {
            return false;
        }

        // Get user with password from database
        const userWithPassword = await User.findByEmail(user.email);
        if (!userWithPassword || !userWithPassword.passwordHash) {
            return false;
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);
        if (!isMatch) {
            return false;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        const updated = await User.updatePassword(userId, newPasswordHash);
        return updated;
    }

    static async getAllUsers(page, limit) {
        const result = await User.getAll(page, limit);
        if (result.users && result.users.length > 0) {
            result.users = result.users.map(user => {
                const safeUser = { ...user };
                delete safeUser.passwordHash;
                return safeUser;
            });
        }

        return result;
    }

    static async getAllUsersFiltered(page, limit, search, role) {
        const result = await User.getAllFiltered(page, limit, search, role);
        if (result.users && result.users.length > 0) {
            result.users = result.users.map(user => {
                const safeUser = { ...user };
                delete safeUser.passwordHash;
                return safeUser;
            });
        }

        return result;
    }

    static async updateUser(userId, data) {
        const updated = await User.update(userId, data);
        if (!updated) {
            return null;
        }
        const user = await User.findById(userId);
        delete user.passwordHash;
        return user;
    }

    static async deleteUser(userId) {
        const result = await User.delete(userId);
        return result;
    }

    static async getUserStats(userId) {
        return await UserStats.findByUserId(userId);
    }
}

module.exports = UserService;