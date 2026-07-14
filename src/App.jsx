// ================== App.jsx ==================

import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import api from "./Api";

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const CategoryProductsPage = lazy(() => import('./pages/CategoryProductsPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ForgetPassword = lazy(() => import('./pages/ForgetPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Reg = lazy(() => import('./pages/Reg'));
const Profile = lazy(() => import('./pages/Profile'));
const Logout = lazy(() => import('./pages/Logout'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const OrdersList = lazy(() => import('./pages/OrdersList'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Checkout2 = lazy(() => import('./pages/Checkout2'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Payment = lazy(() => import('./pages/payment'));
const Products = lazy(() => import('./pages/Products'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/AdminOrderDetail'));
const DealOfWeek = lazy(() => import('./pages/Dealofweek'));
const AdminFestivals = lazy(() => import('./pages/Adminfestivals'));
const RecommendedForYou = lazy(() => import('./pages/Recommendedforyou'));
const WishList = lazy(() => import('./pages/WishList'));
const OffersPage = lazy(() => import('./pages/OfferPage'));
const CategoriesPage = lazy(() => import('./pages/Categoriespage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

import { useAuth } from './contexts/AuthContext'; 





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
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', fontWeight: 'bold' }}>Loading...</div>}>
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
    </Suspense>
  );
}