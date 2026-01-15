import express from 'express';
import {verifyToken} from '../middlewares/auth.middleware.js';
import {
    getUserById,
    getAllUsers,
    updateUserById,
    deleteUserById,
    updateUserRole,
    forgetPassword
} from '../controllers/user.controller.js';

import {verifyAdmin} from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

// Get user by ID
userRouter.get('/me', verifyToken, getUserById);

// Get all users (Admin only)
userRouter.get('/', verifyToken, verifyAdmin, getAllUsers);

// Update user by ID
userRouter.put('/me', verifyToken, updateUserById);

// Delete user by ID
userRouter.delete('/me', verifyToken, deleteUserById);

// Update user role (Admin only)
userRouter.put('/:id/role', verifyToken, verifyAdmin, updateUserRole);

// Forget password
userRouter.post('/forget-password', verifyToken, forgetPassword);

export default userRouter;