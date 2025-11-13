import { useState, useEffect } from 'react'
import { Search, Sparkles, MessageCircle, User, CheckCircle, ArrowRight, Plus, Edit, Trash2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const REFRESH_INTERVAL = 30000

export default function SkillSwap() {
  const { user, refreshUser } = useAuth()
  const [skills, setSkills] = useState([])
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAIAssistant, setShowAIAssistant] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingSwap, setEditingSwap] = useState(null)
  const [formData, setFormData] = useState({
    offeredSkill: '',
    seekingSkill: '',
    description: ''
  })

  useEffect(() => {
    fetchSkills()
    if (user) {
      fetchAIMatches()
    }
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSkills()
      if (user) {
        fetchAIMatches()
      }
    }, REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [user])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery) params.search = searchQuery

      const response = await api.get('/skillswap', { params })
      setSkills(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      setLoading(false)
    }
  }

  const fetchAIMatches = async () => {
    try {
      const response = await api.get('/skillswap/ai-match')
      setAiSuggestions(response.data)
    } catch (error) {
      console.error('Failed to fetch AI matches:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSkills()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSwap) {
        await api.put(`/skillswap/${editingSwap._id}`, formData)
        alert('Skill swap updated successfully!')
      } else {
        await api.post('/skillswap', formData)
        alert('Skill swap posted successfully!')
      }
      setShowPostForm(false)
      setEditingSwap(null)
      setFormData({
        offeredSkill: '',
        seekingSkill: '',
        description: ''
      })
      fetchSkills()
      fetchAIMatches()
      refreshUser() // Refresh user to update points
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save skill swap')
    }
  }

  const handleDelete = async (swapId) => {
    if (!confirm('Are you sure you want to delete this skill swap?')) return

    try {
      await api.delete(`/skillswap/${swapId}`)
      alert('Skill swap deleted successfully!')
      fetchSkills()
      fetchAIMatches()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete skill swap')
    }
  }

  const handleMatch = async (swapId) => {
    try {
      await api.post(`/skillswap/${swapId}/match`)
      alert('Skill swap matched! Points awarded.')
      fetchSkills()
      fetchAIMatches()
      refreshUser() // Refresh user to update points
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to match skill swap')
    }
  }

  const startEdit = (swap) => {
    setEditingSwap(swap)
    setFormData({
      offeredSkill: swap.offeredSkill,
      seekingSkill: swap.seekingSkill,
      description: swap.description
    })
    setShowPostForm(true)
  }

  const filteredSkills = skills.filter((skill) =>
    skill.offeredSkill?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.seekingSkill?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const badges = {
      open: { text: 'Open', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      matched: { text: 'Matched', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      completed: { text: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }
    }
    const badge = badges[status] || badges.open
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SkillSwap Network</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Barter skills with other students - teach and learn together
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSwap(null)
            setFormData({
              offeredSkill: '',
              seekingSkill: '',
              description: ''
            })
            setShowPostForm(true)
          }}
          className="btn-primary"
        >
          <User size={20} />
          List My Skills
        </button>
      </div>

      {/* AI SkillMatch Assistant */}
      {showAIAssistant && user && aiSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI SkillMatch Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Personalized recommendations based on your skills and interests
                </p>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion._id || index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-primary-200 dark:border-primary-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {suggestion.matchScore === 100 ? 'Perfect Match Found!' : 
                           suggestion.matchScore >= 85 ? 'Great Match!' : 
                           'Good Opportunity'}
                        </h4>
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {suggestion.matchScore}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>{suggestion.owner?.name}</strong> is offering <strong>{suggestion.offeredSkill}</strong> and seeking <strong>{suggestion.seekingSkill}</strong>
                      </p>
                      {suggestion.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {suggestion.description}
                        </p>
                      )}
                      <button
                        onClick={() => handleMatch(suggestion._id)}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                      >
                        Match Now <ArrowRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAIAssistant(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search skills or what you're seeking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={skill.owner?.avatar || `https://ui-avatars.com/api/?name=${skill.owner?.name}&background=14b8a6&color=fff`}
                    alt={skill.owner?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{skill.owner?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verified Student</p>
                  </div>
                </div>
                <div className="text-right">
                  {skill.matchScore && (
                    <div className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      <Sparkles size={14} />
                      {skill.matchScore}% match
                    </div>
                  )}
                  {getStatusBadge(skill.status)}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Offering:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{skill.offeredSkill}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Seeking:</span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {skill.seekingSkill}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{skill.description}</p>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Verified Profile</span>
                <div className="ml-auto flex gap-2">
                  {skill.owner?._id === user?._id && (
                    <>
                      <button
                        onClick={() => startEdit(skill)}
                        className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(skill._id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {skill.status === 'open' && skill.owner?._id !== user?._id && (
                    <button
                      onClick={() => handleMatch(skill._id)}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Start Swap
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredSkills.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No skills found. Try adjusting your search or be the first to post!</p>
        </div>
      )}

      {/* Post/Edit Skill Swap Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingSwap ? 'Edit Skill Swap' : 'List Your Skills'}
              </h2>
              <button
                onClick={() => {
                  setShowPostForm(false)
                  setEditingSwap(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skill You're Offering *
                </label>
                <input
                  type="text"
                  value={formData.offeredSkill}
                  onChange={(e) => setFormData({ ...formData, offeredSkill: e.target.value })}
                  placeholder="e.g., Web Development, Graphic Design, Photography"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skill You're Seeking *
                </label>
                <input
                  type="text"
                  value={formData.seekingSkill}
                  onChange={(e) => setFormData({ ...formData, seekingSkill: e.target.value })}
                  placeholder="e.g., Video Editing, Social Media Management, Data Analysis"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="input-field"
                  placeholder="Describe your skills and what you're looking for..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostForm(false)
                    setEditingSwap(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSwap ? 'Update Swap' : 'Post Skill Swap'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
