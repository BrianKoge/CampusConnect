import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ToastProvider } from './context/ToastContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import ReUseIt from './pages/ReUseIt'
import YouthGig from './pages/YouthGig'
import SkillSwap from './pages/SkillSwap'
import Mentorship from './pages/Mentorship'
import Leaderboard from './pages/Leaderboard'
import Wallet from './pages/Wallet'
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import ConditionalRoute from './components/ConditionalRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<ConditionalRoute />} />
              <Route path="reuseit" element={<ConditionalRoute />} />
              <Route path="youthgig" element={<ConditionalRoute />} />
              <Route path="skillswap" element={<ConditionalRoute />} />
              <Route path="mentorship" element={<ConditionalRoute />} />
              <Route path="leaderboard" element={<ConditionalRoute />} />
              <Route path="wallet" element={<ConditionalRoute />} />
              <Route path="settings" element={<Settings />} />
              <Route 
                path="admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

