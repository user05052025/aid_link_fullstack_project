// models/user.model

const db = require("../config/db");
const bcrypt = require("bcrypt");

const createUserTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        region VARCHAR(100),
        role ENUM('requester', 'volunteer') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log("Users table created or already exists");
    } catch (error) {
        console.error("Error creating users table:", error);
        throw error;
    }
};

const createUser = async (userData) => {
    try {
        const { name, email, password, phone, address, city, region, role } = userData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users (name, email, password, phone, address, city, region, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, phone, address, city, region, role]
        );

        return result.insertId;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

const findUserByEmail = async (email) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        return rows[0];
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
};

const findUserById = async (id) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, phone, address, city, region, role, created_at, updated_at FROM users WHERE id = ?",
            [id]
        );
        return rows[0];
    } catch (error) {
        console.error("Error finding user by ID:", error);
        throw error;
    }
};

const updateUser = async (id, userData) => {
    try {
        const { name, phone, address, city, region } = userData;

        const [result] = await db.query(
            `UPDATE users SET name = ?, phone = ?, address = ?, city = ?, region = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [name, phone, address, city, region, id]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

const comparePassword = async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
    createUserTable,
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    comparePassword
};