import { useState } from 'react'
import { Wallet as WalletIcon, Plus, ArrowDown, ArrowUp, CreditCard, History, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const transactions = [
  {
    id: 1,
    type: 'credit',
    amount: 150,
    description: 'Payment from Logo Design gig',
    date: '2 hours ago',
    status: 'completed',
  },
  {
    id: 2,
    type: 'debit',
    amount: 25,
    description: 'Mentorship session booking',
    date: '1 day ago',
    status: 'completed',
  },
  {
    id: 3,
    type: 'credit',
    amount: 300,
    description: 'Website Development project',
    date: '3 days ago',
    status: 'completed',
  },
  {
    id: 4,
    type: 'credit',
    amount: 200,
    description: 'Event Photography gig',
    date: '1 week ago',
    status: 'completed',
  },
]

export default function Wallet() {
  const [balance] = useState(625.00)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Digital Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure payments and transactions with Paystack integration
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-200 mb-2">Total Balance</p>
            <h2 className="text-4xl font-bold">${balance.toFixed(2)}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <WalletIcon size={32} />
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddFunds(true)}
            className="flex-1 bg-white text-primary-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Funds
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex-1 bg-white/10 border-2 border-white text-white hover:bg-white/20 font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDown size={20} />
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <ArrowUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$1,250</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ArrowDown className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$625</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">+$450</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
          <button className="btn-primary text-sm py-2 px-4">
            <Plus size={16} />
            Add Card
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <CreditCard className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Visa •••• 4242</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
              </div>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Set as Default
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
            <History size={16} />
            View All
          </button>
        </div>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    transaction.type === 'credit'
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}
                >
                  {transaction.type === 'credit' ? (
                    <ArrowUp className="text-green-600 dark:text-green-400" size={24} />
                  ) : (
                    <ArrowDown className="text-red-600 dark:text-red-400" size={24} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.type === 'credit'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {transaction.status}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Funds</h2>
              <button
                onClick={() => setShowAddFunds(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input-field"
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select className="input-field">
                  <option>Visa •••• 4242</option>
                  <option>Add new card</option>
                </select>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Powered by Paystack
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Secure payment processing. Your card details are encrypted.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Funds
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h2>
              <button
                onClick={() => setShowWithdraw(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input-field"
                  max={balance}
                  min="1"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Available: ${balance.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Account
                </label>
                <select className="input-field">
                  <option>Select bank account</option>
                  <option>Add new account</option>
                </select>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  ⚠️ Withdrawals may take 1-3 business days to process.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Withdraw
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

