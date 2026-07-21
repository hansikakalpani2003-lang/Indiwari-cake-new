import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  password: '',
  vehicle_type: 'Motorbike',
  vehicle_number: '',
  status: 'Available',
};

export default function AdminDeliveryPersonsPage() {
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/delivery-persons');
      setPeople(data.deliveryPersons || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load delivery persons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!form.name || !form.phone || !form.email || !form.vehicle_type || (!editingId && !form.password)) {
      return setError('Name, phone, email, vehicle type and login password are required.');
    }
    if (form.phone.length !== 10) {
      return setError('Phone number must be exactly 10 digits.');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete payload.password;
      if (editingId) {
        await api.put(`/admin/delivery-persons/${editingId}`, payload);
        setMessage('Delivery person updated successfully.');
      } else {
        await api.post('/admin/delivery-persons', payload);
        setMessage('Delivery person account created. They can now use the Delivery Login page.');
      }
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save delivery person.');
    } finally {
      setSaving(false);
    }
  };

  const edit = (person) => {
    setEditingId(person.id);
    setForm({
      name: person.name || '',
      phone: person.phone || '',
      email: person.email || '',
      password: '',
      vehicle_type: person.vehicle_type || 'Motorbike',
      vehicle_number: person.vehicle_number || '',
      status: person.status === 'Delivering' ? 'Delivering' : person.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this delivery person account?')) return;
    setError('');
    try {
      await api.delete(`/admin/delivery-persons/${id}`);
      setMessage('Delivery person deleted.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete delivery person.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <p className="text-xs uppercase tracking-widest text-pink-500 font-bold">Admin Management</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Delivery Persons</h1>
            <p className="text-sm text-gray-500 mt-1">Create delivery login accounts and control availability.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin" className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 bg-white">← Dashboard</Link>
            <Link to="/delivery/login" target="_blank" className="px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-semibold">Open Delivery Login</Link>
          </div>
        </div>

        {message && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="bg-white border border-pink-100 rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editingId ? 'Edit Delivery Person' : 'Add Delivery Person'}</h2>
            {editingId && <button type="button" onClick={reset} className="text-sm text-gray-500 hover:text-pink-600">Cancel edit</button>}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input className="border border-gray-300 rounded-xl px-4 py-3" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              className="border border-gray-300 rounded-xl px-4 py-3"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm({ ...form, phone: digitsOnly });
              }}
            />

            <input type="email" className="border border-gray-300 rounded-xl px-4 py-3" placeholder="Login email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" className="border border-gray-300 rounded-xl px-4 py-3" placeholder={editingId ? 'New password (optional)' : 'Login password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="border border-gray-300 rounded-xl px-4 py-3" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
              <option>Motorbike</option>
              <option>Three Wheeler</option>
              <option>Car</option>
              <option>Van</option>
              <option>Other</option>
            </select>
            <input className="border border-gray-300 rounded-xl px-4 py-3" placeholder="Vehicle number (optional)" value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
            <select disabled={form.status === 'Delivering'} className="border border-gray-300 rounded-xl px-4 py-3 disabled:bg-gray-100" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {form.status === 'Delivering' && <option>Delivering</option>}
              <option>Available</option>
              <option>Inactive</option>
            </select>
            <button disabled={saving} className="lg:col-span-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 disabled:opacity-60">
              {saving ? 'Saving...' : editingId ? 'Update Delivery Person' : 'Create Delivery Account'}
            </button>
          </div>
        </form>

        <div className="bg-white border border-pink-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-pink-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Registered Delivery Team</h2>
            <span className="text-sm text-gray-500">{people.length} account(s)</span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : people.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No delivery persons have been added.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pink-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Person</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Deliveries</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {people.map((person) => (
                    <tr key={person.id} className="hover:bg-pink-50/30">
                      <td className="px-5 py-4"><p className="font-semibold text-gray-900">{person.name}</p><p className="text-xs text-gray-500">ID #{person.id}</p></td>
                      <td className="px-5 py-4"><p>{person.email}</p><p className="text-gray-500">{person.phone}</p></td>
                      <td className="px-5 py-4"><p>{person.vehicle_type}</p><p className="text-gray-500">{person.vehicle_number || '—'}</p></td>
                      <td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${person.status === 'Available' ? 'bg-green-100 text-green-700' : person.status === 'Delivering' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{person.status}</span></td>
                      <td className="px-5 py-4"><p>{person.completed_deliveries} completed</p><p className="text-gray-500">{person.active_deliveries} active</p></td>
                      <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => edit(person)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold">Edit</button><button onClick={() => remove(person.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-semibold">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}