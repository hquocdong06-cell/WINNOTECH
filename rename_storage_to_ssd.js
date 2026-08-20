require('dotenv').config()
const mongoose = require('mongoose')
const Category = require('./models/Category')

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/WINNOTech'


async function run() {
  await mongoose.connect(MONGO_URI)
  console.log('✅ Đã kết nối MongoDB')

  const result = await Category.findOneAndUpdate(
    { slug: 'storage' },
    { $set: { name: 'SSD' } },
    { new: true }
  )

  if (result) {
    console.log(`✅ Đã đổi tên thành công: "${result.name}" (slug: ${result.slug})`)
  } else {
    console.log('❌ Không tìm thấy danh mục có slug = "storage"')
  }

  await mongoose.disconnect()
  console.log('🔌 Đã ngắt kết nối MongoDB')
}

run().catch(err => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
