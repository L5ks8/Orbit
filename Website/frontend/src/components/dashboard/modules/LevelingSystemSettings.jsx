
import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function LevelingSystemSettings({ config, channels, roles, onSave, saving, onReset }) {
  const lvlCfg = config?.level || {};

  const [levelEnabled, setLevelEnabled] = useState(lvlCfg.enabled !== false);
  const [statTab, setStatTab] = useState('messages');
  const [levelUpMode, setLevelUpMode] = useState(lvlCfg.level_up_mode || 'blacklist');
  const [levelRoleMode, setLevelRoleMode] = useState(lvlCfg.level_role_mode || 'blacklist');
  const [levelRoles, setLevelRoles] = useState(lvlCfg.level_roles || []);
  const [statRoles, setStatRoles] = useState(lvlCfg.stat_roles || []);

  const [levelRolesStack, setLevelRolesStack] = useState(lvlCfg.level_roles_stack || false);
  const [levelRolesRejoin, setLevelRolesRejoin] = useState(lvlCfg.level_roles_rejoin || false);
  const [statRolesMsgStack, setStatRolesMsgStack] = useState(lvlCfg.stat_roles_msg_stack || false);
  const [statRolesVoiceStack, setStatRolesVoiceStack] = useState(lvlCfg.stat_roles_voice_stack || false);
  const [statRolesReactStack, setStatRolesReactStack] = useState(lvlCfg.stat_roles_react_stack || false);
  const [statRolesMsgCooldown, setStatRolesMsgCooldown] = useState(lvlCfg.stat_roles_msg_cooldown || 5);
  const [statRolesVoiceCooldown, setStatRolesVoiceCooldown] = useState(lvlCfg.stat_roles_voice_cooldown || 5);
  const [statRolesReactCooldown, setStatRolesReactCooldown] = useState(lvlCfg.stat_roles_react_cooldown || 5);

  const [msgXpEnabled, setMsgXpEnabled] = useState(lvlCfg.msg_xp_enabled !== false);
  const [voiceXpEnabled, setVoiceXpEnabled] = useState(lvlCfg.voice_xp_enabled || false);
  const [reactionXpEnabled, setReactionXpEnabled] = useState(lvlCfg.reaction_xp_enabled || false);

  const [msgXpAmount, setMsgXpAmount] = useState(lvlCfg.msg_xp_amount || 20);
  const [msgXpCooldown, setMsgXpCooldown] = useState(lvlCfg.msg_xp_cooldown || 60);

  const [voiceXpAmount, setVoiceXpAmount] = useState(lvlCfg.voice_xp_amount || 6);
  const [voiceXpIgnoreMuted, setVoiceXpIgnoreMuted] = useState(lvlCfg.voice_xp_ignore_muted !== false);
  const [voiceXpIgnoreSolo, setVoiceXpIgnoreSolo] = useState(lvlCfg.voice_xp_ignore_solo || false);

  const [cmdXpEnabled, setCmdXpEnabled] = useState(lvlCfg.cmd_xp_enabled !== false);
  const [cmdXpAmount, setCmdXpAmount] = useState(lvlCfg.cmd_xp_amount || 15);
  const [cmdXpCooldown, setCmdXpCooldown] = useState(lvlCfg.cmd_xp_cooldown || 60);

  const [reactXpEnabled, setReactXpEnabled] = useState(lvlCfg.react_xp_enabled !== false);
  const [reactXpAmount, setReactXpAmount] = useState(lvlCfg.react_xp_amount || 15);
  const [reactXpCooldown, setReactXpCooldown] = useState(lvlCfg.react_xp_cooldown || 300);

  const [resetOnLeave, setResetOnLeave] = useState(lvlCfg.reset_on_leave || false);
  const [resetOnBan, setResetOnBan] = useState(lvlCfg.reset_on_ban || false);
  const [voteBoost, setVoteBoost] = useState(lvlCfg.vote_boost !== false);
  const [xpMultiplier, setXpMultiplier] = useState(lvlCfg.xp_multiplier || 1.0);

  const [blockedChannels, setBlockedChannels] = useState(lvlCfg.blocked_channels || []);
  const [blockedRoles, setBlockedRoles] = useState(lvlCfg.blocked_roles || []);

  const [levelupChannel, setLevelupChannel] = useState(lvlCfg.levelup_channel || 'current');
  const [leaderboardUrl, setLeaderboardUrl] = useState(lvlCfg.leaderboard_url || '');
  const [leaderboardChannel, setLeaderboardChannel] = useState(lvlCfg.leaderboard_channel || '');
  const [leaderboardColor, setLeaderboardColor] = useState(lvlCfg.leaderboard_color || '#3B82F6');

  const [levelupMessageContent, setLevelupMessageContent] = useState(lvlCfg.levelup_message_content || '{user_mention}');
  const [levelupEmbedAuthor, setLevelupEmbedAuthor] = useState(lvlCfg.levelup_embed_author || '');
  const [levelupEmbedTitle, setLevelupEmbedTitle] = useState(lvlCfg.levelup_embed_title || 'Level Up!');
  const [levelupEmbedDescription, setLevelupEmbedDescription] = useState(lvlCfg.levelup_embed_description || '');
  const [levelupEmbedFooter, setLevelupEmbedFooter] = useState(lvlCfg.levelup_embed_footer || '');
  const [levelupEmbedImage, setLevelupEmbedImage] = useState(lvlCfg.levelup_embed_image || '');
  const [levelupShowAvatar, setLevelupShowAvatar] = useState(lvlCfg.levelup_show_avatar !== false);
  const [levelupConditional, setLevelupConditional] = useState(lvlCfg.levelup_conditional || '');

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color || '#99aab5' }));

  const getPayload = () => ({
    level: {
      enabled: levelEnabled,
      level_up_mode: levelUpMode,
      level_role_mode: levelRoleMode,
      level_roles: levelRoles,
      stat_roles: statRoles,
      level_roles_stack: levelRolesStack,
      level_roles_rejoin: levelRolesRejoin,
      stat_roles_msg_stack: statRolesMsgStack,
      stat_roles_voice_stack: statRolesVoiceStack,
      stat_roles_react_stack: statRolesReactStack,
      stat_roles_msg_cooldown: parseInt(statRolesMsgCooldown) || 0,
      stat_roles_voice_cooldown: parseInt(statRolesVoiceCooldown) || 0,
      stat_roles_react_cooldown: parseInt(statRolesReactCooldown) || 0,
      msg_xp_enabled: msgXpEnabled,
      voice_xp_enabled: voiceXpEnabled,
      reaction_xp_enabled: reactionXpEnabled,
      msg_xp_amount: parseInt(msgXpAmount) || 0,
      msg_xp_cooldown: parseInt(msgXpCooldown) || 0,
      voice_xp_amount: parseInt(voiceXpAmount) || 0,
      voice_xp_ignore_muted: voiceXpIgnoreMuted,
      voice_xp_ignore_solo: voiceXpIgnoreSolo,
      cmd_xp_enabled: cmdXpEnabled,
      cmd_xp_amount: parseInt(cmdXpAmount) || 0,
      cmd_xp_cooldown: parseInt(cmdXpCooldown) || 0,
      react_xp_amount: parseInt(reactXpAmount) || 0,
      react_xp_cooldown: parseInt(reactXpCooldown) || 0,
      reset_on_leave: resetOnLeave,
      reset_on_ban: resetOnBan,
      vote_boost: voteBoost,
      xp_multiplier: parseFloat(xpMultiplier) || 1.0,
      blocked_channels: blockedChannels,
      blocked_roles: blockedRoles,
      levelup_channel: levelupChannel,
      leaderboard_url: leaderboardUrl,
      leaderboard_channel: leaderboardChannel,
      leaderboard_color: leaderboardColor,
      levelup_message_content: levelupMessageContent,
      levelup_embed_author: levelupEmbedAuthor,
      levelup_embed_title: levelupEmbedTitle,
      levelup_embed_description: levelupEmbedDescription,
      levelup_embed_footer: levelupEmbedFooter,
      levelup_embed_image: levelupEmbedImage,
      levelup_show_avatar: levelupShowAvatar,
      levelup_conditional: levelupConditional
    }
  });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload(), true);
  };

  React.useEffect(() => {
    if (isDirty) {
      const timeout = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isDirty]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-5 h-5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </span>
            <h1 className="text-base font-medium text-white truncate">
              Leveling System
            </h1>
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-6">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-900/30 text-blue-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold text-white truncate">Leveling System</span>
                <span className="text-[13px] text-neutral-400 truncate">Reward active users with experience points and roles.</span>
              </div>
            </div>
            <Toggle checked={levelEnabled} onChange={setLevelEnabled} />
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-5">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Message XP Card */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-blue-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square w-4 h-4 text-blue-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white truncate">Message XP</span>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-white block mb-0.5">Message XP Enabled</label>
                    <span className="text-[11px] text-neutral-500 leading-relaxed block">Should members earn XP for sending messages?</span>
                  </div>
                  <Toggle checked={msgXpEnabled} onChange={() => setMsgXpEnabled(!msgXpEnabled)} />
                </div>
                {msgXpEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">XP Amount</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={msgXpAmount} onChange={e => setMsgXpAmount(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Cooldown (sec)</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={msgXpCooldown} onChange={e => setMsgXpCooldown(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voice XP Card */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-emerald-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic w-4 h-4 text-emerald-400">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white truncate">Voice XP</span>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-white block mb-0.5">Voice XP Enabled</label>
                    <span className="text-[11px] text-neutral-500 leading-relaxed block">Earn XP while in a voice channel.</span>
                  </div>
                  <Toggle checked={voiceXpEnabled} onChange={() => setVoiceXpEnabled(!voiceXpEnabled)} />
                </div>
                {voiceXpEnabled && (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label className="text-[13px] font-medium text-white block mb-0.5">Ignore Muted/Deafened</label>
                      </div>
                      <Toggle checked={voiceXpIgnoreMuted} onChange={() => setVoiceXpIgnoreMuted(!voiceXpIgnoreMuted)} />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label className="text-[13px] font-medium text-white block mb-0.5">Ignore Solo Members</label>
                      </div>
                      <Toggle checked={voiceXpIgnoreSolo} onChange={() => setVoiceXpIgnoreSolo(!voiceXpIgnoreSolo)} />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">XP Amount (per min)</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={voiceXpAmount} onChange={e => setVoiceXpAmount(e.target.value)} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Command XP Card */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-fuchsia-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-terminal w-4 h-4 text-fuchsia-400">
                    <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white truncate">Command XP</span>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-white block mb-0.5">Command XP Enabled</label>
                    <span className="text-[11px] text-neutral-500 leading-relaxed block">Earn XP for using commands.</span>
                  </div>
                  <Toggle checked={cmdXpEnabled} onChange={() => setCmdXpEnabled(!cmdXpEnabled)} />
                </div>
                {cmdXpEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">XP Amount</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={cmdXpAmount} onChange={e => setCmdXpAmount(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Cooldown (sec)</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={cmdXpCooldown} onChange={e => setCmdXpCooldown(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reaction XP Card */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-amber-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smile w-4 h-4 text-amber-400">
                    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white truncate">Reaction XP</span>
              </div>
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-white block mb-0.5">Reaction XP Enabled</label>
                    <span className="text-[11px] text-neutral-500 leading-relaxed block">Earn XP when adding reactions.</span>
                  </div>
                  <Toggle checked={reactXpEnabled} onChange={() => setReactXpEnabled(!reactXpEnabled)} />
                </div>
                {reactXpEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">XP Amount</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={reactXpAmount} onChange={e => setReactXpAmount(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Cooldown (sec)</label>
                      <input type="number" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={reactXpCooldown} onChange={e => setReactXpCooldown(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* XP Options */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-violet-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders w-4 h-4 text-violet-400">
                  <line x1="4" x2="20" y1="21" y2="14" /><line x1="4" x2="20" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white truncate">XP Options</span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-[13px] font-medium text-white block mb-0.5">Reset on Leave</label>
                  <span className="text-[11px] text-neutral-500 leading-relaxed block">Members lose XP when leaving.</span>
                </div>
                <Toggle checked={resetOnLeave} onChange={() => setResetOnLeave(!resetOnLeave)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-[13px] font-medium text-white block mb-0.5">Reset on Ban</label>
                  <span className="text-[11px] text-neutral-500 leading-relaxed block">Members lose XP when banned.</span>
                </div>
                <Toggle checked={resetOnBan} onChange={() => setResetOnBan(!resetOnBan)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-[13px] font-medium text-white block mb-0.5">Vote Boost</label>
                  <span className="text-[11px] text-neutral-500 leading-relaxed block">XP boost for voting for Orbit.</span>
                </div>
                <Toggle checked={voteBoost} onChange={() => setVoteBoost(!voteBoost)} />
              </div>
            </div>
            <div className="mt-6">
              <label className="text-[11px] text-neutral-500 block mb-1.5">Global XP Multiplier</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0.1" max="5" step="0.05" value={xpMultiplier} onChange={e => setXpMultiplier(e.target.value)} className="flex-1 accent-white h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer" />
                <span className="text-sm font-semibold text-white w-12 text-right">{`x${parseFloat(xpMultiplier || 1).toFixed(2)}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Channels & Roles Restrictions */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-ban w-4 h-4 text-red-400">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m4.29 4.29 15.42 15.42" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white truncate">Restrictions & Level Up Channel</span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-neutral-500 block">Blocked XP Channels</label>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${levelUpMode === 'blacklist' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`} onClick={() => setLevelUpMode('blacklist')}>Blacklist</button>
                  <button className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${levelUpMode === 'whitelist' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`} onClick={() => setLevelUpMode('whitelist')}>Whitelist</button>
                </div>
                <CustomSelect options={channelOptions} isMulti placeholder="Select channels..." value={blockedChannels} onChange={setBlockedChannels} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-neutral-500 block">Blocked XP Roles</label>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${levelRoleMode === 'blacklist' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`} onClick={() => setLevelRoleMode('blacklist')}>Blacklist</button>
                  <button className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${levelRoleMode === 'whitelist' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`} onClick={() => setLevelRoleMode('whitelist')}>Whitelist</button>
                </div>
                <CustomSelect options={roleOptions} isMulti placeholder="Select roles..." value={blockedRoles} onChange={setBlockedRoles} />
              </div>
            </div>
            <div className="mt-6">
              <label className="text-[11px] text-neutral-500 block mb-1.5">Level Up Channel</label>
              <CustomSelect options={[{ value: 'current', label: 'Current Channel' }, ...channelOptions]} value={levelupChannel} onChange={setLevelupChannel} placeholder="Select Channel..." />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-yellow-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy w-4 h-4 text-yellow-400">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white truncate">Leaderboard Config</span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="text-[11px] text-neutral-500 block mb-1.5">Custom URL Path</label>
                <input type="text" className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" value={leaderboardUrl} onChange={e => setLeaderboardUrl(e.target.value)} placeholder="e.g. my-server" />
              </div>
              <div>
                <label className="text-[11px] text-neutral-500 block mb-1.5">Auto Leaderboard Channel</label>
                <CustomSelect options={channelOptions} value={leaderboardChannel} onChange={setLeaderboardChannel} placeholder="Select Channel..." />
              </div>
            </div>
            <div className="mt-6">
              <label className="text-[11px] text-neutral-500 block mb-1.5">Embed Accent Color</label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-neutral-700 shrink-0">
                  <input type="color" value={leaderboardColor} onChange={e => setLeaderboardColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer bg-transparent border-none" />
                </div>
                <input type="text" className="w-32 px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 font-mono text-sm uppercase" value={leaderboardColor} onChange={e => setLeaderboardColor(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Level Up Message Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Settings */}
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-pink-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-4 h-4 text-pink-400">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white truncate">Level Up Message</span>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
                <div className="space-y-6 mt-4">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1.5">Conditional Script</label>
                    <p className="text-[11px] text-neutral-500 mb-2">Use {'{earned: Text}'} for any role earned, or {'{level[X]: Text}'} for specific levels.</p>
                    <textarea className="w-full px-4 py-3 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 resize-y" rows="2" value={levelupConditional} onChange={e => setLevelupConditional(e.target.value)} placeholder="{earned: You earned {roles}!} {level[10]: Milestone Level 10!}"></textarea>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <label className="text-[13px] font-medium text-white block mb-0.5">Show User Avatar</label>
                      <span className="text-[11px] text-neutral-500 leading-relaxed block">Display avatar in the embed thumbnail.</span>
                    </div>
                    <Toggle checked={levelupShowAvatar} onChange={() => setLevelupShowAvatar(!levelupShowAvatar)} />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1.5">Message Content</label>
                    <p className="text-[11px] text-neutral-500 mb-2">Text outside the embed (e.g. {'{user_mention}'}).</p>
                    <textarea className="w-full px-4 py-3 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 resize-y" rows="2" value={levelupMessageContent} onChange={e => setLevelupMessageContent(e.target.value)} placeholder="{user_mention}"></textarea>
                  </div>

                  <div className="bg-neutral-800/50 border border-neutral-800/50 rounded-xl p-4">
                    <label className="text-[11px] text-neutral-500 block mb-4">Embed Builder</label>
                    <div className="space-y-3">
                      <input type="text" className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50" placeholder="Author Name" value={levelupEmbedAuthor} onChange={e => setLevelupEmbedAuthor(e.target.value)} />
                      <input type="text" className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50 font-semibold" placeholder="Title" value={levelupEmbedTitle} onChange={e => setLevelupEmbedTitle(e.target.value)} />
                      <textarea className="w-full px-4 py-3 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50 resize-y" rows="3" placeholder="Description" value={levelupEmbedDescription} onChange={e => setLevelupEmbedDescription(e.target.value)}></textarea>
                      <input type="text" className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50" placeholder="Image URL" value={levelupEmbedImage} onChange={e => setLevelupEmbedImage(e.target.value)} />
                      <input type="text" className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50 text-xs" placeholder="Footer Text" value={levelupEmbedFooter} onChange={e => setLevelupEmbedFooter(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN: Live Preview */}
          <div className="flex flex-col gap-6 h-full">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden h-full">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye text-neutral-400">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <span className="text-sm font-semibold text-white">Live Preview</span>
              </div>
              
              <div className="p-5 bg-[#313338] flex flex-col items-start gap-4 flex-1 overflow-y-auto">
                <div className="flex items-start gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-[#111214] flex items-center justify-center shrink-0 overflow-hidden">
                    <img src="/img/logo.png" alt="Orbit Logo" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex flex-col gap-1 w-full min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[15px] text-white">Orbit</span>
                      <span className="text-[10px] text-white bg-[#5865F2] px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        APP
                      </span>
                      <span className="text-[12px] text-[#949ba4]">Today at 12:00 PM</span>
                    </div>
                    
                    {levelupMessageContent && (
                      <div className="mt-1 text-[14px] text-[#dbdee1] whitespace-pre-wrap break-words leading-relaxed">
                        {levelupMessageContent}
                      </div>
                    )}
                    
                    {(levelupEmbedAuthor || levelupEmbedTitle || levelupEmbedDescription || levelupEmbedImage || levelupEmbedFooter) && (
                      <div className="mt-2 bg-[#2b2d31] border-l-4 border-pink-500 rounded p-4 flex flex-col w-full max-w-[432px]">
                        {levelupEmbedAuthor && <span className="font-semibold text-[13px] text-white mb-1">{levelupEmbedAuthor}</span>}
                        {levelupEmbedTitle && <span className="font-bold text-[15px] text-[#00a8fc] mb-2 break-words">{levelupEmbedTitle}</span>}
                        {levelupEmbedDescription && (
                          <span className="text-[14px] text-[#dbdee1] whitespace-pre-wrap break-words leading-relaxed mb-3">
                            {levelupEmbedDescription}
                          </span>
                        )}
                        
                        <div className="flex items-start gap-4 w-full">
                          {levelupEmbedImage && (
                            <img src={levelupEmbedImage} alt="Embed" className="rounded max-w-full max-h-[300px] object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                        </div>
                        
                        {levelupShowAvatar && (
                          <div className="mt-4 flex items-center">
                            <div className="w-16 h-16 rounded-full bg-[#111214] border border-neutral-700/50 flex items-center justify-center text-xs text-neutral-500">Avatar</div>
                          </div>
                        )}
                        
                        {levelupEmbedFooter && (
                          <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-[#949ba4]">
                            <span>{levelupEmbedFooter}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles config */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-neutral-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-cyan-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag w-4 h-4 text-cyan-400">
                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white truncate">Role Rewards</span>
            </div>
          </div>

          <div className="p-5 border-b border-neutral-800/50">
            <h4 className="text-[13px] font-semibold text-white mb-4">Level Roles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-[13px] font-medium text-white block mb-0.5">Stack Roles</label>
                  <span className="text-[11px] text-neutral-500 leading-relaxed block">Keep roles from lower levels.</span>
                </div>
                <Toggle checked={levelRolesStack} onChange={() => setLevelRolesStack(!levelRolesStack)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-[13px] font-medium text-white block mb-0.5">Re-add on Rejoin</label>
                  <span className="text-[11px] text-neutral-500 leading-relaxed block">Users regain roles upon rejoining.</span>
                </div>
                <Toggle checked={levelRolesRejoin} onChange={() => setLevelRolesRejoin(!levelRolesRejoin)} />
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden mb-4">
              <div className="grid grid-cols-[100px_1fr_auto] gap-4 px-4 py-2.5 border-b border-neutral-800 bg-neutral-800/20 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <div>Level</div>
                <div>Role</div>
                <div className="text-center w-10">Action</div>
              </div>
              <div className="divide-y divide-neutral-800/50">
                {levelRoles.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-neutral-500">No level roles configured.</div>
                ) : (
                  levelRoles.map((r, i) => (
                    <div key={i} className="grid grid-cols-[100px_1fr_auto] gap-4 px-4 py-3 items-center">
                      <input type="number" className="w-full px-3 py-2 bg-neutral-800 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700 hover:border-neutral-600 text-sm" placeholder="10" value={r.level || ''} onChange={(e) => {
                        const newRoles = [...levelRoles];
                        newRoles[i] = { ...r, level: parseInt(e.target.value) || 0 };
                        setLevelRoles(newRoles);
                      }} />
                      <CustomSelect options={roleOptions} placeholder="Select Role..." value={r.role || ''} onChange={(val) => {
                        const newRoles = [...levelRoles];
                        newRoles[i] = { ...r, role: val };
                        setLevelRoles(newRoles);
                      }} />
                      <button onClick={() => setLevelRoles(levelRoles.filter((_, idx) => idx !== i))} className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button onClick={() => setLevelRoles([...levelRoles, {}])} className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors border border-neutral-700 hover:border-neutral-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Role Reward
            </button>
          </div>

          <div className="p-5">
            <h4 className="text-[13px] font-semibold text-white mb-4">Stat Roles</h4>
            <div className="flex gap-2 mb-6">
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statTab === 'messages' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`} onClick={() => setStatTab('messages')}>Messages</button>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statTab === 'voice' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`} onClick={() => setStatTab('voice')}>Voice Hours</button>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statTab === 'reactions' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`} onClick={() => setStatTab('reactions')}>Reactions</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-[13px] font-medium text-white block mb-0.5">Stack Stat Roles</label>
                  <span className="text-[11px] text-neutral-500 leading-relaxed block">Keep roles from lower requirements.</span>
                </div>
                <Toggle 
                  checked={statTab === 'messages' ? statRolesMsgStack : statTab === 'voice' ? statRolesVoiceStack : statRolesReactStack} 
                  onChange={() => {
                    if (statTab === 'messages') setStatRolesMsgStack(!statRolesMsgStack);
                    if (statTab === 'voice') setStatRolesVoiceStack(!statRolesVoiceStack);
                    if (statTab === 'reactions') setStatRolesReactStack(!statRolesReactStack);
                  }} 
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-500 block mb-1.5">Stat Cooldown</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600" 
                  value={statTab === 'messages' ? statRolesMsgCooldown : statTab === 'voice' ? statRolesVoiceCooldown : statRolesReactCooldown}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (statTab === 'messages') setStatRolesMsgCooldown(val);
                    if (statTab === 'voice') setStatRolesVoiceCooldown(val);
                    if (statTab === 'reactions') setStatRolesReactCooldown(val);
                  }}
                />
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden mb-4">
              <div className="grid grid-cols-[100px_1fr_auto] gap-4 px-4 py-2.5 border-b border-neutral-800 bg-neutral-800/20 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <div>Count</div>
                <div>Role</div>
                <div className="text-center w-10">Action</div>
              </div>
              <div className="divide-y divide-neutral-800/50">
                {statRoles.filter(r => r.type === statTab || (!r.type && statTab === 'messages')).length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-neutral-500">No {statTab} stat roles configured.</div>
                ) : (
                  statRoles.map((r, i) => {
                    const stype = r.type || 'messages';
                    if (stype !== statTab) return null;
                    return (
                      <div key={i} className="grid grid-cols-[100px_1fr_auto] gap-4 px-4 py-3 items-center">
                        <input type="number" className="w-full px-3 py-2 bg-neutral-800 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700 hover:border-neutral-600 text-sm" placeholder="100" value={r.count || ''} onChange={(e) => {
                          const newRoles = [...statRoles];
                          newRoles[i] = { ...r, count: parseInt(e.target.value) || 0 };
                          setStatRoles(newRoles);
                        }} />
                        <CustomSelect options={roleOptions} placeholder="Select Role..." value={r.role || ''} onChange={(val) => {
                          const newRoles = [...statRoles];
                          newRoles[i] = { ...r, role: val };
                          setStatRoles(newRoles);
                        }} />
                        <button onClick={() => setStatRoles(statRoles.filter((_, idx) => idx !== i))} className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
            <button onClick={() => setStatRoles([...statRoles, { type: statTab }])} className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors border border-neutral-700 hover:border-neutral-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Stat Role
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
