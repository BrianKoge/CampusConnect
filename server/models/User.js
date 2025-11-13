import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  university: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String
  }],
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  totalExchanges: {
    type: Number,
    default: 0
  },
  totalGigs: {
    type: Number,
    default: 0
  },
  totalSwaps: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  // Mentor profile fields (for alumni)
  mentorProfile: {
    title: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    expertise: [{
      type: String
    }],
    availability: {
      type: String,
      default: 'Available'
    },
    rating: {
      type: Number,
      default: 0
    },
    totalMentorshipSessions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema)

