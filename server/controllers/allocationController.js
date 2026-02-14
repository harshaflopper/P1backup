const AllocationDetail = require('../models/AllocationDetail');
const Faculty = require('../models/Faculty');

// @desc    Save bulk allocations
// @route   POST /api/allocations
// @access  Public
exports.saveAllocations = async (req, res) => {
    try {
        const sessionData = req.body; // Expecting the structure from parseSessionData
        console.log('Received allocation data for dates:', Object.keys(sessionData));
        const allocations = [];

        // Iterate through dates and sessions to extract allocations
        for (const date in sessionData) {
            for (const session in sessionData[date]) {
                const sessionInfo = sessionData[date][session];

                // Process Deputies
                if (sessionInfo.deputies) {
                    for (const deputy of sessionInfo.deputies) {
                        allocations.push({
                            name: deputy.name,
                            initials: deputy.initials,
                            designation: deputy.designation,
                            role: 'Deputy',
                            date,
                            session,
                            room: 'Control Room' // Usually deputies are in control room or roaming
                        });
                    }
                }

                // Process Invigilators
                if (sessionInfo.invigilators) {
                    for (const invigilator of sessionInfo.invigilators) {
                        allocations.push({
                            name: invigilator.name,
                            initials: invigilator.initials,
                            designation: invigilator.designation,
                            role: 'Invigilator',
                            date,
                            session,
                            room: invigilator.room || 'Unassigned'
                        });
                    }
                }
            }
        }

        const stats = {
            total: allocations.length,
            matched: 0,
            inserted: 0,
            errors: 0
        };

        // Process each allocation
        for (const alloc of allocations) {
            // Try to find faculty by initials (primary) or name (fallback)
            let faculty = await Faculty.findOne({ initials: alloc.initials });
            if (!faculty) {
                faculty = await Faculty.findOne({ name: alloc.name });
            }

            if (faculty) stats.matched++;

            const allocationData = {
                facultyName: alloc.name,
                facultyId: faculty ? faculty._id : null,
                initials: alloc.initials || 'NA',
                designation: alloc.designation || 'Staff',
                date: alloc.date,
                session: alloc.session,
                room: alloc.room,
                role: alloc.role
            };

            // Upsert: Update if exists, Insert if not
            // Identification based on Name + Date + Session (assuming one duty per session)
            // actually standard upsert might be better with composite key.
            // But here we might want to just clear old ones for this date? 
            // For now, let's use check existing.

            await AllocationDetail.findOneAndUpdate(
                {
                    facultyName: alloc.name,
                    date: alloc.date,
                    session: alloc.session
                },
                allocationData,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            stats.inserted++;
        }

        res.json({ msg: 'Allocations process completed', stats });

    } catch (err) {
        console.error('Allocation Save Error:', err);
        res.status(500).send(`Server Error: ${err.message}`);
    }
};

// @desc    Get allocations for a specific faculty
// @route   GET /api/allocations/faculty/:id
// @access  Public
exports.getFacultyAllocations = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if id is a valid ObjectId, if so search by facultyId
        // If not, it might be initials or name (though route param suggests ID)
        // Let's support ID lookups primarily, but also query by initials if passed as query param

        let query = { facultyId: id };

        // If checking by internal ID
        const allocations = await AllocationDetail.find(query).sort({ date: 1 });
        res.json(allocations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Search allocations (by name or initials)
// @route   GET /api/allocations/search
// @access  Public
exports.searchAllocations = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ msg: 'Query parameter q is required' });

        const allocations = await AllocationDetail.find({
            $or: [
                { facultyName: { $regex: q, $options: 'i' } },
                { initials: { $regex: q, $options: 'i' } }
            ]
        }).sort({ date: 1 });

        res.json(allocations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Clear all allocations
// @route   DELETE /api/allocations
// @access  Public
exports.clearAllocations = async (req, res) => {
    try {
        await AllocationDetail.deleteMany({});
        res.json({ msg: 'All allocations cleared successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all allocations (for export)
// @route   GET /api/allocations
// @access  Public
exports.getAllAllocations = async (req, res) => {
    try {
        const allocations = await AllocationDetail.find()
            .populate('facultyId', 'department')
            .sort({ date: 1, session: 1 });
        res.json(allocations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
