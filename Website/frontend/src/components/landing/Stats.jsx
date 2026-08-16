import React from 'react';

export default function Stats() {
  return (
    <div className="lp-stats-row">
      <div className="lp-stat reveal" style={{ '--i': 0 }}>
        <span className="lp-stat-val">234K</span>
        <span className="lp-stat-lbl">Servers</span>
      </div>
      <div className="lp-stat reveal" style={{ '--i': 1 }}>
        <span className="lp-stat-val">12M</span>
        <span className="lp-stat-lbl">Users Protected</span>
      </div>
      <div className="lp-stat reveal" style={{ '--i': 2 }}>
        <span className="lp-stat-val">14</span>
        <span className="lp-stat-lbl">ms Latency</span>
      </div>
    </div>
  );
}
