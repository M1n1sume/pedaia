// PEDAIA Reusable Prompt Template Library with Direct Studio Pre-Population
import { store } from '../state.js';
import { setLessonPlannerState } from './lessonPlanner.js';
import { setActivityDesignerState } from './activityDesigner.js';
import { setQuestioningStudioState } from './questioningStudio.js';
import { setDifferentiationStudioState } from './differentiationStudio.js';

let selectedCategory = 'all';
let searchQuery = '';

export const TEMPLATE_CATEGORIES = [
  'All Categories',
  'Lesson Planning',
  'Activity Design',
  'Questioning',
  'Differentiation',
  'Assessment Design',
  'Classroom Management'
];

export function renderPromptLibraryView() {
  let templates = store.getTemplates();

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    templates = templates.filter(t =>
      (t.name || t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.subjectApplicability || '').toLowerCase().includes(q) ||
      (t.educationalLevels || '').toLowerCase().includes(q)
    );
  }

  if (selectedCategory !== 'all' && selectedCategory !== 'All Categories') {
    templates = templates.filter(t => t.category === selectedCategory);
  }

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <div>
              <h1 class="pedaia-page-title text-slate-900 dark:text-white">Prompt Template Library</h1>
              <p class="pedaia-helper text-slate-500 dark:text-slate-400">Battle-tested instructional design prompt templates that directly populate studio fields</p>
            </div>
          </div>
        </div>

        <button id="lib-create-custom-template-btn" class="px-4 py-2 pedaia-label bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Custom Template</span>
        </button>
      </div>

      <!-- Search & Category Filters Toolbar -->
      <div class="space-y-3 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-2xs">
        <div class="relative">
          <input type="text" id="lib-search-input" value="${escapeHtml(searchQuery)}" placeholder="Search templates by keyword, framework, discipline, or educational level..." class="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
          <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Category Horizontal Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1" id="lib-category-chips">
          ${TEMPLATE_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat || (selectedCategory === 'all' && cat === 'All Categories');
            return `
              <button type="button" data-cat="${cat}" class="lib-cat-chip whitespace-nowrap text-xs px-3 py-1.5 rounded-xl border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'}">
                ${cat}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Templates Scannable Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${templates.map(t => {
          const categoryBadgeColor = {
            'Lesson Planning': 'category-pill-lp',
            'lesson-planning': 'category-pill-lp',
            'Activity Design': 'category-pill-ad',
            'activity-design': 'category-pill-ad',
            'Questioning': 'category-pill-q',
            'questioning': 'category-pill-q',
            'Differentiation': 'category-pill-diff',
            'differentiation': 'category-pill-diff',
            'Assessment Design': 'category-pill-assessment',
            'assessment-design': 'category-pill-assessment',
            'Classroom Management': 'category-pill-classroom',
            'classroom-management': 'category-pill-classroom'
          }[t.category] || {
            'lesson-planning': 'category-pill-lp',
            'activity-design': 'category-pill-ad',
            'questioning': 'category-pill-q',
            'differentiation': 'category-pill-diff',
            'assessment-design': 'category-pill-assessment',
            'classroom-management': 'category-pill-classroom'
          }[t.categoryKey] || 'category-pill-default';

          return `
            <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-5 group">
              <div>
                <!-- Card Header Meta -->
                <div class="flex items-center justify-between mb-2.5 flex-wrap gap-1">
                  <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${categoryBadgeColor}">
                    ${escapeHtml(t.category)}
                  </span>
                  <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    ${escapeHtml(t.educationalLevels || 'All Educational Levels')}
                  </span>
                </div>

                <!-- Template Title -->
                <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5">
                  ${escapeHtml(t.title || t.name)}
                </h3>

                <!-- Short Description -->
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  ${escapeHtml(t.description)}
                </p>

                <!-- Subject Applicability Pill -->
                <div class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Disciplines: <strong>${escapeHtml(t.subjectApplicability || 'All Subjects')}</strong></span>
                </div>

                <!-- Preview Snippet Box -->
                <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 border border-slate-100 dark:border-slate-800">
                  ${escapeHtml(t.previewText || t.promptText || '')}
                </div>
              </div>

              <!-- Card Action Controls -->
              <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-750">
                <!-- Use Template Button (Populates studio fields directly) -->
                <button data-use-id="${t.id}" class="use-template-btn flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>Use Template</span>
                </button>

                <!-- Customize / Full Preview Modal -->
                <button data-customize-id="${t.id}" title="Preview & Customize Template" class="customize-template-btn py-2 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors">
                  <span>Customize</span>
                </button>

                <!-- Copy Prompt Button -->
                <button data-copy-id="${t.id}" title="Copy Prompt Text" class="copy-template-btn p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl transition-colors border border-slate-200 dark:border-slate-700">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

export function setupPromptLibraryListeners(container, navigateTo, showToast) {
  // Search
  container.querySelector('#lib-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    container.innerHTML = renderPromptLibraryView();
    setupPromptLibraryListeners(container, navigateTo, showToast);
  });

  // Category Chips
  container.querySelectorAll('#lib-category-chips .lib-cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.getAttribute('data-cat');
      container.innerHTML = renderPromptLibraryView();
      setupPromptLibraryListeners(container, navigateTo, showToast);
    });
  });

  // USE TEMPLATE: Automatically populates the target studio fields and jumps to the studio!
  container.querySelectorAll('.use-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-use-id');
      const templates = store.getTemplates();
      const tmpl = templates.find(t => t.id === id);
      if (!tmpl) return;

      const catKey = (tmpl.categoryKey || tmpl.category || '').toLowerCase();
      const cfg = tmpl.defaultConfig || {};

      if (catKey.includes('lesson')) {
        setLessonPlannerState(cfg);
        navigateTo('lesson-planning');
        showToast(`Applied "${tmpl.title || tmpl.name}" to AI Lesson Planner!`, 'success');
      } else if (catKey.includes('activity') || catKey.includes('classroom') || catKey.includes('assessment')) {
        setActivityDesignerState(cfg);
        navigateTo('activity-design');
        showToast(`Applied "${tmpl.title || tmpl.name}" to AI Activity Designer!`, 'success');
      } else if (catKey.includes('question')) {
        setQuestioningStudioState(cfg);
        navigateTo('questioning');
        showToast(`Applied "${tmpl.title || tmpl.name}" to AI Questioning Studio!`, 'success');
      } else if (catKey.includes('diff')) {
        setDifferentiationStudioState(cfg);
        navigateTo('differentiation');
        showToast(`Applied "${tmpl.title || tmpl.name}" to AI Differentiation Studio!`, 'success');
      } else {
        // Default to Lesson Planner
        setLessonPlannerState(cfg);
        navigateTo('lesson-planning');
        showToast(`Template loaded into studio!`, 'success');
      }
    });
  });

  // Customize / Preview Modal
  container.querySelectorAll('.customize-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-customize-id');
      const templates = store.getTemplates();
      const tmpl = templates.find(t => t.id === id);
      if (!tmpl) return;

      openCustomizeTemplateModal(tmpl, (customizedPrompt) => {
        navigator.clipboard.writeText(customizedPrompt);
        showToast('Customized prompt copied to clipboard!', 'success');
      }, (appliedConfig) => {
        const catKey = (tmpl.categoryKey || tmpl.category || '').toLowerCase();
        if (catKey.includes('lesson')) {
          setLessonPlannerState(appliedConfig);
          navigateTo('lesson-planning');
        } else if (catKey.includes('activity') || catKey.includes('assessment')) {
          setActivityDesignerState(appliedConfig);
          navigateTo('activity-design');
        } else if (catKey.includes('question')) {
          setQuestioningStudioState(appliedConfig);
          navigateTo('questioning');
        } else if (catKey.includes('diff')) {
          setDifferentiationStudioState(appliedConfig);
          navigateTo('differentiation');
        }
        showToast('Template populated into studio workspace!', 'success');
      });
    });
  });

  // Quick Copy Prompt Button
  container.querySelectorAll('.copy-template-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-copy-id');
      const templates = store.getTemplates();
      const tmpl = templates.find(t => t.id === id);
      if (tmpl && tmpl.promptText) {
        try {
          await navigator.clipboard.writeText(tmpl.promptText);
          showToast('Template prompt copied to clipboard!', 'success');
        } catch (e) {
          showToast('Failed to copy prompt.', 'error');
        }
      }
    });
  });

  // Create Custom Template Modal
  container.querySelector('#lib-create-custom-template-btn')?.addEventListener('click', () => {
    openNewTemplateModal((newTmpl) => {
      store.saveTemplate(newTmpl);
      showToast('New template saved to library!', 'success');
      container.innerHTML = renderPromptLibraryView();
      setupPromptLibraryListeners(container, navigateTo, showToast);
    });
  });
}

