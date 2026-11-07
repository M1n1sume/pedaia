// PEDAIA User Account & Profile Pop-up Modal Component
// Provides a clean, centered, non-clipped modal pop-up for user controls, profile settings, and session management.
import { store } from '../state.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function openUserAccountModal({
  navigateTo,
  showToast,
  updateAuthUI,
  updateSidebarProfile,
  renderCurrentView,
  setAiOutputStudioViewMode
} = {}) {
  const existing = document.getElementById('user-account-modal');
  if (existing) existing.remove();

  const user = store.getCurrentUser() || { username: 'Educator', role: 'educator' };
  const isAdmin = store.isAdmin ? store.isAdmin() : (user.role === 'admin' || user.username === 'M1n1sume');
  const initial = (user.username && user.username.length > 0) ? user.username.charAt(0).toUpperCase() : 'E';

  const modalHtml = `
    <div id="user-account-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="user-account-modal-title">
      <div class="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-750 flex flex-col transition-colors max-h-[92vh] overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100">
        
        <!-- Modal Header -->
        <div class="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl ${isAdmin ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700/80 text-amber-600 dark:text-amber-300' : 'bg-indigo-100 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'} border flex items-center justify-center text-xl shadow-2xs shrink-0 font-bold">
              ${isAdmin ? '👑' : initial}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 id="user-account-modal-title" class="text-base font-bold font-scholarly text-slate-900 dark:text-white font-mono">
                  ${escapeHtml(user.username)}
                </h3>
                ${isAdmin ? `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Administrator
                  </span>
                ` : `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Educator
                  </span>
                `}
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ${isAdmin ? 'System Administrator & Master Architect' : 'Educator Workspace & Curriculum Studio'}
              </p>
            </div>
          </div>

          <button id="close-user-account-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Close">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Session Status Pill Strip -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-semibold text-slate-700 dark:text-slate-200">Active Authenticated Session</span>
          </div>
          <span class="text-[10px] font-mono text-slate-400 dark:text-slate-500">Secure Vault</span>
        </div>

        <!-- Account Controls & Navigation Links -->
        <div class="space-y-2 pt-1">
          <button id="modal-menu-profile" type="button" class="w-full p-3 rounded-xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/90 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all flex items-center gap-3 cursor-pointer group">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-750 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center text-base shrink-0 transition-colors">
              👤
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                My Account Profile
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                View personal information, credentials, and password
              </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button id="modal-menu-saved-designs" type="button" class="w-full p-3 rounded-xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/90 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all flex items-center gap-3 cursor-pointer group">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-750 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center text-base shrink-0 transition-colors">
              🗃️
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                My Saved Designs
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Browse, edit, and duplicate your instructional lesson plans
              </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button id="modal-menu-generated-outputs" type="button" class="w-full p-3 rounded-xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/90 hover:bg-violet-50/70 dark:hover:bg-violet-950/50 hover:border-violet-300 dark:hover:border-violet-700 text-left transition-all flex items-center gap-3 cursor-pointer group">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-750 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/60 text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 flex items-center justify-center text-base shrink-0 transition-colors">
              🎨
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                My Generated AI Outputs
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Presentations, posters, worksheets, flashcards & diagrams
              </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          ${isAdmin ? `
            <button id="modal-menu-admin" type="button" class="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 hover:border-amber-400 text-left transition-all flex items-center gap-3 cursor-pointer group">
              <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-base shrink-0 transition-colors">
                👑
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:underline">
                  Administrator Console
                </div>
                <div class="text-[11px] text-amber-700/80 dark:text-amber-400/80 truncate">
                  Platform telemetry, security audits & educator management
                </div>
              </div>
              <svg class="w-4 h-4 text-amber-600 dark:text-amber-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ` : ''}

          <button id="modal-menu-settings" type="button" class="w-full p-3 rounded-xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/90 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all flex items-center gap-3 cursor-pointer group">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-750 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center text-base shrink-0 transition-colors">
              ⚙️
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Studio Settings & AI Catalog
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Configure frontier AI models, custom keys & pedagogy rules
              </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Sign Out Action -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button id="modal-menu-logout" type="button" class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out of PEDAIA</span>
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modalEl = document.getElementById('user-account-modal');

  const closeModal = () => {
    modalEl?.classList.remove('animate-fade-in');
    modalEl?.remove();
    document.removeEventListener('keydown', handleKeydown);
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', handleKeydown);

  // Close when clicking background backdrop
  modalEl?.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  modalEl?.querySelector('#close-user-account-modal-btn')?.addEventListener('click', closeModal);

  // Wire menu buttons
  modalEl?.querySelector('#modal-menu-profile')?.addEventListener('click', () => {
    closeModal();
    if (navigateTo) navigateTo('settings', 'general');
  });

  modalEl?.querySelector('#modal-menu-saved-designs')?.addEventListener('click', () => {
    closeModal();
    if (navigateTo) navigateTo('designs');
  });

  modalEl?.querySelector('#modal-menu-generated-outputs')?.addEventListener('click', () => {
    closeModal();
    if (setAiOutputStudioViewMode) setAiOutputStudioViewMode('library');
    if (navigateTo) navigateTo('ai-output-studio');
  });

  modalEl?.querySelector('#modal-menu-admin')?.addEventListener('click', () => {
    closeModal();
    if (navigateTo) navigateTo('admin');
  });

  modalEl?.querySelector('#modal-menu-settings')?.addEventListener('click', () => {
    closeModal();
    if (navigateTo) navigateTo('settings', 'ai-providers');
  });

  modalEl?.querySelector('#modal-menu-logout')?.addEventListener('click', () => {
    closeModal();
    store.logoutUser();
    if (showToast) showToast('✓ Successfully signed out of PEDAIA.', 'info');
    if (updateAuthUI) updateAuthUI();
    if (updateSidebarProfile) updateSidebarProfile();
    if (renderCurrentView) renderCurrentView();
  });
}
