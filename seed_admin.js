const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const UserModel = require('./models/User');

async function seedAdminAccount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối Database MongoDB');

    const adminEmail = 'admin@winnotech.com';
    const adminPasswordRaw = 'admin123';

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10);

    // Kiểm tra xem admin đã tồn tại chưa
    let adminUser = await UserModel.findOne({ email: adminEmail });

    if (adminUser) {
      // Cập nhật thông tin admin & đảm bảo role là 'admin'
      adminUser.name = 'Quản Trị Viên WinnoTech';
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      adminUser.status = 'active';
      await adminUser.save();
      console.log('🔄 Đã cập nhật tài khoản Admin tồn tại.');
    } else {
      // Tạo tài khoản admin mới
      adminUser = await UserModel.create({
        name: 'Quản Trị Viên WinnoTech',
        email: adminEmail,
        password: hashedPassword,
        phone: '0988888888',
        role: 'admin',
        status: 'active',
        avatar: '/public/images/uploads/admin_avatar.png',
      });
      console.log('✨ Đã tạo mới tài khoản Admin thành công!');
    }

    console.log('====================================================');
    console.log('🔑 THÔNG TIN DÙNG ĐỂ ĐĂNG NHẬP TRANG ADMIN:');
    console.log(`   Email   : ${adminEmail}`);
    console.log(`   Password: ${adminPasswordRaw}`);
    console.log(`   Role    : admin`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo tài khoản Admin:', error);
    process.exit(1);
  }
}

seedAdminAccount();
