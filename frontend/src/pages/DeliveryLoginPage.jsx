import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import logo from '../assets/logo.png';

export default function DeliveryLoginPage() {
  const navigate = useNavigate();
  const { login, isDeliveryAuthenticated } = useDeliveryAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDeliveryAuthenticated) navigate('/delivery', { replace: true });
  }, [isDeliveryAuthenticated, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Email and password are required.');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/delivery', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Delivery login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-pink-100 rounded-3xl shadow-xl p-8">
        <div className="text-center mb-7">
          <img src={logo} alt="Indiwari Cake" className="h-20 mx-auto object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Delivery Person Login</h1>
          <p className="text-sm text-gray-500 mt-1">Accept available customer orders and update delivery progress.</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="delivery@indiwari.lk"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter delivery password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 disabled:opacity-60">
            {loading ? 'Logging in...' : 'Log In to Delivery Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/" className="text-pink-600 font-semibold hover:underline">← Back to customer website</Link>
        </div>
      </div>
    </div>
  );
}
