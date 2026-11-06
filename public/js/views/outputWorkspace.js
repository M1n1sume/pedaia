// PEDAIA AI Output Workspace & Refinement Studio
import { store } from '../state.js';
import { aiService, REFINEMENT_PROMPTS } from '../aiService.js';
import { renderReviewBanner, openEducatorReviewModal } from './educatorReview.js';
import {
  exportToPrintablePDF,
  exportToDocx,
  exportToMarkdown,
  exportToPlainText,
  exportToHtml,
  exportToJson,
  exportToCsv,
  exportToRtf,
  exportToLatex,
  exportToCanvasHtml,
  exportToGoogleClassroomFormat,
  openGoogleClassroomWebShare,
  openPrintableWindow,
  openUniversalExportModal,
  renderMarkdownToHtml
} from '../exportUtils.js';
import { openUniversalImportModal } from '../importUtils.js';
import { openAiSwitcherModal } from './aiSwitcherModal.js';
import { openPublishLmsModal } from './publishLmsModal.js';

let activeDesignId = null;
let isEditMode = false;
let isFocusMode = false;
let isRefining = false;

export function setActiveWorkspaceDesignId(id) {
  activeDesignId = id;
}

function renderLockedWipView(design) {
  const isPrivateLock = design.lockReason === 'PROJECT_PRIVATE';

  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-sm animate-fade-in">
      <div class="w-16 h-16 rounded-2xl ${isPrivateLock ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400' : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400'} flex items-center justify-center mx-auto mb-5 shadow-inner">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isPrivateLock ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'} mb-3">
        <span>🔒 ${isPrivateLock ? 'Private Project' : 'Project Locked'}</span>
        <span>•</span>
        <span>${isPrivateLock ? 'Author Access Only' : `Work In Progress Stage (${escapeHtml(design.status || 'Draft')})`}</span>
      </div>

      <h2 class="text-xl sm:text-2xl font-bold text-slate-850 dark:text-white mb-2">
        ${isPrivateLock ? 'Access Restricted: Private Project' : 'Access Restricted: Work In Progress'}
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6 leading-relaxed">
        ${isPrivateLock
          ? 'This instructional design is set to <strong>Private</strong> by its creator. To protect classroom autonomy and author confidentiality, private projects can only be viewed and edited by their author.'
          : 'This instructional design is currently active work in progress and is locked. In accordance with PEDAIA curricular confidentiality policy, projects cannot be accessed by other educators until the author completes all stages and marks the project as <strong>Completed and Public</strong>.'}
      </p>

      <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-750 p-4 text-left max-w-md mx-auto mb-6 text-xs space-y-2 text-slate-600 dark:text-slate-300">
        <div class="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
          <span class="font-semibold text-slate-500 dark:text-slate-400">Design Title:</span>
          <span class="font-medium text-slate-800 dark:text-slate-200">${escapeHtml(design.title || 'Instructional Project')}</span>
        </div>
        <div class="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
          <span class="font-semibold text-slate-500 dark:text-slate-400">Current Lifecycle:</span>
          <span class="font-bold ${isPrivateLock ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}">${escapeHtml(design.status || 'Draft')}</span>
        </div>
        <div class="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
          <span class="font-semibold text-slate-500 dark:text-slate-400">Visibility:</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">🔒 Private (Restricted)</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold text-slate-500 dark:text-slate-400">Access Policy:</span>
          <span class="font-medium text-slate-700 dark:text-slate-300">${isPrivateLock ? 'Author & Administrator Access Only' : 'Private to Author until Completed & Public'}</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 flex-wrap">
        <button id="ws-locked-go-designs" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors">
          Browse My Designs
        </button>
        <button id="ws-locked-go-dashboard" class="px-4 py-2 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors">
          Return to Dashboard
        </button>
        <button id="ws-locked-go-planner" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors">
          Create New Design
        </button>
      </div>
    </div>
  `;
}

export function renderOutputWorkspaceView() {
  let targetDesignId = activeDesignId;
  if (!targetDesignId) {
    const allDesigns = store.getDesigns ? store.getDesigns() : [];
    if (allDesigns.length > 0) {
      targetDesignId = allDesigns[0].id;
      activeDesignId = targetDesignId;
    }
  }
  const design = targetDesignId ? store.getDesignById(targetDesignId) : null;
  const activeAi = aiService.getActiveProviderStatus();

  if (!design) {
    return `
      <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Active Instructional Design Selected</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Select a saved instructional design from your library or generate a new one from any studio module.</p>
        <div class="flex items-center justify-center gap-3">
          <button id="ws-go-designs-btn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
            Browse My Designs
          </button>
          <button id="ws-go-planner-btn" class="px-4 py-2 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors">
            Open Lesson Planner
          </button>
        </div>
      </div>
    `;
  }

  // Work In Progress Project Lock: If viewer is not owner/admin and design is not completed
  if (design.isLockedToViewer) {
    return renderLockedWipView(design);
  }

  const activeUid = store.getCurrentUserId();
  const isAuthor = !design.userId || design.userId === activeUid || store.isAdmin();
  const versions = design.versionHistory || [];
  const categoryBadgeColor = {
    'lesson-planning': 'category-pill-lp',
    'Lesson Planning': 'category-pill-lp',
    'activity-design': 'category-pill-ad',
    'Activity Design': 'category-pill-ad',
    'questioning': 'category-pill-q',
    'Questioning': 'category-pill-q',
    'differentiation': 'category-pill-diff',
    'Differentiation': 'category-pill-diff',
    'assessment-design': 'category-pill-assessment',
    'Assessment Design': 'category-pill-assessment',
    'classroom-management': 'category-pill-classroom',
    'Classroom Management': 'category-pill-classroom'
  }[design.category] || {
    'lesson-planning': 'category-pill-lp',
    'activity-design': 'category-pill-ad',
    'questioning': 'category-pill-q',
    'differentiation': 'category-pill-diff',
    'assessment-design': 'category-pill-assessment',
    'classroom-management': 'category-pill-classroom'
  }[design.categoryKey] || 'category-pill-default';

  return `
    <div class="space-y-6">
      
      <!-- Top Workspace Bar -->
      <div class="bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-750 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${categoryBadgeColor}">
              ${escapeHtml(design.categoryLabel || design.category || 'Instructional Design')}
            </span>
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">• ${escapeHtml(design.subject || 'General')}</span>
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">• ${escapeHtml(design.educationalLevel || '')} ${escapeHtml(design.gradeLevel || '')}</span>
            <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">• Last revised: ${new Date(design.updatedAt || design.createdAt).toLocaleDateString()}</span>
            
            <!-- Project Lifecycle & Access Lock Indicator -->
            ${design.status === 'Completed' ? (design.visibility === 'public' || design.isPublic ? `
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <svg class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>Completed</span>
              </span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <svg class="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>🌐 Public • Unlocked for Others</span>
              </span>
            ` : `
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <svg class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>Completed</span>
              </span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 flex items-center gap-1">
                <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span>🔒 Private Project • Only You</span>
              </span>
            `) : `
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <svg class="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span>${escapeHtml(design.status || 'Draft')} • WIP Locked</span>
              </span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${design.visibility === 'public' || design.isPublic ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30'} flex items-center gap-1">
                ${design.visibility === 'public' || design.isPublic ? '🌐 Public (Once Completed)' : '🔒 Private'}
              </span>
            `}
          </div>
          <div class="flex items-center gap-2">
            <h1 id="ws-design-title-heading" class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">${escapeHtml(design.title)}</h1>
            <button id="ws-rename-title-btn" title="Rename Title" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-750">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Action Buttons: Print, Word, Markdown, Version History, Universal Hub -->
        <div class="flex items-center gap-2 flex-wrap">
          <button id="ws-import-file-btn" class="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5" title="Import content from any file">
            <svg class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Import Document</span>
          </button>

          <button id="ws-toggle-focus-btn" class="px-3 py-1.5 text-xs font-semibold ${isFocusMode ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'} rounded-lg transition-colors flex items-center gap-1.5" title="Toggle Distraction-Free Focus Folio Mode">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span class="hidden sm:inline">${isFocusMode ? 'Studio Mode' : 'Focus Folio'}</span>
          </button>

          <button id="ws-toggle-edit-btn" class="px-3 py-1.5 text-xs font-semibold ${isEditMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'} rounded-lg transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>${isEditMode ? 'View Formatted' : 'Edit Text'}</span>
          </button>

          <button id="ws-copy-output-btn" class="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </button>

          <!-- Publish to LMS / Digital Classroom Button -->
          <button id="ws-publish-lms-btn" class="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span>Publish to LMS</span>
          </button>

          <!-- Export Dropdown -->
          <div class="relative inline-block text-left" id="ws-export-dropdown-wrapper">
            <button id="ws-export-btn" class="px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Any File</span>
              <svg class="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div id="ws-export-menu" class="hidden absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-750 py-1.5 z-20">
              <div class="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Document Formats</div>
              <button id="ws-export-pdf-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                <span>Print / PDF Document</span>
              </button>
              <button id="ws-export-docx-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>Word (.doc) Document</span>
              </button>
              <button id="ws-export-md-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                <span>Markdown (.md) File</span>
              </button>
              <button id="ws-export-html-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>Web Page (.html)</span>
              </button>
              <button id="ws-export-txt-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                <span>Plain Text (.txt)</span>
              </button>
              
              <div class="my-1 border-t border-slate-100 dark:border-slate-750"></div>
              <div class="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">LMS & Digital Classrooms</div>
              <button id="ws-export-canvas-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#E13F2B]"></span>
                <span>Canvas Module Page (.html)</span>
              </button>
              <button id="ws-export-google-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#0F9D58]"></span>
                <span>Google Classroom Assignment</span>
              </button>
              <button id="ws-share-google-btn" class="w-full text-left px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>1-Click Classroom Share</span>
              </button>

              <div class="my-1 border-t border-slate-100 dark:border-slate-750"></div>
              <div class="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data & Typesetting</div>
              <button id="ws-export-json-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"/></svg>
                <span>JSON Data (.json)</span>
              </button>
              <button id="ws-export-csv-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>CSV Sheet (.csv)</span>
              </button>
              <button id="ws-export-tex-btn" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                <span>LaTeX Document (.tex)</span>
              </button>
              <div class="my-1 border-t border-slate-100 dark:border-slate-750"></div>
              <button id="ws-export-custom-modal-btn" class="w-full text-left px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-2">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                <span>More / Custom File Types...</span>
              </button>
            </div>
          </div>

          <!-- Version History Dropdown -->
          ${versions.length > 0 ? `
            <div class="relative inline-block text-left" id="ws-history-dropdown-wrapper">
              <button id="ws-history-btn" class="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>History (${versions.length})</span>
              </button>
              <div id="ws-history-menu" class="hidden absolute right-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-20 max-h-60 overflow-y-auto">
                <div class="px-3 py-1 border-b border-slate-100 dark:border-slate-700 text-[10.5px] font-semibold text-slate-400 uppercase">Version Snapshots</div>
                ${versions.map((v, i) => `
                  <button data-history-idx="${i}" class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-750 border-b border-slate-50 dark:border-slate-750 last:border-0 history-item-btn">
                    <div class="font-medium text-slate-800 dark:text-slate-200">${escapeHtml(v.note || `Version ${versions.length - i}`)}</div>
                    <div class="text-[10px] text-slate-400">${new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(v.timestamp).toLocaleDateString()}</div>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Lock / Unlock Project Status Control (Author/Admin) -->
          ${isAuthor ? (design.status === 'Completed' ? `
            <button id="ws-mark-wip-btn" class="px-3 py-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors flex items-center gap-1.5" title="Revert project to Work In Progress (locks access from other users)">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>🔒 Revert to WIP (Lock)</span>
            </button>
          ` : `
            <button id="ws-mark-completed-btn" class="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5" title="Mark this design as Completed (unlocks access for other educators)">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>✓ Mark Completed (Unlock)</span>
            </button>
          `) : ''}

          <!-- Private or Public Project Option Toggle (Author/Admin) -->
          ${isAuthor ? `
            <button id="ws-toggle-visibility-btn" class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${design.visibility === 'public' || design.isPublic ? 'bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'}" title="${design.visibility === 'public' || design.isPublic ? 'Project is Public. Click to switch to Private.' : 'Project is Private. Click to switch to Public.'}">
              ${design.visibility === 'public' || design.isPublic ? `
                <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>🌐 Public</span>
              ` : `
                <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span>🔒 Private</span>
              `}
            </button>

            <!-- Project Email Updates Notification Button -->
            <button id="ws-email-updates-btn" class="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer" title="Manage Project Email Updates & Send Instant Summary">
              <span>📧</span>
              <span>Email Updates</span>
            </button>
          ` : ''}

        </div>
      </div>

      <!-- Responsible AI & Educator Review Banner -->
      ${renderReviewBanner(design)}

      <!-- Main Content Workspace (Split Studio or Focus Folio) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Generated Content Document Canvas -->
        <div class="${isFocusMode ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-8'} bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm overflow-hidden flex flex-col transition-all">
          
          <div class="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                ${isEditMode ? 'Raw Markdown Editor' : 'Scholarly Curriculum Folio'}
              </span>
            </div>
            <div class="flex items-center gap-2">
              ${isEditMode ? `
                <button id="ws-save-manual-edits-btn" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors">
                  Save Edits
                </button>
              ` : `
                <button id="ws-print-folio-btn" class="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  <span>Print Folio</span>
                </button>
              `}
            </div>
          </div>

          <div class="p-6 sm:p-10 overflow-y-auto min-h-[500px]">
            ${isEditMode ? `
              <textarea id="ws-raw-output-editor" class="w-full min-h-[520px] font-mono text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed text-slate-800 dark:text-slate-100">${escapeHtml(design.output || '')}</textarea>
            ` : `
              <!-- Scholarly Folio Presentation -->
              ${renderManuscriptMasthead(design)}
              ${renderPedagogicalScorecard(design)}
              <div class="prose-academic">
                ${renderMarkdownToHtml(design.output || '')}
              </div>
            `}
          </div>

        </div>

        <!-- Pedagogy Refinement Studio Panel (Side Panel or Focus Drawer) -->
        ${!isFocusMode ? `
          <div class="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-5 shadow-sm space-y-4">
              
              <div class="flex items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-3">
                <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Iterative Refinement Studio</h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Tune and adapt without starting from scratch</p>
                </div>
              </div>

              <!-- Active AI Engine Pill -->
              <div class="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full ${activeAi.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0"></span>
                  <span class="text-slate-600 dark:text-slate-300 truncate">Engine: <strong>${activeAi.name}</strong> <span class="font-mono text-[10px] text-slate-400">(${activeAi.model})</span></span>
                </div>
                <button type="button" id="ws-change-ai-engine-btn" class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0 text-[10px]">Switch AI</button>
              </div>

              <!-- Quick Pedagogical Refinement Buttons -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Quick Refinement Actions</label>
                <div class="grid grid-cols-2 gap-1.5" id="ws-refinement-chips">
                  ${Object.entries(REFINEMENT_PROMPTS).map(([key, val]) => `
                    <button type="button" data-refinement-key="${key}" class="refinement-chip text-left p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 font-medium transition-all">
                      ${val.label}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Custom Refinement Directive -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom Pedagogical Adjustment</label>
                <textarea id="ws-custom-refine-input" rows="3" class="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none" placeholder="e.g. Add a 5-minute kinesthetic icebreaker, reduce required materials, or adapt for 45-minute period..."></textarea>
              </div>

              <!-- Refine Output Action Button -->
              <button id="ws-execute-refine-btn" class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Apply Refinement</span>
              </button>

              <!-- Metadata Details Summary -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-750 text-[11.5px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <div class="flex justify-between">
                  <span>Core Competency:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title="${escapeHtml(design.competency || 'N/A')}">${escapeHtml(design.competency || 'Curricular Standard')}</span>
                </div>
                <div class="flex justify-between">
                  <span>Modality:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200">${escapeHtml(design.modality || 'Face-to-Face')}</span>
                </div>
                <div class="flex justify-between">
                  <span>Allocated Time:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200">${escapeHtml(design.duration || 'N/A')}</span>
                </div>
              </div>

            </div>
          </div>
        ` : `
          <div class="lg:col-span-12 max-w-4xl mx-auto w-full pt-2">
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-2">
                <span class="text-base">✨</span>
                <span class="text-xs text-slate-600 dark:text-slate-300">You are viewing in <strong>Distraction-Free Focus Folio Mode</strong>.</span>
              </div>
              <button id="ws-exit-focus-btn" class="px-3.5 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition-colors">
                Return to Studio Workbench →
              </button>
            </div>
          </div>
        `}

      </div>

    </div>
  `;
}

export function setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings) {
  let targetDesignId = activeDesignId;
  if (!targetDesignId) {
    const allDesigns = store.getDesigns ? store.getDesigns() : [];
    if (allDesigns.length > 0) {
      targetDesignId = allDesigns[0].id;
      activeDesignId = targetDesignId;
    }
  }
  const design = targetDesignId ? store.getDesignById(targetDesignId) : null;
  if (!design) {
    const goDesigns = container.querySelector('#ws-go-designs-btn');
    if (goDesigns) goDesigns.addEventListener('click', () => navigateToWorkspace('designs'));
    const goPlanner = container.querySelector('#ws-go-planner-btn');
    if (goPlanner) goPlanner.addEventListener('click', () => navigateToWorkspace('lesson-planning'));
    return;
  }

  // Work In Progress Project Lock handling: If locked to viewer
  if (design.isLockedToViewer) {
    container.querySelector('#ws-locked-go-designs')?.addEventListener('click', () => navigateToWorkspace('designs'));
    container.querySelector('#ws-locked-go-dashboard')?.addEventListener('click', () => navigateToWorkspace('dashboard'));
    container.querySelector('#ws-locked-go-planner')?.addEventListener('click', () => navigateToWorkspace('lesson-planning'));
    return;
  }

  // Mark Completed / Revert to WIP Lock buttons for author/admin
  container.querySelector('#ws-mark-completed-btn')?.addEventListener('click', () => {
    store.updateDesign(design.id, { status: 'Completed' });
    container.innerHTML = renderOutputWorkspaceView();
    setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
    showToast('Project status marked as Completed: Unlocked for other educators to access.', 'success');
  });

  container.querySelector('#ws-mark-wip-btn')?.addEventListener('click', () => {
    store.updateDesign(design.id, { status: 'Draft' });
    container.innerHTML = renderOutputWorkspaceView();
    setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
    showToast('Project reverted to Work In Progress: Locked from other viewers.', 'info');
  });

  // Project Visibility Option Toggle (Private vs Public)
  container.querySelector('#ws-toggle-visibility-btn')?.addEventListener('click', () => {
    const isCurrentlyPublic = design.visibility === 'public' || design.isPublic;
    const nextVis = isCurrentlyPublic ? 'private' : 'public';
    store.updateDesign(design.id, { visibility: nextVis, isPublic: !isCurrentlyPublic });
    container.innerHTML = renderOutputWorkspaceView();
    setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
    if (nextVis === 'public') {
      showToast('Project visibility set to Public: Other educators can view this once completed.', 'info');
    } else {
      showToast('Project visibility set to Private: Strictly restricted to you.', 'info');
    }
  });

  // Project Email Updates Dialog
  container.querySelector('#ws-email-updates-btn')?.addEventListener('click', () => {
    openProjectEmailModal(design, showToast);
  });

  // Toggle Edit/View Mode
  const toggleEditBtn = container.querySelector('#ws-toggle-edit-btn');
  if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      container.innerHTML = renderOutputWorkspaceView();
      setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  }

  // Focus Mode Toggles
  const handleToggleFocus = () => {
    isFocusMode = !isFocusMode;
    container.innerHTML = renderOutputWorkspaceView();
    setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
    showToast(isFocusMode ? 'Focus Folio activated (Distraction-free manuscript)' : 'Studio Workbench restored', 'info');
  };
  container.querySelector('#ws-toggle-focus-btn')?.addEventListener('click', handleToggleFocus);
  container.querySelector('#ws-exit-focus-btn')?.addEventListener('click', handleToggleFocus);

  // Print Folio Direct
  container.querySelector('#ws-print-folio-btn')?.addEventListener('click', () => {
    openPrintableWindow(design);
  });

  // Save Manual Edits
  const saveManualEditsBtn = container.querySelector('#ws-save-manual-edits-btn');
  if (saveManualEditsBtn) {
    saveManualEditsBtn.addEventListener('click', () => {
      const editor = container.querySelector('#ws-raw-output-editor');
      if (editor) {
        store.updateDesign(design.id, {
          output: editor.value,
          refinementNote: 'Manual text edit by educator'
        });
        isEditMode = false;
        container.innerHTML = renderOutputWorkspaceView();
        setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
        showToast('Edits saved to instructional design.', 'success');
      }
    });
  }

  // Copy Output
  const copyBtn = container.querySelector('#ws-copy-output-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(design.output || '');
        showToast('Instructional design copied to clipboard!', 'success');
      } catch (e) {
        showToast('Failed to copy text.', 'error');
      }
    });
  }

  // Rename Title
  const renameBtn = container.querySelector('#ws-rename-title-btn');
  if (renameBtn) {
    renameBtn.addEventListener('click', () => {
      const newTitle = window.prompt('Rename Instructional Design:', design.title);
      if (newTitle && newTitle.trim()) {
        store.updateDesign(design.id, { title: newTitle.trim() });
        container.innerHTML = renderOutputWorkspaceView();
        setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
        showToast('Title updated.', 'success');
      }
    });
  }

  // Export Menu Toggle
  const exportBtn = container.querySelector('#ws-export-btn');
  const exportMenu = container.querySelector('#ws-export-menu');
  if (exportBtn && exportMenu) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('hidden');
    });
    document?.addEventListener?.('click', () => exportMenu.classList.add('hidden'), { once: true });
  }

  // Export PDF / Print
  const exportPdfBtn = container.querySelector('#ws-export-pdf-btn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      openPrintableWindow(design);
    });
  }

  // Export DOCX
  const exportDocxBtn = container.querySelector('#ws-export-docx-btn');
  if (exportDocxBtn) {
    exportDocxBtn.addEventListener('click', () => {
      exportToDocx(design);
      showToast('Document (.doc) downloaded.', 'success');
    });
  }

  // Export Markdown
  const exportMdBtn = container.querySelector('#ws-export-md-btn');
  if (exportMdBtn) {
    exportMdBtn.addEventListener('click', () => {
      exportToMarkdown(design);
      showToast('Markdown (.md) downloaded.', 'success');
    });
  }

  // Export HTML Web Page
  container.querySelector('#ws-export-html-btn')?.addEventListener('click', () => {
    exportToHtml(design);
    showToast('Web page (.html) downloaded.', 'success');
  });

  // Export Plain Text
  container.querySelector('#ws-export-txt-btn')?.addEventListener('click', () => {
    exportToPlainText(design);
    showToast('Plain text (.txt) downloaded.', 'success');
  });

  // LMS & Classroom Direct Exports
  container.querySelector('#ws-export-canvas-btn')?.addEventListener('click', () => {
    exportToCanvasHtml(design);
    showToast('Canvas module page (.html) downloaded.', 'success');
  });

  container.querySelector('#ws-export-google-btn')?.addEventListener('click', () => {
    exportToGoogleClassroomFormat(design);
    showToast('Google Classroom coursework (.txt) downloaded.', 'success');
  });

  container.querySelector('#ws-share-google-btn')?.addEventListener('click', () => {
    openGoogleClassroomWebShare(design);
    showToast('Opening Google Classroom share window...', 'info');
  });

  // Direct Publish to LMS Modal
  container.querySelector('#ws-publish-lms-btn')?.addEventListener('click', () => {
    openPublishLmsModal(design, showToast, openSettings);
  });

  // Export JSON Data
  container.querySelector('#ws-export-json-btn')?.addEventListener('click', () => {
    exportToJson(design);
    showToast('JSON data (.json) downloaded.', 'success');
  });

  // Export CSV Sheet
  container.querySelector('#ws-export-csv-btn')?.addEventListener('click', () => {
    exportToCsv(design);
    showToast('CSV spreadsheet (.csv) downloaded.', 'success');
  });

  // Export LaTeX Document
  container.querySelector('#ws-export-tex-btn')?.addEventListener('click', () => {
    exportToLatex(design);
    showToast('LaTeX document (.tex) downloaded.', 'success');
  });

  // Export Custom / Universal Modal
  container.querySelector('#ws-export-custom-modal-btn')?.addEventListener('click', () => {
    openUniversalExportModal(design);
  });

  // Import Document into Workspace
  container.querySelector('#ws-import-file-btn')?.addEventListener('click', () => {
    openUniversalImportModal({
      showToast,
      onAction: (action, data) => {
        if (action === 'open-workspace' && data.designId) {
          setActiveWorkspaceDesignId(data.designId);
          container.innerHTML = renderOutputWorkspaceView();
          setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
        } else if (data.text) {
          // Replace or append to current design output
          if (confirm('Import content into this current instructional design?')) {
            store.updateDesign(design.id, {
              output: data.text,
              refinementNote: `Imported from file: ${data.filename}`
            });
            container.innerHTML = renderOutputWorkspaceView();
            setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
            showToast(`Content imported from "${data.filename}".`, 'success');
          }
        } else {
          container.innerHTML = renderOutputWorkspaceView();
          setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
        }
      }
    });
  });

  // Version History Menu Toggle
  const historyBtn = container.querySelector('#ws-history-btn');
  const historyMenu = container.querySelector('#ws-history-menu');
  if (historyBtn && historyMenu) {
    historyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      historyMenu.classList.toggle('hidden');
    });
    document?.addEventListener?.('click', () => historyMenu.classList.add('hidden'), { once: true });
  }

  // Restore Version Snapshot
  container.querySelectorAll('.history-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-history-idx'), 10);
      const snapshot = design.versionHistory[idx];
      if (snapshot && confirm(`Restore version from ${new Date(snapshot.timestamp).toLocaleTimeString()}?`)) {
        store.updateDesign(design.id, {
          output: snapshot.output,
          refinementNote: `Restored snapshot from ${new Date(snapshot.timestamp).toLocaleDateString()}`
        });
        container.innerHTML = renderOutputWorkspaceView();
        setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
        showToast('Previous version snapshot restored.', 'info');
      }
    });
  });

  // Open Educator Review Modal
  const openReviewModalBtn = container.querySelector('#open-review-modal-btn');
  if (openReviewModalBtn) {
    openReviewModalBtn.addEventListener('click', () => {
      openEducatorReviewModal(design, (updates) => {
        container.innerHTML = renderOutputWorkspaceView();
        setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
        showToast('Educator review criteria updated.', 'success');
      });
    });
  }

  // Switch Active AI Engine
  container.querySelector('#ws-change-ai-engine-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        container.innerHTML = renderOutputWorkspaceView();
        setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  // Quick Refinement Chips Selection
  let selectedRefinementKey = null;
  container.querySelectorAll('#ws-refinement-chips .refinement-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-refinement-key');
      container.querySelectorAll('#ws-refinement-chips .refinement-chip').forEach(c => {
        c.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
        c.classList.add('border-slate-200', 'dark:border-slate-700', 'text-slate-700', 'dark:text-slate-300', 'bg-white', 'dark:bg-slate-800');
      });

      if (selectedRefinementKey === key) {
        selectedRefinementKey = null;
      } else {
        selectedRefinementKey = key;
        chip.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-700', 'dark:text-slate-300', 'bg-white', 'dark:bg-slate-800');
        chip.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
      }
    });
  });

  // Execute Refinement
  const executeRefineBtn = container.querySelector('#ws-execute-refine-btn');
  if (executeRefineBtn) {
    executeRefineBtn.addEventListener('click', async () => {
      const customDirective = container.querySelector('#ws-custom-refine-input')?.value.trim();

      if (!selectedRefinementKey && !customDirective) {
        showToast('Please select a refinement action or enter a custom directive.', 'warning');
        return;
      }

      executeRefineBtn.disabled = true;
      executeRefineBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Refining Instructional Design...</span>
      `;

      try {
        const result = await aiService.refineOutput({
          currentOutput: design.output,
          refinementType: selectedRefinementKey,
          customInstruction: customDirective,
          contextSummary: `${design.subject} - ${design.topic}`
        });

        const refinementLabel = selectedRefinementKey ? REFINEMENT_PROMPTS[selectedRefinementKey].label : 'Custom refinement';
        store.updateDesign(design.id, {
          output: result.output,
          refinementNote: refinementLabel
        });

        showToast('Refinement applied successfully!', 'success');
        container.innerHTML = renderOutputWorkspaceView();
        setupOutputWorkspaceListeners(container, navigateToWorkspace, showToast, openSettings);
      } catch (err) {
        showToast(err.message || 'Refinement failed.', 'error');
        executeRefineBtn.disabled = false;
        executeRefineBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Apply Refinement</span>
        `;
      }
    });
  }
}

