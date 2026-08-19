import React, { useState, useEffect, useCallback } from 'react'
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

// ─── Danh sách bước build (Nhóm Cố định = 1 vs Nhóm Tùy biến >= 1) ───────────
const BUILD_STEPS = [
  { id: 'cpu',        label: 'CPU',              required: true,  allowMultiple: false, desc: 'Bộ vi xử lý (Nhóm Cố định = 1)' },
  { id: 'mainboard',  label: 'Mainboard',        required: true,  allowMultiple: false, desc: 'Bo mạch chủ (Nhóm Cố định = 1)' },
  { id: 'ram',        label: 'RAM',              required: true,  allowMultiple: true,  desc: 'Bộ nhớ trong (2 hoặc 4 thanh)' },
  { id: 'gpu',        label: 'VGA / GPU',        required: true,  allowMultiple: true,  desc: 'Card đồ họa (Cắm 1-4 card)' },
  { id: 'storage',    label: 'Ổ cứng',           required: true,  allowMultiple: true,  desc: 'SSD M.2 / SATA (Chọn nhiều ổ)' },
  { id: 'psu',        label: 'PSU',              required: true,  allowMultiple: false, desc: 'Nguồn máy tính (Nhóm Cố định = 1)' },
  { id: 'cooling',    label: 'Tản nhiệt',        required: false, allowMultiple: false, desc: 'CPU Cooler / AIO (Nhóm Cố định = 1)' },
  { id: 'case',       label: 'Vỏ case',          required: true,  allowMultiple: false, desc: 'Thùng máy (Nhóm Cố định = 1)' },
  { id: 'monitor',    label: 'Màn hình',         required: false, allowMultiple: true,  desc: 'Màn hình LCD/OLED (Setup 1-3 màn)' },
  { id: 'peripheral', label: 'Bàn phím • Chuột', required: false, allowMultiple: false, desc: 'Phụ kiện ngoại vi (Nhóm Cố định = 1)' },
  { id: 'extra',      label: 'Phụ kiện khác',    required: false, allowMultiple: true,  desc: 'Quạt case, LED... (Chọn 1-9 cái)' },
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

// ─── Helper lấy URL ảnh sản phẩm ─────────────────────────────────────────
function getImg(product) {
  const firstImg = product.AnhSP?.[0]?.url || product.thumnail || ''
  if (!firstImg) return null
  return firstImg.startsWith('http') ? firstImg : `${API_URL}${firstImg}`
}

// ─── Normalize sản phẩm API → format BuildPC ──────────────────────────────
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
  const name = p.name || ''
  const nameLower = name.toLowerCase()

  // Tạo specs string từ attributes hoặc description
  const specParts = attrs.slice(0, 4).map(a => `${a.value}`).filter(Boolean)
  const specs = specParts.length > 0 ? specParts.join(' · ') : (p.description?.slice(0, 80) || name)

  // 1. Socket detection
  let socket = getAttr('socket') || getAttr('Socket')
  if (!socket) {
    if (nameLower.includes('am5') || nameLower.includes('ryzen 7000') || nameLower.includes('ryzen 9000') || nameLower.includes('b650') || nameLower.includes('x670') || nameLower.includes('x870') || nameLower.includes('b850')) socket = 'AM5'
    else if (nameLower.includes('am4') || nameLower.includes('ryzen 5000') || nameLower.includes('ryzen 3000') || nameLower.includes('b550') || nameLower.includes('x570') || nameLower.includes('b450')) socket = 'AM4'
    else if (nameLower.includes('lga1700') || nameLower.includes('lga 1700') || nameLower.includes('i9-1') || nameLower.includes('i7-1') || nameLower.includes('i5-1') || nameLower.includes('i3-1') || nameLower.includes('12th') || nameLower.includes('13th') || nameLower.includes('14th') || nameLower.includes('b760') || nameLower.includes('z790') || nameLower.includes('b660') || nameLower.includes('z690') || nameLower.includes('h610')) socket = 'LGA1700'
    else if (nameLower.includes('lga1200') || nameLower.includes('b560') || nameLower.includes('z490')) socket = 'LGA1200'
  }

  // 2. RAM type detection (DDR4 vs DDR5)
  let ramType = ''
  const ramTypeAttr = getAttr('ddr') || getAttr('memory type') || getAttr('ram type') || getAttr('loại ram')
  if (ramTypeAttr) ramType = ramTypeAttr.toUpperCase().includes('DDR5') ? 'DDR5' : 'DDR4'
  else if (nameLower.includes('ddr5')) ramType = 'DDR5'
  else if (nameLower.includes('ddr4')) ramType = 'DDR4'

  // 3. RAM Capacity
  let capacity = 16
  const capMatch = name.match(/(\d{1,3})\s*(gb|g)/i)
  if (capMatch) capacity = parseInt(capMatch[1])

  // 4. Form Factor (Mainboard & Case)
  const ffAttr = getAttr('form') || getAttr('kích thước')
  let formFactor = 'ATX'
  let formFactorArr = ['ATX', 'mATX', 'ITX']
  if (nameLower.includes('mini-itx') || nameLower.includes('itx')) {
    formFactor = 'ITX'
    formFactorArr = ['ITX']
  } else if (nameLower.includes('matx') || nameLower.includes('m-atx') || nameLower.includes('micro-atx')) {
    formFactor = 'mATX'
    formFactorArr = ['mATX', 'ITX']
  } else {
    formFactor = 'ATX'
    formFactorArr = ['ATX', 'mATX', 'ITX']
  }

  // 5. iGPU check (Intel/AMD F-series without integrated graphics)
  let hasIGPU = true
  if (stepId === 'cpu') {
    if (name.match(/\b\d{4,5}[kK]?[fF]\b/) || nameLower.includes('7500f') || nameLower.includes('f-series') || nameLower.includes('kf')) {
      hasIGPU = false
    }
  }

  // 6. TDP & Recommended Wattage
  let tdp = 65
  let wattage = 0
  let recommendedPsu = 550

  if (stepId === 'cpu') {
    if (nameLower.includes('i9') || nameLower.includes('ryzen 9')) tdp = 125
    else if (nameLower.includes('i7') || nameLower.includes('ryzen 7')) tdp = 105
    else if (nameLower.includes('i5') || nameLower.includes('ryzen 5')) tdp = 65
    else tdp = 65
  } else if (stepId === 'gpu') {
    if (nameLower.includes('4090')) { tdp = 450; recommendedPsu = 850 }
    else if (nameLower.includes('4080')) { tdp = 320; recommendedPsu = 750 }
    else if (nameLower.includes('4070 ti')) { tdp = 285; recommendedPsu = 750 }
    else if (nameLower.includes('4070')) { tdp = 200; recommendedPsu = 650 }
    else if (nameLower.includes('4060 ti')) { tdp = 160; recommendedPsu = 600 }
    else if (nameLower.includes('4060')) { tdp = 115; recommendedPsu = 550 }
    else if (nameLower.includes('7900 xtx')) { tdp = 355; recommendedPsu = 850 }
    else if (nameLower.includes('7900 xt')) { tdp = 315; recommendedPsu = 750 }
    else if (nameLower.includes('7800 xt')) { tdp = 263; recommendedPsu = 700 }
    else if (nameLower.includes('7700 xt')) { tdp = 245; recommendedPsu = 700 }
    else if (nameLower.includes('7600')) { tdp = 165; recommendedPsu = 550 }
    else { tdp = 150; recommendedPsu = 550 }
  } else if (stepId === 'psu') {
    const wMatch = name.match(/(\d{3,4})\s*w/i)
    if (wMatch) wattage = parseInt(wMatch[1])
    else wattage = 650
  }

  // 7. GPU Length & Case Clearance
  let gpuLength = 300
  if (nameLower.includes('strix') || nameLower.includes('suprim') || nameLower.includes('3 fan') || nameLower.includes('tuf')) gpuLength = 330
  else if (nameLower.includes('dual') || nameLower.includes('2 fan') || nameLower.includes('compact')) gpuLength = 240

  let maxGpuLength = 350
  if (nameLower.includes('mini') || nameLower.includes('itx')) maxGpuLength = 300

  // 8. Cooler spec
  let coolerType = nameLower.includes('aio') || nameLower.includes('liquid') || nameLower.includes('nước') ? 'AIO' : 'Air'
  let height = 155
  let radSize = '240mm'
  if (nameLower.includes('360')) radSize = '360mm'
  else if (nameLower.includes('240')) radSize = '240mm'
  else if (nameLower.includes('120')) radSize = '120mm'
  else if (nameLower.includes('280')) radSize = '280mm'

  let supportedSockets = ['LGA1700', 'AM5', 'AM4', 'LGA1200']

  // Brand
  const brand = p.brand_id?.name || (nameLower.includes('intel') ? 'Intel' : nameLower.includes('amd') ? 'AMD' : nameLower.includes('asus') ? 'ASUS' : nameLower.includes('msi') ? 'MSI' : nameLower.includes('gigabyte') ? 'GIGABYTE' : '')

  return {
    id:         p._id,
    _id:        p._id,
    variantId:  variant?._id || null,
    name:       p.name,
    price:      rawPrice,
    specs,
    image:      getImg(p),
    stock:      p.active !== false,
    brand,
    socket,
    ramType,
    capacity,
    formFactor,
    formFactorArr,
    hasIGPU,
    tdp,
    wattage,
    recommendedPsu,
    gpuLength,
    maxGpuLength,
    coolerType,
    height,
    radSize,
    supportedSockets,
  }
}

