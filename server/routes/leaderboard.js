import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// @route   GET /api/leaderboard/students
// @desc    Get student leaderboard
// @access  Public
router.get('/students', async (req, res) => {
  try {
    const { timeFilter = 'all' } = req.query
    let dateFilter = {}
    
    if (timeFilter === 'month') {
      dateFilter = { updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
    } else if (timeFilter === 'week') {
      dateFilter = { updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    }

    const students = await User.find({ 
      role: 'student',
      status: 'active',
      ...dateFilter
    })
      .select('name avatar points badges university totalExchanges totalGigs totalSwaps totalSessions')
      .sort({ points: -1 })
      .limit(100)
    
    // Calculate badges based on activity
    const rankings = students.map((student, index) => {
      const badges = []
      if (student.points >= 2000) badges.push('Green Ambassador')
      if (student.totalSessions >= 10) badges.push('Peer Mentor')
      if (student.totalExchanges >= 50) badges.push('ReUse Champion')
      if (student.totalSwaps >= 20) badges.push('Skill Master')
      
      return {
        rank: index + 1,
        ...student.toObject(),
        badge: badges[0] || null
      }
    })
    
    res.json(rankings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/leaderboard/user-stats
// @desc    Get current user's leaderboard stats
// @access  Private
router.get('/user-stats', async (req, res) => {
  try {
    // This will be called with protect middleware from frontend
    const userId = req.query.userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' })
    }

    const user = await User.findById(userId)
      .select('name avatar points badges totalExchanges totalGigs totalSwaps totalSessions')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Calculate rank
    const usersWithMorePoints = await User.countDocuments({
      role: 'student',
      points: { $gt: user.points }
    })
    const rank = usersWithMorePoints + 1

    // Calculate badges
    const badges = []
    if (user.points >= 2000) badges.push('Green Ambassador')
    if (user.totalSessions >= 10) badges.push('Peer Mentor')
    if (user.totalExchanges >= 50) badges.push('ReUse Champion')
    if (user.totalSwaps >= 20) badges.push('Skill Master')

    // Calculate points this month
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    // This is simplified - in production, track point history
    const pointsThisMonth = Math.floor(user.points * 0.15) // Estimate

    res.json({
      rank,
      points: user.points,
      pointsThisMonth,
      badges,
      totalExchanges: user.totalExchanges || 0,
      totalGigs: user.totalGigs || 0,
      totalSwaps: user.totalSwaps || 0,
      totalSessions: user.totalSessions || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/leaderboard/clubs
// @desc    Get club leaderboard (mock data for now)
// @access  Public
router.get('/clubs', async (req, res) => {
  try {
    // Mock club data - can be replaced with actual Club model
    const clubs = [
      { rank: 1, name: 'Eco Warriors', points: 8500, members: 45 },
      { rank: 2, name: 'Tech for Good', points: 7200, members: 38 },
      { rank: 3, name: 'Sustainable Future', points: 6800, members: 42 }
    ]
    
    res.json(clubs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

