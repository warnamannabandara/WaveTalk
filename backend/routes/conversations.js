const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/conversations
router.get('/', protect, async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
            deletedBy: { $ne: req.user._id }
        })
            .populate('participants', 'name email avatar status lastSeen')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });

        res.json({ conversations });
    } catch (err) {
        next(err);
    }
});

// POST /api/conversations - create or get existing 1:1
router.post('/', protect, async (req, res, next) => {
    try {
        const { participantId } = req.body;
        if (!participantId) return res.status(400).json({ message: 'participantId required' });

        let conversation = await Conversation.findOne({
            isGroup: { $ne: true },
            participants: { $all: [req.user._id, participantId], $size: 2 }
        }).populate('participants', 'name email avatar status lastSeen');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, participantId]
            });
            await conversation.populate('participants', 'name email avatar status lastSeen');
        }

        res.status(201).json({ conversation });
    } catch (err) {
        next(err);
    }
});

// POST /api/conversations/by-email - find or create by participant email
router.post('/by-email', protect, async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'email required' });

        const participant = await User.findOne({ email: email.toLowerCase().trim() })
            .select('name email avatar status lastSeen');
        if (!participant) return res.status(404).json({ message: 'No user found with that email' });

        if (participant._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot start a conversation with yourself' });
        }

        let conversation = await Conversation.findOne({
            isGroup: { $ne: true },
            participants: { $all: [req.user._id, participant._id], $size: 2 }
        }).populate('participants', 'name email avatar status lastSeen');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, participant._id]
            });
            await conversation.populate('participants', 'name email avatar status lastSeen');
        }

        res.status(201).json({ conversation });
    } catch (err) {
        next(err);
    }
});

// POST /api/conversations/group - create group conversation
router.post('/group', protect, async (req, res, next) => {
    try {
        const { groupName, participantIds } = req.body;
        if (!groupName?.trim()) return res.status(400).json({ message: 'Group name required' });
        if (!Array.isArray(participantIds) || participantIds.length < 1) {
            return res.status(400).json({ message: 'At least 1 other participant required' });
        }

        const uniqueIds = [...new Set([req.user._id.toString(), ...participantIds])];
        const conversation = await Conversation.create({
            participants: uniqueIds,
            isGroup: true,
            groupName: groupName.trim(),
            groupAdmins: [req.user._id],
        });
        await conversation.populate('participants', 'name email avatar status lastSeen');
        res.status(201).json({ conversation });
    } catch (err) {
        next(err);
    }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({
            conversation: req.params.id,
            deletedAt: null
        })
            .populate('sender', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        await Message.updateMany(
            { conversation: req.params.id, readBy: { $ne: req.user._id } },
            { $addToSet: { readBy: req.user._id } }
        );

        conversation.unreadCount.set(req.user._id.toString(), 0);
        await conversation.save();

        res.json({ messages: messages.reverse() });
    } catch (err) {
        next(err);
    }
});

// POST /api/conversations/:id/messages - send message (REST fallback)
router.post('/:id/messages', protect, async (req, res, next) => {
    try {
        const { content, type, signLanguageData, fileUrl, fileName, fileSize } = req.body;
        if (!content && !fileUrl) return res.status(400).json({ message: 'Content or file required' });

        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const message = await Message.create({
            conversation: req.params.id,
            sender: req.user._id,
            content: content || '',
            type: type || 'text',
            signLanguageData: signLanguageData || undefined,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            readBy: [req.user._id]
        });

        await message.populate('sender', 'name email avatar');

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        conversation.participants.forEach(pid => {
            if (pid.toString() !== req.user._id.toString()) {
                const current = conversation.unreadCount.get(pid.toString()) || 0;
                conversation.unreadCount.set(pid.toString(), current + 1);
            }
        });
        await conversation.save();

        res.status(201).json({ message });
    } catch (err) {
        next(err);
    }
});

// POST /api/conversations/:id/members - add member to group
router.post('/:id/members', protect, async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId required' });

        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.isGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (!conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!conversation.participants.map(String).includes(userId)) {
            conversation.participants.push(userId);
            await conversation.save();
        }

        await conversation.populate('participants', 'name email avatar status lastSeen');
        res.json({ conversation });
    } catch (err) {
        next(err);
    }
});

// PUT /api/conversations/:id/mute - toggle mute
router.put('/:id/mute', protect, async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const isMuted = conversation.mutedBy.map(String).includes(req.user._id.toString());
        if (isMuted) {
            conversation.mutedBy = conversation.mutedBy.filter(id => id.toString() !== req.user._id.toString());
        } else {
            conversation.mutedBy.push(req.user._id);
        }
        await conversation.save();
        res.json({ muted: !isMuted });
    } catch (err) {
        next(err);
    }
});

// PUT /api/conversations/:id/archive - toggle archive
router.put('/:id/archive', protect, async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const isArchived = conversation.archivedBy.map(String).includes(req.user._id.toString());
        if (isArchived) {
            conversation.archivedBy = conversation.archivedBy.filter(id => id.toString() !== req.user._id.toString());
        } else {
            conversation.archivedBy.push(req.user._id);
        }
        await conversation.save();
        res.json({ archived: !isArchived });
    } catch (err) {
        next(err);
    }
});

// PUT /api/conversations/:id/read - mark conversation as read
router.put('/:id/read', protect, async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        conversation.unreadCount.set(req.user._id.toString(), 0);
        await conversation.save();
        await Message.updateMany(
            { conversation: req.params.id, readBy: { $ne: req.user._id } },
            { $addToSet: { readBy: req.user._id } }
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        next(err);
    }
});

// PUT /api/conversations/:id/unread - mark conversation as unread (set unread to 1)
router.put('/:id/unread', protect, async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        conversation.unreadCount.set(req.user._id.toString(), 1);
        await conversation.save();
        res.json({ message: 'Marked as unread' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/conversations/:id - soft delete for current user
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !conversation.participants.map(String).includes(req.user._id.toString())) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.deletedBy.map(String).includes(req.user._id.toString())) {
            conversation.deletedBy.push(req.user._id);
            await conversation.save();
        }
        res.json({ message: 'Conversation deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
