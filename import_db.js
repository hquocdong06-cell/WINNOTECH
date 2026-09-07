/**
 * SCRIPT IMPORT DATABASE TỪ 1 FILE JSON VÀO MONGODB — WINNOTech
 * Tự động đọc file EJSON, khôi phục đầy đủ dữ liệu, kiểu dữ liệu (ObjectId, Date,...)
 * và chỉ mục (indexes) vào Database MongoDB trên máy mới.
 * 
 * Cách dùng:
 *   node import_db.js
 *   node import_db.js [duong_dan_file.json] [mongodb_uri]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { EJSON } = require('bson');
const bcrypt = require('bcrypt');
require('dotenv').config();

const INPUT_FILE = process.argv[2] || path.join(__dirname, 'winnotech_backup.json');
const MONGO_URI = process.argv[3] || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech';

async function importDatabase() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🚀 BẮT ĐẦU IMPORT DATABASE TỪ FILE VÀO MONGODB');
  console.log('📁 File dữ liệu: ' + INPUT_FILE);
  console.log('🔌 Kết nối tới: ' + MONGO_URI);
  console.log('════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Không tìm thấy file dữ liệu: ${INPUT_FILE}`);
    console.error('Vui lòng kiểm tra lại đường dẫn file hoặc truyền đường dẫn vào: node import_db.js <duong_dan_file>');
    process.exit(1);
  }

  try {
    console.log('📖 Đang đọc và giải mã file dữ liệu...');
    const rawContent = fs.readFileSync(INPUT_FILE, 'utf8');
    const backupData = EJSON.parse(rawContent);

    if (!backupData.collections || !Array.isArray(backupData.collections)) {
      throw new Error('Định dạng file không hợp lệ (thiếu mảng collections).');
    }

    console.log(`ℹ️ Thông tin backup: Database [${backupData.database || 'N/A'}] | Xuất lúc: ${backupData.exportedAt || 'N/A'}\n`);

    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    console.log(`✅ Kết nối thành công tới Database: [${db.databaseName}]\n`);

    const results = [];
    let totalDocsImported = 0;

    for (const colData of backupData.collections) {
      const collName = colData.name;
      const docs = colData.documents || [];
      const indexes = colData.indexes || [];
      const collection = db.collection(collName);

      // Xóa sạch collection cũ trước khi nạp để tránh trùng lặp
      try {
        await collection.drop();
      } catch (e) {
        // Bỏ qua nếu collection chưa tồn tại
      }

      let insertedCount = 0;
      if (docs.length > 0) {
        // Chia batch nạp 500 documents/lần
        const batchSize = 500;
        for (let i = 0; i < docs.length; i += batchSize) {
          const batch = docs.slice(i, i + batchSize);
          await collection.insertMany(batch, { ordered: false });
        }
        insertedCount = docs.length;
      }

      // Khôi phục indexes
      if (indexes && Array.isArray(indexes)) {
        for (const idx of indexes) {
          if (idx.name === '_id_') continue;
          try {
            const key = idx.key || {};
            const options = { name: idx.name };
            if (idx.unique) options.unique = true;
            if (idx.sparse) options.sparse = true;
            await collection.createIndex(key, options);
          } catch (idxErr) {
            // Bỏ qua lỗi tạo index nếu có
          }
        }
      }

      results.push({ collection: collName, count: insertedCount });
      totalDocsImported += insertedCount;
      console.log(`📦 Đã import [${collName.padEnd(25)}]: ${insertedCount.toString().padStart(5)} docs`);
    }

    // Đảm bảo có tài khoản Admin để đăng nhập hệ thống
    const userCollection = db.collection('User');
    let adminExists = await userCollection.findOne({ email: 'admin@winnotech.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await userCollection.insertOne({
        name: 'Quản Trị Viên WinnoTech',
        email: 'admin@winnotech.com',
        password: hashedPassword,
        phone: '0988888888',
        role: 'admin',
        status: 'active',
        avatar: '/public/images/uploads/admin_avatar.png',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('\n🔑 Đã tạo sẵn tài khoản Admin: admin@winnotech.com / admin123');
    }

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC IMPORT THÀNH CÔNG VÀO MONGODB!');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`📊 Tổng số collection: ${results.length}`);
    console.log(`📑 Tổng số documents:  ${totalDocsImported.toLocaleString('vi-VN')}`);
    console.log(`🔌 Database đích:       ${db.databaseName}`);
    console.log('════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Lỗi khi import dữ liệu:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

importDatabase();
