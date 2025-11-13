import { useState, useEffect } from 'react'
import { Search, MessageCircle, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import Chat from './Chat'
import Announcements from './Announcements'
import Notifications from './Notifications'
import api from '../utils/api'

export default function Header() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/chat/unread-count')
      setUnreadMessageCount(response.data.count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Listen for new messages via socket
  useEffect(() => {
    if (socket && user) {
      socket.on('receive-message', () => {
        fetchUnreadCount()
      })

      return () => {
        socket.off('receive-message')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user])

  // Listen for chat conversations updated event
  useEffect(() => {
    const handleConversationsUpdated = () => {
      fetchUnreadCount()
    }
    
    window.addEventListener('chat-conversations-updated', handleConversationsUpdated)
    return () => {
      window.removeEventListener('chat-conversations-updated', handleConversationsUpdated)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update count when chat is opened/closed
  useEffect(() => {
    if (chatOpen) {
      // When chat opens, messages are marked as read, so refresh count
      setTimeout(fetchUnreadCount, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen])

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Announcements */}
            <Announcements />

            {/* Notifications */}
            <Notifications />

            {/* Messages */}
            <button
              onClick={() => setChatOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MessageCircle size={20} />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=14b8a6&color=fff'}
                alt={user?.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-primary-500 transition-all"
                onClick={() => navigate('/dashboard')}
                title={user?.name}
              />
              <button
                onClick={logout}
                className="hidden sm:block px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Chat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </header>
  )
}

