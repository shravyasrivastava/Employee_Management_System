const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Employee = require('./models/Employee');

require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    console.log('Cleared existing data');

    // Create Super Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    // Create Super Admin Employee Profile
    const superAdminEmployee = await Employee.create({
      employeeId: 'EMP001',
      name: 'Super Admin',
      email: 'admin@example.com',
      phone: '+1 234 567 8900',
      department: 'IT',
      designation: 'Super Administrator',
      salary: 150000,
      joiningDate: new Date('2020-01-01'),
      status: 'active',
      role: 'super_admin',
      reportingManager: null
    });

    // Link user to employee
    superAdmin.employeeId = superAdminEmployee._id;
    await superAdmin.save();

    // Create HR Manager
    const hrPassword = await bcrypt.hash('hr123', 10);
    const hrManager = await User.create({
      username: 'hrmanager',
      email: 'hr@example.com',
      password: hrPassword,
      role: 'hr_manager'
    });

    const hrEmployee = await Employee.create({
      employeeId: 'EMP002',
      name: 'HR Manager',
      email: 'hr@example.com',
      phone: '+1 234 567 8901',
      department: 'HR',
      designation: 'HR Manager',
      salary: 80000,
      joiningDate: new Date('2021-03-15'),
      status: 'active',
      role: 'hr_manager',
      reportingManager: superAdminEmployee._id
    });

    hrManager.employeeId = hrEmployee._id;
    await hrManager.save();

    // Create sample employees
    const departments = ['Engineering', 'Finance', 'Marketing', 'Sales', 'Operations'];
    const designations = ['Software Engineer', 'Financial Analyst', 'Marketing Manager', 'Sales Representative', 'Operations Manager'];
    
    for (let i = 0; i < 10; i++) {
      const empPassword = await bcrypt.hash(`emp${i + 1}123`, 10);
      const empId = `EMP00${i + 3}`;
      
      const user = await User.create({
        username: `employee${i + 1}`,
        email: `employee${i + 1}@example.com`,
        password: empPassword,
        role: 'employee'
      });

      const employee = await Employee.create({
        employeeId: empId,
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@example.com`,
        phone: `+1 234 567 89${i + 2}`,
        department: departments[i % departments.length],
        designation: designations[i % designations.length],
        salary: 50000 + (i * 5000),
        joiningDate: new Date(2022, i, 1),
        status: i % 3 === 0 ? 'inactive' : 'active',
        role: 'employee',
        reportingManager: i < 5 ? hrEmployee._id : superAdminEmployee._id
      });

      user.employeeId = employee._id;
      await user.save();
    }

    console.log('Database seeded successfully');
    console.log('\nDefault credentials:');
    console.log('Super Admin - Username: admin, Password: admin123');
    console.log('HR Manager - Username: hrmanager, Password: hr123');
    console.log('Employees - Username: employee1-10, Password: emp1-10 + 123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
