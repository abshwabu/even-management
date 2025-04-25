import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Signup user
export const signup = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if the user already exists using Sequelize's where clause
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send({ error: 'User already exists' });
        }

        // Create a new user; the beforeCreate hook will hash `password`
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role,
        });

        // Generate a JWT token using the user's id (Sequelize uses id, not _id)
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '100h' });

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Login user - Fixed version
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log(`Login attempt for: ${email}`);
        
        // Use raw SQL to get user with password
        const users = await sequelize.query(
            'SELECT * FROM "Users" WHERE email = :email',
            {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        if (!users || users.length === 0) {
            console.log(`User not found: ${email}`);
            return res.status(400).send({ error: 'Invalid email or password' });
        }
        
        const user = users[0];
        console.log(`User found: ${user.email}, Role: ${user.role}`);
        console.log(`Password field exists: ${!!user.password}`);
        
        // Check if password field exists
        if (!user.password) {
            console.error('Password field is missing from user record');
            return res.status(500).send({ error: 'Authentication error' });
        }
        
        // Normal login flow
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log(`Password mismatch for: ${email}`);
            return res.status(400).send({ error: 'Invalid email or password' });
        }
        
        console.log(`Password verified for: ${email}`);
        
        // Generate a JWT token with user ID and role
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        delete user.password;
        
        console.log(`Login successful for: ${email}`);
        
        res.status(200).send({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ error: 'Server error during login' });
    }
};

// Get all users with optional stats
export const getAllUsers = async (req, res, next) => {
    try {
        console.log('Getting all users...');
        const { includeStats } = req.query;
        
        const users = await User.findAll();
        console.log(`Found ${users.length} users`);
        
        // If includeStats is true, include user statistics
        let response = users;
        
        if (includeStats === 'true') {
            // Get user statistics
            const totalUsers = await User.count();
            const totalStaff = await User.count({
                where: {
                    role: {
                        [Op.in]: ['admin', 'organizer']
                    }
                }
            });
            const totalRegularUsers = await User.count({
                where: {
                    role: 'user'
                }
            });
            
            response = {
                users,
                stats: {
                    totalUsers,
                    totalStaff,
                    totalRegularUsers
                }
            };
        }
        
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return next(error);
    }
};

// Create test user (development only)
export const createTestUser = async (req, res) => {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).send({ error: 'Not available in production' });
    }
    
    try {
        const testEmail = 'test@example.com';
        const testPassword = 'password123';
        
        // Let the hook hash the plain-text password exactly once
        const user = await User.create({
            name: 'Test User',
            email: testEmail,
            password: testPassword,
            phone: '1234567890',
            role: 'user'
        });
        
        res.status(200).send({
            message: 'Test user ready',
            credentials: { email: testEmail, password: testPassword }
        });
    } catch (error) {
        console.error('Error creating test user:', error);
        res.status(400).send({ error: error.message });
    }
};