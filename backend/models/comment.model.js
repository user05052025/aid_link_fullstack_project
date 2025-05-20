// models/comment.model

const db = require("../config/db");

const createCommentsTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        user_id INT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES aid_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        console.log("Comments table created or already exists");
    } catch (error) {
        console.error("Error creating comments table:", error);
        throw error;
    }
};

const createComment = async (commentData) => {
    try {
        const { request_id, user_id, text } = commentData;

        const [result] = await db.query(
            `INSERT INTO comments (request_id, user_id, text) 
       VALUES (?, ?, ?)`,
            [request_id, user_id, text]
        );

        return result.insertId;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

const getCommentsByRequestId = async (requestId) => {
    try {
        const [rows] = await db.query(
            `SELECT c.*, u.name as user_name, u.role as user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.request_id = ?
       ORDER BY c.created_at ASC`,
            [requestId]
        );
        return rows;
    } catch (error) {
        console.error("Error getting comments:", error);
        throw error;
    }
};

module.exports = {
    createCommentsTable,
    createComment,
    getCommentsByRequestId
};