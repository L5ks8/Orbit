import React from 'react';

export default function Toggle({ checked, onChange }) {
  return (
    <label className="dash-toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider"></span>
    </label>
  );
}
