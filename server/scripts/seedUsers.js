const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
    try {
        await connectDB();

        // Check if users exist
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin user created');
        }

        const userExists = await User.findOne({ username: 'user' });
        if (!userExists) {
            await User.create({
                username: 'user',
                password: 'user123',
                role: 'user'
            });
            console.log('Regular user created');
        }

        console.log('User seeding completed');
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
