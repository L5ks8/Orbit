import React from 'react';

export default function Toggle({ checked, onChange, disabled = false }) {
  const isChecked = checked === true || checked === 'true' || checked === 'on';

  const handleClick = (e) => {
    e.stopPropagation?.();
    if (disabled) return;
    if (onChange) {
      onChange(!isChecked);
    }
  };

  return (
    <button 
      type="button" 
      role="switch" 
      aria-checked={isChecked} 
      disabled={disabled}
      onClick={handleClick}
      className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${isChecked ? 'bg-white' : 'bg-neutral-800'}`}
    >
      <span className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-all duration-300 ease-out will-change-transform ${isChecked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-400'}`} />
    </button>
  );
}
