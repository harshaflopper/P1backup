const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
    console.log('Attempting to connect to MongoDB...', process.env.MONGODB_URI);
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for migration');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

const LEGACY_DATA_PATH = 'D:/wrappedwebsite/allotment/static/faculty_json/';

const importData = async () => {
    console.log('Starting importData...');
    await connectDB();
    console.log('Connected to DB, clearing data...');

    try {
        // Clear existing data
        await Faculty.deleteMany();
        await Department.deleteMany();
        try {
            await Faculty.collection.dropIndexes();
        } catch (e) {
            console.log('No indexes to drop or error dropping indexes');
        }

        console.log('Existing data cleared');

        // Read all JSON files
        const files = fs.readdirSync(LEGACY_DATA_PATH);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        console.log(`Found ${jsonFiles.length} department files`);

        for (const file of jsonFiles) {
            const filePath = path.join(LEGACY_DATA_PATH, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const facultyList = JSON.parse(fileContent);

            // Department name from filename (e.g., "1. ARCH.json" -> "ARCH")
            // Or use the department field from the json data if available consistently
            // The filename format seems to be "index. DeptName.json" or similar.
            // Let's rely on the data inside the file first, as typically these arrays contain objects with a 'department' field.

            if (facultyList.length === 0) continue;

            // Get department from the first record, or fallback to filename
            let deptName = facultyList[0].department;

            // Normalize department name
            if (!deptName) {
                // specific fallback logic if property is missing
                const parts = file.replace('.json', '').split('.');
                if (parts.length > 1) {
                    deptName = parts[1].trim();
                } else {
                    deptName = parts[0].trim();
                }
            }

            // Create Department
            let department = await Department.findOne({ name: deptName });
            if (!department) {
                department = new Department({ name: deptName });
                await department.save();
                console.log(`Created Department: ${deptName}`);
            }

            // Create Faculty
            const facultyDocs = facultyList.map(fac => ({
                name: fac.Name || fac.name,
                initials: fac.Initials || fac.initials || 'N/A',
                designation: fac.Designation || fac.designation,
                department: deptName, // Use inferred department since it's not in the object
                email: fac.Email || fac.email || '',
                phone: fac.Phone || fac.phone || '',
                isActive: fac.isActive !== undefined ? fac.isActive : true
            }));

            // In legacy main.js, we saw data structure. It likely has:
            // name, designation, department, email, phone_number (maybe), status (active/inactive)
            // Let's check a file to be sure, but for now assuming standard keys.
            // Actually, I should probably check the `process_faculty_data.py` or one json file to be safe.
            // But I will run it and see if it fails or produces empty fields.

            if (facultyDocs.length > 0) {
                await Faculty.insertMany(facultyDocs);
                console.log(`Imported ${facultyDocs.length} faculty for ${deptName}`);
            }
        }

        console.log('Data Import Completed');
        process.exit();
    } catch (err) {
        console.error('Error with data import:', err);
        process.exit(1);
    }
};

importData();
