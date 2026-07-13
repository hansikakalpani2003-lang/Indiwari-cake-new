import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Route guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute     from './components/common/AdminRoute';

// Public pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import PublicOrderPage  from './pages/PublicOrderPage';
import MenuPage         from './pages/MenuPage';

// Customer pages
import CustomerDashboard from './pages/CustomerDashboard';
import CheckoutPage      from './pages/CheckoutPage';
import OrderDetailPage   from './pages/OrderDetailPage';

// Admin pages
import AdminDashboard    from './pages/AdminDashboard';       
import AdminOrdersPage   from './pages/AdminOrdersPage';
import AdminMenuPage     from './pages/AdminMenuPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminReportsPage  from './pages/AdminReportsPage';     

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/"            element={<LandingPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/menu"        element={<MenuPage />} />
          <Route path="/order/:token" element={<PublicOrderPage />} />

          {/* ── Customer Routes (Protected) ── */}
          <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/checkout"  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

          {/* ── Admin Routes (Protected) ── */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/orders"    element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/admin/menu"      element={<AdminRoute><AdminMenuPage /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
          <Route path="/admin/reports"   element={<AdminRoute><AdminReportsPage /></AdminRoute>} />

          {/* ── Fallback Route ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}