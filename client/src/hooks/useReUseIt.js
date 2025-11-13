import { useState, useEffect } from 'react'
import api from '../utils/api'

export const useReUseIt = (category = 'All', search = '') => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const params = {}
        if (category !== 'All') params.category = category
        if (search) params.search = search
        
        const response = await api.get('/reuseit', { params })
        setItems(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch items')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [category, search])

  const createItem = async (itemData) => {
    try {
      const response = await api.post('/reuseit', itemData)
      setItems(prev => [response.data, ...prev])
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create item')
    }
  }

  const requestExchange = async (itemId) => {
    try {
      const response = await api.put(`/reuseit/${itemId}/request`)
      setItems(prev => prev.map(item => 
        item._id === itemId ? response.data : item
      ))
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to request exchange')
    }
  }

  return { items, loading, error, createItem, requestExchange }
}

