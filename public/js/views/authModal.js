// PEDAIA Authentication Modal Component
// Supports standard Log In and Create Account functionality with strict isolation from Educator Profile.
import { store } from '../state.js';

let currentTab = 'login'; // 'login' | 'signup'
let modalCallbacks = null;
let m1n1sumePendingSetup = false;

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Open the Universal Auth Modal
 * @param {Object} options - { defaultTab, showToast, onSuccess }
 */
export function openAuthModal(options = {}) {
  const { defaultTab = 'login', showToast = window.showToast || (() => {}), onSuccess = null } = options;
  currentTab = (defaultTab === 'signup' || defaultTab === 'register') ? 'signup' : 'login';
  modalCallbacks = { showToast, onSuccess };
  m1n1sumePendingSetup = false;

  const existing = document.getElementById('auth-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'auth-modal-overlay';
  overlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in';
  overlay.innerHTML = renderAuthModalHtml();
  document.body.appendChild(overlay);

  setupAuthModalListeners(overlay);
}

export function closeAuthModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) overlay.remove();
  m1n1sumePendingSetup = false;
}

function renderAuthModalHtml() {
  return `
    <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 relative transition-all my-8">
      
      <!-- Close Button -->
      <button id="close-auth-modal-btn" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Close">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Brand Header -->
      <div class="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold font-scholarly text-slate-900 dark:text-white">PEDAIA Account Access</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Secure instructional design & creative output atelier</p>
      </div>

      <!-- Navigation Tabs (Only standard Log In and Create Account) -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 text-xs font-semibold">
        <button id="auth-tab-btn-login" class="flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${currentTab === 'login' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
          Log In
        </button>
        <button id="auth-tab-btn-signup" class="flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${currentTab === 'signup' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
          Create Account
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="auth-tab-content">
        ${currentTab === 'signup' ? renderSignUpTab() : renderLoginTab()}
      </div>

    </div>
  `;
}

function renderLoginTab() {
  if (m1n1sumePendingSetup) {
    return renderM1n1sumePasswordSetupForm();
  }

  return `
    <form id="auth-login-form" class="space-y-4">
      
      <!-- Username or Email Field -->
      <div>
        <label for="login-identifier" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Username or Email
        </label>
        <div class="relative">
          <input 
            type="text" 
            id="login-identifier" 
            name="identifier" 
            required 
            autocomplete="username" 
            placeholder="Enter your username or email address..." 
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <!-- Password Field with Visibility Toggle -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="login-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <button type="button" id="toggle-login-password-visibility" class="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            👁️ Show Password
          </button>
        </div>
        <input 
          type="password" 
          id="login-password" 
          name="password" 
          required 
          autocomplete="current-password" 
          placeholder="Enter your account password..." 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Error Banner (Hidden by default) -->
      <div id="login-error-banner" class="hidden p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        id="login-submit-btn" 
        class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>Log In</span>
      </button>

      <!-- Switch to Create Account link -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>Don't have an account yet?</span>
        <button type="button" id="switch-to-signup-link" class="text-indigo-600 dark:text-indigo-400 hover:underline font-bold ml-1 cursor-pointer">
          Create Account
        </button>
      </div>

    </form>
  `;
}

// Seamless Inline First-Time Password Setup for Administrator M1n1sume
function renderM1n1sumePasswordSetupForm() {
  return `
    <form id="m1n1sume-setup-form" class="space-y-4">
      
      <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200">
        <p class="font-bold flex items-center gap-1.5 mb-1">
          <span>👑</span>
          <span>Administrator Account Initialization</span>
        </p>
        <p class="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
          Welcome, <strong>M1n1sume</strong>. Please establish your master password to complete initialization of your administrator account.
        </p>
      </div>

      <!-- Account Username (Read-only display) -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Administrator Username
        </label>
        <input 
          type="text" 
          value="M1n1sume" 
          disabled 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold cursor-not-allowed"
        />
      </div>

      <!-- Master Password Field -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="admin-master-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Create Master Password
          </label>
          <button type="button" id="toggle-admin-password-visibility" class="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            👁️ Show
          </button>
        </div>
        <input 
          type="password" 
          id="admin-master-password" 
          name="masterPassword" 
          required 
          autocomplete="new-password" 
          placeholder="Minimum 6 characters..." 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Confirm Master Password Field -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="admin-confirm-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Confirm Master Password
          </label>
          <button type="button" id="toggle-admin-confirm-visibility" class="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            👁️ Show
          </button>
        </div>
        <input 
          type="password" 
          id="admin-confirm-password" 
          name="confirmMasterPassword" 
          required 
          autocomplete="new-password" 
          placeholder="Re-enter your master password..." 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Error Banner -->
      <div id="admin-setup-error-banner" class="hidden p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
      </div>

      <!-- Submit Button -->
      <div class="flex items-center gap-2 pt-1">
        <button 
          type="button" 
          id="cancel-admin-setup-btn" 
          class="py-2.5 px-3.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          id="admin-setup-submit-btn" 
          class="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Set Master Password &amp; Log In</span>
        </button>
      </div>

    </form>
  `;
}

