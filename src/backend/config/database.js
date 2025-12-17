const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');


const envPath = path.resolve(__dirname, './test.env');
dotenv.config({ path: envPath });


console.log("------- CHECK CONNECTION CONFIG -------");
console.log("1. Đang đọc file .env tại:", envPath);
console.log("2. DB_HOST đọc được là:", process.env.DB_HOST); // Nếu cái này hiện undefined là lỗi
console.log("3. DB_PORT đọc được là:", process.env.DB_PORT);
console.log("---------------------------------------");

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'elsa_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();