/**
 * MenuItemCard.jsx
 * Displays a single menu item as a card.
 * "Add to Order" button opens the CustomisationModal.
 * Formats price in LKR.
 *
 * Priority: item.image_url → item name match → category match → generic
 */

import { useState } from 'react';
import CustomisationModal from './CustomisationModal';

// Simple LKR formatter
const formatLKR = (amount) =>
  `Rs. ${parseFloat(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ── Per-item image overrides (item name → image URL) ─────────────────────────
const ITEM_IMAGES = {
  // Birthday Cakes
  'chocolate truffle birthday cake':
    'https://bluebowlrecipes.com/wp-content/uploads/2023/08/chocolate-truffle-cake-8844-500x500.jpg',
  'classic vanilla birthday cake':
    'https://www.mybakingaddiction.com/wp-content/uploads/2025/04/sliced-vanilla-cake.jpg',
  'rainbow confetti cake':
    'https://www.foodnetwork.com/content/dam/images/food/fullset/2014/1/7/0/fnd_finished-sprinkle-cake_s4x3.jpg',

  // Special Orders
  'photo print cake':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ4CO_oEGobTg-uEHwDogBBsuEpVlBCt07MA&s',
  'wedding tier cake':
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=480&h=320&fit=crop',

  // Tiffin
  'butter sponge loaf':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVPkBWENmDj9jcbv79H-jiz5OLKxKk0eaknA&s',
  'chocolate fudge brownies (6 pcs)':
    'https://lakwimana.com/images/Classic%20Chocolate%20Brownie%20Pack%206pcs.jpg',
  'love cake':
    'https://i0.wp.com/candyland.lk/wp-content/uploads/2024/11/heartshaped_love_cake_compressed_2000px_2.jpeg?fit=2000%2C1500&ssl=1',
};

// ── Category fallback images ──────────────────────────────────────────────────
const CATEGORY_IMAGES = {
  // Cakes
  cake:             'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=480&h=320&fit=crop',
  cakes:            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=480&h=320&fit=crop',
  'birthday cake':  'https://bluebowlrecipes.com/wp-content/uploads/2023/08/chocolate-truffle-cake-8844-500x500.jpg',
  'birthday cakes': 'https://bluebowlrecipes.com/wp-content/uploads/2023/08/chocolate-truffle-cake-8844-500x500.jpg',
  'wedding cake':   'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=480&h=320&fit=crop',
  'wedding cakes':  'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=480&h=320&fit=crop',
  'special order':  'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=480&h=320&fit=crop',
  'special orders': 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=480&h=320&fit=crop',
  tiffin:           'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=480&h=320&fit=crop',
  tiffins:          'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=480&h=320&fit=crop',

  // Cupcakes
  cupcake:          'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=480&h=320&fit=crop',
  cupcakes:         'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=480&h=320&fit=crop',

  // Muffins
  muffin:           'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=480&h=320&fit=crop',
  muffins:          'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=480&h=320&fit=crop',

  // Brownies
  brownie:          'https://lakwimana.com/images/Classic%20Chocolate%20Brownie%20Pack%206pcs.jpg',
  brownies:         'https://lakwimana.com/images/Classic%20Chocolate%20Brownie%20Pack%206pcs.jpg',

  // Macarons
  macaron:          'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=480&h=320&fit=crop',
  macarons:         'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=480&h=320&fit=crop',
  macaroon:         'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=480&h=320&fit=crop',
  macaroons:        'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=480&h=320&fit=crop',

  // Cheesecake
  cheesecake:       'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=320&fit=crop',
  cheesecakes:      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=320&fit=crop',
};

/** Generic bakery fallback */
const GENERIC_BAKERY_IMAGE =
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=480&h=320&fit=crop';

/**
 * Returns the best available image URL for a menu item.
 * Priority: item.image_url → item name match → category match → generic
 */
const resolveImage = (item) => {
  if (item.image_url) return item.image_url;
  const nameKey = (item.name || '').toLowerCase().trim();
  if (ITEM_IMAGES[nameKey]) return ITEM_IMAGES[nameKey];
  const catKey = (item.category || '').toLowerCase().trim();
  return CATEGORY_IMAGES[catKey] ?? GENERIC_BAKERY_IMAGE;
};

// ─────────────────────────────────────────────────────────────────────────────

// Capitalizes the first letter of each word (e.g. "birthday" -> "Birthday")
const formatCategoryName = (name) =>
  (name || '')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Item names that should always display as "Classic", regardless of
// whatever category value they have in the database.
const FORCE_CLASSIC_ITEMS = ['butter cake', 'chocolate butter cake', 'chocolate cake'];

// Resolves the category label to show on the badge for a given item
const resolveCategoryLabel = (item) => {
  const nameKey = (item.name || '').trim().toLowerCase();
  if (FORCE_CLASSIC_ITEMS.includes(nameKey)) return 'Classic';
  return formatCategoryName(item.category);
};

const MenuItemCard = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError]   = useState(false);

  const imageSrc = imgError ? GENERIC_BAKERY_IMAGE : resolveImage(item);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-pink-50">
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          {/* Category badge */}
          <span className="absolute top-2 left-2 bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-1 rounded-full">
            {resolveCategoryLabel(item)}
          </span>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">{item.name}</h3>
          {item.description && (
            <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">{item.description}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span className="text-pink-700 font-bold text-sm">{formatLKR(item.base_price)}</span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
            >
              Add to Order
            </button>
          </div>
        </div>
      </div>

      {/* Customisation Modal */}
      {showModal && (
        <CustomisationModal
          item={item}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default MenuItemCard;