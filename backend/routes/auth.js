const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateTokens = (userId, role) => {
    const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
    return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password });
        const { accessToken, refreshToken } = generateTokens(user._id, user.role);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ user, accessToken });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (user.status === 'inactive') return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
        if (user.status === 'banned') return res.status(403).json({ message: 'Account banned' });

        const { accessToken, refreshToken } = generateTokens(user._id, user.role);
        user.refreshToken = refreshToken;
        user.lastSeen = new Date();
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userObj = user.toJSON();
        res.json({ user: userObj, accessToken });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const { accessToken, refreshToken } = generateTokens(user._id, user.role);
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/logout
router.post('/logout', protect, async (req, res, next) => {
    try {
        req.user.refreshToken = null;
        await req.user.save();
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
