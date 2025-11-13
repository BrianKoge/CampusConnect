# CampusConnect - University Sustainability & Opportunity Hub

A modern, full-stack web platform for university students to exchange items, find gigs, swap skills, connect with mentors, and track sustainability contributions. CampusConnect promotes circular economy principles, reduces waste, and creates economic opportunities for students while fostering mentorship connections.

## 🌍 Sustainable Development Goals (SDGs) Addressed

CampusConnect directly contributes to the following UN Sustainable Development Goals:

### 🎯 SDG 4: Quality Education
- **Alumni Mentorship Program**: Connects current students with verified alumni for career guidance, skill development, and educational support
- **SkillSwap Network**: Enables peer-to-peer learning and knowledge exchange among students

### ♻️ SDG 12: Responsible Consumption and Production
- **ReUseIt Hub**: Promotes circular economy by facilitating the exchange of used-but-usable items (books, electronics, furniture, clothing)
- **Waste Reduction**: Reduces campus waste by extending the lifecycle of items through reuse and exchange
- **Sustainable Practices**: Encourages responsible consumption patterns among the campus community

### 💼 SDG 8: Decent Work and Economic Growth
- **YouthGig Board**: Provides micro-tasks and freelance opportunities for students to earn income
- **Skill-Based Economy**: Creates economic opportunities through skill exchange and gig work
- **Digital Wallet**: Enables secure financial transactions and supports student entrepreneurship

### 🤝 SDG 17: Partnerships for the Goals
- **Community Building**: Fosters partnerships between students, alumni, and the university community
- **Collaborative Platform**: Encourages collaboration and networking for sustainable development

### 🌱 SDG 11: Sustainable Cities and Communities
- **Campus Sustainability**: Builds a sustainable campus community through resource sharing and collaboration
- **Community Engagement**: Promotes active participation in sustainability initiatives

## 👥 User Roles & Permissions

### 🎓 Student Role

Students are the primary users of CampusConnect and have access to the following features:

#### Available Features:
- **Home Dashboard**: View personalized stats, recent activity, and leaderboard preview
- **ReUseIt Hub**: 
  - Post items for exchange (books, electronics, furniture, clothing, sports equipment)
  - Browse and search available items
  - Request exchanges with other students
  - Approve/decline exchange requests
  - Edit and delete their own items
  - Earn points for successful exchanges
- **YouthGig Board**:
  - Browse available gigs and micro-tasks
  - Apply for gigs posted by others
  - Post their own gigs
  - Manage applications for their posted gigs
  - Select applicants and mark gigs as complete
  - Earn points for completing gigs
- **SkillSwap Network**:
  - Create skill swap listings (offer skills and seek skills)
  - Browse available skill swaps
  - Use AI-powered matching to find compatible skill partners
  - Match with other students for skill exchange
  - Edit and delete their own listings
  - Earn points for successful skill swaps
- **Mentorship**:
  - Browse available alumni mentors
  - Book mentorship sessions
  - View and manage their booked sessions
  - Receive mentorship guidance and career advice
- **Leaderboard**:
  - View sustainability rankings
  - Track personal points and badges
  - See top performers in various categories
- **Wallet**:
  - View wallet balance
  - Make payments for gigs and services
  - Receive payments for completed work
  - Withdraw funds (via Paystack integration)
- **Settings**:
  - Update profile information
  - Change password
  - Manage account preferences
- **Real-time Features**:
  - Chat with other students
  - Receive notifications for exchanges, gigs, and mentorship
  - View announcements from admins

#### Restrictions:
- Cannot access admin dashboard
- Cannot create announcements
- Cannot manage other users
#### Student-Credentials:
## 📚 Students

### 1. Sarah Johnson
- **Email:** `sarah.johnson@student.edu`
- **Password:** `password123`
### 2. Michael Chen
- **Email:** `michael.chen@student.edu`
- **Password:** `password123`
---

### 🎓 Alumni/Mentor Role

Alumni users serve as mentors and have limited access focused on mentorship activities:

#### Available Features:
- **Home Dashboard**: View basic dashboard information
- **Mentorship Dashboard**:
  - View mentorship requests from students
  - Accept or decline mentorship session requests
  - Manage their mentorship schedule
  - Complete mentorship sessions
  - View mentorship history
