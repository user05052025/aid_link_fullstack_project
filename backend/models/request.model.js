// models/request.model

const db = require("../config/db");

const createCategoriesTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `);
        console.log("Categories table created or already exists");

        const categories = ['Продукти', 'Ліки', 'Одяг', 'Засоби гігієни', 'Побутові товари', 'Інше'];
        for (const category of categories) {
            await db.query("INSERT IGNORE INTO categories (name) VALUES (?)", [category]);
        }

    } catch (error) {
        console.error("Error creating categories table:", error);
        throw error;
    }
};

const createRequestsTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS aid_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        requester_id INT NOT NULL,
        volunteer_id INT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        budget DECIMAL(10,2),
        priority ENUM('Низький', 'Середній', 'Високий') NOT NULL DEFAULT 'Середній',
        city VARCHAR(100),
        region VARCHAR(100) NOT NULL,
        status ENUM('Очікує на виконавця', 'В роботі', 'Виконано', 'Скасовано') NOT NULL DEFAULT 'Очікує на виконавця',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (requester_id) REFERENCES users(id),
        FOREIGN KEY (volunteer_id) REFERENCES users(id)
      )
    `);
        console.log("Aid requests table created or already exists");
    } catch (error) {
        console.error("Error creating aid requests table:", error);
        throw error;
    }
};

const createRequest = async (requestData) => {
    try {
        const { category_id, requester_id, title, description, budget, priority, city, region } = requestData;

        const [result] = await db.query(
            `INSERT INTO aid_requests (category_id, requester_id, title, description, budget, priority, city, region) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, requester_id, title, description, budget, priority, city, region]
        );

        return result.insertId;
    } catch (error) {
        console.error("Error creating aid request:", error);
        throw error;
    }
};

const getRequests = async (filters = {}) => {
    try {
        let query = `
      SELECT ar.*, c.name as category_name, 
      u_req.name as requester_name, 
      u_vol.name as volunteer_name
      FROM aid_requests ar
      JOIN categories c ON ar.category_id = c.id
      JOIN users u_req ON ar.requester_id = u_req.id
      LEFT JOIN users u_vol ON ar.volunteer_id = u_vol.id
      WHERE 1=1
    `;

        const queryParams = [];

        if (filters.category_id) {
            query += " AND ar.category_id = ?";
            queryParams.push(filters.category_id);
        }

        if (filters.status) {
            query += " AND ar.status = ?";
            queryParams.push(filters.status);
        }

        if (filters.region) {
            query += " AND ar.region = ?";
            queryParams.push(filters.region);
        }

        if (filters.requester_id) {
            query += " AND ar.requester_id = ?";
            queryParams.push(filters.requester_id);
        }

        if (filters.volunteer_id) {
            query += " AND ar.volunteer_id = ?";
            queryParams.push(filters.volunteer_id);
        }

        query += " ORDER BY ar.created_at DESC";

        const [rows] = await db.query(query, queryParams);
        return rows;
    } catch (error) {
        console.error("Error getting aid requests:", error);
        throw error;
    }
};

const getRequestById = async (id) => {
    try {
        const [rows] = await db.query(
            `SELECT ar.*, c.name as category_name, 
       u_req.name as requester_name, u_req.email as requester_email,
       u_vol.name as volunteer_name, u_vol.email as volunteer_email
       FROM aid_requests ar
       JOIN categories c ON ar.category_id = c.id
       JOIN users u_req ON ar.requester_id = u_req.id
       LEFT JOIN users u_vol ON ar.volunteer_id = u_vol.id
       WHERE ar.id = ?`,
            [id]
        );
        return rows[0];
    } catch (error) {
        console.error("Error getting aid request by ID:", error);
        throw error;
    }
};

const updateRequest = async (id, requestData) => {
    try {
        const { category_id, title, description, budget, priority, city, region } = requestData;

        const [result] = await db.query(
            `UPDATE aid_requests SET 
       category_id = ?, title = ?, description = ?, budget = ?, 
       priority = ?, city = ?, region = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [category_id, title, description, budget, priority, city, region, id]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating aid request:", error);
        throw error;
    }
};

const assignVolunteer = async (requestId, volunteerId) => {
    try {
        const [result] = await db.query(
            `UPDATE aid_requests SET 
       volunteer_id = ?, status = 'В роботі', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'Очікує на виконавця'`,
            [volunteerId, requestId]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error assigning volunteer to request:", error);
        throw error;
    }
};

const updateRequestStatus = async (id, status) => {
    try {
        const [result] = await db.query(
            `UPDATE aid_requests SET 
       status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [status, id]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating aid request status:", error);
        throw error;
    }
};

const getCategories = async () => {
    try {
        const [rows] = await db.query("SELECT * FROM categories");
        return rows;
    } catch (error) {
        console.error("Error getting categories:", error);
        throw error;
    }
};

module.exports = {
    createCategoriesTable,
    createRequestsTable,
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    assignVolunteer,
    updateRequestStatus,
    getCategories
};