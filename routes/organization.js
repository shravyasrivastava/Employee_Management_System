const express = require('express');
const router = express.Router();
const { getOrganizationTree, getStats } = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/tree', getOrganizationTree);
router.get('/stats', getStats);

module.exports = router;
