const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReportees,
  updateManager,
  uploadProfileImage
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Get all employees (HR and Super Admin)
router.get('/', authorize('hr_manager', 'super_admin'), getEmployees);

// Get single employee
router.get('/:id', getEmployee);

// Create employee (HR and Super Admin)
router.post('/', authorize('hr_manager', 'super_admin'), createEmployee);

// Update employee
router.put('/:id', updateEmployee);

// Delete employee (Super Admin only)
router.delete('/:id', authorize('super_admin'), deleteEmployee);

// Get employee reportees
router.get('/:id/reportees', getReportees);

// Update employee manager (HR and Super Admin)
router.patch('/:id/manager', authorize('hr_manager', 'super_admin'), updateManager);

// Upload profile image
router.post('/:id/profile-image', upload.single('profileImage'), uploadProfileImage);

module.exports = router;
