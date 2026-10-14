import React, { useState, useEffect } from "react";
import { useToast } from "../../ui/Toast";
import CustomSelect from "../../ui/CustomSelect";
import EmojiPicker from "../../ui/EmojiPicker";
import Toggle from "../../ui/Toggle";

const COLOR_PRESETS = [
  { name: "Blurple", value: "#5865F2" },
  { name: "Green", value: "#57F287" },
  { name: "Yellow", value: "#FEE75C" },
  { name: "Pink", value: "#EB459E" },
  { name: "Red", value: "#ED4245" },
  { name: "Cyan", value: "#00B0F4" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Dark", value: "#2B2D31" },
];

const BUTTON_STYLES = [
  { id: "blue", label: "Primary", bg: "bg-[#5865F2]", text: "text-white" },
  { id: "gray", label: "Secondary", bg: "bg-[#4e5058]", text: "text-white" },
  { id: "green", label: "Success", bg: "bg-[#248046]", text: "text-white" },
  { id: "red", label: "Danger", bg: "bg-[#da373c]", text: "text-white" },
];

const SHORTCODE_UNICODE_MAP = {
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
  laughing: "😆",
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

export const EmojiDisplay = ({ emoji, serverEmojis = [], className = "w-5 h-5", fallback = null }) => {
  if (!emoji) return fallback;

  // Custom Discord emoji format: <:name:id> or <a:name:id>
  const customMatch = emoji.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);
  if (customMatch) {
    const isAnim = emoji.startsWith("<a:");
    const emojiId = customMatch[2];
    const name = customMatch[1];
    return (
      <img
        src={`https://cdn.discordapp.com/emojis/${emojiId}.${isAnim ? "gif" : "webp"}?size=48&quality=lossless`}
        alt={name}
        title={`:${name}:`}
        className={`inline-block object-contain align-middle ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  // Pure snowflake ID
  if (/^\d{17,20}$/.test(String(emoji).trim())) {
    const emojiId = String(emoji).trim();
    return (
      <img
        src={`https://cdn.discordapp.com/emojis/${emojiId}.webp?size=48&quality=lossless`}
        alt="emoji"
        className={`inline-block object-contain align-middle ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  // Shortcode format: :name:
  const shortcodeMatch = emoji.match(/^:([a-zA-Z0-9_]+):$/);
  if (shortcodeMatch) {
    const cleanName = shortcodeMatch[1].toLowerCase();
    if (serverEmojis && serverEmojis.length > 0) {
      const found = serverEmojis.find(
        (se) => se.name && se.name.toLowerCase() === cleanName
      );
      if (found) {
        return (
          <img
            src={`https://cdn.discordapp.com/emojis/${found.id}.${found.animated ? "gif" : "webp"}?size=48&quality=lossless`}
            alt={found.name}
            title={`:${found.name}:`}
            className={`inline-block object-contain align-middle ${className}`}
          />
        );
      }
    }
    if (SHORTCODE_UNICODE_MAP[cleanName]) {
      return <span>{SHORTCODE_UNICODE_MAP[cleanName]}</span>;
    }
  }

  return <span>{emoji}</span>;
};


const PREDEFINED_TEMPLATES = {
  "Normal": {
    title: "Role Selection",
    description: "",
    behavior: "multi",
    roles: []
  },
  "Color": {
    title: "🎨 Pick your color",
    description: "Tap a button or reaction to recolor your name.",
    behavior: "multi",
    roles: [
      { emoji: "🔴", label: "Red", role_id: "", color: "red" },
      { emoji: "🟠", label: "Orange", role_id: "", color: "gray" },
      { emoji: "🟡", label: "Yellow", role_id: "", color: "gray" },
      { emoji: "🟢", label: "Green", role_id: "", color: "green" },
      { emoji: "🔵", label: "Blue", role_id: "", color: "blue" },
      { emoji: "🟣", label: "Purple", role_id: "", color: "blue" },
      { emoji: "🪷", label: "Pink", role_id: "", color: "gray" },
      { emoji: "⚪", label: "White", role_id: "", color: "gray" }
    ]
  },
  "Pronouns": {
    title: "🪪 Pronouns",
    description: "Pick any that apply.",
    behavior: "multi",
    roles: [
      { emoji: "🟦", label: "He / Him", role_id: "", color: "blue" },
      { emoji: "🟪", label: "She / Her", role_id: "", color: "gray" },
      { emoji: "🟩", label: "They / Them", role_id: "", color: "green" },
      { emoji: "🟨", label: "Any pronouns", role_id: "", color: "gray" },
      { emoji: "⬜", label: "Ask me", role_id: "", color: "gray" }
    ]
  },
  "Region": {
    title: "🌍 Where are you from?",
    description: "Tag your region so people know roughly when you're online.",
    behavior: "pick_one",
    roles: [
      { emoji: "🇺🇸", label: "North America", role_id: "", color: "blue" },
      { emoji: "🇧🇷", label: "Latin America", role_id: "", color: "green" },
      { emoji: "🇪🇺", label: "Europe", role_id: "", color: "blue" },
      { emoji: "🌍", label: "Africa / Middle East", role_id: "", color: "gray" },
      { emoji: "🇯🇵", label: "Asia", role_id: "", color: "red" },
      { emoji: "🇦🇺", label: "Oceania", role_id: "", color: "green" }
    ]
  },
  "Game Pings": {
    title: "🎮 Game pings",
    description: "Pick which games you want to be pinged for.",
    behavior: "multi",
    roles: [
      { emoji: "🎯", label: "Valorant", role_id: "", color: "red" },
      { emoji: "🪂", label: "Fortnite", role_id: "", color: "blue" },
      { emoji: "🦾", label: "Apex Legends", role_id: "", color: "gray" },
      { emoji: "💣", label: "CS2", role_id: "", color: "gray" },
      { emoji: "🧙", label: "League of Legends", role_id: "", color: "blue" },
      { emoji: "⛏️", label: "Minecraft", role_id: "", color: "green" }
    ]
  },
  "Notifications": {
    title: "🔔 Notification opt-ins",
    description: "Choose what to get pinged for.",
    behavior: "multi",
    roles: [
      { emoji: "📢", label: "Announcements", role_id: "", color: "blue" },
      { emoji: "🎉", label: "Events", role_id: "", color: "green" },
      { emoji: "🎁", label: "Giveaways", role_id: "", color: "blue" },
      { emoji: "📊", label: "Polls", role_id: "", color: "gray" },
      { emoji: "🛠️", label: "Updates", role_id: "", color: "gray" },
      { emoji: "🎬", label: "Streams", role_id: "", color: "red" }
    ]
  },
  "Verify Gate": {
    title: "✅ Verify to enter",
    description: "Confirm you've read the rules to unlock the rest of the server.",
    behavior: "verify",
    roles: [
      { emoji: "✅", label: "I agree to the rules", role_id: "", color: "green" }
    ]
  }
};

export default function ReactionRoleBuilder({
  isOpen,
  onClose,
  initialData,
  guildId,
  serverData,
  onSaveSuccess,
  onDeleteSuccess,
}) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Core State
  const [panelType, setPanelType] = useState(initialData?.panel_type || "buttons");
  const [embedTitle, setEmbedTitle] = useState("");
  const [embedDesc, setEmbedDesc] = useState("");
  const [embedColor, setEmbedColor] = useState("#5865F2");
  const [channelId, setChannelId] = useState("");
  const [components, setComponents] = useState([]);
  const [emojiPickerIndex, setEmojiPickerIndex] = useState(null);

  // Behavior & Settings
  const [behavior, setBehavior] = useState(initialData?.mode || "multi");
  const [postToDiscord, setPostToDiscord] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPanelType(initialData.panel_type || "buttons");
        setChannelId(initialData.channel_id || "");
        setBehavior(initialData.mode || "multi");
        const e = initialData.embed || {};
        setEmbedTitle(e.title || "Role Selection");
        setEmbedDesc(e.description || "");
        setEmbedColor(e.color || "#5865F2");
        setPostToDiscord(initialData.post_to_discord ?? true);

        const loadedComponents = initialData.components || initialData.roles || [];
        setComponents(
          loadedComponents.map((c) => ({
            ...c,
            color: c.color || "blue",
            _id: Math.random().toString(36).substr(2, 9),
          }))
        );
      } else {
        setPanelType("buttons");
        setChannelId("");
        setEmbedTitle("Role Selection");
        setEmbedDesc("Click a button below to choose your roles.");
        setEmbedColor("#5865F2");
        setBehavior("multi");
        setComponents([]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const channels = serverData?.channels || [];
  const roles = serverData?.roles || [];

  const handleApplyTemplate = (templateName) => {
    const t = PREDEFINED_TEMPLATES[templateName];
    if (!t) return;
    setEmbedTitle(t.title);
    setEmbedDesc(t.description);
    setBehavior(t.behavior);
    setComponents(
      t.roles.map((r) => ({
        ...r,
        _id: Math.random().toString(36).substr(2, 9),
      }))
    );
  };

  const handleSave = async () => {
    if (!channelId) return toast.error("Channel is required");
    if (components.length === 0) return toast.error("At least one role is required");

    setIsSaving(true);
    try {
      const payload = {
        name: embedTitle || "Reaction Role",
        channel_id: channelId,
        panel_type: panelType,
        mode: behavior,
        post_to_discord: postToDiscord,
        embed: {
          title: embedTitle,
          description: embedDesc,
          color: embedColor,
        },
        components: components.map((c) => ({
          label: c.label || "Role",
          emoji: c.emoji || "",
          role_id: c.role_id,
          color: c.color || "blue",
        })),
      };

      if (initialData?.id) payload.id = initialData.id;

      const url = `/api/reactionroles/${guildId}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Reaction role saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error saving reaction role");
    } finally {
      setIsSaving(false);
    }
  };

  const addComponent = () => {
    if (components.length >= 25) return toast.error("Max 25 roles allowed.");
    setComponents([
      ...components,
      {
        _id: Math.random().toString(36).substr(2, 9),
        label: "New Role",
        emoji: "",
        role_id: "",
        color: "blue",
      },
    ]);
  };

  const updateComponent = (index, field, value) => {
    const newComps = [...components];
    newComps[index][field] = value;
    setComponents(newComps);
  };

  const removeComponent = (index) => {
    const newComps = [...components];
    newComps.splice(index, 1);
    setComponents(newComps);
  };

  const moveComponent = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === components.length - 1) return;
    const newComps = [...components];
    const temp = newComps[index];
    newComps[index] = newComps[index + direction];
    newComps[index + direction] = temp;
    setComponents(newComps);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 ring-1 ring-rose-500/15 flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-rose-400"
              >
                <path d="M22 11v1a10 10 0 1 1-9-10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1={9} x2={9.01} y1={9} y2={9} />
                <line x1={15} x2={15.01} y1={9} y2={9} />
                <path d="M16 5h6" />
                <path d="M19 2v6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {initialData ? "Edit reaction panel" : "New reaction panel"}
              </p>
              <p className="text-[11px] text-neutral-400">
                Create an interactive panel using buttons or classic reactions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-full">
            {/* Left Column */}
            <div className="divide-y divide-neutral-800/60">
              {/* Panel Type Selection */}
              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-400 mb-2.5">
                  Panel Type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPanelType("buttons")}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      panelType === "buttons"
                        ? "bg-white text-black border-white shadow-sm font-semibold"
                        : "bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width={18} height={12} x={3} y={6} rx={2} />
                      <circle cx={8} cy={12} r={1} fill="currentColor" />
                      <circle cx={16} cy={12} r={1} fill="currentColor" />
                    </svg>
                    <span>Buttons</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">
                      Modern
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPanelType("reactions")}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      panelType === "reactions"
                        ? "bg-white text-black border-white shadow-sm font-semibold"
                        : "bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx={12} cy={12} r={10} />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1={9} x2={9.01} y1={9} y2={9} />
                      <line x1={15} x2={15.01} y1={9} y2={9} />
                    </svg>
                    <span>Reactions</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">
                      Classic
                    </span>
                  </button>
                </div>
              </div>

              {/* Start with a template */}
              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-400 mb-2">
                  Start with a template
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(PREDEFINED_TEMPLATES)
                    .filter((k) => k !== "Normal")
                    .map((tName) => (
                      <button
                        key={tName}
                        onClick={() => handleApplyTemplate(tName)}
                        type="button"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-all active:scale-[0.96]"
                      >
                        {tName}
                      </button>
                    ))}
                </div>
              </div>

              {/* Behavior */}
              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-400 mb-2">
                  Behavior Mode
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800">
                  <button
                    onClick={() => setBehavior("multi")}
                    type="button"
                    className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      behavior === "multi"
                        ? "text-black bg-white shadow-sm font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 17 2 2 4-4" />
                      <path d="m3 7 2 2 4-4" />
                      <path d="M13 6h8" />
                      <path d="M13 12h8" />
                      <path d="M13 18h8" />
                    </svg>
                    <span>Multi-pick</span>
                  </button>

                  <button
                    onClick={() => setBehavior("pick_one")}
                    type="button"
                    className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      behavior === "pick_one"
                        ? "text-black bg-white shadow-sm font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx={12} cy={12} r={10} />
                      <circle cx={12} cy={12} r={6} />
                      <circle cx={12} cy={12} r={2} />
                    </svg>
                    <span>Pick one</span>
                  </button>

                  <button
                    onClick={() => setBehavior("verify")}
                    type="button"
                    className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      behavior === "verify"
                        ? "text-black bg-white shadow-sm font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Verify</span>
                  </button>

                  <button
                    onClick={() => setBehavior("opt_out")}
                    type="button"
                    className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      behavior === "opt_out"
                        ? "text-black bg-white shadow-sm font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx={12} cy={12} r={10} />
                      <path d="m4.9 4.9 14.2 14.2" />
                    </svg>
                    <span>Opt-out</span>
                  </button>

                  <button
                    onClick={() => setBehavior("reversed")}
                    type="button"
                    className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      behavior === "reversed"
                        ? "text-black bg-white shadow-sm font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx={12} cy={12} r={10} />
                      <path d="M8 12h8" />
                    </svg>
                    <span>Reversed</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  {behavior === "pick_one" && "Single exclusive choice: picking another role automatically removes previous roles from this panel."}
                  {behavior === "multi" && "Toggle: members can click to add or remove multiple roles freely."}
                  {behavior === "verify" && "Add only: members receive the role once, cannot remove it by clicking again."}
                  {behavior === "opt_out" && "Remove only: clicking removes the role from the member."}
                  {behavior === "reversed" && "Inverted toggle logic for special access management."}
                </p>
              </div>

              {/* Title & Description & Color */}
              <div className="px-5 py-4 space-y-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-400 mb-1.5">
                    Embed Title
                  </label>
                  <input
                    type="text"
                    maxLength={256}
                    placeholder="Pick your roles"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl h-10 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-400 mb-1.5">
                    Embed Description
                  </label>
                  <textarea
                    maxLength={1024}
                    rows={2}
                    placeholder={panelType === "reactions" ? "Leave empty to automatically list roles with emojis" : "Optional instructions..."}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 resize-none transition-colors"
                    value={embedDesc}
                    onChange={(e) => setEmbedDesc(e.target.value)}
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-400 mb-2">
                    Embed Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setEmbedColor(p.value)}
                        className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center ${
                          embedColor.toLowerCase() === p.value.toLowerCase()
                            ? "ring-2 ring-white scale-110"
                            : "hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: p.value }}
                        title={p.name}
                      >
                        {embedColor.toLowerCase() === p.value.toLowerCase() && (
                          <svg
                            className="w-3.5 h-3.5 text-white drop-shadow"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-2">
                      <input
                        type="color"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="w-24 h-7 px-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 uppercase focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel & Auto-Post */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-400 mb-1.5">
                    Target Channel <span className="text-amber-400 normal-case tracking-normal">· required</span>
                  </label>
                  <div className="rounded-xl transition-shadow">
                    <CustomSelect
                      options={channels.map((c) => ({
                        value: c.id,
                        label: `#${c.name}`,
                      }))}
                      value={channelId}
                      onChange={setChannelId}
                      placeholder="Select a Discord channel…"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-neutral-800/40 border border-neutral-800">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-white">Post to Discord on save</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Sends or updates the message in the channel above immediately upon saving.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Toggle checked={postToDiscord} onChange={setPostToDiscord} />
                  </div>
                </div>
              </div>

              {/* Roles List */}
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-400">
                    Configured Roles
                  </p>
                  <span className="text-[11px] text-neutral-400 tabular-nums">
                    {components.length}/25 roles
                  </span>
                </div>

                <div className="space-y-2">
                  {components.map((comp, idx) => (
                    <div
                      key={comp._id}
                      className="group flex items-center gap-2 p-2.5 bg-neutral-800/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors"
                    >
                      {/* Drag / reorder handles */}
                      <div className="flex flex-col items-center justify-center text-neutral-500">
                        <button
                          onClick={() => moveComponent(idx, -1)}
                          disabled={idx === 0}
                          type="button"
                          aria-label="Move up"
                          className="text-xs px-1 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveComponent(idx, 1)}
                          disabled={idx === components.length - 1}
                          type="button"
                          aria-label="Move down"
                          className="text-xs px-1 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Emoji button */}
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setEmojiPickerIndex(emojiPickerIndex === idx ? null : idx)
                          }
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-lg hover:bg-neutral-700 hover:border-neutral-600 transition-colors"
                          title="Pick emoji"
                        >
                          <EmojiDisplay
                            emoji={comp.emoji}
                            serverEmojis={serverData?.emojis}
                            className="w-5 h-5"
                            fallback={
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={18}
                                height={18}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-neutral-500"
                              >
                                <circle cx={12} cy={12} r={10} />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1={9} y1={9} x2={9.01} y2={9} />
                                <line x1={15} y1={9} x2={15.01} y2={9} />
                              </svg>
                            }
                          />
                        </button>
                        {emojiPickerIndex === idx && (
                          <EmojiPicker
                            serverEmojis={serverData?.emojis}
                            onSelect={(emoji) => {
                              updateComponent(idx, "emoji", emoji);
                              setEmojiPickerIndex(null);
                            }}
                            onClose={() => setEmojiPickerIndex(null)}
                          />
                        )}
                      </div>

                      {/* Role selection dropdown */}
                      <div className="flex-1 min-w-0">
                        <CustomSelect
                          options={roles.map((r) => {
                            const hex = r.color
                              ? `#${r.color.toString(16).padStart(6, "0")}`
                              : undefined;
                            return { value: r.id, label: r.name, color: hex };
                          })}
                          value={comp.role_id || ""}
                          onChange={(val) => {
                            updateComponent(idx, "role_id", val);
                            if (!comp.label || comp.label === "New Role" || comp.label === "Role") {
                              const rObj = roles.find((r) => r.id === val);
                              if (rObj) updateComponent(idx, "label", rObj.name);
                            }
                          }}
                          placeholder="Select role…"
                        />
                      </div>

                      {/* Label input */}
                      <div className="w-32 sm:w-40 flex-shrink-0">
                        <input
                          type="text"
                          placeholder={panelType === "buttons" ? "Button label" : "Role name"}
                          maxLength={80}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl h-10 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
                          value={comp.label || ""}
                          onChange={(e) => updateComponent(idx, "label", e.target.value)}
                        />
                      </div>

                      {/* Button style color picker (only visible in Buttons mode) */}
                      {panelType === "buttons" && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {BUTTON_STYLES.map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => updateComponent(idx, "color", st.id)}
                              className={`w-7 h-7 rounded-lg ${st.bg} transition-transform flex items-center justify-center ${
                                (comp.color || "blue") === st.id
                                  ? "ring-2 ring-white scale-110"
                                  : "opacity-60 hover:opacity-100"
                              }`}
                              title={st.label}
                            >
                              {(comp.color || "blue") === st.id && (
                                <svg
                                  className="w-3.5 h-3.5 text-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => removeComponent(idx)}
                        type="button"
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                        title="Remove role"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addComponent}
                    type="button"
                    className="flex items-center justify-center gap-1.5 w-full h-10 border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/40 transition-all active:scale-[0.98]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add role option
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Discord Preview */}
            <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-neutral-800/60 bg-neutral-900/40">
              <div className="px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neutral-400"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    Discord Preview
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-medium">
                  {panelType === "buttons" ? "Button Panel" : "Reaction Panel"}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-[#313338] shadow-md">
                  {/* Discord Chat Header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#2b2d31] border-b border-neutral-900/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="text-neutral-400"
                    >
                      <line x1={4} x2={20} y1={9} y2={9} />
                      <line x1={4} x2={20} y1={15} y2={15} />
                      <line x1={10} x2={8} y1={3} y2={21} />
                      <line x1={16} x2={14} y1={3} y2={21} />
                    </svg>
                    <span className="text-[12px] font-medium text-neutral-300 truncate">
                      {channels.find((c) => c.id === channelId)?.name || "select-channel"}
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="p-3">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5865F2] flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src="/img/logo.png"
                          alt="Orbit"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[13px] font-semibold text-white">Orbit</span>
                          <span className="inline-flex items-center px-1 py-0.2 rounded bg-[#5865F2] text-[9px] font-bold text-white uppercase tracking-wider">
                            BOT
                          </span>
                          <span className="text-[11px] text-[#949ba4] ml-1">Today at 12:00 PM</span>
                        </div>

                        {/* Embed Box */}
                        <div className="flex rounded-md overflow-hidden max-w-sm mt-1">
                          <div
                            className="w-1 flex-shrink-0"
                            style={{ backgroundColor: embedColor || "#5865F2" }}
                          />
                          <div className="bg-[#2b2d31] py-2.5 px-3 flex-1 min-w-0 border-r border-t border-b border-[#232428] rounded-r-md">
                            <p className="text-[13px] font-bold text-white mb-1 break-words">
                              {embedTitle || "Untitled Reaction Role"}
                            </p>

                            {embedDesc ? (
                              <p className="text-[12px] text-[#dbdee1] leading-relaxed break-words whitespace-pre-wrap">
                                {embedDesc}
                              </p>
                            ) : panelType === "reactions" ? (
                              <div className="text-[12px] text-[#dbdee1] space-y-1">
                                {components.map((comp) => {
                                  const rName =
                                    roles.find((r) => r.id === comp.role_id)?.name ||
                                    comp.label ||
                                    "Role";
                                  return (
                                    <div key={comp._id} className="flex items-center gap-1.5">
                                      <EmojiDisplay
                                        emoji={comp.emoji}
                                        serverEmojis={serverData?.emojis}
                                        className="w-4 h-4"
                                      />
                                      <span className="font-semibold text-sky-400">@{rName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}

                            <div className="mt-2 pt-1.5 border-t border-[#35373c] flex items-center justify-between text-[10px] text-[#949ba4]">
                              <span>
                                Mode:{" "}
                                <strong className="text-white capitalize">
                                  {behavior.replace("_", " ")}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Buttons Grid Preview */}
                        {panelType === "buttons" && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-sm">
                            {components.map((comp) => {
                              let btnClass = "bg-[#5865F2] hover:bg-[#4752c4]";
                              if (comp.color === "gray") btnClass = "bg-[#4e5058] hover:bg-[#6d6f78]";
                              else if (comp.color === "green") btnClass = "bg-[#248046] hover:bg-[#1a6334]";
                              else if (comp.color === "red") btnClass = "bg-[#da373c] hover:bg-[#a1282c]";

                              return (
                                <button
                                  key={comp._id}
                                  type="button"
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-white shadow-sm transition-colors cursor-pointer ${btnClass}`}
                                >
                                  {comp.emoji && (
                                    <EmojiDisplay
                                      emoji={comp.emoji}
                                      serverEmojis={serverData?.emojis}
                                      className="w-4 h-4"
                                    />
                                  )}
                                  <span className="truncate max-w-[120px]">
                                    {comp.label || "Role"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Reactions Badges Preview */}
                        {panelType === "reactions" && (
                          <div className="flex flex-wrap gap-1.5 mt-2 max-w-sm">
                            {components.map((comp) => (
                              <div
                                key={comp._id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] border border-transparent hover:border-[#3b3e45] text-white text-xs cursor-pointer transition-colors"
                              >
                                {comp.emoji && (
                                  <EmojiDisplay
                                    emoji={comp.emoji}
                                    serverEmojis={serverData?.emojis}
                                    className="w-4 h-4"
                                  />
                                )}
                                <span className="text-[11px] font-semibold text-[#949ba4]">1</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-neutral-800 flex-shrink-0 bg-neutral-900">
          <button
            onClick={onClose}
            type="button"
            className="text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {components.length === 0 && (
              <span className="text-[11px] text-amber-400">
                Add at least one role to save
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || components.length === 0 || !channelId}
              className="flex items-center gap-2 bg-white text-black font-semibold text-xs sm:text-sm rounded-xl h-10 px-5 hover:bg-neutral-200 transition-all active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{isSaving ? "Saving..." : "Save & Deploy Panel"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
