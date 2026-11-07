// PEDAIA Administrative Atelier & Activity Telemetry Console
// Dedicated executive dashboard for M1n1sume (Administrator)
// Tracks those who accessed the website, logged in, or made educational outputs,
// and manages project email notification telemetry.

import { store } from '../state.js';

let activeTelemetryFilter = 'ALL';
let telemetrySearchQuery = '';
let cachedTelemetryData = null;

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

function formatRelativeTime(isoStr) {
  if (!isoStr) return '';
  try {
    const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return '';
  }
}

function getEventBadge(type) {
  switch (type) {
    case 'WEBSITE_ACCESS':
      return {
        label: 'Website Access',
        icon: '🌐',
        classes: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
      };
    case 'USER_LOGIN':
      return {
        label: 'User Login',
        icon: '🔑',
        classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      };
    case 'USER_LOGOUT':
      return {
        label: 'User Logout',
        icon: '🚪',
        classes: 'bg-slate-150 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
      };
    case 'OUTPUT_CREATED':
      return {
        label: 'Output Created',
        icon: '🎨',
        classes: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800'
      };
    case 'OUTPUT_MODIFIED':
      return {
        label: 'Output Updated',
        icon: '✏️',
        classes: 'bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border-violet-300 dark:border-violet-800'
      };
    case 'PROJECT_SAVED':
      return {
        label: 'Project Saved',
        icon: '🗃️',
        classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
      };
    case 'EMAIL_SENT':
    case 'EMAIL_UPDATE_SENT':
      return {
        label: 'Email Dispatched',
        icon: '📨',
        classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      };
    case 'ADMIN_PURGE':
      return {
        label: 'Logs Reset',
        icon: '🧹',
        classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
      };
    default:
      return {
        label: type,
        icon: '📋',
        classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
      };
  }
}

