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
            passwordHash: row.password_hash,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async findById(userId) {
        const [rows] = await pool.query(
            'SELECT user_id, full_name, email, role, avatar_url, created_at, updated_at FROM users WHERE user_id = ?',
            [userId]
        );
        return this._mapToModel(rows[0]);
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return this._mapToModel(rows[0]);
    }

    static async getAll(page = 1, limit = 10) {
        const limitNum = Number(limit);
        const offset = (Number(page) - 1) * limitNum;
        
        const [rows] = await pool.query(
            'SELECT user_id, full_name, email, role, avatar_url, created_at FROM users LIMIT ? OFFSET ?',
            [limitNum, offset]
        );
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
        
        return {
            users: rows.map(this._mapToModel),
            total: countResult[0].total,
            page: Number(page),
            limit: limitNum
        };
    }

    // Input nhận Object để code rõ ràng hơn
    static async create({ fullName, email, passwordHash, role = 'user', avatarUrl = null }) {
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, passwordHash, role, avatarUrl]
        );
        return result.insertId;
    }

    static async update(userId, data) {
        const allowedFields = {
            full_name: data.fullName,
            avatar_url: data.avatarUrl
        };
        
        const updates = [];
        const values = [];

        for (const [column, value] of Object.entries(allowedFields)) {
            if (value !== undefined) {
                updates.push(`${column} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return false;

        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = ?`;
        
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async delete(userId) {
        const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
        return result.affectedRows > 0;
    }

    static async updatePassword(userId, passwordHash) {
        const [result] = await pool.query(
            'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
            [passwordHash, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;