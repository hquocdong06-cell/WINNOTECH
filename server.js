const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const cors = require("cors");
require('dotenv').config();

var app = express();
const nodemailer = require('nodemailer');
var port = 3000;
const passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const Fuse = require('fuse.js');

const bcrypt = require("bcrypt");
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleOAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const UserModel = require("./models/User");
const CategoryModel = require("./models/Category");
const ProductModel = require("./models/Product");
const BrandModel = require("./models/Brand");
const {
  ProductVariant: ProductVariantModel,
  VariantAttribute,
} = require("./models/ProductVariant");
const { Order, OrderItem } = require("./models/Order");
const { Attribute, AttributeValue } = require("./models/Attribute");
const { Favorite, Compare, Review } = require("./models/FavoriteCompareReview");
const {
  Banner,
  PaymentMethod,
  Image: ImageModel,
} = require("./models/BannerPaymentImage");
const CartItemModel = require("./models/Cartitem");
const DeliveryAddressModel = require("./models/DeliveryAddress");
const { Voucher, UserVoucher } = require("./models/Voucher");
const { BuildPC, BuildItem } = require("./models/BuildPc");
const checklogin = require("./middleware/AuthMiddleware");
const {
  Post: PostModel,
  PostCategory: PostCategoryModel,
} = require("./models/Post");
const { Compare: CompareModel } = require('./models/FavoriteCompareReview');

const path = require("path");
const multer = require("multer");
const {VNPay, ignoreLogger, ProductCode, VnpLocate, dataFormat} = require("vnpay");
const QRCode = require('qrcode');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ============================================================
// CART HELPERS — Chuẩn hóa u_id tránh lỗi lệch type String vs ObjectId
// ============================================================
const cleanUserId = (id) => {
  if (!id) return null;
  const s = id.toString();
  return mongoose.Types.ObjectId.isValid(s) ? new mongoose.Types.ObjectId(s) : s;
};

const getUserCartFilter = (u_id) => {
  if (!u_id) return { u_id: null };
  const s = u_id.toString();
  if (mongoose.Types.ObjectId.isValid(s)) {
    const objId = new mongoose.Types.ObjectId(s);
    return { u_id: { $in: [s, objId] } };
  }
  return { u_id: s };
};

// ============================================================
// VOUCHER CALCULATION HELPER
// - Nếu voucher có mã chứa "FRS":
//     + Giảm 100% phí ship (phí ship = 0)
//     + Giá sản phẩm vẫn giảm theo giá trị voucher (% hoặc fixed)
// - Nếu voucher có mã chứa "SHIP" (và không có FRS):
//     + Chỉ giảm vào Phí vận chuyển
//     + Giảm fixed (200, 300, 20k...) trừ thẳng vào ship
//     + Giảm % thì giảm % phí ship đó
//     + Giá sản phẩm KHÔNG giảm
// - Voucher thường (không FRS/SHIP):
//     + Giảm giá vào sản phẩm (% hoặc fixed)
//     + Phí ship giữ nguyên
// ============================================================
function calculateVoucherDiscount(voucher, subtotal, baseShipping = 30000) {
  const baseShippingFee = subtotal >= 1000000 ? 0 : baseShipping;
  if (!voucher || !voucher.code) {
    return {
      productDiscount: 0,
      shippingDiscount: 0,
      shippingFee: baseShippingFee,
      baseShippingFee,
      totalDiscount: 0,
      finalTotal: subtotal + baseShippingFee,
      voucherType: 'none',
    };
  }

  const codeUpper = String(voucher.code).trim().toUpperCase();
  const hasFRS = codeUpper.includes('FRS');
  const hasSHIP = codeUpper.includes('SHIP');

  let productDiscount = 0;
  let shippingDiscount = 0;
  let voucherType = 'normal';

  if (hasFRS) {
    voucherType = 'frs';
    shippingDiscount = baseShippingFee;

    if (voucher.discount_type === 'percent') {
      productDiscount = Math.round((subtotal * Number(voucher.discount_value)) / 100);
    } else {
      productDiscount = Number(voucher.discount_value) || 0;
    }
    productDiscount = Math.min(productDiscount, subtotal);
  } else if (hasSHIP) {
    voucherType = 'ship';
    productDiscount = 0;

    if (voucher.discount_type === 'percent') {
      shippingDiscount = Math.round((baseShippingFee * Number(voucher.discount_value)) / 100);
    } else {
      shippingDiscount = Number(voucher.discount_value) || 0;
    }
    shippingDiscount = Math.min(shippingDiscount, baseShippingFee);
  } else {
    voucherType = 'normal';
    shippingDiscount = 0;

    if (voucher.discount_type === 'percent') {
      productDiscount = Math.round((subtotal * Number(voucher.discount_value)) / 100);
    } else {
      productDiscount = Number(voucher.discount_value) || 0;
    }
    productDiscount = Math.min(productDiscount, subtotal);
  }

  const finalShippingFee = Math.max(0, baseShippingFee - shippingDiscount);
  const totalDiscount = productDiscount + shippingDiscount;
  const finalTotal = Math.max(0, subtotal - productDiscount) + finalShippingFee;

  return {
    productDiscount,
    shippingDiscount,
    shippingFee: finalShippingFee,
    baseShippingFee,
    totalDiscount,
    finalTotal,
    voucherType,
  };
}


async function fixCartItemsInDB() {
  try {
    const items = await CartItemModel.find({}).lean();
    for (const item of items) {
      if (typeof item.u_id === 'string' && mongoose.Types.ObjectId.isValid(item.u_id)) {
        const objId = new mongoose.Types.ObjectId(item.u_id);
        const existing = await CartItemModel.findOne({
          _id: { $ne: item._id },
          u_id: objId,
          variant_id: item.variant_id
        });
        if (existing) {
          existing.quantity += item.quantity;
          await existing.save();
          await CartItemModel.deleteOne({ _id: item._id });
        } else {
          await CartItemModel.updateOne(
            { _id: item._id },
            { $set: { u_id: objId } }
          );
        }
      }
    }
    console.log("✅ Đã dọn dẹp và chuẩn hóa dữ liệu Giỏ hàng (CartItem) thành công!");
  } catch (err) {
    console.error("Lỗi dọn dẹp CartItem:", err);
  }
}

// MULTER — cấu hình upload file ảnh
// ============================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "public", "images", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e6) + ext;
    cb(null, uniqueName);
  },
});

// Cấu hình upload riêng cho Category: lưu vào frontend/public/image/category & đổi tên thành 'cate' + 10 số ngẫu nhiên
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const categoryUploadDir = path.join(__dirname, "frontend", "public", "image", "category");
    fs.mkdirSync(categoryUploadDir, { recursive: true });
    cb(null, categoryUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // Dãy số ngẫu nhiên 10 chữ số
    const random10Digits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    cb(null, `cate${random10Digits}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Cấu hình upload riêng cho Avatar User: lưu vào frontend/public/image/avatar_user & đổi tên thành 'avt_' + 10 số ngẫu nhiên
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const avatarUploadDir = path.join(__dirname, "frontend", "public", "image", "avatar_user");
    fs.mkdirSync(avatarUploadDir, { recursive: true });
    cb(null, avatarUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const random10Digits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    cb(null, `avt_${random10Digits}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

var cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
var session = require("express-session");

var fs = require("fs");
var cert = fs.readFileSync("./key/publickey.crt");
var privatekey = fs.readFileSync("./key/privatekey.pem");

connectDB();

// CORS — cho phép FE (localhost:5173, 5174, 5175...) gọi API & ảnh
app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (ví dụ từ Postman, mobile)
      // và mọi cổng localhost 5173–5179 (Vite dev server)
      if (!origin || /^http:\/\/localhost:(517[0-9])$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // bắt buộc để cookie hoạt động
  }),
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/image", express.static(path.join(__dirname, "frontend", "public", "image")));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

async function getVariantAttributeMap(variantIds) {
  // 1. Lấy tất cả bản ghi junction
  const junctions = await VariantAttribute.find({
    id_variants: { $in: variantIds },
  }).lean();

  if (junctions.length === 0) return {};

  // 2. Lấy AttributeValues tương ứng
  const attrValueIds = junctions.map((j) => j.id_attribute_value);
  const attrValues = await AttributeValue.find({
    _id: { $in: attrValueIds },
  }).lean();

  // 3. Lấy Attributes (nhóm thuộc tính)
  const attrIds = [
    ...new Set(attrValues.map((av) => av.id_attribute.toString())),
  ];
  const attributes = await Attribute.find({ _id: { $in: attrIds } }).lean();

  // 4. Build lookup maps
  const attrValueMap = {};
  attrValues.forEach((av) => {
    attrValueMap[av._id.toString()] = av;
  });

  const attrMap = {};
  attributes.forEach((a) => {
    attrMap[a._id.toString()] = a;
  });

  // 5. Gom theo variantId
  const result = {};
  junctions.forEach((j) => {
    const vid = j.id_variants.toString();
    if (!result[vid]) result[vid] = [];

    const attrValue = attrValueMap[j.id_attribute_value.toString()];
    if (!attrValue) return;

    const attr = attrMap[attrValue.id_attribute.toString()];

    result[vid].push({
      attribute_id: attr ? attr._id : null,
      attribute_name: attr ? attr.name : null, // tên nhóm (VD: "RAM", "Màu sắc")
      value_id: attrValue._id,
      value_name: attrValue.name, // giá trị (VD: "16GB", "Đen")
      value_slug: attrValue.slug,
    });
  });

  return result;
}

// Helper slugify hỗ trợ tạo slug chuẩn tiếng Việt
function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================

// POST /register
// ============================================================
app.post("/register", async (req, res) => {
  try {
    const { phone, email, password, confirmPassword } = req.body;

    if (!phone || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu xác nhận không khớp" });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(409)
          .json({ success: false, message: "Email này đã được sử dụng" });
      }
      if (existingUser.phone === phone) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Số điện thoại này đã được sử dụng",
          });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name: email.split("@")[0] || "User",
      phone: phone,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const payload = { _id: savedUser._id };
    const token = jwt.sign(payload, privatekey, {
      algorithm: "RS256",
      expiresIn: "1y",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 365 * 12 * 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Đăng ký thành công",
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server trong quá trình đăng ký" });
  }
});

// ============================================================
// POST /login
// ============================================================
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Khai báo web mình dùng 'email' làm tài khoản
      passwordField: "password", // Khai báo trường chứa mật khẩu
    },
    async function (email, password, done) {
      try {
        // 1. Chui vào DB tìm xem có user nào khớp email không
        const user = await UserModel.findOne({ email: email });

        // Nếu không tìm thấy
        if (!user) {
          return done(null, false, { message: "Tài khoản không tồn tại!" });
        }

        // 2. So sánh mật khẩu bằng bcrypt (vì đăng ký đã hash password)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Mật khẩu không chính xác!" });
        }

        // 3. Kiểm tra xem tài khoản có bị khóa không (Dựa theo ERD)
        if (user.status !== "active") {
          return done(null, false, { message: "Tài khoản đã bị khóa!" });
        }

        // 4. Nếu mọi thứ xanh chín, ném user vào hàm done để đi tiếp sang API /login
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

app.post("/login", function (req, res, next) {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err)
        return res.status(500).json({ success: false, message: "Lỗi server" });
      if (!user)
        return res
          .status(401)
          .json({
            success: false,
            message: info?.message || "Tài khoản hoặc mật khẩu không hợp lệ",
          });

      if (req.cookies && req.cookies.token) {
        return res.status(400).json({
          success: false,
          message:
            "đã đăng nhập rồi, nếu muốn đăng nhập lại thì hãy đăng xuất trước",
          already_logged_in: true,
        });
      }

      req.user = user;
      const payload = { _id: user._id };

      try {
        const token = jwt.sign(payload, privatekey, {
          algorithm: "RS256",
          expiresIn: "1y",
        });
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // Nếu web chạy HTTPS thì đổi thành true
          maxAge: 365 * 12 * 30 * 24 * 60 * 60 * 1000, // 1 năm
        });
        return res
          .status(200)
          .json({
            success: true,
            message: "Đăng nhập thành công",
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
      } catch (jwtErr) {
        return res.status(500).json("Lỗi quá trình ký token");
      }
    },
  )(req, res, next);
});

app.get("/logout", function (req, res) {
  res.clearCookie("token");
  return res
    .status(200)
    .json({ success: true, message: "Đăng xuất thành công" });
});

// ============================================================
// POST /api/auth/google — API Đăng nhập / Đăng ký bằng Google Account
// Flow:
//   1. Frontend gửi Google ID Token (credential) sau khi user chọn tài khoản Google
//   2. Backend verify token với Google OAuth2Client (đảm bảo token hợp lệ)
//   3. Nếu email chưa tồn tại trong DB → Tạo tài khoản mới tự động (Đăng ký)
//   4. Nếu đã có tài khoản → Link Google ID và đăng nhập luôn
//   5. Trả về JWT token qua HttpOnly cookie (giống flow đăng nhập thường)
// ============================================================
app.post(["/api/auth/google", "/auth/google"], async (req, res) => {
  try {
    const { credential, idToken, email, name, avatar, googleId } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatar;
    let userGoogleId = googleId;
    let isNewUser = false;

    // === BƯỚC 1: Verify Google ID Token ===
    const tokenToVerify = credential || idToken;
    if (tokenToVerify) {
      // Ưu tiên: dùng google-auth-library để verify an toàn (check signature + aud + exp)
      if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        try {
          const ticket = await googleOAuthClient.verifyIdToken({
            idToken: tokenToVerify,
            audience: GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          userEmail  = payload.email    || userEmail;
          userName   = payload.name     || userName;
          userAvatar = payload.picture  || userAvatar;
          userGoogleId = payload.sub    || userGoogleId;
        } catch (verifyErr) {
          console.error("Google token verify thất bại:", verifyErr.message);
          return res.status(401).json({
            success: false,
            message: "Google ID Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại!",
          });
        }
      } else {
        // Fallback khi chưa có GOOGLE_CLIENT_ID (development mode)
        try {
          const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
          if (verifyRes.ok) {
            const googlePayload = await verifyRes.json();
            if (googlePayload.error) throw new Error(googlePayload.error);
            userEmail    = googlePayload.email   || userEmail;
            userName     = googlePayload.name    || userName;
            userAvatar   = googlePayload.picture || userAvatar;
            userGoogleId = googlePayload.sub     || userGoogleId;
          }
        } catch (fallbackErr) {
          console.warn("Fallback tokeninfo thất bại:", fallbackErr.message);
        }
      }
    }

    // Kiểm tra bắt buộc: phải có email
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin Email từ Google. Vui lòng thử lại!",
      });
    }

    // === BƯỚC 2: Tìm hoặc Tạo User trong DB ===
    let user = await UserModel.findOne({
      $or: [
        { email: userEmail },
        ...(userGoogleId ? [{ googleId: userGoogleId }] : []),
      ],
    });

    if (user) {
      // Tài khoản đã tồn tại → kiểm tra trạng thái
      if (user.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Tài khoản này đã bị khóa hoặc ngừng hoạt động!",
        });
      }

      // Cập nhật googleId & avatar nếu chưa có
      let hasChanges = false;
      if (!user.googleId && userGoogleId) { user.googleId = userGoogleId; hasChanges = true; }
      if (!user.avatar  && userAvatar)   { user.avatar   = userAvatar;   hasChanges = true; }
      if (hasChanges) await user.save();

    } else {
      // Tài khoản chưa tồn tại → ĐĂNG KÝ tỰ ĐỘNG
      isNewUser = true;
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await UserModel.create({
        name:     userName || userEmail.split("@")[0],
        email:    userEmail,
        password: hashedPassword,       // mật khẩu ngẫu nhiên (user có thể đặt sau qua "Quên mật khẩu")
        avatar:   userAvatar  || "",
        googleId: userGoogleId || "",
        phone:    "",
        role:     "user",
        status:   "active",
      });
    }

    // === BƯỚC 3: Ký JWT Token RS256 và lưu cookie (giống /login) ===
    const payload = { _id: user._id };
    const token   = jwt.sign(payload, privatekey, {
      algorithm: "RS256",
      expiresIn: "1y",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure:   false,
      maxAge:   365 * 12 * 30 * 24 * 60 * 60 * 1000,  // 1 năm
    });

    return res.status(200).json({
      success:   true,
      isNewUser: isNewUser,
      message:   isNewUser
        ? "Đăng ký và đăng nhập bằng Google thành công!"
        : "Đăng nhập Google thành công!",
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi API /api/auth/google:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server trong quá trình đăng nhập Google: " + error.message,
    });
  }
});

// ============================================================
// GET /profile
// ============================================================

app.get("/profile", checklogin, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin profile thành công",
      user: req.user,
    });
  } catch (error) {
    console.log("Lỗi API Profile:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server",
    });
  }
});

// ============================================================
// PUT /profile & POST /profile/update — Cập nhật thông tin cá nhân (Profile)
// - Hứng thông tin người dùng gửi lên
// - So sánh với DB: nếu trùng thì không thay thế, nếu ô nào để trống thì giữ nguyên DB
// - Xử lý ảnh đại diện Avatar: lưu vào frontend/public/image/avatar_user với tên avt_mã số ngẫu nhiên
// - Xóa ảnh avatar cũ trong thư mục nếu người dùng tải lên ảnh mới
// - Chỉ lưu tên ảnh avatar trong DB
// ============================================================
const handleUpdateProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // 1. Duyệt danh sách các trường thông tin chữ từ req.body
    const allowedFields = ["name", "email", "phone"];

    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        const val = req.body[key];
        // "nếu ô nào để trống thì để trống" -> Nếu giá trị để trống (undefined/null/rỗng), giữ nguyên DB
        if (val !== undefined && val !== null && val.toString().trim() !== "") {
          const newVal = val.toString().trim();
          const currentVal = user[key] ? user[key].toString().trim() : "";

          // "nếu thông tin trùng thì ko thay thế thông tin đó" -> Chỉ cập nhật nếu thông tin khác với DB
          if (newVal !== currentVal) {
            // Kiểm tra trùng email nếu người dùng đổi email mới
            if (key === "email") {
              const existingEmail = await UserModel.findOne({ email: newVal, _id: { $ne: user._id } });
              if (existingEmail) {
                return res.status(409).json({ success: false, message: "Email này đã được sử dụng bởi tài khoản khác" });
              }
            }
            // Kiểm tra trùng số điện thoại nếu người dùng đổi số điện thoại mới
            if (key === "phone") {
              const existingPhone = await UserModel.findOne({ phone: newVal, _id: { $ne: user._id } });
              if (existingPhone) {
                return res.status(409).json({ success: false, message: "Số điện thoại này đã được sử dụng bởi tài khoản khác" });
              }
            }
            user[key] = newVal;
          }
        }
      }
    }

    // 2. Xử lý tải lên file Avatar mới
    if (req.file) {
      const newAvatarFilename = req.file.filename; // Tên dạng avt_mã số ngẫu nhiên.ext

      // Nếu trong DB đã có tên avatar cũ, xóa ảnh cũ trong folder frontend/public/image/avatar_user
      if (user.avatar) {
        const oldAvatarName = path.basename(user.avatar);
        const oldAvatarPath = path.join(__dirname, "frontend", "public", "image", "avatar_user", oldAvatarName);
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (unlinkErr) {
            console.error("Lỗi khi xóa ảnh avatar cũ trong folder:", unlinkErr);
          }
        }
      }

      // "sau đó trên db chỉ lưu tên của ảnh avt đó"
      user.avatar = newAvatarFilename;
    }

    await user.save();

    // Ẩn mật khẩu khi trả dữ liệu cho FE
    const updatedUserData = user.toObject();
    delete updatedUserData.password;

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công",
      user: updatedUserData,
    });
  } catch (error) {
    console.error("Lỗi API Cập nhật Profile:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server trong quá trình cập nhật profile: " + error.message,
    });
  }
};

