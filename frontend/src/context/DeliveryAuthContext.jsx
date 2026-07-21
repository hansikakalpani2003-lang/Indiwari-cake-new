import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import deliveryApi from '../api/deliveryApi';

const DeliveryAuthContext = createContext(null);

export function DeliveryAuthProvider({ children }) {
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('indiwari_delivery_person');
    const token = sessionStorage.getItem('indiwari_delivery_token');
    if (raw && token) {
      try { setDeliveryPerson(JSON.parse(raw)); }
      catch {
        sessionStorage.removeItem('indiwari_delivery_person');
        sessionStorage.removeItem('indiwari_delivery_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await deliveryApi.post('/login', { email, password });
    sessionStorage.setItem('indiwari_delivery_token', data.token);
    sessionStorage.setItem('indiwari_delivery_person', JSON.stringify(data.deliveryPerson));
    setDeliveryPerson(data.deliveryPerson);
    return data.deliveryPerson;
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await deliveryApi.get('/me');
    sessionStorage.setItem('indiwari_delivery_person', JSON.stringify(data.deliveryPerson));
    setDeliveryPerson(data.deliveryPerson);
    return data.deliveryPerson;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('indiwari_delivery_token');
    sessionStorage.removeItem('indiwari_delivery_person');
    setDeliveryPerson(null);
    window.location.href = '/';
  }, []);

  return (
    <DeliveryAuthContext.Provider value={{
      deliveryPerson,
      loading,
      login,
      logout,
      refresh,
      isDeliveryAuthenticated: Boolean(deliveryPerson && sessionStorage.getItem('indiwari_delivery_token')),
    }}>
      {children}
    </DeliveryAuthContext.Provider>
  );
}

export function useDeliveryAuth() {
  const value = useContext(DeliveryAuthContext);
  if (!value) throw new Error('useDeliveryAuth must be used inside DeliveryAuthProvider.');
  return value;
}