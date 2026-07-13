import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-pink-600 font-semibold">Loading auth...</div>;
  }

  // ලොග් වෙලා ඉන්නවා නම් සහ ඔහුගේ Role එක 'admin' නම් විතරක් ඇතුලට යන්න දෙන්න
  return isAuthenticated && user?.role === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default AdminRoute;