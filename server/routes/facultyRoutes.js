const express = require('express');
const router = express.Router();
const {
    getFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    toggleStatus
} = require('../controllers/facultyController');

router.get('/', getFaculty);
router.post('/', addFaculty);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);
router.patch('/:id/toggle', toggleStatus);

module.exports = router;
