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

// ─── Mock sản phẩm mẫu theo danh mục ─────────────────────────────────────
const MOCK_PRODUCTS = {
  cpu: [
    { id: 'cpu1', name: 'AMD Ryzen 9 7950X3D', price: 17990000, specs: '16 nhân · 32 luồng · 4.2–5.7GHz · 144MB Cache · 120W', socket: 'AM5', tdp: 120, brand: 'AMD', stock: true },
    { id: 'cpu2', name: 'AMD Ryzen 7 7800X3D', price: 12490000, specs: '8 nhân · 16 luồng · 4.2–5.0GHz · 96MB Cache · 120W',  socket: 'AM5', tdp: 120, brand: 'AMD', stock: true },
    { id: 'cpu3', name: 'AMD Ryzen 9 7900X',   price: 11990000, specs: '12 nhân · 24 luồng · 4.7–5.6GHz · 76MB Cache · 170W', socket: 'AM5', tdp: 170, brand: 'AMD', stock: true },
    { id: 'cpu4', name: 'AMD Ryzen 7 7700X',   price:  8290000, specs: '8 nhân · 16 luồng · 4.5–5.4GHz · 40MB Cache · 105W',  socket: 'AM5', tdp: 105, brand: 'AMD', stock: true },
    { id: 'cpu5', name: 'AMD Ryzen 5 7600X',   price:  6490000, specs: '6 nhân · 12 luồng · 4.7–5.3GHz · 38MB Cache · 105W',  socket: 'AM5', tdp: 105, brand: 'AMD', stock: true },
    { id: 'cpu6', name: 'Intel Core i9-14900K', price: 15990000, specs: '24 nhân · 32 luồng · 3.2–6.0GHz · 36MB Cache · 125W', socket: 'LGA1700', tdp: 125, brand: 'Intel', stock: true },
    { id: 'cpu7', name: 'Intel Core i7-14700K', price: 11490000, specs: '20 nhân · 28 luồng · 3.4–5.6GHz · 33MB Cache · 125W', socket: 'LGA1700', tdp: 125, brand: 'Intel', stock: true },
    { id: 'cpu8', name: 'Intel Core i5-14600K', price:  8490000, specs: '14 nhân · 20 luồng · 3.5–5.3GHz · 24MB Cache · 125W', socket: 'LGA1700', tdp: 125, brand: 'Intel', stock: true },
  ],
  mainboard: [
    { id: 'mb1', name: 'ASUS TUF GAMING B650-PLUS WIFI',  price:  5690000, specs: 'AM5 · DDR5 · PCIe 5.0 · 4x M.2 · WiFi 6', socket: 'AM5',     ramType: 'DDR5', formFactor: 'ATX',    stock: true },
    { id: 'mb2', name: 'MSI MAG B650 TOMAHAWK WIFI',       price:  5290000, specs: 'AM5 · DDR5 · PCIe 4.0 · 3x M.2 · WiFi 6', socket: 'AM5',     ramType: 'DDR5', formFactor: 'ATX',    stock: true },
    { id: 'mb3', name: 'GIGABYTE B650M DS3H',              price:  3490000, specs: 'AM5 · DDR5 · PCIe 4.0 · 2x M.2',           socket: 'AM5',     ramType: 'DDR5', formFactor: 'mATX',   stock: true },
    { id: 'mb4', name: 'ASUS ROG STRIX Z790-E GAMING',    price: 12990000, specs: 'LGA1700 · DDR5 · PCIe 5.0 · 5x M.2 · WiFi 6E', socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX', stock: true },
    { id: 'mb5', name: 'MSI PRO Z790-P WIFI',             price:  6990000, specs: 'LGA1700 · DDR5 · PCIe 4.0 · 3x M.2 · WiFi 6', socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX', stock: true },
    { id: 'mb6', name: 'ASUS PRIME B760M-A D4',           price:  3290000, specs: 'LGA1700 · DDR4 · PCIe 4.0 · 2x M.2',           socket: 'LGA1700', ramType: 'DDR4', formFactor: 'mATX', stock: true },
  ],
  ram: [
    { id: 'ram1', name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz', price: 4590000, specs: 'DDR5 · 6000MHz · CL36 · 32GB Kit', ramType: 'DDR5', capacity: 32, stock: true },
    { id: 'ram2', name: 'Kingston Fury Beast 32GB DDR5 5200MHz',              price: 3890000, specs: 'DDR5 · 5200MHz · CL40 · 32GB Kit', ramType: 'DDR5', capacity: 32, stock: true },
    { id: 'ram3', name: 'Corsair Vengeance RGB 32GB DDR5 6000MHz',            price: 4290000, specs: 'DDR5 · 6000MHz · CL36 · 32GB Kit', ramType: 'DDR5', capacity: 32, stock: true },
    { id: 'ram4', name: 'G.Skill Ripjaws V 32GB DDR4 3600MHz',               price: 2290000, specs: 'DDR4 · 3600MHz · CL16 · 32GB Kit', ramType: 'DDR4', capacity: 32, stock: true },
    { id: 'ram5', name: 'Corsair Vengeance LPX 16GB DDR4 3200MHz',           price: 1390000, specs: 'DDR4 · 3200MHz · CL16 · 16GB Kit', ramType: 'DDR4', capacity: 16, stock: true },
  ],
  gpu: [
    { id: 'gpu1', name: 'ASUS ROG Strix RTX 4070 Ti SUPER 16GB GDDR6X', price: 17490000, specs: '16GB GDDR6X · PCIe 4.0 · TDP 285W', tdp: 285, tier: 5, stock: true },
    { id: 'gpu2', name: 'MSI Gaming X Trio RTX 4070 SUPER 12GB',         price: 12990000, specs: '12GB GDDR6X · PCIe 4.0 · TDP 220W', tdp: 220, tier: 4, stock: true },
    { id: 'gpu3', name: 'Gigabyte RTX 4060 Ti Gaming OC 16GB',           price:  9490000, specs: '16GB GDDR6  · PCIe 4.0 · TDP 165W', tdp: 165, tier: 3, stock: true },
    { id: 'gpu4', name: 'ASUS Dual RTX 4060 OC 8GB',                     price:  6990000, specs: '8GB GDDR6   · PCIe 4.0 · TDP 115W', tdp: 115, tier: 2, stock: true },
    { id: 'gpu5', name: 'AMD Radeon RX 7900 XTX 24GB',                   price: 20990000, specs: '24GB GDDR6  · PCIe 4.0 · TDP 355W', tdp: 355, tier: 5, stock: true },
    { id: 'gpu6', name: 'AMD Radeon RX 7700 XT 12GB',                    price:  8490000, specs: '12GB GDDR6  · PCIe 4.0 · TDP 245W', tdp: 245, tier: 3, stock: true },
  ],
  storage: [
    { id: 'sto1', name: 'Samsung 990 PRO 1TB NVMe PCIe 4.0',        price: 2990000, specs: '1TB · M.2 2280 · PCIe 4.0 · Read 7450MB/s',  type: 'NVMe', stock: true },
    { id: 'sto2', name: 'WD Black SN850X 1TB NVMe PCIe 4.0',        price: 2790000, specs: '1TB · M.2 2280 · PCIe 4.0 · Read 7300MB/s',  type: 'NVMe', stock: true },
    { id: 'sto3', name: 'Seagate Barracuda 2TB HDD 7200RPM',         price: 1590000, specs: '2TB · 3.5" · SATA · 7200RPM · 256MB Cache',   type: 'HDD',  stock: true },
    { id: 'sto4', name: 'Kingston A400 480GB SATA SSD',              price:   890000, specs: '480GB · 2.5" · SATA · Read 500MB/s',         type: 'SATA', stock: true },
    { id: 'sto5', name: 'Samsung 990 PRO 2TB NVMe PCIe 4.0',        price: 5290000, specs: '2TB · M.2 2280 · PCIe 4.0 · Read 7450MB/s',  type: 'NVMe', stock: true },
  ],
  psu: [
    { id: 'psu1', name: 'Corsair RM850e 850W 80 Plus Gold',    price: 3590000, specs: '850W · 80 Plus Gold · Modular · ATX 3.0',    wattage: 850,  rating: 'Gold',     stock: true },
    { id: 'psu2', name: 'Seasonic Focus GX-750 750W Gold',     price: 3290000, specs: '750W · 80 Plus Gold · Fully Modular · ATX',   wattage: 750,  rating: 'Gold',     stock: true },
    { id: 'psu3', name: 'EVGA SuperNOVA 1000 G6 1000W Gold',  price: 5490000, specs: '1000W · 80 Plus Gold · Fully Modular',        wattage: 1000, rating: 'Gold',     stock: true },
    { id: 'psu4', name: 'be quiet! Straight Power 12 850W Platinum', price: 4990000, specs: '850W · 80 Plus Platinum · Modular', wattage: 850,  rating: 'Platinum',  stock: true },
    { id: 'psu5', name: 'Cooler Master MWE Bronze 650W',       price: 1590000, specs: '650W · 80 Plus Bronze · Semi-modular',        wattage: 650,  rating: 'Bronze',   stock: true },
  ],
  cooling: [
    { id: 'cool1', name: 'Noctua NH-D15 Chromax Black',         price: 3290000, specs: 'Dual Tower · Tương thích: AM5, LGA1700 · 300W TDP', type: 'Air',    tdp: 300, stock: true },
    { id: 'cool2', name: 'Corsair iCUE H150i ELITE 360mm AIO', price: 5990000, specs: '360mm AIO · Tương thích: AM5, LGA1700 · RGB',       type: 'Liquid', tdp: 350, stock: true },
    { id: 'cool3', name: 'Deepcool AK620 Dual Tower',           price: 1490000, specs: 'Dual Tower · 260W TDP · Tương thích: AM5, LGA1700', type: 'Air',    tdp: 260, stock: true },
    { id: 'cool4', name: 'NZXT Kraken 240mm AIO',               price: 3990000, specs: '240mm AIO · LCD Display · Tương thích: AM5, LGA1700', type: 'Liquid', tdp: 300, stock: true },
  ],
  case: [
    { id: 'case1', name: 'Lian Li PC-O11 Dynamic EVO',  price: 3290000, specs: 'Mid Tower · E-ATX/ATX/mATX · Kính cường lực · RGB', formFactor: ['ATX','mATX','E-ATX'], stock: true },
    { id: 'case2', name: 'NZXT H510 Flow',              price: 1890000, specs: 'Mid Tower · ATX/mATX/Mini-ITX · Mesh front',        formFactor: ['ATX','mATX','ITX'],   stock: true },
    { id: 'case3', name: 'Fractal Design Meshify C',    price: 2490000, specs: 'Mid Tower · ATX/mATX · Mesh · High airflow',        formFactor: ['ATX','mATX'],         stock: true },
    { id: 'case4', name: 'Cooler Master Q300L V2',      price:   890000, specs: 'mATX Tower · mATX/Mini-ITX · Compact',            formFactor: ['mATX','ITX'],         stock: true },
    { id: 'case5', name: 'Phanteks Eclipse G360',       price: 1590000, specs: 'Mid Tower · ATX/mATX · DRGB · 3 quạt trước',      formFactor: ['ATX','mATX'],         stock: true },
  ],
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
  if (cpu && mb) {
    if (cpu.socket !== mb.socket) {
      issues.push(`❌ Socket không khớp: CPU ${cpu.socket} ≠ Mainboard ${mb.socket}`)
    }
  }

  // 2. RAM Type ↔ Mainboard
  if (ram && mb) {
    if (ram.ramType !== mb.ramType) {
      issues.push(`❌ RAM type không khớp: RAM ${ram.ramType} ≠ Mainboard hỗ trợ ${mb.ramType}`)
    }
  }

  // 3. Form Factor Case ↔ Mainboard
  if (cse && mb) {
    if (!cse.formFactor.includes(mb.formFactor)) {
      issues.push(`❌ Form factor không khớp: Case hỗ trợ ${cse.formFactor.join('/')} nhưng Mainboard là ${mb.formFactor}`)
    }
  }

  // 4. PSU Wattage vs Total TDP
  if (psu) {
    let totalTdp = 50 // baseline system
    if (cpu) totalTdp += cpu.tdp || 0
    if (gpu) totalTdp += gpu.tdp || 0
    const recommended = Math.ceil((totalTdp * 1.25) / 50) * 50

    if (psu.wattage < totalTdp) {
      issues.push(`❌ PSU ${psu.wattage}W không đủ cho hệ thống cần ~${totalTdp}W tổng TDP`)
    } else if (psu.wattage < recommended) {
      warnings.push(`⚠️ PSU ${psu.wattage}W hơi sát công suất. Khuyên dùng ≥${recommended}W`)
    }
  }

  // 5. Bottleneck CPU ↔ GPU
  if (cpu && gpu) {
    const cpuTier = cpu.id === 'cpu1' ? 5 : cpu.id === 'cpu2' || cpu.id === 'cpu6' ? 4 : cpu.id === 'cpu3' || cpu.id === 'cpu7' ? 3 : cpu.id === 'cpu4' || cpu.id === 'cpu8' ? 2 : 1
    const gpuTier = gpu.tier || 3
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
  const rawProducts = MOCK_PRODUCTS[activeStep] || []
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
                        : <span>{idx + 1}</span>
                      }
                    </div>
                    <div className="bp-step-info">
                      <div className="bp-step-name">
                        <StepIcon id={step.id} style={{ marginRight: '6px' }} />
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
                {filteredProducts.map(product => {
                  const isSelected = selected[activeStep]?.id === product.id
                  const isAnimating = addedAnimation === product.id
                  return (
                    <div
                      key={product.id}
                      className={`bp-product-card ${isSelected ? 'bp-product-selected' : ''} ${isAnimating ? 'bp-product-added' : ''}`}
                      onClick={() => handleSelect(product)}
                    >
                      <div className="bp-product-img">
                        <div className="bp-product-img-placeholder">
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
                {filteredProducts.length === 0 && (
                  <div className="bp-empty">Không có sản phẩm phù hợp</div>
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
