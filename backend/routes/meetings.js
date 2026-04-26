const express = require('express');
const { body, validationResult } = require('express-validator');
const Meeting = require('../models/Meeting');
const MeetingTranscript = require('../models/MeetingTranscript');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/meetings
router.get('/', protect, async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {
            $or: [{ host: req.user._id }, { participants: req.user._id }]
        };
        if (status) query.status = status;

        const meetings = await Meeting.find(query)
            .populate('host', 'name email avatar')
            .populate('participants', 'name email avatar')
            .sort({ scheduledAt: -1 })
            .limit(50);

        res.json({ meetings });
    } catch (err) {
        next(err);
    }
});

// POST /api/meetings - schedule a meeting
router.post('/', protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('scheduledAt').isISO8601().withMessage('Valid date required')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
        const { title, scheduledAt, timezone, description, passcode, enableSignLanguage } = req.body;
        let meetingId = Meeting.generateMeetingId();
        // Ensure uniqueness
        while (await Meeting.findOne({ meetingId })) {
            meetingId = Meeting.generateMeetingId();
        }

        const meeting = await Meeting.create({
            title,
            meetingId,
            passcode: passcode || '',
            host: req.user._id,
            participants: [req.user._id],
            scheduledAt,
            timezone: timezone || 'UTC',
            description: description || '',
            enableSignLanguage: enableSignLanguage !== false
        });

        await meeting.populate('host', 'name email avatar');
        res.status(201).json({ meeting });
    } catch (err) {
        next(err);
    }
});

// GET /api/meetings/info/:meetingId  — look up by the short meeting code (e.g. "abc-defg-hij")
router.get('/info/:meetingId', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId })
            .populate('host', 'name email avatar')
            .populate('participants', 'name email avatar');
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        res.json({ meeting });
    } catch (err) {
        next(err);
    }
});

// GET /api/meetings/:id
router.get('/:id', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('host', 'name email avatar')
            .populate('participants', 'name email avatar');
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        res.json({ meeting });
    } catch (err) {
        next(err);
    }
});

// POST /api/meetings/join - join by meetingId + passcode
router.post('/join', protect, async (req, res, next) => {
    try {
        const { meetingId, passcode } = req.body;
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (meeting.status === 'ended') return res.status(400).json({ message: 'Meeting has ended' });
        if (meeting.passcode && meeting.passcode !== passcode) {
            return res.status(401).json({ message: 'Incorrect passcode' });
        }

        if (!meeting.participants.includes(req.user._id)) {
            meeting.participants.push(req.user._id);
            await meeting.save();
        }

        await meeting.populate('host', 'name email avatar');
        await meeting.populate('participants', 'name email avatar');
        res.json({ meeting });
    } catch (err) {
        next(err);
    }
});

// PUT /api/meetings/:id/start
router.put('/:id/start', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (meeting.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only host can start the meeting' });
        }
        meeting.status = 'active';
        meeting.startedAt = new Date();
        await meeting.save();
        res.json({ meeting });
    } catch (err) {
        next(err);
    }
});

// PUT /api/meetings/:id/end
router.put('/:id/end', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (meeting.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only host can end the meeting' });
        }
        meeting.status = 'ended';
        meeting.endedAt = new Date();
        await meeting.save();

        // Auto-save transcript as a note document
        const entries = await MeetingTranscript.find({ meetingId: meeting.meetingId }).sort({ timestamp: 1 });
        if (entries.length > 0) {
            const lines = entries.map(e =>
                `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.speaker.userName}: ${e.text}`
            ).join('\n');
            await Document.create({
                title: `Transcript: ${meeting.title}`,
                type: 'transcript',
                content: lines,
                owner: req.user._id,
                meeting: meeting._id,
                status: 'past',
                fileSize: Buffer.byteLength(lines, 'utf8'),
                tags: ['transcript', 'auto-saved'],
            });
        }

        // Auto-save recording if one was captured
        if (meeting.recording) {
            await Document.create({
                title: `Recording: ${meeting.title}`,
                type: 'recording',
                content: '',
                owner: req.user._id,
                meeting: meeting._id,
                status: 'past',
                fileUrl: meeting.recording,
                tags: ['recording', 'auto-saved'],
            });
        }

        // Mark all meeting-linked documents (e.g. chat uploads) as past
        await Document.updateMany(
            { meeting: meeting._id, status: { $ne: 'past' }, deletedAt: null },
            { $set: { status: 'past' } }
        );

        res.json({ meeting });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/meetings/:id
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (meeting.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Meeting.findByIdAndDelete(req.params.id);
        res.json({ message: 'Meeting deleted' });
    } catch (err) {
        next(err);
    }
});

