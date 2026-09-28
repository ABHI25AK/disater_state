import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRedZones } from '../hooks/useRedZones';
import villagesData from '../data/villages.json';
import safeZonesData from '../data/safeZones.json';
import VillageCard from '../components/VillageCard';
import Modal from '../components/Modal';

// Geofence Wayanad bounds
const maxBounds = [
  [11.45, 75.85],
  [11.95, 76.45]
];
const center = [11.55, 76.10];

// Custom component to handle map flying and bounds
function MapController({ flyToTarget }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setMaxBounds(maxBounds);
  }, [map]);

  useEffect(() => {
    if (flyToTarget) {
      map.flyTo([flyToTarget.lat, flyToTarget.lng], 14, { duration: 1.5 });
    } else {
      map.flyTo(center, 11);
    }
  }, [flyToTarget, map]);

  return null;
}

export default function CollectorDashboard() {
  const redZones = useRedZones();
  const [activeSafeZone, setActiveSafeZone] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Remount map if we want to ensure clean state, but just using key on container works too.
  // Actually, we don't strictly need to unmount if MapController handles invalidation.
  
  const handleFindSafeZone = (village) => {
    const safeZone = safeZonesData.find(sz => sz.villageId === village.id);
    if (safeZone) {
      setActiveSafeZone({ ...safeZone, targetVillage: village });
    }
  };

  const handleApprove = () => {
    setModalOpen(false);
    setActiveSafeZone(null);
  };

  return (
    <div className="flex h-full w-full bg-slate-900">
      {/* 70% Map */}
      <div className="w-[70%] h-full relative z-0">
        <MapContainer 
          center={center} 
          zoom={11} 
          minZoom={10}
          style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapController flyToTarget={activeSafeZone} />
          
          {/* Reactive Red Zones from Context */}
          {redZones.features.map(zone => (
            <Polygon 
              key={zone.properties.id}
              positions={zone.geometry.coordinates[0].map(coord => [coord[1], coord[0]])} // GeoJSON is [lng,lat], react-leaflet needs [lat,lng]
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: redZones.opacity, weight: 1 }}
            />
          ))}

          {/* Villages (Red Pins) */}
          {villagesData.map(v => (
            <CircleMarker
              key={v.id}
              center={[v.lat, v.lng]}
              radius={6}
              pathOptions={{ color: '#000', weight: 1, fillColor: '#ef4444', fillOpacity: 1 }}
            >
              <Popup className="text-slate-800 font-bold">{v.name}</Popup>
            </CircleMarker>
          ))}

          {/* Active Safe Zone (Green Pin) */}
          {activeSafeZone && (
            <CircleMarker
              center={[activeSafeZone.lat, activeSafeZone.lng]}
              radius={8}
              pathOptions={{ color: '#fff', weight: 2, fillColor: '#22c55e', fillOpacity: 1 }}
            >
              <Popup className="text-slate-800 font-bold">{activeSafeZone.name}</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {/* 30% Sidebar */}
      <div className="w-[30%] h-full bg-slate-800 border-l border-slate-700 flex flex-col z-10 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white mb-2">Triage Priority List</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Hazard</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Safe Zone</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[...villagesData]
            .sort((a,b) => (a.priority === 'Immediate' ? -1 : 1))
            .map(village => (
              <VillageCard 
                key={village.id} 
                village={village} 
                onFind={() => handleFindSafeZone(village)}
                isActive={activeSafeZone?.villageId === village.id}
              />
          ))}
        </div>

        {activeSafeZone && (
          <div className="p-4 bg-slate-900 border-t border-slate-700">
            <h3 className="font-bold text-white text-sm mb-2">Proposed Relocation: {activeSafeZone.name}</h3>
            <div className="text-xs text-slate-300 space-y-1 mb-3">
              <div className="flex justify-between"><span>Area:</span> <span>{activeSafeZone.areaSqM.toLocaleString()} sq m</span></div>
              <div className="flex justify-between"><span>Population:</span> <span>{activeSafeZone.targetVillage.population}</span></div>
              
              {(() => {
                const capacity = activeSafeZone.areaSqM / activeSafeZone.targetVillage.population;
                const pass = capacity >= activeSafeZone.capacityThresholdSqM;
                return (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                    <span>Capacity ({Math.round(capacity)} sq m / person):</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${pass ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {pass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                );
              })()}
            </div>
            <button 
              onClick={() => setModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm transition-colors"
            >
              Review & Approve Plan
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal 
          title="Approve Relocation Plan" 
          onClose={() => setModalOpen(false)}
          onConfirm={handleApprove}
        >
          <p className="text-sm text-slate-300 mb-4">
            Are you sure you want to approve the relocation of <strong>{activeSafeZone?.targetVillage.name}</strong> to <strong>{activeSafeZone?.name}</strong>? This will dispatch field officers for final ground validation.
          </p>
        </Modal>
      )}
    </div>
  );
}
