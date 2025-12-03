const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Cấu hình kết nối đến MySQL 
const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12810491',      
    password: 'NEhkdMpZTL',     
    database: 'sql12810491' 
});

// 2. Kiểm tra kết nối
db.connect((err) => {
    if (err) {
        console.error('❌ Kết nối Database thất bại:', err.message);
        return;
    }
    console.log('✅ Đã kết nối thành công đến MySQL Database!');
});

// 3. Lấy danh sách Users
app.get('/api/users', (req, res) => {
    const sql = "SELECT * FROM Users";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        return res.json(results);
    });
});

// 4. Chạy server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy `);
});