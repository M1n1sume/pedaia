// PEDAIA My Instructional Designs Management View
import { store } from '../state.js';
import { exportToDocx, exportToMarkdown, openPrintableWindow, openUniversalExportModal } from '../exportUtils.js';
import { openUniversalImportModal } from '../importUtils.js';
import { openPublishLmsModal } from './publishLmsModal.js';
import { openShareLinkModal } from './shareLinkModal.js';

let currentSearchTerm = '';
let selectedCategoryFilter = 'all';
let selectedSubjectFilter = 'all';
let selectedLevelFilter = 'all';
let selectedStatusFilter = 'all';
let selectedVisibilityFilter = 'all';
let sortBy = 'date-desc';

export function renderMyDesignsView() {
  let allDesigns = store.getDesigns();

  // Status & Visibility Counts for filters
  const counts = {
    all: allDesigns.filter(d => !d.isArchived).length,
    'Draft': allDesigns.filter(d => d.status === 'Draft' && !d.isArchived).length,
    'Prompt Saved': allDesigns.filter(d => d.status === 'Prompt Saved' && !d.isArchived).length,
    'Output Generated': allDesigns.filter(d => d.status === 'Output Generated' && !d.isArchived).length,
    'Reviewed': allDesigns.filter(d => d.status === 'Reviewed' && !d.isArchived).length,
    'Completed': allDesigns.filter(d => d.status === 'Completed' && !d.isArchived).length,
    'Archived': allDesigns.filter(d => d.isArchived).length,
    public: allDesigns.filter(d => (d.visibility === 'public' || d.isPublic) && !d.isArchived).length,
    private: allDesigns.filter(d => d.visibility !== 'public' && !d.isPublic && !d.isArchived).length
  };

  let designs = [...allDesigns];

  // Visibility filter (Private vs Public)
  if (selectedVisibilityFilter !== 'all') {
    if (selectedVisibilityFilter === 'public') {
      designs = designs.filter(d => d.visibility === 'public' || d.isPublic);
    } else if (selectedVisibilityFilter === 'private') {
      designs = designs.filter(d => d.visibility !== 'public' && !d.isPublic);
    }
  }

  // Status filter
  if (selectedStatusFilter === 'Archived') {
    designs = designs.filter(d => d.isArchived);
  } else {
    // Default excludes archived unless explicitly requested
    designs = designs.filter(d => !d.isArchived);
    if (selectedStatusFilter !== 'all') {
      designs = designs.filter(d => d.status === selectedStatusFilter);
    }
  }

  // Search filter
  if (currentSearchTerm) {
    const q = currentSearchTerm.toLowerCase();
    designs = designs.filter(d =>
      (d.title || '').toLowerCase().includes(q) ||
      (d.topic || '').toLowerCase().includes(q) ||
      (d.subject || '').toLowerCase().includes(q) ||
      (d.competency || '').toLowerCase().includes(q)
    );
  }

  // Category filter
  if (selectedCategoryFilter !== 'all') {
    const normalize = (cat) => (cat || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    designs = designs.filter(d => 
      d.category === selectedCategoryFilter || 
      d.categoryKey === selectedCategoryFilter ||
      normalize(d.category) === normalize(selectedCategoryFilter)
    );
  }

  // Subject filter
  if (selectedSubjectFilter !== 'all') {
    designs = designs.filter(d => d.subject === selectedSubjectFilter);
  }

  // Level filter
  if (selectedLevelFilter !== 'all') {
    designs = designs.filter(d => d.educationalLevel === selectedLevelFilter);
  }

  // Sorting
  designs.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    if (sortBy === 'date-asc') return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
    if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  const allSubjects = Array.from(new Set(allDesigns.map(d => d.subject).filter(Boolean))).sort();
  const allLevels = Array.from(new Set(allDesigns.map(d => d.educationalLevel).filter(Boolean))).sort();

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <div>
              <h1 class="pedaia-page-title text-slate-900 dark:text-white">My Instructional Designs</h1>
              <p class="pedaia-helper text-slate-500 dark:text-slate-400">Manage curriculum dossiers, version snapshots, lifecycle statuses, and multi-format exports</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button id="designs-import-file-btn" class="px-3.5 py-2 pedaia-label bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5" title="Import content from PDF, Word, Markdown, or JSON">
            <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Import Document</span>
          </button>
          
          <button id="designs-new-plan-btn" class="px-4 py-2 pedaia-label bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Design</span>
          </button>
        </div>
      </div>

      <!-- Lifecycle Status Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button class="status-tab-btn px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedStatusFilter === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:border-slate-300'}" data-status="all">
          All Active (${counts.all})
        </button>
        <button class="status-tab-btn px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedStatusFilter === 'Draft' ? 'bg-slate-700 text-white font-bold' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:border-slate-300'}" data-status="Draft">
          Draft (${counts['Draft']})
        </button>
        <button class="status-tab-btn px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedStatusFilter === 'Prompt Saved' ? 'bg-indigo-600 text-white font-bold' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:border-slate-300'}" data-status="Prompt Saved">
          Prompt Saved (${counts['Prompt Saved']})
        </button>
        <button class="status-tab-btn px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedStatusFilter === 'Output Generated' ? 'bg-emerald-600 text-white font-bold' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:border-slate-300'}" data-status="Output Generated">
          Output Generated (${counts['Output Generated']})
        </button>
        <button class="status-tab-btn px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedStatusFilter === 'Reviewed' ? 'bg-purple-600 text-white font-bold' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:border-slate-300'}" data-status="Reviewed">
          Reviewed (${counts['Reviewed']})
        </button>
        <button class="status-tab-btn px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedStatusFilter === 'Completed' ? 'bg-amber-600 text-white font-bold' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:border-slate-300'}" data-status="Completed">
          Completed (${counts['Completed']})
        </button>
        <button class="status-tab-btn px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedStatusFilter === 'Archived' ? 'bg-slate-800 text-white font-bold' : 'bg-white dark:bg-slate-850 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-750 hover:border-slate-300'}" data-status="Archived">
          Archived (${counts['Archived']})
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-4 shadow-2xs space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <!-- Search Input (5 Cols) -->
          <div class="sm:col-span-5 relative">
            <input type="text" id="designs-search-input" value="${escapeHtml(currentSearchTerm)}" placeholder="Search by title, topic, competency, keyword..." class="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
            <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Category Filter (2.5 Cols) -->
          <div class="sm:col-span-2">
            <select id="designs-category-filter" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
              <option value="all" ${selectedCategoryFilter === 'all' ? 'selected' : ''}>All Studios</option>
              <option value="lesson-planning" ${selectedCategoryFilter === 'lesson-planning' ? 'selected' : ''}>Lesson Planning</option>
              <option value="activity-design" ${selectedCategoryFilter === 'activity-design' ? 'selected' : ''}>Activity Design</option>
              <option value="questioning" ${selectedCategoryFilter === 'questioning' ? 'selected' : ''}>Questioning Studio</option>
              <option value="differentiation" ${selectedCategoryFilter === 'differentiation' ? 'selected' : ''}>Differentiation Studio</option>
              <option value="assessment-design" ${selectedCategoryFilter === 'assessment-design' ? 'selected' : ''}>Assessment Design</option>
              <option value="classroom-management" ${selectedCategoryFilter === 'classroom-management' ? 'selected' : ''}>Classroom Management</option>
              <option value="ai-output" ${selectedCategoryFilter === 'ai-output' ? 'selected' : ''}>AI Output Studio</option>
            </select>
          </div>

          <!-- Subject Filter (2.5 Cols) -->
          <div class="sm:col-span-2">
            <select id="designs-subject-filter" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
              <option value="all" ${selectedSubjectFilter === 'all' ? 'selected' : ''}>All Disciplines</option>
              ${allSubjects.map(s => `<option value="${s}" ${selectedSubjectFilter === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>

          <!-- Educational Level Filter (3 Cols) -->
          <div class="sm:col-span-3">
            <select id="designs-level-filter" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
              <option value="all" ${selectedLevelFilter === 'all' ? 'selected' : ''}>All Educational Levels</option>
              ${allLevels.map(l => `<option value="${l}" ${selectedLevelFilter === l ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>

        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-750 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
          <span>Displaying <strong>${designs.length}</strong> instructional designs</span>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span>Access Option:</span>
              <select id="designs-visibility-filter" class="text-xs p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 outline-none">
                <option value="all" ${selectedVisibilityFilter === 'all' ? 'selected' : ''}>All Visibility</option>
                <option value="private" ${selectedVisibilityFilter === 'private' ? 'selected' : ''}>🔒 Private (${counts.private})</option>
                <option value="public" ${selectedVisibilityFilter === 'public' ? 'selected' : ''}>🌐 Public (${counts.public})</option>
              </select>
            </div>
            <div class="flex items-center gap-1.5">
              <span>Sort by:</span>
              <select id="designs-sort-select" class="text-xs p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 outline-none">
                <option value="date-desc" ${sortBy === 'date-desc' ? 'selected' : ''}>Date Revised (Newest)</option>
                <option value="date-asc" ${sortBy === 'date-asc' ? 'selected' : ''}>Date Revised (Oldest)</option>
                <option value="title-asc" ${sortBy === 'title-asc' ? 'selected' : ''}>Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Designs Cards Grid -->
      ${designs.length === 0 ? `
        <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 p-12 text-center max-w-md mx-auto shadow-2xs">
          <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-1">
            ${allDesigns.length === 0 ? 'No Saved Instructional Designs Yet' : 'No Matching Instructional Designs'}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
            ${allDesigns.length === 0 ? 'Start creating your first curriculum plan or activity in any instructional studio.' : 'Try clearing your search terms or status filters.'}
          </p>
          ${allDesigns.length === 0 ? `
            <button data-action="nav" data-dest="lesson-planning" class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5">
              <span>Create Lesson Plan</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          ` : `
            <button id="clear-filters-btn" class="px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors">
              Reset Filters
            </button>
          `}
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${designs.map(d => {
            const versions = d.versionHistory || [];
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
            }[d.category] || {
              'lesson-planning': 'category-pill-lp',
              'activity-design': 'category-pill-ad',
              'questioning': 'category-pill-q',
              'differentiation': 'category-pill-diff',
              'assessment-design': 'category-pill-assessment',
              'classroom-management': 'category-pill-classroom'
            }[d.categoryKey] || 'category-pill-default';

            return `
              <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-5 group">
                <div>
                  
                  <!-- Top Card Meta Bar -->
                  <div class="flex items-center justify-between mb-2.5 flex-wrap gap-1.5">
                    <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${categoryBadgeColor}">
                      ${escapeHtml(d.categoryLabel || d.category)}
                    </span>
                    
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <!-- Project Visibility Option Badge -->
                      ${d.visibility === 'public' || d.isPublic ? `
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 inline-flex items-center gap-1" title="Public Project: Accessible to other educators once completed">
                          <svg class="w-2.5 h-2.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>Public</span>
                        </span>
                      ` : `
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/30 inline-flex items-center gap-1" title="Private Project: Restricted strictly to you">
                          <svg class="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                          <span>Private</span>
                        </span>
                      `}

                      <!-- Real Lifecycle Status Badge -->
                      ${getStatusBadgeHtml(d)}
                    </div>
                  </div>

                  <!-- Title with Inline Rename Trigger -->
                  <div class="flex items-start justify-between gap-1 mb-1.5">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer card-title-click" data-id="${d.id}" title="${escapeHtml(d.title)}">
                      ${escapeHtml(d.title)}
                    </h3>
                    <button class="rename-btn p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" data-id="${d.id}" title="Rename Title">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  <!-- Topic / Competency summary -->
                  <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    ${escapeHtml(d.topic || d.competency || 'Curriculum alignment specification')}
                  </p>

                  <!-- Card Metadata Table -->
                  <div class="text-[11px] text-slate-400 dark:text-slate-500 space-y-1 mb-4 pb-3 border-b border-slate-100 dark:border-slate-750">
                    <div class="flex justify-between">
                      <span>Discipline:</span>
                      <span class="font-medium text-slate-700 dark:text-slate-300">${escapeHtml(d.subject || '')} (${escapeHtml(d.gradeLevel || d.educationalLevel || '')})</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Modality & Time:</span>
                      <span class="font-medium text-slate-700 dark:text-slate-300">${escapeHtml(d.modality || 'Face-to-Face')} • ${escapeHtml(d.duration || '60 mins')}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Last Revised:</span>
                      <span class="text-slate-500 dark:text-slate-400">${new Date(d.updatedAt || d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                </div>

                <!-- Card Functional Controls Bar -->
                <div>
                  
                  <!-- Status Changer & Lock State Control -->
                  <div class="flex items-center justify-between mb-2.5 text-[11px] gap-2">
                    <span class="text-slate-400 dark:text-slate-500 font-medium">Stage & Access:</span>
                    <div class="flex items-center gap-1.5">
                      <select class="status-change-select text-[11px] font-semibold py-0.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none" data-id="${d.id}">
                        <option value="Draft" ${d.status === 'Draft' ? 'selected' : ''}>🔒 Draft (WIP Locked)</option>
                        <option value="Prompt Saved" ${d.status === 'Prompt Saved' ? 'selected' : ''}>🔒 Prompt Saved (WIP Locked)</option>
                        <option value="Output Generated" ${d.status === 'Output Generated' ? 'selected' : ''}>🔒 Output Ready (WIP Locked)</option>
                        <option value="Reviewed" ${d.status === 'Reviewed' ? 'selected' : ''}>🔒 Reviewed (WIP Locked)</option>
                        <option value="Completed" ${d.status === 'Completed' ? 'selected' : ''}>✓ Completed (Unlocked)</option>
                      </select>
                      ${d.status === 'Completed' ? `
                        <button class="toggle-wip-btn px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded border border-amber-200 dark:border-amber-800 transition-colors" data-id="${d.id}" title="Revert to WIP (Locks project from other users)">
                          🔒 Lock
                        </button>
                      ` : `
                        <button class="toggle-complete-btn px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded border border-emerald-200 dark:border-emerald-800 transition-colors" data-id="${d.id}" title="Mark Completed (Unlocks project for other users to view)">
                          ✓ Unlock
                        </button>
                      `}
                    </div>
                  </div>

                  <!-- Project Visibility Option Row -->
                  <div class="flex items-center justify-between mb-2.5 text-[11px] gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-750">
                    <span class="text-slate-400 dark:text-slate-500 font-medium">Project Visibility:</span>
                    <button class="toggle-visibility-btn px-2.5 py-0.5 text-[11px] font-semibold rounded-lg border transition-colors inline-flex items-center gap-1.5 ${d.visibility === 'public' || d.isPublic ? 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'}" data-id="${d.id}" title="${d.visibility === 'public' || d.isPublic ? 'Currently Public: Click to set to Private' : 'Currently Private: Click to set to Public'}">
                      ${d.visibility === 'public' || d.isPublic ? `
                        <svg class="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>🌐 Public (Shared)</span>
                      ` : `
                        <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        <span>🔒 Private (Only You)</span>
                      `}
                    </button>
                  </div>

                  <div class="flex items-center gap-1.5 pt-1">
                    <!-- Open / Edit in Studio Workspace -->
                    <button data-open-id="${d.id}" class="open-btn flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1">
                      <span>Open Studio</span>
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>

                    <!-- Export Modal Button -->
                    <button data-export-id="${d.id}" title="Export to Any File Format" class="export-btn p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>

                    <!-- Publish to LMS / Digital Classroom Button -->
                    <button data-lms-id="${d.id}" title="Publish to Canvas LMS or Google Classroom" class="lms-publish-btn p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </button>

                    <!-- Duplicate Design Button -->
                    <button data-duplicate-id="${d.id}" title="Duplicate Design" class="duplicate-btn p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <!-- Share Direct Link Button -->
                    <button data-share-id="${d.id}" title="Share Direct Link" class="share-btn p-1.5 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>

                    <!-- Send Project Update to Email Button -->
                    <button data-email-id="${d.id}" title="Send Project Update to Email" class="email-btn p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <!-- Version History Modal Button -->
                    ${versions.length > 0 ? `
                      <button data-history-id="${d.id}" title="Version History (${versions.length} snapshots)" class="history-btn p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    ` : ''}

                    <!-- Archive / Unarchive Button -->
                    <button data-archive-id="${d.id}" title="${d.isArchived ? 'Unarchive Design' : 'Archive Design'}" class="archive-btn p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>

                    <!-- Delete Button -->
                    <button data-delete-id="${d.id}" title="Delete Design" class="delete-btn p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      `}

    </div>
  `;
}

function getStatusBadgeHtml(d) {
  const status = d.status || 'Draft';
  
  if (status === 'Reviewed') {
    return `
      <span class="status-pill-reviewed text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
        <svg class="w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <span>Reviewed • WIP Locked</span>
        ${d.reviewScore ? `<span class="opacity-80">(${d.reviewScore}/7)</span>` : ''}
      </span>
    `;
  }
  
  if (status === 'Completed') {
    return `
      <span class="status-pill-completed text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
        <svg class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>✓ Completed • Unlocked</span>
      </span>
    `;
  }

  if (status === 'Output Generated') {
    return `
      <span class="status-pill-output-generated text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
        <svg class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <span>Output Ready • WIP Locked</span>
      </span>
    `;
  }

  if (status === 'Prompt Saved') {
    return `
      <span class="status-pill-prompt-saved text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
        <svg class="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <span>Prompt Saved • WIP Locked</span>
      </span>
    `;
  }

  // Default: Draft
  return `
    <span class="status-pill-draft text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
      <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      <span>Draft • WIP Locked</span>
    </span>
  `;
}

export function setupMyDesignsListeners(container, navigateToWorkspace, showToast) {
  // Import any file
  container.querySelector('#designs-import-file-btn')?.addEventListener('click', () => {
    openUniversalImportModal({
      showToast,
      onAction: (action, data) => {
        if (action === 'open-workspace' && data.designId) {
          navigateToWorkspace('workspace', data.designId);
        } else {
          container.innerHTML = renderMyDesignsView();
          setupMyDesignsListeners(container, navigateToWorkspace, showToast);
        }
      }
    });
  });

  // Create new plan
  container.querySelector('#designs-new-plan-btn')?.addEventListener('click', () => {
    navigateToWorkspace('lesson-planning');
  });

  // Search input
  container.querySelector('#designs-search-input')?.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    container.innerHTML = renderMyDesignsView();
    setupMyDesignsListeners(container, navigateToWorkspace, showToast);
  });

  // Category filter
  container.querySelector('#designs-category-filter')?.addEventListener('change', (e) => {
    selectedCategoryFilter = e.target.value;
    container.innerHTML = renderMyDesignsView();
    setupMyDesignsListeners(container, navigateToWorkspace, showToast);
  });

  // Subject filter
  container.querySelector('#designs-subject-filter')?.addEventListener('change', (e) => {
    selectedSubjectFilter = e.target.value;
    container.innerHTML = renderMyDesignsView();
    setupMyDesignsListeners(container, navigateToWorkspace, showToast);
  });

  // Level filter
  container.querySelector('#designs-level-filter')?.addEventListener('change', (e) => {
    selectedLevelFilter = e.target.value;
    container.innerHTML = renderMyDesignsView();
    setupMyDesignsListeners(container, navigateToWorkspace, showToast);
  });

  // Sort select
  container.querySelector('#designs-sort-select')?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    container.innerHTML = renderMyDesignsView();
    setupMyDesignsListeners(container, navigateToWorkspace, showToast);
  });

  // Status Tab Buttons
  container.querySelectorAll('.status-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedStatusFilter = btn.getAttribute('data-status');
      container.innerHTML = renderMyDesignsView();
      setupMyDesignsListeners(container, navigateToWorkspace, showToast);
    });
  });

  // Reset filters button
  container.querySelector('#clear-filters-btn')?.addEventListener('click', () => {
    currentSearchTerm = '';
    selectedCategoryFilter = 'all';
    selectedSubjectFilter = 'all';
    selectedLevelFilter = 'all';
    selectedStatusFilter = 'all';
    container.innerHTML = renderMyDesignsView();
    setupMyDesignsListeners(container, navigateToWorkspace, showToast);
  });

  // Open Design Buttons
  container.querySelectorAll('.open-btn, .card-title-click').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-id') || btn.getAttribute('data-id');
      if (id) {
        navigateToWorkspace('workspace', id);
      }
    });
  });

  // Rename Button
  container.querySelectorAll('.rename-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const design = store.getDesignById(id);
      if (design) {
        const newTitle = window.prompt('Enter new title for this design:', design.title);
        if (newTitle && newTitle.trim()) {
          store.updateDesign(id, { title: newTitle.trim() });
          showToast('Design title updated.', 'success');
          container.innerHTML = renderMyDesignsView();
          setupMyDesignsListeners(container, navigateToWorkspace, showToast);
        }
      }
    });
  });

  // Status Change Selector
  container.querySelectorAll('.status-change-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.getAttribute('data-id');
      const newStatus = e.target.value;
      store.updateDesign(id, { status: newStatus });
      if (newStatus === 'Completed') {
        showToast('Project marked as Completed: Unlocked for other educators to access.', 'success');
      } else {
        showToast(`Project stage set to "${newStatus}": Locked as Work In Progress.`, 'info');
      }
      container.innerHTML = renderMyDesignsView();
      setupMyDesignsListeners(container, navigateToWorkspace, showToast);
    });
  });

  // Quick Toggle Completed (Unlock)
  container.querySelectorAll('.toggle-complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      store.updateDesign(id, { status: 'Completed' });
      showToast('Project marked as Completed: Unlocked for other educators to access.', 'success');
      container.innerHTML = renderMyDesignsView();
      setupMyDesignsListeners(container, navigateToWorkspace, showToast);
    });
  });

  // Quick Toggle WIP (Lock)
  container.querySelectorAll('.toggle-wip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      store.updateDesign(id, { status: 'Draft' });
      showToast('Project reverted to Work In Progress: Locked from other viewers.', 'info');
      container.innerHTML = renderMyDesignsView();
      setupMyDesignsListeners(container, navigateToWorkspace, showToast);
    });
  });

  // Toggle Visibility Button (Private vs Public)
  container.querySelectorAll('.toggle-visibility-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const design = store.getDesignById(id);
      if (design) {
        const isPub = design.visibility === 'public' || design.isPublic;
        const nextVis = isPub ? 'private' : 'public';
        store.updateDesign(id, { visibility: nextVis, isPublic: !isPub });
        showToast(nextVis === 'public' ? 'Project is now Public: Other educators can view this once completed.' : 'Project is now Private: Restricted strictly to you.', 'info');
        container.innerHTML = renderMyDesignsView();
        setupMyDesignsListeners(container, navigateToWorkspace, showToast);
      }
    });
  });

  // Visibility Filter Dropdown
  container.querySelector('#designs-visibility-filter')?.addEventListener('change', (e) => {
    selectedVisibilityFilter = e.target.value;
    container.innerHTML = renderMyDesignsView();
    setupMyDesignsListeners(container, navigateToWorkspace, showToast);
  });

  // Send Project Update Email Button
  container.querySelectorAll('.email-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-email-id');
      const design = store.getDesignById(id);
      if (design) {
        const { openProjectEmailModal } = await import('./outputWorkspace.js');
        openProjectEmailModal(design, showToast);
      }
    });
  });

  // Duplicate Button
  container.querySelectorAll('.duplicate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-duplicate-id');
      const copy = store.duplicateDesign(id);
      if (copy) {
        showToast(`Duplicated as "${copy.title}"`, 'success');
        container.innerHTML = renderMyDesignsView();
        setupMyDesignsListeners(container, navigateToWorkspace, showToast);
      }
    });
  });

  // Share Direct Link Button
  container.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-share-id');
      const design = store.getDesignById(id);
      if (design) {
        openShareLinkModal({ item: design, type: 'design', showToast });
      }
    });
  });

  // Export Button
  container.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-export-id');
      const design = store.getDesignById(id);
      if (design) {
        openUniversalExportModal({
          title: design.title,
          markdown: design.output || '',
          subject: design.subject,
          gradeLevel: design.gradeLevel,
          showToast
        });
      }
    });
  });

  // LMS & Digital Classroom Publish Button
  container.querySelectorAll('.lms-publish-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-lms-id');
      const design = store.getDesignById(id);
      if (design) {
        openPublishLmsModal(design, showToast, () => navigateToWorkspace('settings', 'lms'));
      }
    });
  });

  // Archive / Unarchive Button
  container.querySelectorAll('.archive-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-archive-id');
      const design = store.getDesignById(id);
      if (design) {
        if (design.isArchived) {
          store.unarchiveDesign(id);
          showToast('Design restored from archive.', 'success');
        } else {
          store.archiveDesign(id);
          showToast('Design moved to archive.', 'info');
        }
        container.innerHTML = renderMyDesignsView();
        setupMyDesignsListeners(container, navigateToWorkspace, showToast);
      }
    });
  });

  // Version History Modal Button
  container.querySelectorAll('.history-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-history-id');
      const design = store.getDesignById(id);
      if (design) {
        openVersionHistoryModal(design, (restoredIdx) => {
          store.revertDesignVersion(id, restoredIdx);
          showToast('Reverted to selected version snapshot!', 'success');
          container.innerHTML = renderMyDesignsView();
          setupMyDesignsListeners(container, navigateToWorkspace, showToast);
        });
      }
    });
  });

  // Delete Button
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-id');
      const design = store.getDesignById(id);
      if (design && confirm(`Are you sure you want to delete "${design.title}"?`)) {
        store.deleteDesign(id);
        showToast('Design deleted.', 'info');
        container.innerHTML = renderMyDesignsView();
        setupMyDesignsListeners(container, navigateToWorkspace, showToast);
      }
    });
  });
}

function openVersionHistoryModal(design, onRevert) {
  const versions = design.versionHistory || [];
  const modalHtml = `
    <div id="version-history-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in transition-colors">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Version History</h3>
          </div>
          <button id="close-history-modal-btn" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
          ${versions.map((v, i) => `
            <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between gap-3">
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white">${escapeHtml(v.note || `Snapshot ${versions.length - i}`)}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">${new Date(v.timestamp).toLocaleString()}</div>
              </div>
              <button class="revert-snapshot-btn px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 rounded-lg transition-colors" data-idx="${i}">
                Restore
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('version-history-modal');
  if (existing) existing.remove();

  const c = document.createElement('div');
  c.innerHTML = modalHtml;
  document.body.appendChild(c.firstElementChild);

  const m = document.getElementById('version-history-modal');
  document.getElementById('close-history-modal-btn')?.addEventListener('click', () => m.remove());

  m.querySelectorAll('.revert-snapshot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      m.remove();
      if (onRevert) onRevert(idx);
    });
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
