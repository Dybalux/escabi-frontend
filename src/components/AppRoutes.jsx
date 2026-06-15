import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Header from './Layout/Header';
import Footer from './Layout/Footer';
import Spinner from './Spinner';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './Admin/AdminRoute';
import MaintenanceScreen from './MaintenanceScreen';
import useMaintenanceMode from '../hooks/useMaintenanceMode';
import useAgeVerification from '../hooks/useAgeVerification';

// Lazy-loaded page components — spec AR-1
const Home = React.lazy(() => import('../pages/Home'));
const Login = React.lazy(() => import('../components/Auth/Login'));
const Register = React.lazy(() => import('../components/Auth/Register'));
const Products = React.lazy(() => import('../pages/Products'));
const Cart = React.lazy(() => import('../components/Cart/Cart'));
const MyOrders = React.lazy(() => import('../pages/MyOrders'));
const PaymentSuccess = React.lazy(() => import('../pages/PaymentSuccess'));
const PaymentFailure = React.lazy(() => import('../pages/PaymentFailure'));
const PaymentPending = React.lazy(() => import('../pages/PaymentPending'));
const AdminDashboard = React.lazy(() => import('../pages/Admin/AdminDashboard'));
const ProductManagement = React.lazy(() => import('../pages/Admin/ProductManagement'));
const ComboManagement = React.lazy(() => import('../pages/Admin/ComboManagement'));
const OrderManagement = React.lazy(() => import('../pages/Admin/OrderManagement'));
const UserManagement = React.lazy(() => import('../pages/Admin/UserManagement'));
const PaymentSettings = React.lazy(() => import('../pages/Admin/PaymentSettings'));
const ShippingSettings = React.lazy(() => import('../pages/Admin/ShippingSettings'));
const PricingSettings = React.lazy(() => import('../pages/Admin/PricingSettings'));
const SystemSettings = React.lazy(() => import('../pages/Admin/SystemSettings'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  const { user, loading } = useAuth();

  // Admin users and /admin routes bypass maintenance and age verification
  const shouldBypass =
    user?.role === 'admin' || window.location.pathname.startsWith('/admin');

  const { inMaintenance, maintenanceMsg, checkingStatus } =
    useMaintenanceMode({ shouldBypass });
  const { showBlur } = useAgeVerification({
    user,
    loading,
    inMaintenance,
    shouldBypass,
  });

  // Show spinner while checking system status (unless bypassed)
  if (checkingStatus && !shouldBypass) {
    return <Spinner />;
  }

  // Show maintenance screen when system is in maintenance mode
  if (inMaintenance && !shouldBypass) {
    return <MaintenanceScreen message={maintenanceMsg} />;
  }

  return (
    <>
      <div
        id="app-content"
        className={`relative z-0 min-h-screen flex flex-col bg-gray-50 transition-all duration-700 ${
          showBlur
            ? 'blur-2xl grayscale-[0.3] pointer-events-none scale-[1.02]'
            : ''
        }`}
      >
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Suspense fallback={<Spinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes — auth guard via ProtectedRoute (spec RG-3) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<MyOrders />} />
              </Route>

              {/* Payment Routes (public) */}
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
              <Route
                path="/admin/system-settings"
                element={
                  <AdminRoute>
                    <SystemSettings />
                  </AdminRoute>
                }
              />

              {/* 404 — Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>

      {/* Toaster config inline — spec AR-4 */}
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
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
              background:
                'linear-gradient(135deg, #0D4F4F 0%, #1E7E7A 100%)',
              color: '#fff',
              border: 'none',
            },
          },
        }}
      />
    </>
  );
}
