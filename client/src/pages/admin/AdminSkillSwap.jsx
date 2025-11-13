import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Users, 
  User,
  Clock,
  ArrowLeftRight,
  XCircle,
  Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../utils/api'

export default function AdminSkillSwap() {
  const [swaps, setSwaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSwap, setSelectedSwap] = useState(null)

  useEffect(() => {
    fetchSwaps()
  }, [])

  const fetchSwaps = async () => {
    try {
      const response = await api.get('/admin/swaps')
      setSwaps(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch swaps:', error)
      setLoading(false)
    }
  }

  const deleteSwap = async (swapId) => {
    if (!confirm('Are you sure you want to delete this skill swap?')) return

    try {
      await api.delete(`/admin/swaps/${swapId}`)
      fetchSwaps()
      if (selectedSwap?._id === swapId) {
        setSelectedSwap(null)
      }
    } catch (error) {
      alert('Failed to delete skill swap')
    }
  }

  const filteredSwaps = swaps.filter(swap =>
    swap.skillOffered?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    swap.skillNeeded?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    swap.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className={`flex-1 ${selectedSwap ? 'lg:max-w-[calc(100%-26rem)]' : ''}`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Skill Swaps Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage all skill swap exchanges
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search skills, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredSwaps.length} swaps
              </span>
            </div>
          </div>
        </div>

        {/* Swaps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSwaps.map((swap) => (
            <motion.div
              key={swap._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSwap(swap)}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                    <Users className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {swap.owner?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Offering</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {swap.skillOffered}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowLeftRight className="text-gray-400" size={20} />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Needing</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {swap.skillNeeded}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSwaps.length === 0 && (
          <div className="card text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No skill swaps found</p>
          </div>
        )}
      </div>

      {/* Swap Details Panel */}
      {selectedSwap && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto fixed right-0 top-0 h-screen z-40 lg:relative lg:z-auto lg:h-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Swap Details</h2>
              <button
                onClick={() => setSelectedSwap(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">User</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSwap.owner?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Skill Offered</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {selectedSwap.skillOffered}
                  </p>
                  {selectedSwap.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {selectedSwap.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <ArrowLeftRight className="text-gray-400" size={24} />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Skill Needed</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {selectedSwap.skillNeeded}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Posted</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>{new Date(selectedSwap.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => deleteSwap(selectedSwap._id)}
                  className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Swap
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

