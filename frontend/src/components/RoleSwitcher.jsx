import React from 'react';

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  return (
    <select 
      value={currentRole} 
      onChange={(e) => onRoleChange(e.target.value)}
      className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-1 text-sm outline-none"
    >
      <option value="Collector">District Collector</option>
      <option value="Analyst">GIS Analyst</option>
      <option value="FieldOfficer">Field Officer</option>
    </select>
  );
}