app.put("/profile", checklogin, uploadAvatar.single("avatar"), handleUpdateProfile);
app.post("/profile/update", checklogin, uploadAvatar.single("avatar"), handleUpdateProfile);
// ============================================================
// GET /auth/me — kiểm tra user đang đăng nhập không
// FE gọi API này trước khi hiển thị trang Login
// - Trả về user info nếu đã đăng nhập (success: true)
// - Trả về 401 nếu chưa đăng nhập → FE mới cho hiện form login
// ============================================================
app.get("/auth/me", checklogin, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Đã đăng nhập",
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /products  — lấy toàn bộ sản phẩm kèm ảnh + biến thể + thuộc tính
// FIX:
//   - Bỏ Attribute.find({ id_variants }) — field này không còn tồn tại
//   - Dùng helper getVariantAttributeMap() qua bảng junction VariantAttribute
// ============================================================
app.get("/products", async (req, res, next) => {
  try {
    const products = await ProductModel.find({})
      .populate("cat_id brand_id")
      .lean();
    const productIds = products.map((p) => p._id);

    const variants = await ProductVariantModel.find({
      p_id: { $in: productIds },
    }).lean();
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();

    // FIX: dùng helper thay vì Attribute.find({ id_variants })
    const variantIds = variants.map((v) => v._id);
    const variantAttrMap = await getVariantAttributeMap(variantIds);

    const variantsWithAttributes = variants.map((variant) => ({
      ...variant,
      Attributes: variantAttrMap[variant._id.toString()] || [],
    }));

    const finalProducts = products.map((product) => ({
      ...product,
      AnhSP: images.filter(
        (img) => img.p_id.toString() === product._id.toString(),
      ),
      Variants: variantsWithAttributes.filter(
        (v) => v.p_id.toString() === product._id.toString(),
      ),
    }));

    return res.json({
      success: true,
      data: finalProducts,
      SoLuongSP: finalProducts.length,
    });
  } catch (error) {
    console.log("Lỗi API get products:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể lấy danh sách sản phẩm",
    });
  }
});

// ============================================================
// GET /products/home/newest — 10 sản phẩm mới nhất
// FIX: dùng getVariantAttributeMap thay vì Attribute.find({ id_variants })
// ============================================================
app.get("/products/home/newest", async (req, res) => {
  try {
    const newestProducts = await ProductModel.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("cat_id")
      .lean();

    if (newestProducts.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "Không có sản phẩm mới nào",
      });
    }

    const productIds = newestProducts.map((p) => p._id);
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();
    const variants = await ProductVariantModel.find({
      p_id: { $in: productIds },
    }).lean();

    // FIX: dùng helper
    const variantAttrMap = await getVariantAttributeMap(
      variants.map((v) => v._id),
    );

    const variantsWithAttributes = variants.map((v) => ({
      ...v,
      Attributes: variantAttrMap[v._id.toString()] || [],
    }));

    const finalProducts = newestProducts.map((product) => ({
      ...product,
      AnhSP: images.filter(
        (img) => img.p_id.toString() === product._id.toString(),
      ),
      Variants: variantsWithAttributes.filter(
        (v) => v.p_id.toString() === product._id.toString(),
      ),
    }));

    return res.json({ success: true, data: finalProducts });
  } catch (error) {
    console.log("Lỗi API get newest products:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể lấy danh sách sản phẩm mới nhất",
    });
  }
});

// ============================================================
// GET /products/home/featured — 10 sản phẩm nổi bật (sale cao nhất)
// FIX: dùng getVariantAttributeMap thay vì Attribute.find({ id_variants })
// ============================================================
app.get("/products/home/featured", async (req, res) => {
  try {
    const featuredProducts = await ProductModel.find({})
      .sort({ sale: -1 })
      .lean();

    const productIds = featuredProducts.map((p) => p._id);
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();
    const variants = await ProductVariantModel.find({
      p_id: { $in: productIds },
    }).lean();

    // FIX: dùng helper
    const variantAttrMap = await getVariantAttributeMap(
      variants.map((v) => v._id),
    );

    const variantsWithAttributes = variants.map((v) => ({
      ...v,
      Attributes: variantAttrMap[v._id.toString()] || [],
    }));

    const finalProducts = featuredProducts.map((product) => ({
      ...product,
      AnhSP: images.filter(
        (img) => img.p_id.toString() === product._id.toString(),
      ),
      Variants: variantsWithAttributes.filter(
        (v) => v.p_id.toString() === product._id.toString(),
      ),
    }));

    return res.json({ success: true, data: finalProducts });
  } catch (error) {
    console.log("Lỗi API get featured products:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể lấy danh sách sản phẩm nổi bật",
    });
  }
});

app.get("/products/home/Newest", async (req, res) => {
  try {
    const newestProducts = await ProductModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 2. Gom mảng ID sản phẩm để truy vấn hàng loạt (Tối ưu N+1 query)
    const productIds = newestProducts.map((p) => p._id);

    // 3. Lấy hình ảnh và biến thể tương ứng
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();
    const variants = await ProductVariantModel.find({
      p_id: { $in: productIds },
    }).lean();

    const variantAttrMap = await getVariantAttributeMap(
      variants.map((v) => v._id),
    );

    const variantsWithAttributes = variants.map((v) => ({
      ...v,
      Attributes: variantAttrMap[v._id.toString()] || [],
    }));

    const finalProducts = newestProducts.map((product) => ({
      ...product,
      AnhSP: images.filter(
        (img) => img.p_id.toString() === product._id.toString(),
      ),
      Variants: variantsWithAttributes.filter(
        (v) => v.p_id.toString() === product._id.toString(),
      ),
    }));

    return res.status(200).json({ success: true, data: finalProducts });
  } catch (error) {
    console.error("Lỗi API get newest products:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể lấy danh sách sản phẩm mới nhất",
    });
  }
});

app.get("/products/home/Sale", async (req, res) => {
  try {
    const products = await ProductModel.find({}).lean();
    const productIds = products.map((p) => p._id);

    const variants = await ProductVariantModel.find({
      p_id: { $in: productIds },
    }).lean();

    products.forEach((product) => {
      const myVariants = variants.filter(
        (v) => v.p_id.toString() === product._id.toString(),
      );

      const allPrices = myVariants.map((v) => v.sale_price > 0);
      product.GiaSaleCaoNhat =
        allPrices.length > 0 ? Math.max(...allPrices) : 0;
    });

    products.sort((a, b) => b.GiaSaleCaoNhat - a.GiaSaleCaoNhat);

    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();

    const variantAttrMap = await getVariantAttributeMap(
      variants.map((v) => v._id),
    );

    const variantsWithAttributes = variants.map((v) => ({
      ...v,
      Attributes: variantAttrMap[v._id.toString()] || [],
    }));

    const finalData = products.map((product) => {
      const productIdStr = product._id.toString();

      delete product.GiaSaleCaoNhat;

      return {
        ...product,
        AnhSP: images.filter((img) => img.p_id.toString() === productIdStr),
        Variants: variantsWithAttributes.filter(
          (v) => v.p_id.toString() === productIdStr,
        ),
      };
    });

    return res.status(200).json({ success: true, data: finalData });
  } catch (error) {
    console.error("Lỗi API get sale products:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể lấy danh sách sản phẩm đang giảm giá",
    });
  }
});

// ============================================================
// GET /products/search — tìm kiếm sản phẩm (phải đặt TRƯỚC /:slug)
// ============================================================
app.get("/products/search", async (req, res) => {
  try {
    // 1. Hứng từ khóa từ query url (VD: /products/search?q=laptop)
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập từ khóa tìm kiếm!" });
    }

    // 2. Lấy dữ liệu sản phẩm từ DB lên (bao gồm slug, thumnail, cat_id, brand_id)
    const products = await ProductModel.find({ status: 'active' })
                                     .select('_id name slug price images thumnail active cat_id brand_id')
                                     .populate('cat_id brand_id')
                                     .lean();

    if (!products || products.length === 0) {
      return res.status(200).json({ success: true, data: [], message: "Không có sản phẩm nào phù hợp!" });
    }

    // 3. Cấu hình Fuse.js
    const fuseOptions = {
      keys: ["name"],
      isCaseSensitive: false,
      includeScore: true,
      threshold: 0.4,
    };

    const fuse = new Fuse(products, fuseOptions);

    // 4. Thực hiện tìm kiếm
    const result = fuse.search(q);
    const matchedProducts = result.map(match => match.item);

    if (matchedProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có sản phẩm nào phù hợp!",
        data: []
      });
    }

    // 5. Lấy danh sách biến thể, ảnh và thuộc tính của các sản phẩm khớp tìm kiếm
    const matchedIds = matchedProducts.map(p => p._id);
    const [variants, images] = await Promise.all([
      ProductVariantModel.find({ p_id: { $in: matchedIds } }).lean(),
      ImageModel.find({ p_id: { $in: matchedIds } }).lean()
    ]);

    const variantIds = variants.map(v => v._id);
    const variantAttrMap = await getVariantAttributeMap(variantIds);

    const variantsWithAttributes = variants.map(v => ({
      ...v,
      Attributes: variantAttrMap[v._id.toString()] || [],
    }));

    const finalProducts = matchedProducts.map(product => ({
      ...product,
      AnhSP: images.filter(img => img.p_id.toString() === product._id.toString()),
      Variants: variantsWithAttributes.filter(v => v.p_id.toString() === product._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      message: `Tìm thấy ${finalProducts.length} kết quả`,
      data: finalProducts
    });

  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /products/:slug — chi tiết sản phẩm theo slug (hoặc _id)
// ============================================================
app.get("/products/:slug", async (req, res, next) => {
  try {
    const slugParam = req.params.slug;
    let productDetail = await ProductModel.findOne({ slug: slugParam })
      .populate("cat_id brand_id")
      .lean();

    if (!productDetail && mongoose.Types.ObjectId.isValid(slugParam)) {
      productDetail = await ProductModel.findById(slugParam)
        .populate("cat_id brand_id")
        .lean();
    }

    if (!productDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    const images = await ImageModel.find({ p_id: productDetail._id }).lean();
    const variants = await ProductVariantModel.find({
      p_id: productDetail._id,
    }).lean();

    // FIX: dùng helper
    const variantAttrMap = await getVariantAttributeMap(
      variants.map((v) => v._id),
    );

    const variantsWithAttributes = variants.map((v) => ({
      ...v,
      Attributes: variantAttrMap[v._id.toString()] || [],
    }));

    return res.json({
      success: true,
      data: {
        product: productDetail,
        AnhSP: images,
        Variants: variantsWithAttributes,
      },
    });
  } catch (error) {
    console.log("Lỗi API get product detail:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /categories — lấy tất cả danh mục
// ============================================================
app.get("/categories", async (req, res, next) => {
  try {
    const categories = await CategoryModel.find({});
    return res.json({
      success: true,
      data: categories,
      SoLuongDM: categories.length,
    });
  } catch (error) {
    console.log("Lỗi API get categories:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể lấy danh sách danh mục",
    });
  }
});

// ============================================================
// POST /categories/upload — Upload ảnh danh mục vào frontend/public/image/category
// Đổi tên file thành cate + 10 số ngẫu nhiên
// ============================================================
app.post("/categories/upload", uploadCategory.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh để upload" });
    }
    const imageUrl = `/image/category/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: "Upload ảnh danh mục thành công",
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Lỗi upload ảnh danh mục:", error);
    return res.status(500).json({ success: false, message: "Lỗi upload ảnh danh mục" });
  }
});

// ============================================================
// GET /categories/:id — Lấy chi tiết danh mục theo ID
// ============================================================
app.get("/categories/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next();
    }
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại" });
    }
    return res.json({ success: true, data: category });
  } catch (error) {
    console.error("Lỗi API get category detail:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POST /categories — Thêm danh mục mới
// FE truyền ID/data danh mục lên để xử lý
// Kiểm tra nếu danh mục đã tồn tại thì KHÔNG cho thêm
// ============================================================
app.post("/categories", async (req, res) => {
  try {
    const { id, _id, name, image, status } = req.body;
    const categoryId = _id || id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên danh mục" });
    }

    const generatedSlug = slugify(name);
    const existingConditions = [{ name: name.trim() }, { slug: generatedSlug }];

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      existingConditions.push({ _id: categoryId });
    }

    // Kiểm tra danh mục đã tồn tại hay chưa
    const existingCategory = await CategoryModel.findOne({
      $or: existingConditions,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Danh mục này đã tồn tại trong hệ thống (trùng ID, tên hoặc slug), không thể thêm!",
      });
    }

    // Chưa tồn tại -> tạo mới danh mục
    const categoryData = {
      name: name.trim(),
      slug: generatedSlug,
      image: image || "",
      status: status || "active",
    };

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      categoryData._id = categoryId;
    }

    const newCategory = await CategoryModel.create(categoryData);

    return res.status(201).json({
      success: true,
      message: "Thêm danh mục mới thành công",
      data: newCategory,
    });
  } catch (error) {
    console.error("Lỗi thêm danh mục:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể thêm danh mục",
    });
  }
});

// ============================================================
// PUT /categories/:id — Sửa danh mục
// Cho phép sửa ảnh, nếu ảnh bị thay thế thì LẬP TỨC XÓA ẢNH CŨ khỏi đĩa
// ============================================================
app.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID danh mục không hợp lệ" });
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    // Kiểm tra nếu đổi tên làm trùng slug/tên với danh mục khác
    if (name && name.trim() !== category.name) {
      const newSlug = slugify(name);
      const duplicate = await CategoryModel.findOne({
        _id: { $ne: id },
        $or: [{ name: name.trim() }, { slug: newSlug }],
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Tên danh mục hoặc slug bị trùng với danh mục khác!",
        });
      }
      category.name = name.trim();
      category.slug = newSlug;
    }

    // Nếu ảnh bị thay thế (ảnh mới khác ảnh cũ trong DB) -> LẬP TỨC XÓA ẢNH CŨ
    if (image !== undefined && image !== category.image) {
      if (category.image && (category.image.includes("/image/category/") || category.image.includes("cate"))) {
        try {
          const oldFileName = path.basename(category.image);
          const oldFilePath = path.join(__dirname, "frontend", "public", "image", "category", oldFileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`✅ Lập tức xóa ảnh cũ bị thay thế: ${oldFilePath}`);
          }
        } catch (unlinkErr) {
          console.error("Lỗi xóa file ảnh cũ:", unlinkErr);
        }
      }
      category.image = image;
    }

    if (status !== undefined) {
      category.status = status;
    }

    const updatedCategory = await category.save();

    return res.json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể cập nhật danh mục",
    });
  }
});

// ============================================================
// PATCH /categories/:id/status — Thay đổi trạng thái danh mục
// ============================================================
app.patch("/categories/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID danh mục không hợp lệ" });
    }

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ (chấp nhận 'active' hoặc 'inactive')",
      });
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại" });
    }

    category.status = status;
    await category.save();

    return res.json({
      success: true,
      message: `Đã thay đổi trạng thái danh mục thành ${status}`,
      data: category,
    });
  } catch (error) {
    console.error("Lỗi đổi trạng thái danh mục:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// DELETE /categories/:id — Không được xóa danh mục, chỉ được thay đổi trạng thái
// ============================================================
app.delete("/categories/:id", async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Không được phép xóa danh mục! Chỉ được thay đổi trạng thái của danh mục.",
  });
});

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^a-z0-9\s-]|_)+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ============================================================
// GET /brands — lấy tất cả thương hiệu
// ============================================================
app.get("/brands", async (req, res) => {
  try {
    const brands = await BrandModel.find({});
    return res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.log("Lỗi API get brands:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server, không thể lấy danh sách thương hiệu",
    });
  }
});

// ============================================================
// POST /products — tạo sản phẩm mới cùng ảnh và biến thể mặc định
// ============================================================
app.post("/products", async (req, res) => {
  try {
    const {
      name,
      cat_id,
      brand_id,
      price,
      sale,
      thumnail,
      description,
      short_desc,
      stock,
      status,
    } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên sản phẩm" });
    }

    let slug = slugify(name);
    let uniqueSlug = slug;
    let count = 1;
    while (await ProductModel.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${count}`;
      count++;
    }

    const newProduct = await ProductModel.create({
      name,
      sale: sale || 0,
      thumnail: thumnail || "",
      slug: uniqueSlug,
      description: description || "",
      short_desc: short_desc || "",
      status: status || "active",
      cat_id: cat_id || null,
      brand_id: brand_id || null,
    });

    if (thumnail) {
      await ImageModel.create({
        p_id: newProduct._id,
        url: thumnail,
        alt: name,
        is_main: true,
      });
    }

    const priceNum = Number(price) || 0;
    const saleNum = Number(sale) || 0;
    const salePrice = saleNum > 0 ? priceNum * (1 - saleNum / 100) : 0;

    const defaultVariant = await ProductVariantModel.create({
      variant_name: "Mặc định",
      price: priceNum,
      sku: "SKU-" + uniqueSlug.toUpperCase(),
      sale_price: salePrice,
      status: "active",
      stock_quantity: Number(stock) || 0,
      p_id: newProduct._id,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm thành công",
      data: {
        product: newProduct,
        variant: defaultVariant,
      },
    });
  } catch (error) {
    console.error("Lỗi API tạo sản phẩm:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi tạo sản phẩm" });
  }
});

// ============================================================
// PUT /products/:id — cập nhật sản phẩm
// ============================================================
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      cat_id,
      brand_id,
      price,
      sale,
      thumnail,
      description,
      short_desc,
      stock,
      status,
    } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    if (name) product.name = name;
    if (sale !== undefined) product.sale = Number(sale);
    if (thumnail !== undefined) product.thumnail = thumnail;
    if (description !== undefined) product.description = description;
    if (short_desc !== undefined) product.short_desc = short_desc;
    if (status) product.status = status;
    if (cat_id) product.cat_id = cat_id;
    if (brand_id) product.brand_id = brand_id;

    if (name) {
      let slug = slugify(name);
      let uniqueSlug = slug;
      let count = 1;
      while (
        await ProductModel.findOne({ slug: uniqueSlug, _id: { $ne: id } })
      ) {
        uniqueSlug = `${slug}-${count}`;
        count++;
      }
      product.slug = uniqueSlug;
    }

    await product.save();

    if (thumnail !== undefined) {
      await ImageModel.findOneAndUpdate(
        { p_id: id, is_main: true },
        { url: thumnail, alt: product.name },
        { upsert: true },
      );
    }

    const priceNum = price !== undefined ? Number(price) : 0;
    const saleNum = product.sale || 0;
    const salePrice = saleNum > 0 ? priceNum * (1 - saleNum / 100) : 0;

    let variant = await ProductVariantModel.findOne({
      p_id: id,
      variant_name: "Mặc định",
    });
    if (variant) {
      if (price !== undefined) variant.price = priceNum;
      variant.sale_price = salePrice;
      if (stock !== undefined) variant.stock_quantity = Number(stock);
      variant.status = product.status;
      await variant.save();
    } else {
      variant = await ProductVariantModel.create({
        variant_name: "Mặc định",
        price: priceNum,
        sku: "SKU-" + product.slug.toUpperCase(),
        sale_price: salePrice,
        status: product.status,
        stock_quantity: stock !== undefined ? Number(stock) : 0,
        p_id: product._id,
      });
    }

    return res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: { product, variant },
    });
  } catch (error) {
    console.error("Lỗi API cập nhật sản phẩm:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi cập nhật sản phẩm" });
  }
});

