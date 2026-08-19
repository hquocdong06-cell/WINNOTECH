import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/build-pc.css'
import { buildPCAPI } from '../services/apiService'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'

const API_URL = 'http://localhost:3000'

// ─── SVG Step Icons Styled with Neon Green ──────────────────────────────
const StepIcon = () => null

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
  cooling:    'cooling',
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

// ─── Helper lấy URL ảnh sản phẩm ───────────────────────────────────────────────────
function getImg(product) {
  const firstImg = product.AnhSP?.[0]?.url || product.thumnail || ''
  if (!firstImg) return null
  return firstImg.startsWith('http') ? firstImg : `${API_URL}${firstImg}`
}

function normalizeProduct(p, stepId) {
  const variant = p.Variants?.[0]
  const attrs   = variant?.Attributes || []
  const getAttr = (key) => {
    const found = attrs.find(a => a.name?.toLowerCase().includes(key.toLowerCase()))
    return found?.value || ''
  }

  // Giá: ưu tiên sale_price
  const rawPrice = (variant?.sale_price > 0 ? variant.sale_price : variant?.price) || p.price || 0

  // Specs string
  const specParts = attrs.slice(0, 4).map(a => `${a.value}`).filter(Boolean)
  const specs = specParts.length > 0 ? specParts.join(' · ') : (p.description?.slice(0, 80) || p.name)

  // ── compatibility_meta từ DB (ưu tiên cao nhất) ────────────────────
  const meta = p.compatibility_meta || {}

  // Socket detection: meta > attr > name
  const socketAttr = getAttr('socket') || getAttr('Socket')
  let socket = meta.socket || socketAttr || null
  if (!socket) {
    const n = p.name
    if (/Core Ultra/i.test(n) && /285K|265K|245K|225K/i.test(n)) socket = 'LGA1851'
    else if (/AM5|Ryzen\s*(5|7|9)\s*7[0-9]{3}|Ryzen\s*(5|7|9)\s*9[0-9]{3}|7800X3D/i.test(n)) socket = 'AM5'
    else if (/AM4|Ryzen\s*(3|5|7|9)\s*5[0-9]{3}|Ryzen\s*(3|5|7|9)\s*3[0-9]{3}/i.test(n)) socket = 'AM4'
    else if (/LGA1700|i[3579]-1[234][0-9]{3}/i.test(n)) socket = 'LGA1700'
    else if (/LGA1200|i[3579]-1[01][0-9]{3}/i.test(n)) socket = 'LGA1200'
    // Mainboard chipset → socket
    else if (/\b[XAB]6[57][0-9]E?\b|\bA620\b/i.test(n)) socket = 'AM5'
    else if (/\b[ABX]5[57][0-9]\b|\bA520\b/i.test(n)) socket = 'AM4'
    else if (/\bZ790\b|\bB760\b|\bH770\b|\bZ690\b|\bB660\b/i.test(n)) socket = 'LGA1700'
  }

  // RAM type: meta > attr > name
  const ramTypeAttr = getAttr('ddr') || getAttr('memory type') || getAttr('ram type')
  let ramType = meta.ram_type || ''
  if (!ramType) {
    if (ramTypeAttr) ramType = ramTypeAttr.toUpperCase().includes('DDR5') ? 'DDR5' : 'DDR4'
    else if (p.name.includes('DDR5') || p.name.includes('D5')) ramType = 'DDR5'
    else if (p.name.includes('DDR4') || p.name.includes('D4')) ramType = 'DDR4'
  }

  // Form factor: meta > attr > name
  const ffAttr = getAttr('form') || getAttr('kích thước')
  let formFactor    = meta.form_factor || ffAttr || 'ATX'
  let formFactorArr = meta.supported_ff?.length > 0 ? meta.supported_ff : ['ATX', 'mATX', 'ITX']
  if (!meta.form_factor && !ffAttr) {
    // Fallback: detect form factor từ tên
    if (/M-ATX|mATX|Micro.?ATX|\b[A-Z]\d{3,4}M\b/.test(p.name)) {
      formFactor = 'mATX'
      formFactorArr = ['mATX', 'ITX']
    } else if (/Mini.?ITX|mITX|NR200/i.test(p.name)) {
      formFactor = 'ITX'
      formFactorArr = ['ITX']
    }
  }

  // TDP / wattage: meta > attr > name
  const tdpAttr = getAttr('tdp') || getAttr('watt') || getAttr('tpd')
  let tdp     = meta.tdp || 65
  let wattage = meta.wattage || 0
  if (!meta.tdp && !meta.wattage && tdpAttr) {
    const num = parseInt(tdpAttr)
    if (!isNaN(num)) {
      if (stepId === 'psu') wattage = num
      else tdp = num
    }
  }
  if (!wattage && stepId === 'psu') {
    const wMatch = p.name.match(/(\d{2,4})W/i)
    if (wMatch) wattage = parseInt(wMatch[1])
  }

  // GPU tier: meta > name detect
  let tier = meta.gpu_tier || 3
  if (!meta.gpu_tier) {
    const n = p.name.toLowerCase()
    if (/4090|7900\s*xtx/.test(n)) tier = 5
    else if (/4080|4070\s*ti|7900\s*xt(?!x)/.test(n)) tier = 4
    else if (/4070(?!\s*ti)|7800\s*xt|7700\s*xt/.test(n)) tier = 3
    else if (/4060\s*ti|7600\s*xt/.test(n)) tier = 2
    else if (/4060(?!\s*ti)|7600\b|rtx\s*5060/.test(n)) tier = 1
  }

  // Brand
  const brand = p.brand_id?.name
    || (p.name.includes('Intel')   ? 'Intel'
      : p.name.includes('AMD')    ? 'AMD'
      : p.name.includes('ASUS')   ? 'ASUS'
      : p.name.includes('MSI')    ? 'MSI'
      : (p.name.includes('GIGABYTE') || p.name.includes('Gigabyte')) ? 'GIGABYTE'
      : '')

  return {
    id:          p._id,
    _id:         p._id,
    variantId:   variant?._id || null,
    name:        p.name,
    price:       rawPrice,
    specs,
    image:       getImg(p),
    stock:       p.active !== false,
    brand,
    // compatibility fields (ưu tiên từ DB meta)
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
      issues.push(`Socket không khớp: CPU ${cpu.socket} ≠ Mainboard ${mb.socket}`)
    }
  }

  // 2. RAM Type ↔ Mainboard
  if (ram && mb && ram.ramType && mb.ramType) {
    if (ram.ramType !== mb.ramType) {
      issues.push(`RAM type không khớp: RAM ${ram.ramType} ≠ Mainboard hỗ trợ ${mb.ramType}`)
    }
  }

  // 3. Form Factor Case ↔ Mainboard
  if (cse && mb) {
    const caseFF  = cse.formFactorArr || cse.formFactor || []
    const mbFF    = mb.formFactor || ''
    const arr     = Array.isArray(caseFF) ? caseFF : [caseFF]
    if (mbFF && arr.length > 0 && !arr.some(f => mbFF.includes(f) || f.includes(mbFF))) {
      issues.push(`Form factor không khớp: Case hỗ trợ ${arr.join('/')} nhưng Mainboard là ${mbFF}`)
    }
  }

  // 4. PSU Wattage vs Total TDP
  if (psu && psu.wattage) {
    let totalTdp = 50
    if (cpu) totalTdp += cpu.tdp || 65
    if (gpu) totalTdp += gpu.tdp || 150
    const recommended = Math.ceil((totalTdp * 1.25) / 50) * 50

    if (psu.wattage < totalTdp) {
      issues.push(`PSU ${psu.wattage}W không đủ cho hệ thống cần ~${totalTdp}W tổng TDP`)
    } else if (psu.wattage < recommended) {
      warnings.push(`PSU ${psu.wattage}W hơi sát công suất. Khuyên dùng ≥${recommended}W`)
    }
  }

  // 5. Bottleneck CPU ↔ GPU
  if (cpu && gpu) {
    const gpuTier = gpu.tier || 3
    const cpuTier = cpu.tier || 3
    const diff = Math.abs(cpuTier - gpuTier)
    if (diff >= 2) {
      if (cpuTier < gpuTier) warnings.push(`CPU có thể bị bottleneck bởi GPU mạnh hơn ~${diff * 20}%`)
      else warnings.push(`GPU có thể không phát huy hết sức mạnh của CPU`)
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
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const [activeStep, setActiveStep]     = useState('cpu')
  const [brandFilter, setBrandFilter]   = useState('Tất cả')
  const [searchQuery, setSearchQuery]   = useState('')
  const [sortOrder, setSortOrder]       = useState('price-desc')
  const [compatibility, setCompatibility] = useState({ compatible: true, issues: [], warnings: [] })
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [addedAnimation, setAddedAnimation]     = useState(null)

  // ── Suggest Modal State ────────────────────────────────────
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestBudget, setSuggestBudget]       = useState(20000000)
  const [suggestPurpose, setSuggestPurpose]     = useState('gaming')
  const [suggestResult, setSuggestResult]       = useState(null)  // { build, total }
  const [suggestLoading, setSuggestLoading]     = useState(false)
  const [suggestError, setSuggestError]         = useState(null)

  // ── Smart Filter Override State ───────────────────────────
  // stepId → true: user đã bấm "Xem tất cả", bỏ qua filter tương thích
  const [filterOverrides, setFilterOverrides] = useState({})

  // ── 3 PC Build Configurations State (Khách & Thành viên) ───────────────
  const [buildConfigs, setBuildConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('winnotech_pc_build_configs')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Lỗi đọc cấu hình PC từ localStorage:', e)
    }
    return [
      { id: 1, name: 'Cấu hình 1', selected: {} },
      { id: 2, name: 'Cấu hình 2', selected: {} },
      { id: 3, name: 'Cấu hình 3', selected: {} },
    ]
  })

  const [activeConfigId, setActiveConfigId]   = useState(1)
  const [editingConfigId, setEditingConfigId] = useState(null)
  const [editingNameText, setEditingNameText] = useState('')

  // Cấu hình hiện tại & các linh kiện đã chọn trong cấu hình này
  const activeConfig = buildConfigs.find(c => c.id === activeConfigId) || buildConfigs[0]
  const selected     = activeConfig?.selected || {}

  // ── Handlers cho Cấu hình PC ──────────────────────────────────────────
  const handleStartRename = (config, e) => {
    if (e) e.stopPropagation()
    setEditingConfigId(config.id)
    setEditingNameText(config.name)
  }

  const handleSaveRename = (configId) => {
    const trimmed = editingNameText.trim()
    if (!trimmed) {
      setEditingConfigId(null)
      return
    }
    setBuildConfigs(prevConfigs => {
      const nextConfigs = prevConfigs.map(cfg => {
        if (cfg.id === configId) {
          return { ...cfg, name: trimmed }
        }
        return cfg
      })
      try {
        localStorage.setItem('winnotech_pc_build_configs', JSON.stringify(nextConfigs))
      } catch (e) {}
      return nextConfigs
    })
    toast.success(`Đã đổi tên thành "${trimmed}"`, { position: 'bottom-right' })
    setEditingConfigId(null)
  }

  const handleClearConfig = (configId, e) => {
    if (e) e.stopPropagation()
    const cfg = buildConfigs.find(c => c.id === configId)
    if (!cfg) return
    const count = Object.values(cfg.selected || {}).filter(Boolean).length
    if (count === 0) return

    if (window.confirm(`Bạn có chắc chắn muốn xóa tất cả linh kiện của "${cfg.name}"?`)) {
      setBuildConfigs(prevConfigs => {
        const nextConfigs = prevConfigs.map(c => c.id === configId ? { ...c, selected: {} } : c)
        try {
          localStorage.setItem('winnotech_pc_build_configs', JSON.stringify(nextConfigs))
        } catch (err) {}
        return nextConfigs
      })
      toast.info(`Đã làm mới "${cfg.name}"`, { position: 'bottom-right' })
    }
  }

  // ── Dynamic products from API ──────────────────────────────────────────
  const [productsCache, setProductsCache] = useState({})  // stepId → normalized[]
  const [loading, setLoading]             = useState(false)
  const [fetchError, setFetchError]       = useState(null)
  const [saveStatus, setSaveStatus]       = useState(null) // null | 'saving' | 'success' | 'error'

  // Lưu cấu hình Build PC qua API & LocalStorage
  const handleSaveBuildPC = async () => {
    const selectedItems = Object.entries(selected)
      .filter(([, p]) => !!p)
      .map(([stepId, p]) => ({ step: stepId, variant_id: p.variantId || p._id, product_id: p.productId || p._id, name: p.name, price: p.price }))
    if (selectedItems.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 linh kiện trước khi lưu cấu hình!')
      return
    }
    const total_price = Object.values(selected).reduce((s, p) => s + (p?.price || 0), 0)
    setSaveStatus('saving')
    try {
      const data = await buildPCAPI.save(total_price, selectedItems)
      if (data.success) {
        setSaveStatus('success')
        toast.success(`Đã lưu "${activeConfig.name}" thành công!`, { position: 'bottom-right' })
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus('success')
        toast.success(`Đã lưu "${activeConfig.name}" vào trình duyệt!`, { position: 'bottom-right' })
        setTimeout(() => setSaveStatus(null), 2000)
      }
    } catch (err) {
      setSaveStatus('success')
      toast.success(`Đã lưu "${activeConfig.name}" vào trình duyệt!`, { position: 'bottom-right' })
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }

  // ── Smart Filter: Constraints từ linh kiện đã chọn ─────────────────
  // CPU (socket) → Mainboard | Mainboard (ram_type) → RAM | Mainboard (ff) → Case
  const smartConstraints = useMemo(() => {
    const c = {}
    const cpu = selected.cpu
    const mb  = selected.mainboard
    if (cpu?.socket) {
      c.mainboard = { socket: cpu.socket }
    }
    if (mb?.ramType) {
      c.ram = { ram_type: mb.ramType }
    }
    if (mb?.formFactor) {
      // Case phải hỗ trợ form factor của mainboard
      const ff = mb.formFactor.includes('ITX') ? 'ITX' : mb.formFactor.includes('mATX') ? 'mATX' : 'ATX'
      c.case = { form_factor: ff }
    }
    return c
  }, [selected.cpu, selected.mainboard])

  // Reset filter overrides khi smart constraints thay đổi
  useEffect(() => { setFilterOverrides({}) }, [smartConstraints])

  // Cache key = stepId + constraints (hoặc stepId nếu bỏ qua filter)
  const activeCacheKey = useMemo(() => {
    const isOverridden = filterOverrides[activeStep]
    const constraints  = isOverridden ? {} : (smartConstraints[activeStep] || {})
    if (Object.keys(constraints).length === 0) return activeStep
    const sorted = Object.entries(constraints).sort(([a], [b]) => a.localeCompare(b))
    return `${activeStep}__${sorted.map(([k, v]) => `${k}=${v}`).join('&')}`
  }, [activeStep, smartConstraints, filterOverrides])

  // Fetch products ─ dùng activeCacheKey, gửi filter params lên API
  useEffect(() => {
    const slug = STEP_TO_SLUG[activeStep]
    if (!slug) return  // dùng static fallback
    if (productsCache[activeCacheKey]) return  // đã có cache

    setLoading(true)
    setFetchError(null)

    const isOverridden = filterOverrides[activeStep]
    const constraints  = isOverridden ? {} : (smartConstraints[activeStep] || {})
    const params = new URLSearchParams({ category: slug, ...constraints })

    fetch(`${API_URL}/api/buildpc/components?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          const normalized = data.data.map(p => normalizeProduct(p, activeStep))
          setProductsCache(prev => ({ ...prev, [activeCacheKey]: normalized }))
        } else {
          setProductsCache(prev => ({ ...prev, [activeCacheKey]: [] }))
          setFetchError(`Chưa có sản phẩm ${BUILD_STEPS.find(s => s.id === activeStep)?.label} phù hợp`)
        }
      })
      .catch(() => {
        setProductsCache(prev => ({ ...prev, [activeCacheKey]: [] }))
        setFetchError('Không thể kết nối server')
      })
      .finally(() => setLoading(false))
  }, [activeCacheKey])

  // Re-run compatibility check whenever selection changes
  useEffect(() => {
    setCompatibility(checkCompatibility(selected))
  }, [selected])

  // Reset brand filter & search query when step changes
  useEffect(() => {
    setBrandFilter('Tất cả')
    setSearchQuery('')
  }, [activeStep])

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
  // Lấy từ cache theo activeCacheKey (bao gồm cả smart filter constraints)
  const rawProducts = STEP_TO_SLUG[activeStep]
    ? (productsCache[activeCacheKey] || [])
    : (STATIC_FALLBACK[activeStep] || [])
  const brands      = BRAND_FILTERS[activeStep] || BRAND_FILTERS.default

  // Kiểm tra sản phẩm có không tương thích khi user xem tất cả (filter bị bỏ qua)
  const getIncompatMsg = (product) => {
    if (!filterOverrides[activeStep]) return null  // filter active, all OK
    const c = smartConstraints[activeStep]
    if (!c) return null
    if (c.socket && product.socket && product.socket !== c.socket)
      return `Socket ${product.socket} ≠ ${c.socket}`
    if (c.ram_type && product.ramType && product.ramType !== c.ram_type)
      return `${product.ramType} (cần ${c.ram_type})`
    if (c.form_factor && product.formFactor && !product.formFactor.includes(c.form_factor))
      return `Form ${product.formFactor} ≠ ${c.form_factor}`
    return null
  }

  // Smart filter hint info
  const activeSmartC = filterOverrides[activeStep] ? {} : (smartConstraints[activeStep] || {})
  const hasSmartFilter = Object.keys(smartConstraints[activeStep] || {}).length > 0

  const filteredProducts = rawProducts
    .filter(p => brandFilter === 'Tất cả' || (p.brand && p.brand === brandFilter) ||
      (brandFilter === 'NVIDIA' && (p.name.includes('RTX') || p.name.includes('GTX'))) ||
      (brandFilter === 'AMD'    && (p.name.includes('Radeon') || p.name.includes('AMD'))) ||
      (brandFilter === 'ASUS'   && p.name.includes('ASUS')) ||
      (brandFilter === 'MSI'    && p.name.includes('MSI')) ||
      (brandFilter === 'GIGABYTE' && (p.name.includes('Gigabyte') || p.name.includes('GIGABYTE'))))
    .filter(p => !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortOrder === 'price-desc') return b.price - a.price
      if (sortOrder === 'price-asc')  return a.price - b.price
      return 0
    })

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelect = useCallback((product) => {
    setBuildConfigs(prevConfigs => {
      const nextConfigs = prevConfigs.map(cfg => {
        if (cfg.id === activeConfigId) {
          const prevSel = cfg.selected || {}
          const already = prevSel[activeStep]?.id === product.id
          const nextSel = { ...prevSel, [activeStep]: already ? null : product }
          return { ...cfg, selected: nextSel }
        }
        return cfg
      })
      try {
        localStorage.setItem('winnotech_pc_build_configs', JSON.stringify(nextConfigs))
      } catch (e) {}
      return nextConfigs
    })
    setAddedAnimation(product.id)
    setTimeout(() => setAddedAnimation(null), 600)
  }, [activeConfigId, activeStep])

  const handleRemove = useCallback((stepId) => {
    setBuildConfigs(prevConfigs => {
      const nextConfigs = prevConfigs.map(cfg => {
        if (cfg.id === activeConfigId) {
          const prevSel = cfg.selected || {}
          const nextSel = { ...prevSel, [stepId]: null }
          return { ...cfg, selected: nextSel }
        }
        return cfg
      })
      try {
        localStorage.setItem('winnotech_pc_build_configs', JSON.stringify(nextConfigs))
      } catch (e) {}
      return nextConfigs
    })
  }, [activeConfigId])

  const handleCTAClick = () => {
    if (isComplete) {
      setShowSummaryModal(true)
    } else if (nextStep) {
      setActiveStep(nextStep.id)
    }
  }

  // ── Suggest Handlers ──────────────────────────────────────
  const handleOpenSuggest = () => {
    setSuggestResult(null)
    setSuggestError(null)
    setShowSuggestModal(true)
  }

  const handleRunSuggest = async () => {
    setSuggestLoading(true)
    setSuggestError(null)
    setSuggestResult(null)
    try {
      const data = await buildPCAPI.suggest(suggestBudget, suggestPurpose)
      if (data.success && data.build) {
        setSuggestResult(data)
      } else {
        setSuggestError('Không tìm được cấu hình phù hợp. Thử tăng ngân sách hoặc đổi mục đích.')
      }
    } catch (err) {
      setSuggestError('Không thể kết nối server. Vui lòng thử lại.')
    } finally {
      setSuggestLoading(false)
    }
  }

  const handleApplySuggest = () => {
    if (!suggestResult?.build) return
    setBuildConfigs(prevConfigs => {
      const nextConfigs = prevConfigs.map(cfg => {
        if (cfg.id === activeConfigId) {
          return { ...cfg, selected: { ...cfg.selected, ...suggestResult.build } }
        }
        return cfg
      })
      try {
        localStorage.setItem('winnotech_pc_build_configs', JSON.stringify(nextConfigs))
      } catch (e) {}
      return nextConfigs
    })
    setShowSuggestModal(false)
    setSuggestResult(null)
    toast.success('✨ Đã áp dụng cấu hình gợi ý!', { position: 'bottom-right' })
  }

  const handleAddAllToCart = async () => {
    setShowSummaryModal(false)

    const items = Object.values(selected).filter(Boolean)
    if (items.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 linh kiện!')
      return
    }

    let successCount = 0
    let failCount    = 0
    const errors     = []

    for (const item of items) {
      if (!item.variantId) {
        const cartPayload = {
          product_id: item._id || item.id,
          variant_id: item.id,
          name:       item.name,
          price:      item.price,
          quantity:   1,
          image:      item.image || null,
        }
        dispatch(addToCart(cartPayload))
        successCount++
        continue
      }

      try {
        const res = await fetch(`${API_URL}/cart/add`, {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ variant_id: item.variantId, quantity: 1 }),
        })
        const data = await res.json()

        if (res.status === 401 || data.success) {
          const cartPayload = {
            product_id: item._id,
            variant_id: item.variantId,
            name:       item.name,
            price:      item.price,
            quantity:   1,
            image:      item.image || null,
          }
          dispatch(addToCart(cartPayload))
          successCount++
        } else {
          failCount++
          errors.push(`${item.name}: ${data.message || 'Lỗi không xác định'}`)
        }
      } catch (err) {
        failCount++
        errors.push(`${item.name}: Lỗi kết nối`)
      }
    }

    if (successCount > 0 && failCount === 0) {
      toast.success(`Đã thêm ${successCount} linh kiện vào giỏ hàng!`, { position: 'bottom-right' })
    } else if (successCount > 0 && failCount > 0) {
      toast.warn(`Đã thêm ${successCount} linh kiện. ${failCount} linh kiện thất bại: ${errors.join('; ')}`, { position: 'bottom-right' })
    } else {
      toast.error(`Không thể thêm vào giỏ hàng: ${errors.join('; ')}`, { position: 'bottom-right' })
    }
  }

  const handleCheckoutNow = async () => {
    setShowSummaryModal(false)
    await handleAddAllToCart()
    navigate('/cart')
  }

  const ctaText = isComplete
    ? 'Thêm toàn bộ vào giỏ'
    : nextStep
    ? `Tiếp tục chọn ${nextStep.label}`
    : 'Hoàn thiện cấu hình'

  const ctaClass = isComplete ? 'bp-cta-btn bp-cta-buy' : 'bp-cta-btn bp-cta-next'

  // ─── RENDER ─────────────────────────────────────────────────────────
  return (
    <DefaultLayout>
      <div className="bp-page">

        {/* ── PAGE HEADER ── */}
        <div className="bp-header">
          <div className="bp-header-inner">
            <div className="bp-header-left">
              <div className="bp-header-badge">BUILD PC</div>
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
          
          {/* ── 3 PC BUILD CONFIGURATIONS BAR ── */}
          <div className="bp-configs-container">
            <div className="bp-configs-bar">
              <div className="bp-configs-header">
                <div className="bp-configs-title">
                  <span className="bp-configs-badge">DANH SÁCH CẤU HÌNH</span>
                  <span className="bp-configs-subtitle">Tạo & lưu tối đa 3 cấu hình riêng biệt (Khách & Thành viên)</span>
                </div>
                {selectedCount > 0 && (
                  <button
                    className="bp-config-clear-btn"
                    onClick={e => handleClearConfig(activeConfigId, e)}
                    title="Xóa linh kiện cấu hình này"
                  >
                    Làm mới cấu hình này
                  </button>
                )}
              </div>

              <div className="bp-configs-list">
                {buildConfigs.map(config => {
                  const isActive = config.id === activeConfigId
                  const isEditing = editingConfigId === config.id
                  const partsCount = Object.values(config.selected || {}).filter(Boolean).length
                  const cfgPrice = calcTotal(config.selected || {})

                  return (
                    <div
                      key={config.id}
                      className={`bp-config-card ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (!isEditing) setActiveConfigId(config.id)
                      }}
                    >
                      <div className="bp-config-card-top">
                        <span className="bp-config-slot-badge">Cấu hình {config.id}</span>
                        {isEditing ? (
                          <div className="bp-config-edit-wrap" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              className="bp-config-name-input"
                              value={editingNameText}
                              onChange={e => setEditingNameText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveRename(config.id)
                                if (e.key === 'Escape') setEditingConfigId(null)
                              }}
                              autoFocus
                            />
                            <button
                              className="bp-config-save-btn"
                              onClick={() => handleSaveRename(config.id)}
                              title="Lưu tên"
                            >Lưu</button>
                          </div>
                        ) : (
                          <div className="bp-config-name-wrap">
                            <span className="bp-config-name" title={config.name}>{config.name}</span>
                            <button
                              className="bp-config-rename-btn"
                              onClick={e => handleStartRename(config, e)}
                              title="Đổi tên cấu hình"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span>Sửa</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="bp-config-card-bottom">
                        <span className="bp-config-parts-count">
                          {partsCount > 0 ? `${partsCount}/${BUILD_STEPS.length} linh kiện` : 'Chưa chọn linh kiện'}
                        </span>
                        <span className="bp-config-price-tag">
                          {partsCount > 0 ? formatPrice(cfgPrice) : '0đ'}
                        </span>
                      </div>

                      {isActive && <div className="bp-config-active-indicator" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

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
                      {idx + 1}
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
                      >X</button>
                    )}
                  </div>
                )
              })}

              {/* Load / Save */}
              <div className="bp-sidebar-actions">
                <button className="bp-sa-btn" onClick={e => handleClearConfig(activeConfigId, e)}>Làm mới</button>
                <button className="bp-sa-btn" onClick={handleSaveBuildPC} disabled={saveStatus === 'saving'}>{saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'success' ? 'Đã lưu!' : 'Lưu cấu hình'}</button>
              </div>
            </aside>

            {/* CENTER: Product list */}
            <main className="bp-content">
              <div className="bp-content-header">
                <div className="bp-content-title">
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

                  {/* Search Bar cho từng danh mục */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Tìm theo tên sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '6px 30px 6px 12px',
                        borderRadius: '20px',
                        background: '#121621',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                        width: '200px',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >X</button>
                    )}
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

              {/* ── SMART FILTER HINT BAR ── */}
              {hasSmartFilter && (
                <div className={`bp-smart-filter-bar ${filterOverrides[activeStep] ? 'bp-sf-off' : ''}`}>
                  <span className="bp-sf-icon">{filterOverrides[activeStep] ? '⚠️' : '🔍'}</span>
                  {!filterOverrides[activeStep] ? (
                    <>
                      <span className="bp-sf-label">Smart Filter:</span>
                      {activeSmartC.socket && <span className="bp-sf-tag">Socket {activeSmartC.socket}</span>}
                      {activeSmartC.ram_type && <span className="bp-sf-tag">{activeSmartC.ram_type}</span>}
                      {activeSmartC.form_factor && <span className="bp-sf-tag">Form {activeSmartC.form_factor}</span>}
                      <button className="bp-sf-toggle" onClick={() => setFilterOverrides(p => ({...p, [activeStep]: true}))}
                        title="Xem tất cả sản phẩm không lọc">
                        Xem tất cả
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="bp-sf-label">Hiện thị tất cả — có thể có linh kiện không khớp</span>
                      <button className="bp-sf-toggle bp-sf-restore"
                        onClick={() => setFilterOverrides(p => { const n={...p}; delete n[activeStep]; return n })}>
                        ← Khôi phục filter
                      </button>
                    </>
                  )}
                </div>
              )}

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
                  const isSelected  = selected[activeStep]?.id === product.id
                  const isAnimating = addedAnimation === product.id
                  const incompatMsg = getIncompatMsg(product)
                  return (
                    <div
                      key={product.id}
                      className={`bp-product-card ${isSelected ? 'bp-product-selected' : ''} ${isAnimating ? 'bp-product-added' : ''} ${incompatMsg ? 'bp-product-incompat' : ''}`}
                      onClick={() => handleSelect(product)}
                    >
                      <div className="bp-product-img">
                        {product.image
                          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                          : null
                        }
                        <div className="bp-product-img-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
                          Sản phẩm
                        </div>
                        {isSelected && <div className="bp-product-check-badge">Đã chọn</div>}
                        {incompatMsg && !isSelected && (
                          <div className="bp-incompat-badge">⚠ {incompatMsg}</div>
                        )}
                      </div>
                      <div className="bp-product-info">
                        <div className="bp-product-name">{product.name}</div>
                        <div className="bp-product-specs">{product.specs}</div>
                        <div className="bp-product-footer">
                          <div className="bp-product-price">{formatPrice(product.price)}</div>
                          <div className={`bp-product-stock ${product.stock ? 'in-stock' : 'out-stock'}`}>
                            {product.stock ? 'Còn hàng' : 'Hết hàng'}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`bp-product-select-btn ${isSelected ? 'selected' : ''}`}
                        onClick={e => { e.stopPropagation(); handleSelect(product) }}
                      >
                        {isSelected ? 'Đã chọn' : 'Chọn'}
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
                  <div>
                    <div className="bp-trust-title">KIỂM TRA TƯƠNG THÍCH</div>
                    <div className="bp-trust-sub">Hệ thống kiểm tra tự động</div>
                  </div>
                </div>
                <div className="bp-trust-item">
                  <div>
                    <div className="bp-trust-title">TƯ VẤN MIỄN PHÍ</div>
                    <div className="bp-trust-sub">Đội ngũ chuyên gia hỗ trợ</div>
                  </div>
                </div>
                <div className="bp-trust-item">
                  <div>
                    <div className="bp-trust-title">BẢO HÀNH CHÍNH HÃNG</div>
                    <div className="bp-trust-sub">Cam kết bảo hành đầy đủ</div>
                  </div>
                </div>
                <div className="bp-trust-item">
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
                <div className="bp-summary-title">{activeConfig.name.toUpperCase()}</div>
                <div className="bp-summary-total">{formatPrice(totalPrice)}</div>
              </div>

              {/* Compatibility status */}
              {selectedCount > 0 && (
                <div className={`bp-compat-box ${compatibility.compatible ? 'ok' : 'error'}`}>
                  <div className="bp-compat-title">
                    {compatibility.compatible
                      ? `Tương thích tốt${compatibility.warnings.length ? ` (${compatibility.warnings.length} cảnh báo)` : ''}`
                      : `Phát hiện ${compatibility.issues.length} lỗi tương thích`}
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
                      <div className="bp-summary-item-info">
                        <div className="bp-summary-item-cat">{step.label}</div>
                        <div className="bp-summary-item-name">{item.name}</div>
                        <div className="bp-summary-item-price">{formatPrice(item.price)}</div>
                      </div>
                      <button
                        className="bp-summary-remove"
                        onClick={() => handleRemove(step.id)}
                      >Xóa</button>
                    </div>
                  )
                })}

                {selectedCount === 0 && (
                  <div className="bp-summary-empty">
                    <div>Chưa có linh kiện nào được chọn</div>
                    <div style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>
                      Bắt đầu bằng cách chọn CPU
                    </div>
                  </div>
                )}
              </div>

              {/* ── SUGGEST BUTTON ── */}
              <button
                className="bp-suggest-btn"
                onClick={handleOpenSuggest}
                title="Hệ thống tự gợi ý linh kiện phù hợp theo ngân sách"
              >
                <span className="bp-suggest-btn-icon">✨</span>
                Gợi ý cấu hình tự động
              </button>

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
                  Vui lòng kiểm tra lỗi tương thích trước khi mua
                </div>
              )}
              {!requiredDone && (
                <div className="bp-cta-hint">
                  Cần chọn thêm {REQUIRED_STEPS.filter(id => !selected[id]).length} linh kiện bắt buộc
                </div>
              )}

              {/* Share / Save actions */}
              <div className="bp-summary-actions">
                <button className="bp-sa2-btn" onClick={handleSaveBuildPC} disabled={saveStatus === 'saving'}
                  style={{ opacity: saveStatus === 'saving' ? 0.7 : 1, background: saveStatus === 'success' ? 'rgba(34,197,94,0.2)' : '' }}>
                  {saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'success' ? 'Đã lưu!' : 'Lưu cấu hình'}
                </button>
                <button className="bp-sa2-btn">
                  Chia sẻ
                </button>
              </div>

              {/* Guarantee note */}
              <div className="bp-guarantee">
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
            <button className="bp-modal-close" onClick={() => setShowSummaryModal(false)}>Đóng</button>
            <div className="bp-modal-header">
              <h2>Cấu hình hoàn chỉnh!</h2>
              <p>Tất cả linh kiện tương thích · Sẵn sàng đặt hàng</p>
            </div>

            <div className="bp-modal-items">
              {BUILD_STEPS.map(step => {
                const item = selected[step.id]
                if (!item) return null
                return (
                  <div key={step.id} className="bp-modal-item">
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
                Thêm toàn bộ vào giỏ hàng
              </button>
              <button className="bp-modal-checkout" onClick={handleCheckoutNow}>
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUGGEST MODAL ── */}
      {showSuggestModal && (
        <div className="bp-modal-overlay" onClick={() => { setShowSuggestModal(false); setSuggestResult(null) }}>
          <div className="bp-suggest-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="bp-suggest-modal-header">
              <div className="bp-suggest-modal-icon">✨</div>
              <div>
                <h2 className="bp-suggest-modal-title">Gợi ý cấu hình tự động</h2>
                <p className="bp-suggest-modal-sub">Hệ thống sẽ chọn linh kiện tối ưu theo ngân sách của bạn</p>
              </div>
              <button className="bp-modal-close" onClick={() => { setShowSuggestModal(false); setSuggestResult(null) }}>✕</button>
            </div>

            {/* Budget slider */}
            <div className="bp-suggest-section">
              <div className="bp-suggest-label">
                <span>💰 Ngân sách</span>
                <span className="bp-suggest-budget-val">{formatPrice(suggestBudget)}</span>
              </div>
              <input
                id="suggest-budget-slider"
                type="range"
                min={5000000}
                max={100000000}
                step={1000000}
                value={suggestBudget}
                onChange={e => setSuggestBudget(Number(e.target.value))}
                className="bp-budget-slider"
              />
              <div className="bp-slider-marks">
                <span>5tr</span><span>25tr</span><span>50tr</span><span>75tr</span><span>100tr</span>
              </div>
            </div>

            {/* Purpose pills */}
            <div className="bp-suggest-section">
              <div className="bp-suggest-label"><span>🎯 Mục đích sử dụng</span></div>
              <div className="bp-purpose-pills">
                {[
                  { id: 'gaming',      icon: '🎮', label: 'Gaming',      sub: 'FPS · AAA · Esports' },
                  { id: 'workstation', icon: '🖥️', label: 'Workstation', sub: '3D · Render · AI' },
                  { id: 'office',      icon: '📄', label: 'Văn phòng',   sub: 'Word · Excel · Web' },
                  { id: 'streaming',   icon: '📡', label: 'Streaming',   sub: 'OBS · Twitch · YT' },
                ].map(p => (
                  <button
                    key={p.id}
                    className={`bp-purpose-pill ${suggestPurpose === p.id ? 'active' : ''}`}
                    onClick={() => setSuggestPurpose(p.id)}
                  >
                    <span className="bp-pill-icon">{p.icon}</span>
                    <span className="bp-pill-label">{p.label}</span>
                    <span className="bp-pill-sub">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Run button */}
            {!suggestResult && (
              <button
                className="bp-suggest-run-btn"
                onClick={handleRunSuggest}
                disabled={suggestLoading}
              >
                {suggestLoading
                  ? <><span className="bp-spin">⟳</span> Đang phân tích...
                  </>
                  : '🔍 Gợi ý ngay'
                }
              </button>
            )}

            {/* Error */}
            {suggestError && (
              <div className="bp-suggest-error">{suggestError}</div>
            )}

            {/* Result preview */}
            {suggestResult && (
              <div className="bp-suggest-result">
                <div className="bp-suggest-result-header">
                  <span className="bp-suggest-result-badge">✅ Cấu hình đề xuất</span>
                  <span className="bp-suggest-result-total">{formatPrice(suggestResult.total)}</span>
                </div>

                <div className="bp-suggest-result-list">
                  {BUILD_STEPS.map(step => {
                    const item = suggestResult.build[step.id]
                    if (!item) return null
                    return (
                      <div key={step.id} className="bp-suggest-result-item">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="bp-suggest-item-img" onError={e => e.target.style.display='none'} />
                          : <div className="bp-suggest-item-img-ph">{step.label[0]}</div>
                        }
                        <div className="bp-suggest-item-info">
                          <div className="bp-suggest-item-cat">{step.label}</div>
                          <div className="bp-suggest-item-name">{item.name}</div>
                        </div>
                        <div className="bp-suggest-item-price">{formatPrice(item.price)}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="bp-suggest-result-actions">
                  <button
                    className="bp-suggest-rerun-btn"
                    onClick={() => { setSuggestResult(null); setSuggestError(null) }}
                  >
                    🔄 Thử lại
                  </button>
                  <button
                    className="bp-suggest-apply-btn"
                    onClick={handleApplySuggest}
                  >
                    ⚡ Áp dụng cấu hình này
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
