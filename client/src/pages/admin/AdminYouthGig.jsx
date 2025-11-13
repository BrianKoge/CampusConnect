import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Briefcase,
  User,
  Clock,
  DollarSign,
  MapPin,
  XCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../utils/api'

export default function AdminYouthGig() {
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGig, setSelectedGig] = useState(null)

  useEffect(() => {
    fetchGigs()
  }, [])

  const fetchGigs = async () => {
    try {
      const response = await api.get('/admin/gigs')
      setGigs(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch gigs:', error)
      setLoading(false)
    }
  }

  const deleteGig = async (gigId) => {
    if (!confirm('Are you sure you want to delete this gig?')) return

    try {
      await api.delete(`/admin/gigs/${gigId}`)
      fetchGigs()
      if (selectedGig?._id === gigId) {
        setSelectedGig(null)
      }
    } catch (error) {
      alert('Failed to delete gig')
    }
  }

  const filteredGigs = gigs.filter(gig =>
    gig.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.postedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className={`flex-1 ${selectedGig ? 'lg:max-w-[calc(100%-26rem)]' : ''}`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gigs Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage all gigs posted on the platform
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search gigs, posters, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredGigs.length} gigs
              </span>
            </div>
          </div>
        </div>

        {/* Gigs List */}
        <div className="space-y-4">
          {filteredGigs.map((gig) => (
            <motion.div
              key={gig._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedGig(gig)}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="text-orange-600" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {gig.title}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                      ${gig.budget || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {gig.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{gig.postedBy?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{gig.location || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredGigs.length === 0 && (
          <div className="card text-center py-12">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No gigs found</p>
          </div>
        )}
      </div>

      {/* Gig Details Panel */}
      {selectedGig && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto fixed right-0 top-0 h-screen z-40 lg:relative lg:z-auto lg:h-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gig Details</h2>
              <button
                onClick={() => setSelectedGig(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {selectedGig.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedGig.description}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Budget</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${selectedGig.budget || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Category</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedGig.category || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedGig.location || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Posted By</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User size={20} className="text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedGig.postedBy?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedGig.postedBy?.email || 'No email'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Posted</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>{new Date(selectedGig.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => deleteGig(selectedGig._id)}
                  className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Gig
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

