import express from 'express'
import { protect } from '../middleware/auth.js'
import SkillSwap from '../models/SkillSwap.js'
import User from '../models/User.js'
import { createNotification } from './notifications.js'

const router = express.Router()

// @route   GET /api/skillswap
// @desc    Get all skill swaps
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    const query = {}
    
    if (search) {
      query.$or = [
        { offeredSkill: { $regex: search, $options: 'i' } },
        { seekingSkill: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const swaps = await SkillSwap.find(query)
      .populate('owner', 'name avatar university')
      .sort({ createdAt: -1 })
    
    res.json(swaps)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/skillswap
// @desc    Create new skill swap
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const swap = await SkillSwap.create({
      ...req.body,
      owner: req.user._id
    })
    
    // Award points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 15 }
    })

    const populatedSwap = await SkillSwap.findById(swap._id)
      .populate('owner', 'name avatar university')
    
    res.status(201).json(populatedSwap)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/skillswap/:id
// @desc    Get single skill swap
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const swap = await SkillSwap.findById(req.params.id)
      .populate('owner', 'name avatar university')
      .populate('matchedWith', 'name avatar')
    
    if (!swap) {
      return res.status(404).json({ message: 'Skill swap not found' })
    }
    
    res.json(swap)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/skillswap/:id
// @desc    Update skill swap
// @access  Private (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const swap = await SkillSwap.findById(req.params.id)
    
    if (!swap) {
      return res.status(404).json({ message: 'Skill swap not found' })
    }

    if (swap.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this swap' })
    }

    Object.assign(swap, req.body)
    await swap.save()

    const populatedSwap = await SkillSwap.findById(swap._id)
      .populate('owner', 'name avatar university')
    
    res.json(populatedSwap)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/skillswap/:id
// @desc    Delete skill swap
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const swap = await SkillSwap.findById(req.params.id)
    
    if (!swap) {
      return res.status(404).json({ message: 'Skill swap not found' })
    }

    if (swap.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this swap' })
    }

    await SkillSwap.findByIdAndDelete(req.params.id)
    res.json({ message: 'Skill swap deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/skillswap/:id/match
// @desc    Match with skill swap
// @access  Private
router.post('/:id/match', protect, async (req, res) => {
  try {
    const swap = await SkillSwap.findById(req.params.id)
    
    if (!swap) {
      return res.status(404).json({ message: 'Skill swap not found' })
    }

    if (swap.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot match with your own swap' })
    }

    if (swap.status !== 'open') {
      return res.status(400).json({ message: 'Swap is not open for matching' })
    }

    // Check if user has a swap that matches
    const userSwap = await SkillSwap.findOne({
      owner: req.user._id,
      offeredSkill: swap.seekingSkill,
      seekingSkill: swap.offeredSkill,
      status: 'open'
    })

    if (!userSwap) {
      return res.status(400).json({ 
        message: 'You need to have a matching skill swap to match with this one' 
      })
    }

    // Match both swaps
    swap.status = 'matched'
    swap.matchedWith = req.user._id
    await swap.save()

    userSwap.status = 'matched'
    userSwap.matchedWith = swap.owner
    await userSwap.save()

    // Award points to both users
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 30, totalSwaps: 1 }
    })
    await User.findByIdAndUpdate(swap.owner, {
      $inc: { points: 30, totalSwaps: 1 }
    })

    // Get owner name for notification
    const ownerUser = await User.findById(swap.owner).select('name')
    
    // Create notifications for both users
    await createNotification({
      user: swap.owner,
      type: 'skillswap_match',
      title: 'Skill Swap Matched!',
      message: `${req.user.name} has matched with your skill swap`,
      relatedItem: swap._id,
      relatedModel: 'SkillSwap',
      fromUser: req.user._id
    })

    await createNotification({
      user: req.user._id,
      type: 'skillswap_match',
      title: 'Skill Swap Matched!',
      message: `You've successfully matched with ${ownerUser.name}'s skill swap`,
      relatedItem: userSwap._id,
      relatedModel: 'SkillSwap',
      fromUser: swap.owner
    })

    const populatedSwap = await SkillSwap.findById(swap._id)
      .populate('owner', 'name avatar university')
      .populate('matchedWith', 'name avatar')
    
    res.json(populatedSwap)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/skillswap/ai-match
// @desc    Get AI-matched suggestions based on user's skills
// @access  Private
router.get('/ai-match', protect, async (req, res) => {
  try {
    // Get user's skill swaps
    const userSwaps = await SkillSwap.find({ owner: req.user._id, status: 'open' })
    const userSeeking = userSwaps.map(s => s.seekingSkill.toLowerCase().trim())
    const userOffering = userSwaps.map(s => s.offeredSkill.toLowerCase().trim())
    
    // Find potential matches
    const allSwaps = await SkillSwap.find({
      owner: { $ne: req.user._id },
      status: 'open'
    }).populate('owner', 'name avatar university')
    
    // Calculate match scores
    const matchesWithScore = allSwaps.map(swap => {
      let matchScore = 0
      const swapOffering = swap.offeredSkill.toLowerCase().trim()
      const swapSeeking = swap.seekingSkill.toLowerCase().trim()
      
      // Perfect match: user seeking what swap offers AND swap seeking what user offers
      if (userSeeking.includes(swapOffering) && userOffering.includes(swapSeeking)) {
        matchScore = 100
      }
      // Good match: user seeking what swap offers
      else if (userSeeking.includes(swapOffering)) {
        matchScore = 85
      }
      // Partial match: similar skills (fuzzy matching)
      else if (userSeeking.some(seek => swapOffering.includes(seek) || seek.includes(swapOffering))) {
        matchScore = 70
      }
      // Reverse match: user offers what swap seeks
      else if (userOffering.includes(swapSeeking)) {
        matchScore = 60
      }
      // Low match: any connection
      else {
        matchScore = 40
      }
      
      return {
        ...swap.toObject(),
        matchScore
      }
    })
    
    // Sort by match score and return top matches
    const topMatches = matchesWithScore
      .filter(m => m.matchScore >= 60)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
    
    res.json(topMatches)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

