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
        if ((res.status === 502 || res.status === 503 || res.status === 504) && !options._retried) {
          await new Promise(r => setTimeout(r, 1200));
          return await this.request(endpoint, { ...options, _retried: true });
        }
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

  // Keys that survive a page reload (sessionStorage) so F5 is instant too
  _persistPrefixes: ['config_', 'botprofile_', 'polls_', 'giveaways_', 'guild_stats_', 'guild_analytics_'],

  _isPersistable(key) {
    return this._persistPrefixes.some(p => String(key).startsWith(p));
  },

  _hydrate(key) {
    if (!this._isPersistable(key)) return null;
    try {
      const raw = sessionStorage.getItem('orbit_c_' + key);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (!item || typeof item.time !== 'number') return null;
      // Discard anything older than 6h
      if (Date.now() - item.time > 6 * 3600 * 1000) return null;
      this._cache.set(key, item);
      return item;
    } catch (_) { return null; }
  },

  _getEntry(key) {
    return this._cache.get(key) || this._hydrate(key);
  },

  getCache(key, maxAge = 600000) {
    const item = this._getEntry(key);
    if (!item) return null;
    if (Date.now() - item.time > maxAge) {
      // Keep stale entry for stale-while-revalidate, but report as miss
      return null;
    }
    return item.data;
  },

  getStale(key) {
    const item = this._getEntry(key);
    return item ? item.data : null;
  },

  setCache(key, data) {
    const item = { data, time: Date.now() };
    this._cache.set(key, item);
    if (this._isPersistable(key)) {
      try { sessionStorage.setItem('orbit_c_' + key, JSON.stringify(item)); } catch (_) {}
    }
  },

  hasCache(key, maxAge = 600000) {
    return this.getCache(key, maxAge) !== null;
  },

  invalidateCache(pattern) {
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const sk = sessionStorage.key(i);
        if (sk && sk.startsWith('orbit_c_') && (!pattern || sk.slice(8).includes(pattern))) {
          sessionStorage.removeItem(sk);
        }
      }
    } catch (_) {}
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
      // Stale-while-revalidate: show old data instantly, refresh silently in background
      const stale = this.getStale(key);
      if (stale !== null && stale !== undefined) {
        if (!this._pending.has(key)) {
          const bg = (async () => {
            try {
              const data = await fetchFn();
              this.setCache(key, data);
              return data;
            } catch (_) {
              return stale;
            } finally {
              this._pending.delete(key);
            }
          })();
          this._pending.set(key, bg);
        }
        return stale;
      }
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

  // Preloading & Preheating Engine (Lightweight & On-Demand)
  _prefetchedGuilds: new Set(),

  prefetchGuild(guildId) {
    if (!guildId || this._prefetchedGuilds.has(String(guildId))) return;
    this._prefetchedGuilds.add(String(guildId));

    // Preload core config (which already contains channels, roles and all module configs)
    this.getConfig(guildId).catch(() => null);

    // Pre-warm secondary endpoints in idle background so tab switching is 100% instant
    if (typeof this.getGiveaways === 'function') this.getGiveaways(guildId).catch(() => {});
    if (typeof this.getPolls === 'function') this.getPolls(guildId).catch(() => {});
    if (typeof this.getBotProfile === 'function') this.getBotProfile(guildId).catch(() => {});
  },

  async prefetchAll(user) {
    try {
      const path = window.location.pathname;
      const match = path.match(/\/dashboard\/([0-9]+)/);
      if (match && match[1]) {
        // Only preload the currently active guild if on a server dashboard
        this.prefetchGuild(match[1]);
      }
    } catch (e) {
      console.warn('[API] prefetchAll error:', e);
    }
  },

  // Auth & User
  async getUser(force = false) {
    if (!force) {
      try {
        const cached = localStorage.getItem('orbit_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) return parsed;
        }
      } catch (_) {}
    }
    try {
      const u = await this.request('/api/user');
      if (u && u.id) {
        localStorage.setItem('orbit_user', JSON.stringify(u));
        return u;
      }
    } catch (err) {}

    return null;
  },

  async resolveUser(userId) {
    if (!userId) return null;
    try {
      return await this.request('/api/user/' + encodeURIComponent(userId));
    } catch (err) {
      return null;
    }
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
  getGuildsFast() {
    const mem = this.getCache('guilds');
    if (Array.isArray(mem) && mem.length) return mem;
    try {
      const local = localStorage.getItem('orbit_guilds_cache');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length) {
          this.setCache('guilds', parsed);
          return parsed;
        }
      }
    } catch (_) {}
    return [];
  },

  async getGuilds(force = false) {
    if (force) {
      this.invalidateCache('guilds');
    }
    return await this.cachedRequest('guilds', async () => {
      const res = await this.request(`/api/guilds${force ? '?force=true' : ''}`);
      const list = Array.isArray(res) ? res : (res?.guilds || []);
      try { localStorage.setItem('orbit_guilds_cache', JSON.stringify(list)); } catch (_) {}
      return list;
    }, force, 300000);
  },

  async getGuild(guildId) {
    if (!guildId) return null;
    if (window.__currentDashboardGuildObj && String(window.__currentDashboardGuildObj.id) === String(guildId)) {
      return window.__currentDashboardGuildObj;
    }
    const cachedConfig = this.getCache(`config_${guildId}`);
    if (cachedConfig?.guild) {
      window.__currentDashboardGuildObj = cachedConfig.guild;
      return cachedConfig.guild;
    }
    const fastGuilds = this.getGuildsFast();
    const found = fastGuilds.find(g => String(g.id) === String(guildId));
    if (found) {
      window.__currentDashboardGuildObj = found;
      return found;
    }
    return { id: guildId, name: 'Server' };
  },

  async getConfig(guildId, force = false) {
    const res = await this.cachedRequest(`config_${guildId}`, () => this.request(`/api/config/${guildId}${force ? '?force=true' : ''}`), force, 60000);
    try {
      if (res && typeof res === 'object') {
        if (Array.isArray(res.channels)) {
          this.setCache(`channels_${guildId}`, res.channels);
          if (window.DiscordMarkdown) window.DiscordMarkdown.setChannels(res.channels);
        }
        if (Array.isArray(res.roles)) {
          this.setCache(`roles_${guildId}`, res.roles);
          if (window.DiscordMarkdown) window.DiscordMarkdown.setRoles(res.roles);
        }
        if (Array.isArray(res.categories)) {
          this.setCache(`categories_${guildId}`, res.categories);
        }
        if (Array.isArray(res.emojis) && window.DiscordMarkdown) {
          window.DiscordMarkdown.setEmojis(res.emojis);
        }
        if (Array.isArray(res.members)) {
          window.__orbitMembers = res.members;
        }
        if (res.guild && typeof res.guild === 'object') {
          window.__currentDashboardGuildObj = res.guild;
        }
        if (!res.config && !res.channels) {
          this.invalidateCache(`config_${guildId}`);
        }
      } else {
        this.invalidateCache(`config_${guildId}`);
      }
    } catch (_) {}
    return res;
  },

    async withSaveToast(fn, savingMsg = 'Saving...', savedMsg = 'Saved', errorMsg = 'Error saving changes') {
    if (window.Toast && typeof Toast.saving === 'function') {
      Toast.saving(savingMsg);
    }
    try {
      const res = await fn();
      if (window.Toast && typeof Toast.saved === 'function') {
        Toast.saved(savedMsg);
      }
      return res;
    } catch (err) {
      if (window.Toast && typeof Toast.errorSaving === 'function') {
        Toast.errorSaving(err?.message || errorMsg);
      }
      throw err;
    }
  },

  async saveConfig(guildId, payload, silent = false) {
    const doSave = async () => {
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
    };

    if (silent) return await doSave();
    return await this.withSaveToast(doSave);
  },

  async getSecurityConfig(guildId, force = false) {
    const res = await this.cachedRequest(`security_${guildId}`, async () => {
      try {
        const data = await this.request(`/api/server/${guildId}/security`);
        return data?.security || null;
      } catch (e) {
        const full = await this.getConfig(guildId, force);
        return full?.config?.security || full?.security || null;
      }
    }, force);
    return res;
  },

  async saveSecurityConfig(guildId, payload, silent = false) {
    const doSave = async () => {
      this.invalidateCache(`security_${guildId}`);
      this.invalidateCache(`config_${guildId}`);
      const res = await this.request(`/api/server/${guildId}/security`, {
        method: 'POST',
        body: { security: payload }
      });
      const cached = this.getCache(`config_${guildId}`);
      if (cached && typeof cached === 'object') {
        const target = cached.config || cached;
        target.security = res?.security || payload;
      }
      setTimeout(() => {
        this.getSecurityConfig(guildId, true).catch(() => {});
        this.getConfig(guildId, true).catch(() => {});
      }, 200);
      return res;
    };

    if (silent) return await doSave();
    return await this.withSaveToast(doSave);
  },

  async getChannels(guildId, force = false) {
    if (!force) {
      const cached = this.getCache(`channels_${guildId}`);
      if (Array.isArray(cached) && cached.length) return cached;
      const cachedConfig = this.getCache(`config_${guildId}`);
      if (Array.isArray(cachedConfig?.channels) && cachedConfig.channels.length) {
        this.setCache(`channels_${guildId}`, cachedConfig.channels);
        return cachedConfig.channels;
      }
    }
    const list = await this.cachedRequest(`channels_${guildId}`, async () => {
      const res = await this.request(`/api/channels/${guildId}`);
      return Array.isArray(res) ? res : (res?.channels || []);
    }, force);
    try { if (Array.isArray(list) && list.length && window.DiscordMarkdown) window.DiscordMarkdown.setChannels(list); } catch (_) {}
    return list;
  },

  async getRoles(guildId, force = false) {
    if (!force) {
      const cached = this.getCache(`roles_${guildId}`);
      if (Array.isArray(cached) && cached.length) return cached;
      const cachedConfig = this.getCache(`config_${guildId}`);
      if (Array.isArray(cachedConfig?.roles) && cachedConfig.roles.length) {
        this.setCache(`roles_${guildId}`, cachedConfig.roles);
        return cachedConfig.roles;
      }
    }
    return await this.cachedRequest(`roles_${guildId}`, async () => {
      const res = await this.request(`/api/roles/${guildId}`);
      return Array.isArray(res) ? res : (res?.roles || []);
    }, force);
  },

  async getBotProfile(guildId, force = false) {
    return await this.cachedRequest(`botprofile_${guildId}`, () => this.request(`/api/botprofile/${guildId}`), force);
  },

  async saveBotProfile(guildId, payload, silent = false) {
    const doSave = async () => {
      const res = await this.request(`/api/botprofile/${guildId}`, {
        method: 'POST',
        body: payload
      });
      this.invalidateCache(`botprofile_${guildId}`);
      return res;
    };
    if (silent) return await doSave();
    return await this.withSaveToast(doSave);
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

  async getUserWarns(guildId, userId) {
    return await this.request(`/api/warns/${guildId}/${userId}`);
  },

  async deleteWarning(guildId, userId, warnId) {
    return await this.request(`/api/action/${guildId}/delete_warning`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, warn_id: warnId })
    });
  },

  async clearUserWarnings(guildId, userId) {
    return await this.request(`/api/action/${guildId}/clear_warnings`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
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

  async ticketAction(guildId, ticketId, action) {
    const res = await this.request(`/api/action/${guildId}/ticket_action`, {
      method: 'POST',
      body: { id: ticketId, action }
    });
    this.invalidateCache(`config_${guildId}`);
    return res;
  },

  async clearClosedTickets(guildId, ticketId = null) {
    const res = await this.request(`/api/action/${guildId}/clear_closed_tickets`, {
      method: 'POST',
      body: ticketId ? { id: ticketId } : { all: true }
    });
    this.invalidateCache(`config_${guildId}`);
    return res;
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
    return await this.cachedRequest(`appeals_${guildId}`, () => this.request(`/api/server/${guildId}/appeals`), force, 30000);
  },

  async getAppealsHistory(guildId, force = false) {
    return await this.cachedRequest(`appeals_history_${guildId}`, () => this.request(`/api/server/${guildId}/appeals/history`), force, 30000);
  },

  async getAppealsConfig(guildId, force = false) {
    return await this.cachedRequest(`appeals_cfg_${guildId}`, () => this.request(`/api/server/${guildId}/appeals/config`), force, 30000);
  },

  async saveAppealsConfig(guildId, payload, silent = false) {
    const doSave = async () => {
      const res = await this.request(`/api/server/${guildId}/appeals/config`, {
        method: 'POST',
        body: payload
      });
      this.invalidateCache(`appeals_cfg_${guildId}`);
      return res;
    };
    if (silent) return await doSave();
    return await this.withSaveToast(doSave);
  },

  async resolveAppeal(guildId, payload) {
    const res = await this.request(`/api/server/${guildId}/appeals/resolve`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`appeals_${guildId}`);
    this.invalidateCache(`appeals_history_${guildId}`);
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
    this.invalidateCache(`giveaways_${guildId}`);
    this.invalidateCache(`polls_${guildId}`);
    this.invalidateCache(`reactionroles_${guildId}`);
    return res;
  },

  async undoAIHelperAction(guildId) {
    const res = await this.request(`/api/ai_helper/${guildId}/undo`, {
      method: 'POST'
    });
    this.invalidateCache(`config_${guildId}`);
    this.invalidateCache(`giveaways_${guildId}`);
    this.invalidateCache(`polls_${guildId}`);
    this.invalidateCache(`reactionroles_${guildId}`);
    return res;
  },

  async redoAIHelperAction(guildId) {
    const res = await this.request(`/api/ai_helper/${guildId}/redo`, {
      method: 'POST'
    });
    this.invalidateCache(`config_${guildId}`);
    this.invalidateCache(`giveaways_${guildId}`);
    this.invalidateCache(`polls_${guildId}`);
    this.invalidateCache(`reactionroles_${guildId}`);
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
  },

  // Giveaways (Werbegeschenke)
  async getGiveaways(guildId, force = false) {
    return await this.cachedRequest(`giveaways_${guildId}`, () => this.request(`/api/giveaways/${guildId}`), force, 60000);
  },

  async saveGiveaway(guildId, payload) {
    const res = await this.request(`/api/giveaways/${guildId}`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`giveaways_${guildId}`);
    return res;
  },

  async endGiveaway(guildId, gwId) {
    const res = await this.request(`/api/giveaways/${guildId}/${encodeURIComponent(gwId)}/end`, {
      method: 'POST'
    });
    this.invalidateCache(`giveaways_${guildId}`);
    return res;
  },

  async rerollGiveaway(guildId, gwId, payload = {}) {
    const res = await this.request(`/api/giveaways/${guildId}/${encodeURIComponent(gwId)}/reroll`, {
      method: 'POST',
      body: payload
    });
    this.invalidateCache(`giveaways_${guildId}`);
    return res;
  },

  async deleteGiveaway(guildId, gwId) {
    const res = await this.request(`/api/giveaways/${guildId}/${encodeURIComponent(gwId)}`, {
      method: 'DELETE'
    });
    this.invalidateCache(`giveaways_${guildId}`);
    return res;
  },

  async getBackups(guildId) {
    return await this.request(`/api/server/${guildId}/backups`);
  },

  async createBackup(guildId, name = null) {
    return await this.request(`/api/server/${guildId}/backups/create`, {
      method: 'POST',
      body: { name }
    });
  },

  async restoreBackup(guildId, backupId) {
    return await this.request(`/api/server/${guildId}/backups/${encodeURIComponent(backupId)}/restore`, {
      method: 'POST'
    });
  },

  async deleteBackup(guildId, backupId) {
    return await this.request(`/api/server/${guildId}/backups/${encodeURIComponent(backupId)}`, {
      method: 'DELETE'
    });
  },

  async saveBackupConfig(guildId, config, silent = false) {
    const doSave = async () => {
      return await this.request(`/api/server/${guildId}/backups/config`, {
        method: 'POST',
        body: config
      });
    };
    if (silent) return await doSave();
    return await this.withSaveToast(doSave);
  }
};

window.API = API;
