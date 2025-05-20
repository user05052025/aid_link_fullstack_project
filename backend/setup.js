// setup.js
// Скрипт для створення бази даних та наповнення її фіктивними даними

// Додаємо dotenv на початку файлу
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Конфігурація для підключення до MySQL (без вказання бази даних)
const initialConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
};

// Повна конфігурація з базою даних
const dbConfig = {
    ...initialConfig,
    database: process.env.DB_NAME
};

async function setupDatabase() {
    let connection;

    try {
        // Підключення до MySQL без вказання бази даних
        connection = await mysql.createConnection(initialConfig);
        console.log('Connected to MySQL server');

        // Створення бази даних
        console.log(`Creating database if not exists... (${process.env.DB_NAME})`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Створення таблиць
        console.log('Creating tables...');
        const schemaScript = fs.readFileSync(
            path.join(__dirname, 'database.schema.sql'),
            'utf8'
        );
        await connection.query(schemaScript);
        console.log('Tables created successfully');

        // Наповнення даними
        console.log('Populating database with sample data...');
        const dataScript = fs.readFileSync(
            path.join(__dirname, 'fictitious_data.sql'),
            'utf8'
        );
        await connection.query(dataScript);
        console.log('Sample data inserted successfully');

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

setupDatabase();