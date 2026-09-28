import React from 'react';

export default function Modal({ title, children, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-[90%] max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h2 className="font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="p-4">
          {children}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-700">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}
