// config/db

// Переконайтеся, що dotenv буде завантажено, якщо файл імпортується напряму
if (process.env.DB_HOST === undefined) {
    require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = mySqlPool;