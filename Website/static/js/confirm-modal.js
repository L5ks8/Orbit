/**
 * Orbit Delete Confirmation Modal Component
 * Renders an accessible, beautifully styled confirmation modal for deletion actions.
 */

(function () {
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Shows a delete confirmation dialog matching Orbit design specifications.
   * @param {Object|string} options - Configuration object or title string
   * @param {string} [options.title='Delete item?']
   * @param {string} [options.message='This action cannot be undone.']
   * @param {string} [options.confirmText='Delete']
   * @param {string} [options.cancelText='Cancel']
   * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
   */
  function confirmDelete(options = {}) {
    if (typeof options === 'string') {
      options = { title: options, message: arguments[1] || '' };
    }

    const title = options.title || 'Delete item?';
    const message = options.message || 'This action cannot be undone.';
    const confirmText = options.confirmText || 'Delete';
    const cancelText = options.cancelText || 'Cancel';

    return new Promise((resolve) => {
      // Remove any existing confirm modal
      const existing = document.getElementById('orbit-confirm-delete-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'orbit-confirm-delete-overlay';
      overlay.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-150 animate-fade-in';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      overlay.innerHTML = `
        <div class="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transform transition-transform duration-150 scale-100">
          <div class="p-6 text-center">
            <div class="mx-auto w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-5 h-5 text-red-400">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" x2="10" y1="11" y2="17"></line>
                <line x1="14" x2="14" y1="11" y2="17"></line>
              </svg>
            </div>
            <h3 class="text-sm font-medium text-white mb-1 text-balance">${escapeHtml(title)}</h3>
            <p class="text-sm text-neutral-400 text-pretty">${escapeHtml(message)}</p>
          </div>
          <div class="flex items-center gap-3 px-6 pb-6">
            <button type="button" id="orbit-confirm-cancel" class="flex-1 h-10 px-4 rounded-xl border border-neutral-700 text-sm font-medium text-white hover:bg-neutral-800 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 cursor-pointer">
              ${escapeHtml(cancelText)}
            </button>
            <button type="button" id="orbit-confirm-proceed" class="flex-1 h-10 px-4 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-4 h-4">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" x2="10" y1="11" y2="17"></line>
                <line x1="14" x2="14" y1="11" y2="17"></line>
              </svg>
              ${escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const cancelBtn = overlay.querySelector('#orbit-confirm-cancel');
      const proceedBtn = overlay.querySelector('#orbit-confirm-proceed');

      function cleanup(result) {
        document.removeEventListener('keydown', handleKeyDown);
        overlay.classList.add('opacity-0');
        setTimeout(() => {
          overlay.remove();
        }, 150);
        resolve(result);
      }

      function handleKeyDown(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(false);
        } else if (e.key === 'Enter' && document.activeElement === proceedBtn) {
          e.preventDefault();
          cleanup(true);
        }
      }

      cancelBtn.addEventListener('click', () => cleanup(false));
      proceedBtn.addEventListener('click', () => cleanup(true));

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          cleanup(false);
        }
      });

      document.addEventListener('keydown', handleKeyDown);

      // Focus the cancel button by default to prevent accidental deletion
      setTimeout(() => {
        if (cancelBtn) cancelBtn.focus();
      }, 50);
    });
  }

  // Expose globally
  window.confirmDelete = confirmDelete;
  window.showConfirmDelete = confirmDelete;
  window.ConfirmModal = { delete: confirmDelete };
})();
