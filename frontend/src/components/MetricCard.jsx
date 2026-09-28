import React from 'react';

export default function MetricCard({ title, value, color }) {
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-4 py-2 shadow-lg pointer-events-auto min-w[120px] text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{title}</div>
      <div className={`font-bold text-lg ${color}`}>{value}</div>
    </div>
  );
}
