const express = require("express");
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
const path = require("path");
const multer = require("multer");
const {VNPay, ignoreLogger, ProductCode, VnpLocate, dataFormat} = require("vnpay");
const QRCode = require('qrcode');
const moment = require('moment');

// ============================================================
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
app.use(passport.initialize());
app.use("/public", express.static(path.join(__dirname, "/public")));
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
          .json({ success: true, message: "Đăng nhập thành công" });
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
// GET /products/:slug — chi tiết sản phẩm theo slug
// ============================================================
app.get("/products/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const productDetail = await ProductModel.findOne({ slug })
      .populate("cat_id brand_id")
      .lean();

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
    const category = await CategoryModel.findOne({ slug });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    const products = await ProductModel.find({ cat_id: category._id })
      .populate("cat_id brand_id")
      .lean();

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục này chưa có sản phẩm nào" });
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
        u_id = verify._id;
      } catch (err) {
        console.log("Token lỗi hoặc hết hạn, coi như khách vãng lai (Guest)");
      }
    }

    if (u_id) {
      // Đã login — lưu vào DB
      let existingCart = await CartItemModel.findOne({ u_id, variant_id });

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
    const u_id = req.user._id;

    const cartItems = await CartItemModel.find({ u_id }).lean();
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

    const cartItem = await CartItemModel.findOne({
      _id: cartItemId,
      u_id: req.user._id,
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
    const cartItem = await CartItemModel.findOneAndDelete({
      _id: req.params.cartItemId,
      u_id: req.user._id,
    });

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
    const { Name, Phone, Adress, payment_method, voucher_code, items } =
      req.body;
    // items: [ { variant_id, quantity, price } ]

    if (
      !Name ||
      !Phone ||
      !Adress ||
      !payment_method ||
      !items ||
      items.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin đặt hàng" });
    }

    // Tính tổng tiền
    let total_amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Xử lý voucher nếu có
    let voucher_value = 0;
    if (voucher_code) {
      const voucher = await Voucher.findOne({ code: voucher_code });
      if (
        voucher &&
        voucher.end_day >= new Date() &&
        voucher.used_count < voucher.usage_limit
      ) {
        voucher_value =
          voucher.discount_type === "percent"
            ? (total_amount * voucher.discount_value) / 100
            : voucher.discount_value;

        // Cập nhật used_count
        await Voucher.findByIdAndUpdate(voucher._id, {
          $inc: { used_count: 1 },
        });
        // Đánh dấu UserVoucher là đã dùng
        await UserVoucher.findOneAndUpdate(
          { user_id: req.user._id, voucher_id: voucher._id },
          { is_used: true },
        );
      }
    }

    // Tạo mã đơn hàng
    const code = "ORD-" + Date.now();

    const newOrder = await Order.create({
      user_id: req.user._id,
      code,
      Name,
      Phone,
      Adress,
      total_amount: total_amount - voucher_value,
      payment_method,
      voucher_code: voucher_code || null,
      voucher_value,
      payment_status: "unpaid",
      status: "pending",
    });

    // Tạo OrderItems — FIX: dùng variants_id (đúng ERD), không dùng attribute_value_id
    const orderItemDocs = items.map((item) => ({
      order_id: newOrder._id,
      variants_id: item.variant_id, // FIX: đổi từ attribute_value_id
      Quantity: item.quantity,
      price: item.price,
    }));
    await OrderItem.insertMany(orderItemDocs);

    // Trừ tồn kho
    for (const item of items) {
      await ProductVariantModel.findByIdAndUpdate(item.variant_id, {
        $inc: { stock_quantity: -item.quantity },
      });
    }

    // Xóa CartItem sau khi đặt hàng thành công
    const variantIds = items.map((i) => i.variant_id);
    await CartItemModel.deleteMany({
      u_id: req.user._id,
      variant_id: { $in: variantIds },
    });

    return res
      .status(201)
      .json({ success: true, message: "Đặt hàng thành công", data: newOrder });
  } catch (error) {
    console.log("Lỗi API create order:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /orders — lịch sử đơn hàng của user
// ============================================================
app.get("/orders", checklogin, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .populate("payment_method")
      .sort({ createdAt: -1 })
      .lean();

    // Lấy OrderItems cho tất cả đơn hàng
    const orderIds = orders.map((o) => o._id);
    const orderItems = await OrderItem.find({
      order_id: { $in: orderIds },
    }).lean();

    // FIX: lấy variant qua variants_id (đúng ERD)
    const variantIds = [
      ...new Set(orderItems.map((oi) => oi.variants_id.toString())),
    ];
    const variants = await ProductVariantModel.find({
      _id: { $in: variantIds },
    }).lean();
    const productIds = [...new Set(variants.map((v) => v.p_id.toString()))];
    const products = await ProductModel.find({
      _id: { $in: productIds },
    }).lean();

    const variantMap = {};
    variants.forEach((v) => {
      variantMap[v._id.toString()] = v;
    });

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const data = orders.map((order) => {
      const items = orderItems
        .filter((oi) => oi.order_id.toString() === order._id.toString())
        .map((oi) => {
          const variant = variantMap[oi.variants_id.toString()];
          const product = variant ? productMap[variant.p_id.toString()] : null;
          return { ...oi, variant: variant || null, product: product || null };
        });
      return { ...order, items };
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.log("Lỗi API get orders:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// GET /orders/:orderId — chi tiết đơn hàng
// ============================================================
app.get("/orders/:orderId", checklogin, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id,
    })
      .populate("payment_method")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    // FIX: OrderItem dùng variants_id (đúng ERD)
    const orderItems = await OrderItem.find({ order_id: order._id }).lean();
    const variantIds = orderItems.map((oi) => oi.variants_id);
    const variants = await ProductVariantModel.find({
      _id: { $in: variantIds },
    }).lean();
    const productIds = variants.map((v) => v.p_id);
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

    const items = orderItems.map((oi) => {
      const variant = variantMap[oi.variants_id.toString()];
      const product = variant ? productMap[variant.p_id.toString()] : null;
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
          ? images.filter(
              (img) => img.p_id.toString() === product._id.toString(),
            )
          : [],
      };
    });

    return res.json({ success: true, data: { ...order, items } });
  } catch (error) {
    console.log("Lỗi API get order detail:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ============================================================
// POST /reviews — đăng review cho order item
// FIX: Review.id_oderitems ref OrderItem (đúng ERD)
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
    const cartItems = await CartItemModel.find({ u_id })
      .populate("variant_id")
      .lean();
    return res.json({ success: true, data: cartItems });
  } catch (error) {
    console.error("Lỗi get cart:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
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
// POST /categories — tạo danh mục mới
// ============================================================
app.post("/categories", async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên danh mục" });
    }
    let slug = slugify(name);
    let uniqueSlug = slug;
    let count = 1;
    while (await CategoryModel.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${count}`;
      count++;
    }
    const newCat = await CategoryModel.create({
      name,
      slug: uniqueSlug,
      image: image || "",
      status: "active",
    });
    return res
      .status(201)
      .json({
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
// PUT /categories/:id — cập nhật danh mục
// ============================================================
app.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    const cat = await CategoryModel.findById(id);
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục" });
    }
    if (name) {
      cat.name = name;
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
// DELETE /categories/:id — xóa danh mục
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
    // Kiểm tra còn sản phẩm thuộc danh mục không
    const productCount = await ProductModel.countDocuments({ cat_id: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa! Danh mục này đang chứa ${productCount} sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước.`,
      });
    }
    // Xóa ảnh vật lý nếu là ảnh upload
    if (cat.image && cat.image.startsWith("/public/images/uploads/")) {
      const filePath = path.join(__dirname, cat.image);
      fs.unlink(filePath, () => {});
    }
    await CategoryModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi Server khi xóa danh mục" });
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

// DELETE /admin/posts/:id — Xóa bài viết (Yêu cầu Admin)
app.delete("/admin/posts/:id", checklogin, checkAdmin, async (req, res) => {
  try {
    const deleted = await PostModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });
    }
    return res.json({ success: true, message: "Đã xóa bài viết thành công" });
  } catch (error) {
    console.error("Lỗi DELETE admin posts:", error);
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

// POST /admin/products/:productId/variants — Thêm biến thể mới
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
      const v = await ProductVariantModel.create({
        variant_name,
        price: Number(price) || 0,
        sku,
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

// PUT /admin/variants/:variantId — Cập nhật biến thể
app.put(
  "/admin/variants/:variantId",
  checklogin,
  checkAdmin,
  async (req, res) => {
    try {
      const { variantId } = req.params;
      const { variant_name, price, sku, sale_price, stock_quantity, status } =
        req.body;
      const v = await ProductVariantModel.findByIdAndUpdate(
        variantId,
        {
          variant_name,
          price: Number(price) || 0,
          sku,
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

// DELETE /admin/variants/:variantId — Xóa biến thể
app.delete(
  "/admin/variants/:variantId",
  checklogin,
  checkAdmin,
  async (req, res) => {
    try {
      const { variantId } = req.params;
      const deleted = await ProductVariantModel.findByIdAndDelete(variantId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy biến thể" });
      }
      return res.json({ success: true, message: "Xóa biến thể thành công" });
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

    // ==========================================
    // 1. KIỂM TRA TỒN KHO TRÊN BẢNG PRODUCT VARIANT
    // ==========================================
    let subTotal = 0;
    const orderItemsData = []; 

    for (let item of items) {
      // Tìm biến thể trong bảng ProductVariant (Bác nhớ import Model ProductVariant vào nhé)
      const variant = await ProductVariant.findById(item.variant_id).lean();

      if (!variant || variant.stock < item.Quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${variant ? variant.name : ''} đã hết hàng hoặc không đủ số lượng trong kho!`
        });
      }

      // Tính tiền dựa trên giá của Biến thể (thường biến thể sẽ có giá riêng hoặc lấy giá gốc)
      const currentPrice = variant.price || 0;
      subTotal += currentPrice * item.Quantity;

      // Đẩy vào mảng tạm để chờ Insert vào OrderItem
      orderItemsData.push({
        variant_id: variant._id, 
        Quantity: item.Quantity,
        price: currentPrice
      });
    }

    // Tính toán Voucher
    const discount = voucher_value ? Number(voucher_value) : 0;
    const totalAmount = subTotal - discount > 0 ? subTotal - discount : 0;

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

//api tìm kiếm sản phẩm

app.get("/products/search", async (req, res) => {
  try {
    // 1. Hứng từ khóa từ query url (VD: /products/search?q=figre)
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập từ khóa tìm kiếm!" });
    }

    // 2. Lấy dữ liệu sản phẩm từ DB lên
    // Tối ưu: Bác chỉ select tên, giá, ảnh... để Fuse.js xử lý cho nhanh, không lấy data thừa
    const products = await ProductModel.find({ status: 'active' })
                                     .select('_id name price images')
                                     .lean();

    if (!products || products.length === 0) {
      return res.status(200).json({ success: true, data: [], message: "Không có sản phẩm nào phù hợp!" });
    }

    // 3. Cấu hình bộ lọc tìm kiếm thông minh Fuse.js
    const fuseOptions = {
      keys: [
        "name", // Trường ưu tiên tìm kiếm là tên sản phẩm
        // "description", // Bác có thể mở comment dòng này nếu muốn tìm cả trong mô tả
      ],
      isCaseSensitive: false, // Phân biệt hoa thường: Không
      includeScore: true,     // Bật cái này để xem độ chính xác
      threshold: 0.4,         // Mức độ cho phép sai số (Từ 0.0 đến 1.0). 
                              // 0.0 là phải giống hệt 100%. 0.3 - 0.4 là mức hoàn hảo cho việc gõ sai/thiếu dấu.
    };

    const fuse = new Fuse(products, fuseOptions);

    // 4. Thực hiện tìm kiếm với từ khóa
    const result = fuse.search(q);

    // Fuse.js sẽ trả về một mảng có dạng: [{ item: { _id, name... }, refIndex, score }]
    // Nên mình cần map lại để chỉ lấy cái ruột (item) trả về cho Frontend dễ dùng
    const finalProducts = result.map(match => match.item);

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

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
