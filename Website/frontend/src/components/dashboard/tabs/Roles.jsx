import React, { useState, useEffect, useRef } from "react";
import LoadingScreen from "../../ui/LoadingScreen";
import { getCache, setCache } from "../../../utils/cache";
import { useToast } from "../../ui/Toast";
import DeleteConfirmation from "../../ui/DeleteConfirmation";
import ReactionRoleBuilder from "../modules/ReactionRoleBuilder";
import SaveBar from "../../ui/SaveBar";
import CustomSelect from "../../ui/CustomSelect";

const AutoRolesDropdown = ({ selectedRoles, availableRoles, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = availableRoles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedRoles.includes(r.id),
  );

  const removeRole = (roleId) => {
    onChange(selectedRoles.filter((id) => id !== roleId));
  };

  return (
    <div className="w-full" ref={ref}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 min-h-[40px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
        >
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedRoles.length === 0 ? (
              <span className="text-neutral-500 text-sm py-0.5">
                Select roles...
              </span>
            ) : (
              selectedRoles.map((roleId) => {
                const role = availableRoles.find((r) => r.id === roleId);
                return (
                  <span
                    key={roleId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-700 text-white"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: role?.color || "#b9bbbe",
                      }}
                    />
                    {role?.name || `Unknown (${roleId})`}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRole(roleId);
                      }}
                      className="ml-0.5 text-neutral-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                );
              })
            )}
          </div>
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
            className={`lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-30 mt-1 left-0 right-0 p-1 rounded-xl bg-neutral-800 border border-neutral-700 shadow-xl max-h-[220px] overflow-hidden flex flex-col">
            <div className="px-2 py-1.5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="!w-full h-8 px-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              />
            </div>
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-neutral-500">
                  No roles found
                </div>
              ) : (
                filtered.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      onChange([...selectedRoles, role.id]);
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: role.color || "#b9bbbe" }}
                    />
                    {role.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RolesTab({ guildId, serverData, setServerData }) {
  const toast = useToast();

  const [initialStateStr, setInitialStateStr] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [postingPanelId, setPostingPanelId] = useState(null);

  const cachedData = getCache(`roles_serverData_${guildId}`) || serverData;
  const cachedRrData = getCache(`roles_reactionRoles_${guildId}`);
  const [loading, setLoading] = useState(!cachedData || !cachedRrData);

  const [reactionRoles, setReactionRoles] = useState(cachedRrData || []);
  const [rrBuilderOpen, setRrBuilderOpen] = useState(false);
  const [rrBuilderData, setRrBuilderData] = useState(null);
  const [panelToDelete, setPanelToDelete] = useState(null);

  // Auto Roles
  const jrInit = cachedData?.config?.joinroles || {};
  const [autoRolesEnabled, setAutoRolesEnabled] = useState(
    jrInit.enabled || false,
  );
  const [userRoles, setUserRoles] = useState(
    (jrInit.user_roles || []).map(String),
  );

  // Sticky Roles
  const [stickyEnabled, setStickyEnabled] = useState(
    jrInit.sticky_roles?.enabled || false,
  );
  const [stickyRestoreAll, setStickyRestoreAll] = useState(
    jrInit.sticky_roles?.restore_all ?? true,
  );

  // Booster Role
  const [boosterEnabled, setBoosterEnabled] = useState(
    jrInit.booster_role?.enabled || false,
  );
  const [boosterRoleId, setBoosterRoleId] = useState(
    jrInit.booster_role?.role_id ? String(jrInit.booster_role.role_id) : "",
  );

  // Tenure Roles
  const [tenureRoles, setTenureRoles] = useState(jrInit.tenure_roles || []);
  const [newTenureRoleId, setNewTenureRoleId] = useState("");
  const [newTenureDays, setNewTenureDays] = useState(7);

  // Activity Roles
  const [activityRoles, setActivityRoles] = useState(jrInit.activity_roles || []);
  const [newActivityRoleId, setNewActivityRoleId] = useState("");
  const [newActivityDays, setNewActivityDays] = useState(7);

  const availableRoles = (serverData?.roles || []).map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
  }));

  const rolesOptions = availableRoles.map((r) => ({
    value: r.id,
    label: r.name,
    color: r.color,
  }));

  const getPayload = () => ({
    joinroles: {
      enabled: autoRolesEnabled,
      user_roles_enabled: userRoles.length > 0,
      user_roles: userRoles,
      bot_roles_enabled:
        serverData?.config?.joinroles?.bot_roles_enabled || false,
      bot_roles: serverData?.config?.joinroles?.bot_roles || [],
      tag_roles_enabled:
        serverData?.config?.joinroles?.tag_roles_enabled || false,
      tag_role: serverData?.config?.joinroles?.tag_role || "",
      sticky_roles: {
        enabled: stickyEnabled,
        restore_all: stickyRestoreAll,
        roles: [],
      },
      booster_role: {
        enabled: boosterEnabled,
        role_id: boosterRoleId || null,
      },
      tenure_roles: tenureRoles,
      activity_roles: activityRoles,
    },
  });

  const applyLoadedConfig = (configData) => {
    const jr = configData?.config?.joinroles || {};
    setAutoRolesEnabled(jr.enabled || false);
    setUserRoles((jr.user_roles || []).map(String));
    setStickyEnabled(jr.sticky_roles?.enabled || false);
    setStickyRestoreAll(jr.sticky_roles?.restore_all ?? true);
    setBoosterEnabled(jr.booster_role?.enabled || false);
    setBoosterRoleId(jr.booster_role?.role_id ? String(jr.booster_role.role_id) : "");
    setTenureRoles(jr.tenure_roles || []);
    setActivityRoles(jr.activity_roles || []);
  };

  useEffect(() => {
    if (!guildId) return;
    if (!serverData || !cachedRrData) setLoading(true);

    Promise.all([
      fetch(`/api/config/${guildId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => res.json()),
      fetch(`/api/reactionroles/${guildId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => res.json()),
    ])
      .then(([configData, rrData]) => {
        setServerData(configData);
        setCache(`roles_serverData_${guildId}`, configData);
        applyLoadedConfig(configData);

        if (!rrData.error) {
          setReactionRoles(rrData);
          setCache(`roles_reactionRoles_${guildId}`, rrData);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load roles config", err);
        setLoading(false);
      });
  }, [guildId]);

  const fetchReactionRoles = () => {
    fetch(`/api/reactionroles/${guildId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setReactionRoles(d);
          setCache(`roles_reactionRoles_${guildId}`, d);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!loading) {
      setInitialStateStr(JSON.stringify(getPayload()));
    }
  }, [loading]);

  const handleSave = async (payloadStr) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving role settings...");
    try {
      const payloadString =
        typeof payloadStr === "string"
          ? payloadStr
          : JSON.stringify(getPayload());
      const res = await fetch(`/api/config/${guildId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: payloadString,
      });
      const data = await res.json();
      if (data.error) {
        toast.error("Failed to save: " + data.error, { id: toastId });
      } else {
        toast.success("Settings saved successfully", { id: toastId });
        setInitialStateStr(payloadString);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving settings", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!initialStateStr) return;
    try {
      const parsed = JSON.parse(initialStateStr);
      const jr = parsed.joinroles || {};
      setAutoRolesEnabled(jr.enabled || false);
      setUserRoles((jr.user_roles || []).map(String));
      setStickyEnabled(jr.sticky_roles?.enabled || false);
      setStickyRestoreAll(jr.sticky_roles?.restore_all ?? true);
      setBoosterEnabled(jr.booster_role?.enabled || false);
      setBoosterRoleId(jr.booster_role?.role_id ? String(jr.booster_role.role_id) : "");
      setTenureRoles(jr.tenure_roles || []);
      setActivityRoles(jr.activity_roles || []);
      toast.success("Settings reset to last saved state");
    } catch (e) {
      console.error(e);
    }
  };

  // Add Tenure Role helper
  const addTenureRole = () => {
    if (!newTenureRoleId) return toast.error("Please pick a role first");
    if (tenureRoles.some((t) => String(t.role_id) === String(newTenureRoleId))) {
      return toast.error("This role is already added to tenure roles");
    }
    setTenureRoles([
      ...tenureRoles,
      { role_id: newTenureRoleId, days: Number(newTenureDays) || 7 },
    ]);
    setNewTenureRoleId("");
  };

  // Add Activity Role helper
  const addActivityRole = () => {
    if (!newActivityRoleId) return toast.error("Please pick a role first");
    if (activityRoles.some((a) => String(a.role_id) === String(newActivityRoleId))) {
      return toast.error("This role is already added to activity roles");
    }
    setActivityRoles([
      ...activityRoles,
      { role_id: newActivityRoleId, days: Number(newActivityDays) || 7 },
    ]);
    setNewActivityRoleId("");
  };

  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = Boolean(initialStateStr && currentPayloadStr !== initialStateStr);

  if (loading) {
    return <LoadingScreen message="Loading roles..." />;
  }

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">
      <div>
        <div data-tour="feature-header" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center text-neutral-400 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
                  <path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z" />
                  <circle cx="6.5" cy="9.5" r=".5" fill="currentColor" />
                </svg>
              </span>
              <h1 className="text-base font-semibold text-white truncate">
                Role Management & Panels
              </h1>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 min-w-0 items-stretch">
            {/* Left Column: Reaction Panels List */}
            <div className="flex flex-col gap-5 min-w-0">
              <div className="animate-fade-in-up flex-1 min-h-0 flex flex-col [&>*]:flex-1 [&>*]:min-h-0">
                <div data-tour="reactionroles-panel" className="scroll-mt-24 flex flex-col h-full">
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800 flex-shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
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
                        <span className="text-sm font-semibold text-white truncate">
                          Reaction Panels
                        </span>
                        <span className="text-[11px] tabular-nums text-neutral-400 px-1.5 py-0.5 rounded-md bg-neutral-800/60 border border-neutral-800">
                          {reactionRoles.length}/25
                        </span>
                      </div>
                    </div>

                    <div data-tour="reactionroles-list" className="p-4 sm:p-5 flex-1 min-h-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-[140px]">
                        {reactionRoles.map((rr) => {
                          const channelName = rr.channel_id
                            ? serverData?.channels?.find((c) => c.id === rr.channel_id)?.name
                              ? `# ${serverData.channels.find((c) => c.id === rr.channel_id).name}`
                              : `# Channel ID: ${rr.channel_id}`
                            : "No channel";

                          const isPosted = Boolean(rr.message_id || rr.msg_id);
                          const isPosting = postingPanelId === rr.id;
                          const pType = rr.panel_type || "buttons";
                          const pMode = rr.mode || "multi";

                          return (
                            <div
                              key={rr.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                setRrBuilderData(rr);
                                setRrBuilderOpen(true);
                              }}
                              className="group relative rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-700 flex flex-col items-start p-4 text-left transition-all duration-150 cursor-pointer shadow-sm"
                            >
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPanelToDelete(rr);
                                }}
                                className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-lg bg-neutral-800/80 border border-neutral-700/80 text-neutral-400 opacity-0 group-hover:opacity-100 hover:!bg-red-500 hover:!border-red-500 hover:!text-white transition-all duration-150"
                                title="Delete panel"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={12}
                                  height={12}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>

                              {/* Panel Title */}
                              <div className="flex items-center gap-2 mb-1.5 w-full pr-7">
                                <span className="text-sm font-semibold text-white truncate">
                                  {rr.embed?.title || rr.name || "Untitled Panel"}
                                </span>
                              </div>

                              {/* Badges: Type & Mode */}
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700/50">
                                  {pType === "buttons" ? "🔘 Buttons" : "😀 Reactions"}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700/50 capitalize">
                                  {pMode.replace("_", " ")}
                                </span>
                              </div>

                              {/* Bottom row: Channel & Post Status Button */}
                              <div className="text-xs text-neutral-500 flex items-center justify-between mt-auto w-full pt-1 border-t border-neutral-800/60">
                                <div className="flex items-center gap-1 min-w-0 pr-2">
                                  <span className="truncate text-[11px] text-neutral-400">
                                    {channelName}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  disabled={isPosted || !rr.channel_id || isPosting}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (isPosted || !rr.channel_id || isPosting) return;
                                    setPostingPanelId(rr.id);
                                    try {
                                      const res = await fetch(`/api/action/${guildId}/send_reactionrole`, {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                                        },
                                        body: JSON.stringify({
                                          id: rr.id,
                                          channel_id: rr.channel_id,
                                        }),
                                      });
                                      if (res.ok) {
                                        toast.success("Panel posted successfully to Discord!");
                                        fetchReactionRoles();
                                      } else {
                                        const data = await res.json();
                                        toast.error(data.error || "Failed to post panel");
                                      }
                                    } catch (err) {
                                      toast.error("Error posting panel");
                                      console.error(err);
                                    } finally {
                                      setPostingPanelId(null);
                                    }
                                  }}
                                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                                    isPosted
                                      ? "bg-[#172e22] border-[#224734] text-[#4ade80]"
                                      : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                                  } disabled:cursor-default`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPosted ? "bg-[#4ade80]" : "bg-neutral-500"
                                    }`}
                                  />
                                  {isPosting ? "Posting..." : isPosted ? "Posted" : "Post"}
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* New Panel Card */}
                        <button
                          type="button"
                          onClick={() => {
                            setRrBuilderData(null);
                            setRrBuilderOpen(true);
                          }}
                          data-tour="reactionroles-create"
                          style={{ borderStyle: "dashed" }}
                          className="group rounded-xl border border-neutral-700 hover:border-neutral-500 bg-transparent hover:bg-neutral-800/30 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white transition-all active:scale-[0.98]"
                        >
                          <span className="grid place-items-center w-8 h-8 rounded-full bg-neutral-800 group-hover:bg-neutral-700 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
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
                          </span>
                          <span className="text-xs font-semibold">New panel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Auto Roles & Info */}
            <div className="flex flex-col gap-5">
              {/* Auto Roles Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md flex flex-col">
                <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-sky-500/10">
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
                        className="text-sky-400"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx={9} cy={7} r={4} />
                        <line x1={19} x2={19} y1={8} y2={14} />
                        <line x1={22} x2={16} y1={11} y2={11} />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">Auto roles</span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoRolesEnabled}
                    onClick={() => setAutoRolesEnabled(!autoRolesEnabled)}
                    className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      autoRolesEnabled ? "bg-white" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full transition-transform duration-200 ease-in-out ${
                        autoRolesEnabled
                          ? "translate-x-[21px] bg-black"
                          : "translate-x-[3px] bg-white"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 flex flex-col">
                  <p className="mb-3 text-[11px] text-neutral-400 leading-relaxed">
                    Given automatically to every member the moment they join the server.
                  </p>
                  <AutoRolesDropdown
                    selectedRoles={userRoles}
                    availableRoles={availableRoles}
                    onChange={setUserRoles}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Role Automations (Sticky, Booster, Tenure, Activity) */}
          <div className="mt-6 pt-6 border-t border-neutral-800">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-white">Role Automations</h3>
              <span className="text-[11px] text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 font-medium">
                Active System
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Sticky Roles Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md flex flex-col">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1.5 rounded-lg bg-amber-500/10">
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
                        className="text-amber-400"
                      >
                        <line x1={12} x2={12} y1={17} y2={22} />
                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-white truncate">Sticky roles</span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={stickyEnabled}
                    onClick={() => setStickyEnabled(!stickyEnabled)}
                    className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      stickyEnabled ? "bg-white" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full transition-transform duration-200 ease-in-out ${
                        stickyEnabled
                          ? "translate-x-[21px] bg-black"
                          : "translate-x-[3px] bg-white"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 sm:p-5 flex-1 space-y-3">
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    A member who leaves and rejoins gets their roles restored automatically.
                  </p>

                  <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-neutral-800/40 border border-neutral-800">
                    <span className="text-[13px] text-neutral-200 font-medium">Restore all roles</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={stickyRestoreAll}
                      onClick={() => setStickyRestoreAll(!stickyRestoreAll)}
                      className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        stickyRestoreAll ? "bg-white" : "bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full transition-transform duration-200 ease-in-out ${
                          stickyRestoreAll
                            ? "translate-x-[21px] bg-black"
                            : "translate-x-[3px] bg-white"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Booster Role Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md flex flex-col">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1.5 rounded-lg bg-pink-500/10">
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
                        className="text-pink-400"
                      >
                        <path d="M6 3h12l4 6-10 13L2 9Z" />
                        <path d="M11 3 8 9l4 13 4-13-3-6" />
                        <path d="M2 9h20" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-white truncate">Booster role</span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={boosterEnabled}
                    onClick={() => setBoosterEnabled(!boosterEnabled)}
                    className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      boosterEnabled ? "bg-white" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full transition-transform duration-200 ease-in-out ${
                        boosterEnabled
                          ? "translate-x-[21px] bg-black"
                          : "translate-x-[3px] bg-white"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 sm:p-5 flex-1 space-y-3">
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Granted automatically to server boosters and removed when the boost ends.
                  </p>

                  <div>
                    <CustomSelect
                      options={rolesOptions}
                      value={boosterRoleId}
                      onChange={setBoosterRoleId}
                      placeholder="Pick the booster role…"
                    />
                  </div>
                </div>
              </div>

              {/* Tenure Roles Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md flex flex-col">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1.5 rounded-lg bg-sky-500/10">
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
                        className="text-sky-400"
                      >
                        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                        <path d="M16 2v4" />
                        <path d="M8 2v4" />
                        <path d="M3 10h5" />
                        <path d="M17.5 17.5 16 16.3V14" />
                        <circle cx={16} cy={16} r={6} />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-white truncate">Tenure roles</span>
                    <span className="text-[11px] tabular-nums text-neutral-400 px-1.5 py-0.5 rounded-md bg-neutral-800/60 border border-neutral-800">
                      {tenureRoles.length}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 space-y-3">
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Rewards members for how long they have been in the server.
                  </p>

                  {/* List of current tenure roles */}
                  {tenureRoles.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {tenureRoles.map((item, idx) => {
                        const roleObj = availableRoles.find((r) => String(r.id) === String(item.role_id));
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-xs text-neutral-200"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: roleObj?.color || "#b9bbbe" }}
                              />
                              <span className="font-medium text-white">{roleObj?.name || item.role_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-neutral-400 bg-neutral-700/60 px-2 py-0.5 rounded-md">
                                {item.days} days
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setTenureRoles(tenureRoles.filter((_, i) => i !== idx))
                                }
                                className="text-neutral-400 hover:text-red-400 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add row */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        options={rolesOptions}
                        value={newTenureRoleId}
                        onChange={setNewTenureRoleId}
                        placeholder="Pick role…"
                      />
                    </div>
                    <input
                      min={1}
                      type="number"
                      value={newTenureDays}
                      onChange={(e) => setNewTenureDays(e.target.value)}
                      className="w-16 h-10 px-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white text-center focus:outline-none focus:border-neutral-500"
                      title="Days in server"
                    />
                    <span className="text-[11px] text-neutral-400 whitespace-nowrap">days</span>
                    <button
                      type="button"
                      onClick={addTenureRole}
                      className="h-10 px-3 inline-flex items-center justify-center rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.96]"
                      title="Add rule"
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
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Roles Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md flex flex-col">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10">
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
                        className="text-emerald-400"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-white truncate">Activity roles</span>
                    <span className="text-[11px] tabular-nums text-neutral-400 px-1.5 py-0.5 rounded-md bg-neutral-800/60 border border-neutral-800">
                      {activityRoles.length}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 space-y-3">
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Rewards members active in messages or voice, removed if they go quiet.
                  </p>

                  {/* List of current activity roles */}
                  {activityRoles.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {activityRoles.map((item, idx) => {
                        const roleObj = availableRoles.find((r) => String(r.id) === String(item.role_id));
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-xs text-neutral-200"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: roleObj?.color || "#b9bbbe" }}
                              />
                              <span className="font-medium text-white">{roleObj?.name || item.role_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-neutral-400 bg-neutral-700/60 px-2 py-0.5 rounded-md">
                                {item.days} days active
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setActivityRoles(activityRoles.filter((_, i) => i !== idx))
                                }
                                className="text-neutral-400 hover:text-red-400 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add row */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        options={rolesOptions}
                        value={newActivityRoleId}
                        onChange={setNewActivityRoleId}
                        placeholder="Pick role…"
                      />
                    </div>
                    <input
                      min={1}
                      type="number"
                      value={newActivityDays}
                      onChange={(e) => setNewActivityDays(e.target.value)}
                      className="w-16 h-10 px-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white text-center focus:outline-none focus:border-neutral-500"
                      title="Days active"
                    />
                    <span className="text-[11px] text-neutral-400 whitespace-nowrap">days</span>
                    <button
                      type="button"
                      onClick={addActivityRole}
                      className="h-10 px-3 inline-flex items-center justify-center rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.96]"
                      title="Add rule"
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
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reaction Role Builder Modal */}
      <ReactionRoleBuilder
        isOpen={rrBuilderOpen}
        onClose={() => setRrBuilderOpen(false)}
        initialData={rrBuilderData}
        guildId={guildId}
        serverData={serverData}
        onSaveSuccess={() => {
          setRrBuilderOpen(false);
          fetchReactionRoles();
        }}
        onDeleteSuccess={() => {
          setRrBuilderOpen(false);
          fetchReactionRoles();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={!!panelToDelete}
        onClose={() => setPanelToDelete(null)}
        title="Delete this reaction panel?"
        description="This panel will be removed from your dashboard and database. This action cannot be undone."
        onConfirm={async () => {
          if (!panelToDelete) return;
          try {
            const res = await fetch(`/api/reactionroles/${guildId}/${panelToDelete.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (res.ok) {
              toast.success("Panel deleted");
              fetchReactionRoles();
            } else {
              toast.error("Failed to delete panel");
            }
          } catch (err) {
            console.error(err);
            toast.error("Error deleting panel");
          } finally {
            setPanelToDelete(null);
          }
        }}
      />

      {/* Save Bar */}
      <SaveBar
        show={isDirty}
        onReset={handleReset}
        onSave={() => handleSave(currentPayloadStr)}
        saving={isSaving}
      />
    </main>
  );
}
