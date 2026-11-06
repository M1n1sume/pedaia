// PEDAIA Application Controller & Router
import { store } from './state.js';
import { aiService } from './aiService.js';
import { openUniversalImportModal } from './importUtils.js';
import { openAiSwitcherModal } from './views/aiSwitcherModal.js';
import { openPaletteModal } from './views/paletteModal.js';
import { applyPalette, getCurrentPalette } from './palette.js';
import { renderDashboardView, setupDashboardListeners } from './views/dashboard.js';
import { renderLessonPlannerView, setupLessonPlannerListeners } from './views/lessonPlanner.js';
import { renderActivityDesignerView, setupActivityDesignerListeners } from './views/activityDesigner.js';
import { renderQuestioningStudioView, setupQuestioningStudioListeners } from './views/questioningStudio.js';
import { renderDifferentiationStudioView, setupDifferentiationStudioListeners } from './views/differentiationStudio.js';
import { renderOutputWorkspaceView, setupOutputWorkspaceListeners, setActiveWorkspaceDesignId } from './views/outputWorkspace.js';
import { renderMyDesignsView, setupMyDesignsListeners } from './views/myDesigns.js';
import { renderPromptLibraryView, setupPromptLibraryListeners } from './views/promptLibrary.js';
import { renderSettingsView, setupSettingsListeners, setSettingsActiveTab } from './views/settings.js';
import { renderAiOutputStudioView, setupAiOutputStudioListeners } from './views/aiOutputStudio.js';
import { renderAdminDashboardView, setupAdminDashboardListeners } from './views/adminDashboard.js';
import { openAuthModal } from './views/authModal.js';
import { openExtensionModal } from './views/extensionModal.js';
import { initCommandPalette, openCommandPalette } from './views/commandPalette.js';

let currentRoute = 'dashboard';
let isSidebarCollapsed = false;

