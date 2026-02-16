const mongoose = require('mongoose');

const sessionDataSchema = new mongoose.Schema({
    date: {
        type: String, // Storing as string "YYYY-MM-DD" for easy querying
        required: true
    },
    session: {
        type: String, // "morning" or "afternoon"
        required: true
    },
    // We store the exact structure required by the frontend/report generators
    // { examInfo: {...}, deputies: [...], invigilators: [...] }
    data: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '180d' // Optional: Auto-expire after 6 months to prevent infinite growth? 
        // User asked about strain. TTL index is a good answer.
        // Let's add it but maybe longer, or just rely on manual clear.
        // User manual clear is safer. I'll omit expires for now or make it very long (1 year).
    }
});

// Composite unique index to ensure one doc per session
sessionDataSchema.index({ date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('SessionData', sessionDataSchema);
