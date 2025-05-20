// controllers/comment.controller

const CommentModel = require('../models/comment.model');
const RequestModel = require('../models/request.model');

exports.addComment = async (req, res) => {
    try {
        const { request_id } = req.params;
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Текст коментаря не може бути порожнім",
            });
        }

        const existingRequest = await RequestModel.getRequestById(request_id);
        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: "Запит не знайдено",
            });
        }

        if (
            (req.user.role === 'requester' && existingRequest.requester_id !== req.user.id) ||
            (req.user.role === 'volunteer' && existingRequest.volunteer_id !== req.user.id && existingRequest.status !== "Очікує на виконавця")
        ) {
            return res.status(403).json({
                success: false,
                message: "Ви не маєте дозволу додавати коментарі до цього запиту",
            });
        }

        const commentId = await CommentModel.createComment({
            request_id,
            user_id: req.user.id,
            text
        });

        const comments = await CommentModel.getCommentsByRequestId(request_id);

        res.status(201).json({
            success: true,
            message: "Коментар успішно додано",
            comments
        });
    } catch (error) {
        console.error("Error in add comment API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при додаванні коментаря",
            error: error.message,
        });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { request_id } = req.params;

        const existingRequest = await RequestModel.getRequestById(request_id);
        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: "Запит не знайдено",
            });
        }

        const comments = await CommentModel.getCommentsByRequestId(request_id);

        res.status(200).json({
            success: true,
            message: "Коментарі до запиту",
            comments
        });
    } catch (error) {
        console.error("Error in get comments API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні коментарів",
            error: error.message,
        });
    }
};