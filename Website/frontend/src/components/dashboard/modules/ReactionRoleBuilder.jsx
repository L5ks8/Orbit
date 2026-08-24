import React, { useState, useEffect } from "react";
import { useToast } from "../../ui/Toast";

const ButtonColors = [
  { value: "Primary", label: "Blurple" },
  { value: "Secondary", label: "Gray" },
  { value: "Success", label: "Green" },
  { value: "Danger", label: "Red" },
];

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
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Core State
  const [name, setName] = useState("");
  const [channelId, setChannelId] = useState("");
  const [content, setContent] = useState("");
  const [buttonType, setButtonType] = useState("toggle"); // toggle, add_only, remove_only

  // Embed State
  const [embedTitle, setEmbedTitle] = useState("");
  const [embedDesc, setEmbedDesc] = useState("");
  const [embedColor, setEmbedColor] = useState("#5865F2");
  const [embedAuthorName, setEmbedAuthorName] = useState("");
  const [embedAuthorIcon, setEmbedAuthorIcon] = useState("");
  const [embedImage, setEmbedImage] = useState("");
  const [embedThumbnail, setEmbedThumbnail] = useState("");
  const [embedFooterText, setEmbedFooterText] = useState("");
  const [embedFooterIcon, setEmbedFooterIcon] = useState("");
  const [embedFields, setEmbedFields] = useState([]);

  // Components (Buttons) State
  const [components, setComponents] = useState([]);

  // Init Data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setChannelId(initialData.channel_id || "");
        setContent(initialData.content || "");
        setButtonType(initialData.button_type || "toggle");

        const e = initialData.embed || {};
        setEmbedTitle(e.title || "");
        setEmbedDesc(e.description || "");
        setEmbedColor(e.color || "#5865F2");
        setEmbedAuthorName(e.author_name || "");
        setEmbedAuthorIcon(e.author_icon_url || "");
        setEmbedImage(e.image_url || "");
        setEmbedThumbnail(e.thumbnail_url || "");
        setEmbedFooterText(e.footer_text || "");
        setEmbedFooterIcon(e.footer_icon_url || "");
        setEmbedFields(e.fields || []);

        setComponents((initialData.components || []).map(c => ({
          ...c,
          _id: Math.random().toString(36).substr(2, 9)
        })));
      } else {
        // Reset
        setName("New Reaction Role");
        setChannelId("");
        setContent("");
        setButtonType("toggle");
        setEmbedTitle("Welcome!");
        setEmbedDesc("Please select your roles below.");
        setEmbedColor("#5865F2");
        setEmbedAuthorName("");
        setEmbedAuthorIcon("");
        setEmbedImage("");
        setEmbedThumbnail("");
        setEmbedFooterText("");
        setEmbedFooterIcon("");
        setEmbedFields([]);
        setComponents([]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const channels = serverData?.channels || [];
  const roles = serverData?.roles || [];

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");

    setIsSaving(true);
    const toastId = toast.loading("Saving Reaction Role...");

    const payload = {
      name,
      channel_id: channelId,
      content,
      button_type: buttonType,
      embed: {
        title: embedTitle,
        description: embedDesc,
        color: embedColor,
        author_name: embedAuthorName,
        author_icon_url: embedAuthorIcon,
        image_url: embedImage,
        thumbnail_url: embedThumbnail,
        footer_text: embedFooterText,
        footer_icon_url: embedFooterIcon,
        fields: embedFields.filter((f) => f.name || f.value),
      },
      components: components
        .filter((c) => c.role_id)
        .map((c) => ({
          role_id: c.role_id,
          emoji: c.emoji,
          label: c.label,
          color: c.color || "Primary",
        })),
    };

    try {
      const url = initialData?.id
        ? `/api/reactionroles/${guildId}?id=${initialData.id}`
        : `/api/reactionroles/${guildId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Reaction Role saved!", { id: toastId });
        if (onSaveSuccess) onSaveSuccess();
        if (!initialData?.id) onClose(); // Close if it was a new creation, otherwise keep open to let them send it
      } else {
        const err = await res.text();
        toast.error("Failed to save: " + err, { id: toastId });
      }
    } catch (e) {
      toast.error("Error saving: " + e, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!initialData?.id) {
      return toast.error("Please save the Reaction Role first.");
    }
    if (!channelId) {
      return toast.error("Please select a channel.");
    }

    setIsSending(true);
    const toastId = toast.loading("Sending to channel...");

    try {
      const res = await fetch(`/api/action/${guildId}/send_reactionrole`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: initialData.id, channel_id: channelId }),
      });

      if (res.ok) {
        toast.success("Reaction Role panel sent!", { id: toastId });
      } else {
        const err = await res.text();
        toast.error("Failed to send: " + err, { id: toastId });
      }
    } catch (e) {
      toast.error("Error sending: " + e, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return onClose();

    if (!confirm("Are you sure you want to delete this Reaction Role?")) return;

    setIsDeleting(true);
    const toastId = toast.loading("Deleting...");

    try {
      const res = await fetch(
        `/api/reactionroles/${guildId}/${initialData.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        toast.success("Reaction Role deleted.", { id: toastId });
        if (onDeleteSuccess) onDeleteSuccess();
        onClose();
      } else {
        toast.error("Failed to delete.", { id: toastId });
      }
    } catch (e) {
      toast.error("Error deleting: " + e, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasEmbed =
    embedAuthorName ||
    embedTitle ||
    embedDesc ||
    embedFields.length > 0 ||
    embedImage ||
    embedFooterText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col my-8 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10">
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
                className="text-indigo-400"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            {initialData ? "Edit Reaction Role" : "Create Reaction Role"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row min-h-0 bg-neutral-900">
          {/* Left Column: Editor */}
          <div className="flex-1 p-6 space-y-8 border-r border-neutral-800 overflow-y-auto">
            {/* General Config */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
                General
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Internal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors"
                    placeholder="E.g. Notification Roles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Target Channel
                  </label>
                  <div className="relative">
                    <select
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors appearance-none"
                    >
                      <option value="">Select Channel...</option>
                      {channels.map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.name}
                        </option>
                      ))}
                    </select>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* Embed Editor */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase flex items-center justify-between">
                Message Content
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Plain Text Content (Outside Embed)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[60px] p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors resize-y"
                  placeholder="Optional text outside the embed..."
                />
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={embedTitle}
                      onChange={(e) => setEmbedTitle(e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Description
                    </label>
                    <textarea
                      value={embedDesc}
                      onChange={(e) => setEmbedDesc(e.target.value)}
                      className="w-full min-h-[100px] p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Embed Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-neutral-800 bg-neutral-900 p-1"
                      />
                      <input
                        type="text"
                        value={embedColor}
                        onChange={(e) => setEmbedColor(e.target.value)}
                        className="flex-1 h-10 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={embedAuthorName}
                      onChange={(e) => setEmbedAuthorName(e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={embedImage}
                      onChange={(e) => setEmbedImage(e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Buttons Editor */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
                  Reaction Buttons
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setComponents([
                      ...components,
                      {
                        _id: Math.random().toString(),
                        role_id: "",
                        emoji: "",
                        label: "New Role",
                        color: "Primary",
                      },
                    ])
                  }
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors border border-neutral-700"
                >
                  + Add Button
                </button>
              </div>

              <div className="space-y-3">
                {components.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm border border-dashed border-neutral-800 rounded-xl">
                    No buttons added yet. Click "+ Add Button" to create one.
                  </div>
                ) : (
                  components.map((c, i) => (
                    <div
                      key={c._id}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3"
                    >
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-medium text-neutral-500 mb-1 uppercase tracking-wider">
                            Role to Assign
                          </label>
                          <select
                            value={c.role_id}
                            onChange={(e) => {
                              const nc = [...components];
                              nc[i].role_id = e.target.value;
                              // Auto-fill label if empty
                              if (!nc[i].label && e.target.value) {
                                const r = roles.find(r => r.id === e.target.value);
                                if (r) nc[i].label = r.name;
                              }
                              setComponents(nc);
                            }}
                            className="w-full h-9 px-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-600"
                          >
                            <option value="">Select Role...</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-medium text-neutral-500 mb-1 uppercase tracking-wider">
                            Emoji
                          </label>
                          <input
                            type="text"
                            value={c.emoji}
                            onChange={(e) => {
                              const nc = [...components];
                              nc[i].emoji = e.target.value;
                              setComponents(nc);
                            }}
                            className="w-full h-9 px-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-600"
                            placeholder="e.g. 🎉"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-medium text-neutral-500 mb-1 uppercase tracking-wider">
                            Button Color
                          </label>
                          <select
                            value={c.color}
                            onChange={(e) => {
                              const nc = [...components];
                              nc[i].color = e.target.value;
                              setComponents(nc);
                            }}
                            className="w-full h-9 px-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-600"
                          >
                            {ButtonColors.map((bc) => (
                              <option key={bc.value} value={bc.value}>
                                {bc.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-medium text-neutral-500 mb-1 uppercase tracking-wider">
                            Button Label (Optional)
                          </label>
                          <input
                            type="text"
                            value={c.label}
                            onChange={(e) => {
                              const nc = [...components];
                              nc[i].label = e.target.value;
                              setComponents(nc);
                            }}
                            className="w-full h-9 px-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-600"
                            placeholder="Label text..."
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setComponents(
                            components.filter((_, idx) => idx !== i)
                          )
                        }
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg mt-5 transition-colors"
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
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Live Preview */}
          <div className="flex-1 p-6 bg-neutral-950 border-l border-neutral-800 flex flex-col hidden lg:flex">
            <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase mb-4">
              Live Preview
            </h3>
            <div className="flex-1 flex items-start justify-center">
              {/* Discord Message Preview Box */}
              <div className="w-full max-w-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                    <img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Bot Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-white">Bot Name</span>
                      <span className="px-1.5 rounded bg-indigo-500 text-[10px] font-bold text-white uppercase leading-4 tracking-wide">
                        BOT
                      </span>
                      <span className="text-xs text-neutral-400">
                        Today at 12:00 PM
                      </span>
                    </div>

                    {content && (
                      <div className="text-sm text-neutral-200 mb-2 whitespace-pre-wrap">
                        {content}
                      </div>
                    )}

                    {hasEmbed && (
                      <div
                        className="bg-[#2B2D31] rounded-lg border-l-4 p-4 mb-2 shadow-sm"
                        style={{ borderColor: embedColor || "#5865F2" }}
                      >
                        {embedAuthorName && (
                          <div className="flex items-center gap-2 mb-2">
                            {embedAuthorIcon && (
                              <img
                                src={embedAuthorIcon}
                                className="w-6 h-6 rounded-full"
                                alt=""
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            )}
                            <span className="text-sm font-semibold text-white">
                              {embedAuthorName}
                            </span>
                          </div>
                        )}
                        {embedTitle && (
                          <div className="text-base font-bold text-white mb-2">
                            {embedTitle}
                          </div>
                        )}
                        {embedDesc && (
                          <div className="text-sm text-neutral-300 whitespace-pre-wrap mb-3">
                            {embedDesc}
                          </div>
                        )}
                        {embedImage && (
                          <img
                            src={embedImage}
                            className="max-w-full rounded-lg mt-2 mb-2 max-h-64 object-cover"
                            alt=""
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                      </div>
                    )}

                    {/* Components Preview */}
                    {components.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {components.map((c) => {
                          let bgClass = "bg-[#4E5058] hover:bg-[#6D6F78]"; // Secondary (Gray)
                          if (c.color === "Primary") bgClass = "bg-[#5865F2] hover:bg-[#4752C4]";
                          else if (c.color === "Success") bgClass = "bg-[#248046] hover:bg-[#1A6334]";
                          else if (c.color === "Danger") bgClass = "bg-[#DA373C] hover:bg-[#A12828]";

                          return (
                            <div
                              key={c._id}
                              className={`px-4 py-1.5 rounded font-medium text-sm text-white flex items-center justify-center gap-2 transition-colors cursor-pointer ${bgClass}`}
                            >
                              {c.emoji && <span>{c.emoji}</span>}
                              {c.label && <span>{c.label}</span>}
                              {!c.emoji && !c.label && <span>Button</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Panel"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            {initialData && (
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !channelId}
                className="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 border border-neutral-700 shadow-sm"
              >
                {isSending ? "Sending..." : "Send to Channel"}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-white text-black hover:bg-neutral-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSaving ? "Saving..." : "Save Panel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
