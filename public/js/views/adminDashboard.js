// PEDAIA Administrative Atelier & User Management Console
// Dedicated executive dashboard for M1n1sume (Administrator)

import { store } from '../state.js';

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(isoStr) {
  if (!isoStr) return 'Never';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
}

export function renderAdminDashboardView() {
  const currentUser = store.getCurrentUser();
  const isAdmin = store.isAdmin();

  if (!isAdmin) {
    return `
      <div class="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg animate-fade-in">
        <div class="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          🔒
        </div>
        <h2 class="text-lg font-bold font-scholarly text-slate-900 dark:text-white">Administrative Access Required</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          The Administrative Atelier and User Management Directory is restricted to designated administrators (<strong>M1n1sume</strong>).
        </p>
        <div class="mt-6 flex justify-center gap-3">
          <button id="admin-access-login-btn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
            Sign In as Admin M1n1sume
          </button>
          <button id="admin-access-back-btn" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    `;
  }

  const users = store.getAllUsersForAdmin();
  const auditLogs = store.getAdminAuditLogs();
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const educatorUsers = users.filter(u => u.role === 'educator').length;
  const totalDesignsAndOutputs = users.reduce((sum, u) => sum + (u.designsCount || 0) + (u.outputsCount || 0), 0);

  return `
    <div class="space-y-6 max-w-6xl mx-auto animate-fade-in pb-16">
      
      <!-- Top Administrative Banner -->
      <div class="bg-gradient-to-r from-amber-900/20 via-indigo-900/20 to-slate-900/30 dark:from-amber-950/40 dark:via-indigo-950/40 dark:to-slate-900/50 rounded-3xl p-6 sm:p-8 border border-amber-500/30 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25 shrink-0">
              👑
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  System Administrator Atelier
                </span>
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">PEDAIA v2.0 Enterprise</span>
              </div>
              <h1 class="text-2xl font-bold font-scholarly text-slate-900 dark:text-white mt-1">
                Admin Console & User Management
              </h1>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Authenticated as Master Administrator: <strong class="text-amber-700 dark:text-amber-300">M1n1sume</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 shrink-0">
            <button id="admin-create-user-modal-btn" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>+ Add User Account</span>
            </button>
            <button id="admin-export-registry-btn" class="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer" title="Export User Registry JSON">
              <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Registry</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Key Performance Metrics Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Registered Users
          </div>
          <div class="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            ${totalUsers}
          </div>
          <div class="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
            ${educatorUsers} Educators • ${adminUsers} Admin
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Admin Accounts
          </div>
          <div class="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
            <span>👑</span>
            <span>M1n1sume</span>
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Master Administrator
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Platform Artifacts
          </div>
          <div class="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalDesignsAndOutputs}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Designs & AI Studio Outputs
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Security & Encryption
          </div>
          <div class="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Salted SHA-256</span>
          </div>
          <div class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Zero Plaintext Passwords
          </div>
        </div>

      </div>

      <!-- Registered Accounts Directory Table -->
      <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-2xs overflow-hidden">
        
        <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>👥</span>
              <span>Registered User Registry</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">All registered educators and administrators in the PEDAIA workspace</p>
          </div>
          <div class="text-xs font-mono text-slate-400">
            Isolated Workspaces Active
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="py-3 px-4">Account Username</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Educator Profile Name</th>
                <th class="py-3 px-4">Institution</th>
                <th class="py-3 px-4">Materials Created</th>
                <th class="py-3 px-4">Created Date</th>
                <th class="py-3 px-4">Last Login</th>
                <th class="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-750 font-sans">
              ${users.map(u => {
                const isAdminRow = u.role === 'admin';
                const hasProfileName = Boolean(u.profileName && u.profileName.trim().length > 0);
                const hasInstitution = Boolean(u.institution && u.institution.trim().length > 0);

                return `
                  <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-lg ${isAdminRow ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'} flex items-center justify-center text-[10px] font-bold">
                          ${isAdminRow ? '👑' : u.username.charAt(0).toUpperCase()}
                        </span>
                        <span>${escapeHtml(u.username)}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      ${isAdminRow ? `
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Admin
                        </span>
                      ` : `
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Educator
                        </span>
                      `}
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      ${hasProfileName ? escapeHtml(u.profileName) : '<span class="text-slate-400 italic">Not configured</span>'}
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      ${hasInstitution ? escapeHtml(u.institution) : '<span class="text-slate-400 italic">Unspecified</span>'}
                    </td>
                    <td class="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ${(u.designsCount || 0) + (u.outputsCount || 0)} <span class="text-[10px] font-normal text-slate-400">items</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      ${formatDate(u.createdAt)}
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      ${formatDate(u.lastLogin)}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

      </div>

      <!-- Security Audit Trail Log -->
      <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-5 shadow-2xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">📜</span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Administrative Security Audit Trail</h3>
          </div>
          <span class="text-[11px] text-slate-400 font-mono">Last 50 Events</span>
        </div>

        <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
          ${auditLogs.length === 0 ? `
            <div class="p-4 text-center text-xs text-slate-400 italic">No audit events recorded yet.</div>
          ` : auditLogs.map(log => {
            return `
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 text-xs flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${log.action.includes('ADMIN') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">
                    ${log.action}
                  </span>
                  <span class="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    ${log.details?.username ? `User: ${escapeHtml(log.details.username)}` : ''}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono shrink-0">
                  ${formatDate(log.timestamp)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}

export function setupAdminDashboardListeners(container, navigateTo, showToast) {
  if (!container) return;
  const toast = showToast || window.showToast || (() => {});

  // Not admin action buttons
  container.querySelector('#admin-access-login-btn')?.addEventListener('click', async () => {
    const { openAuthModal } = await import('./authModal.js');
    openAuthModal({
      defaultTab: 'login',
      showToast: toast,
      onSuccess: () => navigateTo('admin')
    });
  });

  container.querySelector('#admin-access-back-btn')?.addEventListener('click', () => {
    navigateTo('dashboard');
  });

  // Admin create user button
  container.querySelector('#admin-create-user-modal-btn')?.addEventListener('click', async () => {
    const { openAuthModal } = await import('./authModal.js');
    openAuthModal({
      defaultTab: 'signup',
      showToast: toast,
      onSuccess: () => {
        // Re-render admin view to display new user
        container.innerHTML = renderAdminDashboardView();
        setupAdminDashboardListeners(container, navigateTo, showToast);
      }
    });
  });

  // Export User Registry JSON
  container.querySelector('#admin-export-registry-btn')?.addEventListener('click', () => {
    try {
      const users = store.getAllUsersForAdmin();
      const exportData = {
        exportedBy: 'M1n1sume',
        exportedAt: new Date().toISOString(),
        totalUsers: users.length,
        users
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedaia_user_registry_${new Date().toISOString().substring(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('✓ User registry exported successfully!', 'success');
    } catch (e) {
      toast('Failed to export registry: ' + e.message, 'error');
    }
  });
}
