// controllers/request.controller

const RequestModel = require('../models/request.model');
const CommentModel = require('../models/comment.model');

exports.createRequest = async (req, res) => {
    try {
        const { category_id, title, description, budget, priority, city, region } = req.body;

        if (!category_id || !title || !description || !region) {
            return res.status(400).json({
                success: false,
                message: "Категорія, назва, опис та область є обов'язковими полями",
            });
        }

        const requestId = await RequestModel.createRequest({
            category_id,
            requester_id: req.user.id,
            title,
            description,
            budget: budget || null,
            priority: priority || 'Середній',
            city: city || null,
            region
        });

        const request = await RequestModel.getRequestById(requestId);

        res.status(201).json({
            success: true,
            message: "Запит на допомогу успішно створено",
            request
        });
    } catch (error) {
        console.error("Error in create request API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при створенні запиту",
            error: error.message,
        });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const { category_id, status, region } = req.query;

        const filters = {};
        if (category_id) filters.category_id = category_id;
        if (status) filters.status = status;
        if (region) filters.region = region;

        const requests = await RequestModel.getRequests(filters);

        res.status(200).json({
            success: true,
            message: "Список запитів на допомогу",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Error in get requests API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні списку запитів",
            error: error.message,
        });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        if (req.user.role !== 'requester') {
            return res.status(403).json({
                success: false,
                message: "Доступ дозволено тільки користувачам з роллю 'requester'",
            });
        }

        const requests = await RequestModel.getRequests({ requester_id: req.user.id });

        res.status(200).json({
            success: true,
            message: "Мої запити на допомогу",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Error in get my requests API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні списку запитів",
            error: error.message,
        });
    }
};

exports.getAssignedRequests = async (req, res) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({
                success: false,
                message: "Доступ дозволено тільки користувачам з роллю 'volunteer'",
            });
        }

        const requests = await RequestModel.getRequests({ volunteer_id: req.user.id });

        res.status(200).json({
            success: true,
            message: "Мої призначені запити",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Error in get assigned requests API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні списку запитів",
            error: error.message,
        });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await RequestModel.getRequestById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Запит не знайдено",
            });
        }

        const comments = await CommentModel.getCommentsByRequestId(id);

        res.status(200).json({
            success: true,
            message: "Деталі запиту",
            request,
            comments
        });
    } catch (error) {
        console.error("Error in get request by ID API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні деталей запиту",
            error: error.message,
        });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, title, description, budget, priority, city, region } = req.body;

        if (!category_id || !title || !description || !region) {
            return res.status(400).json({
                success: false,
                message: "Категорія, назва, опис та область є обов'язковими полями",
            });
        }

        const existingRequest = await RequestModel.getRequestById(id);
        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: "Запит не знайдено",
            });
        }

        if (existingRequest.requester_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Ви можете редагувати тільки власні запити",
            });
        }

        if (existingRequest.status !== 'Очікує на виконавця') {
            return res.status(400).json({
                success: false,
                message: "Можна редагувати тільки запити зі статусом 'Очікує на виконавця'",
            });
        }

        await RequestModel.updateRequest(id, {
            category_id,
            title,
            description,
            budget: budget || null,
            priority: priority || 'Середній',
            city: city || null,
            region
        });

        const updatedRequest = await RequestModel.getRequestById(id);

        res.status(200).json({
            success: true,
            message: "Запит успішно оновлено",
            request: updatedRequest
        });
    } catch (error) {
        console.error("Error in update request API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при оновленні запиту",
            error: error.message,
        });
    }
};

exports.assignVolunteer = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'volunteer') {
            return res.status(403).json({
                success: false,
                message: "Доступ дозволено тільки користувачам з роллю 'volunteer'",
            });
        }

        const existingRequest = await RequestModel.getRequestById(id);
        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: "Запит не знайдено",
            });
        }

        if (existingRequest.volunteer_id) {
            return res.status(400).json({
                success: false,
                message: "Цей запит вже призначено іншому волонтеру",
            });
        }

        if (existingRequest.status !== 'Очікує на виконавця') {
            return res.status(400).json({
                success: false,
                message: "Можна взяти в роботу тільки запити зі статусом 'Очікує на виконавця'",
            });
        }

        await RequestModel.assignVolunteer(id, req.user.id);

        const updatedRequest = await RequestModel.getRequestById(id);

        res.status(200).json({
            success: true,
            message: "Запит успішно взято в роботу",
            request: updatedRequest
        });
    } catch (error) {
        console.error("Error in assign volunteer API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при призначенні волонтера",
            error: error.message,
        });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Очікує на виконавця', 'В роботі', 'Виконано', 'Скасовано'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Невірний статус. Допустимі значення: 'Очікує на виконавця', 'В роботі', 'Виконано', 'Скасовано'",
            });
        }

        const existingRequest = await RequestModel.getRequestById(id);
        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: "Запит не знайдено",
            });
        }

        if (req.user.role === 'requester') {

            if (existingRequest.requester_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Ви можете змінювати статус тільки власних запитів",
                });
            }

            if (status !== 'Скасовано' && status !== 'Виконано') {
                return res.status(403).json({
                    success: false,
                    message: "Замовники можуть тільки скасувати запит або позначити його як виконаний",
                });
            }
        } else if (req.user.role === 'volunteer') {

            if (existingRequest.volunteer_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Ви можете змінювати статус тільки призначених вам запитів",
                });
            }

            if (status === 'Очікує на виконавця') {
                return res.status(403).json({
                    success: false,
                    message: "Волонтери не можуть змінювати статус на 'Очікує на виконавця'",
                });
            }
        }

        await RequestModel.updateRequestStatus(id, status);

        const updatedRequest = await RequestModel.getRequestById(id);

        res.status(200).json({
            success: true,
            message: "Статус запиту успішно оновлено",
            request: updatedRequest
        });
    } catch (error) {
        console.error("Error in update request status API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при оновленні статусу запиту",
            error: error.message,
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await RequestModel.getCategories();

        res.status(200).json({
            success: true,
            message: "Список категорій",
            categories
        });
    } catch (error) {
        console.error("Error in get categories API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні списку категорій",
            error: error.message,
        });
    }
};