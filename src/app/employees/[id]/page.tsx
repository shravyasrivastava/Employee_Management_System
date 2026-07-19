'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import api from '@/lib/axios'
import { Employee } from '@/types'
import { ArrowLeft, Mail, Phone, Building2, Calendar, DollarSign, User, Shield, Edit } from 'lucide-react'
import { formatDate, formatCurrency, getInitials } from '@/lib/utils'
import Skeleton from '@/components/Skeleton'

export default function EmployeeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchEmployee()
  }, [router, params.id])

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${params.id}`)
      setEmployee(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employee details')
      ;(window as any).toast?.add('error', err.response?.data?.message || 'Failed to fetch employee details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      on_leave: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      hr_manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[role as keyof typeof styles]}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user || {}} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center space-x-6 mb-8">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user || {}} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error || 'Employee not found'}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
              <p className="text-gray-600 mt-1">View complete employee information</p>
            </div>
            {(user.role === 'hr_manager' || user.role === 'super_admin') && (
              <button
                onClick={() => router.push(`/employees/${employee._id}/edit`)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                <Edit size={18} />
                <span>Edit Employee</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-primary-600">
                  {getInitials(employee.name)}
                </span>
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-3xl font-bold">{employee.name}</h2>
                <p className="text-primary-100 text-lg mt-1">{employee.designation}</p>
                <div className="flex items-center space-x-3 mt-3">
                  {getStatusBadge(employee.status)}
                  {getRoleBadge(employee.role)}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Employee ID */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-gray-500 mb-2">
                  <User size={18} />
                  <span className="text-sm font-medium">Employee ID</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{employee.employeeId}</p>
              </div>

              {/* Email */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-gray-500 mb-2">
                  <Mail size={18} />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{employee.email}</p>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-gray-500 mb-2">
                  <Phone size={18} />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{employee.phone}</p>
              </div>

              {/* Department */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-gray-500 mb-2">
                  <Building2 size={18} />
                  <span className="text-sm font-medium">Department</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{employee.department}</p>
              </div>

              {/* Joining Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-gray-500 mb-2">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Joining Date</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatDate(employee.joiningDate)}</p>
              </div>

              {/* Salary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-gray-500 mb-2">
                  <DollarSign size={18} />
                  <span className="text-sm font-medium">Salary</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(employee.salary)}</p>
              </div>
            </div>

            {/* Reporting Manager */}
            {employee.reportingManager && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporting Manager</h3>
                <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {getInitials(employee.reportingManager.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee.reportingManager.name}</p>
                    <p className="text-sm text-gray-500">{employee.reportingManager.designation}</p>
                    <p className="text-sm text-gray-500">{employee.reportingManager.employeeId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-gray-500">Created At:</span>
                  <p className="font-medium text-gray-900">{formatDate(employee.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="font-medium text-gray-900">{formatDate(employee.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
