// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    code: { type: String, required: true, unique: true },
    status: {
        type: String,
        // Canonical (5 bước tuần tự + 1 ngoài luồng):
        //   pending → preparing → shipping → delivered → completed
        //   cancelled (ngoài luồng, chỉ qua nút Hủy đơn)
        // Legacy aliases giữ để không lỗi validate với dữ liệu cũ trong DB:
        //   handed_over / handover / shipped / delivering → shipping
        //   done → completed
        //   canceled → cancelled
        enum: [
            'pending', 'preparing', 'shipping', 'delivered', 'completed', 'cancelled',
            // legacy (backward compat):
            'handed_over', 'handover', 'shipped', 'delivering', 'done', 'canceled'
        ],
        default: 'pending',
    },
    Name: { type: String, required: true },
    Phone: { type: String, required: true },
    Adress: { type: String, required: true }, // Giữ nguyên chính tả ERD
    total_amount: { type: Number, required: true },
    payment_method: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    voucher_code: { type: String },
    voucher_value: { type: Number, default: 0 },
    payment_status: { type: String, default: 'unpaid' },
    cancel_reason: { type: String },
    admin_notes: [{
        content: { type: String, required: true },
        author: { type: String, default: 'Admin' },
        createdAt: { type: Date, default: Date.now }
    }],
    statusHistory: [{
        status: { type: String, required: true },
        note: { type: String },
        changedBy: { type: String, default: 'Hệ thống' },
        changedAt: { type: Date, default: Date.now }
    }],
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