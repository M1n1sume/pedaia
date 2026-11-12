// PEDAIA Universal Shared Resource & Design Viewer
// Displays shared instructional designs and AI outputs accessed via direct share links.

import { store } from '../state.js';
import { renderMarkdownToHtml, openPrintableWindow } from '../exportUtils.js';
import { openShareLinkModal } from './shareLinkModal.js';

let activeSharedItem = null;
let activeSharedType = 'design';
let activeSlideIndex = 0;
let showAnswerKey = false;
let currentFlashcardIndex = 0;
let isFlipped = false;

export function renderSharedView(shareId, mode = null) {
  return `
    <div id="shared-viewer-container" class="min-h-[85vh] flex flex-col animate-fade-in text-slate-800 dark:text-slate-100" data-share-id="${escapeHtml(shareId)}" data-mode="${escapeHtml(mode || '')}">
      <div id="shared-viewer-loading" class="flex flex-col items-center justify-center p-12 space-y-3">
        <div class="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading shared learning resource...</p>
      </div>
      <div id="shared-viewer-content" class="hidden flex-1 flex flex-col"></div>
    </div>
  `;
}

export async function setupSharedViewListeners(container, navigateTo, showToast) {
  const viewerEl = container.querySelector('#shared-viewer-container');
  if (!viewerEl) return;

  const shareId = viewerEl.getAttribute('data-share-id');
  const mode = viewerEl.getAttribute('data-mode') || (new URLSearchParams(window.location.search).get('mode')) || (window.location.hash.includes('mode=') ? window.location.hash.split('mode=')[1] : null);

  const loadingEl = container.querySelector('#shared-viewer-loading');
  const contentEl = container.querySelector('#shared-viewer-content');

  try {
    const sharedRecord = await store.fetchSharedItem(shareId);
    if (!sharedRecord || (!sharedRecord.item && !sharedRecord.output)) {
      renderNotFound(contentEl, loadingEl, navigateTo);
      return;
    }

    activeSharedItem = sharedRecord.item || sharedRecord;
    activeSharedType = sharedRecord.type || (activeSharedItem.outputType || activeSharedItem.slides ? 'output' : 'design');

    loadingEl?.classList.add('hidden');
    contentEl?.classList.remove('hidden');

    if (mode === 'embed') {
      renderEmbedMode(contentEl, activeSharedItem, activeSharedType, shareId, navigateTo, showToast);
    } else if (mode === 'presentation') {
      renderPresentationMode(contentEl, activeSharedItem, activeSharedType, shareId, navigateTo, showToast);
    } else {
      renderStandardSharedMode(contentEl, activeSharedItem, activeSharedType, shareId, navigateTo, showToast);
    }
  } catch (err) {
    console.error('[PEDAIA] Error rendering shared view:', err);
    renderNotFound(contentEl, loadingEl, navigateTo);
  }
}

function renderNotFound(contentEl, loadingEl, navigateTo) {
  loadingEl?.classList.add('hidden');
  contentEl?.classList.remove('hidden');
  contentEl.innerHTML = `
    <div class="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 shadow-sm space-y-4">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 text-2xl">
        🔍
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Resource Not Found</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This shared link may have expired or the author may have moved this instructional design.
        </p>
      </div>
      <button id="shared-404-home-btn" class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs">
        Explore PEDAIA Studio
      </button>
    </div>
  `;
  contentEl.querySelector('#shared-404-home-btn')?.addEventListener('click', () => {
    navigateTo('dashboard');
  });
}

