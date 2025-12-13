const User = require('../models/User');
const UserStats = require('../models/UserStats');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');

const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 400, 'Validation errors', errors.array());
        }

        const { fullName, email, password } = req.body;

        // Check existing user
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return errorResponse(res, 400, 'Email already registered');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const userId = await User.create({
            fullName,
            email,
            passwordHash,
            role: 'learner' // Default role (enum: learner, admin)
        });

        // Initialize Stats
        await UserStats.create(userId);

        // Generate Token
        const token = generateToken(userId, 'learner');

        const user = await User.findById(userId);

        successResponse(res, 201, 'User registered successfully', {
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        console.error('Register Error:', error);
        errorResponse(res, 500, 'Server error during registration', error.message);
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 400, 'Validation errors', errors.array());
        }

        const { email, password } = req.body;

        // Find user
        // Note: findByEmail returns mapped model which includes passwordHash? 
        // Let's check User.js... It SELECT * so yes.
        // Wait, User.findByEmail maps content. 
        // User.js _mapToModel includes passwordHash: row.password_hash
        // So yes, we have it.

        const [rows] = await require('../config/database').query('SELECT * FROM Users WHERE email = ?', [email]);
        const userRaw = rows[0];

        if (!userRaw) {
            return errorResponse(res, 401, 'Invalid email or password');
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, userRaw.password_hash);
        if (!isMatch) {
            return errorResponse(res, 401, 'Invalid email or password');
        }

        // Generate Token
        const token = generateToken(userRaw.user_id, userRaw.role);

        successResponse(res, 200, 'Login successful', {
            token,
            user: {
                id: userRaw.user_id,
                fullName: userRaw.full_name,
                email: userRaw.email,
                role: userRaw.role,
                avatarUrl: userRaw.avatar_url
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        errorResponse(res, 500, 'Server error during login', error.message);
    }
};
