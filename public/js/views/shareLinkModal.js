// PEDAIA Share Link Modal Component
// Enables educators to share direct links to designs and outputs across web, QR codes, LMS embed, and social tools.

import { store } from '../state.js';
import { generateQrSvg } from '../qrCode.js';

export async function openShareLinkModal({ item, type = 'design', showToast = () => {} }) {
  if (!item || !item.id) {
    showToast('Unable to share: Item not found.', 'error');
    return;
  }

  // Close existing modal if open
  const existing = document.getElementById('share-link-modal-overlay');
  if (existing) existing.remove();

  // Register share link in state & server
  const shareUrls = await store.shareItem(item, type);
  const baseLink = shareUrls?.url || `${window.location.origin}${window.location.pathname}#share/${item.id}`;
  const presentationLink = shareUrls?.presentationUrl || `${baseLink}?mode=presentation`;
  const embedCode = `<iframe src="${window.location.origin}${window.location.pathname}#share/${item.id}?mode=embed" width="100%" height="650" style="border:1px solid #e2e8f0;border-radius:12px;width:100%;" title="${escapeHtml(item.title || 'PEDAIA Learning Resource')}"></iframe>`;

  const title = item.title || item.topic || 'Instructional Learning Resource';
  const subject = item.subject || 'General';
  const gradeLevel = item.gradeLevel || item.educationalLevel || '';
  const category = item.category || item.categoryLabel || item.outputType || (type === 'output' ? 'AI Learning Resource' : 'Lesson Plan');
  const authorName = item.authorName || store.getCurrentUser()?.username || 'PEDAIA Educator';

  // Generate SVG QR Code
  const qrSvg = generateQrSvg(baseLink, { size: 190, color: '#312E81', bgColor: '#FFFFFF' });

  const modalHtml = `
    <div id="share-link-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="share-link-modal-title">
      <div class="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-750 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto transition-colors text-slate-800 dark:text-slate-100">
        
        <!-- Modal Header -->
        <div class="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/80 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 shadow-2xs">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 id="share-link-modal-title" class="text-base font-bold text-slate-900 dark:text-white font-scholarly">
                  Share Direct Link
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  ${escapeHtml(category)}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Anyone with this link can view, duplicate, or present this resource
              </p>
            </div>
          </div>

          <button id="close-share-link-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Close">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Target Resource Information Card -->
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs gap-3">
          <div class="min-w-0 flex-1">
            <div class="font-bold text-slate-900 dark:text-white truncate text-sm">
              ${escapeHtml(title)}
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>${escapeHtml(subject)}</span>
              ${gradeLevel ? `<span>•</span><span>${escapeHtml(gradeLevel)}</span>` : ''}
              <span>•</span>
              <span>By ${escapeHtml(authorName)}</span>
            </div>
          </div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Link
          </span>
        </div>

        <!-- Mode Selection Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold" id="share-tabs-nav">
          <button type="button" class="share-tab-btn flex-1 py-1.5 px-2 rounded-lg transition-all text-center text-xs font-bold bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs" data-tab="studio">
            Direct Link
          </button>
          <button type="button" class="share-tab-btn flex-1 py-1.5 px-2 rounded-lg transition-all text-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-tab="presentation">
            Student / Reader View
          </button>
          <button type="button" class="share-tab-btn flex-1 py-1.5 px-2 rounded-lg transition-all text-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-tab="embed">
            LMS Embed Code
          </button>
          <button type="button" class="share-tab-btn flex-1 py-1.5 px-2 rounded-lg transition-all text-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-tab="qr">
            Classroom QR
          </button>
        </div>

        <!-- Tab 1: Direct Studio Link -->
        <div id="share-tab-studio" class="space-y-3 share-tab-pane">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Direct Resource Link
            </label>
            <div class="flex items-center gap-2">
              <input id="share-link-input" type="text" readonly value="${escapeHtml(baseLink)}" class="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              <button id="copy-share-link-btn" type="button" class="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span id="copy-btn-text">Copy Link</span>
              </button>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Recipients can open this design directly in their browser, view all pedagogical sections, and duplicate it to their own studio with one click.
            </p>
          </div>
        </div>

        <!-- Tab 2: Presentation / Student View -->
        <div id="share-tab-presentation" class="space-y-3 share-tab-pane hidden">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Distraction-Free Student & Projector Link
            </label>
            <div class="flex items-center gap-2">
              <input id="share-presentation-input" type="text" readonly value="${escapeHtml(presentationLink)}" class="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 select-all focus:outline-none">
              <button id="copy-presentation-btn" type="button" class="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer">
                <span>Copy Link</span>
              </button>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Hides editor controls and studio sidebars. Optimized for classroom projector screens, interactive whiteboards, and student reading.
            </p>
          </div>
        </div>

        <!-- Tab 3: LMS Embed Code -->
        <div id="share-tab-embed" class="space-y-3 share-tab-pane hidden">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              HTML Iframe Embed Code (Canvas, Moodle, Google Sites)
            </label>
            <div class="relative">
              <textarea id="share-embed-textarea" readonly rows="3" class="w-full px-3 py-2 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 select-all resize-none focus:outline-none">${escapeHtml(embedCode)}</textarea>
            </div>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Embeds a live interactive preview card inside your course pages</span>
              <button id="copy-embed-btn" type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1">
                <span>Copy Embed Snippet</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 4: Classroom QR Code -->
        <div id="share-tab-qr" class="space-y-3 share-tab-pane hidden">
          <div class="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div class="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
              ${qrSvg}
            </div>
            <div class="mt-3">
              <div class="text-xs font-bold text-slate-900 dark:text-white">
                Scan to Open on Mobile or Tablet
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Display on projector or print for student desks
              </p>
            </div>
            <div class="flex items-center gap-2 mt-3">
              <button id="download-qr-btn" type="button" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download QR Image</span>
              </button>
              <button id="print-qr-btn" type="button" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print QR Card</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 1-Click Platform & Social Quick Share Grid -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            1-Click Classroom & Team Share
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a href="https://classroom.google.com/share?url=${encodeURIComponent(baseLink)}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group text-center">
              <span class="w-2.5 h-2.5 rounded-full bg-[#0F9D58] shrink-0"></span>
              <span class="truncate">Google Classroom</span>
            </a>
            <a href="https://teams.microsoft.com/share?href=${encodeURIComponent(baseLink)}&msgText=${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group text-center">
              <span class="w-2.5 h-2.5 rounded-full bg-[#464EB8] shrink-0"></span>
              <span class="truncate">MS Teams</span>
            </a>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title + ': ' + baseLink)}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group text-center">
              <span class="w-2.5 h-2.5 rounded-full bg-[#25D366] shrink-0"></span>
              <span class="truncate">WhatsApp</span>
            </a>
            <a href="mailto:?subject=${encodeURIComponent('PEDAIA Resource: ' + title)}&body=${encodeURIComponent('I wanted to share this instructional design with you: ' + baseLink)}" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group text-center">
              <svg class="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="truncate">Email Link</span>
            </a>
          </div>

          ${navigator.share ? `
            <div class="mt-2.5">
              <button id="native-share-btn" type="button" class="w-full py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share via Device System Menu...</span>
              </button>
            </div>
          ` : ''}
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modalOverlay = document.getElementById('share-link-modal-overlay');

  // Close handlers
  const closeModal = () => modalOverlay?.remove();
  document.getElementById('close-share-link-modal-btn')?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onKeydown);
    }
  };
  document.addEventListener('keydown', onKeydown);

  // Tab switching logic
  const tabBtns = modalOverlay.querySelectorAll('.share-tab-btn');
  const panes = modalOverlay.querySelectorAll('.share-tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.className = 'share-tab-btn flex-1 py-1.5 px-2 rounded-lg transition-all text-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      });
      btn.className = 'share-tab-btn flex-1 py-1.5 px-2 rounded-lg transition-all text-center text-xs font-bold bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs';

      panes.forEach(p => p.classList.add('hidden'));
      document.getElementById(`share-tab-${target}`)?.classList.remove('hidden');
    });
  });

  // Copy helper with animated feedback
  const handleCopy = async (text, buttonEl, originalLabel = 'Copy Link') => {
    try {
      await navigator.clipboard.writeText(text);
      buttonEl.innerHTML = `<svg class="w-3.5 h-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>✓ Copied!</span>`;
      buttonEl.classList.remove('bg-indigo-600', 'bg-violet-600');
      buttonEl.classList.add('bg-emerald-600');
      showToast('Share link copied to clipboard!', 'success');

      setTimeout(() => {
        buttonEl.innerHTML = `<span>${originalLabel}</span>`;
        buttonEl.classList.remove('bg-emerald-600');
        buttonEl.classList.add(originalLabel.includes('Student') ? 'bg-violet-600' : 'bg-indigo-600');
      }, 2200);
    } catch {
      showToast('Could not copy to clipboard. Please copy manually.', 'error');
    }
  };

  document.getElementById('copy-share-link-btn')?.addEventListener('click', (e) => {
    handleCopy(baseLink, e.currentTarget, 'Copy Link');
  });

  document.getElementById('copy-presentation-btn')?.addEventListener('click', (e) => {
    handleCopy(presentationLink, e.currentTarget, 'Copy Link');
  });

  document.getElementById('copy-embed-btn')?.addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(embedCode);
      showToast('Embed snippet copied!', 'success');
      e.currentTarget.textContent = '✓ Copied!';
      setTimeout(() => { e.currentTarget.textContent = 'Copy Embed Snippet'; }, 2000);
    } catch {
      showToast('Please copy snippet manually.', 'error');
    }
  });

  // Native device share
  document.getElementById('native-share-btn')?.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out "${title}" on PEDAIA Instructional Studio`,
          url: baseLink
        });
      } catch (err) {
        if (err.name !== 'AbortError') showToast('Could not share via device.', 'error');
      }
    }
  });

  // Download QR Code as SVG file
  document.getElementById('download-qr-btn')?.addEventListener('click', () => {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedaia-qr-${(item.title || 'resource').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Classroom QR Code downloaded!', 'success');
  });

  // Print QR Card
  document.getElementById('print-qr-btn')?.addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Allow popups to print QR card.', 'error');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PEDAIA QR Card — ${escapeHtml(title)}</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 95vh; margin: 0; text-align: center; }
          .card { border: 2px dashed #312E81; border-radius: 20px; padding: 30px; max-width: 380px; }
          h2 { margin: 12px 0 4px; color: #312E81; }
          p { margin: 4px 0 16px; color: #64748B; font-size: 13px; }
          .url { font-family: monospace; font-size: 10px; color: #94A3B8; word-break: break-all; margin-top: 14px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-weight: 800; color: #7C3AED; font-size: 14px; letter-spacing: 1px;">PEDAIA INSTRUCTIONAL STUDIO</div>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(subject)} • ${escapeHtml(gradeLevel)}</p>
          ${qrSvg}
          <div class="url">${escapeHtml(baseLink)}</div>
        </div>
        <script>window.onload = () => { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
