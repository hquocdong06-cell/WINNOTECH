import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import { useAuth } from '../hooks/useAuth'
import '../assets/styles/cpu.css' // Reuse the sidebar layout styles

const API_URL = 'http://localhost:3000'

// --- FILTER OPTIONS DATA MATCHING USER'S RAM IMAGE ---
const brandsData = [
  { label: 'Adata', value: 'adata' },
  { label: 'Apacer', value: 'apacer' },
  { label: 'Corsair', value: 'corsair' },
  { label: 'Crucial', value: 'crucial' },
  { label: 'G.skill', value: 'gskill' },
  { label: 'HP', value: 'hp' },
  { label: 'Kingmax', value: 'kingmax' },
  { label: 'Kingston', value: 'kingston' },
  { label: 'Patriot', value: 'patriot' },
  { label: 'SP', value: 'sp' },
  { label: 'TeamGroup', value: 'teamgroup' },
  { label: 'Lexar', value: 'lexar' },
  { label: 'GeIL', value: 'geil' },
  { label: 'Zadak', value: 'zadak' },
  { label: 'PNY', value: 'pny' }
]

const seriesData = [
  { label: 'Ballistix', value: 'ballistix' },
  { label: 'DELTA', value: 'delta' },
  { label: 'Dominator', value: 'dominator' },
  { label: 'ELITE', value: 'elite' },
  { label: 'Fury', value: 'fury' },
  { label: 'Trident Z', value: 'trident-z' },
  { label: 'Vengeance', value: 'vengeance' }
]

