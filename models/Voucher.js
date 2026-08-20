// models/Voucher.js
const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    discount_type: { type: String }, // Backwards compatibility alias
    discountValue: { type: Number, required: true, default: 0 },
    discount_value: { type: Number },
    maxDiscountAmount: { type: Number, default: 0 }, // Giới hạn giảm tối đa cho %
    minOrderValue: { type: Number, default: 0 },    // Đơn tối thiểu
    min_order: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 100 },     // Tổng lượt dùng tối đa toàn hệ thống
    usage_limit: { type: Number },
    usageLimitPerUser: { type: Number, default: 1 },// Mỗi user dùng tối đa mấy lần
    usedCount: { type: Number, default: 0 },        // Đã sử dụng
    used_count: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    start_day: { type: Date },
    endDate: { type: Date },
    end_day: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-validate hook đồng bộ các trường alias TRƯỚC khi Mongoose validate schema
VoucherSchema.pre('validate', function() {
    if (this.discountType && !this.discount_type) this.discount_type = this.discountType;
    if (this.discount_type && !this.discountType) this.discountType = this.discount_type;

    if (this.discountValue !== undefined && (this.discount_value === undefined || this.discount_value === null)) this.discount_value = this.discountValue;
    if (this.discount_value !== undefined && (this.discountValue === undefined || this.discountValue === null)) this.discountValue = this.discount_value;

    if (this.minOrderValue !== undefined && (this.min_order === undefined || this.min_order === null)) this.min_order = this.minOrderValue;
    if (this.min_order !== undefined && (this.minOrderValue === undefined || this.minOrderValue === null)) this.minOrderValue = this.min_order;

    if (this.usageLimit !== undefined && (this.usage_limit === undefined || this.usage_limit === null)) this.usage_limit = this.usageLimit;
    if (this.usage_limit !== undefined && (this.usageLimit === undefined || this.usageLimit === null)) this.usageLimit = this.usage_limit;

    if (this.startDate && !this.start_day) this.start_day = this.startDate;
    if (this.start_day && !this.startDate) this.startDate = this.start_day;

    if (this.endDate && !this.end_day) this.end_day = this.endDate;
    if (this.end_day && !this.endDate) this.endDate = this.end_day;

    if (this.usedCount !== undefined) this.used_count = this.usedCount;
    if (this.used_count !== undefined) this.usedCount = this.used_count;
});

const UserVoucherSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
    is_used: { type: Boolean, default: false },
    save_at: { type: Date, default: Date.now },
    savedAt: { type: Date, default: Date.now },
    used_at: { type: Date },
    usedAt: { type: Date }
}, { timestamps: true });

const Voucher = mongoose.model('Voucher', VoucherSchema);
const UserVoucher = mongoose.model('UserVoucher', UserVoucherSchema);

module.exports = { Voucher, UserVoucher };