let express = require('express');
let router = express.Router();
const moment = require('moment');


function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const checklogin = require('../middleware/AuthMiddleware');

router.post('/create_payment_url', checklogin, function (req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để thực hiện mua hàng.' });
    }
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress || '127.0.0.1';

    let config;
    try {
        config = require('config');
    } catch (e) {
        config = { get: () => null };
    }
    
    let tmnCode = req.body.tmnCode || (config && config.get ? config.get('vnp_TmnCode') : '') || 'FGJPW2A4';
    let secretKey = req.body.secretKey || (config && config.get ? config.get('vnp_HashSecret') : '') || 'IQQTBFVCHOXFTGLMITJIGOYAWJANMKYV';
    let vnpUrl = req.body.vnpUrl || (config && config.get ? config.get('vnp_Url') : '') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    let returnUrl = req.body.returnUrl || (config && config.get ? config.get('vnp_ReturnUrl') : '') || 'http://localhost:3000/order/vnpay_return';
    let orderId = req.body.orderId || req.body.code || `WN${moment(date).format('DDHHmmss')}`;
    let amount = req.body.amount || 0;
    let bankCode = req.body.bankCode;
    
    let locale = req.body.language || 'vn';
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== undefined && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    if (req.headers['accept']?.includes('application/json') || req.xhr) {
        return res.status(200).json({ success: true, paymentUrl: vnpUrl, vnpUrl });
    }
    res.redirect(vnpUrl);
});

router.get('/vnpay_return', async function (req, res, next) {
    let querystring = require('qs');
    let crypto = require("crypto");
    const mongoose = require('mongoose');

    const { Order, OrderItem } = require("../models/Order");
    const UserModel = require("../models/User");
    const { ProductVariant: ProductVariantModel } = require("../models/ProductVariant");

    let vnp_Params = { ...req.query };
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let config;
    try {
        config = require('config');
    } catch (e) {
        config = { get: () => null };
    }
    let secretKey = (config && config.get ? config.get('vnp_HashSecret') : '') || "IQQTBFVCHOXFTGLMITJIGOYAWJANMKYV";

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const getClientBaseUrl = (req) => {
        let url = process.env.CLIENT_URL;
        if (!url || url.includes('localhost:3000') || url === 'http://localhost:3000') {
            url = (req && req.headers && req.headers.host && req.headers.host.includes('localhost'))
                ? 'http://localhost:5173'
                : 'https://winnotech.io.vn';
        }
        return url;
    };
    const clientBaseUrl = getClientBaseUrl(req);
    const isBrowserNav = req.headers['accept']?.includes('text/html') || !req.xhr;

    if (secureHash === signed) {
        const paymentId = vnp_Params['vnp_TxnRef'];

        if (vnp_Params['vnp_ResponseCode'] === "00") {
            try {
                const order = await Order.findOne({
                    $or: [
                        { code: paymentId },
                        ...(mongoose.Types.ObjectId.isValid(paymentId) ? [{ _id: paymentId }] : [])
                    ]
                });

                if (!order) {
                    if (isBrowserNav) {
                        return res.redirect(`${clientBaseUrl}/payment-result?${querystring.stringify(req.query)}`);
                    }
                    return res.status(404).json({ message: "Không tìm thấy đơn hàng hoặc đơn hàng đã được xử lý" });
                }

                order.payment_status = "paid";
                order.status = "preparing";

                const orderItems = await OrderItem.find({ order_id: order._id });
                for (let item of orderItems) {
                    const variantId = item.variants_id || item.variant_id;
                    if (variantId && item.Quantity) {
                        await ProductVariantModel.findByIdAndUpdate(variantId, {
                            $inc: { stock_quantity: -item.Quantity }
                        });
                    }
                }

                if (order.user_id) {
                    const s = order.user_id.toString();
                    const filter = mongoose.Types.ObjectId.isValid(s)
                        ? { u_id: { $in: [s, new mongoose.Types.ObjectId(s)] } }
                        : { u_id: s };
                    await CartItemModel.deleteMany(filter);
                }

                await order.save();

                if (isBrowserNav) {
                    return res.redirect(`${clientBaseUrl}/payment-result?${querystring.stringify(req.query)}`);
                }
                return res.status(200).json("Thanh toán online thành công, chi tiết đơn hàng đã gửi qua mail");
            } catch (error) {
                console.error("Lỗi xử lý thanh toán:", error);
                if (isBrowserNav) {
                    return res.redirect(`${clientBaseUrl}/payment-result?${querystring.stringify(req.query)}`);
                }
                return res.status(500).json({ code: '99', message: "Lỗi hệ thống" });
            }

        } else if (vnp_Params['vnp_ResponseCode'] === "24") {
            try {
                const order = await Order.findOne({
                    $or: [
                        { code: paymentId },
                        ...(mongoose.Types.ObjectId.isValid(paymentId) ? [{ _id: paymentId }] : [])
                    ]
                });

                if (order) {
                    order.payment_status = "canceled";
                    await order.save();
                }

                if (isBrowserNav) {
                    return res.redirect(`${clientBaseUrl}/payment-result?${querystring.stringify(req.query)}`);
                }
                return res.status(200).json("Hủy thanh toán thành công");
            } catch (error) {
                console.error("Lỗi xử lý thanh toán:", error);
                if (isBrowserNav) {
                    return res.redirect(`${clientBaseUrl}/payment-result?${querystring.stringify(req.query)}`);
                }
                return res.status(500).json({ code: '99', message: "Lỗi hệ thống" });
            }

        } else {
            try {
                const order = await Order.findOne({
                    $or: [
                        { code: paymentId },
                        ...(mongoose.Types.ObjectId.isValid(paymentId) ? [{ _id: paymentId }] : [])
                    ]
                });

                if (order) {
                    order.payment_status = "failed";
                    await order.save();
                }

                if (isBrowserNav) {
                    return res.redirect(`${clientBaseUrl}/payment-result?${querystring.stringify(req.query)}`);
                }
                return res.status(500).json("Thanh toán online không thành công, xin mời bạn đặt hàng lại ");
            } catch (error) {
                console.error("Lỗi xử lý thanh toán:", error);
                if (isBrowserNav) {
                    return res.redirect(`${clientBaseUrl}/payment-result?${querystring.stringify(req.query)}`);
                }
                return res.status(500).json({ code: '99', message: "Lỗi hệ thống" });
            }
        }

    } else {
        if (isBrowserNav) {
            return res.redirect(`${clientBaseUrl}/payment-result?vnp_ResponseCode=97&vnp_TxnRef=${vnp_Params['vnp_TxnRef'] || ''}`);
        }
        return res.status(400).json({ code: '97', message: "Chữ ký không hợp lệ" });
    }
});

module.exports = router;