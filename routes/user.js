import express from 'express';
import { signup, login } from '../controllers/userController.js';
import User from '../models/User.js';
import {auth, restrictTo} from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [organizer, attendee, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid email or password
 */
router.post('/login', login);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [organizer, attendee, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {
    try {
        // Use Sequelize's create method instead of new User() + save()
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        // Sequelize's findAll returns all records
        const users = await User.findAll();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        // Use findByPk for primary key lookup
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [organizer, attendee, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid updates
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'phone', 'role'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Update allowed fields
        updates.forEach(update => user[update] = req.body[update]);
        await user.save(); // Persist changes
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        await user.destroy();
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'User routes are working' });
});

/**
 * @swagger
 * /api/users/create-test-user:
 *   post:
 *     summary: Create a test user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Test user created successfully
 *       500:
 *         description: Server error
 */
router.post('/create-test-user', async (req, res) => {
    try {
        const testEmail = 'test@example.com';
        const testPassword = 'password123';
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        console.log('Generated hash:', hashedPassword);
        
        // Check if user exists
        const existingUser = await User.unscoped().findOne({ where: { email: testEmail } });
        
        if (existingUser) {
            // Update user
            await existingUser.update({ password: hashedPassword });
            console.log('Updated test user password');
            
            // Verify the password was saved correctly
            const updatedUser = await User.unscoped().findOne({ where: { email: testEmail } });
            console.log('Password field exists after update:', !!updatedUser.password);
            console.log('Stored hash:', updatedUser.password);
            
            // Test password comparison
            const isMatch = await bcrypt.compare(testPassword, updatedUser.password);
            console.log('Password comparison test:', isMatch);
        } else {
            // Create new user
            const newUser = await User.create({
                name: 'Test User',
                email: testEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Created test user');
            
            // Verify the password was saved correctly
            const createdUser = await User.unscoped().findOne({ where: { email: testEmail } });
            console.log('Password field exists after create:', !!createdUser.password);
            console.log('Stored hash:', createdUser.password);
            
            // Test password comparison
            const isMatch = await bcrypt.compare(testPassword, createdUser.password);
            console.log('Password comparison test:', isMatch);
        }
        
        res.status(200).send({
            message: 'Test user ready',
            email: testEmail,
            password: testPassword
        });
    } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).send({ error: error.message });
    }
});

export default router;