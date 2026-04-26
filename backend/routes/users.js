const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - admin: all users, user: search by email
router.get('/', protect, async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
        if (req.user.role !== 'admin') query._id = { $ne: req.user._id };

        const users = await User.find(query)
            .select('name email avatar status lastSeen role createdAt')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ name: 1 });

        res.json({ users });
    } catch (err) {
        next(err);
    }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// PUT /api/users/profile - update own profile
router.put('/profile', protect, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const { name, email, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (avatar !== undefined) user.avatar = avatar;
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }

        await user.save();
        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// PUT /api/users/password - change password
router.put('/password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = req.body.newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
});

// POST /api/users/sign-language/history - save sign language detection
router.post('/sign-language/history', protect, async (req, res, next) => {
    try {
        const { word, sentence } = req.body;
        const user = await User.findById(req.user._id);
        user.signLanguageHistory.push({ word, sentence });
        if (user.signLanguageHistory.length > 100) {
            user.signLanguageHistory = user.signLanguageHistory.slice(-100);
        }
        await user.save();
        res.json({ message: 'Saved', history: user.signLanguageHistory.slice(-10) });
    } catch (err) {
        next(err);
    }
});

// GET /api/users/sign-language/history
router.get('/sign-language/history', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('signLanguageHistory');
        res.json({ history: user.signLanguageHistory.slice(-50).reverse() });
    } catch (err) {
        next(err);
    }
});

// POST /api/users - admin creates a user
router.post('/', protect, adminOnly, [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive', 'banned']).withMessage('Invalid status'),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const { name, email, password, role, status } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const user = await User.create({ name, email, password, role: role || 'user', status: status || 'active' });
        res.status(201).json({ user });
    } catch (err) {
        next(err);
    }
});

// PUT /api/users/:id - admin updates a user
router.put('/:id', protect, adminOnly, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive', 'banned']).withMessage('Invalid status'),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const { name, email, role, status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (role) user.role = role;
        if (status) user.status = status;
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }

        await user.save();
        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/users/:id - admin only
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
