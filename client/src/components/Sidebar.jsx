import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Recycle, 
  Briefcase, 
  Users, 
  GraduationCap, 
  Trophy, 
  Wallet,
  Shield,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const userNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'ReUseIt', href: '/dashboard/reuseit', icon: Recycle },
  { name: 'YouthGig', href: '/dashboard/youthgig', icon: Briefcase },
  { name: 'SkillSwap', href: '/dashboard/skillswap', icon: Users },
  { name: 'Mentorship', href: '/dashboard/mentorship', icon: GraduationCap },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const alumniNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Mentor', href: '/dashboard/mentorship', icon: GraduationCap },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/dashboard/admin', icon: Shield },
  { name: 'Items', href: '/dashboard/reuseit', icon: Recycle },
  { name: 'Gigs', href: '/dashboard/youthgig', icon: Briefcase },
  { name: 'Swaps', href: '/dashboard/skillswap', icon: Users },
  { name: 'Mentorship', href: '/dashboard/mentorship', icon: GraduationCap },
  { name: 'Analytics', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Finance', href: '/dashboard/wallet', icon: Wallet },
]

export default function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CampusConnect</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sustainability Hub</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {(
              user?.role === 'admin' ? adminNavigation :
              user?.role === 'alumni' ? alumniNavigation :
              userNavigation
            ).map((item) => {
              const Icon = item.icon
              const isAdminItem = user?.role === 'admin' && item.href === '/dashboard/admin'
              const isMentorItem = user?.role === 'alumni' && item.href === '/dashboard/mentorship'
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? isAdminItem
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium'
                          : isMentorItem
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                          : 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <NavLink
              to="/dashboard/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            >
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=14b8a6&color=fff'}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.university}
                </p>
              </div>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

