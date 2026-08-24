import React, { useState, useEffect, useRef } from "react";
import { getCache, setCache } from "../../utils/cache";
import { useToast } from "../ui/Toast";

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
            className={`lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-30 mt-1 left-0 right-0 p-1 rounded-xl bg-neutral-800 border border-neutral-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(0,0,0,0.9)] max-h-[220px] overflow-hidden flex flex-col">
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

import ReactionRoleBuilder from "./modules/ReactionRoleBuilder";

export default function Roles({ guildId }) {
  const toast = useToast();

  const cachedData = getCache(`roles_serverData_${guildId}`);
  const [serverData, setServerData] = useState(cachedData || null);
  const [loading, setLoading] = useState(!cachedData);
  const [initialStateStr, setInitialStateStr] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reaction Roles State
  const [reactionRoles, setReactionRoles] = useState([]);
  const [rrBuilderOpen, setRrBuilderOpen] = useState(false);
  const [rrBuilderData, setRrBuilderData] = useState(null);

  // Auto roles state
  const jrInit = cachedData?.config?.joinroles || {};
  const [autoRolesEnabled, setAutoRolesEnabled] = useState(
    jrInit.enabled || false,
  );
  const [userRoles, setUserRoles] = useState(
    (jrInit.user_roles || []).map(String),
  );

  const availableRoles = (serverData?.roles || []).map((r) => ({
    id: r.id,
    name: r.name,
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
    },
  });

  useEffect(() => {
    if (!guildId) return;
    if (!serverData) setLoading(true);

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
        const jr = configData?.config?.joinroles || {};
        setAutoRolesEnabled(jr.enabled || false);
        setUserRoles((jr.user_roles || []).map(String));
        
        if (!rrData.error) {
          setReactionRoles(rrData);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load roles config", err);
        setLoading(false);
      });
  }, [guildId]);

  useEffect(() => {
    if (!loading) {
      setInitialStateStr(JSON.stringify(getPayload()));
    }
  }, [loading]);

  const handleSave = async (payloadStr) => {
    setIsSaving(true);
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
        toast.error("Failed to save: " + data.error);
      } else {
        toast.success("Auto roles saved");
        setInitialStateStr(payloadString);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = initialStateStr && currentPayloadStr !== initialStateStr;

  useEffect(() => {
    if (!initialStateStr || !isDirty) return;
    const timeoutId = setTimeout(() => {
      handleSave(currentPayloadStr);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, initialStateStr, isDirty]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto">
      <div>
        <div data-tour="feature-header" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
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
                  className="lucide lucide-tags w-5 h-5"
                >
                  <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
                  <path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z" />
                  <circle cx="6.5" cy="9.5" r=".5" fill="currentColor" />
                </svg>
              </span>
              <h1 className="text-base font-medium text-white truncate">
                Roles
              </h1>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 min-w-0 items-stretch">
            <div className="flex flex-col gap-5 min-w-0">
              <div
                className="animate-fade-in-up flex-1 min-h-0 flex flex-col [&>*]:flex-1 [&>*]:min-h-0"
                style={{ animationDelay: "0ms", animationFillMode: "both" }}
              >
                <div
                  data-tour="reactionroles-panel"
                  className="scroll-mt-24 flex flex-col h-full"
                >
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800 flex-shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
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
                          className="lucide lucide-smile-plus w-4 h-4 flex-shrink-0 text-rose-400"
                        >
                          <path d="M22 11v1a10 10 0 1 1-9-10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1={9} x2="9.01" y1={9} y2={9} />
                          <line x1={15} x2="15.01" y1={9} y2={9} />
                          <path d="M16 5h6" />
                          <path d="M19 2v6" />
                        </svg>
                        <span className="text-sm font-medium text-white truncate">
                          Reaction panels
                        </span>
                        <span className="text-[11px] tabular-nums text-neutral-500 px-1.5 py-0.5 rounded-md bg-neutral-800/50 border border-neutral-800">
                          {reactionRoles.length}/9
                        </span>
                      </div>
                    </div>
                    <div
                      data-tour="reactionroles-list"
                      className="scroll-mt-24 p-4 sm:p-5 flex-1 min-h-0"
                    >                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 auto-rows-[120px]">
                        {reactionRoles.length < 9 && (
                          <button
                            type="button"
                            onClick={() => {
                              setRrBuilderData(null);
                              setRrBuilderOpen(true);
                            }}
                            data-tour="reactionroles-create"
                            className="scroll-mt-24 group rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 bg-transparent hover:bg-neutral-800/30 flex flex-col items-center justify-center gap-1.5 text-neutral-400 hover:text-white transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          >
                            <span className="grid place-items-center w-8 h-8 rounded-full bg-neutral-800 group-hover:bg-neutral-700 transition-colors">
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
                                className="lucide lucide-plus w-4 h-4"
                              >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            </span>
                            <span className="text-xs font-medium">New panel</span>
                          </button>
                        )}
                        {reactionRoles.map((rr) => (
                          <button
                            key={rr.id}
                            type="button"
                            onClick={() => {
                              setRrBuilderData(rr);
                              setRrBuilderOpen(true);
                            }}
                            className="group rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 flex flex-col items-start p-4 text-left transition-[background-color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                          >
                            <div className="flex items-center gap-2 mb-2 w-full">
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
                                className="text-neutral-400 group-hover:text-white transition-colors"
                              >
                                <polyline points="15 18 9 12 15 6" />
                              </svg>
                              <span className="text-sm font-medium text-white truncate">
                                {rr.name || "Unnamed Panel"}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500 flex items-center gap-1 mt-auto">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={12}
                                height={12}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="4" x2="20" y1="9" y2="9" />
                                <line x1="4" x2="20" y1="15" y2="15" />
                                <line x1="10" x2="8" y1="3" y2="21" />
                                <line x1="16" x2="14" y1="3" y2="21" />
                              </svg>
                              Channel: {rr.channel_id || "Unset"}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-first lg:order-last flex flex-col">
              <div className="flex flex-col gap-5 flex-1">
                <div
                  className="animate-fade-in-up relative z-50"
                  style={{ animationDelay: "70ms", animationFillMode: "both" }}
                >
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ">
                    <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2 flex-shrink-0">
                      <div className="p-1.5 rounded-lg bg-sky-500/10">
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
                          className="lucide lucide-user-plus w-3.5 h-3.5 text-sky-400"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx={9} cy={7} r={4} />
                          <line x1={19} x2={19} y1={8} y2={14} />
                          <line x1={22} x2={16} y1={11} y2={11} />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white text-balance">
                        Auto roles
                      </span>
                      <div className="ml-auto flex items-center">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] tabular-nums text-neutral-500">
                            {userRoles.length} assigned
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col p-4 min-h-0">
                      <p className="mb-3 text-[11px] text-neutral-500 leading-relaxed">
                        Given to every member the moment they join, before they
                        do anything.
                      </p>
                      <AutoRolesDropdown
                        selectedRoles={userRoles}
                        availableRoles={availableRoles}
                        onChange={setUserRoles}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="animate-fade-in-up "
                  style={{ animationDelay: "140ms", animationFillMode: "both" }}
                >
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col min-h-[280px]">
                    <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2 flex-shrink-0">
                      <div className="p-1.5 rounded-lg bg-violet-500/10">
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
                          className="lucide lucide-workflow w-3.5 h-3.5 text-violet-400"
                        >
                          <rect width={8} height={8} x={3} y={3} rx={2} />
                          <path d="M7 11v4a2 2 0 0 0 2 2h4" />
                          <rect width={8} height={8} x={13} y={13} rx={2} />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white text-balance">
                        Custom rules
                      </span>
                      <span className="text-[11px] tabular-nums text-neutral-500 px-1.5 py-0.5 rounded-md bg-neutral-800/50 border border-neutral-800">
                        0
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col p-4 min-h-0">
                      <div className="flex-1 space-y-1.5 min-h-0 overflow-y-auto scrollbar-thin -mr-1 pr-1">
                        <div className="h-full flex flex-col">
                          <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center px-4">
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
                              className="lucide lucide-workflow w-6 h-6 text-neutral-700 mb-1.5"
                            >
                              <rect width={8} height={8} x={3} y={3} rx={2} />
                              <path d="M7 11v4a2 2 0 0 0 2 2h4" />
                              <rect width={8} height={8} x={13} y={13} rx={2} />
                            </svg>
                            <p className="text-[13px] text-neutral-300 font-medium text-pretty">
                              Build if/then role logic
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-1 max-w-[240px] text-pretty">
                              When something happens, add or remove a role
                              automatically.
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700 text-[11px] text-neutral-300 transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              Auto-assign default role
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700 text-[11px] text-neutral-300 transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              Promote on verify
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700 text-[11px] text-neutral-300 transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              Welcome DM on join
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-neutral-800/50 flex-shrink-0">
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
                            className="lucide lucide-plus w-4 h-4"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Create rule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-800">
            <div
              className="animate-fade-in-up "
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-white text-balance">
                    Role automations
                  </h3>
                  <span className="text-[11px] text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 rounded-lg bg-amber-500/10">
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
                            className="lucide lucide-pin w-3.5 h-3.5 text-amber-400"
                          >
                            <line x1={12} x2={12} y1={17} y2={22} />
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                          </svg>
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          Sticky roles
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="false"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex-1">
                      <p className="mb-3 text-[11px] text-neutral-500 leading-relaxed">
                        A member who leaves and comes back gets their roles back
                        automatically, instead of starting over.
                      </p>
                      <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-neutral-800/40 border border-neutral-800">
                        <span className="text-[13px] text-neutral-200">
                          Restore all roles
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked="true"
                            className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                          >
                            <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 rounded-lg bg-pink-500/10">
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
                            className="lucide lucide-gem w-3.5 h-3.5 text-pink-400"
                          >
                            <path d="M6 3h12l4 6-10 13L2 9Z" />
                            <path d="M11 3 8 9l4 13 4-13-3-6" />
                            <path d="M2 9h20" />
                          </svg>
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          Booster role
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="false"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex-1">
                      <p className="mb-3 text-[11px] text-neutral-500 leading-relaxed">
                        Anyone boosting the server holds this role for as long
                        as the boost lasts, and loses it when they stop.
                      </p>
                      <div className="mt-0">
                        <div className=" w-full">
                          <div className=" relative">
                            <button
                              type="button"
                              className=" w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                            >
                              <span className=" min-w-0 truncate text-sm text-neutral-500">
                                Pick the booster role...
                              </span>
                              <div className=" flex items-center gap-1">
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
                                  className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 rounded-lg bg-sky-500/10">
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
                            className="lucide lucide-calendar-clock w-3.5 h-3.5 text-sky-400"
                          >
                            <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                            <path d="M16 2v4" />
                            <path d="M8 2v4" />
                            <path d="M3 10h5" />
                            <path d="M17.5 17.5 16 16.3V14" />
                            <circle cx={16} cy={16} r={6} />
                          </svg>
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          Tenure roles
                        </span>
                        <span className="text-[11px] tabular-nums text-neutral-500 px-1.5 py-0.5 rounded-md bg-neutral-800/50 border border-neutral-800">
                          0
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex-1">
                      <p className="mb-3 text-[11px] text-neutral-500 leading-relaxed">
                        Rewards sticking around. A member who has been in the
                        server long enough gets the role, once.
                      </p>
                      <div className="mt-3 flex items-end gap-2">
                        <div className="flex-1 min-w-0">
                          <div className=" w-full">
                            <div className=" relative">
                              <button
                                type="button"
                                className=" w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                              >
                                <span className=" min-w-0 truncate text-sm text-neutral-500">
                                  Role...
                                </span>
                                <div className=" flex items-center gap-1">
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
                                    className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                  >
                                    <path d="m6 9 6 6 6-6" />
                                  </svg>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                        <input
                          min={1}
                          className="!w-20 h-10 px-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white text-center tabular-nums focus:outline-none focus:border-neutral-500"
                          aria-label="days in server"
                          type="number"
                          defaultValue={7}
                        />
                        <span className="text-[11px] text-neutral-500 whitespace-nowrap pb-2.5">
                          days in server
                        </span>
                        <button
                          type="button"
                          className="h-10 px-3 inline-flex items-center gap-1.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
                            className="lucide lucide-plus w-4 h-4"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10">
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
                            className="lucide lucide-activity w-3.5 h-3.5 text-emerald-400"
                          >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          Activity roles
                        </span>
                        <span className="text-[11px] tabular-nums text-neutral-500 px-1.5 py-0.5 rounded-md bg-neutral-800/50 border border-neutral-800">
                          0
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex-1">
                      <p className="mb-3 text-[11px] text-neutral-500 leading-relaxed">
                        Rewards showing up. Members who have been active
                        recently hold the role, and lose it if they go quiet.
                      </p>
                      <div className="mt-3 flex items-end gap-2">
                        <div className="flex-1 min-w-0">
                          <div className=" w-full">
                            <div className=" relative">
                              <button
                                type="button"
                                className=" w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                              >
                                <span className=" min-w-0 truncate text-sm text-neutral-500">
                                  Role...
                                </span>
                                <div className=" flex items-center gap-1">
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
                                    className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                  >
                                    <path d="m6 9 6 6 6-6" />
                                  </svg>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                        <input
                          min={1}
                          className="!w-20 h-10 px-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white text-center tabular-nums focus:outline-none focus:border-neutral-500"
                          aria-label="days active"
                          type="number"
                          defaultValue={7}
                        />
                        <span className="text-[11px] text-neutral-500 whitespace-nowrap pb-2.5">
                          days active
                        </span>
                        <button
                          type="button"
                          className="h-10 px-3 inline-flex items-center gap-1.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
                            className="lucide lucide-plus w-4 h-4"
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
        </div>
      </div>

      <ReactionRoleBuilder
        isOpen={rrBuilderOpen}
        onClose={() => setRrBuilderOpen(false)}
        initialData={rrBuilderData}
        guildId={guildId}
        serverData={serverData}
        onSaveSuccess={() => {
          fetch(`/api/reactionroles/${guildId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
            .then((r) => r.json())
            .then((d) => !d.error && setReactionRoles(d));
        }}
        onDeleteSuccess={() => {
          fetch(`/api/reactionroles/${guildId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
            .then((r) => r.json())
            .then((d) => !d.error && setReactionRoles(d));
        }}
      />
    </main>
  );
}
