import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Parse allowed origins from environment variables and default fallback list
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://cloudinary-coral.vercel.app'
];

const envOrigins = (process.env.CLIENT_ORIGIN || process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    } else {
      console.warn(`[CORS NOTICE]: Blocked request from origin '${origin}'`);
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204
};

// Handle Preflight OPTIONS requests explicitly across all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
app.use('/api/videos', videoRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
