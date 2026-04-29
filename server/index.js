const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Database Connection
const connectDB = require('./config/db');
const seedDatabase = require('./utils/autoSeed');
connectDB().then(async () => {
    seedDatabase();
    
    try {
        console.log('Database connected successfully.');
    } catch (err) {
        console.error('DEBUG DUMP ERROR:', err);
    }
});

// Routes
app.get('/', (req, res) => {
    res.send('Faculty Exam Allotment API is running');
});

// Import Routes
const facultyRoutes = require('./routes/facultyRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/faculty', facultyRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

// Force restart for Department Fix v2 (LEAN query)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - DEPT FIX v2 ACTIVE`);
});