/**
 * seed_category_images.js
 * Cập nhật trường `image` cho từng Category trong MongoDB
 * Chạy: node seed_category_images.js
 */

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const CategoryModel = require('./models/Category');

// Map slug → ảnh đại diện lấy từ public/images
// Dùng ảnh đầu tiên của mỗi folder tương ứng
const CATEGORY_IMAGE_MAP = {
  cpu:       'http://localhost:3000/public/images/anh_cpu_intel/image_10.png',
  gpu:       'http://localhost:3000/public/images/anh_vga_msi/image_10.png',
  mainboard: 'http://localhost:3000/public/images/anh_mainboard_asus/image_10.png',
  ram:       'http://localhost:3000/public/images/anh_ram_corsair/image_13.png',
  storage:   'http://localhost:3000/public/images/anh_o_cung/image_10.png',
  psu:       'http://localhost:3000/public/images/anh_nguon_may_tinh/image_13.png',
  cooling:   'http://localhost:3000/public/images/anh_tan_nhiet/image_10.png',
  case:      'http://localhost:3000/public/images/anh_case/image_11.png',
};

async function seedCategoryImages() {
  await connectDB();
  console.log('✅ Connected to MongoDB');

  for (const [slug, imageUrl] of Object.entries(CATEGORY_IMAGE_MAP)) {
    const result = await CategoryModel.findOneAndUpdate(
      { slug },
      { image: imageUrl },
      { new: true }
    );
    if (result) {
      console.log(`✅ Updated [${slug}]: ${imageUrl}`);
    } else {
      console.log(`⚠️  Category not found for slug: ${slug}`);
    }
  }

  console.log('\n🎉 Done! Tất cả category đã được cập nhật ảnh.');
  mongoose.connection.close();
}

seedCategoryImages().catch((err) => {
  console.error('❌ Error:', err);
  mongoose.connection.close();
  process.exit(1);
});
