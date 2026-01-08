const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
if (process.env.NODE_ENV === 'production') {
    dotenv.config();
} else {
    const envPath = path.resolve(__dirname, './test.env');
    dotenv.config({ path: envPath });
}

console.log("------- CHECK CONNECTION CONFIG -------");
console.log("1. NODE_ENV:", process.env.NODE_ENV);
console.log("2. DB_HOST:", process.env.DB_HOST);
console.log("3. DB_PORT:", process.env.DB_PORT);
console.log("---------------------------------------");

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'elsa_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Add SSL config for production
if (process.env.NODE_ENV === 'production') {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
    console.log("✅ SSL enabled for production database");
}

const pool = mysql.createPool(poolConfig);

module.exports = pool.promise();