/**
 * TrackingProgressBar.jsx
 * Visual 5-stage delivery progress tracker.
 *
 * Props:
 *   currentStatus  {string}   — the current order status string
 *   statusHistory  {Array}    — array of { old_status, new_status, changed_at }
 *
 * Layout:
 *   Desktop (sm+): horizontal row of 5 connected nodes
 *   Mobile:        vertical column of 5 connected nodes
 *
 * Node states:
 *   Completed — filled indigo circle with ✓, timestamp shown below
 *   Current   — indigo circle with amber pulsing ring (animate-ping)
 *   Future    — grey outlined circle
 */


// ── Constants ─────────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'Pending',          label: 'Order\nReceived',     icon: '📋' },
  { key: 'Confirmed',        label: 'Order\nConfirmed',    icon: '✅' },
  { key: 'Being Prepared',   label: 'Being\nPrepared',     icon: '🎂' },
  { key: 'Out for Delivery', label: 'Out for\nDelivery',   icon: '🚚' },
  { key: 'Delivered',        label: 'Delivered',            icon: '🎉' },
];

// ── Date Formatter ────────────────────────────────────────────────────────────
function formatTimestamp(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return '';
  }
}

// ── Status Index Helper ───────────────────────────────────────────────────────
const STATUS_ORDER = [
  'Pending', 'Confirmed', 'Being Prepared', 'Out for Delivery', 'Delivered',
];

function getStageIndex(status) {
  return STATUS_ORDER.indexOf(status);
}

// ── Component ─────────────────────────────────────────────────────────────────
const TrackingProgressBar = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = getStageIndex(currentStatus);

  // Build a lookup: stageKey → timestamp from status_history
  // The "Pending" stage is when the order was created (no history entry).
  // Every subsequent stage has a history row where new_status === stageKey.
  const timestampMap = {};
  if (statusHistory && statusHistory.length > 0) {
    statusHistory.forEach((entry) => {
      if (entry.new_status) {
        timestampMap[entry.new_status] = entry.changed_at;
      }
    });
  }

  return (
    <div className="w-full">

      {/* ── Desktop: Horizontal layout (sm and above) ─────────────────────── */}
      <div className="hidden sm:flex items-start justify-between relative">

        {/* Connecting line behind nodes */}
        <div
          className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0"
          style={{ marginLeft: '2.5rem', marginRight: '2.5rem' }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent   = idx === currentIndex;
          const isFuture    = idx > currentIndex;
          const timestamp   = idx === 0
            ? null  // "Pending" timestamp comes from order.created_at — shown in order header
            : timestampMap[stage.key] || null;

          return (
            <div key={stage.key} className="flex flex-col items-center z-10 flex-1">

              {/* Node */}
              <div className="relative flex items-center justify-center">

                {/* Pulse ring for current stage */}
                {isCurrent && (
                  <span className="absolute inline-flex h-10 w-10 rounded-full bg-amber-400 opacity-50 animate-ping" />
                )}

                <div
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300',
                    isCompleted ? 'bg-indigo-600 border-indigo-600 text-white'   : '',
                    isCurrent   ? 'bg-indigo-600 border-amber-400 text-white'    : '',
                    isFuture    ? 'bg-white border-gray-300 text-gray-400'       : '',
                  ].join(' ')}
                >
                  {isCompleted ? '✓' : <span className="text-base">{stage.icon}</span>}
                </div>
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <p
                  className={[
                    'text-xs font-semibold whitespace-pre-line leading-tight',
                    isCompleted || isCurrent ? 'text-indigo-700' : 'text-gray-400',
                  ].join(' ')}
                >
                  {stage.label}
                </p>

                {/* Timestamp (completed stages only) */}
                {isCompleted && timestamp && (
                  <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                    {formatTimestamp(timestamp)}
                  </p>
                )}
                {isCurrent && (
                  <p className="text-xs text-amber-600 font-medium mt-0.5">In Progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mobile: Vertical layout (below sm) ───────────────────────────── */}
      <div className="flex sm:hidden flex-col space-y-0">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent   = idx === currentIndex;
          const isFuture    = idx > currentIndex;
          const isLast      = idx === STAGES.length - 1;
          const timestamp   = idx === 0
            ? null
            : timestampMap[stage.key] || null;

          return (
            <div key={stage.key} className="flex items-start">

              {/* Left column: node + vertical line */}
              <div className="flex flex-col items-center mr-4">
                <div className="relative flex items-center justify-center">
                  {isCurrent && (
                    <span className="absolute inline-flex h-9 w-9 rounded-full bg-amber-400 opacity-50 animate-ping" />
                  )}
                  <div
                    className={[
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10',
                      isCompleted ? 'bg-indigo-600 border-indigo-600 text-white'  : '',
                      isCurrent   ? 'bg-indigo-600 border-amber-400 text-white'   : '',
                      isFuture    ? 'bg-white border-gray-300 text-gray-400'      : '',
                    ].join(' ')}
                  >
                    {isCompleted ? '✓' : <span className="text-sm">{stage.icon}</span>}
                  </div>
                </div>

                {/* Vertical connecting line */}
                {!isLast && (
                  <div
                    className={[
                      'w-0.5 flex-1 mt-1',
                      isCompleted ? 'bg-indigo-400' : 'bg-gray-200',
                    ].join(' ')}
                    style={{ minHeight: '2.5rem' }}
                  />
                )}
              </div>

              {/* Right column: label + timestamp */}
              <div className="pb-6">
                <p
                  className={[
                    'text-sm font-semibold',
                    isCompleted || isCurrent ? 'text-indigo-700' : 'text-gray-400',
                  ].join(' ')}
                >
                  {stage.label.replace('\n', ' ')}
                </p>

                {isCompleted && timestamp && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatTimestamp(timestamp)}
                  </p>
                )}
                {isCurrent && (
                  <p className="text-xs text-amber-600 font-medium mt-0.5">In Progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingProgressBar;