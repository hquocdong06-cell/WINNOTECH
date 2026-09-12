/**
 * Migration: Xóa field `compatibility_meta` khỏi tất cả documents trong collection Product
 *
 * Chạy: node scripts/remove_compatibility_meta_field.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WINNOTech';

async function main() {
  console.log('🔌 Kết nối MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB\n');

  const collection = mongoose.connection.db.collection('Product');

  const countBefore = await collection.countDocuments({ compatibility_meta: { $exists: true } });
  console.log(`📦 Số documents có field "compatibility_meta": ${countBefore}`);

  if (countBefore === 0) {
    console.log('✔ Không có document nào cần migration. Thoát.');
    await mongoose.disconnect();
    return;
  }

  const result = await collection.updateMany(
    { compatibility_meta: { $exists: true } },
    { $unset: { compatibility_meta: '' } }
  );

  console.log(`\n🗑  Đã xóa field "compatibility_meta" khỏi ${result.modifiedCount} documents.`);

  const countAfter = await collection.countDocuments({ compatibility_meta: { $exists: true } });
  console.log(`📦 Documents còn field "compatibility_meta" sau migration: ${countAfter}`);

  if (countAfter === 0) {
    console.log('\n✅ Migration hoàn tất! Field "compatibility_meta" đã được xóa khỏi toàn bộ collection Product.');
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