// ─── Compatibility Check Engine (13 Validation Rules) ─────────────────────
function checkCompatibility(selected) {
  const issues = []
  const warnings = []

  const cpu = selected.cpu
  const mb  = selected.mainboard
  const ram = selected.ram
  const gpu = selected.gpu
  const psu = selected.psu
  const cse = selected.case
  const clr = selected.cooling

  // 1. CPU ↔ Mainboard Socket
  if (cpu && mb && cpu.socket && mb.socket) {
    if (cpu.socket !== mb.socket) {
      issues.push(`CPU này không cắm vừa Mainboard này (Khác Socket: CPU ${cpu.socket} ≠ Mainboard ${mb.socket}).`)
    }
  }

  // 2. CPU ↔ Mainboard Chipset / Gen
  if (cpu && mb) {
    if (cpu.socket === 'LGA1700' && mb.name.includes('B660') && (cpu.name.includes('13') || cpu.name.includes('14'))) {
      warnings.push('Mainboard cần update BIOS hoặc kiểm tra hỗ trợ trước khi lắp CPU thế hệ 13/14.')
    }
  }

  // 3. Mainboard ↔ RAM Standard
  if (ram && mb && ram.ramType && mb.ramType) {
    if (ram.ramType !== mb.ramType) {
      issues.push(`Mainboard chỉ hỗ trợ RAM ${mb.ramType}, bạn đang chọn RAM ${ram.ramType}.`)
    }
  }

  // 4. Mainboard ↔ RAM Max Capacity (Tính tổng dung lượng theo số lượng RAM)
  if (ram && mb) {
    const ramQty = ram.quantity || 1
    const ramCap = (ram.capacity || 16) * ramQty
    const maxMbRam = mb.maxRam || 128
    if (ramCap > maxMbRam) {
      issues.push(`Tổng dung lượng RAM (${ramCap}GB từ ${ramQty} thanh) vượt quá giới hạn của Mainboard (${maxMbRam}GB).`)
    }
  }

  // 5. CPU (F-series / No iGPU) ↔ GPU requirement
  if (cpu && cpu.hasIGPU === false && !gpu) {
    warnings.push(`CPU ${cpu.name} không có GPU tích hợp (dòng F), bắt buộc phải chọn Card đồ họa rời để xuất hình.`)
  }

  // 6. CPU & Main ↔ VGA Bottleneck / PCIe
  if (mb && gpu) {
    if (mb.name.includes('B450') || mb.name.includes('H310') || mb.name.includes('PCIe 3.0')) {
      if (gpu.name.includes('4070') || gpu.name.includes('4080') || gpu.name.includes('4090')) {
        warnings.push('Mainboard PCIe cũ có thể làm giảm nhẹ hiệu năng Card đồ họa cao cấp này.')
      }
    }
  }

  // 7. VGA ↔ PSU Recommended Wattage
  if (gpu && psu && psu.wattage) {
    const recPsu = gpu.recommendedPsu || 550
    if (psu.wattage < recPsu) {
      issues.push(`Nguồn điện (${psu.wattage}W) không đủ công suất khuyến nghị cho Card màn hình này (Cần ≥ ${recPsu}W).`)
    }
  }

  // 8. Total System TDP ↔ PSU Wattage (Tính theo số lượng GPU)
  let totalTdp = 100 // 100W base overhead
  if (cpu) totalTdp += cpu.tdp || 65
  if (gpu) {
    const gpuQty = gpu.quantity || 1
    totalTdp += (gpu.tdp || 150) * gpuQty
  }
  const recommendedPsuWattage = Math.ceil((totalTdp + 100) / 50) * 50

  if (psu && psu.wattage) {
    if (psu.wattage < totalTdp) {
      issues.push(`Cần nâng cấp Nguồn. Tổng công suất tiêu thụ (${totalTdp}W) vượt quá công suất Nguồn (${psu.wattage}W).`)
    } else if (psu.wattage < recommendedPsuWattage) {
      warnings.push(`PSU (${psu.wattage}W) hơi sát mức tiêu thụ hệ thống. Khuyên dùng Nguồn ≥ ${recommendedPsuWattage}W.`)
    }
  }

  // 9. VGA ↔ Case GPU Length Clearance
  if (gpu && cse) {
    const gpuLen = gpu.gpuLength || 300
    const maxLen = cse.maxGpuLength || 350
    if (gpuLen > maxLen) {
      issues.push(`Card màn hình quá dài (${gpuLen}mm), không lắp vừa vỏ Case này (Tối đa ${maxLen}mm).`)
    }
  }

  // 10. Mainboard ↔ Case Form Factor
  if (mb && cse) {
    const caseFF = cse.formFactorArr || cse.formFactor || ['ATX', 'mATX', 'ITX']
    const mbFF   = mb.formFactor || 'ATX'
    const supportedArr = Array.isArray(caseFF) ? caseFF : [caseFF]

    if (mbFF === 'ATX' && !supportedArr.includes('ATX')) {
      issues.push(`Bo mạch chủ (${mbFF}) lớn hơn kích thước hỗ trợ của Vỏ Case.`)
    }
  }

  // 11. Cooler ↔ CPU Socket Support
  if (clr && cpu && cpu.socket) {
    const suppSockets = clr.supportedSockets || ['LGA1700', 'AM5', 'AM4', 'LGA1200']
    if (!suppSockets.includes(cpu.socket)) {
      issues.push(`Tản nhiệt không có gàm bắt ốc cho Socket CPU ${cpu.socket} này.`)
    }
  }

  // 12. Air Cooler ↔ Case Height Clearance
  if (clr && cse && clr.coolerType === 'Air') {
    const coolerH = clr.height || 155
    const caseMaxH = cse.maxCoolerHeight || 165
    if (coolerH > caseMaxH) {
      issues.push(`Tản nhiệt khí quá cao (${coolerH}mm), sẽ bị cấn nắp hông của Vỏ Case.`)
    }
  }

  // 13. AIO Radiator ↔ Case Support
  if (clr && cse && clr.coolerType === 'AIO') {
    const radSize = clr.radSize || '240mm'
    const suppRads = cse.supportedRadSizes || ['240mm', '360mm']
    if (!suppRads.includes(radSize)) {
      issues.push(`Vỏ Case không có vị trí lắp vừa Radiator tản nước ${radSize} này.`)
    }
  }

  return {
    compatible: issues.length === 0,
    issues,
    warnings,
    totalTdp,
    recommendedPsuWattage
  }
}

