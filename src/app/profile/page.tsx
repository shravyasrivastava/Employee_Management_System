'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import api from '@/lib/axios'
import { Employee } from '@/types'
import { User, Camera, Save, X } from 'lucide-react'
import Skeleton from '@/components/Skeleton'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    phone: '',
    profileImage: null as File | null
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    if (parsedUser.employeeId) {
      fetchEmployee(parsedUser.employeeId)
    } else {
      setLoading(false)
    }
  }, [router])

  const fetchEmployee = async (employeeId: string) => {
    try {
      const response = await api.get(`/employees/${employeeId}`)
      setEmployee(response.data.data)
      setFormData({
        phone: response.data.data.phone,
        profileImage: null
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employee details')
      ;(window as any).toast?.add('error', err.response?.data?.message || 'Failed to fetch employee details')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith('image/')) {
        ;(window as any).toast?.add('error', 'Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        ;(window as any).toast?.add('error', 'File size must be less than 5MB')
        return
      }
      setFormData({ ...formData, profileImage: file })
    }
  }

  const handleImageUpload = async () => {
    if (!formData.profileImage || !employee) return

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('profileImage', formData.profileImage)

    try {
      const response = await api.post(`/employees/${employee._id}/profile-image`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setEmployee(response.data.data)
      setFormData({ ...formData, profileImage: null })
      ;(window as any).toast?.add('success', 'Profile image updated successfully!')
    } catch (err: any) {
      ;(window as any).toast?.add('error', err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!employee) return

    if (!validateForm()) {
      ;(window as any).toast?.add('error', 'Please fix the form errors')
      return
    }

    setSubmitting(true)

    try {
      await api.put(`/employees/${employee._id}`, { phone: formData.phone })
      ;(window as any).toast?.add('success', 'Profile updated successfully!')
      fetchEmployee(employee._id)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile'
      setError(errorMessage)
      ;(window as any).toast?.add('error', errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user || {}} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user || {}} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-lg">
            No employee profile linked to your account. Please contact HR.
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and edit your profile information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Profile Image Section */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              {employee.profileImage ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${employee.profileImage}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-primary-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{employee.name}</h2>
              <p className="text-gray-600">{employee.designation}</p>
              {formData.profileImage && (
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={handleImageUpload}
                    disabled={uploading}
                    className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload New Image'}
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, profileImage: null })}
                    className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employee.employeeId}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={employee.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={employee.department}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  value={employee.designation}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={employee.role.replace('_', ' ').toUpperCase()}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
