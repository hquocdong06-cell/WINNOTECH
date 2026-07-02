import React, { useState, useEffect, useCallback } from 'react'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/build-pc.css'

const API_URL = 'http://localhost:3000'

// ─── SVG Step Icons Styled with Neon Green ──────────────────────────────
const StepIcon = ({ id, size = 16, style = {} }) => {
  const mergedStyle = {
    width: size,
    height: size,
    verticalAlign: 'middle',
    stroke: 'var(--bp-yellow)',
    display: 'inline-block',
    ...style
  }

  switch (id) {
    case 'cpu':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      )
    case 'mainboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 4v5M15 4v3M9 15h6M9 17h3" />
          <circle cx="15" cy="11" r="1" fill="var(--bp-yellow)" />
        </svg>
      )
    case 'ram':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="2" y="8" width="20" height="8" rx="1" />
          <path d="M6 8v2M10 8v2M14 8v2M18 8v2M6 14v2M10 14v2M14 14v2M18 14v2" />
        </svg>
      )
    case 'gpu':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <circle cx="8" cy="12" r="3" />
          <circle cx="16" cy="12" r="3" />
          <path d="M2 9h4M2 15h4" />
        </svg>
      )
    case 'storage':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01M5 14h14M12 6h.01" />
        </svg>
      )
    case 'psu':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M13 7l-4 6h4v4l4-6h-4z" />
        </svg>
      )
    case 'cooling':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
          <path d="M12 12l3-3M12 12l-3 3M12 12l3 3M12 12l-3-3" />
        </svg>
      )
    case 'case':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M5 7h14M5 12h14M9 16h6" />
        </svg>
      )
    case 'monitor':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      )
    case 'peripheral':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <rect x="2" y="5" width="12" height="8" rx="1" />
          <circle cx="19" cy="9" r="3" />
          <path d="M19 6v3M5 7h1M9 7h1M5 10h1M9 10h1M16 9h1" />
        </svg>
      )
    case 'extra':
      return (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={mergedStyle}>
          <path d="M18 10h-4V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4H2v4h4v6h2v-6h4v6h2v-6h4z" />
        </svg>
      )
    default:
      return null
  }
}

// ─── Danh sách bước build ─────────────────────────────────────────────────
const BUILD_STEPS = [
  { id: 'cpu',      label: 'CPU',            required: true,  desc: 'Bộ vi xử lý' },
  { id: 'mainboard',label: 'Mainboard',      required: true,  desc: 'Bo mạch chủ' },
  { id: 'ram',      label: 'RAM',            required: true,  desc: 'Bộ nhớ trong' },
  { id: 'gpu',      label: 'VGA / GPU',      required: true,  desc: 'Card đồ họa' },
  { id: 'storage',  label: 'Ổ cứng',         required: true,  desc: 'SSD / HDD' },
  { id: 'psu',      label: 'PSU',            required: true,  desc: 'Nguồn máy tính' },
  { id: 'cooling',  label: 'Tản nhiệt',      required: false, desc: 'CPU Cooler / AIO' },
  { id: 'case',     label: 'Vỏ case',        required: true,  desc: 'Thùng máy' },
  { id: 'monitor',  label: 'Màn hình',       required: false, desc: 'Màn hình LCD/OLED' },
  { id: 'peripheral',label:'Bàn phím • Chuột',required: false, desc: 'Phụ kiện ngoại vi' },
  { id: 'extra',    label: 'Phụ kiện khác',  required: false, desc: 'Dây LED, hub, quạt...' },
]

const REQUIRED_STEPS = BUILD_STEPS.filter(s => s.required).map(s => s.id)

// ─── Mapping step → category slug trong DB ────────────────────────────────
const STEP_TO_SLUG = {
  cpu:        'cpu',
  mainboard:  'mainboard',
  ram:        'ram',
  gpu:        'gpu',
  storage:    'storage',
  psu:        'psu',
  cooling:    'tan-nhiet',
  case:       'case',
  // monitor / peripheral / extra chưa có category trong DB → dùng mock
}

