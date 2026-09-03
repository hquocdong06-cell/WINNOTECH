import React, { useState, useEffect } from 'react'

/**
 * PriceRangeFilter: Bộ lọc khoảng giá thông minh
 * - Cho phép người dùng NHẬP TIỀN trực tiếp vào 2 ô (Giá từ - Đến giá)
 * - Tự động format dấu chấm phân cách hàng nghìn khi gõ (vd: 10.000.000)
 * - Cho phép người dùng KÉO DÂY thanh trượt 2 đầu (Min - Max)
 * - Nút Đặt lại giá nhanh chóng và tiện lợi
 */
export default function PriceRangeFilter({
  minPrice = 0,
  maxPrice = 100000000,
  minLimit = 0,
  maxLimit = 100000000,
  onPriceChange
}) {
  const effectiveMaxLimit = maxLimit > minLimit ? maxLimit : 100000000
  const step = effectiveMaxLimit > 50000000 ? 500000 : 100000

  const [minInput, setMinInput] = useState('')
  const [maxInput, setMaxInput] = useState('')
  const [isMinFocused, setIsMinFocused] = useState(false)
  const [isMaxFocused, setIsMaxFocused] = useState(false)

  function formatPriceWithUnit(val) {
    if (val === undefined || val === null || isNaN(val)) return '0đ'
    return Number(val).toLocaleString('vi-VN') + 'đ'
  }

  function formatNumberOnly(val) {
    if (val === undefined || val === null || isNaN(val) || val === 0) return '0'
    return Number(val).toLocaleString('vi-VN')
  }

  function parseNumeric(str) {
    if (!str) return 0
    const digits = str.toString().replace(/\D/g, '')
    return digits ? parseInt(digits, 10) : 0
  }

  // Đồng bộ giá trị hiển thị từ props khi không đang nhập liệu
  useEffect(() => {
    if (!isMinFocused) {
      setMinInput(formatPriceWithUnit(minPrice))
    }
  }, [minPrice, isMinFocused])

  useEffect(() => {
    if (!isMaxFocused) {
      setMaxInput(formatPriceWithUnit(maxPrice))
    }
  }, [maxPrice, isMaxFocused])

  // --- XỬ LÝ Ô NHẬP MIN PRICE ---
  const handleMinFocus = () => {
    setIsMinFocused(true)
    setMinInput(minPrice > 0 ? formatNumberOnly(minPrice) : '')
  }

  const handleMinInputChange = (e) => {
    const raw = e.target.value
    const num = parseNumeric(raw)
    if (raw === '') {
      setMinInput('')
      onPriceChange({ min: minLimit, max: maxPrice })
      return
    }
    setMinInput(formatNumberOnly(num))
    const clampedMin = Math.max(minLimit, Math.min(num, maxPrice))
    onPriceChange({ min: clampedMin, max: maxPrice })
  }

  const handleMinBlur = () => {
    setIsMinFocused(false)
    const num = parseNumeric(minInput)
    const clampedMin = Math.max(minLimit, Math.min(num, maxPrice))
    setMinInput(formatPriceWithUnit(clampedMin))
    onPriceChange({ min: clampedMin, max: maxPrice })
  }

  // --- XỬ LÝ Ô NHẬP MAX PRICE ---
  const handleMaxFocus = () => {
    setIsMaxFocused(true)
    setMaxInput(maxPrice > 0 ? formatNumberOnly(maxPrice) : '')
  }

  const handleMaxInputChange = (e) => {
    const raw = e.target.value
    const num = parseNumeric(raw)
    if (raw === '') {
      setMaxInput('')
      return
    }
    setMaxInput(formatNumberOnly(num))
    if (num >= 1000) {
      const clampedMax = Math.min(effectiveMaxLimit, Math.max(num, minPrice))
      onPriceChange({ min: minPrice, max: clampedMax })
    }
  }

  const handleMaxBlur = () => {
    setIsMaxFocused(false)
    const num = parseNumeric(maxInput)
    const clampedMax = num > 0 ? Math.min(effectiveMaxLimit, Math.max(num, minPrice)) : effectiveMaxLimit
    setMaxInput(formatPriceWithUnit(clampedMax))
    onPriceChange({ min: minPrice, max: clampedMax })
  }

  // --- XỬ LÝ KÉO THANH TRƯỢT ---
  const handleSliderMinChange = (e) => {
    const val = Number(e.target.value)
    const newMin = Math.min(val, maxPrice - step)
    onPriceChange({ min: Math.max(minLimit, newMin), max: maxPrice })
  }

  const handleSliderMaxChange = (e) => {
    const val = Number(e.target.value)
    const newMax = Math.max(val, minPrice + step)
    onPriceChange({ min: minPrice, max: Math.min(effectiveMaxLimit, newMax) })
  }

  // Tính tỷ lệ % thanh active
  const range = effectiveMaxLimit - minLimit || 1
  const leftPercent = Math.min(100, Math.max(0, ((minPrice - minLimit) / range) * 100))
  const rightPercent = Math.min(100, Math.max(0, ((maxPrice - minLimit) / range) * 100))

  const isFiltered = minPrice > minLimit || maxPrice < effectiveMaxLimit

  const handleReset = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onPriceChange({ min: minLimit, max: effectiveMaxLimit })
  }

  return (
    <div className="price-range-container">
      {/* 2 Ô NHẬP TIỀN */}
      <div className="price-inputs-row">
        <div className="price-input-box">
          <input
            type="text"
            className="price-num-input"
            value={minInput}
            onFocus={handleMinFocus}
            onChange={handleMinInputChange}
            onBlur={handleMinBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            placeholder="Từ 0đ"
            title="Nhập mức giá tối thiểu (gõ số)"
          />
        </div>
        <span className="price-dash">-</span>
        <div className="price-input-box">
          <input
            type="text"
            className="price-num-input"
            value={maxInput}
            onFocus={handleMaxFocus}
            onChange={handleMaxInputChange}
            onBlur={handleMaxBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            placeholder="Đến giá"
            title="Nhập mức giá tối đa (gõ số)"
          />
        </div>
      </div>

      {/* DẢI THANH TRƯỢT 2 ĐẦU (KÉO DÂY) */}
      <div className="dual-slider-box">
        <div className="dual-slider-track" />
        <div
          className="dual-slider-active-track"
          style={{
            left: `${leftPercent}%`,
            width: `${Math.max(0, rightPercent - leftPercent)}%`
          }}
        />

        {/* Nút kéo Min */}
        <input
          type="range"
          min={minLimit}
          max={effectiveMaxLimit}
          step={step}
          value={minPrice}
          onChange={handleSliderMinChange}
          className="dual-slider-thumb thumb-min"
          style={{ zIndex: minPrice > effectiveMaxLimit - step * 2 ? 5 : 3 }}
          title="Kéo chỉnh giá tối thiểu"
        />

        {/* Nút kéo Max */}
        <input
          type="range"
          min={minLimit}
          max={effectiveMaxLimit}
          step={step}
          value={maxPrice}
          onChange={handleSliderMaxChange}
          className="dual-slider-thumb thumb-max"
          style={{ zIndex: 4 }}
          title="Kéo chỉnh giá tối đa"
        />
      </div>

      {/* NÚT ĐẶT LẠI KHI CÓ LỌC GIÁ */}
      {isFiltered && (
        <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn-reset-price"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ↻ Đặt lại giá
          </button>
        </div>
      )}
    </div>
  )
}
