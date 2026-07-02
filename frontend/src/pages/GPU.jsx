import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/cpu.css' // Reuse the sidebar layout styles

const API_URL = 'http://localhost:3000'

// --- FILTER OPTIONS DATA MATCHING USER'S GPU IMAGE ---
const brandsData = [
  { label: 'Asrock', value: 'asrock' },
  { label: 'Asus', value: 'asus' },
  { label: 'Colorful', value: 'colorful' },
  { label: 'Gainward', value: 'gainward' },
  { label: 'Gigabyte', value: 'gigabyte' },
  { label: 'Inno3d', value: 'inno3d' },
  { label: 'Leadtek', value: 'leadtek' },
  { label: 'Msi', value: 'msi' },
  { label: 'PNY', value: 'pny' },
  { label: 'Palit', value: 'palit' }
]

const chipsetManufacturersData = [
  { label: 'AMD', value: 'amd' },
  { label: 'NVIDIA', value: 'nvidia' }
]

const gpuSeriesData = [
  { label: 'AMD Radeon 6900 series', value: 'radeon-6900' },
  { label: 'GeForce GT 10 series', value: 'gt-10' },
  { label: 'GeForce GTX 10 series', value: 'gtx-10' },
  { label: 'GeForce GTX 16 series', value: 'gtx-16' },
  { label: 'GeForce RTX 20 series', value: 'rtx-20' },
  { label: 'GeForce RTX 30 series', value: 'rtx-30' },
  { label: 'GeForce RTX 40 series', value: 'rtx-40' },
  { label: 'GeForce RTX 50 series', value: 'rtx-50' },
  { label: 'Khác', value: 'khac' },
  { label: 'Quadro', value: 'quadro' },
  { label: 'Radeon RX 500 series', value: 'rx-500' },
  { label: 'Radeon RX 6400', value: 'rx-6400' },
  { label: 'Radeon RX 6500 XT', value: 'rx-6500' },
  { label: 'Radeon RX 6600', value: 'rx-6600' },
  { label: 'Radeon RX 6600 XT', value: 'rx-6600-xt' },
  { label: 'Radeon RX 6650', value: 'rx-6650' },
  { label: 'Radeon RX 6700', value: 'rx-6700' },
  { label: 'Radeon RX 6700 XT', value: 'rx-6700-xt' },
  { label: 'Radeon RX 6750', value: 'rx-6750' },
  { label: 'Radeon RX 6800', value: 'rx-6800' },
  { label: 'Radeon RX 6900 XT', value: 'rx-6900-xt' },
  { label: 'Radeon RX 6950', value: 'rx-6950' },
  { label: 'Radeon RX 7600', value: 'rx-7600' },
  { label: 'Radeon RX 7900', value: 'rx-7900' },
  { label: 'Radeon RX 9000 XT', value: 'rx-9000' },
  { label: 'Radeon RX 9070', value: 'rx-9070' },
  { label: 'Radeon RX 9070 XT', value: 'rx-9070-xt' }
]

