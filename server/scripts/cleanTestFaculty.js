const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('../models/Faculty');
const AllocationDetail = require('../models/AllocationDetail');

dotenv.config({ path: '../.env' }); // Adjust path if needed, assuming run from scripts folder

const cleanData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('Cleaning Test Faculty...');

        const facultyRes = await Faculty.deleteMany({ name: /^Test Faculty/ });
        console.log(`Deleted ${facultyRes.deletedCount} faculties.`);

        const allocRes = await AllocationDetail.deleteMany({ facultyName: /^Test Faculty/ });
        console.log(`Deleted ${allocRes.deletedCount} allocations.`);

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

cleanData();
