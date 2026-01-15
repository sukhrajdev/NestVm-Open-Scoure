import express from 'express';
// Import controller functions
import { 
    registerUser,
    loginUser, 
    logout,
    refreshToken,
    VerificationEmail,
    resendVerificationEmail

 } from '../controllers/auth.controller.js';

 // Import rate limiters
 import {
    registerRateLimiter, 
    verifyEmailLimiter, 
    resendEmailLimiter,
    refreshTokenLimiter,
    loginRateLimiter

 } from '../middlewares/auth.ratelimiter.js';

 const authRouter = express.Router(); // Create a router instance

// Registration Route
authRouter.post('/register', registerRateLimiter, registerUser);

// Login Route
authRouter.post('/login', loginRateLimiter, loginUser);

// Logout Route
authRouter.post('/logout', logout);

// Refresh Token Route
authRouter.get('/refresh-token', refreshTokenLimiter, refreshToken);

// Email Verification Route
authRouter.get('/verify-email/:authToken', verifyEmailLimiter, VerificationEmail);

// Resend Verification Email Route
authRouter.post('/resend-verification-email', resendEmailLimiter, resendVerificationEmail);

export default authRouter;