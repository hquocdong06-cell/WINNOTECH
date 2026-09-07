/**
 * SCRIPT EXPORT DATABASE MONGODB RA 1 FILE DUY NHẤT — WINNOTech
 * Xuất toàn bộ collections, documents và indexes thành 1 file JSON chuẩn EJSON (Extended JSON).
 * Giữ nguyên 100% kiểu dữ liệu: ObjectId, Date, Number, Regex,...
 * 
 * Cách dùng:
 *   node export_db.js
 *   node export_db.js [ten_file_xuat.json] [mongodb_uri]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { EJSON } = require('bson');
require('dotenv').config();

const OUTPUT_FILE = process.argv[2] || path.join(__dirname, 'winnotech_backup.json');
const MONGO_URI = process.argv[3] || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech';

async function exportDatabase() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🚀 BẮT ĐẦU XUẤT DATABASE WINNOTECH RA 1 FILE');
  console.log('🔌 Kết nối tới: ' + MONGO_URI);
  console.log('📁 File đích:   ' + OUTPUT_FILE);
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`✅ Kết nối thành công tới Database: [${dbName}]\n`);

    const collections = await db.listCollections().toArray();
    const exportData = {
      database: dbName,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      totalCollections: collections.length,
      collections: []
    };

    let totalDocs = 0;

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Bỏ qua các collection hệ thống của MongoDB
      if (colName.startsWith('system.')) continue;

      const collection = db.collection(colName);
      const docs = await collection.find({}).toArray();
      let indexes = [];
      try {
        indexes = await collection.indexes();
      } catch (err) {
        // Một số view hoặc quyền có thể không lấy được index
      }

      exportData.collections.push({
        name: colName,
        indexes: indexes,
        count: docs.length,
        documents: docs
      });

      totalDocs += docs.length;
      console.log(`📦 Đã export collection [${colName.padEnd(25)}]: ${docs.length.toString().padStart(5)} docs | ${indexes.length} indexes`);
    }

    console.log('\n💾 Đang ghi dữ liệu ra file...');
    // Dùng EJSON để bảo toàn kiểu dữ liệu ObjectId, Date,...
    const jsonString = EJSON.stringify(exportData, null, 2);
    fs.writeFileSync(OUTPUT_FILE, jsonString, 'utf8');

    const fileStats = fs.statSync(OUTPUT_FILE);
    const fileSizeKB = (fileStats.size / 1024).toFixed(2);

    console.log('════════════════════════════════════════════════════════════');
    console.log('🎉 XUẤT DATABASE THÀNH CÔNG!');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`📊 Tổng số collection: ${exportData.collections.length}`);
    console.log(`📑 Tổng số documents:  ${totalDocs.toLocaleString('vi-VN')}`);
    console.log(`📁 Đường dẫn file:     ${path.resolve(OUTPUT_FILE)}`);
    console.log(`📦 Kích thước file:    ${fileSizeKB} KB`);
    console.log('════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Lỗi khi xuất database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

exportDatabase();
