import { Routes, Route, Navigate } from 'react-router-dom'
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
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import BuildPC from './pages/BuildPC'
import GuestGuard from './components/GuestGuard'
import AdminLayout from './admin/layouts/AdminLayout'
import Dashboard from './admin/pages/Dashboard'
import Products from './admin/pages/Products'
import Categories from './admin/pages/Categories'
import Orders from './admin/pages/Orders'
import Customers from './admin/pages/Customers'
import Reviews from './admin/pages/Reviews'
import Promotions from './admin/pages/Promotions'
import Reports from './admin/pages/Reports'
import Settings from './admin/pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cpu" element={<CPU />} />
      <Route path="/gpu" element={<GPU />} />
      <Route path="/ram" element={<RAM />} />
      <Route path="/storage" element={<SSD />} />
      <Route path="/mainboard" element={<Mainboard />} />
      <Route path="/psu" element={<PSU />} />
      <Route path="/cooling" element={<CategoryPage slug="cooling" title="Tản nhiệt (Cooling)" />} />
      <Route path="/case" element={<Case />} />
      <Route path="/build-pc" element={<BuildPC />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/profile" element={<Profile />} />

      {/* Auth routes — bọc GuestGuard: đã đăng nhập rồi sẽ bị đá về trang chủ */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<GuestGuard><Auth /></GuestGuard>} />
      <Route path="/register" element={<GuestGuard><Auth /></GuestGuard>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
  
}

export default App
