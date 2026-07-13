/**
 * LoadingSpinner.jsx
 * Small reusable loading indicator.
 *
 * Props:
 *   size       {'sm'|'md'|'lg'} — spinner diameter (default 'md')
 *   fullScreen {boolean}        — if true, centers in a full viewport-height
 *                                  wrapper (use on a page that has nothing
 *                                  else rendered yet); default false renders
 *                                  inline with vertical padding only
 *   label      {string|null}    — small caption under the spinner;
 *                                  pass null to hide it
 */


const SIZE_CLASSES = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

const LoadingSpinner = ({ size = 'md', fullScreen = false, label = 'Loading…' }) => {
  const spinnerClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${spinnerClasses} rounded-full border-pink-200 border-t-pink-600 animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {label && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        {spinner}
      </div>
    );
  }

  return <div className="py-10 flex items-center justify-center">{spinner}</div>;
};

export default LoadingSpinner;