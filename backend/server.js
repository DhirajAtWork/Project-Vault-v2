import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport, { configurePassport } from './config/passport.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// 1. Load environment variables
dotenv.config();

// 2. Connect to MongoDB Atlas Database
connectDB();

// 3. Configure Passport Strategies
configurePassport();

const app = express();

// 4. Global Security & Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// 5. CORS Setup for Cookie & Credential Security
app.use(
  cors({
    origin: true, // Allow requests from any origin (e.g. localhost:5173 or localhost:5000)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  })
);

// Disable caching for API responses to prevent stale data on dynamic navigation
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

// 6. System Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'operational',
    message: 'Project Vault v2 Backend Service Active',
    passport: 'enabled',
    timestamp: new Date().toISOString(),
  });
});

// 7. Mount API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

// 8. Serve Static Uploaded Files & Built Frontend Assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(frontendDistPath));

// 9. SPA Routing Fallback for Frontend Routes (Serving index.html on backend URL)
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API route ${req.originalUrl} not found`,
    });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// 10. Global Centralized Error Middleware
app.use((err, req, res, next) => {
  console.error('Server Exception Stack:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 [Project Vault v2 Backend]: Listening on http://localhost:${PORT}`);
});
