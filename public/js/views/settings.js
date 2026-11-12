// PEDAIA Settings & Multi-Provider AI Configuration View
import { store } from '../state.js';
import { aiService } from '../aiService.js';
import { AI_PROVIDERS, AI_CATEGORIES, getProviderConfig, getProviderIcon } from '../aiProviders.js';
import { PEDAIA_BRAND, THEME_MODES } from '../palette.js';
import { SUBJECT_OPTIONS, EDUCATIONAL_LEVEL_OPTIONS } from './sharedContext.js';
import { lmsService } from '../lmsService.js';
import { openExtensionModal } from './extensionModal.js';
import { renderEducatorProfileView, setupEducatorProfileListeners } from './educatorProfile.js';
import { renderAdminDashboardView, setupAdminDashboardListeners } from './adminDashboard.js';

let activeSettingsTab = 'ai-providers'; // 'general' | 'ai-providers' | 'admin' | 'lms' | 'prompt-preferences' | 'appearance' | 'privacy' | 'import-export' | 'extension'

export function setSettingsActiveTab(tab) {
  if (tab === 'account') tab = 'general';
  if (tab) activeSettingsTab = tab;
}
let isKeyMasked = true;
let settingsActiveCategory = 'all';
let testingStatus = null; // null | { status: 'testing' | 'success' | 'failed', message: '' }

export function renderSettingsView() {
  const settings = store.getSettings();
  const currentThemeMode = store.getThemeMode ? store.getThemeMode() : 'system';
  const resolvedTheme = store.getResolvedTheme ? store.getResolvedTheme() : 'light';
  const currentTheme = resolvedTheme;
  const activeProviderId = store.getActiveProvider();
  const activeProvider = getProviderConfig(activeProviderId);
  const provSettings = store.getProviderSettings(activeProviderId);
  const isConfigured = aiService.hasConfiguredKey(activeProviderId);

  const activeApiKey = provSettings.apiKey || (activeProviderId === 'gemini' ? settings.apiKey : '');
  const activeModel = provSettings.model || activeProvider.defaultModel;
  const activeEndpoint = provSettings.endpoint || activeProvider.defaultEndpoint || '';
  const isAdmin = store.isAdmin ? store.isAdmin() : false;

  const educator = (store.getEducatorProfile ? store.getEducatorProfile() : settings.educatorProfile) || {};

  return `
    <div class="space-y-6 max-w-5xl mx-auto animate-fade-in pb-16">
      
      <!-- Page Header -->
      <div class="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-2.5">
          <span class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <h1 class="pedaia-page-title text-slate-900 dark:text-white">Studio Settings & AI Catalog</h1>
            <p class="pedaia-helper text-slate-500 dark:text-slate-400">Manage 15 AI providers, studio appearance, prompt preferences, and educator credentials</p>
          </div>
        </div>
      </div>

      <!-- Settings Navigation Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${activeSettingsTab === 'general' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="general">
          <span>Account Profile</span>
          ${!store.isAuthenticated() ? '<span class="text-[11px] opacity-75" title="Requires Log In or Sign Up">🔒</span>' : ''}
        </button>
        ${isAdmin ? `
          <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'admin' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60'}" data-tab="admin">
            👑 Admin Console
          </button>
        ` : ''}
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'ai-providers' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="ai-providers">
          AI Providers & Models (15)
        </button>
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'lms' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="lms">
          LMS & Classrooms
        </button>
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'prompt-preferences' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="prompt-preferences">
          Prompt Preferences
        </button>
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'appearance' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="appearance">
          Appearance & Brand System
        </button>
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'privacy' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="privacy">
          Data & Privacy
        </button>
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'import-export' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="import-export">
          Import & Export Backup
        </button>
        <button class="settings-tab-nav px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeSettingsTab === 'extension' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}" data-tab="extension">
          🧩 Browser Extension
        </button>
      </div>

      <!-- Tab Content Area -->
      ${renderTabContent(activeSettingsTab, {
        settings,
        currentTheme,
        currentThemeMode,
        resolvedTheme,
        activeProvider,
        activeProviderId,
        activeApiKey,
        activeModel,
        activeEndpoint,
        isConfigured,
        educator
      })}

    </div>
  `;
}

function renderTabContent(tab, ctx) {
  switch (tab) {
    case 'general':
    case 'account':
      return renderGeneralAndAccountSettings(ctx);
    case 'admin':
      return renderAdminDashboardView();
    case 'lms':
      return renderLmsSettings(ctx);
    case 'prompt-preferences':
      return renderPromptPreferences(ctx);
    case 'appearance':
      return renderAppearanceSettings(ctx);
    case 'privacy':
      return renderPrivacySettings(ctx);
    case 'import-export':
      return renderImportExportSettings(ctx);
    case 'extension':
      return renderBrowserExtensionSettings();
    case 'ai-providers':
    default:
      return renderAiProvidersSettings(ctx);
  }
}

// TAB 1: PROTECTED EDUCATOR PROFILE & PORTFOLIO SETTINGS
function renderGeneralAndAccountSettings(ctx) {
  return renderEducatorProfileView(ctx);
}

