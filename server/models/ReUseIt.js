import mongoose from 'mongoose'

const reuseItSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other']
  },
  condition: {
    type: String,
    required: true,
    enum: ['Like New', 'Excellent', 'Very Good', 'Good', 'Fair']
  },
  images: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'exchanged'],
    default: 'available'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

export default mongoose.model('ReUseIt', reuseItSchema)

