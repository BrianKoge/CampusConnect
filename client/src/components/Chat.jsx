import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Send, X, User, Search, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../utils/api'

export default function Chat({ isOpen, onClose }) {
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [availableUsers, setAvailableUsers] = useState([])
  const [showUserList, setShowUserList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations()
      fetchAvailableUsers()
    }
  }, [isOpen, user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)
      if (socket) {
        socket.emit('join-chat', selectedConversation._id)
        // Mark messages as read when conversation is opened
        socket.emit('mark-read', selectedConversation._id)
      }
    }

    return () => {
      if (selectedConversation && socket) {
        socket.emit('leave-chat', selectedConversation._id)
      }
    }
  }, [selectedConversation, socket])

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        if (data.chatId === selectedConversation?._id) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => 
              msg._id === data.message._id || 
              (msg.createdAt === data.message.createdAt && msg.text === data.message.text)
            )
            if (messageExists) return prev
            return [...prev, data.message]
          })
          fetchConversations() // Refresh conversations list
        } else {
          fetchConversations() // Update unread count
        }
      })

      socket.on('message-sent', (data) => {
        if (data.chatId === selectedConversation?._id) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => 
              msg._id === data.message._id || 
              (msg.createdAt === data.message.createdAt && msg.text === data.message.text)
            )
            if (messageExists) return prev
            return [...prev, data.message]
          })
          fetchConversations()
        }
      })

      socket.on('messages-read', (data) => {
        if (data.chatId === selectedConversation?._id) {
          setMessages(prev => prev.map(msg => ({ ...msg, read: true })))
        }
      })

      return () => {
        socket.off('receive-message')
        socket.off('message-sent')
        socket.off('messages-read')
      }
    }
  }, [socket, selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations')
      setConversations(response.data)
      setLoading(false)
      
      // Emit custom event to update header unread count
      window.dispatchEvent(new CustomEvent('chat-conversations-updated'))
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/chat/messages/${chatId}`)
      setMessages(response.data)
      
      // Mark messages as read
      await api.put(`/chat/messages/${chatId}/read`)
      if (socket) {
        socket.emit('mark-read', chatId)
      }
      
      // Update header unread count
      window.dispatchEvent(new CustomEvent('chat-conversations-updated'))
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/chat/users')
      setAvailableUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const startConversation = async (userId) => {
    try {
      const response = await api.get(`/chat/conversation/${userId}`)
      setSelectedConversation({
        _id: response.data._id,
        otherUser: response.data.participants.find(
          p => p._id !== user._id
        )
      })
      setShowUserList(false)
      fetchMessages(response.data._id)
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !isConnected) return

    try {
      const messageData = {
        chatId: selectedConversation?._id,
        recipientId: selectedConversation?.otherUser?._id,
        text: newMessage.trim()
      }

      socket.emit('send-message', messageData)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  const chatContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[99]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full lg:w-96 bg-white dark:bg-gray-800 shadow-xl z-[100] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
        {!selectedConversation ? (
          <>
            {/* Conversations List */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUserList(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="New Message"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {showUserList ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  <button
                    onClick={() => setShowUserList(false)}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    ← Back to conversations
                  </button>
                </div>
                <div className="p-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => startConversation(user._id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14b8a6&color=fff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className="w-full flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <img
                        src={conv.otherUser?.avatar || `https://ui-avatars.com/api/?name=${conv.otherUser?.name}&background=14b8a6&color=fff`}
                        alt={conv.otherUser?.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {conv.otherUser?.name || 'Unknown'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
                    <button
                      onClick={() => setShowUserList(true)}
                      className="mt-4 btn-primary text-sm"
                    >
                      Start a conversation
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Chat Window */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ←
                </button>
                <img
                  src={selectedConversation.otherUser?.avatar || `https://ui-avatars.com/api/?name=${selectedConversation.otherUser?.name}&background=14b8a6&color=fff`}
                  alt={selectedConversation.otherUser?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.otherUser?.name || 'Unknown'}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.sender?._id === user?._id || 
                             (typeof message.sender === 'object' && message.sender._id === user?._id) ||
                             message.sender === user?._id
                // Create unique key combining _id, createdAt, and index
                const messageKey = message._id 
                  ? message._id 
                  : `${message.createdAt || Date.now()}-${index}-${message.text?.substring(0, 10) || ''}`
                return (
                  <div
                    key={messageKey}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isOwn
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                          isOwn
                          ? 'text-primary-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                    </p>
                  </div>
                </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-field"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!isConnected || !newMessage.trim()}
                  className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  Connecting to server...
              </p>
              )}
            </form>
          </>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(chatContent, document.body)
}
