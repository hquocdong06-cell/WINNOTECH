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

// ── SpecsTable Component (Tự động dựng bảng thông số chi tiết chuẩn hóa theo từng danh mục LINH KIỆN PC & CHUỘT) ──
const SpecsTable = ({ product, activeVariant, attributes, groupedAttributes }) => {
  const getCategorizedSpecs = () => {
    const generalList = []
    const detailList = []
    const map = new Map()

    const addSpec = (group, name, value) => {
      if (!name || !value || value === '—') return
      const key = name.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, true)
        const item = { name: name.trim(), value: String(value).trim() }
        if (group === 'general') generalList.push(item)
        else detailList.push(item)
      }
    }

    const generalKeys = [
      'thương hiệu', 'bảo hành', 'tên của case', 'chất liệu', 'kiểu ổ cứng', 'màu sắc của ổ cứng', 'loại hàng', 
      'part-number', 'màu sắc', 'đèn led', 'nhu cầu', 'tên', 'kết nối bàn phím', 
      'loại bàn phím', 'brand', 'warranty', 'tình trạng'
    ]

    // 1. Thêm thuộc tính từ DB (nếu có)
    if (Array.isArray(attributes) && attributes.length > 0) {
      attributes.forEach(a => {
        const name = a.attribute_name || a.name
        const val = a.value_name || a.value
        if (name && val) {
          const k = name.trim().toLowerCase()
          if (generalKeys.includes(k)) addSpec('general', name, val)
          else addSpec('detail', name, val)
        }
      })
    }
    if (Array.isArray(groupedAttributes) && groupedAttributes.length > 0) {
      groupedAttributes.forEach(g => {
        const name = g.attribute_name
        const val = (g.options || []).map(o => o.value_name).join(', ')
        if (name && val) {
          const k = name.trim().toLowerCase()
          if (generalKeys.includes(k)) addSpec('general', name, val)
          else addSpec('detail', name, val)
        }
      })
    }

    // 2. Phân loại theo Danh Mục & Tên Sản Phẩm để tự động bổ sung bảng thông số kỹ thuật đầy đủ
    const pName = (product?.name || '').toUpperCase()
    const catName = (product?.cat_id?.name || product?.cat_id?.slug || '').toLowerCase()

    // ── RAM ──
    if (catName.includes('ram') || pName.includes('DDR4') || pName.includes('DDR5')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('CORSAIR') ? 'Corsair' : pName.includes('G.SKILL') ? 'G.Skill' : pName.includes('KINGSTON') ? 'Kingston' : 'Apacer'))
      }
      if (!map.has('bảo hành')) {
        let warranty = '36 tháng'
        if (pName.includes('DOMINATOR') || pName.includes('TRIDENT Z5')) warranty = '60 tháng'
        addSpec('general', 'Bảo hành', warranty)
      }
      if (!map.has('loại hàng')) {
        let productType = 'Hàng thông thường'
        if (pName.includes('RGB') || pName.includes('TITANIUM') || pName.includes('TRIDENT')) productType = 'Hàng cao cấp chính hãng'
        addSpec('general', 'Loại hàng', productType)
      }
      if (!map.has('part-number')) {
        addSpec('general', 'Part-number', `AH5U16G60C622NWAA-1`)
      }
      if (!map.has('màu sắc')) {
        let col = 'Bạc'
        if (pName.includes('BLACK') || pName.includes('ĐEN')) col = 'Đen'
        else if (pName.includes('WHITE') || pName.includes('TRẮNG')) col = 'Trắng'
        else if (pName.includes('SILVER') || pName.includes('BẠC')) col = 'Bạc'
        addSpec('general', 'Màu sắc', col)
      }
      if (!map.has('đèn led')) {
        let led = 'RGB'
        if (pName.includes('NO LED') || pName.includes('RIPJAWS S5')) led = 'Không LED'
        else if (pName.includes('ARGB')) led = 'ARGB'
        addSpec('general', 'Đèn LED', led)
      }
      if (!map.has('nhu cầu')) {
        addSpec('general', 'Nhu cầu', 'Gaming')
      }

      // Cấu hình chi tiết
      if (!map.has('dung lượng')) {
        let cap = '1 x 16GB'
        if (pName.includes('64G') || pName.includes('2X32GB')) cap = '2 x 32GB'
        else if (pName.includes('32GB') || pName.includes('2X16GB')) cap = '2 x 16GB'
        else if (pName.includes('8GB')) cap = '1 x 8GB'
        addSpec('detail', 'Dung lượng', cap)
      }
      if (!map.has('thế hệ')) {
        let gen = 'DDR5'
        if (pName.includes('DDR4')) gen = 'DDR4'
        addSpec('detail', 'Thế hệ', gen)
      }
      if (!map.has('bus')) {
        let busSpeed = '6000MHz'
        if (pName.includes('6600') || pName.includes('6600MHZ')) busSpeed = '6600MHz'
        else if (pName.includes('5600') || pName.includes('5600MHZ')) busSpeed = '5600MHz'
        else if (pName.includes('5200') || pName.includes('5200MHZ')) busSpeed = '5200MHz'
        else if (pName.includes('3600') || pName.includes('3600MHZ')) busSpeed = '3600MHz'
        else if (pName.includes('3200') || pName.includes('3200MHZ')) busSpeed = '3200MHz'
        addSpec('detail', 'Bus', busSpeed)
      }
      if (!map.has('timing')) {
        let timingVal = '38'
        if (pName.includes('DDR4')) timingVal = '16'
        else if (pName.includes('6000')) timingVal = '30'
        else if (pName.includes('6600')) timingVal = '32'
        addSpec('detail', 'Timing', timingVal)
      }
      if (!map.has('voltage')) {
        let volt = '1.35V'
        if (pName.includes('DDR4')) volt = '1.2V'
        else if (pName.includes('6600')) volt = '1.4V'
        addSpec('detail', 'Voltage', volt)
      }
    }

    // ── BÀN PHÍM / KEYBOARD ──
    if (catName.includes('bàn phím') || catName.includes('keyboard') || catName.includes('ban-phim') || pName.includes('BÀN PHÍM') || pName.includes('KEYBOARD')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('CORSAIR') ? 'Corsair' : pName.includes('LOGITECH') ? 'Logitech' : pName.includes('RAZER') ? 'Razer' : pName.includes('AKKO') ? 'Akko' : 'Corsair'))
      }
      if (!map.has('bảo hành')) {
        let warranty = '24 tháng'
        if (pName.includes('DAREU') || pName.includes('AKKO')) warranty = '12 tháng'
        addSpec('general', 'Bảo hành', warranty)
      }
      if (!map.has('tên')) {
        addSpec('general', 'Tên', product?.name || 'Bàn phím cơ Gaming')
      }
      if (!map.has('part-number')) {
        addSpec('general', 'Part-number', `CH-${Math.floor(100000 + Math.random() * 899999)}J-NA`)
      }
      if (!map.has('màu sắc')) {
        let col = 'Trắng'
        if (pName.includes('BLACK') || pName.includes('ĐEN')) col = 'Đen'
        else if (pName.includes('WHITE') || pName.includes('TRẮNG')) col = 'Trắng'
        else if (pName.includes('RETRO') || pName.includes('GRAY')) col = 'Xám Retro'
        else if (pName.includes('PINK') || pName.includes('HỒNG')) col = 'Hồng'
        addSpec('general', 'Màu sắc', col)
      }
      if (!map.has('kết nối')) {
        let connType = 'Bàn phím không dây'
        if (pName.includes('CÓ DÂY') || pName.includes('WIRED')) connType = 'Bàn phím có dây'
        else if (pName.includes('DUAL') || pName.includes('3 MODE') || pName.includes('TRIPLE')) connType = 'Bàn phím Không dây & Có dây'
        addSpec('general', 'Kết nối', connType)
      }
      if (!map.has('kết nối bàn phím')) {
        let kbConn = 'USB Type-C, 2.4GHz Wireless, Bluetooth 5.1'
        if (pName.includes('CÓ DÂY') || pName.includes('WIRED')) kbConn = 'USB'
        addSpec('general', 'Kết nối bàn phím', kbConn)
      }
      if (!map.has('kích thước')) {
        let sizeLayout = 'Layout TKL 87'
        if (pName.includes('MINI') || pName.includes('60%') || pName.includes('60')) sizeLayout = 'Layout 60'
        else if (pName.includes('FULL') || pName.includes('108') || pName.includes('104')) sizeLayout = 'Layout Fullsize 108'
        else if (pName.includes('75%') || pName.includes('75')) sizeLayout = 'Layout 75%'
        addSpec('general', 'Kích thước', sizeLayout)
      }
      if (!map.has('loại bàn phím')) {
        let kbType = 'Bàn phím cơ'
        if (pName.includes('GIẢ CƠ') || pName.includes('MEMBRANE')) kbType = 'Bàn phím giả cơ'
        addSpec('general', 'Loại bàn phím', kbType)
      }
      if (!map.has('nhu cầu')) {
        addSpec('general', 'Nhu cầu', 'Gaming')
      }

      // Cấu hình chi tiết
      if (!map.has('đèn')) {
        let led = 'RGB'
        if (pName.includes('MONO') || pName.includes('WHITE LED')) led = 'Đơn sắc White'
        else if (pName.includes('NO LED') || pName.includes('KHÔNG LED')) led = 'Không LED'
        addSpec('detail', 'Đèn', led)
      }
      if (!map.has('kiểu switch')) {
        let sw = 'CORSAIR MGX Hyperdrive Core'
        if (pName.includes('AKKO')) sw = 'Akko CS Switches (Linear/Tactile)'
        else if (pName.includes('LOGITECH') || pName.includes('G PRO')) sw = 'GX Blue / Red Linear Mechanical Switches'
        else if (pName.includes('RAZER')) sw = 'Razer™ Optical Mechanical Switches'
        else if (pName.includes('CHERRY')) sw = 'Cherry MX Red Switches'
        else if (pName.includes('KEYCHRON')) sw = 'Gateron G Pro Mechanical Switches'
        addSpec('detail', 'Kiểu switch', sw)
      }
    }

    // ── CHUỘT / MOUSE ──
    if (catName.includes('chuột') || catName.includes('mouse') || catName.includes('chuot') || pName.includes('CHUỘT') || pName.includes('MOUSE')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('LOGITECH') ? 'Logitech' : pName.includes('RAZER') ? 'Razer' : pName.includes('ASUS') ? 'ASUS' : 'ATK'))
      }
      if (!map.has('bảo hành')) {
        let warranty = '12 tháng'
        if (pName.includes('LOGITECH') || pName.includes('RAZER') || pName.includes('ASUS')) warranty = '24 tháng'
        addSpec('general', 'Bảo hành', warranty)
      }
      if (!map.has('nhu cầu')) {
        addSpec('general', 'Nhu cầu', 'Gaming')
      }

      // Cấu hình chi tiết
      if (!map.has('kiểu kết nối')) {
        let connType = 'Chuột không dây'
        if (pName.includes('CÓ DÂY') || pName.includes('WIRED')) connType = 'Chuột có dây'
        else if (pName.includes('DUAL') || pName.includes('HYBRID')) connType = 'Chuột không dây & Có dây'
        addSpec('detail', 'Kiểu kết nối', connType)
      }
      if (!map.has('màu sắc')) {
        let col = 'Shadow White'
        if (pName.includes('BLACK') || pName.includes('ĐEN')) col = 'Shadow Black'
        else if (pName.includes('WHITE') || pName.includes('TRẮNG')) col = 'Shadow White'
        else if (pName.includes('PINK') || pName.includes('HỒNG')) col = 'Pink'
        else if (pName.includes('RED') || pName.includes('ĐỎ')) col = 'Crimson Red'
        addSpec('detail', 'Màu sắc', col)
      }
      if (!map.has('kết nối')) {
        let conn = 'USB Type C, 2.4 GHz Wireless'
        if (pName.includes('CÓ DÂY') || pName.includes('WIRED')) conn = 'USB Type-C'
        else if (pName.includes('BLUETOOTH')) conn = 'USB Type C, 2.4 GHz Wireless, Bluetooth 5.1'
        addSpec('detail', 'Kết nối', conn)
      }
      if (!map.has('kiểu cầm')) {
        let grip = 'Ambidextrous / Đối xứng'
        if (pName.includes('G502') || pName.includes('HARPE') || pName.includes('ERGO')) grip = 'Ergonomic / Công thái học'
        addSpec('detail', 'Kiểu cầm', grip)
      }
      if (!map.has('switch')) {
        let sw = 'ATK Swiftlight Switches'
        if (pName.includes('SUPERLIGHT 2') || pName.includes('G502 X')) sw = 'LIGHTFORCE Hybrid Optical-Mechanical Switches'
        else if (pName.includes('VIPER V3') || pName.includes('RAZER')) sw = 'Razer™ Optical Mouse Switches Gen-3'
        else if (pName.includes('ROG HARPE') || pName.includes('ASUS')) sw = 'ROG Micro Switches (70M Click)'
        addSpec('detail', 'Switch', sw)
      }
      if (!map.has('độ phân giải (cpi/dpi)') && !map.has('độ phân giải')) {
        let dpi = '4000DPI'
        if (pName.includes('SUPERLIGHT 2')) dpi = '32000 DPI'
        else if (pName.includes('VIPER V3')) dpi = '30000 DPI'
        else if (pName.includes('HARPE ACE')) dpi = '36000 DPI'
        else if (pName.includes('G502')) dpi = '25600 DPI'
        addSpec('detail', 'Độ phân giải (CPI/DPI)', dpi)
      }
      if (!map.has('tên cảm biến')) {
        let sensor = 'PAW3955 Master'
        if (pName.includes('SUPERLIGHT 2') || pName.includes('G502')) sensor = 'HERO 2 Sensor'
        else if (pName.includes('VIPER V3')) sensor = 'Focus Pro 30K Optical Sensor'
        else if (pName.includes('HARPE ACE')) sensor = 'AimPoint Optical Sensor'
        addSpec('detail', 'Tên cảm biến', sensor)
      }
      if (!map.has('số nút bấm')) {
        let buttons = '6'
        if (pName.includes('G502')) buttons = '13'
        else if (pName.includes('VIPER V3') || pName.includes('SUPERLIGHT 2')) buttons = '5'
        addSpec('detail', 'Số nút bấm', buttons)
      }
      if (!map.has('kích thước')) {
        let dims = '12.7 x 6.4 x 4 cm'
        if (pName.includes('SUPERLIGHT 2')) dims = '12.5 x 6.35 x 4.0 cm'
        else if (pName.includes('VIPER V3')) dims = '12.7 x 6.4 x 3.9 cm'
        else if (pName.includes('G502')) dims = '13.1 x 7.9 x 4.1 cm'
        addSpec('detail', 'Kích thước', dims)
      }
      if (!map.has('khối lượng')) {
        let weight = '55g±3g'
        if (pName.includes('SUPERLIGHT 2')) weight = '60g'
        else if (pName.includes('VIPER V3')) weight = '54g'
        else if (pName.includes('HARPE ACE')) weight = '54g'
        else if (pName.includes('G502')) weight = '89g'
        addSpec('detail', 'Khối lượng', weight)
      }
    }
    // ── GPU / CARD ĐỒ HỌA ──
    else if (catName.includes('gpu') || catName.includes('vga') || catName.includes('card') || pName.includes('RTX') || pName.includes('RX ') || pName.includes('GTX')) {
      if (!map.has('thương hiệu')) addSpec('general', 'Thương hiệu', product?.brand_id?.name || 'Chính hãng')
      if (!map.has('bảo hành')) addSpec('general', 'Bảo hành', '36 Tháng Chính Hãng')
      if (!map.has('nhu cầu')) addSpec('general', 'Nhu cầu', 'Gaming & Đồ họa')

      if (!map.has('dung lượng vram')) {
        let vram = '16GB GDDR6X'
        if (pName.includes('4090')) vram = '24GB GDDR6X'
        else if (pName.includes('4080')) vram = '16GB GDDR6X'
        else if (pName.includes('4070 TI SUPER') || pName.includes('4070TIS')) vram = '16GB GDDR6X'
        else if (pName.includes('4070 TI')) vram = '12GB GDDR6X'
        else if (pName.includes('4070 SUPER') || pName.includes('4070')) vram = '12GB GDDR6X'
        else if (pName.includes('4060 TI 16GB')) vram = '16GB GDDR6'
        else if (pName.includes('4060 TI')) vram = '8GB GDDR6'
        else if (pName.includes('4060')) vram = '8GB GDDR6'
        addSpec('detail', 'Dung Lượng VRAM', vram)
      }
      if (!map.has('chiều dài card (length)')) {
        let len = '336 mm'
        if (pName.includes('DUAL') || pName.includes('MINI') || pName.includes('2X')) len = '227 mm'
        else if (pName.includes('TUF')) len = '305 mm'
        addSpec('detail', 'Chiều Dài Card (Length)', len)
      }
      if (!map.has('công suất card (tdp)')) addSpec('detail', 'Công Suất Card (TDP)', pName.includes('4090') ? '450W' : '285W')
      if (!map.has('nguồn khuyến dùng (recommended psu)')) addSpec('detail', 'Nguồn Khuyến Dùng (Recommended PSU)', pName.includes('4090') ? '1000W' : '750W')
      if (!map.has('chuẩn băng thông pcie')) addSpec('detail', 'Chuẩn Băng Thông PCIe', 'PCIe 4.0 x16')
      if (!map.has('cổng kết nối')) addSpec('detail', 'Cổng Kết Nối', '3x DisplayPort 1.4a, 1x HDMI 2.1a')
    }
    // ── CPU ──
    else if (catName.includes('cpu') || catName.includes('vi xử lý') || pName.includes('INTEL') || pName.includes('RYZEN') || pName.includes('CORE I')) {
      if (!map.has('thương hiệu')) addSpec('general', 'Thương hiệu', product?.brand_id?.name || 'Intel / AMD')
      if (!map.has('bảo hành')) addSpec('general', 'Bảo hành', '36 Tháng Chính Hãng')
      if (!map.has('nhu cầu')) addSpec('general', 'Nhu cầu', 'Gaming & Workstation')

      if (!map.has('socket hỗ trợ') && !map.has('socket')) {
        let socket = pName.includes('14900') || pName.includes('14700') || pName.includes('13900') ? 'LGA 1700' : 'AM5'
        addSpec('detail', 'Socket Hỗ Trợ', socket)
      }
      if (!map.has('số nhân / số luồng')) addSpec('detail', 'Số Nhân / Số Luồng', pName.includes('14900') ? '24 Nhân / 32 Luồng' : '16 Nhân / 24 Luồng')
      if (!map.has('xung nhịp cơ bản')) addSpec('detail', 'Xung Nhịp Cơ Bản', '3.4 GHz')
      if (!map.has('xung nhịp tối đa (boost)')) addSpec('detail', 'Xung Nhịp Tối Đa (Boost)', '5.4 GHz')
      if (!map.has('bộ nhớ đệm (cache)')) addSpec('detail', 'Bộ Nhớ Đệm (Cache L3)', '36MB L3 Cache')
      if (!map.has('công suất tiêu thụ (tdp)')) addSpec('detail', 'Công Suất Tiêu Thụ (TDP)', '125W')
    }
    // ── SSD / STORAGE ──
    else if (catName.includes('storage') || catName.includes('ssd') || catName.includes('hdd') || catName.includes('ổ cứng') || pName.includes('SSD') || pName.includes('NVME')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('SAMSUNG') ? 'Samsung' : pName.includes('KINGSTON') ? 'Kingston' : 'WD'))
      }
      if (!map.has('bảo hành')) {
        let warranty = '36 tháng'
        if (pName.includes('990 PRO') || pName.includes('SN850X')) warranty = '60 tháng'
        addSpec('general', 'Bảo hành', warranty)
      }
      if (!map.has('kiểu ổ cứng')) {
        let diskType = 'SSD'
        if (pName.includes('HDD')) diskType = 'HDD'
        addSpec('general', 'Kiểu ổ cứng', diskType)
      }
      if (!map.has('màu sắc của ổ cứng')) {
        let diskColor = 'Xanh lá'
        if (pName.includes('SN850X') || pName.includes('BLACK') || pName.includes('990 PRO')) diskColor = 'Đen'
        else if (pName.includes('BLUE')) diskColor = 'Xanh dương'
        addSpec('general', 'Màu sắc của ổ cứng', diskColor)
      }

      // Cấu hình chi tiết
      if (!map.has('dung lượng')) {
        let cap = '1TB'
        if (pName.includes('2TB')) cap = '2TB'
        else if (pName.includes('512GB') || pName.includes('500GB')) cap = '500GB'
        else if (pName.includes('256GB')) cap = '256GB'
        addSpec('detail', 'Dung lượng', cap)
      }
      if (!map.has('kết nối')) {
        let conn = 'M.2 NVMe'
        if (pName.includes('SATA')) conn = 'SATA3 6Gbps'
        else if (pName.includes('PCIE 4.0') || pName.includes('990 PRO')) conn = 'PCIe Gen4 x4 M.2 NVMe'
        addSpec('detail', 'Kết nối', conn)
      }
      if (!map.has('kích thước')) {
        let formFactor = 'M.2 2280'
        if (pName.includes('2.5') || pName.includes('SATA')) formFactor = '2.5 inch'
        addSpec('detail', 'Kích thước', formFactor)
      }
      if (!map.has('tốc độ vòng quay')) {
        addSpec('detail', 'Tốc độ vòng quay', '100 TB')
      }
      if (!map.has('tốc độ đọc')) {
        let readSpeed = '3200MB/s'
        if (pName.includes('990 PRO')) readSpeed = '7450MB/s'
        else if (pName.includes('SN850X')) readSpeed = '7300MB/s'
        addSpec('detail', 'Tốc độ đọc', readSpeed)
      }
      if (!map.has('tốc độ ghi')) {
        let writeSpeed = '2500MB/s'
        if (pName.includes('990 PRO')) writeSpeed = '6900MB/s'
        else if (pName.includes('SN850X')) writeSpeed = '6600MB/s'
        addSpec('detail', 'Tốc độ ghi', writeSpeed)
      }
    }
    // ── MAINBOARD / BO MẠCH CHỦ ──
    else if (catName.includes('mainboard') || catName.includes('bo mạch') || pName.includes('MAINBOARD') || pName.includes('Z790') || pName.includes('B760') || pName.includes('B650') || pName.includes('A520') || pName.includes('H610')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('ASUS') ? 'ASUS' : pName.includes('MSI') ? 'MSI' : 'Gigabyte'))
      }
      if (!map.has('bảo hành')) {
        addSpec('general', 'Bảo hành', '36 tháng')
      }
      if (!map.has('nhu cầu')) {
        let usage = pName.includes('ROG') || pName.includes('AORUS') || pName.includes('MORTAR') ? 'Gaming' : 'Văn phòng'
        addSpec('general', 'Nhu cầu', usage)
      }

      // Cấu hình chi tiết
      if (!map.has('chipset')) {
        let chip = 'B760'
        if (pName.includes('Z790')) chip = 'Z790'
        else if (pName.includes('B650')) chip = 'B650'
        else if (pName.includes('X670')) chip = 'X670'
        else if (pName.includes('A520')) chip = 'A520'
        else if (pName.includes('H610')) chip = 'H610'
        addSpec('detail', 'Chipset', chip)
      }
      if (!map.has('socket')) {
        let sock = 'LGA 1700'
        if (pName.includes('B650') || pName.includes('X670')) sock = 'AM5'
        else if (pName.includes('A520')) sock = 'AM4'
        addSpec('detail', 'Socket', sock)
      }
      if (!map.has('kích thước')) {
        let size = 'Micro-ATX'
        if (pName.includes('MAXIMUS') || pName.includes('ELITE AX') || pName.includes('Z790-A')) size = 'ATX'
        addSpec('detail', 'Kích thước', size)
      }
      if (!map.has('khe ram tối đa')) {
        let slots = '4 khe'
        if (pName.includes('A520') || pName.includes('H610')) slots = '2 khe'
        addSpec('detail', 'Khe RAM tối đa', slots)
      }
      if (!map.has('kiểu ram hỗ trợ')) {
        let rType = 'DDR5'
        if (pName.includes('A520') || pName.includes('DDR4')) rType = 'DDR4'
        addSpec('detail', 'Kiểu RAM hỗ trợ', rType)
      }
      if (!map.has('hỗ trợ bộ nhớ tối đa')) {
        let maxMem = '192GB'
        if (pName.includes('A520') || pName.includes('DDR4')) maxMem = '64GB'
        addSpec('detail', 'Hỗ trợ bộ nhớ tối đa', maxMem)
      }
      if (!map.has('bus ram hỗ trợ')) {
        let busRam = pName.includes('A520') || pName.includes('DDR4')
          ? '5100(O.C.), 4800(O.C.), 4600(O.C.), 4400(O.C.), 4266(O.C.), 4133(O.C.), 4000(O.C.), 3866(O.C.), 3733(O.C.), 3600(O.C.)'
          : '7800(O.C.), 7600(O.C.), 7200(O.C.), 6800(O.C.), 6400(O.C.), 6000(O.C.), 5600(O.C.)'
        addSpec('detail', 'Bus RAM hỗ trợ', busRam)
      }
      if (!map.has('lưu trữ')) {
        let stor = '2 x M.2 PCIe NVMe, 4 x SATA 3 6Gb/s'
        if (pName.includes('A520')) stor = '1 x M.2 SATA/NVMe, 4 x SATA 3 6Gb/s'
        addSpec('detail', 'Lưu trữ', stor)
      }
      if (!map.has('kiểu khe m.2 hỗ trợ')) {
        addSpec('detail', 'Kiểu khe M.2 hỗ trợ', 'M.2 SATA/NVMe')
      }
      if (!map.has('cổng xuất hình')) {
        let ports = '1 x HDMI 2.1, 1 x DisplayPort 1.4'
        if (pName.includes('A520')) ports = '1 x HDMI, 1 x VGA/D-sub'
        addSpec('detail', 'Cổng xuất hình', ports)
      }
      if (!map.has('khe pci')) {
        let pci = '1 x PCI Express x16, 1 x PCI Express x1'
        if (pName.includes('MAXIMUS') || pName.includes('ELITE AX')) pci = '2 x PCI Express x16, 2 x PCI Express x1'
        addSpec('detail', 'Khe PCI', pci)
      }
      if (!map.has('số cổng usb')) {
        addSpec('detail', 'Số cổng USB', '4 x USB 3.2 (tối đa 6), 2 x USB 2.0 (tối đa 6)')
      }
      if (!map.has('lan')) {
        let lanNet = '1 x LAN 2.5 Gb/s'
        if (pName.includes('A520')) lanNet = '1 x LAN 1 Gb/s'
        addSpec('detail', 'LAN', lanNet)
      }
      if (!map.has('âm thanh')) {
        addSpec('detail', 'Âm thanh', '- Realtek® Audio CODEC\n- High Definition Audio\n- 2/4/5.1/7.1-channel')
      }
    }
    // ── NGUỒN MÁY TÍNH / PSU ──
    else if (catName.includes('psu') || catName.includes('nguồn') || pName.includes('NGUỒN') || pName.includes('80 PLUS') || pName.includes('850W') || pName.includes('750W') || pName.includes('1000W')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('CORSAIR') ? 'Corsair' : pName.includes('MSI') ? 'MSI' : pName.includes('ASUS') ? 'ASUS' : 'DarkFlash'))
      }
      if (!map.has('bảo hành')) {
        let warranty = '60 tháng'
        if (pName.includes('RM1000X') || pName.includes('RM850X')) warranty = '120 tháng'
        else if (pName.includes('BRONZE')) warranty = '36 tháng'
        addSpec('general', 'Bảo hành', warranty)
      }
      if (!map.has('tên')) {
        addSpec('general', 'Tên', product?.name?.replace(/^Nguồn\s+/i, '') || 'PMT850')
      }
      if (!map.has('màu sắc')) {
        let col = 'Đen'
        if (pName.includes('WHITE') || pName.includes('TRẮNG')) col = 'Trắng'
        addSpec('general', 'Màu sắc', col)
      }

      // Cấu hình chi tiết
      if (!map.has('công suất tối đa')) {
        let power = '850W'
        if (pName.includes('1000W')) power = '1000W'
        else if (pName.includes('750W')) power = '750W'
        else if (pName.includes('650W')) power = '650W'
        addSpec('detail', 'Công suất tối đa', power)
      }
      if (!map.has('hiệu suất')) {
        let eff = '80 Plus Gold'
        if (pName.includes('BRONZE')) eff = '80 Plus Bronze'
        else if (pName.includes('PLATINUM')) eff = '80 Plus Platinum'
        addSpec('detail', 'Hiệu suất', eff)
      }
      if (!map.has('số cổng cắm')) {
        let conn = '1 x 20+4 pin MB, 2 x 8-pin (4+4) CPU, 2 x 8-pin (6+2) PCIE, 1 x 16-pin PCIE 5.1, 7 x SATA, 3 x Peripheral (4-pin)'
        if (pName.includes('1000W')) conn = '1 x 20+4 pin MB, 2 x 8-pin (4+4) CPU, 4 x 8-pin (6+2) PCIE, 1 x 16-pin PCIE 5.1, 10 x SATA, 4 x Peripheral (4-pin)'
        addSpec('detail', 'Số cổng cắm', conn)
      }
      if (!map.has('quạt làm mát')) {
        let fan = '1 x 120 mm'
        if (pName.includes('RM850X') || pName.includes('RM1000X')) fan = '1 x 135 mm FDB Fan'
        addSpec('detail', 'Quạt làm mát', fan)
      }
      if (!map.has('nguồn đầu vào')) {
        addSpec('detail', 'Nguồn đầu vào', '100 - 240VAC')
      }
    }
    // ── TẢN NHIỆT PC / CPU COOLER ──
    else if (catName.includes('cooler') || catName.includes('tản nhiệt') || pName.includes('TẢN NHIỆT') || pName.includes('COOLER') || pName.includes('KRAKEN') || pName.includes('H150I') || pName.includes('RYUJIN')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('ASUS') ? 'Asus' : pName.includes('NZXT') ? 'NZXT' : pName.includes('CORSAIR') ? 'Corsair' : pName.includes('DEEPCOOL') ? 'Deepcool' : 'Asus'))
      }
      if (!map.has('bảo hành')) {
        let warranty = '72 tháng'
        if (pName.includes('COOLER MASTER') || pName.includes('THERMALRIGHT')) warranty = '24 tháng'
        else if (pName.includes('DEEPCOOL') || pName.includes('MSI')) warranty = '36 tháng'
        addSpec('general', 'Bảo hành', warranty)
      }

      // Cấu hình chi tiết
      if (!map.has('dạng tản nhiệt')) {
        let cType = 'Tản nhiệt nước'
        if (pName.includes('KHÍ') || pName.includes('HYPER') || pName.includes('PEERLESS')) cType = 'Tản nhiệt khí'
        addSpec('detail', 'Dạng tản nhiệt', cType)
      }
      if (!map.has('kích thước quạt (mm)')) {
        let fanSize = '3 x 120 mm'
        if (pName.includes('240') || pName.includes('KHÍ') || pName.includes('HYPER')) fanSize = '2 x 120 mm'
        addSpec('detail', 'Kích thước quạt (mm)', fanSize)
      }
      if (!map.has('socket được hỗ trợ')) {
        addSpec('detail', 'Socket được hỗ trợ', 'AMD AM5, AMD AM4, Intel LGA 1851, Intel LGA 1700')
      }
      if (!map.has('đèn led')) {
        let led = 'ARGB'
        if (pName.includes('RGB')) led = 'RGB'
        else if (pName.includes('NO LED')) led = 'Không LED'
        addSpec('detail', 'Đèn LED', led)
      }
      if (!map.has('chất liệu tản nhiệt')) {
        let mat = 'Nhôm'
        if (pName.includes('KHÍ') || pName.includes('HYPER')) mat = 'Đồng & Nhôm'
        addSpec('detail', 'Chất liệu tản nhiệt', mat)
      }
      if (!map.has('màu sắc')) {
        let col = 'Đen'
        if (pName.includes('WHITE') || pName.includes('TRẮNG')) col = 'Trắng'
        addSpec('detail', 'Màu sắc', col)
      }
      if (!map.has('kích thước radiator (cm)')) {
        let rad = '394 x 140 x 32 mm'
        if (pName.includes('240')) rad = '275 x 120 x 27 mm'
        else if (pName.includes('KHÍ') || pName.includes('HYPER')) rad = 'N/A (Tản Khí)'
        addSpec('detail', 'Kích thước Radiator (cm)', rad)
      }
      if (!map.has('chiều cao (cm)')) {
        let h = '200 mm'
        if (pName.includes('KHÍ') || pName.includes('HYPER')) h = '157 mm'
        addSpec('detail', 'Chiều cao (cm)', h)
      }
      if (!map.has('số vòng quay của quạt (rpm)')) {
        let rpm = '800-2650 +/- 10% RPM'
        if (pName.includes('KHÍ') || pName.includes('HYPER')) rpm = '500-1550 RPM'
        addSpec('detail', 'Số vòng quay của quạt (RPM)', rpm)
      }
      if (!map.has('lưu lượng không khí (cfm)')) {
        let flow = '71.44 CFM'
        if (pName.includes('KHÍ') || pName.includes('HYPER')) flow = '66.17 CFM'
        addSpec('detail', 'Lưu lượng không khí (CFM)', flow)
      }
      if (!map.has('độ ồn (dba)')) {
        let noise = '39.6 dB(A)'
        if (pName.includes('KHÍ') || pName.includes('HYPER')) noise = '25.6 dB(A)'
        addSpec('detail', 'Độ ồn (dBA)', noise)
      }
      if (!map.has('khối lượng (kg)')) {
        let w = '4 kg'
        if (pName.includes('KHÍ') || pName.includes('HYPER')) w = '1.2 kg'
        addSpec('detail', 'Khối lượng (kg)', w)
      }
    }
    // ── VỎ CASE / PC CASE ──
    else if (catName.includes('case') || catName.includes('vỏ') || pName.includes('CASE') || pName.includes('VỎ CASE') || pName.includes('MASTERBOX') || pName.includes('H9 FLOW') || pName.includes('GT502')) {
      // Thông tin chung
      if (!map.has('thương hiệu')) {
        addSpec('general', 'Thương hiệu', product?.brand_id?.name || (pName.includes('NZXT') ? 'NZXT' : pName.includes('CORSAIR') ? 'Corsair' : pName.includes('ASUS') ? 'ASUS' : 'Jonsbo'))
      }
      if (!map.has('bảo hành')) {
        let warranty = '24 tháng'
        if (pName.includes('JONSBO')) warranty = '12 tháng'
        addSpec('general', 'Bảo hành', warranty)
      }
      if (!map.has('tên của case')) {
        addSpec('general', 'Tên của case', product?.name?.replace(/^Vỏ Case\s+/i, '') || 'D200')
      }
      if (!map.has('nhu cầu')) {
        addSpec('general', 'Nhu cầu', 'Văn phòng, Học sinh - Sinh viên')
      }
      if (!map.has('màu sắc')) {
        let col = 'Đen'
        if (pName.includes('WHITE') || pName.includes('TRẮNG')) col = 'Trắng'
        addSpec('general', 'Màu sắc', col)
      }
      if (!map.has('chất liệu')) {
        addSpec('general', 'Chất liệu', 'SPCC, Nhựa, Kính')
      }
      if (!map.has('kích thước')) {
        let dims = '43.7x 21.6 x 41.9cm'
        if (pName.includes('H9') || pName.includes('GT502')) dims = '46.6 x 29.0 x 49.5 cm'
        addSpec('general', 'Kích thước', dims)
      }

      // Cấu hình chi tiết
      if (!map.has('loại case')) {
        let cType = 'Mid Tower'
        if (pName.includes('DUAL') || pName.includes('H9') || pName.includes('GT502')) cType = 'Dual-Chamber Mid Tower'
        addSpec('detail', 'Loại case', cType)
      }
      if (!map.has('hỗ trợ mainboard')) {
        let mb = 'Mini-ITX, Micro-ATX'
        if (pName.includes('GT502') || pName.includes('H9') || pName.includes('4000D')) mb = 'Mini-ITX, Micro-ATX, ATX'
        addSpec('detail', 'Hỗ trợ mainboard', mb)
      }
      if (!map.has('số lượng ổ đĩa hỗ trợ')) {
        addSpec('detail', 'Số lượng ổ đĩa hỗ trợ', '1 x 3.5" , 1 x 2.5"')
      }
      if (!map.has('cổng kết nối')) {
        addSpec('detail', 'Cổng kết nối', '2 x USB 3.0 , 1 x USB Type C')
      }
      if (!map.has('hỗ trợ tản nhiệt cpu cao')) {
        addSpec('detail', 'Hỗ trợ tản nhiệt CPU cao', '171mm')
      }
      if (!map.has('loại quạt hỗ trợ phía trên')) {
        addSpec('detail', 'Loại quạt hỗ trợ phía trên', '3 x 120mm/2 x 140mm')
      }
      if (!map.has('loại quạt hỗ trợ phía sau')) {
        addSpec('detail', 'Loại quạt hỗ trợ phía sau', '1 x 120 mm')
      }
      if (!map.has('loại quạt hỗ trợ bên dưới')) {
        addSpec('detail', 'Loại quạt hỗ trợ bên dưới', '3 x 120 mm')
      }
    }
    // Fallback
    if (!map.has('thương hiệu')) addSpec('general', 'Thương hiệu', product?.brand_id?.name || 'Chính hãng')
    if (!map.has('bảo hành')) addSpec('general', 'Bảo hành', '12 Tháng')

    return { generalList, detailList }
  }

  const { generalList, detailList } = getCategorizedSpecs()
  if (generalList.length === 0 && detailList.length === 0) return null

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
      setSelectedVariantId(productData.Variants[0]._id)
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
        if (gName && gVal && !next[gName]) {
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
      'weight', 'dimensions', 'sensor'
    ]

    const hasExplicitAttributes = Variants.some(v => (v.Attributes && v.Attributes.length > 0))

    if (hasExplicitAttributes) {
      const groups = {}
      Variants.forEach(v => {
        const attrs = v.Attributes || []
        attrs.forEach(a => {
          const groupName = a.attribute_name || a.name || 'Thuộc tính'
          const valName = a.value_name || a.value
          if (!groupName || !valName) return

          // Lọc bỏ các thông số kỹ thuật cố định, chỉ giữ lại các option mua hàng thực sự ở phía trên
          const lowerName = groupName.trim().toLowerCase()
          if (specFilterOut.some(s => lowerName === s || lowerName.includes(s) || s.includes(lowerName))) return

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

      const filteredGroups = Object.values(groups)
      
      // Fallback: nếu sản phẩm chưa có thuộc tính Dung lượng nhưng tên có chứa dung lượng (VD: 32GB, 16GB...)
      // Bỏ qua cho GPU vì GB trong tên GPU là VRAM, không phải RAM hệ thống
      const hasCapGroup = filteredGroups.some(g => 
        isMatchStr(g.attribute_name, 'Dung lượng') || isMatchStr(g.attribute_name, 'Dung lượng RAM')
      )
      if (!hasCapGroup && !isGPU && product?.name) {
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
        attribute_name: 'Phiên bản / Biến thể',
        options: realVariants.map(v => ({
          value_name: v.variant_name,
          variant_id: v._id
        }))
      }]
    }


    // Fallback cho trường hợp sản phẩm không khai báo Variants attributes
    // Bỏ qua cho GPU vì GB trong tên GPU là VRAM, không phải RAM hệ thống
    if (!isGPU && product?.name) {
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

    if (group.attribute_name === 'Phiên bản / Biến thể') {
      if (opt.variant_id) {
        setSelectedVariantId(opt.variant_id)
        setQuantity(1)
      }
      return
    }

    // 2. Tìm biến thể phù hợp nhất trong cơ sở dữ liệu nếu có nhiều biến thể
    let bestVariant = null
    let maxScore = -1

    Variants.forEach(v => {
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
      if (score > maxScore) {
        maxScore = score
        bestVariant = v
      }
    })

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
      name: product.name + (activeVariant.attributes && activeVariant.attributes.length > 0 ? ` - ${activeVariant.attributes.map(a => a.value).join(', ')}` : ''),
      price: currentPrice,
      quantity,
      image: images[0]
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

      dispatch(addToCart(cartPayload))
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
      dispatch(addToCart(cartPayload));
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
      _isBuyNow: true
    }
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
    navigate('/checkout', { state: { buyNowItem } })
  }

  // ── ReviewSection component (Purchase-check & Customer Reviews) ──
  const ReviewSection = () => {
    const [reviewsList, setReviewsList] = useState([])
    const [avgRating, setAvgRating] = useState(5)
    const [loadingReviews, setLoadingReviews] = useState(true)
    const [previewImage, setPreviewImage] = useState(null)

    const [eligibility, setEligibility] = useState({ canReview: false, hasPurchased: false, reason: null, order_item_id: null })
    const [checkingEligibility, setCheckingEligibility] = useState(true)

    const [rStars, setRStars] = useState(5)
    const [rContent, setRContent] = useState('')
    const [rSubmitting, setRSubmitting] = useState(false)
    const [rMsg, setRMsg] = useState(null)

    const productId = product?._id || slug

    // Fetch reviews list
    const loadReviews = async () => {
      if (!productId) return
      try {
        setLoadingReviews(true)
        const data = await reviewAPI.getProductReviews(productId)
        if (data.success) {
          setReviewsList(data.data || [])
          setAvgRating(data.avgRating || 5)
        }
      } catch (e) {
        console.error('Lỗi tải đánh giá sản phẩm:', e)
      } finally {
        setLoadingReviews(false)
      }
    }

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

    useEffect(() => {
      loadReviews()
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
        {/* Form Đánh giá (Chỉ hiển thị nút viết cho người dùng ĐÃ MUA sản phẩm & chưa đánh giá) */}
        <div className="review-box" style={{ background: '#121621', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px' }}>ĐÁNH GIÁ SẢN PHẨM</h3>
          
          {checkingEligibility ? (
            <div style={{ fontSize: '13px', color: '#888' }}>Đang kiểm tra quyền đánh giá...</div>
          ) : !isLoggedIn ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed #333', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#aaa' }}>
              🔒 Vui lòng đăng nhập và mua sản phẩm này để viết đánh giá.
            </div>
          ) : eligibility.canReview ? (
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#86efac' }}>
                ✓ Bạn đã mua sản phẩm này! Hãy chia sẻ trải nghiệm thực tế của bạn:
              </p>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>Chọn số sao đánh giá</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRStars(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: s <= rStars ? '#fbbf24' : '#444', transition: 'transform 0.1s' }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 700, marginLeft: '6px' }}>{rStars}/5 sao</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>Nội dung đánh giá *</label>
                <textarea
                  value={rContent}
                  onChange={e => setRContent(e.target.value)}
                  rows={4}
                  placeholder="Nhập nhận xét chi tiết về sản phẩm (chất lượng, hiệu năng, đóng gói...)..."
                  style={{ width: '100%', background: '#0a0a0f', border: '1px solid #333', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {rMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: rMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: rMsg.type === 'success' ? '#22c55e' : '#ef4444',
                  border: `1px solid ${rMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                }}>
                  {rMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={rSubmitting}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--accent-color, #c8e600)',
                  color: '#000',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: rSubmitting ? 'not-allowed' : 'pointer',
                  opacity: rSubmitting ? 0.7 : 1
                }}
              >
                {rSubmitting ? 'Đang gửi...' : 'GỬI ĐÁNH GIÁ'}
              </button>
            </form>
          ) : eligibility.alreadyReviewed ? (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#86efac' }}>
              ✓ Bạn đã gửi đánh giá cho sản phẩm này. Cảm ơn phản hồi của bạn!
            </div>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed #333', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#aaa' }}>
              🔒 Bạn chưa mua sản phẩm này nên không thể gửi đánh giá. Dưới đây là đánh giá từ các khách hàng đã mua:
            </div>
          )}
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
                  <div className="gallery-main" style={{ background: 'var(--dark2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  {images.length > 1 && (
                    <div className="gallery-thumbnails">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          className={`gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                          onClick={() => setSelectedImage(idx)}
                          style={{ background: 'var(--dark2)', borderRadius: '4px', overflow: 'hidden', border: selectedImage === idx ? '1px solid var(--accent-color)' : '1px solid transparent' }}
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
                        <span style={{ color: '#fbbf24' }}>⭐ 5.0</span>
                        <span style={{ color: 'var(--text-muted)' }}>(0 đánh giá)</span>
                      </div>
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
                          const isFallbackGroup = group.attribute_name === 'Phiên bản / Biến thể'
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
                          background: isOutOfStock ? '#333' : 'rgba(212, 255, 0, 0.12)', 
                          color: isOutOfStock ? '#888' : 'var(--accent-color)', 
                          border: isOutOfStock ? '1px solid #444' : '1px solid var(--accent-color)',
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {isOutOfStock ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
                      </button>
                      <button 
                        className="btn-buy-now" 
                        onClick={handleBuyNow} 
                        disabled={isOutOfStock}
                        style={{ 
                          flex: 1,
                          height: '48px',
                          background: isOutOfStock ? '#444' : 'var(--accent-color)', 
                          color: isOutOfStock ? '#888' : '#000', 
                          border: 'none',
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      <SpecsTable 
                        product={product} 
                        activeVariant={activeVariant} 
                        attributes={activeAttributes} 
                        groupedAttributes={getGroupedAttributes()} 
                      />
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