function openCustomizeTemplateModal(tmpl, onCopy, onApplyToStudio) {
  const modalHtml = `
    <div id="customize-template-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col max-h-[90vh] transition-colors">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div>
            <div class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">${escapeHtml(tmpl.category)}</div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">${escapeHtml(tmpl.title || tmpl.name)}</h3>
          </div>
          <button id="close-customize-modal-btn" class="p-1 text-slate-400 hover:text-slate-600 rounded">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          <p class="text-slate-600 dark:text-slate-300">${escapeHtml(tmpl.description)}</p>
          
          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300">Editable Prompt Architecture:</label>
            <textarea id="modal-prompt-textarea" class="w-full h-64 p-3 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none leading-relaxed">${escapeHtml(tmpl.promptText || '')}</textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-3">
          <button id="modal-copy-btn" class="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors">
            Copy Prompt
          </button>
          <button id="modal-apply-btn" class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors">
            Load into Studio Workspace
          </button>
        </div>

      </div>
    </div>
  `;

  const existing = document.getElementById('customize-template-modal');
  if (existing) existing.remove();

  const c = document.createElement('div');
  c.innerHTML = modalHtml;
  document.body.appendChild(c.firstElementChild);

  const m = document.getElementById('customize-template-modal');
  document.getElementById('close-customize-modal-btn')?.addEventListener('click', () => m.remove());

  document.getElementById('modal-copy-btn')?.addEventListener('click', () => {
    const text = document.getElementById('modal-prompt-textarea')?.value;
    m.remove();
    if (onCopy) onCopy(text);
  });

  document.getElementById('modal-apply-btn')?.addEventListener('click', () => {
    m.remove();
    if (onApplyToStudio) onApplyToStudio(tmpl.defaultConfig || {});
  });
}

