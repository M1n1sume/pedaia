// PEDAIA Studio Command Palette (Ctrl+K / Cmd+K)
// Global spotlight search and command runner for studios, actions, designs, and templates.

import { store } from '../state.js';
import { openUniversalImportModal } from '../importUtils.js';
import { openAiSwitcherModal } from './aiSwitcherModal.js';
import { openPaletteModal } from './paletteModal.js';
import { openExtensionModal } from './extensionModal.js';
import { openScreenFitModal } from './screenFitModal.js';
import { openUserAccountModal } from './userAccountModal.js';

let isOpen = false;
let selectedIndex = 0;
let currentItems = [];
let navigateCallback = null;
let toastCallback = null;

export function initCommandPalette({ navigateTo, showToast }) {
  navigateCallback = navigateTo;
  toastCallback = showToast;

  // Global Keyboard Listener for Ctrl+K / Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeCommandPalette();
    }
  });
}

export function openCommandPalette() {
  if (isOpen) return;
  isOpen = true;
  selectedIndex = 0;

  let overlay = document.getElementById('command-palette-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'command-palette-overlay';
    document.body.appendChild(overlay);
  }

  renderPaletteUI(overlay);
  setupPaletteListeners(overlay);

  // Focus search input
  setTimeout(() => {
    const input = document.getElementById('cmd-palette-search');
    if (input) input.focus();
  }, 50);
}

export function closeCommandPalette() {
  const overlay = document.getElementById('command-palette-overlay');
  if (overlay) {
    overlay.remove();
  }
  isOpen = false;
}

export function toggleCommandPalette() {
  if (isOpen) closeCommandPalette();
  else openCommandPalette();
}

const safeNavigate = (route, param = null) => {
  if (typeof navigateCallback === 'function') {
    navigateCallback(route, param);
  } else if (typeof window !== 'undefined') {
    window.location.hash = param ? `${route}/${param}` : route;
  }
};

