import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {connectDB} from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

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

// Add this after your routes but before app.listen
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Make sure all routes that don't exist return 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

