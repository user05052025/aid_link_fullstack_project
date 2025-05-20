// tests/models/comment.model.test.js

const CommentModel = require('../../models/comment.model');
const db = require('../../config/db');

// Мокуємо базу даних
jest.mock('../../config/db');

describe('Comment Model Tests', () => {
    beforeEach(() => {
        // Очищаємо моки перед кожним тестом
        jest.clearAllMocks();
    });

    describe('createComment', () => {
        it('should create a new comment and return insertId', async () => {
            // Мокуємо відповідь від бази даних
            db.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const commentData = {
                request_id: 1,
                user_id: 2,
                text: 'Тестовий коментар'
            };

            const commentId = await CommentModel.createComment(commentData);

            // Перевіряємо, що функція query була викликана
            expect(db.query).toHaveBeenCalledTimes(1);

            // Перевіряємо перший параметр (SQL запит)
            expect(db.query.mock.calls[0][0]).toMatch(/INSERT INTO comments/);

            // Перевіряємо другий параметр (значення параметрів)
            expect(db.query.mock.calls[0][1]).toEqual([1, 2, 'Тестовий коментар']);

            // Перевіряємо, що функція повернула правильний результат
            expect(commentId).toBe(1);
        });

        it('should throw an error if query fails', async () => {
            // Мокуємо помилку
            db.query.mockRejectedValueOnce(new Error('Database error'));

            const commentData = {
                request_id: 1,
                user_id: 2,
                text: 'Тестовий коментар'
            };

            // Перевіряємо, що функція викидає помилку
            await expect(CommentModel.createComment(commentData)).rejects.toThrow('Database error');
        });
    });

    describe('getCommentsByRequestId', () => {
        it('should return comments for a specific request', async () => {
            // Мокуємо відповідь від бази даних
            const mockComments = [
                {
                    id: 1,
                    request_id: 1,
                    user_id: 2,
                    text: 'Перший коментар',
                    created_at: '2023-01-01T12:00:00Z',
                    user_name: 'Іван Петров',
                    user_role: 'volunteer'
                },
                {
                    id: 2,
                    request_id: 1,
                    user_id: 3,
                    text: 'Другий коментар',
                    created_at: '2023-01-01T13:00:00Z',
                    user_name: 'Марія Іванова',
                    user_role: 'requester'
                }
            ];
            db.query.mockResolvedValueOnce([mockComments]);

            const comments = await CommentModel.getCommentsByRequestId(1);

            // Перевіряємо, що функція query була викликана з правильними параметрами
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT c.*, u.name as user_name, u.role as user_role'),
                [1]
            );

            // Перевіряємо, що функція повернула правильний результат
            expect(comments).toEqual(mockComments);
        });

        it('should return empty array if no comments found', async () => {
            // Мокуємо порожню відповідь від бази даних
            db.query.mockResolvedValueOnce([[]]);

            const comments = await CommentModel.getCommentsByRequestId(999);

            // Перевіряємо, що функція повернула порожній масив
            expect(comments).toEqual([]);
        });

        it('should throw an error if query fails', async () => {
            // Мокуємо помилку
            db.query.mockRejectedValueOnce(new Error('Database error'));

            // Перевіряємо, що функція викидає помилку
            await expect(CommentModel.getCommentsByRequestId(1)).rejects.toThrow('Database error');
        });
    });

    describe('createCommentsTable', () => {
        it('should create comments table if it does not exist', async () => {
            // Мокуємо успішну відповідь від бази даних
            db.query.mockResolvedValueOnce([{}]);

            await CommentModel.createCommentsTable();

            // Перевіряємо, що функція query була викликана
            expect(db.query).toHaveBeenCalledTimes(1);

            // Перевіряємо, що SQL запит містить CREATE TABLE
            expect(db.query.mock.calls[0][0]).toMatch(/CREATE TABLE IF NOT EXISTS comments/);
        });

        it('should throw an error if table creation fails', async () => {
            // Мокуємо помилку
            db.query.mockRejectedValueOnce(new Error('Database error'));

            // Перевіряємо, що функція викидає помилку
            await expect(CommentModel.createCommentsTable()).rejects.toThrow('Database error');
        });
    });
});