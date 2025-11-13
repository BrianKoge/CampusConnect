import { useState, useEffect } from 'react'
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit, 
  Save, 
  X,
  User,
  Briefcase,
  BookOpen,
  MessageCircle,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function MentorMentorship() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    title: '',
    bio: '',
    expertise: [],
    availability: 'Available',
    sessionTypes: ['30 minutes - Free', '60 minutes - $25', '90 minutes - $40']
  })
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [newSession, setNewSession] = useState({
    topic: '',
    description: '',
    sessionType: '30 minutes - Free',
    scheduledAt: '',
    maxStudents: 1
  })
  const [expertiseInput, setExpertiseInput] = useState('')

  useEffect(() => {
    fetchMentorProfile()
    fetchSessions()
  }, [])

  const fetchMentorProfile = async () => {
    try {
      const response = await api.get(`/mentorship/mentor/profile`)
      if (response.data) {
        setProfile(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch mentor profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await api.get('/mentorship/sessions')
      // Filter sessions where user is the mentor
      const mentorSessions = response.data.filter(session => {
        if (!session.mentor || !user?._id) return false
        const mentorId = typeof session.mentor === 'object' ? session.mentor._id?.toString() : session.mentor.toString()
        const userId = user._id.toString()
        return mentorId === userId
      })
      setSessions(mentorSessions)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const updateProfile = async () => {
    try {
      await api.put('/mentorship/mentor/profile', profile)
      setEditingProfile(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
    }
  }

  const createSession = async (e) => {
    e.preventDefault()
    try {
      await api.post('/mentorship/mentor/sessions', newSession)
      setShowSessionForm(false)
      setNewSession({
        topic: '',
        description: '',
        sessionType: '30 minutes - Free',
        scheduledAt: '',
        maxStudents: 1
      })
      fetchSessions()
      alert('Mentorship session created successfully!')
    } catch (error) {
      alert('Failed to create session')
    }
  }

  const addExpertise = () => {
    if (expertiseInput.trim() && !profile.expertise.includes(expertiseInput.trim())) {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, expertiseInput.trim()]
      })
      setExpertiseInput('')
    }
  }

  const removeExpertise = (exp) => {
    setProfile({
      ...profile,
      expertise: profile.expertise.filter(e => e !== exp)
    })
  }

  const updateSessionStatus = async (sessionId, status) => {
    try {
      await api.put(`/mentorship/sessions/${sessionId}/status`, { status })
      fetchSessions()
    } catch (error) {
      alert('Failed to update session status')
    }
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mentor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your expertise and guide the next generation
          </p>
        </div>
        <button
          onClick={() => setShowSessionForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Session
        </button>
      </div>

      {/* Mentor Profile Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center">
              <GraduationCap className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.name}
              </h2>
              <p className="text-primary-700 dark:text-primary-400 font-medium">
                {profile.title || 'Alumni Mentor'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="text-yellow-500" size={16} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  4.8 Rating
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {sessions.length} Sessions
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => editingProfile ? updateProfile() : setEditingProfile(true)}
            className="btn-secondary flex items-center gap-2"
          >
            {editingProfile ? <Save size={18} /> : <Edit size={18} />}
            {editingProfile ? 'Save' : 'Edit Profile'}
          </button>
        </div>

        {editingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professional Title
              </label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                placeholder="e.g., Senior Software Engineer at Google"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell students about your background and expertise..."
                rows={4}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expertise Areas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  placeholder="Add expertise area"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={addExpertise}
                  className="btn-primary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((exp) => (
                  <span
                    key={exp}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {exp}
                    <button
                      onClick={() => removeExpertise(exp)}
                      className="hover:text-primary-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability
              </label>
              <select
                value={profile.availability}
                onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                className="input-field"
              >
                <option>Available</option>
                <option>Available this week</option>
                <option>Available next week</option>
                <option>Limited availability</option>
                <option>Not available</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={updateProfile}
                className="btn-primary flex-1"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {profile.bio || 'No bio added yet. Click "Edit Profile" to add your bio and expertise.'}
            </p>

            {profile.expertise.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expertise Areas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((exp) => (
                    <span
                      key={exp}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={16} />
              <span>{profile.availability}</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My Mentorship Sessions
          </h2>
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">
            {sessions.length} Sessions
          </span>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {session.topic}
                    </h3>
                    {session.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {session.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{session.sessionType}</span>
                      </div>
                      {session.student && (
                        <div className="flex items-center gap-1">
                          <User size={16} />
                          <span>With {session.student?.name || 'Student'}</span>
                        </div>
                      )}
                      {!session.student && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            Open session - No student yet
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      session.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      session.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      session.status === 'available' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      session.status === 'completed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {session.status === 'available' ? 'Available' : session.status}
                    </span>
                  </div>
                </div>

                {session.status === 'available' && !session.student && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      This session is available for students to book.
                    </p>
                    <button
                      onClick={() => updateSessionStatus(session._id, 'cancelled')}
                      className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Cancel Session
                    </button>
                  </div>
                )}

                {session.status === 'pending' && session.student && (
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => updateSessionStatus(session._id, 'confirmed')}
                      className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Confirm
                    </button>
                    <button
                      onClick={() => updateSessionStatus(session._id, 'cancelled')}
                      className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Decline
                    </button>
                  </div>
                )}

                {session.status === 'confirmed' && session.student && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Scheduled with: {session.student?.name || 'Student'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(session.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSessionStatus(session._id, 'completed')}
                      className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Mark as Completed
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No mentorship sessions yet. Create your first session to start mentoring!
            </p>
            <button
              onClick={() => setShowSessionForm(true)}
              className="btn-primary"
            >
              Create Session
            </button>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Mentorship Session
              </h2>
              <button
                onClick={() => setShowSessionForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={createSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Topic *
                </label>
                <input
                  type="text"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  placeholder="e.g., Career Guidance, Resume Review, Tech Interview Prep"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="Describe what students can expect from this session..."
                  rows={4}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Type *
                  </label>
                  <select
                    value={newSession.sessionType}
                    onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option>30 minutes - Free</option>
                    <option>60 minutes - $25</option>
                    <option>90 minutes - $40</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) => setNewSession({ ...newSession, scheduledAt: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSessionForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Plus size={18} />
                  Create Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

