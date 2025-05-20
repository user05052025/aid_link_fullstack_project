// routes/index

const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/auth.controller');
const requestController = require('../controllers/request.controller');
const commentController = require('../controllers/comment.controller');

// Import middlewares
const { authenticateUser, isRequester, isVolunteer } = require('../middlewares/auth.middleware');

// Import validators
const { registerValidator, loginValidator, updateProfileValidator } = require('../validators/auth.validator');

// Auth routes
router.post('/auth/register', registerValidator, authController.register);
router.post('/auth/login', loginValidator, authController.login);
router.get('/auth/profile', authenticateUser, authController.getProfile);
router.put('/auth/profile', authenticateUser, updateProfileValidator, authController.updateProfile);
router.all('/auth/*', (req, res) => {
    res.status(405).json({
        success: false,
        message: `Метод ${req.method} не підтримується для цього маршруту`
    });
});

// Category routes
router.get('/categories', requestController.getCategories);
router.all('/categories', (req, res) => {
    res.status(405).json({
        success: false,
        message: `Метод ${req.method} не підтримується для цього маршруту`
    });
});

// Request routes
router.post('/requests', authenticateUser, isRequester, requestController.createRequest);
router.get('/requests', requestController.getRequests);
router.get('/requests/:id', requestController.getRequestById);
router.put('/requests/:id', authenticateUser, isRequester, requestController.updateRequest);
router.put('/requests/:id/assign', authenticateUser, isVolunteer, requestController.assignVolunteer);
router.put('/requests/:id/status', authenticateUser, requestController.updateRequestStatus);
router.get('/myrequests', authenticateUser, isRequester, requestController.getMyRequests);
router.get('/assignedrequests', authenticateUser, isVolunteer, requestController.getAssignedRequests);

// Обробка PATCH-методу для часткового оновлення запиту
router.patch('/requests/:id', authenticateUser, isRequester, (req, res) => {
    // Переадресуємо на PUT-маршрут для повного оновлення
    requestController.updateRequest(req, res);
});

// Comment routes
router.post('/requests/:request_id/comments', authenticateUser, commentController.addComment);
router.get('/requests/:request_id/comments', commentController.getComments);

// Загальна обробка нестандартних маршрутів
router.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не знайдено'
    });
});

module.exports = router;