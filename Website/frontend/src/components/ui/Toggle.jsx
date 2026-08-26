import React from 'react';

export default function Toggle({ checked, onChange }) {
  const isChecked = checked === true || checked === 'true' || checked === 'on';
  return (
    <label className="dash-toggle">
      <input type="checkbox" checked={isChecked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider"></span>
    </label>
  );
}
