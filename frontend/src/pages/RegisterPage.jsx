/**
 * RegisterPage.jsx
 * Customer registration page — styled to match DeliveryLoginPage.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required.';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const response = err?.response?.data;

      if (response?.errors && Array.isArray(response.errors)) {
        const fieldErrors = {};

        response.errors.forEach((error) => {
          const fieldKey = error.path ?? error.param ?? error.field ?? null;
          const fieldMsg = error.msg ?? error.message ?? 'Invalid value.';

          if (fieldKey) {
            fieldErrors[fieldKey] = fieldMsg;
          }
        });

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          const messages = response.errors
            .map((e) => e.msg ?? e.message ?? '')
            .filter(Boolean)
            .join(' ');
          setServerError(messages || 'Registration failed. Please try again.');
        }
      } else {
        setServerError(response?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-pink-100 rounded-3xl shadow-xl p-8">
        <div className="text-center mb-7">
          <img src={logo} alt="Indiwari Cake" className="h-20 mx-auto object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Create an Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join Indiwari Cake and order your perfect cake</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name" name="name" type="text"
              value={formData.name} onChange={handleChange}
              placeholder="Kasun Perera"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email" name="email" type="email"
              value={formData.email} onChange={handleChange}
              placeholder="kasun@example.com"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password" name="password" type="password"
              value={formData.password} onChange={handleChange}
              placeholder="Minimum 8 characters"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Re-enter your password"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="phone">
              Phone Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="phone" name="phone" type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.phone} onChange={handleChange}
              placeholder="0771234567"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="address">
              Delivery Address <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="address" name="address"
              value={formData.address} onChange={handleChange}
              rows={2}
              placeholder="No. 12, Main Street, Kurunegala"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">Log in here</Link>
        </p>

        <div className="mt-4 text-center text-sm">
          <Link to="/" className="text-pink-600 font-semibold hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;