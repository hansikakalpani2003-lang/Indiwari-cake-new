import { useState } from 'react';
import api from '../../api/axios';

const CATEGORIES = ['Classic', 'Specialty', 'Fruit', 'Cupcakes', 'Brownie', 'birthday', 'wedding'];

const MenuItemForm = ({ item, onSuccess, onClose }) => {
  const isEdit = !!item;

  const [form, setForm] = useState({
    name:        item?.name        || '',
    description: item?.description || '',
    base_price:  item?.base_price  || '',
    category:    item?.category    || '',
    is_available: item !== null ? String(item?.is_available) : 'true',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image_url || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be 5MB or smaller.' }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, or WEBP images are allowed.' }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Item name is required.';
    if (!form.base_price || isNaN(form.base_price) || parseFloat(form.base_price) <= 0)
      newErrors.base_price = 'Enter a valid price greater than 0.';
    if (!form.category) newErrors.category = 'Category is required.';
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
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('name',         form.name.trim());
      formData.append('description',  form.description.trim());
      formData.append('base_price',   form.base_price);
      formData.append('category',     form.category);
      formData.append('is_available', form.is_available);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      let res;
      if (isEdit) {
        res = await api.patch(`/admin/menu/${item.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/admin/menu', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSuccess(res.data.item);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        const mapped = {};
        fieldErrors.forEach(e => { mapped[e.field] = e.message; });
        setErrors(mapped);
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Classic Vanilla Birthday Cake"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe this cake..."
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (LKR) *</label>
              <input
                type="number"
                name="base_price"
                value={form.base_price}
                onChange={handleChange}
                placeholder="2500.00"
                min="0.01"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                  errors.base_price ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.base_price && <p className="text-red-500 text-xs mt-1">{errors.base_price}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                  errors.category ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Availability</label>
            <select
              name="is_available"
              value={form.is_available}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="true">Available (shown on menu)</option>
              <option value="false">Unavailable (hidden from menu)</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Item Image <span className="font-normal text-gray-400">(JPEG, PNG, WEBP — max 5MB)</span>
            </label>
            {imagePreview && (
              <div className="mb-2 w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-700 file:font-semibold hover:file:bg-pink-200 cursor-pointer"
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded-lg disabled:opacity-60 transition-colors"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;