const PAGE_TITLES = {
  'dashboard': 'Dashboard',
  'ai-output-studio': 'AI Output Studio',
  'output-studio': 'AI Output Studio',
  'lesson-planning': 'AI Lesson Planner',
  'activity-design': 'AI Activity Designer',
  'questioning': 'AI Questioning Studio',
  'differentiation': 'AI Differentiation Studio',
  'workspace': 'Output & Refinement Workspace',
  'designs': 'My Instructional Designs',
  'prompt-library': 'Prompt Library',
  'settings': 'Settings & AI Setup',
  'admin': 'Admin Console & User Directory'
};

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-900/90 text-white border-emerald-700',
    error: 'bg-rose-900/90 text-white border-rose-700',
    warning: 'bg-amber-900/90 text-white border-amber-700',
    info: 'bg-slate-900/95 text-white border-slate-700'
  }[type] || 'bg-slate-900 text-white border-slate-700';

  const typeIcon = {
    success: '<svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    warning: '<svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    info: '<svg class="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  }[type];

  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 ${typeStyles}`;
  toast.innerHTML = `${typeIcon}<span>${message}</span>`;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // Auto remove after 3.2s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export function navigateTo(route, param = null) {
  currentRoute = route;

  if (route === 'workspace' && param) {
    setActiveWorkspaceDesignId(param);
  } else if (route === 'settings' && param) {
    setSettingsActiveTab(param);
  }

  // Update URL hash
  window.location.hash = param ? `${route}/${param}` : route;

  // Update active sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    const navVal = item.getAttribute('data-nav');
    const tabVal = item.getAttribute('data-tab');
    let isActive = false;

    if (route === 'settings' && navVal === 'settings') {
      if (tabVal) {
        isActive = (param === tabVal) || (!param && tabVal === 'ai-providers');
      } else {
        isActive = true;
      }
    } else if (navVal === route || (route === 'workspace' && navVal === 'designs') || ((route === 'ai-output-studio' || route === 'output-studio') && navVal === 'ai-output-studio')) {
      isActive = true;
    }

    if (isActive) {
      item.classList.add('active', 'bg-indigo-600', 'text-white', 'shadow-xs');
      item.classList.remove('text-slate-600', 'dark:text-slate-300', 'text-slate-700', 'dark:text-slate-200', 'text-indigo-700', 'dark:text-indigo-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'bg-indigo-50/90', 'dark:bg-indigo-950/70', 'border-indigo-200/80', 'dark:border-indigo-800');
    } else {
      item.classList.remove('active', 'bg-indigo-600', 'text-white', 'shadow-xs', 'bg-indigo-50/90', 'dark:bg-indigo-950/70', 'border-indigo-200/80', 'dark:border-indigo-800', 'text-indigo-700', 'dark:text-indigo-300');
      item.classList.add('text-slate-600', 'dark:text-slate-300');
    }
  });

  // Update Header title
  const titleEl = document.getElementById('header-page-title');
  if (titleEl) {
    titleEl.textContent = PAGE_TITLES[route] || 'Instructional Studio';
  }

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Render view
  renderCurrentView();
}

function renderCurrentView() {
  const container = document.getElementById('main-view-container');
  if (!container) return;

  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (currentRoute) {
    case 'dashboard':
      container.innerHTML = renderDashboardView();
      setupDashboardListeners(container, navigateTo, showToast);
      break;
    case 'lesson-planning':
      container.innerHTML = renderLessonPlannerView();
      setupLessonPlannerListeners(container, (id) => navigateTo('workspace', id), showToast, () => navigateTo('settings'));
      break;
    case 'activity-design':
      container.innerHTML = renderActivityDesignerView();
      setupActivityDesignerListeners(container, (id) => navigateTo('workspace', id), showToast, () => navigateTo('settings'));
      break;
    case 'questioning':
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, (id) => navigateTo('workspace', id), showToast, () => navigateTo('settings'));
      break;
    case 'differentiation':
      container.innerHTML = renderDifferentiationStudioView();
      setupDifferentiationStudioListeners(container, (id) => navigateTo('workspace', id), showToast, () => navigateTo('settings'));
      break;
    case 'ai-output-studio':
    case 'output-studio':
      container.innerHTML = renderAiOutputStudioView();
      setupAiOutputStudioListeners(container, navigateTo, showToast);
      break;
    case 'workspace':
      container.innerHTML = renderOutputWorkspaceView();
      setupOutputWorkspaceListeners(container, (dest, param) => navigateTo(dest, param), showToast, () => navigateTo('settings'));
      break;
    case 'designs':
      container.innerHTML = renderMyDesignsView();
      setupMyDesignsListeners(container, (dest, param) => navigateTo(dest, param), showToast);
      break;
    case 'prompt-library':
      container.innerHTML = renderPromptLibraryView();
      setupPromptLibraryListeners(container, (dest) => navigateTo(dest), showToast);
      break;
    case 'settings':
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
      break;
    case 'admin':
      container.innerHTML = renderAdminDashboardView();
      setupAdminDashboardListeners(container, navigateTo, showToast);
      break;
    default:
      container.innerHTML = renderDashboardView();
      setupDashboardListeners(container, navigateTo, showToast);
  }
}

function updateApiStatusIndicator() {
  const dot = document.getElementById('header-api-status-dot');
  const text = document.getElementById('header-api-status-text');
  if (!dot || !text) return;

  const status = aiService.getActiveProviderStatus();
  if (status.providerId === 'ollama' || status.providerId === 'lmstudio') {
    dot.className = 'w-2 h-2 rounded-full bg-sky-500';
    text.textContent = `${status.badge} Ready (Local)`;
    text.className = 'text-sky-700 dark:text-sky-300 hidden sm:inline font-semibold';
  } else if (status.hasCustomKey) {
    dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
    text.textContent = `${status.badge} Ready (Custom Key)`;
    text.className = 'text-emerald-700 dark:text-emerald-300 hidden sm:inline font-semibold';
  } else {
    dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
    text.textContent = `${status.badge} Ready`;
    text.className = 'text-emerald-700 dark:text-emerald-300 hidden sm:inline font-semibold';
  }
}

function setupSidebarToggle() {
  const sidebar = document.getElementById('app-sidebar');
  const mobileToggleBtn = document.getElementById('mobile-drawer-toggle-btn');
  const mobileBottomMenuBtn = document.getElementById('mobile-bottom-menu-btn');
  const mobileCloseBtn = document.getElementById('mobile-close-sidebar-btn');
  const backdrop = document.getElementById('mobile-sidebar-backdrop');

  const openMobileSidebar = () => {
    sidebar?.classList.remove('translate-x-full');
    backdrop?.classList.remove('hidden');
  };

  mobileToggleBtn?.addEventListener('click', openMobileSidebar);
  mobileBottomMenuBtn?.addEventListener('click', openMobileSidebar);

  if (mobileCloseBtn && sidebar) {
    mobileCloseBtn.addEventListener('click', closeMobileSidebar);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('mobile-sidebar-backdrop');
  if (sidebar) sidebar.classList.add('translate-x-full');
  if (backdrop) backdrop.classList.add('hidden');
}

function openAboutModal() {
  const modalHtml = `
    <div id="about-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
              <img src="/favicon.svg" alt="PEDAIA" class="w-full h-full object-cover">
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white font-heading">PEDAIA Studio</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">AI-Powered Instructional Design Assistant</p>
            </div>
          </div>
          <button id="close-about-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="py-4 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div class="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-medium">
            <em>"Design Better Learning. Teach with Purpose."</em>
          </div>

          <p>
            <strong>PEDAIA</strong> is an advanced, non-chatbot instructional design studio engineered for pre-service teachers, higher-education faculty, curriculum specialists, and corporate trainers.
          </p>

          <p>
            Instead of loose conversational prompting, PEDAIA translates educator decisions into structured pedagogical prompts across four primary categories:
          </p>

          <ul class="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            <li><strong>Lesson Planning:</strong> 5E, 4A's, UbD, Gradual Release, Bloom's objectives.</li>
            <li><strong>Activity Design:</strong> Inquiry labs, Socratic fishbowls, problem-based simulations.</li>
            <li><strong>Questioning Studio:</strong> Full Bloom's cognitive depth with distractor diagnostics.</li>
            <li><strong>Differentiation Studio:</strong> Tomlinson-model tiered scaffolding without deficit labeling.</li>
          </ul>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            PEDAIA • Designed for University-Level Educational Technology Demonstration
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button id="close-about-modal-btn-2" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs">
            Got It
          </button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('about-modal-overlay');
  if (existing) existing.remove();

  const c = document.createElement('div');
  c.innerHTML = modalHtml;
  document.body.appendChild(c.firstElementChild);

  const m = document.getElementById('about-modal-overlay');
  const close = () => m.remove();

  document.getElementById('close-about-modal-btn').addEventListener('click', close);
  document.getElementById('close-about-modal-btn-2').addEventListener('click', close);
  m.addEventListener('click', (e) => { if (e.target === m) close(); });
}

