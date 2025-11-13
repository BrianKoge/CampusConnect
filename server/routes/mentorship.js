import express from 'express'
import { protect } from '../middleware/auth.js'
import Mentorship from '../models/Mentorship.js'
import User from '../models/User.js'
import { createNotification } from './notifications.js'

const router = express.Router()

// @route   GET /api/mentorship/mentors
// @desc    Get all mentors
// @access  Public
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'alumni' })
      .select('name email avatar university mentorProfile')
      .limit(20)
    
    // Include mentor profile data
    const mentorsWithDetails = mentors.map(mentor => ({
      ...mentor.toObject(),
      title: mentor.mentorProfile?.title || 'Alumni Mentor',
      expertise: mentor.mentorProfile?.expertise || [],
      rating: mentor.mentorProfile?.rating || 4.8,
      sessions: mentor.mentorProfile?.totalMentorshipSessions || 0,
      availability: mentor.mentorProfile?.availability || 'Available',
      bio: mentor.mentorProfile?.bio || ''
    }))
    
    res.json(mentorsWithDetails)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/mentorship/book
// @desc    Book mentorship session (book available session or create new one)
// @access  Private
router.post('/book', protect, async (req, res) => {
  try {
    // If booking an existing available session
    if (req.body.sessionId) {
      const session = await Mentorship.findById(req.body.sessionId)
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' })
      }
      
      if (session.status !== 'available') {
        return res.status(400).json({ message: 'Session is not available for booking' })
      }
      
      if (session.student) {
        return res.status(400).json({ message: 'Session already booked' })
      }
      
      // Assign student to session
      session.student = req.user._id
      session.status = 'pending' // Pending mentor confirmation
      await session.save()
      
      // Update mentor's session count
      const mentor = await User.findById(session.mentor)
      if (mentor && mentor.mentorProfile) {
        mentor.mentorProfile.totalMentorshipSessions = (mentor.mentorProfile.totalMentorshipSessions || 0) + 1
        await mentor.save()
      }
      // Award points for booking
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: 10 }
      })

      // Create notification for mentor
      await createNotification({
        user: session.mentor,
        type: 'mentorship_booking',
        title: 'New Mentorship Booking',
        message: `${req.user.name} has booked your mentorship session: "${session.topic}"`,
        relatedItem: session._id,
        relatedModel: 'Mentorship',
        fromUser: req.user._id
      })
      
      const populatedSession = await Mentorship.findById(session._id)
        .populate('mentor', 'name avatar')
        .populate('student', 'name avatar')
      
      return res.json(populatedSession)
    }
    
    // Create new session (student booking directly with mentor)
    if (!req.body.mentor) {
      return res.status(400).json({ message: 'Mentor ID is required' })
    }
    
    const session = await Mentorship.create({
      mentor: req.body.mentor,
      student: req.user._id,
      topic: req.body.topic,
      description: req.body.description || '',
      sessionType: req.body.sessionType,
      scheduledAt: req.body.scheduledAt,
      status: 'pending' // Pending mentor confirmation
    })
    
    // Update mentor's session count
    const mentor = await User.findById(req.body.mentor)
    if (mentor && mentor.mentorProfile) {
      mentor.mentorProfile.totalMentorshipSessions = (mentor.mentorProfile.totalMentorshipSessions || 0) + 1
      await mentor.save()
    }

    // Create notification for mentor
    await createNotification({
      user: req.body.mentor,
      type: 'mentorship_booking',
      title: 'New Mentorship Booking',
      message: `${req.user.name} has requested a mentorship session: "${req.body.topic}"`,
      relatedItem: session._id,
      relatedModel: 'Mentorship',
      fromUser: req.user._id
    })
    
    const populatedSession = await Mentorship.findById(session._id)
      .populate('mentor', 'name avatar')
      .populate('student', 'name avatar')
    
    res.status(201).json(populatedSession)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/mentorship/sessions
