// PEDAIA Unified Studio Appearance & Theme Selector Modal
import { store } from '../state.js';
import { PEDAIA_BRAND, THEME_MODES } from '../palette.js';

export function openPaletteModal({ showToast, onThemeChange }) {
  const existing = document.getElementById('palette-picker-modal');
  if (existing) existing.remove();

  const currentMode = store.getThemeMode ? store.getThemeMode() : 'system';
  const resolvedTheme = store.getResolvedTheme ? store.getResolvedTheme() : 'light';

  const modes = [
    {
      id: THEME_MODES.LIGHT,
      name: 'Light Mode',
      subtitle: 'Daylight Academic Paper',
      description: 'Clean white & soft slate surfaces (#F8FAFC, #FFFFFF) with official indigo and violet brand accents.',
      icon: `
        <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      `,
      swatchClass: 'bg-[#F8FAFC] border-slate-300'
    },
    {
      id: THEME_MODES.DARK,
      name: 'Dark Mode',
      subtitle: 'Evening Atelier',
      description: 'Dark navy/slate surfaces (#0F172A, #1E293B) with indigo and violet brand accents designed for reduced glare.',
      icon: `
        <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `,
      swatchClass: 'bg-[#0F172A] border-slate-700'
    },
    {
      id: THEME_MODES.SYSTEM,
      name: 'System Default',
      subtitle: 'OS Automatic Sync',
      description: 'Automatically follows your operating system dark/light mode preference with live sync.',
      icon: `
        <svg class="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      `,
      swatchClass: 'bg-gradient-to-r from-[#F8FAFC] to-[#0F172A] border-slate-400'
    }
  ];

  const modalHtml = `
    <div id="palette-picker-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div class="bg-white dark:bg-slate-850 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-750 flex flex-col transition-colors max-h-[90vh]">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Studio Appearance & Theme</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Unified Brand
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Select your preferred appearance mode for the instructional atelier</p>
            </div>
          </div>
          <button id="close-palette-modal-btn" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 3 Appearance Modes -->
        <div class="py-4 space-y-3 flex-1 overflow-y-auto pr-1">
          <div class="space-y-2.5">
            ${modes.map(m => {
              const isSelected = m.id === currentMode;
              return `
                <button type="button" class="appearance-mode-card w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${isSelected ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 shadow-xs' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}" data-mode="${m.id}">
                  <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex items-center justify-center shrink-0 shadow-2xs">
                      ${m.icon}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-900 dark:text-white">${m.name}</span>
                        <span class="text-[10px] text-slate-400 font-mono">• ${m.subtitle}</span>
                        ${isSelected ? '<span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">Active</span>' : ''}
                      </div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">${m.description}</p>
                    </div>
                  </div>

                  <div class="shrink-0 pt-0.5">
                    ${isSelected ? `
                      <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ` : `
                      <span class="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 block"></span>
                    `}
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Official Brand Color Reference -->
          <div class="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-750 bg-slate-50/60 dark:bg-slate-900/40 space-y-2 mt-4">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Official PEDAIA Brand System</span>
              <span class="font-normal text-[10px] text-slate-400">Harmonized for contrast & readability</span>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-md shadow-2xs shrink-0" style="background-color: #312E81;"></span>
                <div class="truncate">
                  <div class="font-bold text-slate-800 dark:text-slate-200 truncate">Primary Indigo</div>
                  <div class="text-[9.5px] text-slate-400 font-mono">#312E81</div>
                </div>
              </div>

              <div class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-md shadow-2xs shrink-0" style="background-color: #7C3AED;"></span>
                <div class="truncate">
                  <div class="font-bold text-slate-800 dark:text-slate-200 truncate">Secondary Violet</div>
                  <div class="text-[9.5px] text-slate-400 font-mono">#7C3AED</div>
                </div>
              </div>

              <div class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-md shadow-2xs shrink-0" style="background-color: #14B8A6;"></span>
                <div class="truncate">
                  <div class="font-bold text-slate-800 dark:text-slate-200 truncate">Accent Teal</div>
                  <div class="text-[9.5px] text-slate-400 font-mono">#14B8A6</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p class="text-[11px] text-slate-400">Current visual state: <strong>${resolvedTheme === 'dark' ? 'Dark Surface' : 'Light Paper'}</strong></p>
          <button id="close-palette-modal-bottom-btn" class="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors">
            Done
          </button>
        </div>

      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHtml;
  document.body.appendChild(container.firstElementChild);

  const modal = document.getElementById('palette-picker-modal');
  const close = () => modal?.remove();

  document.getElementById('close-palette-modal-btn')?.addEventListener('click', close);
  document.getElementById('close-palette-modal-bottom-btn')?.addEventListener('click', close);

  modal.querySelectorAll('.appearance-mode-card').forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.getAttribute('data-mode');
      const result = store.setThemeMode ? store.setThemeMode(mode) : { mode, resolved: mode };

      // Update header indicator
      const headerName = document.getElementById('header-palette-name');
      if (headerName) {
        headerName.textContent = mode === 'system' ? 'System' : (mode === 'dark' ? 'Dark' : 'Light');
      }

      if (showToast) {
        const modeLabel = mode === 'system' ? 'System Default (Auto Sync)' : (mode === 'dark' ? 'Dark Mode' : 'Light Mode');
        showToast(`Appearance updated to ${modeLabel}`, 'success');
      }

      if (onThemeChange) onThemeChange(result);
      close();
    });
  });
}