const chipNamesData = [
  { label: 'GeForce GT 1030', value: 'gt-1030' },
  { label: 'GeForce GT 710', value: 'gt-710' },
  { label: 'GeForce GT 730', value: 'gt-730' },
  { label: 'GeForce GTX 1050Ti', value: 'gtx-1050ti' },
  { label: 'GeForce GTX 1650', value: 'gtx-1650' },
  { label: 'GeForce GTX 1650 Super', value: 'gtx-1650-super' },
  { label: 'GeForce GTX 1660', value: 'gtx-1660' },
  { label: 'GeForce GTX 1660 Super', value: 'gtx-1660-super' },
  { label: 'GeForce GTX 1660Ti', value: 'gtx-1660ti' },
  { label: 'GeForce RTX 2060', value: 'rtx-2060' },
  { label: 'GeForce RTX 2060 Super', value: 'rtx-2060-super' },
  { label: 'GeForce RTX 3050', value: 'rtx-3050' },
  { label: 'GeForce RTX 3060', value: 'rtx-3060' },
  { label: 'GeForce RTX 3060Ti', value: 'rtx-3060ti' },
  { label: 'GeForce RTX 3070', value: 'rtx-3070' },
  { label: 'GeForce RTX 3080', value: 'rtx-3080' },
  { label: 'GeForce RTX 3080Ti', value: 'rtx-3080ti' },
  { label: 'GeForce RTX 3090', value: 'rtx-3090' },
  { label: 'GeForce RTX 3090Ti', value: 'rtx-3090ti' },
  { label: 'GeForce RTX 4060', value: 'rtx-4060' },
  { label: 'GeForce RTX 4060Ti', value: 'rtx-4060ti' },
  { label: 'GeForce RTX 4070', value: 'rtx-4070' },
  { label: 'GeForce RTX 4070 Super', value: 'rtx-4070-super' },
  { label: 'GeForce RTX 4070Ti', value: 'rtx-4070ti' },
  { label: 'GeForce RTX 4070Ti Super', value: 'rtx-4070ti-super' },
  { label: 'GeForce RTX 4080', value: 'rtx-4080' },
  { label: 'GeForce RTX 4080 Super', value: 'rtx-4080-super' },
  { label: 'GeForce RTX 4090', value: 'rtx-4090' },
  { label: 'GeForce RTX 5050', value: 'rtx-5050' },
  { label: 'GeForce RTX 5060', value: 'rtx-5060' },
  { label: 'GeForce RTX 5060Ti', value: 'rtx-5060ti' },
  { label: 'GeForce RTX 5070', value: 'rtx-5070' },
  { label: 'GeForce RTX 5070Ti', value: 'rtx-5070ti' },
  { label: 'GeForce RTX 5080', value: 'rtx-5080' },
  { label: 'GeForce RTX 5090', value: 'rtx-5090' },
  { label: 'GeForce RTX 3070Ti', value: 'rtx-3070ti' },
  { label: 'Quadro RTX 4000', value: 'quadro-4000' },
  { label: 'Quadro RTX 5000', value: 'quadro-5000' },
  { label: 'Quadro T1000', value: 'quadro-t1000' },
  { label: 'Quadro T400', value: 'quadro-t400' },
  { label: 'Quadro T600', value: 'quadro-t600' },
  { label: 'RTX 2000', value: 'rtx-2000' },
  { label: 'RTX 4000 ADA', value: 'rtx-4000-ada' },
  { label: 'RTX 4500 ADA', value: 'rtx-4500-ada' },
  { label: 'RTX A1000', value: 'rtx-a1000' },
  { label: 'RTX A2000', value: 'rtx-a2000' },
  { label: 'RTX A4000', value: 'rtx-a4000' },
  { label: 'RTX PRO 2000', value: 'rtx-pro-2000' },
  { label: 'RTX PRO 4000', value: 'rtx-pro-4000' },
  { label: 'RTX PRO 4500', value: 'rtx-pro-4500' },
  { label: 'RTX PRO 5000', value: 'rtx-pro-5000' },
  { label: 'RTX PRO 6000', value: 'rtx-pro-6000' },
  { label: 'Radeon RX 550', value: 'rx-550' },
  { label: 'Radeon RX 560', value: 'rx-560' },
  { label: 'Radeon RX 6400', value: 'rx-6400' },
  { label: 'Radeon RX 6500 XT', value: 'rx-6500' },
  { label: 'Radeon RX 6600', value: 'rx-6600' },
  { label: 'Radeon RX 6600 XT', value: 'rx-6600-xt' },
  { label: 'Radeon RX 6650 XT', value: 'rx-6650-xt' },
  { label: 'Radeon RX 6750 XT', value: 'rx-6750-xt' },
  { label: 'Radeon RX 6800', value: 'rx-6800' },
  { label: 'Radeon RX 6800 XT', value: 'rx-6800-xt' },
  { label: 'Radeon RX 6900 XT', value: 'rx-6900-xt' },
  { label: 'Radeon RX 6950 XT', value: 'rx-6950-xt' },
  { label: 'Radeon RX 7600', value: 'rx-7600' },
  { label: 'Radeon RX 7900 XT', value: 'rx-7900-xt' },
  { label: 'Radeon RX 7900 XTX', value: 'rx-7900-xtx' },
  { label: 'Radeon RX 9060 XT', value: 'rx-9060-xt' },
  { label: 'Radeon RX 9070', value: 'rx-9070' },
  { label: 'Radeon RX 9070 XT', value: 'rx-9070-xt' }
]

const vramData = [
  { label: '10GB', value: '10' },
  { label: '12GB', value: '12' },
  { label: '16GB', value: '16' },
  { label: '20GB', value: '20' },
  { label: '24GB', value: '24' },
  { label: '2GB', value: '2' },
  { label: '32GB', value: '32' },
  { label: '48GB', value: '48' },
  { label: '4GB', value: '4' },
  { label: '6GB', value: '6' },
  { label: '8GB', value: '8' },
  { label: '96GB', value: '96' }
]

