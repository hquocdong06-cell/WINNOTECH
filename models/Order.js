// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    code: { type: String, required: true, unique: true },
    status: {
    type: String,
    enum: [
        'Chờ xác nhận', 
        'Đang chuẩn bị hàng', 
        'Bàn giao vận chuyển', 
        'Đang vận chuyển', 
        'Đang giao hàng', 
        'Đã giao hàng', 
        'Hoàn thành',
        'Đã hủy' // Nên thêm trạng thái này dự phòng
    ],
    default: 'Chờ xác nhận',
},
    Name: { type: String, required: true },
    Phone: { type: String, required: true },
    Adress: { type: String, required: true }, // Giữ nguyên chính tả ERD
    total_amount: { type: Number, required: true },
    payment_method: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    voucher_code: { type: String },
    voucher_value: { type: Number, default: 0 },
    payment_status: { type: String, default: 'unpaid' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });


//-----------------------------------
// models/OrderItem.js

const OrderItemSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    variants_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' }, // Đổi ở đây
    Quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

module.exports = {
    Order: mongoose.model('Order', OrderSchema),
    OrderItem: mongoose.model('OrderItem', OrderItemSchema)
};