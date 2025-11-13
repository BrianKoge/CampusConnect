import express from 'express'
import { protect } from '../middleware/auth.js'
import ReUseIt from '../models/ReUseIt.js'
import User from '../models/User.js'
import { createNotification } from './notifications.js'

const router = express.Router()

// @route   GET /api/reuseit
// @desc    Get all items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    const query = {}
    
    if (category && category !== 'All') {
      query.category = category
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const items = await ReUseIt.find(query)
      .populate('owner', 'name avatar university')
      .sort({ createdAt: -1 })
    
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/reuseit
// @desc    Create new item
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const item = await ReUseIt.create({
      ...req.body,
      owner: req.user._id
    })
    
    // Award points for posting
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 10 }
    })

    const populatedItem = await ReUseIt.findById(item._id)
      .populate('owner', 'name avatar university')
    
    res.status(201).json(populatedItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/reuseit/:id
// @desc    Get single item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await ReUseIt.findById(req.params.id)
      .populate('owner', 'name avatar university')
      .populate('requestedBy', 'name avatar')
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    
    res.json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/reuseit/:id
// @desc    Update item
// @access  Private (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await ReUseIt.findById(req.params.id)
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' })
    }

    Object.assign(item, req.body)
    await item.save()

    const populatedItem = await ReUseIt.findById(item._id)
      .populate('owner', 'name avatar university')
    
    res.json(populatedItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/reuseit/:id
// @desc    Delete item
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await ReUseIt.findById(req.params.id)
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' })
    }

    await ReUseIt.findByIdAndDelete(req.params.id)
    res.json({ message: 'Item deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/reuseit/:id/request
// @desc    Request item exchange
// @access  Private
router.put('/:id/request', protect, async (req, res) => {
  try {
    const item = await ReUseIt.findById(req.params.id)
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot request your own item' })
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Item is not available for exchange' })
    }

    item.status = 'pending'
    item.requestedBy = req.user._id
    await item.save()

    // Award points for requesting
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 5 }
    })

    // Create notification for item owner
    await createNotification({
      user: item.owner,
      type: 'reuseit_request',
      title: 'New Exchange Request',
      message: `${req.user.name} has requested to exchange "${item.title}"`,
      relatedItem: item._id,
      relatedModel: 'ReUseIt',
      fromUser: req.user._id
    })

    const populatedItem = await ReUseIt.findById(item._id)
      .populate('owner', 'name avatar university')
      .populate('requestedBy', 'name avatar')
    
    res.json(populatedItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/reuseit/:id/approve
// @desc    Approve exchange request
// @access  Private (owner only)
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const item = await ReUseIt.findById(req.params.id)
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (item.status !== 'pending') {
      return res.status(400).json({ message: 'No pending request for this item' })
    }

    item.status = 'exchanged'
    await item.save()

    // Award points to both users
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 50, totalExchanges: 1 }
    })
    await User.findByIdAndUpdate(item.requestedBy, {
      $inc: { points: 50, totalExchanges: 1 }
    })

    // Create notification for requester
    await createNotification({
      user: item.requestedBy,
      type: 'reuseit_approved',
      title: 'Exchange Request Approved',
      message: `${req.user.name} has approved your request for "${item.title}"`,
      relatedItem: item._id,
      relatedModel: 'ReUseIt',
      fromUser: req.user._id
    })

    const populatedItem = await ReUseIt.findById(item._id)
      .populate('owner', 'name avatar university')
      .populate('requestedBy', 'name avatar')
    
    res.json(populatedItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/reuseit/:id/cancel-request
// @desc    Cancel exchange request
// @access  Private
router.put('/:id/cancel-request', protect, async (req, res) => {
  try {
    const item = await ReUseIt.findById(req.params.id)
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    if (item.requestedBy?.toString() !== req.user._id.toString() && 
        item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const requesterId = item.requestedBy
    
    item.status = 'available'
    item.requestedBy = null
    await item.save()

    // Create notification for requester if owner cancelled
    if (requesterId && item.owner.toString() === req.user._id.toString()) {
      await createNotification({
        user: requesterId,
        type: 'reuseit_declined',
        title: 'Exchange Request Declined',
        message: `${req.user.name} has declined your request for "${item.title}"`,
        relatedItem: item._id,
        relatedModel: 'ReUseIt',
        fromUser: req.user._id
      })
    }

    const populatedItem = await ReUseIt.findById(item._id)
      .populate('owner', 'name avatar university')
    
    res.json(populatedItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

