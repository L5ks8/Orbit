import React from 'react';
import { createPortal } from 'react-dom';

export default function DeleteConfirmation({ isOpen, onClose, onConfirm, title = "Delete this reaction role?", description = "It disappears from your dashboard. This can't be undone." }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col items-center text-center p-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        
        <h2 className="text-[15px] font-semibold text-white mb-2">{title}</h2>
        <p className="text-[13px] text-neutral-400 mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-neutral-800 hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