// ─── Format số tiền ───────────────────────────────────────────────────────
function formatPrice(price) {
  if (!price) return '0đ'
  return price.toLocaleString('vi-VN') + 'đ'
}

// ─── Tính tổng giá (nhân với số lượng linh kiện) ───────────────────────────
function calcTotal(selected) {
  return Object.values(selected).reduce((sum, item) => sum + (item ? (item.price || 0) * (item.quantity || 1) : 0), 0)
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
  const [autoFilterEnabled, setAutoFilterEnabled] = useState(true)
  const [compatibility, setCompatibility] = useState({ compatible: true, issues: [], warnings: [], totalTdp: 100, recommendedPsuWattage: 550 })
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [addedAnimation, setAddedAnimation]     = useState(null)

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

  // Fetch products khi đổi step (chỉ fetch nếu chưa có trong cache)
  useEffect(() => {
    const slug = STEP_TO_SLUG[activeStep]
    if (!slug) return  // dùng static fallback
    if (productsCache[activeStep]) return  // đã có cache, không fetch lại

    setLoading(true)
    setFetchError(null)

    fetch(`${API_URL}/api/buildpc/components?category=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          const normalized = data.data.map(p => normalizeProduct(p, activeStep))
          setProductsCache(prev => ({ ...prev, [activeStep]: normalized }))
        } else {
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
  // Nếu step có slug → lấy từ cache API; ngược lại dùng static fallback
  const rawProducts = STEP_TO_SLUG[activeStep]
    ? (productsCache[activeStep] || [])
    : (STATIC_FALLBACK[activeStep] || [])
  const brands      = BRAND_FILTERS[activeStep] || BRAND_FILTERS.default

  // Auto-filter tương thích thông minh
  let activeAutoFilterDescription = null
  let autoFilteredRaw = rawProducts

  if (autoFilterEnabled) {
    if (activeStep === 'mainboard' && selected.cpu?.socket) {
      autoFilteredRaw = rawProducts.filter(p => !p.socket || p.socket === selected.cpu.socket)
      activeAutoFilterDescription = `Đang tự động lọc Mainboard Socket ${selected.cpu.socket} phù hợp với ${selected.cpu.name}`
    } else if (activeStep === 'ram' && selected.mainboard?.ramType) {
      autoFilteredRaw = rawProducts.filter(p => !p.ramType || p.ramType === selected.mainboard.ramType)
      activeAutoFilterDescription = `Đang tự động lọc RAM ${selected.mainboard.ramType} tương thích với ${selected.mainboard.name}`
    } else if (activeStep === 'cooling' && selected.cpu?.socket) {
      autoFilteredRaw = rawProducts.filter(p => !p.supportedSockets || p.supportedSockets.includes(selected.cpu.socket))
      activeAutoFilterDescription = `Đang tự động lọc Tản nhiệt hỗ trợ Socket ${selected.cpu.socket}`
    } else if (activeStep === 'case' && selected.mainboard?.formFactor) {
      autoFilteredRaw = rawProducts.filter(p => !p.formFactorArr || p.formFactorArr.includes(selected.mainboard.formFactor))
      activeAutoFilterDescription = `Đang tự động lọc Vỏ Case vừa với Mainboard kích thước ${selected.mainboard.formFactor}`
    }
  }

  const filteredProducts = autoFilteredRaw
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
          const nextSel = {
            ...prevSel,
            [activeStep]: already ? null : { ...product, quantity: prevSel[activeStep]?.quantity || 1 }
          }
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

  const handleQuantityChange = useCallback((stepId, delta) => {
    setBuildConfigs(prevConfigs => {
      const nextConfigs = prevConfigs.map(cfg => {
        if (cfg.id === activeConfigId) {
          const prevSel = cfg.selected || {}
          const currentItem = prevSel[stepId]
          if (!currentItem) return cfg
          const newQty = Math.max(1, (currentItem.quantity || 1) + delta)
          const nextSel = {
            ...prevSel,
            [stepId]: { ...currentItem, quantity: newQty }
          }
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
              {/* Auto-filter Banner */}
              {activeAutoFilterDescription && (
                <div className="bp-autofilter-banner">
                  <div className="bp-autofilter-text">
                    <span style={{ fontSize: '14px' }}>⚡</span>
                    <span>{activeAutoFilterDescription}</span>
                  </div>
                  <button
                    className="bp-autofilter-toggle-btn"
                    onClick={() => setAutoFilterEnabled(!autoFilterEnabled)}
                  >
                    {autoFilterEnabled ? 'Tắt lọc tự động' : 'Bật lại bộ lọc'}
                  </button>
                </div>
              )}

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
                          Sản phẩm
                        </div>
                        {isSelected && <div className="bp-product-check-badge">Đã chọn</div>}
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
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }} onClick={e => e.stopPropagation()}>
                        <button
                          className={`bp-product-select-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(product)}
                        >
                          {isSelected ? 'Đã chọn' : 'Chọn'}
                        </button>

                        {isSelected && (
                          BUILD_STEPS.find(s => s.id === activeStep)?.allowMultiple ? (
                            <div className="bp-qty-stepper">
                              <button
                                className="bp-qty-btn"
                                onClick={() => handleQuantityChange(activeStep, -1)}
                                disabled={(selected[activeStep]?.quantity || 1) <= 1}
                              >-</button>
                              <span className="bp-qty-val">{selected[activeStep]?.quantity || 1}</span>
                              <button
                                className="bp-qty-btn"
                                onClick={() => handleQuantityChange(activeStep, 1)}
                              >+</button>
                            </div>
                          ) : (
                            <span className="bp-qty-fixed-tag">Số lượng = 1 (Cố định)</span>
                          )
                        )}
                      </div>
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

              {/* Estimated Wattage Card */}
              <div className="bp-wattage-card">
                <div className="bp-wattage-header">
                  <div className="bp-wattage-title">
                    <span>⚡ Công suất ước tính</span>
                  </div>
                  <div className="bp-wattage-value">~{compatibility.totalTdp || 100} W</div>
                </div>
                <div className="bp-wattage-rec">
                  Nguồn khuyên dùng: <strong>≥ {compatibility.recommendedPsuWattage || 550} W</strong>
                </div>
                {selected.psu ? (
                  selected.psu.wattage >= (compatibility.totalTdp || 100) ? (
                    <div className="bp-wattage-psu-status bp-wattage-psu-ok">
                      ✅ Nguồn {selected.psu.wattage}W Đạt yêu cầu hệ thống
                    </div>
                  ) : (
                    <div className="bp-wattage-psu-status bp-wattage-psu-warn">
                      ⚠️ Nguồn {selected.psu.wattage}W Không đủ cho ~{compatibility.totalTdp}W!
                    </div>
                  )
                ) : (
                  <div style={{ marginTop: '6px', fontSize: '10px', color: '#888' }}>
                    💡 Gợi ý chọn Nguồn phù hợp ở Bước 6 (PSU)
                  </div>
                )}
              </div>

              {/* Selected items */}
              <div className="bp-summary-items">
                {BUILD_STEPS.map(step => {
                  const item = selected[step.id]
                  if (!item) return null
                  const qty = item.quantity || 1
                  return (
                    <div key={step.id} className="bp-summary-item">
                      <div className="bp-summary-item-info">
                        <div className="bp-summary-item-cat">{step.label}</div>
                        <div className="bp-summary-item-name">{item.name}</div>
                        <div className="bp-summary-item-price">{formatPrice(item.price * qty)}</div>
                      </div>
                      
                      {step.allowMultiple ? (
                        <div className="bp-qty-stepper" style={{ marginRight: '6px' }}>
                          <button
                            className="bp-qty-btn"
                            onClick={() => handleQuantityChange(step.id, -1)}
                            disabled={qty <= 1}
                          >-</button>
                          <span className="bp-qty-val">{qty}</span>
                          <button
                            className="bp-qty-btn"
                            onClick={() => handleQuantityChange(step.id, 1)}
                          >+</button>
                        </div>
                      ) : (
                        <span className="bp-qty-fixed-tag" style={{ marginRight: '6px' }}>x1</span>
                      )}

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

              {/* Required checklist */}
              <div className="bp-checklist">
                {REQUIRED_STEPS.map(id => {
                  const step = BUILD_STEPS.find(s => s.id === id)
                  const done = !!selected[id]
                  return (
                    <div key={id} className={`bp-check-item ${done ? 'done' : ''}`}>
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
                const qty = item.quantity || 1
                return (
                  <div key={step.id} className="bp-modal-item">
                    <div className="bp-modal-item-info">
                      <div className="bp-modal-item-cat">{step.label} {qty > 1 ? `(x${qty})` : ''}</div>
                      <div className="bp-modal-item-name">{item.name}</div>
                    </div>
                    <div className="bp-modal-item-price">{formatPrice(item.price * qty)}</div>
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
    </DefaultLayout>
  )
}
