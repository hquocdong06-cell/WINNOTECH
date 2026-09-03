import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import useFavorite from '../hooks/useFavorite'
import useCompare from '../hooks/useCompare'
import { useAuth } from '../hooks/useAuth'
import RecentlyViewedSidebar from '../components/RecentlyViewedSidebar'
import '../assets/styles/cpu.css'

import { API_BASE as API_URL } from '../services/apiService';

// ─── CẤU HÌNH BỘ LỌC ĐỘNG THEO TỪNG LOẠI DANH MỤC ──────────────────
const CATEGORY_FILTER_CONFIGS = {
  // 1. PC Gaming / PC Đồ Họa / PC Văn Phòng
  'pc-gaming': {
    title: 'PC Gaming Trọn Bộ',
    groups: [
      {
        key: 'cpuTier',
        title: 'Vi Xử Lý (CPU)',
        options: [
          { label: 'Intel Core i5', value: 'i5' },
          { label: 'Intel Core i7', value: 'i7' },
          { label: 'Intel Core i9', value: 'i9' },
          { label: 'AMD Ryzen 5', value: 'ryzen 5' },
          { label: 'AMD Ryzen 7', value: 'ryzen 7' },
          { label: 'AMD Ryzen 9', value: 'ryzen 9' },
          { label: '3D V-Cache (X3D)', value: 'x3d' },
        ]
      },
      {
        key: 'vgaTier',
        title: 'Card Đồ Họa (VGA)',
        options: [
          { label: 'RTX 4060 / 4060 Ti', value: '4060' },
          { label: 'RTX 4070 Super / 4070 Ti', value: '4070' },
          { label: 'RTX 4080 Super', value: '4080' },
          { label: 'RTX 4090 24GB', value: '4090' },
          { label: 'Radeon RX Series', value: 'rx' },
        ]
      },
      {
        key: 'ramSize',
        title: 'Dung lượng RAM',
        options: [
          { label: '16GB DDR5 / DDR4', value: '16gb' },
          { label: '32GB DDR5', value: '32gb' },
          { label: '64GB DDR5 High Speed', value: '64gb' },
        ]
      },
      {
        key: 'storageSize',
        title: 'Ổ Cứng SSD',
        options: [
          { label: '500GB / 512GB NVMe', value: '500gb' },
          { label: '1TB NVMe Gen4', value: '1tb' },
          { label: '2TB NVMe Siêu Tốc', value: '2tb' },
        ]
      },
      {
        key: 'useCase',
        title: 'Nhu Cầu Sử Dụng',
        options: [
          { label: 'Gaming eSports (LOL, Valorant, CS2)', value: 'esports' },
          { label: 'Chơi Game 2K / 4K AAA', value: 'aaa' },
          { label: 'Streamer & Đồ Họa Nhẹ', value: 'stream' },
        ]
      }
    ]
  },

  'pc-do-hoa': {
    title: 'PC Đồ Họa - Render 3D - Workstation',
    groups: [
      {
        key: 'cpuTier',
        title: 'Vi Xử Lý (CPU)',
        options: [
          { label: 'Intel Core i7 / i9 Thế hệ 14', value: 'i7|i9' },
          { label: 'AMD Ryzen 9 7900X / 7950X', value: 'ryzen 9' },
          { label: 'AMD Ryzen 7 Đồ Họa', value: 'ryzen 7' },
          { label: 'Intel Core i5 Render', value: 'i5' },
        ]
      },
      {
        key: 'vgaTier',
        title: 'Card Đồ Họa Chuyên Dụng',
        options: [
          { label: 'RTX 4070 Super / 4070 Ti Super 16GB', value: '4070' },
          { label: 'RTX 4080 Super 16GB Studio', value: '4080' },
          { label: 'RTX 4090 24GB AI & Deep Learning', value: '4090' },
          { label: 'NVIDIA RTX A4000 / Workstation', value: 'a4000|workstation' },
          { label: 'RTX 4060 Ti 16GB VRAM Lớn', value: '4060' },
        ]
      },
      {
        key: 'ramSize',
        title: 'Dung lượng RAM',
        options: [
          { label: '32GB DDR5', value: '32gb' },
          { label: '64GB DDR5 ECC / Pro', value: '64gb' },
          { label: '16GB DDR5 Tiêu Chuẩn', value: '16gb' },
        ]
      },
      {
        key: 'useCase',
        title: 'Phần Mềm Tối Ưu',
        options: [
          { label: '3Ds Max, Maya, Blender, Vray', value: '3d|render|maya|blender' },
          { label: 'Adobe Premiere, After Effects 4K/8K', value: 'video|creator|premiere' },
          { label: 'AutoCAD, Revit, SolidWorks', value: 'cad|architect' },
          { label: 'AI Deep Learning & Huấn Luyện Mô Hình', value: 'ai|deeplearning' },
        ]
      }
    ]
  },

  'pc-van-phong': {
    title: 'PC Văn Phòng - Doanh Nghiệp',
    groups: [
      {
        key: 'cpuTier',
        title: 'Phân Khúc CPU',
        options: [
          { label: 'Intel Core i3 Siêu Tiết Kiệm Điện', value: 'i3' },
          { label: 'Intel Core i5 Đa Nhiệm Mượt Mà', value: 'i5' },
          { label: 'Intel Core i7 Doanh Nghiệp', value: 'i7' },
          { label: 'AMD Ryzen 5 APU Đồ Họa Mạnh', value: 'ryzen 5' },
        ]
      },
      {
        key: 'ramSize',
        title: 'Dung Lượng RAM',
        options: [
          { label: '8GB RAM Tiết Kiệm', value: '8gb' },
          { label: '16GB RAM Đa Tác Vụ', value: '16gb' },
          { label: '32GB RAM Văn Phòng Nặng', value: '32gb' },
        ]
      },
      {
        key: 'formFactor',
        title: 'Kiểu Dáng Thùng Máy',
        options: [
          { label: 'Mini Slim / ITX Để Bàn Nhỏ Gọn', value: 'slim|itx' },
          { label: 'Mid-Tower M-ATX Chuẩn Văn Phòng', value: 'matx|atx' },
        ]
      }
    ]
  },

  // 2. Màn hình máy tính
  'man-hinh': {
    title: 'Màn Hình Máy Tính',
    groups: [
      {
        key: 'screenSize',
        title: 'Kích Thước Màn Hình',
        options: [
          { label: '24 inch (Chuẩn Văn Phòng / eSports)', value: '24 inch' },
          { label: '27 inch (Chuẩn Gaming & Đồ Họa)', value: '27 inch' },
          { label: '32 inch (Không Gian Hiển Thị Lớn)', value: '32 inch' },
          { label: '34 inch Cong Ultrawide 21:9', value: '34 inch' },
        ]
      },
      {
        key: 'refreshRate',
        title: 'Tần Số Quét (Hz)',
        options: [
          { label: '100Hz Mượt Mà Văn Phòng', value: '100hz' },
          { label: '144Hz - 180Hz Chuẩn Gaming', value: '144hz|180hz' },
          { label: '240Hz - 360Hz Siêu Tốc eSports', value: '240hz|360hz' },
        ]
      },
      {
        key: 'resolution',
        title: 'Độ Phân Giải',
        options: [
          { label: 'Full HD (1920 x 1080)', value: 'fhd|1080' },
          { label: '2K QHD (2560 x 1440)', value: '2k|qhd' },
          { label: '4K UHD (3840 x 2160)', value: '4k|uhd' },
        ]
      },
      {
        key: 'panelType',
        title: 'Công Nghệ Tấm Nền',
        options: [
          { label: 'Fast IPS Chuẩn Màu sRGB', value: 'ips' },
          { label: 'OLED / QD-OLED Vô Cực', value: 'oled' },
        ]
      }
    ]
  },

  // 3. Gaming Gear: Bàn phím cơ
  'ban-phim': {
    title: 'Bàn Phím Cơ Gaming',
    groups: [
      {
        key: 'connection',
        title: 'Kiểu Kết Nối',
        options: [
          { label: 'Không Dây Tri-Mode (Wireless / BT / Type-C)', value: 'không dây|tri-mode|bluetooth' },
          { label: 'Có Dây Type-C Rời', value: 'type-c|có dây' },
        ]
      },
      {
        key: 'switchType',
        title: 'Tính Năng & Switch',
        options: [
          { label: 'Cơ Custom Hotswap 5-Pin', value: 'hotswap' },
          { label: 'Quang Học Siêu Tốc (Optical)', value: 'quang học|optical' },
          { label: 'Silent Êm Ái Văn Phòng', value: 'silent' },
        ]
      },
      {
        key: 'ledType',
        title: 'Đèn LED',
        options: [
          { label: 'LED RGB 16.8 Triệu Màu', value: 'rgb' },
          { label: 'LED Đơn Sắc Trắng / Không LED', value: 'đơn sắc|không led' },
        ]
      }
    ]
  },

  // 4. Gaming Gear: Chuột Gaming
  'chuot-gaming': {
    title: 'Chuột Chơi Game',
    groups: [
      {
        key: 'sensor',
        title: 'Mắt Đọc / Cảm Biến',
        options: [
          { label: 'Sensor Hero 25K / Focus Pro 30K', value: 'hero|focus' },
          { label: 'Cảm biến PAW3395 Cao Cấp', value: 'paw3395' },
          { label: 'TrueMove Core Chính Xác', value: 'truemove' },
        ]
      },
      {
        key: 'weight',
        title: 'Trọng Lượng & Thiết Kế',
        options: [
          { label: 'Siêu Nhẹ (Dưới 60g)', value: 'siêu nhẹ|55g' },
          { label: 'Công Thái Học (Ergonomic)', value: 'công thái học' },
          { label: 'Thiết Kế Đối Xứng', value: 'đối xứng' },
        ]
      }
    ]
  },

  // 5. Gaming Gear: Tai nghe Gaming
  'tai-nghe': {
    title: 'Tai Nghe Gaming',
    groups: [
      {
        key: 'soundTech',
        title: 'Công Nghệ Âm Thanh',
        options: [
          { label: 'Âm Thanh Vòm 7.1 Virtual Surround', value: '7.1' },
          { label: 'Hi-Res Audio 50mm Driver', value: 'hi-res|50mm' },
          { label: 'Không Dây Spatial Audio', value: 'spatial|không dây' },
          { label: 'Chống Ồn Chủ Động ANC / ENC', value: 'chống ồn|anc|enc' },
        ]
      }
    ]
  },

  // 6. Tản nhiệt PC
  'cooling': {
    title: 'Tản nhiệt PC',
    groups: [
      {
        key: 'coolingType',
        title: 'Loại Tản Nhiệt',
        options: [
          { label: 'Tản Nhiệt Nước AIO 360mm', value: '360' },
          { label: 'Tản Nhiệt Nước AIO 240mm / 280mm', value: '240|280' },
          { label: 'Tản Nhiệt Khí Dual Tower Siêu Êm', value: 'khí|hyper|assassin' },
        ]
      },
      {
        key: 'features',
        title: 'Tính Năng Cao Cấp',
        options: [
          { label: 'Màn Hình LCD / Anime Matrix', value: 'lcd|matrix' },
          { label: 'LED ARGB Đồng Bộ Mainboard', value: 'rgb|argb' },
          { label: 'Mặt Gương Vô Cực Infinity', value: 'infinity|vô cực' },
        ]
      }
    ]
  },

  // 7. Phụ kiện khác
  'extra': {
    title: 'Phụ Kiện PC & Gaming Gear',
    groups: [
      {
        key: 'extraType',
        title: 'Nhóm Phụ Kiện',
        options: [
          { label: 'Quạt Case & Bộ 3 Fan ARGB', value: 'quạt|fan' },
          { label: 'Dây Nguồn Nối Dài ARGB', value: 'dây nguồn|strimer' },
          { label: 'Giá Đỡ Card Màn Hình VGA', value: 'giá đỡ|holder' },
          { label: 'Keo Tản Nhiệt Cao Cấp', value: 'keo' },
          { label: 'Hub Điều Khiển Quạt & LED', value: 'hub|controller' },
          { label: 'Bàn Di Chuột Cỡ Lớn RGB', value: 'bàn di|lót chuột' },
        ]
      }
    ]
  }
}