// ============================================================
// DELETE /products/:id — xóa sản phẩm cùng các ảnh, biến thể liên quan
// ============================================================
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Xóa ảnh file vật lý nếu có trên server
    const images = await ImageModel.find({ p_id: id });
    images.forEach((img) => {
      if (img.url && img.url.startsWith("/public/images/uploads/")) {
        const filePath = path.join(__dirname, img.url);
        fs.unlink(filePath, () => {}); // bỏ qua lỗi nếu file không tồn tại
      }
    });

    // Cascade delete
    await ImageModel.deleteMany({ p_id: id });
    await ProductVariantModel.deleteMany({ p_id: id });
    await ProductModel.findByIdAndDelete(id);

    return res.json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi API xóa sản phẩm:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi xóa sản phẩm" });
  }
});

// ============================================================
// PATCH /products/:id/status — toggle trạng thái active/hidden
// ============================================================
app.patch("/products/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !["active", "hidden", "draft"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ" });
    }
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    return res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: product,
    });
  } catch (error) {
    console.error("Lỗi API cập nhật trạng thái:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /categories/:slug — sản phẩm theo danh mục
// Không thay đổi logic, chỉ giữ nguyên
// ============================================================
app.get("/categories/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const category = await CategoryModel.findOne({
      $or: [
        { slug: slug },
        ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : [])
      ]
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    const products = await ProductModel.find({ cat_id: category._id })
      .populate("cat_id brand_id")
      .lean();

    if (products.length === 0) {
      return res.json({
        success: true,
        data: { category, products: [] },
      });
    }

    const productIds = products.map((p) => p._id);
    const variants = await ProductVariantModel.find({
      p_id: { $in: productIds },
    }).lean();
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();

    const variantIds = variants.map((v) => v._id);
    const variantAttrMap = await getVariantAttributeMap(variantIds);

    const variantsWithAttributes = variants.map((variant) => ({
      ...variant,
      Attributes: variantAttrMap[variant._id.toString()] || [],
    }));

    const finalProducts = products.map((product) => ({
      ...product,
      AnhSP: images.filter(
        (img) => img.p_id.toString() === product._id.toString(),
      ),
      Variants: variantsWithAttributes.filter(
        (v) => v.p_id.toString() === product._id.toString(),
      ),
    }));

    return res.json({
      success: true,
      data: { category, products: finalProducts },
    });
  } catch (error) {
    console.log("Lỗi API get products by category:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POST /cart/add — thêm vào giỏ hàng
// FIX:
//   - Thêm import CartItemModel (bị thiếu ở file gốc)
//   - Bỏ Attribute.find({ id_variants: variant._id }) — field không tồn tại
//   - Dùng getVariantAttributeMap() cho 1 variant đơn lẻ
// ============================================================
app.post("/cart/add", async (req, res) => {
  try {
    const { variant_id, quantity } = req.body;

    if (!variant_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "FE chưa truyền đầy đủ variant_id và quantity",
      });
    }

    const variant = await ProductVariantModel.findById(variant_id).lean();
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Biến thể sản phẩm không tồn tại" });
    }

    const currentPrice =
      variant.sale_price && variant.sale_price > 0
        ? variant.sale_price
        : variant.price;

    const product = await ProductModel.findById(variant.p_id).lean();
    const images = await ImageModel.find({ p_id: product._id }).lean();

    // FIX: dùng helper thay vì Attribute.find({ id_variants })
    const variantAttrMap = await getVariantAttributeMap([variant._id]);

    const cartItemData = {
      product: { ...product, AnhSP: images },
      variant: {
        ...variant,
        Attributes: variantAttrMap[variant._id.toString()] || [],
      },
      quantity: quantity || 1,
      price: currentPrice,
    };

    // Kiểm tra token từ cookie — login thì lưu DB, chưa login thì trả về FE tự lưu
    let u_id = null;
    const cookieToken = req.cookies && req.cookies.token;
    if (cookieToken) {
      try {
        const verify = jwt.verify(cookieToken, cert, { algorithms: ["RS256"] });
        u_id = cleanUserId(verify._id);
      } catch (err) {
        console.log("Token lỗi hoặc hết hạn, coi như khách vãng lai (Guest)");
      }
    }

    if (u_id) {
      // Đã login — lưu vào DB
      const u_id_filter = getUserCartFilter(u_id);
      let existingCart = await CartItemModel.findOne({ ...u_id_filter, variant_id });

      const reqQty = parseInt(quantity) || 1;
      if (variant.stock_quantity !== undefined && variant.stock_quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Sản phẩm này đã hết hàng!" });
      }

      if (existingCart) {
        const totalQty = existingCart.quantity + reqQty;
        if (
          variant.stock_quantity !== undefined &&
          totalQty > variant.stock_quantity
        ) {
          return res.status(400).json({
            success: false,
            message: `Không thể thêm! Số lượng trong giỏ (${existingCart.quantity}) + thêm mới (${reqQty}) vượt quá tồn kho (${variant.stock_quantity} sản phẩm).`,
          });
        }
        existingCart.quantity = totalQty;
        existingCart.price = currentPrice;
        await existingCart.save();
      } else {
        if (
          variant.stock_quantity !== undefined &&
          reqQty > variant.stock_quantity
        ) {
          return res.status(400).json({
            success: false,
            message: `Không thể thêm! Số lượng yêu cầu (${reqQty}) vượt quá tồn kho (${variant.stock_quantity} sản phẩm).`,
          });
        }
        await CartItemModel.create({
          u_id,
          variant_id,
          quantity: reqQty,
          price: currentPrice,
        });
      }

      return res.json({
        success: true,
        is_logged_in: true,
        message: "Đã thêm vào giỏ hàng Database",
        data: cartItemData,
      });
    } else {
      // Chưa login — trả về để FE lưu LocalStorage
      const reqQty = parseInt(quantity) || 1;
      if (variant.stock_quantity !== undefined && variant.stock_quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Sản phẩm này đã hết hàng!" });
      }
      if (
        variant.stock_quantity !== undefined &&
        reqQty > variant.stock_quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Không thể thêm! Số lượng yêu cầu (${reqQty}) vượt quá tồn kho (${variant.stock_quantity} sản phẩm).`,
        });
      }

      return res.json({
        success: true,
        is_logged_in: false,
        message: "Trả về dữ liệu để FE lưu LocalStorage",
        data: cartItemData,
      });
    }
  } catch (error) {
    console.log("Lỗi API add to cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /cart — lấy giỏ hàng của user đã đăng nhập
// API MỚI — cần thiết cho luồng checkout
// ============================================================
app.get("/cart", checklogin, async (req, res) => {
  try {
    const u_id = cleanUserId(req.user._id);
    const u_id_filter = getUserCartFilter(u_id);

    const cartItems = await CartItemModel.find(u_id_filter).lean();
    if (cartItems.length === 0) {
      return res.json({ success: true, data: [], message: "Giỏ hàng trống" });
    }

    const variantIds = cartItems.map((ci) => ci.variant_id);
    const variants = await ProductVariantModel.find({
      _id: { $in: variantIds },
    }).lean();
    const productIds = [...new Set(variants.map((v) => v.p_id.toString()))];
    const products = await ProductModel.find({
      _id: { $in: productIds },
    }).lean();
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();

    // FIX: dùng helper
    const variantAttrMap = await getVariantAttributeMap(variantIds);

    const variantMap = {};
    variants.forEach((v) => {
      variantMap[v._id.toString()] = v;
    });

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const data = cartItems.map((ci) => {
      const variant = variantMap[ci.variant_id.toString()];
      const product = variant ? productMap[variant.p_id.toString()] : null;
      return {
        cartItem: ci,
        variant: variant
          ? {
              ...variant,
              Attributes: variantAttrMap[variant._id.toString()] || [],
            }
          : null,
        product: product || null,
        AnhSP: product
          ? images.filter(
              (img) => img.p_id.toString() === product._id.toString(),
            )
          : [],
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.log("Lỗi API get cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// PUT /cart/:cartItemId — cập nhật số lượng item trong giỏ
// API MỚI
// ============================================================
app.put("/cart/:cartItemId", checklogin, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Số lượng không hợp lệ" });
    }

    const u_id = cleanUserId(req.user._id);
    const u_id_filter = getUserCartFilter(u_id);

    const cartItem = await CartItemModel.findOne({
      _id: cartItemId,
      ...u_id_filter,
    });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy item trong giỏ hàng",
      });
    }

    const variant = await ProductVariantModel.findById(cartItem.variant_id);
    if (
      variant &&
      variant.stock_quantity !== undefined &&
      parseInt(quantity) > variant.stock_quantity
    ) {
      return res.status(400).json({
        success: false,
        message: `Số lượng yêu cầu (${quantity}) vượt quá tồn kho hiện tại (${variant.stock_quantity} sản phẩm).`,
      });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy item trong giỏ hàng",
      });
    }

    return res.json({ success: true, data: cartItem });
  } catch (error) {
    console.log("Lỗi API update cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// DELETE /cart/:cartItemId — xóa item khỏi giỏ hàng
// API MỚI
// ============================================================
app.delete("/cart/:cartItemId", checklogin, async (req, res) => {
  try {
    const u_id = cleanUserId(req.user._id);
    const u_id_filter = getUserCartFilter(u_id);

    const cartItem = await CartItemModel.findOneAndDelete({
      _id: req.params.cartItemId,
      ...u_id_filter,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy item trong giỏ hàng",
      });
    }

    return res.json({ success: true, message: "Đã xóa khỏi giỏ hàng" });


    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy item trong giỏ hàng",
      });
    }

    return res.json({ success: true, message: "Đã xóa khỏi giỏ hàng" });
  } catch (error) {
    console.log("Lỗi API delete cart item:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POST /orders — đặt hàng
// FIX:
//   - OrderItem.variants_id thay vì attribute_value_id (đúng ERD)
//   - Trừ stock_quantity của ProductVariant sau khi đặt
// ============================================================
app.post("/orders", checklogin, async (req, res) => {
  try {
    const { Name, Phone, Adress, payment_method, voucher_code, items } = req.body;

    if (!Name || !Phone || !Adress || !payment_method || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đặt hàng" });
    }

    // ==========================================
    // 1. LẤY GIÁ THẬT VÀ CHECK TỒN KHO TỪ DB
    // ==========================================
    const variantIds = items.map((i) => i.variant_id);

    // Validate: loại bỏ variant_id không phải MongoDB ObjectId hợp lệ
    const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
    const invalidIds = variantIds.filter(id => !id || !OBJECT_ID_REGEX.test(String(id)));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng chứa sản phẩm không hợp lệ (chưa có trong hệ thống): ${invalidIds.join(', ')}. Vui lòng chỉ đặt hàng các linh kiện có trong cơ sở dữ liệu (CPU, RAM, GPU, Mainboard, Ổ cứng, PSU, Vỏ case, Tản nhiệt).`
      });
    }

    const dbVariants = await ProductVariantModel.find({ _id: { $in: variantIds } }).lean();

    let total_amount = 0;
    const orderItemDocs = [];
    const bulkStockOps = [];

    for (const item of items) {
      const dbVariant = dbVariants.find(v => v._id.toString() === item.variant_id.toString());

      if (!dbVariant) {
        return res.status(404).json({ success: false, message: `Sản phẩm không tồn tại.` });
      }

      if (dbVariant.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Sản phẩm đã hết hàng hoặc không đủ số lượng!` 
        });
      }

      // Tính tiền bằng giá trong Database
      const realPrice = dbVariant.price; 
      total_amount += realPrice * item.quantity;

      orderItemDocs.push({
        variants_id: item.variant_id, 
        Quantity: item.quantity,
        price: realPrice, 
      });

      bulkStockOps.push({
        updateOne: {
          filter: { _id: item.variant_id, stock_quantity: { $gte: item.quantity } },
          update: { $inc: { stock_quantity: -item.quantity } }
        }
      });
    }

    // ==========================================
    // 2. XỬ LÝ VOUCHER & PHÍ VẬN CHUYỂN
    // ==========================================
    let voucher_value = 0;
    let validVoucher = null;
    let baseShippingFee = total_amount >= 1000000 ? 0 : 30000;
    let final_amount = total_amount + baseShippingFee;

    if (voucher_code) {
      validVoucher = await Voucher.findOne({ code: voucher_code });
      if (
        validVoucher &&
        validVoucher.end_day >= new Date() &&
        validVoucher.used_count < validVoucher.usage_limit
      ) {
        if (validVoucher.min_order > 0 && total_amount < validVoucher.min_order) {
          return res.status(400).json({
            success: false,
            message: `Đơn hàng tối thiểu ${validVoucher.min_order.toLocaleString('vi-VN')} đ để sử dụng voucher này!`
          });
        }
        const vCalc = calculateVoucherDiscount(validVoucher, total_amount, 30000);
        voucher_value = vCalc.totalDiscount;
        final_amount = vCalc.finalTotal;
      } else {
        return res.status(400).json({ success: false, message: "Voucher không hợp lệ hoặc đã hết hạn!" });
      }
    }


    // ==========================================
    // 3. TẠO ĐƠN HÀNG VỚI STATUS MỚI
    // ==========================================
    const code = "ORD-" + Date.now();

    const newOrder = await Order.create({
      user_id: req.user._id,
      code,
      Name, Phone, Adress,
      total_amount: final_amount,
      payment_method,
      voucher_code: validVoucher ? voucher_code : null,
      voucher_value,
      payment_status: "unpaid",
      // Trạng thái mặc định khi tạo đơn hàng mới
      status: "pending", 
    });

    const finalOrderItems = orderItemDocs.map(doc => ({ ...doc, order_id: newOrder._id }));
    await OrderItem.insertMany(finalOrderItems);

    // ==========================================
    // 4. TRỪ KHO, XÓA GIỎ HÀNG & CHỐT VOUCHER
    // ==========================================
    if (bulkStockOps.length > 0) {
      await ProductVariantModel.bulkWrite(bulkStockOps);
    }

    if (validVoucher) {
      await Voucher.findByIdAndUpdate(validVoucher._id, { $inc: { used_count: 1 } });
      await UserVoucher.findOneAndUpdate(
        { user_id: req.user._id, voucher_id: validVoucher._id },
        { is_used: true }
      );
    }

    await CartItemModel.deleteMany({
      u_id: req.user._id,
      variant_id: { $in: variantIds },
    });

    return res.status(201).json({ success: true, message: "Đặt hàng thành công", data: newOrder });

  } catch (error) {
    console.error("Lỗi API create order:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /orders — lịch sử đơn hàng của user
// ============================================================
app.get("/orders", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;

    const { status } = req.query; 

    const statusCounts = await Order.aggregate([
      { $match: { user_id: userId } }, 
      { $group: { _id: "$status", count: { $sum: 1 } } } 
    ]);

   
    let totalOrders = 0;
    const countMap = {
      "all": 0,           // Cho tab "Tất cả"
      "pending": 0,       // Chờ xác nhận
      "preparing": 0,     // Chuẩn bị hàng
      "handed_over": 0,   // Bàn giao VC
      "shipping": 0,      // Đang vận chuyển
      "delivering": 0,    // Đang giao
      "completed": 0,     // Hoàn thành
      "canceled": 0       // Đã hủy
    };

    statusCounts.forEach(item => {
      // item._id lúc này sẽ là 'pending', 'shipping'... từ DB chui ra
      if (countMap[item._id] !== undefined) {
        countMap[item._id] = item.count;
      }
      totalOrders += item.count;
    });
    countMap["all"] = totalOrders;

    // ==========================================
    // 2. LỌC DANH SÁCH ĐƠN HÀNG THEO KEY TIẾNG ANH
    // ==========================================
    let query = { user_id: userId };
    
    // Nếu có truyền status và không phải tab "all"
    if (status && status !== "all") {
      query.status = status; // Lọc thẳng bằng key tiếng Anh, DB sẽ hiểu
    }

    const orders = await Order.find(query)
      .populate("payment_method")
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return res.json({ 
        success: true, 
        counts: countMap, 
        data: [] 
      });
    }

    const orderIds = orders.map((o) => o._id);
    const orderItems = await OrderItem.find({ order_id: { $in: orderIds } }).lean();

    const variantIds = [...new Set(orderItems.map((oi) => oi.variants_id?.toString()).filter(Boolean))];
    const variants = await ProductVariantModel.find({ _id: { $in: variantIds } }).lean();

    const productIds = [...new Set(variants.map((v) => v.p_id?.toString()).filter(Boolean))];
    const [products, images] = await Promise.all([
      ProductModel.find({ _id: { $in: productIds } }).lean(),
      ImageModel.find({ p_id: { $in: productIds } }).lean()
    ]);

    const variantMap = new Map(variants.map(v => [v._id.toString(), v]));
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    const data = orders.map((order) => {
      const items = orderItems
        .filter((oi) => oi.order_id?.toString() === order._id.toString())
        .map((oi) => {
          const variant = variantMap.get(oi.variants_id?.toString());
          const product = variant ? productMap.get(variant.p_id?.toString()) : null;
          const AnhSP = product ? images.filter(img => img.p_id?.toString() === product._id.toString()) : [];
          return { ...oi, variant: variant || null, product: product || null, AnhSP };
        });
      return { ...order, items };
    });

    return res.json({ 
      success: true, 
      counts: countMap, 
      data 
    });

  } catch (error) {
    console.error("Lỗi API get orders filter:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /orders/:orderId — chi tiết đơn hàng
// ============================================================
app.get("/orders/:orderId", checklogin, async (req, res) => {
  try {
    // 1. Lấy thông tin đơn hàng
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id,
    })
      .populate("payment_method")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    // 2. LẤY ORDER ITEMS & POPULATE LUÔN BIẾN THỂ (Tận dụng ref trong Schema)
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate("variants_id") // Ma thuật ở đây: variants_id giờ sẽ là 1 Object chứa toàn bộ thông tin biến thể
      .lean();

    if (!orderItems || orderItems.length === 0) {
      return res.json({ success: true, data: { ...order, items: [] } });
    }

    // 3. Gom ID Sản phẩm (p_id) và ID Biến thể để lấy Ảnh + Thuộc tính
    const productIds = [];
    const variantIds = [];

    orderItems.forEach((oi) => {
      if (oi.variants_id) {
        variantIds.push(oi.variants_id._id.toString());
        if (oi.variants_id.p_id) {
          productIds.push(oi.variants_id.p_id.toString());
        }
      }
    });

    const uniqueProductIds = [...new Set(productIds)];
    const uniqueVariantIds = [...new Set(variantIds)];

    // 4. CHẠY SONG SONG CÁC TRUY VẤN CÒN LẠI (Ép xung tốc độ)
    const [products, images, variantAttrMap] = await Promise.all([
      ProductModel.find({ _id: { $in: uniqueProductIds } }).lean(),
      ImageModel.find({ p_id: { $in: uniqueProductIds } }).lean(),
      getVariantAttributeMap(uniqueVariantIds) // Helper của bác
    ]);

    // Dùng Map để tra cứu sản phẩm nhanh
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // 5. Ráp nốt Đồ chơi lại với nhau
    const items = orderItems.map((oi) => {
      const variant = oi.variants_id; // Đã có sẵn data từ populate
      const product = variant ? productMap.get(variant.p_id?.toString()) : null;

      return {
        ...oi,
        variant: variant
          ? {
              ...variant,
              Attributes: variantAttrMap[variant._id.toString()] || [],
            }
          : null,
        product: product || null,
        AnhSP: product
          ? images.filter((img) => img.p_id?.toString() === product._id.toString())
          : [],
      };
    });

    return res.json({ success: true, data: { ...order, items } });
  } catch (error) {
    console.error("Lỗi API get order detail:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// API XUẤT HÓA ĐƠN (BILL) ĐÃ THANH TOÁN RA FILE PDF
// GET /orders/export-pdf/:id
// GET /orders/:orderId/export-pdf
// POST /orders/export-pdf
// ============================================================
const exportOrderPdfHandler = async (req, res) => {
  try {
    const billId =
      req.params.id ||
      req.params.orderId ||
      req.body.id ||
      req.body.billId ||
      req.body.order_id ||
      req.query.id ||
      req.query.billId ||
      req.query.order_id;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID hóa đơn / đơn hàng",
      });
    }

    // 1. Tìm thông tin đơn hàng trong DB
    let query = {};
    if (mongoose.Types.ObjectId.isValid(billId)) {
      query = { _id: billId };
    } else {
      query = { code: billId };
    }

    const order = await Order.findOne(query)
      .populate("payment_method")
      .populate("user_id")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng / hóa đơn",
      });
    }

    // 2. Kiểm tra quyền sở hữu đơn hàng (đúng user hoặc admin)
    const orderUserId = order.user_id
      ? (order.user_id._id || order.user_id).toString()
      : null;
    const currentUserId = req.user._id.toString();

    if (orderUserId && orderUserId !== currentUserId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xuất hóa đơn này",
      });
    }

    // 3. Kiểm tra trạng thái thanh toán (chỉ xuất hóa đơn đã thanh toán)
    const statusStr = (order.payment_status || "").toString().toLowerCase();
    const orderStatusStr = (order.status || "").toString().toLowerCase();
    const isPaid =
      statusStr === "paid" ||
      statusStr === "đã thanh toán" ||
      statusStr === "da thanh toan" ||
      orderStatusStr === "completed";

    if (!isPaid && statusStr === "unpaid") {
      return res.status(400).json({
        success: false,
        message: "Hóa đơn này chưa được thanh toán, không thể xuất PDF!",
      });
    }

    // 4. Lấy danh sách sản phẩm (OrderItem) của đơn hàng
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate("variants_id")
      .lean();

    const productIds = [];
    const variantIds = [];
    orderItems.forEach((oi) => {
      if (oi.variants_id) {
        variantIds.push(oi.variants_id._id.toString());
        if (oi.variants_id.p_id) {
          productIds.push(oi.variants_id.p_id.toString());
        }
      }
    });

    const [products, variantAttrMap] = await Promise.all([
      ProductModel.find({ _id: { $in: [...new Set(productIds)] } }).lean(),
      getVariantAttributeMap([...new Set(variantIds)]),
    ]);

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const items = orderItems.map((oi) => {
      const variant = oi.variants_id;
      const product = variant ? productMap.get(variant.p_id?.toString()) : null;
      return {
        ...oi,
        variant: variant
          ? {
              ...variant,
              Attributes: variantAttrMap[variant._id.toString()] || [],
            }
          : null,
        product: product || null,
      };
    });

    // 5. Cấu hình PDF & Response headers
    const filename = `HoaDon_${order.code || order._id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    // Font hỗ trợ tiếng Việt
    const fontRegular = fs.existsSync("C:/Windows/Fonts/arial.ttf")
      ? "C:/Windows/Fonts/arial.ttf"
      : "Helvetica";
    const fontBold = fs.existsSync("C:/Windows/Fonts/arialbd.ttf")
      ? "C:/Windows/Fonts/arialbd.ttf"
      : "Helvetica-Bold";

    doc.registerFont("Regular", fontRegular);
    doc.registerFont("Bold", fontBold);

    // Header Banner
    doc.rect(40, 40, 515, 65).fill("#0F172A");
    doc.fillColor("#FFFFFF").font("Bold").fontSize(20).text("WINNOTECH STORE", 55, 52);
    doc.fillColor("#94A3B8").font("Regular").fontSize(9).text("Hệ thống bán lẻ thiết bị máy tính & công nghệ", 55, 78);

    doc.fillColor("#38BDF8").font("Bold").fontSize(14).text("HÓA ĐƠN BÁN HÀNG", 360, 52, { align: "right" });
    doc.fillColor("#22C55E").font("Bold").fontSize(10).text("✔ ĐÃ THANH TOÁN", 360, 75, { align: "right" });

    doc.fillColor("#000000");

    // Thông tin Đơn hàng & Khách hàng
    let y = 120;
    doc.rect(40, y, 515, 95).fillAndStroke("#F8FAFC", "#CBD5E1");

    doc.fillColor("#1E293B").font("Bold").fontSize(10).text("THÔNG TIN ĐƠN HÀNG", 55, y + 10);
    doc.font("Regular").fontSize(9).fillColor("#334155");
    doc.text(`Mã hóa đơn: `, 55, y + 28, { continued: true }).font("Bold").text(`${order.code || order._id}`);
    doc.font("Regular").text(`Ngày tạo: ${moment(order.createdAt || order.date).format("DD/MM/YYYY HH:mm")}`, 55, y + 43);
    const paymentMethodName = order.payment_method?.name || (typeof order.payment_method === 'string' ? order.payment_method : "Chuyển khoản / VNPay / COD");
    doc.text(`Phương thức TT: ${paymentMethodName}`, 55, y + 58);
    doc.text(`Trạng thái TT: `, 55, y + 73, { continued: true }).font("Bold").fillColor("#16A34A").text("Đã thanh toán");

    doc.fillColor("#1E293B").font("Bold").fontSize(10).text("THÔNG TIN KHÁCH HÀNG", 300, y + 10);
    doc.font("Regular").fontSize(9).fillColor("#334155");
    doc.text(`Họ và tên: `, 300, y + 28, { continued: true }).font("Bold").text(`${order.Name || "Khách hàng"}`);
    doc.font("Regular").text(`Số điện thoại: ${order.Phone || "N/A"}`, 300, y + 43);
    doc.text(`Địa chỉ giao hàng: ${order.Adress || "N/A"}`, 300, y + 58, { width: 245 });

    // Bảng sản phẩm
    y += 110;
    const tableTop = y;

    doc.rect(40, tableTop, 515, 22).fill("#1E293B");
    doc.fillColor("#FFFFFF").font("Bold").fontSize(9);
    doc.text("STT", 45, tableTop + 6, { width: 25, align: "center" });
    doc.text("Tên sản phẩm & Biến thể", 75, tableTop + 6, { width: 240, align: "left" });
    doc.text("Đơn giá", 320, tableTop + 6, { width: 75, align: "right" });
    doc.text("SL", 400, tableTop + 6, { width: 35, align: "center" });
    doc.text("Thành tiền", 440, tableTop + 6, { width: 105, align: "right" });

    y = tableTop + 22;
    doc.fillColor("#000000");

    let subtotalCalc = 0;
    items.forEach((item, index) => {
      const bg = index % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
      const prodName = item.product?.name || item.variant?.variant_name || "Sản phẩm";

      let attrStr = "";
      if (item.variant?.Attributes && item.variant.Attributes.length > 0) {
        attrStr = item.variant.Attributes.map((a) => `${a.attribute_name}: ${a.value_name}`).join(", ");
      }

      const unitPrice = item.price || 0;
      const qty = item.Quantity || 1;
      const lineTotal = unitPrice * qty;
      subtotalCalc += lineTotal;

      const rowHeight = attrStr ? 32 : 24;

      if (y + rowHeight > 750) {
        doc.addPage({ margin: 40, size: "A4" });
        y = 40;
      }

      doc.rect(40, y, 515, rowHeight).fillAndStroke(bg, "#E2E8F0");
      doc.fillColor("#334155").font("Regular").fontSize(9);

      doc.text((index + 1).toString(), 45, y + 6, { width: 25, align: "center" });

      if (attrStr) {
        doc.font("Bold").text(prodName, 75, y + 4, { width: 240, lineBreak: false });
        doc.font("Regular").fontSize(8).fillColor("#64748B").text(attrStr, 75, y + 17, { width: 240, lineBreak: false });
      } else {
        doc.font("Regular").text(prodName, 75, y + 6, { width: 240, lineBreak: false });
      }

      doc.fillColor("#334155").font("Regular").fontSize(9);
      doc.text(`${unitPrice.toLocaleString("vi-VN")} đ`, 320, y + 6, { width: 75, align: "right" });
      doc.text(qty.toString(), 400, y + 6, { width: 35, align: "center" });
      doc.font("Bold").text(`${lineTotal.toLocaleString("vi-VN")} đ`, 440, y + 6, { width: 105, align: "right" });

      y += rowHeight;
    });

    // Phần tổng tiền
    y += 10;
    doc.rect(40, y, 515, 65).fillAndStroke("#F1F5F9", "#CBD5E1");

    doc.fillColor("#334155").font("Regular").fontSize(9);
    doc.text("Tổng tiền hàng:", 300, y + 10, { width: 120, align: "right" });
    doc.font("Bold").text(`${subtotalCalc.toLocaleString("vi-VN")} đ`, 425, y + 10, { width: 120, align: "right" });

    if (order.voucher_value && order.voucher_value > 0) {
      doc.font("Regular").text(`Giảm giá (${order.voucher_code || "Voucher"}):`, 280, y + 25, { width: 140, align: "right" });
      doc.font("Bold").fillColor("#DC2626").text(`- ${order.voucher_value.toLocaleString("vi-VN")} đ`, 425, y + 25, { width: 120, align: "right" });
    }

    const finalTotal = order.total_amount || (subtotalCalc - (order.voucher_value || 0));
    doc.font("Bold").fontSize(11).fillColor("#0F172A").text("TỔNG CỘNG THANH TOÁN:", 250, y + 42, { width: 170, align: "right" });
    doc.font("Bold").fontSize(12).fillColor("#1D4ED8").text(`${finalTotal.toLocaleString("vi-VN")} đ`, 425, y + 41, { width: 120, align: "right" });

    // Chữ ký & Chân trang
    y += 85;
    doc.font("Bold").fontSize(9).fillColor("#1E293B");
    doc.text("KHÁCH HÀNG", 90, y, { align: "center" });
    doc.font("Regular").fontSize(8).fillColor("#64748B").text("(Ký và ghi rõ họ tên)", 90, y + 13, { align: "center" });

    doc.font("Bold").fontSize(9).fillColor("#1E293B");
    doc.text("ĐƠN VỊ BÁN HÀNG", 420, y, { align: "center" });
    doc.font("Regular").fontSize(8).fillColor("#64748B").text("(Ký, đóng dấu và ghi rõ họ tên)", 420, y + 13, { align: "center" });

    y += 65;
    doc.font("Italic").fontSize(8).fillColor("#94A3B8").text("Cảm ơn quý khách đã tin tưởng và mua hàng tại WINNOTECH!", 40, y, { width: 515, align: "center" });

    doc.end();
  } catch (error) {
    console.error("Lỗi xuất hóa đơn PDF:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Lỗi Server khi xuất hóa đơn PDF: " + error.message });
    }
  }
};

app.get("/orders/export-pdf/:id", checklogin, exportOrderPdfHandler);
app.get("/orders/:orderId/export-pdf", checklogin, exportOrderPdfHandler);
app.post("/orders/export-pdf", checklogin, exportOrderPdfHandler);
app.get("/api/orders/export-pdf/:id", checklogin, exportOrderPdfHandler);
app.post("/api/orders/export-pdf", checklogin, exportOrderPdfHandler);


// ============================================================
// POST /reviews — đăng review cho order item
// ============================================================
app.post("/reviews", checklogin, async (req, res) => {
  try {
    const { order_item_id, content, star_number } = req.body;

    if (!order_item_id || !content || !star_number) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin review" });
    }

    // Kiểm tra order item có thuộc user không
    const orderItem = await OrderItem.findById(order_item_id).lean();
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy order item" });
    }

    const order = await Order.findOne({
      _id: orderItem.order_id,
      user_id: req.user._id,
    });
    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền review đơn hàng này",
      });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      id_oderitems: order_item_id,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã review sản phẩm này rồi" });
    }

    const review = await Review.create({
      id_oderitems: order_item_id, // FIX: đúng tên field theo ERD (giữ typo)
      content,
      star_number,
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.log("Lỗi API create review:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POST /favorites — thêm yêu thích
// ============================================================
app.post("/favorites", checklogin, async (req, res) => {
  try {
    const { product_id } = req.body;

    const exists = await Favorite.findOne({
      user_id: req.user._id,
      product_id,
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm đã có trong danh sách yêu thích",
      });
    }

    const fav = await Favorite.create({ user_id: req.user._id, product_id });
    return res.status(201).json({ success: true, data: fav });
  } catch (error) {
    console.log("Lỗi API add favorite:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// DELETE /favorites/:productId — xóa yêu thích
// ============================================================
app.delete("/favorites/:productId", checklogin, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      user_id: req.user._id,
      product_id: req.params.productId,
    });
    return res.json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
    });
  } catch (error) {
    console.log("Lỗi API delete favorite:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /delivery-addresses — lấy địa chỉ giao hàng của user
// API MỚI — dùng DeliveryAddressModel (bảng mới từ ERD)
// ============================================================
app.get("/delivery-addresses", checklogin, async (req, res) => {
  try {
    const addresses = await DeliveryAddressModel.find({
      id_user: req.user._id,
    }).lean();
    return res.json({ success: true, data: addresses });
  } catch (error) {
    console.log("Lỗi API get delivery addresses:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POST /delivery-addresses — thêm địa chỉ giao hàng
// API MỚI
// ============================================================
app.post("/delivery-addresses", checklogin, async (req, res) => {
  try {
    const { Name, Phone, address } = req.body;

    if (!Name || !Phone || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin địa chỉ" });
    }

    const newAddress = await DeliveryAddressModel.create({
      id_user: req.user._id,
      Name,
      Phone,
      address,
    });

    return res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    console.log("Lỗi API create delivery address:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// DELETE /delivery-addresses/:id — xóa địa chỉ giao hàng
// API MỚI
// ============================================================
app.delete("/delivery-addresses/:id", checklogin, async (req, res) => {
  try {
    const deleted = await DeliveryAddressModel.findOneAndDelete({
      _id: req.params.id,
      id_user: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy địa chỉ" });
    }

    return res.json({ success: true, message: "Đã xóa địa chỉ" });
  } catch (error) {
    console.log("Lỗi API delete delivery address:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /vouchers/check/:code — kiểm tra voucher hợp lệ
// ============================================================
app.get("/vouchers/check/:code", checklogin, async (req, res) => {
  try {
    const voucher = await Voucher.findOne({ code: req.params.code }).lean();

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Mã voucher không tồn tại" });
    }

    if (voucher.end_day < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher đã hết hạn" });
    }

    if (voucher.used_count >= voucher.usage_limit) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher đã hết lượt sử dụng" });
    }

    // Kiểm tra user đã lưu/dùng voucher này chưa
    const userVoucher = await UserVoucher.findOne({
      user_id: req.user._id,
      voucher_id: voucher._id,
    }).lean();

    if (userVoucher && userVoucher.is_used) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã dùng voucher này rồi" });
    }

    return res.json({ success: true, data: voucher });
  } catch (error) {
    console.log("Lỗi API check voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// CART APIs
// ============================================================

// Lấy danh sách giỏ hàng
app.get("/api/cart/:u_id", async (req, res) => {
  try {
    const { u_id } = req.params;

    // Validate u_id không được rỗng
    if (!u_id || u_id.trim() === "") {
      return res.status(400).json({ success: false, message: "Thiếu u_id" });
    }

    const cartItems = await CartItemModel.find({ u_id })
      .populate({
        path: "variant_id",
        // Nếu variant_id không hợp lệ (guest string) thì bỏ qua thay vì throw lỗi
        options: { strictPopulate: false },
      })
      .lean();
    return res.json({ success: true, data: cartItems });
  } catch (error) {
    console.error("Lỗi get cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// Thêm vào giỏ hàng
app.post("/api/cart", async (req, res) => {
  try {
    const { u_id, variant_id, quantity, price } = req.body;

    const productVariant = await VariantModel.findById(variant_id);

    if (!productVariant) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    if (productVariant.stock === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Sản phẩm đã hết hàng" });
    }

    if (quantity > productVariant.stock) {
      return res
        .status(400)
        .json({ success: false, message: "Số lượng tồn kho không đủ" });
    }

    let item = await CartItemModel.findOne({ u_id, variant_id });

    if (item) {
      if (item.quantity + quantity > productVariant.stock) {
        return res.status(400).json({
          success: false,
          message: `Chỉ còn ${productVariant.stock} sản phẩm trong kho`,
        });
      }

      item.quantity += quantity;
      await item.save();
    } else {
      item = new CartItemModel({ u_id, variant_id, quantity, price });
      await item.save();
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error("Lỗi add cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Cập nhật số lượng
app.put("/api/cart/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItemModel.findById(req.params.id);
    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy item trong giỏ" });
    }

    const variant = await ProductVariantModel.findById(cartItem.variant_id);
    if (
      variant &&
      variant.stock_quantity !== undefined &&
      parseInt(quantity) > variant.stock_quantity
    ) {
      return res.status(400).json({
        success: false,
        message: `Số lượng yêu cầu (${quantity}) vượt quá tồn kho hiện tại (${variant.stock_quantity} sản phẩm).`,
      });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();
    return res.json({ success: true, data: cartItem });
  } catch (error) {
    console.error("Lỗi update cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Xóa khỏi giỏ hàng
app.delete("/api/cart/:id", async (req, res) => {
  try {
    await CartItemModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Đã xóa" });
  } catch (error) {
    console.error("Lỗi delete cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});
// API Xóa toàn bộ giỏ hàng của 1 user
app.delete("/api/cart/clear/:u_id", async (req, res) => {
  try {
    const { u_id } = req.params;

    const result = await CartItemModel.deleteMany({ u_id: u_id });

    if (result.deletedCount === 0) {
      return res.json({ success: true, message: "Giỏ hàng đã trống sẵn" });
    }

    return res.json({
      success: true,
      message: "Đã xóa giỏ hàng",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Lỗi clear cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POST /upload — upload ảnh dùng chung cho sản phẩm & danh mục
// ============================================================
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Không có file nào được upload" });
    }
    const url = `/public/images/uploads/${req.file.filename}`;
    return res.json({ success: true, url, message: "Upload ảnh thành công" });
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi upload ảnh" });
  }
});

// ============================================================
// POST /categories — tạo danh mục mới (Kiểm tra trùng tên)
// ============================================================
app.post("/categories", async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên danh mục" });
    }

    // KIỂM TRA TỒN TẠI (Trùng tên danh mục)
    const existingCat = await CategoryModel.findOne({ name: name.trim() });
    if (existingCat) {
      return res.status(400).json({
        success: false,
        message: "Danh mục sản phẩm này đã tồn tại trên hệ thống!",
      });
    }

    let slug = slugify(name);
    let uniqueSlug = slug;
    let count = 1;
    while (await CategoryModel.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${count}`;
      count++;
    }

    const newCat = await CategoryModel.create({
      name: name.trim(),
      slug: uniqueSlug,
      image: image || "",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: newCat,
    });
  } catch (error) {
    console.error("Lỗi tạo danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi tạo danh mục" });
  }
});

// ============================================================
// PUT /categories/:id — cập nhật danh mục (Kiểm tra trùng tên)
// ============================================================
app.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, status } = req.body;

    const cat = await CategoryModel.findById(id);
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục" });
    }

    if (name && name.trim()) {
      // KIỂM TRA TỒN TẠI ở danh mục khác
      const duplicate = await CategoryModel.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục này đã bị trùng với danh mục khác!",
        });
      }

      cat.name = name.trim();
      let slug = slugify(name);
      let uniqueSlug = slug;
      let count = 1;
      while (
        await CategoryModel.findOne({ slug: uniqueSlug, _id: { $ne: id } })
      ) {
        uniqueSlug = `${slug}-${count}`;
        count++;
      }
      cat.slug = uniqueSlug;
    }

    if (image !== undefined) cat.image = image;
    if (status !== undefined) cat.status = status;

    await cat.save();
    return res.json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: cat,
    });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi cập nhật danh mục" });
  }
});

// ============================================================
// DELETE /categories/:id — SOFT DELETE danh mục (Chỉ chuyển trạng thái)
// ============================================================
app.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await CategoryModel.findById(id);
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục" });
    }

    // SOFT DELETE: Chỉ cập nhật trạng thái thành 'inactive', tuyệt đối KHÔNG XÓA DB
    cat.status = "inactive";
    await cat.save();

    return res.json({
      success: true,
      message: "Đã ngưng hoạt động danh mục (Soft delete thành công)",
      data: cat,
    });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi ẩn danh mục" });
  }
});

// ============================================================
// FAVORITES (YÊU THÍCH) ROUTES
// ============================================================

// GET /favorites/ids — chỉ trả mảng productId (nhẹ, dùng để check trạng thái)
app.get("/favorites/ids", checklogin, async (req, res) => {
  try {
    const favs = await Favorite.find({ user_id: req.user._id }).lean();
    const ids = favs.map((f) => f.product_id.toString());
    return res.json({ success: true, data: ids });
  } catch (error) {
    console.error("Lỗi GET favorites/ids:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// GET /favorites — lấy danh sách yêu thích kèm thông tin sản phẩm
app.get("/favorites", checklogin, async (req, res) => {
  try {
    const favs = await Favorite.find({ user_id: req.user._id }).lean();
    if (favs.length === 0) return res.json({ success: true, data: [] });

    const productIds = favs.map((f) => f.product_id);
    const products = await ProductModel.find({ _id: { $in: productIds } })
      .populate("cat_id brand_id")
      .lean();
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();
    const variants = await ProductVariantModel.find({
      p_id: { $in: productIds },
    }).lean();

    const data = products.map((p) => {
      const pImages = images.filter(
        (img) => img.p_id.toString() === p._id.toString(),
      );
      const pVariants = variants.filter(
        (v) => v.p_id.toString() === p._id.toString(),
      );
      const firstVariant = pVariants[0];
      const price =
        firstVariant?.sale_price > 0
          ? firstVariant.sale_price
          : firstVariant?.price || 0;
      const thumb = pImages[0]?.url || p.thumnail || "";
      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        price,
        originalPrice: firstVariant?.price || 0,
        hasSale: firstVariant?.sale_price > 0,
        image: thumb.startsWith("http")
          ? thumb
          : thumb
            ? `http://localhost:3000${thumb}`
            : "",
        cat_id: p.cat_id,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi GET favorites:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// POST /favorites/:productId — toggle yêu thích
app.post("/favorites/:productId", checklogin, async (req, res) => {
  try {
    const { productId } = req.params;
    const user_id = req.user._id;

    const product = await ProductModel.findById(productId).lean();
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });

    const existing = await Favorite.findOne({ user_id, product_id: productId });
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({
        success: true,
        action: "removed",
        message: "Đã xóa khỏi danh sách yêu thích",
      });
    } else {
      await Favorite.create({ user_id, product_id: productId });
      return res.json({
        success: true,
        action: "added",
        message: "Đã thêm vào danh sách yêu thích",
      });
    }
  } catch (error) {
    console.error("Lỗi toggle favorite:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// DELETE /favorites/:productId — xóa khỏi yêu thích
app.delete("/favorites/:productId", checklogin, async (req, res) => {
  try {
    const { productId } = req.params;
    await Favorite.findOneAndDelete({
      user_id: req.user._id,
      product_id: productId,
    });
    return res.json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
    });
  } catch (error) {
    console.error("Lỗi DELETE favorite:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POSTS & BLOG APIs
// ============================================================

// Middleware kiểm tra quyền Admin
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({
        success: false,
        message: "Quyền truy cập bị từ chối. Chỉ dành cho Admin.",
      });
  }
};

// ============================================================
// BỘ API QUẢN LÝ ADMIN (SẢN PHẨM, THƯƠNG HIỆU, NGƯỜI DÙNG, ĐƠN HÀNG, THỐNG KÊ DOANH THU & XUẤT EXCEL)
// QUY TẮC: CHỈ ĐỔI STATUS (SOFT DELETE), KHÔNG XÓA CỨNG DB, KIỂM TRA TRÙNG TRƯỚC KHI THÊM/SỬA
// ============================================================

// 1. QUẢN LÝ SẢN PHẨM (ADMIN PRODUCT CRUD)

// GET /admin/products — Lấy tất cả sản phẩm hệ thống
app.get("/admin/products", checklogin, checkAdmin, async (req, res) => {
  try {
    const products = await ProductModel.find({})
      .populate("cat_id brand_id")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Lỗi GET admin products:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// POST /admin/products — Thêm mới sản phẩm (Kiểm tra trùng tên/slug trước khi thêm)
app.post("/admin/products", checklogin, checkAdmin, async (req, res) => {
  try {
    const { name, price, sale, stock, short_desc, cat_id, brand_id, thumnail, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên sản phẩm" });
    }

    const trimmedName = name.trim();
    const productSlug = req.body.slug ? slugify(req.body.slug) : slugify(trimmedName);

    // KIỂM TRA TỒN TẠI: Kiểm tra xem sản phẩm cùng tên hoặc slug đã có trong DB chưa
    const existing = await ProductModel.findOne({
      $or: [{ name: trimmedName }, { slug: productSlug }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm này đã tồn tại trên hệ thống! Vui lòng kiểm tra lại tên hoặc slug."
      });
    }

    const numPrice = Number(price) || 0;
    const numSale = Number(sale) || 0;
    const numStock = stock !== undefined && stock !== "" ? Number(stock) : 10;

    const newProduct = await ProductModel.create({
      name: trimmedName,
      slug: productSlug,
      price: numPrice,
      sale: numSale,
      short_desc: short_desc || "",
      cat_id: cat_id || null,
      brand_id: brand_id || null,
      thumnail: thumnail || "",
      description: description || "",
      status: status || "active"
    });

    // TỰ ĐỘNG TẠO BIẾN THỂ MẶC ĐỊNH CHO SẢN PHẨM MỚI
    const defaultVariant = await ProductVariantModel.create({
      p_id: newProduct._id,
      variant_name: "Mặc định",
      sku: `SKU-${Date.now()}`,
      price: numPrice,
      sale_price: numSale > 0 && numPrice > 0 ? Math.round(numPrice * (1 - numSale / 100)) : 0,
      stock_quantity: numStock,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm mới thành công",
      data: { ...newProduct.toObject(), Variants: [defaultVariant] }
    });
  } catch (error) {
    console.error("Lỗi POST admin product:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// PUT /admin/products/:id — Cập nhật sản phẩm (Kiểm tra trùng tên/slug ở sản phẩm khác)
app.put("/admin/products/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, sale, stock, short_desc, cat_id, brand_id, thumnail, description, status, slug } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    if (name && name.trim()) {
      const trimmedName = name.trim();
      const newSlug = slug ? slugify(slug) : slugify(trimmedName);

      // KIỂM TRA TỒN TẠI trên sản phẩm khác
      const duplicate = await ProductModel.findOne({
        _id: { $ne: id },
        $or: [{ name: trimmedName }, { slug: newSlug }]
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Tên hoặc slug sản phẩm đã bị trùng với sản phẩm khác trên hệ thống!"
        });
      }

      product.name = trimmedName;
      product.slug = newSlug;
    }

    if (price !== undefined) product.price = Number(price) || 0;
    if (sale !== undefined) product.sale = Number(sale) || 0;
    if (short_desc !== undefined) product.short_desc = short_desc;
    if (cat_id !== undefined) product.cat_id = cat_id;
    if (brand_id !== undefined) product.brand_id = brand_id;
    if (thumnail !== undefined) product.thumnail = thumnail;
    if (description !== undefined) product.description = description;
    if (status !== undefined) product.status = status;

    await product.save();

    // Cập nhật hoặc tạo biến thể mặc định cho sản phẩm
    let defaultVariant = await ProductVariantModel.findOne({
      p_id: id,
      variant_name: "Mặc định"
    });
    if (!defaultVariant) {
      defaultVariant = await ProductVariantModel.findOne({ p_id: id });
    }

    const targetPrice = price !== undefined ? Number(price) || 0 : product.price || 0;
    const targetSale = sale !== undefined ? Number(sale) || 0 : product.sale || 0;
    const targetStock = stock !== undefined ? Number(stock) || 0 : (defaultVariant ? defaultVariant.stock_quantity : 10);
    const salePrice = targetSale > 0 && targetPrice > 0 ? Math.round(targetPrice * (1 - targetSale / 100)) : 0;

    if (defaultVariant) {
      defaultVariant.price = targetPrice;
      defaultVariant.sale_price = salePrice;
      if (stock !== undefined) defaultVariant.stock_quantity = targetStock;
      await defaultVariant.save();
    } else {
      defaultVariant = await ProductVariantModel.create({
        p_id: id,
        variant_name: "Mặc định",
        sku: `SKU-${Date.now()}`,
        price: targetPrice,
        sale_price: salePrice,
        stock_quantity: targetStock,
      });
    }

    return res.json({ success: true, message: "Cập nhật sản phẩm thành công", data: product });
  } catch (error) {
    console.error("Lỗi PUT admin product:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// PUT /admin/products/:id/status — Đổi trạng thái sản phẩm (active / inactive)
app.put("/admin/products/:id/status", checklogin, checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Thiếu trạng thái status" });

    const product = await ProductModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    return res.json({ success: true, message: "Cập nhật trạng thái thành công", data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// DELETE /admin/products/:id — SOFT DELETE sản phẩm (Chuyển status = 'inactive', TUYỆT ĐỐI KHÔNG XÓA DB)
app.delete("/admin/products/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    product.status = "inactive";
    await product.save();

    return res.json({ success: true, message: "Đã ngưng hoạt động sản phẩm (Soft delete thành công)", data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});


// 2. QUẢN LÝ THƯƠNG HIỆU (ADMIN BRAND CRUD)

// GET /admin/brands — Lấy tất cả thương hiệu
app.get("/admin/brands", async (req, res) => {
  try {
    const brands = await BrandModel.find({}).lean();
    return res.json({ success: true, data: brands });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// POST /admin/brands — Thêm thương hiệu mới (Kiểm tra trùng tên)
app.post("/admin/brands", checklogin, checkAdmin, async (req, res) => {
  try {
    const { name, image, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Thiếu tên thương hiệu" });
    }

    const trimmedName = name.trim();
    const existing = await BrandModel.findOne({ name: trimmedName });
    if (existing) {
      return res.status(400).json({ success: false, message: "Thương hiệu này đã tồn tại trên hệ thống!" });
    }

    const brand = await BrandModel.create({
      name: trimmedName,
      image: image || "",
      status: status || "active"
    });

    return res.status(201).json({ success: true, message: "Tạo thương hiệu thành công", data: brand });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// PUT /admin/brands/:id — Cập nhật thương hiệu (Kiểm tra trùng tên)
app.put("/admin/brands/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, status } = req.body;

    const brand = await BrandModel.findById(id);
    if (!brand) return res.status(404).json({ success: false, message: "Không tìm thấy thương hiệu" });

    if (name && name.trim()) {
      const duplicate = await BrandModel.findOne({ name: name.trim(), _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "Tên thương hiệu đã bị trùng với thương hiệu khác!" });
      }
      brand.name = name.trim();
    }

    if (image !== undefined) brand.image = image;
    if (status !== undefined) brand.status = status;

    await brand.save();
    return res.json({ success: true, message: "Cập nhật thương hiệu thành công", data: brand });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// DELETE /admin/brands/:id — SOFT DELETE thương hiệu (Chỉ đổi status = 'inactive')
app.delete("/admin/brands/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const brand = await BrandModel.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Không tìm thấy thương hiệu" });

    brand.status = "inactive";
    await brand.save();

    return res.json({ success: true, message: "Đã ẩn thương hiệu (Soft delete thành công)", data: brand });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});


// 3. QUẢN LÝ NGƯỜI DÙNG (ADMIN USER MANAGEMENT)

// GET /admin/users — Danh sách người dùng
app.get("/admin/users", checklogin, checkAdmin, async (req, res) => {
  try {
    const users = await UserModel.find({}).select("-password").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// POST /admin/users — Tạo người dùng mới (Kiểm tra trùng email/phone)
app.post("/admin/users", checklogin, checkAdmin, async (req, res) => {
  try {
    const { name, email, phone, password, role, status } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu" });
    }

    const existing = await UserModel.findOne({
      $or: [{ email: email.trim() }, { phone: phone ? phone.trim() : null }]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Email hoặc Số điện thoại này đã được sử dụng!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name: name || email.split("@")[0],
      email: email.trim(),
      phone: phone ? phone.trim() : "",
      password: hashedPassword,
      role: role || "user",
      status: status || "active"
    });

    const userObj = newUser.toObject();
    delete userObj.password;
    return res.status(201).json({ success: true, message: "Tạo tài khoản thành công", data: userObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// PUT /admin/users/:id/status — Đổi trạng thái/khóa người dùng ('active' | 'inactive' | 'locked')
app.put("/admin/users/:id/status", checklogin, checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Thiếu trạng thái status" });

    const user = await UserModel.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    return res.json({ success: true, message: `Đã đổi trạng thái tài khoản thành ${status}`, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// DELETE /admin/users/:id — SOFT DELETE người dùng (Chuyển status = 'inactive')
app.delete("/admin/users/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    user.status = "inactive";
    await user.save();

    return res.json({ success: true, message: "Đã vô hiệu hóa tài khoản (Soft delete thành công)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});


// 4. QUẢN LÝ ĐƠN HÀNG (ADMIN ORDER MANAGEMENT)

// GET /admin/orders — Lấy tất cả đơn hàng hệ thống
app.get("/admin/orders", checklogin, checkAdmin, async (req, res) => {
  try {
    const { status, payment_status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (payment_status) filter.payment_status = payment_status;

    const orders = await Order.find(filter)
      .populate("user_id", "name email phone")
      .populate("payment_method")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// PUT /admin/orders/:id/status — Cập nhật trạng thái đơn hàng
app.put("/admin/orders/:id/status", checklogin, checkAdmin, async (req, res) => {
  try {
    const { status } = req.body; // pending, preparing, handed_over, shipping, delivering, completed, canceled
    if (!status) return res.status(400).json({ success: false, message: "Thiếu trạng thái status" });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    return res.json({ success: true, message: "Cập nhật trạng thái đơn hàng thành công", data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// DELETE /admin/orders/:id — SOFT CANCEL đơn hàng (Chuyển status = 'canceled')
app.delete("/admin/orders/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    order.status = "canceled";
    await order.save();

    return res.json({ success: true, message: "Đã hủy đơn hàng (Soft delete/cancel thành công)", data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});


// 5. CHỨC NĂNG THỐNG KÊ DOANH THU & XUẤT FILE EXCEL

// GET /admin/revenue/stats — Thống kê doanh thu theo Ngày, Tuần, Tháng, Năm
app.get("/admin/revenue/stats", checklogin, checkAdmin, async (req, res) => {
  try {
    const { type = "month" } = req.query; // 'day' | 'week' | 'month' | 'year'

    // Lấy các đơn hàng đã thanh toán hoặc đã hoàn thành
    const paidOrders = await Order.find({
      $or: [{ payment_status: "paid" }, { status: "completed" }]
    }).sort({ createdAt: 1 }).lean();

    const statsMap = {};
    let totalRevenue = 0;
    let totalPaidOrders = paidOrders.length;

    paidOrders.forEach((ord) => {
      const date = moment(ord.createdAt || ord.date);
      let key = "";
      if (type === "day") {
        key = date.format("YYYY-MM-DD");
      } else if (type === "week") {
        key = `Tuần ${date.isoWeek()} - ${date.format("YYYY")}`;
      } else if (type === "year") {
        key = date.format("YYYY");
      } else {
        key = date.format("YYYY-MM");
      }

      const amount = ord.total_amount || 0;
      totalRevenue += amount;

      if (!statsMap[key]) {
        statsMap[key] = { period: key, orderCount: 0, revenue: 0 };
      }
      statsMap[key].orderCount += 1;
      statsMap[key].revenue += amount;
    });

    const breakdown = Object.values(statsMap);
    const avgOrderValue = totalPaidOrders > 0 ? Math.round(totalRevenue / totalPaidOrders) : 0;

    return res.json({
      success: true,
      summary: {
        type,
        totalRevenue,
        totalPaidOrders,
        avgOrderValue,
      },
      breakdown
    });
  } catch (error) {
    console.error("Lỗi thống kê doanh thu:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// GET /admin/revenue/export-excel — Xuất bảng thống kê doanh thu ra file Excel (.xlsx)
app.get("/admin/revenue/export-excel", checklogin, checkAdmin, async (req, res) => {
  try {
    const { type = "month" } = req.query;

    const paidOrders = await Order.find({
      $or: [{ payment_status: "paid" }, { status: "completed" }]
    }).sort({ createdAt: 1 }).lean();

    const statsMap = {};
    paidOrders.forEach((ord) => {
      const date = moment(ord.createdAt || ord.date);
      let key = "";
      if (type === "day") key = date.format("YYYY-MM-DD");
      else if (type === "week") key = `Tuần ${date.isoWeek()} - ${date.format("YYYY")}`;
      else if (type === "year") key = date.format("YYYY");
      else key = date.format("YYYY-MM");

      const amount = ord.total_amount || 0;
      if (!statsMap[key]) statsMap[key] = { key, count: 0, revenue: 0 };
      statsMap[key].count += 1;
      statsMap[key].revenue += amount;
    });

    const statsList = Object.values(statsMap);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Thống kê doanh thu");

    // Banner Tiêu Đề
    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BÁO CÁO THỐNG KÊ DOANH THU - WINNOTECH STORE";
    titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 40;

    // Subtitle
    worksheet.mergeCells("A2:E2");
    const subCell = worksheet.getCell("A2");
    subCell.value = `Loại thống kê: theo ${type.toUpperCase()} | Ngày xuất file: ${moment().format("DD/MM/YYYY HH:mm")}`;
    subCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF475569" } };
    subCell.alignment = { horizontal: "center", vertical: "middle" };

    // Hàng Tiêu Đề Bảng
    const headerRow = worksheet.getRow(4);
    headerRow.values = ["STT", "Thời gian", "Số lượng đơn", "Tổng doanh thu (VNĐ)", "Doanh thu TB / Đơn"];
    headerRow.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
    headerRow.height = 28;

    worksheet.columns = [
      { width: 8, alignment: { horizontal: "center" } },
      { width: 25, alignment: { horizontal: "center" } },
      { width: 18, alignment: { horizontal: "right" } },
      { width: 28, alignment: { horizontal: "right" } },
      { width: 25, alignment: { horizontal: "right" } },
    ];

    let totalRevenue = 0;
    let totalOrders = 0;

    statsList.forEach((item, idx) => {
      const avg = item.count > 0 ? Math.round(item.revenue / item.count) : 0;
      totalRevenue += item.revenue;
      totalOrders += item.count;

      const row = worksheet.addRow([
        idx + 1,
        item.key,
        item.count,
        item.revenue,
        avg
      ]);

      row.height = 22;
      row.getCell(4).numFmt = '#,##0 "đ"';
      row.getCell(5).numFmt = '#,##0 "đ"';

      if (idx % 2 === 1) {
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
    });

    // Hàng Tổng Cộng
    const totalRow = worksheet.addRow([
      "",
      "TỔNG CỘNG",
      totalOrders,
      totalRevenue,
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    ]);
    totalRow.height = 26;
    totalRow.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF1E40AF" } };
    totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    totalRow.getCell(4).numFmt = '#,##0 "đ"';
    totalRow.getCell(5).numFmt = '#,##0 "đ"';

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ThongKeDoanhThu_WINNOTECH_${type}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Lỗi xuất Excel thống kê doanh thu:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Lỗi Server khi xuất Excel: " + error.message });
    }
  }
});


// GET /post-categories — Lấy danh mục bài viết
app.get("/post-categories", async (req, res) => {
  try {
    const cats = await PostCategoryModel.find({}).lean();
    return res.json({ success: true, data: cats });
  } catch (error) {
    console.error("Lỗi GET post-categories:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// GET /posts — Lấy tất cả bài viết (hỗ trợ lọc theo category_id và status)
app.get("/posts", async (req, res) => {
  try {
    const { categoryId, status } = req.query;
    const query = {};
    if (categoryId) query.categories_post_id = categoryId;
    if (status) {
      query.status = status;
    }

    const posts = await PostModel.find(query)
      .populate("categories_post_id", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Lỗi GET posts:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// GET /posts/:slug — Lấy chi tiết bài viết theo slug
app.get("/posts/:slug", async (req, res) => {
  try {
    const post = await PostModel.findOne({ slug: req.params.slug })
      .populate("categories_post_id", "name slug")
      .lean();

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });
    }

    return res.json({ success: true, data: post });
  } catch (error) {
    console.error("Lỗi GET post by slug:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// POST /admin/posts — Tạo mới bài viết (Yêu cầu Admin)
app.post("/admin/posts", checklogin, checkAdmin, async (req, res) => {
  try {
    const {
      tittle,
      slug,
      content,
      status,
      image,
      thumnail,
      categories_post_id,
    } = req.body;

    if (!tittle || !slug || !content) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng nhập đầy đủ tiêu đề, slug và nội dung",
        });
    }

    // Kiểm tra trùng slug
    const duplicate = await PostModel.findOne({ slug });
    if (duplicate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Slug này đã được sử dụng ở bài viết khác",
        });
    }

    const newPost = await PostModel.create({
      tittle,
      slug,
      content,
      status: status || "draft",
      image,
      thumnail: thumnail || image,
      categories_post_id,
    });

    return res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error("Lỗi POST admin posts:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// PUT /admin/posts/:id — Cập nhật bài viết (Yêu cầu Admin)
app.put("/admin/posts/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const {
      tittle,
      slug,
      content,
      status,
      image,
      thumnail,
      categories_post_id,
    } = req.body;
    const postId = req.params.id;

    if (!tittle || !slug || !content) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng nhập đầy đủ tiêu đề, slug và nội dung",
        });
    }

    // Kiểm tra trùng slug của bài khác
    const duplicate = await PostModel.findOne({ slug, _id: { $ne: postId } });
    if (duplicate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Slug này đã được sử dụng ở bài viết khác",
        });
    }

    const updated = await PostModel.findByIdAndUpdate(
      postId,
      {
        tittle,
        slug,
        content,
        status,
        image,
        thumnail: thumnail || image,
        categories_post_id,
      },
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy bài viết để cập nhật",
        });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Lỗi PUT admin posts:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// DELETE /admin/posts/:id — SOFT DELETE bài viết (Chỉ đổi status)
app.delete("/admin/posts/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });
    }

    // SOFT DELETE: đổi trạng thái sang 'inactive', KHÔNG XÓA DB
    post.status = "inactive";
    await post.save();

    return res.json({ success: true, message: "Đã ẩn bài viết (Soft delete thành công)", data: post });
  } catch (error) {
    console.error("Lỗi DELETE admin posts:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// ADMIN POST CATEGORIES CRUD (SOFT DELETE & STATUS TOGGLE)
// ============================================================

// POST /admin/post-categories — Tạo mới danh mục bài viết
app.post("/admin/post-categories", checklogin, checkAdmin, async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên danh mục bài viết" });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^a-z0-9\s-]+)/g, "")
      .replace(/([\s-]+)/g, "-")
      .trim();

    const existing = await PostCategoryModel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Danh mục bài viết này đã tồn tại!" });
    }

    const cat = await PostCategoryModel.create({
      name: name.trim(),
      slug,
      image: image || "",
      status: "active",
    });

    return res.status(201).json({ success: true, data: cat });
  } catch (error) {
    console.error("Lỗi POST post-categories:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// PUT /admin/post-categories/:id — Cập nhật danh mục bài viết
app.put("/admin/post-categories/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const { name, image, status } = req.body;
    const cat = await PostCategoryModel.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục bài viết" });
    }

    if (name) {
      cat.name = name.trim();
      cat.slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^a-z0-9\s-]+)/g, "")
        .replace(/([\s-]+)/g, "-")
        .trim();
    }
    if (image !== undefined) cat.image = image;
    if (status) cat.status = status;

    await cat.save();
    return res.json({ success: true, data: cat });
  } catch (error) {
    console.error("Lỗi PUT post-categories:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// PUT /admin/post-categories/:id/status — Đổi trạng thái danh mục bài viết (active ↔ inactive)
app.put("/admin/post-categories/:id/status", checklogin, checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const cat = await PostCategoryModel.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục bài viết" });
    }

    cat.status = status || (cat.status === "active" ? "inactive" : "active");
    await cat.save();
    return res.json({ success: true, message: `Đã đổi trạng thái danh mục bài viết thành ${cat.status}`, data: cat });
  } catch (error) {
    console.error("Lỗi status post-categories:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// ADMIN REVIEWS MODERATION (SOFT TOGGLE STATUS: ACTIVE / HIDDEN)
// ============================================================

// PUT /admin/reviews/:id/status — Đổi trạng thái review (active ↔ hidden), KHÔNG XÓA DB
app.put("/admin/reviews/:id/status", checklogin, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'hidden'

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    }

    review.status = status || (review.status === "hidden" ? "active" : "hidden");
    await review.save();

    return res.json({
      success: true,
      message: review.status === "hidden" ? "Đã ẩn đánh giá khỏi giao diện" : "Đã hiện lại đánh giá",
      data: review,
    });
  } catch (error) {
    console.error("Lỗi PUT admin review status:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// ADMIN PRODUCT VARIANT CRUD
// ============================================================

// GET /admin/products/:productId/variants — Lấy danh sách biến thể
app.get(
  "/admin/products/:productId/variants",
  checklogin,
  checkAdmin,
  async (req, res) => {
    try {
      const variants = await ProductVariantModel.find({
        p_id: req.params.productId,
      }).lean();
      return res.json({ success: true, data: variants });
    } catch (error) {
      console.error("Lỗi GET admin variants:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server" });
    }
  },
);

// POST /admin/products/:productId/variants — Thêm biến thể mới (Kiểm tra trùng SKU)
app.post(
  "/admin/products/:productId/variants",
  checklogin,
  checkAdmin,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { variant_name, price, sku, sale_price, stock_quantity, status } =
        req.body;

      if (!variant_name || !price || !sku) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Vui lòng nhập đầy đủ tên, SKU và giá của biến thể",
          });
      }

      // KIỂM TRA TỒN TẠI SKU
      const existingSku = await ProductVariantModel.findOne({ sku: sku.trim() });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "Mã SKU này đã tồn tại trên hệ thống!",
        });
      }

      const v = await ProductVariantModel.create({
        variant_name,
        price: Number(price) || 0,
        sku: sku.trim(),
        sale_price: Number(sale_price) || 0,
        stock_quantity: Number(stock_quantity) || 0,
        status: status || "active",
        p_id: productId,
      });

      return res.status(201).json({ success: true, data: v });
    } catch (error) {
      console.error("Lỗi POST admin variants:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server" });
    }
  },
);

// PUT /admin/variants/:variantId — Cập nhật biến thể (Kiểm tra trùng SKU)
app.put(
  "/admin/variants/:variantId",
  checklogin,
  checkAdmin,
  async (req, res) => {
    try {
      const { variantId } = req.params;
      const { variant_name, price, sku, sale_price, stock_quantity, status } =
        req.body;

      if (sku) {
        const duplicateSku = await ProductVariantModel.findOne({
          sku: sku.trim(),
          _id: { $ne: variantId },
        });
        if (duplicateSku) {
          return res.status(400).json({
            success: false,
            message: "Mã SKU này đã bị trùng với biến thể khác!",
          });
        }
      }

      const v = await ProductVariantModel.findByIdAndUpdate(
        variantId,
        {
          variant_name,
          price: Number(price) || 0,
          sku: sku ? sku.trim() : undefined,
          sale_price: Number(sale_price) || 0,
          stock_quantity: Number(stock_quantity) || 0,
          status,
        },
        { new: true },
      );

      if (!v) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy biến thể" });
      }

      return res.json({ success: true, data: v });
    } catch (error) {
      console.error("Lỗi PUT admin variants:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server" });
    }
  },
);

// DELETE /admin/variants/:variantId — SOFT DELETE biến thể (Đổi status sang 'inactive')
app.delete(
  "/admin/variants/:variantId",
  checklogin,
  checkAdmin,
  async (req, res) => {
    try {
      const { variantId } = req.params;
      const variant = await ProductVariantModel.findById(variantId);
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy biến thể" });
      }

      // SOFT DELETE: Đổi status sang inactive, KHÔNG XÓA DB
      variant.status = "inactive";
      await variant.save();

      return res.json({ success: true, message: "Đã ẩn biến thể (Soft delete thành công)", data: variant });
    } catch (error) {
      console.error("Lỗi DELETE admin variants:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server" });
    }
  },
);

//Deliver
// ==========================================
// 1. API: HIỂN THỊ ĐỊA CHỈ CỦA NGƯỜI DÙNG (GET)
// ==========================================
app.get("/profile/deliver", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;

    const addresses = await DeliveryAddressModel.find({ id_user: userId })
      .sort({ set_default: -1 })
      .lean();

    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.error("Lỗi lấy địa chỉ:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ==========================================
// 2. API: THÊM MỚI ĐỊA CHỈ (POST)
// ==========================================
app.post("/profile/deliver", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;
    let { Name, Phone, address, set_default } = req.body;

    const addressCount = await DeliveryAddressModel.countDocuments({
      id_user: userId,
    });

    if (addressCount === 0) {
      set_default = true;
    }

    if (set_default) {
      await DeliveryAddressModel.updateMany(
        { id_user: userId },
        { set_default: false },
      );
    }

    const newAddress = await DeliveryAddressModel.create({
      id_user: userId,
      Name,
      Phone,
      address,
      set_default: set_default || false,
    });

    return res
      .status(200)
      .json({ success: true, message: "Thêm thành công", data: newAddress });
  } catch (error) {
    console.error("Lỗi thêm địa chỉ:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ==========================================
// 3. API: CHỈNH SỬA ĐỊA CHỈ (PUT)
// ==========================================
app.put("/profile/deliver/:id", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;
    const { Name, Phone, address, set_default } = req.body;

    const updateData = {};

    if (Name) updateData.Name = Name;
    if (Phone) updateData.Phone = Phone;
    if (address) updateData.address = address;

    if (set_default !== undefined) {
      updateData.set_default = set_default;

      if (set_default === true) {
        await DeliveryAddressModel.updateMany(
          { id_user: userId, _id: { $ne: addressId } },
          { $set: { set_default: false } },
        );
      }
    }

    const updatedAddress = await DeliveryAddressModel.findOneAndUpdate(
      { _id: addressId, id_user: userId },
      { $set: updateData },
      { new: true },
    );

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy địa chỉ hợp lệ" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ==========================================
// CẤU HÌNH BỘ GỬI MAIL
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

app.post("/contact", async (req, res) => {
  try {
    const { name, email, content } = req.body;

    // 2. Kiểm tra xem FE có truyền thiếu trường nào không (Validation cơ bản)
    if (!name || !email || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng nhập đầy đủ Tên, Email và Nội dung liên hệ!" 
      });
    }

    // 3. Thiết kế nội dung Email (Bọc HTML cho đẹp mắt)
    const mailOptions = {
      from: `"Form Liên Hệ WINNOTech" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVE,
      subject: `[WINNOTech] Khách hàng ${name} gửi liên hệ mới!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2c3e50;">📩 YÊU CẦU LIÊN HỆ MỚI</h2>
          <p><strong>Họ và tên:</strong> ${name}</p>
          <p><strong>Email khách hàng:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Nội dung tin nhắn:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; font-style: italic;">
            "${content}"
          </div>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #7f8c8d;">Hệ thống thông báo tự động từ Website WINNOTech.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: "Gửi liên hệ thành công! WINNOTech sẽ phản hồi bác sớm nhất." 
    });

  } catch (error) {
    console.error("Lỗi gửi mail liên hệ:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi Server, không thể gửi mail liên hệ lúc này." 
    });
  }
});

//API quên mật khẩu (chưa login)
// ========================================================
// API gửi mail (quên mật khẩu)
// ========================================================
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;
    
    if (!identifier) return res.status(400).json({ success: false, message: "Thiếu thông tin!" });

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmail ? { email: identifier } : { phone: identifier };

    const user = await UserModel.findOne(query).select('_id name email').lean();
    
    if (!user) return res.status(404).json({ success: false, message: "Tài khoản không tồn tại." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;

    await UserModel.updateOne(
      { _id: user._id },
      { $set: { resetPasswordOTP: otp, resetPasswordExpires: expires } }
    );

    const mailOptions = {
      from: `"WINNOTech Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "[WINNOTech] Mã xác nhận khôi phục",
      html: `<h3>Chào ${user.name},</h3><p>Mã OTP của bạn là: <b style="font-size: 24px; color: blue;">${otp}</b> (Hết hạn sau 5 phút).</p>`
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Đã gửi OTP qua Email!" });
  } catch (error) {
    console.error("Lỗi:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ========================================================
// API đổi mật khẩu (sau khi có OTP)
// ========================================================
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { identifier, otp, newPassword, confirmPassword } = req.body;

    if (!identifier || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin!" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu không khớp!" });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmail ? { email: identifier } : { phone: identifier };

    const user = await UserModel.findOne(query).select('_id resetPasswordOTP resetPasswordExpires').lean();

    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user." });
    if (user.resetPasswordOTP !== otp) return res.status(400).json({ success: false, message: "Mã OTP sai!" });
    if (user.resetPasswordExpires < Date.now()) return res.status(400).json({ success: false, message: "OTP hết hạn!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetPasswordOTP: "", resetPasswordExpires: "" } 
      }
    );

    return res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// API quên mật khẩu (đã login) 
// ========================================================
// [PRIVATE] 3. YÊU CẦU OTP (KHI ĐÃ LOGIN)
// ========================================================
app.post("/profile/change-password/request-otp", checklogin, async (req, res) => {
  try {

    const { _id, email, name } = req.user; 

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;

    await UserModel.updateOne(
      { _id: _id },
      { $set: { resetPasswordOTP: otp, resetPasswordExpires: expires } }
    );

    const mailOptions = {
      from: `"WINNOTech Security" <${process.env.EMAIL_USER}>`,
      to: email, 
      subject: "[WINNOTech] Mã Đổi Mật Khẩu",
      html: `<h3>Chào ${name},</h3><p>Mã OTP đổi pass của bạn là: <b style="font-size: 24px; color: red;">${otp}</b></p>`
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Đã gửi OTP!" });
  } catch (error) {
    console.error("Lỗi:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ========================================================
// [PRIVATE] 4. NHẬP OTP & ĐỔI PASS (KHI ĐÃ LOGIN)
// ========================================================
app.post("/profile/change-password/verify", checklogin, async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    if (!otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin!" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu không khớp!" });
    }

    // TỐI ƯU: Đâm thẳng bằng findById, lấy đúng 2 cột cần thiết
    const user = await UserModel.findById(userId).select('resetPasswordOTP resetPasswordExpires').lean();

    if (user.resetPasswordOTP !== otp) return res.status(400).json({ success: false, message: "Mã OTP sai!" });
    if (user.resetPasswordExpires < Date.now()) return res.status(400).json({ success: false, message: "OTP hết hạn!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // TỐI ƯU: Dùng $unset để dọn dẹp DB
    await UserModel.updateOne(
      { _id: userId },
      { 
        $set: { password: hashedPassword },
        $unset: { resetPasswordOTP: "", resetPasswordExpires: "" } 
      }
    );

    return res.status(200).json({ success: true, message: "Bảo mật tài khoản thành công!" });
  } catch (error) {
    console.error("Lỗi:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

app.put("/profile/change-password", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ các trường mật khẩu!" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu xác nhận không khớp!" });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới không được trùng với mật khẩu cũ!" });
    }


    const user = await UserModel.findById(userId).select('password').lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).json({ 
      success: true, 
      message: "Cập nhật mật khẩu mới thành công!" 
    });

  } catch (error) {
    console.error("Lỗi đổi mật khẩu trực tiếp:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server, không thể đổi mật khẩu lúc này." });
  }
});

// ==========================================
// KHỞI TẠO VNPAY
// ==========================================
const vnpay = new VNPay({
  tmnCode: '6HB2Z3XJ', 
  secureSecret: '17H264J1LFK5JZGCF08DBXTAUMC4WIO3', 
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true, 
});

// ==========================================
// API TẠO ĐƠN & XUẤT MÃ QR VNPAY (CẬP NHẬT THEO PRODUCT VARIANT)
// ==========================================
app.post("/api/create-qr", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, Name, Phone, Adress, payment_method, voucher_code, voucher_value } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });
    }

    let subTotal = 0;
    const orderItemsData = []; 

    for (let item of items) {
      const variant = await ProductVariantModel.findById(item.variant_id).lean();

      if (!variant || variant.stock_quantity < (item.quantity || item.Quantity)) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${variant ? variant.variant_name : ''} đã hết hàng hoặc không đủ số lượng trong kho!`
        });
      }

      const currentPrice = variant.sale_price > 0 ? variant.sale_price : (variant.price || 0);
      const qty = item.quantity || item.Quantity || 1;
      subTotal += currentPrice * qty;

      orderItemsData.push({
        variant_id: variant._id,
        Quantity: qty,
        price: currentPrice
      });
    }

    // Tính toán Voucher & Phí vận chuyển
    let discount = 0;
    let baseShip = subTotal >= 1000000 ? 0 : 30000;
    let totalAmount = subTotal + baseShip;

    if (voucher_code) {
      const vDoc = await Voucher.findOne({ code: voucher_code });
      if (vDoc && vDoc.end_day >= new Date() && vDoc.used_count < vDoc.usage_limit) {
        const vCalc = calculateVoucherDiscount(vDoc, subTotal, 30000);
        discount = vCalc.totalDiscount;
        totalAmount = vCalc.finalTotal;
      } else if (voucher_value) {
        discount = Number(voucher_value);
        totalAmount = Math.max(0, subTotal - discount) + baseShip;
      }
    } else if (voucher_value) {
      discount = Number(voucher_value);
      totalAmount = Math.max(0, subTotal - discount) + baseShip;
    }


    // ==========================================
    // 2. TẠO HÓA ĐƠN GỐC (BẢNG ORDER)
    // ==========================================
    const orderCode = `WN${moment().format('DDHHmmss')}`;

    const newOrder = await Order.create({
      user_id: userId,
      code: orderCode,
      status: 'pending',
      Name: Name,
      Phone: Phone,
      Adress: Adress, 
      total_amount: totalAmount,
      payment_method: payment_method,
      voucher_code: voucher_code,
      voucher_value: discount,
      payment_status: 'unpaid'
    });

    // ==========================================
    // 3. TẠO CHI TIẾT HÓA ĐƠN (BẢNG ORDER ITEM)
    // ==========================================
    const finalOrderItems = orderItemsData.map(item => ({
      ...item,
      order_id: newOrder._id
    }));

    await OrderItem.insertMany(finalOrderItems);

    // ==========================================
    // 4. TẠO LINK VÀ MÃ QR VNPAY BẰNG THƯ VIỆN
    // ==========================================
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: totalAmount, 
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderCode,
      vnp_OrderInfo: `Thanh toan don hang ${orderCode}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: 'http://localhost:5173/payment-result', // Link FE nhận kết quả
    });

    // Tạo QR Code dạng Base64 từ Link VNPay
    const qrImageBase64 = await QRCode.toDataURL(paymentUrl);

    // ==========================================
    // 5. TRẢ DỮ LIỆU VỀ FRONTEND
    // ==========================================
    return res.status(200).json({
      success: true,
      message: "Tạo đơn và mã QR thành công!",
      qrCode: qrImageBase64,
      paymentUrl: paymentUrl
    });

  } catch (error) {
    console.error("Lỗi tạo QR VNPay:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server, không thể tạo mã QR lúc này" });
  }
});

// Route /products/search đã được chuyển lên trước /products/:slug (line ~917)
// để tránh bị Express match nhầm như một slug.

//api yêu thích sản phẩm
app.post("/favorites/add", checklogin, async (req, res) => {
  try {
    const user_id = req.user._id; 
    const { product_id } = req.body; 

    if (!product_id) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ!" });
    }

    const productExists = await Product.findById(product_id).lean();
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại trên hệ thống!" });
    }

    const existingFavorite = await Favorite.findOne({ user_id: user_id, product_id: product_id });

    if (existingFavorite) {

      await Favorite.deleteOne({ _id: existingFavorite._id });
      
      return res.status(200).json({ 
        success: true, 
        message: "Đã bỏ yêu thích sản phẩm",
        isFavorited: false 
      });
      
    } else {

      await Favorite.create({ 
        user_id: user_id, 
        product_id: product_id 
      });
      
      return res.status(200).json({ 
        success: true, 
        message: "Đã thêm sản phẩm vào danh sách yêu thích",
        isFavorited: true 
      });
    }

  } catch (error) {
    console.error("Lỗi Toggle Favorite:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

app.get("/favorites/list", checklogin, async (req, res) => {
  try {
    const user_id = req.user._id;

    const favoriteProducts = await Favorite.find({ user_id: user_id }).populate('product_id', 'name price images');

    return res.status(200).json({
      success: true,
      message: "Danh sách sản phẩm yêu thích ",
      data: favoriteProducts.map(fav => fav.product_id)
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách yêu thích:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

//chức năng so sánh sản phẩm


app.post("/compare/toggle", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "Thiếu ID sản phẩm!" });
    }

    // 1. Kiểm tra sản phẩm muốn thêm có tồn tại không
    const targetProduct = await ProductModel.findById(product_id).lean();
    if (!targetProduct) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });
    }

    // 2. Kiểm tra xem sản phẩm này đã có trong danh sách so sánh chưa
    const existingItem = await CompareModel.findOne({ user_id: userId, product_id: product_id });

    if (existingItem) {
      // 3a. NẾU ĐÃ CÓ RỒI -> XÓA KHỎI DANH SÁCH SO SÁNH (Toggle Off)
      await CompareModel.deleteOne({ _id: existingItem._id });
      return res.status(200).json({ success: true, message: "Đã xóa khỏi danh sách so sánh." });
    }

    // 3b. NẾU CHƯA CÓ -> TIẾN HÀNH KIỂM TRA ĐIỀU KIỆN ĐỂ THÊM VÀO
    // Lấy danh sách các sản phẩm đang có trong bảng Compare của User này
    // Dùng populate để lấy được thông tin category_id của các sản phẩm đang có
    const currentCompareList = await CompareModel.find({ user_id: userId }).populate('product_id').lean();

    // Luật 1: Chỉ cho phép so sánh tối đa 2 sản phẩm
    if (currentCompareList.length >= 2) {
      return res.status(400).json({ 
        success: false, 
        message: "Danh sách so sánh đã đầy! Vui lòng xóa bớt 1 sản phẩm trước khi thêm mới." 
      });
    }

    // Luật 2: Bắt buộc phải cùng Category (Nếu danh sách đã có 1 sản phẩm)
    if (currentCompareList.length === 1) {
      const existingProduct = currentCompareList[0].product_id;
      
      // So sánh category_id của sản phẩm cũ và sản phẩm mới
      if (existingProduct.category_id?.toString() !== targetProduct.category_id?.toString()) {
        return res.status(400).json({ 
          success: false, 
          message: "Lỗi! Bạn chỉ có thể so sánh 2 sản phẩm thuộc cùng một danh mục." 
        });
      }
    }

    // Vượt qua mọi điều kiện -> Thêm vào Database
    await CompareModel.create({
      user_id: userId,
      product_id: product_id
    });

    return res.status(200).json({ success: true, message: "Đã thêm vào danh sách so sánh!" });

  } catch (error) {
    console.error("Lỗi Toggle Compare:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

//lấy danh sách sản phẩm so sánh của user
app.get("/compare/my-list", checklogin, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Lấy danh sách từ DB
    const compareItems = await CompareModel.find({ user_id: userId }).lean();

    if (!compareItems || compareItems.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Lấy Data Chi tiết của các sản phẩm đó (Tương tự như API Guest)
    const productIds = compareItems.map(item => item.product_id);

    const [products, variants, images] = await Promise.all([
      ProductModel.find({ _id: { $in: productIds } }).lean(),
      ProductVariantModel.find({ p_id: { $in: productIds } }).lean(),
      ImageModel.find({ p_id: { $in: productIds } }).lean()
    ]);

    // 3. Ghép Data lại để Frontend dễ dàng vẽ bảng
    const data = products.map(product => {
      return {
        ...product,
        variants: variants.filter(v => v.p_id?.toString() === product._id.toString()),
        images: images.filter(img => img.p_id?.toString() === product._id.toString())
      };
    });

    return res.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error("Lỗi get compare list:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});


// API Lấy dữ liệu so sánh cho Khách Vãng Lai (Guest)
// FE gọi GET: /api/compare/guest?id1=...&id2=...
app.get("/api/compare/guest", async (req, res) => {
  try {
    const { id1, id2 } = req.query;

    if (!id1 || !id2) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn đủ 2 sản phẩm để so sánh!" });
    }

    if (id1 === id2) {
      return res.status(400).json({ success: false, message: "Bạn đang chọn 2 sản phẩm giống hệt nhau!" });
    }

    // 1. Lấy thông tin gốc của 2 sản phẩm chạy song song
    const [product1, product2] = await Promise.all([
      ProductModel.findById(id1).lean(), 
      ProductModel.findById(id2).lean()
    ]);

    if (!product1 || !product2) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });
    }

    // 2. CHECK LUẬT: Bắt buộc cùng Danh mục (Category)
    // Lưu ý: Đổi "category_id" thành đúng tên cột trong DB của bác
    if (product1.category_id?.toString() !== product2.category_id?.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "Chỉ có thể so sánh 2 sản phẩm cùng một danh mục!" 
      });
    }

    // 3. Gom Data chi tiết (Biến thể, Hình ảnh) bằng Promise.all cực nhanh
    const [variants1, variants2, images1, images2] = await Promise.all([
      ProductVariantModel.find({ p_id: product1._id }).lean(),
      ProductVariantModel.find({ p_id: product2._id }).lean(),
      ImageModel.find({ p_id: product1._id }).lean(),
      ImageModel.find({ p_id: product2._id }).lean()
    ]);

    // Lấy thêm thuộc tính (Màu sắc, Phiên bản) qua Helper nếu bác cần
    // const variantIds1 = variants1.map(v => v._id.toString());
    // ... gọi getVariantAttributeMap(variantIds1)

    // 4. Trả kết quả về cho Frontend kẻ bảng trái/phải
    return res.status(200).json({
      success: true,
      data: {
        product1: {
          ...product1,
          variants: variants1,
          images: images1
        },
        product2: {
          ...product2,
          variants: variants2,
          images: images2
        }
      }
    });

  } catch (error) {
    console.error("Lỗi API compare guest:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server, không thể so sánh lúc này." });
  }
});

// Lấy danh sách linh kiện theo danh mục (có hỗ trợ tìm kiếm theo tên)
app.get("/api/buildpc/components", async (req, res) => {
  try {
    const { category, search } = req.query;
    if (!category) return res.status(400).json({ success: false, message: "Thiếu category slug" });

    const cat = await CategoryModel.findOne({ slug: category });
    if (!cat) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });

    let filter = { cat_id: cat._id };
    // Bỏ qua lọc status theo data hiện tại hoặc nếu cần: filter.status = 'active';
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await ProductModel.find(filter).populate("cat_id brand_id").lean();
    if (products.length === 0) return res.json({ success: true, data: [] });

    const productIds = products.map((p) => p._id);
    const variants = await ProductVariantModel.find({ p_id: { $in: productIds } }).lean();
    const images = await ImageModel.find({ p_id: { $in: productIds } }).lean();

    const variantIds = variants.map((v) => v._id);
    const variantAttrMap = await getVariantAttributeMap(variantIds);

    const variantsWithAttributes = variants.map((variant) => ({
      ...variant,
      Attributes: variantAttrMap[variant._id.toString()] || [],
    }));

    const finalProducts = products.map((product) => ({
      ...product,
      AnhSP: images.filter((img) => img.p_id.toString() === product._id.toString()),
      Variants: variantsWithAttributes.filter((v) => v.p_id.toString() === product._id.toString()),
    }));

    return res.json({ success: true, data: finalProducts });
  } catch (error) {
    console.error("Lỗi api buildpc get components:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Lưu cấu hình Build PC vào DB
app.post("/api/buildpc/save", async (req, res) => {
  try {
    const { total_price, items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cấu hình trống" });
    }

    // 1. Tạo BuildPC
    const newBuild = await BuildPC.create({
      summary_price: total_price
    });

    // 2. Tạo BuildItem
    const buildItems = items.map(item => ({
      build_id: newBuild._id,
      name: item.name
    }));

    await BuildItem.insertMany(buildItems);

    return res.json({ success: true, message: "Lưu cấu hình thành công!", build_id: newBuild._id });
  } catch (error) {
    console.error("Lỗi lưu build pc:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// API VOUCHER & USER VOUCHER
// ============================================================

// ------------------------------------------------------------
// 1. API VOUCHER CHUNG
// ------------------------------------------------------------

// Lấy danh sách tất cả voucher
app.get("/api/vouchers", async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    console.error("Lỗi lấy danh sách voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Lấy danh sách voucher còn hiệu lực
app.get("/api/vouchers/valid", async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      start_day: { $lte: now },
      end_day: { $gte: now },
      $expr: { $lt: ["$used_count", "$usage_limit"] },
    }).sort({ createdAt: -1 });
    return res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    console.error("Lỗi lấy danh sách voucher hợp lệ:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Lấy chi tiết 1 voucher theo ID hoặc mã code
app.get("/api/vouchers/:idOrCode", async (req, res) => {
  try {
    const { idOrCode } = req.params;
    let voucher = null;
    if (idOrCode.match(/^[0-9a-fA-F]{24}$/)) {
      voucher = await Voucher.findById(idOrCode);
    }
    if (!voucher) {
      voucher = await Voucher.findOne({ code: idOrCode.toUpperCase() });
    }
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }
    return res.json({ success: true, data: voucher });
  } catch (error) {
    console.error("Lỗi lấy chi tiết voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Tạo voucher mới (Admin)
app.post("/api/vouchers", async (req, res) => {
  try {
    const { code, discount_type, discount_value, start_day, end_day, usage_limit, min_order } = req.body;

    if (!code || !discount_type || discount_value === undefined || !start_day || !end_day || usage_limit === undefined) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    if (!["percent", "fixed"].includes(discount_type)) {
      return res.status(400).json({ success: false, message: "discount_type phải là 'percent' hoặc 'fixed'" });
    }

    const existingVoucher = await Voucher.findOne({ code: code.trim().toUpperCase() });
    if (existingVoucher) {
      return res.status(400).json({ success: false, message: "Mã voucher đã tồn tại" });
    }

    const newVoucher = await Voucher.create({
      code: code.trim().toUpperCase(),
      discount_type,
      discount_value: Number(discount_value),
      start_day: new Date(start_day),
      end_day: new Date(end_day),
      usage_limit: Number(usage_limit),
      used_count: 0,
      min_order: Number(min_order || 0),
    });

    return res.status(201).json({ success: true, message: "Tạo voucher thành công", data: newVoucher });
  } catch (error) {
    console.error("Lỗi tạo voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// Cập nhật voucher
app.put("/api/vouchers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.code) updateData.code = updateData.code.trim().toUpperCase();

    const updatedVoucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedVoucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }
    return res.json({ success: true, message: "Cập nhật voucher thành công", data: updatedVoucher });
  } catch (error) {
    console.error("Lỗi cập nhật voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Xóa voucher
app.delete("/api/vouchers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVoucher = await Voucher.findByIdAndDelete(id);
    if (!deletedVoucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }
    return res.json({ success: true, message: "Xóa voucher thành công" });
  } catch (error) {
    console.error("Lỗi xóa voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Áp dụng voucher chung lên biến thể sản phẩm (biến thể sp)
// POST /api/vouchers/apply
// Body: { code, variant_id, quantity }
app.post("/api/vouchers/apply", async (req, res) => {
  try {
    const { code, variant_id, quantity = 1 } = req.body;

    if (!code || !variant_id) {
      return res.status(400).json({ success: false, message: "Thiếu mã code hoặc variant_id" });
    }

    // 1. Kiểm tra tồn tại voucher
    const voucher = await Voucher.findOne({ code: code.trim().toUpperCase() });
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Mã voucher không tồn tại" });
    }

    // 2. Kiểm tra thời gian hiệu lực
    const now = new Date();
    if (now < new Date(voucher.start_day) || now > new Date(voucher.end_day)) {
      return res.status(400).json({ success: false, message: "Mã voucher chưa có hiệu lực hoặc đã hết hạn" });
    }

    // 3. Kiểm tra số lần sử dụng
    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, message: "Mã voucher đã hết lượt sử dụng" });
    }

    // 4. Kiểm tra biến thể sản phẩm
    const variant = await ProductVariantModel.findById(variant_id);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Không tìm thấy biến thể sản phẩm" });
    }

    // 5. Tính giá sản phẩm biến thể (ưu tiên sale_price nếu > 0)
    const unitPrice = variant.sale_price && variant.sale_price > 0 ? variant.sale_price : variant.price;
    const totalVariantPrice = unitPrice * Number(quantity);

    // 6. Kiểm tra giá trị tối thiểu của đơn hàng / biến thể sản phẩm
    if (totalVariantPrice < voucher.min_order) {
      return res.status(400).json({
        success: false,
        message: `Giá trị sản phẩm (${totalVariantPrice.toLocaleString("vi-VN")} đ) chưa đạt mức tối thiểu áp dụng mã (${voucher.min_order.toLocaleString("vi-VN")} đ)`,
      });
    }

    // 7. Xử lý giảm giá theo loại voucher (% hoặc fixed tiền, FRS, SHIP)
    const vCalc = calculateVoucherDiscount(voucher, totalVariantPrice, 30000);
    const discountAmount = vCalc.totalDiscount;
    const finalPrice = vCalc.finalTotal;


    return res.json({
      success: true,
      message: "Áp dụng mã voucher thành công!",
      data: {
        voucher: {
          _id: voucher._id,
          code: voucher.code,
          discount_type: voucher.discount_type,
          discount_value: voucher.discount_value,
          min_order: voucher.min_order,
        },
        variant: {
          _id: variant._id,
          variant_name: variant.variant_name,
          sku: variant.sku,
          unit_price: unitPrice,
          quantity: Number(quantity),
          total_variant_price: totalVariantPrice,
        },
        original_price: totalVariantPrice,
        discount_amount: discountAmount,
        final_price: finalPrice,
      },
    });
  } catch (error) {
    console.error("Lỗi áp dụng voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// ------------------------------------------------------------
// 2. API USER VOUCHER
// ------------------------------------------------------------

// Lưu / Nhận voucher vào ví cá nhân của User
// POST /api/user-vouchers/save
app.post("/api/user-vouchers/save", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.user_id;
    const { voucher_id, code } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu user_id" });
    }

    let voucher = null;
    if (voucher_id) {
      voucher = await Voucher.findById(voucher_id);
    } else if (code) {
      voucher = await Voucher.findOne({ code: code.trim().toUpperCase() });
    }

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Voucher không tồn tại trên hệ thống" });
    }

    // Kiểm tra xem user đã lưu voucher này chưa
    const existingUserVoucher = await UserVoucher.findOne({
      user_id: userId,
      voucher_id: voucher._id,
    });

    if (existingUserVoucher) {
      return res.status(400).json({ success: false, message: "Bạn đã lưu voucher này vào ví rồi" });
    }

    const newUserVoucher = await UserVoucher.create({
      user_id: userId,
      voucher_id: voucher._id,
      is_used: false,
      save_at: new Date(),
    });

    const populated = await UserVoucher.findById(newUserVoucher._id).populate("voucher_id");

    return res.status(201).json({
      success: true,
      message: "Lưu voucher vào ví thành công!",
      data: populated,
    });
  } catch (error) {
    console.error("Lỗi lưu user voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// Lấy danh sách voucher đã lưu của User
// GET /api/user-vouchers/my-vouchers
app.get("/api/user-vouchers/my-vouchers", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.user_id;
    const { is_used } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu user_id" });
    }

    const filter = { user_id: userId };
    if (is_used !== undefined) {
      filter.is_used = is_used === "true";
    }

    const userVouchers = await UserVoucher.find(filter)
      .populate("voucher_id")
      .sort({ save_at: -1 });

    return res.json({
      success: true,
      count: userVouchers.length,
      data: userVouchers,
    });
  } catch (error) {
    console.error("Lỗi lấy ví voucher của user:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Áp dụng User Voucher lên biến thể sản phẩm (BƯỚC KIỂM TRA CHÍNH CHỦ USER)
// POST /api/user-vouchers/apply
app.post("/api/user-vouchers/apply", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.user_id;
    const { code, user_voucher_id, voucher_id, variant_id, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin người dùng (user_id)" });
    }
    if (!variant_id) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin biến thể sản phẩm (variant_id)" });
    }
    if (!code && !user_voucher_id && !voucher_id) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin mã voucher" });
    }

    // BƯỚC 1: KIỂM TRA QUYỀN SỞ HỮU (BƯỚC KIỂM TRA CHÍNH CHỦ USER)
    let targetVoucherId = voucher_id;

    if (code && !targetVoucherId) {
      const vDoc = await Voucher.findOne({ code: code.trim().toUpperCase() });
      if (!vDoc) {
        return res.status(404).json({ success: false, message: "Mã voucher không tồn tại trên hệ thống" });
      }
      targetVoucherId = vDoc._id;
    }

    let userVoucherDoc = null;
    if (user_voucher_id) {
      userVoucherDoc = await UserVoucher.findById(user_voucher_id).populate("voucher_id");
    } else if (targetVoucherId) {
      userVoucherDoc = await UserVoucher.findOne({
        user_id: userId,
        voucher_id: targetVoucherId,
      }).populate("voucher_id");
    }

    // Kiểm tra tồn tại trong ví và có phải đúng user đó hay không
    if (!userVoucherDoc || userVoucherDoc.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Voucher này không thuộc ví của bạn hoặc bạn chưa lưu mã này!",
      });
    }

    // Kiểm tra xem user đã sử dụng voucher này chưa
    if (userVoucherDoc.is_used) {
      return res.status(400).json({
        success: false,
        message: "Voucher này đã được bạn sử dụng rồi!",
      });
    }

    const voucher = userVoucherDoc.voucher_id;
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Dữ liệu voucher không tồn tại" });
    }

    // BƯỚC 2: KIỂM TRA HẠN SỬ DỤNG VÀ GIỚI HẠN DÙNG CỦA VOUCHER
    const now = new Date();
    if (now < new Date(voucher.start_day) || now > new Date(voucher.end_day)) {
      return res.status(400).json({ success: false, message: "Voucher đã hết hạn hoặc chưa đến thời gian sử dụng" });
    }

    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, message: "Voucher đã hết lượt sử dụng trên hệ thống" });
    }

    // BƯỚC 3: KIỂM TRA GIÁ BIẾN THỂ SẢN PHẨM & TÍNH TOÁN GIÁ
    const variant = await ProductVariantModel.findById(variant_id);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Không tìm thấy biến thể sản phẩm" });
    }

    const unitPrice = variant.sale_price && variant.sale_price > 0 ? variant.sale_price : variant.price;
    const totalVariantPrice = unitPrice * Number(quantity);

    if (totalVariantPrice < voucher.min_order) {
      return res.status(400).json({
        success: false,
        message: `Mức giá sản phẩm (${totalVariantPrice.toLocaleString("vi-VN")} đ) không đủ điều kiện tối thiểu áp dụng mã (${voucher.min_order.toLocaleString("vi-VN")} đ)`,
      });
    }

    // Tính giá giảm (percent, fixed, FRS, SHIP)
    const vCalc = calculateVoucherDiscount(voucher, totalVariantPrice, 30000);
    const discountAmount = vCalc.totalDiscount;
    const finalPrice = vCalc.finalTotal;


    return res.json({
      success: true,
      message: "Áp dụng user voucher thành công!",
      data: {
        user_voucher: {
          user_voucher_id: userVoucherDoc._id,
          is_used: userVoucherDoc.is_used,
          user_id: userVoucherDoc.user_id,
        },
        voucher: {
          _id: voucher._id,
          code: voucher.code,
          discount_type: voucher.discount_type,
          discount_value: voucher.discount_value,
          min_order: voucher.min_order,
        },
        variant: {
          _id: variant._id,
          variant_name: variant.variant_name,
          sku: variant.sku,
          unit_price: unitPrice,
          quantity: Number(quantity),
          total_variant_price: totalVariantPrice,
        },
        original_price: totalVariantPrice,
        discount_amount: discountAmount,
        final_price: finalPrice,
      },
    });
  } catch (error) {
    console.error("Lỗi áp dụng user voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// Đánh dấu User Voucher đã được sử dụng
// POST /api/user-vouchers/use
app.post("/api/user-vouchers/use", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.user_id;
    const { code, user_voucher_id, voucher_id } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu user_id" });
    }

    let targetVoucherId = voucher_id;
    if (code && !targetVoucherId) {
      const vDoc = await Voucher.findOne({ code: code.trim().toUpperCase() });
      if (!vDoc) {
        return res.status(404).json({ success: false, message: "Mã voucher không tồn tại" });
      }
      targetVoucherId = vDoc._id;
    }

    let userVoucherDoc = null;
    if (user_voucher_id) {
      userVoucherDoc = await UserVoucher.findById(user_voucher_id);
    } else if (targetVoucherId) {
      userVoucherDoc = await UserVoucher.findOne({
        user_id: userId,
        voucher_id: targetVoucherId,
      });
    }

    if (!userVoucherDoc || userVoucherDoc.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Voucher này không thuộc ví của bạn" });
    }

    if (userVoucherDoc.is_used) {
      return res.status(400).json({ success: false, message: "Voucher đã được sử dụng trước đó" });
    }

    userVoucherDoc.is_used = true;
    await userVoucherDoc.save();

    // Tăng used_count của Voucher tương ứng
    await Voucher.findByIdAndUpdate(userVoucherDoc.voucher_id, { $inc: { used_count: 1 } });

    return res.json({
      success: true,
      message: "Đã sử dụng voucher thành công!",
      data: userVoucherDoc,
    });
  } catch (error) {
    console.error("Lỗi đánh dấu sử dụng user voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// ============================================================
// API REVIEW (ĐÁNH GIÁ SẢN PHẨM)
// ============================================================

// Helper function xử lý lấy danh sách / lọc review theo order_item_id và/hoặc user_id
async function handleGetReviews(req, res) {
  try {
    // 1. Hứng id_oderitems (order_item_id) và user_id từ FE gửi lên (hỗ trợ nhiều định dạng field name)
    const order_item_id =
      req.body.order_item_id ||
      req.body.orderItemId ||
      req.body.id_oderitems ||
      req.body.id_orderitem;
    const user_id =
      req.body.user_id ||
      req.body.userId ||
      (req.user ? req.user._id : null);

    let query = {};

    // Nếu FE gửi ID OrderItem lên
    if (order_item_id) {
      if (!mongoose.Types.ObjectId.isValid(order_item_id)) {
        return res
          .status(400)
          .json({ success: false, message: "ID OrderItem không hợp lệ" });
      }
      query.id_oderitems = order_item_id;
    }

    // Lọc theo user_id nếu được truyền lên
    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res
          .status(400)
          .json({ success: false, message: "ID User không hợp lệ" });
      }

      // Lấy danh sách các đơn hàng (Order) của user này
      const userOrders = await Order.find({ user_id: user_id }).select("_id");
      const orderIds = userOrders.map((o) => o._id);

      // Lấy danh sách các OrderItem thuộc các đơn hàng đó
      const userOrderItems = await OrderItem.find({
        order_id: { $in: orderIds },
      }).select("_id");
      const userOrderItemIds = userOrderItems.map((item) => item._id);

      if (query.id_oderitems) {
        // Kiểm tra OrderItem có thuộc về user_id này hay không
        const isBelong = userOrderItemIds.some(
          (id) => id.toString() === query.id_oderitems.toString()
        );
        if (!isBelong) {
          return res.status(200).json({
            success: true,
            data: [],
            message: "OrderItem không thuộc về người dùng này",
          });
        }
      } else {
        // Lọc tất cả review của các OrderItem thuộc User
        query.id_oderitems = { $in: userOrderItemIds };
      }
    }

    // 2. Truy suất trong DB lấy ra review của đơn hàng / order item
    const reviews = await Review.find(query)
      .populate({
        path: "id_oderitems",
        populate: [
          {
            path: "order_id",
            populate: { path: "user_id", select: "name email phone avatar" },
          },
          {
            path: "variants_id",
            populate: { path: "p_id", select: "name slug price thumbnail" },
          },
        ],
      })
      .sort({ _id: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đánh giá thành công",
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách review:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server: " + error.message });
  }
}

// POST /reviews/by-order-item — API chính FE gửi ID OrderItem lên hứng và truy xuất review
app.post("/reviews/by-order-item", handleGetReviews);

// POST /reviews/filter — API lọc review theo OrderItem ID và/hoặc User ID
app.post("/reviews/filter", handleGetReviews);

// POST /reviews — API vừa hỗ trợ tạo mới review, vừa hỗ trợ lấy/lọc review nếu FE gọi POST /reviews
app.post("/reviews", async (req, res, next) => {
  const { content, star_number } = req.body;
  // Nếu không truyền content hoặc star_number => FE dùng POST /reviews để lấy danh sách review
  if (!content || star_number === undefined) {
    return handleGetReviews(req, res);
  }

  // Nếu truyền content & star_number => tạo mới review
  try {
    const order_item_id =
      req.body.order_item_id ||
      req.body.orderItemId ||
      req.body.id_oderitems ||
      req.body.id_orderitem;

    if (!order_item_id || !mongoose.Types.ObjectId.isValid(order_item_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu hoặc ID OrderItem không hợp lệ" });
    }

    if (star_number < 1 || star_number > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Số sao đánh giá phải từ 1 đến 5" });
    }

    // Kiểm tra OrderItem có tồn tại không
    const orderItem = await OrderItem.findById(order_item_id);
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy chi tiết đơn hàng (OrderItem)" });
    }

    // Kiểm tra nếu đã review order item này rồi
    const existingReview = await Review.findOne({ id_oderitems: order_item_id });
    if (existingReview) {
      return res
        .status(409)
        .json({ success: false, message: "Sản phẩm trong đơn hàng này đã được đánh giá rồi!" });
    }

    const newReview = new Review({
      id_oderitems: order_item_id,
      content,
      star_number: Number(star_number),
    });

    const savedReview = await newReview.save();
    return res.status(201).json({
      success: true,
      message: "Tạo đánh giá thành công",
      data: savedReview,
    });
  } catch (error) {
    console.error("Lỗi tạo review:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server: " + error.message });
  }
});

// ============================================================
// AI CHATBOT ROUTER
// ============================================================
app.use("/api/chatbot", require("./routers/AI_chatbot"));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  fixCartItemsInDB();
});

