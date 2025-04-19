import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signup = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if the user already exists using Sequelize's where clause
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user using Sequelize's create method
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        // Generate a JWT token using user id
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
    try {
        console.log('Getting all users...');
        const users = await User.findAll();
        console.log(`Found ${users.length} users`);
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        // Pass the error to the error handler middleware
        return next(error);
    }
};

export { signup, login };