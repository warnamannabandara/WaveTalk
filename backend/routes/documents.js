const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/documents
router.get('/', protect, async (req, res, next) => {
    try {
        const { type, status, search } = req.query;
        const query = {
            $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
            deletedAt: null
        };
        if (type && type !== 'all') query.type = type;
        if (status) query.status = status;
        if (search) query.title = { $regex: search, $options: 'i' };

        const documents = await Document.find(query)
            .populate('owner', 'name email avatar')
            .populate('meeting', 'title meetingId')
            .sort({ updatedAt: -1 })
            .limit(100);

        res.json({ documents });
    } catch (err) {
        next(err);
    }
});

// POST /api/documents
router.post('/', protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').optional().isIn(['report', 'note', 'recording', 'transcript', 'other'])
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const { title, type, content, description, status, tags, meeting, fileUrl, fileSize } = req.body;
        const document = await Document.create({
            title,
            type: type || 'note',
            content: content || '',
            description: description || '',
            owner: req.user._id,
            status: status || 'current',
            tags: tags || [],
            meeting: meeting || null,
            fileUrl: fileUrl || null,
            fileSize: fileSize || 0,
        });

        await document.populate('owner', 'name email avatar');
        res.status(201).json({ document });
    } catch (err) {
        next(err);
    }
});

// GET /api/documents/:id
router.get('/:id', protect, async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
            deletedAt: null
        }).populate('owner', 'name email avatar').populate('meeting', 'title meetingId');

        if (!document) return res.status(404).json({ message: 'Document not found' });
        res.json({ document });
    } catch (err) {
        next(err);
    }
});

// PUT /api/documents/:id
router.put('/:id', protect, async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, owner: req.user._id, deletedAt: null });
        if (!document) return res.status(404).json({ message: 'Document not found or not authorized' });

        const { title, content, description, type, status, tags, fileUrl, fileSize } = req.body;
        if (title) document.title = title;
        if (content !== undefined) document.content = content;
        if (description !== undefined) document.description = description;
        if (type) document.type = type;
        if (status) document.status = status;
        if (tags) document.tags = tags;
        if (fileUrl !== undefined) document.fileUrl = fileUrl;
        if (fileSize !== undefined) document.fileSize = fileSize;

        await document.save();
        res.json({ document });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/documents/:id - soft delete
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, owner: req.user._id });
        if (!document) return res.status(404).json({ message: 'Document not found' });
        document.deletedAt = new Date();
        await document.save();
        res.json({ message: 'Document deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
