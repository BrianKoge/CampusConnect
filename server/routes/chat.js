import express from 'express'
import { protect } from '../middleware/auth.js'
import Chat from '../models/Chat.js'
import User from '../models/User.js'

const router = express.Router()

// @route   GET /api/chat/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar email')
      .populate('messages.sender', 'name avatar')
      .sort({ lastMessageAt: -1 })

    // Format conversations with other user info
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      )
      const unreadCount = conv.messages.filter(
        m => m.sender.toString() !== req.user._id.toString() && !m.read
      ).length

      return {
        _id: conv._id,
        otherUser,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt
      }
    })

    res.json(formattedConversations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/chat/unread-count
// @desc    Get total unread message count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user._id
    })

    let totalUnread = 0
    conversations.forEach(conv => {
      const unreadCount = conv.messages.filter(
        m => m.sender.toString() !== req.user._id.toString() && !m.read
      ).length
      totalUnread += unreadCount
    })

    res.json({ count: totalUnread })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/chat/conversation/:userId
// @desc    Get or create conversation with specific user
// @access  Private
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot chat with yourself' })
    }

    // Find existing conversation
    let conversation = await Chat.findOne({
      participants: { $all: [req.user._id, userId] }
    })
      .populate('participants', 'name avatar email')
      .populate('messages.sender', 'name avatar')

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await Chat.create({
        participants: [req.user._id, userId],
        messages: []
      })
      await conversation.populate('participants', 'name avatar email')
    }

    res.json(conversation)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/chat/messages/:chatId
// @desc    Get messages for a conversation
// @access  Private
router.get('/messages/:chatId', protect, async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'name avatar')

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    // Check if user is part of conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    res.json(conversation.messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/chat/message
// @desc    Send a message (also used by Socket.io)
// @access  Private
router.post('/message', protect, async (req, res) => {
  try {
    const { chatId, text, recipientId } = req.body

    let conversation

    if (chatId) {
      // Existing conversation
      conversation = await Chat.findById(chatId)
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }
    } else if (recipientId) {
      // New conversation
      conversation = await Chat.findOne({
        participants: { $all: [req.user._id, recipientId] }
      })

      if (!conversation) {
        conversation = await Chat.create({
          participants: [req.user._id, recipientId]
        })
      }
    } else {
      return res.status(400).json({ message: 'chatId or recipientId required' })
    }

    // Add message
    conversation.messages.push({
      sender: req.user._id,
      text,
      read: false
    })

    conversation.lastMessage = text
    conversation.lastMessageAt = new Date()
    await conversation.save()

    await conversation.populate('messages.sender', 'name avatar')
    await conversation.populate('participants', 'name avatar email')

    const newMessage = conversation.messages[conversation.messages.length - 1]

    res.json({
      message: newMessage,
      conversation: conversation
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/chat/messages/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/messages/:chatId/read', protect, async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.chatId)

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    // Mark all messages from other participants as read
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) {
        msg.read = true
      }
    })

    await conversation.save()
    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/chat/users
// @desc    Get all users for starting a chat (excludes admin)
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      role: { $ne: 'admin' }, // Exclude admin users
      status: 'active'
    })
      .select('name avatar email university role')
      .limit(100)

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