function renderSignUpTab() {
  return `
    <form id="auth-signup-form" class="space-y-3.5">
      
      <!-- Username Field -->
      <div>
        <label for="signup-username" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Username <span class="text-rose-500">*</span>
        </label>
        <input 
          type="text" 
          id="signup-username" 
          name="username" 
          required 
          autocomplete="username" 
          placeholder="e.g. educator_maria" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
        <p class="text-[10px] text-slate-400 mt-1">3–30 characters, letters, numbers, underscores, hyphens, and periods.</p>
      </div>

      <!-- Email Address Field -->
      <div>
        <label for="signup-email" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Email Address <span class="text-rose-500">*</span>
        </label>
        <input 
          type="email" 
          id="signup-email" 
          name="email" 
          required 
          autocomplete="email" 
          placeholder="e.g. maria@school.edu" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Password Field with Toggle -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="signup-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Password <span class="text-rose-500">*</span>
          </label>
          <button type="button" id="toggle-signup-password-visibility" class="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            👁️ Show
          </button>
        </div>
        <input 
          type="password" 
          id="signup-password" 
          name="password" 
          required 
          autocomplete="new-password" 
          placeholder="Minimum 6 characters..." 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Confirm Password Field with Toggle -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="signup-confirm-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Confirm Password <span class="text-rose-500">*</span>
          </label>
          <button type="button" id="toggle-signup-confirm-visibility" class="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            👁️ Show
          </button>
        </div>
        <input 
          type="password" 
          id="signup-confirm-password" 
          name="confirmPassword" 
          required 
          autocomplete="new-password" 
          placeholder="Re-enter password to confirm..." 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Account Separation Notice -->
      <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[10px] text-slate-500 dark:text-slate-400">
        🔒 <strong>Account Privacy:</strong> Your login credentials are strictly isolated from your Educator Profile details. New accounts start with a clean, blank profile.
      </div>

      <!-- Error Banner (Hidden by default) -->
      <div id="signup-error-banner" class="hidden p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
      </div>

      <!-- Success Confirmation Banner (Hidden by default) -->
      <div id="signup-success-banner" class="hidden p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        id="signup-submit-btn" 
        class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span>Create Account</span>
      </button>

      <!-- Switch to Log In link -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>Already have an account?</span>
        <button type="button" id="switch-to-login-link" class="text-indigo-600 dark:text-indigo-400 hover:underline font-bold ml-1 cursor-pointer">
          Log In
        </button>
      </div>

    </form>
  `;
}

function setupAuthModalListeners(overlay) {
  // Close triggers
  overlay.querySelector('#close-auth-modal-btn')?.addEventListener('click', closeAuthModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAuthModal();
  });

  // Tab switching
  const tabLogin = overlay.querySelector('#auth-tab-btn-login');
  const tabSignup = overlay.querySelector('#auth-tab-btn-signup');

  const switchTab = (tab) => {
    currentTab = tab;
    m1n1sumePendingSetup = false;
    const content = overlay.querySelector('#auth-tab-content');
    if (!content) return;

    if (tab === 'signup') {
      content.innerHTML = renderSignUpTab();
      tabSignup?.classList.add('bg-white', 'dark:bg-slate-700', 'text-indigo-600', 'dark:text-white', 'shadow-2xs');
      tabSignup?.classList.remove('text-slate-600', 'dark:text-slate-400');
      tabLogin?.classList.remove('bg-white', 'dark:bg-slate-700', 'text-indigo-600', 'dark:text-white', 'shadow-2xs');
      tabLogin?.classList.add('text-slate-600', 'dark:text-slate-400');
      setupSignUpFormListeners(overlay);
    } else {
      content.innerHTML = renderLoginTab();
      tabLogin?.classList.add('bg-white', 'dark:bg-slate-700', 'text-indigo-600', 'dark:text-white', 'shadow-2xs');
      tabLogin?.classList.remove('text-slate-600', 'dark:text-slate-400');
      tabSignup?.classList.remove('bg-white', 'dark:bg-slate-700', 'text-indigo-600', 'dark:text-white', 'shadow-2xs');
      tabSignup?.classList.add('text-slate-600', 'dark:text-slate-400');
      setupLoginFormListeners(overlay);
    }
  };

  tabLogin?.addEventListener('click', () => switchTab('login'));
  tabSignup?.addEventListener('click', () => switchTab('signup'));

  if (currentTab === 'signup') {
    setupSignUpFormListeners(overlay);
  } else {
    setupLoginFormListeners(overlay);
  }
}

