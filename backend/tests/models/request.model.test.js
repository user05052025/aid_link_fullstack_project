// tests/models/request.model.test.js

const RequestModel = require('../../models/request.model');
const db = require('../../config/db');

// Мокуємо базу даних
jest.mock('../../config/db');

describe('Request Model Tests', () => {
    beforeEach(() => {
        // Очищаємо моки перед кожним тестом
        jest.clearAllMocks();
    });

    describe('createRequest', () => {
        it('should create a new request and return insertId', async () => {
            // Мокуємо відповідь від бази даних
            db.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const requestData = {
                category_id: 1,
                requester_id: 1,
                title: 'Test Request',
                description: 'Test Description',
                budget: 1000,
                priority: 'Високий',
                city: 'Test City',
                region: 'Test Region'
            };

            const requestId = await RequestModel.createRequest(requestData);

            // Перевіряємо, що функція query була викликана
            expect(db.query).toHaveBeenCalledTimes(1);

            // Перевіряємо перший параметр (SQL запит)
            expect(db.query.mock.calls[0][0]).toMatch(/INSERT INTO aid_requests/);

            // Перевіряємо другий параметр (значення параметрів)
            expect(db.query.mock.calls[0][1]).toEqual([
                1, 1, 'Test Request', 'Test Description', 1000, 'Високий', 'Test City', 'Test Region'
            ]);

            // Перевіряємо, що функція повернула правильний результат
            expect(requestId).toBe(1);
        });
    });

    describe('getRequests', () => {
        it('should return all requests when no filters are provided', async () => {
            // Мокуємо відповідь від бази даних
            const mockRequests = [
                { id: 1, title: 'Request 1' },
                { id: 2, title: 'Request 2' }
            ];
            db.query.mockResolvedValueOnce([mockRequests]);

            const requests = await RequestModel.getRequests();

            // Перевіряємо, що функція query була викликана з правильним SQL запитом
            expect(db.query.mock.calls[0][0]).toMatch(/SELECT ar\.\*, c\.name as category_name/);
            expect(db.query.mock.calls[0][0]).toMatch(/WHERE 1=1/);
            expect(db.query.mock.calls[0][0]).toMatch(/ORDER BY ar\.created_at DESC/);

            // Перевіряємо, що функція повернула правильний результат
            expect(requests).toEqual(mockRequests);
        });

        it('should apply filters when provided', async () => {
            // Мокуємо відповідь від бази даних
            const mockRequests = [
                { id: 1, title: 'Request 1', category_id: 2, status: 'В роботі', region: 'Київська' }
            ];
            db.query.mockResolvedValueOnce([mockRequests]);

            const filters = {
                category_id: 2,
                status: 'В роботі',
                region: 'Київська'
            };

            const requests = await RequestModel.getRequests(filters);

            // Перевіряємо, що функція query була викликана з правильним SQL запитом та параметрами
            // Using more flexible regex matching to account for whitespace
            expect(db.query.mock.calls[0][0]).toMatch(/WHERE 1=1[\s\S]*?ar\.category_id = \?[\s\S]*?ar\.status = \?[\s\S]*?ar\.region = \?/);
            expect(db.query.mock.calls[0][1]).toEqual([2, 'В роботі', 'Київська']);

            // Перевіряємо, що функція повернула правильний результат
            expect(requests).toEqual(mockRequests);
        });
    });

    describe('getRequestById', () => {
        it('should return a request by ID', async () => {
            // Мокуємо відповідь від бази даних
            const mockRequest = {
                id: 1,
                title: 'Test Request',
                description: 'Test Description',
                category_id: 1,
                category_name: 'Продукти',
                requester_id: 1,
                requester_name: 'Test User',
                status: 'Очікує на виконавця'
            };
            db.query.mockResolvedValueOnce([[mockRequest]]);

            const request = await RequestModel.getRequestById(1);

            // Перевіряємо, що функція query була викликана з правильними параметрами
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT ar.*, c.name as category_name'),
                [1]
            );

            // Перевіряємо, що функція повернула правильний результат
            expect(request).toEqual(mockRequest);
        });

        it('should return undefined if request not found', async () => {
            // Мокуємо порожню відповідь від бази даних
            db.query.mockResolvedValueOnce([[]]);

            const request = await RequestModel.getRequestById(999);

            // Перевіряємо, що функція повернула undefined
            expect(request).toBeUndefined();
        });
    });

    describe('assignVolunteer', () => {
        it('should assign volunteer to a request', async () => {
            // Мокуємо відповідь від бази даних
            const mockUpdateResult = { affectedRows: 1 };
            db.query.mockResolvedValueOnce([mockUpdateResult]);

            const result = await RequestModel.assignVolunteer(1, 2);

            // Use a more flexible approach to checking the SQL query
            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/UPDATE aid_requests SET[\s\S]*?volunteer_id = \?[\s\S]*?status = 'В роботі'/),
                expect.arrayContaining([2, 1])
            );

            // Перевіряємо, що функція повернула true (операція вдала)
            expect(result).toBe(true);
        });

        it('should return false if request not found or already assigned', async () => {
            // Мокуємо відповідь від бази даних, що вказує на відсутність змін
            const mockUpdateResult = { affectedRows: 0 };
            db.query.mockResolvedValueOnce([mockUpdateResult]);

            const result = await RequestModel.assignVolunteer(999, 2);

            // Перевіряємо, що функція повернула false (операція не вдала)
            expect(result).toBe(false);
        });
    });

    describe('updateRequestStatus', () => {
        it('should update request status', async () => {
            // Мокуємо відповідь від бази даних
            const mockUpdateResult = { affectedRows: 1 };
            db.query.mockResolvedValueOnce([mockUpdateResult]);

            const result = await RequestModel.updateRequestStatus(1, 'Виконано');

            // Use a more flexible approach to checking the SQL query
            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/UPDATE aid_requests SET[\s\S]*?status = \?/),
                expect.arrayContaining(['Виконано', 1])
            );

            // Перевіряємо, що функція повернула true (операція вдала)
            expect(result).toBe(true);
        });
    });

    describe('getCategories', () => {
        it('should return all categories', async () => {
            // Мокуємо відповідь від бази даних
            const mockCategories = [
                { id: 1, name: 'Продукти' },
                { id: 2, name: 'Ліки' },
                { id: 3, name: 'Одяг' }
            ];
            db.query.mockResolvedValueOnce([mockCategories]);

            const categories = await RequestModel.getCategories();

            // Перевіряємо, що функція query була викликана з правильним SQL запитом
            expect(db.query).toHaveBeenCalledWith('SELECT * FROM categories');

            // Перевіряємо, що функція повернула правильний результат
            expect(categories).toEqual(mockCategories);
        });
    });
});