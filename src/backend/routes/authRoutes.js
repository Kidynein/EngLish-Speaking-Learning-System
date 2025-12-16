const express = require('express');
const router = express.router ? express.Router() : express(); // Fix depending on express version, but usually express.Router()
// Actually Standard is express.Router()
const { check } = require('express-validator');
const authController = require('../controllers/authController');

const routerInstance = express.Router();

routerInstance.post(
    '/register',
    [
        check('fullName', 'Full name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ],
    authController.register
);

routerInstance.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    authController.login
);

routerInstance.post(
    '/forgot-password',
    [
        check('email', 'Please include a valid email').isEmail()
    ],
    authController.forgotPassword
);

routerInstance.post(
    '/reset-password',
    [
        check('token', 'Reset token is required').not().isEmpty(),
        check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
    ],
    authController.resetPassword
);

module.exports = routerInstance;
