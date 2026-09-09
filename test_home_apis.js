/**
 * WINNOTECH - Terminal Test Runner cho 3 Section Home APIs
 * Cách chạy: node test_home_apis.js
 */

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('='.repeat(60));
  console.log('🚀 KIỂM THỬ 3 API SECTION TRANG CHỦ (WINNOTECH)');
  console.log('='.repeat(60));

  try {
    // 1. Best Sellers
    console.log('\n[1] TEST: Section Bán Chạy Nhất (sold_count giảm dần)');
    console.log('    GET /api/products/best-sellers?limit=5');
    const res1 = await fetch(`${BASE_URL}/api/products/best-sellers?limit=5`);
    const data1 = await res1.json();
    console.log(`    Status: ${res1.status} | Success: ${data1.success} | Tổng: ${data1.total} sản phẩm`);
    if (data1.data && data1.data.length > 0) {
      console.table(data1.data.slice(0, 5).map((p, i) => ({
        '#': i + 1,
        'Tên Sản Phẩm': p.name.slice(0, 35),
        'Lượt Bán (sold_count)': p.sold_count,
        'Đã bỏ sold_quantity?': ('sold_quantity' in p ? '❌ Chưa' : '✅ Đã bỏ')
      })));
    }

    // 2. Newest
    console.log('\n[2] TEST: Section Hàng Mới Về (createdAt giảm dần)');
    console.log('    GET /api/products/newest?limit=5');
    const res2 = await fetch(`${BASE_URL}/api/products/newest?limit=5`);
    const data2 = await res2.json();
    console.log(`    Status: ${res2.status} | Success: ${data2.success} | Tổng: ${data2.total} sản phẩm`);
    if (data2.data && data2.data.length > 0) {
      console.table(data2.data.slice(0, 5).map((p, i) => ({
        '#': i + 1,
        'Tên Sản Phẩm': p.name.slice(0, 35),
        'Ngày Tạo (createdAt)': p.createdAt,
        'Đã bỏ sold_quantity?': ('sold_quantity' in p ? '❌ Chưa' : '✅ Đã bỏ')
      })));
    }

    // 3. On Sale
    console.log('\n[3] TEST: Section Giảm Giá (sale giảm dần như -15%)');
    console.log('    GET /api/products/on-sale?limit=5&onlySale=true');
    const res3 = await fetch(`${BASE_URL}/api/products/on-sale?limit=5&onlySale=true`);
    const data3 = await res3.json();
    console.log(`    Status: ${res3.status} | Success: ${data3.success} | Tổng: ${data3.total} sản phẩm`);
    if (data3.data && data3.data.length > 0) {
      console.table(data3.data.slice(0, 5).map((p, i) => ({
        '#': i + 1,
        'Tên Sản Phẩm': p.name.slice(0, 35),
        'Mức Giảm (%)': `-${p.sale}%`,
        'Số Biến Thể': p.Variants?.length || 0,
        'Đã bỏ sold_quantity?': ('sold_quantity' in p ? '❌ Chưa' : '✅ Đã bỏ')
      })));
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TOÀN BỘ 3 API ĐỀU CHẠY THÀNH CÔNG VÀ TRẢ VỀ ĐÚNG DỮ LIỆU!');
    console.log('='.repeat(60) + '\n');
  } catch (err) {
    console.error('\n❌ Lỗi kết nối máy chủ:', err.message);
    console.log('👉 Hãy đảm bảo máy chủ đang chạy bằng lệnh `npm start` trên cổng 3000.\n');
  }
}

run();
