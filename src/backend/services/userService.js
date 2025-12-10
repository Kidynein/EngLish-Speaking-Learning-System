const User = require('../models/User');
const UserStats = require('../models/UserStats');

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
        const updated = await User.update(userId, data);

        if (!updated) {
            return null;
        }

        const user = await User.findById(userId);
        delete user.passwordHash;
        
        return user;
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

    static async deleteUser(userId) {
        const result = await User.delete(userId);
        return result;
    }
    static async getUserStats(userId) {
        return await UserStats.findByUserId(userId);
    }
}

module.exports = UserService;