function openNewTemplateModal(onSave) {
  const modalHtml = `
    <div id="new-template-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in transition-colors space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Create Custom Prompt Template</h3>
          <button id="close-new-tmpl-btn" class="p-1 text-slate-400 hover:text-slate-600 rounded">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Template Title</label>
            <input type="text" id="new-tmpl-title" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500" placeholder="e.g. Socratic Seminar Heuristic...">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select id="new-tmpl-category" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 outline-none">
                <option value="Lesson Planning">Lesson Planning</option>
                <option value="Activity Design">Activity Design</option>
                <option value="Questioning">Questioning</option>
                <option value="Differentiation">Differentiation</option>
                <option value="Assessment Design">Assessment Design</option>
                <option value="Classroom Management">Classroom Management</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <input type="text" id="new-tmpl-subject" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 outline-none" placeholder="e.g. Science, All Subjects" value="All Subjects">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
            <input type="text" id="new-tmpl-desc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 outline-none" placeholder="Brief summary of pedagogical purpose...">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Structured Prompt Text</label>
            <textarea id="new-tmpl-prompt" rows="6" class="w-full p-2.5 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500" placeholder="Act as a master educator..."></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button id="cancel-new-tmpl-btn" class="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900">
            Cancel
          </button>
          <button id="save-new-tmpl-btn" class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors">
            Save Template
          </button>
        </div>

      </div>
    </div>
  `;

  const existing = document.getElementById('new-template-modal');
  if (existing) existing.remove();

  const c = document.createElement('div');
  c.innerHTML = modalHtml;
  document.body.appendChild(c.firstElementChild);

  const m = document.getElementById('new-template-modal');
  document.getElementById('close-new-tmpl-btn')?.addEventListener('click', () => m.remove());
  document.getElementById('cancel-new-tmpl-btn')?.addEventListener('click', () => m.remove());

  document.getElementById('save-new-tmpl-btn')?.addEventListener('click', () => {
    const title = document.getElementById('new-tmpl-title')?.value;
    const category = document.getElementById('new-tmpl-category')?.value;
    const subject = document.getElementById('new-tmpl-subject')?.value;
    const desc = document.getElementById('new-tmpl-desc')?.value;
    const promptText = document.getElementById('new-tmpl-prompt')?.value;

    if (!title || !promptText) {
      alert('Title and prompt text are required.');
      return;
    }

    const categoryKeyMap = {
      'Lesson Planning': 'lesson-planning',
      'Activity Design': 'activity-design',
      'Questioning': 'questioning',
      'Differentiation': 'differentiation',
      'Assessment Design': 'activity-design',
      'Classroom Management': 'activity-design'
    };

    m.remove();
    if (onSave) {
      onSave({
        name: title,
        title,
        category,
        categoryKey: categoryKeyMap[category] || 'lesson-planning',
        subjectApplicability: subject,
        description: desc || 'Custom educator prompt template.',
        previewText: promptText.slice(0, 150) + '...',
        promptText
      });
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