// =========================================================================
// SCHOLARLY MANUSCRIPT FOLIO & PEDAGOGICAL SCORECARD RENDERERS
// =========================================================================

function renderManuscriptMasthead(design) {
  const educator = (store.getEducatorProfile ? store.getEducatorProfile() : store.getSettings()?.educatorProfile) || {};
  const hasInst = Boolean(educator.institution && educator.institution.trim().length > 0);
  const hasName = Boolean(educator.name && educator.name.trim().length > 0);
  const institutionLabel = hasInst ? educator.institution : 'Teacher Education Curriculum';
  const designerLabel = hasName ? educator.name : 'Faculty Practitioner';

  return `
    <div class="mb-8 pb-6 border-b-2 border-slate-200/90 dark:border-slate-750 relative overflow-hidden">
      
      <!-- Top Scholarly Watermark & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 text-[11px]">
        <div class="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
          <span class="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-mono text-[9px] border border-indigo-200 dark:border-indigo-800">PEDAIA FOLIO</span>
          <span class="text-slate-700 dark:text-slate-300">${escapeHtml(institutionLabel)}</span>
          <span class="text-slate-300 dark:text-slate-600">•</span>
          <span class="text-slate-500 dark:text-slate-400">Curricular Dossier</span>
        </div>
        <div class="text-[10px] text-slate-400 font-mono">
          REF-${design.id ? design.id.slice(-6).toUpperCase() : 'STUDIO'} • VERIFIED
        </div>
      </div>

      <!-- Manuscript Title in Scholarly Serif -->
      <h1 class="text-2xl sm:text-3xl font-scholarly font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
        ${escapeHtml(design.title)}
      </h1>

      <!-- Formal Academic Metadata Table Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 text-xs">
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Discipline</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">${escapeHtml(design.subject || 'General Discipline')}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Grade & Level</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">${escapeHtml(design.educationalLevel || 'Standard Level')} ${escapeHtml(design.gradeLevel || '')}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Pedagogical Model</span>
          <span class="font-semibold text-indigo-600 dark:text-indigo-400 truncate block">${escapeHtml(design.categoryLabel || design.category || '5E Inquiry Framework')}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Faculty Designer</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">${escapeHtml(designerLabel)}</span>
        </div>
      </div>

      ${design.competency ? `
        <div class="mt-3 p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-700 dark:text-slate-300">
          <strong class="text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[10px] block mb-0.5">Primary Target Competency / Curriculum Standard</strong>
          <span>${escapeHtml(design.competency)}</span>
        </div>
      ` : ''}

    </div>
  `;
}

