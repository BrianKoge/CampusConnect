import { useState, useEffect } from 'react'
import { User, Lock, Trash2, Save, Edit, X, Camera, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const tabs = [
  { id: 'profile', label: 'My Details', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
]

export default function Settings() {
  const { user, refreshUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    university: '',
    avatar: ''
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Edit states
  const [editing, setEditing] = useState({
    name: false,
    email: false,
    university: false
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        university: user.university || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleProfileUpdate = async (field, value) => {
    try {
      setSaving(true)
      const updatedData = { [field]: value }
      const response = await api.put('/users/profile', updatedData)
      
      // Update local state
      setProfileData(prev => ({ ...prev, [field]: value }))
      setEditing(prev => ({ ...prev, [field]: false }))
      
      // Refresh user context
      await refreshUser()
      
      alert(`${field === 'name' ? 'Name' : field === 'email' ? 'Email' : 'University'} updated successfully!`)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // For now, we'll use a URL. In production, you'd upload to a service like Cloudinary
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        setSaving(true)
        const avatarUrl = reader.result
        await api.put('/users/profile', { avatar: avatarUrl })
        setProfileData(prev => ({ ...prev, avatar: avatarUrl }))
        await refreshUser()
        alert('Profile picture updated successfully!')
      } catch (error) {
        alert('Failed to update profile picture')
      } finally {
        setSaving(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      setSaving(true)
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      alert('Password changed successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type DELETE to confirm')
      return
    }

    try {
      setSaving(true)
      await api.delete('/users/profile')
      alert('Account deleted successfully')
      logout()
      window.location.href = '/'
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete account')
    } finally {
      setSaving(false)
      setShowDeleteModal(false)
      setDeleteConfirm('')
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Account & Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Basic Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Basic Details
              </h2>
              
              {/* Profile Picture */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt={profileData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(profileData.name)
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={saving}
                    />
                  </label>
                </div>
                <div>
                  <button
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                    className="btn-secondary"
                    disabled={saving}
                  >
                    Change Picture
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <div className="flex items-center gap-3">
                  {editing.name ? (
                    <>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 input-field"
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleProfileUpdate('name', profileData.name)}
                        className="btn-primary"
                        disabled={saving}
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(prev => ({ ...prev, name: false }))
                          setProfileData(prev => ({ ...prev, name: user.name }))
                        }}
                        className="btn-secondary"
                        disabled={saving}
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={profileData.name}
                        className="flex-1 input-field"
                        disabled
                      />
                      <button
                        onClick={() => setEditing(prev => ({ ...prev, name: true }))}
                        className="btn-secondary"
                      >
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-3">
                  {editing.email ? (
                    <>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="flex-1 input-field"
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleProfileUpdate('email', profileData.email)}
                        className="btn-primary"
                        disabled={saving}
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(prev => ({ ...prev, email: false }))
                          setProfileData(prev => ({ ...prev, email: user.email }))
                        }}
                        className="btn-secondary"
                        disabled={saving}
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={profileData.email}
                        className="flex-1 input-field"
                        disabled
                      />
                      <button
                        onClick={() => setEditing(prev => ({ ...prev, email: true }))}
                        className="btn-secondary"
                      >
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* University */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  University
                </label>
                <div className="flex items-center gap-3">
                  {editing.university ? (
                    <>
                      <input
                        type="text"
                        value={profileData.university}
                        onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                        className="flex-1 input-field"
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleProfileUpdate('university', profileData.university)}
                        className="btn-primary"
                        disabled={saving}
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(prev => ({ ...prev, university: false }))
                          setProfileData(prev => ({ ...prev, university: user.university }))
                        }}
                        className="btn-secondary"
                        disabled={saving}
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={profileData.university}
                        className="flex-1 input-field"
                        disabled
                      />
                      <button
                        onClick={() => setEditing(prev => ({ ...prev, university: true }))}
                        className="btn-secondary"
                      >
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Change Password
            </h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="input-field pr-10"
                    required
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input-field pr-10"
                    required
                    minLength={6}
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field pr-10"
                    required
                    minLength={6}
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'delete' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Delete Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Delete your account and all of your source data. This is irreversible.
            </p>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                <strong>Warning:</strong> This action cannot be undone. All your data including:
              </p>
              <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                <li>Your profile and account information</li>
                <li>All your posts, exchanges, gigs, and skill swaps</li>
                <li>Your points, badges, and achievements</li>
                <li>All your messages and conversations</li>
                <li>Your wallet balance and transaction history</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input-field"
                placeholder="DELETE"
                disabled={saving}
              />
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger"
              disabled={deleteConfirm !== 'DELETE' || saving}
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirm('')
                }}
                className="btn-secondary flex-1"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger flex-1"
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

