/**
 * SEED DATA - Tạo dữ liệu mẫu vào MongoDB WINNOTech
 * Run: node seed_data.js
 * 
 * Script này sẽ tạo dữ liệu mẫu hoàn chỉnh cho tất cả collections
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Hàm gửi request HTTP
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: responseData ? JSON.parse(responseData) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// ==========================================
// SAMPLE DATA - DỮ LIỆU MẪU
// ==========================================

// 1. USER DATA
const sampleUsers = [
    {
        name: "Admin WINNOTech",
        email: "admin@winnotech.com",
        password: "Admin@123456",
        role: "admin",
        status: "active",
        avatar: "https://example.com/avatars/admin.jpg"
    },
    {
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        password: "User@123456",
        role: "user",
        status: "active",
        avatar: "https://example.com/avatars/user1.jpg"
    },
    {
        name: "Trần Thị B",
        email: "tranthib@gmail.com",
        password: "User@123456",
        role: "user",
        status: "active",
        avatar: "https://example.com/avatars/user2.jpg"
    },
    {
        name: "Phạm Minh C",
        email: "phamminhc@gmail.com",
        password: "Seller@123456",
        role: "seller",
        status: "active",
        avatar: "https://example.com/avatars/seller1.jpg"
    }
];

// 2. CATEGORY DATA
const sampleCategories = [
    {
        name: "CPU / Bộ Xử Lý",
        slug: "cpu-bo-xu-ly",
        description: "Các loại CPU và bộ xử lý máy tính",
        image: "https://example.com/categories/cpu.jpg",
        status: "active",
        parent_id: null
    },
    {
        name: "GPU / Card Đồ Họa",
        slug: "gpu-card-do-hoa",
        description: "Card đồ họa cho gaming và design",
        image: "https://example.com/categories/gpu.jpg",
        status: "active",
        parent_id: null
    },
    {
        name: "Mainboard / Bo Mạch Chủ",
        slug: "mainboard-bo-mach-chu",
        description: "Bo mạch chủ các hãng Intel, AMD",
        image: "https://example.com/categories/mainboard.jpg",
        status: "active",
        parent_id: null
    },
    {
        name: "RAM / Bộ Nhớ",
        slug: "ram-bo-nho",
        description: "Bộ nhớ RAM các dung lượng khác nhau",
        image: "https://example.com/categories/ram.jpg",
        status: "active",
        parent_id: null
    },
    {
        name: "SSD / HDD / Ổ Cứng",
        slug: "ssd-hdd-o-cung",
        description: "Ổ cứng SSD và HDD",
        image: "https://example.com/categories/storage.jpg",
        status: "active",
        parent_id: null
    }
];

// 3. BRAND DATA
const sampleBrands = [
    {
        name: "Intel",
        slug: "intel",
        logo: "https://example.com/logos/intel.png",
        description: "Nhà sản xuất CPU hàng đầu thế giới",
        status: "active"
    },
    {
        name: "AMD",
        slug: "amd",
        logo: "https://example.com/logos/amd.png",
        description: "Nhà sản xuất CPU, GPU, chipset",
        status: "active"
    },
    {
        name: "NVIDIA",
        slug: "nvidia",
        logo: "https://example.com/logos/nvidia.png",
        description: "Nhà sản xuất GPU NVIDIA GeForce",
        status: "active"
    },
    {
        name: "ASUS",
        slug: "asus",
        logo: "https://example.com/logos/asus.png",
        description: "Nhà sản xuất bo mạch, linh kiện",
        status: "active"
    },
    {
        name: "Kingston",
        slug: "kingston",
        logo: "https://example.com/logos/kingston.png",
        description: "Nhà sản xuất RAM, SSD, USB",
        status: "active"
    },
    {
        name: "Samsung",
        slug: "samsung",
        logo: "https://example.com/logos/samsung.png",
        description: "Nhà sản xuất SSD, RAM, màn hình",
        status: "active"
    }
];

// 4. PRODUCT DATA
const sampleProducts = [
    {
        name: "CPU Intel Core i9-13900K",
        slug: "cpu-intel-core-i9-13900k",
        description: "Bộ xử lý Intel Core i9 thế hệ 13 với 24 lõi, tần số lên tới 5.8GHz. Hiệu năng mạnh cho gaming, streaming và công việc chuyên nghiệp.",
        short_desc: "Intel Core i9-13900K - 24 cores, 5.8GHz",
        thumnail: "https://example.com/products/cpu-i9-13900k.jpg",
        sale: 15,
        status: "active",
        cat_id: "CPU_ID",
        brand_id: "INTEL_ID"
    },
    {
        name: "CPU AMD Ryzen 9 7950X3D",
        slug: "cpu-amd-ryzen-9-7950x3d",
        description: "Bộ xử lý AMD Ryzen 9 với 16 lõi, 32 thread, công nghệ 3D V-Cache độc quyền.",
        short_desc: "AMD Ryzen 9 7950X3D - 16 cores, 3D V-Cache",
        thumnail: "https://example.com/products/cpu-ryzen-7950x3d.jpg",
        sale: 10,
        status: "active",
        cat_id: "CPU_ID",
        brand_id: "AMD_ID"
    },
    {
        name: "GPU NVIDIA RTX 4090",
        slug: "gpu-nvidia-rtx-4090",
        description: "Card đồ họa NVIDIA RTX 4090 với 16GB GDDR6X, hiệu năng cao nhất cho gaming 4K và AI.",
        short_desc: "NVIDIA RTX 4090 - 24GB GDDR6X, Gaming 4K",
        thumnail: "https://example.com/products/gpu-rtx-4090.jpg",
        sale: 5,
        status: "active",
        cat_id: "GPU_ID",
        brand_id: "NVIDIA_ID"
    },
    {
        name: "GPU AMD Radeon RX 7900 XTX",
        slug: "gpu-amd-radeon-rx-7900-xtx",
        description: "Card đồ họa AMD Radeon RX 7900 XTX với 24GB GDDR6, hiệu năng cạnh tranh RTX 4090.",
        short_desc: "AMD Radeon RX 7900 XTX - 24GB GDDR6",
        thumnail: "https://example.com/products/gpu-radeon-7900-xtx.jpg",
        sale: 8,
        status: "active",
        cat_id: "GPU_ID",
        brand_id: "AMD_ID"
    },
    {
        name: "Motherboard ASUS ROG MAXIMUS Z790",
        slug: "motherboard-asus-rog-maximus-z790",
        description: "Bo mạch chủ ASUS ROG MAXIMUS Z790 hỗ trợ Intel Gen 13, PCIe 5.0, DDR5.",
        short_desc: "ASUS ROG MAXIMUS Z790 - Intel Gen 13, DDR5",
        thumnail: "https://example.com/products/mb-asus-rog-z790.jpg",
        sale: 12,
        status: "active",
        cat_id: "MAINBOARD_ID",
        brand_id: "ASUS_ID"
    },
    {
        name: "RAM Kingston Fury Beast DDR5 32GB",
        slug: "ram-kingston-fury-beast-ddr5-32gb",
        description: "Bộ nhớ Kingston Fury Beast DDR5 32GB (2x16GB), tần số 6000MHz, hiệu năng cao.",
        short_desc: "Kingston Fury Beast DDR5 32GB - 6000MHz",
        thumnail: "https://example.com/products/ram-kingston-fury-32gb.jpg",
        sale: 10,
        status: "active",
        cat_id: "RAM_ID",
        brand_id: "KINGSTON_ID"
    },
    {
        name: "SSD Samsung 990 Pro 2TB",
        slug: "ssd-samsung-990-pro-2tb",
        description: "SSD NVMe Samsung 990 Pro 2TB, tốc độ đọc ghi tới 7100MB/s, hỗ trợ PCIe 4.0.",
        short_desc: "Samsung 990 Pro 2TB - PCIe 4.0, 7100MB/s",
        thumnail: "https://example.com/products/ssd-samsung-990pro-2tb.jpg",
        sale: 15,
        status: "active",
        cat_id: "STORAGE_ID",
        brand_id: "SAMSUNG_ID"
    },
    {
        name: "SSD Kingston A3000 1TB",
        slug: "ssd-kingston-a3000-1tb",
        description: "SSD Kingston A3000 1TB, tốc độ 3500MB/s, giá cả phải chăng.",
        short_desc: "Kingston A3000 1TB - PCIe 3.0, 3500MB/s",
        thumnail: "https://example.com/products/ssd-kingston-a3000-1tb.jpg",
        sale: 10,
        status: "active",
        cat_id: "STORAGE_ID",
        brand_id: "KINGSTON_ID"
    }
];

// 5. PAYMENT METHOD DATA
const samplePaymentMethods = [
    {
        name: "Thẻ Tín Dụng",
        code: "CREDIT_CARD",
        description: "Thanh toán bằng thẻ tín dụng Visa, Mastercard, JCB",
        status: "active"
    },
    {
        name: "Thẻ Ghi Nợ",
        code: "DEBIT_CARD",
        description: "Thanh toán bằng thẻ ghi nợ",
        status: "active"
    },
    {
        name: "Chuyển Khoản Ngân Hàng",
        code: "BANK_TRANSFER",
        description: "Chuyển tiền trực tiếp vào tài khoản ngân hàng",
        status: "active"
    },
    {
        name: "Ví Điện Tử",
        code: "E_WALLET",
        description: "Thanh toán qua Momo, ZaloPay, v.v",
        status: "active"
    },
    {
        name: "Thanh Toán Khi Nhận Hàng",
        code: "COD",
        description: "Thanh toán khi nhận hàng (Cash on Delivery)",
        status: "active"
    }
];

// ==========================================
// MAIN FUNCTION - HÀM CHÍNH
// ==========================================

async function seedData() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 BẮT ĐẦU TẠO DỮ LIỆU MẪU CHO MONGODB - WINNOTECH');
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        // Store IDs for references
        const userIds = [];
        const categoryIds = [];
        const brandIds = [];
        const productIds = [];
        const paymentIds = [];

        // ===== 1. CREATE USERS =====
        console.log('📝 BƯỚC 1: TẠO USERS');
        console.log('─────────────────────────────────────────────────────────\n');
        
        for (let i = 0; i < sampleUsers.length; i++) {
            const user = sampleUsers[i];
            console.log(`  [${i + 1}/${sampleUsers.length}] Tạo user: ${user.name}`);
            
            try {
                const response = await makeRequest('POST', '/api/account', user);
                if (response.status === 201 || response.status === 200) {
                    console.log(`  ✅ Thành công\n`);
                    if (response.body && response.body.data && response.body.data._id) {
                        userIds.push(response.body.data._id);
                    }
                } else {
                    console.log(`  ⚠️  Mã: ${response.status} - ${JSON.stringify(response.body)}\n`);
                }
            } catch (error) {
                console.log(`  ❌ Lỗi: ${error.message}\n`);
            }
        }
        console.log(`✅ Tạo ${userIds.length}/${sampleUsers.length} users thành công\n\n`);

        // ===== 2. CREATE CATEGORIES =====
        console.log('📝 BƯỚC 2: TẠO DANH MỤC (CATEGORIES)');
        console.log('─────────────────────────────────────────────────────────\n');
        
        for (let i = 0; i < sampleCategories.length; i++) {
            const category = sampleCategories[i];
            console.log(`  [${i + 1}/${sampleCategories.length}] Tạo danh mục: ${category.name}`);
            
            try {
                // Tạm thời không có endpoint category, chỉ log
                console.log(`  ℹ️  Cần tạo API endpoint /api/category\n`);
                categoryIds.push(`cat_${i}`);
            } catch (error) {
                console.log(`  ❌ Lỗi: ${error.message}\n`);
            }
        }
        console.log(`ℹ️  Lưu ý: Tạo categories qua MongoDB Compass hoặc endpoint riêng\n\n`);

        // ===== 3. CREATE BRANDS =====
        console.log('📝 BƯỚC 3: TẠO THƯƠNG HIỆU (BRANDS)');
        console.log('─────────────────────────────────────────────────────────\n');
        
        for (let i = 0; i < sampleBrands.length; i++) {
            const brand = sampleBrands[i];
            console.log(`  [${i + 1}/${sampleBrands.length}] Tạo thương hiệu: ${brand.name}`);
            
            try {
                // Tạm thời không có endpoint brand, chỉ log
                console.log(`  ℹ️  Cần tạo API endpoint /api/brand\n`);
                brandIds.push(`brand_${i}`);
            } catch (error) {
                console.log(`  ❌ Lỗi: ${error.message}\n`);
            }
        }
        console.log(`ℹ️  Lưu ý: Tạo brands qua MongoDB Compass hoặc endpoint riêng\n\n`);

        // ===== 4. CREATE PRODUCTS =====
        console.log('📝 BƯỚC 4: TẠO SẢN PHẨM (PRODUCTS)');
        console.log('─────────────────────────────────────────────────────────\n');
        
        const productsToCreate = sampleProducts.map((p, i) => ({
            ...p,
            cat_id: categoryIds[i % categoryIds.length],
            brand_id: brandIds[i % brandIds.length]
        }));

        for (let i = 0; i < productsToCreate.length; i++) {
            const product = productsToCreate[i];
            console.log(`  [${i + 1}/${productsToCreate.length}] Tạo sản phẩm: ${product.name}`);
            
            try {
                const response = await makeRequest('POST', '/api/product', product);
                if (response.status === 201 || response.status === 200) {
                    console.log(`  ✅ Thành công\n`);
                    if (response.body && response.body.data && response.body.data._id) {
                        productIds.push(response.body.data._id);
                    }
                } else {
                    console.log(`  ⚠️  Mã: ${response.status} - ${JSON.stringify(response.body)}\n`);
                }
            } catch (error) {
                console.log(`  ❌ Lỗi: ${error.message}\n`);
            }
        }
        console.log(`✅ Tạo ${productIds.length}/${productsToCreate.length} sản phẩm thành công\n\n`);

        // ===== 5. CREATE PAYMENT METHODS =====
        console.log('📝 BƯỚC 5: TẠO PHƯƠNG THỨC THANH TOÁN (PAYMENT METHODS)');
        console.log('─────────────────────────────────────────────────────────\n');
        
        for (let i = 0; i < samplePaymentMethods.length; i++) {
            const payment = samplePaymentMethods[i];
            console.log(`  [${i + 1}/${samplePaymentMethods.length}] Tạo phương thức: ${payment.name}`);
            
            try {
                // Tạm thời không có endpoint payment, chỉ log
                console.log(`  ℹ️  Cần tạo API endpoint /api/payment-method\n`);
                paymentIds.push(`payment_${i}`);
            } catch (error) {
                console.log(`  ❌ Lỗi: ${error.message}\n`);
            }
        }
        console.log(`ℹ️  Lưu ý: Tạo payment methods qua MongoDB Compass hoặc endpoint riêng\n\n`);

        // ===== SUMMARY =====
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📊 TÓM TẮT KẾT QUẢ');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(`✅ Users:             ${userIds.length}/${sampleUsers.length} tạo thành công`);
        console.log(`ℹ️  Categories:        Cần tạo API endpoint`);
        console.log(`ℹ️  Brands:            Cần tạo API endpoint`);
        console.log(`✅ Products:          ${productIds.length}/${productsToCreate.length} tạo thành công`);
        console.log(`ℹ️  Payment Methods:   Cần tạo API endpoint\n`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('💡 CÁC BƯỚC TIẾP THEO:\n');
        console.log('1. Tạo API endpoints cho Category, Brand, PaymentMethod');
        console.log('2. Tạo dữ liệu cho các collection khác (ProductVariant, Order, etc.)');
        console.log('3. Xem MONGODB_FIELDS_GUIDE.md để hiểu cấu trúc dữ liệu\n');
        console.log('Cảm ơn đã sử dụng WINNOTech! 🚀\n');

    } catch (error) {
        console.error('❌ Lỗi khi tạo dữ liệu:', error);
        process.exit(1);
    }
}

// Run
seedData();