const useCaseData = [
  { label: 'Doanh nghiệp', value: 'doanh-nghiep' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Học sinh - Sinh viên', value: 'hoc-sinh-sinh-vien' },
  { label: 'Văn phòng', value: 'van-phong' },
  { label: 'Đồ họa - Kỹ thuật', value: 'do-hoa-ky-thuat' }
]

const ramTypesData = [
  { label: 'desktop', value: 'desktop' },
  { label: 'laptop', value: 'laptop' },
  { label: 'server', value: 'server' }
]

const ramCapacitiesData = [
  { label: '1 x 16GB', value: '1x16' },
  { label: '1 x 32GB', value: '1x32' },
  { label: '1 x 8GB', value: '1x8' },
  { label: '2 x 16GB', value: '2x16' },
  { label: '2 x 24GB', value: '2x24' },
  { label: '2 x 32GB', value: '2x32' },
  { label: '2 x 48GB', value: '2x48' },
  { label: '2 x 64GB', value: '2x64' },
  { label: '2 x 8GB', value: '2x8' },
  { label: '4 x 8GB', value: '4x8' }
]

const memoryGenData = [
  { label: 'DDR4', value: 'ddr4' },
  { label: 'DDR5', value: 'ddr5' }
]

const ramBusData = [
  { label: '2666MHz', value: '2666' },
  { label: '3200MHz', value: '3200' },
  { label: '3600MHz', value: '3600' },
  { label: '4800MHz', value: '4800' },
  { label: '5200MHz', value: '5200' },
  { label: '5600MHz', value: '5600' },
  { label: '6000MHz', value: '6000' },
  { label: '6400MHz', value: '6400' },
  { label: '6600 MHz', value: '6600' },
  { label: '7200MHz', value: '7200' },
  { label: '8000MHz', value: '8000' }
]

// --- REALISTIC FALLBACK MOCK DATA ---
const mockRamProducts = [
  {
    _id: 'mock-ram-1',
    name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz',
    short_desc: '32GB (2x16GB), DDR5, 6000MHz, RGB',
    description: 'RAM DDR5 cao cấp G.Skill Trident Z5 RGB 32GB tốc độ 6000MHz CL30.',
    brand_id: { slug: 'gskill', name: 'G.Skill' },
    slug: 'gskill-trident-z5-rgb-ddr5-32gb',
    Variants: [{ price: 3490000, sale_price: 3141000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Trident+Z5+RGB', is_main: true }]
  },
  {
    _id: 'mock-ram-2',
    name: 'Corsair Vengeance DDR5 32GB (2x16GB) 5600MHz',
    short_desc: '32GB (2x16GB), DDR5, 5600MHz, Black',
    description: 'RAM Corsair Vengeance DDR5 32GB (2x16GB) 5600MHz hiệu năng cao.',
    brand_id: { slug: 'corsair', name: 'Corsair' },
    slug: 'corsair-vengeance-ddr5-32gb',
    Variants: [{ price: 2890000, sale_price: 2745000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Corsair+Vengeance', is_main: true }]
  },
  {
    _id: 'mock-ram-3',
    name: 'Kingston FURY Beast DDR4 16GB (2x8GB) 3200MHz',
    short_desc: '16GB (2x8GB), DDR4, 3200MHz',
    description: 'RAM phổ thông chất lượng cao Kingston FURY Beast DDR4 16GB.',
    brand_id: { slug: 'kingston', name: 'Kingston' },
    slug: 'kingston-fury-beast-ddr4-16gb',
    Variants: [{ price: 1190000, sale_price: 1190000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Fury+Beast+DDR4', is_main: true }]
  },
  {
    _id: 'mock-ram-4',
    name: 'Adata XPG SPECTRIX D50 RGB DDR4 8GB 3200MHz',
    short_desc: '8GB (1x8GB), DDR4, 3200MHz, RGB',
    description: 'RAM chơi game Adata XPG SPECTRIX D50 RGB DDR4 8GB 3200MHz có tản nhiệt.',
    brand_id: { slug: 'adata', name: 'Adata' },
    slug: 'adata-xpg-spectrix-d50-rgb-ddr4-8gb',
    Variants: [{ price: 690000, sale_price: 690000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Adata+XPG+D50', is_main: true }]
  },
  {
    "_id": "mock-ram-5",
    "name": "Corsair Dominator Platinum RGB DDR5 64GB (2x32GB) 6000MHz",
    "short_desc": "64GB (2x32GB), DDR5, 6000MHz, RGB",
    "description": "RAM DDR5 cao cấp Corsair Dominator Platinum RGB 64GB tốc độ 6000MHz, CL30.",
    "brand_id": {
      "slug": "corsair",
      "name": "Corsair"
    },
    "slug": "corsair-dominator-platinum-rgb-ddr5-64gb",
    "Variants": [
      {
        "price": 7990000,
        "sale_price": 7590000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Dominator+64GB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-6",
    "name": "G.Skill Trident Z5 Neo RGB DDR5 32GB (2x16GB) 6000MHz AMD",
    "short_desc": "32GB (2x16GB), DDR5, 6000MHz, AMD EXPO",
    "description": "RAM DDR5 tối ưu cho AMD Ryzen 7000 Series, G.Skill Trident Z5 Neo 6000MHz EXPO.",
    "brand_id": {
      "slug": "gskill",
      "name": "G.Skill"
    },
    "slug": "gskill-trident-z5-neo-rgb-ddr5-32gb",
    "Variants": [
      {
        "price": 3990000,
        "sale_price": 3790000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Z5+Neo+AMD",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-7",
    "name": "Kingston FURY Beast DDR5 32GB (2x16GB) 5600MHz",
    "short_desc": "32GB (2x16GB), DDR5, 5600MHz, Intel XMP",
    "description": "RAM DDR5 Kingston FURY Beast 32GB 5600MHz với Intel XMP 3.0 tương thích tốt.",
    "brand_id": {
      "slug": "kingston",
      "name": "Kingston"
    },
    "slug": "kingston-fury-beast-ddr5-32gb-5600",
    "Variants": [
      {
        "price": 2790000,
        "sale_price": 2590000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Fury+Beast+DDR5",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-8",
    "name": "Corsair Vengeance RGB DDR5 32GB (2x16GB) 5600MHz",
    "short_desc": "32GB (2x16GB), DDR5, 5600MHz, RGB",
    "description": "RAM Corsair Vengeance RGB DDR5 32GB 5600MHz đèn RGB đẹp, hiệu năng ổn định.",
    "brand_id": {
      "slug": "corsair",
      "name": "Corsair"
    },
    "slug": "corsair-vengeance-rgb-ddr5-32gb-5600",
    "Variants": [
      {
        "price": 3290000,
        "sale_price": 3090000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Vengeance+RGB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-9",
    "name": "TeamGroup T-Force Delta RGB DDR5 32GB 6000MHz",
    "short_desc": "32GB (2x16GB), DDR5, 6000MHz, RGB",
    "description": "RAM DDR5 TeamGroup T-Force Delta RGB 32GB 6000MHz CL30 giá tốt.",
    "brand_id": {
      "slug": "teamgroup",
      "name": "TeamGroup"
    },
    "slug": "teamgroup-delta-rgb-ddr5-32gb-6000",
    "Variants": [
      {
        "price": 3490000,
        "sale_price": 3290000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=T-Force+Delta",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-10",
    "name": "G.Skill Ripjaws V DDR4 32GB (2x16GB) 3600MHz",
    "short_desc": "32GB (2x16GB), DDR4, 3600MHz, Red",
    "description": "RAM DDR4 G.Skill Ripjaws V 32GB 3600MHz màu đỏ tản nhiệt thấp profile.",
    "brand_id": {
      "slug": "gskill",
      "name": "G.Skill"
    },
    "slug": "gskill-ripjaws-v-ddr4-32gb-3600",
    "Variants": [
      {
        "price": 1990000,
        "sale_price": 1890000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ripjaws+V+32GB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-11",
    "name": "Corsair Vengeance LPX DDR4 16GB (2x8GB) 3200MHz",
    "short_desc": "16GB (2x8GB), DDR4, 3200MHz, Black",
    "description": "RAM Corsair Vengeance LPX DDR4 16GB 3200MHz classic tin cậy profile thấp.",
    "brand_id": {
      "slug": "corsair",
      "name": "Corsair"
    },
    "slug": "corsair-vengeance-lpx-ddr4-16gb-3200",
    "Variants": [
      {
        "price": 990000,
        "sale_price": 890000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Vengeance+LPX",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-12",
    "name": "Kingston FURY Renegade RGB DDR5 64GB (2x32GB) 6400MHz",
    "short_desc": "64GB (2x32GB), DDR5, 6400MHz, RGB",
    "description": "RAM DDR5 cao cấp Kingston FURY Renegade RGB 64GB 6400MHz CL32 XMP 3.0.",
    "brand_id": {
      "slug": "kingston",
      "name": "Kingston"
    },
    "slug": "kingston-fury-renegade-rgb-ddr5-64gb",
    "Variants": [
      {
        "price": 7490000,
        "sale_price": 7090000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Renegade+64GB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-13",
    "name": "Crucial Pro DDR5 32GB (2x16GB) 5600MHz",
    "short_desc": "32GB (2x16GB), DDR5, 5600MHz",
    "description": "RAM Crucial Pro DDR5 32GB 5600MHz giá tốt, ổn định cho mọi nhu cầu.",
    "brand_id": {
      "slug": "crucial",
      "name": "Crucial"
    },
    "slug": "crucial-pro-ddr5-32gb-5600",
    "Variants": [
      {
        "price": 2490000,
        "sale_price": 2290000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Crucial+Pro+32GB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-14",
    "name": "Adata XPG LANCER RGB DDR5 32GB (2x16GB) 6000MHz",
    "short_desc": "32GB (2x16GB), DDR5, 6000MHz, RGB",
    "description": "RAM Adata XPG LANCER RGB DDR5 32GB 6000MHz thiết kế đẹp hiệu năng cao.",
    "brand_id": {
      "slug": "adata",
      "name": "Adata"
    },
    "slug": "adata-xpg-lancer-rgb-ddr5-32gb",
    "Variants": [
      {
        "price": 3190000,
        "sale_price": 2990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=XPG+Lancer+RGB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-15",
    "name": "G.Skill Trident Z5 RGB DDR5 96GB (2x48GB) 6600MHz",
    "short_desc": "96GB (2x48GB), DDR5, 6600MHz, RGB",
    "description": "RAM DDR5 siêu dung lượng G.Skill Trident Z5 RGB 96GB 6600MHz cho workstation.",
    "brand_id": {
      "slug": "gskill",
      "name": "G.Skill"
    },
    "slug": "gskill-trident-z5-rgb-ddr5-96gb",
    "Variants": [
      {
        "price": 9990000,
        "sale_price": 9490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Z5+RGB+96GB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-16",
    "name": "Lexar ARES RGB DDR5 32GB (2x16GB) 6000MHz",
    "short_desc": "32GB (2x16GB), DDR5, 6000MHz, RGB",
    "description": "RAM Lexar ARES RGB DDR5 32GB mới tốc độ cao, thiết kế gaming hiện đại.",
    "brand_id": {
      "slug": "lexar",
      "name": "Lexar"
    },
    "slug": "lexar-ares-rgb-ddr5-32gb",
    "Variants": [
      {
        "price": 2890000,
        "sale_price": 2690000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Lexar+ARES",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-17",
    "name": "Patriot Viper Venom DDR5 32GB (2x16GB) 6200MHz",
    "short_desc": "32GB (2x16GB), DDR5, 6200MHz, RGB",
    "description": "RAM Patriot Viper Venom DDR5 32GB 6200MHz tốc độ cao, tản nhiệt vây ấn tượng.",
    "brand_id": {
      "slug": "patriot",
      "name": "Patriot"
    },
    "slug": "patriot-viper-venom-ddr5-32gb",
    "Variants": [
      {
        "price": 3390000,
        "sale_price": 3190000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Viper+Venom",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-18",
    "name": "Kingston FURY Beast RGB DDR4 32GB (2x16GB) 3600MHz",
    "short_desc": "32GB (2x16GB), DDR4, 3600MHz, RGB",
    "description": "RAM DDR4 Kingston FURY Beast RGB 32GB 3600MHz tản nhiệt RGB đẹp.",
    "brand_id": {
      "slug": "kingston",
      "name": "Kingston"
    },
    "slug": "kingston-fury-beast-rgb-ddr4-32gb",
    "Variants": [
      {
        "price": 2190000,
        "sale_price": 1990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Fury+Beast+RGB",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-ram-19",
    "name": "GeIL POLARIS RGB DDR5 32GB (2x16GB) 6000MHz",
    "short_desc": "32GB (2x16GB), DDR5, 6000MHz, RGB",
    "description": "RAM GeIL POLARIS RGB DDR5 32GB 6000MHz giá rẻ nhất phân khúc DDR5 gaming.",
    "brand_id": {
      "slug": "geil",
      "name": "GeIL"
    },
    "slug": "geil-polaris-rgb-ddr5-32gb",
    "Variants": [
      {
        "price": 2690000,
        "sale_price": 2490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=GeIL+POLARIS",
        "is_main": true
      }
    ]
  }
]
export default function RAM() {
  const dispatch = useDispatch()
  const { isLoggedIn } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  const handleQuickAddToCart = async (product) => {
    const variantsList = product.Variants || product.variants;
    const defaultVariant = variantsList?.find(v => v.variant_name === 'Mặc định') || variantsList?.[0];
    if (!defaultVariant) {
      toast.error('Sản phẩm chưa có biến thể sẵn sàng!', { position: 'bottom-right' })
      return
    }
    if (defaultVariant.stock_quantity !== undefined && defaultVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }

    const currentPrice = defaultVariant.sale_price > 0 ? defaultVariant.sale_price : defaultVariant.price
    const imgUrl = getProductImage(product)
    const cartPayload = {
      product_id: product._id,
      variant_id: defaultVariant._id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      image: imgUrl
    }

    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right' })
      return
    }

    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: defaultVariant._id, quantity: 1 })
      })
      const data = await res.json()

      if (res.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!', { position: 'bottom-right' })
        return
      }
      if (!data.success) {
        toast.error(data.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
        return
      }

      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' })
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!', { position: 'bottom-right' })
    }
  }

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    brands: [],
    series: [],
    useCase: [],
    ramType: [],
    capacity: [],
    memoryGen: [],
    bus: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    series: true,
    useCase: true,
    ramType: true,
    capacity: true,
    memoryGen: true,
    bus: true
  })

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    series: false,
    bus: false
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleExpand = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- FETCH PRODUCTS FROM BACKEND ---
  useEffect(() => {
    const fetchRAMProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/categories/ram`)
        const data = await res.json()
        if (data.success && data.data && data.data.products) {
          const apiProducts = data.data.products
          // Merge real products + mock products (loại trùng theo tên)
          const apiNames = apiProducts.map(p => p.name.toLowerCase())
          const uniqueMocks = mockRamProducts.filter(m => !apiNames.includes(m.name.toLowerCase()))
          setProducts([...apiProducts, ...uniqueMocks])
        } else {
          setProducts(mockRamProducts)
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm RAM, sử dụng dữ liệu mẫu:', err)
        setProducts(mockRamProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchRAMProducts()
  }, [])

  const handleFilterChange = (category, value, isChecked) => {
    if (isChecked) {
      setFilters(prev => ({
        ...prev,
        [category]: [...prev[category], value]
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category].filter(item => item !== value)
      }))
    }
    setCurrentPage(1)
  }

  const getProductImage = (product) => {
    if (product.AnhSP && product.AnhSP.length > 0) {
      const mainImg = product.AnhSP.find(img => img.is_main)
      const url = mainImg ? mainImg.url : product.AnhSP[0].url
      return url.startsWith('http') ? url : `${API_URL}${url}`
    }
    if (product.thumnail) {
      return product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
    }
    return 'https://placehold.co/600x400/1a1a2e/7c3aed?text=No+Image'
  }

  const getProductPrice = (product) => {
    if (product.Variants && product.Variants.length > 0) {
      return product.Variants[0].sale_price || product.Variants[0].price
    }
    return 0
  }

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'
  }

  // --- FILTER & SORT LOGIC ---
  const filteredProducts = products.filter(product => {
    const nameLower = product.name.toLowerCase()
    const descLower = (product.description || '').toLowerCase()
    const specsLower = (product.short_desc || '').toLowerCase()

    // 1. Thương hiệu (Brand)
    if (filters.brands.length > 0) {
      const brandSlug = product.brand_id?.slug || ''
      if (!filters.brands.includes(brandSlug.toLowerCase())) return false
    }

    // 2. Series
    if (filters.series.length > 0) {
      const match = filters.series.some(ser => {
        const query = ser.replace('-', ' ').toLowerCase()
        return nameLower.includes(query) || descLower.includes(query)
      })
      if (!match) return false
    }

    // 3. Nhu cầu
    if (filters.useCase.length > 0) {
      const match = filters.useCase.some(uc => {
        if (uc === 'gaming') return nameLower.includes('rgb') || nameLower.includes('gaming') || descLower.includes('gaming')
        if (uc === 'van-phong') return nameLower.includes('value') || descLower.includes('văn phòng') || descLower.includes('phổ thông')
        if (uc === 'hoc-sinh-sinh-vien') return descLower.includes('học tập') || descLower.includes('sinh viên')
        if (uc === 'do-hoa-ky-thuat') return nameLower.includes('64gb') || nameLower.includes('32gb') || descLower.includes('đồ họa') || descLower.includes('rendering')
        if (uc === 'doanh-nghiep') return nameLower.includes('ecc') || descLower.includes('doanh nghiệp') || descLower.includes('ecc')
        return false
      })
      if (!match) return false
    }

    // 4. Loại RAM
    if (filters.ramType.length > 0) {
      const match = filters.ramType.some(type => {
        if (type === 'laptop') return nameLower.includes('sodimm') || nameLower.includes('laptop') || specsLower.includes('sodimm')
        if (type === 'desktop') return !nameLower.includes('sodimm') && !nameLower.includes('laptop') && !nameLower.includes('ecc')
        if (type === 'server') return nameLower.includes('ecc') || descLower.includes('server') || specsLower.includes('ecc')
        return false
      })
      if (!match) return false
    }

    // 5. Dung lượng RAM
    if (filters.capacity.length > 0) {
      const match = filters.capacity.some(cap => {
        // cap value formats like "1x16", "2x8" etc.
        const pieces = cap.split('x') // ["2", "8"]
        const multiplier = pieces[0] // "2"
        const singleCap = pieces[1] // "8"
        const searchPattern1 = `${multiplier}x${singleCap}gb` // "2x8gb"
        const searchPattern2 = `${multiplier}x ${singleCap}gb` // "2x 8gb"
        const searchPattern3 = `${singleCap}gb` // "8gb"
        return specsLower.includes(searchPattern1) || 
               specsLower.includes(searchPattern2) || 
               (multiplier === '1' && (specsLower.includes(searchPattern3) || nameLower.includes(searchPattern3)))
      })
      if (!match) return false
    }

    // 6. Thế hệ bộ nhớ (DDR)
    if (filters.memoryGen.length > 0) {
      const match = filters.memoryGen.some(gen => {
        return specsLower.includes(gen.toLowerCase()) || nameLower.includes(gen.toLowerCase())
      })
      if (!match) return false
    }

    // 7. Bus RAM
    if (filters.bus.length > 0) {
      const match = filters.bus.some(b => {
        const pattern = `${b}mhz`
        return specsLower.includes(pattern) || nameLower.includes(pattern)
      })
      if (!match) return false
    }

    return true
  })

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getProductPrice(a)
    const priceB = getProductPrice(b)
    if (sortBy === 'price-asc') return priceA - priceB
    if (sortBy === 'price-desc') return priceB - priceA
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return 0
  })

  // Pagination
  const itemsPerPage = 9
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1
  const startIdx = (currentPage - 1) * itemsPerPage
  const visibleProducts = sortedProducts.slice(startIdx, startIdx + itemsPerPage)

  return (
    <DefaultLayout>
      <section className="cpu-section">
        <div className="cpu-section-inner">
          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span className="active">Sản phẩm</span>
            <span>/</span>
            <span className="active">RAM (BỘ NHỚ TRONG)</span>
          </div>

          {/* MAIN LAYOUT */}
          <div className="cpu-layout">
            {/* LEFT SIDEBAR - FILTERS */}
            <aside className="cpu-sidebar">
              {/* PRICE RANGE FILTER */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('priceRange')}>
                  Khoảng giá
                  <span className={`accordion-icon ${openFilters.priceRange ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.priceRange && (
                  <div className="price-range">
                    <div className="price-inputs" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <input type="text" value="0đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                      <input type="text" value="15.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
                    </div>
                    <div className="custom-slider-wrapper">
                      <div className="slider-track-line">
                        <span className="slider-dot active" style={{left: '0%'}}></span>
                        <span className="slider-dot active" style={{left: '100%'}}></span>
                        <div className="slider-active-line" style={{left: '0%', width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* THƯƠNG HIỆU */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('brands')}>
                  Thương hiệu
                  <span className={`accordion-icon ${openFilters.brands ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.brands && (
                  <div className="filter-options">
                    {(expandedFilters.brands ? brandsData : brandsData.slice(0, 10)).map(brand => (
                      <label key={brand.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.value)}
                          onChange={(e) => handleFilterChange('brands', brand.value, e.target.checked)}
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                    {brandsData.length > 10 && (
                      <button 
                        onClick={() => toggleExpand('brands')} 
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '4px 0 0 0',
                          textAlign: 'left',
                          marginTop: '4px',
                          display: 'block',
                          fontWeight: '500'
                        }}
                      >
                        {expandedFilters.brands ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SERIES */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('series')}>
                  Series
                  <span className={`accordion-icon ${openFilters.series ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.series && (
                  <div className="filter-options">
                    {(expandedFilters.series ? seriesData : seriesData.slice(0, 4)).map(ser => (
                      <label key={ser.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.series.includes(ser.value)}
                          onChange={(e) => handleFilterChange('series', ser.value, e.target.checked)}
                        />
                        <span>{ser.label}</span>
                      </label>
                    ))}
                    {seriesData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('series')} 
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '4px 0 0 0',
                          textAlign: 'left',
                          marginTop: '4px',
                          display: 'block',
                          fontWeight: '500'
                        }}
                      >
                        {expandedFilters.series ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* NHU CẦU */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('useCase')}>
                  Nhu cầu
                  <span className={`accordion-icon ${openFilters.useCase ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.useCase && (
                  <div className="filter-options">
                    {useCaseData.map(uc => (
                      <label key={uc.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.useCase.includes(uc.value)}
                          onChange={(e) => handleFilterChange('useCase', uc.value, e.target.checked)}
                        />
                        <span>{uc.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* LOẠI RAM */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('ramType')}>
                  Loại RAM
                  <span className={`accordion-icon ${openFilters.ramType ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.ramType && (
                  <div className="filter-options">
                    {ramTypesData.map(type => (
                      <label key={type.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.ramType.includes(type.value)}
                          onChange={(e) => handleFilterChange('ramType', type.value, e.target.checked)}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* DUNG LƯỢNG RAM */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('capacity')}>
                  Dung lượng RAM
                  <span className={`accordion-icon ${openFilters.capacity ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.capacity && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {ramCapacitiesData.map(cap => (
                      <label key={cap.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.capacity.includes(cap.value)}
                          onChange={(e) => handleFilterChange('capacity', cap.value, e.target.checked)}
                        />
                        <span>{cap.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* THẾ HỆ BỘ NHỚ (DDR) */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('memoryGen')}>
                  Thế hệ bộ nhớ (DDR)
                  <span className={`accordion-icon ${openFilters.memoryGen ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.memoryGen && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {memoryGenData.map(gen => (
                      <label key={gen.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.memoryGen.includes(gen.value)}
                          onChange={(e) => handleFilterChange('memoryGen', gen.value, e.target.checked)}
                        />
                        <span>{gen.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* BUS RAM */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('bus')}>
                  Bus RAM
                  <span className={`accordion-icon ${openFilters.bus ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.bus && (
                  <div className="filter-options">
                    {ramBusData.map(b => (
                      <label key={b.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.bus.includes(b.value)}
                          onChange={(e) => handleFilterChange('bus', b.value, e.target.checked)}
                        />
                        <span>{b.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER */}
              <div className="cpu-main-header">
                <h1>RAM (BỘ NHỚ TRONG)</h1>
                
                <div className="cpu-main-header-right">
                  <div className="cpu-sort">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="popular">Sắp xếp theo</option>
                      <option value="price-asc">Giá: Thấp đến Cao</option>
                      <option value="price-desc">Giá: Cao đến Thấp</option>
                      <option value="newest">Mới nhất</option>
                    </select>
                  </div>
                  
                  <div className="view-modes-group">
                    <button className={`btn-view-mode ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </button>
                    <button className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="8" y2="6" />
                        <line x1="12" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="8" y2="12" />
                        <line x1="12" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="8" y2="18" />
                        <line x1="12" y1="18" x2="21" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* PRODUCTS GRID */}
              {loading ? (
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Đang tải sản phẩm...</div>
              ) : visibleProducts.length === 0 ? (
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy RAM nào phù hợp với bộ lọc hiện tại.</div>
              ) : (
                <div className="cpu-grid">
                  {visibleProducts.map(product => {
                    const price = getProductPrice(product)
                    const image = getProductImage(product)
                    const variantsList = product.Variants || product.variants
                    const defaultVariant = variantsList?.find(v => v.variant_name === 'Mặc định') || variantsList?.[0]
                    const isOutOfStock = defaultVariant && defaultVariant.stock_quantity !== undefined ? defaultVariant.stock_quantity <= 0 : false

                    return (
                      <div key={product._id} className="cpu-card" style={isOutOfStock ? { opacity: 0.85 } : {}}>
                        {isOutOfStock ? (
                          <div className="cpu-card-sale-badge" style={{ background: '#ef4444' }}>Hết hàng</div>
                        ) : (
                          product.sale > 0 && <div className="cpu-card-sale-badge">-{product.sale}%</div>
                        )}
                        <div className="cpu-card-img">
                          <Link to={`/product/${product.slug}`}>
                            <img src={image} alt={product.name} />
                          </Link>
                        </div>
                        <div className="cpu-card-info">
                          <h3 className="cpu-card-name">
                            <Link to={`/product/${product.slug}`}>{product.name}</Link>
                          </h3>
                          <p className="cpu-card-specs">{product.short_desc || 'Sản phẩm công nghệ cao'}</p>
                          <div className="cpu-card-footer">
                            <div className="cpu-card-price-wrap"><span className="cpu-card-price">{formatPrice(price)}</span></div>
                            <div className="cpu-card-actions">
                              <button 
                                className="btn-add-cart" 
                                title={isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                                disabled={isOutOfStock}
                                onClick={(e) => { e.preventDefault(); handleQuickAddToCart(product); }}
                                style={isOutOfStock ? { background: '#222', cursor: 'not-allowed', borderColor: '#333', opacity: 0.5 } : {}}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
                                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                              </button>
                              <button className="btn-wishlist" title="Thêm vào yêu thích">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* FOOTER / PAGINATION AREA */}
              {totalPages > 1 && (
                <div className="cpu-footer-row">
                  <button className="btn-show-more" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>Show More</button>
                  <div className="cpu-pagination-right">
                    <span className="pagination-label">Products</span>
                    <button 
                      className="page-nav-btn" 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      className="page-nav-btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}
