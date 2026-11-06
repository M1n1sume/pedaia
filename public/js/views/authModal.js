// PEDAIA Authentication Modal Component
// Supports Sign In, Sign Up (with credentials distinct from profile), and M1n1sume Master Admin Setup

import { store } from '../state.js';

let currentTab = 'login'; // 'login' | 'signup' | 'admin-setup'
let modalCallbacks = null;

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
  currentTab = defaultTab;
  modalCallbacks = { showToast, onSuccess };

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
}

function renderAuthModalHtml() {
  const isM1n1sumeNeedsSetup = !store.isM1n1sumeInitialized();

  return `
    <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 relative transition-all my-8">
      
      <!-- Close Button -->
      <button id="close-auth-modal-btn" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Close">
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
        <h2 class="text-xl font-bold font-scholarly text-slate-900 dark:text-white">PEDAIA Authentication</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Secure pedagogical workspace & curriculum atelier</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 text-xs font-semibold">
        <button id="auth-tab-btn-login" class="flex-1 py-2 text-center rounded-lg transition-all ${currentTab === 'login' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
          Log In
        </button>
        <button id="auth-tab-btn-signup" class="flex-1 py-2 text-center rounded-lg transition-all ${currentTab === 'signup' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
          Create Account
        </button>
        ${isM1n1sumeNeedsSetup ? `
          <button id="auth-tab-btn-admin-setup" class="flex-1 py-2 text-center rounded-lg transition-all text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold ${currentTab === 'admin-setup' ? 'bg-amber-100 dark:bg-amber-950/80 shadow-2xs' : ''}">
            👑 Admin Setup
          </button>
        ` : ''}
      </div>

      <!-- Tab Content Area -->
      <div id="auth-tab-content">
        ${currentTab === 'signup' ? renderSignUpTab() : currentTab === 'admin-setup' ? renderAdminSetupTab() : renderLoginTab()}
      </div>

    </div>
  `;
}