const memoryGenData = [
  { label: 'GDDR3', value: 'gddr3' },
  { label: 'GDDR4', value: 'gddr4' },
  { label: 'GDDR5', value: 'gddr5' },
  { label: 'GDDR6', value: 'gddr6' },
  { label: 'GDDR6X', value: 'gddr6x' },
  { label: 'GDDR7', value: 'gddr7' }
]

const seriesData = [
  { label: 'AERO', value: 'aero' },
  { label: 'AORUS', value: 'aorus' },
  { label: 'Astral', value: 'astral' },
  { label: 'Colorful Series', value: 'colorful-series' },
  { label: 'DUAL', value: 'dual' },
  { label: 'EAGLE', value: 'eagle' },
  { label: 'EXOC', value: 'exoc' },
  { label: 'GAMING', value: 'gaming' },
  { label: 'Ghost', value: 'ghost' },
  { label: 'INSPIRE', value: 'inspire' },
  { label: 'MASTER', value: 'master' },
  { label: 'PYTHON', value: 'python' },
  { label: 'Phantom', value: 'phantom' },
  { label: 'Phoenix', value: 'phoenix' },
  { label: 'Prime', value: 'prime' },
  { label: 'ROG', value: 'rog' },
  { label: 'SHADOW', value: 'shadow' },
  { label: 'SUPRIM', value: 'suprim' },
  { label: 'TRIO', value: 'trio' },
  { label: 'TUF', value: 'tuf' },
  { label: 'VENTUS', value: 'ventus' },
  { label: 'Vanguard', value: 'vanguard' },
  { label: 'WindForce', value: 'windforce' },
  { label: 'iGame', value: 'igame' }
]

