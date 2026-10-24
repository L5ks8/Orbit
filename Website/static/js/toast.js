/**
 * Orbit Unified Toast & Auto-Save Notification System
 * Centralized, pixel-perfect dark theme notifications with smooth in-place state transitions.
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const SVGS = {
    spinner: `<svg class="animate-spin w-4 h-4 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`,
    check: `<svg class="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg class="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    info: `<svg class="w-4 h-4 text-[#5865F2] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    close: `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
  };

  const Toast = {
    container: null,
    counter: 0,
    activeSaveId: null,
    activeSaveTimer: null,

    init() {
      if (!this.container || !document.body.contains(this.container)) {
        let el = document.getElementById('toast-container');
        if (!el) {
          el = document.createElement('div');
          el.id = 'toast-container';
          el.className = 'toast-container';
          document.body.appendChild(el);
        }
        this.container = el;
      }
    },

    getIconSvg(type) {
      if (type === 'saving' || type === 'loading') return SVGS.spinner;
      if (type === 'saved' || type === 'success') return SVGS.check;
      if (type === 'error') return SVGS.error;
      return SVGS.info;
    },

    show(message, type = 'info', duration = 3500) {
      this.init();
      const id = ++this.counter;
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.id = `toast-${id}`;

      const iconSvg = this.getIconSvg(type);

      toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button type="button" class="toast-close" aria-label="Close notification">${SVGS.close}</button>
      `;

      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          Toast.dismiss(id);
        };
      }

      toast.onclick = (e) => {
        if (!e.target.closest('.toast-close')) Toast.dismiss(id);
      };

      this.container.appendChild(toast);

      if (duration > 0) {
        toast._dismissTimer = setTimeout(() => this.dismiss(id), duration);
      }

      return id;
    },

    success(msg, duration = 3000) {
      return this.show(msg, 'success', duration);
    },

    error(msg, duration = 4500) {
      return this.show(msg, 'error', duration);
    },

    info(msg, duration = 3500) {
      return this.show(msg, 'info', duration);
    },

    loading(msg) {
      return this.show(msg, 'loading', 0);
    },

    /**
     * Grey saving state in bottom-right corner.
     * Transitions seamlessly if an active save notification already exists.
     */
    _removeExtraSaveToasts(keepId = null) {
      if (!this.container) return;
      const saveToasts = this.container.querySelectorAll('.toast-saving, .toast-saved');
      saveToasts.forEach(t => {
        if (!keepId || t.id !== `toast-${keepId}`) {
          if (t._dismissTimer) clearTimeout(t._dismissTimer);
          t.remove();
        }
      });
    },

    saving(msg = 'Saving...') {
      this.init();
      if (this.activeSaveTimer) {
        clearTimeout(this.activeSaveTimer);
        this.activeSaveTimer = null;
      }

      let existing = null;
      if (this.activeSaveId) {
        existing = document.getElementById(`toast-${this.activeSaveId}`);
      }
      if (!existing && this.container) {
        existing = this.container.querySelector('.toast-saving, .toast-saved');
      }

      if (existing) {
        if (existing._dismissTimer) clearTimeout(existing._dismissTimer);
        existing.classList.remove('toast-leaving', 'toast-saved', 'toast-error', 'toast-success', 'toast-info');
        existing.classList.add('toast-saving');
        const iconEl = existing.querySelector('.toast-icon');
        const msgEl = existing.querySelector('.toast-message');
        if (iconEl) iconEl.innerHTML = this.getIconSvg('saving');
        if (msgEl) msgEl.textContent = msg;
        this.activeSaveId = parseInt(existing.id.replace('toast-', ''), 10) || this.activeSaveId;
        this._removeExtraSaveToasts(this.activeSaveId);
        return this.activeSaveId;
      }

      this._removeExtraSaveToasts();
      const id = this.show(msg, 'saving', 0);
      this.activeSaveId = id;
      return id;
    },

    /**
     * Smoothly transforms the active saving toast into "Saved" (rich green background).
     */
    saved(msg = 'Saved', duration = 2200) {
      this.init();
      let existing = null;
      if (this.activeSaveId) {
        existing = document.getElementById(`toast-${this.activeSaveId}`);
      }
      if (!existing && this.container) {
        existing = this.container.querySelector('.toast-saving, .toast-saved');
      }

      if (existing) {
        const id = parseInt(existing.id.replace('toast-', ''), 10) || this.activeSaveId;
        this.activeSaveId = id;
        this.update(id, msg, 'saved', duration);
        this._removeExtraSaveToasts(id);
        return id;
      }

      this._removeExtraSaveToasts();
      const id = this.show(msg, 'saved', duration);
      this.activeSaveId = id;
      return id;
    },

    /**
     * Smoothly transforms the active saving toast into "Error saving" in red.
     */
    errorSaving(msg = 'Error saving changes', duration = 4500) {
      this.init();
      let existing = null;
      if (this.activeSaveId) {
        existing = document.getElementById(`toast-${this.activeSaveId}`);
      }
      if (!existing && this.container) {
        existing = this.container.querySelector('.toast-saving, .toast-saved');
      }

      if (existing) {
        const id = parseInt(existing.id.replace('toast-', ''), 10) || this.activeSaveId;
        this.activeSaveId = id;
        this.update(id, msg, 'error', duration);
        this._removeExtraSaveToasts(id);
        return id;
      }

      this._removeExtraSaveToasts();
      const id = this.show(msg, 'error', duration);
      this.activeSaveId = id;
      return id;
    },

    dismiss(id) {
      const el = document.getElementById(`toast-${id}`);
      if (!el) return;
      if (el._dismissTimer) clearTimeout(el._dismissTimer);
      if (this.activeSaveId === id) this.activeSaveId = null;

      el.classList.add('toast-leaving');
      setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    },

    update(id, msg, type = 'success', duration = 3000) {
      const el = document.getElementById(`toast-${id}`);
      if (!el) {
        return this.show(msg, type, duration);
      }

      if (el._dismissTimer) clearTimeout(el._dismissTimer);

      el.className = `toast toast-${type}`;
      const iconEl = el.querySelector('.toast-icon');
      const msgEl = el.querySelector('.toast-message');

      if (iconEl) iconEl.innerHTML = this.getIconSvg(type);
      if (msgEl) msgEl.textContent = msg;

      if (duration > 0) {
        el._dismissTimer = setTimeout(() => this.dismiss(id), duration);
      }
    }
  };

  /**
   * AutoSave Manager
   * Debounces quick consecutive edits and coordinates bottom-right saving indicator
   */
  const AutoSave = {
    timer: null,
    inFlight: false,
    pendingFn: null,
    customHandler: null,

    /**
     * Set a custom auto-save handler for the currently active tab
     */
    register(fn) {
      this.customHandler = fn;
    },

    unregister() {
      this.customHandler = null;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },

    /**
     * Triggers a save operation with automatic grey Saving... -> Saved / Error saving transition.
     * @param {Function} saveFn - Async save function returning a promise
     * @param {number} debounceMs - Delay in ms before executing (default 600ms)
     * @param {Object} options - Custom labels { savingMsg, savedMsg, errorMsg }
     */
    trigger(saveFn, debounceMs = 600, options = {}) {
      if (this.timer) clearTimeout(this.timer);

      // Immediately show or refresh grey "Saving..."
      Toast.saving(options.savingMsg || 'Saving...');

      this.pendingFn = saveFn;

      if (debounceMs <= 0) {
        return this._executePending(options);
      }

      this.timer = setTimeout(() => {
        this._executePending(options);
      }, debounceMs);
    },

    async _executePending(options = {}) {
      const fn = this.pendingFn;
      this.pendingFn = null;
      this.timer = null;

      if (typeof fn !== 'function') return;

      this.inFlight = true;
      try {
        const result = await fn();
        Toast.saved(options.savedMsg || 'Saved');
        return result;
      } catch (err) {
        console.error('[AutoSave Error]', err);
        const errMsg = err?.message || options.errorMsg || 'Error saving changes';
        Toast.errorSaving(errMsg);
        throw err;
      } finally {
        this.inFlight = false;
      }
    },

    /**
     * Executes immediately without debounce (e.g. for toggle switches and dropdowns)
     */
    immediate(saveFn, options = {}) {
      return this.trigger(saveFn, 0, options);
    }
  };

  // Global Change Interceptor for Dashboard Tabs
  function setupGlobalChangeListeners() {
    let changeDebounce = null;

    document.addEventListener('input', (e) => {
      // Only watch within dashboard container
      if (!e.target.closest('#dashboard-content') && !e.target.closest('.dashboard-page-container')) return;
      if (e.target.closest('.custom-dd-search') || e.target.closest('.chat-input') || e.target.type === 'search') return;

      if (typeof AutoSave.customHandler === 'function') {
        if (changeDebounce) clearTimeout(changeDebounce);
        changeDebounce = setTimeout(() => {
          AutoSave.trigger(AutoSave.customHandler, 700);
        }, 150);
      }
    }, true);

    document.addEventListener('change', (e) => {
      if (!e.target.closest('#dashboard-content') && !e.target.closest('.dashboard-page-container')) return;
      if (e.target.closest('.custom-dd-search')) return;

      if (typeof AutoSave.customHandler === 'function') {
        AutoSave.immediate(AutoSave.customHandler);
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGlobalChangeListeners);
  } else {
    setupGlobalChangeListeners();
  }

  // Export globally
  window.Toast = Toast;
  window.AutoSave = AutoSave;
  window.Notifications = {
    show: (msg, type) => Toast.show(msg, type)
  };
  window.showNotify = (msg, type = 'success') => {
    if (type === 'success') Toast.success(msg);
    else if (type === 'error') Toast.error(msg);
    else if (type === 'info') Toast.info(msg);
    else Toast.show(msg, type);
  };
})();
