const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyUser = async () => {
    try {
        await connectDB();
        const users = await User.find({});
        console.log('Total users found:', users.length);
        users.forEach(u => {
            console.log(`- ${u.username} (Role: ${u.role})`);
        });
        process.exit();
    } catch (error) {
        console.error('Error verifying users:', error);
        process.exit(1);
    }
};

verifyUser();
