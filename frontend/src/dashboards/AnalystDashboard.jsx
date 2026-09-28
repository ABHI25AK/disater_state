import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useHazardContext } from '../context/HazardContext';
import { useRedZones } from '../hooks/useRedZones';
import MetricCard from '../components/MetricCard';

const center = [10.5, 76.5];

function MapController() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export default function AnalystDashboard() {
  const { sliders, setSliders, resetSliders } = useHazardContext();
  const redZones = useRedZones();

  const handleSliderChange = (key, value) => {
    setSliders(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <div className="flex h-full w-full bg-slate-900">
      {/* 25% Sidebar Controls */}
      <div className="w-[25%] h-full bg-slate-900 border-r border-slate-800 flex flex-col z-10 overflow-y-auto">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white mb-1">Algorithm Calibration</h2>
          <p className="text-xs text-slate-400">Adjust model weights live</p>
        </div>
        
        <div className="p-5 space-y-6 flex-1">
          {Object.keys(sliders).map(key => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize text-slate-300 font-medium">{key} Weight</span>
                <span className="text-blue-400 font-mono">{sliders[key]}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={sliders[key]} 
                onChange={(e) => handleSliderChange(key, e.target.value)}
                className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          ))}
        </div>
        
        <div className="p-5 border-t border-slate-800">
          <button 
            onClick={resetSliders}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors border border-slate-600"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* 75% Map & Metrics */}
      <div className="w-[75%] h-full flex flex-col relative z-0 bg-[#0f172a]">
        {/* Top metrics bar */}
        <div className="absolute top-4 left-0 right-0 z-[400] flex justify-center gap-4 px-4 pointer-events-none">
          <MetricCard title="IMD API" value="Online" color="text-green-400" />
          <MetricCard title="Model Accuracy" value={`${redZones.accuracy}%`} color="text-blue-400" />
          <MetricCard title="Active Red Zones" value={redZones.activeCount} color="text-red-400" />
        </div>

        <MapContainer 
          center={center} 
          zoom={7} 
          style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapController />
          
          {redZones.features.map(zone => (
            <Polygon 
              key={zone.properties.id}
              positions={zone.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: redZones.opacity, weight: 1 }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
