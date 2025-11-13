import mongoose from 'mongoose'

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - can be created by mentor without student
  },
  description: {
    type: String,
    default: ''
  },
  sessionType: {
    type: String,
    enum: ['30 minutes - Free', '60 minutes - $25', '90 minutes - $40'],
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'available'],
    default: 'pending'
  },
  maxStudents: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

export default mongoose.model('Mentorship', mentorshipSchema)

