import { useState } from 'react';
import { useCart } from '../../context/CartContext';

const SIZES = ['500g', '1kg', '2kg'];

const formatLKR = (amount) =>
  `Rs. ${parseFloat(amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

// item.base_price is treated as the 1kg price. Adjust these ratios to match
// your real pricing (e.g. if 500g/2kg/Slice have fixed prices instead, swap
// this out for a lookup keyed by item.id + size).
const SIZE_MULTIPLIERS = {
  '500g': 0.55,
  '1kg':  1,
  '2kg':  1.9,
};

const CustomisationModal = ({ item, onClose }) => {
  const { addItem } = useCart();

  const [quantity, setQuantity]         = useState(1);
  const [size, setSize]                 = useState('1kg');
  const [decorationNote, setDecorationNote] = useState('');
  const [added, setAdded]               = useState(false);

  const unitPrice = parseFloat(item.base_price) * (SIZE_MULTIPLIERS[size] ?? 1);
  const subtotal  = unitPrice * quantity;

  const handleAdd = () => {
    addItem({
      menu_item_id:    item.id,
      name:            item.name,
      base_price:      item.base_price,
      unit_price:      unitPrice,
      quantity,
      size,
      decoration_note: decorationNote.trim(),
    });

    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
            <p className="text-sm text-pink-600 font-semibold">{formatLKR(unitPrice)} per unit</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 font-bold text-lg hover:bg-pink-200 transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(20, q + 1))}
                className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 font-bold text-lg hover:bg-pink-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                    size === s
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Decoration Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Decoration Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder='e.g. "Happy Birthday Sarah!" in blue icing'
              value={decorationNote}
              onChange={e => setDecorationNote(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{decorationNote.length}/200</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Subtotal</p>
            <p className="text-lg font-bold text-pink-700">{formatLKR(subtotal)}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            {added ? '✓ Added to Cart!' : 'Add to Cart'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomisationModal;