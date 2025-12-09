require('dotenv').config();
const app = require('./app');

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Documentation:`);
    console.log(`   - Auth: POST /api/auth/register, /api/auth/login`);
    console.log(`   - Topics: GET /api/topics, POST /api/topics (admin)`);
    console.log(`   - Lessons: GET /api/lessons, POST /api/lessons (admin)`);
    console.log(`   - Exercises: GET /api/exercises, POST /api/exercises (admin)`);
    console.log(`   - Practice Sessions: POST /api/practice-sessions`);
    console.log(`   - Exercise Attempts: POST /api/exercise-attempts`);
    console.log(`   - User Stats: GET /api/user-stats`);
});