// Sản phẩm mock cho các danh mục chưa có trong DB
const STATIC_FALLBACK = {
  monitor: [
    { id: 'mon1', name: 'LG 27GP850-B 27" QHD 165Hz Nano IPS', price: 8490000, specs: '27" QHD 2560×1440 · 165Hz · 1ms · IPS · FreeSync', stock: true },
    { id: 'mon2', name: 'ASUS ROG Swift 27" 4K 160Hz OLED',     price:19990000, specs: '27" 4K UHD · 160Hz · 0.03ms · OLED · G-Sync', stock: true },
    { id: 'mon3', name: 'Samsung Odyssey G5 34" UWQHD 165Hz',   price:11990000, specs: '34" UWQHD 3440×1440 · 165Hz · VA · FreeSync', stock: true },
  ],
  peripheral: [
    { id: 'per1', name: 'Logitech G Pro X Superlight 2 + G715 TKL', price: 4990000, specs: 'Chuột 60g không dây · Bàn phím TKL RGB Tactile', stock: true },
    { id: 'per2', name: 'Razer DeathAdder V3 HyperSpeed + BlackWidow V4', price: 4290000, specs: 'Chuột không dây ergonomic · Bàn phím Green Switch', stock: true },
  ],
  extra: [
    { id: 'ext1', name: 'Dây cáp Sleeved Extension Kit RGB',  price:  590000, specs: 'Bộ dây cáp nguồn bọc lưới · ATX 24pin + EPS + PCIe', stock: true },
    { id: 'ext2', name: 'NZXT RGB Fan Controller',             price:  890000, specs: 'Hub điều khiển 8 quạt RGB · USB header', stock: true },
  ],
}

// ─── Helper lấy URL ảnh sản phẩm ─────────────────────────────────────────
function getImg(product) {
  const firstImg = product.AnhSP?.[0]?.url || product.thumnail || ''
  if (!firstImg) return null
  return firstImg.startsWith('http') ? firstImg : `${API_URL}${firstImg}`
}

