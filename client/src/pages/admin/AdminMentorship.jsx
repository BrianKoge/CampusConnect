import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  GraduationCap,
  User,
  Clock,
  Calendar,
  MessageCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../utils/api'

export default function AdminMentorship() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await api.get('/admin/sessions')
      setSessions(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.mentor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mentorship Sessions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage all mentorship sessions
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search sessions, mentors, students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredSessions.length} sessions
            </span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <motion.div
            key={session._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="text-primary-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {session.topic || 'General Mentorship'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {session.status || 'scheduled'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-blue-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Mentor</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.mentor?.name || 'Unknown'}
                </p>
              </div>

              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-green-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Student</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.student?.name || 'Unknown'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    {session.date ? new Date(session.date).toLocaleDateString() : 'Not scheduled'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{session.duration || 'N/A'} min</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="card text-center py-12">
          <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">No mentorship sessions found</p>
        </div>
      )}
    </div>
  )
}

