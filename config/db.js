const mongoose = require('mongoose');
require('dotenv').config(); 

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech';
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Lỗi kết nối Database:', error.message);
  }
};

module.exports = connectDB;
