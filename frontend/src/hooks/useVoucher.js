// ============================================================
// useVoucher.js — Hook quản lý ví voucher của người dùng
// Dùng voucherAPI + userVoucherAPI để:
// - Lấy danh sách voucher hợp lệ
// - Lưu voucher vào ví
// - Áp dụng voucher khi checkout
// ============================================================
import { useState, useCallback } from 'react'
import { voucherAPI, userVoucherAPI } from '../services/apiService'

/**
 * Hook quản lý voucher.
 *
 * @example
 * const {
 *   validVouchers,    // Danh sách voucher còn hiệu lực
 *   myVouchers,       // Voucher trong ví cá nhân
 *   applyVoucher,     // Áp dụng voucher lên variant
 *   saveVoucher,      // Lưu voucher vào ví
 *   useVoucher,       // Đánh dấu đã sử dụng
 *   loadValidVouchers, loadMyVouchers
 * } = useVoucher()
 */
export default function useVoucher() {
  const [validVouchers, setValidVouchers] = useState([])
  const [myVouchers, setMyVouchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Lấy danh sách voucher còn hiệu lực (public) ──
  const loadValidVouchers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await voucherAPI.getValid()
      if (data.success) setValidVouchers(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Lấy voucher trong ví cá nhân ──
  const loadMyVouchers = useCallback(async (is_used) => {
    setLoading(true)
    setError(null)
    try {
      const data = await userVoucherAPI.getMyVouchers(is_used)
      if (data.success) setMyVouchers(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Lưu voucher vào ví ──
  const saveVoucher = useCallback(async (payload) => {
    try {
      const data = await userVoucherAPI.save(payload)
      if (data.success) {
        // Reload danh sách ví sau khi lưu
        await loadMyVouchers()
      }
      return data
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [loadMyVouchers])

  // ── Áp dụng voucher thường lên biến thể ──
  const applyVoucher = useCallback(async (code, variant_id, quantity) => {
    try {
      return await voucherAPI.apply(code, variant_id, quantity)
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  // ── Áp dụng user voucher (từ ví) ──
  const applyUserVoucher = useCallback(async (payload) => {
    try {
      return await userVoucherAPI.apply(payload)
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  // ── Đánh dấu voucher đã sử dụng ──
  const markVoucherUsed = useCallback(async (payload) => {
    try {
      return await userVoucherAPI.use(payload)
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  // ── Check voucher (theo code) ──
  const checkVoucher = useCallback(async (code) => {
    try {
      return await voucherAPI.check(code)
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  return {
    validVouchers,
    myVouchers,
    loading,
    error,
    loadValidVouchers,
    loadMyVouchers,
    saveVoucher,
    applyVoucher,
    applyUserVoucher,
    markVoucherUsed,
    checkVoucher,
  }
}