function renderStandardSharedMode(container, item, type, shareId, navigateTo, showToast) {
  const title = item.title || item.topic || 'Instructional Learning Resource';
  const subject = item.subject || 'General';
  const gradeLevel = item.gradeLevel || item.educationalLevel || '';
  const category = item.category || item.categoryLabel || item.outputType || (type === 'output' ? 'AI Learning Resource' : 'Lesson Plan');
  const author = item.authorName || 'PEDAIA Educator';

  container.innerHTML = `
    <div class="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
      
      <!-- Top Attribution & Action Bar -->
      <div class="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              ${escapeHtml(category)}
            </span>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ${escapeHtml(subject)} ${gradeLevel ? `• ${escapeHtml(gradeLevel)}` : ''}
            </span>
            <span class="text-[11px] text-slate-400 dark:text-slate-500">
              • Shared by ${escapeHtml(author)}
            </span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold font-scholarly text-slate-900 dark:text-white tracking-tight">
            ${escapeHtml(title)}
          </h1>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button id="shared-duplicate-btn" class="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-2xs hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer" title="Clone this design into your personal studio">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Duplicate & Edit in Studio</span>
          </button>

          <button id="shared-print-btn" class="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer" title="Print or Save as PDF">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print / PDF</span>
          </button>

          <button id="shared-share-modal-btn" class="px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 transition-colors border border-violet-200 dark:border-violet-800 flex items-center gap-1.5 cursor-pointer" title="Copy or share link">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share Link</span>
          </button>

          <button id="shared-open-studio-btn" class="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer" title="Open PEDAIA Studio Dashboard">
            <span>Studio Home</span>
          </button>
        </div>
      </div>

      <!-- Main Rendered Content Card -->
      <div class="bg-white dark:bg-slate-850 p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-xs space-y-6">
        ${renderResourceBody(item, type)}
      </div>

      <!-- Footer Info -->
      <div class="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
        PEDAIA — AI-Powered Instructional Design Studio • Designed for Purposeful Learning
      </div>
    </div>
  `;

  bindSharedActions(container, item, type, navigateTo, showToast);
}

function renderPresentationMode(container, item, type, shareId, navigateTo, showToast) {
  const title = item.title || item.topic || 'Instructional Learning Resource';

  container.innerHTML = `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <!-- Minimalist Presentation Header -->
      <div class="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
          <span class="font-bold text-white tracking-wide">${escapeHtml(title)}</span>
          <span class="text-slate-400 hidden sm:inline">• Projector Presentation Mode</span>
        </div>
        <div class="flex items-center gap-2">
          <button id="pres-exit-btn" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors">
            Exit Presentation
          </button>
          <button id="pres-fullscreen-btn" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">
            Toggle Fullscreen
          </button>
        </div>
      </div>

      <!-- Presentation Stage -->
      <div class="flex-1 p-6 sm:p-12 max-w-5xl w-full mx-auto flex flex-col justify-center">
        ${renderResourceBody(item, type, true)}
      </div>
    </div>
  `;

  container.querySelector('#pres-exit-btn')?.addEventListener('click', () => {
    window.location.hash = `#share/${shareId}`;
  });

  container.querySelector('#pres-fullscreen-btn')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  bindInteractiveComponents(container, item, type);
}

function renderEmbedMode(container, item, type, shareId, navigateTo, showToast) {
  const title = item.title || item.topic || 'Instructional Learning Resource';
  const subject = item.subject || 'General';

  container.innerHTML = `
    <div class="p-4 bg-white dark:bg-slate-900 rounded-xl min-h-screen flex flex-col justify-between text-slate-800 dark:text-slate-100">
      <div class="space-y-4">
        <div class="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">${escapeHtml(title)}</h2>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">${escapeHtml(subject)} • PEDAIA Learning Resource</p>
          </div>
          <a href="${window.location.origin}${window.location.pathname}#share/${shareId}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <span>Open in PEDAIA</span>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
        <div class="prose-academic text-xs sm:text-sm">
          ${renderResourceBody(item, type)}
        </div>
      </div>
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
        Powered by PEDAIA AI-Powered Instructional Design Studio
      </div>
    </div>
  `;

  bindInteractiveComponents(container, item, type);
}

