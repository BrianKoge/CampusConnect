import { useState, useEffect } from 'react'
import { 
  Users, 
  Package, 
  Briefcase, 
  Users2, 
  Wallet, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Link } from 'react-router-dom'

export default function AdminHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent items, gigs, etc.
      const [itemsRes, gigsRes, usersRes] = await Promise.all([
        api.get('/admin/items'),
        api.get('/admin/gigs'),
        api.get('/admin/users?limit=5')
      ])
      
      setRecentActivity([
        ...itemsRes.data.slice(0, 3).map(item => ({ type: 'item', data: item, time: item.createdAt })),
        ...gigsRes.data.slice(0, 3).map(gig => ({ type: 'gig', data: gig, time: gig.createdAt })),
        ...usersRes.data.users.slice(0, 3).map(user => ({ type: 'user', data: user, time: user.createdAt }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6))
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/dashboard/admin'
    },
    {
      title: 'Active Users',
      value: stats?.users.active || 0,
      change: `${stats?.users.activePercentage || 0}%`,
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      link: '/dashboard/admin'
    },
    {
      title: 'Items Listed',
      value: stats?.content.items || 0,
      change: '+8%',
      trend: 'up',
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/dashboard/reuseit'
    },
    {
      title: 'Active Gigs',
      value: stats?.content.gigs || 0,
      change: '+15%',
      trend: 'up',
      icon: Briefcase,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/youthgig'
    },
    {
      title: 'Skill Swaps',
      value: stats?.content.swaps || 0,
      change: '+20%',
      trend: 'up',
      icon: Users2,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      link: '/dashboard/skillswap'
    },
    {
      title: 'Total Balance',
      value: `$${stats?.financial.totalBalance || '0.00'}`,
      change: '+5%',
      trend: 'up',
      icon: Wallet,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      link: '/dashboard/wallet'
    }
  ]

  const quickStats = [
    { label: 'Suspended Users', value: stats?.users.suspended || 0, icon: AlertCircle, color: 'text-yellow-600' },
    { label: 'Banned Users', value: stats?.users.banned || 0, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Mentorship Sessions', value: stats?.content.sessions || 0, icon: Users2, color: 'text-blue-600' },
    { label: 'Active Wallets', value: stats?.financial.wallets || 0, icon: Wallet, color: 'text-green-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform overview and management
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white">
          <Shield size={20} />
          <span className="font-medium">Admin Mode</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} to={stat.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`${stat.color.replace('bg-', 'text-')}`} size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              </motion.div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={stat.color} size={20} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <Activity className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'item' ? 'bg-purple-100 dark:bg-purple-900/20' :
                      activity.type === 'gig' ? 'bg-orange-100 dark:bg-orange-900/20' :
                      'bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      {activity.type === 'item' ? <Package size={20} className="text-purple-600" /> :
                       activity.type === 'gig' ? <Briefcase size={20} className="text-orange-600" /> :
                       <Users size={20} className="text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.type === 'item' ? `New item: ${activity.data.title}` :
                         activity.type === 'gig' ? `New gig: ${activity.data.title}` :
                         `New user: ${activity.data.name}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Management Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/dashboard/admin" className="card hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-primary-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Users className="text-red-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">User Management</h4>
              <p className="text-xs text-gray-500 dark:text-gray-500">Manage users</p>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/reuseit" className="card hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Package className="text-purple-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Items Moderation</h4>
              <p className="text-xs text-gray-500 dark:text-gray-500">Review items</p>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/youthgig" className="card hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Briefcase className="text-orange-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Gigs Moderation</h4>
              <p className="text-xs text-gray-500 dark:text-gray-500">Review gigs</p>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/wallet" className="card hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <Wallet className="text-emerald-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Financial Overview</h4>
              <p className="text-xs text-gray-500 dark:text-gray-500">View finances</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

