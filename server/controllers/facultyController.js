const Faculty = require('../models/Faculty');
const Department = require('../models/Department');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Public
exports.getFaculty = async (req, res) => {
    try {
        const { department } = req.query;
        let query = {};

        if (department) {
            query.department = department;
        }

        const faculty = await Faculty.find(query).sort({ name: 1 });
        res.json(faculty);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add new faculty
// @route   POST /api/faculty
// @access  Public
exports.addFaculty = async (req, res) => {
    const { name, initials, designation, department, email, phone } = req.body;

    try {
        const newFaculty = new Faculty({
            name,
            initials,
            designation,
            department,
            email,
            phone
        });

        const faculty = await newFaculty.save();
        res.json(faculty);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Public
exports.updateFaculty = async (req, res) => {
    const { name, initials, designation, department, email, phone, isActive } = req.body;

    // Build faculty object
    const facultyFields = {};
    if (name) facultyFields.name = name;
    if (initials) facultyFields.initials = initials;
    if (designation) facultyFields.designation = designation;
    if (department) facultyFields.department = department;
    if (email) facultyFields.email = email;
    if (phone) facultyFields.phone = phone;
    if (isActive !== undefined) facultyFields.isActive = isActive;

    try {
        let faculty = await Faculty.findById(req.params.id);

        if (!faculty) return res.status(404).json({ msg: 'Faculty not found' });

        faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            { $set: facultyFields },
            { new: true }
        );

        res.json(faculty);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Public
exports.deleteFaculty = async (req, res) => {
    try {
        let faculty = await Faculty.findById(req.params.id);

        if (!faculty) return res.status(404).json({ msg: 'Faculty not found' });

        await Faculty.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Faculty removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Toggle faculty status
// @route   PATCH /api/faculty/:id/toggle
// @access  Public
exports.toggleStatus = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ msg: 'Faculty not found' });

        faculty.isActive = !faculty.isActive;
        await faculty.save();

        res.json(faculty);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
