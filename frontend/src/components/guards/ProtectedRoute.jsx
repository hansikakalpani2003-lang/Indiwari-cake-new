import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Auth තවම ලෝඩ් වෙනවා නම් පොඩි ලෝඩින් එකක් පෙන්වන්න
  if (loading) {
    return <div className="p-8 text-center text-pink-600 font-semibold">Loading auth...</div>;
  }

  // ලොග් වෙලා නැත්නම් කෙලින්ම Login පිටුවට හරවා යවන්න
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;