// TAB 2: AI PROVIDERS & MODELS CATALOG
function renderAiProvidersSettings({ activeProvider, activeProviderId, activeApiKey, activeModel, activeEndpoint, isConfigured }) {
  // Accurate Provider Status Calculation
  const hasCustomKey = aiService.hasCustomKey(activeProvider.id);
  let accurateStateLabel = 'Ready (Built-in AI Active)';
  let accurateBadgeColor = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300';
  let accurateDotColor = 'bg-emerald-500 animate-pulse';

  if (activeProvider.id === 'ollama' || activeProvider.id === 'lmstudio') {
    accurateStateLabel = 'Local Server Configured (Offline)';
    accurateBadgeColor = 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300';
    accurateDotColor = 'bg-sky-500';
  } else if (hasCustomKey) {
    accurateStateLabel = 'Connected (Custom Key Active)';
    accurateBadgeColor = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300';
    accurateDotColor = 'bg-emerald-500';
  }

  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6">
      
      <!-- Top Active Engine Status Pill -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-750 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl ${activeProvider.accentClass} text-white flex items-center justify-center shadow-xs">
            ${getProviderIcon(activeProvider.id, 'w-5 h-5')}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-slate-900 dark:text-white">Active Engine: ${activeProvider.name}</h2>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                ${activeModel}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">${activeProvider.tagline}</p>
          </div>
        </div>

        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${accurateBadgeColor}">
          <span class="w-2 h-2 rounded-full ${accurateDotColor}"></span>
          <span>${accurateStateLabel}</span>
        </div>
      </div>

      <!-- Zero Setup Banner -->
      <div class="rounded-xl p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 flex items-start gap-3">
        <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
          ✓
        </div>
        <div class="text-xs text-slate-700 dark:text-slate-300">
          <p class="font-bold text-slate-900 dark:text-white">Zero API Key Setup Required</p>
          <p class="mt-0.5 text-slate-600 dark:text-slate-400">
            PEDAIA comes pre-configured with a built-in pedagogical AI engine out-of-the-box. All 4 instructional studios and refinement tools work immediately with zero configuration. You may optionally enter custom API keys below if you wish to use your own cloud quota.
          </p>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="pedaia-label text-slate-700 dark:text-slate-300">Filter AI Engines by Category</label>
          <span class="text-[11px] text-slate-400">Click any card to activate and configure</span>
        </div>
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs" id="settings-category-tabs">
          <button class="settings-cat-btn px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${settingsActiveCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-category="all">
            All (15)
          </button>
          <button class="settings-cat-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${settingsActiveCategory === 'frontier' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-category="frontier">
            Frontier Labs (4)
          </button>
          <button class="settings-cat-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${settingsActiveCategory === 'reasoning' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-category="reasoning">
            Reasoning & Search (2)
          </button>
          <button class="settings-cat-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${settingsActiveCategory === 'fast' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-category="fast">
            Ultra-Fast LPUs (3)
          </button>
          <button class="settings-cat-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${settingsActiveCategory === 'local' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-category="local">
            100% Free & Local (2)
          </button>
          <button class="settings-cat-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${settingsActiveCategory === 'aggregator' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-category="aggregator">
            Aggregators (4)
          </button>
        </div>
      </div>

      <!-- 15 Provider Selection Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" id="provider-cards-grid">
        ${Object.values(AI_PROVIDERS).map(p => {
          const isSelected = p.id === activeProviderId;
          const hasCustom = aiService.hasCustomKey(p.id);
          const matchesCat = settingsActiveCategory === 'all' || p.category === settingsActiveCategory;

          let statusIndicator = '';
          if (p.id === 'ollama' || p.id === 'lmstudio') {
            statusIndicator = '<span class="text-[10px] font-bold text-sky-600 dark:text-sky-400">Local Free</span>';
          } else if (hasCustom) {
            statusIndicator = '<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Custom Key ✓</span>';
          } else {
            statusIndicator = '<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Ready ✓</span>';
          }

          return `
            <button type="button" class="provider-select-card p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${isSelected ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300'} ${matchesCat ? '' : 'hidden'}" data-provider-id="${p.id}" data-category="${p.category}">
              <div class="flex items-center justify-between w-full mb-2">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center ${p.accentClass} text-white shadow-2xs">
                  ${getProviderIcon(p.id, 'w-4 h-4')}
                </div>
                ${statusIndicator}
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  ${p.name}
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${p.company}</div>
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Active Provider Configuration Details -->
      <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-750 space-y-4">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/80">
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-bold text-slate-900 dark:text-white">${activeProvider.name} Credentials & Model Selector</h3>
          </div>
          ${activeProvider.helpUrl ? `
            <a href="${activeProvider.helpUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>${activeProvider.helpText || 'Get API Key'}</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          ` : ''}
        </div>

        <!-- Local Endpoint (Ollama / LM Studio / Custom) -->
        ${activeProvider.id === 'ollama' || activeProvider.id === 'lmstudio' || activeProvider.id === 'custom' ? `
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ${activeProvider.id === 'ollama' ? 'Ollama Server Endpoint URL' : activeProvider.id === 'lmstudio' ? 'LM Studio Local Server Endpoint URL' : 'Custom Base URL'}
            </label>
            <div class="flex gap-2">
              <input type="text" id="settings-provider-endpoint" value="${escapeHtml(activeEndpoint)}" placeholder="${activeProvider.defaultEndpoint}" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 font-mono focus:border-indigo-500 outline-none">
              <button id="save-endpoint-btn" class="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs transition-colors shrink-0">
                Save Endpoint
              </button>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              ${activeProvider.id === 'ollama' ? 'Default: <code>http://localhost:11434</code>. Pull any model (e.g. <code>ollama pull llama3.2</code>).' : 'Default: <code>http://localhost:1234/v1</code>. 100% free offline execution.'}
            </p>
          </div>
        ` : ''}

        <!-- API Key Input -->
        ${activeProvider.requiresKey || activeProvider.id === 'custom' ? `
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ${activeProvider.name} API Key <span class="text-slate-400 font-normal">(Optional — Built-in AI active)</span>
              </label>
              ${activeProvider.keyEnvVar ? `
                <span class="text-[10px] font-mono text-slate-400">Environment variable: ${activeProvider.keyEnvVar}</span>
              ` : ''}
            </div>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input type="${isKeyMasked ? 'password' : 'text'}" id="settings-api-key" value="${escapeHtml(activeApiKey)}" placeholder="${activeProvider.keyPlaceholder || 'Optional: paste custom API key'}" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 font-mono focus:border-indigo-500 outline-none pr-10">
                <button type="button" id="toggle-mask-key-btn" class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  ${isKeyMasked ? `
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  ` : `
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                  `}
                </button>
              </div>
              <button id="save-api-key-btn" class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs transition-colors shrink-0">
                Save Key
              </button>
              <button id="test-connection-btn" class="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0">
                <span>Test Connection</span>
              </button>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Leave blank to use PEDAIA's built-in intelligent pedagogical engine with zero setup, or provide your personal key to route through your cloud quota.
            </p>
          </div>
        ` : `
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 dark:text-slate-400">Zero cloud API key required for local self-hosted execution.</span>
            <button id="test-connection-btn" class="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5">
              <span>Test Local Connection</span>
            </button>
          </div>
        `}

        <!-- Model Selection Dropdown -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Select Model</label>
            <select id="settings-model-select" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 font-mono focus:border-indigo-500 outline-none">
              ${activeProvider.models.map(m => `
                <option value="${m.id}" ${m.id === activeModel ? 'selected' : ''}>${m.name} (${m.id})</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Temperature / Creativity</label>
            <input type="range" id="settings-temperature-slider" min="0" max="1" step="0.05" value="0.7" class="w-full mt-2 accent-indigo-600">
          </div>
        </div>

      </div>

    </div>
  `;
}

// TAB 3: PROMPT PREFERENCES
function renderPromptPreferences() {
  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-750">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">Instructional Prompt Preferences</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Configure default frameworks and curriculum alignment standards</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Default Instructional Framework</label>
          <select class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none">
            <option value="5E Instructional Model">5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate)</option>
            <option value="Understanding by Design (UbD)">Understanding by Design (UbD Backward Design)</option>
            <option value="4A's Model">4A's Model (Activity, Analysis, Abstraction, Application)</option>
            <option value="Direct Instruction">Direct Instruction (Review, Modeling, Guided, Independent)</option>
            <option value="Gradual Release of Responsibility">Gradual Release (I Do, We Do, You Do)</option>
          </select>
        </div>

        <div>
          <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Taxonomy Action Verbs Default</label>
          <select class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none">
            <option value="bloom">Bloom's Revised Taxonomy (Remember to Create)</option>
            <option value="smart">SMART Action Verbs (Measurable & Time-bound)</option>
            <option value="marzano">Marzano's New Taxonomy</option>
          </select>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <span class="font-bold block text-slate-800 dark:text-slate-100">Prompt Synthesizer Policy:</span>
        <p>PEDAIA produces live, structured, copyable prompts locally in real-time. Prompts adhere to verified curriculum models and include explicit teacher facilitation scripts, anticipated student misconceptions, and multi-tier differentiation.</p>
      </div>
    </div>
  `;
}

// TAB 4: APPEARANCE & BRAND SYSTEM
function renderAppearanceSettings({ currentThemeMode = 'system', resolvedTheme = 'light' }) {
  const isLight = currentThemeMode === 'light';
  const isDark = currentThemeMode === 'dark';
  const isSystem = currentThemeMode === 'system';
  const layoutMode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
  const uiScale = store.getUiScale ? store.getUiScale() : 100;

  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6">
      
      <!-- Section Header -->
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-750">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">Studio Appearance & Brand System</h2>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Official PEDAIA Palette
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">PEDAIA features one official scholarly brand palette with Light Mode, Dark Mode, and System Default sync</p>
        </div>
      </div>

      <!-- 3 Appearance Mode Selector Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        <!-- Light Mode Card -->
        <button type="button" id="theme-light-btn" class="appearance-mode-btn p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${isLight ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650'}" data-mode="light">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              ${isLight ? '<span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">Active ✓</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 block"></span>'}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Light Mode</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">Daylight academic paper. Crisp white surfaces (#FFFFFF) and soft slate (#F8FAFC) for high scholarly readability.</p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-750 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] border border-slate-300"></span>
            <span>Surface #FFFFFF</span>
          </div>
        </button>

        <!-- Dark Mode Card -->
        <button type="button" id="theme-dark-btn" class="appearance-mode-btn p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${isDark ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650'}" data-mode="dark">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              ${isDark ? '<span class="text-[10px] font-bold text-indigo-400 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-800">Active ✓</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 block"></span>'}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">Evening atelier. Deep navy & slate surfaces (#0F172A, #1E293B) to minimize eye strain during evening planning.</p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-750 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1E293B] border border-slate-600"></span>
            <span>Surface #1E293B</span>
          </div>
        </button>

        <!-- System Default Card -->
        <button type="button" id="theme-system-btn" class="appearance-mode-btn p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${isSystem ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650'}" data-mode="system">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              ${isSystem ? '<span class="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">Active ✓</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 block"></span>'}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">System Default</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">Automatic synchronization. Dynamically responds to your operating system appearance preferences in real-time.</p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Resolving: ${resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
            <span class="text-teal-600 dark:text-teal-400 font-sans font-semibold">Auto-sync</span>
          </div>
        </button>

      </div>

      <!-- Device & Screen Layout Adjustment Section -->
      <div class="p-5 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-900/50 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-750">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🖥️</span>
            <div>
              <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Device & Screen Fit System</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Anchors layout to the left and auto-adapts margins so buttons and studio panels are 100% visible on your screen</p>
            </div>
          </div>
          <span class="self-start sm:self-auto px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            Active: ${layoutMode === 'left' ? 'Left-Fit' : layoutMode === 'compact' ? 'Compact Fit' : layoutMode === 'centered' ? 'Centered' : 'Smart Auto'}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Option 1: Smart Auto -->
          <button type="button" class="settings-layout-btn p-3.5 rounded-xl border text-left transition-all cursor-pointer ${layoutMode === 'auto' ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650'}" data-layout="auto">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-base">⚡</span>
              ${layoutMode === 'auto' ? '<span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Active ✓</span>' : ''}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Smart Adaptive</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Automatically fits all buttons and panels to your device screen.</p>
          </button>

          <!-- Option 2: Left-Aligned -->
          <button type="button" class="settings-layout-btn p-3.5 rounded-xl border text-left transition-all cursor-pointer ${layoutMode === 'left' ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650'}" data-layout="left">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-base">⬅️</span>
              ${layoutMode === 'left' ? '<span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Active ✓</span>' : ''}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Left-Aligned (Wide)</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Anchors layout to the left, maximizing viewable area and eliminating cutoffs.</p>
          </button>

          <!-- Option 3: Compact / Laptop Fit -->
          <button type="button" class="settings-layout-btn p-3.5 rounded-xl border text-left transition-all cursor-pointer ${layoutMode === 'compact' ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650'}" data-layout="compact">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-base">💻</span>
              ${layoutMode === 'compact' ? '<span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Active ✓</span>' : ''}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Laptop &amp; Scaled</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Compact fit for 1366×768 or 125%/150% scaled displays.</p>
          </button>

          <!-- Option 4: Centered -->
          <button type="button" class="settings-layout-btn p-3.5 rounded-xl border text-left transition-all cursor-pointer ${layoutMode === 'centered' ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650'}" data-layout="centered">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-base">🎯</span>
              ${layoutMode === 'centered' ? '<span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Active ✓</span>' : ''}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Centered Atelier</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Classic centered document column.</p>
          </button>
        </div>

        <!-- UI Scale Selection -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-750">
          <div>
            <span class="text-xs font-bold text-slate-900 dark:text-white">UI Display Scale</span>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Adjust magnification if your screen has high Windows display scaling</p>
          </div>
          <div class="flex items-center gap-1.5">
            ${[90, 95, 100, 105].map(sc => `
              <button type="button" class="settings-scale-btn px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${uiScale === sc ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}" data-scale="${sc}">
                ${sc}%
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Official PEDAIA Brand System Reference -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-900/50 space-y-4">
        <div>
          <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Official PEDAIA Brand System</h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Strict three-color brand hierarchy engineered for scholarly clarity, accessible contrast, and zero visual clutter</p>
        </div>

        <!-- Primary Brand Colors -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 dark:text-white">Primary Indigo</span>
              <span class="w-4 h-4 rounded-full shadow-2xs border border-white/20" style="background-color: #312E81;"></span>
            </div>
            <div class="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 font-bold">#312E81</div>
            <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">Primary brand identity, main navigation, PEDAIA logo accents, and primary action buttons.</p>
          </div>

          <div class="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 dark:text-white">Secondary Violet</span>
              <span class="w-4 h-4 rounded-full shadow-2xs border border-white/20" style="background-color: #7C3AED;"></span>
            </div>
            <div class="text-[10px] font-mono text-violet-700 dark:text-violet-400 font-bold">#7C3AED</div>
            <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">Interactive highlights, selected controls, active studio tabs, and progress indicators.</p>
          </div>

          <div class="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 dark:text-white">Accent Teal</span>
              <span class="w-4 h-4 rounded-full shadow-2xs border border-white/20" style="background-color: #14B8A6;"></span>
            </div>
            <div class="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-bold">#14B8A6</div>
            <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">Supporting accent for pedagogical activities, subtle visual emphasis, and activity badges.</p>
          </div>
        </div>

        <!-- 4 Instructional Studio Subtle Accents -->
        <div class="pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">Four Instructional Studio Identity Accents</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div class="p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: #312E81;"></span>
              <span class="text-slate-700 dark:text-slate-200 font-medium">Lesson Planner</span>
            </div>
            <div class="p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: #14B8A6;"></span>
              <span class="text-slate-700 dark:text-slate-200 font-medium">Activity Designer</span>
            </div>
            <div class="p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: #F59E0B;"></span>
              <span class="text-slate-700 dark:text-slate-200 font-medium">Questioning Studio</span>
            </div>
            <div class="p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: #7C3AED;"></span>
              <span class="text-slate-700 dark:text-slate-200 font-medium">Differentiation</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

// TAB 5: DATA & PRIVACY
function renderPrivacySettings() {
  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-750">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">Data Governance & Pedagogical Privacy</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Local-first browser persistence, zero student identifying information</p>
        </div>
      </div>

      <div class="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
          <h4 class="font-bold text-slate-900 dark:text-white">1. Local-First Architecture</h4>
          <p>Your saved instructional designs, custom prompt templates, and configured provider keys remain exclusively within your browser's local storage sandbox. No centralized tracking server logs your prompts.</p>
        </div>

        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
          <h4 class="font-bold text-slate-900 dark:text-white">2. FERPA & GDPR Non-PII Compliance</h4>
          <p>PEDAIA's Differentiation Studio and Lesson Planner process exclusively pedagogical archetypes, cognitive readiness bands, and instructional accommodations. Student names, identification numbers, and grades are never solicited or stored.</p>
        </div>

        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
          <h4 class="font-bold text-slate-900 dark:text-white">3. Direct Frontier API Communications</h4>
          <p>When you invoke generation through cloud providers (Gemini, OpenAI, Anthropic, DeepSeek, etc.), communication proceeds directly from your client to their official endpoints using your private API key.</p>
        </div>
      </div>
    </div>
  `;
}

// TAB 6: IMPORT & EXPORT BACKUP
function renderImportExportSettings() {
  const designsCount = (store.getDesigns ? store.getDesigns() : []).length;
  const outputsCount = (store.getOutputs ? store.getOutputs() : []).length;

  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-750">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">Permanent Data Vault & Storage Immunity</h2>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Active & Protected
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">Guarantees that website updates, code redeployments, and server restarts will never delete your login details, profile, or outputs.</p>
        </div>
      </div>

      <!-- Live Vault Status Overview -->
      <div class="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-200">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Multi-Tier Permanent Vault Health</span>
          </div>
          <span class="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">IndexedDB + Local Vault + Server Auto-Sync</span>
        </div>
        <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
          PEDAIA employs automated bidirectional self-healing: whenever code changes occur or servers reset, all ${designsCount} saved designs, ${outputsCount} generated AI studio outputs, login credential hashes, and your educator portfolio are automatically verified, protected, and restored.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <!-- Full Export Card -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white">Download Complete Permanent Vault</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Exports all login accounts, educator profiles, instructional designs, and AI outputs into an encrypted/portable JSON archive.</p>
          </div>
          <button id="backup-download-all-btn" class="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Permanent Vault (.json)</span>
          </button>
        </div>

        <!-- Restore Card -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white">Restore Studio from Permanent Vault</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Upload a previously exported PEDAIA vault archive to immediately restore your dossiers, profile, and outputs on any device.</p>
          </div>
          <input type="file" id="backup-upload-input" accept=".json,application/json" class="hidden">
          <button id="backup-restore-btn" class="w-full py-2 px-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload & Restore Permanent Vault</span>
          </button>
        </div>

      </div>

      <!-- Factory Reset -->
      <div class="pt-4 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-rose-600 block">Factory Reset Workspace</span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">Restores initial sample data and resets configured keys</span>
        </div>
        <button id="factory-reset-btn" class="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors">
          Reset to Defaults
        </button>
      </div>

    </div>
  `;
}

// ACCOUNT PROFILE ALIAS (Merged into General & Account Profile)
function renderAccountSettings(ctx) {
  return renderGeneralAndAccountSettings(ctx);
}

// TAB: BROWSER COMPANION EXTENSION
function renderBrowserExtensionSettings() {
  const currentHost = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3000';
  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6">
      
      <!-- Top Title & Badge -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-750 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-2xl shrink-0">
            🧩
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-slate-900 dark:text-white">PEDAIA Browser Companion Extension</h2>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Universal Manifest V3
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Run PEDAIA side-by-side in Chrome, Edge, Firefox, Brave, and Opera with the Browser Side Panel API & Context Menu Web Clipper</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <a href="./pedaia-browser-extension.zip" download="pedaia-browser-extension.zip" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download .zip Package</span>
          </a>
          <button id="open-extension-guide-modal-btn" class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
            Interactive Guide
          </button>
        </div>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <span class="text-base">📌</span>
            <span>Side Panel Companion</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Docks directly alongside Canvas LMS, Google Classroom, Wikipedia, OpenStax, or reading PDFs. Toggle anytime with <kbd class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Ctrl+Shift+P</kbd> (or <kbd class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Cmd+Shift+P</kbd>).
          </p>
        </div>

        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
            <span class="text-base">✂️</span>
            <span>Curriculum Web Clipper</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Highlight any curriculum text, article, or rubric on the web, right-click, and select <em>Create Lesson Plan from Selection</em> or <em>Generate Bloom's Questions</em>.
          </p>
        </div>

        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
          <div class="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs">
            <span class="text-base">🚀</span>
            <span>Direct LMS Publishing</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Publish generated 5E lesson designs, UbD frameworks, and cognitive question sets directly to Canvas LMS modules or Google Classroom without leaving your browser tab.
          </p>
        </div>
      </div>

      <!-- Installation Guide Accordion/Steps -->
      <div class="rounded-xl border border-slate-200 dark:border-slate-750 p-4 bg-slate-50/50 dark:bg-slate-800/20 space-y-4">
        <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Browser Installation Guides (Takes ~30 seconds)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Chromium (Chrome, Edge, Brave, Opera) -->
          <div class="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-3">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-750">
              <span class="text-lg">🌐</span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">Google Chrome, Microsoft Edge, Brave & Opera</span>
            </div>
            <ol class="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Download and extract <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">pedaia-browser-extension.zip</code> to a folder.</li>
              <li>Navigate to <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">chrome://extensions</code> (or <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">edge://extensions</code>).</li>
              <li>Toggle on <strong>Developer mode</strong> in the top-right corner.</li>
              <li>Click <strong>Load unpacked</strong> and select the unzipped <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">extension</code> folder.</li>
              <li>Click the Extensions puzzle icon in your browser toolbar and pin <strong>PEDAIA</strong>. Press <kbd class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-750 font-mono text-[10px]">Ctrl+Shift+P</kbd> to dock the Side Panel!</li>
            </ol>
          </div>

          <!-- Mozilla Firefox -->
          <div class="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-3">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-750">
              <span class="text-lg">🦊</span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">Mozilla Firefox</span>
            </div>
            <ol class="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Download and extract <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">pedaia-browser-extension.zip</code>.</li>
              <li>Open Firefox and type <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">about:debugging#/runtime/this-firefox</code> in your address bar.</li>
              <li>Click <strong>Load Temporary Add-on...</strong></li>
              <li>Navigate into the extracted folder and select the <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">manifest.json</code> file.</li>
              <li>PEDAIA will appear in your Firefox extensions bar with full web clipping and quick synthesis enabled!</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Studio Host Connectivity Config -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-0.5">
          <span class="text-xs font-bold text-slate-900 dark:text-white block">PEDAIA Studio Web App Host</span>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">The companion extension connects to this origin to load your designs and LMS credentials.</p>
        </div>
        <div class="flex items-center gap-2">
          <code class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-750" id="extension-settings-host-display">${currentHost}</code>
          <button id="copy-studio-host-btn" class="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors">
            Copy
          </button>
        </div>
      </div>

    </div>
  `;
}

// TAB 3: LMS & CLASSROOM INTEGRATIONS
function renderLmsSettings({ settings }) {
  const lmsConfig = lmsService.getSettings();
  const history = lmsService.getPublishedHistory();
  const canvas = lmsConfig.canvas || {};
  const google = lmsConfig.googleClassroom || {};

  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6">
      
      <!-- Top Title & Badge -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-750 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-slate-900 dark:text-white">LMS & Digital Classroom Integrations</h2>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Canvas & Google Classroom Active
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Bridge your instructional design studio with direct classroom delivery</p>
          </div>
        </div>
      </div>

      <!-- Zero Friction Info Card -->
      <div class="rounded-xl p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 flex items-start gap-3">
        <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
          ✓
        </div>
        <div class="text-xs text-slate-700 dark:text-slate-300">
          <p class="font-bold text-slate-900 dark:text-white">Zero Setup Classroom Publishing</p>
          <p class="mt-0.5 text-slate-600 dark:text-slate-400">
            PEDAIA includes pre-formatted Canvas LMS native HTML, QTI 2.1 Quiz XML, and 1-Click Google Classroom Share out-of-the-box. You may also configure personal Canvas API tokens below to publish directly into your institution's live courses.
          </p>
        </div>
      </div>

      <!-- 1. Canvas LMS Card -->
      <div class="rounded-2xl border border-slate-200 dark:border-slate-750 p-5 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/80">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-[#E13F2B] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              C
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-900 dark:text-white">Canvas LMS (Instructure) Connection</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Higher Education & K-12 Canvas Course Publishing</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ${canvas.token ? 'Live Token Configured' : 'Ready (Studio Package Mode)'}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Canvas Instance Domain</label>
            <input type="text" id="settings-canvas-domain" value="${escapeHtml(canvas.domain || 'canvas.instructure.com')}" placeholder="e.g. school.instructure.com" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 font-mono focus:border-indigo-500 outline-none">
            <p class="text-[10px] text-slate-400 mt-1">Default: <code>canvas.instructure.com</code> (or your school's Canvas URL)</p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Canvas Personal Access Token</label>
              <span class="text-[10px] text-slate-400 font-normal">Optional</span>
            </div>
            <div class="flex gap-2">
              <input type="password" id="settings-canvas-token" value="${escapeHtml(canvas.token || '')}" placeholder="Paste Canvas Bearer Token" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 font-mono focus:border-indigo-500 outline-none">
              <button id="save-canvas-settings-btn" class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs transition-colors shrink-0">
                Save
              </button>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Found in Canvas → Account → Settings → Approved Integrations → + New Access Token</p>
          </div>
        </div>
      </div>

      <!-- 2. Google Classroom Card -->
      <div class="rounded-2xl border border-slate-200 dark:border-slate-750 p-5 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/80">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              G
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-900 dark:text-white">Google Classroom Linking</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Classwork Coursework, Materials & 1-Click Stream Announcements</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            1-Click Share Ready
          </span>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
          <div>
            <span class="text-xs font-bold text-slate-900 dark:text-white block">Official Google Classroom Web Share</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Opens the certified Google Classroom share picker for any class in your Google Workspace account</span>
          </div>
          <button id="test-google-share-btn" class="px-3.5 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors shrink-0 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            <span>Test Classroom Share</span>
          </button>
        </div>
      </div>

      <!-- 3. Publication History Audit Log -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-slate-900 dark:text-white">Recent LMS & Classroom Publications</h3>
        ${history.length > 0 ? `
          <div class="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            ${history.slice(0, 5).map(item => `
              <div class="p-3 flex items-center justify-between bg-white dark:bg-slate-850 text-xs">
                <div class="flex items-center gap-2.5">
                  <span class="w-2 h-2 rounded-full ${item.platformKey === 'canvas' ? 'bg-[#E13F2B]' : 'bg-[#0F9D58]'}"></span>
                  <div>
                    <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(item.designTitle)}</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 ml-1">→ ${escapeHtml(item.courseName)} (${item.contentType})</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-slate-400">${new Date(item.timestamp).toLocaleDateString()}</span>
                  <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-750 text-center text-xs text-slate-400">
            No publications recorded yet. Use the "Publish to LMS" button in the Output Workspace to deploy your designs.
          </div>
        `}
      </div>

    </div>
  `;
}

export function setupSettingsListeners(container, showToast) {
  // Navigation tabs
  container.querySelectorAll('.settings-tab-nav').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSettingsTab = btn.getAttribute('data-tab');
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
    });
  });

  // Category filter tabs in AI providers
  container.querySelectorAll('.settings-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settingsActiveCategory = btn.getAttribute('data-category');
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
    });
  });

  // Switch Provider
  container.querySelectorAll('.provider-select-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-provider-id');
      store.setActiveProvider(pid);
      showToast(`Switched active AI engine to ${getProviderConfig(pid).name}.`, 'info');
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
    });
  });

  // Save API Key
  container.querySelector('#save-api-key-btn')?.addEventListener('click', () => {
    const input = container.querySelector('#settings-api-key');
    const activePid = store.getActiveProvider();
    if (input) {
      const keyVal = input.value.trim();
      store.updateProviderSettings(activePid, { apiKey: keyVal });
      showToast(keyVal ? `${getProviderConfig(activePid).name} custom API Key saved!` : `${getProviderConfig(activePid).name} active in Built-in AI mode.`, 'success');
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
    }
  });

  // Toggle Mask Key
  container.querySelector('#toggle-mask-key-btn')?.addEventListener('click', () => {
    isKeyMasked = !isKeyMasked;
    container.innerHTML = renderSettingsView();
    setupSettingsListeners(container, showToast);
  });

  // Save Local Endpoint
  container.querySelector('#save-endpoint-btn')?.addEventListener('click', () => {
    const input = container.querySelector('#settings-provider-endpoint');
    const activePid = store.getActiveProvider();
    if (input) {
      store.updateProviderSettings(activePid, { endpoint: input.value.trim() });
      showToast(`Saved endpoint URL for ${getProviderConfig(activePid).name}.`, 'success');
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
    }
  });

  // Save Canvas LMS Settings
  container.querySelector('#save-canvas-settings-btn')?.addEventListener('click', () => {
    const domainInput = container.querySelector('#settings-canvas-domain');
    const tokenInput = container.querySelector('#settings-canvas-token');
    const domainVal = domainInput ? domainInput.value.trim() : 'canvas.instructure.com';
    const tokenVal = tokenInput ? tokenInput.value.trim() : '';

    lmsService.saveSettings({
      canvas: {
        domain: domainVal || 'canvas.instructure.com',
        token: tokenVal,
        isConfigured: Boolean(tokenVal)
      }
    });

    showToast(tokenVal ? 'Canvas LMS Access Token and domain saved!' : 'Canvas LMS domain saved (Package mode active).', 'success');
    container.innerHTML = renderSettingsView();
    setupSettingsListeners(container, showToast);
  });

  // Test Google Classroom Share
  container.querySelector('#test-google-share-btn')?.addEventListener('click', () => {
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3000';
    const shareUrl = `https://classroom.google.com/share?url=${encodeURIComponent(origin)}`;
    window.open(shareUrl, '_blank', 'width=650,height=700');
    showToast('Testing Google Classroom share window...', 'info');
  });

  // Model Selection Change
  container.querySelector('#settings-model-select')?.addEventListener('change', (e) => {
    const activePid = store.getActiveProvider();
    store.updateProviderSettings(activePid, { model: e.target.value });
    showToast(`Model updated to ${e.target.value}`, 'info');
  });

  // Test Connection Button (REAL TEST - Never Fabricate!)
  container.querySelector('#test-connection-btn')?.addEventListener('click', async () => {
    const testBtn = container.querySelector('#test-connection-btn');
    const activePid = store.getActiveProvider();
    const prov = getProviderConfig(activePid);

    if (testBtn) {
      testBtn.disabled = true;
      testBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Testing...</span>
      `;
    }

    try {
      // Execute test prompt
      await aiService.generate({
        prompt: 'Respond with exactly one word: OK'
      });
      showToast(`✓ Successfully connected to ${prov.name}!`, 'success');
    } catch (err) {
      showToast(`Connection failed: ${err.message}`, 'error');
    } finally {
      if (testBtn) {
        testBtn.disabled = false;
        testBtn.innerHTML = `<span>Test Connection</span>`;
      }
    }
  });

  // Protected Educator Profile Listeners (View/Edit mode, Live Preview, AI statement, Cancel, Save)
  setupEducatorProfileListeners(container, {
    showToast,
    reRenderParent: () => {
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
    }
  });

  // Admin Dashboard Listeners (M1n1sume Console)
  if (activeSettingsTab === 'admin') {
    setupAdminDashboardListeners(container, (dest, param) => {
      if (window.navigateTo) window.navigateTo(dest, param);
    }, showToast);
  }
  
  // Appearance Mode Toggles (Light / Dark / System)
  const handleModeChange = (mode) => {
    store.setThemeMode(mode);
    const label = mode === 'system' ? 'System Default (OS Sync)' : mode === 'dark' ? 'Dark Mode (Evening Atelier)' : 'Light Mode (Daylight Paper)';
    showToast(`Appearance updated to ${label}`, 'success');
    container.innerHTML = renderSettingsView();
    setupSettingsListeners(container, showToast);
  };

  container.querySelector('#theme-light-btn')?.addEventListener('click', () => handleModeChange('light'));
  container.querySelector('#theme-dark-btn')?.addEventListener('click', () => handleModeChange('dark'));
  container.querySelector('#theme-system-btn')?.addEventListener('click', () => handleModeChange('system'));
  container.querySelectorAll('.appearance-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode) handleModeChange(mode);
    });
  });

  // Device & Screen Layout Mode Buttons
  container.querySelectorAll('.settings-layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-layout');
      if (mode && store.setLayoutMode) {
        store.setLayoutMode(mode);
        const curScale = store.getUiScale ? store.getUiScale() : 100;
        if (window.applyLayoutMode) window.applyLayoutMode(mode, curScale);
        const names = {
          auto: '⚡ Smart Device Adaptive',
          left: '⬅️ Left-Aligned (Wide Canvas)',
          compact: '💻 Laptop & Scaled Fit',
          centered: '🎯 Centered Atelier'
        };
        showToast(`Layout updated to ${names[mode] || mode}`, 'info');
        container.innerHTML = renderSettingsView();
        setupSettingsListeners(container, showToast);
      }
    });
  });

  // UI Scale Buttons
  container.querySelectorAll('.settings-scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = Number(btn.getAttribute('data-scale'));
      if (scale && store.setUiScale) {
        store.setUiScale(scale);
        const curMode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
        if (window.applyLayoutMode) window.applyLayoutMode(curMode, scale);
        showToast(`Display scale set to ${scale}%`, 'info');
        container.innerHTML = renderSettingsView();
        setupSettingsListeners(container, showToast);
      }
    });
  });

  // Download All Permanent Vault Backup
  container.querySelector('#backup-download-all-btn')?.addEventListener('click', () => {
    try {
      store.exportAllData();
      showToast('✓ Permanent vault backup downloaded safely!', 'success');
    } catch (e) {
      showToast('Error exporting vault: ' + e.message, 'error');
    }
  });

  // Restore Permanent Vault Backup
  container.querySelector('#backup-restore-btn')?.addEventListener('click', () => {
    container.querySelector('#backup-upload-input')?.click();
  });

  container.querySelector('#backup-upload-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        showToast('Restoring permanent data vault...', 'info');
        const result = await store.importAllData(file);
        if (result.success) {
          showToast(`✓ Permanent Vault restored! (${result.designsRestored || 0} designs, ${result.outputsRestored || 0} outputs).`, 'success');
          container.innerHTML = renderSettingsView();
          setupSettingsListeners(container, showToast);
        } else {
          showToast(`Restore failed: ${result.error || 'Invalid archive format.'}`, 'error');
        }
      } catch (err) {
        showToast(`Restore error: ${err.message}`, 'error');
      }
    }
  });

  // Factory Reset
  container.querySelector('#factory-reset-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data and settings to defaults? This will erase custom additions.')) {
      store.resetToDefaults();
      showToast('Workspace reset to factory defaults.', 'info');
      container.innerHTML = renderSettingsView();
      setupSettingsListeners(container, showToast);
    }
  });

  // Browser Extension Guide & Host Copy Listeners
  container.querySelector('#open-extension-guide-modal-btn')?.addEventListener('click', () => {
    openExtensionModal();
  });

  container.querySelector('#copy-studio-host-btn')?.addEventListener('click', () => {
    const host = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3000';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(host).then(() => {
        showToast('Copied PEDAIA Studio host URL to clipboard!', 'success');
      }).catch(() => {
        showToast(`Studio Host: ${host}`, 'info');
      });
    } else {
      showToast(`Studio Host: ${host}`, 'info');
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
