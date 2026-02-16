const express = require('express');
const router = express.Router();
const {
    getFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    toggleStatus
} = require('../controllers/facultyController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getFaculty);
router.post('/', protect, admin, addFaculty);
router.put('/:id', protect, admin, updateFaculty);
router.delete('/:id', protect, admin, deleteFaculty);
router.patch('/:id/toggle', protect, admin, toggleStatus);

module.exports = router;
