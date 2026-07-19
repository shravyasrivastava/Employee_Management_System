const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'IT']
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  joiningDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['super_admin', 'hr_manager', 'employee'],
    default: 'employee'
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for search
employeeSchema.index({ name: 'text', email: 'text', employeeId: 'text' });

// Method to check if employee can be assigned as manager (prevent circular reporting)
employeeSchema.methods.canAssignManager = async function(newManagerId) {
  if (!newManagerId) return true;
  if (this._id.toString() === newManagerId.toString()) return false;
  
  // Check if new manager is already a reportee of this employee
  const reportees = await mongoose.model('Employee').find({ reportingManager: this._id });
  const reporteeIds = reportees.map(r => r._id.toString());
  
  if (reporteeIds.includes(newManagerId.toString())) return false;
  
  return true;
};

module.exports = mongoose.model('Employee', employeeSchema);
