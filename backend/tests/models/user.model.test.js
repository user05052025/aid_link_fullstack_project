// tests/models/user.model.test.js

const UserModel = require('../../models/user.model');
const db = require('../../config/db');

// Мокаємо базу даних
jest.mock('../../config/db');

describe('User Model Tests', () => {
    beforeEach(() => {
        // Очищаємо моки перед кожним тестом
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user and return insertId', async () => {
            // Мокуємо відповідь від бази даних
            db.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                phone: '123456789',
                address: 'Test Address',
                city: 'Test City',
                region: 'Test Region',
                role: 'requester'
            };

            const userId = await UserModel.createUser(userData);

            // Перевіряємо, що функція query була викликана
            expect(db.query).toHaveBeenCalledTimes(1);

            // Перевіряємо, що функція повернула правильний результат
            expect(userId).toBe(1);
        });

        it('should throw an error if query fails', async () => {
            // Мокуємо помилку
            db.query.mockRejectedValueOnce(new Error('Database error'));

            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'requester'
            };

            // Перевіряємо, що функція викидає помилку
            await expect(UserModel.createUser(userData)).rejects.toThrow('Database error');
        });
    });

    describe('findUserByEmail', () => {
        it('should find a user by email', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: 'requester'
            };

            // Мокуємо відповідь від бази даних
            db.query.mockResolvedValueOnce([[mockUser]]);

            const user = await UserModel.findUserByEmail('test@example.com');

            // Перевіряємо, що функція query була викликана з правильними параметрами
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM users WHERE email = ?'),
                ['test@example.com']
            );

            // Перевіряємо, що функція повернула правильний результат
            expect(user).toEqual(mockUser);
        });

        it('should return undefined if user not found', async () => {
            // Мокуємо порожню відповідь від бази даних
            db.query.mockResolvedValueOnce([[]]);

            const user = await UserModel.findUserByEmail('nonexistent@example.com');

            // Перевіряємо, що функція повернула undefined
            expect(user).toBeUndefined();
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching passwords', async () => {
            // Тест будет залежати від bcrypt, тому ми можемо мокнути модуль bcrypt
            // Для цього тесту ми припускаємо, що bcrypt.compare поверне true
            const plainPassword = 'password123';
            const hashedPassword = 'hashed_password';

            // Напряму мокуємо bcrypt, оскільки він є залежністю UserModel
            const bcrypt = require('bcrypt');
            bcrypt.compare = jest.fn().mockResolvedValueOnce(true);

            const result = await UserModel.comparePassword(plainPassword, hashedPassword);

            // Перевіряємо, що bcrypt.compare був викликаний з правильними параметрами
            expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);

            // Перевіряємо, що функція повернула true
            expect(result).toBe(true);
        });

        it('should return false for non-matching passwords', async () => {
            const plainPassword = 'wrongpassword';
            const hashedPassword = 'hashed_password';

            // Напряму мокуємо bcrypt
            const bcrypt = require('bcrypt');
            bcrypt.compare = jest.fn().mockResolvedValueOnce(false);

            const result = await UserModel.comparePassword(plainPassword, hashedPassword);

            // Перевіряємо, що функція повернула false
            expect(result).toBe(false);
        });
    });
});