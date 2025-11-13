import { useState, useEffect } from 'react'
import { Search, Filter, Plus, MessageCircle, MapPin, Clock, User, Edit, Trash2, CheckCircle, X, XCircle, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { SkeletonList } from '../components/SkeletonLoader'
import api from '../utils/api'

// Auto-refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000

const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other']

export default function ReUseIt() {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Books',
    condition: 'Good',
    location: '',
    images: []
  })

  useEffect(() => {
    fetchItems()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchItems()
    }, REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [selectedCategory, searchQuery])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedCategory !== 'All') params.category = selectedCategory
      if (searchQuery) params.search = searchQuery

      const response = await api.get('/reuseit', { params })
      setItems(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch items:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingItem) {
        await api.put(`/reuseit/${editingItem._id}`, formData)
        showToast('Item updated successfully!', 'success', 'Success')
      } else {
        await api.post('/reuseit', formData)
        showToast('Item posted successfully!', 'success', 'Success')
      }
      setShowPostForm(false)
      setEditingItem(null)
      setFormData({
        title: '',
        description: '',
        category: 'Books',
        condition: 'Good',
        location: '',
        images: []
      })
      fetchItems()
      refreshUser() // Refresh user to update points
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save item', 'error', 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      await api.delete(`/reuseit/${itemId}`)
      showToast('Item deleted successfully!', 'success', 'Success')
      fetchItems()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete item', 'error', 'Error')
    }
  }

  const handleRequest = async (itemId) => {
    try {
      await api.put(`/reuseit/${itemId}/request`)
      showToast('Exchange request sent!', 'success', 'Success')
      fetchItems()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to request exchange', 'error', 'Error')
    }
  }

  const handleApprove = async (itemId) => {
    try {
      await api.put(`/reuseit/${itemId}/approve`)
      showToast('Exchange approved! Points awarded.', 'success', 'Success')
      fetchItems()
      refreshUser() // Refresh user to update points
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve exchange', 'error', 'Error')
    }
  }

  const handleCancelRequest = async (itemId) => {
    try {
      await api.put(`/reuseit/${itemId}/cancel-request`)
      showToast('Request cancelled', 'info', 'Success')
      fetchItems()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel request', 'error', 'Error')
    }
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      location: item.location,
      images: item.images || []
    })
    setShowPostForm(true)
  }

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getStatusBadge = (status) => {
    const badges = {
      available: { text: 'Available', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
      exchanged: { text: 'Exchanged', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }
    }
    const badge = badges[status] || badges.available
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ReUseIt Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Exchange used-but-usable items and reduce waste on campus
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null)
            setFormData({
              title: '',
              description: '',
              category: 'Books',
              condition: 'Good',
              location: '',
              images: []
            })
            setShowPostForm(true)
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Post Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select 
              className="input-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <SkeletonList count={3} />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Recycle className="text-gray-400" size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                  {item.category}
                </div>
                {getStatusBadge(item.status)}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User size={16} />
                  <span>{item.owner?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {item.condition}
                </span>
                <div className="flex items-center gap-2">
                  {item.owner?._id === user?._id && (
                    <>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  {item.status === 'available' && item.owner?._id !== user?._id && (
                    <button 
                      onClick={() => handleRequest(item._id)}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      <MessageCircle size={16} />
                      Request Exchange
                    </button>
                  )}
                  {item.status === 'pending' && item.owner?._id === user?._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item._id)}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleCancelRequest(item._id)}
                        className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Decline
                      </button>
                    </div>
                  )}
                  {item.status === 'pending' && item.requestedBy?._id === user?._id && (
                    <button
                      onClick={() => handleCancelRequest(item._id)}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}

      {!loading && filteredItems.length === 0 && (
        <EmptyState
          icon={Package}
          title="No items found"
          description={searchQuery || selectedCategory !== 'All' 
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Be the first to post an item and start exchanging on campus!"}
          action={
            <button
              onClick={() => {
                setEditingItem(null)
                setFormData({
                  title: '',
                  description: '',
                  category: 'Books',
                  condition: 'Good',
                  location: '',
                  images: []
                })
                setShowPostForm(true)
              }}
              className="btn-primary"
            >
              <Plus size={20} />
              Post Your First Item
            </button>
          }
        />
      )}

      {/* Post/Edit Item Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Post New Item'}
              </h2>
              <button
                onClick={() => {
                  setShowPostForm(false)
                  setEditingItem(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
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
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condition *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
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
                  placeholder="e.g., Main Library, Dormitory A"
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostForm(false)
                    setEditingItem(null)
                  }}
                  disabled={submitting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      {editingItem ? 'Updating...' : 'Posting...'}
                    </>
                  ) : (
                    editingItem ? 'Update Item' : 'Post Item'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
