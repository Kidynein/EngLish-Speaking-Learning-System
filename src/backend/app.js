const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Import routes
const topicRoutes = require('./routes/topicRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const practiceSessionRoutes = require('./routes/practiceSessionRoutes');
const exerciseAttemptRoutes = require('./routes/exerciseAttemptRoutes');
const userStatsRoutes = require('./routes/userStatsRoutes');
const userRoutes = require('./routes/userRoutes');
const historyRoutes = require('./routes/historyRoutes');

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

const authRoutes = require('./routes/authRoutes');

// ... (existing imports)

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/exercises', exerciseRoutes)
app.use('/api/lessons', lessonRoutes);
app.use('/api/practice-sessions', practiceSessionRoutes);
app.use('/api/exercise-attempts', exerciseAttemptRoutes);
app.use('/api/user-stats', userStatsRoutes);
app.use('/api/users', userRoutes);
app.use('/api', historyRoutes);
app.use('/api/scoring', require('./routes/scoringRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));

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