// ─── Normalize sản phẩm API → format BuildPC ──────────────────────────────
function normalizeProduct(p, stepId) {
  const variant = p.Variants?.[0]
  const attrs   = variant?.Attributes || []
  const getAttr = (key) => {
    const found = attrs.find(a => a.name?.toLowerCase().includes(key.toLowerCase()))
    return found?.value || ''
  }

  // Tính giá: ưu tiên sale_price nếu > 0
  const rawPrice = (variant?.sale_price > 0 ? variant.sale_price : variant?.price) || p.price || 0

  // Tạo specs string từ attributes hoặc description
  const specParts = attrs.slice(0, 4).map(a => `${a.value}`).filter(Boolean)
  const specs = specParts.length > 0 ? specParts.join(' · ') : (p.description?.slice(0, 80) || p.name)

  // Socket detection
  const socketAttr = getAttr('socket') || getAttr('Socket')
  let socket = socketAttr
  if (!socket) {
    if (p.name.includes('AM5') || p.name.includes('Ryzen 7000') || p.name.includes('Ryzen 9000')) socket = 'AM5'
    else if (p.name.includes('AM4') || p.name.includes('Ryzen 5000') || p.name.includes('Ryzen 3000')) socket = 'AM4'
    else if (p.name.includes('LGA1700') || p.name.includes('i9-1') || p.name.includes('i7-1') || p.name.includes('i5-1') || p.name.includes('i3-1')) socket = 'LGA1700'
    else if (p.name.includes('LGA1200')) socket = 'LGA1200'
  }

  // RAM type detection
  const ramTypeAttr = getAttr('ddr') || getAttr('memory type') || getAttr('ram type')
  let ramType = ''
  if (ramTypeAttr) ramType = ramTypeAttr.toUpperCase().includes('DDR5') ? 'DDR5' : 'DDR4'
  else if (p.name.includes('DDR5')) ramType = 'DDR5'
  else if (p.name.includes('DDR4')) ramType = 'DDR4'

  // Form factor (case & mainboard)
  const ffAttr = getAttr('form') || getAttr('kích thước')
  let formFactor = ffAttr || 'ATX'
  let formFactorArr = ['ATX', 'mATX', 'ITX'] // default: hỗ trợ tất cả
  if (ffAttr) {
    if (ffAttr.toLowerCase().includes('mini-itx') || ffAttr.toLowerCase().includes('itx')) formFactorArr = ['ATX','mATX','ITX']
    else if (ffAttr.toLowerCase().includes('matx') || ffAttr.toLowerCase().includes('micro')) formFactorArr = ['mATX','ITX']
    else formFactorArr = ['ATX','mATX','ITX']
    formFactor = ffAttr
  }

  // TDP / wattage
  const tdpAttr = getAttr('tdp') || getAttr('watt') || getAttr('tpd')
  let tdp = 65
  let wattage = 0
  if (tdpAttr) {
    const num = parseInt(tdpAttr)
    if (!isNaN(num)) {
      if (stepId === 'psu') wattage = num
      else tdp = num
    }
  }
  if (stepId === 'psu') {
    // Estimate wattage từ tên sản phẩm
    const wMatch = p.name.match(/(\d{2,4})W/i)
    if (wMatch) wattage = parseInt(wMatch[1])
  }

  // GPU tier
  let tier = 3
  const gpuName = p.name.toLowerCase()
  if (gpuName.includes('4090') || gpuName.includes('7900 xtx')) tier = 5
  else if (gpuName.includes('4080') || gpuName.includes('4070 ti') || gpuName.includes('7900 xt')) tier = 4
  else if (gpuName.includes('4070') || gpuName.includes('7800 xt') || gpuName.includes('7700 xt')) tier = 3
  else if (gpuName.includes('4060 ti') || gpuName.includes('7600 xt')) tier = 2
  else if (gpuName.includes('4060') || gpuName.includes('7600')) tier = 1

  // Brand
  const brand = p.brand_id?.name || (p.name.includes('Intel') ? 'Intel' : p.name.includes('AMD') ? 'AMD' : p.name.includes('ASUS') ? 'ASUS' : p.name.includes('MSI') ? 'MSI' : p.name.includes('GIGABYTE') || p.name.includes('Gigabyte') ? 'GIGABYTE' : '')

  return {
    id:         p._id,
    _id:        p._id,
    name:       p.name,
    price:      rawPrice,
    specs,
    image:      getImg(p),
    stock:      p.active !== false,
    brand,
    // compatibility fields
    socket,
    ramType,
    formFactor,
    formFactorArr,
    tdp,
    wattage,
    tier,
  }
}

