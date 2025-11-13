import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import ReUseIt from '../models/ReUseIt.js'
import YouthGig from '../models/YouthGig.js'
import SkillSwap from '../models/SkillSwap.js'
import Mentorship from '../models/Mentorship.js'
import Chat from '../models/Chat.js'
import Announcement from '../models/Announcement.js'
import Wallet from '../models/Wallet.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect'

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

// Hash password function
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

// Seed function
const seedData = async () => {
  try {
    // Clear existing data (except admin users - we'll check if admin exists)
    console.log('Clearing existing data...')
    const existingAdmin = await User.findOne({ role: 'admin' })
    await User.deleteMany({ role: { $ne: 'admin' } })
    await ReUseIt.deleteMany({})
    await YouthGig.deleteMany({})
    await SkillSwap.deleteMany({})
    await Mentorship.deleteMany({})
    await Chat.deleteMany({})
    await Announcement.deleteMany({})
    await Wallet.deleteMany({})

    console.log('Creating users...')
    
    // Create Students
    const students = await User.insertMany([
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@student.edu',
        password: await hashPassword('password123'),
        university: 'University of Technology',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=14b8a6&color=fff',
        role: 'student',
        points: 450,
        badges: ['Eco Warrior', 'Active Member'],
        totalExchanges: 5,
        totalGigs: 2,
        totalSwaps: 3,
        totalSessions: 1,
        isVerified: true,
        status: 'active'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@student.edu',
        password: await hashPassword('password123'),
        university: 'University of Technology',
        avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=3b82f6&color=fff',
        role: 'student',
        points: 320,
        badges: ['Eco Warrior'],
        totalExchanges: 3,
        totalGigs: 1,
        totalSwaps: 2,
        totalSessions: 0,
        isVerified: true,
        status: 'active'
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@student.edu',
        password: await hashPassword('password123'),
        university: 'State University',
        avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=8b5cf6&color=fff',
        role: 'student',
        points: 280,
        badges: [],
        totalExchanges: 2,
        totalGigs: 0,
        totalSwaps: 1,
        totalSessions: 2,
        isVerified: true,
        status: 'active'
      },
      {
        name: 'David Kim',
        email: 'david.kim@student.edu',
        password: await hashPassword('password123'),
        university: 'State University',
        avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=ef4444&color=fff',
        role: 'student',
        points: 180,
        badges: [],
        totalExchanges: 1,
        totalGigs: 1,
        totalSwaps: 0,
        totalSessions: 0,
        isVerified: true,
        status: 'active'
      },
      {
        name: 'Jessica Williams',
        email: 'jessica.williams@student.edu',
        password: await hashPassword('password123'),
        university: 'University of Technology',
        avatar: 'https://ui-avatars.com/api/?name=Jessica+Williams&background=f59e0b&color=fff',
        role: 'student',
        points: 520,
        badges: ['Eco Warrior', 'Active Member', 'Top Contributor'],
        totalExchanges: 7,
        totalGigs: 3,
        totalSwaps: 4,
        totalSessions: 1,
        isVerified: true,
        status: 'active'
      },
      {
        name: 'James Anderson',
        email: 'james.anderson@student.edu',
        password: await hashPassword('password123'),
        university: 'State University',
        avatar: 'https://ui-avatars.com/api/?name=James+Anderson&background=10b981&color=fff',
        role: 'student',
        points: 95,
        badges: [],
        totalExchanges: 0,
        totalGigs: 0,
        totalSwaps: 1,
        totalSessions: 0,
        isVerified: false,
        status: 'active'
      },
      {
        name: 'Olivia Brown',
        email: 'olivia.brown@student.edu',
        password: await hashPassword('password123'),
        university: 'University of Technology',
        avatar: 'https://ui-avatars.com/api/?name=Olivia+Brown&background=ec4899&color=fff',
        role: 'student',
        points: 240,
        badges: [],
        totalExchanges: 2,
        totalGigs: 2,
        totalSwaps: 0,
        totalSessions: 1,
        isVerified: true,
        status: 'active'
      },
      {
        name: 'Ryan Taylor',
        email: 'ryan.taylor@student.edu',
        password: await hashPassword('password123'),
        university: 'State University',
        avatar: 'https://ui-avatars.com/api/?name=Ryan+Taylor&background=06b6d4&color=fff',
        role: 'student',
        points: 150,
        badges: [],
        totalExchanges: 1,
        totalGigs: 0,
        totalSwaps: 1,
        totalSessions: 0,
        isVerified: true,
        status: 'active'
      }
    ])

    // Create or get Admin User (for announcements)
    let admin = existingAdmin
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@campusconnect.edu',
        password: await hashPassword('password123'),
        university: 'CampusConnect',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=dc2626&color=fff',
        role: 'admin',
        points: 0,
        badges: [],
        isVerified: true,
        status: 'active'
      })
      console.log('Created admin user')
    } else {
      console.log('Using existing admin user')
    }

    // Create Alumni
    const alumni = await User.insertMany([
      {
        name: 'Dr. Robert Martinez',
        email: 'robert.martinez@alumni.edu',
        password: await hashPassword('password123'),
        university: 'University of Technology',
        avatar: 'https://ui-avatars.com/api/?name=Robert+Martinez&background=6366f1&color=fff',
        role: 'alumni',
        points: 1200,
        badges: ['Eco Warrior', 'Active Member', 'Top Contributor', 'Mentor'],
        totalSessions: 15,
        isVerified: true,
        status: 'active',
        mentorProfile: {
          title: 'Senior Software Engineer',
          bio: '10+ years of experience in software development, specializing in full-stack web applications and cloud architecture. Passionate about mentoring the next generation of developers.',
          expertise: ['JavaScript', 'React', 'Node.js', 'Cloud Computing', 'System Design'],
          availability: 'Available',
          rating: 4.8,
          totalMentorshipSessions: 15
        }
      },
      {
        name: 'Dr. Lisa Thompson',
        email: 'lisa.thompson@alumni.edu',
        password: await hashPassword('password123'),
        university: 'State University',
        avatar: 'https://ui-avatars.com/api/?name=Lisa+Thompson&background=14b8a6&color=fff',
        role: 'alumni',
        points: 980,
        badges: ['Eco Warrior', 'Active Member', 'Mentor'],
        totalSessions: 12,
        isVerified: true,
        status: 'active',
        mentorProfile: {
          title: 'Product Manager',
          bio: 'Experienced product manager with expertise in product strategy, user experience, and agile methodologies. Love helping students navigate their career paths.',
          expertise: ['Product Management', 'UX Design', 'Agile', 'Business Strategy'],
          availability: 'Available',
          rating: 4.9,
          totalMentorshipSessions: 12
        }
      },
      {
        name: 'Dr. Mark Wilson',
        email: 'mark.wilson@alumni.edu',
        password: await hashPassword('password123'),
        university: 'University of Technology',
        avatar: 'https://ui-avatars.com/api/?name=Mark+Wilson&background=f59e0b&color=fff',
        role: 'alumni',
        points: 750,
        badges: ['Eco Warrior', 'Mentor'],
        totalSessions: 8,
        isVerified: true,
        status: 'active',
        mentorProfile: {
          title: 'Data Scientist',
          bio: 'Data scientist with expertise in machine learning, data analysis, and AI. Excited to share knowledge and help students excel in data science careers.',
          expertise: ['Machine Learning', 'Python', 'Data Analysis', 'AI', 'Statistics'],
          availability: 'Available',
          rating: 4.7,
          totalMentorshipSessions: 8
        }
      },
      {
        name: 'Dr. Amanda Davis',
        email: 'amanda.davis@alumni.edu',
        password: await hashPassword('password123'),
        university: 'State University',
        avatar: 'https://ui-avatars.com/api/?name=Amanda+Davis&background=ec4899&color=fff',
        role: 'alumni',
        points: 650,
        badges: ['Mentor'],
        totalSessions: 5,
        isVerified: true,
        status: 'active',
        mentorProfile: {
          title: 'UX/UI Designer',
          bio: 'Creative UX/UI designer with a passion for user-centered design. I enjoy mentoring students interested in design and helping them build their portfolios.',
          expertise: ['UX Design', 'UI Design', 'Figma', 'User Research', 'Prototyping'],
          availability: 'Available',
          rating: 4.6,
          totalMentorshipSessions: 5
        }
      }
    ])

    console.log(`Created ${students.length} students and ${alumni.length} alumni`)

    // Create ReUseIt items
    console.log('Creating ReUseIt items...')
    const reuseItems = await ReUseIt.insertMany([
      {
        title: 'Calculus Textbook - 3rd Edition',
        description: 'Excellent condition calculus textbook. Barely used, no highlights or notes. Perfect for anyone taking calculus this semester.',
        category: 'Books',
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'],
        owner: students[0]._id,
        location: 'University of Technology - Library',
        status: 'available'
      },
      {
        title: 'MacBook Pro 13" (2019)',
        description: 'Well-maintained MacBook Pro. Battery health at 85%. Comes with charger. Selling because I upgraded to a newer model.',
        category: 'Electronics',
        condition: 'Very Good',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
        owner: students[1]._id,
        location: 'University of Technology - Dorm A',
        status: 'available'
      },
      {
        title: 'Office Desk Chair',
        description: 'Comfortable ergonomic office chair. Great for studying at home. Some minor wear but fully functional.',
        category: 'Furniture',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400'],
        owner: students[2]._id,
        location: 'State University - Off-campus',
        status: 'pending',
        requestedBy: students[3]._id
      },
      {
        title: 'Winter Jacket - Size M',
        description: 'Warm winter jacket, perfect for cold weather. Only worn a few times. In excellent condition.',
        category: 'Clothing',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
        owner: students[4]._id,
        location: 'University of Technology - Dorm B',
        status: 'available'
      },
      {
        title: 'Basketball',
        description: 'Professional basketball, good condition. Perfect for recreational games.',
        category: 'Sports',
        condition: 'Very Good',
        images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'],
        owner: students[5]._id,
        location: 'State University - Sports Complex',
        status: 'available'
      },
      {
        title: 'Physics Lab Equipment Set',
        description: 'Complete physics lab equipment set including rulers, protractors, and measuring tools. All items in good condition.',
        category: 'Other',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'],
        owner: students[6]._id,
        location: 'University of Technology - Science Building',
        status: 'exchanged',
        requestedBy: students[0]._id
      },
      {
        title: 'Graphing Calculator TI-84',
        description: 'Texas Instruments TI-84 Plus graphing calculator. Works perfectly, comes with case.',
        category: 'Electronics',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6c620?w=400'],
        owner: students[7]._id,
        location: 'State University - Math Building',
        status: 'available'
      }
    ])

    // Create YouthGig posts
    console.log('Creating YouthGig posts...')
    const youthGigs = await YouthGig.insertMany([
      {
        title: 'Need Logo Design for Startup',
        description: 'Looking for a creative designer to create a modern logo for my tech startup. Should be minimalist and professional.',
        type: 'Design',
        budget: 150,
        duration: '1 week',
        location: 'Remote',
        postedBy: students[0]._id,
        status: 'open',
        applicants: [
          { user: students[4]._id, appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { user: students[6]._id, appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        title: 'Math Tutoring Needed - Calculus',
        description: 'Need help with calculus homework and exam preparation. 2-3 sessions per week preferred.',
        type: 'Tutoring',
        budget: 200,
        duration: '1 month',
        location: 'University of Technology - Library',
        postedBy: students[1]._id,
        status: 'in-progress',
        applicants: [
          { user: students[2]._id, appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
        ],
        selectedApplicant: students[2]._id
      },
      {
        title: 'Event Photography for Graduation',
        description: 'Need a photographer for graduation ceremony. Must have own equipment and portfolio.',
        type: 'Event Help',
        budget: 300,
        duration: '1 day',
        location: 'State University - Main Hall',
        postedBy: students[3]._id,
        status: 'open',
        applicants: [
          { user: students[4]._id, appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        title: 'Website Development - Portfolio Site',
        description: 'Need a developer to create a personal portfolio website. React preferred, responsive design required.',
        type: 'Tech',
        budget: 400,
        duration: '2 weeks',
        location: 'Remote',
        postedBy: students[4]._id,
        status: 'completed',
        applicants: [
          { user: students[0]._id, appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
        ],
        selectedApplicant: students[0]._id
      },
      {
        title: 'Content Writing for Blog',
        description: 'Looking for a writer to create 5 blog posts about sustainable living. Must be engaging and well-researched.',
        type: 'Writing',
        budget: 250,
        duration: '2 weeks',
        location: 'Remote',
        postedBy: students[5]._id,
        status: 'open'
      },
      {
        title: 'App UI/UX Design',
        description: 'Need a designer to create UI/UX mockups for a mobile app. Figma experience required.',
        type: 'Design',
        budget: 350,
        duration: '3 weeks',
        location: 'Remote',
        postedBy: students[6]._id,
        status: 'open',
        applicants: [
          { user: students[4]._id, appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        ]
      }
    ])

    // Create SkillSwap listings
    console.log('Creating SkillSwap listings...')
    const skillSwaps = await SkillSwap.insertMany([
      {
        offeredSkill: 'Web Development (React, Node.js)',
        seekingSkill: 'Graphic Design',
        description: 'I can help you build a website or web application. Looking for someone to design logos and marketing materials for my project.',
        owner: students[0]._id,
        status: 'open'
      },
      {
        offeredSkill: 'Spanish Language Tutoring',
        seekingSkill: 'Python Programming',
        description: 'Native Spanish speaker offering language lessons. Need help learning Python for data science projects.',
        owner: students[1]._id,
        status: 'matched',
        matchedWith: students[2]._id
      },
      {
        offeredSkill: 'Python Programming',
        seekingSkill: 'Spanish Language Tutoring',
        description: 'Experienced Python developer. Looking to learn Spanish for an upcoming trip.',
        owner: students[2]._id,
        status: 'matched',
        matchedWith: students[1]._id
      },
      {
        offeredSkill: 'Photography',
        seekingSkill: 'Video Editing',
        description: 'Professional photographer offering photo sessions. Need someone to edit my video content.',
        owner: students[4]._id,
        status: 'open'
      },
      {
        offeredSkill: 'Music Production',
        seekingSkill: 'Marketing & Social Media',
        description: 'Music producer looking to swap skills. Can help with music production, need help with social media marketing.',
        owner: students[6]._id,
        status: 'open'
      },
      {
        offeredSkill: 'Data Analysis (Excel, SQL)',
        seekingSkill: 'Web Development',
        description: 'Data analyst offering help with data analysis and visualization. Looking for web development skills.',
        owner: students[7]._id,
        status: 'completed',
        matchedWith: students[0]._id
      }
    ])

    // Create Mentorship sessions
    console.log('Creating Mentorship sessions...')
    const mentorships = await Mentorship.insertMany([
      {
        mentor: alumni[0]._id,
        student: null,
        topic: 'Career Transition to Tech',
        description: 'Learn how to transition from a non-tech background to a software engineering role. We\'ll cover resume building, interview prep, and skill development.',
        sessionType: '60 minutes - $25',
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'available',
        maxStudents: 5
      },
      {
        mentor: alumni[0]._id,
        student: students[0]._id,
        topic: 'Full-Stack Development Best Practices',
        description: 'One-on-one session covering best practices in full-stack development, code organization, and architecture patterns.',
        sessionType: '90 minutes - $40',
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'confirmed',
        maxStudents: 1
      },
      {
        mentor: alumni[1]._id,
        student: students[2]._id,
        topic: 'Product Management Career Path',
        description: 'Discussion about breaking into product management, day-to-day responsibilities, and career growth opportunities.',
        sessionType: '60 minutes - $25',
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'completed',
        maxStudents: 1
      },
      {
        mentor: alumni[1]._id,
        student: null,
        topic: 'UX Design Portfolio Review',
        description: 'Get feedback on your UX design portfolio. Bring your projects and we\'ll discuss improvements and presentation.',
        sessionType: '30 minutes - Free',
        scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'available',
        maxStudents: 3
      },
      {
        mentor: alumni[2]._id,
        student: students[4]._id,
        topic: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning concepts, algorithms, and practical applications. Perfect for beginners.',
        sessionType: '60 minutes - $25',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'pending',
        maxStudents: 1
      },
      {
        mentor: alumni[3]._id,
        student: null,
        topic: 'Design Thinking Workshop',
        description: 'Learn design thinking methodology and how to apply it to real-world problems. Interactive workshop format.',
        sessionType: '90 minutes - $40',
        scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'available',
        maxStudents: 8
      }
    ])

    // Create Chat conversations
    console.log('Creating Chat conversations...')
    const chats = await Chat.insertMany([
      {
        participants: [students[0]._id, students[1]._id],
        messages: [
          {
            sender: students[0]._id,
            text: 'Hey! Are you still interested in the MacBook?',
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            sender: students[1]._id,
            text: 'Yes! When can I come to check it out?',
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            sender: students[0]._id,
            text: 'How about tomorrow at 3 PM?',
            read: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            sender: students[1]._id,
            text: 'Perfect! See you then.',
            read: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        lastMessage: 'Perfect! See you then.',
        lastMessageAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        participants: [students[2]._id, students[3]._id],
        messages: [
          {
            sender: students[2]._id,
            text: 'Hi! I saw your application for the tutoring gig. Are you available this week?',
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            sender: students[3]._id,
            text: 'Yes, I\'m free on Tuesday and Thursday afternoons.',
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ],
        lastMessage: 'Yes, I\'m free on Tuesday and Thursday afternoons.',
        lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        participants: [students[4]._id, alumni[0]._id],
        messages: [
          {
            sender: students[4]._id,
            text: 'Thank you for the mentorship session! It was really helpful.',
            read: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            sender: alumni[0]._id,
            text: 'You\'re welcome! Feel free to reach out if you have more questions.',
            read: false,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
          }
        ],
        lastMessage: 'You\'re welcome! Feel free to reach out if you have more questions.',
        lastMessageAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ])

    // Create Announcements
    console.log('Creating Announcements...')
    const announcements = await Announcement.insertMany([
      {
        title: 'Welcome to CampusConnect!',
        message: 'We\'re excited to have you join our community. Start exploring features like ReUseIt, YouthGig, SkillSwap, and connect with mentors!',
        createdBy: admin._id,
        targetAudience: 'all',
        priority: 'medium',
        isActive: true,
        readBy: [
          { user: students[0]._id, readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { user: students[1]._id, readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        title: 'New Feature: Real-time Chat',
        message: 'You can now chat with other users in real-time! Click on the message icon in the header to start a conversation.',
        createdBy: admin._id,
        targetAudience: 'all',
        priority: 'high',
        isActive: true,
        readBy: [
          { user: students[0]._id, readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        title: 'Mentorship Program Launch',
        message: 'Connect with experienced alumni mentors for career guidance, skill development, and networking opportunities. Book your session today!',
        createdBy: admin._id,
        targetAudience: 'students',
        priority: 'high',
        isActive: true
      },
      {
        title: 'Sustainability Challenge - Win Prizes!',
        message: 'Participate in our monthly sustainability challenge. Exchange items, complete swaps, and earn points to climb the leaderboard. Top 3 winners get special badges!',
        createdBy: admin._id,
        targetAudience: 'students',
        priority: 'medium',
        isActive: true
      }
    ])

    // Create Wallets
    console.log('Creating Wallets...')
    await Wallet.insertMany([
      {
        user: students[0]._id,
        balance: 125.50,
        transactions: [
          {
            type: 'credit',
            amount: 200,
            description: 'Payment for website development gig',
            status: 'completed'
          },
          {
            type: 'debit',
            amount: 74.50,
            description: 'Mentorship session payment',
            status: 'completed'
          }
        ]
      },
      {
        user: students[1]._id,
        balance: 0,
        transactions: []
      },
      {
        user: students[2]._id,
        balance: 200,
        transactions: [
          {
            type: 'credit',
            amount: 200,
            description: 'Tutoring gig payment',
            status: 'completed'
          }
        ]
      },
      {
        user: students[4]._id,
        balance: 50,
        transactions: [
          {
            type: 'credit',
            amount: 50,
            description: 'Design work payment',
            status: 'completed'
          }
        ]
      }
    ])

    console.log('\n✅ Seed data created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('\n--- ADMIN ---')
    console.log(`1. ${admin.name}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Password: password123`)
    console.log('')
    console.log('\n--- STUDENTS ---')
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name}`)
      console.log(`   Email: ${student.email}`)
      console.log(`   Password: password123`)
      console.log(`   Points: ${student.points}`)
      console.log('')
    })
    
    console.log('\n--- ALUMNI ---')
    alumni.forEach((alum, index) => {
      console.log(`${index + 1}. ${alum.name}`)
      console.log(`   Email: ${alum.email}`)
      console.log(`   Password: password123`)
      console.log(`   Title: ${alum.mentorProfile.title}`)
      console.log('')
    })

    console.log('\n📊 Summary:')
    console.log(`- 1 Admin`)
    console.log(`- ${students.length} Students`)
    console.log(`- ${alumni.length} Alumni`)
    console.log(`- ${reuseItems.length} ReUseIt Items`)
    console.log(`- ${youthGigs.length} YouthGig Posts`)
    console.log(`- ${skillSwaps.length} SkillSwap Listings`)
    console.log(`- ${mentorships.length} Mentorship Sessions`)
    console.log(`- ${chats.length} Chat Conversations`)
    console.log(`- ${announcements.length} Announcements`)

    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

// Run seed function
seedData()