- **Settings**:
  - Update profile information
  - Change password
  - Manage account preferences
- **Real-time Features**:
  - Chat with students (for mentorship-related communication)
  - Receive notifications for mentorship requests
  - View announcements from admins

#### Restrictions:
- **Cannot access**:
  - ReUseIt Hub
  - YouthGig Board
  - SkillSwap Network
  - Leaderboard (as participants)
  - Wallet features
- Cannot post items, gigs, or skill swaps
- Cannot create announcements
- Cannot manage other users
#### Alumni-Credentials:
## 🎓 Alumni (Mentors)

### 1. Dr. Robert Martinez
- **Email:** `robert.martinez@alumni.edu`
- **Password:** `password123`
### 2. Dr. Lisa Thompson
- **Email:** `lisa.thompson@alumni.edu`
- **Password:** `password123`
---

### 🛡️ Admin Role

Administrators have full access to manage the platform and oversee all activities:

#### Available Features:
- **Admin Dashboard**:
  - View comprehensive platform statistics
  - Monitor user activity
  - Manage all platform content
- **User Management**:
  - View all users (students, alumni, admins)
  - Edit user roles (promote to admin, change to alumni, etc.)
  - Activate/deactivate user accounts
  - View user statistics and activity
  - Manage user permissions
- **Content Management**:
  - View and manage all ReUseIt items
  - View and manage all YouthGig postings
  - View and manage all SkillSwap listings
  - View and manage all Mentorship sessions
- **Analytics**:
  - View leaderboard analytics
  - Track platform engagement metrics
  - Monitor sustainability impact
- **Finance Management**:
  - View wallet transactions
  - Monitor payment activities
  - Manage financial operations
- **Announcements**:
  - Create and broadcast announcements
  - Target specific user groups (all, students, alumni, admins)
  - Set announcement priority (low, medium, high, urgent)
  - Manage announcement visibility
- **All Student Features**:
  - Full access to all features available to students
  - Can participate in exchanges, gigs, and skill swaps

#### Special Permissions:
- Can override user restrictions
- Can access all data and analytics
- Can modify platform settings
- Can manage system-wide configurations

---

## 🔗 Live Links

### Production Environment
- **Frontend**: [Add your production frontend URL here]
- **Backend API**: [Add your production API URL here]




---

## 🚀 Features

### Core Features

- **🛍️ ReUseIt Hub**: Post, browse, and request used-but-usable items (books, gadgets, furniture, clothes)
- **💼 YouthGig Board**: Discover and post micro-tasks or freelance gigs with secure payments
- **🔄 SkillSwap Network**: Barter-based skill exchange system with AI-powered matching
- **🧠 AI Skill-Matching**: Personalized recommendations for skill swaps and collaborations
- **🪙 Digital Wallet**: Secure wallet with Paystack integration for transactions
- **🧓 Alumni Mentorship**: Connect with verified alumni for career guidance
- **🌱 Sustainability Leaderboard**: Gamified SDG tracker with badges and rankings
- **💬 Real-time Chat**: Direct messaging between users
- **📢 Announcements**: Admin-broadcasted announcements with priority levels
- **🔔 Notifications**: Real-time notifications for all platform activities

## 🛠️ Tech Stack

### Frontend
- **React.js** + **Tailwind CSS**
- **Vite** (Build Tool)
- **React Router v6** (Routing)
- **Framer Motion** (Animations)
- **Axios** (API Client)
- **Lucide React** (Icons)
- **Socket.io Client** (Real-time communication)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (Authentication)
- **Socket.io** (Real-time Chat & Notifications)
- **Paystack** (Payment Gateway)
- **bcryptjs** (Password Hashing)

## 📁 Project Structure

```
campusconnect/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── context/       # React Context (Auth, Theme, Socket)
│   │   ├── utils/         # Utilities (API client)
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Express API
│   ├── models/           # MongoDB Models
│   ├── routes/           # API Routes
│   ├── middleware/       # Auth & validation middleware
│   ├── scripts/          # Seed data scripts
│   └── server.js         # Main server file
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start (Local Development)

1. **Clone the repository**
```bash
git clone [repository-url]
cd campusconnect
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables**

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Run the application**

