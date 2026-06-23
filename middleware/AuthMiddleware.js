const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const UserModel = require('../models/User');

const cert = fs.readFileSync(path.join(__dirname, '../key/publickey.crt'));

const checklogin = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.'
            });
        }

        const decoded = jwt.verify(token, cert, { algorithms: ['RS256'] });

        const user = await UserModel.findById(decoded._id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc tài khoản không tồn tại.'
            });
        }

        req.user = user;
        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn.'
        });
    }
};

module.exports = checklogin;
