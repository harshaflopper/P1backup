const mongoose = require('mongoose');

const sessionConfigSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    session: {
        type: String,
        enum: ['morning', 'afternoon'],
        required: true
    },
    rooms: {
        type: Number,
        default: 0
    },
    relievers: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique config per session
sessionConfigSchema.index({ date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('SessionConfig', sessionConfigSchema);
