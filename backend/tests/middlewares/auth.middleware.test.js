// tests/middlewares/auth.middleware.test.js

const jwt = require('jsonwebtoken');
const { authenticateUser, isRequester, isVolunteer } = require('../../middlewares/auth.middleware');
const UserModel = require('../../models/user.model');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/user.model');

describe('Authentication Middleware Tests', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock request, response, and next function
        req = {
            headers: {
                authorization: 'Bearer test_token'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('authenticateUser', () => {
        it('should call next() if authentication is successful', async () => {
            // Mock JWT verification
            jwt.verify.mockReturnValue({ id: 1 });

            // Mock user data from database
            UserModel.findUserById.mockResolvedValue({
                id: 1,
                email: 'user@example.com',
                role: 'requester'
            });

            await authenticateUser(req, res, next);

            // Check if token was verified
            expect(jwt.verify).toHaveBeenCalledWith('test_token', expect.any(String));

            // Check if user was fetched from database
            expect(UserModel.findUserById).toHaveBeenCalledWith(1);

            // Check if user data was added to request object
            expect(req.user).toEqual({
                id: 1,
                email: 'user@example.com',
                role: 'requester'
            });

            // Check if next() was called
            expect(next).toHaveBeenCalled();

            // Check that response methods were not called
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 401 if no token is provided', async () => {
            // Remove token from request
            req.headers.authorization = undefined;

            await authenticateUser(req, res, next);

            // Check response
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: expect.any(String)
            });

            // Check that next() was not called
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if user is not found', async () => {
            // Mock JWT verification
            jwt.verify.mockReturnValue({ id: 999 });

            // Mock user not found
            UserModel.findUserById.mockResolvedValue(null);

            await authenticateUser(req, res, next);

            // Check response
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: expect.any(String)
            });

            // Check that next() was not called
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token verification fails', async () => {
            // Mock JWT verification error
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await authenticateUser(req, res, next);

            // Check response
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: expect.any(String)
            });

            // Check that next() was not called
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('isRequester', () => {
        it('should call next() if user is a requester', () => {
            // Set user role to requester
            req.user = { role: 'requester' };

            isRequester(req, res, next);

            // Check that next() was called
            expect(next).toHaveBeenCalled();

            // Check that response methods were not called
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 403 if user is not a requester', () => {
            // Set user role to volunteer
            req.user = { role: 'volunteer' };

            isRequester(req, res, next);

            // Check response
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: expect.any(String)
            });

            // Check that next() was not called
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('isVolunteer', () => {
        it('should call next() if user is a volunteer', () => {
            // Set user role to volunteer
            req.user = { role: 'volunteer' };

            isVolunteer(req, res, next);

            // Check that next() was called
            expect(next).toHaveBeenCalled();

            // Check that response methods were not called
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 403 if user is not a volunteer', () => {
            // Set user role to requester
            req.user = { role: 'requester' };

            isVolunteer(req, res, next);

            // Check response
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: expect.any(String)
            });

            // Check that next() was not called
            expect(next).not.toHaveBeenCalled();
        });
    });
});