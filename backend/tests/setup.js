// tests/setup.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Create or recreate test database
const setupTestDB = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '1234567890',
    });

    try {
        // First drop the database if it exists
        await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);

        // Then create a fresh database
        await connection.query(`CREATE DATABASE ${process.env.DB_NAME}`);

        console.log('Test database created successfully');
    } catch (error) {
        console.error('Error setting up test database:', error);
        process.exit(1); // Exit with error code instead of throwing
    } finally {
        await connection.end();
    }
};

// Before all tests
global.beforeAll(async () => {
    try {
        await setupTestDB();
    } catch (error) {
        console.error('Failed to set up test environment:', error);
        process.exit(1);
    }
});

// After all tests
global.afterAll(async () => {
    // Clean up resources if needed
});