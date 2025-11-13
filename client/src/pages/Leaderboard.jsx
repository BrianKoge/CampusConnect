import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, TrendingUp, Filter, Users, Building } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const REFRESH_INTERVAL = 30000

const leaderboardTypes = ['Students', 'Clubs']
const badges = [
  { name: 'Green Ambassador', icon: '🌱', description: 'Top 10 sustainability contributors (2000+ points)' },
  { name: 'Peer Mentor', icon: '🤝', description: 'Helped 10+ students through mentorship' },
  { name: 'ReUse Champion', icon: '♻️', description: '50+ item exchanges' },
  { name: 'Skill Master', icon: '⭐', description: '20+ successful skill swaps' },
]

export default function Leaderboard() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState('Students')
  const [timeFilter, setTimeFilter] = useState('all')
  const [rankings, setRankings] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRankings()
    if (user) {
      fetchUserStats()
    }
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRankings()
      if (user) {
        fetchUserStats()
      }
    }, REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [selectedType, timeFilter, user])

  const fetchRankings = async () => {
    try {
      setLoading(true)
      if (selectedType === 'Students') {
        const response = await api.get('/leaderboard/students', {
          params: { timeFilter }
        })
        setRankings(response.data)
      } else {
        // Clubs - for now return empty, can be implemented later
        setRankings([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch rankings:', error)
      setLoading(false)
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

  const currentRankings = rankings

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sustainability Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your impact and compete for green badges
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your Rank</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats ? `#${userStats.rank}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center">
              <Award className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats?.points?.toLocaleString() || user?.points?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{userStats?.pointsThisMonth || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {leaderboardTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {selectedType} Rankings
              </h2>
              <div className="space-y-4">
                {currentRankings.length > 0 ? (
                  currentRankings.map((entry, index) => (
                    <motion.div
                      key={entry._id || entry.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        entry.rank <= 3
                          ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {entry.rank === 1 ? (
                          <Trophy className="text-yellow-500" size={32} />
                        ) : entry.rank === 2 ? (
                          <Medal className="text-gray-400" size={32} />
                        ) : entry.rank === 3 ? (
                          <Medal className="text-amber-600" size={32} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold">
                            {entry.rank}
                          </div>
                        )}
                      </div>
                      {selectedType === 'Students' ? (
                        <>
                          <img
                            src={entry.avatar || `https://ui-avatars.com/api/?name=${entry.name}&background=14b8a6&color=fff`}
                            alt={entry.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {entry.name}
                                {entry.name === user?.name && ' (You)'}
                              </h3>
                              {entry.badge && (
                                <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full">
                                  {entry.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.points?.toLocaleString() || 0} points
                              {entry.university && ` • ${entry.university}`}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <Building className="text-primary-600 dark:text-primary-400" size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{entry.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.points?.toLocaleString() || 0} points • {entry.members || 0} members
                            </p>
                          </div>
                        </>
                      )}
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          #{entry.rank}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No rankings available yet. Be the first to earn points!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Available Badges</h2>
            <div className="space-y-4">
              {badges.map((badge, index) => {
                const userHasBadge = userStats?.badges?.includes(badge.name)
                return (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      userHasBadge
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{badge.name}</h3>
                      {userHasBadge && (
                        <CheckCircle className="text-green-500 ml-auto" size={20} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Points Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">How Points Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl mb-2">♻️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">ReUseIt Exchanges</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">+50 points per completed exchange</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">+10 for posting, +5 for requesting</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl mb-2">🤝</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Skill Swaps</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">+30 points per successful swap</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">+15 for posting a swap</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Mentoring</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">+40 points per completed session</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">+20 for students, +40 for mentors</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-3xl mb-2">💼</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">YouthGig</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">+10 for posting, +30 for completing, +50 for finishing</p>
        </div>
      </div>
    </div>
  )
}
