import express from 'express'
import { protect } from '../middleware/auth.js'
import YouthGig from '../models/YouthGig.js'
import User from '../models/User.js'
import { createNotification } from './notifications.js'

const router = express.Router()

// @route   GET /api/youthgig
// @desc    Get all gigs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query
    const query = {}
    
    if (type && type !== 'All') {
      query.type = type
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const gigs = await YouthGig.find(query)
      .populate('postedBy', 'name avatar university')
      .sort({ createdAt: -1 })
    
    res.json(gigs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/youthgig
// @desc    Create new gig
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const gig = await YouthGig.create({
      ...req.body,
      postedBy: req.user._id
    })
    
    // Award points for posting
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 10, totalGigs: 1 }
    })
    
    const populatedGig = await YouthGig.findById(gig._id)
      .populate('postedBy', 'name avatar university')
    
    res.status(201).json(populatedGig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/youthgig/:id
// @desc    Get single gig
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const gig = await YouthGig.findById(req.params.id)
      .populate('postedBy', 'name avatar university')
      .populate('applicants.user', 'name avatar')
      .populate('selectedApplicant', 'name avatar')
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' })
    }
    
    res.json(gig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/youthgig/:id
// @desc    Update gig
// @access  Private (poster only)
router.put('/:id', protect, async (req, res) => {
  try {
    const gig = await YouthGig.findById(req.params.id)
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' })
    }

    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gig' })
    }

    Object.assign(gig, req.body)
    await gig.save()

    const populatedGig = await YouthGig.findById(gig._id)
      .populate('postedBy', 'name avatar university')
    
    res.json(populatedGig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/youthgig/:id
// @desc    Delete gig
// @access  Private (poster only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const gig = await YouthGig.findById(req.params.id)
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' })
    }

    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gig' })
    }

    await YouthGig.findByIdAndDelete(req.params.id)
    res.json({ message: 'Gig deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/youthgig/:id/apply
// @desc    Apply to gig
// @access  Private
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const gig = await YouthGig.findById(req.params.id)
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' })
    }

    if (gig.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot apply to your own gig' })
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is not open for applications' })
    }

    const alreadyApplied = gig.applicants.some(
      app => app.user.toString() === req.user._id.toString()
    )

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this gig' })
    }

    gig.applicants.push({ user: req.user._id })
    await gig.save()

    // Award points for applying
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 5 }
    })

    // Create notification for gig poster
    await createNotification({
      user: gig.postedBy,
      type: 'youthgig_application',
      title: 'New Gig Application',
      message: `${req.user.name} has applied to your gig "${gig.title}"`,
      relatedItem: gig._id,
      relatedModel: 'YouthGig',
      fromUser: req.user._id
    })

    const populatedGig = await YouthGig.findById(gig._id)
      .populate('postedBy', 'name avatar university')
      .populate('applicants.user', 'name avatar')
    
    res.json(populatedGig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/youthgig/:id/select-applicant
// @desc    Select applicant for gig
// @access  Private (poster only)
router.put('/:id/select-applicant', protect, async (req, res) => {
  try {
    const { applicantId } = req.body
    const gig = await YouthGig.findById(req.params.id)
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' })
    }

    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const applicantExists = gig.applicants.some(
      app => app.user.toString() === applicantId
    )

    if (!applicantExists) {
      return res.status(400).json({ message: 'Applicant not found' })
    }

    gig.selectedApplicant = applicantId
    gig.status = 'in-progress'
    await gig.save()

    // Award points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 20, totalGigs: 1 }
    })
    await User.findByIdAndUpdate(applicantId, {
      $inc: { points: 30, totalGigs: 1 }
    })

    // Create notification for selected applicant
    await createNotification({
      user: applicantId,
      type: 'youthgig_selected',
      title: 'You\'ve Been Selected!',
      message: `You've been selected for the gig "${gig.title}"`,
      relatedItem: gig._id,
      relatedModel: 'YouthGig',
      fromUser: req.user._id
    })

    const populatedGig = await YouthGig.findById(gig._id)
      .populate('postedBy', 'name avatar university')
      .populate('applicants.user', 'name avatar')
      .populate('selectedApplicant', 'name avatar')
    
    res.json(populatedGig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   PUT /api/youthgig/:id/complete
// @desc    Mark gig as completed
// @access  Private (poster only)
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const gig = await YouthGig.findById(req.params.id)
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' })
    }

    if (gig.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    gig.status = 'completed'
    await gig.save()

    // Award completion points
    if (gig.selectedApplicant) {
      await User.findByIdAndUpdate(gig.selectedApplicant, {
        $inc: { points: 50 }
      })

      // Create notification for selected applicant
      await createNotification({
        user: gig.selectedApplicant,
        type: 'youthgig_completed',
        title: 'Gig Completed',
        message: `The gig "${gig.title}" has been marked as completed`,
        relatedItem: gig._id,
        relatedModel: 'YouthGig',
        fromUser: req.user._id
      })
    }

    const populatedGig = await YouthGig.findById(gig._id)
      .populate('postedBy', 'name avatar university')
      .populate('selectedApplicant', 'name avatar')
    
    res.json(populatedGig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

