const express = require('express');
var router = express.Router();
const User = require('../models/User');

// GET - Lấy tất cả users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
            success: true,
            message: "Lấy danh sách users thành công",
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
});

// GET - Lấy user theo ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user"
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
});

// POST - Tạo user mới (Đăng ký)
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role, status, avatar } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin (name, email, password)"
            });
        }

        // Kiểm tra email đã tồn tại
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(409).json({
                success: false,
                message: "Email đã được sử dụng"
            });
        }

        // Tạo user mới
        const newUser = await User.create({
            name,
            email,
            password, // TODO: Hash password trước khi lưu
            role: role || 'user',
            status: status || 'active',
            avatar
        });

        res.status(201).json({
            success: true,
            message: "Tạo user thành công",
            data: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
});

// PUT - Cập nhật user
router.put('/:id', async (req, res) => {
    try {
        const { newPassword, name, email, role, status, avatar } = req.body;
        const userId = req.params.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (newPassword) updateData.password = newPassword; // TODO: Hash password
        if (role) updateData.role = role;
        if (status) updateData.status = status;
        if (avatar) updateData.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật user thành công",
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
});

// DELETE - Xóa user
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa user thành công",
            data: {
                _id: deletedUser._id,
                email: deletedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
});

module.exports = router;




module.exports = router