const mongoose = require('mongoose');
const moment = require('moment');
require('dotenv').config();

const { Order, OrderItem } = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { ProductVariant } = require('../models/ProductVariant');

// Danh sách khách hàng thực tế đa dạng địa chỉ
const CUSTOMERS = [
  { name: 'Nguyễn Hoàng Long', phone: '0912345678', address: '120 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội' },
  { name: 'Trần Minh Quân', phone: '0987654321', address: '45 Lê Duẩn, P. Bến Nghé, Q. 1, TP. Hồ Chí Minh' },
  { name: 'Lê Thanh Hằng', phone: '0903112233', address: '88 Nguyễn Thị Minh Khai, P. 6, Q. 3, TP. Hồ Chí Minh' },
  { name: 'Phạm Đức Anh', phone: '0978456123', address: '15 Quang Trung, P. Thạch Thang, Q. Hải Châu, Đà Nẵng' },
  { name: 'Đỗ Thu Trang', phone: '0934567890', address: '72 Nguyễn Trãi, P. Thượng Đình, Q. Thanh Xuân, Hà Nội' },
  { name: 'Vũ Hải Nam', phone: '0982334455', address: '234 Trần Phú, P. Cầu Đất, Q. Ngô Quyền, Hải Phòng' },
  { name: 'Bùi Khánh Linh', phone: '0909887766', address: '56 Đại lộ Hòa Bình, P. Tân An, Q. Ninh Kiều, Cần Thơ' },
  { name: 'Đặng Tiến Dũng', phone: '0918273645', address: '189 Hoàng Hoa Thám, P. Liễu Giai, Q. Ba Đình, Hà Nội' },
  { name: 'Phan Bảo Ngọc', phone: '0945678123', address: '102 Võ Văn Tần, P. Võ Thị Sáu, Q. 3, TP. Hồ Chí Minh' },
  { name: 'Hoàng Gia Huy', phone: '0967890123', address: '35 Điện Biên Phủ, P. Đa Kao, Q. 1, TP. Hồ Chí Minh' },
  { name: 'Ngô Quốc Bảo', phone: '0913579246', address: '68 Hùng Vương, P. Vĩnh Thanh Vân, TP. Rạch Giá, Kiên Giang' },
  { name: 'Dương Thảo Nhi', phone: '0971234567', address: '14 Lạch Tray, P. Lạch Tray, Q. Ngô Quyền, Hải Phòng' },
  { name: 'Mai Văn Hùng', phone: '0988654321', address: '52 Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ' },
  { name: 'Lý Kiến Quốc', phone: '0908765432', address: '215 Trần Hưng Đạo, P. Cô Giang, Q. 1, TP. Hồ Chí Minh' },
  { name: 'Tạ Minh Khang', phone: '0938123456', address: '91 Phố Huế, P. Hàng Bài, Q. Hoàn Kiếm, Hà Nội' },
  { name: 'Trịnh Ngọc Ánh', phone: '0922334455', address: '168 Lê Lợi, P. Bến Thành, Q. 1, TP. Hồ Chí Minh' },
  { name: 'Võ Minh Trí', phone: '0944556677', address: '31 Nguyễn Chí Thanh, P. Ngọc Khánh, Q. Ba Đình, Hà Nội' },
  { name: 'Lương Hồng Phúc', phone: '0966778899', address: '77 Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng' },
  { name: 'Chu Đình Trọng', phone: '0911223344', address: '124 Hoàng Văn Thụ, P. 9, Q. Phú Nhuận, TP. Hồ Chí Minh' },
  { name: 'Hồ Quỳnh Nga', phone: '0989012345', address: '280 Tây Sơn, P. Trung Liệt, Q. Đống Đa, Hà Nội' },
  { name: 'Đoàn Nhật Minh', phone: '0933445566', address: '19 Nguyễn Huệ, P. Vĩnh Ninh, TP. Huế, Thừa Thiên Huế' },
  { name: 'Cao Thanh Sơn', phone: '0977889900', address: '402 Cách Mạng Tháng 8, P. 11, Q. 3, TP. Hồ Chí Minh' },
  { name: 'Đinh Phương Mai', phone: '0901234567', address: '55 Trần Hưng Đạo, TP. Quy Nhơn, Bình Định' },
  { name: 'Lâm Tuấn Kiệt', phone: '0914567890', address: '86 Phan Đăng Lưu, P. 5, Q. Phú Nhuận, TP. Hồ Chí Minh' },
  { name: 'Nguyễn Thị Bích Trâm', phone: '0981122334', address: '15 Kim Mã, P. Kim Mã, Q. Ba Đình, Hà Nội' },
  { name: 'Tôn Thất Hiếu', phone: '0939988776', address: '63 Lê Thánh Tôn, P. Bến Nghé, Q. 1, TP. Hồ Chí Minh' },
  { name: 'Phùng Hải Yến', phone: '0943322110', address: '98 Xã Đàn, P. Phương Liên, Q. Đống Đa, Hà Nội' },
  { name: 'Khổng Minh Thắng', phone: '0965544332', address: '12 Nguyễn Thái Học, P. Vạn Thạnh, TP. Nha Trang, Khánh Hòa' },
  { name: 'Trương Vĩnh Kỳ', phone: '0923456789', address: '174 Pasteur, P. Bến Nghé, Q. 1, TP. Hồ Chí Minh' },
  { name: 'Hà Kiều Anh', phone: '0987112233', address: '82 Chùa Bộc, P. Quang Trung, Q. Đống Đa, Hà Nội' }
];