function setupLoginFormListeners(overlay) {
  const form = overlay.querySelector('#auth-login-form');
  const errorBanner = overlay.querySelector('#login-error-banner');
  const togglePassBtn = overlay.querySelector('#toggle-login-password-visibility');
  const passInput = overlay.querySelector('#login-password');
  const switchLink = overlay.querySelector('#switch-to-signup-link');

  // Password visibility toggle
  togglePassBtn?.addEventListener('click', () => {
    if (passInput) {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      togglePassBtn.textContent = isPass ? '🙈 Hide Password' : '👁️ Show Password';
    }
  });

  // Switch to sign up link
  switchLink?.addEventListener('click', () => {
    const tabSignup = overlay.querySelector('#auth-tab-btn-signup');
    tabSignup?.click();
  });

  // Submit handler
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBanner) errorBanner.classList.add('hidden');

    const identifierInput = form.querySelector('#login-identifier');
    const identifier = identifierInput ? identifierInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!identifier) {
      if (errorBanner) {
        errorBanner.textContent = 'Please enter your username or email address.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    const submitBtn = form.querySelector('#login-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Verifying credentials...</span>';
    }

    try {
      const result = await store.loginUser({ identifier, password });

      // Check if this is uninitialized M1n1sume
      if (result && result.requiresMasterPasswordSetup) {
        m1n1sumePendingSetup = true;
        const content = overlay.querySelector('#auth-tab-content');
        if (content) {
          content.innerHTML = renderM1n1sumePasswordSetupForm();
          setupM1n1sumeSetupListeners(overlay);
        }
        return;
      }

      if (modalCallbacks?.showToast) {
        modalCallbacks.showToast(`✓ Welcome back, ${result.user?.username || 'Educator'}!`, 'success');
      }
      if (modalCallbacks?.onSuccess) {
        modalCallbacks.onSuccess(result.user);
      }
      closeAuthModal();
    } catch (err) {
      if (errorBanner) {
        errorBanner.textContent = err.message || 'Login failed. Please check your credentials.';
        errorBanner.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>Log In</span>
        `;
      }
    }
  });
}

function setupM1n1sumeSetupListeners(overlay) {
  const form = overlay.querySelector('#m1n1sume-setup-form');
  const errorBanner = overlay.querySelector('#admin-setup-error-banner');
  const passInput = overlay.querySelector('#admin-master-password');
  const confirmInput = overlay.querySelector('#admin-confirm-password');
  const togglePass = overlay.querySelector('#toggle-admin-password-visibility');
  const toggleConfirm = overlay.querySelector('#toggle-admin-confirm-visibility');
  const cancelBtn = overlay.querySelector('#cancel-admin-setup-btn');

  togglePass?.addEventListener('click', () => {
    if (passInput) {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      togglePass.textContent = isPass ? '🙈 Hide' : '👁️ Show';
    }
  });

  toggleConfirm?.addEventListener('click', () => {
    if (confirmInput) {
      const isPass = confirmInput.type === 'password';
      confirmInput.type = isPass ? 'text' : 'password';
      toggleConfirm.textContent = isPass ? '🙈 Hide' : '👁️ Show';
    }
  });

  cancelBtn?.addEventListener('click', () => {
    m1n1sumePendingSetup = false;
    const content = overlay.querySelector('#auth-tab-content');
    if (content) {
      content.innerHTML = renderLoginTab();
      setupLoginFormListeners(overlay);
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBanner) errorBanner.classList.add('hidden');

    const masterPassword = passInput ? passInput.value : '';
    const confirmMasterPassword = confirmInput ? confirmInput.value : '';

    if (!masterPassword || masterPassword.length < 6) {
      if (errorBanner) {
        errorBanner.textContent = 'Master password must be at least 6 characters.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }
    if (masterPassword !== confirmMasterPassword) {
      if (errorBanner) {
        errorBanner.textContent = 'Master password and confirmation do not match.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    const submitBtn = form.querySelector('#admin-setup-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Establishing Master Password...</span>';
    }

    try {
      const result = await store.loginUser({
        identifier: 'M1n1sume',
        isFirstTimeAdmin: true,
        masterPassword,
        confirmMasterPassword
      });

      if (modalCallbacks?.showToast) {
        modalCallbacks.showToast('✓ Master administrator password established. Welcome M1n1sume!', 'success');
      }
      if (modalCallbacks?.onSuccess) {
        modalCallbacks.onSuccess(result.user);
      }
      closeAuthModal();
    } catch (err) {
      if (errorBanner) {
        errorBanner.textContent = err.message || 'Failed to establish administrator password.';
        errorBanner.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Set Master Password &amp; Log In</span>';
      }
    }
  });
}

function setupSignUpFormListeners(overlay) {
  const form = overlay.querySelector('#auth-signup-form');
  const errorBanner = overlay.querySelector('#signup-error-banner');
  const successBanner = overlay.querySelector('#signup-success-banner');
  const userInput = overlay.querySelector('#signup-username');
  const emailInput = overlay.querySelector('#signup-email');
  const passInput = overlay.querySelector('#signup-password');
  const confirmInput = overlay.querySelector('#signup-confirm-password');
  const togglePass = overlay.querySelector('#toggle-signup-password-visibility');
  const toggleConfirm = overlay.querySelector('#toggle-signup-confirm-visibility');
  const switchLink = overlay.querySelector('#switch-to-login-link');

  togglePass?.addEventListener('click', () => {
    if (passInput) {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      togglePass.textContent = isPass ? '🙈 Hide' : '👁️ Show';
    }
  });

  toggleConfirm?.addEventListener('click', () => {
    if (confirmInput) {
      const isPass = confirmInput.type === 'password';
      confirmInput.type = isPass ? 'text' : 'password';
      toggleConfirm.textContent = isPass ? '🙈 Hide' : '👁️ Show';
    }
  });

  switchLink?.addEventListener('click', () => {
    const tabLogin = overlay.querySelector('#auth-tab-btn-login');
    tabLogin?.click();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBanner) errorBanner.classList.add('hidden');
    if (successBanner) successBanner.classList.add('hidden');

    const username = userInput ? userInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const confirmPassword = confirmInput ? confirmInput.value : '';

    // Enforce reserved administrator account check immediately on client
    if (username.toLowerCase() === 'm1n1sume') {
      if (errorBanner) {
        errorBanner.textContent = 'The username "M1n1sume" is reserved for the designated administrator. Please log in using the Log In form.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    if (username.length < 3 || username.length > 30) {
      if (errorBanner) {
        errorBanner.textContent = 'Username must be between 3 and 30 characters.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      if (errorBanner) {
        errorBanner.textContent = 'Username may only contain letters, numbers, underscores, hyphens, and periods.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (errorBanner) {
        errorBanner.textContent = 'Please enter a valid email address.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    if (!password || password.length < 6) {
      if (errorBanner) {
        errorBanner.textContent = 'Password must be at least 6 characters.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    if (password !== confirmPassword) {
      if (errorBanner) {
        errorBanner.textContent = 'Password and Confirm Password do not match.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    const submitBtn = form.querySelector('#signup-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Creating your account...</span>';
    }

    try {
      const result = await store.registerUser({
        username,
        email,
        password,
        confirmPassword
      });

      if (successBanner) {
        successBanner.textContent = `✓ Account created successfully! Welcome to PEDAIA, ${result.user?.username}. Proceeding...`;
        successBanner.classList.remove('hidden');
      }

      if (modalCallbacks?.showToast) {
        modalCallbacks.showToast(`✓ Account created successfully! Welcome to PEDAIA, ${result.user?.username}.`, 'success');
      }

      setTimeout(() => {
        if (modalCallbacks?.onSuccess) {
          modalCallbacks.onSuccess(result.user);
        }
        closeAuthModal();
      }, 700);
    } catch (err) {
      if (errorBanner) {
        errorBanner.textContent = err.message || 'Registration failed. Please try again.';
        errorBanner.classList.remove('hidden');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Create Account</span>
        `;
      }
    }
  });
}
