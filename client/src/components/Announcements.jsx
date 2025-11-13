import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Megaphone, X, AlertCircle, Info, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../utils/api'

export default function Announcements() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [announcements, setAnnouncements] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    priority: 'medium'
  })

  useEffect(() => {
    if (user) {
      fetchAnnouncements()
    }
  }, [user])

  // Mark announcements as read when panel is opened
  useEffect(() => {
    if (isOpen && announcements.length > 0) {
      // Mark all unread announcements as read when panel opens
      const unreadAnnouncements = announcements.filter(a => !a.isRead)
      unreadAnnouncements.forEach(announcement => {
        markAsRead(announcement._id)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (socket) {
      socket.on('new-announcement', (announcement) => {
        setAnnouncements(prev => [announcement, ...prev])
        setUnreadCount(prev => prev + 1)
      })

      return () => {
        socket.off('new-announcement')
      }
    }
  }, [socket])

  useEffect(() => {
    const unread = announcements.filter(a => !a.isRead).length
    setUnreadCount(unread)
  }, [announcements])

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements')
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }

  const markAsRead = async (announcementId) => {
    try {
      await api.put(`/announcements/${announcementId}/read`)
      setAnnouncements(prev =>
        prev.map(a => a._id === announcementId ? { ...a, isRead: true } : a)
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/announcements', formData)
      setShowCreateForm(false)
      setFormData({
        title: '',
        message: '',
        targetAudience: 'all',
        priority: 'medium'
      })
      fetchAnnouncements()
      alert('Announcement created successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create announcement')
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="text-red-500" size={20} />
      case 'high':
        return <AlertTriangle className="text-orange-500" size={20} />
      case 'medium':
        return <Info className="text-blue-500" size={20} />
      default:
        return <CheckCircle className="text-green-500" size={20} />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'medium':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    }
  }

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[99]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full lg:w-96 bg-white dark:bg-gray-800 shadow-xl z-[100] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Announcements</h2>
                <div className="flex gap-2">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Create Announcement"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Announcements List */}
              <div className="flex-1 overflow-y-auto p-4">
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <motion.div
                        key={announcement._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 ${
                          getPriorityColor(announcement.priority)
                        } ${!announcement.isRead ? 'ring-2 ring-primary-500' : ''}`}
                        onClick={() => {
                          // Mark as read when clicked/viewed
                          if (!announcement.isRead) {
                            markAsRead(announcement._id)
                          }
                        }}
                        onMouseEnter={() => {
                          // Mark as read when hovered/viewed
                          if (!announcement.isRead) {
                            markAsRead(announcement._id)
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {getPriorityIcon(announcement.priority)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {announcement.title}
                              </h3>
                              {!announcement.isRead && (
                                <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {announcement.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                              <span>
                                {announcement.createdBy?.name || 'Admin'} •{' '}
                                {new Date(announcement.createdAt).toLocaleDateString()}
                              </span>
                              <span className="capitalize">{announcement.priority}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Megaphone className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">No announcements yet</p>
                  </div>
                )}
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  const createFormContent = showCreateForm ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Announcement
          </h2>
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
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
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="input-field"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="alumni">Alumni Only</option>
                <option value="admins">Admins Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Announcement
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  ) : null

  return (
    <>
      {/* Announcements Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Announcements"
      >
        <Megaphone size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Announcements Panel - Rendered via Portal */}
      {createPortal(panelContent, document.body)}
      {createFormContent && createPortal(createFormContent, document.body)}
    </>
  )
}