// @desc    Get user's sessions
// @access  Private
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await Mentorship.find({
      $or: [
        { student: req.user._id },
        { mentor: req.user._id }
      ]
    })
      .populate('mentor', 'name avatar')
      .populate('student', 'name avatar')
      .sort({ scheduledAt: -1 })
    
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/mentorship/mentor/profile
// @desc    Get mentor profile
// @access  Private (Alumni only)
router.get('/mentor/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can access mentor profile' })
    }

    const user = await User.findById(req.user._id).select('mentorProfile name avatar')
    res.json({
      title: user.mentorProfile?.title || '',
      bio: user.mentorProfile?.bio || '',
      expertise: user.mentorProfile?.expertise || [],
      availability: user.mentorProfile?.availability || 'Available',
      rating: user.mentorProfile?.rating || 0,
      totalMentorshipSessions: user.mentorProfile?.totalMentorshipSessions || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/mentorship/mentor/profile
// @desc    Update mentor profile
// @access  Private (Alumni only)
router.put('/mentor/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can update mentor profile' })
    }

    const user = await User.findById(req.user._id)
    user.mentorProfile = {
      title: req.body.title || user.mentorProfile?.title || '',
      bio: req.body.bio || user.mentorProfile?.bio || '',
      expertise: req.body.expertise || user.mentorProfile?.expertise || [],
      availability: req.body.availability || user.mentorProfile?.availability || 'Available',
      rating: user.mentorProfile?.rating || 0,
      totalMentorshipSessions: user.mentorProfile?.totalMentorshipSessions || 0
    }
    await user.save()

    res.json(user.mentorProfile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/mentorship/mentor/sessions
// @desc    Create mentorship session (by mentor)
// @access  Private (Alumni only)
router.post('/mentor/sessions', protect, async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create mentorship sessions' })
    }

    // Validate scheduled date is in the future
    if (new Date(req.body.scheduledAt) < new Date()) {
      return res.status(400).json({ message: 'Scheduled date must be in the future' })
    }

    const session = await Mentorship.create({
      mentor: req.user._id,
      topic: req.body.topic,
      description: req.body.description || '',
      sessionType: req.body.sessionType,
      scheduledAt: req.body.scheduledAt,
      status: 'available', // Available for booking
      maxStudents: req.body.maxStudents || 1,
      // Student will be assigned when they book
      student: null
    })

    const populatedSession = await Mentorship.findById(session._id)
      .populate('mentor', 'name avatar mentorProfile')
      .populate('student', 'name avatar')

    res.status(201).json(populatedSession)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/mentorship/sessions/:id/status
// @desc    Update session status
// @access  Private
router.put('/sessions/:id/status', protect, async (req, res) => {
  try {
    const session = await Mentorship.findById(req.params.id)
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    // Check if user is mentor or student
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.student?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const previousStatus = session.status
    session.status = req.body.status
    
    // Award points when session is completed
    if (req.body.status === 'completed' && previousStatus !== 'completed') {
      await User.findByIdAndUpdate(session.mentor, {
        $inc: { points: 40, totalSessions: 1 }
      })
      if (session.student) {
        await User.findByIdAndUpdate(session.student, {
          $inc: { points: 20, totalSessions: 1 }
        })
      }
    }

    // Create notifications based on status change
    if (req.body.status === 'confirmed' && previousStatus === 'pending' && session.student) {
      await createNotification({
        user: session.student,
        type: 'mentorship_confirmed',
        title: 'Mentorship Session Confirmed',
        message: `Your mentorship session "${session.topic}" has been confirmed`,
        relatedItem: session._id,
        relatedModel: 'Mentorship',
        fromUser: session.mentor
      })
    } else if (req.body.status === 'cancelled' && session.student) {
      await createNotification({
        user: session.student,
        type: 'mentorship_declined',
        title: 'Mentorship Session Cancelled',
        message: `Your mentorship session "${session.topic}" has been cancelled`,
        relatedItem: session._id,
        relatedModel: 'Mentorship',
        fromUser: session.mentor
      })
    } else if (req.body.status === 'completed' && session.student) {
      await createNotification({
        user: session.student,
        type: 'mentorship_completed',
        title: 'Mentorship Session Completed',
        message: `Your mentorship session "${session.topic}" has been marked as completed`,
        relatedItem: session._id,
        relatedModel: 'Mentorship',
        fromUser: session.mentor
      })
    }
    
    await session.save()

    const populatedSession = await Mentorship.findById(session._id)
      .populate('mentor', 'name avatar')
      .populate('student', 'name avatar')

    res.json(populatedSession)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

