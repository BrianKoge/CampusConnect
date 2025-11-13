import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      // ReUseIt
      'reuseit_request',
      'reuseit_approved',
      'reuseit_declined',
      'reuseit_exchanged',
      // YouthGig
      'youthgig_application',
      'youthgig_selected',
      'youthgig_declined',
      'youthgig_completed',
      // SkillSwap
      'skillswap_match',
      'skillswap_completed',
      // Mentorship
      'mentorship_booking',
      'mentorship_confirmed',
      'mentorship_declined',
      'mentorship_completed',
      // Chat
      'chat_message',
      // Announcement
      'announcement'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['ReUseIt', 'YouthGig', 'SkillSwap', 'Mentorship', 'Chat', 'Announcement', null]
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 })
notificationSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)

