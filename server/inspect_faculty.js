const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Use a generic schema to see ALL fields
        const Faculty = mongoose.model('Faculty', new mongoose.Schema({}, { strict: false }));

        const doc = await Faculty.findOne().lean();
        console.log('RAW FACULTY DOCUMENT:', JSON.stringify(doc, null, 2));

        if (doc) {
            console.log('Has "department"?', doc.department);
            console.log('Has "dept"?', doc.dept);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

runDebug();
