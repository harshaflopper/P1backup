const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/allocations
// @desc    Save bulk allocations
// @access  Private/Admin
router.post('/', protect, admin, allocationController.saveAllocations);

// @route   DELETE /api/allocations
// @desc    Clear all allocations
// @access  Private/Admin
router.delete('/', protect, admin, allocationController.clearAllocations);

// @route   GET /api/allocations
// @desc    Get all allocations
// @access  Public
router.get('/', allocationController.getAllAllocations);

// @route   GET /api/allocations/search
// @desc    Search allocations
// @access  Public
router.get('/search', allocationController.searchAllocations);

// @route   GET /api/allocations/faculty/:id
// @desc    Get allocations for a specific faculty ID
// @access  Public
router.get('/faculty/:id', allocationController.getFacultyAllocations);


module.exports = router;