function getAvailableCommands() {
  const designs = store.getDesigns ? store.getDesigns() : [];
  const templates = store.getTemplates ? store.getTemplates() : [];

  const systemCommands = [
    // Studios
    { id: 'nav-output-studio', category: 'Instructional Studios', icon: '🎨', title: 'AI Output Studio', subtitle: 'Generate PowerPoint presentations, posters, worksheets, flashcards & diagrams', action: () => safeNavigate('ai-output-studio') },
    { id: 'nav-lp', category: 'Instructional Studios', icon: '📖', title: 'AI Lesson Planner', subtitle: '5E, UbD, 4As, Direct Instruction, and Madeline Hunter models', action: () => safeNavigate('lesson-planning') },
    { id: 'nav-act', category: 'Instructional Studios', icon: '🔬', title: 'AI Activity Designer', subtitle: 'Guided inquiry, station rotations, and experiential designs', action: () => safeNavigate('activity-design') },
    { id: 'nav-quest', category: 'Instructional Studios', icon: '💡', title: 'AI Questioning Studio', subtitle: "Calibrated Bloom's Revised Taxonomy cognitive matrices", action: () => safeNavigate('questioning') },
    { id: 'nav-diff', category: 'Instructional Studios', icon: '⚖️', title: 'AI Differentiation Studio', subtitle: 'Tiered readiness pathways, ELL scaffolds, and accommodations', action: () => safeNavigate('differentiation') },
    { id: 'nav-ws', category: 'Instructional Studios', icon: '📝', title: 'Output & Refinement Workspace', subtitle: 'Academic manuscript review, exports, and LMS publishing', action: () => safeNavigate('workspace') },

    // Curriculum Assets
    { id: 'nav-designs', category: 'Curriculum Library', icon: '🗃️', title: 'My Instructional Designs', subtitle: `Browse ${designs.length} saved curriculum folios`, action: () => safeNavigate('designs') },
    { id: 'nav-prompts', category: 'Curriculum Library', icon: '📚', title: 'Prompt Library & Blueprints', subtitle: `Browse ${templates.length} pedagogical prompt templates`, action: () => safeNavigate('prompt-library') },
    { id: 'nav-settings', category: 'Curriculum Library', icon: '⚙️', title: 'Studio Settings & AI Catalog', subtitle: 'Manage 15 AI frontier providers, models, and LMS keys', action: () => safeNavigate('settings') },
    { id: 'nav-profile', category: 'Curriculum Library', icon: '👤', title: 'Educator Profile & Context', subtitle: 'Update institution, faculty credentials, and default subject', action: () => safeNavigate('settings', 'general') },

    // Quick Actions
    { id: 'act-user-account', category: 'Studio Tools', icon: '👤', title: 'User Account & Security', subtitle: 'Manage active session, saved designs, AI outputs & profile', action: () => openUserAccountModal({ navigateTo: safeNavigate, showToast: toastCallback }) },
    { id: 'act-import', category: 'Studio Tools', icon: '📥', title: 'Import Any Document or Syllabus', subtitle: 'Parse PDF, DOCX, TXT, JSON, CSV into pedagogical prompts', action: () => openUniversalImportModal({ showToast: toastCallback, onAction: (a, d) => a === 'open-workspace' ? safeNavigate('workspace', d.designId) : safeNavigate('designs') }) },
    { id: 'act-switch-ai', category: 'Studio Tools', icon: '⚡', title: 'Switch Active AI Engine', subtitle: 'Switch between Gemini 2.5, Claude 3.5, GPT-4o, DeepSeek, Llama', action: () => openAiSwitcherModal({ showToast: toastCallback }) },
    { id: 'act-screen-fit', category: 'Studio Tools', icon: '🖥️', title: 'Device & Screen Fit Layout', subtitle: 'Auto-Fit, Left-Aligned Canvas, Laptop Fit, and UI Scale Zoom', action: () => openScreenFitModal({ showToast: toastCallback }) },
    { id: 'act-extension', category: 'Studio Tools', icon: '🧩', title: 'Browser Companion Extension', subtitle: 'Download cross-browser side panel for Canvas & Classroom', action: () => openExtensionModal() },
    { id: 'act-palette', category: 'Appearance', icon: '🌓', title: 'Appearance & Theme Mode', subtitle: 'Daylight Light Mode, Evening Dark Mode, or OS System Sync', action: () => openPaletteModal({ showToast: toastCallback }) },
    { id: 'act-theme-light', category: 'Appearance', icon: '☀️', title: 'Switch to Daylight Light Mode', subtitle: 'Crisp white surfaces with official Indigo & Violet accents', action: () => { store.setThemeMode('light'); if (toastCallback) toastCallback('Switched to Daylight Light Mode', 'success'); } },
    { id: 'act-theme-dark', category: 'Appearance', icon: '🌙', title: 'Switch to Evening Dark Mode', subtitle: 'Slate/Navy atelier surfaces with official Indigo & Violet accents', action: () => { store.setThemeMode('dark'); if (toastCallback) toastCallback('Switched to Evening Dark Mode', 'success'); } },
    { id: 'act-theme-system', category: 'Appearance', icon: '💻', title: 'Switch to System Default (OS)', subtitle: 'Automatically synchronize with operating system appearance', action: () => { store.setThemeMode('system'); if (toastCallback) toastCallback('Switched to System Default appearance', 'success'); } },
    { id: 'act-lms-settings', category: 'LMS Integrations', icon: '🏛️', title: 'Configure Canvas LMS & Google Classroom', subtitle: 'Set up Canvas instance domain and Classroom web share', action: () => safeNavigate('settings', 'lms') }
  ];

  // Dynamic Saved Designs
  const designCommands = designs.map(d => ({
    id: `design-${d.id}`,
    category: 'Saved Instructional Designs',
    icon: '📄',
    title: d.title || 'Untitled Design',
    subtitle: `${d.subject || 'General'} • ${d.educationalLevel || 'Standard'} • ${new Date(d.updatedAt || Date.now()).toLocaleDateString()}`,
    action: () => safeNavigate('workspace', d.id)
  }));

  // Dynamic Prompt Templates
  const templateCommands = templates.map(t => ({
    id: `template-${t.id}`,
    category: 'Pedagogical Prompt Templates',
    icon: '🔖',
    title: t.name || 'Prompt Template',
    subtitle: `${t.categoryLabel || t.category || 'Framework'} • ${t.description || 'Instructional Blueprint'}`,
    action: () => {
      safeNavigate('prompt-library');
      if (toastCallback) toastCallback(`Loaded ${t.name}`, 'info');
    }
  }));

  return [...systemCommands, ...designCommands, ...templateCommands];
}

