import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Recycle, Briefcase, Users, GraduationCap, Trophy, Wallet, ArrowRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const REFRESH_INTERVAL = 30000

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalExchanges: 0,
    activeGigs: 0,
    skillSwaps: 0,
    mentorshipSessions: 0
  })
  const [recentExchanges, setRecentExchanges] = useState([])
  const [leaderboardPreview, setLeaderboardPreview] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchRecentExchanges()
      fetchLeaderboardPreview()
      fetchUserStats()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchStats()
        fetchRecentExchanges()
        fetchLeaderboardPreview()
        fetchUserStats()
      }, REFRESH_INTERVAL)
      
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [exchanges, gigs, swaps, sessions] = await Promise.all([
        api.get('/reuseit').catch(() => ({ data: [] })),
        api.get('/youthgig').catch(() => ({ data: [] })),
        api.get('/skillswap').catch(() => ({ data: [] })),
        api.get('/mentorship/sessions').catch(() => ({ data: [] }))
      ])

      setStats({
        totalExchanges: exchanges.data.length,
        activeGigs: gigs.data.filter(g => g.status === 'open').length,
        skillSwaps: swaps.data.filter(s => s.status === 'open').length,
        mentorshipSessions: sessions.data.length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentExchanges = async () => {
    try {
      const response = await api.get('/reuseit')
      const recent = response.data
        .filter(item => item.status === 'exchanged')
        .slice(0, 3)
        .map(item => ({
          id: item._id,
          title: item.title,
          time: new Date(item.updatedAt).toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          })
        }))
      setRecentExchanges(recent)
    } catch (error) {
      console.error('Failed to fetch recent exchanges:', error)
    }
  }

  const fetchLeaderboardPreview = async () => {
    try {
      const response = await api.get('/leaderboard/students')
      setLeaderboardPreview(response.data.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }

  const fetchUserStats = async () => {
    if (!user?._id) return
    try {
      const response = await api.get(`/leaderboard/user-stats?userId=${user._id}`)
      setUserStats(response.data)
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const statsCards = [
    { 
      label: 'Total Exchanges', 
      value: stats.totalExchanges, 
      change: '+12%', 
      icon: Recycle, 
      bgColor: 'bg-primary-100 dark:bg-primary-900/20', 
      iconColor: 'text-primary-600 dark:text-primary-400' 
    },
    { 
      label: 'Active Gigs', 
      value: stats.activeGigs, 
      change: '+8%', 
      icon: Briefcase, 
      bgColor: 'bg-secondary-100 dark:bg-secondary-900/20', 
      iconColor: 'text-secondary-600 dark:text-secondary-400' 
    },
    { 
      label: 'Skill Swaps', 
      value: stats.skillSwaps, 
      change: '+15%', 
      icon: Users, 
      bgColor: 'bg-success-100 dark:bg-success-900/20', 
      iconColor: 'text-success-600 dark:text-success-400' 
    },
    { 
      label: 'Mentorship Sessions', 
      value: stats.mentorshipSessions, 
      change: '+3%', 
      icon: GraduationCap, 
      bgColor: 'bg-primary-100 dark:bg-primary-900/20', 
      iconColor: 'text-primary-600 dark:text-primary-400' 
    },
  ]

  const quickActions = user?.role === 'alumni' 
    ? [
        { title: 'Mentor Dashboard', icon: GraduationCap, link: '/dashboard/mentorship', bgColor: 'bg-primary-100 dark:bg-primary-900/20', iconColor: 'text-primary-600 dark:text-primary-400' },
      ]
    : [
        { title: 'Post Item', icon: Recycle, link: '/dashboard/reuseit', bgColor: 'bg-primary-100 dark:bg-primary-900/20', iconColor: 'text-primary-600 dark:text-primary-400' },
        { title: 'Post Gig', icon: Briefcase, link: '/dashboard/youthgig', bgColor: 'bg-secondary-100 dark:bg-secondary-900/20', iconColor: 'text-secondary-600 dark:text-secondary-400' },
        { title: 'Find Skill', icon: Users, link: '/dashboard/skillswap', bgColor: 'bg-success-100 dark:bg-success-900/20', iconColor: 'text-success-600 dark:text-success-400' },
        { title: 'Book Mentor', icon: GraduationCap, link: '/dashboard/mentorship', bgColor: 'bg-primary-100 dark:bg-primary-900/20', iconColor: 'text-primary-600 dark:text-primary-400' },
      ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Plan, prioritize, and accomplish your sustainability goals with ease.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <TrendingUp size={16} />
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={action.link}
                  className="block p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={action.iconColor} size={24} />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user?.role !== 'alumni' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Exchanges</h2>
              <Link to="/dashboard/reuseit" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
          <div className="space-y-4">
            {recentExchanges.length > 0 ? (
              recentExchanges.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <Recycle className="text-primary-600 dark:text-primary-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.time}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Completed</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">No recent exchanges</p>
            )}
          </div>
        </div>
        )}

        {user?.role !== 'alumni' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Leaderboard Preview</h2>
              <Link to="/dashboard/leaderboard" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
          <div className="space-y-4">
            {leaderboardPreview.length > 0 ? (
              leaderboardPreview.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.name}
                      {entry.name === user?.name && ' (You)'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{entry.points} points</p>
                  </div>
                  <Trophy className="text-yellow-500" size={20} />
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">No rankings yet</p>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
