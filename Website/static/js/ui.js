/**
 * Orbit UI Helpers & Components
 * Toast, Modals, Custom Selects, Toggles, SaveBar, Global Dropdown Z-Index & Scroll Lock Manager, and Markdown.
 */

// --- TOAST SYSTEM ---
const Toast = {
  container: null,
  counter: 0,

  init() {
    if (!this.container) {
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

  show(message, type = 'info', duration = 4000) {
    this.init();
    const id = ++this.counter;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = `toast-${id}`;

    let iconSvg = '';
    if (type === 'success') iconSvg = icon('check', 18, 'text-emerald-400');
    else if (type === 'error') iconSvg = icon('alert-triangle', 18, 'text-red-400');
    else if (type === 'loading') iconSvg = `<svg class="animate-spin text-neutral-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
    else iconSvg = icon('info', 18, 'text-blue-400');

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="Toast.dismiss(${id})">${icon('x', 14)}</button>
    `;

    toast.onclick = (e) => {
      if (!e.target.closest('.toast-close')) Toast.dismiss(id);
    };

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  },

  success(msg, duration = 3000) {
    return this.show(msg, 'success', duration);
  },

  error(msg, duration = 4500) {
    return this.show(msg, 'error', duration);
  },

  loading(msg) {
    return this.show(msg, 'loading', 0);
  },

  dismiss(id) {
    const el = document.getElementById(`toast-${id}`);
    if (!el) return;
    el.classList.add('toast-leaving');
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  },

  update(id, msg, type = 'success', duration = 3000) {
    const el = document.getElementById(`toast-${id}`);
    if (!el) {
      return this.show(msg, type, duration);
    }
    el.className = `toast toast-${type}`;
    let iconSvg = '';
    if (type === 'success') iconSvg = icon('check', 18, 'text-emerald-400');
    else if (type === 'error') iconSvg = icon('alert-triangle', 18, 'text-red-400');
    else iconSvg = icon('info', 18, 'text-blue-400');

    el.querySelector('.toast-icon').innerHTML = iconSvg;
    el.querySelector('.toast-message').textContent = msg;

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
};

// --- MODAL DIALOGS ---
const Modal = {
  open({ title, content, onConfirm, confirmText = 'Confirm', confirmStyle = 'primary' }) {
    let container = document.getElementById('modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-container';
      document.body.appendChild(container);
    }

    const btnClass = confirmStyle === 'danger' 
      ? 'bg-red-600 hover:bg-red-500 text-white' 
      : 'bg-white text-black hover:bg-neutral-200';

    container.innerHTML = `
      <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="active-modal-overlay" data-lenis-prevent>
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <h3 class="text-base font-semibold text-white">${title}</h3>
            <button class="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800" onclick="Modal.close()">${icon('x', 18)}</button>
          </div>
          <div class="p-6 text-sm text-neutral-300 max-h-[70vh] overflow-y-auto overscroll-contain" data-lenis-prevent>
            ${content}
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-950 border-t border-neutral-800">
            <button type="button" class="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors" onclick="Modal.close()">Cancel</button>
            <button type="button" id="modal-confirm-btn" class="px-5 py-2 text-sm font-medium rounded-xl transition-all duration-150 active:scale-95 ${btnClass}">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('active-modal-overlay').onclick = () => Modal.close();
    document.getElementById('modal-confirm-btn').onclick = async () => {
      if (onConfirm) await onConfirm();
      Modal.close();
    };
  },

  close() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  }
};

// --- CUSTOM SELECT DROPDOWN COMPONENT ---
function renderCustomSelect({ id, name, options = [], value = '', placeholder = 'Select an option...', onChange = null }) {
  const selectedOption = options.find(o => String(o.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isSelected = !!selectedOption;

  const containerId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  setTimeout(() => {
    const trigger = document.getElementById(`${containerId}-trigger`);
    const menu = document.getElementById(`${containerId}-menu`);
    const searchInput = document.getElementById(`${containerId}-search`);
    const hiddenInput = document.getElementById(`${containerId}-input`);

    if (!trigger || !menu) return;

    const toggle = (show) => {
      const currentlyHidden = menu.classList.contains('hidden');
      if (show && currentlyHidden) {
        menu.classList.remove('hidden');
        if (searchInput) {
          searchInput.focus();
          searchInput.value = '';
          filter('');
        }
        if (window.OrbitDropdownManager) window.OrbitDropdownManager.scheduleSync();
      } else if (!show && !currentlyHidden) {
        menu.classList.add('hidden');
        if (window.OrbitDropdownManager) window.OrbitDropdownManager.scheduleSync();
      }
    };

    trigger.onclick = (e) => {
      e.stopPropagation();
      const isHidden = menu.classList.contains('hidden');
      document.querySelectorAll('.custom-select-menu').forEach(m => {
        if (m !== menu && !m.classList.contains('hidden')) m.classList.add('hidden');
      });
      toggle(isHidden);
    };

    document.addEventListener('click', (e) => {
      if (menu.classList.contains('hidden')) return;
      const wrapper = document.getElementById(containerId);
      if (!wrapper || !wrapper.contains(e.target)) {
        toggle(false);
      }
    });

    const filter = (term) => {
      const items = menu.querySelectorAll('.select-item');
      items.forEach(it => {
        const text = it.getAttribute('data-label')?.toLowerCase() || '';
        it.style.display = text.includes(term.toLowerCase()) ? 'flex' : 'none';
      });
    };

    if (searchInput) {
      searchInput.onclick = (e) => e.stopPropagation();
      searchInput.oninput = (e) => filter(e.target.value);
    }

    menu.querySelectorAll('.select-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const val = item.getAttribute('data-value');
        const lbl = item.getAttribute('data-label');
        if (hiddenInput) hiddenInput.value = val;
        trigger.querySelector('.select-label').textContent = lbl;
        trigger.querySelector('.select-label').classList.remove('text-neutral-500');
        trigger.querySelector('.select-label').classList.add('text-white');
        toggle(false);
        if (onChange) onChange(val, lbl);
        else if (window[onChange]) window[onChange](val, lbl);
      };
    });
  }, 0);

  return `
    <div id="${containerId}" class="custom-select-wrapper relative w-full text-left">
      <input type="hidden" id="${containerId}-input" name="${name || ''}" value="${value || ''}">
      <button 
        type="button" 
        id="${containerId}-trigger"
        class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm hover:border-neutral-700 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-600 cursor-pointer"
      >
        <span class="select-label truncate ${isSelected ? 'text-white font-medium' : 'text-neutral-500'}">${displayLabel}</span>
        <span class="text-neutral-500 shrink-0">${icon('chevron-down', 16)}</span>
      </button>

      <div 
        id="${containerId}-menu" 
        data-lenis-prevent="true"
        style="z-index: 99999;"
        class="custom-select-menu orbit-dropdown-menu hidden absolute top-full left-0 right-0 mt-1.5 z-[99999] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-60 flex flex-col"
      >
        <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
          <div class="relative w-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input type="text" id="${containerId}-search" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
          </div>
        </div>
        <div class="overflow-y-auto overscroll-contain p-1 flex flex-col gap-0.5 scrollbar-thin" data-lenis-prevent="true">
          ${options.map(opt => `
            <div 
              class="select-item flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-neutral-800 transition-colors ${String(opt.value) === String(value) ? 'bg-neutral-800/80 text-white font-semibold' : 'text-neutral-300'}"
              data-value="${opt.value}" 
              data-label="${opt.label}"
            >
              <div class="flex items-center gap-2 truncate">
                ${opt.color ? `<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${opt.color}"></span>` : ''}
                <span class="truncate">${opt.label}</span>
              </div>
              ${String(opt.value) === String(value) ? `<span class="text-emerald-400 shrink-0">${icon('check', 14)}</span>` : ''}
            </div>
          `).join('')}
          ${options.length === 0 ? `<div class="px-3 py-3 text-xs text-neutral-500 text-center">No options available</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// --- TOGGLE SWITCH COMPONENT ---
function renderToggle({ id, checked = false, onChange = null, label = '', description = '' }) {
  const toggleId = id || `toggle-${Math.random().toString(36).substring(2, 9)}`;

  setTimeout(() => {
    const el = document.getElementById(toggleId);
    if (!el) return;
    el.onclick = () => {
      const isChecked = el.getAttribute('aria-checked') === 'true';
      const next = !isChecked;
      el.setAttribute('aria-checked', String(next));
      el.classList.toggle('bg-white', next);
      el.classList.toggle('bg-neutral-700', !next);

      const thumb = el.querySelector('span');
      if (thumb) {
        thumb.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out ${next ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}`;
      }

      if (onChange) onChange(next);
      else if (window[onChange]) window[onChange](next);
    };
  }, 0);

  return `
    <div class="flex items-center justify-between gap-4">
      ${label ? `
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold text-white truncate">${label}</span>
          ${description ? `<span class="text-xs text-neutral-500 truncate">${description}</span>` : ''}
        </div>
      ` : ''}
      <button 
        type="button" 
        role="switch" 
        id="${toggleId}"
        aria-checked="${checked ? 'true' : 'false'}"
        class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${checked ? 'bg-white' : 'bg-neutral-700'}"
      >
        <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
      </button>
    </div>
  `;
}

// --- SAVE BAR COMPONENT ---
const SaveBar = {
  render({ onSave, onReset }) {
    return `
      <div id="save-bar-container" class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-5 py-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl shadow-black/80 max-w-lg w-full animate-fade-in-up">
        <div class="flex items-center gap-2 text-sm text-neutral-300 font-medium">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Careful — you have unsaved changes!
        </div>
        <div class="flex items-center gap-3">
          <button type="button" id="savebar-reset-btn" class="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors">Reset</button>
          <button type="button" id="savebar-save-btn" class="px-4 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-transform active:scale-95">Save Changes</button>
        </div>
      </div>
    `;
  },

  show(show = true) {
    const el = document.getElementById('save-bar-container');
    if (!el) return;
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }
};

// --- DISCORD MARKDOWN PARSER ---
const DiscordMarkdown = {
  parse(text) {
    if (!text) return '';
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Blockquotes
    escaped = escaped.replace(/^&gt;\s+(.*)$/gm, '<div class="pl-2.5 border-l-4 border-[#4e5058] rounded-[3px] my-1 text-neutral-300">$1</div>');
    
    // Bold, Italic, Code, Underline, Strikethrough
    return escaped
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto my-2"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-neutral-800 px-1.5 py-0.5 rounded text-xs text-neutral-200 font-mono">$1</code>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-neutral-300">$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<s class="line-through text-neutral-500">$1</s>')
      .replace(/\n/g, '<br />');
  }
};

// --- GLOBAL DROPDOWN Z-INDEX, INTERNAL SCROLL & OUTSIDE SCROLL-LOCK MANAGER ---
const OrbitDropdownManager = {
  selector: '.custom-select-menu, .orbit-dropdown-menu, [id$="-menu"].absolute, [id$="-dropdown"].absolute, [id$="-popover"].absolute',
  elevatedAncestors: new Set(),
  unclippedAncestors: new Set(),
  activeOpenMenus: [],
  _rafId: null,

  getOpenDropdowns() {
    const candidates = document.querySelectorAll(this.selector);
    const openList = [];
    candidates.forEach(el => {
      if (el.classList.contains('hidden')) return;
      if (el.offsetParent === null && window.getComputedStyle(el).position !== 'fixed') return;
      openList.push(el);
    });
    return openList;
  },

  scheduleSync() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this.sync();
    });
  },

  ensureSearchBar(menu) {
    if (menu.dataset.orbitSearchInit === 'true') return;
    if (menu.querySelector('input[type="text"], input[type="search"]')) {
      menu.dataset.orbitSearchInit = 'true';
      return;
    }
    // Skip 3-dot action menus or color swatch popovers
    if (
      menu.hasAttribute('data-poll-menu') ||
      menu.querySelector('[data-pick-autopost-color], [data-poll-action], [data-msg-action], [data-panel-action]')
    ) {
      menu.dataset.orbitSearchInit = 'true';
      return;
    }
    const items = Array.from(menu.querySelectorAll('button, .select-item'));
    if (items.length === 0) return;
    const hasTextItems = items.some(it => (it.textContent || '').trim().length > 0);
    if (!hasTextItems) {
      menu.dataset.orbitSearchInit = 'true';
      return;
    }
    menu.dataset.orbitSearchInit = 'true';
    const searchWrap = document.createElement('div');
    searchWrap.className = 'orbit-auto-search orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0';
    searchWrap.innerHTML = `
      <div class="relative w-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        <input type="text" placeholder="Suchen..." class="orbit-auto-search-input orbit-searchbar-input w-full pl-9 pr-8 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
        <button type="button" class="orbit-searchbar-clear hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-0.5 rounded flex items-center justify-center shrink-0" title="Suche leeren">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
        </button>
      </div>
    `;
    searchWrap.addEventListener('click', (e) => e.stopPropagation());
    const input = searchWrap.querySelector('input');
    const clearBtn = searchWrap.querySelector('.orbit-searchbar-clear');

    const updateFilter = () => {
      const term = (input.value || '').toLowerCase().trim();
      if (clearBtn) {
        if (term.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }
      const currentItems = menu.querySelectorAll('button, .select-item');
      currentItems.forEach(it => {
        if (searchWrap.contains(it)) return;
        const txt = (it.textContent || '').toLowerCase();
        it.style.display = (!term || txt.includes(term)) ? '' : 'none';
      });
    };

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = '';
        updateFilter();
        input.focus();
      });
    }

    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('keydown', (e) => e.stopPropagation());
    input.addEventListener('input', updateFilter);
    menu.insertBefore(searchWrap, menu.firstChild);
    setTimeout(() => input.focus(), 10);
  },

  sync() {
    const openMenus = this.getOpenDropdowns();
    this.activeOpenMenus = openMenus;

    const nextElevated = new Set();
    const nextUnclipped = new Set();

    openMenus.forEach(menu => {
      this.ensureSearchBar(menu);
      if (!menu.classList.contains('orbit-dropdown-active-menu')) {
        menu.classList.add('orbit-dropdown-active-menu');
      }
      if (menu.getAttribute('data-lenis-prevent') !== 'true') {
        menu.setAttribute('data-lenis-prevent', 'true');
      }
      if (menu.style.zIndex !== '99999') {
        menu.style.zIndex = '99999';
      }

      // Ensure inner scroll containers have data-lenis-prevent
      menu.querySelectorAll('.overflow-y-auto').forEach(sc => {
        if (sc.getAttribute('data-lenis-prevent') !== 'true') {
          sc.setAttribute('data-lenis-prevent', 'true');
        }
      });

      // Elevate ancestor stacking contexts so sibling cards or modal boxes never clip or cover the open dropdown
      let curr = menu.parentElement;
      const stopRoot = document.getElementById('dash-tab-content');
      while (curr && curr !== stopRoot && curr !== document.body) {
        nextElevated.add(curr);
        if (!curr.classList.contains('orbit-dropdown-ancestor-active')) {
          curr.classList.add('orbit-dropdown-ancestor-active');
        }
        if (
          curr.classList.contains('overflow-hidden') &&
          !curr.classList.contains('overflow-y-auto') &&
          !curr.classList.contains('h-full') &&
          !curr.hasAttribute('data-tour')
        ) {
          nextUnclipped.add(curr);
          if (!curr.classList.contains('orbit-dropdown-card-unclip')) {
            curr.classList.add('orbit-dropdown-card-unclip');
          }
        }
        curr = curr.parentElement;
      }
    });

    // Remove classes from ancestors that are no longer active
    this.elevatedAncestors.forEach(anc => {
      if (!nextElevated.has(anc)) {
        anc.classList.remove('orbit-dropdown-ancestor-active');
      }
    });
    this.elevatedAncestors = nextElevated;

    this.unclippedAncestors.forEach(anc => {
      if (!nextUnclipped.has(anc)) {
        anc.classList.remove('orbit-dropdown-card-unclip');
      }
    });
    this.unclippedAncestors = nextUnclipped;

    if (openMenus.length > 0) {
      if (!window.__orbitDropdownOpen) {
        window.__orbitDropdownOpen = true;
        if (window.__lenis && typeof window.__lenis.stop === 'function') {
          window.__lenis.stop();
        }
      }
    } else {
      if (window.__orbitDropdownOpen) {
        window.__orbitDropdownOpen = false;
        if (window.__lenis && typeof window.__lenis.start === 'function') {
          window.__lenis.start();
        }
      }
    }
  },

  findScrollableInMenu(menu, target) {
    let curr = target;
    while (curr && curr !== menu) {
      const st = window.getComputedStyle(curr);
      if ((st.overflowY === 'auto' || st.overflowY === 'scroll') && curr.scrollHeight > curr.clientHeight) {
        return curr;
      }
      curr = curr.parentElement;
    }
    const innerAuto = menu.querySelector('.overflow-y-auto');
    if (innerAuto && innerAuto.scrollHeight > innerAuto.clientHeight) {
      return innerAuto;
    }
    if (menu.scrollHeight > menu.clientHeight) {
      return menu;
    }
    return null;
  },

  init() {
    // Sync on user interactions (no MutationObserver to avoid DOM mutation feedback loops)
    const onInteraction = () => this.scheduleSync();
    document.addEventListener('click', onInteraction, true);
    document.addEventListener('click', onInteraction, false);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        this.scheduleSync();
      }
    }, false);

    // Lock wheel scrolling outside open dropdowns, and allow smooth scrolling inside open dropdowns & sidebar
    window.addEventListener('wheel', (e) => {
      if (!window.__orbitDropdownOpen && this.activeOpenMenus.length === 0) return;
      const openMenus = this.activeOpenMenus.filter(m => document.body.contains(m) && !m.classList.contains('hidden'));
      if (openMenus.length === 0) {
        this.scheduleSync();
        return;
      }
      const activeMenu = openMenus.find(m => m.contains(e.target));
      if (!activeMenu) {
        // User scrolled outside the open dropdown -> block scrolling completely!
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // User is scrolling inside the open dropdown
      const scroller = this.findScrollableInMenu(activeMenu, e.target);
      if (!scroller) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const atTop = scroller.scrollTop <= 0 && e.deltaY < 0;
      const atBottom = (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) && e.deltaY > 0;
      if (atTop || atBottom) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Allow native scroll inside the dropdown scroller, stop Lenis from hijacking
      e.stopPropagation();
    }, { passive: false, capture: true });

    // Also lock touchmove outside open dropdowns on touch devices
    window.addEventListener('touchmove', (e) => {
      if (!window.__orbitDropdownOpen && this.activeOpenMenus.length === 0) return;
      const openMenus = this.activeOpenMenus.filter(m => document.body.contains(m) && !m.classList.contains('hidden'));
      if (openMenus.length > 0) {
        const activeMenu = openMenus.find(m => m.contains(e.target));
        if (!activeMenu) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }, { passive: false, capture: true });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => OrbitDropdownManager.init());
} else {
  OrbitDropdownManager.init();
}

// --- MODERN ERROR 404/500 STATE COMPONENT ---
function renderErrorState(container, options = {}) {
  if (!container) return;
  const {
    title = 'Seite nicht gefunden',
    message = 'Die angeforderte Konfiguration oder Ressource konnte nicht geladen werden.',
    details = '',
    statusCode = 404,
    onRetry = null,
    backUrl = '/',
    backText = 'Zurück zur Übersicht'
  } = options;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const isNotFound = String(statusCode) === '404' || String(statusCode).startsWith('4');
  const codeLabel = isNotFound ? '404' : (statusCode || '500');
  const badgeText = isNotFound ? 'Nicht gefunden' : 'Serverfehler';

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center animate-fade-in">
      <div class="relative w-full max-w-lg bg-neutral-900/90 border border-neutral-800 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center overflow-hidden">
        <!-- Ambient top glow -->
        <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 ${isNotFound ? 'bg-amber-500/10' : 'bg-rose-500/10'} rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

        <!-- Error Icon / Code Badge -->
        <div class="w-16 h-16 rounded-2xl ${isNotFound ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} border flex items-center justify-center mb-5 flex-shrink-0 shadow-lg">
          ${isNotFound ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          `}
        </div>

        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${isNotFound ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} border mb-3">
          <span>Fehler ${escapeHtml(codeLabel)}</span>
          <span>·</span>
          <span>${escapeHtml(badgeText)}</span>
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">${escapeHtml(title)}</h2>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">${escapeHtml(message)}</p>

        ${details ? `
          <div class="w-full mb-6 text-left">
            <details class="group bg-neutral-950/70 border border-neutral-800/80 rounded-xl overflow-hidden transition-colors">
              <summary class="flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-neutral-400 cursor-pointer hover:text-white select-none">
                <span class="flex items-center gap-1.5 font-mono text-[11px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                  Details zum Fehler anzeigen
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-neutral-500 group-open:rotate-180 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
              </summary>
              <div class="px-3.5 pb-3 pt-1 border-t border-neutral-800/50">
                <pre class="font-mono text-[11px] text-rose-300/90 whitespace-pre-wrap break-all leading-relaxed max-h-36 overflow-y-auto scrollbar-thin">${escapeHtml(details)}</pre>
              </div>
            </details>
          </div>
        ` : ''}

        <div class="flex flex-wrap items-center justify-center gap-3 w-full">
          ${onRetry ? `
            <button type="button" id="orbit-error-retry-btn" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              <span>Erneut versuchen</span>
            </button>
          ` : ''}
          ${backUrl ? `
            <a href="${escapeHtml(backUrl)}" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium border border-neutral-700 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
              <span>${escapeHtml(backText)}</span>
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  if (onRetry) {
    const retryBtn = container.querySelector('#orbit-error-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        container.innerHTML = `
          <div class="p-12 flex items-center justify-center min-h-[300px]">
            <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        `;
        onRetry();
      });
    }
  }
}

// Global Helpers
window.Toast = Toast;
window.Modal = Modal;
window.renderCustomSelect = renderCustomSelect;
window.bindCustomSelects = function(map) {
  if (!map || typeof map !== 'object') return;
  Object.entries(map).forEach(([containerId, cb]) => {
    if (typeof cb !== 'function') return;
    const menu = document.getElementById(`${containerId}-menu`);
    if (menu) {
      menu.querySelectorAll('.select-item').forEach(item => {
        item.addEventListener('click', () => {
          const val = item.getAttribute('data-value');
          const lbl = item.getAttribute('data-label');
          try { cb(val, lbl); } catch (err) { console.error('bindCustomSelects error:', err); }
        });
      });
    }
  });
};
window.renderToggle = renderToggle;
window.SaveBar = SaveBar;
window.DiscordMarkdown = DiscordMarkdown;
window.OrbitDropdownManager = OrbitDropdownManager;
window.renderErrorState = renderErrorState;
