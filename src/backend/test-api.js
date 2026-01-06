const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('\n========================================');
    console.log('🧪 TESTING API ENDPOINTS');
    console.log('========================================\n');

    try {
        // Test 1: Get Topics
        console.log('1️⃣  Testing GET /api/topics...');
        const topicsResponse = await axios.get(`${BASE_URL}/topics`);
        console.log('✅ Status:', topicsResponse.status);
        console.log('📊 Response:', JSON.stringify(topicsResponse.data, null, 2));
        console.log(`   Found ${topicsResponse.data.data?.topics?.length || 0} topics\n`);

        // Test 2: Server health
        console.log('2️⃣  Testing GET / (server health)...');
        const healthResponse = await axios.get('http://localhost:3000/');
        console.log('✅ Status:', healthResponse.status);
        console.log('📊 Response:', healthResponse.data);
        console.log();

        console.log('========================================');
        console.log('✨ ALL API TESTS PASSED!');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ ERROR:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else if (error.request) {
            console.error('   No response received from server');
            console.error('   Make sure server is running on http://localhost:3000');
        } else {
            console.error('   Message:', error.message);
        }
        console.log();
        process.exit(1);
    }
}

testAPI();