function filterCommands(query) {
  const all = getAvailableCommands();
  if (!query || !query.trim()) return all.slice(0, 16);

  const q = query.toLowerCase().trim();
  return all.filter(c => 
    (c.title || '').toLowerCase().includes(q) || 
    (c.subtitle || '').toLowerCase().includes(q) || 
    (c.category || '').toLowerCase().includes(q)
  );
}

function renderPaletteUI(container) {
  currentItems = filterCommands('');

  container.innerHTML = `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-fade-in" id="cmd-palette-backdrop">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto sm:my-0" id="cmd-palette-card">
        
        <!-- Search Input Bar -->
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" id="cmd-palette-search" placeholder="Type a command, studio, design title, or search..." class="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none font-medium">
          <kbd class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 shadow-2xs shrink-0">ESC</kbd>
        </div>

        <!-- Command List Container -->
        <div class="max-h-[380px] overflow-y-auto p-2 divide-y divide-transparent" id="cmd-palette-list">
          ${renderItemsList(currentItems, selectedIndex)}
        </div>

        <!-- Footer Navigation Hints -->
        <div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1"><kbd class="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">↑</kbd><kbd class="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">↓</kbd> Navigate</span>
            <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">↵</kbd> Select</span>
          </div>
          <div class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold font-mono text-[10px]">
            <span>PEDAIA Command System</span>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderItemsList(items, activeIndex) {
  if (items.length === 0) {
    return `
      <div class="py-12 text-center text-slate-400 text-xs">
        <span class="text-2xl block mb-2">🔍</span>
        No matching studios, designs, or actions found.
      </div>
    `;
  }

  // Group by category
  let currentCat = '';
  let html = '';

  items.forEach((item, idx) => {
    if (item.category !== currentCat) {
      currentCat = item.category;
      html += `
        <div class="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          ${currentCat}
        </div>
      `;
    }

    const isSelected = idx === activeIndex;
    html += `
      <div data-cmd-index="${idx}" class="cmd-item flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'}">
        <div class="flex items-center gap-3 truncate">
          <span class="text-base shrink-0">${item.icon}</span>
          <div class="truncate">
            <span class="text-xs font-semibold block leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}">${escapeHtml(item.title)}</span>
            <span class="text-[11px] block leading-tight truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}">${escapeHtml(item.subtitle)}</span>
          </div>
        </div>
        <svg class="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100 text-white' : 'text-slate-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    `;
  });

  return html;
}

function setupPaletteListeners(container) {
  const backdrop = container.querySelector('#cmd-palette-backdrop');
  const searchInput = container.querySelector('#cmd-palette-search');
  const listContainer = container.querySelector('#cmd-palette-list');

  // Dismiss on backdrop click
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCommandPalette();
  });

  // Search input handler
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value;
    currentItems = filterCommands(q);
    selectedIndex = 0;
    if (listContainer) {
      listContainer.innerHTML = renderItemsList(currentItems, selectedIndex);
      attachItemClickListeners(listContainer);
    }
  });

  // Keyboard navigation within list
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentItems.length > 0) {
        selectedIndex = (selectedIndex + 1) % currentItems.length;
        updateActiveSelection(listContainer);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentItems.length > 0) {
        selectedIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length;
        updateActiveSelection(listContainer);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelection(selectedIndex);
    }
  });

  attachItemClickListeners(listContainer);
}

function attachItemClickListeners(listContainer) {
  listContainer?.querySelectorAll('.cmd-item').forEach(itemEl => {
    itemEl.addEventListener('click', () => {
      const idx = parseInt(itemEl.getAttribute('data-cmd-index'), 10);
      executeSelection(idx);
    });
  });
}

function updateActiveSelection(listContainer) {
  if (!listContainer) return;
  listContainer.innerHTML = renderItemsList(currentItems, selectedIndex);
  attachItemClickListeners(listContainer);

  const selectedEl = listContainer.querySelector(`[data-cmd-index="${selectedIndex}"]`);
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: 'nearest' });
  }
}

function executeSelection(index) {
  const item = currentItems[index];
  if (item && typeof item.action === 'function') {
    closeCommandPalette();
    item.action();
  }
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
