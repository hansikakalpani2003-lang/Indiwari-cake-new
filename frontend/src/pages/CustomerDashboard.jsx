/**
 * CustomerDashboard.jsx
 * The main authenticated dashboard for customers.
 *
 * Tabs:
 *   - My Orders   (M5): order history list with links to individual order detail pages
 *   - Profile     (M8): profile editor + password change form
 *
 * Used by: App.jsx (protected route)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

const TABS = {
  ORDERS:  'orders',
  PROFILE: 'profile',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.ORDERS);

  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError]     = useState('');

  const [profile, setProfile]               = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm]       = useState({
    phone:            '',
    delivery_address: '',
  });
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError]     = useState('');

  const [passwordForm, setPasswordForm]       = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });
  const [passwordSaving, setPasswordSaving]   = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError]     = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        setOrders(res.data.orders);
      } catch {
        setOrdersError('Failed to load orders. Please refresh the page.');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab !== TABS.PROFILE || profile !== null) return;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await api.get('/customers/profile');
        setProfile(res.data);
        setProfileForm({
          phone:            res.data.phone            || '',
          delivery_address: res.data.delivery_address || '',
        });
      } catch {
        setProfileError('Failed to load profile. Please refresh.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [activeTab, profile]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await api.patch('/customers/profile', profileForm);
      setProfile(res.data.profile);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setProfileError(errors.map(e => e.msg).join(' '));
      } else {
        setProfileError(err.response?.data?.message || 'Failed to save profile.');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess('');
    setPasswordError('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      setPasswordSaving(false);
      return;
    }
    try {
      await api.patch('/customers/password', passwordForm);
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setPasswordError(errors.map(e => e.msg).join(' '));
      } else {
        setPasswordError(err.response?.data?.message || 'Failed to change password.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3]">

      {/* Page Header */}
      <div className="bg-white border-b border-pink-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-500 text-xs font-semibold tracking-widest uppercase mb-2">
                Your Account
              </p>
              <h1 className="font-serif italic text-3xl font-bold text-gray-800">
                Welcome back, {user?.name || 'Customer'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your orders and account details below.
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-pink-600 font-semibold transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Tab Navigation — pill style */}
        <div className="inline-flex gap-1 bg-white border border-pink-100 rounded-full p-1 mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab(TABS.ORDERS)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeTab === TABS.ORDERS
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-pink-600'
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab(TABS.PROFILE)}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
              activeTab === TABS.PROFILE
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-pink-600'
            }`}
          >
            My Profile
          </button>
        </div>

        {/* ORDERS TAB */}
        {activeTab === TABS.ORDERS && (
          <div>
            {ordersLoading && (
              <div className="text-center py-12 text-gray-500">Loading your orders…</div>
            )}
            {ordersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                {ordersError}
              </div>
            )}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-pink-100">
                <p className="text-4xl mb-4"></p>
                <p className="text-gray-500 text-lg mb-5">You haven't placed any orders yet.</p>
                <Link
                  to="/menu"
                  className="inline-block bg-pink-600 text-white px-7 py-2.5 rounded-xl font-semibold hover:bg-pink-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Browse Our Menu
                </Link>
              </div>
            )}
            {!ordersLoading && orders.length > 0 && (
              <div className="space-y-3">
                {orders.map(order => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block bg-white rounded-2xl border border-pink-100 p-5 hover:border-pink-300 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{order.order_reference}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''} ·{' '}
                          Delivery: {formatDate(order.delivery_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-800">
                          {formatCurrency(order.total_amount)}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === TABS.PROFILE && (
          <div className="max-w-xl space-y-6">
            {profileLoading && (
              <div className="text-center py-12 text-gray-500">Loading profile…</div>
            )}
            {!profileLoading && (
              <>
                {/* Account Details */}
                <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
                  <h2 className="font-serif text-lg font-bold text-gray-800 mb-4">Account Details</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium">{profile?.name || user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Email Address
                      </label>
                      <p className="text-gray-900">{profile?.email || user?.email}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Name and email cannot be changed. Contact us if you need to update them.
                    </p>
                  </div>
                </div>

                {/* Edit Profile */}
                <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
                  <h2 className="font-serif text-lg font-bold text-gray-800 mb-4">Edit Profile</h2>
                  {profileSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
                      ✓ {profileSuccess}
                    </div>
                  )}
                  {profileError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                      {profileError}
                    </div>
                  )}
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="e.g. 0771234567"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Address</label>
                      <textarea
                        rows={3}
                        value={profileForm.delivery_address}
                        onChange={e => setProfileForm(f => ({ ...f, delivery_address: e.target.value }))}
                        placeholder="No. 12, Main Street, Kurunegala"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        This address will be pre-filled when you place a new order.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="w-full bg-pink-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-pink-700 disabled:opacity-60 transition-colors shadow-sm hover:shadow-md"
                    >
                      {profileSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
                  <h2 className="font-serif text-lg font-bold text-gray-800 mb-4">Change Password</h2>
                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
                      ✓ {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                      {passwordError}
                    </div>
                  )}
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.current_password}
                        onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
                        placeholder="Enter your current password"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
                        placeholder="At least 8 characters"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))}
                        placeholder="Re-enter your new password"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="w-full bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 disabled:opacity-60 transition-colors shadow-sm hover:shadow-md"
                    >
                      {passwordSaving ? 'Changing…' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}