'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import api from '@/lib/axios'
import { Employee } from '@/types'
import { TreeDeciduous, Users, ChevronDown, ChevronRight } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface TreeNode extends Employee {
  children?: TreeNode[]
}

export default function OrganizationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tree, setTree] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchOrganizationTree()
  }, [router])

  const fetchOrganizationTree = async () => {
    try {
      const response = await api.get('/organization/tree')
      setTree(response.data.data)
    } catch (error) {
      console.error('Failed to fetch organization tree:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node._id} className="ml-4">
        <div
          className={`flex items-center py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 ${
            expandedNodes.has(node._id) 
              ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => node.children && node.children.length > 0 && toggleNode(node._id)}
        >
          {node.children && node.children.length > 0 && (
            <span className="mr-3 text-gray-500 dark:text-gray-400 transition-transform duration-200">
              {expandedNodes.has(node._id) ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </span>
          )}
          {(!node.children || node.children.length === 0) && <span className="mr-3 w-5" />}
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            node.role === 'super_admin' 
              ? 'bg-purple-100 dark:bg-purple-900' 
              : node.role === 'hr_manager' 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'bg-primary-100 dark:bg-primary-900'
          }`}>
            <span className={`text-sm font-medium ${
              node.role === 'super_admin' 
                ? 'text-purple-600 dark:text-purple-400' 
                : node.role === 'hr_manager' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-primary-600 dark:text-primary-400'
            }`}>
              {getInitials(node.name)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 dark:text-white">{node.name}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {node.designation}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {node.department} • {node.employeeId}
            </div>
          </div>
          
          {node.children && node.children.length > 0 && (
            <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
              expandedNodes.has(node._id)
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <Users size={14} className="mr-1" />
              <span>{node.children.length}</span>
            </div>
          )}
        </div>
        
        {node.children && node.children.length > 0 && expandedNodes.has(node._id) && (
          <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-6 pl-2 animate-fade-in">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Hierarchy</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View your organizational structure</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 animate-slide-up">
          {tree.length === 0 ? (
            <div className="text-center py-12">
              <TreeDeciduous size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No organizational structure found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add employees and assign reporting managers to build the hierarchy
              </p>
            </div>
          ) : (
            <div className="py-4">
              {renderTree(tree)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
