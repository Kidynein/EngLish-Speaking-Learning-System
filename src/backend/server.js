require('dotenv').config();
const app = require('./app');
const Subscription = require('./models/Subscription');

// Initialize database tables
const initializeTables = async () => {
    try {
        await Subscription.ensureTable();
        console.log('Database tables initialized');
    } catch (error) {
        console.error('Failed to initialize tables:', error.message);
    }
};

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(PORT, HOST, async () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);

    // Initialize tables after server starts
    await initializeTables();

    console.log(`API Documentation:`);
    console.log(`   - Auth: POST /api/auth/register, /api/auth/login`);
    console.log(`   - Topics: GET /api/topics, POST /api/topics (admin)`);
    console.log(`   - Lessons: GET /api/lessons, POST /api/lessons (admin)`);
    console.log(`   - Exercises: GET /api/exercises, POST /api/exercises (admin)`);
    console.log(`   - Practice Sessions: POST /api/practice-sessions`);
    console.log(`   - Exercise Attempts: POST /api/exercise-attempts`);
    console.log(`   - User Stats: GET /api/user-stats`);
    console.log(`   - Premium: GET /api/premium/subscription, POST /api/premium/upgrade, /cancel`);
});