// --- REALISTIC FALLBACK MOCK DATA ---
const mockGpuProducts = [
  {
    _id: 'mock-gpu-1',
    name: 'ASUS ROG Strix GeForce RTX 4070 Ti Super',
    short_desc: '16GB GDDR6X, DLSS 3.0, 3 Fan, 256-bit',
    description: 'Card đồ họa cao cấp ASUS ROG Strix GeForce RTX 4070 Ti Super 16GB GDDR6X hiệu năng cực đỉnh.',
    brand_id: { slug: 'asus', name: 'ASUS' },
    slug: 'asus-rog-strix-rtx-4070-ti-super',
    Variants: [{ price: 23990000, sale_price: 22790000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=RTX+4070Ti+Super', is_main: true }]
  },
  {
    _id: 'mock-gpu-2',
    name: 'MSI GeForce RTX 4060 VENTUS 2X OC',
    short_desc: '8GB GDDR6, DLSS 3.0, 2 Fan, 128-bit',
    description: 'Card đồ họa tầm trung MSI GeForce RTX 4060 VENTUS 2X 8G OC.',
    brand_id: { slug: 'msi', name: 'MSI' },
    slug: 'msi-rtx-4060-ventus-2x',
    Variants: [{ price: 8490000, sale_price: 7810000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=RTX+4060+Ventus', is_main: true }]
  },
  {
    _id: 'mock-gpu-3',
    name: 'Gigabyte GeForce RTX 4070 SUPER GAMING OC',
    short_desc: '12GB GDDR6X, DLSS 3.0, 3 Fan, 192-bit',
    description: 'Card đồ họa chơi game Gigabyte GeForce RTX 4070 SUPER GAMING OC 12GB GDDR6X.',
    brand_id: { slug: 'gigabyte', name: 'Gigabyte' },
    slug: 'gigabyte-rtx-4070-super-gaming-oc',
    Variants: [{ price: 18990000, sale_price: 18990000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=RTX+4070+Super', is_main: true }]
  },
  {
    _id: 'mock-gpu-4',
    name: 'Colorful GeForce GT 1030 4G-V',
    short_desc: '4GB SDDR4, 1 Fan, 64-bit',
    description: 'Card đồ họa phổ thông Colorful GeForce GT 1030 4G-V cho văn phòng và giải trí nhẹ.',
    brand_id: { slug: 'colorful', name: 'Colorful' },
    slug: 'colorful-gt-1030-4g-v',
    Variants: [{ price: 1990000, sale_price: 1990000 }],
    AnhSP: [{ url: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Colorful+GT1030', is_main: true }]
  },
  {
    "_id": "mock-gpu-5",
    "name": "ASUS TUF Gaming GeForce RTX 4090 OC",
    "short_desc": "24GB GDDR6X, DLSS 3, 3 Fan, 384-bit",
    "description": "GPU cao cấp nhất thế hệ RTX 40, ASUS TUF Gaming RTX 4090 OC 24GB GDDR6X.",
    "brand_id": {
      "slug": "asus",
      "name": "ASUS"
    },
    "slug": "asus-tuf-rtx-4090-oc",
    "Variants": [
      {
        "price": 59990000,
        "sale_price": 55990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+4090+TUF",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-6",
    "name": "MSI GeForce RTX 4080 Super GAMING X SLIM",
    "short_desc": "16GB GDDR6X, DLSS 3, 2 Fan, 256-bit",
    "description": "Card đồ họa MSI RTX 4080 Super Gaming X Slim tiết kiệm không gian, hiệu năng cao.",
    "brand_id": {
      "slug": "msi",
      "name": "MSI"
    },
    "slug": "msi-rtx-4080-super-gaming-x-slim",
    "Variants": [
      {
        "price": 35990000,
        "sale_price": 34490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+4080+Super",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-7",
    "name": "Gigabyte Radeon RX 7900 XTX GAMING OC",
    "short_desc": "24GB GDDR6, RDNA3, 3 Fan, 384-bit",
    "description": "Card đồ họa AMD RX 7900 XTX 24GB của Gigabyte, cạnh tranh trực tiếp RTX 4080.",
    "brand_id": {
      "slug": "gigabyte",
      "name": "Gigabyte"
    },
    "slug": "gigabyte-rx-7900-xtx-gaming-oc",
    "Variants": [
      {
        "price": 29990000,
        "sale_price": 28490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RX+7900+XTX",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-8",
    "name": "ASUS ROG Strix GeForce RTX 5090",
    "short_desc": "32GB GDDR7, DLSS 4, 3 Fan, 512-bit",
    "description": "GPU thế hệ mới nhất RTX 5090 ASUS ROG Strix, 32GB GDDR7 kiến trúc Blackwell.",
    "brand_id": {
      "slug": "asus",
      "name": "ASUS"
    },
    "slug": "asus-rog-strix-rtx-5090",
    "Variants": [
      {
        "price": 89990000,
        "sale_price": 85990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+5090+ROG",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-9",
    "name": "MSI GeForce RTX 4070 GAMING X TRIO",
    "short_desc": "12GB GDDR6X, DLSS 3, 3 Fan, 192-bit",
    "description": "Card đồ họa gaming MSI RTX 4070 Gaming X Trio 12GB GDDR6X hiệu năng tuyệt vời.",
    "brand_id": {
      "slug": "msi",
      "name": "MSI"
    },
    "slug": "msi-rtx-4070-gaming-x-trio",
    "Variants": [
      {
        "price": 17490000,
        "sale_price": 16890000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+4070+Trio",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-10",
    "name": "Gigabyte GeForce RTX 4060 Ti AERO OC",
    "short_desc": "8GB GDDR6, DLSS 3, 2 Fan, 128-bit",
    "description": "Card đồ họa Gigabyte RTX 4060 Ti AERO OC 8GB màu trắng thiết kế đẹp.",
    "brand_id": {
      "slug": "gigabyte",
      "name": "Gigabyte"
    },
    "slug": "gigabyte-rtx-4060-ti-aero-oc",
    "Variants": [
      {
        "price": 11490000,
        "sale_price": 10990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+4060Ti+AERO",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-11",
    "name": "ASUS DUAL Radeon RX 9070 XT OC",
    "short_desc": "16GB GDDR6, RDNA4, 2 Fan, 256-bit",
    "description": "GPU AMD thế hệ RDNA4 RX 9070 XT 16GB GDDR6 hiệu năng ray-tracing cải thiện mạnh.",
    "brand_id": {
      "slug": "asus",
      "name": "ASUS"
    },
    "slug": "asus-dual-rx-9070-xt-oc",
    "Variants": [
      {
        "price": 21990000,
        "sale_price": 20990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RX+9070+XT",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-12",
    "name": "MSI Radeon RX 7600 MECH 2X OC",
    "short_desc": "8GB GDDR6, RDNA3, 2 Fan, 128-bit",
    "description": "Card đồ họa AMD tầm trung RX 7600 8GB MSI MECH 2X OC giá tốt nhất phân khúc.",
    "brand_id": {
      "slug": "msi",
      "name": "MSI"
    },
    "slug": "msi-rx-7600-mech-2x-oc",
    "Variants": [
      {
        "price": 6490000,
        "sale_price": 5990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RX+7600+MECH",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-13",
    "name": "Gigabyte GeForce RTX 5080 AORUS Master",
    "short_desc": "16GB GDDR7, DLSS 4, 3 Fan, 256-bit",
    "description": "GPU RTX 5080 Gigabyte AORUS Master 16GB GDDR7 thế hệ Blackwell hiệu năng đỉnh.",
    "brand_id": {
      "slug": "gigabyte",
      "name": "Gigabyte"
    },
    "slug": "gigabyte-rtx-5080-aorus-master",
    "Variants": [
      {
        "price": 49990000,
        "sale_price": 47990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+5080+AORUS",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-14",
    "name": "ASUS DUAL GeForce RTX 4060 OC",
    "short_desc": "8GB GDDR6, DLSS 3, 2 Fan, 128-bit",
    "description": "GPU ASUS DUAL RTX 4060 OC 8GB lựa chọn tầm trung hiệu năng 1080p tốt nhất.",
    "brand_id": {
      "slug": "asus",
      "name": "ASUS"
    },
    "slug": "asus-dual-rtx-4060-oc",
    "Variants": [
      {
        "price": 8990000,
        "sale_price": 8490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+4060+DUAL",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-15",
    "name": "MSI GeForce RTX 5070 Ti SUPRIM X",
    "short_desc": "16GB GDDR7, DLSS 4, 3 Fan, 256-bit",
    "description": "GPU RTX 5070 Ti MSI SUPRIM X phiên bản cao cấp nhất thế hệ Blackwell tầm trung cao.",
    "brand_id": {
      "slug": "msi",
      "name": "MSI"
    },
    "slug": "msi-rtx-5070-ti-suprim-x",
    "Variants": [
      {
        "price": 35990000,
        "sale_price": 34490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+5070Ti+SUPRIM",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-16",
    "name": "Colorful iGame GeForce RTX 4070 Ultra W OC",
    "short_desc": "12GB GDDR6X, DLSS 3, 3 Fan, 192-bit",
    "description": "Card đồ họa RTX 4070 Colorful iGame Ultra W OC thiết kế độc đáo màu trắng.",
    "brand_id": {
      "slug": "colorful",
      "name": "Colorful"
    },
    "slug": "colorful-igame-rtx-4070-ultra-w-oc",
    "Variants": [
      {
        "price": 17990000,
        "sale_price": 16990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+4070+iGame",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-17",
    "name": "Gigabyte Radeon RX 9070 GAMING OC",
    "short_desc": "16GB GDDR6, RDNA4, 3 Fan, 256-bit",
    "description": "GPU AMD RX 9070 16GB Gigabyte GAMING OC kiến trúc RDNA4 mới nhất.",
    "brand_id": {
      "slug": "gigabyte",
      "name": "Gigabyte"
    },
    "slug": "gigabyte-rx-9070-gaming-oc",
    "Variants": [
      {
        "price": 18490000,
        "sale_price": 17990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RX+9070+Gaming",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-18",
    "name": "ASUS ROG Strix GeForce RTX 4070 Super OC",
    "short_desc": "12GB GDDR6X, DLSS 3, 3 Fan, 192-bit",
    "description": "GPU ASUS ROG Strix RTX 4070 Super OC hiệu năng 1440p gaming tốt nhất.",
    "brand_id": {
      "slug": "asus",
      "name": "ASUS"
    },
    "slug": "asus-rog-strix-rtx-4070-super-oc",
    "Variants": [
      {
        "price": 21490000,
        "sale_price": 20490000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+4070S+ROG",
        "is_main": true
      }
    ]
  },
  {
    "_id": "mock-gpu-19",
    "name": "MSI GeForce RTX 5070 GAMING TRIO OC",
    "short_desc": "12GB GDDR7, DLSS 4, 3 Fan, 192-bit",
    "description": "GPU RTX 5070 MSI Gaming Trio OC 12GB GDDR7 Blackwell hiệu năng 1440p xuất sắc.",
    "brand_id": {
      "slug": "msi",
      "name": "MSI"
    },
    "slug": "msi-rtx-5070-gaming-trio-oc",
    "Variants": [
      {
        "price": 22990000,
        "sale_price": 21990000
      }
    ],
    "AnhSP": [
      {
        "url": "https://placehold.co/600x400/0d1117/c8e600?text=RTX+5070+Trio",
        "is_main": true
      }
    ]
  }
]
export default function GPU() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    brands: [],
    chipsetMan: [],
    gpuSeries: [],
    chipName: [],
    vram: [],
    memoryGen: [],
    series: []
  })

  // --- ACCORDION OPEN/CLOSE STATES ---
  const [openFilters, setOpenFilters] = useState({
    priceRange: true,
    brands: true,
    chipsetMan: true,
    gpuSeries: true,
    chipName: true,
    vram: true,
    memoryGen: true,
    series: true
  })

  // --- EXPAND FILTERS STATE ---
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    gpuSeries: false,
    chipName: false,
    vram: false,
    memoryGen: false,
    series: false
  })

  const toggleFilter = (key) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleExpand = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // --- FETCH PRODUCTS FROM BACKEND ---
  useEffect(() => {
    const fetchGPUProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/categories/gpu`)
        const data = await res.json()
        if (data.success && data.data && data.data.products) {
          const apiProducts = data.data.products
          // Merge real products + mock products (loại trùng theo tên)
          const apiNames = apiProducts.map(p => p.name.toLowerCase())
          const uniqueMocks = mockGpuProducts.filter(m => !apiNames.includes(m.name.toLowerCase()))
          setProducts([...apiProducts, ...uniqueMocks])
        } else {
          setProducts(mockGpuProducts)
        }
      } catch (err) {
        console.error('Lỗi fetch sản phẩm GPU, sử dụng dữ liệu mẫu:', err)
        setProducts(mockGpuProducts)
      } finally {
        setLoading(false)
      }
    }
    fetchGPUProducts()
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

    // 2. Nhà sản xuất chipset (Chipset Manufacturer)
    if (filters.chipsetMan.length > 0) {
      const match = filters.chipsetMan.some(man => {
        if (man === 'amd') return nameLower.includes('amd') || nameLower.includes('radeon') || descLower.includes('amd')
        if (man === 'nvidia') return nameLower.includes('nvidia') || nameLower.includes('geforce') || nameLower.includes('quadro') || nameLower.includes('rtx') || descLower.includes('nvidia')
        return false
      })
      if (!match) return false
    }

    // 3. Series chip đồ họa
    if (filters.gpuSeries.length > 0) {
      const match = filters.gpuSeries.some(ser => {
        const query = ser.replace('-', ' ')
        return nameLower.includes(query) || descLower.includes(query)
      })
      if (!match) return false
    }

    // 4. Tên chip đồ họa
    if (filters.chipName.length > 0) {
      const match = filters.chipName.some(name => {
        const query = name.replace('-', ' ')
        return nameLower.includes(query) || descLower.includes(query)
      })
      if (!match) return false
    }

    // 5. Dung lượng bộ nhớ VRAM
    if (filters.vram.length > 0) {
      const match = filters.vram.some(v => {
        const pattern = `${v}gb`
        return specsLower.includes(pattern) || nameLower.includes(pattern)
      })
      if (!match) return false
    }

    // 6. Thế hệ bộ nhớ
    if (filters.memoryGen.length > 0) {
      const match = filters.memoryGen.some(gen => {
        return specsLower.includes(gen.toLowerCase()) || nameLower.includes(gen.toLowerCase())
      })
      if (!match) return false
    }

    // 7. Series (Sub-brand)
    if (filters.series.length > 0) {
      const match = filters.series.some(ser => {
        return nameLower.includes(ser.toLowerCase())
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
            <span className="active">VGA / CARD ĐỒ HỌA</span>
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
                      <input type="text" value="410.000.000đ" disabled style={{ width: '100%', background: 'var(--dark2)', border: '1.5px solid var(--border)', color: 'var(--white)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
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
                    {(expandedFilters.brands ? brandsData : brandsData.slice(0, 4)).map(brand => (
                      <label key={brand.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.value)}
                          onChange={(e) => handleFilterChange('brands', brand.value, e.target.checked)}
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                    {brandsData.length > 4 && (
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

              {/* NHÀ SẢN XUẤT CHIPSET */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('chipsetMan')}>
                  Nhà sản xuất chipset
                  <span className={`accordion-icon ${openFilters.chipsetMan ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.chipsetMan && (
                  <div className="filter-options" style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                    {chipsetManufacturersData.map(man => (
                      <label key={man.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.chipsetMan.includes(man.value)}
                          onChange={(e) => handleFilterChange('chipsetMan', man.value, e.target.checked)}
                        />
                        <span>{man.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* SERIES CHIP ĐỒ HỌA */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('gpuSeries')}>
                  Series chip đồ họa
                  <span className={`accordion-icon ${openFilters.gpuSeries ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.gpuSeries && (
                  <div className="filter-options">
                    {(expandedFilters.gpuSeries ? gpuSeriesData : gpuSeriesData.slice(0, 4)).map(ser => (
                      <label key={ser.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.gpuSeries.includes(ser.value)}
                          onChange={(e) => handleFilterChange('gpuSeries', ser.value, e.target.checked)}
                        />
                        <span>{ser.label}</span>
                      </label>
                    ))}
                    {gpuSeriesData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('gpuSeries')} 
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
                        {expandedFilters.gpuSeries ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* TÊN CHIP ĐỒ HỌA */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('chipName')}>
                  Tên chip đồ họa
                  <span className={`accordion-icon ${openFilters.chipName ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.chipName && (
                  <div className="filter-options">
                    {(expandedFilters.chipName ? chipNamesData : chipNamesData.slice(0, 4)).map(name => (
                      <label key={name.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.chipName.includes(name.value)}
                          onChange={(e) => handleFilterChange('chipName', name.value, e.target.checked)}
                        />
                        <span>{name.label}</span>
                      </label>
                    ))}
                    {chipNamesData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('chipName')} 
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
                        {expandedFilters.chipName ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* DUNG LƯỢNG BỘ NHỚ VRAM */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('vram')}>
                  Dung lượng bộ nhớ VRAM
                  <span className={`accordion-icon ${openFilters.vram ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.vram && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.vram ? vramData : vramData.slice(0, 4)).map(v => (
                      <label key={v.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.vram.includes(v.value)}
                          onChange={(e) => handleFilterChange('vram', v.value, e.target.checked)}
                        />
                        <span>{v.label}</span>
                      </label>
                    ))}
                    {vramData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('vram')} 
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
                        {expandedFilters.vram ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* THẾ HỆ BỘ NHỚ */}
              <div className="filter-group">
                <div className="filter-title" onClick={() => toggleFilter('memoryGen')}>
                  Thế hệ bộ nhớ (GDDR/HBM)
                  <span className={`accordion-icon ${openFilters.memoryGen ? 'open' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                      <path d="M1 5L5 1L9 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {openFilters.memoryGen && (
                  <div className="filter-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(expandedFilters.memoryGen ? memoryGenData : memoryGenData.slice(0, 4)).map(gen => (
                      <label key={gen.value} className="filter-label">
                        <input
                          type="checkbox"
                          checked={filters.memoryGen.includes(gen.value)}
                          onChange={(e) => handleFilterChange('memoryGen', gen.value, e.target.checked)}
                        />
                        <span>{gen.label}</span>
                      </label>
                    ))}
                    {memoryGenData.length > 4 && (
                      <button 
                        onClick={() => toggleExpand('memoryGen')} 
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
                        {expandedFilters.memoryGen ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SERIES (Sub-brand) */}
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
            </aside>

            {/* MAIN CONTENT - PRODUCTS */}
            <main className="cpu-main">
              {/* HEADER */}
              <div className="cpu-main-header">
                <h1>VGA / CARD ĐỒ HỌA</h1>
                
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
                <div style={{color: '#aaa', padding: '40px 0', textAlign: 'center'}}>Không tìm thấy VGA nào phù hợp với bộ lọc hiện tại.</div>
              ) : (
                <div className="cpu-grid">
                  {visibleProducts.map(product => {
                    const price = getProductPrice(product)
                    const image = getProductImage(product)
                    return (
                      <div key={product._id} className="cpu-card">
                        {product.sale > 0 && (
                          <div className="cpu-card-sale-badge">-{product.sale}%</div>
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
                              {product.sale > 0 && product.variants?.[0]?.price && (
                                <span className="cpu-card-original-price">
                                  {formatPrice(product.variants[0].price)}
                                </span>
                              )}
                            </div>
                            <div className="cpu-card-actions">
                              <button className="btn-add-cart" title="Thêm vào giỏ">
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
