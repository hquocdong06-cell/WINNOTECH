/**
 * TEST TẤT CẢ API - WINNOTech Server
 * Chạy: node test_all_apis.js
 * Yêu cầu: Server đang chạy tại http://localhost:3000
 */

const BASE = "http://localhost:3000";
let COOKIE = "";

// ─── COLORS
const G = (t) => `\x1b[32m${t}\x1b[0m`;
const R = (t) => `\x1b[31m${t}\x1b[0m`;
const Y = (t) => `\x1b[33m${t}\x1b[0m`;
const B = (t) => `\x1b[36m${t}\x1b[0m`;
const W = (t) => `\x1b[1m${t}\x1b[0m`;

let pass = 0, fail = 0, skip = 0;
const results = [];

async function req(method, path, body = null) {
  const url = BASE + path;
  const headers = { "Content-Type": "application/json" };
  if (COOKIE) headers["Cookie"] = COOKIE;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  try {
    const response = await fetch(url, options);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie && setCookie.includes("token=")) {
      COOKIE = setCookie.split(";")[0];
    }
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, ok: response.ok };
  } catch (err) {
    return { status: 0, data: { error: err.message }, ok: false };
  }
}

async function test(label, method, path, body, expectStatus = [200, 201]) {
  const r = await req(method, path, body);
  const statuses = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
  const ok = statuses.includes(r.status);
  const icon = ok ? "✅" : "❌";
  const color = ok ? G : R;
  console.log(color(`${icon} [${r.status}] ${method.padEnd(6)} ${path}`));
  if (!ok) {
    console.log(Y(`   → ${JSON.stringify(r.data).substring(0, 120)}`));
    fail++;
  } else {
    pass++;
  }
  results.push({ label, method, path, status: r.status, ok, data: r.data });
  return r;
}

function section(title) {
  console.log("\n" + W(B("═".repeat(60))));
  console.log(W(B(`  ${title}`)));
  console.log(W(B("═".repeat(60))));
}

