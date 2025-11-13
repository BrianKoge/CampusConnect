import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import Chat from './models/Chat.js'
import Announcement from './models/Announcement.js'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import reuseItRoutes from './routes/reuseit.js'
import youthGigRoutes from './routes/youthgig.js'
import skillSwapRoutes from './routes/skillswap.js'
import mentorshipRoutes from './routes/mentorship.js'
import leaderboardRoutes from './routes/leaderboard.js'
import walletRoutes from './routes/wallet.js'
import adminRoutes from './routes/admin.js'
import chatRoutes from './routes/chat.js'
import announcementRoutes, { setIO as setAnnouncementIO } from './routes/announcements.js'
import notificationRoutes, { setIO as setNotificationIO } from './routes/notifications.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reuseit', reuseItRoutes)
app.use('/api/youthgig', youthGigRoutes)
app.use('/api/skillswap', skillSwapRoutes)
app.use('/api/mentorship', mentorshipRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CampusConnect API is running' })
})

// Store user socket connections
const userSockets = new Map()

io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication error'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId)

  // Store user socket
  userSockets.set(socket.userId.toString(), socket.id)

  // Join user's personal room
  socket.join(`user_${socket.userId}`)

  // Handle chat messages
  socket.on('send-message', async (data) => {
    try {
      const { chatId, text, recipientId } = data

      let conversation

      if (chatId) {
        conversation = await Chat.findById(chatId)
      } else if (recipientId) {
        conversation = await Chat.findOne({
          participants: { $all: [socket.userId, recipientId] }
        })

        if (!conversation) {
          conversation = await Chat.create({
            participants: [socket.userId, recipientId]
          })
        }
      }

      if (!conversation) {
        return socket.emit('error', { message: 'Conversation not found' })
      }

      // Add message
      conversation.messages.push({
        sender: socket.userId,
        text,
        read: false
      })

      conversation.lastMessage = text
      conversation.lastMessageAt = new Date()
      await conversation.save()

      await conversation.populate('messages.sender', 'name avatar')
      await conversation.populate('participants', 'name avatar email')

      const newMessage = conversation.messages[conversation.messages.length - 1]

      // Send to recipient
      const recipientSocketId = userSockets.get(recipientId)
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive-message', {
          chatId: conversation._id,
          message: newMessage,
          conversation
        })
      }

      // Send confirmation to sender
      socket.emit('message-sent', {
        chatId: conversation._id,
        message: newMessage
      })
    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // Handle joining chat room
  socket.on('join-chat', (chatId) => {
    socket.join(`chat_${chatId}`)
    console.log(`User ${socket.userId} joined chat ${chatId}`)
  })

  // Handle leaving chat room
  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat_${chatId}`)
    console.log(`User ${socket.userId} left chat ${chatId}`)
  })

  // Handle marking messages as read
  socket.on('mark-read', async (chatId) => {
    try {
      const conversation = await Chat.findById(chatId)
      if (conversation) {
        conversation.messages.forEach(msg => {
          if (msg.sender.toString() !== socket.userId.toString()) {
            msg.read = true
          }
        })
        await conversation.save()

        // Notify other participant
        const otherParticipant = conversation.participants.find(
          p => p.toString() !== socket.userId.toString()
        )
        if (otherParticipant) {
          const otherSocketId = userSockets.get(otherParticipant.toString())
          if (otherSocketId) {
            io.to(otherSocketId).emit('messages-read', { chatId })
          }
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    userSockets.delete(socket.userId.toString())
  })
})

// Set io instance for announcements and notifications (after io is created)
setAnnouncementIO(io)
setNotificationIO(io)

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect')
  .then(() => {
    console.log('✅ MongoDB connected successfully')
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
  })

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.io server ready`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export { io }