export function renderAdminDashboardView() {
  const isAdmin = store.isAdmin();

  if (!isAdmin) {
    return `
      <div class="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg animate-fade-in">
        <div class="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          🔒
        </div>
        <h2 class="text-lg font-bold font-scholarly text-slate-900 dark:text-white">Administrative Access Required</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          The Administrative Telemetry & Activity Atelier is strictly restricted to designated administrators (<strong>M1n1sume</strong>).
        </p>
        <div class="mt-6 flex justify-center gap-3">
          <button id="admin-access-login-btn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer">
            Sign In as Admin M1n1sume
          </button>
          <button id="admin-access-back-btn" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer">
            Return to Dashboard
          </button>
        </div>
      </div>
    `;
  }

  const users = store.getAllUsersForAdmin();
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const educatorUsers = users.filter(u => u.role === 'educator').length;
  const totalDesignsAndOutputs = users.reduce((sum, u) => sum + (u.designsCount || 0) + (u.outputsCount || 0), 0);

  const telemetry = cachedTelemetryData || {
    logs: store.getAdminAuditLogs().map(a => ({
      id: a.id,
      type: a.action,
      username: a.details?.username || 'User',
      details: a.details,
      timestamp: a.timestamp,
      ip: '127.0.0.1'
    })),
    total: 0,
    stats: {
      totalVisits: 1,
      uniqueVisitors: 1,
      totalLogins: 1,
      totalOutputs: totalDesignsAndOutputs,
      totalEmails: 0
    }
  };

  const stats = telemetry.stats || {};
  let logsToDisplay = telemetry.logs || [];

  // Filter logs by tab
  if (activeTelemetryFilter !== 'ALL') {
    if (activeTelemetryFilter === 'WEBSITE_ACCESS') {
      logsToDisplay = logsToDisplay.filter(l => l.type === 'WEBSITE_ACCESS');
    } else if (activeTelemetryFilter === 'USER_LOGIN') {
      logsToDisplay = logsToDisplay.filter(l => l.type === 'USER_LOGIN' || l.type === 'USER_LOGOUT');
    } else if (activeTelemetryFilter === 'OUTPUT_CREATED') {
      logsToDisplay = logsToDisplay.filter(l => l.type === 'OUTPUT_CREATED' || l.type === 'OUTPUT_MODIFIED' || l.type === 'PROJECT_SAVED');
    } else if (activeTelemetryFilter === 'EMAIL_SENT') {
      logsToDisplay = logsToDisplay.filter(l => l.type === 'EMAIL_SENT' || l.type === 'EMAIL_UPDATE_SENT');
    }
  }

  // Filter by search query
  if (telemetrySearchQuery) {
    const q = telemetrySearchQuery.toLowerCase().trim();
    logsToDisplay = logsToDisplay.filter(l => {
      const matchUser = l.username && l.username.toLowerCase().includes(q);
      const matchIp = l.ip && l.ip.toLowerCase().includes(q);
      const matchType = l.type && l.type.toLowerCase().includes(q);
      const matchDetails = l.details ? JSON.stringify(l.details).toLowerCase().includes(q) : false;
      return matchUser || matchIp || matchType || matchDetails;
    });
  }

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
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">PEDAIA Telemetry & Audit</span>
              </div>
              <h1 class="text-2xl font-bold font-scholarly text-slate-900 dark:text-white mt-1">
                Admin Console: Activity & Telemetry
              </h1>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Monitoring website visitors, user logins, generated outputs, and project email dispatches.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button id="admin-refresh-telemetry-btn" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer" title="Refresh Live Telemetry">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Telemetry</span>
            </button>
            <button id="admin-export-csv-btn" class="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer" title="Export CSV Audit Trail">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
            <button id="admin-clear-telemetry-btn" class="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer" title="Purge Activity Logs">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Logs</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Live Telemetry KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <!-- 1. Website Accesses -->
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-2xs">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Website Accesses</span>
            <span class="text-cyan-500 text-sm">🌐</span>
          </div>
          <div class="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
            ${stats.totalVisits || 0}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            ${stats.uniqueVisitors || 0} unique visitor IPs tracked
          </div>
        </div>

        <!-- 2. User Logins -->
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-2xs">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>User Logins</span>
            <span class="text-amber-500 text-sm">🔑</span>
          </div>
          <div class="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            ${stats.totalLogins || 0}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            ${totalUsers} registered users (${educatorUsers} educators)
          </div>
        </div>

        <!-- 3. Outputs Made -->
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-2xs">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Outputs Made</span>
            <span class="text-purple-500 text-sm">🎨</span>
          </div>
          <div class="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            ${stats.totalOutputs || totalDesignsAndOutputs}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Lesson plans, decks & worksheets
          </div>
        </div>

        <!-- 4. Project Email Updates -->
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-2xs">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Project Emails</span>
            <span class="text-emerald-500 text-sm">📨</span>
          </div>
          <div class="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${stats.totalEmails || 0}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Dispatched project milestone updates
          </div>
        </div>

      </div>

      <!-- MAIN TELEMETRY STREAM & AUDIT TRAIL -->
      <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-2xs overflow-hidden">
        
        <!-- Controls: Filter Tabs & Search -->
        <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📡</span>
              <span>Platform Activity Telemetry</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Chronological telemetry tracking website accesses, authentications, and educational outputs.</p>
          </div>

          <div class="flex items-center gap-2 w-full md:w-auto">
            <div class="relative flex-1 md:w-64">
              <input type="text" id="telemetry-search-input" value="${escapeHtml(telemetrySearchQuery)}" placeholder="Search user, IP, or output..." class="w-full text-xs px-3 py-1.5 pl-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Filter Categories Tabs -->
        <div class="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-750 overflow-x-auto text-xs">
          <button class="telemetry-filter-tab px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTelemetryFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-filter="ALL">
            All Activity (${telemetry.stats?.totalEvents || logsToDisplay.length})
          </button>
          <button class="telemetry-filter-tab px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTelemetryFilter === 'WEBSITE_ACCESS' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-filter="WEBSITE_ACCESS">
            🌐 Website Access (${stats.totalVisits || 0})
          </button>
          <button class="telemetry-filter-tab px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTelemetryFilter === 'USER_LOGIN' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-filter="USER_LOGIN">
            🔑 Logins & Sessions (${stats.totalLogins || 0})
          </button>
          <button class="telemetry-filter-tab px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTelemetryFilter === 'OUTPUT_CREATED' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-filter="OUTPUT_CREATED">
            🎨 Outputs Made (${stats.totalOutputs || 0})
          </button>
          <button class="telemetry-filter-tab px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTelemetryFilter === 'EMAIL_SENT' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}" data-filter="EMAIL_SENT">
            📨 Project Emails (${stats.totalEmails || 0})
          </button>
        </div>

        <!-- Telemetry Table -->
        <div class="overflow-x-auto max-h-[480px]">
          <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">User / Actor</th>
                <th class="py-3 px-4">Activity Description & Output Details</th>
                <th class="py-3 px-4">IP Address</th>
                <th class="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-750 font-sans">
              ${logsToDisplay.length === 0 ? `
                <tr>
                  <td colspan="5" class="py-8 text-center text-slate-400 italic">
                    No activity logs recorded matching the selected filter.
                  </td>
                </tr>
              ` : logsToDisplay.map(log => {
                const badge = getEventBadge(log.type);
                const isGuest = !log.userId || log.username === 'Guest Visitor';
                const isAdminActor = log.username === 'M1n1sume' || log.details?.role === 'admin';

                let detailsHtml = '';
                if (log.type === 'WEBSITE_ACCESS') {
                  detailsHtml = `<span class="text-slate-800 dark:text-slate-200 font-semibold">Accessed ${escapeHtml(log.details?.path || '/')}</span> <span class="text-slate-400 text-[10px]">(${escapeHtml(log.details?.device || 'Browser')})</span>`;
                } else if (log.type === 'USER_LOGIN') {
                  const isSuccess = log.details?.status === 'SUCCESS';
                  detailsHtml = isSuccess
                    ? `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Login Successful</span> <span class="text-slate-400">(${escapeHtml(log.details?.role || 'educator')})</span>`
                    : `<span class="text-rose-600 dark:text-rose-400 font-semibold">✗ Login Attempt Failed</span> <span class="text-slate-400">(${escapeHtml(log.details?.reason || 'Bad credentials')})</span>`;
                } else if (log.type === 'OUTPUT_CREATED' || log.type === 'OUTPUT_MODIFIED') {
                  detailsHtml = `<span class="text-purple-600 dark:text-purple-400 font-bold">Created Output:</span> <strong class="text-slate-900 dark:text-white">"${escapeHtml(log.details?.title || 'Educational Material')}"</strong> <span class="text-slate-400 text-[10px] uppercase font-mono">(${escapeHtml(log.details?.outputType || 'Lesson Material')})</span>`;
                } else if (log.type === 'PROJECT_SAVED') {
                  detailsHtml = `<span class="text-indigo-600 dark:text-indigo-400 font-semibold">Saved Project:</span> <strong class="text-slate-900 dark:text-white">"${escapeHtml(log.details?.title || 'Instructional Design')}"</strong> <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-750 font-mono">${escapeHtml(log.details?.stage || 'Draft')} • ${escapeHtml(log.details?.visibility || 'private')}</span>`;
                } else if (log.type === 'EMAIL_SENT' || log.type === 'EMAIL_UPDATE_SENT') {
                  detailsHtml = `<span class="text-emerald-600 dark:text-emerald-400 font-bold">📨 Email Dispatched to:</span> <strong class="text-slate-900 dark:text-white font-mono">${escapeHtml(log.details?.recipient || '')}</strong> <span class="text-slate-500 text-[11px] block mt-0.5">"${escapeHtml(log.details?.subject || 'Project Milestone Update')}"</span>`;
                } else {
                  detailsHtml = escapeHtml(JSON.stringify(log.details || {}));
                }

                return `
                  <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3 px-4 whitespace-nowrap">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.classes}">
                        <span>${badge.icon}</span>
                        <span>${badge.label}</span>
                      </span>
                    </td>
                    <td class="py-3 px-4 font-mono font-medium whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <span class="w-5 h-5 rounded-md ${isAdminActor ? 'overflow-hidden border border-indigo-400/40 bg-indigo-950' : (isGuest ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-indigo-600 text-white')} flex items-center justify-center text-[9px] font-bold shrink-0">
                          ${isAdminActor ? '<img src="./favicon.svg" alt="PEDAIA Administrator" class="w-full h-full object-cover">' : (isGuest ? '👤' : log.username.charAt(0).toUpperCase())}
                        </span>
                        <span class="text-slate-900 dark:text-white font-bold">${escapeHtml(log.username)}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      ${detailsHtml}
                    </td>
                    <td class="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      ${escapeHtml(log.ip || '127.0.0.1')}
                    </td>
                    <td class="py-3 px-4 text-right text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div>${formatRelativeTime(log.timestamp)}</div>
                      <div class="text-[9.5px] text-slate-400 font-mono">${formatDate(log.timestamp)}</div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

      </div>

      <!-- Registered Accounts Directory Table -->
      <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-2xs overflow-hidden">
        
        <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>👥</span>
              <span>Registered Educator Registry</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">All registered educators and administrators in the PEDAIA workspace</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="admin-create-user-modal-btn" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
              <span>+ Add Educator Account</span>
            </button>
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

    </div>
  `;
}

export function setupAdminDashboardListeners(container, navigateTo, showToast) {
  if (!container) return;
  const toast = showToast || window.showToast || (() => {});

  // Non-admin buttons
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

  // Telemetry Filter Tabs
  container.querySelectorAll('.telemetry-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTelemetryFilter = tab.getAttribute('data-filter') || 'ALL';
      container.innerHTML = renderAdminDashboardView();
      setupAdminDashboardListeners(container, navigateTo, showToast);
    });
  });

  // Telemetry Search Input
  const searchInput = container.querySelector('#telemetry-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        telemetrySearchQuery = e.target.value;
        container.innerHTML = renderAdminDashboardView();
        setupAdminDashboardListeners(container, navigateTo, showToast);
        const newSearch = container.querySelector('#telemetry-search-input');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
        }
      }, 300);
    });
  }

  // Refresh Live Telemetry
  container.querySelector('#admin-refresh-telemetry-btn')?.addEventListener('click', async () => {
    try {
      const data = await store.fetchAdminActivity({ type: 'ALL', limit: 200 });
      cachedTelemetryData = data;
      container.innerHTML = renderAdminDashboardView();
      setupAdminDashboardListeners(container, navigateTo, showToast);
      toast('✓ Live telemetry refreshed from server.', 'success');
    } catch (e) {
      toast('Error refreshing telemetry: ' + e.message, 'error');
    }
  });

  // Clear Activity Logs
  container.querySelector('#admin-clear-telemetry-btn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear the platform activity telemetry logs? This will reset all access and output records.')) {
      return;
    }
    try {
      await store.clearAdminActivity();
      cachedTelemetryData = null;
      container.innerHTML = renderAdminDashboardView();
      setupAdminDashboardListeners(container, navigateTo, showToast);
      toast('✓ Activity telemetry logs cleared.', 'info');
    } catch (e) {
      toast('Failed to clear logs: ' + e.message, 'error');
    }
  });

  // Export CSV
  container.querySelector('#admin-export-csv-btn')?.addEventListener('click', () => {
    try {
      const logs = (cachedTelemetryData?.logs) || [];
      const headers = ['ID', 'Category', 'Username', 'IP', 'Timestamp', 'Details'];
      const rows = logs.map(l => [
        l.id,
        l.type,
        `"${(l.username || '').replace(/"/g, '""')}"`,
        l.ip || '',
        l.timestamp || '',
        `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedaia_activity_telemetry_${new Date().toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('✓ Activity CSV audit trail exported successfully!', 'success');
    } catch (e) {
      toast('Failed to export CSV: ' + e.message, 'error');
    }
  });

  // Admin create user button
  container.querySelector('#admin-create-user-modal-btn')?.addEventListener('click', async () => {
    const { openAuthModal } = await import('./authModal.js');
    openAuthModal({
      defaultTab: 'signup',
      showToast: toast,
      onSuccess: () => {
        container.innerHTML = renderAdminDashboardView();
        setupAdminDashboardListeners(container, navigateTo, showToast);
      }
    });
  });

  // Auto-fetch fresh telemetry on initial render if not cached
  if (!cachedTelemetryData && store.isAdmin()) {
    store.fetchAdminActivity({ type: 'ALL', limit: 200 }).then(data => {
      cachedTelemetryData = data;
      container.innerHTML = renderAdminDashboardView();
      setupAdminDashboardListeners(container, navigateTo, showToast);
    }).catch(() => {});
  }
}
