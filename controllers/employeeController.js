const Employee = require('../models/Employee');
const User = require('../models/User');
const upload = require('../middleware/upload');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR Manager and Super Admin)
exports.getEmployees = async (req, res, next) => {
  try {
    const { 
      search, 
      department, 
      role, 
      status, 
      sortBy = 'name', 
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build query
    let query = { isDeleted: false };
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by department
    if (department) {
      query.department = department;
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const employees = await Employee.find(query)
      .populate('reportingManager', 'name employeeId email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Employee.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    }).populate('reportingManager', 'name employeeId email');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if user has permission to view this employee
    if (req.user.role === 'employee' && req.user.employeeId.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this employee' });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (HR Manager and Super Admin)
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status,
      role,
      reportingManager,
      password
    } = req.body;
    
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ 
      $or: [{ employeeId }, { email }] 
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        message: 'Employee with this ID or email already exists' 
      });
    }
    
    // Validate role assignment
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only Super Admin can assign Super Admin role' 
      });
    }
    
    // Validate reporting manager assignment
    if (reportingManager) {
      const manager = await Employee.findById(reportingManager);
      if (!manager) {
        return res.status(400).json({ message: 'Reporting manager not found' });
      }
      
      // Check for circular reporting
      const tempEmployee = new Employee({ reportingManager });
      const canAssign = await tempEmployee.canAssignManager(reportingManager);
      if (!canAssign) {
        return res.status(400).json({ 
          message: 'Cannot assign this manager - circular reporting detected' 
        });
      }
    }
    
    // Create employee
    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status: status || 'active',
      role: role || 'employee',
      reportingManager
    });
    
    // Create user account for the employee
    const username = email.split('@')[0];
    const userPassword = password || username + '123';
    
    const user = await User.create({
      username,
      email,
      password: userPassword,
      role: role || 'employee',
      employeeId: employee._id
    });
    
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('reportingManager', 'name employeeId email');
    
    res.status(201).json({
      success: true,
      data: populatedEmployee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check permissions
    if (req.user.role === 'employee') {
      // Employees can only edit their own profile with limited fields
      if (req.user.employeeId.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this employee' });
      }
      
      // Restrict fields employees can update
      const allowedFields = ['phone', 'profileImage'];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every(update => allowedFields.includes(update));
      
      if (!isValidOperation) {
        return res.status(403).json({ 
          message: 'Employees can only update phone and profile image' 
        });
      }
    }
    
    // Validate role changes
    if (req.body.role && req.body.role !== employee.role) {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ 
          message: 'Only Super Admin can change roles' 
        });
      }
      
      if (req.body.role === 'super_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ 
          message: 'Cannot assign Super Admin role' 
        });
      }
    }
    
    // Validate reporting manager changes
    if (req.body.reportingManager) {
      if (req.body.reportingManager.toString() === employee._id.toString()) {
        return res.status(400).json({ 
          message: 'Cannot assign self as reporting manager' 
        });
      }
      
      const manager = await Employee.findById(req.body.reportingManager);
      if (!manager) {
        return res.status(400).json({ message: 'Reporting manager not found' });
      }
      
      const canAssign = await employee.canAssignManager(req.body.reportingManager);
      if (!canAssign) {
        return res.status(400).json({ 
          message: 'Cannot assign this manager - circular reporting detected' 
        });
      }
    }
    
    // Update employee
    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('reportingManager', 'name employeeId email');
    
    // Update user if email or role changed
    if (req.body.email || req.body.role) {
      const user = await User.findOne({ employeeId: employee._id });
      if (user) {
        if (req.body.email) user.email = req.body.email;
        if (req.body.role) user.role = req.body.role;
        await user.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee (soft delete)
// @route   DELETE /api/employees/:id
// @access  Private (Super Admin only)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if employee has reportees
    const reportees = await Employee.countDocuments({ 
      reportingManager: req.params.id,
      isDeleted: false
    });
    
    if (reportees > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete employee with direct reports. Reassign reportees first.' 
      });
    }
    
    // Soft delete
    employee.isDeleted = true;
    employee.deletedAt = new Date();
    await employee.save();
    
    // Deactivate user account
    const user = await User.findOne({ employeeId: employee._id });
    if (user) {
      user.isActive = false;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee reportees
// @route   GET /api/employees/:id/reportees
// @access  Private
exports.getReportees = async (req, res, next) => {
  try {
    const manager = await Employee.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    
    const reportees = await Employee.find({ 
      reportingManager: req.params.id,
      isDeleted: false
    }).populate('reportingManager', 'name employeeId email');
    
    res.status(200).json({
      success: true,
      count: reportees.length,
      data: reportees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee manager
// @route   PATCH /api/employees/:id/manager
// @access  Private (HR Manager and Super Admin)
exports.updateManager = async (req, res, next) => {
  try {
    const { reportingManager } = req.body;
    
    const employee = await Employee.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    if (reportingManager) {
      const manager = await Employee.findById(reportingManager);
      if (!manager) {
        return res.status(400).json({ message: 'Reporting manager not found' });
      }
      
      const canAssign = await employee.canAssignManager(reportingManager);
      if (!canAssign) {
        return res.status(400).json({ 
          message: 'Cannot assign this manager - circular reporting detected' 
        });
      }
    }
    
    employee.reportingManager = reportingManager || null;
    await employee.save();
    
    const updatedEmployee = await Employee.findById(employee._id)
      .populate('reportingManager', 'name employeeId email');
    
    res.status(200).json({
      success: true,
      data: updatedEmployee,
      message: 'Manager updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile image
// @route   POST /api/employees/:id/profile-image
// @access  Private
exports.uploadProfileImage = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check permissions
    if (req.user.role === 'employee') {
      if (req.user.employeeId.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this employee' });
      }
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    employee.profileImage = req.file.filename;
    await employee.save();
    
    res.status(200).json({
      success: true,
      data: employee,
      message: 'Profile image uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};
