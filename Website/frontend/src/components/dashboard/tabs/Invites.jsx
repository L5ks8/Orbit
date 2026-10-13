import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../ui/Toast";
import SaveBar from "../../ui/SaveBar";
import CustomSelect from "../../ui/CustomSelect";
import { UserPlus, Medal, Settings, Gift, Send, Trash2, Plus, Sparkles, Award } from "lucide-react";

export default function Invites({ serverData, setServerData }) {
  const { guildId } = useParams();
  const toast = useToast();

  const invCfg = serverData?.config?.invites || {};
  const channels = serverData?.channels || [];
  const roles = serverData?.roles || [];
  const leaderboard = invCfg.leaderboard || [];

  const [enabled, setEnabled] = useState(invCfg.enabled ?? true);
  const [trackLeaves, setTrackLeaves] = useState(invCfg.track_leaves ?? true);
  const [countRejoins, setCountRejoins] = useState(invCfg.count_rejoins ?? false);
  const [showInviterCount, setShowInviterCount] = useState(invCfg.show_inviter_count ?? true);
  const [countVanity, setCountVanity] = useState(invCfg.count_vanity ?? false);

  const [rewards, setRewards] = useState(invCfg.rewards || []);
  const [newRewardInvites, setNewRewardInvites] = useState("");
  const [newRewardRole, setNewRewardRole] = useState("");

  const autoPostCfg = invCfg.auto_post || {};
  const [autoPostEnabled, setAutoPostEnabled] = useState(autoPostCfg.enabled ?? false);
  const [autoPostChannel, setAutoPostChannel] = useState(autoPostCfg.channel_id || "");
  const [autoPostTitle, setAutoPostTitle] = useState(autoPostCfg.title || "Invite Leaderboard");
  const [autoPostColor, setAutoPostColor] = useState(autoPostCfg.color || "#5865F2");
  const [autoPostInterval, setAutoPostInterval] = useState(autoPostCfg.interval || "1h");

  const [saving, setSaving] = useState(false);

  const getPayload = () => ({
    enabled,
    track_leaves: trackLeaves,
    count_rejoins: countRejoins,
    show_inviter_count: showInviterCount,
    count_vanity: countVanity,
    rewards,
    auto_post: {
      enabled: autoPostEnabled,
      channel_id: autoPostChannel,
      title: autoPostTitle,
      color: autoPostColor,
      interval: autoPostInterval,
    },
  });

  const [initialStateStr, setInitialStateStr] = useState(() => JSON.stringify(getPayload()));

  useEffect(() => {
    if (serverData?.config?.invites) {
      const c = serverData.config.invites;
      setEnabled(c.enabled ?? true);
      setTrackLeaves(c.track_leaves ?? true);
      setCountRejoins(c.count_rejoins ?? false);
      setShowInviterCount(c.show_inviter_count ?? true);
      setCountVanity(c.count_vanity ?? false);
      setRewards(Array.isArray(c.rewards) ? c.rewards : []);
      const ap = c.auto_post || {};
      setAutoPostEnabled(ap.enabled ?? false);
      setAutoPostChannel(ap.channel_id || "");
      setAutoPostTitle(ap.title || "Invite Leaderboard");
      setAutoPostColor(ap.color || "#5865F2");
      setAutoPostInterval(ap.interval || "1h");

      setInitialStateStr(
        JSON.stringify({
          enabled: c.enabled ?? true,
          track_leaves: c.track_leaves ?? true,
          count_rejoins: c.count_rejoins ?? false,
          show_inviter_count: c.show_inviter_count ?? true,
          count_vanity: c.count_vanity ?? false,
          rewards: Array.isArray(c.rewards) ? c.rewards : [],
          auto_post: {
            enabled: ap.enabled ?? false,
            channel_id: ap.channel_id || "",
            title: ap.title || "Invite Leaderboard",
            color: ap.color || "#5865F2",
            interval: ap.interval || "1h",
          },
        })
      );
    }
  }, [serverData?.config?.invites]);

  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = initialStateStr && currentPayloadStr !== initialStateStr;

  const handleReset = () => {
    if (initialStateStr) {
      const p = JSON.parse(initialStateStr);
      setEnabled(p.enabled ?? true);
      setTrackLeaves(p.track_leaves ?? true);
      setCountRejoins(p.count_rejoins ?? false);
      setShowInviterCount(p.show_inviter_count ?? true);
      setCountVanity(p.count_vanity ?? false);
      setRewards(p.rewards || []);
      const ap = p.auto_post || {};
      setAutoPostEnabled(ap.enabled ?? false);
      setAutoPostChannel(ap.channel_id || "");
      setAutoPostTitle(ap.title || "Invite Leaderboard");
      setAutoPostColor(ap.color || "#5865F2");
      setAutoPostInterval(ap.interval || "1h");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Saving invite settings...");
    const payload = getPayload();
    try {
      const res = await fetch(`/api/config/${guildId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ invites: payload }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error("Failed to save: " + data.error, { id: toastId });
      } else {
        setInitialStateStr(JSON.stringify(payload));
        if (setServerData) {
          setServerData((prev) => ({
            ...prev,
            config: {
              ...(prev?.config || {}),
              invites: {
                ...(prev?.config?.invites || {}),
                ...payload,
              },
            },
          }));
        }
        toast.success("Invite settings saved successfully!", { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving settings.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleAddReward = () => {
    const count = parseInt(newRewardInvites);
    if (!count || count <= 0) {
      toast.error("Please enter a valid number of invites.");
      return;
    }
    if (!newRewardRole) {
      toast.error("Please select a role to reward.");
      return;
    }
    const exists = rewards.some((r) => r.invites === count && r.role_id === newRewardRole);
    if (exists) {
      toast.error("This milestone reward already exists.");
      return;
    }
    setRewards([...rewards, { invites: count, role_id: newRewardRole }]);
    setNewRewardInvites("");
    setNewRewardRole("");
  };

  const handleRemoveReward = (index) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const channelOptions = channels.map((c) => ({ value: String(c.id), label: `# ${c.name}` }));
  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: `@ ${r.name}`,
    color: r.color || "#99aab5",
  }));

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const rest = leaderboard.slice(3);

  const TailwindToggle = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        checked ? "bg-white" : "bg-neutral-800"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-[21px] bg-black" : "translate-x-[3px] bg-neutral-400"
        }`}
      />
    </button>
  );

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">
      {/* Header */}
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-blue-400 flex-shrink-0">
              <UserPlus size={20} />
            </span>
            <h1 className="text-xl font-semibold text-white truncate">Invite Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">
              {enabled ? "Tracking Active" : "Tracking Paused"}
            </span>
            <TailwindToggle checked={enabled} onChange={() => setEnabled(!enabled)} />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Settings / Right Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        {/* Left Column: Config Panels */}
        <div className="flex flex-col gap-5">
          {/* Tracking Options Card */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Settings size={18} className="text-blue-400" />
                <h3 className="text-base font-semibold text-white">Tracking Rules</h3>
              </div>
            </div>

            <div className="divide-y divide-neutral-800/60">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <span className="text-sm font-medium text-white block">Track leaves</span>
                  <span className="text-xs text-neutral-400 block mt-0.5">
                    Deduct an invite from the inviter when a member leaves the server.
                  </span>
                </div>
                <TailwindToggle checked={trackLeaves} onChange={() => setTrackLeaves(!trackLeaves)} />
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <span className="text-sm font-medium text-white block">Count rejoins</span>
                  <span className="text-xs text-neutral-400 block mt-0.5">
                    Allow members who rejoin to award an invite count again.
                  </span>
                </div>
                <TailwindToggle checked={countRejoins} onChange={() => setCountRejoins(!countRejoins)} />
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <span className="text-sm font-medium text-white block">Show inviter count</span>
                  <span className="text-xs text-neutral-400 block mt-0.5">
                    Include the inviter's total invite tally in join logs and welcome messages.
                  </span>
                </div>
                <TailwindToggle
                  checked={showInviterCount}
                  onChange={() => setShowInviterCount(!showInviterCount)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <span className="text-sm font-medium text-white block">Count vanity URL joins</span>
                  <span className="text-xs text-neutral-400 block mt-0.5">
                    Track joins through custom Discord server vanity URLs (discord.gg/vanity).
                  </span>
                </div>
                <TailwindToggle checked={countVanity} onChange={() => setCountVanity(!countVanity)} />
              </div>
            </div>
          </div>

          {/* Milestone Role Rewards Card */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Gift size={18} className="text-purple-400" />
                <h3 className="text-base font-semibold text-white">Invite Role Rewards</h3>
              </div>
              <span className="text-xs text-neutral-400">{rewards.length} configured</span>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automatically award roles when members reach specific invite thresholds.
              </p>

              {/* Add Milestone Row */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                <div className="w-24 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    placeholder="Invites"
                    value={newRewardInvites}
                    onChange={(e) => setNewRewardInvites(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs text-center placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <CustomSelect
                    options={roleOptions}
                    value={newRewardRole}
                    onChange={setNewRewardRole}
                    placeholder="Select reward role..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddReward}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-colors flex-shrink-0"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Rewards List */}
              {rewards.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
                  <Award size={24} className="text-neutral-700" />
                  No milestone rewards configured yet.
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-1">
                  {rewards.map((r, i) => {
                    const matchedRole = roles.find((role) => String(role.id) === String(r.role_id));
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-800/40 rounded-xl border border-neutral-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 tabular-nums">
                            {r.invites} {r.invites === 1 ? "Invite" : "Invites"}
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{
                              color: matchedRole?.color || "#fff",
                              backgroundColor: "rgba(255,255,255,0.05)",
                            }}
                          >
                            @{matchedRole?.name || r.role_id}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveReward(i)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          title="Remove reward"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Auto Post Leaderboard Embed Card */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Auto Post Leaderboard</h3>
              </div>
              <TailwindToggle
                checked={autoPostEnabled}
                onChange={() => setAutoPostEnabled(!autoPostEnabled)}
              />
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automatically post and update a real-time invite leaderboard embed in a designated channel.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300">Target Channel</label>
                <CustomSelect
                  options={channelOptions}
                  value={autoPostChannel}
                  onChange={setAutoPostChannel}
                  placeholder="# select announcement channel..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-300">Embed Title</label>
                  <input
                    type="text"
                    value={autoPostTitle}
                    onChange={(e) => setAutoPostTitle(e.target.value)}
                    placeholder="Invite Leaderboard"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-300">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={autoPostColor}
                      onChange={(e) => setAutoPostColor(e.target.value)}
                      className="w-10 h-9 p-0.5 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-mono text-neutral-400 uppercase">{autoPostColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-medium text-neutral-300">Update Interval</label>
                <div className="grid grid-cols-5 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                  {["5m", "15m", "30m", "1h", "6h"].map((intvl) => (
                    <button
                      key={intvl}
                      type="button"
                      onClick={() => setAutoPostInterval(intvl)}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        autoPostInterval === intvl
                          ? "bg-neutral-800 text-white font-semibold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {intvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real Top Inviters Leaderboard */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <Medal size={18} className="text-amber-400" />
              <h3 className="text-base font-semibold text-white">Top Inviters</h3>
            </div>
            <span className="text-xs text-neutral-500 tabular-nums">
              {leaderboard.length} inviters
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-600">
                <Medal size={22} />
              </div>
              <p className="text-sm font-medium text-neutral-300">The podium is empty</p>
              <p className="text-xs text-neutral-500 max-w-[220px]">
                Invite stats will automatically appear here once users join through trackable invite links.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Podium */}
              <div className="relative flex items-end justify-center px-4 pt-6 pb-2 gap-2 border-b border-neutral-800/80 bg-gradient-to-b from-neutral-800/20 to-transparent">
                {/* #2 Silver */}
                <div className="flex flex-col items-center flex-1 max-w-[100px]">
                  {top2 ? (
                    <>
                      <div className="w-11 h-11 rounded-full border-2 border-slate-300 overflow-hidden bg-neutral-800 shadow-md">
                        <img
                          src={top2.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-[90px] mt-1.5">
                        {top2.name}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 tabular-nums">
                        {top2.total} inv
                      </span>
                      <div className="w-full h-14 bg-slate-300/10 rounded-t-lg mt-2 flex items-center justify-center text-sm font-bold text-slate-400">
                        #2
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-14 bg-neutral-800/20 rounded-t-lg mt-10"></div>
                  )}
                </div>

                {/* #1 Gold */}
                <div className="flex flex-col items-center flex-1 max-w-[110px]">
                  {top1 ? (
                    <>
                      <div className="w-14 h-14 rounded-full border-2 border-amber-400 overflow-hidden bg-neutral-800 shadow-lg ring-4 ring-amber-400/20">
                        <img
                          src={top1.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[100px] mt-1.5">
                        {top1.name}
                      </span>
                      <span className="text-xs font-extrabold text-amber-400 tabular-nums">
                        {top1.total} inv
                      </span>
                      <div className="w-full h-20 bg-amber-400/15 rounded-t-lg mt-2 flex items-center justify-center text-base font-black text-amber-400">
                        #1
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-20 bg-neutral-800/20 rounded-t-lg mt-6"></div>
                  )}
                </div>

                {/* #3 Bronze */}
                <div className="flex flex-col items-center flex-1 max-w-[100px]">
                  {top3 ? (
                    <>
                      <div className="w-11 h-11 rounded-full border-2 border-amber-700 overflow-hidden bg-neutral-800 shadow-md">
                        <img
                          src={top3.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-[90px] mt-1.5">
                        {top3.name}
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 tabular-nums">
                        {top3.total} inv
                      </span>
                      <div className="w-full h-10 bg-amber-700/10 rounded-t-lg mt-2 flex items-center justify-center text-sm font-bold text-amber-600">
                        #3
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-10 bg-neutral-800/20 rounded-t-lg mt-14"></div>
                  )}
                </div>
              </div>

              {/* Ranks 4 to 10 */}
              <div className="divide-y divide-neutral-800/40 max-h-[360px] overflow-y-auto">
                {rest.map((u, idx) => (
                  <div
                    key={u.user_id || idx}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/30 transition-colors"
                  >
                    <span className="text-xs font-semibold text-neutral-500 w-5 text-right tabular-nums">
                      #{idx + 4}
                    </span>
                    <img
                      src={u.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                      alt=""
                      className="w-7 h-7 rounded-full bg-neutral-800 object-cover"
                      onError={(e) => {
                        e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-neutral-500">
                        {u.regular} reg · {u.left} left · {u.fake} fake
                      </p>
                    </div>
                    <span className="text-xs font-bold text-white tabular-nums">
                      {u.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Floating SaveBar */}
      <SaveBar show={isDirty} onReset={handleReset} onSave={handleSave} saving={saving} />
    </main>
  );
}
