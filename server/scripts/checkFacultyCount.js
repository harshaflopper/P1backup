const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('../models/Faculty');

dotenv.config();

const checkCount = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const count = await Faculty.countDocuments();
        console.log(`Faculty count: ${count}`);

        if (count === 0) {
            console.log('Database is empty.');
        } else {
            const faculty = await Faculty.find().limit(1);
            console.log('Sample faculty:', faculty);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkCount();
