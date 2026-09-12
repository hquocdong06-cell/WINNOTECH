import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/product-detail.css'
import useFavorite from '../hooks/useFavorite'
import { useAuth } from '../hooks/useAuth'
import { reviewAPI } from '../services/apiService'

import RecentlyViewedSection from '../components/RecentlyViewedSection'
import ProductCard from '../components/ProductCard'

import { API_BASE as API_URL } from '../services/apiService';

// ── SpecsTable Component — Hiển thị thông số kỹ thuật từ bảng Specifications (DB) ──
const SpecsTable = ({ product }) => {
  const getCategorizedSpecs = () => {
    const generalList = []
    const detailList = []
    const dimensionList = []
    const map = new Map()

    const addSpec = (group, name, value) => {
      if (!name || !value || value === '—') return
      const key = name.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, true)
        const item = { name: name.trim(), value: String(value).trim() }
        if (group === 'general') generalList.push(item)
        else if (group === 'dimension') dimensionList.push(item)
        else detailList.push(item)
      }
    }

    const generalKeys = [
      'thương hiệu', 'bảo hành', 'thương hiệu cpu', 'nhu cầu', 'tên của case', 'chất liệu', 'kiểu ổ cứng', 'màu sắc của ổ cứng', 'loại hàng', 
      'part-number', 'màu sắc', 'đèn led', 'tên', 'kết nối bàn phím', 
      'loại bàn phím', 'brand', 'warranty', 'tình trạng'
    ]

    const dimensionKeys = [
      'kích thước (có chân)', 'kích thước (không chân)', 'khối lượng (có chân)', 'khối lượng (không chân)',
      'kích thước và trọng lượng', 'kích thước - khối lượng'
    ]


    // Chỉ lấy từ bảng Specifications trong DB — không dùng hardcode fallback
    const specsSource = Array.isArray(product?.specifications) && product.specifications.length > 0
      ? product.specifications
      : (Array.isArray(product?.Specifications) ? product.Specifications : []);

    specsSource.forEach(spec => {
      if (!spec) return;
      const n = (spec.name || spec.category_name || spec.id_attribute_value?.id_categories_attribute?.name || '').trim();
      const v = (spec.value || spec.id_attribute_value?.value || '').trim();
      if (!n || !v) return;
      let grp = spec.group || 'detail';
      const k = n.toLowerCase();
      if (grp === 'detail' && generalKeys.includes(k)) grp = 'general';
      else if (grp === 'detail' && dimensionKeys.includes(k)) grp = 'dimension';
      addSpec(grp, n, v);
    });

    const hasDBSpecs = specsSource.some(s => s && (s.name || s.value || s.id_attribute_value));

    return { generalList, detailList, dimensionList, hasDBSpecs }
  }

  const { generalList, detailList, dimensionList } = getCategorizedSpecs()
  const hasItems = generalList.length > 0 || detailList.length > 0 || (dimensionList && dimensionList.length > 0)

  if (!hasItems) {
    return (
      <div style={{ margin: '16px 0 28px 0' }}>
        <div style={{ fontSize: '13.5px', color: '#94a3b8', fontStyle: 'italic', padding: '12px 0' }}>
          * Thông số kỹ thuật đang được cập nhật
        </div>
      </div>
    )
  }

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null
    return (
      <div style={{ marginBottom: '24px' }}>
        {title && (
          <h4 style={{ 
            fontSize: '15px', 
            fontWeight: 700, 
            color: '#ffffff', 
            marginBottom: '12px',
            marginTop: '0px'
          }}>
            {title}
          </h4>
        )}
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <tbody>
              {items.map((item, idx) => (
                <tr 
                  key={idx} 
                  style={{ 
                    background: idx % 2 === 1 ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    borderBottom: idx === items.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <td style={{ 
                    padding: '12px 18px', 
                    color: '#94a3b8', 
                    fontWeight: 500, 
                    width: '38%',
                    verticalAlign: 'middle'
                  }}>
                    {item.name}
                  </td>
                  <td style={{ 
                    padding: '12px 18px', 
                    color: '#f8fafc', 
                    fontWeight: 600, 
                    width: '62%',
                    verticalAlign: 'middle'
                  }}>
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div style={{ margin: '16px 0 28px 0' }}>
      {renderSection('Thông tin chung', generalList)}
      {renderSection('Cấu hình chi tiết', detailList)}
      {renderSection('Kích thước - Khối lượng', dimensionList)}
    </div>
  )
}

// ── FormattedDescription Component (Parses Markdown, HTML, Headers, and Tables) ──
const FormattedDescription = ({ product, activeVariant, text, attributes, groupedAttributes }) => {
  const hasText = text && text.trim()

  // If text contains HTML tags (e.g. <p>, <br>, <img>, <table>)
  if (hasText && /<[a-z][\s\S]*>/i.test(text)) {
    return (
      <div 
        className="formatted-description html-content"
        dangerouslySetInnerHTML={{ __html: text }} 
        style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '14px' }}
      />
    )
  }

  const lines = hasText ? text.split('\n') : []
  const elements = []
  let tableRows = []
  let inTable = false
  let hasParsedTable = false

  const renderInline = (str) => {
    if (!str) return ''
    const parts = str.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#ffffff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const flushTable = (keyIndex) => {
    if (tableRows.length === 0) return null

    const validRows = tableRows.filter(row => !row.every(cell => /^[:\-\s]+$/.test(cell)))
    if (validRows.length === 0) {
      tableRows = []
      inTable = false
      return null
    }

    hasParsedTable = true
    const header = validRows[0]
    const body = validRows.slice(1)

    const tableElement = (
      <div key={`table-${keyIndex}`} style={{ margin: '20px 0 28px 0', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '16px' }}>
          Thông Số Kỹ Thuật Chi Tiết
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: 'transparent', color: '#cbd5e1' }}>
          {header && (
            <thead>
              <tr style={{ borderBottom: '2px solid var(--accent-color)' }}>
                {header.map((cell, cIdx) => (
                  <th key={cIdx} style={{ padding: '12px 8px', textAlign: 'left', color: 'var(--accent-color)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '14px 8px', fontSize: '14px', color: cIdx === 0 ? '#ffffff' : '#cbd5e1', fontWeight: cIdx === 0 ? 600 : 400 }}>
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

    tableRows = []
    inTable = false
    return tableElement
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    // Table line check
    if (trimmed.startsWith('|') || (trimmed.includes('|') && trimmed.endsWith('|'))) {
      inTable = true
      const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, a) => !(i === 0 && c === '') && !(i === a.length - 1 && c === ''))
      tableRows.push(cells)
      return
    } else if (inTable) {
      const tableEl = flushTable(idx)
      if (tableEl) elements.push(tableEl)
    }

    if (!trimmed) {
      elements.push(<div key={`blank-${idx}`} style={{ height: '8px' }} />)
      return
    }

    // Header 1 (# Title)
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={idx} style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-color)', margin: '20px 0 10px 0' }}>
          {renderInline(trimmed.slice(2))}
        </h2>
      )
      return
    }

    // Header 2 (## Subtitle)
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={idx} style={{
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--accent-color)',
          margin: '24px 0 12px 0'
        }}>
          {renderInline(trimmed.slice(3))}
        </h3>
      )
      return
    }

    // Header 3 (### Subtitle)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={idx} style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#ffffff',
          margin: '16px 0 8px 0'
        }}>
          {renderInline(trimmed.slice(4))}
        </h4>
      )
      return
    }

    // List item (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '6px 0', paddingLeft: '8px' }}>
          <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>•</span>
          <span style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '14px' }}>{renderInline(trimmed.slice(2))}</span>
        </div>
      )
      return
    }

    // Regular paragraph
    elements.push(
      <p key={idx} style={{ margin: '6px 0', lineHeight: '1.7', color: '#cbd5e1', fontSize: '14px' }}>
        {renderInline(trimmed)}
      </p>
    )
  })

  if (inTable) {
    const tableEl = flushTable('end')
    if (tableEl) elements.push(tableEl)
  }

  return (
    <div className="formatted-description" style={{ padding: '0px' }}>
      {elements}
    </div>
  )
}




