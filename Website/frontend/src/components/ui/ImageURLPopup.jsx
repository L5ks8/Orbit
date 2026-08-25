import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ImageURLPopup({ isOpen, onClose, onConfirm, title = "Use Image URL", description = "Enter the direct link to an image. It should ideally end in .png, .jpg, .webp, or .gif." }) {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col p-6">
        <h2 className="text-[15px] font-semibold text-white mb-2">{title}</h2>
        <p className="text-[13px] text-neutral-400 mb-5 leading-relaxed">
          {description}
        </p>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/image.png"
          className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[13px] text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 mb-6 placeholder:text-neutral-600 transition-colors"
          autoFocus
        />
        
        <div className="flex items-center gap-3 w-full justify-end">
          <button
            type="button"
            onClick={() => {
              setUrl('');
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-neutral-800 hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (url) {
                onConfirm(url);
                setUrl('');
                onClose();
              }
            }}
            disabled={!url.trim()}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
