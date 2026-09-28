import React, { useState } from 'react';
import { HazardProvider } from './context/HazardContext';
import RoleSwitcher from './components/RoleSwitcher';
import CollectorDashboard from './dashboards/CollectorDashboard';
import AnalystDashboard from './dashboards/AnalystDashboard';
import FieldOfficerDashboard from './dashboards/FieldOfficerDashboard';
import { Activity } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('Collector');

  return (
    <HazardProvider>
      <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
        {/* Top bar */}
        <header className="flex-none flex justify-between items-center bg-slate-950 px-4 py-3 border-b border-slate-800 z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-white">Red Zone Relocation DSS — Wayanad</h1>
            <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded border border-slate-700 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Data
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Current Role</span>
            <RoleSwitcher currentRole={role} onRoleChange={setRole} />
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 min-h-0 relative">
          {role === 'Collector' && <CollectorDashboard />}
          {role === 'Analyst' && <AnalystDashboard />}
          {role === 'FieldOfficer' && <FieldOfficerDashboard />}
        </main>
      </div>
    </HazardProvider>
  );
}
