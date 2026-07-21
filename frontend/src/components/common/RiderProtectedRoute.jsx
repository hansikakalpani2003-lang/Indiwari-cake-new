// frontend/src/components/common/RiderProtectedRoute.jsx
//
// Riders authenticate separately from customers/admins (phone + PIN, its own
// JWT in localStorage under 'rider_token' — see RiderLoginPage.jsx). This
// guard just checks that token exists; the actual token validity is checked
// server-side on every /api/rider/* request (a 401 there redirects to
// /rider/login from within RiderDashboardPage itself).

import { Navigate } from 'react-router-dom';

export default function RiderProtectedRoute({ children }) {
  const riderToken = localStorage.getItem('rider_token');
  if (!riderToken) {
    return <Navigate to="/rider/login" replace />;
  }
  return children;
}
