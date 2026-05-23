import { Routes, Route, Navigate } from 'react-router-dom';

// ─── Placeholder pages (create simple components for now) ─────
// These will be replaced with real implementations in later modules.
const ComingSoon = ({ page }) => (
  <div className="min-h-screen center flex-col gap-4">
    <h1 className="text-3xl font-display text-brand-rose">Indiwari Cake 🎂</h1>
    <p className="text-gray-500">{page} — coming soon</p>
  </div>
);

// ─── When real pages are ready, import them like this: ─────────
// import LandingPage        from './pages/LandingPage';
// import LoginPage          from './pages/LoginPage';
// import RegisterPage       from './pages/RegisterPage';
// import CustomerDashboard  from './pages/CustomerDashboard';
// import AdminDashboard     from './pages/AdminDashboard';
// import ProtectedRoute     from './components/common/ProtectedRoute';
// import AdminRoute         from './components/common/AdminRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"          element={<ComingSoon page="Landing Page" />} />
      <Route path="/login"     element={<ComingSoon page="Login" />} />
      <Route path="/register"  element={<ComingSoon page="Register" />} />
      <Route path="/menu"      element={<ComingSoon page="Menu" />} />
      <Route path="/order/:token" element={<ComingSoon page="Public Order Page" />} />

      {/* Customer protected routes */}
      <Route path="/dashboard"       element={<ComingSoon page="Customer Dashboard" />} />
      <Route path="/checkout"        element={<ComingSoon page="Checkout" />} />
      <Route path="/orders/:id"      element={<ComingSoon page="Order Detail" />} />

      {/* Admin protected routes */}
      <Route path="/admin"           element={<ComingSoon page="Admin Dashboard" />} />
      <Route path="/admin/orders"    element={<ComingSoon page="Admin Orders" />} />
      <Route path="/admin/menu"      element={<ComingSoon page="Admin Menu" />} />
      <Route path="/admin/customers" element={<ComingSoon page="Admin Customers" />} />
      <Route path="/admin/reports"   element={<ComingSoon page="Admin Reports" />} />

      {/* Catch all — 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;