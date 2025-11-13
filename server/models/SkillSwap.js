import mongoose from 'mongoose'

const skillSwapSchema = new mongoose.Schema({
  offeredSkill: {
    type: String,
    required: true
  },
  seekingSkill: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'matched', 'completed'],
    default: 'open'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

export default mongoose.model('SkillSwap', skillSwapSchema)

