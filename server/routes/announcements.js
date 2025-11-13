import express from 'express'
import { protect } from '../middleware/auth.js'
import { adminOnly } from '../middleware/admin.js'
import Announcement from '../models/Announcement.js'
import User from '../models/User.js'

const router = express.Router()

// Store io instance for broadcasting
let ioInstance = null

export const setIO = (io) => {
  ioInstance = io
}

// @route   GET /api/announcements
// @desc    Get all active announcements for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query
    const userRole = req.user.role

    // Build query based on target audience
    const query = {
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole }
      ]
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    // Add read status for each announcement
    const announcementsWithReadStatus = announcements.map(announcement => {
      const isRead = announcement.readBy.some(
        read => read.user.toString() === req.user._id.toString()
      )
      return {
        ...announcement.toObject(),
        isRead
      }
    })

    res.json(announcementsWithReadStatus)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name avatar')

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    // Check if user should see this announcement
    if (announcement.targetAudience !== 'all' && 
        announcement.targetAudience !== req.user.role) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const isRead = announcement.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    )

    res.json({
      ...announcement.toObject(),
      isRead
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/announcements
// @desc    Create new announcement (Admin only)
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id
    })

    await announcement.populate('createdBy', 'name avatar')

    // Broadcast announcement via Socket.io
    if (ioInstance) {
      const populatedAnnouncement = announcement.toObject()
      populatedAnnouncement.createdBy = announcement.createdBy
      ioInstance.emit('new-announcement', populatedAnnouncement)
    }

    res.status(201).json(announcement)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/announcements/:id/read
// @desc    Mark announcement as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    // Check if already read
    const alreadyRead = announcement.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    )

    if (!alreadyRead) {
      announcement.readBy.push({
        user: req.user._id,
        readAt: new Date()
      })
      await announcement.save()
    }

    res.json({ message: 'Announcement marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/announcements/:id
// @desc    Update announcement (Admin only)
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'name avatar')

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    res.json(announcement)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id)
    res.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

