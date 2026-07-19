export interface User {
  id: string
  username: string
  email: string
  role: 'super_admin' | 'hr_manager' | 'employee'
  employeeId?: string
  employeeDetails?: Employee
}

export interface Employee {
  _id: string
  employeeId: string
  name: string
  email: string
  phone: string
  department: string
  designation: string
  salary: number
  joiningDate: string
  status: 'active' | 'inactive' | 'on_leave'
  role: 'super_admin' | 'hr_manager' | 'employee'
  reportingManager?: Employee | null
  profileImage?: string | null
  createdAt: string
  updatedAt: string
  children?: Employee[]
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface EmployeeListResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  data: Employee[]
}

export interface StatsResponse {
  success: boolean
  data: {
    totalEmployees: number
    activeEmployees: number
    inactiveEmployees: number
    departmentCounts: Array<{ _id: string; count: number }>
    roleCounts: Array<{ _id: string; count: number }>
    recentHires: number
  }
}
