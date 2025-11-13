import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

// User pages
import Home from '../pages/Home'
import ReUseIt from '../pages/ReUseIt'
import YouthGig from '../pages/YouthGig'
import SkillSwap from '../pages/SkillSwap'
import Mentorship from '../pages/Mentorship'
import Leaderboard from '../pages/Leaderboard'
import Wallet from '../pages/Wallet'

// Admin pages
import AdminHome from '../pages/admin/AdminHome'
import AdminReUseIt from '../pages/admin/AdminReUseIt'
import AdminYouthGig from '../pages/admin/AdminYouthGig'
import AdminSkillSwap from '../pages/admin/AdminSkillSwap'
import AdminMentorship from '../pages/admin/AdminMentorship'
import AdminLeaderboard from '../pages/admin/AdminLeaderboard'
import AdminWallet from '../pages/admin/AdminWallet'

// Mentor page (for alumni)
import MentorMentorship from '../pages/MentorMentorship'

export default function ConditionalRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user?.role === 'alumni') {
      const path = location.pathname
      const restrictedPaths = ['/dashboard/reuseit', '/dashboard/youthgig', '/dashboard/skillswap', '/dashboard/leaderboard', '/dashboard/wallet']
      
      if (restrictedPaths.includes(path)) {
        navigate('/dashboard')
      }
    }
  }, [location.pathname, user, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'
  const isAlumni = user?.role === 'alumni'
  const path = location.pathname

  // Route to appropriate component based on user role and path
  if (isAdmin) {
    if (path === '/dashboard' || path === '/dashboard/') {
      return <AdminHome />
    } else if (path === '/dashboard/reuseit') {
      return <AdminReUseIt />
    } else if (path === '/dashboard/youthgig') {
      return <AdminYouthGig />
    } else if (path === '/dashboard/skillswap') {
      return <AdminSkillSwap />
    } else if (path === '/dashboard/mentorship') {
      return <AdminMentorship />
    } else if (path === '/dashboard/leaderboard') {
      return <AdminLeaderboard />
    } else if (path === '/dashboard/wallet') {
      return <AdminWallet />
    }
    return <AdminHome />
  } else if (isAlumni) {
    // Alumni can only access home and mentorship
    if (path === '/dashboard' || path === '/dashboard/') {
      return <Home />
    } else if (path === '/dashboard/mentorship') {
      return <MentorMentorship />
    } else {
      // Redirect alumni to home if they try to access restricted pages
      return <Home />
    }
  } else {
    if (path === '/dashboard' || path === '/dashboard/') {
      return <Home />
    } else if (path === '/dashboard/reuseit') {
      return <ReUseIt />
    } else if (path === '/dashboard/youthgig') {
      return <YouthGig />
    } else if (path === '/dashboard/skillswap') {
      return <SkillSwap />
    } else if (path === '/dashboard/mentorship') {
      return <Mentorship />
    } else if (path === '/dashboard/leaderboard') {
      return <Leaderboard />
    } else if (path === '/dashboard/wallet') {
      return <Wallet />
    }
    return <Home />
  }
}

