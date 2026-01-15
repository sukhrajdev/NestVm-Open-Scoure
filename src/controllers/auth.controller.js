import { prisma} from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../uilts/generateToken.js";
import { sendVerificationEmail } from "../uilts/sendVerificationEmail.js";

export async function registerUser(req, res) {
    try{
        const { username, email, password } = req.body; // Destructure input fields
        
        // Validate input
        if(!username || !email || !password){
            return  res.status(400).json({ status: 400, message: "All fields are required" });
        }
        // Validate username length
        if(username.length < 3){
            return res.status(400).json({ status: 400, message: "Username must be at least 3 characters long" });
        }
        // Validate email format
        if(!email.endsWith("@example.com")){
            return res.status(400).json({ status: 400, message: "Email must be from the domain example.com" });
        }

        // Validate password length
        if(password.length < 6){
            return res.status(400).json({ status: 400, message: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: "User already exists" });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate tokens
        const authToken = jwt.sign(
            { userId: newUser.id },
            process.env.AUTH_TOKEN_SECRET,
            { expiresIn: process.env.AUTH_TOKEN_EXPIRES_IN }
        );

        // Create user
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                authToken
            },
        });

        await sendVerificationEmail(email,authToken);

        // Respond with success
        return res.status(201).json({
            status: 201,
            message: "User registered successfully",
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                authToken: newUser.authToken
            }
        })
    }catch(err){
        console.error(err);
        res.status(500).json({
            status: 500,
            message: "Internal server error" 

            });
    }
}

export async function loginUser(req, res){
    try{
        const { email, password } = req.body;
        
        // Validate input
        if(!email || !password){
            return res.status(400).json({ status: 400, message: "Email and password are required" });
        }
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if(!user){
            return res.status(400).json({ status: 400, message: "Invalid email or password" });
        }
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({ status: 400, message: "Invalid email or password" });
        }
        // Generate new tokens
        const {accessToken,refreshToken} = generateToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: refreshToken
            }
        })

        // Respond with tokens
        return res.status(200)
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        })
        .json({
            status: 200,
            message: "Login successful",
            data: {
                userId: user.id,
                username: user.username,
                email: user.email
            }
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
}

export async function logout(req, res){
    try{
        const {refreshToken,accessToken} = req.cookies;
        if(!refreshToken || !accessToken){
            return res.status(400).json({ status: 400, message: "No tokens provided" });
        }
        // Clear cookies
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        // Respond with success
        return res.status(200).json({
            status: 200,
            message: "Logout successful"
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
}

export async function refreshToken(req, res){
    try{
        const { refreshToken } = req.cookies;
        if(!refreshToken){
            return res.status(400).json({ status: 400, message: "No refresh token provided" });
        }
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.userId;

        // Generate new tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateToken(userId);
        
        await prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: newRefreshToken
            }
        });
        // Set new cookies
        return res.status(200)
        .cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        .cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        })
        .json({
            status: 200,
            message: "Tokens refreshed successfully"
        });
    }catch(err){
        console.error(err.message);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
}

export async function VerificationEmail(req, res){
    try{
        const { authToken } = req.params;
        if(!authToken){
            return res.status(400).json({ status: 400, message: "No auth token provided" });
        }
        // Verify auth token
        const decoded = jwt.verify(authToken, process.env.AUTH_TOKEN_SECRET);
        const userId = decoded.userId;
        
        // Update user verification status
        await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                authToken: null
            }
        });
        // Respond with success
        return res.status(200).json({
            status: 200,
            message: "Email verified successfully"
        });
    }catch(err){
        console.error(err.message);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
}

export async function resendVerificationEmail(req, res){
    try{
        const { email } = req.body;
        if(!email){
            return res.status(400).json({ status: 400, message: "Email is required" });
        }
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if(!user){
            return res.status(400).json({ status: 400, message: "User not found" });
        }
        if(user.isVerified){
            return res.status(400).json({ status: 400, message: "Email is already verified" });
        }
        // Generate new auth token
        const authToken = jwt.sign(
            { userId: user.id },
            process.env.AUTH_TOKEN_SECRET,
            { expiresIn: process.env.AUTH_TOKEN_EXPIRES_IN }
        );

        // Update user with new auth token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                authToken
            }
        });

        // Send verification email
        await sendVerificationEmail(email, authToken);
        
        // Respond with success
        return res.status(200).json({
            status: 200,
            message: "Verification email resent successfully"
        });
    }catch(err){
        console.error(err.message);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
}
