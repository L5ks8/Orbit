import React, { useState, useRef, useEffect } from "react";

const EMOJI_CATEGORIES = {
  Popular: ["👍", "🔥", "✨", "⭐", "💎", "🎯", "🎮", "🏆", "💯", "✅", "💖", "💜", "💙", "💚", "🧡", "💛"],
  People: ["😀", "😂", "😎", "🤔", "🥺", "😭", "🥳", "😇", "🤫", "🤬", "🤡", "👻", "👽", "👾", "🤖", "👋"],
  Colors: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛"],
  Symbols: ["❤️", "💔", "💬", "💭", "💢", "💥", "💫", "💦", "💨", "🛑", "⚠️", "♻️", "🎵", "🎶", "➕", "➖"],
  Regions: ["🌍", "🌎", "🌏", "🌐", "🗺️", "🗾", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🏞️", "🏟️"]
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState("Popular");
  const [customEmoji, setCustomEmoji] = useState("");
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={pickerRef}
      className="absolute z-[200] w-[320px] bg-[#1e1f22] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up"
      style={{
        top: 'calc(100% + 8px)',
        left: 0,
      }}
    >
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800/60 overflow-x-auto scrollbar-hide">
        {Object.keys(EMOJI_CATEGORIES).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-white text-black' 
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-3 h-[180px] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-8 gap-1.5">
          {EMOJI_CATEGORIES[activeTab].map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(emoji); }}
              className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3 border-t border-neutral-800/60 flex items-center gap-2 bg-[#1e1f22]">
        <input
          type="text"
          value={customEmoji}
          onChange={(e) => setCustomEmoji(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Or paste any emoji..."
          className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-xl h-9 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800 transition-colors"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (customEmoji.trim()) onSelect(customEmoji.trim());
          }}
          className="h-9 px-4 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          Use
        </button>
      </div>
    </div>
  );
}
