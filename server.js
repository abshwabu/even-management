import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db.js';
import dotenv from 'dotenv';
dotenv.config();

// Import routes
import userRoutes from './routes/user.js';
import eventRoutes from './routes/event.js';
import paymentRoutes from './routes/payment.js';
import notificationRoutes from './routes/notification.js';
import registrationRoutes from './routes/registration.js';
import calendarRoutes from './routes/calendar.js';
import swaggerRoutes from './swagger.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/calendars', calendarRoutes);
app.use('/', swaggerRoutes); // Swagger documentation route

// Connect to MongoDB
connectDB();

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

