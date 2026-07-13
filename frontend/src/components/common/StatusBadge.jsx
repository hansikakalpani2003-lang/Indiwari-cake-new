

const STATUS_STYLES = {
  'Pending':           'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Confirmed':         'bg-blue-100   text-blue-800   border-blue-200',
  'Being Prepared':    'bg-orange-100 text-orange-800 border-orange-200',
  'Out for Delivery':  'bg-purple-100 text-purple-800 border-purple-200',
  'Delivered':         'bg-green-100  text-green-800  border-green-200',
};

const STATUS_ICONS = {
  'Pending':           '⏳',
  'Confirmed':         '✅',
  'Being Prepared':    '👩‍🍳',
  'Out for Delivery':  '🚚',
  'Delivered':         '🎉',
};

const StatusBadge = ({ status, large = false }) => {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const icon  = STATUS_ICONS[status]  || '❓';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold whitespace-nowrap
        ${large ? 'text-base px-4 py-1.5' : 'text-xs'}
        ${style}`}
    >
      <span>{icon}</span>
      {status}
    </span>
  );
};

export default StatusBadge;