export default function ProductDetail() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoggedIn } = useAuth()
  const { slug } = useParams()
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('specs')
  const { favoriteIds, toggleFavorite } = useFavorite()
  const [selectedImage, setSelectedImage] = useState(0)

  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])

  const [reviewsList, setReviewsList] = useState([])
  const [avgRating, setAvgRating] = useState(5)
  const [loadingReviews, setLoadingReviews] = useState(true)

  const loadReviews = async (productIdOverride) => {
    const targetId = productIdOverride || productData?.product?._id || slug
    if (!targetId) return
    try {
      setLoadingReviews(true)
      const data = await reviewAPI.getProductReviews(targetId)
      if (data && data.success) {
        setReviewsList(data.data || [])
        setAvgRating(data.avgRating || 5)
      }
    } catch (e) {
      console.error('Lỗi tải đánh giá sản phẩm:', e)
    } finally {
      setLoadingReviews(false)
    }
  }

  // Sidebar mock filters (giữ giao diện đẹp mắt của template)
  const brands = ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'GIGABYTE']
  const productLines = [
    'GeForce RTX 40 Series',
    'GeForce RTX 30 Series',
    'Radeon RX 7000 Series',
    'Radeon RX 6000 Series'
  ]
  const sockets = ['PCIe 4.0', 'PCIe 3.0', 'PCIe 5.0']

  // Lưu sản phẩm đã xem vào localStorage (tối đa 3 sản phẩm, tự xóa sản phẩm đầu tiên khi thêm sản phẩm mới)
  useEffect(() => {
    if (!slug) return
    try {
      const KEY = 'winnotech_recently_viewed'
      const stored = localStorage.getItem(KEY)
      let slugs = stored ? JSON.parse(stored) : []
      if (!Array.isArray(slugs)) slugs = []

      // Bỏ trùng lặp (nếu mở lại sản phẩm đã xem trước đó, đẩy lên vị trí mới nhất)
      slugs = slugs.filter(s => s !== slug)

      // Thêm slug hiện tại vào cuối
      slugs.push(slug)

      // Nếu vượt quá 3 sản phẩm, xóa sản phẩm đầu tiên đã lưu (FIFO)
      if (slugs.length > 3) {
        slugs = slugs.slice(-3)
      }

      localStorage.setItem(KEY, JSON.stringify(slugs))
    } catch (e) {
      console.error('Lỗi lưu sản phẩm đã xem:', e)
    }
  }, [slug])

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/products/${slug}`)
        const data = await res.json()
        if (data.success && data.data) {
          setProductData(data.data)
          setError(null)
          
          // Lấy sản phẩm liên quan từ cùng Category — gọi /products rồi lọc theo cat_id
          const catId = data.data.product?.cat_id?._id || data.data.product?.cat_id
          const currentProductId = data.data.product?._id
          if (catId) {
            try {
              const allRes = await fetch(`${API_URL}/products`)
              const allData = await allRes.json()
              if (allData.success && Array.isArray(allData.data)) {
                const related = allData.data
                  .filter(p => {
                    const pCatId = p.cat_id?._id || p.cat_id
                    return String(pCatId) === String(catId) && String(p._id) !== String(currentProductId)
                  })
                  .slice(0, 4)
                setRelatedProducts(related)
              }
            } catch {
              // Không lấy được related products → bỏ qua
            }
          }
          if (currentProductId) {
            loadReviews(currentProductId)
          }
        } else {
          setError(data.message || 'Không tìm thấy sản phẩm')
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết sản phẩm từ DB:', err)
        setError('Không thể tải chi tiết sản phẩm từ hệ thống')
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      fetchProductDetail()
    }
  }, [slug])

  // Sync selected variant id
  useEffect(() => {
    if (productData?.Variants && productData.Variants.length > 0) {
      let initialVar = productData.Variants[0]
      const pName = (productData.product?.name || '').toLowerCase()

      // Ưu tiên chọn biến thể khớp với dung lượng được định danh trong tên sản phẩm (VD: 32GB)
      if (pName.includes('32gb') || pName.includes('32 gb')) {
        const var32 = productData.Variants.find(v => {
          const vName = (v.variant_name || '').toLowerCase()
          const attrs = v.Attributes || v.attributes || []
          return vName.includes('32gb') || attrs.some(a => (a.value_name || a.value || '').toLowerCase() === '32gb')
        })
        if (var32) initialVar = var32
      } else if (pName.includes('16gb') || pName.includes('16 gb')) {
        const var16 = productData.Variants.find(v => {
          const vName = (v.variant_name || '').toLowerCase()
          const attrs = v.Attributes || v.attributes || []
          return vName.includes('16gb') || attrs.some(a => (a.value_name || a.value || '').toLowerCase() === '16gb')
        })
        if (var16) initialVar = var16
      }

      setSelectedVariantId(initialVar._id)

      // Khởi tạo selectedAttributes từ biến thể ban đầu
      const curAttrs = initialVar?.Attributes || initialVar?.attributes || []
      const initAttrMap = {}
      curAttrs.forEach(a => {
        const gName = a.attribute_name || a.name
        const gVal = a.value_name || a.value
        if (gName && gVal) initAttrMap[gName] = gVal
      })
      setSelectedAttributes(initAttrMap)
    }
  }, [productData])

  // Đồng bộ thuộc tính đã chọn khi activeVariant hoặc productData thay đổi
  useEffect(() => {
    if (!productData) return
    const variants = productData.Variants || []
    if (variants.length === 0) return

    const curVariant = variants.find(v => v._id === selectedVariantId) || variants[0]
    const curAttrs = curVariant?.Attributes || curVariant?.attributes || []
    if (curAttrs.length === 0) return

    setSelectedAttributes(prev => {
      const next = { ...prev }
      curAttrs.forEach(a => {
        const gName = a.attribute_name || a.name
        const gVal = a.value_name || a.value
        if (gName && gVal) {
          next[gName] = gVal
        }
      })
      return next
    })
  }, [productData, selectedVariantId])

  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', fontSize: '18px' }}>
          ⏳ Đang tải thông tin sản phẩm...
        </div>
      </DefaultLayout>
    )
  }

  if (error || !productData) {
    return (
      <DefaultLayout>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff', gap: '20px' }}>
          <h2>❌ {error || 'Không tìm thấy sản phẩm'}</h2>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', background: 'var(--accent-color)', color: '#000', borderRadius: '4px', fontWeight: 600 }}>
            Quay lại trang chủ
          </Link>
        </div>
      </DefaultLayout>
    )
  }

  const { product, AnhSP, Variants } = productData

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ'
    return price.toLocaleString('vi-VN') + 'đ'
  }

  // Gallery images list: thumbnail chính + tất cả ảnh phụ (is_main: false)
  const getProductImages = () => {
    const list = []
    // Thêm thumbnail chính (ảnh đầu tiên)
    if (product.thumnail) {
      const thumb = product.thumnail.startsWith('http') ? product.thumnail : `${API_URL}${product.thumnail}`
      list.push(thumb)
    }
    // Thêm tất cả ảnh phụ (is_main = false) — KHÔNG dedup theo URL
    // vì DB có thể lưu cùng URL cho nhiều record khác nhau
    if (AnhSP && AnhSP.length > 0) {
      const seenIds = new Set()
      AnhSP.forEach(img => {
        // Bỏ qua ảnh is_main (đã dùng làm thumbnail)
        if (img.is_main === true) return
        // Dedup theo _id để không thêm 2 lần cùng 1 record
        if (img._id && seenIds.has(img._id.toString())) return
        if (img._id) seenIds.add(img._id.toString())
        const url = img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`
        list.push(url)
      })
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop')
    }
    return list
  }


  const images = getProductImages()

  // Price calculations
  const hasVariants = Variants && Variants.length > 0
  const activeVariant = Variants?.find(v => v._id === selectedVariantId) || (hasVariants ? Variants.find(v => v.price > 0) || Variants[0] : null)
  const activeAttributes = activeVariant?.Attributes || activeVariant?.attributes || []
  const originalPrice = (activeVariant && activeVariant.price > 0) ? activeVariant.price : (product.price || 0)
  const currentPrice = (activeVariant && activeVariant.sale_price > 0) ? activeVariant.sale_price : (product.sale > 0 && originalPrice > 0 ? Math.round(originalPrice * (1 - product.sale / 100)) : originalPrice)

  const hasSale = product.sale > 0 || (activeVariant && activeVariant.sale_price > 0)
  const salePercent = product.sale || (activeVariant && activeVariant.price > 0 ? Math.round((1 - activeVariant.sale_price / activeVariant.price) * 100) : 0)

  const isOutOfStock = activeVariant && activeVariant.stock_quantity !== undefined ? activeVariant.stock_quantity <= 0 : false
  const availableStock = activeVariant && activeVariant.stock_quantity !== undefined ? activeVariant.stock_quantity : 999

  const getNormalizedKey = (groupName, valName) => {
    if (!valName) return ''
    let cleaned = valName.toString().trim().toLowerCase()

    // Loại bỏ phần dịch tiếng Anh trong ngoặc: "đen (black)" -> "đen"
    cleaned = cleaned.replace(/\s*\([^)]*\)/g, '').trim()

    // Chuẩn hóa cấu hình dung lượng bộ nhớ (VD: "2 x 16GB", "2x16GB" -> "32gb")
    const multMatch = cleaned.match(/^(\d+)\s*x\s*(\d+)\s*gb$/i)
    if (multMatch) {
      const totalGB = parseInt(multMatch[1]) * parseInt(multMatch[2])
      cleaned = `${totalGB}gb`
    }

    return cleaned
  }

  // Group attributes by Attribute Name for top purchasing section (ONLY selectable options like Màu sắc, Phiên bản)
  const getGroupedAttributes = () => {
    if (!Variants || Variants.length === 0) return []

    // Kiểm tra sản phẩm có phải card màn hình không (GPU/VGA)
    const catNameG = (product?.cat_id?.name || product?.cat_id?.slug || '').toLowerCase()
    const pNameG = (product?.name || '').toUpperCase()
    const isGPU = catNameG.includes('gpu') || catNameG.includes('vga') || catNameG.includes('card')
      || pNameG.includes('RTX') || pNameG.includes('GTX') || pNameG.includes('RX ')
      || pNameG.includes('ARC ') || pNameG.includes('GEFORCE') || pNameG.includes('RADEON')

    const isMonitor = catNameG.includes('man-hinh') || catNameG.includes('màn hình') || catNameG.includes('monitor')
      || pNameG.includes('MÀN HÌNH') || pNameG.includes('MONITOR')

    const specFilterOut = [
      'thương hiệu', 'bảo hành', 'nhu cầu', 'kiểu kết nối', 'kết nối', 
      'kiểu cầm', 'switch', 'độ phân giải (cpi/dpi)', 'độ phân giải', 
      'tên cảm biến', 'cảm biến', 'số nút bấm', 'kích thước', 'khối lượng',
      'tên', 'part-number', 'kết nối bàn phím', 'loại bàn phím', 'đèn', 'kiểu switch',
      'loại hàng', 'đèn led', 'thế hệ', 'bus', 'timing', 'voltage',
      'chipset', 'socket', 'khe ram tối đa', 'kiểu ram hỗ trợ', 'hỗ trợ bộ nhớ tối đa', 
      'bus ram hỗ trợ', 'lưu trữ', 'kiểu khe m.2 hỗ trợ', 'cổng xuất hình', 'khe pci', 
      'số cổng usb', 'lan', 'âm thanh',
      'công suất tối đa', 'hiệu suất', 'số cổng cắm', 'quạt làm mát', 'nguồn đầu vào',
      'dạng tản nhiệt', 'kích thước quạt (mm)', 'socket được hỗ trợ', 'chất liệu tản nhiệt', 
      'kích thước radiator (cm)', 'chiều cao (cm)', 'số vòng quay của quạt (rpm)', 
      'lưu lượng không khí (cfm)', 'độ ồn (dba)', 'khối lượng (kg)',
      'tên của case', 'chất liệu', 'loại case', 'hỗ trợ mainboard', 'số lượng ổ đĩa hỗ trợ', 
      'hỗ trợ tản nhiệt cpu cao', 'loại quạt hỗ trợ phía trên', 'loại quạt hỗ trợ phía sau', 
      'loại quạt hỗ trợ bên dưới', 'ổ đĩa hỗ trợ', 'tản nhiệt cpu cao', 'quạt hỗ trợ',
      'kiểu ổ cứng', 'màu sắc của ổ cứng', 'tốc độ vòng quay', 'tốc độ đọc', 'tốc độ ghi',
      'giao tiếp', 'tbw', 'form factor', 'nand', 'controller',
      'weight', 'dimensions', 'sensor',
      'tần số quét', 'thời gian phản hồi', 'tỉ lệ', 'độ tương phản tĩnh', 'độ sáng',
      'góc nhìn', 'độ phủ màu', 'số lượng màu', 'tấm nền', 'công nghệ đồng bộ',
      'công suất', 'kiểu màn hình', 'chuẩn gắn arm', 'phụ kiện đi kèm',
      'kích thước (có chân)', 'kích thước (không chân)', 'khối lượng (có chân)', 'khối lượng (không chân)',
      'series', 'phiên bản / dung lượng', 'phiên bản'
    ]

    const hasExplicitAttributes = Variants.some(v => (v.Attributes && v.Attributes.length > 0))

    if (hasExplicitAttributes) {
      const groups = {}
      Variants.forEach(v => {
        const attrs = v.Attributes || []
        attrs.forEach(a => {
          let groupName = a.attribute_name || a.name || 'Thuộc tính'
          const valName = a.value_name || a.value
          if (!groupName || !valName) return

          // Lọc bỏ các thông số kỹ thuật cố định, nhưng luôn giữ lại các thuộc tính chọn mua cốt lõi
          const lowerName = groupName.trim().toLowerCase()
          const isCoreVariantAttr = ['màu sắc', 'dung lượng', 'dung lượng ram', 'dung lượng lưu trữ', 'phiên bản', 'phiên bản / dung lượng'].includes(lowerName)
          if (!isCoreVariantAttr) {
            if (specFilterOut.some(s => lowerName === s || lowerName.includes(s) || (s.length > 5 && s.includes(lowerName)))) return
          }

          // Nếu là màn hình máy tính, loại bỏ hoàn toàn các thuộc tính chứa "dung lượng" hoặc "phiên bản / dung lượng"
          if (isMonitor && (lowerName.includes('dung lượng') || lowerName.includes('dung luong'))) return

          // Chuẩn hóa tiêu đề nếu là "Phiên bản / Dung lượng" nhưng không phải danh mục lưu trữ/RAM
          if (groupName === 'Phiên bản / Dung lượng' && isMonitor) return

          if (!groups[groupName]) {
            groups[groupName] = { attribute_name: groupName, options: [] }
          }
          const normKey = getNormalizedKey(groupName, valName)
          if (!groups[groupName].options.some(o => getNormalizedKey(groupName, o.value_name) === normKey)) {
            groups[groupName].options.push({
              value_name: valName,
              variant_id: v._id
            })
          }
        })
      })

      // Sắp xếp các lựa chọn dung lượng (RAM/Ổ cứng) theo thứ tự tăng dần: 8GB -> 16GB -> 32GB -> 64GB
      Object.keys(groups).forEach(gName => {
        const lowerG = gName.toLowerCase()
        if (lowerG.includes('dung lượng') || lowerG.includes('ram')) {
          groups[gName].options.sort((a, b) => {
            const numA = parseInt(a.value_name) || 0
            const numB = parseInt(b.value_name) || 0
            return numA - numB
          })
        }
      })

      const filteredGroups = Object.values(groups)
      
      // Fallback: nếu sản phẩm chưa có thuộc tính Dung lượng nhưng tên có chứa dung lượng (VD: 32GB, 16GB...)
      // Bỏ qua cho GPU và Monitor
      const hasCapGroup = filteredGroups.some(g => 
        isMatchStr(g.attribute_name, 'Dung lượng') || isMatchStr(g.attribute_name, 'Dung lượng RAM')
      )
      if (!hasCapGroup && !isGPU && !isMonitor && product?.name) {
        const capMatch = product.name.match(/\b(\d+\s*GB|\d+\s*TB)\b/i)
        if (capMatch) {
          const extractedCap = capMatch[1].replace(/\s+/g, '').toUpperCase()
          filteredGroups.unshift({
            attribute_name: 'Dung lượng RAM',
            options: [{
              value_name: extractedCap,
              variant_id: activeVariant?._id
            }]
          })
        }
      }

      if (filteredGroups.length > 0) return filteredGroups
    }

    // Danh sách tên variant "mặc định" không có ý nghĩa lựa chọn
    const DEFAULT_VARIANT_NAMES = [
      'mặc định', 'mac dinh', 'default',
      'tiêu chuẩn', 'tieu chuan',
      'tiêu chuẩn (standard)', 'tieu chuan (standard)',
      'bản tiêu chuẩn (standard)', 'ban tieu chuan (standard)'
    ]
    const isDefaultVariant = (name) => {
      const n = (name || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return DEFAULT_VARIANT_NAMES.some(d => {
        const dn = d.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return n === dn
      })
    }

    // Chỉ lấy các variant có tên thật (không phải mặc định)
    const realVariants = Variants.filter(v => v.variant_name && !isDefaultVariant(v.variant_name))

    // Chỉ hiện selector khi có ≥2 variant thật
    if (realVariants.length >= 2) {
      return [{
        attribute_name: isMonitor ? 'Phiên bản' : 'Phiên bản / Biến thể',
        options: realVariants.map(v => ({
          value_name: v.variant_name,
          variant_id: v._id
        }))
      }]
    }

    // Fallback cho trường hợp sản phẩm không khai báo Variants attributes
    // Bỏ qua cho GPU và Monitor
    if (!isGPU && !isMonitor && product?.name) {
      const capMatch = product.name.match(/\b(\d+\s*GB|\d+\s*TB)\b/i)
      if (capMatch) {
        const extractedCap = capMatch[1].replace(/\s+/g, '').toUpperCase()
        return [{
          attribute_name: 'Dung lượng RAM',
          options: [{
            value_name: extractedCap,
            variant_id: activeVariant?._id
          }]
        }]
      }
    }

    return []
  }



  const isMatchStr = (s1, s2, groupName = '') => {
    if (s1 === undefined || s1 === null || s2 === undefined || s2 === null) return false
    const str1 = s1.toString().trim().toLowerCase()
    const str2 = s2.toString().trim().toLowerCase()
    if (str1 === str2) return true

    if (groupName) {
      return getNormalizedKey(groupName, s1) === getNormalizedKey(groupName, s2)
    }

    return false
  }

  const handleSelectAttributeOption = (group, opt) => {
    // 1. Cập nhật state chọn thuộc tính ngay lập tức để nút tùy chọn sáng vàng & hiển thị tick ✓
    const newSelectedAttrs = {
      ...selectedAttributes,
      [group.attribute_name]: opt.value_name
    }
    setSelectedAttributes(newSelectedAttrs)

    if (!Variants || Variants.length === 0) return

    if (group.attribute_name === 'Phiên bản / Biến thể' || group.attribute_name === 'Phiên bản' || group.attribute_name === 'Phiên bản / Dung lượng') {
      if (opt.variant_id) {
        setSelectedVariantId(opt.variant_id)
        setQuantity(1)
      }
      return
    }

    // 2. Lọc các biến thể bắt buộc khớp thuộc tính vừa click
    let candidateVariants = Variants.filter(v => {
      const attrs = v.Attributes || v.attributes || []
      const matchedAttr = attrs.find(a => isMatchStr(a.attribute_name || a.name, group.attribute_name))
      if (matchedAttr) {
        return isMatchStr(matchedAttr.value_name || matchedAttr.value, opt.value_name, group.attribute_name)
      }
      if (opt.variant_id && String(v._id) === String(opt.variant_id)) {
        return true
      }
      return false
    })

    if (candidateVariants.length === 0) {
      candidateVariants = Variants
    }

    // 3. Tìm biến thể phù hợp nhất trong candidates theo điểm số
    let bestVariant = null
    let maxScore = -1

    candidateVariants.forEach(v => {
      const attrs = v.Attributes || v.attributes || []
      let score = 0
      Object.entries(newSelectedAttrs).forEach(([gName, valName]) => {
        if (attrs.some(a =>
          isMatchStr(a.attribute_name || a.name, gName) &&
          isMatchStr(a.value_name || a.value, valName, gName)
        )) {
          score++
        }
      })
      if (opt.variant_id && String(v._id) === String(opt.variant_id)) {
        score += 0.5
      }
      if (score > maxScore) {
        maxScore = score
        bestVariant = v
      }
    })

    if (!bestVariant && opt.variant_id) {
      bestVariant = Variants.find(v => String(v._id) === String(opt.variant_id))
    }

    if (bestVariant && bestVariant._id !== selectedVariantId) {
      setSelectedVariantId(bestVariant._id)
      setQuantity(1)
    }
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (value > 0) setQuantity(Math.min(value, availableStock))
  }

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error('Sản phẩm này hiện tại chưa có sẵn biến thể!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && activeVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && quantity > activeVariant.stock_quantity) {
      toast.error(`Chỉ còn lại ${activeVariant.stock_quantity} sản phẩm trong kho!`, { position: 'bottom-right' })
      return
    }

    const cartPayload = {
      product_id: product._id,
      variant_id: activeVariant._id,
      name: product.name,
      sku: activeVariant?.sku || product?.sku || product?.code || '',
      variantName: activeVariant?.variant_name && activeVariant?.variant_name !== 'Mặc định' ? activeVariant.variant_name : (activeVariant.attributes && activeVariant.attributes.length > 0 ? activeVariant.attributes.map(a => a.value).join(', ') : ''),
      price: currentPrice,
      quantity,
      image: images[0],
      stock_quantity: activeVariant?.stock_quantity
    }

    // Chưa đăng nhập → lưu localStorage qua Redux
    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload))
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, { position: 'bottom-right', autoClose: 3000 })
      return
    }

    // Đã đăng nhập → đồng bộ lên DB
    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: activeVariant._id,
          quantity: quantity
        })
      })
      const data = await res.json()

      if (res.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!', { position: 'bottom-right', autoClose: 3000 })
        return
      }
      if (!data.success) {
        toast.error(data.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right', autoClose: 3000 })
        return
      }

      localStorage.removeItem('cartItems')
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, { position: 'bottom-right', autoClose: 3000 })
    } catch (err) {
      toast.error('Không thể kết nối tới server!', { position: 'bottom-right' })
    }
  }

  const handleQuickAddToCart = async (product) => {
    if (!product) return;
    const variantsList = product.Variants || [];
    const activeVar = variantsList.find(v => v.variant_name === 'Mặc định') || variantsList[0];
    const price = activeVar && activeVar.sale_price > 0 ? activeVar.sale_price : (activeVar?.price || product.price || 0);

    const cartPayload = {
      product_id: product._id,
      variant_id: activeVar ? activeVar._id : null,
      name: product.name,
      sku: activeVar?.sku || product?.sku || product?.code || '',
      variantName: activeVar?.variant_name && activeVar?.variant_name !== 'Mặc định' ? activeVar.variant_name : '',
      price,
      quantity: 1,
      image: (product.AnhSP && product.AnhSP.length > 0) ? product.AnhSP[0].url : (product.thumnail || product.image)
    };

    if (!isLoggedIn) {
      dispatch(addToCart(cartPayload));
      toast.success('Đã thêm vào giỏ hàng!', { position: 'bottom-right' });
      return;
    }

    try {
      if (activeVar) {
        await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: activeVar._id, quantity: 1 })
        });
      }
      localStorage.removeItem('cartItems')
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'bottom-right' });
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!', { position: 'bottom-right' });
    }
  }

  const handleBuyNow = () => {
    if (!activeVariant) {
      toast.error('Sản phẩm này hiện tại chưa có sẵn biến thể!', { position: 'bottom-right' })
      return
    }
    if (activeVariant.stock_quantity !== undefined && activeVariant.stock_quantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng!', { position: 'bottom-right' })
      return
    }
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện mua hàng!', { position: 'bottom-right' })
      navigate('/login?redirect=/checkout')
      return
    }
    const price = activeVariant.sale_price > 0 ? activeVariant.sale_price : activeVariant.price
    const variantName = activeVariant?.variant_name && activeVariant?.variant_name !== 'Mặc định'
      ? activeVariant.variant_name
      : (activeVariant.attributes && activeVariant.attributes.length > 0
          ? activeVariant.attributes.map(a => a.value).join(', ')
          : (activeVariant.Attributes && activeVariant.Attributes.length > 0
              ? activeVariant.Attributes.map(a => a.value_name || a.value).join(', ')
              : ''))
    const sku = activeVariant?.sku || product?.sku || product?.code || ''

    const buyNowItem = {
      cartItem: {
        _id: activeVariant._id,
        variant_id: activeVariant._id,
        quantity: quantity,
        price: price
      },
      variant: activeVariant,
      product: {
        _id: product?._id || slug,
        name: product?.name || 'Sản phẩm'
      },
      AnhSP: activeVariant.image ? [{ url: activeVariant.image }] : (product?.thumnail ? [{ url: product.thumnail }] : []),
      _localPrice: price,
      _variantId: activeVariant._id,
      _isBuyNow: true,
      _variantName: variantName,
      _sku: sku,
      variantName: variantName,
      sku: sku
    }
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
    navigate('/checkout', { state: { buyNowItem } })
  }

  // ── ReviewSection component (Purchase-check & Customer Reviews) ──
  const ReviewSection = () => {
    const [previewImage, setPreviewImage] = useState(null)

    const [eligibility, setEligibility] = useState({ canReview: false, hasPurchased: false, reason: null, order_item_id: null })
    const [checkingEligibility, setCheckingEligibility] = useState(true)

    const [rStars, setRStars] = useState(5)
    const [rContent, setRContent] = useState('')
    const [rSubmitting, setRSubmitting] = useState(false)
    const [rMsg, setRMsg] = useState(null)

    const productId = product?._id || slug

    // Check eligibility for logged in user
    const checkUserEligibility = async () => {
      if (!isLoggedIn || !productId) {
        setEligibility({ canReview: false, hasPurchased: false, reason: 'not_logged_in' })
        setCheckingEligibility(false)
        return
      }

      try {
        setCheckingEligibility(true)
        const data = await reviewAPI.checkEligibility(productId)
        if (data.success) {
          setEligibility(data)
        }
      } catch (e) {
        setEligibility({ canReview: false, hasPurchased: false, reason: 'error' })
      } finally {
        setCheckingEligibility(false)
      }
    }

    // Chỉ check eligibility — loadReviews() đã được gọi từ parent khi fetch sản phẩm
    useEffect(() => {
      checkUserEligibility()
    }, [productId, isLoggedIn])

    const handleSubmitReview = async (e) => {
      e.preventDefault()
      setRMsg(null)

      if (!eligibility.order_item_id) {
        setRMsg({ type: 'error', text: 'Không xác định được đơn hàng để đánh giá.' })
        return
      }
      if (!rContent.trim()) {
        setRMsg({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá' })
        return
      }

      setRSubmitting(true)
      try {
        const data = await reviewAPI.createReview(eligibility.order_item_id, rContent.trim(), rStars)
        if (data.success) {
          setRMsg({ type: 'success', text: 'Gửi đánh giá thành công! Cảm ơn bạn đã chia sẻ.' })
          setRContent('')
          setRStars(5)
          loadReviews()
          checkUserEligibility()
        } else {
          setRMsg({ type: 'error', text: data.message || 'Gửi đánh giá thất bại' })
        }
      } catch (err) {
        setRMsg({ type: 'error', text: err.message || 'Lỗi kết nối server' })
      } finally {
        setRSubmitting(false)
      }
    }

    return (
      <div className="product-reviews-container" style={{ color: '#ccc' }}>
        {/* Thông báo chính sách Đánh giá */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', fontSize: '13px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: '#e4e4e7', flexShrink: 0 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>🔒 <strong>Chính sách đánh giá:</strong> Đánh giá sản phẩm chỉ dành cho khách hàng đã mua và hoàn tất đơn hàng (thực hiện trực tiếp tại mục <strong>Lịch sử đơn hàng</strong>).</span>
        </div>

        {/* Danh sách Đánh giá của Khách hàng (Công khai cho tất cả người xem) */}
        <div className="reviews-list-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
            <h4 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              ĐÁNH GIÁ TỪ KHÁCH HÀNG ({reviewsList.length})
            </h4>
            {reviewsList.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#fbbf24', fontWeight: 700 }}>
                <span>★ {avgRating}/5</span>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>({reviewsList.length} nhận xét)</span>
              </div>
            )}
          </div>

          {loadingReviews ? (
            <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>Đang tải danh sách đánh giá...</div>
          ) : reviewsList.length === 0 ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#777', fontSize: '13px' }}>
              Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên mua và trải nghiệm sản phẩm!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviewsList.map(r => (
                <div key={r._id} style={{ background: '#121621', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-color, #c8e600)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                        {r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{r.userName}</div>
                        <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px' }}>✓ Đã mua hàng tại WinNoTech</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', fontSize: '14px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ color: s <= r.star_number ? '#fbbf24' : '#444' }}>★</span>
                    ))}
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#ddd', lineHeight: '1.6' }}>
                    {r.content}
                  </p>

                  {/* Review Images */}
                  {Array.isArray(r.images) && r.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                      {r.images.map((imgUrl, imgIdx) => {
                        const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`
                        return (
                          <img
                            key={imgIdx}
                            src={fullUrl}
                            alt={`Review image ${imgIdx + 1}`}
                            onClick={() => setPreviewImage(fullUrl)}
                            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox Preview Modal */}
        {previewImage && (
          <div 
            onClick={() => setPreviewImage(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}
          >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img src={previewImage} alt="Enlarged review" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', border: '1px solid #333' }} />
              <button 
                onClick={() => setPreviewImage(null)}
                style={{ position: 'absolute', top: '-14px', right: '-14px', background: '#d4ff00', color: '#000', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <DefaultLayout>
      {/* BREADCRUMB */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-inner">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>Sản phẩm</span>
          <span>/</span>
          <span>{product.cat_id?.name || 'Linh kiện'}</span>
          <span>/</span>
          <span style={{ color: 'var(--accent-color)' }}>{product.name}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="product-detail-section">
        <div className="section-inner">
          {/* PRODUCT MAIN */}
          <main className="product-main">
              <div className="product-grid">
                {/* LEFT: IMAGE GALLERY */}
                <div className="product-gallery">
                  <div className="gallery-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  {images.length > 1 && (
                    <div className="gallery-thumbnails">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          className={`gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                          onClick={() => setSelectedImage(idx)}
                          style={{ borderRadius: '4px', overflow: 'hidden' }}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </button>
                      ))}
                    </div>
                  )}

                </div>

                {/* RIGHT: PRODUCT INFO */}
                <div className="product-info-section">
                  <div className="product-header-info">
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Thương hiệu: <span style={{ color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer' }}>{product.brand_id?.name || 'Chính hãng'}</span>
                    </div>
                    <h1 className="product-title" style={{ fontSize: '22px', fontWeight: 700, margin: '4px 0 10px 0', color: '#fff', lineHeight: '1.4' }}>
                      {product.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>SKU: {activeVariant?.sku || product.sku || String(product._id || '').slice(-8).toUpperCase()}</span>
                      <span style={{ color: '#333' }}>|</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#fbbf24' }}>⭐ {reviewsList.length > 0 ? Number(avgRating).toFixed(1) : '5.0'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({reviewsList.length} đánh giá)</span>
                      </div>
                      <span style={{ color: '#333' }}>|</span>
                      <span style={{ color: '#ffb703', fontWeight: 600 }}>
                        Đã bán: {product.sold_count ?? 0}
                      </span>
                      <span style={{ color: '#333' }}>|</span>
                      <span className="status-badge" style={{ 
                        background: isOutOfStock ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', 
                        color: isOutOfStock ? '#ef4444' : '#22c55e', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {isOutOfStock ? 'Hết hàng' : (activeVariant && activeVariant.stock_quantity !== undefined ? `Còn hàng (${availableStock} sản phẩm)` : 'Còn hàng')}
                      </span>
                    </div>
                  </div>

                  {/* SHORT DESC */}
                  <div className="specs-table" style={{ marginTop: '16px', background: 'var(--dark2)', padding: '12px 15px', borderRadius: '8px', border: '1px solid #333' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      {product.short_desc || 'Không có mô tả ngắn cho sản phẩm này.'}
                    </p>
                  </div>

                  {/* PRICE */}
                  <div className="product-pricing" style={{ margin: '16px 0' }}>
                    <span className="price-note" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Giá đã bao gồm VAT</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginTop: '4px' }}>
                      <span className="price-main" style={{ fontSize: '28px', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                        {formatPrice(currentPrice)}
                      </span>
                      {hasSale && (
                        <span className="price-original" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '16px' }}>
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ATTRIBUTE GROUPS & ATTRIBUTE VALUE SELECTION (MATCHING WEBSITE THEME) */}
                  {(() => {
                    const attributeGroups = getGroupedAttributes()
                    if (attributeGroups.length === 0) return null

                    return (
                      <div className="attribute-groups-container" style={{ margin: '16px 0 20px 0' }}>
                        {attributeGroups.map((group, groupIdx) => {
                          const isFallbackGroup = group.attribute_name === 'Phiên bản / Biến thể' || group.attribute_name === 'Phiên bản' || group.attribute_name === 'Phiên bản / Dung lượng'
                          const currentSelectedVal = selectedAttributes[group.attribute_name]

                          return (
                            <div key={groupIdx} style={{ marginBottom: '14px' }}>
                              <div style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                {group.attribute_name}
                              </div>
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {group.options.map((opt, optIdx) => {
                                  let isSelected = false
                                  if (isFallbackGroup) {
                                    isSelected = (selectedVariantId === opt.variant_id) || (!selectedVariantId && opt.variant_id === activeVariant?._id)
                                  } else if (currentSelectedVal) {
                                    isSelected = isMatchStr(currentSelectedVal, opt.value_name, group.attribute_name)
                                  } else {
                                    isSelected = (optIdx === 0)
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      onClick={() => handleSelectAttributeOption(group, opt)}
                                      style={{
                                        position: 'relative',
                                        background: isSelected ? 'rgba(200, 230, 0, 0.12)' : 'var(--dark2)',
                                        color: isSelected ? 'var(--accent-color)' : '#e2e8f0',
                                        border: isSelected ? '1.5px solid var(--accent-color)' : '1px solid rgba(255, 255, 255, 0.15)',
                                        padding: '8px 22px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: isSelected ? 700 : 500,
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                        minWidth: '80px',
                                        textAlign: 'center',
                                        boxShadow: isSelected ? '0 0 12px rgba(200, 230, 0, 0.25)' : 'none'
                                      }}
                                    >
                                      {opt.value_name}
                                      {isSelected && (
                                        <div style={{
                                          position: 'absolute',
                                          bottom: 0,
                                          right: 0,
                                          width: '15px',
                                          height: '15px',
                                          background: 'var(--accent-color)',
                                          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                                          display: 'flex',
                                          alignItems: 'flex-end',
                                          justifyContent: 'flex-end',
                                        }}>
                                          <span style={{
                                            color: '#000000',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            lineHeight: 1,
                                            marginRight: '1px'
                                          }}>✓</span>
                                        </div>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}

                  {/* QUANTITY & ACTIONS */}
                  <div className="product-actions">
                    <div className="quantity-selector">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="qty-btn"
                        disabled={isOutOfStock}
                        style={{ opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                      >−</button>
                      <input 
                        type="number" 
                        value={isOutOfStock ? 0 : quantity} 
                        onChange={handleQuantityChange}
                        className="qty-input"
                        disabled={isOutOfStock}
                        style={{ color: isOutOfStock ? '#666' : '#fff' }}
                      />
                      <button 
                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                        className="qty-btn"
                        disabled={isOutOfStock}
                        style={{ opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                      >+</button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flex: 1, width: '100%', alignItems: 'center' }}>
                      <button 
                        className="btn-add-cart" 
                        onClick={handleAddToCart} 
                        disabled={isOutOfStock}
                        style={{ 
                          flex: 1,
                          height: '48px',
                          background: isOutOfStock ? '#333' : 'transparent', 
                          color: isOutOfStock ? '#888' : '#e4e4e7', 
                          border: isOutOfStock ? '1px solid #444' : '1px solid #e4e4e7',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          borderRadius: '8px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOutOfStock ? '#888' : '#e4e4e7'} strokeWidth="2">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {isOutOfStock ? 'HẾT HÀNG' : 'THÊM GIỎ HÀNG'}
                      </button>
                      <button 
                        className="btn-buy-now" 
                        onClick={handleBuyNow} 
                        disabled={isOutOfStock}
                        style={{ 
                          flex: 1,
                          height: '48px',
                          background: isOutOfStock ? '#444' : 'transparent', 
                          color: isOutOfStock ? '#888' : '#76b900', 
                          border: isOutOfStock ? 'none' : '1.5px solid #76b900',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          borderRadius: '8px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOutOfStock ? '#888' : '#76b900'} strokeWidth="2">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        {isOutOfStock ? 'HẾT HÀNG' : 'MUA NGAY'}
                      </button>
                    </div>
                  </div>

                  <button 
                    className="btn-wishlist"
                    onClick={(e) => {
                      e.preventDefault();
                      if (product) toggleFavorite(product._id);
                    }}
                    style={{ color: (product && favoriteIds.has(product._id)) ? '#ef4444' : '#fff' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={(product && favoriteIds.has(product._id)) ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    YÊU THÍCH
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="product-tabs" style={{ marginTop: '40px' }}>
                <div className="tabs-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '30px' }}>
                  <button 
                    className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('specs')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'specs' ? '3px solid var(--accent-color, #c8e600)' : '3px solid transparent',
                      color: activeTab === 'specs' ? 'var(--accent-color, #c8e600)' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '15px',
                      padding: '12px 4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    THÔNG SỐ KỸ THUẬT
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'description' ? '3px solid var(--accent-color, #c8e600)' : '3px solid transparent',
                      color: activeTab === 'description' ? 'var(--accent-color, #c8e600)' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '15px',
                      padding: '12px 4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    CHI TIẾT SẢN PHẨM
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'reviews' ? '3px solid var(--accent-color, #c8e600)' : '3px solid transparent',
                      color: activeTab === 'reviews' ? 'var(--accent-color, #c8e600)' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '15px',
                      padding: '12px 4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ĐÁNH GIÁ SẢN PHẨM
                  </button>
                </div>

                <div className="tabs-content" style={{ padding: '24px 0' }}>
                  {activeTab === 'specs' && (
                    <div className="tab-pane">
                      <SpecsTable product={product} />
                    </div>
                  )}

                  {activeTab === 'description' && (
                    <div className="tab-pane">
                      <FormattedDescription 
                        product={product}
                        activeVariant={activeVariant}
                        text={product.description || product.description_detail || product.short_desc} 
                        attributes={activeAttributes}
                        groupedAttributes={getGroupedAttributes()}
                      />
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="tab-pane">
                      <ReviewSection />
                    </div>
                  )}
                </div>
              </div>

              {/* RELATED PRODUCTS */}
              {relatedProducts.length > 0 && (
                <div className="related-products" style={{ marginTop: '50px' }}>
                  <div className="related-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>SẢN PHẨM LIÊN QUAN</h2>
                  </div>
                  <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {relatedProducts.map((item) => (
                      <ProductCard 
                        key={item._id} 
                        product={item} 
                        favoriteIds={favoriteIds} 
                        onToggleFavorite={toggleFavorite} 
                        onAddToCart={handleQuickAddToCart} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* RECENTLY VIEWED PRODUCTS SECTION */}
              <RecentlyViewedSection currentSlug={slug} />
            </main>
        </div>
      </div>
    </DefaultLayout>
  )
}