// Danh sách Thương hiệu dùng chung
const COMMON_BRANDS = [
  { label: 'WINNOTech', value: 'winnotech' },
  { label: 'ASUS', value: 'asus' },
  { label: 'MSI', value: 'msi' },
  { label: 'Gigabyte', value: 'gigabyte' },
  { label: 'AMD', value: 'amd' },
  { label: 'Intel', value: 'intel' },
  { label: 'Corsair', value: 'corsair' },
  { label: 'Kingston', value: 'kingston' },
  { label: 'G.Skill', value: 'gskill' },
  { label: 'Samsung', value: 'samsung' },
  { label: 'Logitech', value: 'logitech' },
  { label: 'Razer', value: 'razer' },
  { label: 'NZXT', value: 'nzxt' },
  { label: 'Cooler Master', value: 'cooler-master' },
  { label: 'LG', value: 'lg' },
  { label: 'Dell', value: 'dell' }
]

export default function CategoryPage({ slug: propSlug, title: propTitle }) {
  const params = useParams()
  const activeSlug = propSlug || params.slug || 'all'

  const dispatch = useDispatch()
  const { favoriteIds, toggleFavorite } = useFavorite()
  const { compareIds, toggleCompare } = useCompare()
  const { isLoggedIn } = useAuth()
  const mainRef = useRef(null)

  const [products, setProducts] = useState([])
  const [categoryName, setCategoryName] = useState(propTitle || 'Tất cả sản phẩm')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [addedCartIds, setAddedCartIds] = useState(new Set())
  const [sortBy, setSortBy] = useState('popular')

  // Bộ lọc
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedSubFilters, setSelectedSubFilters] = useState({})
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyOnSale, setOnlyOnSale] = useState(false)
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000000)

  // Trạng thái đóng mở Accordion
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    status: true,
    cpuTier: true,
    vgaTier: true,
    ramSize: true,
    storageSize: true,
    screenSize: true,
    refreshRate: true,
    resolution: true,
    connection: true,
    switchType: true,
    coolingType: true,
    extraType: true,
    useCase: true
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // 1. Fetch dữ liệu khi slug thay đổi
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true)
      try {
        const isAll = !activeSlug || activeSlug === 'all'
        const endpoint = isAll ? `${API_URL}/products` : `${API_URL}/categories/${activeSlug}`
        const res = await fetch(endpoint)
        const data = await res.json()
        if (data.success) {
          if (isAll) {
            setProducts(Array.isArray(data.data) ? data.data : [])
            setCategoryName(propTitle || 'Tất cả sản phẩm')
          } else {
            setProducts(data.data.products || [])
            const configTitle = CATEGORY_FILTER_CONFIGS[activeSlug]?.title
            setCategoryName(data.data.category?.name || configTitle || propTitle || 'Danh mục sản phẩm')
          }
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Lỗi tải sản phẩm theo danh mục:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryProducts()
    setSelectedBrands([])
    setSelectedSubFilters({})
    setOnlyInStock(false)
    setOnlyOnSale(false)
    setCurrentPage(1)
  }, [activeSlug, propTitle])

  // Lấy danh sách bộ lọc đặc thù theo danh mục
  const currentCategoryConfig = useMemo(() => {
    return CATEGORY_FILTER_CONFIGS[activeSlug] || null
  }, [activeSlug])

  // 2. Xử lý logic lọc động đa điều kiện
  const handleBrandChange = (brandValue, checked) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brandValue])
    } else {
      setSelectedBrands(prev => prev.filter(v => v !== brandValue))
    }
    setCurrentPage(1)
  }

  const handleSubFilterChange = (groupKey, optionValue, checked) => {
    setSelectedSubFilters(prev => {
      const currentList = prev[groupKey] || []
      const nextList = checked
        ? [...currentList, optionValue]
        : currentList.filter(v => v !== optionValue)
      return { ...prev, [groupKey]: nextList }
    })
    setCurrentPage(1)
  }

  const getProductPrice = (product) => {
    if (product.Variants && product.Variants.length > 0) {
      const v = product.Variants[0]
      return v.sale_price > 0 ? v.sale_price : v.price
    }
    return 0
  }

  // TÍNH GIÁ CAO NHẤT CỦA CÁC SẢN PHẨM TRONG DANH MỤC HIỆN TẠI
  const maxCategoryPrice = useMemo(() => {
    if (!products || products.length === 0) return 100000000
    let max = 0
    products.forEach(p => {
      const price = getProductPrice(p)
      if (price > max) max = price
    })
    return max > 0 ? max : 100000000
  }, [products])

  // Tự động đặt lại giới hạn thanh kéo về mức giá cao nhất khi danh mục hoặc danh sách sản phẩm đổi
  useEffect(() => {
    if (products.length > 0) {
      let max = 0
      products.forEach(p => {
        const price = getProductPrice(p)
        if (price > max) max = price
      })
      setMaxPriceLimit(max > 0 ? max : 100000000)
    }
  }, [products])

  const handleClearFilters = () => {
    setSelectedBrands([])
    setSelectedSubFilters({})
    setOnlyInStock(false)
    setOnlyOnSale(false)
    setMaxPriceLimit(maxCategoryPrice)
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
    return `${API_URL}/public/images/anh_case/image_40.png`
  }

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + 'đ' : '0đ'
  }

  // Lọc sản phẩm thực tế
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const pName = (product.name || '').toLowerCase()
      const pDesc = (product.description || '').toLowerCase()
      const pShortDesc = (product.short_desc || '').toLowerCase()
      const pBrandSlug = (product.brand_id?.slug || product.brand_id?.name || '').toLowerCase()
      const fullText = `${pName} ${pDesc} ${pShortDesc} ${pBrandSlug}`

      // 1. Lọc theo thương hiệu
      if (selectedBrands.length > 0) {
        const matchBrand = selectedBrands.some(b => pBrandSlug.includes(b) || pName.includes(b))
        if (!matchBrand) return false
      }

      // 2. Lọc theo tình trạng
      const defaultVariant = product.Variants?.[0]
      const stock = defaultVariant?.stock_quantity ?? 10
      if (onlyInStock && stock <= 0) return false
      if (onlyOnSale && !(product.sale > 0)) return false

      // 3. Lọc theo thanh kéo giá (Từ 0 đến maxPriceLimit)
      const price = getProductPrice(product)
      if (price > maxPriceLimit) return false

      // 5. Lọc theo các nhóm thuộc tính con (CPU, GPU, RAM, Tần số quét, Kích thước...)
      for (const [groupKey, selectedOptions] of Object.entries(selectedSubFilters)) {
        if (selectedOptions.length > 0) {
          const matchAny = selectedOptions.some(opt => {
            const regexPatterns = opt.split('|')
            return regexPatterns.some(pattern => fullText.includes(pattern.toLowerCase().trim()))
          })
          if (!matchAny) return false
        }
      }

      return true
    })
  }, [products, selectedBrands, onlyInStock, onlyOnSale, maxPriceLimit, selectedSubFilters])

  // Sắp xếp
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    if (sortBy === 'price-asc') {
      list.sort((a, b) => getProductPrice(a) - getProductPrice(b))
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => getProductPrice(b) - getProductPrice(a))
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.sale || 0) - (a.sale || 0))
    }
    return list
  }, [filteredProducts, sortBy])

  // ─── PHÂN TRANG: 12 SẢN PHẨM / TRANG, MỖI DÒNG 4 SẢN PHẨM ─────────
  const itemsPerPage = 12
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1
  const startIdx = (currentPage - 1) * itemsPerPage
  const visibleProducts = sortedProducts.slice(startIdx, startIdx + itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Quick Add To Cart
  const handleQuickAddToCart = async (product) => {
    const defaultVariant = product.Variants?.find(v => v.variant_name?.includes('Tiêu chuẩn')) || product.Variants?.[0]
    if (!defaultVariant) {
      toast.error('Sản phẩm chưa có biến thể sẵn sàng!')
      return
    }
    if (defaultVariant.stock_quantity !== undefined && defaultVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này hiện đang tạm hết hàng!')
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
      toast.success('Đã thêm sản phẩm vào giỏ hàng!')
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
      if (!data.success) {
        toast.error(data.message || 'Lỗi khi thêm vào giỏ hàng!')
        return
      }
      dispatch(addToCart(cartPayload))
      toast.success('Đã thêm sản phẩm vào giỏ hàng thành công!')
    } catch {
      toast.error('Lỗi kết nối khi thêm vào giỏ hàng!')
    }
  }

  const triggerCartActive = (pId) => {
    setAddedCartIds(prev => new Set([...prev, pId]))
    setTimeout(() => {
      setAddedCartIds(prev => {
        const n = new Set(prev)
        n.delete(pId)
        return n
      })
    }, 1500)
  }

  const hasActiveFilters = selectedBrands.length > 0 ||
    Object.values(selectedSubFilters).some(arr => arr.length > 0) ||
    onlyInStock || onlyOnSale || maxPriceLimit < maxCategoryPrice

  // Helper tạo danh sách số trang hiển thị thông minh (Tối đa 5 trang liên tiếp + ... + Trang cuối)
  const paginationPages = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []
    // Khi đang ở 4 trang đầu tiên (trang 1, 2, 3, 4) -> hiển thị 5 trang đầu: 1 2 3 4 5 ... trangCuối
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
    // Khi đang ở gần cuối (4 trang cuối cùng) -> hiển thị 1 ... 5 trangCuối
    else if (currentPage >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    }
    // Khi ở giữa (từ trang 5 trở đi) -> hiển thị 1 ... currentPage-1 currentPage currentPage+1 ... trangCuối
    else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }, [currentPage, totalPages])

  return (
    <DefaultLayout>
      <section className="cpu-section" ref={mainRef}>
        <div className="cpu-section-inner">
          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <Link to="/home">Trang chủ</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <span className="active">{categoryName.toUpperCase()}</span>
          </div>

          {/* MAIN LAYOUT */}
          <div className="cpu-layout">
            {/* LEFT SIDEBAR - FILTERS */}
            <aside className="cpu-sidebar">
              {/* TIÊU ĐỀ BỘ LỌC + NÚT XÓA NHANH */}
              {hasActiveFilters && (
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <button
                    onClick={handleClearFilters}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}

              {/* KHOẢNG GIÁ FILTER (GIỐNG TRANG CPU) */}
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
                      <input
                        type="text"
                        value="0đ"
                        disabled
                        style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}
                      />
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                      <input
                        type="text"
                        value={formatPrice(maxPriceLimit)}
                        disabled
                        style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--yellow)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}
                      />
                    </div>
                    <div className="custom-slider-wrapper" style={{ marginTop: '8px' }}>
                      <input
                        type="range"
                        min={0}
                        max={maxCategoryPrice}
                        step={maxCategoryPrice > 20000000 ? 500000 : 100000}
                        value={maxPriceLimit}
                        onChange={(e) => {
                          setMaxPriceLimit(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        style={{
                          width: '100%',
                          cursor: 'pointer',
                          accentColor: 'var(--yellow)',
                          height: '6px',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TÌNH TRẠNG & KHUYẾN MÃI */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('status')}>
                  Tình trạng hàng
                  <span className={`accordion-icon ${openFilters.status ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.status && (
                  <div className="filter-options" style={{ marginTop: '10px' }}>
                    <label className="filter-label">
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(e) => { setOnlyInStock(e.target.checked); setCurrentPage(1); }}
                      />
                      <span>Chỉ sản phẩm còn hàng</span>
                    </label>
                    <label className="filter-label">
                      <input
                        type="checkbox"
                        checked={onlyOnSale}
                        onChange={(e) => { setOnlyOnSale(e.target.checked); setCurrentPage(1); }}
                      />
                      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>⚡ Đang giảm giá sốc</span>
                    </label>
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
                  <div className="filter-options" style={{ marginTop: '10px' }}>
                    {COMMON_BRANDS.map(brand => (
                      <label key={brand.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.value)}
                          onChange={(e) => handleBrandChange(brand.value, e.target.checked)}
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* CÁC BỘ LỌC ĐẶC THÙ THEO DANH MỤC (NẾU CÓ) */}
              {currentCategoryConfig?.groups?.map(group => {
                const isOpen = openFilters[group.key] ?? true
                const selectedList = selectedSubFilters[group.key] || []

                return (
                  <div className="filter-group" key={group.key}>
                    <div className="filter-title" onClick={() => toggleFilter(group.key)}>
                      {group.title}
                      <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                          <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    {isOpen && (
                      <div className="filter-options" style={{ marginTop: '10px' }}>
                        {group.options.map(opt => (
                          <label key={opt.value} className="filter-label">
                            <input
                              type="checkbox"
                              checked={selectedList.includes(opt.value)}
                              onChange={(e) => handleSubFilterChange(group.key, opt.value, e.target.checked)}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* SẢN PHẨM ĐÃ XEM WIDGET */}
              <RecentlyViewedSidebar />
            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER & SORTING */}
              <div className="cpu-main-header">
                <div>
                  <h1 style={{ fontSize: '26px' }}>{categoryName.toUpperCase()}</h1>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Hiển thị <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>{sortedProducts.length}</span> sản phẩm phù hợp
                  </p>
                </div>

                <div className="cpu-main-header-right">
                  <div className="cpu-sort">
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="popular">⚡ Sắp xếp: Phổ biến nhất</option>
                      <option value="price-asc">Giá: Thấp đến Cao</option>
                      <option value="price-desc">Giá: Cao đến Thấp</option>
                      <option value="discount">Ưu đãi giảm giá nhiều nhất</option>
                      <option value="newest">Sản phẩm mới nhất</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* LOADING HOẶC DANH SÁCH SẢN PHẨM (GRID 4 CỘT) */}
              {loading ? (
                <div style={{ color: '#aaa', padding: '60px 0', textAlign: 'center', fontSize: '14px' }}>
                  ⏳ Đang tải sản phẩm từ hệ thống WINNOTech...
                </div>
              ) : visibleProducts.length === 0 ? (
                <div style={{ color: '#aaa', padding: '60px 20px', textAlign: 'center', background: 'var(--dark)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <p style={{ fontSize: '15px', color: '#fff', marginBottom: '8px' }}>Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Hãy thử bỏ bớt tiêu chí lọc hoặc nhấn nút "Xóa tất cả" ở góc trên.</p>
                  <button
                    onClick={handleClearFilters}
                    style={{ marginTop: '16px', background: 'var(--yellow)', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                <div className="cpu-grid">
                  {visibleProducts.map(product => {
                    const price = getProductPrice(product)
                    const image = getProductImage(product)
                    const defaultVariant = product.Variants?.find(v => v.variant_name?.includes('Tiêu chuẩn')) || product.Variants?.[0]
                    const isOutOfStock = defaultVariant && defaultVariant.stock_quantity !== undefined ? defaultVariant.stock_quantity <= 0 : false
                    const variantCount = product.Variants?.length || 1

                    return (
                      <div key={product._id} className="cpu-card" style={isOutOfStock ? { opacity: 0.85 } : {}}>
                        {/* BADGES */}
                        <div className="cpu-card-badge-wrap">
                          {isOutOfStock ? (
                            <span className="cpu-card-sale-badge" style={{ background: '#ef4444' }}>Hết hàng</span>
                          ) : (
                            product.sale > 0 && <span className="cpu-card-sale-badge">-{product.sale}%</span>
                          )}
                          {!['pc-gaming', 'pc-do-hoa', 'pc-van-phong'].includes(activeSlug) && variantCount > 1 && (
                            <span className="cpu-card-variant-badge">
                              {variantCount} Biến thể
                            </span>
                          )}
                        </div>

                        {/* PRODUCT IMAGE */}
                        <div className="cpu-card-img">
                          <Link to={`/product/${product.slug || product._id}`}>
                            <img src={image} alt={product.name} loading="lazy" />
                          </Link>
                        </div>

                        {/* PRODUCT INFO */}
                        <div className="cpu-card-info">
                          <h3 className="cpu-card-name" title={product.name}>
                            <Link to={`/product/${product.slug || product._id}`}>{product.name}</Link>
                          </h3>

                          <p className="cpu-card-specs" title={product.short_desc}>
                            {product.short_desc || product.description?.slice(0, 60) || 'Sản phẩm công nghệ cao'}
                          </p>

                          <div className="cpu-card-footer">
                            <div className="cpu-card-price-wrap">
                              <span className="cpu-card-price">{formatPrice(price)}</span>
                              {product.sale > 0 && product.Variants?.[0]?.price && (
                                <span className="cpu-card-original-price">
                                  {formatPrice(product.Variants[0].price)}
                                </span>
                              )}
                            </div>

                            <div className="cpu-card-actions">
                              {/* THÊM VÀO GIỎ */}
                              <button
                                className={`btn-add-cart ${addedCartIds.has(product._id) ? 'added-active' : ''}`}
                                title={isOutOfStock ? 'Hết hàng' : (addedCartIds.has(product._id) ? 'Đã thêm vào giỏ!' : 'Thêm nhanh vào giỏ')}
                                disabled={isOutOfStock}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (!isOutOfStock) {
                                    handleQuickAddToCart(product)
                                    triggerCartActive(product._id)
                                  }
                                }}
                                style={isOutOfStock ? { background: '#222', cursor: 'not-allowed', borderColor: '#333', opacity: 0.5 } : {}}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={addedCartIds.has(product._id) ? "var(--yellow)" : "#fff"}>
                                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                              </button>

                              {/* SO SÁNH */}
                              <button
                                className="btn-wishlist"
                                title={compareIds.has(String(product._id)) ? 'Bỏ so sánh' : 'So sánh'}
                                onClick={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (!isLoggedIn) {
                                    toast.warning('Vui lòng đăng nhập để sử dụng tính năng so sánh!')
                                    return
                                  }
                                  await toggleCompare(product._id)
                                  if (!compareIds.has(String(product._id))) {
                                    toast.success(
                                      <span>Đã thêm vào so sánh! <Link to="/compare" style={{color:'#d4ff00',fontWeight:700}}>Xem ngay →</Link></span>,
                                      { autoClose: 3000 }
                                    )
                                  }
                                }}
                                style={{ color: compareIds.has(String(product._id)) ? '#d4ff00' : undefined }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                                </svg>
                              </button>

                              {/* YÊU THÍCH */}
                              <button
                                className="btn-wishlist"
                                title="Thêm vào yêu thích"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleFavorite(product._id)
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
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

              {/* PHÂN TRANG (12 SẢN PHẨM / TRANG: TỐI ĐA 5 TRANG + ... + TRANG CUỐI) */}
              {totalPages > 1 && (
                <div className="cpu-footer-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Trang <span style={{ color: '#fff', fontWeight: 700 }}>{currentPage}</span> / {totalPages} (Hiển thị {startIdx + 1} - {Math.min(startIdx + itemsPerPage, sortedProducts.length)} trên {sortedProducts.length} sản phẩm)
                  </div>

                  <div className="cpu-pagination-right">
                    <button
                      className="page-nav-btn"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      &lt;
                    </button>

                    {paginationPages.map((item, idx) => {
                      if (item === '...') {
                        return <span key={`ellipsis-${idx}`} className="page-ellipsis">...</span>
                      }
                      return (
                        <button
                          key={item}
                          className={`page-btn ${currentPage === item ? 'active' : ''}`}
                          onClick={() => handlePageChange(item)}
                        >
                          {item}
                        </button>
                      )
                    })}

                    <button
                      className="page-nav-btn"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      title="Trang tiếp theo"
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