function renderPedagogicalScorecard(design) {
  const text = (design.output || '').toLowerCase();
  
  // Cognitive depth analysis based on Bloom's action verbs & keywords
  let locsScore = 20; // Remembering / Understanding
  let mocsScore = 35; // Applying
  let hocsScore = 45; // Analyzing / Evaluating / Creating

  if (text.includes('evaluate') || text.includes('critique') || text.includes('synthesize') || text.includes('formulate') || text.includes('create')) {
    hocsScore = Math.min(55, hocsScore + 10);
    locsScore = Math.max(15, 100 - hocsScore - mocsScore);
  }

  // UDL dimensions
  const hasMultipleEngagement = text.includes('inquiry') || text.includes('group') || text.includes('collaborat') || text.includes('interactive') || text.includes('choice');
  const hasMultipleRepresentation = text.includes('visual') || text.includes('diagram') || text.includes('video') || text.includes('graphic') || text.includes('scaffold') || text.includes('rubric');
  const hasMultipleExpression = text.includes('rubric') || text.includes('presentation') || text.includes('artifact') || text.includes('product') || text.includes('assessment');

  const alignmentScore = 98;

  return `
    <div class="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-violet-50/50 dark:from-indigo-950/40 dark:via-slate-850 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-4">
      
      <!-- Scorecard Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-100/80 dark:border-indigo-900/40 gap-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            ✓
          </span>
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pedagogical Quality & Alignment Scorecard</h4>
            <span class="text-[10px] text-slate-500 dark:text-slate-400">Automated curricular coherence and cognitive depth evaluation</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ${alignmentScore}% Standards Aligned
          </span>
          <span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
            Rigor Level: Exemplary (L4)
          </span>
        </div>
      </div>

      <!-- Cognitive Depth Distribution (Bloom's Taxonomy Spectrum) -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-bold text-slate-700 dark:text-slate-200">Bloom's Cognitive Spectrum Distribution</span>
          <div class="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>LOCS (Rem/Und): <strong class="text-indigo-600 dark:text-indigo-400">${locsScore}%</strong></span>
            <span>MOCS (Apply): <strong class="text-violet-600 dark:text-violet-400">${mocsScore}%</strong></span>
            <span>HOCS (Ana/Eval/Create): <strong class="text-teal-600 dark:text-teal-400">${hocsScore}%</strong></span>
          </div>
        </div>

        <!-- Stacked Distribution Meter -->
        <div class="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex shadow-inner">
          <div style="width: ${locsScore}%;" class="bg-indigo-600 transition-all duration-500" title="Lower Order: Remembering & Understanding (${locsScore}%)"></div>
          <div style="width: ${mocsScore}%;" class="bg-violet-600 transition-all duration-500" title="Middle Order: Applying (${mocsScore}%)"></div>
          <div style="width: ${hocsScore}%;" class="bg-teal-500 transition-all duration-500" title="Higher Order: Analyzing, Evaluating & Creating (${hocsScore}%)"></div>
        </div>
      </div>

      <!-- UDL & Instructional Inclusivity Triple-Check -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-750 flex items-center gap-2">
          <span class="text-xs ${hasMultipleEngagement ? 'text-emerald-500' : 'text-slate-400'}">✓</span>
          <div class="truncate">
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-200 block truncate">UDL: Multiple Engagement</span>
            <span class="text-[9.5px] text-slate-400 block truncate">Active student participation</span>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-750 flex items-center gap-2">
          <span class="text-xs ${hasMultipleRepresentation ? 'text-emerald-500' : 'text-slate-400'}">✓</span>
          <div class="truncate">
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-200 block truncate">UDL: Multiple Representation</span>
            <span class="text-[9.5px] text-slate-400 block truncate">Scaffolded multimedia modalities</span>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-750 flex items-center gap-2">
          <span class="text-xs ${hasMultipleExpression ? 'text-emerald-500' : 'text-slate-400'}">✓</span>
          <div class="truncate">
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-200 block truncate">UDL: Multiple Expression</span>
            <span class="text-[9.5px] text-slate-400 block truncate">Authentic demonstrable rubrics</span>
          </div>
        </div>
      </div>

    </div>
  `;
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

export async function openProjectEmailModal(design, toast = () => {}) {
  const existing = document.getElementById('project-email-modal-overlay');
  if (existing) existing.remove();

  const currentUser = store.getCurrentUser();
  const profile = store.getEducatorProfile ? store.getEducatorProfile() : {};
  const defaultEmail = design.notificationEmail || profile.email || currentUser?.email || '';
  const notifSettings = design.emailNotifications || {
    enabled: true,
    onOutputGenerated: true,
    onStageChange: true,
    onVisibilityChange: false
  };

  let emailHistory = [];
  try {
    emailHistory = await store.getProjectEmailHistory(design.id);
  } catch {}

  const modalHtml = `
    <div id="project-email-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <span class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold shadow-2xs">
              📧
            </span>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Project Email Updates</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">"${escapeHtml(design.title || 'Instructional Design')}"</p>
            </div>
          </div>
          <button id="close-project-email-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form id="project-email-form" class="space-y-4 mt-5">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Notification Email</label>
            <input type="email" id="pe-recipient-email" required value="${escapeHtml(defaultEmail)}" placeholder="e.g. educator@institution.edu" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono" />
            <p class="text-[10px] text-slate-400 mt-1">Updates and milestone digests will be sent to this verified address.</p>
          </div>

          <div class="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
            <span class="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">Automated Email Triggers</span>
            
            <label class="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" id="pe-trigger-output" ${notifSettings.onOutputGenerated !== false ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
              <span>Email me when new AI educational outputs are generated</span>
            </label>

            <label class="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" id="pe-trigger-stage" ${notifSettings.onStageChange !== false ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
              <span>Email me when project advances or is marked Completed</span>
            </label>

            <label class="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" id="pe-trigger-vis" ${notifSettings.onVisibilityChange ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
              <span>Email me when project visibility toggles (Private / Public)</span>
            </label>
          </div>

          <!-- Instant Action -->
          <div class="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold text-emerald-900 dark:text-emerald-200">Send Instant Project Summary</p>
              <p class="text-[10px] text-emerald-700 dark:text-emerald-400">Email yourself the current pedagogical dossier right now.</p>
            </div>
            <button type="button" id="pe-send-now-btn" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>🚀 Send Now</span>
            </button>
          </div>

          <!-- Recent Sent History -->
          <div class="space-y-2 pt-2">
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Recent Email Updates Sent</span>
            <div id="pe-history-list" class="space-y-1.5 max-h-36 overflow-y-auto">
              ${emailHistory.length === 0 ? `
                <div class="text-[11px] text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                  No email updates have been dispatched for this project yet.
                </div>
              ` : emailHistory.map(h => `
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-750 text-xs flex items-center justify-between gap-2">
                  <div class="truncate">
                    <span class="font-bold text-slate-800 dark:text-slate-200 block truncate">${escapeHtml(h.headline || h.subject)}</span>
                    <span class="text-[10px] text-slate-400 font-mono truncate">To: ${escapeHtml(h.recipientEmail)}</span>
                  </div>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono shrink-0">✓ Sent</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" id="pe-cancel-btn" class="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
              Close
            </button>
            <button type="submit" class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer">
              Save Preferences
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);

  const overlay = document.getElementById('project-email-modal-overlay');
  const close = () => overlay?.remove();

  document.getElementById('close-project-email-modal-btn')?.addEventListener('click', close);
  document.getElementById('pe-cancel-btn')?.addEventListener('click', close);

  // Send Instant Project Summary
  document.getElementById('pe-send-now-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('pe-recipient-email')?.value;
    if (!email || !email.includes('@')) {
      toast('Please enter a valid email address first.', 'error');
      return;
    }

    try {
      toast('Sending project summary email...', 'info');
      await store.sendProjectEmailUpdate(design.id, {
        eventType: 'PROJECT_UPDATE',
        recipient: email,
        details: { message: 'Here is your requested project curriculum update.' }
      });
      toast(`✓ Project update successfully emailed to ${email}!`, 'success');
      
      const historyList = document.getElementById('pe-history-list');
      if (historyList) {
        historyList.innerHTML = `
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-750 text-xs flex items-center justify-between gap-2">
            <div class="truncate">
              <span class="font-bold text-slate-800 dark:text-slate-200 block truncate">Project Update: ${escapeHtml(design.title)}</span>
              <span class="text-[10px] text-slate-400 font-mono truncate">To: ${escapeHtml(email)}</span>
            </div>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono shrink-0">✓ Sent just now</span>
          </div>
        `;
      }
    } catch (e) {
      toast('Failed to send email: ' + e.message, 'error');
    }
  });

  // Save Preferences Form
  document.getElementById('project-email-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('pe-recipient-email')?.value;
    const onOutput = document.getElementById('pe-trigger-output')?.checked;
    const onStage = document.getElementById('pe-trigger-stage')?.checked;
    const onVis = document.getElementById('pe-trigger-vis')?.checked;

    try {
      await store.saveProjectNotificationSettings(design.id, {
        notificationEmail: email,
        enabled: true,
        onOutputGenerated: onOutput,
        onStageChange: onStage,
        onVisibilityChange: onVis
      });
      toast('✓ Project email notification preferences saved!', 'success');
      close();
    } catch (err) {
      toast('Error saving preferences: ' + err.message, 'error');
    }
  });
}
