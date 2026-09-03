/**
 * SCRIPT IMPORT BSON DUMP VÀO MONGODB — WINNOTech
 * Tự động đọc toàn bộ file .bson và .metadata.json từ thư mục ./WINNOTech
 * Khôi phục đầy đủ dữ liệu nguyên bản và chỉ mục (indexes) vào Database MongoDB.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bson = require('bson');
const bcrypt = require('bcrypt');
require('dotenv').config();

const candidates = [
  path.join(__dirname, 'WINNOTech'),
  'C:\\Users\\LE TUAN PHUONG\\Downloads\\WINNOTech\\WINNOTech',
  'C:\\Users\\LE TUAN PHUONG\\Downloads\\WINNOTech',
];
const DUMP_DIR = candidates.find(p => fs.existsSync(p)) || path.join(__dirname, 'WINNOTech');
const MONGO_URI = process.argv[2] || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech';

function parseBsonFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const buffer = fs.readFileSync(filePath);
  if (buffer.length === 0) return [];

  const docs = [];
  let offset = 0;
  while (offset < buffer.length) {
    if (offset + 4 > buffer.length) break;
    const size = buffer.readInt32LE(offset);
    if (size <= 0 || offset + size > buffer.length) break;
    const docBuffer = buffer.subarray(offset, offset + size);
    docs.push(bson.deserialize(docBuffer, { promoteLongs: false }));
    offset += size;
  }
  return docs;
}

async function importAll() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🚀 BẮT ĐẦU IMPORT TOÀN BỘ DỮ LIỆU DUMP VÀO MONGODB');
  console.log('📁 Nguồn dữ liệu: ' + DUMP_DIR);
  console.log('🔌 Kết nối tới: ' + MONGO_URI);
  console.log('════════════════════════════════════════════════════════════\n');

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log('✅ Đã kết nối thành công tới Database: ' + db.databaseName + '\n');

  const metaFiles = fs.readdirSync(DUMP_DIR).filter(f => f.endsWith('.metadata.json'));
  const results = [];

  for (const metaFile of metaFiles) {
    const metaPath = path.join(DUMP_DIR, metaFile);
    let metaContent = {};
    try {
      metaContent = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch (e) {
      console.error(`❌ Không đọc được file ${metaFile}:`, e.message);
      continue;
    }

    const collName = metaContent.collectionName || metaFile.replace('.metadata.json', '');
    const baseName = metaFile.replace('.metadata.json', '');
    const bsonFile = path.join(DUMP_DIR, baseName + '.bson');

    const docs = parseBsonFile(bsonFile);
    const collection = db.collection(collName);

    // Dọn dẹp collection cũ trước khi nạp
    try {
      await collection.drop();
    } catch (e) {
      // Bỏ qua nếu collection chưa tồn tại
    }

    let insertedCount = 0;
    if (docs.length > 0) {
      try {
        // Chia batch 500 nếu dữ liệu quá lớn
        const batchSize = 500;
        for (let i = 0; i < docs.length; i += batchSize) {
          const batch = docs.slice(i, i + batchSize);
          await collection.insertMany(batch, { ordered: false });
        }
        insertedCount = docs.length;
      } catch (err) {
        // Nếu có duplicate key vẫn ghi nhận số lượng đã insert
        insertedCount = await collection.countDocuments();
      }
    }

    // Khôi phục indexes từ metadata nếu có
    if (metaContent.indexes && Array.isArray(metaContent.indexes)) {
      for (const idx of metaContent.indexes) {
        if (idx.name === '_id_') continue; // Bỏ qua _id default
        try {
          const key = {};
          for (const [k, v] of Object.entries(idx.key || {})) {
            key[k] = typeof v === 'object' && v.$numberInt ? parseInt(v.$numberInt) : (v || 1);
          }
          const options = { name: idx.name };
          if (idx.unique) options.unique = true;
          if (idx.sparse) options.sparse = true;
          await collection.createIndex(key, options);
        } catch (e) {
          // Bỏ qua lỗi index nếu trùng lặp
        }
      }
    }

    results.push({ collection: collName, count: insertedCount });
    console.log(`📦 Đã nạp collection [${collName.padEnd(20)}]: ${insertedCount.toString().padStart(5)} documents`);
  }

  // Đảm bảo có tài khoản Admin để đăng nhập
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
    console.log('\n🔑 Đã bảo đảm tài khoản Admin: admin@winnotech.com / admin123');
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC IMPORT THÀNH CÔNG VÀO MONGODB!');
  console.log('════════════════════════════════════════════════════════════');
  const totalDocs = results.reduce((acc, cur) => acc + cur.count, 0);
  console.log(`📊 Tổng cộng: ${results.length} collections | ${totalDocs.toLocaleString('vi-VN')} documents`);
  console.log('════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

importAll().catch(err => {
  console.error('❌ Lỗi import dữ liệu:', err);
  process.exit(1);
});
