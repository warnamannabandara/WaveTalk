const mongoose = require('mongoose');

const transcriptEntrySchema = new mongoose.Schema({
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    meetingId: { type: String, required: true, index: true },
    speaker: {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
    },
    text: { type: String, required: true },
    type: { type: String, enum: ['speech', 'sign'], default: 'speech' },
    language: { type: String, default: 'en-US' },
    confidence: { type: Number, default: 1.0 },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

// Auto-expire transcripts after 90 days
transcriptEntrySchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('MeetingTranscript', transcriptEntrySchema);
