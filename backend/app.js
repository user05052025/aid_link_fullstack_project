// app

// Додаємо dotenv на початку файлу
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mySqlPool = require('./config/db');
const UserModel = require('./models/user.model');
const RequestModel = require('./models/request.model');
const CommentModel = require('./models/comment.model');

// Create Express app
const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Middleware для обробки нестандартних HTTP-методів
app.use((req, res, next) => {
    const methodOverride = req.headers['x-http-method-override'];
    if (methodOverride && req.method === 'POST') {
        req.method = methodOverride.toUpperCase();
    }
    next();
});

// Routes
app.use('/api/v1', require('./routes/index'));

// Test route
app.get('/test', (req, res) => {
    res.status(200).send('<h1>Humanitarian Aid Coordination System API</h1>');
});

// Обробка нестандартних маршрутів і методів
app.all('*', (req, res, next) => {
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
        return res.status(405).json({
            success: false,
            message: `Метод ${req.method} не підтримується`
        });
    }
    next();
});

const initializeDB = async () => {
    try {
        await UserModel.createUserTable();
        await RequestModel.createCategoriesTable();
        await RequestModel.createRequestsTable();
        await CommentModel.createCommentsTable();

        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
        throw error;
    }
};

// Port
const PORT = process.env.PORT || 8080;

mySqlPool.query('SELECT 1')
    .then(async () => {
        console.log('MySQL Database connected!');

        await initializeDB();

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection error:', error);
    });

module.exports = app;