Start the server:
```bash
cd server
npm run dev
```

Start the client (in a new terminal):
```bash
cd client
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🌐 Deployment to Render

For detailed instructions on deploying both frontend and backend to Render.com, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Deployment Summary:

1. **Set up MongoDB Atlas** (free tier available)
2. **Deploy Backend**:
   - Create Web Service on Render
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Add environment variables (MONGODB_URI, JWT_SECRET, etc.)
3. **Deploy Frontend**:
   - Create Static Site on Render
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`
   - Add environment variable: `VITE_API_URL` (your backend URL)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### ReUseIt
- `GET /api/reuseit` - Get all items
- `POST /api/reuseit` - Create item
- `PUT /api/reuseit/:id` - Update item
- `DELETE /api/reuseit/:id` - Delete item
- `PUT /api/reuseit/:id/request` - Request exchange
- `PUT /api/reuseit/:id/approve` - Approve exchange

### YouthGig
- `GET /api/youthgig` - Get all gigs
- `POST /api/youthgig` - Create gig
- `PUT /api/youthgig/:id` - Update gig
- `DELETE /api/youthgig/:id` - Delete gig
- `PUT /api/youthgig/:id/apply` - Apply for gig
- `PUT /api/youthgig/:id/select-applicant` - Select applicant

### SkillSwap
- `GET /api/skillswap` - Get all swaps
- `POST /api/skillswap` - Create swap
- `PUT /api/skillswap/:id` - Update swap
- `DELETE /api/skillswap/:id` - Delete swap
- `POST /api/skillswap/:id/match` - Match with swap

### Mentorship
- `GET /api/mentorship/mentors` - Get available mentors
- `GET /api/mentorship/sessions` - Get user sessions
- `POST /api/mentorship/book` - Book session
- `PUT /api/mentorship/sessions/:id/status` - Update session status

### Chat
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/messages/:chatId` - Get messages
- `POST /api/chat/message` - Send message
- `PUT /api/chat/messages/:chatId/read` - Mark as read
- `GET /api/chat/unread-count` - Get unread count

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `PUT /api/announcements/:id/read` - Mark as read

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Leaderboard
- `GET /api/leaderboard/students` - Get student rankings
- `GET /api/leaderboard/user-stats` - Get user stats

### Wallet
- `GET /api/wallet` - Get user wallet
- `POST /api/wallet/initialize-payment` - Initialize Paystack payment
- `POST /api/wallet/verify-payment` - Verify payment

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 💳 Paystack Integration

1. Sign up at [Paystack](https://paystack.com)
2. Get your API keys (Test keys for development)
3. Add keys to server `.env` file
4. Payment flow:
   - Initialize payment → Get authorization URL
   - User completes payment on Paystack
   - Verify payment → Update wallet balance

## 🗄️ Database Models

- **User**: Authentication, profile, points, badges, role
- **ReUseIt**: Item exchanges
- **YouthGig**: Job postings and applications
- **SkillSwap**: Skill exchange listings
- **Mentorship**: Booking sessions
- **Wallet**: Balance and transactions
- **Chat**: Conversations and messages
- **Announcement**: Admin announcements
- **Notification**: User notifications

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with full tablet and desktop support
- **Dark Mode**: Complete dark mode support
- **Real-time Updates**: Live notifications and chat
- **Toast Notifications**: User-friendly feedback for all actions
- **Loading States**: Skeleton loaders and spinners
- **Empty States**: Helpful messages when no data is available
- **Breadcrumbs**: Clear navigation context
- **Accessibility**: Focus states and ARIA labels

## 🧪 Testing

```bash
# Test API health
curl http://localhost:5000/api/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123","university":"Test University"}'
```

## 📝 Environment Variables Reference

### Server (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `PAYSTACK_SECRET_KEY` - Paystack secret key
- `PAYSTACK_PUBLIC_KEY` - Paystack public key
- `CLIENT_URL` - Frontend URL for CORS

### Client (.env)
- `VITE_API_URL` - Backend API URL

## 🤝 Contributing

This is an MVP project. Contributions and feedback are welcome!

## 📄 License

This project is part of the MVP development for CampusConnect.

---

Built with ❤️ for sustainable campus communities
