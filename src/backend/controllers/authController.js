const User = require('../models/User');
const UserStats = require('../models/UserStats');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../services/emailService');

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

// Forgot Password - Request password reset
exports.forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 400, 'Validation errors', errors.array());
        }

        const { email } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        
        // Always return success even if user doesn't exist (security best practice)
        if (!user) {
            return successResponse(res, 200, 'If an account exists with that email, a password reset link has been sent');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 3600000);

        // Save hashed token to database
        await User.setResetToken(email, hashedToken, expiresAt);

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        // Send email
        try {
            await sendPasswordResetEmail(email, resetToken, resetUrl);
            successResponse(res, 200, 'Password reset link has been sent to your email');
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Clear the token if email fails
            await User.clearResetToken(user.id);
            return errorResponse(res, 500, 'Failed to send password reset email. Please try again later.');
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        errorResponse(res, 500, 'Server error during password reset request', error.message);
    }
};

// Reset Password - Update password with token
exports.resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 400, 'Validation errors', errors.array());
        }

        const { token, newPassword } = req.body;

        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by valid reset token
        const user = await User.findByResetToken(hashedToken);

        if (!user) {
            return errorResponse(res, 400, 'Invalid or expired reset token');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.updatePassword(user.id, passwordHash);

        // Clear reset token
        await User.clearResetToken(user.id);

        // Send confirmation email
        try {
            await sendPasswordResetConfirmation(user.email);
        } catch (emailError) {
            console.error('Confirmation email failed:', emailError);
            // Don't fail the request if confirmation email fails
        }

        successResponse(res, 200, 'Password has been reset successfully. You can now log in with your new password.');
    } catch (error) {
        console.error('Reset Password Error:', error);
        errorResponse(res, 500, 'Server error during password reset', error.message);
    }
};
