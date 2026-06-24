const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const cors = require("cors");

var app = express();
var port = 3000;
const passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;

const bcrypt = require("bcrypt");
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
const path = require("path");

var cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
var session = require("express-session");

var fs = require("fs");
var cert = fs.readFileSync("./key/publickey.crt");
var privatekey = fs.readFileSync("./key/privatekey.pem");

connectDB();

// CORS — cho phép FE (localhost:5173) gọi API
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true  // bắt buộc để cookie hoạt động
}));

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
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu xác nhận không khớp" });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email: email }, { phone: phone }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ success: false, message: "Email này đã được sử dụng" });
      }
      if (existingUser.phone === phone) {
        return res.status(409).json({ success: false, message: "Số điện thoại này đã được sử dụng" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      phone: phone,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const payload = { _id: savedUser._id };
    const token = jwt.sign(payload, privatekey, { algorithm: "RS256", expiresIn: '1y' });

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
    return res.status(500).json({ success: false, message: "Lỗi server trong quá trình đăng ký" });
  }
});

// ============================================================
// POST /login
// ============================================================
passport.use(new LocalStrategy(
  {
    usernameField: 'email',   // Khai báo web mình dùng 'email' làm tài khoản
    passwordField: 'password' // Khai báo trường chứa mật khẩu
  },
  async function (email, password, done) {
    try {
      // 1. Chui vào DB tìm xem có user nào khớp email không
      const user = await UserModel.findOne({ email: email });

      // Nếu không tìm thấy
      if (!user) {
        return done(null, false, { message: 'Tài khoản không tồn tại!' });
      }

      // 2. So sánh mật khẩu bằng bcrypt (vì đăng ký đã hash password)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Mật khẩu không chính xác!' });
      }

      // 3. Kiểm tra xem tài khoản có bị khóa không (Dựa theo ERD)
      if (user.status !== 'active') {
        return done(null, false, { message: 'Tài khoản đã bị khóa!' });
      }

      // 4. Nếu mọi thứ xanh chín, ném user vào hàm done để đi tiếp sang API /login
      return done(null, user);

    } catch (err) {
      return done(err);
    }
  }
));

app.post("/login", function (req, res, next) {
  passport.authenticate("local", { session: false }, function (err, user, info) {
    if (err) return res.status(500).json({ success: false, message: "Lỗi server" });
    if (!user) return res.status(401).json({ success: false, message: info?.message || "Tài khoản hoặc mật khẩu không hợp lệ" });

    if (req.cookies && req.cookies.token) {
      return res.status(400).json({
        success: false,
        message: "đã đăng nhập rồi, nếu muốn đăng nhập lại thì hãy đăng xuất trước",
        already_logged_in: true
      });
    }

    req.user = user;
    const payload = { _id: user._id };

    try {
      const token = jwt.sign(payload, privatekey, { algorithm: "RS256", expiresIn: '1y' });
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Nếu web chạy HTTPS thì đổi thành true
        maxAge: 365 * 12 * 30 * 24 * 60 * 60 * 1000, // 1 năm
      });
      return res.status(200).json({ success: true, message: "Đăng nhập thành công" });
    }
    catch (jwtErr) {
      return res.status(500).json("Lỗi quá trình ký token");
    }
  })(req, res, next);
});

app.get("/logout", function (req, res) {
  res.clearCookie("token");
  return res.status(200).json({ success: true, message: "Đăng xuất thành công" });
});

// ============================================================
// GET /profile
// ============================================================

app.get("/profile", checklogin, async (req, res) => {
  try {


    return res.status(200).json({
      success: true,
      message: "Lấy thông tin profile thành công",
      user: req.user // Quăng thẳng cục data xịn (đã giấu pass) về cho FE
    });

  } catch (error) {
    console.log("Lỗi API Profile:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server"
    });
  }
}); // Nãy bác copy thiếu cái dấu đóng ngoặc này nhé =)))

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
      user: req.user
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
      .limit()
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

// ============================================================
// GET /products/:slug — chi tiết sản phẩm theo slug
// FIX:
//   - Bỏ Attribute.find({ id_variants }) — field này không còn tồn tại
//   - Bỏ logic filter attr.id_variants (không còn field này trong Attribute)
//   - Dùng getVariantAttributeMap()
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
// Không thay đổi logic, chỉ giữ nguyên
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

    return res.json({ success: true, data: { category, products: finalProducts } });
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

    // Kiểm tra token — login thì lưu DB, chưa login thì trả về FE tự lưu
    let u_id = null;
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1];
        const verify = jwt.verify(token, cert, { algorithms: ["RS256"] });
        u_id = verify._id;
      } catch (err) {
        console.log("Token lỗi hoặc hết hạn, coi như khách vãng lai (Guest)");
      }
    }

    if (u_id) {
      // Đã login — lưu vào DB
      let existingCart = await CartItemModel.findOne({ u_id, variant_id });

      if (existingCart) {
        existingCart.quantity += parseInt(quantity);
        existingCart.price = currentPrice;
        await existingCart.save();
      } else {
        await CartItemModel.create({
          u_id,
          variant_id,
          quantity,
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

    const cartItem = await CartItemModel.findOneAndUpdate(
      { _id: cartItemId, u_id: req.user._id },
      { quantity: parseInt(quantity) },
      { new: true },
    );

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

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
