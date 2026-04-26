const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['report', 'note', 'recording', 'transcript', 'other'], default: 'note' },
    content: { type: String, default: '' },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
    status: { type: String, enum: ['past', 'current', 'upcoming'], default: 'current' },
    fileUrl: { type: String, default: null },
    fileSize: { type: Number, default: 0 },
    tags: [{ type: String }],
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
