import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import useFavorite from '../hooks/useFavorite'
import { useAuth } from '../hooks/useAuth'
import '../assets/styles/cpu.css'

const API_URL = 'http://localhost:3000'

// --- FILTER OPTION DATA MATCHING USER'S IMAGE ---
const brandsData = [
  { label: 'AMD', value: 'amd' },
  { label: 'Intel', value: 'intel' }
]

const useCaseData = [
  { label: 'Doanh nghiệp', value: 'doanh-nghiep' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Học sinh - Sinh viên', value: 'hoc-sinh-sinh-vien' },
  { label: 'Văn phòng', value: 'van-phong' },
  { label: 'Đồ họa - Kỹ thuật', value: 'do-hoa-ky-thuat' }
]

const seriesData = [
  { label: 'Core i3', value: 'core-i3' },
  { label: 'Core i5', value: 'core-i5' },
  { label: 'Core i7', value: 'core-i7' },
  { label: 'Core i9', value: 'core-i9' },
  { label: 'Pentium', value: 'pentium' },
  { label: 'Ryzen 3', value: 'ryzen-3' },
  { label: 'Ryzen 5', value: 'ryzen-5' },
  { label: 'Ryzen 7', value: 'ryzen-7' },
  { label: 'Ryzen 9', value: 'ryzen-9' },
  { label: 'Ryzen Threadripper', value: 'ryzen-threadripper' },
  { label: 'Ultra 5', value: 'ultra-5' },
  { label: 'Ultra 7', value: 'ultra-7' },
  { label: 'Ultra 9', value: 'ultra-9' }
]

const generationData = [
  { label: 'AMD Ryzen 5000 Series', value: 'amd-ryzen-5000' },
  { label: 'AMD Ryzen thế hệ thứ 1', value: 'amd-ryzen-1' },
  { label: 'AMD Ryzen thế hệ thứ 2', value: 'amd-ryzen-2' },
  { label: 'AMD Ryzen thế hệ thứ 3', value: 'amd-ryzen-3' },
  { label: 'AMD Ryzen thế hệ thứ 4', value: 'amd-ryzen-4' },
  { label: 'AMD Ryzen thế hệ thứ 5', value: 'amd-ryzen-5' },
  { label: 'AMD Ryzen thế hệ thứ 7', value: 'amd-ryzen-7' },
  { label: 'AMD Ryzen thế hệ thứ 8', value: 'amd-ryzen-8' },
  { label: 'AMD Ryzen thế hệ thứ 9', value: 'amd-ryzen-9' },
  { label: 'AMD Threadripper', value: 'amd-threadripper' },
  { label: 'Intel Core Ultra series 2', value: 'intel-ultra-2' },
  { label: 'Intel Core thế hệ thứ 10', value: 'intel-core-10' },
  { label: 'Intel Core thế hệ thứ 11', value: 'intel-core-11' },
  { label: 'Intel Core thế hệ thứ 12', value: 'intel-core-12' },
  { label: 'Intel Core thế hệ thứ 13', value: 'intel-core-13' },
  { label: 'Intel Core thế hệ thứ 14', value: 'intel-core-14' },
  { label: 'Intel Pentium G', value: 'intel-pentium-g' },
  { label: 'Intel Pentium Gold', value: 'intel-pentium-gold' },
  { label: 'Ryzen Threadripper PRO 9000 WX', value: 'ryzen-threadripper-9000' }
]

const coresData = [
  { label: '10', value: '10' },
  { label: '12', value: '12' },
  { label: '14', value: '14' },
  { label: '16', value: '16' },
  { label: '18', value: '18' },
  { label: '2', value: '2' },
  { label: '20', value: '20' },
  { label: '24', value: '24' },
  { label: '32', value: '32' },
  { label: '4', value: '4' },
  { label: '6', value: '6' },
  { label: '64', value: '64' },
  { label: '8', value: '8' },
  { label: '96', value: '96' }
]

const socketData = [
  { label: '1200', value: '1200' },
  { label: '1700', value: '1700' },
  { label: '1851', value: '1851' },
  { label: 'AM4', value: 'am4' },
  { label: 'AM5', value: 'am5' },
  { label: 'FCLGA1700', value: 'fclga1700' },
  { label: 'TR4', value: 'tr4' },
  { label: 'sTR5', value: 'str5' },
  { label: 'sWRX8', value: 'swrx8' }
]

// --- REALISTIC FALLBACK MOCK DATA ---
const mockCpuProducts = [
  {
    _id: 'mock-1',
    name: 'Intel Core i9-14900K',
    short_desc: '24C/32T, 6.0GHz, LGA1700, 14th Gen',
    description: 'CPU cao cấp phục vụ gaming và đồ họa chuyên nghiệp, thế hệ 14.',
    brand_id: { slug: 'intel', name: 'Intel' },
    slug: 'intel-core-i9-14900k',
    Variants: [{ price: 18490000, sale_price: 18490000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=i9-14900K', is_main: true }]
  },
  {
    _id: 'mock-2',
    name: 'Intel Core i7-14700K',
    short_desc: '20C/28T, 5.6GHz, LGA1700, 14th Gen',
    description: 'CPU Intel thế hệ 14 với 20 nhân (8P + 12E), 28 luồng. Hiệu năng đa nhiệm mạnh mẽ.',
    brand_id: { slug: 'intel', name: 'Intel' },
    slug: 'intel-core-i7-14700k',
    Variants: [{ price: 9490000, sale_price: 8541000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=i7-14700K', is_main: true }]
  },
  {
    _id: 'mock-3',
    name: 'AMD Ryzen 7 7800X3D',
    short_desc: '8C/16T, 5.0GHz, AM5, 3D V-Cache',
    description: 'CPU Gaming tốt nhất với V-Cache 3D, 8 nhân 16 luồng, xung nhịp lên tới 5.0GHz.',
    brand_id: { slug: 'amd', name: 'AMD' },
    slug: 'amd-ryzen-7-7800x3d',
    Variants: [{ price: 8990000, sale_price: 7641500 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Ryzen+7800X3D', is_main: true }]
  },
  {
    _id: 'mock-4',
    name: 'Intel Core i5-14600K',
    short_desc: '14C/20T, 5.3GHz, LGA1700, 14th Gen',
    description: 'CPU phân khúc tầm trung cận cao cấp tốt nhất cho cả gaming và công việc.',
    brand_id: { slug: 'intel', name: 'Intel' },
    slug: 'intel-core-i5-14600k',
    Variants: [{ price: 8490000, sale_price: 8490000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=i5-14600K', is_main: true }]
  },
  {
    _id: 'mock-5',
    name: 'AMD Ryzen 9 7950X',
    short_desc: '16C/32T, 5.7GHz, AM5, 7000 Series',
    description: 'CPU cao cấp AMD Ryzen 9 7950X kiến trúc Zen 4 cho đồ họa chuyên nghiệp.',
    brand_id: { slug: 'amd', name: 'AMD' },
    slug: 'amd-ryzen-9-7950x',
    Variants: [{ price: 16990000, sale_price: 16990000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Ryzen+7950X', is_main: true }]
  },
  {
    _id: 'mock-6',
    name: 'Intel Core i3-14100F',
    short_desc: '4C/8T, 4.7GHz, LGA1700, 14th Gen',
    description: 'CPU phổ thông giá rẻ cho học sinh sinh viên làm việc văn phòng.',
    brand_id: { slug: 'intel', name: 'Intel' },
    slug: 'intel-core-i3-14100f',
    Variants: [{ price: 2990000, sale_price: 2990000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=i3-14100F', is_main: true }]
  },
  {
    "_id": "mock-cpu-7",
    "name": "Intel Core i9-13900KS",
    "short_desc": "24C/32T, 6.0GHz, LGA1700, 13th Gen",
    "description": "CPU Intel đỉnh cao thế hệ 13, tốc độ boost 6.0GHz, 24 nhân 32 luồng.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-i9-13900ks",
    "Variants": [
      {
        "price": 21490000,
        "sale_price": 19890000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=i9-13900KS",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-8",
    "name": "AMD Ryzen 9 9950X",
    "short_desc": "16C/32T, 5.7GHz, AM5, Zen 5",
    "description": "CPU AMD Ryzen 9 9950X thế hệ mới nhất kiến trúc Zen 5, hiệu năng cực đỉnh.",
    "brand_id": {
      "slug": "amd",
      "name": "AMD"
    },
    "slug": "amd-ryzen-9-9950x",
    "Variants": [
      {
        "price": 22990000,
        "sale_price": 21490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ryzen+9950X",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-9",
    "name": "Intel Core Ultra 9 285K",
    "short_desc": "24C/24T, 5.7GHz, LGA1851, Arrow Lake",
    "description": "CPU Intel Core Ultra 9 285K thế hệ Arrow Lake, 24 nhân hiệu năng cao.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-ultra-9-285k",
    "Variants": [
      {
        "price": 18990000,
        "sale_price": 18990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ultra+9+285K",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-10",
    "name": "AMD Ryzen 5 7600X",
    "short_desc": "6C/12T, 5.3GHz, AM5, Zen 4",
    "description": "CPU tầm trung AMD Ryzen 5 7600X với kiến trúc Zen 4, hiệu suất gaming xuất sắc.",
    "brand_id": {
      "slug": "amd",
      "name": "AMD"
    },
    "slug": "amd-ryzen-5-7600x",
    "Variants": [
      {
        "price": 5990000,
        "sale_price": 5390000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ryzen+5+7600X",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-11",
    "name": "Intel Core i5-13600K",
    "short_desc": "14C/20T, 5.1GHz, LGA1700, 13th Gen",
    "description": "CPU Intel Core i5-13600K thế hệ 13 với 14 nhân 20 luồng, hiệu năng gaming tốt.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-i5-13600k",
    "Variants": [
      {
        "price": 7290000,
        "sale_price": 6990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=i5-13600K",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-12",
    "name": "AMD Ryzen 7 9700X",
    "short_desc": "8C/16T, 5.5GHz, AM5, Zen 5",
    "description": "CPU AMD Ryzen 7 9700X Zen 5, tối ưu gaming với xung nhịp boost 5.5GHz.",
    "brand_id": {
      "slug": "amd",
      "name": "AMD"
    },
    "slug": "amd-ryzen-7-9700x",
    "Variants": [
      {
        "price": 9990000,
        "sale_price": 9490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ryzen+7+9700X",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-13",
    "name": "Intel Core i7-13700K",
    "short_desc": "16C/24T, 5.4GHz, LGA1700, 13th Gen",
    "description": "Intel Core i7-13700K với 16 nhân 24 luồng, hiệu năng đa nhiệm xuất sắc.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-i7-13700k",
    "Variants": [
      {
        "price": 10490000,
        "sale_price": 9890000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=i7-13700K",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-14",
    "name": "AMD Ryzen 5 5600X",
    "short_desc": "6C/12T, 4.6GHz, AM4, Zen 3",
    "description": "CPU gaming tầm trung AMD Ryzen 5 5600X với kiến trúc Zen 3 ổn định lâu dài.",
    "brand_id": {
      "slug": "amd",
      "name": "AMD"
    },
    "slug": "amd-ryzen-5-5600x",
    "Variants": [
      {
        "price": 3490000,
        "sale_price": 3190000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ryzen+5+5600X",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-15",
    "name": "Intel Core Ultra 7 265K",
    "short_desc": "20C/20T, 5.5GHz, LGA1851, Arrow Lake",
    "description": "Intel Core Ultra 7 265K Arrow Lake, 20 nhân hiệu suất cao cho gaming và đồ họa.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-ultra-7-265k",
    "Variants": [
      {
        "price": 12990000,
        "sale_price": 12490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ultra+7+265K",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-16",
    "name": "AMD Ryzen 9 7950X3D",
    "short_desc": "16C/32T, 5.7GHz, AM5, 3D V-Cache",
    "description": "CPU đỉnh cao AMD với 3D V-Cache, 16 nhân 32 luồng, gaming và render cực mạnh.",
    "brand_id": {
      "slug": "amd",
      "name": "AMD"
    },
    "slug": "amd-ryzen-9-7950x3d",
    "Variants": [
      {
        "price": 24990000,
        "sale_price": 22990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ryzen+7950X3D",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-17",
    "name": "Intel Core i5-14400F",
    "short_desc": "10C/16T, 4.7GHz, LGA1700, 14th Gen",
    "description": "CPU phổ thông Intel Core i5-14400F tốt nhất cho tầm giá 4-5 triệu.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-i5-14400f",
    "Variants": [
      {
        "price": 5290000,
        "sale_price": 4990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=i5-14400F",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-18",
    "name": "AMD Ryzen 5 7600",
    "short_desc": "6C/12T, 5.1GHz, AM5, Zen 4",
    "description": "CPU AMD Ryzen 5 7600 không khóa xung, hiệu quả cao cho nhu cầu gaming cơ bản.",
    "brand_id": {
      "slug": "amd",
      "name": "AMD"
    },
    "slug": "amd-ryzen-5-7600",
    "Variants": [
      {
        "price": 4990000,
        "sale_price": 4690000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Ryzen+5+7600",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-19",
    "name": "Intel Core i3-12100F",
    "short_desc": "4C/8T, 4.3GHz, LGA1700, 12th Gen",
    "description": "CPU Intel giá rẻ thế hệ 12 cho PC văn phòng, học tập tiết kiệm ngân sách.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-i3-12100f",
    "Variants": [
      {
        "price": 1990000,
        "sale_price": 1890000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=i3-12100F",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-20",
    "name": "AMD Ryzen Threadripper PRO 7985WX",
    "short_desc": "64C/128T, 5.1GHz, sTR5, Workstation",
    "description": "CPU workstation siêu cao cấp AMD Threadripper PRO 7985WX với 64 nhân 128 luồng.",
    "brand_id": {
      "slug": "amd",
      "name": "AMD"
    },
    "slug": "amd-threadripper-pro-7985wx",
    "Variants": [
      {
        "price": 189000000,
        "sale_price": 185000000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=Threadripper+7985WX",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-cpu-21",
    "name": "Intel Core i9-12900K",
    "short_desc": "16C/24T, 5.2GHz, LGA1700, 12th Gen",
    "description": "CPU Intel Core i9-12900K thế hệ 12 với kiến trúc hybrid P-core + E-core mạnh mẽ.",
    "brand_id": {
      "slug": "intel",
      "name": "Intel"
    },
    "slug": "intel-core-i9-12900k",
    "Variants": [
      {
        "price": 9990000,
        "sale_price": 9490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=i9-12900K",
        "is_main": true
      }
    ]
  }
]
export default function CPU() {
  const dispatch = useDispatch()
  const { favoriteIds, toggleFavorite } = useFavorite()
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
    useCase: [],
    series: [],
    generation: [],
    cores: [],
    socket: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    useCase: true,
    series: true,
    generation: true,
    cores: true,
    socket: true
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    useCase: false,
    series: false,
    generation: false,
    cores: false,
    socket: false
  })

  const toggleExpand = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- FETCH PRODUCTS FROM BACKEND ---
  useEffect(() => {
    const fetchCPUProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/categories/cpu`)
        const data = await res.json()
        if (data.success && data.data && data.data.products) {
          const apiProducts = data.data.products
          // Merge real products + mock products (loại trùng theo tên)
          const apiNames = apiProducts.map(p => p.name.toLowerCase())
          const uniqueMocks = mockCpuProducts.filter(m => !apiNames.includes(m.name.toLowerCase()))
          setProducts([...apiProducts, ...uniqueMocks])
        } else {
          setProducts(mockCpuProducts)
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm CPU, sử dụng dữ liệu mẫu:', err)
        setProducts(mockCpuProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchCPUProducts()
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


    // 3. Nhu cầu (Use Case)
    if (filters.useCase.length > 0) {
      const match = filters.useCase.some(uc => {
        if (uc === 'gaming') return nameLower.includes('gaming') || descLower.includes('chơi game') || descLower.includes('gaming')
        if (uc === 'van-phong') return nameLower.includes('office') || descLower.includes('văn phòng')
        if (uc === 'hoc-sinh-sinh-vien') return descLower.includes('học sinh') || descLower.includes('sinh viên') || descLower.includes('học tập')
        if (uc === 'do-hoa-ky-thuat') return descLower.includes('đồ họa') || descLower.includes('kỹ thuật') || descLower.includes('render') || descLower.includes('3d')
        if (uc === 'doanh-nghiep') return descLower.includes('doanh nghiệp') || descLower.includes('server') || descLower.includes('máy chủ')
        return false
      })
      if (!match) return false
    }

    // 4. Series CPU
    if (filters.series.length > 0) {
      const match = filters.series.some(s => {
        const query = s.replace('-', ' ') // e.g. "core i3" or "ryzen 3"
        return nameLower.includes(query) || descLower.includes(query)
      })
      if (!match) return false
    }

    // 5. Thế hệ (Generation)
    if (filters.generation.length > 0) {
      const match = filters.generation.some(gen => {
        if (gen === 'intel-core-14') return nameLower.includes('14900') || nameLower.includes('14700') || nameLower.includes('14600') || nameLower.includes('14500') || nameLower.includes('14400') || nameLower.includes('14100') || nameLower.includes('14th') || descLower.includes('thế hệ 14')
        if (gen === 'intel-core-13') return nameLower.includes('13900') || nameLower.includes('13700') || nameLower.includes('13600') || nameLower.includes('13500') || nameLower.includes('13400') || nameLower.includes('13th') || descLower.includes('thế hệ 13')
        if (gen === 'intel-core-12') return nameLower.includes('12900') || nameLower.includes('12700') || nameLower.includes('12600') || nameLower.includes('12500') || nameLower.includes('12400') || nameLower.includes('12th') || descLower.includes('thế hệ 12')
        if (gen === 'intel-core-11') return nameLower.includes('11900') || nameLower.includes('11700') || nameLower.includes('11600') || nameLower.includes('11400') || nameLower.includes('11th') || descLower.includes('thế hệ 11')
        if (gen === 'intel-core-10') return nameLower.includes('10900') || nameLower.includes('10700') || nameLower.includes('10600') || nameLower.includes('10400') || nameLower.includes('10th') || descLower.includes('thế hệ 10')
        if (gen === 'amd-ryzen-5000') return nameLower.includes('5600') || nameLower.includes('5700') || nameLower.includes('5800') || nameLower.includes('5900') || nameLower.includes('5000 series')
        if (gen === 'amd-ryzen-9') return nameLower.includes('9950x') || nameLower.includes('9900x') || nameLower.includes('9700x') || nameLower.includes('9600x') || nameLower.includes('thế hệ thứ 9') || nameLower.includes('ryzen 9000')
        if (gen === 'amd-ryzen-8') return nameLower.includes('8700g') || nameLower.includes('8600g') || nameLower.includes('8500g') || nameLower.includes('thế hệ thứ 8')
        if (gen === 'amd-ryzen-7') return nameLower.includes('7800x3d') || nameLower.includes('7950x') || nameLower.includes('7900x') || nameLower.includes('7700') || nameLower.includes('7600') || nameLower.includes('thế hệ thứ 7')
        if (gen === 'amd-ryzen-5') return nameLower.includes('5600') || nameLower.includes('5500') || nameLower.includes('thế hệ thứ 5')
        if (gen === 'amd-ryzen-4') return nameLower.includes('4650g') || nameLower.includes('4500') || nameLower.includes('thế hệ thứ 4')
        if (gen === 'amd-ryzen-3') return nameLower.includes('3600') || nameLower.includes('3700') || nameLower.includes('thế hệ thứ 3')
        if (gen === 'amd-ryzen-2') return nameLower.includes('2600') || nameLower.includes('2700') || nameLower.includes('thế hệ thứ 2')
        if (gen === 'amd-ryzen-1') return nameLower.includes('1600') || nameLower.includes('1700') || nameLower.includes('thế hệ thứ 1')
        if (gen === 'intel-ultra-2') return nameLower.includes('ultra 9 2') || nameLower.includes('ultra 7 2') || nameLower.includes('ultra 5 2') || nameLower.includes('series 2')
        if (gen === 'intel-pentium-g') return nameLower.includes('pentium g')
        if (gen === 'intel-pentium-gold') return nameLower.includes('pentium gold')
        if (gen === 'amd-threadripper') return nameLower.includes('threadripper') && !nameLower.includes('9000')
        if (gen === 'ryzen-threadripper-9000') return nameLower.includes('threadripper pro 9') || nameLower.includes('9995wx') || nameLower.includes('9000 wx')
        return false
      })
      if (!match) return false
    }

    // 6. Số nhân thực (Cores)
    if (filters.cores.length > 0) {
      const match = filters.cores.some(c => {
        const pattern1 = `${c}c`
        const pattern2 = `${c} cores`
        const pattern3 = `${c} nhân`
        return specsLower.includes(pattern1) || specsLower.includes(pattern2) || specsLower.includes(pattern3) || descLower.includes(pattern3)
      })
      if (!match) return false
    }

    // 7. Socket
    if (filters.socket.length > 0) {
      const match = filters.socket.some(sock => {
        return specsLower.includes(sock.toLowerCase()) || descLower.includes(sock.toLowerCase()) || nameLower.includes(sock.toLowerCase())
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
            <span className="active">BỘ VI XỬ LÝ CPU</span>
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
                      <input type="text" value="420.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
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
                    {brandsData.map(brand => (
                      <label key={brand.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.value)}
                          onChange={(e) => handleFilterChange('brands', brand.value, e.target.checked)}
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
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
                    {(expandedFilters.useCase ? useCaseData : useCaseData.slice(0, 4)).map(uc => (
                      <label key={uc.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.useCase.includes(uc.value)}
                          onChange={(e) => handleFilterChange('useCase', uc.value, e.target.checked)}
                        />
                        <span>{uc.label}</span>
                      </label>
                    ))}
                    {useCaseData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('useCase')} 
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
                        {expandedFilters.useCase ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SERIES CPU */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('series')}>
                  Series CPU
                  <span className={`accordion-icon ${openFilters.series ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.series && (
                  <div className="filter-options">
                    {(expandedFilters.series ? seriesData : seriesData.slice(0, 4)).map(s => (
                      <label key={s.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.series.includes(s.value)}
                          onChange={(e) => handleFilterChange('series', s.value, e.target.checked)}
                        />
                        <span>{s.label}</span>
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

              {/* THẾ HỆ */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('generation')}>
                  Thế hệ
                  <span className={`accordion-icon ${openFilters.generation ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.generation && (
                  <div className="filter-options">
                    {(expandedFilters.generation ? generationData : generationData.slice(0, 4)).map(gen => (
                      <label key={gen.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.generation.includes(gen.value)}
                          onChange={(e) => handleFilterChange('generation', gen.value, e.target.checked)}
                        />
                        <span style={{ fontSize: '12px' }}>{gen.label}</span>
                      </label>
                    ))}
                    {generationData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('generation')} 
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
                        {expandedFilters.generation ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SỐ NHÂN THỰC */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('cores')}>
                  Số nhân thực
                  <span className={`accordion-icon ${openFilters.cores ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.cores && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.cores ? coresData : coresData.slice(0, 4)).map(c => (
                      <label key={c.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.cores.includes(c.value)}
                          onChange={(e) => handleFilterChange('cores', c.value, e.target.checked)}
                        />
                        <span>{c.label}</span>
                      </label>
                    ))}
                    {coresData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('cores')} 
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
                          fontWeight: '500',
                          gridColumn: 'span 2'
                        }}
                      >
                        {expandedFilters.cores ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SOCKET */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('socket')}>
                  Socket
                  <span className={`accordion-icon ${openFilters.socket ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.socket && (
                  <div className="filter-options">
                    {(expandedFilters.socket ? socketData : socketData.slice(0, 4)).map(sock => (
                      <label key={sock.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.socket.includes(sock.value)}
                          onChange={(e) => handleFilterChange('socket', sock.value, e.target.checked)}
                        />
                        <span>{sock.label}</span>
                      </label>
                    ))}
                    {socketData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('socket')} 
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
                        {expandedFilters.socket ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER */}
              <div className="cpu-main-header">
                <h1>BỘ VI XỬ LÝ CPU</h1>
                
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
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy CPU nào phù hợp với bộ lọc hiện tại.</div>
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
                            <div className="cpu-card-price-wrap">
                              <span className="cpu-card-price">{formatPrice(price)}</span>
                              {product.sale > 0 && variantsList?.[0]?.price && (
                                <span className="cpu-card-original-price">
                                  {formatPrice(variantsList[0].price)}
                                </span>
                              )}
                            </div>
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
                              <button 
                                className="btn-wishlist" 
                                title="Thêm vào yêu thích"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleFavorite(product._id);
                                }}
                              >
                                <svg 
                                  width="15" 
                                  height="15" 
                                  viewBox="0 0 24 24" 
                                  fill={favoriteIds.has(product._id) ? "#ef4444" : "none"} 
                                  stroke={favoriteIds.has(product._id) ? "#ef4444" : "currentColor"} 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
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
