import express from 'express'
import { protect } from '../middleware/auth.js'
import Wallet from '../models/Wallet.js'
import axios from 'axios'

const router = express.Router()
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

// @route   GET /api/wallet
// @desc    Get user wallet
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id })
    
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0
      })
    }
    
    res.json(wallet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/wallet/initialize-payment
// @desc    Initialize Paystack payment
// @access  Private
router.post('/initialize-payment', protect, async (req, res) => {
  try {
    const { amount, email } = req.body
    
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        amount: amount * 100, // Convert to kobo
        email: email || req.user.email,
        metadata: {
          userId: req.user._id.toString()
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    res.json({
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference
    })
  } catch (error) {
    res.status(500).json({ 
      message: error.response?.data?.message || error.message || 'Payment initialization failed' 
    })
  }
})

// @route   POST /api/wallet/verify-payment
// @desc    Verify Paystack payment
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { reference } = req.body
    
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.data.status === 'success') {
      let wallet = await Wallet.findOne({ user: req.user._id })
      
      if (!wallet) {
        wallet = await Wallet.create({
          user: req.user._id,
          balance: 0
        })
      }
      
      const amount = response.data.data.amount / 100
      wallet.balance += amount
      wallet.transactions.push({
        type: 'credit',
        amount,
        description: 'Fund added via Paystack',
        status: 'completed',
        paystackReference: reference
      })
      
      await wallet.save()
      
      res.json({ success: true, wallet })
    } else {
      res.status(400).json({ message: 'Payment verification failed' })
    }
  } catch (error) {
    res.status(500).json({ 
      message: error.response?.data?.message || error.message || 'Payment verification failed' 
    })
  }
})

// @route   POST /api/wallet/withdraw
// @desc    Withdraw funds
// @access  Private
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, bankAccount } = req.body
    
    let wallet = await Wallet.findOne({ user: req.user._id })
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' })
    }
    
    wallet.balance -= amount
    wallet.transactions.push({
      type: 'debit',
      amount,
      description: 'Withdrawal',
      status: 'pending'
    })
    
    await wallet.save()
    
    res.json({ success: true, wallet })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

