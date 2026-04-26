const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    meetingId: { type: String, required: true, unique: true },
    passcode: { type: String, default: '' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
    enableSignLanguage: { type: Boolean, default: true },
    timezone: { type: String, default: 'UTC' },
    description: { type: String, default: '' },
    recording: { type: String, default: null },
    language: { type: String, default: 'en-US' },
    noiseCancellation: { type: Boolean, default: true },
    breakReminderInterval: { type: Number, default: 30 }, // minutes
    transcriptSummary: { type: String, default: '' }
}, { timestamps: true });

// Generate unique meeting ID
meetingSchema.statics.generateMeetingId = function () {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
        if (i === 3 || i === 7) id += '-';
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
};

module.exports = mongoose.model('Meeting', meetingSchema);
