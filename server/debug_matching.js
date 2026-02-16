const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/exam_allotment');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err.message);
        process.exit(1);
    }
    const SessionData = require('./models/SessionData');

    const facultyList = await Faculty.find();
    const sessionDocs = await SessionData.find();

    console.log(`Loaded ${facultyList.length} faculty from DB.`);
    console.log(`Loaded ${sessionDocs.length} session docs from DB.`);

    // 1. Build Map (Current Logic)
    const facultyMap = {};
    facultyList.forEach(f => {
        if (f.initials) facultyMap[f.initials.trim().toLowerCase()] = f;
        if (f.name) facultyMap[f.name.trim().toLowerCase()] = f;
    });

    // 2. Test Matching against Session Data
    let totalPeople = 0;
    let matches = 0;
    let failures = [];

    sessionDocs.forEach(doc => {
        const data = doc.data;
        const people = [...(data.invigilators || []), ...(data.deputies || [])];

        people.forEach(p => {
            totalPeople++;
            const rawName = p.name || '';
            const rawInitials = p.initials || '';

            const cleanName = rawName.trim().toLowerCase();
            const cleanInitials = rawInitials.trim().toLowerCase();

            // Current Logic
            let match = facultyMap[cleanInitials] || facultyMap[cleanName];

            // Heuristic 1: Strip Dr/Prof
            if (!match && cleanName) {
                const stripped = cleanName.replace(/^dr\.\s*|^prof\.\s*/i, '').trim();
                match = facultyMap[stripped];
            }

            // Heuristic 2: SUPER NORMALIZE (Remove all dots and spaces)
            if (!match && cleanName) {
                // Build a Super Map on the fly just for testing? 
                // Or just normalize target and scan? 
                // Scanning is slow O(N*M) but fine for debug script.

                const superNormalize = (s) => s.replace(/^dr\.\s*|^prof\.\s*/i, '').replace(/[\.\s]/g, '').toLowerCase();
                const target = superNormalize(rawName);

                const found = facultyList.find(f => superNormalize(f.name) === target ||
                    (f.initials && superNormalize(f.initials) === superNormalize(rawInitials)));
                if (found) match = found;
            }

            if (match) {
                matches++;
            } else {
                if (failures.length < 20) {
                    failures.push({ name: rawName, initials: rawInitials });
                }
            }
        });
    });

    console.log(`\nResults: ${matches} / ${totalPeople} matched.`);
    console.log(`Failures (First 20):`);
    failures.forEach(f => console.log(` - Name: "${f.name}", Initials: "${f.initials}"`));

    // Also print some sample Faculty names to see what we have
    console.log(`\nSample DB Faculty Names (First 10):`);
    facultyList.slice(0, 10).forEach(f => console.log(` - "${f.name}" (${f.initials})`));

    process.exit();
};

runDebug();
