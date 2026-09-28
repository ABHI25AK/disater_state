import React from 'react';

export default function VillageCard({ village, onFind, isActive }) {
  return (
    <div className={`bg-slate-900 border ${isActive ? 'border-blue-500' : 'border-slate-700'} rounded-lg p-3 shadow-sm transition-colors`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">{village.name}</h3>
          <p className="text-xs text-slate-400">Pop: {village.population.toLocaleString()}</p>
        </div>
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
          village.priority === 'Immediate' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
        }`}>
          {village.priority}
        </span>
      </div>
      <div className="flex justify-between items-end mt-3">
        <div className="text-xs">
          <span className="text-slate-500">Risk Score: </span>
          <span className="font-bold text-slate-200">{village.riskScore}/100</span>
        </div>
        <button 
          onClick={onFind}
          className="bg-slate-700 hover:bg-slate-600 text-xs font-bold px-3 py-1.5 rounded text-slate-200 transition-colors"
        >
          Find Safe Zone
        </button>
      </div>
    </div>
  );
}