// Initial Bootstrapping
document.addEventListener('DOMContentLoaded', async () => {
  setupSidebarToggle();

  // Initialize unified theme mode
  const currentMode = store.getThemeMode ? store.getThemeMode() : 'system';
  store.setThemeMode(currentMode);

  // Update header appearance indicator (Light / Dark / System)
  const updateHeaderPalette = () => {
    const mode = store.getThemeMode ? store.getThemeMode() : 'system';
    const dot = document.getElementById('header-palette-dot');
    const name = document.getElementById('header-palette-name');
    if (dot) {
      if (mode === 'system') dot.style.backgroundColor = '#14B8A6'; // Teal for system auto
      else if (mode === 'dark') dot.style.backgroundColor = '#7C3AED'; // Violet for dark atelier
      else dot.style.backgroundColor = '#312E81'; // Indigo for light paper
    }
    if (name) {
      name.textContent = mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light';
    }
  };
  updateHeaderPalette();

  // Header appearance modal button
  document.getElementById('header-palette-btn')?.addEventListener('click', () => {
    openPaletteModal({
      showToast,
      onThemeChange: () => {
        updateHeaderPalette();
        renderCurrentView();
      }
    });
  });

  // Navigation event delegation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const dest = item.getAttribute('data-nav');
      const tab = item.getAttribute('data-tab');
      if (dest) {
        if (dest === 'settings' && tab) {
          navigateTo('settings', tab);
        } else {
          navigateTo(dest);
        }
      }
    });
  });

  // Brand logo click
  document.getElementById('brand-logo-btn')?.addEventListener('click', () => navigateTo('dashboard'));

  // Header buttons
  document.getElementById('header-settings-btn')?.addEventListener('click', () => navigateTo('settings', 'ai-providers'));
  document.getElementById('header-profile-btn')?.addEventListener('click', () => navigateTo('settings', 'general'));
  document.getElementById('quick-settings-btn')?.addEventListener('click', () => navigateTo('settings'));
  const openAiSwitcher = () => {
    openAiSwitcherModal({
      showToast,
      openSettings: () => navigateTo('settings'),
      onSwitch: () => {
        updateApiStatusIndicator();
        renderCurrentView();
      }
    });
  };

  document.getElementById('header-api-status-btn')?.addEventListener('click', openAiSwitcher);
  document.getElementById('mobile-sidebar-ai-switcher-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    openAiSwitcher();
  });

  document.getElementById('mobile-sidebar-palette-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    openPaletteModal({ showToast });
  });

  // Browser Extension Modal Triggers
  document.getElementById('header-extension-btn')?.addEventListener('click', () => {
    openExtensionModal();
  });
  document.getElementById('mobile-sidebar-extension-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    openExtensionModal();
  });

  // Global Studio Command Palette (Ctrl+K)
  initCommandPalette({ navigateTo, showToast });
  document.getElementById('header-command-palette-btn')?.addEventListener('click', () => {
    openCommandPalette();
  });
  document.getElementById('mobile-sidebar-command-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    openCommandPalette();
  });

  document.getElementById('header-about-btn')?.addEventListener('click', openAboutModal);
  document.getElementById('quick-help-btn')?.addEventListener('click', openAboutModal);

  // Universal File Hub Import/Export Modal Triggers
  const openFileHub = () => {
    openUniversalImportModal({
      showToast,
      onAction: (action, data) => {
        if (action === 'open-workspace' && data.designId) {
          navigateTo('workspace', data.designId);
        } else if (action === 'load-lesson-planner') {
          navigateTo('lesson-planning');
        } else if (action === 'load-activity-designer') {
          navigateTo('activity-design');
        } else if (action === 'load-questioning') {
          navigateTo('questioning');
        } else if (action === 'load-differentiation') {
          navigateTo('differentiation');
        } else {
          navigateTo('designs');
        }
      }
    });
  };

  document.getElementById('header-file-hub-btn')?.addEventListener('click', openFileHub);
  document.getElementById('sidebar-file-hub-btn')?.addEventListener('click', openFileHub);
  document.getElementById('mobile-sidebar-file-hub-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    openFileHub();
  });

  // Update educator profile in sidebar and header from state (Strict blank default compliance)
  const updateSidebarProfile = () => {
    const prof = store.getEducatorProfile ? store.getEducatorProfile() : store.getSettings()?.educatorProfile;
    const nameEl = document.getElementById('sidebar-educator-name');
    const instEl = document.getElementById('sidebar-educator-inst');
    const headerNameEl = document.getElementById('header-educator-name');
    const hasName = Boolean(prof?.name && prof.name.trim().length > 0);
    const hasInst = Boolean(prof?.institution && prof.institution.trim().length > 0);

    if (nameEl) nameEl.textContent = hasName ? prof.name : 'Educator Profile';
    if (instEl) instEl.textContent = hasInst ? prof.institution : 'Institution Not Set';
    if (headerNameEl) headerNameEl.textContent = hasName ? prof.name : 'Educator';
  };
  updateSidebarProfile();

  // Update header and mobile user authentication status
  const updateAuthUI = () => {
    const user = store.getCurrentUser();
    const isAdmin = store.isAdmin();

    const usernameDisplay = document.getElementById('header-username-display');
    const roleBadge = document.getElementById('header-role-badge');
    const avatar = document.getElementById('header-user-avatar');
    const dropdownUsername = document.getElementById('dropdown-username-text');
    const dropdownRole = document.getElementById('dropdown-role-text');
    const adminMenuItem = document.getElementById('menu-item-admin');
    const changePassItem = document.getElementById('menu-item-change-pass');
    const logoutSection = document.getElementById('dropdown-logout-section');
    const switchLabel = document.getElementById('menu-switch-label');

    const mobileUsername = document.getElementById('mobile-username-text');
    const mobileRole = document.getElementById('mobile-user-role');
    const mobileAvatar = document.getElementById('mobile-user-avatar');
    const mobileAuthAction = document.getElementById('mobile-auth-action-btn');
    const mobileExtraActions = document.getElementById('mobile-auth-extra-actions');
    const mobileAdminBtn = document.getElementById('mobile-admin-console-btn');

    if (user && user.username) {
      if (usernameDisplay) usernameDisplay.textContent = user.username;
      if (dropdownUsername) dropdownUsername.textContent = user.username;
      if (mobileUsername) mobileUsername.textContent = user.username;

      if (isAdmin) {
        if (roleBadge) {
          roleBadge.textContent = 'Admin';
          roleBadge.className = 'px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
          roleBadge.classList.remove('hidden');
        }
        if (avatar) {
          avatar.className = 'w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs shrink-0';
          avatar.textContent = '👑';
        }
        if (mobileAvatar) {
          mobileAvatar.className = 'w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs';
          mobileAvatar.textContent = '👑';
        }
        if (dropdownRole) dropdownRole.textContent = 'System Administrator';
        if (mobileRole) mobileRole.textContent = 'System Administrator';
        if (adminMenuItem) adminMenuItem.classList.remove('hidden');
        if (mobileAdminBtn) mobileAdminBtn.classList.remove('hidden');
      } else {
        if (roleBadge) roleBadge.classList.add('hidden');
        if (avatar) {
          avatar.className = 'w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs shrink-0';
          avatar.textContent = user.username.charAt(0).toUpperCase();
        }
        if (mobileAvatar) {
          mobileAvatar.className = 'w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs';
          mobileAvatar.textContent = user.username.charAt(0).toUpperCase();
        }
        if (dropdownRole) dropdownRole.textContent = 'Educator Workspace';
        if (mobileRole) mobileRole.textContent = 'Educator Workspace';
        if (adminMenuItem) adminMenuItem.classList.add('hidden');
        if (mobileAdminBtn) mobileAdminBtn.classList.add('hidden');
      }

      if (changePassItem) changePassItem.classList.remove('hidden');
      if (logoutSection) logoutSection.classList.remove('hidden');
      if (switchLabel) switchLabel.textContent = 'Switch Account';
      if (mobileAuthAction) mobileAuthAction.textContent = 'Switch';
      if (mobileExtraActions) mobileExtraActions.classList.remove('hidden');
    } else {
      if (usernameDisplay) usernameDisplay.textContent = 'Sign In';
      if (roleBadge) roleBadge.classList.add('hidden');
      if (avatar) {
        avatar.className = 'w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shadow-2xs shrink-0';
        avatar.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;
      }
      if (mobileAvatar) {
        mobileAvatar.className = 'w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs';
        mobileAvatar.textContent = '👤';
      }
      if (dropdownUsername) dropdownUsername.textContent = 'Guest User';
      if (dropdownRole) dropdownRole.textContent = 'Not authenticated';
      if (mobileUsername) mobileUsername.textContent = 'Guest User';
      if (mobileRole) mobileRole.textContent = 'Not authenticated';
      if (adminMenuItem) adminMenuItem.classList.add('hidden');
      if (changePassItem) changePassItem.classList.add('hidden');
      if (logoutSection) logoutSection.classList.add('hidden');
      if (switchLabel) switchLabel.textContent = 'Sign In / Create Account';
      if (mobileAuthAction) mobileAuthAction.textContent = 'Sign In';
      if (mobileExtraActions) mobileExtraActions.classList.add('hidden');
      if (mobileAdminBtn) mobileAdminBtn.classList.add('hidden');
    }
  };
  updateAuthUI();

  // User dropdown toggle
  const userBtn = document.getElementById('header-user-btn');
  const userDropdown = document.getElementById('header-user-dropdown');
  userBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown?.classList.toggle('hidden');
  });
  document.addEventListener('click', (e) => {
    if (!userDropdown?.contains(e.target) && !userBtn?.contains(e.target)) {
      userDropdown?.classList.add('hidden');
    }
  });

  document.getElementById('menu-item-profile')?.addEventListener('click', () => {
    userDropdown?.classList.add('hidden');
    navigateTo('settings', 'general');
  });

  document.getElementById('menu-item-admin')?.addEventListener('click', () => {
    userDropdown?.classList.add('hidden');
    navigateTo('admin');
  });

  document.getElementById('menu-item-change-pass')?.addEventListener('click', () => {
    userDropdown?.classList.add('hidden');
    navigateTo('settings', 'general');
  });

  document.getElementById('menu-item-switch-account')?.addEventListener('click', () => {
    userDropdown?.classList.add('hidden');
    openAuthModal({
      showToast,
      onSuccess: () => {
        updateAuthUI();
        updateSidebarProfile();
        renderCurrentView();
      }
    });
  });

  document.getElementById('menu-item-logout')?.addEventListener('click', () => {
    userDropdown?.classList.add('hidden');
    store.logoutUser();
    showToast('✓ Successfully signed out of PEDAIA.', 'info');
    updateAuthUI();
    updateSidebarProfile();
    renderCurrentView();
  });

  // Mobile drawer auth actions
  document.getElementById('mobile-auth-action-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    openAuthModal({
      showToast,
      onSuccess: () => {
        updateAuthUI();
        updateSidebarProfile();
        renderCurrentView();
      }
    });
  });

  document.getElementById('mobile-admin-console-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    navigateTo('admin');
  });

  document.getElementById('mobile-logout-btn')?.addEventListener('click', () => {
    closeMobileSidebar();
    store.logoutUser();
    showToast('✓ Successfully signed out.', 'info');
    updateAuthUI();
    updateSidebarProfile();
    renderCurrentView();
  });

  store.subscribe((evt) => {
    if (evt === 'settingsUpdated' || evt === 'profileUpdated' || evt === 'userSwitched' || evt === 'sessionChanged') {
      updateSidebarProfile();
      updateAuthUI();
      updateApiStatusIndicator();
      updateHeaderPalette();
    }
    if (evt === 'paletteChanged' || evt === 'themeChanged') {
      updateHeaderPalette();
    }
  });

  // Listen to OS-level theme preference shifts or manual mode switches
  window.addEventListener('pedaia-theme-changed', () => {
    updateHeaderPalette();
  });

  // Check initial API status
  await aiService.checkServerStatus();
  updateApiStatusIndicator();

  // Route from URL hash if present
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash) {
    const parts = hash.split('/');
    navigateTo(parts[0], parts[1]);
  } else {
    navigateTo('dashboard');
  }

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace(/^#\/?/, '');
    const parts = h.split('/');
    if (parts[0] && parts[0] !== currentRoute) {
      navigateTo(parts[0], parts[1]);
    }
  });
});
