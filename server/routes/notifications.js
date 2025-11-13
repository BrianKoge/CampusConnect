import express from 'express'
import { protect } from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// Store io instance for broadcasting
let ioInstance = null

export const setIO = (io) => {
  ioInstance = io
}

// Helper function to create and broadcast notification
export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData)
    
    // Populate user details
    await notification.populate('fromUser', 'name avatar')
    await notification.populate('user', 'name')
    
    // Broadcast via Socket.io if available
    if (ioInstance) {
      ioInstance.to(`user_${notification.user._id.toString()}`).emit('new-notification', notification)
    }
    
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query
    
    const query = { user: req.user._id }
    if (unreadOnly === 'true') {
      query.read = false
    }
    
    const notifications = await Notification.find(query)
      .populate('fromUser', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
    
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false
    })
    
    res.json({ count })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    notification.read = true
    notification.readAt = new Date()
    await notification.save()
    
    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() }
    )
    
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    await Notification.findByIdAndDelete(req.params.id)
    
    res.json({ message: 'Notification deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

