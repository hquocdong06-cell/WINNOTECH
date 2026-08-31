require('dotenv').config();
const mongoose = require('mongoose');
const { Order } = require('../models/Order');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech';
  await mongoose.connect(uri);
  console.log('Connected to:', uri);

  // Remove existing SEED orders
  const deleteRes = await Order.deleteMany({ code: { $regex: '^SEED' } });
  console.log('Deleted old seed orders:', deleteRes.deletedCount);

  const names = ['Nguyen Van An', 'Tran Thi Bich', 'Le Van Cuong', 'Pham Thi Dung', 'Hoang Van Em', 'Do Thi Phuong', 'Bui Van Giang', 'Ngo Thi Hoa', 'Vu Van Kiet', 'Dang Thi Lan'];
  const addrs = ['123 Le Loi Q1 HCM', '45 Tran Phu Q5 HCM', '78 Nguyen Hue Q1 HCM', '99 CMT8 Q3 HCM', '12 Dinh Tien Hoang BT HCM'];
  const amounts = [490000, 650000, 890000, 1200000, 1500000, 2100000, 2800000, 3500000, 4200000, 5000000, 750000, 980000, 1750000, 3200000, 420000];

  const orders = [];
  let counter = Date.now();

  // 1. Seed late July 2026 (July 20 - July 31) - Random active days (gaps in between)
  const julyActiveDays = [20, 22, 23, 25, 27, 28, 30, 31];
  for (const day of julyActiveDays) {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 orders
    for (let i = 0; i < count; i++) {
      const hour = Math.floor(Math.random() * 12) + 8;
      const min = Math.floor(Math.random() * 60);
      const orderDate = new Date(2026, 6, day, hour, min, 0); // month 6 = July
      counter++;
      orders.push({
        code: 'SEED' + counter,
        status: 'completed',
        payment_status: 'paid',
        Name: names[Math.floor(Math.random() * names.length)],
        Phone: '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
        Adress: addrs[Math.floor(Math.random() * addrs.length)],
        total_amount: amounts[Math.floor(Math.random() * amounts.length)],
        date: orderDate,
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }
  }

  // 2. Seed August 2026 - Random active days (some days have sales, some days 0)
  const augustActiveDays = [1, 2, 5, 6, 8, 10, 11, 14, 15, 17, 19, 21, 22, 24, 26, 28, 29, 31];
  for (const day of augustActiveDays) {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 orders
    for (let i = 0; i < count; i++) {
      const hour = Math.floor(Math.random() * 12) + 8;
      const min = Math.floor(Math.random() * 60);
      const orderDate = new Date(2026, 7, day, hour, min, 0); // month 7 = August
      counter++;
      orders.push({
        code: 'SEED' + counter,
        status: 'completed',
        payment_status: 'paid',
        Name: names[Math.floor(Math.random() * names.length)],
        Phone: '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
        Adress: addrs[Math.floor(Math.random() * addrs.length)],
        total_amount: amounts[Math.floor(Math.random() * amounts.length)],
        date: orderDate,
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }
  }

  const result = await Order.insertMany(orders);
  console.log('Inserted', result.length, 'sample orders for July & August 2026');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
