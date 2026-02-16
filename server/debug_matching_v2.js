const mongoose = require('mongoose');

// HARDCODED URI for debugging ease
const MONGO_URI = 'mongodb+srv://chandruharsha8_db_user:Harsha123@cluster0.c6fuzka.mongodb.net/?appName=Cluster0';

const runDebug = async () => {
    console.log('Starting debug script...');
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err.message);
        process.exit(1);
    }

    try {
        // Define schemas inline to avoid require issues
        const Faculty = mongoose.model('Faculty', new mongoose.Schema({
            name: String, initials: String, phone: String, department: String
        }));
        // Safe SessionData schema
        const SessionData = mongoose.model('SessionData', new mongoose.Schema({}, { strict: false }));

        const facultyList = await Faculty.find();
        const sessionDocs = await SessionData.find();

        console.log(`Loaded ${facultyList.length} faculty from DB.`);
        const facultyWithDept = facultyList.filter(f => f.department).length;
        console.log(`Faculty with Department: ${facultyWithDept}/${facultyList.length}`);

        // 1. Build Map
        const facultyMap = {};
        facultyList.forEach(f => {
            if (f.initials) facultyMap[f.initials.trim().toLowerCase()] = f;
            if (f.name) facultyMap[f.name.trim().toLowerCase()] = f;
        });

        // 2. Test Matching
        let matches = 0;
        let failures = [];
        let totalChecks = 0;

        sessionDocs.forEach(doc => {
            const data = doc.toObject().data || {};
            const people = [...(data.invigilators || []), ...(data.deputies || [])];

            people.forEach(p => {
                totalChecks++;
                const rawName = p.name || '';
                const rawInitials = p.initials || '';
                const cleanName = rawName.trim().toLowerCase();

                let match = facultyMap[cleanName] || facultyMap[rawInitials.trim().toLowerCase()];

                if (!match && cleanName) {
                    const stripped = cleanName.replace(/^dr\.\s*|^prof\.\s*/i, '').trim();
                    match = facultyMap[stripped];
                }

                if (match) {
                    matches++;
                } else {
                    if (failures.length < 10) failures.push(`${rawName} (${rawInitials})`);
                }
            });
        });

        console.log(`Matched: ${matches}/${totalChecks}`);
        console.log('Failures (Sample):', failures);
        console.log('Sample DB Names:', facultyList.slice(0, 5).map(f => f.name));

    } catch (err) {
        console.error('Logic Error:', err);
    } finally {
        console.log('Done.');
        process.exit(0);
    }
};

runDebug();
