import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle } from 'lucide-react';

export default function FieldOfficerDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Form State
  const [water, setWater] = useState('Sufficient');
  const [disputes, setDisputes] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        // Reset form
        setSuccess(false);
        setPhotoPreview(null);
        setWater('Sufficient');
        setDisputes(false);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="h-full w-full bg-black overflow-y-auto pb-24">
      <div className="max-w-[400px] mx-auto bg-slate-900 min-h-full flex flex-col relative shadow-2xl shadow-black/50">
        
        {/* Header / Map Placeholder */}
        <div className="h-48 bg-slate-800 relative flex items-center justify-center border-b border-slate-700 overflow-hidden">
          {/* Faux map grid background */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10 text-center">
            <MapPin className="mx-auto text-green-500 mb-2" size={32} />
            <h2 className="text-xl font-bold text-white tracking-tight">Plot 42A Validation</h2>
            <p className="text-xs text-slate-400">Meppadi Safe Relocation Area</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-5 flex-1 space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Water Availability</label>
            <select 
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-blue-500 appearance-none"
            >
              <option value="Sufficient">Sufficient</option>
              <option value="Limited">Limited</option>
              <option value="None">None</option>
            </select>
          </div>

          <div className="space-y-2 flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div>
              <label className="text-sm font-bold text-slate-300">Land Disputes Observed?</label>
              <p className="text-[10px] text-slate-500">Ask locals if any boundaries overlap.</p>
            </div>
            <button 
              onClick={() => setDisputes(!disputes)}
              className={`w-12 h-6 rounded-full relative transition-colors ${disputes ? 'bg-red-500' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${disputes ? 'translate-x-6' : 'translate-x-0'}`}></span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 block mb-2">Ground Photo Evidence</label>
            
            {photoPreview ? (
              <div className="relative h-40 w-full rounded-lg overflow-hidden border border-slate-600">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">Retake</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="mb-2 text-slate-400" size={24} />
                  <p className="text-sm font-bold text-slate-300">Take Ground Photo</p>
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
              </label>
            )}
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800">
          <button 
            onClick={handleSubmit}
            disabled={loading || success}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2
              ${success ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'}
              ${loading ? 'opacity-80 cursor-wait' : ''}
            `}
          >
            {loading ? (
              <span className="animate-pulse">Validating...</span>
            ) : success ? (
              <><CheckCircle size={20} /> Saved to Database</>
            ) : (
              'Submit Validation'
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}
