// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    code: { type: String, required: true, unique: true, trim: true },
    status: {
        type: String,
        enum: [
            'pending', 'preparing', 'shipping', 'delivered', 'completed', 'cancelled', 'refunded', 'refund',
            'return_requested', 'return_approved', 'returning', 'return_rejected',
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
    delivered_at: { type: Date },
    tracking_code: { type: String, default: '' },
    shipping_carrier: { type: String, default: '' },
    estimated_delivery: { type: Date },
    cancel_reason: { type: String },
    return_request: {
        status: {
            type: String,
            enum: ['none', 'return_requested', 'return_approved', 'return_rejected', 'returning', 'returned_success'],
            default: 'none'
        },
        reason: { type: String },
        description: { type: String },
        images: [{ type: String }],
        requested_at: { type: Date },
        resolved_at: { type: Date },
        rejected_reason: { type: String },
        admin_note: { type: String }
    },
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