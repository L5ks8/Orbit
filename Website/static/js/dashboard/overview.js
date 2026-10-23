/**
 * Orbit Dashboard - Overview Tab
 * Fully functional overview connected to MongoDB:
 * - 5 live stat cards with week-over-week comparison badges
 * - Live Messages Recharts-style bar chart (48h / 60m) with #22c55e baseline bars, #86efac active bar highlight & 400ms smooth tooltip
 * - Top Message Channels with PeakBot indigo channel badges, circular SVG progress rings & 1D / 1W / 1M / 1Y / All filters
 * - Activity Recharts-style area chart with trend indicator, 1D / 1W / 1M / 1Y / All filters & smooth hover line, dot, and 400ms tooltip
 * - In-place data refresh with spinning icon and live-updating "Synced" timestamp (no full-tab reload)
 * - Real Features status from MongoDB guild configuration
 * - Real Recent Mod Activity feed from MongoDB (ModLogs, Cases, Warns, Bans)
 */

DashboardTabs.Overview = async function(container, guildId, currentGuildInfo = null) {
  if (DashboardTabs._overviewPollTimer) {
    clearInterval(DashboardTabs._overviewPollTimer);
    DashboardTabs._overviewPollTimer = null;
  }
  if (DashboardTabs._overviewSyncTimer) {
    clearInterval(DashboardTabs._overviewSyncTimer);
    DashboardTabs._overviewSyncTimer = null;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatNumber(n) {
    const num = Number(n) || 0;
    return num.toLocaleString('en-US');
  }

  function formatRelativeTime(ts) {
    if (!ts) return '';
    const nowSec = Date.now() / 1000;
    const sec = ts > 1e11 ? ts / 1000 : Number(ts);
    const diff = Math.max(0, Math.floor(nowSec - sec));
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    const d = new Date(sec * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatChartDateLabel(dateStr) {
    if (!dateStr) return '';
    if (/^\d{2}:\d{2}$/.test(dateStr) || /^\d{2}\/\d{2}\s+\d{2}h$/.test(dateStr)) {
      return dateStr;
    }
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(Date.UTC(y, m, d));
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    }
    return dateStr;
  }

  function renderPctBadge(pct) {
    const val = Number(pct) || 0;
    if (val < 0) {
      return `
        <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-red-500/10 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-right w-3 h-3"><path d="m7 7 10 10"></path><path d="M17 7v10H7"></path></svg>${val}%
        </span>
      `;
    }
    return `
      <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-green-500/10 text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-3 h-3"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>+${val}%
      </span>
    `;
  }

  function renderActivityTrendBlock(periodMsgs, prevPeriodMsgs, pctVal, rangeKey) {
    const curr = Number(periodMsgs) || 0;
    const prev = Number(prevPeriodMsgs) || 0;
    const diff = curr - prev;
    const pct = prev <= 0 ? (curr > 0 ? 100.0 : 0.0) : ((curr - prev) / prev) * 100;
    const isDown = pct < 0;
    const absPctStr = Math.abs(pct).toFixed(1) + '%';
    const diffStr = diff >= 0 ? `+${formatNumber(diff)}` : formatNumber(diff);

    const periodComparisonLabel = {
      '1': 'vs. previous day',
      '7': 'vs. previous week',
      '30': 'vs. previous month',
      '365': 'vs. previous year',
      'all': 'vs. previous period'
    }[rangeKey] || 'vs. previous week';

    const colorClass = isDown ? 'text-red-400' : 'text-emerald-400';
    const trendLabel = isDown ? 'Trending down' : 'Trending up';
    const arrowSvg = isDown
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-right w-5 h-5"><path d="m7 7 10 10"></path><path d="M17 7v10H7"></path></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-5 h-5"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>`;

    return `
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-0.5 text-2xl font-bold tabular-nums leading-none ${colorClass}">${arrowSvg}${absPctStr}</span>
        <span class="text-[10px] font-semibold uppercase tracking-wider ${colorClass}">${trendLabel}</span>
      </div>
      <span class="text-[11px] text-neutral-500 mt-1 tabular-nums">${diffStr} ${periodComparisonLabel}</span>
    `;
  }

  function buildRechartsBarPath(x, y, w, h) {
    const bottom = 150;
    const barH = Math.max(2, h);
    const top = bottom - barH;
    const r = barH <= 2 ? 1 : Math.min(2, w / 2, barH / 2);
    const x1 = Number(x.toFixed(2));
    const x2 = Number((x + w).toFixed(2));
    const yTop = Number(top.toFixed(4));
    const yArc = Number((top + r).toFixed(4));
    const xArcL = Number((x + r).toFixed(2));
    const xArcR = Number((x + w - r).toFixed(2));
    return `M${x1},${yArc}A ${r},${r},0,0,1,${xArcL},${yTop}L ${xArcR},${yTop}A ${r},${r},0,0,1,${x2},${yArc}L ${x2},${bottom}L ${x1},${bottom}Z`;
  }

  function buildMonotoneRechartsArea(points, bottomY = 150, topY = 8) {
    if (!points || points.length === 0) return { line: '', area: '' };
    if (points.length === 1) {
      const p = points[0];
      return {
        line: `M${p.x},${p.y}`,
        area: `M${p.x},${p.y}L${p.x},${bottomY}Z`
      };
    }

    const n = points.length;
    const dx = [];
    const dy = [];
    const m = [];
    for (let i = 0; i < n - 1; i++) {
      dx[i] = points[i + 1].x - points[i].x;
      dy[i] = points[i + 1].y - points[i].y;
      m[i] = dx[i] !== 0 ? dy[i] / dx[i] : 0;
    }

    const tangents = new Array(n).fill(0);
    tangents[0] = m[0];
    tangents[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (m[i - 1] * m[i] <= 0) {
        tangents[i] = 0;
      } else {
        tangents[i] = (m[i - 1] + m[i]) / 2;
      }
    }

    for (let i = 0; i < n - 1; i++) {
      if (dy[i] === 0) {
        tangents[i] = 0;
        tangents[i + 1] = 0;
      } else {
        const alpha = tangents[i] / m[i];
        const beta = tangents[i + 1] / m[i];
        const s = alpha * alpha + beta * beta;
        if (s > 9) {
          const tau = 3 / Math.sqrt(s);
          tangents[i] = tau * alpha * m[i];
          tangents[i + 1] = tau * beta * m[i];
        }
      }
    }

    let line = `M${Number(points[0].x.toFixed(3))},${Number(points[0].y.toFixed(3))}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const seg = (p1.x - p0.x) / 3;
      const cp1x = Number((p0.x + seg).toFixed(3));
      const cp1y = Number(Math.min(bottomY, Math.max(topY, p0.y + tangents[i] * seg)).toFixed(3));
      const cp2x = Number((p1.x - seg).toFixed(3));
      const cp2y = Number(Math.min(bottomY, Math.max(topY, p1.y - tangents[i + 1] * seg)).toFixed(3));
      const px = Number(p1.x.toFixed(3));
      const py = Number(p1.y.toFixed(3));
      line += `C${cp1x},${cp1y},${cp2x},${cp2y},${px},${py}`;
    }

    let baselineReturn = `L${Number(points[n - 1].x.toFixed(3))},${bottomY}`;
    for (let i = n - 1; i > 0; i--) {
      const p1 = points[i];
      const p0 = points[i - 1];
      const seg = (p1.x - p0.x) / 3;
      const cp2x = Number((p1.x - seg).toFixed(3));
      const cp1x = Number((p0.x + seg).toFixed(3));
      const px = Number(p0.x.toFixed(3));
      baselineReturn += `C${cp2x},${bottomY},${cp1x},${bottomY},${px},${bottomY}`;
    }
    baselineReturn += 'Z';

    return { line, area: line + baselineReturn };
  }

  function evaluateFeaturesList(configData, openTicketsCount) {
    const cfg = configData?.config || configData || {};
    const am = cfg.automod || {};
    const sec = cfg.security || {};
    const isAutomodActive = Boolean(
      am.enabled ||
      am.banned_words?.enabled ||
      am.anti_spam?.enabled ||
      am.anti_invites?.enabled ||
      am.anti_link?.enabled ||
      am.anti_caps?.enabled ||
      am.mention_spam?.enabled ||
      am.anti_scam?.enabled ||
      am.anti_alt?.enabled ||
      am.anti_bot?.enabled ||
      am.ai_automod?.enabled ||
      am.ai_image?.enabled ||
      am.anti_zalgo?.enabled
    );

    const isWelcomeActive = Boolean(
      cfg.welcome?.enabled ||
      cfg.welcome?.dm_enabled ||
      cfg.goodbye?.enabled ||
      cfg.goodbye?.dm_enabled
    );

    const isReactionRolesActive = Boolean(
      cfg.joinroles?.enabled ||
      cfg.joinroles?.user_roles_enabled ||
      cfg.joinroles?.bot_roles_enabled ||
      cfg.joinroles?.tag_roles_enabled ||
      cfg.joinroles?.sticky_roles?.enabled ||
      cfg.joinroles?.booster_role?.enabled
    );

    const isLevelActive = Boolean(cfg.level?.enabled);
    const isTicketsActive = Boolean(cfg.ticket?.enabled || openTicketsCount > 0);
    const isInvitesActive = Boolean(cfg.invites?.enabled);
    const isVerifyActive = Boolean(cfg.verify?.enabled);
    const isMessagesActive = Boolean(
      cfg.messages_enabled ||
      cfg.autoresponder_enabled ||
      cfg.settings?.autoresponder_enabled ||
      (Array.isArray(cfg.autoresponder) && cfg.autoresponder.length > 0) ||
      (cfg.autoresponder && typeof cfg.autoresponder === 'object' && Object.keys(cfg.autoresponder).length > 0)
    );
    const isTempVoiceActive = Boolean(
      cfg.tempvoice?.enabled ||
      (Array.isArray(cfg.tempvoice?.hubs) && cfg.tempvoice.hubs.length > 0)
    );
    const isSecurityActive = Boolean(
      sec.anti_nuke?.enabled ||
      sec.anti_raid?.enabled ||
      sec.webhook_protection?.enabled
    );
    const isModerationActive = Boolean(
      (cfg.logs?.channels && Object.values(cfg.logs.channels).some(Boolean)) ||
      cfg.appeals?.enabled
    );
    const isPollsActive = Boolean(cfg.polls?.enabled);
    const isGiveawaysActive = Boolean(cfg.giveaways?.enabled);
    const isInactiveKickActive = Boolean(cfg.inactive_kick?.enabled || cfg.settings?.inactive_kick_enabled);
    const isBotProfileActive = Boolean(cfg.botprofile?.nickname || cfg.botprofile?.avatar || cfg.botprofile?.banner);

    return [
      {
        name: 'Welcome',
        active: isWelcomeActive,
        tab: 'welcome',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
      },
      {
        name: 'XP System',
        active: isLevelActive,
        tab: 'level',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star w-3.5 h-3.5 transition-colors __ICON_COLOR__"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
      },
      {
        name: 'Ticket System',
        active: isTicketsActive,
        tab: 'tickets',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>`
      },
      {
        name: 'Auto-Mod',
        active: isAutomodActive,
        tab: 'automod',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`
      },
      {
        name: 'Voice Channels',
        active: isTempVoiceActive,
        tab: 'tempvoice',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>`
      },
      {
        name: 'Moderation',
        active: isModerationActive,
        tab: 'automod',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
      },
      {
        name: 'Invites',
        active: isInvitesActive,
        tab: 'invites',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
      },
      {
        name: 'Polls',
        active: isPollsActive,
        tab: 'polls',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-vote w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="m9 12 2 2 4-4"></path><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path><path d="M22 19H2"></path></svg>`
      },
      {
        name: 'Reaction Roles',
        active: isReactionRolesActive,
        tab: 'roles',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
      },
      {
        name: 'Verification',
        active: isVerifyActive,
        tab: 'verify',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`
      },
      {
        name: 'Giveaways',
        active: isGiveawaysActive,
        tab: 'giveaways',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift w-3.5 h-3.5 transition-colors __ICON_COLOR__"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>`
      },
      {
        name: 'Inactive Kick',
        active: isInactiveKickActive,
        tab: 'inactive-kick',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-minus w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
      },
      {
        name: 'Messages',
        active: isMessagesActive,
        tab: 'messages',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg>`
      },
      {
        name: 'Security',
        active: isSecurityActive,
        tab: 'security',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
      },
      {
        name: 'Bot Profile',
        active: isBotProfileActive,
        tab: 'bot-profile',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-3.5 h-3.5 transition-colors __ICON_COLOR__"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`
      }
    ];
  }

  container.innerHTML = `
    <div id="overview-container" class="space-y-6 pb-10">
      <div id="overview-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading overview...
      </div>
      <div id="overview-content" class="hidden space-y-6"></div>
    </div>
  `;

  const state = {
    liveMode: '48h',
    channelRange: '7',
    activityRange: '7',
    live48h: [],
    total48h: 0,
    live60m: [],
    total60m: 0,
    topChannels: [],
    history: [],
    periodMessages: 0,
    prevPeriodMessages: 0,
    changes: {},
    syncedAt: Date.now(),
    isRefreshing: false
  };

  const RANGE_LABELS = {
    '1': 'Last 24 hours',
    '7': 'Last 7 days',
    '30': 'Last 30 days',
    '365': 'Last 365 days',
    'all': 'All time'
  };

  try {
    const [configData, statsData, liveData, modActivity, guildsData] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getGuildStats(guildId, 7, 7).catch(() => ({})),
      API.getGuildStatsLive(guildId).catch(() => ({})),
      API.getModActivity(guildId).catch(() => ([])),
      API.getGuilds().catch(() => ([]))
    ]);

    const guilds = Array.isArray(guildsData) ? guildsData : (guildsData?.guilds || []);
    const guild = currentGuildInfo || guilds.find(g => String(g.id) === String(guildId)) || {
      id: guildId,
      name: 'Server',
      icon: null
    };

    let iconUrl = '/img/logo.png';
    if (guild.icon) {
      const ext = guild.icon.startsWith('a_') ? 'gif' : 'png';
      iconUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=128`;
    }

    const memberCount = statsData?.total_members ?? statsData?.member_count ?? 0;
    const messageCount = statsData?.week_messages ?? statsData?.message_count ?? statsData?.today_messages ?? 0;
    const activeUsers = statsData?.week_active_users ?? statsData?.active_users ?? statsData?.today_active_users ?? 0;
    const voiceHours = statsData?.voice_hours ?? (statsData?.today_voice_minutes ? Math.round((statsData.today_voice_minutes / 60) * 10) / 10 : 0);
    const openTickets = statsData?.open_tickets ?? 0;

    state.changes = statsData?.changes || {};
    state.live48h = statsData?.live_48h || liveData?.live_48h || [];
    state.total48h = statsData?.total_48h ?? liveData?.total_48h ?? messageCount;
    state.live60m = liveData?.live_60m || [];
    state.total60m = liveData?.total_60m ?? 0;
    state.topChannels = statsData?.top_channels || [];
    state.history = statsData?.history || [];
    state.periodMessages = statsData?.period_messages ?? messageCount;
    state.prevPeriodMessages = statsData?.prev_period_messages ?? 0;
    state.syncedAt = Date.now();

    const featuresList = evaluateFeaturesList(configData, openTickets);
    const activeFeaturesCount = featuresList.filter(f => f.active).length;

    const modLogs = Array.isArray(modActivity) ? modActivity : [];
    const hasAnyData = messageCount > 0 || activeUsers > 0 || voiceHours > 0 || modLogs.length > 0 || state.topChannels.length > 0;

    const content = document.getElementById('overview-content');
    const loading = document.getElementById('overview-loading');
    if (!content) return;

    content.innerHTML = `
      ${!hasAnyData ? `
      <!-- Banner 1: Setup in progress (shown only when no stats tracked yet) -->
      <div id="overview-setup-banner" class="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-4 h-4 text-blue-400 animate-spin flex-shrink-0"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
        <div>
          <p class="text-sm font-medium text-white">Setting up...</p>
          <p class="text-xs text-neutral-400">Statistics will appear shortly after the bot starts tracking.</p>
        </div>
      </div>
      ` : ''}

      <!-- Banner 2: AI Builder Card -->
      <div class="relative overflow-hidden rounded-xl border border-green-500/10 bg-gradient-to-br from-green-950/40 via-neutral-900 to-neutral-900 px-5 py-5 sm:px-6">
        <div class="absolute -top-8 -right-8 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="pointer-events-none absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle, rgb(255, 255, 255) 1px, transparent 1px); background-size: 14px 14px; mask-image: linear-gradient(to left bottom, black 0%, rgba(0, 0, 0, 0.4) 40%, transparent 80%);"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div class="flex-1 min-w-0 space-y-2">
            <span class="text-[10px] font-semibold text-green-400 uppercase tracking-widest block leading-none">AI Builder</span>
            <h2 class="text-base font-bold text-white leading-tight text-balance">Set up your server in seconds</h2>
            <div class="flex flex-wrap gap-1">
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-2.5 h-2.5"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>Channels</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-2.5 h-2.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>Permissions</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-2.5 h-2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Roles</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-2.5 h-2.5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>Bot Config</span>
            </div>
          </div>
          <a class="inline-flex items-center justify-center gap-2 pl-5 pr-[18px] py-2.5 bg-white hover:bg-neutral-200 text-black text-sm font-semibold rounded-lg transition-transform duration-150 ease-out active:scale-[0.96] whitespace-nowrap shrink-0 self-stretch sm:self-center" href="/dashboard/${guildId}/builder">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg> Try AI Builder
          </a>
        </div>
      </div>

      <!-- Banner 3: Server Info Card -->
      <div class="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-4 sm:p-6">
        <div class="pointer-events-none absolute -bottom-20 -right-10 w-[700px] h-80 opacity-25" style="background: radial-gradient(at right center, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 30%, rgba(34, 197, 94, 0.02) 60%, transparent 90%);"></div>
        <div class="relative flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-neutral-800 bg-neutral-800 flex items-center justify-center">
              <img alt="${escapeHtml(guild.name)}" class="w-full h-full object-cover" src="${iconUrl}" onerror="this.src='/img/logo.png'">
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2.5">
                <h1 class="text-xl font-semibold text-white truncate">${escapeHtml(guild.name)}</h1>
              </div>
              <p id="overview-server-subtitle" class="text-xs text-neutral-500 mt-0.5 truncate tabular-nums">Online &amp; Active · ${formatNumber(memberCount)} members</p>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="flex items-center gap-1.5 text-xs"><div class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div></div>
            <div class="flex items-center gap-1.5 text-xs text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span id="overview-sync-label" class="hidden sm:inline tabular-nums transition-colors duration-300">Just now</span>
              <button id="overview-refresh-btn" type="button" class="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white cursor-pointer" aria-label="Refresh" title="Refresh statistics">
                <svg id="overview-refresh-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-3.5 h-3.5 transition-transform"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 5 Stat Cards: Members, Messages, Active users, Voice hours, Open tickets -->
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-px bg-neutral-800">
          
          <!-- Members -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-3.5 h-3.5 text-blue-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Members</span>
            </div>
            <p id="stat-card-members" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(memberCount)}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span id="stat-pct-members">${renderPctBadge(state.changes.members_pct)}</span>
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Messages -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-3.5 h-3.5 text-green-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Messages</span>
            </div>
            <p id="stat-card-messages" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(messageCount)}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span id="stat-pct-messages">${renderPctBadge(state.changes.messages_pct)}</span>
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Active Users -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity w-3.5 h-3.5 text-cyan-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Active users</span>
            </div>
            <p id="stat-card-active-users" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(activeUsers)}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span id="stat-pct-active-users">${renderPctBadge(state.changes.active_users_pct)}</span>
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Voice Hours -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic w-3.5 h-3.5 text-purple-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Voice hours</span>
            </div>
            <p id="stat-card-voice-hours" class="text-[28px] font-bold tabular-nums leading-none text-white">${voiceHours}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span id="stat-pct-voice">${renderPctBadge(state.changes.voice_pct)}</span>
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Open Tickets -->
          <a href="/dashboard/${guildId}/tickets" class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors max-lg:col-span-2 block">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-3.5 h-3.5 text-neutral-400"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Open tickets</span>
            </div>
            <p id="stat-card-tickets" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(openTickets)}</p>
            <div id="stat-tickets-status" class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              ${openTickets > 0
                ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">${openTickets} awaiting reply</span>`
                : `<span class="text-[10px] text-neutral-500">all clear</span>`
              }
            </div>
          </a>

        </div>
      </div>

      <!-- Two-column row: 48h/60m messages chart & Top Message Channels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Messages · Last 48 hours / 60 minutes (Exact Recharts layout) -->
        <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div class="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p id="live-chart-subtitle" class="text-[13px] text-neutral-400 font-medium">Messages · Last 48 hours</p>
              <p id="live-chart-total" class="text-3xl font-bold text-white tabular-nums mt-1">${formatNumber(state.total48h)}</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
              <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700" id="live-mode-buttons">
                <button type="button" data-live-mode="48h" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-black cursor-pointer">
                  <span data-pill class="absolute inset-0 bg-white rounded-md" style="opacity: 1;"></span>
                  <span class="relative z-10">48h</span>
                </button>
                <button type="button" data-live-mode="60m" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-400 hover:text-white cursor-pointer">
                  <span data-pill class="absolute inset-0 bg-white rounded-md hidden" style="opacity: 0;"></span>
                  <span class="relative z-10">60m</span>
                </button>
              </div>
            </div>
          </div>
          <div class="px-5 pb-5">
            <div id="live-chart-wrapper" class="recharts-responsive-container relative select-none" style="width: 100%; height: 180px; min-width: 0px;"></div>
          </div>
        </div>

        <!-- Top Message Channels -->
        <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div class="px-4 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div class="min-w-0">
              <p class="text-sm text-white font-semibold">Top Message Channels</p>
              <p id="top-channels-subtitle" class="text-[11px] text-neutral-500 mt-0.5">Last 7 days</p>
            </div>
            <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 shrink-0" id="top-channels-range-buttons">
              <button type="button" data-ch-range="1" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">1D</span></button>
              <button type="button" data-ch-range="7" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none text-black cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md"></span><span class="relative z-10">1W</span></button>
              <button type="button" data-ch-range="30" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">1M</span></button>
              <button type="button" data-ch-range="365" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">1Y</span></button>
              <button type="button" data-ch-range="all" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">All</span></button>
            </div>
          </div>
          <div id="top-channels-body" class="flex-1 px-2 pb-3"></div>
        </div>

      </div>

      <!-- Activity Section Chart (Exact Recharts layout) -->
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
        <div class="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity w-3.5 h-3.5 text-green-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            <span class="text-sm font-medium text-white">Activity</span>
            <span id="activity-range-subtitle" class="text-[11px] text-neutral-500">last 7 days</span>
          </div>
          <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 flex-shrink-0" id="activity-range-buttons">
            <button type="button" data-act-range="1" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">1D</span></button>
            <button type="button" data-act-range="7" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-black cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md"></span><span class="relative z-10">1W</span></button>
            <button type="button" data-act-range="30" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">1M</span></button>
            <button type="button" data-act-range="365" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">1Y</span></button>
            <button type="button" data-act-range="all" class="relative px-2.5 py-1 max-sm:px-3 max-sm:py-1.5 text-[11px] font-medium rounded-md transition-[transform,color] duration-150 ease-out active:scale-[0.96] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-400 hover:text-white cursor-pointer"><span data-pill class="absolute inset-0 bg-white rounded-md hidden"></span><span class="relative z-10">All</span></button>
          </div>
        </div>
        <div class="px-5 pb-3 flex items-end justify-between gap-6 flex-wrap">
          <div class="flex items-end gap-4">
            <div class="flex flex-col">
              <span id="activity-total-messages" class="text-4xl font-bold text-white tabular-nums leading-none">${formatNumber(state.periodMessages)}</span>
              <span class="text-[11px] text-neutral-500 mt-1">Messages</span>
            </div>
            <div id="activity-pct-wrapper" class="flex flex-col pb-0.5">
              ${renderActivityTrendBlock(state.periodMessages, state.prevPeriodMessages, state.changes.period_messages_pct, state.activityRange)}
            </div>
          </div>
          <div class="flex flex-col items-end gap-1.5"></div>
        </div>
        <div class="px-5 pb-4">
          <div id="activity-chart-wrapper" class="recharts-responsive-container relative select-none" style="width: 100%; height: 180px; min-width: 0px;"></div>
        </div>
      </div>

      <!-- Features & Recent mod activity -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        <!-- Features List -->
        <div class="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div class="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-4 h-4 text-neutral-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span class="text-sm font-semibold text-white">Features</span>
              <span id="features-active-count" class="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tabular-nums ${activeFeaturesCount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}">${activeFeaturesCount}/${featuresList.length}</span>
            </div>
          </div>
          <div id="features-list-body" class="flex flex-col flex-1 divide-y divide-neutral-800/60"></div>
        </div>

        <!-- Recent Mod Activity -->
        <div class="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div class="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-4 h-4 text-neutral-500"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
              <span class="text-sm font-semibold text-white">Recent mod activity</span>
              <span id="mod-activity-count-badge" class="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 font-medium tabular-nums">${modLogs.length}</span>
            </div>
            <a class="relative -my-2 py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-[transform,color] duration-150 ease-out active:scale-[0.96] inline-flex items-center gap-1 group focus-visible:outline-none focus-visible:text-neutral-200" href="/dashboard/${guildId}/automod">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3 h-3 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>
          <div id="mod-activity-summary-pills" class="hidden flex-wrap gap-1.5 px-4 py-2.5 border-b border-neutral-800/60 bg-neutral-900/50"></div>
          <div id="mod-activity-body" class="flex flex-col flex-1 min-h-0"></div>
        </div>

      </div>
    `;

    // ─── Synced Label Helper ────────────────────────────────────────────────────

    function updateSyncLabel(justRefreshed = false) {
      const el = document.getElementById('overview-sync-label');
      if (!el) return;
      const diffSec = Math.max(0, Math.floor((Date.now() - state.syncedAt) / 1000));
      const syncTimeStr = new Date(state.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      el.title = `Last synced at ${syncTimeStr}`;

      if (justRefreshed) {
        el.textContent = `Synced just now (${syncTimeStr})`;
        el.classList.remove('text-neutral-500');
        el.classList.add('text-green-400');
        setTimeout(() => {
          if (el) {
            el.classList.remove('text-green-400');
            el.classList.add('text-neutral-500');
          }
        }, 1800);
        return;
      }

      if (diffSec < 5) {
        el.textContent = 'Just now';
      } else if (diffSec < 60) {
        el.textContent = `${diffSec}s ago`;
      } else if (diffSec < 3600) {
        el.textContent = `${Math.floor(diffSec / 60)}m ago`;
      } else {
        el.textContent = `${Math.floor(diffSec / 3600)}h ago`;
      }
    }

    DashboardTabs._overviewSyncTimer = setInterval(() => {
      if (!document.getElementById('overview-sync-label')) {
        clearInterval(DashboardTabs._overviewSyncTimer);
        DashboardTabs._overviewSyncTimer = null;
        return;
      }
      updateSyncLabel(false);
    }, 5000);

    // ─── Render Functions for Dynamic Sections ──────────────────────────────────

    function renderFeaturesList(list) {
      const body = document.getElementById('features-list-body');
      const countEl = document.getElementById('features-active-count');
      if (!body) return;
      const activeCnt = list.filter(f => f.active).length;
      if (countEl) {
        countEl.textContent = `${activeCnt}/${list.length}`;
        countEl.className = `text-[10px] px-1.5 py-0.5 rounded-md font-semibold tabular-nums ${activeCnt > 0 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`;
      }
      body.innerHTML = list.map(f => {
        const iconColor = f.active ? 'text-green-400' : 'text-neutral-500';
        const iconBoxBg = f.active ? 'bg-green-500/10' : 'bg-neutral-800';
        const dotClass = f.active ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-neutral-700';
        const svgHtml = (f.svg || '').replace('__ICON_COLOR__', iconColor);
        return `
          <a class="group flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-800/40 transition-colors focus-visible:outline-none focus-visible:bg-neutral-800/40" href="/dashboard/${guildId}/${f.tab}">
            <div class="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${iconBoxBg}">
              ${svgHtml}
            </div>
            <span class="text-[13px] font-medium text-white truncate flex-1">${escapeHtml(f.name)}</span>
            <span title="${f.active ? 'Active' : 'Inactive'}" class="flex-shrink-0 w-2 h-2 rounded-full ${dotClass}"></span>
          </a>
        `;
      }).join('');
    }

    function renderLiveChart() {
      const wrapper = document.getElementById('live-chart-wrapper');
      const subtitleEl = document.getElementById('live-chart-subtitle');
      const totalEl = document.getElementById('live-chart-total');
      if (!wrapper) return;

      const is48h = state.liveMode === '48h';
      const rawData = is48h ? state.live48h : state.live60m;
      const totalVal = is48h ? state.total48h : state.total60m;

      if (subtitleEl) subtitleEl.textContent = is48h ? 'Messages · Last 48 hours' : 'Messages · Last 60 minutes';
      if (totalEl) totalEl.textContent = formatNumber(totalVal);

      const count = is48h ? 48 : 60;
      const buckets = [];
      for (let i = 0; i < count; i++) {
        const item = rawData[i] || {};
        buckets.push({
          label: item.label || item.name || (is48h ? `${i}h` : `${i}m`),
          messages: Number(item.messages) || 0
        });
      }

      const maxDataVal = Math.max(0, ...buckets.map(b => b.messages));
      const step = maxDataVal <= 0 ? 1 : Math.ceil(maxDataVal / 4);
      const yMax = step * 4;
      const yTicks = [0, step, step * 2, step * 3, step * 4];
      const yCoords = [150, 113.5, 77, 40.5, 6.75];

      const W = 444;
      const H = 180;
      const plotLeft = 32;
      const plotRight = 440;
      const plotW = plotRight - plotLeft; // 408
      const plotH = 146; // 150 - 4
      const slotW = plotW / count; // 8.5 for 48h
      const barW = is48h ? 6 : 4.8;

      const barsMeta = buckets.map((b, i) => {
        const x = plotLeft + i * slotW + 0.85;
        const h = b.messages > 0 ? Math.max(2, (b.messages / yMax) * plotH) : 2;
        const y = 150 - h;
        const d = buildRechartsBarPath(x, y, barW, h);
        return { x, y, w: barW, h, d, label: b.label, messages: b.messages };
      });

      const barsSvg = barsMeta.map((b, i) => `
        <g class="recharts-layer recharts-bar-rectangle">
          <path data-bar-idx="${i}" name="Messages" fill="#22c55e" x="${b.x.toFixed(2)}" y="${b.y.toFixed(4)}" width="${b.w}" height="${b.h.toFixed(4)}" class="recharts-rectangle" d="${b.d}" style="transition: fill 150ms ease;"></path>
        </g>
      `).join('');

      const tickIndices = is48h ? [0, 8, 16, 24, 32, 40] : [0, 10, 20, 30, 40, 50];
      const xTicksSvg = tickIndices.map(idx => {
        const b = barsMeta[Math.min(barsMeta.length - 1, idx)];
        const tx = Number((plotLeft + idx * slotW + slotW / 2).toFixed(2));
        return `
          <g class="recharts-layer recharts-cartesian-axis-tick-label">
            <text height="30" orientation="bottom" width="408" stroke="none" font-size="9" x="${tx}" y="158" class="recharts-text recharts-cartesian-axis-tick-value" text-anchor="middle" fill="#525252">
              <tspan x="${tx}" dy="0.71em">${escapeHtml(b?.label || '')}</tspan>
            </text>
          </g>
        `;
      }).join('');

      const yTicksSvg = yTicks.map((val, idx) => `
        <g class="recharts-layer recharts-cartesian-axis-tick-label">
          <text width="32" orientation="left" height="146" stroke="none" font-size="9" x="24" y="${yCoords[idx]}" class="recharts-text recharts-cartesian-axis-tick-value" text-anchor="end" fill="#525252">
            <tspan x="24" dy="0.355em">${val}</tspan>
          </text>
        </g>
      `).join('');

      wrapper.innerHTML = `
        <div class="recharts-wrapper" style="position: relative; cursor: default; width: 100%; height: 180px;">
          <div id="live-chart-tooltip" tabindex="-1" class="recharts-tooltip-wrapper" style="visibility: hidden; opacity: 0; pointer-events: none; position: absolute; top: 0px; left: 0px; z-index: 20; transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease; transform: translate(46.25px, 27.5px);">
            <div class="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-xl">
              <p id="live-tooltip-date" class="text-[11px] text-neutral-400 mb-1"></p>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-neutral-400">Messages:</span>
                <span id="live-tooltip-val" class="text-white font-semibold tabular-nums">0</span>
              </div>
            </div>
          </div>
          <svg id="live-chart-svg" role="application" tabindex="0" class="recharts-surface" width="444" height="180" viewBox="0 0 444 180" style="width: 100%; height: 100%; display: block;">
            <g class="recharts-cartesian-grid">
              <g class="recharts-cartesian-grid-horizontal">
                <line stroke="#171717" fill="none" x="32" y="4" width="408" height="146" x1="32" y1="150" x2="440" y2="150"></line>
                <line stroke="#171717" fill="none" x="32" y="4" width="408" height="146" x1="32" y1="113.5" x2="440" y2="113.5"></line>
                <line stroke="#171717" fill="none" x="32" y="4" width="408" height="146" x1="32" y1="77" x2="440" y2="77"></line>
                <line stroke="#171717" fill="none" x="32" y="4" width="408" height="146" x1="32" y1="40.5" x2="440" y2="40.5"></line>
                <line stroke="#171717" fill="none" x="32" y="4" width="408" height="146" x1="32" y1="4" x2="440" y2="4"></line>
              </g>
            </g>
            <g class="recharts-layer recharts-bar">
              <g class="recharts-layer recharts-bar-rectangles">
                <g class="recharts-layer">
                  ${barsSvg}
                </g>
              </g>
            </g>
            <g class="recharts-cartesian-axis-tick-labels recharts-xAxis-tick-labels">
              ${xTicksSvg}
            </g>
            <g class="recharts-cartesian-axis-tick-labels recharts-yAxis-tick-labels">
              ${yTicksSvg}
            </g>
          </svg>
        </div>
      `;

      const svgEl = document.getElementById('live-chart-svg');
      const tooltip = document.getElementById('live-chart-tooltip');
      const tooltipDate = document.getElementById('live-tooltip-date');
      const tooltipVal = document.getElementById('live-tooltip-val');
      const barPaths = svgEl ? Array.from(svgEl.querySelectorAll('path[data-bar-idx]')) : [];

      function handleMove(clientX) {
        const rect = wrapper.getBoundingClientRect();
        if (!rect.width) return;
        const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const svgX = (relX / rect.width) * W;
        const idx = Math.max(0, Math.min(count - 1, Math.floor((svgX - plotLeft) / slotW)));
        const b = barsMeta[idx];
        if (!b) return;

        barPaths.forEach((p, i) => {
          p.setAttribute('fill', i === idx ? '#86efac' : '#22c55e');
        });

        if (tooltip && tooltipDate && tooltipVal) {
          tooltipDate.textContent = b.label;
          tooltipVal.textContent = formatNumber(b.messages);
          tooltip.style.visibility = 'visible';
          tooltip.style.opacity = '1';

          const pxX = ((b.x + b.w / 2) / W) * rect.width;
          const tipW = tooltip.offsetWidth || 120;
          const tx = pxX + tipW + 18 > rect.width
            ? Math.max(8, pxX - tipW - 10)
            : pxX + 10;
          tooltip.style.transform = `translate(${tx.toFixed(1)}px, 27.5px)`;
        }
      }

      wrapper.onmousemove = (e) => handleMove(e.clientX);
      wrapper.ontouchmove = (e) => {
        if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
      };
      wrapper.onmouseleave = () => {
        if (tooltip) {
          tooltip.style.opacity = '0';
          tooltip.style.visibility = 'hidden';
        }
        barPaths.forEach(p => p.setAttribute('fill', '#22c55e'));
      };
    }

    function renderTopChannels() {
      const body = document.getElementById('top-channels-body');
      const subtitle = document.getElementById('top-channels-subtitle');
      if (!body) return;

      if (subtitle) {
        subtitle.textContent = RANGE_LABELS[state.channelRange] || 'Last 7 days';
      }

      const channels = Array.isArray(state.topChannels) ? state.topChannels : [];
      if (channels.length === 0) {
        body.innerHTML = `
          <div class="h-[180px] flex flex-col items-center justify-center text-center">
            <p class="text-sm text-neutral-500">No channel activity yet</p>
            <p class="text-xs text-neutral-600 mt-1">Stats build up as messages come in.</p>
          </div>
        `;
        return;
      }

      const totalMsgs = Math.max(1, channels.reduce((acc, c) => acc + (Number(c.messages) || 0), 0));
      const circumference = 94.2;

      body.innerHTML = `
        <div class="divide-y divide-neutral-800/40">
          ${channels.map((ch) => {
            const msgs = Number(ch.messages) || 0;
            const pct = ch.percentage !== undefined ? Number(ch.percentage) : Math.round((msgs / totalMsgs) * 100);
            const changeVal = ch.change !== undefined ? Number(ch.change) : msgs;
            const changeFormatted = changeVal >= 0 ? `+${formatNumber(changeVal)}` : formatNumber(changeVal);
            const dashLen = Math.max(0, Math.min(circumference, (pct / 100) * circumference)).toFixed(1);

            return `
              <div class="grid grid-cols-[minmax(0,1.4fr)_minmax(56px,auto)_minmax(64px,auto)] sm:grid-cols-[minmax(0,1.4fr)_minmax(70px,1fr)_minmax(90px,1fr)_minmax(110px,1fr)] gap-2 sm:gap-3 items-center px-2.5 py-1.5 hover:bg-white/[0.02] transition-colors">
                <span class="inline-flex items-center gap-1 min-w-0 px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 rounded w-fit max-w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-2.5 h-2.5 text-indigo-300 flex-shrink-0"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                  <span class="text-[11px] text-indigo-200 font-medium truncate">${escapeHtml(ch.name)}</span>
                </span>
                <span class="text-sm text-white font-semibold tabular-nums">${formatNumber(msgs)}</span>
                <div class="flex items-center gap-1.5">
                  <div class="relative w-5 h-5 flex-shrink-0">
                    <svg viewBox="0 0 36 36" class="w-5 h-5 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="4" class="text-neutral-700"></circle>
                      <circle data-target-dash="${dashLen} 94.2" cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="0 94.2" class="text-emerald-500" style="transition: stroke-dasharray 550ms cubic-bezier(0.22, 1, 0.36, 1);"></circle>
                    </svg>
                  </div>
                  <span class="text-xs text-neutral-200 tabular-nums">${pct}%</span>
                </div>
                <span class="hidden sm:inline text-xs tabular-nums font-medium ${changeVal >= 0 ? 'text-emerald-400' : 'text-red-400'}">${changeFormatted}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;

      requestAnimationFrame(() => {
        body.querySelectorAll('circle[data-target-dash]').forEach(c => {
          c.setAttribute('stroke-dasharray', c.getAttribute('data-target-dash'));
        });
      });
    }

    function renderActivityChart() {
      const wrapper = document.getElementById('activity-chart-wrapper');
      const totalEl = document.getElementById('activity-total-messages');
      const subtitleEl = document.getElementById('activity-range-subtitle');
      const pctWrapper = document.getElementById('activity-pct-wrapper');
      if (!wrapper) return;

      if (totalEl) totalEl.textContent = formatNumber(state.periodMessages);
      if (subtitleEl) subtitleEl.textContent = (RANGE_LABELS[state.activityRange] || 'Last 7 days').toLowerCase();
      if (pctWrapper) {
        pctWrapper.innerHTML = renderActivityTrendBlock(
          state.periodMessages,
          state.prevPeriodMessages,
          state.changes?.period_messages_pct,
          state.activityRange
        );
      }

      const history = Array.isArray(state.history) && state.history.length > 0
        ? state.history
        : Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date(Date.now() - (6 - idx) * 86400000);
            return {
              date: d.toISOString().slice(0, 10),
              messages: 0
            };
          });

      const values = history.map(h => Number(h.messages) || 0);
      const maxDataVal = Math.max(0, ...values);
      const step = maxDataVal <= 0 ? 1 : Math.ceil(maxDataVal / 4);
      const yMax = step * 4;
      const yTicks = [0, step, step * 2, step * 3, step * 4];
      const yCoords = [150, 114.5, 79, 43.5, 8];

      const W = 949;
      const H = 180;
      const padLeft = 28;
      const padRight = 4; // 949 - 945
      const topY = 8;
      const bottomY = 150;
      const plotW = 917; // 945 - 28
      const plotH = 142; // 150 - 8

      const points = history.map((item, idx) => {
        const x = history.length === 1
          ? padLeft + plotW / 2
          : padLeft + (idx / (history.length - 1)) * plotW;
        const val = Number(item.messages) || 0;
        const y = bottomY - (val / yMax) * plotH;
        const formattedDate = formatChartDateLabel(item.date);
        return {
          x,
          y,
          val,
          rawDate: item.date,
          label: formattedDate,
          tooltipDate: item.full_date || formattedDate
        };
      });

      const { line, area } = buildMonotoneRechartsArea(points, bottomY, topY);

      const maxLabels = 7;
      const labelIndices = [];
      if (points.length <= 8) {
        for (let i = 0; i < points.length; i++) labelIndices.push(i);
      } else {
        for (let i = 0; i < maxLabels; i++) {
          labelIndices.push(Math.round((i / (maxLabels - 1)) * (points.length - 1)));
        }
      }

      const xLabelsSvg = labelIndices.map((idx, posIdx) => {
        const pt = points[idx];
        const lx = posIdx === labelIndices.length - 1 ? Math.min(pt.x, 934.64) : pt.x;
        return `
          <g class="recharts-layer recharts-cartesian-axis-tick-label">
            <text height="30" orientation="bottom" width="917" stroke="none" font-size="10" x="${lx.toFixed(2)}" y="158" class="recharts-text recharts-cartesian-axis-tick-value" text-anchor="middle" fill="#525252">
              <tspan x="${lx.toFixed(2)}" dy="0.71em">${escapeHtml(pt.label)}</tspan>
            </text>
          </g>
        `;
      }).join('');

      const yLabelsSvg = yTicks.map((tickVal, idx) => `
        <g class="recharts-layer recharts-cartesian-axis-tick-label">
          <text width="28" orientation="left" height="142" stroke="none" font-size="10" x="20" y="${yCoords[idx]}" class="recharts-text recharts-cartesian-axis-tick-value" text-anchor="end" fill="#525252">
            <tspan x="20" dy="0.355em">${tickVal}</tspan>
          </text>
        </g>
      `).join('');

      wrapper.innerHTML = `
        <div class="recharts-wrapper" style="position: relative; cursor: default; width: 100%; height: 180px;">
          <div id="activity-chart-tooltip" tabindex="-1" class="recharts-tooltip-wrapper" style="visibility: hidden; opacity: 0; pointer-events: none; position: absolute; top: 0px; left: 0px; z-index: 20; transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease; transform: translate(0px, 0px);">
            <div class="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-xl">
              <p id="activity-tooltip-date" class="text-[11px] text-neutral-400 mb-1"></p>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-neutral-400">Messages:</span>
                <span id="activity-tooltip-num" class="text-white font-semibold tabular-nums">0</span>
              </div>
            </div>
          </div>
          <svg id="activity-chart-svg" role="application" tabindex="0" class="recharts-surface" width="949" height="180" viewBox="0 0 949 180" style="width: 100%; height: 100%; display: block;">
            <g class="recharts-cartesian-grid">
              <g class="recharts-cartesian-grid-horizontal">
                <line stroke="#171717" fill="none" x="28" y="8" width="917" height="142" x1="28" y1="150" x2="945" y2="150"></line>
                <line stroke="#171717" fill="none" x="28" y="8" width="917" height="142" x1="28" y1="114.5" x2="945" y2="114.5"></line>
                <line stroke="#171717" fill="none" x="28" y="8" width="917" height="142" x1="28" y1="79" x2="945" y2="79"></line>
                <line stroke="#171717" fill="none" x="28" y="8" width="917" height="142" x1="28" y1="43.5" x2="945" y2="43.5"></line>
                <line stroke="#171717" fill="none" x="28" y="8" width="917" height="142" x1="28" y1="8" x2="945" y2="8"></line>
              </g>
            </g>
            <defs>
              <clipPath id="recharts1-clip"><rect x="28" y="8" height="142" width="917"></rect></clipPath>
              <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#22c55e" stop-opacity="0.3"></stop>
                <stop offset="100%" stop-color="#22c55e" stop-opacity="0"></stop>
              </linearGradient>
            </defs>
            <g class="recharts-layer recharts-area">
              <g class="recharts-layer">
                <path id="activity-area-path" name="Messages" stroke-width="2" fill="url(#weeklyFill)" fill-opacity="0.6" height="142" stroke="none" width="917" class="recharts-curve recharts-area-area" d="${area}" style="opacity: 0; transition: opacity 550ms ease-out;"></path>
                <path id="activity-line-path" name="Messages" stroke-width="2" fill="none" fill-opacity="0.6" height="142" stroke="#22c55e" width="917" class="recharts-curve recharts-area-curve" d="${line}"></path>
              </g>
            </g>
            <line id="activity-hover-line" x1="0" y1="${topY}" x2="0" y2="${bottomY}" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3 3" class="opacity-0 pointer-events-none" style="transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease;"></line>
            <g class="recharts-layer recharts-area-dots">
              <circle id="activity-hover-dot" cx="0" cy="0" r="4" fill="#22c55e" stroke="#ffffff" stroke-width="2" class="opacity-0 pointer-events-none" style="transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease;"></circle>
            </g>
            <g class="recharts-cartesian-axis-tick-labels recharts-xAxis-tick-labels">
              ${xLabelsSvg}
            </g>
            <g class="recharts-cartesian-axis-tick-labels recharts-yAxis-tick-labels">
              ${yLabelsSvg}
            </g>
          </svg>
        </div>
      `;

      const linePathEl = document.getElementById('activity-line-path');
      const areaPathEl = document.getElementById('activity-area-path');
      if (linePathEl) {
        try {
          const totalLen = Math.ceil(linePathEl.getTotalLength() || 1000);
          linePathEl.style.strokeDasharray = `${totalLen}`;
          linePathEl.style.strokeDashoffset = `${totalLen}`;
          linePathEl.getBoundingClientRect();
          linePathEl.style.transition = 'stroke-dashoffset 650ms cubic-bezier(0.22, 1, 0.36, 1)';
          linePathEl.style.strokeDashoffset = '0';
        } catch (_) {}
      }
      if (areaPathEl) {
        requestAnimationFrame(() => {
          areaPathEl.style.opacity = '1';
        });
      }

      const hoverLine = document.getElementById('activity-hover-line');
      const hoverDot = document.getElementById('activity-hover-dot');
      const tooltip = document.getElementById('activity-chart-tooltip');
      const tooltipDate = document.getElementById('activity-tooltip-date');
      const tooltipNum = document.getElementById('activity-tooltip-num');

      let isHoverActive = false;

      function handleActivityHover(clientX) {
        const rect = wrapper.getBoundingClientRect();
        if (!rect.width || points.length === 0) return;
        const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const svgX = (relX / rect.width) * W;

        let nearestIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < points.length; i++) {
          const dist = Math.abs(points[i].x - svgX);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i;
          }
        }

        const pt = points[nearestIdx];
        if (!pt) return;

        if (hoverLine) {
          if (!isHoverActive) {
            hoverLine.style.transition = 'none';
            hoverLine.style.transform = `translateX(${pt.x.toFixed(2)}px)`;
            hoverLine.getBoundingClientRect();
            hoverLine.style.transition = 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease';
          } else {
            hoverLine.style.transform = `translateX(${pt.x.toFixed(2)}px)`;
          }
          hoverLine.classList.remove('opacity-0');
        }

        if (hoverDot) {
          if (!isHoverActive) {
            hoverDot.style.transition = 'none';
            hoverDot.style.transform = `translate(${pt.x.toFixed(2)}px, ${pt.y.toFixed(2)}px)`;
            hoverDot.getBoundingClientRect();
            hoverDot.style.transition = 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease';
          } else {
            hoverDot.style.transform = `translate(${pt.x.toFixed(2)}px, ${pt.y.toFixed(2)}px)`;
          }
          hoverDot.classList.remove('opacity-0');
        }

        if (tooltip && tooltipDate && tooltipNum) {
          tooltipDate.textContent = pt.tooltipDate;
          tooltipNum.textContent = formatNumber(pt.val);
          tooltip.style.visibility = 'visible';
          tooltip.style.opacity = '1';

          const pxX = (pt.x / W) * rect.width;
          const pxY = (pt.y / H) * rect.height;
          const tipW = tooltip.offsetWidth || 125;
          const tipH = tooltip.offsetHeight || 54;

          const tx = pxX + tipW + 18 > rect.width
            ? Math.max(8, pxX - tipW - 14)
            : pxX + 14;
          const ty = Math.max(8, Math.min(rect.height - tipH - 26, pxY - tipH / 2));

          tooltip.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
        }

        isHoverActive = true;
      }

      wrapper.onmousemove = (e) => handleActivityHover(e.clientX);
      wrapper.ontouchmove = (e) => {
        if (e.touches && e.touches[0]) handleActivityHover(e.touches[0].clientX);
      };
      wrapper.onmouseleave = () => {
        isHoverActive = false;
        if (hoverLine) hoverLine.classList.add('opacity-0');
        if (hoverDot) hoverDot.classList.add('opacity-0');
        if (tooltip) {
          tooltip.style.opacity = '0';
          tooltip.style.visibility = 'hidden';
        }
      };
    }

    function renderModActivity(logs) {
      const body = document.getElementById('mod-activity-body');
      const pillsEl = document.getElementById('mod-activity-summary-pills');
      const countBadgeEl = document.getElementById('mod-activity-count-badge');
      if (!body) return;

      const list = Array.isArray(logs) ? logs : [];
      if (countBadgeEl) {
        countBadgeEl.textContent = String(list.length);
      }

      if (list.length === 0) {
        if (pillsEl) {
          pillsEl.innerHTML = '';
          pillsEl.classList.add('hidden');
          pillsEl.classList.remove('flex');
        }
        body.innerHTML = `
          <div class="flex-1 flex flex-col items-center justify-center py-10 gap-2">
            <div class="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-6 h-6 text-neutral-600"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
            </div>
            <p class="text-sm text-neutral-400 font-medium">All quiet</p>
            <p class="text-[11px] text-neutral-600 text-center max-w-[240px]">No moderation actions yet. Actions will appear here as your mods take them.</p>
          </div>
        `;
        return;
      }

      function getActionStyle(actionRaw) {
        const a = String(actionRaw || '').toLowerCase();
        if (a.includes('unban')) {
          return {
            key: 'unban',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-400',
            label: 'Unbanned',
            summaryLabel: 'unbanned',
            iconSm: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-2.5 h-2.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
            iconMd: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-3.5 h-3.5 text-emerald-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`
          };
        }
        if (a.includes('ban')) {
          return {
            key: 'ban',
            bg: 'bg-red-500/10',
            text: 'text-red-400',
            label: a.includes('temp') ? 'Tempbanned' : (a.includes('soft') ? 'Softbanned' : 'Banned'),
            summaryLabel: 'banned',
            iconSm: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ban w-2.5 h-2.5"><circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path></svg>`,
            iconMd: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ban w-3.5 h-3.5 text-red-400"><circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path></svg>`
          };
        }
        if (a.includes('kick')) {
          return {
            key: 'kick',
            bg: 'bg-orange-500/10',
            text: 'text-orange-400',
            label: 'Kicked',
            summaryLabel: 'kicked',
            iconSm: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-minus w-2.5 h-2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>`,
            iconMd: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-minus w-3.5 h-3.5 text-orange-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
          };
        }
        if (a.includes('warn')) {
          return {
            key: 'warn',
            bg: 'bg-yellow-500/10',
            text: 'text-yellow-400',
            label: 'Warned',
            summaryLabel: 'warned',
            iconSm: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle w-2.5 h-2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
            iconMd: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle w-3.5 h-3.5 text-yellow-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`
          };
        }
        if (a.includes('timeout') || a.includes('mute')) {
          return {
            key: 'timeout',
            bg: 'bg-purple-500/10',
            text: 'text-purple-400',
            label: 'Muted',
            summaryLabel: 'muted',
            iconSm: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-2.5 h-2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
            iconMd: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3.5 h-3.5 text-purple-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
          };
        }
        return {
          key: a || 'mod',
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          label: String(actionRaw || 'Action').replace(/_/g, ' '),
          summaryLabel: String(actionRaw || 'action').toLowerCase().replace(/_/g, ' '),
          iconSm: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-2.5 h-2.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
          iconMd: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-3.5 h-3.5 text-blue-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
        };
      }

      const grouped = {};
      list.forEach(item => {
        const st = getActionStyle(item.action);
        if (!grouped[st.key]) grouped[st.key] = { count: 0, style: st };
        grouped[st.key].count += 1;
      });

      if (pillsEl) {
        pillsEl.classList.remove('hidden');
        pillsEl.classList.add('flex');
        pillsEl.innerHTML = Object.values(grouped).map(({ count, style }) => `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${style.bg} ${style.text}">
            ${style.iconSm}
            <span class="tabular-nums">${count}</span>
            <span class="opacity-80">${escapeHtml(style.summaryLabel)}</span>
          </span>
        `).join('');
      }

      body.innerHTML = `
        <div class="flex flex-col flex-1 min-h-0 divide-y divide-neutral-800/60 overflow-y-auto scrollbar-thin">
          ${list.slice(0, 15).map(item => {
            const st = getActionStyle(item.action);
            const relTime = formatRelativeTime(item.timestamp);
            const reasonText = item.reason || 'No reason provided';
            const titleText = `${st.label} · ${reasonText} · by ${item.mod_name || 'Moderator'}`;
            return `
              <div class="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-800/30 transition-colors group" title="${escapeHtml(titleText)}">
                <div class="w-6 h-6 rounded-md ${st.bg} flex items-center justify-center flex-shrink-0">
                  ${st.iconMd}
                </div>
                <div class="flex items-center gap-1.5 flex-1 min-w-0">
                  <span class="text-[13px] font-medium text-white truncate flex-shrink-0 max-w-[96px] sm:max-w-[140px]">${escapeHtml(item.target_name || 'Unknown User')}</span>
                  <span class="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${st.bg} ${st.text} flex-shrink-0">${escapeHtml(st.label)}</span>
                  <span class="text-[11px] text-neutral-500 truncate">${escapeHtml(reasonText)}</span>
                </div>
                <span class="text-[10px] text-neutral-500 tabular-nums flex-shrink-0">${escapeHtml(relTime)}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Initial render of all dynamic sections
    renderFeaturesList(featuresList);
    renderLiveChart();
    renderTopChannels();
    renderActivityChart();
    renderModActivity(modLogs);
    updateSyncLabel(false);

    // ─── Event Listeners for Filter Toggles & In-Place Refresh ──────────────────

    function updateToggleButtonStyles(containerId, attrName, activeValue) {
      const group = document.getElementById(containerId);
      if (!group) return;
      group.querySelectorAll(`button[${attrName}]`).forEach(btn => {
        const isSelected = btn.getAttribute(attrName) === String(activeValue);
        const pill = btn.querySelector('[data-pill]');
        if (isSelected) {
          btn.classList.remove('text-neutral-400', 'hover:text-white');
          btn.classList.add('text-black');
          if (pill) {
            pill.classList.remove('hidden');
            pill.style.opacity = '1';
          }
        } else {
          btn.classList.remove('text-black');
          btn.classList.add('text-neutral-400', 'hover:text-white');
          if (pill) {
            pill.classList.add('hidden');
            pill.style.opacity = '0';
          }
        }
      });
    }

    // 1. Live Chart 48h / 60m Toggle
    const liveBtns = document.getElementById('live-mode-buttons');
    if (liveBtns) {
      liveBtns.querySelectorAll('button[data-live-mode]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const mode = btn.getAttribute('data-live-mode');
          if (!mode || mode === state.liveMode) return;
          state.liveMode = mode;
          updateToggleButtonStyles('live-mode-buttons', 'data-live-mode', mode);
          renderLiveChart();
          try {
            const freshLive = await API.getGuildStatsLive(guildId);
            if (freshLive) {
              if (freshLive.live_60m) state.live60m = freshLive.live_60m;
              if (freshLive.total_60m !== undefined) state.total60m = freshLive.total_60m;
              if (freshLive.live_48h) state.live48h = freshLive.live_48h;
              if (freshLive.total_48h !== undefined) state.total48h = freshLive.total_48h;
              renderLiveChart();
            }
          } catch (_) {}
        });
      });
    }

    // 2. Top Message Channels 1D / 1W / 1M / 1Y / All Toggle
    const chRangeBtns = document.getElementById('top-channels-range-buttons');
    if (chRangeBtns) {
      chRangeBtns.querySelectorAll('button[data-ch-range]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rng = btn.getAttribute('data-ch-range');
          if (!rng || rng === state.channelRange) return;
          state.channelRange = rng;
          updateToggleButtonStyles('top-channels-range-buttons', 'data-ch-range', rng);
          try {
            const updated = await API.getGuildStats(guildId, state.activityRange, state.channelRange);
            if (updated && Array.isArray(updated.top_channels)) {
              state.topChannels = updated.top_channels;
              renderTopChannels();
            }
          } catch (e) {
            console.warn('[OverviewTab] Failed to update channel range:', e);
          }
        });
      });
    }

    // 3. Activity Chart 1D / 1W / 1M / 1Y / All Toggle
    const actRangeBtns = document.getElementById('activity-range-buttons');
    if (actRangeBtns) {
      actRangeBtns.querySelectorAll('button[data-act-range]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rng = btn.getAttribute('data-act-range');
          if (!rng || rng === state.activityRange) return;
          state.activityRange = rng;
          updateToggleButtonStyles('activity-range-buttons', 'data-act-range', rng);
          try {
            const updated = await API.getGuildStats(guildId, state.activityRange, state.channelRange);
            if (updated) {
              state.history = updated.history || [];
              state.periodMessages = updated.period_messages ?? 0;
              state.prevPeriodMessages = updated.prev_period_messages ?? 0;
              state.changes = updated.changes || state.changes;
              renderActivityChart();
            }
          } catch (e) {
            console.warn('[OverviewTab] Failed to update activity range:', e);
          }
        });
      });
    }

    // 4. In-Place Data Refresh Function (no page reload, spins icon, updates Synced time)
    async function refreshOverviewData(isManual = false) {
      if (state.isRefreshing) return;
      state.isRefreshing = true;

      const refreshIcon = document.getElementById('overview-refresh-icon');
      if (isManual && refreshIcon) {
        refreshIcon.classList.add('animate-spin');
      }

      const minSpinPromise = isManual
        ? new Promise(resolve => setTimeout(resolve, 550))
        : Promise.resolve();

      try {
        const [freshConfig, freshStats, freshLive, freshMod] = await Promise.all([
          API.getConfig(guildId).catch(() => null),
          API.getGuildStats(guildId, state.activityRange, state.channelRange).catch(() => null),
          API.getGuildStatsLive(guildId).catch(() => null),
          API.getModActivity(guildId).catch(() => null),
          minSpinPromise
        ]);

        if (freshLive) {
          if (freshLive.live_60m) state.live60m = freshLive.live_60m;
          if (freshLive.total_60m !== undefined) state.total60m = freshLive.total_60m;
          if (freshLive.live_48h) state.live48h = freshLive.live_48h;
          if (freshLive.total_48h !== undefined) state.total48h = freshLive.total_48h;
        }

        if (freshStats) {
          state.history = freshStats.history || state.history;
          state.periodMessages = freshStats.period_messages ?? state.periodMessages;
          state.prevPeriodMessages = freshStats.prev_period_messages ?? state.prevPeriodMessages;
          state.topChannels = freshStats.top_channels || state.topChannels;
          state.changes = freshStats.changes || state.changes;
          if (freshStats.live_48h && !freshLive?.live_48h) state.live48h = freshStats.live_48h;
          if (freshStats.total_48h !== undefined && freshLive?.total_48h === undefined) state.total48h = freshStats.total_48h;

          const newMembers = freshStats.total_members ?? freshStats.member_count ?? memberCount;
          const newMsgs = freshStats.week_messages ?? freshStats.message_count ?? messageCount;
          const newActive = freshStats.week_active_users ?? freshStats.active_users ?? activeUsers;
          const newVoice = freshStats.voice_hours ?? voiceHours;
          const newTickets = freshStats.open_tickets ?? openTickets;

          const memEl = document.getElementById('stat-card-members');
          const msgEl = document.getElementById('stat-card-messages');
          const actEl = document.getElementById('stat-card-active-users');
          const vcEl = document.getElementById('stat-card-voice-hours');
          const tkEl = document.getElementById('stat-card-tickets');
          const subEl = document.getElementById('overview-server-subtitle');

          if (memEl) memEl.textContent = formatNumber(newMembers);
          if (msgEl) msgEl.textContent = formatNumber(newMsgs);
          if (actEl) actEl.textContent = formatNumber(newActive);
          if (vcEl) vcEl.textContent = newVoice;
          if (tkEl) tkEl.textContent = formatNumber(newTickets);
          if (subEl) subEl.innerHTML = `Online &amp; Active · ${formatNumber(newMembers)} members`;

          const pctMem = document.getElementById('stat-pct-members');
          const pctMsg = document.getElementById('stat-pct-messages');
          const pctAct = document.getElementById('stat-pct-active-users');
          const pctVc = document.getElementById('stat-pct-voice');
          const tkStatus = document.getElementById('stat-tickets-status');

          if (pctMem) pctMem.innerHTML = renderPctBadge(state.changes.members_pct);
          if (pctMsg) pctMsg.innerHTML = renderPctBadge(state.changes.messages_pct);
          if (pctAct) pctAct.innerHTML = renderPctBadge(state.changes.active_users_pct);
          if (pctVc) pctVc.innerHTML = renderPctBadge(state.changes.voice_pct);
          if (tkStatus) {
            tkStatus.innerHTML = newTickets > 0
              ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">${newTickets} awaiting reply</span>`
              : `<span class="text-[10px] text-neutral-500">all clear</span>`;
          }

          if (freshConfig) {
            renderFeaturesList(evaluateFeaturesList(freshConfig, newTickets));
          }
        }

        renderLiveChart();
        renderTopChannels();
        renderActivityChart();
        if (Array.isArray(freshMod)) renderModActivity(freshMod);

        state.syncedAt = Date.now();
        updateSyncLabel(isManual);
      } catch (e) {
        console.warn('[OverviewTab] Error refreshing data:', e);
      } finally {
        if (refreshIcon) {
          refreshIcon.classList.remove('animate-spin');
        }
        state.isRefreshing = false;
      }
    }

    const refreshBtn = document.getElementById('overview-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        refreshOverviewData(true);
      });
    }

    DashboardTabs._overviewPollTimer = setInterval(() => {
      if (!document.getElementById('overview-content')) {
        clearInterval(DashboardTabs._overviewPollTimer);
        DashboardTabs._overviewPollTimer = null;
        return;
      }
      refreshOverviewData(false);
    }, 30000);

    loading.classList.add('hidden');
    content.classList.remove('hidden');

  } catch (err) {
    console.error('[OverviewTab] Error loading overview:', err);
    const loading = document.getElementById('overview-loading');
    if (loading) {
      loading.innerHTML = `
        <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
          Failed to load server data.
        </div>
      `;
    }
  }
};