// ─── Compatibility Check Engine ───────────────────────────────────────────
function checkCompatibility(selected) {
  const issues = []
  const warnings = []

  const cpu = selected.cpu
  const mb  = selected.mainboard
  const ram = selected.ram
  const gpu = selected.gpu
  const psu = selected.psu
  const cse = selected.case

  // 1. Socket CPU ↔ Mainboard
  if (cpu && mb && cpu.socket && mb.socket) {
    if (cpu.socket !== mb.socket) {
      issues.push(`❌ Socket không khớp: CPU ${cpu.socket} ≠ Mainboard ${mb.socket}`)
    }
  }

  // 2. RAM Type ↔ Mainboard
  if (ram && mb && ram.ramType && mb.ramType) {
    if (ram.ramType !== mb.ramType) {
      issues.push(`❌ RAM type không khớp: RAM ${ram.ramType} ≠ Mainboard hỗ trợ ${mb.ramType}`)
    }
  }

  // 3. Form Factor Case ↔ Mainboard
  if (cse && mb) {
    const caseFF  = cse.formFactorArr || cse.formFactor || []
    const mbFF    = mb.formFactor || ''
    const arr     = Array.isArray(caseFF) ? caseFF : [caseFF]
    if (mbFF && arr.length > 0 && !arr.some(f => mbFF.includes(f) || f.includes(mbFF))) {
      issues.push(`❌ Form factor không khớp: Case hỗ trợ ${arr.join('/')} nhưng Mainboard là ${mbFF}`)
    }
  }

  // 4. PSU Wattage vs Total TDP
  if (psu && psu.wattage) {
    let totalTdp = 50
    if (cpu) totalTdp += cpu.tdp || 65
    if (gpu) totalTdp += gpu.tdp || 150
    const recommended = Math.ceil((totalTdp * 1.25) / 50) * 50

    if (psu.wattage < totalTdp) {
      issues.push(`❌ PSU ${psu.wattage}W không đủ cho hệ thống cần ~${totalTdp}W tổng TDP`)
    } else if (psu.wattage < recommended) {
      warnings.push(`⚠️ PSU ${psu.wattage}W hơi sát công suất. Khuyên dùng ≥${recommended}W`)
    }
  }

  // 5. Bottleneck CPU ↔ GPU
  if (cpu && gpu) {
    const gpuTier = gpu.tier || 3
    const cpuTier = cpu.tier || 3
    const diff = Math.abs(cpuTier - gpuTier)
    if (diff >= 2) {
      if (cpuTier < gpuTier) warnings.push(`⚠️ CPU có thể bị bottleneck bởi GPU mạnh hơn ~${diff * 20}%`)
      else warnings.push(`⚠️ GPU có thể không phát huy hết sức mạnh của CPU`)
    }
  }

  return { compatible: issues.length === 0, issues, warnings }
}

// ─── Format số tiền ───────────────────────────────────────────────────────
function formatPrice(price) {
  if (!price) return '0đ'
  return price.toLocaleString('vi-VN') + 'đ'
}

// ─── Tính tổng giá ────────────────────────────────────────────────────────
function calcTotal(selected) {
  return Object.values(selected).reduce((sum, item) => sum + (item ? (item.price || 0) : 0), 0)
}

// ─── Filter brands ────────────────────────────────────────────────────────
const BRAND_FILTERS = {
  cpu:      ['Tất cả', 'AMD', 'Intel'],
  mainboard:['Tất cả', 'ASUS', 'MSI', 'GIGABYTE'],
  gpu:      ['Tất cả', 'NVIDIA', 'AMD'],
  default:  ['Tất cả'],
}

