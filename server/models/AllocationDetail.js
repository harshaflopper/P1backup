const mongoose = require('mongoose');

const allocationDetailSchema = new mongoose.Schema({
    facultyName: {
        type: String,
        required: true,
        trim: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    },
    initials: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    session: {
        type: String,
        enum: ['morning', 'afternoon'],
        required: true
    },
    room: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Deputy', 'Invigilator'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure no duplicate assignments for same person, date, session
allocationDetailSchema.index({ facultyName: 1, date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('AllocationDetail', allocationDetailSchema);
