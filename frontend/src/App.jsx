import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DeliveryAuthProvider } from './context/DeliveryAuthContext';

import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import DeliveryRoute from './components/common/DeliveryRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicOrderPage from './pages/PublicOrderPage';
import MenuPage from './pages/MenuPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminDeliveryPersonsPage from './pages/AdminDeliveryPersonsPage';
import DeliveryLoginPage from './pages/DeliveryLoginPage';
import DeliveryDashboard from './pages/DeliveryDashboard';

export default function App() {
  return (
    <AuthProvider>
      <DeliveryAuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/order/:token" element={<PublicOrderPage />} />

            <Route path="/delivery/login" element={<DeliveryLoginPage />} />
            <Route path="/delivery" element={<DeliveryRoute><DeliveryDashboard /></DeliveryRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
            <Route path="/admin/menu" element={<AdminRoute><AdminMenuPage /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
            <Route path="/admin/delivery-persons" element={<AdminRoute><AdminDeliveryPersonsPage /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </DeliveryAuthProvider>
    </AuthProvider>
  );
}
