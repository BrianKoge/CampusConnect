import { useState, useEffect } from 'react'
import { Search, Calendar, Star, GraduationCap, Filter, Clock, User, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function Mentorship() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState([])
  const [availableSessions, setAvailableSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState('All')
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [bookingData, setBookingData] = useState({
    topic: '',
    sessionType: '30 minutes - Free',
    scheduledAt: ''
  })

  useEffect(() => {
    fetchMentors()
    fetchAvailableSessions()
  }, [])

  const fetchMentors = async () => {
    try {
      const response = await api.get('/mentorship/mentors')
      setMentors(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch mentors:', error)
      setLoading(false)
    }
  }

  const fetchAvailableSessions = async () => {
    try {
      const response = await api.get('/mentorship/available')
      setAvailableSessions(response.data)
    } catch (error) {
      console.error('Failed to fetch available sessions:', error)
    }
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    try {
      if (selectedSession) {
        // Book existing available session
        await api.post('/mentorship/book', { sessionId: selectedSession._id })
      } else if (selectedMentor) {
        // Book new session with mentor
        await api.post('/mentorship/book', {
          mentor: selectedMentor._id,
          topic: bookingData.topic,
          sessionType: bookingData.sessionType,
          scheduledAt: bookingData.scheduledAt
        })
      }
      alert('Session booked successfully!')
      setSelectedMentor(null)
      setSelectedSession(null)
      setBookingData({ topic: '', sessionType: '30 minutes - Free', scheduledAt: '' })
      fetchAvailableSessions()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book session')
    }
  }

  // Get all unique expertise areas from mentors
  const allExpertise = ['All', ...new Set(mentors.flatMap(m => m.expertise || []))]

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesExpertise =
      selectedExpertise === 'All' ||
      (mentor.expertise && mentor.expertise.some((exp) => 
        exp.toLowerCase().includes(selectedExpertise.toLowerCase())
      ))
    return matchesSearch && matchesExpertise
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Alumni Mentorship</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with verified alumni for career guidance and advice
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select className="input-field">
              <option>Sort by: Rating</option>
              <option>Sort by: Sessions</option>
              <option>Sort by: Availability</option>
            </select>
          </div>
        </div>

        {/* Expertise Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {allExpertise.slice(0, 10).map((expertise) => (
            <button
              key={expertise}
              onClick={() => setSelectedExpertise(expertise)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedExpertise === expertise
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {expertise}
            </button>
          ))}
        </div>
      </div>

      {/* Available Sessions */}
      {availableSessions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Available Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSessions.map((session) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={session.mentor?.avatar || `https://ui-avatars.com/api/?name=${session.mentor?.name}&background=14b8a6&color=fff`}
                    alt={session.mentor?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {session.topic}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      with {session.mentor?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{session.sessionType}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedSession(session)
                  }}
                  className="mt-3 w-full btn-primary text-sm py-2"
                >
                  Book Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor, index) => (
          <motion.div
            key={mentor._id || mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={mentor.avatar || `https://ui-avatars.com/api/?name=${mentor.name}&background=14b8a6&color=fff`}
                alt={mentor.name}
                className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {mentor.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {mentor.title || 'Alumni Mentor'}
                </p>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <span className="text-sm font-medium">{mentor.rating || 4.8}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({mentor.sessions || 0} sessions)
                  </span>
                </div>
              </div>
            </div>

            {mentor.bio && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{mentor.bio}</p>
            )}

            {mentor.expertise && mentor.expertise.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.slice(0, 4).map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {mentor.availability || 'Available'}
              </span>
              <button
                onClick={() => setSelectedMentor(mentor)}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              >
                <Calendar size={16} />
                Book Session
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No mentors found. Try adjusting your filters.</p>
        </div>
      )}

      {/* Booking Modal - Available Session */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Session</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedSession.topic} with {selectedSession.mentor?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Session Details</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedSession.topic}</p>
                {selectedSession.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {selectedSession.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{new Date(selectedSession.scheduledAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{selectedSession.sessionType}</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleBookSession} className="space-y-4">
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Booking Modal - New Session with Mentor */}
      {selectedMentor && !selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Mentorship Session</h2>
                <p className="text-gray-600 dark:text-gray-400">with {selectedMentor.name}</p>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What would you like to discuss? *
                </label>
                <input
                  type="text"
                  value={bookingData.topic}
                  onChange={(e) => setBookingData({ ...bookingData, topic: e.target.value })}
                  placeholder="e.g., Career guidance, Resume review, Interview prep"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.scheduledAt}
                  onChange={(e) => setBookingData({ ...bookingData, scheduledAt: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Type *
                </label>
                <select
                  value={bookingData.sessionType}
                  onChange={(e) => setBookingData({ ...bookingData, sessionType: e.target.value })}
                  className="input-field"
                  required
                >
                  <option>30 minutes - Free</option>
                  <option>60 minutes - $25</option>
                  <option>90 minutes - $40</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Calendar size={16} />
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

