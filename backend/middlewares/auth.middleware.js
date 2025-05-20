// middlewares/auth.middleware

const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Необхідна авторизація"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await UserModel.findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Користувача не знайдено"
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Невірний токен авторизації"
        });
    }
};

exports.isRequester = (req, res, next) => {
    if (req.user.role !== 'requester') {
        return res.status(403).json({
            success: false,
            message: "Доступ дозволено тільки користувачам з роллю 'requester'"
        });
    }
    next();
};

exports.isVolunteer = (req, res, next) => {
    if (req.user.role !== 'volunteer') {
        return res.status(403).json({
            success: false,
            message: "Доступ дозволено тільки користувачам з роллю 'volunteer'"
        });
    }
    next();
};