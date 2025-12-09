const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Import routes
const topicRoutes = require('./routes/topicRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// check
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/topics', topicRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;
