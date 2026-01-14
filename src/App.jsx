import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import MyOrders from './pages/MyOrders';
import Cart from './components/Cart/Cart';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import AdminRoute from './components/Admin/AdminRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import UserManagement from './pages/Admin/UserManagement';
import PaymentSettings from './pages/Admin/PaymentSettings';
import ShippingSettings from './pages/Admin/ShippingSettings';
import PricingSettings from './pages/Admin/PricingSettings';
import ComboManagement from './pages/Admin/ComboManagement';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0D4F4F]"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

import { showAgeVerificationToast } from './components/UI/AgeVerificationToast';
import { useEffect, useState } from 'react';

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Solo mostrar si NO está verificado Y el usuario NO es admin
    const isVerified = localStorage.getItem('ageVerified');
    if (!isVerified && user?.role !== 'admin' && !showBlur) {
      setShowBlur(true);
      showAgeVerificationToast(() => setShowBlur(false));
    }
  }, [user, loading, showBlur]);

  return (
    <>
      <div id="app-content" className={`relative z-0 min-h-screen flex flex-col bg-gray-50 transition-all duration-700 ${showBlur ? 'blur-2xl grayscale-[0.3] pointer-events-none scale-[1.02]' : ''}`}>
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/products" element={<Products />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />



            {/* Payment Routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentPending />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <ProductManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/combos"
              element={
                <AdminRoute>
                  <ComboManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <OrderManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payment-settings"
              element={
                <AdminRoute>
                  <PaymentSettings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/shipping-settings"
              element={
                <AdminRoute>
                  <ShippingSettings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pricing-settings"
              element={
                <AdminRoute>
                  <PricingSettings />
                </AdminRoute>
              }
            />

            {/* 404 - Página no encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 80,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '500px',
          },
          success: {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #0D4F4F 0%, #1E7E7A 100%)',
              color: '#fff',
              border: 'none',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;