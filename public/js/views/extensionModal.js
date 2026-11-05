// PEDAIA Browser Extension Modal Component (Universal: Chrome, Edge, Firefox, Brave, Opera)
import { PEDAIA_BRAND } from '../palette.js';

export function openExtensionModal() {
  const existing = document.getElementById('extension-modal-overlay');
  if (existing) existing.remove();

  const modalHtml = `
    <div id="extension-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-5 my-8">
        
        <!-- Header -->
        <div class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-2xl shadow-xs shrink-0">
              🧩
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">PEDAIA Browser Companion Extension</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">Manifest V3</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use PEDAIA directly inside Chrome, Edge, Firefox, Brave, and Opera as a side-panel companion & curriculum web clipper</p>
            </div>
          </div>
          <button id="close-extension-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Download Banner Card -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">Pre-Built Extension Package</span>
            <p class="text-xs text-slate-600 dark:text-slate-300">Contains <code class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700">manifest.json</code>, Side Panel UI, Background Worker, and Web Clipper.</p>
          </div>
          <a href="./pedaia-browser-extension.zip" download="pedaia-browser-extension.zip" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Extension (.zip)</span>
          </a>
        </div>

        <!-- Key Features Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
            <div class="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <span>📌</span>
              <span>Side Panel Companion</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Dock alongside Canvas LMS, Google Classroom, Wikipedia, or PDFs (<kbd class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-750 text-[10px] font-mono">Ctrl+Shift+P</kbd>).</p>
          </div>

          <div class="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
            <div class="flex items-center gap-2 mb-1 text-teal-600 dark:text-teal-400 font-bold text-xs">
              <span>✂️</span>
              <span>Right-Click Web Clipper</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Highlight any standard or syllabus on the web, right-click, and send instantly to Lesson Planner or Questions.</p>
          </div>

          <div class="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
            <div class="flex items-center gap-2 mb-1 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <span>⚡</span>
              <span>Offline & LMS Ready</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Synthesizes Bybee 5E & Bloom's items even when offline, with 1-click push to Canvas & Google Classroom.</p>
          </div>
        </div>

        <!-- Installation Instructions with Browser Tabs -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Installation Guide</span>
          </div>

          <!-- Browser Selector Tabs -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs mb-3 overflow-x-auto" id="ext-browser-tabs">
            <button class="ext-tab-btn px-3 py-1.5 rounded-lg font-bold text-white bg-indigo-600 shadow-2xs" data-target="guide-chrome">
              Google Chrome
            </button>
            <button class="ext-tab-btn px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" data-target="guide-edge">
              Microsoft Edge
            </button>
            <button class="ext-tab-btn px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" data-target="guide-firefox">
              Mozilla Firefox
            </button>
            <button class="ext-tab-btn px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" data-target="guide-brave">
              Brave / Opera
            </button>
          </div>

          <!-- Guide Content Boxes -->
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
            
            <!-- Chrome Guide -->
            <div id="guide-chrome" class="ext-guide-pane space-y-2">
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>Download and extract <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 font-bold">pedaia-browser-extension.zip</code> onto your computer.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>Open Chrome and enter <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 select-all">chrome://extensions</code> in the URL bar.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>Turn on the <strong>Developer mode</strong> toggle in the top-right corner.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <div>Click <strong>Load unpacked</strong> and select the extracted <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700">extension</code> folder. Pin PEDAIA to your toolbar!</div>
              </div>
            </div>

            <!-- Edge Guide -->
            <div id="guide-edge" class="ext-guide-pane space-y-2 hidden">
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>Download and extract <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 font-bold">pedaia-browser-extension.zip</code>.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>Open Microsoft Edge and navigate to <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 select-all">edge://extensions</code>.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>Enable <strong>Developer mode</strong> in the left sidebar menu.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <div>Click <strong>Load unpacked</strong> and choose the unzipped folder.</div>
              </div>
            </div>

            <!-- Firefox Guide -->
            <div id="guide-firefox" class="ext-guide-pane space-y-2 hidden">
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>Download and extract <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 font-bold">pedaia-browser-extension.zip</code>.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>Open Firefox and navigate to <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 select-all">about:debugging#/runtime/this-firefox</code>.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>Click <strong>Load Temporary Add-on...</strong> and select <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700">manifest.json</code> inside the extracted folder.</div>
              </div>
            </div>

            <!-- Brave / Opera Guide -->
            <div id="guide-brave" class="ext-guide-pane space-y-2 hidden">
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>Navigate to <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 select-all">brave://extensions</code> or <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700 select-all">opera://extensions</code>.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>Enable <strong>Developer mode</strong>.</div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>Click <strong>Load unpacked</strong> and select the unzipped <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200 dark:border-slate-700">extension</code> folder.</div>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer Dismiss -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button id="done-extension-modal-btn" class="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors">
            Close
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Setup Listeners
  const overlay = document.getElementById('extension-modal-overlay');
  const close = () => overlay?.remove();

  document.getElementById('close-extension-modal-btn')?.addEventListener('click', close);
  document.getElementById('done-extension-modal-btn')?.addEventListener('click', close);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Browser Tabs Switching
  document.querySelectorAll('.ext-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      document.querySelectorAll('.ext-tab-btn').forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'shadow-2xs');
        b.classList.add('text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-2xs');
      btn.classList.remove('text-slate-600', 'dark:text-slate-300');

      document.querySelectorAll('.ext-guide-pane').forEach(pane => pane.classList.add('hidden'));
      const activePane = document.getElementById(targetId);
      if (activePane) activePane.classList.remove('hidden');
    });
  });
}
