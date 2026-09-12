import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Configure CORS for React frontend origin
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

// GET /api/health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AI Commerce Content Factory API',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/products', productRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
