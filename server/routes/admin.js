import express from 'express'
import { protect } from '../middleware/auth.js'
import { adminOnly } from '../middleware/admin.js'
import User from '../models/User.js'
import ReUseIt from '../models/ReUseIt.js'
import YouthGig from '../models/YouthGig.js'
import SkillSwap from '../models/SkillSwap.js'
import Mentorship from '../models/Mentorship.js'
import Wallet from '../models/Wallet.js'

const router = express.Router()

// All routes require authentication and admin role
router.use(protect)
router.use(adminOnly)

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Admin only
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ status: 'active' })
    const inactiveUsers = await User.countDocuments({ status: 'inactive' })
    const suspendedUsers = await User.countDocuments({ status: 'suspended' })
    const bannedUsers = await User.countDocuments({ status: 'banned' })
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalAlumni = await User.countDocuments({ role: 'alumni' })
    const totalAdmins = await User.countDocuments({ role: 'admin' })
    const totalItems = await ReUseIt.countDocuments()
    const totalGigs = await YouthGig.countDocuments()
    const totalSwaps = await SkillSwap.countDocuments()
    const totalSessions = await Mentorship.countDocuments()
    const totalWallets = await Wallet.countDocuments()
    
    // Calculate total wallet balance
    const wallets = await Wallet.find()
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

    // Calculate active user percentage
    const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
    const inactivePercentage = totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : 0

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        activePercentage,
        inactive: inactiveUsers,
        inactivePercentage,
        suspended: suspendedUsers,
        banned: bannedUsers,
        students: totalStudents,
        alumni: totalAlumni,
        admins: totalAdmins
      },
      content: {
        items: totalItems,
        gigs: totalGigs,
        swaps: totalSwaps,
        sessions: totalSessions
      },
      financial: {
        wallets: totalWallets,
        totalBalance: totalBalance.toFixed(2)
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const { search, status, role, page = 1, limit = 50 } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      query.status = status
    }

    if (role) {
      query.role = role
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await User.countDocuments(query)

    res.json({
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/admin/users/:id
// @desc    Get user details with activity
// @access  Admin only
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get user activity stats
    const userItems = await ReUseIt.countDocuments({ owner: user._id })
    const userGigs = await YouthGig.countDocuments({ postedBy: user._id })
    const userSwaps = await SkillSwap.countDocuments({ owner: user._id })
    const userSessions = await Mentorship.countDocuments({ 
      $or: [{ student: user._id }, { mentor: user._id }] 
    })

    // Get user wallet
    const wallet = await Wallet.findOne({ user: user._id })

    // Get weekly activity (mock data for now - can be enhanced with actual activity tracking)
    const weeklyActivity = [
      { day: 'Mon', value: Math.floor(Math.random() * 50) },
      { day: 'Tue', value: Math.floor(Math.random() * 50) },
      { day: 'Wed', value: Math.floor(Math.random() * 50) },
      { day: 'Thu', value: Math.floor(Math.random() * 50) },
      { day: 'Fri', value: Math.floor(Math.random() * 50) },
      { day: 'Sat', value: Math.floor(Math.random() * 30) },
      { day: 'Sun', value: Math.floor(Math.random() * 30) }
    ]

    res.json({
      ...user.toObject(),
      activity: {
        items: userItems,
        gigs: userGigs,
        swaps: userSwaps,
        sessions: userSessions,
        walletBalance: wallet?.balance || 0,
        weeklyActivity
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    if (!['student', 'alumni', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate, deactivate, suspend, ban)
// @access  Admin only
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'inactive', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin' && status === 'banned') {
      return res.status(400).json({ message: 'Cannot ban admin user' })
    }

    user.status = status
    await user.save()

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/admin/users
// @desc    Create new user (admin only)
// @access  Admin only
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, university, role, status, isVerified } = req.body

    // Validation
    if (!name || !email || !password || !university) {
      return res.status(400).json({ message: 'Please provide name, email, password, and university' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() })
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Validate role
    const validRole = role && ['student', 'alumni', 'admin'].includes(role) ? role : 'student'
    const validStatus = status && ['active', 'inactive', 'suspended', 'banned'].includes(status) ? status : 'active'

    // Create user
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=14b8a6&color=fff`
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      university,
      avatar,
      role: validRole,
      status: validStatus,
      isVerified: isVerified === true || isVerified === 'true'
    })

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password')
    res.status(201).json(userResponse)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/admin/users/:id
// @desc    Update user details
// @access  Admin only
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, university, role, status, isVerified, points } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent banning or deleting the last admin
    if (user.role === 'admin' && req.body.role && req.body.role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot change role of the last admin user' })
      }
    }

    // Update fields
    if (name) user.name = name
    if (email) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' })
      }
      user.email = email.toLowerCase()
    }
    if (university) user.university = university
    if (role && ['student', 'alumni', 'admin'].includes(role)) user.role = role
    if (status && ['active', 'inactive', 'suspended', 'banned'].includes(status)) {
      if (user.role === 'admin' && status === 'banned') {
        return res.status(400).json({ message: 'Cannot ban admin user' })
      }
      user.status = status
    }
    if (typeof isVerified === 'boolean') user.isVerified = isVerified
    if (typeof points === 'number') user.points = points

    await user.save()

    const updatedUser = await User.findById(user._id).select('-password')
    res.json(updatedUser)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' })
    }
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin') {
      // Prevent deleting the last admin
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' })
      }
      return res.status(400).json({ message: 'Cannot delete admin user' })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/admin/items
// @desc    Get all items
// @access  Admin only
router.get('/items', async (req, res) => {
  try {
    const items = await ReUseIt.find()
      .populate('owner', 'name email')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/admin/gigs
// @desc    Get all gigs
// @access  Admin only
router.get('/gigs', async (req, res) => {
  try {
    const gigs = await YouthGig.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(gigs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/admin/items/:id
// @desc    Delete item (content moderation)
// @access  Admin only
router.delete('/items/:id', async (req, res) => {
  try {
    await ReUseIt.findByIdAndDelete(req.params.id)
    res.json({ message: 'Item deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/admin/gigs/:id
// @desc    Delete gig (content moderation)
// @access  Admin only
router.delete('/gigs/:id', async (req, res) => {
  try {
    await YouthGig.findByIdAndDelete(req.params.id)
    res.json({ message: 'Gig deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/admin/swaps
// @desc    Get all skill swaps
// @access  Admin only
router.get('/swaps', async (req, res) => {
  try {
    const swaps = await SkillSwap.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
    res.json(swaps)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/admin/swaps/:id
// @desc    Delete skill swap (content moderation)
// @access  Admin only
router.delete('/swaps/:id', async (req, res) => {
  try {
    await SkillSwap.findByIdAndDelete(req.params.id)
    res.json({ message: 'Skill swap deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/admin/sessions
// @desc    Get all mentorship sessions
// @access  Admin only
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Mentorship.find()
      .populate('student', 'name email')
      .populate('mentor', 'name email')
      .sort({ createdAt: -1 })
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

