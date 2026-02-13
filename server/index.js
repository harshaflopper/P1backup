const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('Faculty Exam Allotment API is running');
});

// Import Routes
const facultyRoutes = require('./routes/facultyRoutes');
app.use('/api/faculty', facultyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
