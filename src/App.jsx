// ================== App.jsx ==================

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import api from "./Api";
import Home from './pages/Home';
import OrderSuccess from "./pages/OrderSuccess";
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import CategoryProductsPage from './pages/CategoryProductsPage';
import SearchResults from "./pages/SearchResults";
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Reg from './pages/Reg';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import ChangePassword from './pages/ChangePassword';
import OrdersList from './pages/OrdersList';
import OrderDetails from './pages/OrderDetails';
import Checkout2 from './pages/Checkout2';
import AuthSuccess from './pages/AuthSuccess';
import AdminLogin from './pages/AdminLogin';
import Payment from './pages/payment';
import Products from './pages/Products';

// Admin pages
import AdminLayout from './pages/AdminLayout';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import DealOfWeek from './pages/Dealofweek';
import AdminFestivals from './pages/Adminfestivals';
import RecommendedForYou from './pages/Recommendedforyou';
import WishList from './pages/WishList';
import OffersPage from './pages/OfferPage';
import CategoriesPage from './pages/Categoriespage';
import { Contact } from 'lucide-react';
import ContactPage from './pages/ContactPage';






function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search]);
  return null;
}

export default function App() {

  /* ── Token refresh + heartbeat ── */
 const { user } = useAuth();

useEffect(() => {
  if (!user) return;

  const refreshToken = async () => {
    try {
      await api.post("/refresh-token");
    } catch (err) {
      console.error(err);
    }
  };

  const heartbeat = async () => {
    try {
      await api.post("/heartbeat");
    } catch (err) {
      console.error(err);
    }
  };

  refreshToken();
  heartbeat();

  const refreshInterval = setInterval(refreshToken, 120000);
  const heartbeatInterval = setInterval(heartbeat, 20000);

  return () => {
    clearInterval(refreshInterval);
    clearInterval(heartbeatInterval);
  };
}, [user]);

  return (
    <Routes>

      {/* ════════════════════════════════════════════════════════════════════
          ADMIN ROUTES  — no SideDock, full-width dark layout
      ════════════════════════════════════════════════════════════════════ */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<AdminLayout />}>
                  <Route path="products"   element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="users"      element={<AdminUsers />} />
                  <Route path="orders"     element={<AdminOrders />} />
                  <Route path="deals"      element={<DealOfWeek />} />
                  <Route path="festivals"  element={<AdminFestivals />} />
                </Route>
                <Route path="orders/:id" element={<AdminOrderDetail />} />
              </Routes>
            </div>
          </div>
        </ProtectedRoute>
      } />

      

      <Route path="/*" element={
        <div style={{ minHeight: '100vh'}}>
         
          
        
             <Navbar />
         

            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/"                element={<Home />} />
                <Route path="/product/:id"     element={<ProductPage />} />
                <Route path="/cart"            element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/login"           element={<Login />} />
                <Route path="/logout"          element={<ProtectedRoute><Logout /></ProtectedRoute>} />
                <Route path="/search"          element={<SearchResults />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/reset-password"  element={<ResetPassword />} />
                <Route path="/register"        element={<Reg />} />
                <Route path="/profile-view"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/category/:id"    element={<CategoryProductsPage />} />
                <Route path="/my-order"        element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
                <Route path="/orders/:id"      element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                <Route path="/order-success"   element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/checkout2"       element={<ProtectedRoute><Checkout2 /></ProtectedRoute>} />
                <Route path="/auth/success"    element={<AuthSuccess />} />
                <Route path="/auth/admin"      element={<AdminLogin />} />
                <Route path="/products"        element={<Products />} />
                <Route path="/categories"      element={<CategoriesPage />} />
                <Route path="/checkout"        element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/payment"         element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                <Route path="/wishlist"        element={<ProtectedRoute><WishList /></ProtectedRoute>} />
                <Route path="/offers"          element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />
                <Route path="/recommended"     element={<RecommendedForYou />} />
                <Route path='/contact'          element = {<ContactPage />}/>
                <Route path="*"               element={
                  <div style={{ padding: '80px 40px', textAlign: 'center', color: '#64748b', fontSize: 18, fontWeight: 600 }}>
                    404 — Page Not Found
                  </div>
                } />
              </Routes>
            </main>

            <Footer />
          </div>
        
      } />

    </Routes>
  );
}