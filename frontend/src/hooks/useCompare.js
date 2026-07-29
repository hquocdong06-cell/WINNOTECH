// ============================================================
// useCompare.js — Hook quản lý tính năng so sánh sản phẩm
// Dùng compareAPI để toggle/lấy danh sách so sánh
// ============================================================
import { useState, useCallback, useEffect } from 'react'
import { compareAPI } from '../services/apiService'

/**
 * Hook quản lý tính năng so sánh sản phẩm.
 * - compareIds: Set<string> — Tập ID sản phẩm đang trong danh sách so sánh
 * - toggleCompare(productId): thêm/xóa sản phẩm khỏi danh sách so sánh
 * - compareList: mảng sản phẩm đầy đủ (sau khi gọi fetchCompareList)
 * 
 * Dùng:
 *   const { compareIds, toggleCompare, compareList } = useCompare()
 *   <button onClick={() => toggleCompare(product._id)}>So sánh</button>
 */
export default function useCompare() {
  const [compareIds, setCompareIds] = useState(new Set())
  const [compareList, setCompareList] = useState([])
  const [loading, setLoading] = useState(false)

  // Lấy danh sách so sánh khi mount
  const fetchCompareList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await compareAPI.getMyList()
      if (data.success) {
        const products = data.data || []
        setCompareList(products)
        setCompareIds(new Set(products.map(p => String(p._id))))
      }
    } catch {
      // Nếu chưa đăng nhập hoặc lỗi → compareList rỗng, bỏ qua
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompareList()
  }, [fetchCompareList])

  // Toggle so sánh
  const toggleCompare = useCallback(async (productId) => {
    try {
      const data = await compareAPI.toggle(productId)
      if (data.success) {
        // Refresh danh sách sau toggle
        await fetchCompareList()
      }
    } catch (err) {
      // Thông báo lỗi (vd: chưa login)
      console.warn('Toggle compare error:', err.message)
    }
  }, [fetchCompareList])

  // So sánh 2 sản phẩm (khách vãng lai)
  const compareGuest = useCallback(async (id1, id2) => {
    try {
      return await compareAPI.compareGuest(id1, id2)
    } catch {
      return null
    }
  }, [])

  return { compareIds, compareList, toggleCompare, compareGuest, loading, refresh: fetchCompareList }
}
