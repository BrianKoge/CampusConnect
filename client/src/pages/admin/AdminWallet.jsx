import { useState, useEffect } from 'react'
import { 
  Wallet, 
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../utils/api'

export default function AdminWallet() {
  const [stats, setStats] = useState(null)
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
      // Fetch top wallets
      // This would require a new endpoint, for now we'll use mock data
      setWallets([
        { user: { name: 'User 1', email: 'user1@example.com' }, balance: 1250.50, transactions: 45 },
        { user: { name: 'User 2', email: 'user2@example.com' }, balance: 980.25, transactions: 32 },
        { user: { name: 'User 3', email: 'user3@example.com' }, balance: 750.00, transactions: 28 },
      ])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor platform finances and user wallet activity
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats?.financial.totalBalance || '0.00'}
              </p>
            </div>
            <Wallet className="text-emerald-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Wallets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.financial.wallets || 0}
              </p>
            </div>
            <CreditCard className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.users.total || 0}
              </p>
            </div>
            <Users className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats?.financial.wallets > 0 
                  ? (parseFloat(stats.financial.totalBalance) / stats.financial.wallets).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Top Wallets */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Top Wallets
          </h2>
          <Wallet className="text-emerald-500" size={24} />
        </div>
        <div className="space-y-3">
          {wallets.map((wallet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {wallet.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {wallet.user.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${wallet.balance.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {wallet.transactions} transactions
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Wallet Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Wallets</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.financial.wallets || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-emerald-600 h-3 rounded-full"
                  style={{ width: `${((stats?.financial.wallets || 0) / (stats?.users.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Users with Balance</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats?.financial.wallets || 0} / {stats?.users.total || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${((stats?.financial.wallets || 0) / (stats?.users.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Platform Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Platform Value</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${stats?.financial.totalBalance || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Wallet Size</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${stats?.financial.wallets > 0 
                  ? (parseFloat(stats.financial.totalBalance) / stats.financial.wallets).toFixed(2)
                  : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Wallet Adoption Rate</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats?.users.total > 0 
                  ? ((stats.financial.wallets / stats.users.total) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

