import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export default function PriorityDashboard({ data }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [filterTier, setFilterTier] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterHazard, setFilterHazard] = useState('All');

  const toggleRow = (id) => {
    setExpandedRows(prev => ({...prev, [id]: !prev[id]}));
  };

  const districts = [...new Set(data.habitations.map(h => h.district))];
  const hazards = [...new Set(data.habitations.map(h => h.hazard_type))];

  const filteredHabitations = data.habitations.filter(hab => {
    if (filterTier !== 'All' && hab.priority.tier !== filterTier) return false;
    if (filterDistrict !== 'All' && hab.district !== filterDistrict) return false;
    if (filterHazard !== 'All' && hab.hazard_type !== filterHazard) return false;
    return true;
  }).sort((a, b) => b.priority.priority_score - a.priority.priority_score);

  return (
    <div className="w-full h-full p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Habitation Priority Ranking</h2>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-bold uppercase">District</span>
              <select className="border border-gray-300 rounded p-2 text-sm bg-white" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                <option value="All">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-bold uppercase">Hazard Type</span>
              <select className="border border-gray-300 rounded p-2 text-sm bg-white" value={filterHazard} onChange={(e) => setFilterHazard(e.target.value)}>
                <option value="All">All Hazards</option>
                {hazards.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-bold uppercase">Urgency Tier</span>
              <select className="border border-gray-300 rounded p-2 text-sm bg-white" value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
                <option value="All">All Tiers</option>
                <option value="Red">Red (Immediate)</option>
                <option value="Yellow">Yellow (Short-term)</option>
                <option value="Green">Green (Medium-term)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 text-sm uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4">Habitation Name</th>
                <th className="p-4">District & Hazard</th>
                <th className="p-4">Population</th>
                <th className="p-4">Exposure Score</th>
                <th className="p-4">Priority Score</th>
                <th className="p-4">Urgency Tier</th>
              </tr>
            </thead>
            <tbody>
              {filteredHabitations.map((hab) => (
                <React.Fragment key={hab.id}>
                  <tr 
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${expandedRows[hab.id] ? 'bg-blue-50/30' : ''}`}
                    onClick={() => toggleRow(hab.id)}
                  >
                    <td className="p-4 text-gray-400">
                      {expandedRows[hab.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </td>
                    <td className="p-4 font-bold text-gray-800">{hab.name}</td>
                    <td className="p-4 text-xs text-gray-500">
                      <span className="font-bold text-gray-700">{hab.district}</span><br/>{hab.hazard_type}
                    </td>
                    <td className="p-4 text-gray-600">{hab.population}</td>
                    <td className="p-4 text-gray-600">{hab.simulated_hazard_exposure}</td>
                    <td className="p-4 font-bold">{hab.priority.priority_score}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${
                        hab.priority.tier === 'Red' ? 'bg-red-100 text-red-700' :
                        hab.priority.tier === 'Yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        <AlertTriangle size={12} />
                        {hab.priority.tier}
                      </span>
                    </td>
                  </tr>
                  
                  {expandedRows[hab.id] && (
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td colSpan="7" className="p-6">
                        <div className="ml-10 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Recommended Relocation Sites</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {hab.recommended_sites.map((rec, idx) => (
                              <div key={idx} className={`border rounded p-3 ${rec.rejected ? 'border-red-200 bg-red-50/50 opacity-75' : 'border-blue-100 bg-blue-50/50'}`}>
                                <div className={`font-bold mb-1 ${rec.rejected ? 'text-red-800 line-through' : 'text-blue-900'}`}>{idx + 1}. {rec.site_name}</div>
                                <div className="text-xs text-gray-600 mb-2">{rec.distance_km} km distance</div>
                                {rec.rejected && (
                                  <div className="text-xs font-bold text-red-600 mb-2 p-1 bg-red-100 rounded">
                                    {rec.rejectionReason}
                                  </div>
                                )}
                                <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2 mt-2">
                                  <span className="text-gray-600">Match Score</span>
                                  <span className="font-bold text-blue-700">{rec.rejected ? 'N/A' : rec.match_score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredHabitations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No habitations found for the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