function renderResourceBody(item, type, isPresentation = false) {
  const content = item.output || item.content || '';

  // Slide Deck Presentation output
  if (item.category === 'Presentation (Slide Deck)' || item.slides || content.includes('[SLIDE DECK SPECIFICATIONS]') || content.includes('Slide 1:')) {
    const slides = extractSlides(content);
    if (slides.length > 0) {
      const activeSlide = slides[activeSlideIndex] || slides[0];
      return `
        <div class="space-y-4" id="shared-slide-deck-container">
          <div class="p-6 sm:p-10 rounded-2xl ${isPresentation ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-900 text-white shadow-xl'} min-h-[380px] flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs font-mono text-indigo-300 pb-3 border-b border-slate-800">
                <span>SLIDE ${activeSlideIndex + 1} OF ${slides.length}</span>
                <span class="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80 text-[10px]">
                  ${escapeHtml(activeSlide.type || 'Instructional')}
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-bold font-scholarly mt-4 text-white">
                ${escapeHtml(activeSlide.title)}
              </h2>
              <div class="mt-4 space-y-2 text-sm sm:text-base text-slate-200">
                ${activeSlide.bullets.map(b => `<div class="flex items-start gap-2.5"><span class="text-indigo-400 font-bold">•</span><span>${escapeHtml(b)}</span></div>`).join('')}
              </div>
            </div>

            ${activeSlide.notes ? `
              <div class="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-400 italic">
                <span class="font-bold text-slate-300 not-italic">Teacher Narration:</span> ${escapeHtml(activeSlide.notes)}
              </div>
            ` : ''}
          </div>

          <!-- Slide Controls -->
          <div class="flex items-center justify-between gap-3">
            <button id="prev-slide-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40" ${activeSlideIndex === 0 ? 'disabled' : ''}>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              <span>Previous Slide</span>
            </button>
            <div class="text-xs font-mono font-bold text-slate-500">
              Slide ${activeSlideIndex + 1} of ${slides.length}
            </div>
            <button id="next-slide-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40" ${activeSlideIndex >= slides.length - 1 ? 'disabled' : ''}>
              <span>Next Slide</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      `;
    }
  }

  // Flashcards Deck output
  if (item.category === 'Flashcards' || content.includes('Flashcard 1:') || content.includes('Card 1:')) {
    const cards = extractFlashcards(content);
    if (cards.length > 0) {
      const activeCard = cards[currentFlashcardIndex] || cards[0];
      return `
        <div class="space-y-4 max-w-lg mx-auto" id="shared-flashcard-container">
          <div class="text-xs font-mono text-center text-slate-500">
            Card ${currentFlashcardIndex + 1} of ${cards.length} • Click card to flip
          </div>
          <div id="flashcard-flip-box" class="cursor-pointer p-8 sm:p-12 min-h-[260px] rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50 to-violet-50/50 dark:from-slate-900 dark:to-indigo-950/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              ${isFlipped ? 'Answer & Explanation' : 'Concept / Question'}
            </span>
            <div class="text-base sm:text-lg font-bold text-slate-900 dark:text-white my-4">
              ${escapeHtml(isFlipped ? activeCard.back : activeCard.front)}
            </div>
            <span class="text-[10px] text-slate-400">
              (Click to ${isFlipped ? 'view question' : 'reveal answer'})
            </span>
          </div>

          <div class="flex items-center justify-between gap-3">
            <button id="prev-card-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer" ${currentFlashcardIndex === 0 ? 'disabled' : ''}>
              Previous
            </button>
            <button id="flip-card-btn" class="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer">
              Flip Card 🔄
            </button>
            <button id="next-card-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer" ${currentFlashcardIndex >= cards.length - 1 ? 'disabled' : ''}>
              Next
            </button>
          </div>
        </div>
      `;
    }
  }

  // Default Standard Academic Markdown Render (Lesson Plans, Activities, Worksheets, etc.)
  return `
    <div class="prose-academic space-y-4 leading-relaxed">
      ${renderMarkdownToHtml(content)}
    </div>
  `;
}

