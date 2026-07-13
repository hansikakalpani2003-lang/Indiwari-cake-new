/**
 * LoginPage.jsx
 * Login form page with fixed navigation & state safety checks.
 *
 * Route: /login
 * Access: Public (redirect to /dashboard or /admin if already logged in)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  // 💡 1. Already log වෙලා ඉන්නවා නම් කෙලින්ම Dashboard/Admin එකට හරවා යැවීම (Safety Redirect)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI / Error / Loading states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Client-side Validation (Form එක submit කරන්න කලින් අකුරු check කිරීම)
  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    return newErrors;
  };

  // Submit Button එක click කලහම වැඩ කරන ප්‍රධාන Function එක
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(''); // කලින් තිබ්බ errors clear කිරීම

    // Validation check කිරීම
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // 💡 2. AuthContext එක හරහා Backend එකට login request එක යැවීම
      const loggedInUser = await login(email, password);

      // debug කරලා බලන්න console එකට දත්ත print කරගනිමු (F12 open කරලා බලන්න පුළුවන්)
      console.log("Logged In User Response:", loggedInUser);

      // 💡 3. Role එක අනුව අදාල Dashboard එකට Redirect කිරීම
      // සමහරවිට loggedInUser එක undefined වුනොත් error එන එක වැලැක්වීමට condition එක ආරක්ෂිතව ලියා ඇත.
      if (loggedInUser && loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser) {
        navigate('/dashboard', { replace: true });
      } else {
        // Safe fallback - loggedInUser එක හිස් වුනත් context එකේ state එකෙන් වැඩ කරන්න මෙතනට යවයි
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      // 💡 4. Backend server එකෙන් එන errors handle කිරීම (e.g., Wrong password, User not found)
      console.error("Login component caught error:", err);
      const responseMessage = err?.response?.data?.message;
      setServerError(responseMessage || 'Login failed. Please check your credentials and make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // දැනටමත් ලොග් වී ඇත්නම් පිටුව render නොකර සිටීම
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-700">Welcome Back</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Log in to your Indiwari Cake account
          </p>
        </div>

        {/* Server එකෙන් එන රතු පාට Error Message එක පෙන්වන තැන */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {serverError}
          </div>
        )}

        {/* Form එක */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Email Input Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
              }}
              placeholder="admin@indiwari.lk"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400
                ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password Input Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: '' }));
              }}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400
                ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button (Loading වෙද්දී Disable වෙනවා) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 rounded-lg
              transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Register Link එක */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-pink-600 hover:underline font-medium">
            Create one here
          </Link>
        </p>

        {/* Development Hints (Dev hint එකක් විදියට පෙන්නන කෑල්ල)
        {import.meta.env.DEV && (
          <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
            <strong>Dev hint —</strong> Admin: <code>admin@indiwari.lk</code> / password from seed.sql
          </div>
        )}
         */}
      </div>
    </div>
  );
};

export default LoginPage;