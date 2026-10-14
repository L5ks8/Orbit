import React, { useState, useRef, useEffect } from "react";

const EMOJI_CATEGORIES = {
  Popular: ["👍", "🔥", "✨", "⭐", "💎", "🎯", "🎮", "🏆", "💯", "✅", "💖", "💜", "💙", "💚", "🧡", "💛"],
  People: ["😀", "😂", "😎", "🤔", "🥺", "😭", "🥳", "😇", "🤫", "🤬", "🤡", "👻", "👽", "👾", "🤖", "👋"],
  Colors: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛"],
  Symbols: ["❤️", "💔", "💬", "💭", "💢", "💥", "💫", "💦", "💨", "🛑", "⚠️", "♻️", "🎵", "🎶", "➕", "➖"],
  Regions: ["🌍", "🌎", "🌏", "🌐", "🗺️", "🗾", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🏞️", "🏟️"]
};

const COMMON_SHORTCODES = {
  moyai: "🗿",
  skull: "💀",
  fire: "🔥",
  star: "⭐",
  sparkles: "✨",
  tada: "🎉",
  heart: "❤️",
  thumbsup: "👍",
  thumbsdown: "👎",
  check: "✅",
  white_check_mark: "✅",
  x: "❌",
  smile: "😄",
  joy: "😂",
  rofl: "🤣",
  eyes: "👀",
  rocket: "🚀",
  crown: "👑",
  gem: "💎",
  100: "💯",
  clown: "🤡",
  wave: "👋",
  pray: "🙏",
  muscle: "💪",
  robot: "🤖",
  ghost: "👻",
  alien: "👽",
  video_game: "🎮",
  dart: "🎯",
  trophy: "🏆",
  medal: "🏅",
  bell: "🔔",
  warning: "⚠️",
};

export default function EmojiPicker({ onSelect, onClose, serverEmojis = [] }) {
  const hasServerEmojis = Array.isArray(serverEmojis) && serverEmojis.length > 0;
  const [activeTab, setActiveTab] = useState(hasServerEmojis ? "Server" : "Popular");
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

  const handleCustomSubmit = () => {
    const trimmed = customEmoji.trim();
    if (!trimmed) return;

    // Check if shortcode like :moyai:
    const shortcodeMatch = trimmed.match(/^:([a-zA-Z0-9_]+):$/);
    if (shortcodeMatch) {
      const code = shortcodeMatch[1].toLowerCase();
      // Check server emojis
      if (hasServerEmojis) {
        const found = serverEmojis.find(e => e.name?.toLowerCase() === code);
        if (found) {
          onSelect(`<${found.animated ? 'a' : ''}:${found.name}:${found.id}>`);
          return;
        }
      }
      // Check common shortcodes
      if (COMMON_SHORTCODES[code]) {
        onSelect(COMMON_SHORTCODES[code]);
        return;
      }
    }

    onSelect(trimmed);
  };

  const tabs = hasServerEmojis ? ["Server", ...Object.keys(EMOJI_CATEGORIES)] : Object.keys(EMOJI_CATEGORIES);

  return (
    <div 
      ref={pickerRef}
      className="absolute z-[200] w-[320px] bg-[#1e1f22] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up"
      style={{
        top: 'calc(100% + 8px)',
        left: 0,
      }}
    >
      <div className="flex items-center justify-between p-2 border-b border-neutral-800/60 bg-[#1e1f22]">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-white text-black' 
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {tab === "Server" ? "⭐ Server" : tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect("");
          }}
          className="text-[11px] text-neutral-400 hover:text-red-400 hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors whitespace-nowrap ml-1 flex-shrink-0"
          title="Remove emoji from this role"
        >
          No emoji
        </button>
      </div>

      <div className="p-3 h-[180px] overflow-y-auto custom-scrollbar">
        {activeTab === "Server" ? (
          <div className="grid grid-cols-6 gap-2">
            {serverEmojis.map(emoji => (
              <button
                key={emoji.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`);
                }}
                title={`:${emoji.name}:`}
                className="w-9 h-9 flex items-center justify-center p-1 rounded-lg hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 group"
              >
                <img
                  src={`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'webp'}?size=48&quality=lossless`}
                  alt={emoji.name}
                  className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJI_CATEGORIES[activeTab]?.map(emoji => (
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
        )}
      </div>

      <div className="p-3 border-t border-neutral-800/60 flex items-center gap-2 bg-[#1e1f22]">
        <input
          type="text"
          value={customEmoji}
          onChange={(e) => setCustomEmoji(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCustomSubmit();
            }
          }}
          placeholder="Paste emoji or :name: ..."
          className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-xl h-9 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800 transition-colors"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCustomSubmit();
          }}
          className="h-9 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          Use
        </button>
      </div>
    </div>
  );
}
