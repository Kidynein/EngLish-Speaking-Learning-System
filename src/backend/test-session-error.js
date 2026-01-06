const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000/api';
const SECRET_KEY = 'your-secret-key-change-in-production'; // From test.env

async function testSessionError() {
    console.log('\n========================================');
    console.log('🧪 TESTING SESSION CREATION ERROR');
    console.log('========================================\n');

    try {
        // Step 1: Create a token for a non-existent user (ID: 99999)
        console.log('1️⃣  Creating token for non-existent user ID 99999...');
        const token = jwt.sign(
            { userId: 99999, role: 'user', email: 'ghost@example.com' },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        console.log('   Token created.\n');

        // Step 2: Try to start a session
        console.log('2️⃣  Attempting to start session...');

        // Need a valid topic ID first
        const topicId = 1; // Assuming topic 1 exists from setup script

        await axios.post(
            `${BASE_URL}/practice-sessions`,
            { topicId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('❌ Unexpected Success: Session started for non-existent user!');

    } catch (error) {
        console.log('✅ Error caught as expected:');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data.message);
            console.log('   Error Detail:', error.response.data.error);
        } else {
            console.log('   Error:', error.message);
        }
    }

    // Step 3: Test with valid user (ID: 1)
    try {
        console.log('\n3️⃣  Testing with valid user ID 1...');
        const validToken = jwt.sign(
            { userId: 1, role: 'admin', email: 'admin@example.com' },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        const response = await axios.post(
            `${BASE_URL}/practice-sessions`,
            { topicId: 1 },
            { headers: { Authorization: `Bearer ${validToken}` } }
        );

        console.log('✅ Success: Session started for valid user!');
        console.log('   Session ID:', response.data.data.id);

    } catch (error) {
        console.log('❌ Failed with valid user:');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data.message);
            console.log('   Error Detail:', error.response.data.error);
        } else {
            console.log('   Error:', error.message);
        }
    }
}

testSessionError();