function renderLoginTab() {
  const isM1n1sumeNeedsSetup = !store.isM1n1sumeInitialized();

  return `
    <form id="auth-login-form" class="space-y-4">
      
      <!-- Username Field -->
      <div>
        <label for="login-username" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Username
        </label>
        <div class="relative">
          <input 
            type="text" 
            id="login-username" 
            name="username" 
            required 
            autocomplete="username" 
            placeholder="e.g. M1n1sume or your_username" 
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <!-- Password Field -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="login-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <button type="button" id="toggle-login-password-visibility" class="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Show Password
          </button>
        </div>
        <input 
          type="password" 
          id="login-password" 
          name="password" 
          required 
          autocomplete="current-password" 
          placeholder="Enter your password..." 
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
        <span>Sign In to PEDAIA</span>
      </button>

      ${isM1n1sumeNeedsSetup ? `
        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <span class="text-amber-600 text-sm">👑</span>
          <div>
            <strong>Admin Note:</strong> Account <code>M1n1sume</code> is designated as Administrator. 
            <button type="button" id="switch-to-admin-setup-btn" class="font-bold underline text-amber-900 dark:text-amber-100 hover:text-amber-700 ml-1">
              Set your master password now &rarr;
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Bottom Switcher -->
      <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        Don't have an account? 
        <button type="button" id="switch-to-signup-btn" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
          Create Account
        </button>
      </div>

    </form>
  `;
}

function renderSignUpTab() {
  return `
    <form id="auth-signup-form" class="space-y-4">
      
      <!-- Privacy & Separation Callout Banner -->
      <div class="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <div class="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 mb-1">
          <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Credentials & Profile Separation</span>
        </div>
        Your <strong>username and password</strong> are authentication credentials used solely to sign in. They are kept private and distinct from your public <strong>Educator Profile</strong> (Name, Title, Institution).
      </div>

      <!-- Username Field -->
      <div>
        <label for="signup-username" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Login Username <span class="text-rose-500">*</span>
        </label>
        <input 
          type="text" 
          id="signup-username" 
          name="username" 
          required 
          autocomplete="username" 
          placeholder="e.g. teacher_john or prof_maria" 
          minlength="3" 
          maxlength="30" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
        <p class="text-[10px] text-slate-400 mt-1">3–30 characters, letters, numbers, hyphens, and underscores only.</p>
      </div>

      <!-- Password Field -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="signup-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Password <span class="text-rose-500">*</span>
          </label>
          <span id="signup-password-strength" class="text-[10px] font-mono font-semibold text-slate-400">Min 6 chars</span>
        </div>
        <input 
          type="password" 
          id="signup-password" 
          name="password" 
          required 
          autocomplete="new-password" 
          placeholder="Create a secure password..." 
          minlength="6" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Confirm Password Field -->
      <div>
        <label for="signup-confirm-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Confirm Password <span class="text-rose-500">*</span>
        </label>
        <input 
          type="password" 
          id="signup-confirm-password" 
          name="confirmPassword" 
          required 
          autocomplete="new-password" 
          placeholder="Re-enter your password..." 
          minlength="6" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Optional Educator Full Name (Separate profile field) -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label for="signup-profile-name" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Educator Profile Full Name <span class="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input 
          type="text" 
          id="signup-profile-name" 
          name="profileName" 
          placeholder="e.g. Dr. John Teacher (can be configured later)" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
        <p class="text-[10px] text-slate-400 mt-1">This name will appear on your curriculum dossiers. Defaults to blank if omitted.</p>
      </div>

      <!-- Error Banner (Hidden by default) -->
      <div id="signup-error-banner" class="hidden p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
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
        <span>Complete Registration</span>
      </button>

      <!-- Bottom Switcher -->
      <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        Already have an account? 
        <button type="button" id="switch-to-login-btn" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
          Sign In
        </button>
      </div>

    </form>
  `;
}

function renderAdminSetupTab() {
  return `
    <form id="auth-admin-setup-form" class="space-y-4 animate-fade-in">
      
      <!-- Admin Atelier Welcome Card -->
      <div class="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <div class="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200 mb-1.5 text-sm">
          <span>👑</span>
          <span>Master Administrator Setup — M1n1sume</span>
        </div>
        <p>
          Welcome, <strong>M1n1sume</strong>. As the designated System Administrator of PEDAIA, please create your master administrator password.
        </p>
        <p class="mt-1 text-[11px] text-amber-700 dark:text-amber-300 font-mono">
          • Grants full access to Admin Console, user management, and system audits.<br/>
          • Stored with cryptographic SHA-256 salt; never transmitted or saved in plaintext.
        </p>
      </div>

      <!-- Master Password Field -->
      <div>
        <label for="admin-master-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Create Master Password <span class="text-rose-500">*</span>
        </label>
        <input 
          type="password" 
          id="admin-master-password" 
          name="masterPassword" 
          required 
          autocomplete="new-password" 
          placeholder="Enter your master password..." 
          minlength="4" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Confirm Master Password Field -->
      <div>
        <label for="admin-confirm-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Confirm Master Password <span class="text-rose-500">*</span>
        </label>
        <input 
          type="password" 
          id="admin-confirm-password" 
          name="confirmPassword" 
          required 
          autocomplete="new-password" 
          placeholder="Re-enter master password to confirm..." 
          minlength="4" 
          class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <!-- Error Banner (Hidden by default) -->
      <div id="admin-setup-error-banner" class="hidden p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        id="admin-setup-submit-btn" 
        class="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>👑 Initialize Administrator M1n1sume</span>
      </button>

      <!-- Bottom Switcher -->
      <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        Return to standard 
        <button type="button" id="switch-to-login-from-admin-btn" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
          Sign In
        </button>
      </div>

    </form>
  `;
}

function setupAuthModalListeners(overlay) {
  if (!overlay) return;

  const toast = modalCallbacks?.showToast || window.showToast || (() => {});
  const onSuccess = modalCallbacks?.onSuccess || (() => {});

  // Close handlers
  overlay.querySelector('#close-auth-modal-btn')?.addEventListener('click', closeAuthModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAuthModal();
  });

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      window.removeEventListener('keydown', handleEsc);
    }
  };
  window.addEventListener('keydown', handleEsc);

  // Switch tabs
  const switchTab = (tab) => {
    currentTab = tab;
    const content = overlay.querySelector('#auth-tab-content');
    if (content) {
      if (tab === 'signup') content.innerHTML = renderSignUpTab();
      else if (tab === 'admin-setup') content.innerHTML = renderAdminSetupTab();
      else content.innerHTML = renderLoginTab();
    }
    // Update active tab buttons styling
    const btnLogin = overlay.querySelector('#auth-tab-btn-login');
    const btnSignup = overlay.querySelector('#auth-tab-btn-signup');
    const btnAdmin = overlay.querySelector('#auth-tab-btn-admin-setup');

    if (btnLogin) {
      btnLogin.className = `flex-1 py-2 text-center rounded-lg transition-all ${tab === 'login' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`;
    }
    if (btnSignup) {
      btnSignup.className = `flex-1 py-2 text-center rounded-lg transition-all ${tab === 'signup' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`;
    }
    if (btnAdmin) {
      btnAdmin.className = `flex-1 py-2 text-center rounded-lg transition-all text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold ${tab === 'admin-setup' ? 'bg-amber-100 dark:bg-amber-950/80 shadow-2xs' : ''}`;
    }

    rebindTabForms();
  };

  overlay.querySelector('#auth-tab-btn-login')?.addEventListener('click', () => switchTab('login'));
  overlay.querySelector('#auth-tab-btn-signup')?.addEventListener('click', () => switchTab('signup'));
  overlay.querySelector('#auth-tab-btn-admin-setup')?.addEventListener('click', () => switchTab('admin-setup'));

  function rebindTabForms() {
    // -------------------------------------------------------------
    // Tab Switches from inner links
    // -------------------------------------------------------------
    overlay.querySelector('#switch-to-signup-btn')?.addEventListener('click', () => switchTab('signup'));
    overlay.querySelector('#switch-to-login-btn')?.addEventListener('click', () => switchTab('login'));
    overlay.querySelector('#switch-to-admin-setup-btn')?.addEventListener('click', () => switchTab('admin-setup'));
    overlay.querySelector('#switch-to-login-from-admin-btn')?.addEventListener('click', () => switchTab('login'));

    // Toggle password visibility
    const togglePassBtn = overlay.querySelector('#toggle-login-password-visibility');
    const passInput = overlay.querySelector('#login-password');
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        togglePassBtn.textContent = isPass ? 'Hide Password' : 'Show Password';
      });
    }

    // -------------------------------------------------------------
    // LOGIN FORM SUBMISSION
    // -------------------------------------------------------------
    const loginForm = overlay.querySelector('#auth-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errBanner = overlay.querySelector('#login-error-banner');
        if (errBanner) errBanner.classList.add('hidden');

        const username = overlay.querySelector('#login-username')?.value?.trim();
        const password = overlay.querySelector('#login-password')?.value;
        const submitBtn = overlay.querySelector('#login-submit-btn');

        if (!username || !password) {
          showError(errBanner, 'Please enter both your username and password.');
          return;
        }

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70');
            submitBtn.textContent = 'Verifying credentials...';
          }

          const res = await store.loginUser({ username, password });

          if (res.requiresAdminSetup) {
            toast(res.message, 'warning');
            switchTab('admin-setup');
            return;
          }

          if (res.success) {
            const roleBadge = res.user.role === 'admin' ? '👑 Admin' : 'Educator';
            toast(`✓ Welcome back, ${res.user.username} (${roleBadge})!`, 'success');
            closeAuthModal();
            onSuccess(res.user);
          }
        } catch (err) {
          showError(errBanner, err.message || 'Login failed. Please check credentials.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70');
            submitBtn.innerHTML = `
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In to PEDAIA</span>
            `;
          }
        }
      });
    }

    // -------------------------------------------------------------
    // SIGN UP FORM SUBMISSION
    // -------------------------------------------------------------
    const signupForm = overlay.querySelector('#auth-signup-form');
    if (signupForm) {
      // Live password matching check
      const signupPass = overlay.querySelector('#signup-password');
      const signupConfirm = overlay.querySelector('#signup-confirm-password');
      const strengthIndicator = overlay.querySelector('#signup-password-strength');

      if (signupPass && strengthIndicator) {
        signupPass.addEventListener('input', () => {
          const val = signupPass.value;
          if (val.length === 0) {
            strengthIndicator.textContent = 'Min 6 chars';
            strengthIndicator.className = 'text-[10px] font-mono font-semibold text-slate-400';
          } else if (val.length < 6) {
            strengthIndicator.textContent = 'Too Short';
            strengthIndicator.className = 'text-[10px] font-mono font-semibold text-rose-500';
          } else if (val.length >= 10 && /[A-Z]/.test(val) && /[0-9]/.test(val)) {
            strengthIndicator.textContent = 'Strong ✓';
            strengthIndicator.className = 'text-[10px] font-mono font-semibold text-emerald-500';
          } else {
            strengthIndicator.textContent = 'Good';
            strengthIndicator.className = 'text-[10px] font-mono font-semibold text-amber-500';
          }
        });
      }

      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errBanner = overlay.querySelector('#signup-error-banner');
        if (errBanner) errBanner.classList.add('hidden');

        const username = overlay.querySelector('#signup-username')?.value?.trim();
        const password = signupPass?.value;
        const confirmPass = signupConfirm?.value;
        const profileName = overlay.querySelector('#signup-profile-name')?.value?.trim();
        const submitBtn = overlay.querySelector('#signup-submit-btn');

        if (!username || !password) {
          showError(errBanner, 'Please provide both a username and password.');
          return;
        }

        if (password !== confirmPass) {
          showError(errBanner, 'Passwords do not match. Please re-enter.');
          return;
        }

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70');
            submitBtn.textContent = 'Creating account...';
          }

          const res = await store.registerUser({
            username,
            password,
            initialName: profileName
          });

          if (res.success) {
            toast(`🎉 Welcome to PEDAIA, ${res.user.username}! Your account is ready.`, 'success');
            closeAuthModal();
            onSuccess(res.user);
          }
        } catch (err) {
          showError(errBanner, err.message || 'Registration failed.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70');
            submitBtn.innerHTML = `
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Complete Registration</span>
            `;
          }
        }
      });
    }

    // -------------------------------------------------------------
    // ADMIN SETUP FORM SUBMISSION (M1n1sume)
    // -------------------------------------------------------------
    const adminSetupForm = overlay.querySelector('#auth-admin-setup-form');
    if (adminSetupForm) {
      adminSetupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errBanner = overlay.querySelector('#admin-setup-error-banner');
        if (errBanner) errBanner.classList.add('hidden');

        const masterPass = overlay.querySelector('#admin-master-password')?.value;
        const confirmPass = overlay.querySelector('#admin-confirm-password')?.value;
        const submitBtn = overlay.querySelector('#admin-setup-submit-btn');

        if (!masterPass || masterPass.length < 4) {
          showError(errBanner, 'Master administrator password must be at least 4 characters long.');
          return;
        }

        if (masterPass !== confirmPass) {
          showError(errBanner, 'Passwords do not match. Please verify.');
          return;
        }

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70');
            submitBtn.textContent = 'Initializing administrator...';
          }

          const res = await store.setupAdminPassword(masterPass);

          if (res.success) {
            toast('👑 Master Administrator M1n1sume initialized successfully!', 'success');
            closeAuthModal();
            onSuccess(res.user);
          }
        } catch (err) {
          showError(errBanner, err.message || 'Admin initialization failed.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70');
            submitBtn.innerHTML = `<span>👑 Initialize Administrator M1n1sume</span>`;
          }
        }
      });
    }
  }

  function showError(bannerEl, msg) {
    if (!bannerEl) return;
    bannerEl.textContent = msg;
    bannerEl.classList.remove('hidden');
  }

  rebindTabForms();
}
