import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import CPU from './pages/CPU'
import GPU from './pages/GPU'
import RAM from './pages/RAM'
import SSD from './pages/SSD'
import Mainboard from './pages/Mainboard'
import PSU from './pages/PSU'
import Case from './pages/Case'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import PaymentResult from './pages/PaymentResult'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import BuildPC from './pages/BuildPC'
import GuestGuard from './components/GuestGuard'
import AdminLayout from './admin/layouts/AdminLayout'
import Dashboard from './admin/pages/Dashboard'
import Products from './admin/pages/Products'
import Categories from './admin/pages/Categories'
import Banners from './admin/pages/Banners'
import AdminFlashSale from './admin/pages/FlashSale'
import Orders from './admin/pages/Orders'
import Customers from './admin/pages/Customers'
import Reviews from './admin/pages/Reviews'
import Promotions from './admin/pages/Promotions'
import Reports from './admin/pages/Reports'
import Settings from './admin/pages/Settings'
import Blog from './pages/Blog'
import BlogPostDetail from './pages/BlogPostDetail'
import AdminPosts from './admin/pages/Posts'
import Contact from './pages/Contact'
import Compare from './pages/Compare'
import UuDai from './pages/UuDai'
import ViVoucherCuaToi from './pages/ViVoucherCuaToi'

import IntroPage from './pages/IntroPage'
import AdminGuard from './admin/components/AdminGuard'

function App() {
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cpu" element={<CPU />} />
        <Route path="/gpu" element={<GPU />} />
        <Route path="/products" element={<CategoryPage slug="all" title="Tất cả sản phẩm" />} />
        <Route path="/categories" element={<CategoryPage slug="all" title="Tất cả sản phẩm" />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/pc-gaming" element={<CategoryPage slug="pc-gaming" title="PC Gaming Trọn Bộ" />} />
        <Route path="/pc-do-hoa" element={<CategoryPage slug="pc-do-hoa" title="PC Đồ Họa - Render 3D - Workstation" />} />
        <Route path="/pc-van-phong" element={<CategoryPage slug="pc-van-phong" title="PC Văn Phòng - Doanh Nghiệp" />} />
        <Route path="/man-hinh" element={<CategoryPage slug="man-hinh" title="Màn Hình Máy Tính" />} />
        <Route path="/ban-phim" element={<CategoryPage slug="ban-phim" title="Bàn Phím Cơ Gaming" />} />
        <Route path="/chuot-gaming" element={<CategoryPage slug="chuot-gaming" title="Chuột Chơi Game" />} />
        <Route path="/tai-nghe" element={<CategoryPage slug="tai-nghe" title="Tai Nghe Gaming" />} />
        <Route path="/extra" element={<CategoryPage slug="extra" title="Phụ Kiện PC & Gaming Gear" />} />
        <Route path="/ram" element={<RAM />} />
        <Route path="/storage" element={<SSD />} />
        <Route path="/mainboard" element={<Mainboard />} />
        <Route path="/psu" element={<PSU />} />
        <Route path="/cooling" element={<CategoryPage slug="cooling" title="Tản nhiệt (Cooling)" />} />
        <Route path="/case" element={<Case />} />
        <Route path="/build-pc" element={<BuildPC />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/uu-dai" element={<UuDai />} />
        <Route path="/vouchers" element={<UuDai />} />
        <Route path="/tai-khoan/voucher-cua-toi" element={<ViVoucherCuaToi />} />

        {/* Auth routes */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<GuestGuard><Auth /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><Auth /></GuestGuard>} />

        {/* Admin Routes (Chỉ dành cho Admin) */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="banners" element={<Banners />} />
          <Route path="flash-sale" element={<AdminFlashSale />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
