import rateLimit from 'express-rate-limit';

export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true, // Adds RateLimit-* headers
    legacyHeaders: false,  // Disables X-RateLimit-* headers
    message: {
        status: 429,
        error: "Too many authentication attempts. Try again after 15 minutes."
    }
});

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                  // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too many login attempts. Please try again later."
    }
})

export const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

export const resendEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip + req.body.email,
    message: {
        status: 429,
        error: "Too many verification emails sent. Please try again later."
    }
});
export const refreshTokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,                 // enough for retries & concurrency
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const token = req.cookies?.refreshToken || req.body.refreshToken;
        return req.ip + (token ? token.slice(0, 20) : '');
    },
    message: {
        status: 429,
        error: "Too many refresh attempts. Please try again later."
    }
});



