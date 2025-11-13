import { useState, useEffect } from 'react'
import { Search, Filter, Plus, DollarSign, Clock, MapPin, Star, Briefcase, Edit, Trash2, X, CheckCircle, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const REFRESH_INTERVAL = 30000

const gigTypes = ['All', 'Design', 'Tutoring', 'Writing', 'Event Help', 'Tech', 'Other']

export default function YouthGig() {
  const { user, refreshUser } = useAuth()
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingGig, setEditingGig] = useState(null)
  const [selectedGig, setSelectedGig] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Design',
    budget: '',
    duration: '',
    location: ''
  })

  useEffect(() => {
    fetchGigs()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchGigs()
    }, REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [selectedType, searchQuery])

  const fetchGigs = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedType !== 'All') params.type = selectedType
      if (searchQuery) params.search = searchQuery

      const response = await api.get('/youthgig', { params })
      setGigs(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch gigs:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingGig) {
        await api.put(`/youthgig/${editingGig._id}`, formData)
        alert('Gig updated successfully!')
      } else {
        await api.post('/youthgig', formData)
        alert('Gig posted successfully!')
      }
      setShowPostForm(false)
      setEditingGig(null)
      setFormData({
        title: '',
        description: '',
        type: 'Design',
        budget: '',
        duration: '',
        location: ''
      })
      fetchGigs()
      refreshUser() // Refresh user to update points
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save gig')
    }
  }

  const handleDelete = async (gigId) => {
    if (!confirm('Are you sure you want to delete this gig?')) return

    try {
      await api.delete(`/youthgig/${gigId}`)
      alert('Gig deleted successfully!')
      fetchGigs()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete gig')
    }
  }

  const handleApply = async (gigId) => {
    try {
      await api.post(`/youthgig/${gigId}/apply`)
      alert('Application submitted!')
      fetchGigs()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply')
    }
  }

  const handleSelectApplicant = async (gigId, applicantId) => {
    try {
      await api.put(`/youthgig/${gigId}/select-applicant`, { applicantId })
      alert('Applicant selected!')
      fetchGigs()
      refreshUser() // Refresh user to update points
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to select applicant')
    }
  }

  const handleComplete = async (gigId) => {
    try {
      await api.put(`/youthgig/${gigId}/complete`)
      alert('Gig marked as completed!')
      fetchGigs()
      refreshUser() // Refresh user to update points
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete gig')
    }
  }

  const startEdit = (gig) => {
    setEditingGig(gig)
    setFormData({
      title: gig.title,
      description: gig.description,
      type: gig.type,
      budget: gig.budget.toString(),
      duration: gig.duration,
      location: gig.location
    })
    setShowPostForm(true)
  }

  const filteredGigs = gigs.filter((gig) => {
    const matchesType = selectedType === 'All' || gig.type === selectedType
    const matchesSearch = gig.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const hasApplied = (gig) => {
    return gig.applicants?.some(app => 
      (typeof app.user === 'object' ? app.user._id : app.user) === user?._id
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      open: { text: 'Open', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'in-progress': { text: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      completed: { text: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' },
      cancelled: { text: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">YouthGig Board</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and post micro-tasks or freelance gigs for students
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingGig(null)
            setFormData({
              title: '',
              description: '',
              type: 'Design',
              budget: '',
              duration: '',
              location: ''
            })
            setShowPostForm(true)
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Post Gig
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select 
              className="input-field"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {gigTypes.map(type => (
                <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {gigTypes.map((type) => (
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
      </div>

      {/* Gigs Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGigs.map((gig, index) => (
            <motion.div
              key={gig._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="text-primary-600 dark:text-primary-400" size={20} />
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {gig.type}
                    </span>
                    {getStatusBadge(gig.status)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {gig.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {gig.description}
                  </p>
                </div>
                {gig.postedBy?._id === user?._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(gig)}
                      className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(gig._id)}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign size={16} />
                  <span className="font-semibold text-gray-900 dark:text-white">${gig.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>{gig.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  <span>{gig.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {gig.applicants?.length || 0} {gig.applicants?.length === 1 ? 'applicant' : 'applicants'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Posted by {gig.postedBy?.name || 'Unknown'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(gig.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  {gig.status === 'open' && gig.postedBy?._id !== user?._id && (
                    <button 
                      onClick={() => handleApply(gig._id)}
                      disabled={hasApplied(gig)}
                      className={`text-sm py-2 px-4 rounded-lg ${
                        hasApplied(gig)
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {hasApplied(gig) ? 'Applied' : 'Apply Now'}
                    </button>
                  )}
                  {gig.status === 'open' && gig.postedBy?._id === user?._id && gig.applicants?.length > 0 && (
                    <button
                      onClick={() => setSelectedGig(gig)}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <Users size={16} />
                      View Applicants ({gig.applicants.length})
                    </button>
                  )}
                  {gig.status === 'in-progress' && gig.postedBy?._id === user?._id && (
                    <button
                      onClick={() => handleComplete(gig._id)}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredGigs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No gigs found. Try adjusting your filters or be the first to post!</p>
        </div>
      )}

      {/* Applicants Modal */}
      {selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Applicants</h2>
              <button
                onClick={() => setSelectedGig(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {selectedGig.applicants?.length > 0 ? (
                selectedGig.applicants.map((app, index) => {
                  const applicant = typeof app.user === 'object' ? app.user : { _id: app.user }
                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={applicant.avatar || `https://ui-avatars.com/api/?name=${applicant.name}&background=14b8a6&color=fff`}
                          alt={applicant.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{applicant.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {selectedGig.status === 'open' && (
                        <button
                          onClick={() => {
                            handleSelectApplicant(selectedGig._id, applicant._id)
                            setSelectedGig(null)
                          }}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">No applicants yet</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Post/Edit Gig Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingGig ? 'Edit Gig' : 'Post a New Gig'}
              </h2>
              <button
                onClick={() => {
                  setShowPostForm(false)
                  setEditingGig(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gig Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  {gigTypes.slice(1).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="input-field"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 days, 2 hours/week"
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Remote or Campus location"
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostForm(false)
                    setEditingGig(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingGig ? 'Update Gig' : 'Post Gig'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
