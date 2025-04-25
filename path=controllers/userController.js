import jwt   from 'jsonwebtoken';
import User  from '../models/User.js';

// Helper to sign JWTs
const signToken = user =>
  jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '24h' }
  );

// POST /api/users/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    // 1) Prevent duplicate
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // 2) Create new user — the model's beforeCreate hook will hash `password` once
    const user = await User.create({ name, email, password, phone, role });
    // 3) Issue token
    const token = signToken(user);
    // 4) Send back user (password stripped by toJSON) + token
    res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message });
  }
};

// POST /api/users/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // 1) Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    // 2) Fetch with password field
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    // 3) Compare
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    // 4) Success: issue token
    const token = signToken(user);
    res.status(200).json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// POST /api/users/create-test-user  (dev only)
export const createTestUser = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }
  try {
    const testEmail    = 'test@example.com';
    const testPassword = 'password123';
    // Upsert test user; the hook hashes once
    let user = await User.findOne({ where: { email: testEmail } });
    if (user) {
      await user.update({ password: testPassword });
    } else {
      user = await User.create({
        name:  'Test User',
        email: testEmail,
        password: testPassword,
        phone: '1234567890',
        role:  'user'
      });
    }
    res.status(200).json({
      message: 'Test user ready',
      credentials: { email: testEmail, password: testPassword }
    });
  } catch (err) {
    console.error('Error creating test user:', err);
    res.status(500).json({ error: err.message });
  }
}; 