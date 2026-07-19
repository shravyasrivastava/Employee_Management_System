const Employee = require('../models/Employee');

// @desc    Get organization tree
// @route   GET /api/organization/tree
// @access  Private
exports.getOrganizationTree = async (req, res, next) => {
  try {
    // Get all employees
    const employees = await Employee.find({ isDeleted: false })
      .populate('reportingManager', 'name employeeId email')
      .sort({ name: 1 });
    
    // Build tree structure
    const employeeMap = {};
    const tree = [];
    
    // Create map of employees
    employees.forEach(emp => {
      employeeMap[emp._id.toString()] = {
        ...emp.toObject(),
        children: []
      };
    });
    
    // Build tree
    employees.forEach(emp => {
      const node = employeeMap[emp._id.toString()];
      if (emp.reportingManager) {
        const managerId = emp.reportingManager._id.toString();
        if (employeeMap[managerId]) {
          employeeMap[managerId].children.push(node);
        }
      } else {
        // Top level employees (no manager)
        tree.push(node);
      }
    });
    
    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/organization/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isDeleted: false });
    const activeEmployees = await Employee.countDocuments({ 
      isDeleted: false,
      status: 'active'
    });
    const inactiveEmployees = await Employee.countDocuments({ 
      isDeleted: false,
      status: 'inactive'
    });
    
    // Department counts
    const departmentCounts = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Role counts
    const roleCounts = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await Employee.countDocuments({
      isDeleted: false,
      joiningDate: { $gte: thirtyDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentCounts,
        roleCounts,
        recentHires
      }
    });
  } catch (error) {
    next(error);
  }
};
