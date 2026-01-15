import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});