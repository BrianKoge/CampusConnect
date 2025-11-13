import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect')
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@campusconnect.com' })
    
    if (adminExists) {
      console.log('❌ Admin user already exists')
      console.log('Email: admin@campusconnect.com')
      console.log('Password: (the one you set when creating)')
      process.exit(0)
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campusconnect.com',
      password: 'admin123', // Change this password!
      university: 'CampusConnect University',
      role: 'admin',
      isVerified: true,
      points: 0,
      badges: []
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email: admin@campusconnect.com')
    console.log('🔑 Password: admin123')
    console.log('⚠️  Please change this password after first login!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

createAdmin()

