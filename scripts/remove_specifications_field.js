/**
 * Migration: Xóa field `specifications` khỏi tất cả documents trong collection Product
 * Dữ liệu thông số kỹ thuật đã được chuyển sang bảng Specifications (ERD).
 *
 * Chạy: node scripts/remove_specifications_field.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WINNOTech';

async function main() {
  console.log('🔌 Kết nối MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB\n');

  const db = mongoose.connection.db;
  const collection = db.collection('Product');

  // Đếm số documents có chứa field specifications
  const countBefore = await collection.countDocuments({ specifications: { $exists: true } });
  console.log(`📦 Số documents có field "specifications": ${countBefore}`);

  if (countBefore === 0) {
    console.log('✔ Không có document nào cần migration. Thoát.');
    await mongoose.disconnect();
    return;
  }

  // Xóa field specifications bằng $unset
  const result = await collection.updateMany(
    { specifications: { $exists: true } },
    { $unset: { specifications: '' } }
  );

  console.log(`\n🗑  Đã xóa field "specifications" khỏi ${result.modifiedCount} documents.`);

  // Kiểm tra lại
  const countAfter = await collection.countDocuments({ specifications: { $exists: true } });
  console.log(`📦 Documents còn field "specifications" sau migration: ${countAfter}`);

  if (countAfter === 0) {
    console.log('\n✅ Migration hoàn tất! Field "specifications" đã được xóa khỏi toàn bộ collection Product.');
  } else {
    console.log('\n⚠️  Vẫn còn document chưa được cập nhật, vui lòng chạy lại script.');
  }

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB.');
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