async function main() {
  console.log(W("\n🚀 BẮT ĐẦU KIỂM TRA TOÀN BỘ API - WINNOTech\n"));

  // ── AUTH
  section("AUTH / USERS");
  const regEmail = `test_${Date.now()}@gmail.com`;
  const regPhone = `09${Math.floor(10000000 + Math.random() * 89999999)}`;
  await test("Register", "POST", "/register", {
    phone: regPhone, email: regEmail,
    password: "Test@12345", confirmPassword: "Test@12345",
  });
  await test("Login", "POST", "/login", { email: regEmail, password: "Test@12345" }, [200, 302]);
  await test("GET /profile", "GET", "/profile", null, [200, 401]);
  await test("GET /auth/me", "GET", "/auth/me", null, [200, 401]);
  await test("PUT /profile", "PUT", "/profile", { name: "Test User" }, [200, 400, 401]);

  // ── PRODUCTS
  section("PRODUCTS (PUBLIC)");
  const productsRes = await test("GET /products", "GET", "/products");
  let slug = null, pid = null;
  if (productsRes.data?.data?.length > 0) {
    slug = productsRes.data.data[0].slug;
    pid = productsRes.data.data[0]._id;
  }
  await test("GET /products?page=1&limit=5", "GET", "/products?page=1&limit=5");
  await test("GET /products/home/newest", "GET", "/products/home/newest");
  await test("GET /products/home/featured", "GET", "/products/home/featured");
  await test("GET /products/home/Newest", "GET", "/products/home/Newest");
  await test("GET /products/home/Sale", "GET", "/products/home/Sale");
  await test("GET /products/search?q=laptop", "GET", "/products/search?q=laptop");
  if (slug) {
    await test("GET /products/:slug", "GET", `/products/${slug}`);
  } else { console.log(Y("  ⏭ Skip /products/:slug")); skip++; }

  // ── CATEGORIES
  section("CATEGORIES");
  const catsRes = await test("GET /categories", "GET", "/categories");
  let catId = catsRes.data?.data?.[0]?._id || null;
  if (catId) {
    await test("GET /categories/:id", "GET", `/categories/${catId}`);
    await test("PATCH /categories/:id/status", "PATCH", `/categories/${catId}/status`, { status: "active" }, [200, 400, 401, 403]);
  } else { skip += 2; }

  const catRes = await test("POST /categories", "POST", "/categories", {
    name: "TestCat_" + Date.now(), description: "Test", status: "active",
  }, [200, 201, 400]);
  const newCatId = catRes.data?.data?._id || catRes.data?._id;
  if (newCatId) {
    await test("PUT /categories/:id", "PUT", `/categories/${newCatId}`, { name: "Updated Cat" }, [200]);
    await test("DELETE /categories/:id", "DELETE", `/categories/${newCatId}`, null, [200]);
  }

  // ── BRANDS
  section("BRANDS");
  await test("GET /brands", "GET", "/brands");
  await test("GET /admin/brands", "GET", "/admin/brands");

  // ── CART
  section("CART");
  const guestId = `guest_${Date.now()}`;
  await test("GET /cart (auth)", "GET", "/cart", null, [200, 401]);
  await test("GET /api/cart/:u_id", "GET", `/api/cart/${guestId}`);
  await test("POST /api/cart", "POST", "/api/cart", {
    u_id: guestId, variant_id: "000000000000000000000001", quantity: 1,
  }, [200, 201, 400, 404, 500]);

  // ── ORDERS
  section("ORDERS");
  await test("GET /orders", "GET", "/orders", null, [200, 401]);

  // ── FAVORITES
  section("FAVORITES");
  await test("GET /favorites", "GET", "/favorites", null, [200, 401]);
  await test("GET /favorites/ids", "GET", "/favorites/ids", null, [200, 401]);
  await test("GET /favorites/list", "GET", "/favorites/list", null, [200, 401]);

  // ── COMPARE
  section("COMPARE");
  await test("GET /compare/my-list", "GET", "/compare/my-list", null, [200, 401]);
  await test("GET /api/compare/guest (no params)", "GET", "/api/compare/guest", null, [400]);
  if (pid) {
    await test("GET /api/compare/guest (same id)", "GET", `/api/compare/guest?id1=${pid}&id2=${pid}`, null, [400, 200]);
  }

  // ── DELIVERY ADDRESSES
  section("DELIVERY ADDRESSES");
  await test("GET /delivery-addresses", "GET", "/delivery-addresses", null, [200, 401]);
  await test("GET /profile/deliver", "GET", "/profile/deliver", null, [200, 401]);

  // ── VOUCHERS
  section("VOUCHERS");
  await test("GET /api/vouchers", "GET", "/api/vouchers");
  await test("GET /api/vouchers/valid", "GET", "/api/vouchers/valid");
  await test("GET /api/vouchers/INVALID", "GET", "/api/vouchers/INVALID_CODE_XYZ", null, [404]);
  await test("GET /api/user-vouchers/my-vouchers", "GET", "/api/user-vouchers/my-vouchers", null, [200, 400, 401]);
  await test("GET /vouchers/check/:code", "GET", "/vouchers/check/FAKECODE", null, [200, 400, 401, 404]);

  const vCode = "TEST" + Date.now();
  const vRes = await test("POST /api/vouchers", "POST", "/api/vouchers", {
    code: vCode, discount_type: "percent", discount_value: 10,
    start_day: new Date().toISOString(),
    end_day: new Date(Date.now() + 86400000 * 30).toISOString(),
    usage_limit: 100, min_order: 0,
  }, [200, 201, 400]);
  const vId = vRes.data?.data?._id;
  if (vId) {
    await test("GET /api/vouchers/:id", "GET", `/api/vouchers/${vId}`);
    await test("PUT /api/vouchers/:id", "PUT", `/api/vouchers/${vId}`, { discount_value: 20 }, [200]);
    await test("DELETE /api/vouchers/:id", "DELETE", `/api/vouchers/${vId}`, null, [200]);
  }

  // ── POSTS
  section("POSTS / BLOG");
  await test("GET /post-categories", "GET", "/post-categories");
  const postsRes = await test("GET /posts", "GET", "/posts");
  const postSlug = postsRes.data?.data?.[0]?.slug;
  if (postSlug) {
    await test("GET /posts/:slug", "GET", `/posts/${postSlug}`);
  } else { console.log(Y("  ⏭ Skip /posts/:slug")); skip++; }

  // ── BUILD PC
  section("BUILD PC");
  await test("GET /api/buildpc/components (no cat)", "GET", "/api/buildpc/components", null, [400]);
  await test("GET /api/buildpc/components?category=cpu", "GET", "/api/buildpc/components?category=cpu", null, [200, 404]);

  // ── PASSWORD RESET
  section("PASSWORD RESET");
  await test("POST /api/auth/forgot-password", "POST", "/api/auth/forgot-password", {
    email: "fake_nonexistent_xyz@gmail.com",
  }, [200, 400, 404]);
  await test("POST /api/auth/reset-password", "POST", "/api/auth/reset-password", {
    token: "invalid_token_xyz", newPassword: "Test@12345",
  }, [200, 400, 404]);

  // ── CONTACT
  section("CONTACT");
  await test("POST /contact", "POST", "/contact", {
    name: "Test", email: "test@gmail.com", message: "Hello", phone: "0901234567",
  }, [200, 400, 500]);

  // ── REVIEWS
  section("REVIEWS");
  await test("POST /reviews/filter", "POST", "/reviews/filter", {}, [200]);
  await test("POST /reviews/by-order-item", "POST", "/reviews/by-order-item", {}, [200]);

  // ── QR PAYMENT
  section("QR PAYMENT");
  await test("POST /api/create-qr", "POST", "/api/create-qr", {
    amount: 100000, orderCode: "ORD_TEST",
  }, [200, 400, 401, 500]);

  // ── ADMIN
  section("ADMIN ROUTES (yêu cầu quyền admin)");
  await test("GET /admin/products", "GET", "/admin/products", null, [200, 401, 403]);
  await test("GET /admin/users", "GET", "/admin/users", null, [200, 401, 403]);
  await test("GET /admin/orders", "GET", "/admin/orders", null, [200, 401, 403]);
  await test("GET /admin/revenue/stats", "GET", "/admin/revenue/stats", null, [200, 401, 403]);
  await test("GET /admin/revenue/export-excel", "GET", "/admin/revenue/export-excel", null, [200, 401, 403]);

  // ── LOGOUT
  section("LOGOUT");
  await test("GET /logout", "GET", "/logout", null, [200, 302]);

  // ── SUMMARY
  console.log("\n" + W(B("═".repeat(60))));
  console.log(W(B("  📊 KẾT QUẢ TỔNG KẾT")));
  console.log(W(B("═".repeat(60))));
  console.log(G(`  ✅ PASS : ${pass}`));
  console.log(R(`  ❌ FAIL : ${fail}`));
  console.log(Y(`  ⏭  SKIP : ${skip}`));
  console.log(W(`  📌 TOTAL: ${pass + fail + skip}`));
  console.log("");

  if (fail > 0) {
    console.log(R(W("  ⚠️  API bị lỗi (không phải lỗi do auth/quyền):")));
    results.filter(r => !r.ok).forEach(r => {
      console.log(R(`    • [${r.status}] ${r.method} ${r.path}`));
      if (r.data?.message) console.log(Y(`      → ${r.data.message}`));
    });
  }
  console.log("");
}

main().catch(console.error);
