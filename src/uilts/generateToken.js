import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (userId) => {
    try{
        const accessToken = jwt.sign(
            { userId },
            process.env.AUTH_TOKEN_SECRET,
            { expiresIn: process.env.AUTH_TOKEN_EXPIRES_IN }
        );
        const refreshToken = jwt.sign(
            { userId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
        );
        return { accessToken, refreshToken };
    }catch(err){
        console.error("Error generating tokens:", err);
        throw new Error("Token generation failed");
    }
}