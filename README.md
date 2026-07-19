# Employee Management System (EMS)

A comprehensive Employee Management System with secure authentication, role-based access control, employee management, and organizational hierarchy.

## Features

### Authentication
- Secure login with JWT tokens
- User registration/signup
- Password hashing with bcrypt
- Protected routes
- Logout functionality

### Role-Based Access Control (RBAC)
- **Super Admin**: Full access, assign roles/managers, CRUD operations
- **HR Manager**: Create/Edit/View employees, cannot delete or assign Super Admin
- **Employee**: View/edit own profile only (limited fields)

### Dashboard
- Total employees count
- Active/Inactive employees
- Department-wise distribution
- Role-wise distribution
- Recent hires (last 30 days)
- Interactive charts (Bar chart for departments, Pie chart for roles)
- Dark mode support
- Animated cards and charts

### Employee Management
- Full CRUD operations
- Search by name/email
- Filter by department, role, status
- Sort by joining date and name
- Pagination
- Soft delete
- Profile image upload
- Employee detail view page
- Employee edit page
- Fields: Employee ID, Name, Email, Phone, Department, Designation, Salary, Joining Date, Status, Role, Reporting Manager, Profile Image

### Organizational Hierarchy
- Assign reporting manager
- Display reporting tree
- Prevent circular reporting
- Show direct reports

### Validation
- Frontend and backend validation
- Email, phone, salary validation
- Required field validation
- Real-time error messages
- Toast notifications for user feedback

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Tokens)
- bcrypt (password hashing)
- express-validator
- express-rate-limit (API rate limiting)
- multer (file upload)

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Recharts (charts)
- Lucide React (icons)
- Axios (HTTP client)

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Credentials

After setting up the database, you'll need to create a Super Admin user. You can do this via the API or directly in MongoDB.

**Default Super Admin** (create via API or MongoDB):
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`
- Role: `super_admin`

## API Documentation

### Authentication Endpoints

#### Register
- **POST** `/api/auth/register`
- **Body**: `{ "username": "string", "email": "string", "password": "string" }`
- **Response**: `{ "success": true, "message": "User created successfully" }`

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ "username": "string", "password": "string" }`
- **Response**: `{ "success": true, "token": "jwt_token", "user": {...} }`

#### Logout
- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "message": "Logged out successfully" }`

#### Get Current User
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "user": {...} }`

### Employee Endpoints

#### Get All Employees
- **GET** `/api/employees`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `search`, `department`, `role`, `status`, `sortBy`, `sortOrder`, `page`, `limit`
- **Response**: `{ "success": true, "data": [...], "total": number, "page": number, "pages": number }`
- **Access**: HR Manager, Super Admin

#### Get Single Employee
- **GET** `/api/employees/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "data": {...} }`
- **Access**: All (employees can only view their own profile)

#### Create Employee
- **POST** `/api/employees`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Employee object with all required fields
- **Response**: `{ "success": true, "data": {...} }`
- **Access**: HR Manager, Super Admin

#### Update Employee
- **PUT** `/api/employees/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Partial employee object
- **Response**: `{ "success": true, "data": {...} }`
- **Access**: All (employees can only update limited fields)

#### Delete Employee (Soft Delete)
- **DELETE** `/api/employees/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "message": "Employee deleted successfully" }`
- **Access**: Super Admin only

#### Get Employee Reportees
- **GET** `/api/employees/:id/reportees`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "data": [...] }`
- **Access**: All

#### Update Employee Manager
- **PATCH** `/api/employees/:id/manager`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "reportingManager": "manager_id_or_null" }`
- **Response**: `{ "success": true, "data": {...} }`
- **Access**: HR Manager, Super Admin

#### Upload Profile Image
- **POST** `/api/employees/:id/profile-image`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**: `FormData with 'profileImage' file`
- **Response**: `{ "success": true, "data": {...} }`
- **Access**: All (employees can only upload their own profile image)

### Organization Endpoints

#### Get Organization Tree
- **GET** `/api/organization/tree`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "data": [...] }`
- **Access**: All

#### Get Dashboard Statistics
- **GET** `/api/organization/stats`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "data": {...} }`
- **Access**: All

## Project Structure

```
employee-management-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── organizationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Employee.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   └── organization.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── profile/
│   │   │   ├── organization/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── lib/
│   │   │   ├── axios.ts
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.example
└── README.md
```

## Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: 'super_admin', 'hr_manager', 'employee'),
  employeeId: ObjectId (ref: Employee),
  isActive: Boolean (default: true)
}
```

### Employee Model
```javascript
{
  employeeId: String (required, unique),
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  department: String (enum: 'Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'IT'),
  designation: String (required),
  salary: Number (required, min: 0),
  joiningDate: Date (required),
  status: String (enum: 'active', 'inactive', 'on_leave'),
  role: String (enum: 'super_admin', 'hr_manager', 'employee'),
  reportingManager: ObjectId (ref: Employee),
  profileImage: String,
  isDeleted: Boolean (default: false),
  deletedAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes with middleware
- Role-based access control
- Input validation on both frontend and backend
- CORS configuration
- Error handling middleware
- API rate limiting (express-rate-limit)
- Comprehensive error logging

## Deployment

### Using Docker (Recommended)

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000
- MongoDB on port 27017

### Manual Deployment

#### Backend Deployment
1. Set environment variables in production
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Use a strong JWT_SECRET
4. Deploy to platforms like Vercel, Railway, or AWS

#### Frontend Deployment
1. Set NEXT_PUBLIC_API_URL to production backend URL
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or similar platforms

## Bonus Features Implemented

- ✅ Pagination
- ✅ Soft Delete
- ✅ Dashboard Charts
- ✅ Dark Mode support (via Tailwind)
- ✅ Search, Filter & Sorting
- ✅ Circular reporting prevention
- ✅ Toast notifications for user feedback
- ✅ Loading skeletons and spinners
- ✅ Confirmation modals for delete actions
- ✅ Profile image upload
- ✅ Employee self-profile edit page
- ✅ User registration/signup
- ✅ API rate limiting
- ✅ Comprehensive error handling
- ✅ Animated UI components
- ✅ Enhanced dashboard with gradient cards and hover effects
- ✅ CSV Export functionality
- ✅ Improved organization tree visualization with role-based colors
- ✅ Docker support for easy deployment
- ✅ Enhanced UI/UX with smooth animations and transitions

## Future Enhancements

- CSV Import (bonus)
- Unit Tests (bonus)
- Email notifications
- Performance reviews
- Leave management
- Payroll integration
- Advanced reporting
- Mobile app

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
