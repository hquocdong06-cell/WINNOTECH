// models/Voucher.js
const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount_type: { type: String, required: true },
    discount_value: { type: Number, required: true },
    start_day: { type: Date, required: true },
    end_day: { type: Date, required: true },
    usage_limit: { type: Number, required: true },
    used_count: { type: Number, default: 0 },
    min_order: { type: Number, default: 0 }
}, { timestamps: true });

const UserVoucherSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
    is_used: { type: Boolean, default: false },
    save_at: { type: Date, default: Date.now }
});

const Voucher = mongoose.model('Voucher', VoucherSchema);
const UserVoucher = mongoose.model('UserVoucher', UserVoucherSchema);

module.exports = { Voucher, UserVoucher };