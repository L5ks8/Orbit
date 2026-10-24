/**
 * Orbit API Client
 * Centralized communication with the Orbit Python backend using pure JSON requests.
 */
const API = {
  getToken() {
    return localStorage.getItem('token') || '';
  },

  setToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  },

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const opts = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    };

    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.body = JSON.stringify(opts.body);
    }

    try {
      const res = await fetch(url, opts);
      const contentType = res.headers.get('content-type') || '';
      
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const errorMsg = (typeof data === 'object' && data?.error) ? data.error : (typeof data === 'string' && data ? data : `HTTP ${res.status}`);
        const err = new Error(errorMsg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (err) {
      console.warn(`[API] Error on ${url}:`, err.message);
      throw err;
    }
  },

  // In-Memory Client Cache & Request Deduplication
  _cache: new Map(),
  _pending: new Map(),

  getCache(key, maxAge = 600000) {
    const item = this._cache.get(key);
    if (!item) return null;
    if (Date.now() - item.time > maxAge) {
      this._cache.delete(key);
      return null;
    }
    return item.data;
  },

  setCache(key, data) {
    this._cache.set(key, { data, time: Date.now() });
  },

  hasCache(key, maxAge = 600000) {
    return this.getCache(key, maxAge) !== null;
  },

  invalidateCache(pattern) {
    if (!pattern) {
      this._cache.clear();
      return;
    }
    for (const k of Array.from(this._cache.keys())) {
      if (k.includes(pattern)) {
        this._cache.delete(k);
      }
    }
  },

  async cachedRequest(key, fetchFn, force = false, maxAge = 600000) {
    if (!force) {
      const cached = this.getCache(key, maxAge);
      if (cached !== null) return cached;
    }
    if (this._pending.has(key)) {
      return this._pending.get(key);
    }
    const p = (async () => {
      try {
        const data = await fetchFn();
        this.setCache(key, data);
        return data;
      } finally {
        this._pending.delete(key);
      }
    })();
    this._pending.set(key, p);
    return p;
  },

  // Preloading & Preheating Engine
  _prefetchedGuilds: new Set(),

  prefetchGuild(guildId) {
    if (!guildId || this._prefetchedGuilds.has(String(guildId))) return;
    this._prefetchedGuilds.add(String(guildId));

    // High priority: core data used across tabs (Config, Channels, Roles, Bot Profile)
    const corePromises = [
      this.getConfig(guildId).catch(() => null),
      this.getChannels(guildId).catch(() => []),
      this.getRoles(guildId).catch(() => []),
      this.getBotProfile(guildId).catch(() => null)
    ];

    // Secondary priority: background prefetch other tabs
    Promise.allSettled(corePromises).then(() => {
      setTimeout(() => {
        this.getGuildStats(guildId, 7).catch(() => null);
        this.getGuildStatsLive(guildId).catch(() => null);
      }, 50);

      setTimeout(() => {
        this.getGuildAnalytics(guildId, 7).catch(() => null);
        this.getReactionRoles(guildId).catch(() => []);
      }, 150);

      setTimeout(() => {
        this.getPolls(guildId).catch(() => []);
        this.getSavedEmbeds(guildId).catch(() => []);
        this.getAIHelperChats(guildId).catch(() => null);
      }, 250);
    });
  },

  async prefetchAll(user) {
    try {
      const gData = await this.getGuilds();
      const guilds = Array.isArray(gData) ? gData : (gData?.guilds || []);
      if (!guilds || guilds.length === 0) return;

      const path = window.location.pathname;
      const match = path.match(/\/dashboard\/([0-9]+)/);
      const activeGuildId = match ? match[1] : null;

      const ordered = [...guilds];
      if (activeGuildId) {
        const idx = ordered.findIndex(g => String(g.id) === String(activeGuildId));
        if (idx > 0) {
          const [activeG] = ordered.splice(idx, 1);
          ordered.unshift(activeG);
        }
      }

      // Preload current/first guild immediately
      if (ordered.length > 0 && ordered[0].id) {
        this.prefetchGuild(ordered[0].id);
      }

      // Preload next guilds with a staggered interval
      if (ordered.length > 1) {
        const remaining = ordered.slice(1, 6);
        remaining.forEach((g, i) => {
          if (g && g.id) {
            setTimeout(() => this.prefetchGuild(g.id), (i + 1) * 300);
          }
        });
      }
    } catch (e) {
      console.warn('[API] prefetchAll error:', e);
    }
  },

  // Auth & User
  async getUser() {
    try {
      const u = await this.request('/api/user');
      if (u && u.id) {
        localStorage.setItem('orbit_user', JSON.stringify(u));
        return u;
      }
    } catch (err) {}

    try {
      const cached = localStorage.getItem('orbit_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) return parsed;
      }
    } catch (_) {}

    return null;
  },

  login(nextUrl = '/dashboard') {
    const popup = 1;
    const loginUrl = `/auth/login?next=${encodeURIComponent(nextUrl)}&popup=${popup}`;
    const w = 500, h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const win = window.open(loginUrl, 'orbitlogin', `width=${w},height=${h},left=${left},top=${top},popup=yes`);
    return new Promise((resolve) => {
      if (!win) {
        window.location.href = `/auth/login?next=${encodeURIComponent(nextUrl)}`;
        return;
      }
      const timer = setInterval(async () => {
        if (win.closed) {
          clearInterval(timer);
          try {
            if (window.Router) {
              await window.Router.checkAuth();
              window.Router.navigate(nextUrl || '/dashboard');
            } else {
              window.location.href = nextUrl || '/dashboard';
            }
          } catch (_) {
            window.location.href = nextUrl || '/dashboard';
          }
          resolve();
        }
      }, 500);
    });
  },

  async logout() {
    try {
      await fetch('/auth/logout');
    } catch (_) {}
    this.setToken(null);
    this.invalidateCache();
    this._prefetchedGuilds.clear();
    try { localStorage.removeItem('orbit_user'); } catch (_) {}
    window.location.href = '/';
  },

  // Guilds
  async getGuilds(force = false) {
    return await this.cachedRequest('guilds', () => this.request(`/api/guilds${force ? '?force=true' : ''}`), force);
  },

  async getConfig(guildId, force = false) {
    return await this.cachedRequest(`config_${guildId}`, () => this.request(`/api/config/${guildId}`), force);
  },

  async saveConfig(guildId, payload) {
    // Optimistically update cached config
    const cached = this.getCache(`config_${guildId}`);
    if (cached && typeof cached === 'object' && typeof payload === 'object') {
      const target = cached.config || cached;
      for (const [k, v] of Object.entries(payload)) {
        if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') {
          target[k] = { ...target[k], ...v };
        } else {
          target[k] = v;
        }
      }
    }
    const res = await this.request(`/api/config/${guildId}`, {
      method: 'POST',
      body: payload
    });
    // Background refresh
    setTimeout(() => this.getConfig(guildId, true).catch(() => {}), 300);
    return res;
  },

  async getChannels(guildId, force = false) {
    return await this.cachedRequest(`channels_${guildId}`, async () => {
      const res = await this.request(`/api/channels/${guildId}`);
      return Array.isArray(res) ? res : (res?.channels || []);
    }, force);
  },

  async getRoles(guildId, force = false) {
    return await this.cachedRequest(`roles_${guildId}`, async () => {
      const res = await this.request(`/api/roles/${guildId}`);
      return Array.isArray(res) ? res : (res?.roles || []);
    }, force);
  },

  async getBotProfile(guildId, force = false) {
    return await this.cachedRequest(`botprofile_${guildId}`, () => this.request(`/api/botprofile/${guildId}`), force);
  },

  async saveBotProfile(guildId, payload) {
    const res = await this.request(`/api/botprofile/${guildId}`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`botprofile_${guildId}`);
    return res;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data;
  },

  async getModActivity(guildId, force = false) {
    return await this.cachedRequest(`modactivity_${guildId}`, () => this.request(`/api/mod_activity/${guildId}`), force, 120000);
  },

  async getGuildStats(guildId, days = 7, channelsDays = null, force = false) {
    const chQuery = channelsDays !== null ? `&channels_days=${encodeURIComponent(channelsDays)}` : '';
    const key = `guild_stats_${guildId}_${days}_${channelsDays}`;
    return await this.cachedRequest(key, () => this.request(`/api/guild_stats/${guildId}?days=${encodeURIComponent(days)}${chQuery}`), force, 180000);
  },

  async getGuildStatsLive(guildId, force = false) {
    return await this.cachedRequest(`guild_stats_live_${guildId}`, () => this.request(`/api/guild_stats_live/${guildId}`), force, 60000);
  },

  async getGuildAnalytics(guildId, days = 7, force = false) {
    const key = `guild_analytics_${guildId}_${days}`;
    return await this.cachedRequest(key, () => this.request(`/api/guild_analytics/${guildId}?days=${encodeURIComponent(days)}`), force, 180000);
  },

  // Actions
  async sendTicketPanel(guildId, channelIdOrPayload) {
    const body = (typeof channelIdOrPayload === 'object' && channelIdOrPayload !== null)
      ? channelIdOrPayload
      : { channel_id: channelIdOrPayload };
    return await this.request(`/api/action/${guildId}/send_ticket_panel`, {
      method: 'POST',
      body
    });
  },

  async sendVerifyPanel(guildId, channelIdOrPayload) {
    const body = (typeof channelIdOrPayload === 'object' && channelIdOrPayload !== null)
      ? channelIdOrPayload
      : { channel_id: channelIdOrPayload };
    return await this.request(`/api/action/${guildId}/send_verify_panel`, {
      method: 'POST',
      body
    });
  },

  async sendReactionRole(guildId, payload) {
    return await this.request(`/api/action/${guildId}/send_reactionrole`, {
      method: 'POST',
      body: payload
    });
  },

  async getReactionRoles(guildId, force = false) {
    return await this.cachedRequest(`reactionroles_${guildId}`, () => this.request(`/api/reactionroles/${guildId}`), force);
  },

  async saveReactionRole(guildId, payload) {
    const res = await this.request(`/api/reactionroles/${guildId}`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`reactionroles_${guildId}`);
    return res;
  },

  async deleteReactionRole(guildId, msgId) {
    const res = await this.request(`/api/reactionroles/${guildId}/${msgId}`, {
      method: 'DELETE'
    });
    this.invalidateCache(`reactionroles_${guildId}`);
    return res;
  },

  async sendCustomEmbed(guildId, payload) {
    return await this.request(`/api/action/send_custom_embed/${guildId}`, {
      method: 'POST',
      body: payload
    });
  },

  async getSavedEmbeds(guildId, force = false) {
    return await this.cachedRequest(`savedembeds_${guildId}`, () => this.request(`/api/action/saved_embeds/${guildId}`), force);
  },

  async saveCustomEmbed(guildId, payload) {
    const res = await this.request(`/api/action/saved_embeds/${guildId}`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`savedembeds_${guildId}`);
    return res;
  },

  async deleteSavedEmbed(guildId, embedId) {
    const res = await this.request(`/api/action/saved_embeds/${guildId}/${embedId}`, {
      method: 'DELETE'
    });
    this.invalidateCache(`savedembeds_${guildId}`);
    return res;
  },

  async setupServerStats(guildId) {
    return await this.request(`/api/action/${guildId}/setup_serverstats`, {
      method: 'POST'
    });
  },

  async testWelcome(guildId, payload) {
    return await this.request(`/api/server/${guildId}/test-welcome`, {
      method: 'POST',
      body: payload
    });
  },

  async testDm(guildId, payload) {
    return await this.request(`/api/server/${guildId}/test-dm`, {
      method: 'POST',
      body: payload
    });
  },

  // Public & Appeals
  async getStats() {
    return await this.request('/api/stats');
  },

  async getUptime() {
    return await this.request('/api/uptime');
  },

  async getLeaderboard(guildId) {
    return await this.request(`/api/public_leaderboard/${guildId}`);
  },

  async getAppealInfo(customUrl) {
    return await this.request(`/api/appeal_info/${encodeURIComponent(customUrl)}`);
  },

  async submitAppeal(customUrl, payload) {
    return await this.request(`/api/submit_appeal/${encodeURIComponent(customUrl)}`, {
      method: 'POST',
      body: payload
    });
  },

  async getAppeals(guildId, force = false) {
    return await this.cachedRequest(`appeals_${guildId}`, () => this.request(`/api/server/${guildId}/appeals`), force, 60000);
  },

  async resolveAppeal(guildId, payload) {
    const res = await this.request(`/api/server/${guildId}/appeals/resolve`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`appeals_${guildId}`);
    return res;
  },

  async getCaptcha(token) {
    return await this.request(`/api/captcha/${token}`);
  },

  async verifyCaptcha(token, solution) {
    return await this.request(`/api/verify/${token}`, {
      method: 'POST',
      body: { solution, code: solution }
    });
  },

  // AI Helper
  async getAIHelperChats(guildId, force = false) {
    return await this.cachedRequest(`aihelper_${guildId}`, () => this.request(`/api/ai_helper/${guildId}/chats`), force, 120000);
  },

  async sendAIHelperChat(guildId, payload) {
    const res = await this.request(`/api/ai_helper/${guildId}/chat`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`aihelper_${guildId}`);
    return res;
  },

  async applyAIHelperActions(guildId, actions) {
    const res = await this.request(`/api/ai_helper/${guildId}/apply`, {
      method: 'POST',
      body: { actions }
    });
    this.invalidateCache(`config_${guildId}`);
    return res;
  },

  async undoAIHelperAction(guildId) {
    const res = await this.request(`/api/ai_helper/${guildId}/undo`, {
      method: 'POST'
    });
    this.invalidateCache(`config_${guildId}`);
    return res;
  },

  async redoAIHelperAction(guildId) {
    const res = await this.request(`/api/ai_helper/${guildId}/redo`, {
      method: 'POST'
    });
    this.invalidateCache(`config_${guildId}`);
    return res;
  },

  async deleteAIHelperChat(guildId, chatId) {
    const res = await this.request(`/api/ai_helper/${guildId}/chats/${encodeURIComponent(chatId)}`, {
      method: 'DELETE'
    });
    this.invalidateCache(`aihelper_${guildId}`);
    return res;
  },

  async renameAIHelperChat(guildId, chatId, title) {
    const res = await this.request(`/api/ai_helper/${guildId}/chats/${encodeURIComponent(chatId)}/rename`, {
      method: 'POST',
      body: { title }
    });
    this.invalidateCache(`aihelper_${guildId}`);
    return res;
  },

  // Invite Tracker Actions
  async postInviteLeaderboard(guildId, payload) {
    return await this.request(`/api/action/${guildId}/post_invite_leaderboard`, {
      method: 'POST',
      body: payload
    });
  },

  async createInviteSource(guildId, payload) {
    const res = await this.request(`/api/action/${guildId}/invite_sources`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`config_${guildId}`);
    return res;
  },

  async deleteInviteSource(guildId, sourceId) {
    const res = await this.request(`/api/action/${guildId}/invite_sources/${encodeURIComponent(sourceId)}`, {
      method: 'DELETE'
    });
    this.invalidateCache(`config_${guildId}`);
    return res;
  },

  // Polls (Umfragen)
  async getPolls(guildId, force = false) {
    return await this.cachedRequest(`polls_${guildId}`, () => this.request(`/api/polls/${guildId}`), force, 120000);
  },

  async savePoll(guildId, payload) {
    const res = await this.request(`/api/polls/${guildId}`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`polls_${guildId}`);
    return res;
  },

  async endPoll(guildId, pollId) {
    const res = await this.request(`/api/polls/${guildId}/${encodeURIComponent(pollId)}/end`, {
      method: 'POST'
    });
    this.invalidateCache(`polls_${guildId}`);
    return res;
  },

  async deletePoll(guildId, pollId) {
    const res = await this.request(`/api/polls/${guildId}/${encodeURIComponent(pollId)}`, {
      method: 'DELETE'
    });
    this.invalidateCache(`polls_${guildId}`);
    return res;
  }
};

window.API = API;