// PUT /api/meetings/:id/settings — update language, noise cancellation, break interval
router.put('/:id/settings', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const { language, noiseCancellation, breakReminderInterval } = req.body;
        if (language !== undefined) meeting.language = language;
        if (noiseCancellation !== undefined) meeting.noiseCancellation = noiseCancellation;
        if (breakReminderInterval !== undefined) meeting.breakReminderInterval = breakReminderInterval;
        await meeting.save();

        res.json({ meeting });
    } catch (err) {
        next(err);
    }
});

// POST /api/meetings/info/:meetingId/documents — attach a file/report to a meeting (auto-saved as report on end)
router.post('/info/:meetingId/documents', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const { title, fileUrl, fileSize } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const doc = await Document.create({
            title,
            type: 'report',
            content: '',
            owner: req.user._id,
            meeting: meeting._id,
            status: meeting.status === 'ended' ? 'past' : 'current',
            fileUrl: fileUrl || null,
            fileSize: fileSize || 0,
            tags: ['chat-upload'],
        });

        res.status(201).json({ document: doc });
    } catch (err) {
        next(err);
    }
});

// POST /api/meetings/:meetingId/transcript — save a transcript entry
router.post('/info/:meetingId/transcript', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const { text, type, language, confidence } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });

        const entry = await MeetingTranscript.create({
            meeting: meeting._id,
            meetingId: meeting.meetingId,
            speaker: {
                userId: req.user._id.toString(),
                userName: req.user.name,
            },
            text: text.trim(),
            type: type || 'speech',
            language: language || 'en-US',
            confidence: confidence ?? 1.0,
        });

        res.status(201).json({ entry });
    } catch (err) {
        next(err);
    }
});

// GET /api/meetings/:meetingId/transcript — get transcript entries
router.get('/info/:meetingId/transcript', protect, async (req, res, next) => {
    try {
        const { limit = 200, type } = req.query;
        const filter = { meetingId: req.params.meetingId };
        if (type) filter.type = type;

        const entries = await MeetingTranscript.find(filter)
            .sort({ timestamp: 1 })
            .limit(Number(limit));

        res.json({ entries, total: entries.length });
    } catch (err) {
        next(err);
    }
});

// GET /api/meetings/:meetingId/summary — simple extractive summary
router.get('/info/:meetingId/summary', protect, async (req, res, next) => {
    try {
        const entries = await MeetingTranscript.find({ meetingId: req.params.meetingId })
            .sort({ timestamp: 1 });

        if (entries.length === 0) {
            return res.json({ summary: 'No transcript available.', wordCount: 0, entryCount: 0 });
        }

        // Group by speaker
        const bySpeaker = {};
        entries.forEach(e => {
            const name = e.speaker.userName;
            if (!bySpeaker[name]) bySpeaker[name] = [];
            bySpeaker[name].push(e.text);
        });

        // Build summary: each speaker's first + last sentence
        const speakerSummaries = Object.entries(bySpeaker).map(([name, texts]) => {
            const snippet = texts.length <= 2
                ? texts.join(' ')
                : `${texts[0]} ... ${texts[texts.length - 1]}`;
            return `${name}: ${snippet}`;
        });

        const allWords = entries.reduce((acc, e) => acc + e.text.split(' ').length, 0);
        const duration = entries.length > 1
            ? Math.round((new Date(entries[entries.length - 1].timestamp) - new Date(entries[0].timestamp)) / 60000)
            : 0;

        res.json({
            summary: speakerSummaries.join('\n\n'),
            wordCount: allWords,
            entryCount: entries.length,
            durationMinutes: duration,
            speakers: Object.keys(bySpeaker),
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/meetings/:meetingId/transcript — clear transcript (host only)
router.delete('/info/:meetingId/transcript', protect, async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (meeting.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only host can clear transcript' });
        }
        await MeetingTranscript.deleteMany({ meetingId: req.params.meetingId });
        res.json({ message: 'Transcript cleared' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