function bindSharedActions(container, item, type, navigateTo, showToast) {
  // Duplicate into user studio
  container.querySelector('#shared-duplicate-btn')?.addEventListener('click', () => {
    try {
      const cloned = store.importSharedItemToStudio(item, type);
      showToast('Successfully cloned to your personal studio!', 'success');
      if (type === 'design') {
        navigateTo('workspace', cloned.id);
      } else {
        navigateTo('ai-output-studio');
      }
    } catch {
      showToast('Could not duplicate item.', 'error');
    }
  });

  // Print PDF
  container.querySelector('#shared-print-btn')?.addEventListener('click', () => {
    openPrintableWindow(item);
  });

  // Re-open Share Link Modal
  container.querySelector('#shared-share-modal-btn')?.addEventListener('click', () => {
    openShareLinkModal({ item, type, showToast });
  });

  // Studio Home
  container.querySelector('#shared-open-studio-btn')?.addEventListener('click', () => {
    navigateTo('dashboard');
  });

  bindInteractiveComponents(container, item, type);
}

function bindInteractiveComponents(container, item, type) {
  // Slide Carousel Actions
  container.querySelector('#prev-slide-btn')?.addEventListener('click', () => {
    if (activeSlideIndex > 0) {
      activeSlideIndex--;
      rerenderContent(container, item, type);
    }
  });

  container.querySelector('#next-slide-btn')?.addEventListener('click', () => {
    activeSlideIndex++;
    rerenderContent(container, item, type);
  });

  // Flashcard Flip & Next Actions
  const toggleFlip = () => {
    isFlipped = !isFlipped;
    rerenderContent(container, item, type);
  };

  container.querySelector('#flashcard-flip-box')?.addEventListener('click', toggleFlip);
  container.querySelector('#flip-card-btn')?.addEventListener('click', toggleFlip);

  container.querySelector('#prev-card-btn')?.addEventListener('click', () => {
    if (currentFlashcardIndex > 0) {
      currentFlashcardIndex--;
      isFlipped = false;
      rerenderContent(container, item, type);
    }
  });

  container.querySelector('#next-card-btn')?.addEventListener('click', () => {
    currentFlashcardIndex++;
    isFlipped = false;
    rerenderContent(container, item, type);
  });
}

function rerenderContent(container, item, type) {
  const contentWrapper = container.querySelector('.prose-academic') || container.querySelector('#shared-slide-deck-container')?.parentElement || container.querySelector('#shared-flashcard-container')?.parentElement;
  if (contentWrapper) {
    contentWrapper.innerHTML = renderResourceBody(item, type);
    bindInteractiveComponents(container, item, type);
  }
}

// Extract slides helper
function extractSlides(text) {
  if (!text) return [];
  const slideRegex = /Slide\s+(\d+)[:\s]+([^\n]+)([\s\S]*?)(?=(?:Slide\s+\d+[:\s]+|$))/gi;
  const slides = [];
  let match;
  while ((match = slideRegex.exec(text)) !== null) {
    const rawBody = match[3] || '';
    const bullets = rawBody
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'))
      .map(l => l.replace(/^[•\-\*]\s*/, ''));

    const notesMatch = rawBody.match(/Teacher\s+Notes?[:\s]+([^\n]+(?:\n[^\n]+)*)/i);
    const notes = notesMatch ? notesMatch[1].trim() : '';

    slides.push({
      num: match[1],
      title: match[2].trim(),
      bullets: bullets.length > 0 ? bullets : [rawBody.trim().slice(0, 150)],
      notes
    });
  }
  return slides;
}

// Extract flashcards helper
function extractFlashcards(text) {
  if (!text) return [];
  const cardRegex = /(?:Card|Flashcard)\s+(\d+)[:\s]+([^\n]+)([\s\S]*?)(?=(?:(?:Card|Flashcard)\s+\d+[:\s]+|$))/gi;
  const cards = [];
  let match;
  while ((match = cardRegex.exec(text)) !== null) {
    const rawBody = match[3] || '';
    const backMatch = rawBody.match(/(?:Back|Answer|Definition|Explanation)[:\s]+([^\n]+)/i);
    const back = backMatch ? backMatch[1].trim() : rawBody.trim();

    cards.push({
      front: match[2].trim(),
      back: back || 'See concept details'
    });
  }
  return cards;
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
