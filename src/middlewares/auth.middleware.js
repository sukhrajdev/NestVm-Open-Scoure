import {prisma} from '../config/prisma.js';
import jwt from 'jsonwebtoken';

// Authentication Middleware
export async function verifyToken(req, res, next) {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }
        
        // Verify token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.userId;

        // Fetch user from DB
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return res.status(401).json({ status: 401, message: "Invalid token" });
        }

        // Attach user to request object
        req.user = user;
        next();
    }catch(err){
        console.error("Authentication error:", err);
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
}

// Authorization Middleware for Admins
export function verifyAdmin(req, res, next) {
    if (req.user.role !== 'ADMIN'){
        return res.status(403).json({ status: 403, message: "Forbidden: Admins only" });
    } 
    next();
}

