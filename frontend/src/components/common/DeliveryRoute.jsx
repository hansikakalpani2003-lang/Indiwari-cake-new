import { Navigate } from 'react-router-dom';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';

export default function DeliveryRoute({ children }) {
  const { loading, isDeliveryAuthenticated } = useDeliveryAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-gray-500">Loading...</div>;
  return isDeliveryAuthenticated ? children : <Navigate to="/delivery/login" replace />;
}
