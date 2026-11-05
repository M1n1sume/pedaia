// PEDAIA Quick AI Engine Switcher Modal
import { AI_PROVIDERS, AI_CATEGORIES, getProviderConfig, getProviderIcon } from '../aiProviders.js';
import { store } from '../state.js';
import { aiService } from '../aiService.js';

export function openAiSwitcherModal({ onSwitch, showToast, openSettings }) {
  const existing = document.getElementById('quick-ai-switcher-modal');
  if (existing) existing.remove();

  const settings = store.getSettings();
  const currentProviderId = store.getActiveProvider();

  const modalHtml = `
    <div id="quick-ai-switcher-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col max-h-[90vh] transition-colors">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Instructional AI Engine Catalog</h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  15 Engines Available
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Choose frontier labs, deep reasoning, live web grounding, ultra-fast LPUs, or offline local desktop AI</p>
            </div>
          </div>
          <button id="close-ai-switcher-modal-btn" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filter Controls: Search & Category Tabs -->
        <div class="pt-3 pb-2 space-y-2.5">
          <div class="relative">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" id="ai-switcher-search" placeholder="Search engines (e.g. Gemini, Claude 3.7, DeepSeek-R1, Perplexity, Cerebras, LM Studio, Ollama)..." class="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
          </div>

          <!-- Category Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs" id="ai-switcher-category-tabs">
            <button class="ai-cat-filter-btn px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors bg-indigo-600 text-white" data-category="all">
              All (15)
            </button>
            <button class="ai-cat-filter-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-category="frontier">
              Frontier Labs (4)
            </button>
            <button class="ai-cat-filter-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-category="reasoning">
              Reasoning & Search (2)
            </button>
            <button class="ai-cat-filter-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-category="fast">
              Ultra-Fast LPUs (3)
            </button>
            <button class="ai-cat-filter-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-category="local">
              100% Free & Local (2)
            </button>
            <button class="ai-cat-filter-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-category="aggregator">
              Aggregators (4)
            </button>
          </div>
        </div>

        <!-- Provider Selection List -->
        <div class="overflow-y-auto py-2 space-y-2.5 flex-1 pr-1" id="ai-provider-list">
          ${Object.values(AI_PROVIDERS).map(provider => {
            const isCurrent = provider.id === currentProviderId;
            const hasKey = aiService.hasConfiguredKey(provider.id);
            const provSettings = settings.providers?.[provider.id] || {};
            const activeModel = provSettings.model || provider.defaultModel;

            const categoryLabel = AI_CATEGORIES[provider.category] || provider.category;
            const searchableText = `${provider.name} ${provider.company} ${provider.tagline} ${categoryLabel} ${provider.models.map(m => m.name + ' ' + m.id).join(' ')}`.toLowerCase();

            return `
              <div class="provider-row rounded-xl border p-3.5 transition-all ${isCurrent ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'}" 
                data-provider-id="${provider.id}"
                data-category="${provider.category}"
                data-search-text="${searchableText}">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center ${provider.accentClass} text-white shrink-0 shadow-2xs">
                      ${getProviderIcon(provider.id, 'w-5 h-5')}
                    </div>
                    <div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold text-slate-900 dark:text-white">${provider.name}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${isCurrent ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
                          ${provider.company}
                        </span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                          ${categoryLabel}
                        </span>
                        ${isCurrent ? '<span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">Active Engine</span>' : ''}
                      </div>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${provider.tagline}</p>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div class="shrink-0 text-right">
                    ${provider.id === 'ollama' || provider.id === 'lmstudio' ? `
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                        Local / Free
                      </span>
                    ` : aiService.hasCustomKey(provider.id) ? `
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Custom Key ✓
                      </span>
                    ` : `
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Ready (Built-in)
                      </span>
                    `}
                  </div>
                </div>

                <!-- Controls & Model Selector -->
                <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2 flex-1 min-w-[220px]">
                    <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">Model:</label>
                    <select class="quick-model-select text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none flex-1 font-medium" data-provider-id="${provider.id}">
                      ${provider.models.map(m => `
                        <option value="${m.id}" ${activeModel === m.id ? 'selected' : ''}>${m.name} — ${m.badge}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="flex items-center gap-2">
                    ${!isCurrent ? `
                      <button class="select-provider-btn px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-colors" data-provider-id="${provider.id}">
                        Use ${provider.badge}
                      </button>
                    ` : `
                      <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 px-2 py-1">
                        <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Selected
                      </span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Modal Footer -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button id="open-full-settings-btn" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Optional Custom API Keys & Settings
          </button>
          <button id="close-ai-switcher-bottom-btn" class="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors">
            Close
          </button>
        </div>

      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHtml;
  document.body.appendChild(container.firstElementChild);

  const modal = document.getElementById('quick-ai-switcher-modal');
  const close = () => modal?.remove();

  document.getElementById('close-ai-switcher-modal-btn')?.addEventListener('click', close);
  document.getElementById('close-ai-switcher-bottom-btn')?.addEventListener('click', close);

  // Search & Filter Logic
  const searchInput = document.getElementById('ai-switcher-search');
  const categoryButtons = modal.querySelectorAll('.ai-cat-filter-btn');
  const providerRows = modal.querySelectorAll('.provider-row');

  let activeCategory = 'all';

  function applyFilters() {
    const query = (searchInput?.value || '').toLowerCase().trim();

    providerRows.forEach(row => {
      const rowCategory = row.getAttribute('data-category');
      const rowSearchText = row.getAttribute('data-search-text') || '';

      const matchesCategory = activeCategory === 'all' || rowCategory === activeCategory;
      const matchesSearch = !query || rowSearchText.includes(query);

      if (matchesCategory && matchesSearch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  searchInput?.addEventListener('input', applyFilters);

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'font-semibold');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400', 'font-medium');
      });
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400', 'font-medium');
      btn.classList.add('bg-indigo-600', 'text-white', 'font-semibold');

      activeCategory = btn.getAttribute('data-category') || 'all';
      applyFilters();
    });
  });

  // Model selection listeners
  modal.querySelectorAll('.quick-model-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const pId = sel.getAttribute('data-provider-id');
      const modelVal = e.target.value;
      store.updateProviderSettings(pId, { model: modelVal });
    });
  });

  // Switch Provider Button
  modal.querySelectorAll('.select-provider-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-provider-id');
      const sel = modal.querySelector(`.quick-model-select[data-provider-id="${pId}"]`);
      const modelVal = sel ? sel.value : null;

      store.setActiveProvider(pId, modelVal);
      const conf = getProviderConfig(pId);

      if (showToast) {
        showToast(`Switched active AI engine to ${conf.name} (${modelVal || conf.defaultModel})`, 'success');
      }

      if (onSwitch) onSwitch(pId, modelVal);
      close();
    });
  });

  document.getElementById('open-full-settings-btn')?.addEventListener('click', () => {
    close();
    if (openSettings) openSettings();
  });
}
