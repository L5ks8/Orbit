/**
 * Orbit UI Helpers & Components
 * Toast, Modals, Custom Selects, Toggles, SaveBar, and Markdown.
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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="active-modal-overlay">
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <h3 class="text-base font-semibold text-white">${title}</h3>
            <button class="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800" onclick="Modal.close()">${icon('x', 18)}</button>
          </div>
          <div class="p-6 text-sm text-neutral-300">
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
      if (show) {
        menu.classList.remove('hidden');
        if (searchInput) {
          searchInput.focus();
          searchInput.value = '';
          filter('');
        }
      } else {
        menu.classList.add('hidden');
      }
    };

    trigger.onclick = (e) => {
      e.stopPropagation();
      const isHidden = menu.classList.contains('hidden');
      document.querySelectorAll('.custom-select-menu').forEach(m => m.classList.add('hidden'));
      toggle(isHidden);
    };

    document.addEventListener('click', (e) => {
      if (!document.getElementById(containerId)?.contains(e.target)) {
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
        class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm hover:border-neutral-700 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-600"
      >
        <span class="select-label truncate ${isSelected ? 'text-white font-medium' : 'text-neutral-500'}">${displayLabel}</span>
        <span class="text-neutral-500 shrink-0">${icon('chevron-down', 16)}</span>
      </button>

      <div 
        id="${containerId}-menu" 
        class="custom-select-menu hidden absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden max-h-60 flex flex-col"
      >
        ${options.length > 7 ? `
          <div class="p-2 border-b border-neutral-800 shrink-0">
            <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
              <span class="text-neutral-500">${icon('search', 14)}</span>
              <input type="text" id="${containerId}-search" placeholder="Search..." class="bg-transparent text-white focus:outline-none w-full">
            </div>
          </div>
        ` : ''}
        <div class="overflow-y-auto p-1 flex flex-col gap-0.5">
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
      
      const thumb = el.querySelector('.toggle-thumb');
      if (next) {
        el.classList.remove('bg-neutral-800');
        el.classList.add('bg-white');
        thumb.classList.remove('translate-x-0.5');
        thumb.classList.add('translate-x-5', 'bg-black');
        thumb.classList.remove('bg-neutral-400');
      } else {
        el.classList.remove('bg-white');
        el.classList.add('bg-neutral-800');
        thumb.classList.remove('translate-x-5', 'bg-black');
        thumb.classList.add('translate-x-0.5', 'bg-neutral-400');
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
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-white' : 'bg-neutral-800'}"
      >
        <span class="toggle-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5 bg-black' : 'translate-x-0.5 bg-neutral-400'}"></span>
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

// Global Helpers
window.Toast = Toast;
window.Modal = Modal;
window.renderCustomSelect = renderCustomSelect;
window.renderToggle = renderToggle;
window.SaveBar = SaveBar;
window.DiscordMarkdown = DiscordMarkdown;