const CARRIERS = [
  { name: 'Giao Hàng Nhanh (GHN)', prefix: 'GHN' },
  { name: 'Giao Hàng Tiết Kiệm (GHTK)', prefix: 'GHTK' },
  { name: 'Viettel Post', prefix: 'VTP' }
];

// Phân bổ 30 đơn chia đều 7 ngày: 4, 4, 5, 4, 4, 5, 4
const DAYS_DISTRIBUTION = [
  { dateStr: '2026-09-21', count: 4, hours: [8, 11, 15, 19] },
  { dateStr: '2026-09-22', count: 4, hours: [9, 13, 16, 20] },
  { dateStr: '2026-09-23', count: 5, hours: [8, 10, 14, 17, 21] },
  { dateStr: '2026-09-24', count: 4, hours: [9, 12, 15, 18] },
  { dateStr: '2026-09-25', count: 4, hours: [10, 13, 16, 20] },
  { dateStr: '2026-09-26', count: 5, hours: [8, 11, 14, 17, 21] },
  { dateStr: '2026-09-27', count: 4, hours: [9, 13, 17, 20] }
];

async function seedOrders() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech');
  console.log('Connected to MongoDB');

  // Lấy người dùng trong hệ thống
  const users = await User.find({ role: { $ne: 'admin' } }).lean();
  if (users.length === 0) {
    console.error('Không tìm thấy người dùng nào trong DB!');
    process.exit(1);
  }

  // Lấy các sản phẩm và biến thể hợp lệ
  const variants = await ProductVariant.find({ price: { $gt: 0 } }).populate('p_id').lean();
  if (variants.length === 0) {
    console.error('Không tìm thấy biến thể sản phẩm nào!');
    process.exit(1);
  }

  // Lấy payment methods
  const pmCollection = mongoose.connection.collection('paymentmethods');
  const paymentMethods = await pmCollection.find({}).toArray();
  const defaultPmId = paymentMethods[0]?._id || new mongoose.Types.ObjectId();

  let customerIdx = 0;
  let totalCreatedOrders = 0;
  let totalRevenueAdded = 0;

  for (const day of DAYS_DISTRIBUTION) {
    console.log(`\n--- Đang tạo đơn cho ngày ${day.dateStr} (${day.count} đơn) ---`);

    for (let i = 0; i < day.count; i++) {
      const customer = CUSTOMERS[customerIdx % CUSTOMERS.length];
      const user = users[customerIdx % users.length];
      customerIdx++;

      // Chọn 1 đến 2 sản phẩm ngẫu nhiên nhưng đa dạng
      const numItems = (customerIdx % 3 === 0) ? 2 : 1;
      const selectedVariants = [];
      for (let j = 0; j < numItems; j++) {
        const v = variants[(customerIdx * 7 + j * 13) % variants.length];
        selectedVariants.push({
          variant: v,
          quantity: 1,
          price: v.price
        });
      }

      const totalAmount = selectedVariants.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Tạo thời gian mua hàng trong ngày đó (theo giờ Việt Nam UTC+7)
      const hour = day.hours[i] || 10;
      const minute = Math.floor(10 + Math.random() * 45);
      const second = Math.floor(10 + Math.random() * 45);
      const createdAt = moment(`${day.dateStr} ${hour}:${minute}:${second}`, 'YYYY-MM-DD HH:mm:ss').toDate();
      const deliveredAt = moment(createdAt).add(1, 'day').add(4, 'hours').toDate();

      const carrier = CARRIERS[customerIdx % CARRIERS.length];
      const trackingCode = `${carrier.prefix}${moment(createdAt).format('YYMMDD')}${Math.floor(100000 + Math.random() * 900000)}`;
      const pm = paymentMethods[customerIdx % paymentMethods.length] || { _id: defaultPmId, name: 'Chuyển khoản' };

      const orderCode = `ORD-${createdAt.getTime()}${Math.floor(100 + Math.random() * 900)}`;

      // Tạo Order Document
      const orderDoc = new Order({
        user_id: user._id,
        code: orderCode,
        status: 'completed',
        Name: customer.name,
        Phone: customer.phone,
        Adress: customer.address,
        total_amount: totalAmount,
        payment_method: pm._id,
        payment_status: 'paid',
        delivered_at: deliveredAt,
        shipping_carrier: carrier.name,
        tracking_code: trackingCode,
        estimated_delivery: deliveredAt,
        note: '',
        date: createdAt,
        createdAt: createdAt,
        updatedAt: deliveredAt,
        statusHistory: [
          {
            status: 'pending',
            note: 'Đặt hàng thành công',
            changedBy: customer.name,
            changedAt: createdAt
          },
          {
            status: 'preparing',
            note: 'Shop đã xác nhận và đang đóng gói sản phẩm',
            changedBy: 'Admin',
            changedAt: moment(createdAt).add(30, 'minutes').toDate()
          },
          {
            status: 'shipping',
            note: `Đã bàn giao đơn hàng cho ${carrier.name} - Mã vận đơn: ${trackingCode}`,
            changedBy: 'Admin',
            changedAt: moment(createdAt).add(2, 'hours').toDate()
          },
          {
            status: 'delivered',
            note: 'Giao hàng thành công đến người nhận',
            changedBy: carrier.name,
            changedAt: deliveredAt
          },
          {
            status: 'completed',
            note: 'Đơn hàng hoàn tất thành công',
            changedBy: 'Hệ thống',
            changedAt: deliveredAt
          }
        ]
      });

      await orderDoc.save();

      // Tạo OrderItems tương ứng
      for (const item of selectedVariants) {
        const orderItem = new OrderItem({
          order_id: orderDoc._id,
          variants_id: item.variant._id,
          Quantity: item.quantity,
          price: item.price
        });
        await orderItem.save();
      }

      totalCreatedOrders++;
      totalRevenueAdded += totalAmount;
      console.log(`  ✓ Đơn #${orderDoc.code} | ${customer.name} | ${moment(createdAt).format('DD/MM/YYYY HH:mm')} | ${totalAmount.toLocaleString('vi-VN')}₫ | ${selectedVariants.map(s => s.variant.variant_name).join(', ')}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`HOÀN TẤT TẠO ${totalCreatedOrders} ĐƠN HÀNG THỰC TẾ!`);
  console.log(`Tổng doanh thu tuần trước được bổ sung: ${totalRevenueAdded.toLocaleString('vi-VN')}₫`);
  console.log(`========================================\n`);

  process.exit(0);
}

seedOrders().catch(err => {
  console.error('Lỗi tạo đơn:', err);
  process.exit(1);
});
