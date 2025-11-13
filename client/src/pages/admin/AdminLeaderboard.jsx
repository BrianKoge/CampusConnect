import { useState, useEffect } from 'react'
import { 
  Trophy, 
  TrendingUp,
  Users,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../utils/api'

export default function AdminLeaderboard() {
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/leaderboard/students')
      ])
      setStats(statsRes.data)
      setLeaderboard(leaderboardRes.data.slice(0, 10))
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Platform Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive overview of platform performance and user engagement
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.users.total || 0}
              </p>
            </div>
            <Users className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.users.active || 0}
              </p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Content</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats?.content.items || 0) + (stats?.content.gigs || 0) + (stats?.content.swaps || 0)}
              </p>
            </div>
            <BarChart3 className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats?.financial.totalBalance || '0.00'}
              </p>
            </div>
            <Trophy className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Top Performers
            </h2>
            <Trophy className="text-yellow-500" size={24} />
          </div>
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center font-bold text-primary-600">
                  {getRankIcon(index + 1)}
                </div>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14b8a6&color=fff`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{user.university}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{user.points || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Platform Breakdown
            </h2>
            <PieChart className="text-blue-500" size={24} />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Items</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.content.items || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${((stats?.content.items || 0) / ((stats?.content.items || 0) + (stats?.content.gigs || 0) + (stats?.content.swaps || 0) || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Gigs</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.content.gigs || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${((stats?.content.gigs || 0) / ((stats?.content.items || 0) + (stats?.content.gigs || 0) + (stats?.content.swaps || 0) || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Skill Swaps</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.content.swaps || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-pink-600 h-2 rounded-full"
                  style={{ width: `${((stats?.content.swaps || 0) / ((stats?.content.items || 0) + (stats?.content.gigs || 0) + (stats?.content.swaps || 0) || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Mentorship Sessions</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.content.sessions || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${((stats?.content.sessions || 0) / ((stats?.content.sessions || 0) + 10 || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

