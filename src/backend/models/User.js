const pool = require('../config/database');

class User {
    // Helper: Map DB row -> JS Object
    static _mapToModel(row) {
        if (!row) return null;
        return {
            id: row.user_id,
            fullName: row.full_name,
            email: row.email,
            role: row.role,
            avatarUrl: row.avatar_url,
            isActive: true, // TODO: Add is_active column to database
            passwordHash: row.password_hash,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async findById(userId) {
        const [rows] = await pool.query(
            'SELECT user_id, full_name, email, role, avatar_url, created_at, updated_at FROM Users WHERE user_id = ?',
            [userId]
        );
        return this._mapToModel(rows[0]);
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        return this._mapToModel(rows[0]);
    }

    static async getAll(page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        const [rows] = await pool.query(
            'SELECT user_id, full_name, email, role, avatar_url, created_at FROM Users LIMIT ? OFFSET ?',
            [limitNum, offset]
        );
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM Users');

        return {
            users: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    static async getAllFiltered(page = 1, limit = 10, search = '', role = '') {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;

        let query = 'SELECT user_id, full_name, email, role, avatar_url, created_at FROM Users WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM Users WHERE 1=1';
        const params = [];
        const countParams = [];

        if (search) {
            query += ' AND (full_name LIKE ? OR email LIKE ?)';
            countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        if (role) {
            query += ' AND role = ?';
            countQuery += ' AND role = ?';
            params.push(role);
            countParams.push(role);
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [rows] = await pool.query(query, params);
        const [countResult] = await pool.query(countQuery, countParams);

        return {
            users: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    // Input nhận Object để code rõ ràng hơn
    static async create({ fullName, email, passwordHash, role = 'learner', avatarUrl = null }) {
        const [result] = await pool.query(
            'INSERT INTO Users (full_name, email, password_hash, role, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [fullName, email, passwordHash, role, avatarUrl]
        );
        return result.insertId;
    }

    static async update(userId, data) {
        const allowedFields = {
            full_name: data.fullName,
            avatar_url: data.avatarUrl,
            role: data.role
            // is_active: data.isActive // TODO: Add column
        };

        const updates = [];
        const values = [];

        for (const [column, value] of Object.entries(allowedFields)) {
            if (value !== undefined) {
                updates.push(`${column} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return true; // No updates needed is OK

        values.push(userId);
        const query = `UPDATE Users SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = ?`;

        const [result] = await pool.query(query, values);
        // Return true if query executed successfully, even if no rows changed (same values)
        return true;
    }

    static async delete(userId) {
        const [result] = await pool.query('DELETE FROM Users WHERE user_id = ?', [userId]);
        return result.affectedRows > 0;
    }

    static async updatePassword(userId, passwordHash) {
        const [result] = await pool.query(
            'UPDATE Users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
            [passwordHash, userId]
        );
        return result.affectedRows > 0;
    }

    // Password Reset Methods
    static async setResetToken(email, resetToken, expiresAt) {
        const [result] = await pool.query(
            'UPDATE Users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
            [resetToken, expiresAt, email]
        );
        return result.affectedRows > 0;
    }

    static async findByResetToken(resetToken) {
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [resetToken]
        );
        return this._mapToModel(rows[0]);
    }

    static async clearResetToken(userId) {
        const [result] = await pool.query(
            'UPDATE Users SET reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;