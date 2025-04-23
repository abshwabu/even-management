import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {connectDB} from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Sequelize } from 'sequelize';
import './models/associations.js';  // Import associations to ensure they're loaded
dotenv.config();

// Import routes
import userRoutes from './routes/user.js';
import eventRoutes from './routes/event.js';
import paymentRoutes from './routes/payment.js';
import notificationRoutes from './routes/notification.js';
import registrationRoutes from './routes/registration.js';
import calendarRoutes from './routes/calendar.js';
import swaggerRoutes from './swagger.js';
import newsRoutes from './routes/news.js';
import opportunityRoutes from './routes/opportunity.js';
import guestRoutes from './routes/guest.js';
import applicantRoutes from './routes/applicant.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());

// Enhanced CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Add this before your routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/calendars', calendarRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api', guestRoutes);
app.use('/api', applicantRoutes);
app.use('/', swaggerRoutes); // Swagger documentation route

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads directories if they don't exist
const uploadDirs = ['uploads/news', 'uploads/events', 'uploads/guests', 'uploads/opportunities', 'uploads/resumes'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Connect to MongoDB
connectDB().catch(err => {
    console.error('Failed to connect to database:', err);
    // Continue running the server even if DB connection fails
});

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Add this before your other routes
app.get('/api/test', (req, res) => {
  try {
    res.status(200).json({ message: 'API is working correctly' });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this debug route before your other routes
app.get('/debug', (req, res) => {
  try {
    // Return basic system info
    const debugInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        // Don't include sensitive info like database credentials
        DATABASE_CONFIGURED: !!process.env.PG_URI
      },
      // Add timestamp to verify the route is working
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(debugInfo);
  } catch (error) {
    // Detailed error for debugging
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Add this before your other routes
app.get('/api/db-status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'connected',
      message: 'Database connection is working properly'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'disconnected',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Add this after your routes but before the general error handler
app.use((err, req, res, next) => {
  // Check if it's a Sequelize error
  if (err.name && (
    err.name === 'SequelizeConnectionError' || 
    err.name === 'SequelizeConnectionRefusedError' ||
    err.name === 'SequelizeHostNotFoundError' ||
    err.name === 'SequelizeAccessDeniedError' ||
    err.name === 'SequelizeConnectionTimedOutError' ||
    err.name === 'SequelizeDatabaseError'
  )) {
    console.error('Database Error:', err);
    return res.status(500).json({
      error: 'Database connection error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Unable to connect to database' 
        : err.message
    });
  }
  
  // Pass to next error handler if not a database error
  next(err);
});

// Add this after your routes but before app.listen
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Send a detailed response in development, simpler in production
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    path: req.path,
    method: req.method,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  res.status(500).json(errorResponse);
});

// Make sure all routes that don't exist return 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Add this at the top of your server.js file
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

