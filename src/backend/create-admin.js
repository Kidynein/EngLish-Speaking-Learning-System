const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load env properly
const envPath = path.resolve(__dirname, './config/test.env');
dotenv.config({ path: envPath });

async function createAdminUser() {
    console.log('🚀 Creating Admin User...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const password = 'admin'; // You can change this
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const email = 'admin@example.com';
        const fullName = 'Admin User';

        // Check if user exists
        const [rows] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);

        let userId;

        if (rows.length > 0) {
            console.log('User already exists, updating password...');
            userId = rows[0].user_id;
            await connection.query('UPDATE Users SET password_hash = ? WHERE user_id = ?', [passwordHash, userId]);
        } else {
            console.log('Creating new user...');
            const [result] = await connection.query(
                'INSERT INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [fullName, email, passwordHash, 'admin']
            );
            userId = result.insertId;
        }

        console.log('✅ User setup complete!');
        console.log('User ID:', userId);
        console.log('Email:', email);
        console.log('Password:', password);

        // Setup stats
        const [stats] = await connection.query('SELECT * FROM UserStats WHERE user_id = ?', [userId]);
        if (stats.length === 0) {
            await connection.query('INSERT INTO UserStats (user_id) VALUES (?)', [userId]);
            console.log('✅ User stats initialized.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

createAdminUser();
