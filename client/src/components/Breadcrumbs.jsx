import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels = {
  dashboard: 'Home',
  reuseit: 'ReUseIt',
  youthgig: 'YouthGig',
  skillswap: 'SkillSwap',
  mentorship: 'Mentorship',
  leaderboard: 'Leaderboard',
  wallet: 'Wallet',
  settings: 'Settings',
  admin: 'Admin Dashboard',
}

export default function Breadcrumbs() {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  if (paths.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Home size={16} />
        <span>Home</span>
      </Link>
      {paths.slice(1).map((path, index) => {
        const isLast = index === paths.length - 2
        const routePath = `/${paths.slice(0, index + 2).join('/')}`
        const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1)

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight size={16} className="text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 dark:text-gray-100 font-medium">{label}</span>
            ) : (
              <Link
                to={routePath}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

