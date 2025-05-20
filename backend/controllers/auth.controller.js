// controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
    try {
        // Перевірка результатів валідації
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { name, email, password, phone, address, city, region, role } = req.body;

        // Додаткова перевірка (зберігаємо існуючу логіку)
        if (role !== 'requester' && role !== 'volunteer') {
            return res.status(400).json({
                success: false,
                message: "Роль має бути 'requester' або 'volunteer'",
            });
        }

        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Користувач з такою електронною адресою вже існує",
            });
        }

        const userId = await UserModel.createUser({
            name,
            email,
            password,
            phone: phone || null,
            address: address || null,
            city: city || null,
            region: region || null,
            role
        });

        const token = jwt.sign(
            { id: userId, email, role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: "Користувача успішно зареєстровано",
            token,
            user: {
                id: userId,
                name,
                email,
                role
            }
        });
    } catch (error) {
        console.error("Error in register API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при реєстрації користувача",
            error: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        // Перевірка результатів валідації
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Невірна електронна пошта або пароль",
            });
        }

        const isPasswordValid = await UserModel.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Невірна електронна пошта або пароль",
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            message: "Успішний вхід",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error in login API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка під час входу",
            error: error.message,
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await UserModel.findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Користувача не знайдено",
            });
        }

        res.status(200).json({
            success: true,
            message: "Профіль користувача",
            user
        });
    } catch (error) {
        console.error("Error in get profile API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при отриманні профілю",
            error: error.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // Перевірка результатів валідації
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { name, phone, address, city, region } = req.body;

        const updated = await UserModel.updateUser(req.user.id, {
            name,
            phone: phone || null,
            address: address || null,
            city: city || null,
            region: region || null
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Користувача не знайдено",
            });
        }

        const user = await UserModel.findUserById(req.user.id);

        res.status(200).json({
            success: true,
            message: "Профіль успішно оновлено",
            user
        });
    } catch (error) {
        console.error("Error in update profile API:", error);
        res.status(500).json({
            success: false,
            message: "Помилка при оновленні профілю",
            error: error.message,
        });
    }
};