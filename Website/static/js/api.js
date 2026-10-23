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
    try { localStorage.removeItem('orbit_user'); } catch (_) {}
    window.location.href = '/';
  },

  // Guilds
  async getGuilds(force = false) {
    return await this.request(`/api/guilds${force ? '?force=true' : ''}`);
  },

  async getConfig(guildId) {
    return await this.request(`/api/config/${guildId}`);
  },

  async saveConfig(guildId, payload) {
    return await this.request(`/api/config/${guildId}`, {
      method: 'POST',
      body: payload
    });
  },

  async getChannels(guildId) {
    const res = await this.request(`/api/channels/${guildId}`);
    return Array.isArray(res) ? res : (res?.channels || []);
  },

  async getRoles(guildId) {
    const res = await this.request(`/api/roles/${guildId}`);
    return Array.isArray(res) ? res : (res?.roles || []);
  },

  async getBotProfile(guildId) {
    return await this.request(`/api/botprofile/${guildId}`);
  },

  async saveBotProfile(guildId, payload) {
    return await this.request(`/api/botprofile/${guildId}`, {
      method: 'POST',
      body: payload
    });
  },

  async getModActivity(guildId) {
    return await this.request(`/api/mod_activity/${guildId}`);
  },

  async getGuildStats(guildId, days = 7, channelsDays = null) {
    const chQuery = channelsDays !== null ? `&channels_days=${encodeURIComponent(channelsDays)}` : '';
    return await this.request(`/api/guild_stats/${guildId}?days=${encodeURIComponent(days)}${chQuery}`);
  },

  async getGuildStatsLive(guildId) {
    return await this.request(`/api/guild_stats_live/${guildId}`);
  },

  // Actions
  async sendTicketPanel(guildId, channelId) {
    return await this.request(`/api/action/${guildId}/send_ticket_panel`, {
      method: 'POST',
      body: { channel_id: channelId }
    });
  },

  async sendVerifyPanel(guildId, channelId) {
    return await this.request(`/api/action/${guildId}/send_verify_panel`, {
      method: 'POST',
      body: { channel_id: channelId }
    });
  },

  async sendReactionRole(guildId, payload) {
    return await this.request(`/api/action/${guildId}/send_reactionrole`, {
      method: 'POST',
      body: payload
    });
  },

  async getReactionRoles(guildId) {
    return await this.request(`/api/reactionroles/${guildId}`);
  },

  async saveReactionRole(guildId, payload) {
    return await this.request(`/api/reactionroles/${guildId}`, {
      method: 'POST',
      body: payload
    });
  },

  async deleteReactionRole(guildId, msgId) {
    return await this.request(`/api/reactionroles/${guildId}/${msgId}`, {
      method: 'DELETE'
    });
  },

  async sendCustomEmbed(guildId, payload) {
    return await this.request(`/api/action/send_custom_embed/${guildId}`, {
      method: 'POST',
      body: payload
    });
  },

  async getSavedEmbeds(guildId) {
    return await this.request(`/api/action/saved_embeds/${guildId}`);
  },

  async saveCustomEmbed(guildId, payload) {
    return await this.request(`/api/action/saved_embeds/${guildId}`, {
      method: 'POST',
      body: payload
    });
  },

  async deleteSavedEmbed(guildId, embedId) {
    return await this.request(`/api/action/saved_embeds/${guildId}/${embedId}`, {
      method: 'DELETE'
    });
  },

  async setupServerStats(guildId) {
    return await this.request(`/api/action/${guildId}/setup_serverstats`, {
      method: 'POST'
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

  async getAppeals(guildId) {
    return await this.request(`/api/server/${guildId}/appeals`);
  },

  async resolveAppeal(guildId, payload) {
    return await this.request(`/api/server/${guildId}/appeals/resolve`, {
      method: 'POST',
      body: payload
    });
  },

  async getCaptcha(token) {
    return await this.request(`/api/captcha/${token}`);
  },

  async verifyCaptcha(token, solution) {
    return await this.request(`/api/verify/${token}`, {
      method: 'POST',
      body: { solution }
    });
  }
};

window.API = API;