// ══════════════════════════════════════════════════════════════════════════
export default function BuildPC() {
  const [activeStep, setActiveStep]     = useState('cpu')
  const [selected, setSelected]         = useState({})
  const [brandFilter, setBrandFilter]   = useState('Tất cả')
  const [sortOrder, setSortOrder]       = useState('price-desc')
  const [compatibility, setCompatibility] = useState({ compatible: true, issues: [], warnings: [] })
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [addedAnimation, setAddedAnimation]     = useState(null)

  // ── Dynamic products from API ──────────────────────────────────────────
  const [productsCache, setProductsCache] = useState({})  // stepId → normalized[]
  const [loading, setLoading]             = useState(false)
  const [fetchError, setFetchError]       = useState(null)

  // Fetch products khi đổi step (chỉ fetch nếu chưa có trong cache)
  useEffect(() => {
    const slug = STEP_TO_SLUG[activeStep]
    if (!slug) return  // dùng static fallback
    if (productsCache[activeStep]) return  // đã có cache, không fetch lại

    setLoading(true)
    setFetchError(null)

    fetch(`${API_URL}/categories/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.products?.length > 0) {
          const normalized = data.data.products.map(p => normalizeProduct(p, activeStep))
          setProductsCache(prev => ({ ...prev, [activeStep]: normalized }))
        } else {
          // Nếu API 404 hoặc chưa có sản phẩm, set mảng rỗng
          setProductsCache(prev => ({ ...prev, [activeStep]: [] }))
          setFetchError(`Chưa có sản phẩm ${BUILD_STEPS.find(s => s.id === activeStep)?.label} trong hệ thống`)
        }
      })
      .catch(() => {
        setProductsCache(prev => ({ ...prev, [activeStep]: [] }))
        setFetchError('Không thể kết nối server')
      })
      .finally(() => setLoading(false))
  }, [activeStep])

  // Re-run compatibility check whenever selection changes
  useEffect(() => {
    setCompatibility(checkCompatibility(selected))
  }, [selected])

  // Reset brand filter when step changes
  useEffect(() => { setBrandFilter('Tất cả') }, [activeStep])

  // ── Derived state ─────────────────────────────────────────────────────
  const totalPrice    = calcTotal(selected)
  const selectedCount = Object.values(selected).filter(Boolean).length
  const requiredDone  = REQUIRED_STEPS.every(id => !!selected[id])
  const allStockOk    = Object.values(selected).filter(Boolean).every(p => p.stock !== false)

  // CTA state
  const isComplete    = requiredDone && compatibility.compatible && allStockOk && totalPrice > 0
  const nextStep      = BUILD_STEPS.find(s => !selected[s.id])
  const progressPct   = Math.round((selectedCount / BUILD_STEPS.length) * 100)

  // ── Products for current step ─────────────────────────────────────────
  // Nếu step có slug → lấy từ cache API; ngược lại dùng static fallback
  const rawProducts = STEP_TO_SLUG[activeStep]
    ? (productsCache[activeStep] || [])
    : (STATIC_FALLBACK[activeStep] || [])
  const brands      = BRAND_FILTERS[activeStep] || BRAND_FILTERS.default

  const filteredProducts = rawProducts
    .filter(p => brandFilter === 'Tất cả' || (p.brand && p.brand === brandFilter) ||
      (brandFilter === 'NVIDIA' && p.name.includes('RTX') || p.name.includes('GTX')) ||
      (brandFilter === 'AMD'    && (p.name.includes('Radeon') || p.name.includes('AMD'))) ||
      (brandFilter === 'ASUS'   && p.name.includes('ASUS')) ||
      (brandFilter === 'MSI'    && p.name.includes('MSI')) ||
      (brandFilter === 'GIGABYTE' && p.name.includes('Gigabyte') || p.name.includes('GIGABYTE')))
    .sort((a, b) => {
      if (sortOrder === 'price-desc') return b.price - a.price
      if (sortOrder === 'price-asc')  return a.price - b.price
      return 0
    })

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelect = useCallback((product) => {
    setSelected(prev => {
      const already = prev[activeStep]?.id === product.id
      return { ...prev, [activeStep]: already ? null : product }
    })
    setAddedAnimation(product.id)
    setTimeout(() => setAddedAnimation(null), 600)
  }, [activeStep])

  const handleRemove = useCallback((stepId) => {
    setSelected(prev => ({ ...prev, [stepId]: null }))
  }, [])

  const handleCTAClick = () => {
    if (isComplete) {
      setShowSummaryModal(true)
    } else if (nextStep) {
      setActiveStep(nextStep.id)
    }
  }

  const handleAddAllToCart = () => {
    setShowSummaryModal(false)
    alert('✅ Đã thêm tất cả linh kiện vào giỏ hàng!')
  }

  const ctaText = isComplete
    ? '🛒 Thêm toàn bộ vào giỏ'
    : nextStep
    ? `Tiếp tục chọn ${nextStep.label} →`
    : 'Hoàn thiện cấu hình →'

  const ctaClass = isComplete ? 'bp-cta-btn bp-cta-buy' : 'bp-cta-btn bp-cta-next'

  // ─── RENDER ─────────────────────────────────────────────────────────
  return (
    <DefaultLayout>
      <div className="bp-page">

        {/* ── PAGE HEADER ── */}
        <div className="bp-header">
          <div className="bp-header-inner">
            <div className="bp-header-left">
              <div className="bp-header-badge">// BUILD PC</div>
              <h1 className="bp-header-title">XÂY DỰNG <span>CẤU HÌNH</span> MƠ ƯỚC</h1>
              <p className="bp-header-sub">
                Tự do lựa chọn linh kiện phù hợp nhu cầu và ngân sách<br />
                để tạo nên bộ PC hoàn hảo dành riêng cho bạn.
              </p>
            </div>
            <div className="bp-header-stats">
              <div className="bp-stat">
                <span className="bp-stat-num">{selectedCount}</span>
                <span className="bp-stat-label">Linh kiện đã chọn</span>
              </div>
              <div className="bp-stat-divider" />
              <div className="bp-stat">
                <span className="bp-stat-num">{BUILD_STEPS.length - selectedCount}</span>
                <span className="bp-stat-label">Còn lại</span>
              </div>
              <div className="bp-stat-divider" />
              <div className="bp-stat">
                <span className="bp-stat-num bp-stat-price">{formatPrice(totalPrice)}</span>
                <span className="bp-stat-label">Tổng tiền</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="bp-progress-wrap">
            <div className="bp-progress-inner">
              <div className="bp-progress-bar" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="bp-progress-label">{progressPct}% hoàn thành</span>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="bp-main">
          <div className="bp-main-inner">

            {/* LEFT: Steps sidebar */}
            <aside className="bp-sidebar">
              {BUILD_STEPS.map((step, idx) => {
                const item = selected[step.id]
                const isActive = activeStep === step.id
                const isDone = !!item
                return (
                  <div
                    key={step.id}
                    className={`bp-step ${isActive ? 'bp-step-active' : ''} ${isDone ? 'bp-step-done' : ''}`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <div className="bp-step-num">
                      {isDone
                        ? <span className="bp-step-check">✓</span>
                        : <StepIcon id={step.id} size={16} />
                      }
                    </div>
                    <div className="bp-step-info">
                      <div className="bp-step-name">
                        {step.label}
                      </div>
                      {isDone
                        ? <div className="bp-step-sel">{item.name.length > 28 ? item.name.slice(0,28)+'…' : item.name}</div>
                        : <div className="bp-step-hint">{step.desc}{!step.required && ' (tuỳ chọn)'}</div>
                      }
                    </div>
                    {isDone && (
                      <button
                        className="bp-step-remove"
                        onClick={e => { e.stopPropagation(); handleRemove(step.id) }}
                        title="Bỏ chọn"
                      >×</button>
                    )}
                    {isActive && <div className="bp-step-arrow">›</div>}
                  </div>
                )
              })}

              {/* Load / Save */}
              <div className="bp-sidebar-actions">
                <button className="bp-sa-btn"><span>⬆</span> Tải cấu hình</button>
                <button className="bp-sa-btn"><span>💾</span> Lưu cấu hình</button>
              </div>
            </aside>

            {/* CENTER: Product list */}
            <main className="bp-content">
              <div className="bp-content-header">
                <div className="bp-content-title">
                  <StepIcon id={activeStep} size={20} style={{ marginRight: '8px' }} />
                  {BUILD_STEPS.find(s => s.id === activeStep)?.label}
                  <span className="bp-content-count">{filteredProducts.length} sản phẩm</span>
                </div>
                <div className="bp-content-filters">
                  {/* Brand tabs */}
                  <div className="bp-brand-tabs">
                    {brands.map(b => (
                      <button
                        key={b}
                        className={`bp-brand-tab ${brandFilter === b ? 'active' : ''}`}
                        onClick={() => setBrandFilter(b)}
                      >{b}</button>
                    ))}
                  </div>
                  {/* Sort */}
                  <select
                    className="bp-sort"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                  >
                    <option value="price-desc">Giá: Cao → Thấp</option>
                    <option value="price-asc">Giá: Thấp → Cao</option>
                  </select>
                </div>
              </div>

              {/* Product cards */}
              <div className="bp-products">
                {loading && (
                  <div className="bp-loading">
                    <div className="bp-loading-spinner"></div>
                    <span>Đang tải sản phẩm...</span>
                  </div>
                )}
                {!loading && fetchError && filteredProducts.length === 0 && (
                  <div className="bp-empty">{fetchError}</div>
                )}
                {!loading && filteredProducts.map(product => {
                  const isSelected = selected[activeStep]?.id === product.id
                  const isAnimating = addedAnimation === product.id
                  return (
                    <div
                      key={product.id}
                      className={`bp-product-card ${isSelected ? 'bp-product-selected' : ''} ${isAnimating ? 'bp-product-added' : ''}`}
                      onClick={() => handleSelect(product)}
                    >
                      <div className="bp-product-img">
                        {product.image
                          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                          : null
                        }
                        <div className="bp-product-img-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
                          <StepIcon id={activeStep} size={32} />
                        </div>
                        {isSelected && <div className="bp-product-check-badge">✓</div>}
                      </div>
                      <div className="bp-product-info">
                        <div className="bp-product-name">{product.name}</div>
                        <div className="bp-product-specs">{product.specs}</div>
                        <div className="bp-product-footer">
                          <div className="bp-product-price">{formatPrice(product.price)}</div>
                          <div className={`bp-product-stock ${product.stock ? 'in-stock' : 'out-stock'}`}>
                            {product.stock ? '● Còn hàng' : '● Hết hàng'}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`bp-product-select-btn ${isSelected ? 'selected' : ''}`}
                        onClick={e => { e.stopPropagation(); handleSelect(product) }}
                      >
                        {isSelected ? '✓ Đã chọn' : '+ Chọn'}
                      </button>
                    </div>
                  )
                })}
                {!loading && filteredProducts.length === 0 && !fetchError && (
                  <div className="bp-empty">Không có sản phẩm phù hợp với bộ lọc</div>
                )}
              </div>

              {/* Trust bar */}
              <div className="bp-trust">
                <div className="bp-trust-item">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <div>
                    <div className="bp-trust-title">KIỂM TRA TƯƠNG THÍCH</div>
                    <div className="bp-trust-sub">Hệ thống kiểm tra tự động</div>
                  </div>
                </div>
                <div className="bp-trust-item">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <div>
                    <div className="bp-trust-title">TƯ VẤN MIỄN PHÍ</div>
                    <div className="bp-trust-sub">Đội ngũ chuyên gia hỗ trợ</div>
                  </div>
                </div>
                <div className="bp-trust-item">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <div>
                    <div className="bp-trust-title">BẢO HÀNH CHÍNH HÃNG</div>
                    <div className="bp-trust-sub">Cam kết bảo hành đầy đủ</div>
                  </div>
                </div>
                <div className="bp-trust-item">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <div>
                    <div className="bp-trust-title">GIAO HÀNG TOÀN QUỐC</div>
                    <div className="bp-trust-sub">Miễn phí từ 1.000.000đ</div>
                  </div>
                </div>
              </div>
            </main>

            {/* RIGHT: Summary panel */}
            <aside className="bp-summary">
              <div className="bp-summary-header">
                <div className="bp-summary-title">CẤU HÌNH CỦA BẠN</div>
                <div className="bp-summary-total">{formatPrice(totalPrice)}</div>
              </div>

              {/* Compatibility status */}
              {selectedCount > 0 && (
                <div className={`bp-compat-box ${compatibility.compatible ? 'ok' : 'error'}`}>
                  <div className="bp-compat-title">
                    {compatibility.compatible
                      ? `✅ Tương thích tốt${compatibility.warnings.length ? ` (${compatibility.warnings.length} cảnh báo)` : ''}`
                      : `❌ Phát hiện ${compatibility.issues.length} lỗi tương thích`}
                  </div>
                  {compatibility.issues.map((issue, i) => (
                    <div key={i} className="bp-compat-item bp-compat-error">{issue}</div>
                  ))}
                  {compatibility.warnings.map((warn, i) => (
                    <div key={i} className="bp-compat-item bp-compat-warn">{warn}</div>
                  ))}
                </div>
              )}

              {/* Selected items */}
              <div className="bp-summary-items">
                {BUILD_STEPS.map(step => {
                  const item = selected[step.id]
                  if (!item) return null
                  return (
                    <div key={step.id} className="bp-summary-item">
                      <div className="bp-summary-item-img">
                        <StepIcon id={step.id} size={18} />
                      </div>
                      <div className="bp-summary-item-info">
                        <div className="bp-summary-item-cat">{step.label}</div>
                        <div className="bp-summary-item-name">{item.name}</div>
                        <div className="bp-summary-item-price">{formatPrice(item.price)}</div>
                      </div>
                      <button
                        className="bp-summary-remove"
                        onClick={() => handleRemove(step.id)}
                      >×</button>
                    </div>
                  )
                })}

                {selectedCount === 0 && (
                  <div className="bp-summary-empty">
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖥️</div>
                    <div>Chưa có linh kiện nào được chọn</div>
                    <div style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>
                      Bắt đầu bằng cách chọn CPU
                    </div>
                  </div>
                )}
              </div>

              {/* Required checklist */}
              <div className="bp-checklist">
                {REQUIRED_STEPS.map(id => {
                  const step = BUILD_STEPS.find(s => s.id === id)
                  const done = !!selected[id]
                  return (
                    <div key={id} className={`bp-check-item ${done ? 'done' : ''}`}>
                      <span className="bp-check-icon">{done ? '✓' : '○'}</span>
                      <span>{step?.label}</span>
                    </div>
                  )
                })}
              </div>

              {/* ── SMART CTA ── */}
              <button
                className={ctaClass}
                onClick={handleCTAClick}
                disabled={selectedCount === 0}
              >
                {ctaText}
              </button>

              {/* If incomplete, show missing parts */}
              {!isComplete && requiredDone && !compatibility.compatible && (
                <div className="bp-cta-hint">
                  ⚠️ Vui lòng kiểm tra lỗi tương thích trước khi mua
                </div>
              )}
              {!requiredDone && (
                <div className="bp-cta-hint">
                  Cần chọn thêm {REQUIRED_STEPS.filter(id => !selected[id]).length} linh kiện bắt buộc
                </div>
              )}

              {/* Share / Save actions */}
              <div className="bp-summary-actions">
                <button className="bp-sa2-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Lưu cấu hình
                </button>
                <button className="bp-sa2-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Chia sẻ
                </button>
              </div>

              {/* Guarantee note */}
              <div className="bp-guarantee">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Tất cả linh kiện đều chính hãng 100% · Bảo hành đầy đủ theo chính sách nhà sản xuất.
              </div>
            </aside>

          </div>
        </div>
      </div>

      {/* ── BUY NOW MODAL ── */}
      {showSummaryModal && (
        <div className="bp-modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="bp-modal" onClick={e => e.stopPropagation()}>
            <button className="bp-modal-close" onClick={() => setShowSummaryModal(false)}>×</button>
            <div className="bp-modal-header">
              <div className="bp-modal-icon">✅</div>
              <h2>Cấu hình hoàn chỉnh!</h2>
              <p>Tất cả linh kiện tương thích · Sẵn sàng đặt hàng</p>
            </div>

            <div className="bp-modal-items">
              {BUILD_STEPS.map(step => {
                const item = selected[step.id]
                if (!item) return null
                return (
                  <div key={step.id} className="bp-modal-item">
                    <span className="bp-modal-item-icon">
                      <StepIcon id={step.id} size={18} />
                    </span>
                    <div className="bp-modal-item-info">
                      <div className="bp-modal-item-cat">{step.label}</div>
                      <div className="bp-modal-item-name">{item.name}</div>
                    </div>
                    <div className="bp-modal-item-price">{formatPrice(item.price)}</div>
                  </div>
                )
              })}
            </div>

            <div className="bp-modal-total">
              <span>Tổng cộng</span>
              <span className="bp-modal-total-price">{formatPrice(totalPrice)}</span>
            </div>

            <div className="bp-modal-actions">
              <button className="bp-modal-buy" onClick={handleAddAllToCart}>
                🛒 Thêm toàn bộ vào giỏ hàng
              </button>
              <button className="bp-modal-checkout" onClick={() => { handleAddAllToCart(); window.location.href='/cart' }}>
                ⚡ Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
