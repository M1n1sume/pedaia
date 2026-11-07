// PEDAIA Device & Screen Fit Pop-up Modal Component
// Provides an accessible, non-clipped modal pop-up for screen alignment and UI scale
import { store } from '../state.js';
import { LAYOUT_MODES, getDeviceProfile, applyLayoutMode } from '../layoutManager.js';

export function openScreenFitModal({ showToast } = {}) {
  const existing = document.getElementById('screen-fit-modal');
  if (existing) existing.remove();

  let currentMode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
  let currentScale = store.getUiScale ? store.getUiScale() : 100;
  const dev = getDeviceProfile();

  const layoutOptions = [
    {
      id: LAYOUT_MODES.AUTO,
      name: 'Smart Device Adaptive',
      badge: 'Recommended',
      badgeClass: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: '⚡',
      description: 'Automatically analyzes display resolution and anchors layout to eliminate button clipping and side-scroll.'
    },
    {
      id: LAYOUT_MODES.LEFT,
      name: 'Left-Aligned Canvas',
      badge: 'Widescreen',
      badgeClass: 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      icon: '⬅️',
      description: 'Anchors workspace to the left margin, maximizing viewable canvas on wide 1080p, 1440p, and 4K displays.'
    },
    {
      id: LAYOUT_MODES.COMPACT,
      name: 'Laptop & Scaled Display Fit',
      badge: 'Compact',
      badgeClass: 'bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      icon: '💻',
      description: 'Streamlined margin and padding designed for 1366×768 laptops, Surface Pro, and 125%/150% Windows display scaling.'
    },
    {
      id: LAYOUT_MODES.CENTERED,
      name: 'Centered Atelier',
      badge: 'Classic',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      icon: '🎯',
      description: 'Classic centered scholarly document column, optimal for focused pedagogical reading and reviewing.'
    }
  ];

  const scaleOptions = [90, 95, 100, 105];

  const modalHtml = `
    <div id="screen-fit-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="screen-fit-modal-title">
      <div class="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-750 flex flex-col transition-colors max-h-[92vh] overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100">
        
        <!-- Modal Header -->
        <div class="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg shadow-2xs shrink-0">
              🖥️
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 id="screen-fit-modal-title" class="text-base font-bold text-slate-900 dark:text-white">Device & Screen Fit</h3>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  ${dev.width}×${dev.height}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="screen-fit-detected-device">${dev.label}</p>
            </div>
          </div>

          <button id="close-screen-fit-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Close">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Section 1: Layout Alignment Options -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workspace Layout Alignment</label>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">Instant Live Preview</span>
          </div>
          
          <div class="space-y-2" id="screen-fit-layout-cards">
            ${layoutOptions.map(opt => {
              const isSelected = (opt.id === currentMode);
              return `
                <button type="button" class="screen-modal-layout-btn w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                }" data-mode="${opt.id}">
                  <span class="text-xl shrink-0 mt-0.5">${opt.icon}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-900 dark:text-white">${opt.name}</span>
                        <span class="text-[9px] font-mono px-1.5 py-0.2 rounded border ${opt.badgeClass}">${opt.badge}</span>
                      </div>
                      <span class="screen-modal-check text-indigo-600 dark:text-indigo-400 font-bold text-sm ${isSelected ? '' : 'hidden'}">✓</span>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">${opt.description}</p>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 2: UI Scale / Zoom Adjustment -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">UI Scale / Interface Zoom</label>
            <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400" id="screen-modal-scale-val">${currentScale}%</span>
          </div>
          <div class="grid grid-cols-4 gap-2" id="screen-fit-scale-btns">
            ${scaleOptions.map(scale => {
              const isSelected = (scale === currentScale);
              return `
                <button type="button" class="screen-modal-scale-btn py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'
                }" data-scale="${scale}">
                  ${scale}%
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 3: Educational Guidance Notice -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span class="text-sm shrink-0">💡</span>
          <span>Preferences are automatically stored in your browser and automatically adapt whenever you resize your window or attach secondary displays.</span>
        </div>

        <!-- Modal Footer -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-[11px] text-slate-400 dark:text-slate-500 font-mono">PEDAIA Adaptive Engine</span>
          <button id="done-screen-fit-modal-btn" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
            Done
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = document.getElementById('screen-fit-modal');

  const closeModal = () => {
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.remove(), 150);
    }
  };

  // Close triggers
  document.getElementById('close-screen-fit-modal-btn')?.addEventListener('click', closeModal);
  document.getElementById('done-screen-fit-modal-btn')?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onKeyDown);
    }
  };
  document.addEventListener('keydown', onKeyDown);

  // Layout mode card selection handlers
  modal?.querySelectorAll('.screen-modal-layout-btn').forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.getAttribute('data-mode');
      if (mode && store.setLayoutMode) {
        currentMode = mode;
        store.setLayoutMode(mode);
        applyLayoutMode(mode, currentScale);

        // Update active card styling
        modal.querySelectorAll('.screen-modal-layout-btn').forEach(c => {
          const m = c.getAttribute('data-mode');
          const isAct = (m === mode);
          const check = c.querySelector('.screen-modal-check');

          if (isAct) {
            c.className = 'screen-modal-layout-btn w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 shadow-xs';
            if (check) check.classList.remove('hidden');
          } else {
            c.className = 'screen-modal-layout-btn w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800';
            if (check) check.classList.add('hidden');
          }
        });

        const names = {
          auto: 'Smart Device Adaptive',
          left: 'Left-Aligned Canvas',
          compact: 'Laptop & Scaled Display Fit',
          centered: 'Centered Atelier'
        };
        const toast = showToast || window.showToast;
        if (toast) toast(`Layout adjusted to ${names[mode] || mode}`, 'info');
      }
    });
  });

  // Scale buttons selection handlers
  modal?.querySelectorAll('.screen-modal-scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = Number(btn.getAttribute('data-scale'));
      if (scale && store.setUiScale) {
        currentScale = scale;
        store.setUiScale(scale);
        applyLayoutMode(currentMode, scale);

        // Update scale display value
        const scaleLabel = document.getElementById('screen-modal-scale-val');
        if (scaleLabel) scaleLabel.textContent = `${scale}%`;

        // Update scale buttons styling
        modal.querySelectorAll('.screen-modal-scale-btn').forEach(b => {
          const s = Number(b.getAttribute('data-scale'));
          const isAct = (s === scale);
          if (isAct) {
            b.className = 'screen-modal-scale-btn py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer bg-indigo-600 text-white border-indigo-600 shadow-xs';
          } else {
            b.className = 'screen-modal-scale-btn py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750';
          }
        });

        const toast = showToast || window.showToast;
        if (toast) toast(`Display scale set to ${scale}%`, 'info');
      }
    });
  });
}
