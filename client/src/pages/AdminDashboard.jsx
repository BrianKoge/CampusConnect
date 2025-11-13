import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Edit,
  MessageCircle,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  ArrowUp,
  ArrowDown,
  Calendar,
  TrendingUp,
  BarChart3,
  Plus,
  X,
  Save
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    role: 'student',
    status: 'active',
    isVerified: false
  })
  const [editingUser, setEditingUser] = useState(null)
  const [editUserData, setEditUserData] = useState({})

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    if (user.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    fetchStats()
    fetchUsers()
  }, [user, authLoading, navigate, currentPage, searchQuery, statusFilter, roleFilter])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 12
      }
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter
      if (roleFilter !== 'all') params.role = roleFilter

      const response = await api.get('/admin/users', { params })
      setUsers(response.data.users)
      setTotalPages(response.data.pages)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      setSelectedUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    }
  }

  const updateUserStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status })
      fetchUsers()
      fetchStats()
      if (selectedUser && selectedUser._id === userId) {
        fetchUserDetails(userId)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status')
    }
  }

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role })
      fetchUsers()
      fetchStats()
      if (selectedUser && selectedUser._id === userId) {
        fetchUserDetails(userId)
      }
      alert('User role updated successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user role')
    }
  }

  const createUser = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/users', newUser)
      alert('User created successfully!')
      setShowAddUserModal(false)
      setNewUser({
        name: '',
        email: '',
        password: '',
        university: '',
        role: 'student',
        status: 'active',
        isVerified: false
      })
      fetchUsers()
      fetchStats()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user')
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      await api.put(`/admin/users/${userId}`, userData)
      fetchUsers()
      fetchStats()
      if (selectedUser && selectedUser._id === userId) {
        fetchUserDetails(userId)
      }
      setEditingUser(null)
      setEditUserData({})
      alert('User updated successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user')
    }
  }

  const startEditingUser = (user) => {
    setEditingUser(user._id)
    setEditUserData({
      name: user.name,
      email: user.email,
      university: user.university,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      points: user.points || 0
    })
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle, text: 'Active' },
      inactive: { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', icon: XCircle, text: 'Inactive' },
      suspended: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: AlertCircle, text: 'Suspended' },
      banned: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: Ban, text: 'Banned' }
    }
    const badge = badges[status] || badges.inactive
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    )
  }

  const getRoleColor = (role) => {
    const colors = {
      student: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
      alumni: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
      admin: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
    }
    return colors[role] || colors.student
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Access denied. Admin only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${selectedUser ? 'lg:max-w-[calc(100%-26rem)]' : ''}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dashboard / Users</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add User
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search anything"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Users className="text-gray-600 dark:text-gray-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users.total}</p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.users.active} ({stats.users.activePercentage}%)
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.users.inactive} ({stats.users.inactivePercentage}%)
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users.suspended}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search name, email, university, etc."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="input-field text-sm min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="input-field text-sm min-w-[120px]"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Enrollment Date
                      {sortField === 'createdAt' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Points</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr 
                    key={userItem._id} 
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                      selectedUser?._id === userItem._id ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    }`}
                    onClick={() => fetchUserDetails(userItem._id)}
                  >
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {userItem._id.toString().slice(-8).toUpperCase().match(/.{1,4}/g)?.join('-') || userItem._id.toString().slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={userItem.avatar || `https://ui-avatars.com/api/?name=${userItem.name}&background=14b8a6&color=fff`}
                          alt={userItem.name}
                          className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{userItem.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{userItem.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(userItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(userItem.status || 'active')}
                    </td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      {editingUser === userItem._id ? (
                        <select
                          value={editUserData.role || userItem.role}
                          onChange={(e) => {
                            const newRole = e.target.value
                            setEditUserData({ ...editUserData, role: newRole })
                            updateUserRole(userItem._id, newRole)
                            setEditingUser(null)
                            setEditUserData({})
                          }}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                        >
                          <option value="student">Student</option>
                          <option value="alumni">Alumni</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => startEditingUser(userItem)}
                        >
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userItem.role)} group-hover:opacity-80`}>
                            {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                          </span>
                          <Edit 
                            size={12} 
                            className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Click to edit role"
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900 dark:text-white font-semibold">
                        {userItem.points || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">points</div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          fetchUserDetails(userItem._id)
                        }}
                        className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * 12 + 1}-{Math.min(currentPage * 12, stats?.users.total || 0)} of {stats?.users.total || 0}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Panel */}
      {selectedUser && (
        <>
          {/* Overlay for mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSelectedUser(null)}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="w-full lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto fixed right-0 top-0 h-screen z-40 lg:relative lg:h-auto lg:z-auto shadow-xl lg:shadow-none"
          >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
            </div>

            {/* Profile Banner */}
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-pink-500 via-pink-400 to-purple-500 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <img
                  src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=14b8a6&color=fff`}
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="mt-16 text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {selectedUser._id.toString().slice(-8).toUpperCase()}
                </span>
                {getStatusBadge(selectedUser.status || 'active')}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedUser.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enrolled on {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex gap-2 justify-center mb-4">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${getRoleColor(selectedUser.role)}`}
                  disabled
                >
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </button>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <MessageCircle size={16} />
                  Chat
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="text-gray-400 mt-0.5" size={16} />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="text-gray-400 mt-0.5" size={16} />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedUser.university}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            {selectedUser.activity && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Activity Summary</h4>
                  <select className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800">
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>All Time</option>
                  </select>
                </div>
                
                {/* Activity Chart */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {(selectedUser.activity?.weeklyActivity || [
                      { day: 'Mon', value: 42 },
                      { day: 'Tue', value: 30 },
                      { day: 'Wed', value: 16 },
                      { day: 'Thu', value: 16 },
                      { day: 'Fri', value: 10 },
                      { day: 'Sat', value: 5 },
                      { day: 'Sun', value: 3 }
                    ]).map((item, index) => {
                      const maxValue = 50
                      const heightPercent = Math.min((item.value / maxValue) * 100, 100)
                      return (
                        <div key={item.day} className="flex-1 flex flex-col items-center justify-end">
                          {item.value > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">{item.value}</div>
                          )}
                          <div 
                            className={`w-full rounded-t transition-all hover:opacity-80 cursor-pointer ${
                              index % 2 === 0 ? 'bg-pink-400' : 'bg-yellow-400'
                            }`}
                            style={{ height: `${heightPercent}%`, minHeight: item.value > 0 ? '12px' : '4px' }}
                            title={`${item.day}: ${item.value} activities`}
                          ></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">{item.day}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Activity Summary Cards */}
                <div className="space-y-2 mb-3">
                  <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Items Posted</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.activity.items || 0} items</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gigs Posted</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.activity.gigs || 0} gigs</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Skill Swaps</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.activity.swaps || 0} swaps</p>
                  </div>
                </div>
                
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Wallet Balance</p>
                  <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    ${selectedUser.activity.walletBalance?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            )}

            {/* User Management */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">User Management</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Account Status</label>
                  <select
                    value={selectedUser.status || 'active'}
                    onChange={(e) => updateUserStatus(selectedUser._id, e.target.value)}
                    className="w-full input-field text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Change user account status to regulate access
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">User Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => updateUserRole(selectedUser._id, e.target.value)}
                    className="w-full input-field text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Assign different roles to users
                  </p>
                </div>
              </div>
            </div>

            {/* Points and Badges */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sustainability Points</h4>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg mb-4 border border-green-200 dark:border-green-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Points</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedUser.points || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Points earned from sustainable activities
                </p>
              </div>
              {selectedUser.badges && selectedUser.badges.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Badges Earned</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.badges.map((badge, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium border border-primary-200 dark:border-primary-800"
                      >
                        🏆 {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(!selectedUser.badges || selectedUser.badges.length === 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-500">No badges earned yet</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (selectedUser.status === 'active') {
                      updateUserStatus(selectedUser._id, 'suspended')
                    } else {
                      updateUserStatus(selectedUser._id, 'active')
                    }
                  }}
                  className="w-full px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </button>
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to ${selectedUser.status === 'banned' ? 'unban' : 'ban'} this user?`)) {
                        updateUserStatus(selectedUser._id, selectedUser.status === 'banned' ? 'active' : 'banned')
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        </>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h2>
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    university: '',
                    role: 'student',
                    status: 'active',
                    isVerified: false
                  })
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={createUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input-field"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    University *
                  </label>
                  <input
                    type="text"
                    value={newUser.university}
                    onChange={(e) => setNewUser({ ...newUser, university: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUser.isVerified}
                    onChange={(e) => setNewUser({ ...newUser, isVerified: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email Verified</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false)
                    setNewUser({
                      name: '',
                      email: '',
                      password: '',
                      university: '',
                      role: 'student',
                      status: 'active',
                      isVerified: false
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Plus size={18} />
                  Create User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
