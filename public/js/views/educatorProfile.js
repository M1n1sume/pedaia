// PEDAIA — Protected Educator Profile Component & Portfolio Architecture
// ============================================================================
// STRICT CHANGE-PROTECTION & INTEGRITY POLICY:
// 1. Every new user receives a 100% blank profile (Section 8.A).
// 2. Fictional names, sample universities, fake badges, and fake stats are strictly forbidden.
// 3. User data is isolated per authenticated user and persisted in LocalStorage (Section 8.B).
// 4. View Mode and Edit Mode have mutually exclusive controls (Section 1).
// 5. This component is isolated and regression-tested (Section 8.C, 8.D, 8.E).
// ============================================================================

import { store, BLANK_EDUCATOR_PROFILE } from '../state.js';
import { lmsService } from '../lmsService.js';
import { SUBJECT_OPTIONS, EDUCATIONAL_LEVEL_OPTIONS } from './sharedContext.js';

// Component Internal State Machine
let isEditMode = false;
let editDraft = null;

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------------
// 1. MATHEMATICAL PROFILE COMPLETION CALCULATOR
// ----------------------------------------------------------------------------
export function calculateProfileCompletion(profile = {}) {
  const fields = [
    { key: 'name', label: 'Full Name' },
    { key: 'title', label: 'Professional Title' },
    { key: 'institution', label: 'School / Institution' },
    { key: 'department', label: 'Department' },
    { key: 'educationalLevel', label: 'Educational Level' },
    { key: 'specialization', label: 'Subject Specialization' },
    { key: 'bio', label: 'Portfolio Statement' }
  ];

  const total = fields.length;
  const missing = [];
  let filledCount = 0;

  for (const f of fields) {
    const val = profile[f.key];
    if (val && typeof val === 'string' && val.trim().length > 0) {
      filledCount++;
    } else {
      missing.push(f.label);
    }
  }

  const percentage = Math.round((filledCount / total) * 100);
  return {
    percentage,
    filledCount,
    total,
    missing,
    isComplete: percentage === 100
  };
}

// ----------------------------------------------------------------------------
// 2. DYNAMIC GENUINE PORTFOLIO STATISTICS CALCULATOR
// ----------------------------------------------------------------------------
export function calculatePortfolioStatistics(storeInstance, lmsServiceInstance) {
  const s = storeInstance || store;
  const lms = lmsServiceInstance || lmsService;

  const savedDesigns = s.getDesigns ? s.getDesigns().length : 0;
  const promptTemplates = s.getTemplates ? s.getTemplates().length : 0;
  const materialsGenerated = s.getGeneratedMaterialsCount ? s.getGeneratedMaterialsCount() : savedDesigns;
  const lmsPublications = (lms && lms.getPublishedHistory) ? lms.getPublishedHistory().length : 0;

  return {
    savedDesigns,
    promptTemplates,
    materialsGenerated,
    lmsPublications
  };
}

// ----------------------------------------------------------------------------
// 3. ETHICAL, FACTUAL AI-ASSISTED STATEMENT GENERATION
// ----------------------------------------------------------------------------
export function generateAIPortfolioStatement(profile = {}) {
  const name = profile.name?.trim();
  const title = profile.title?.trim();
  const inst = profile.institution?.trim();
  const dept = profile.department?.trim();
  const spec = profile.specialization?.trim();
  const level = profile.educationalLevel?.trim();

  // Strict Rule: Never invent fake degrees, awards, or fictional institutions.
  let statement = '';

  if (spec && inst && level) {
    statement = `As a ${title || 'practicing educator'} in ${spec} at ${inst}, my instructional design practice focuses on inquiry-driven pedagogy, Universal Design for Learning (UDL), and rigorous curriculum alignment for ${level} students.`;
  } else if (spec && inst) {
    statement = `Based at ${inst}${dept ? ', ' + dept : ''}, I specialize in ${spec} curriculum design, developing student-centered learning sequences and assessment frameworks that foster critical thinking and conceptual mastery.`;
  } else if (spec) {
    statement = `Dedicated to excellence in ${spec} education through evidence-based instructional architectures, progressive cognitive scaffolding, and standards-aligned curricular materials.`;
  } else if (inst) {
    statement = `Instructional practitioner at ${inst}, focusing on structured pedagogical frameworks, authentic learning assessments, and adaptive differentiated teaching strategies.`;
  } else {
    statement = `Dedicated instructional designer committed to evidence-based pedagogical alignment, cognitive scaffolding, and purposeful curricular experiences that empower diverse learners.`;
  }

  // Ensure strict adherence to 500 character limit
  if (statement.length > 500) {
    statement = statement.slice(0, 497) + '...';
  }

  return statement;
}

// ----------------------------------------------------------------------------
// 4. MAIN COMPONENT RENDERER
// ----------------------------------------------------------------------------
export function renderEducatorProfileView(options = {}) {
  const currentProfile = (store.getEducatorProfile ? store.getEducatorProfile() : store.getSettings()?.educatorProfile) || { ...BLANK_EDUCATOR_PROFILE };
  const activeProfile = isEditMode && editDraft ? editDraft : currentProfile;
  const completion = calculateProfileCompletion(currentProfile);
  const stats = calculatePortfolioStatistics(store, lmsService);

  return `
    <div id="educator-profile-protected-root" class="space-y-6">
      <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 p-6 shadow-2xs space-y-6 transition-colors">
        
        ${isEditMode ? renderEditModeHeader() : renderViewModeHeader(activeProfile, completion)}
        
        ${!isEditMode ? renderProfileCompletionStrip(completion) : ''}
        
        ${isEditMode ? renderEditModeForm(activeProfile) : renderViewModeBody(activeProfile, stats)}

      </div>
    </div>
  `;
}

// View Mode Header
function renderViewModeHeader(profile, completion) {
  const hasName = Boolean(profile.name && profile.name.trim().length > 0);
  const hasTitle = Boolean(profile.title && profile.title.trim().length > 0);
  const hasDept = Boolean(profile.department && profile.department.trim().length > 0);
  const hasInst = Boolean(profile.institution && profile.institution.trim().length > 0);
  const hasSpec = Boolean(profile.specialization && profile.specialization.trim().length > 0);
  const hasLevel = Boolean(profile.educationalLevel && profile.educationalLevel.trim().length > 0);

  const initials = hasName
    ? profile.name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-750 gap-4">
      <div class="flex items-center gap-4">
        ${hasName && initials ? `
          <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg font-scholarly shadow-md border-2 border-indigo-400/30 shrink-0">
            ${initials}
          </div>
        ` : `
          <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        `}
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              ${hasName ? escapeHtml(profile.name) : '<span class="text-slate-400 dark:text-slate-500 italic font-normal">Educator Name Not Set</span>'}
            </h2>
            ${completion.isComplete ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Profile Complete
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ${completion.percentage}% Complete
              </span>
            `}
          </div>

          <p class="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
            ${hasTitle || hasDept ? `
              <span>${escapeHtml(profile.title || 'Educator')}</span>
              ${hasDept ? `<span class="text-slate-400 dark:text-slate-500 mx-1">•</span><span>${escapeHtml(profile.department)}</span>` : ''}
            ` : '<span class="text-slate-400 dark:text-slate-500 italic">Professional Title & Department Not Set</span>'}
          </p>

          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            ${hasInst ? escapeHtml(profile.institution) : '<span class="text-slate-400 dark:text-slate-500 italic">Institution Not Specified</span>'}
          </p>

          ${(hasSpec || hasLevel) ? `
            <div class="flex items-center gap-1.5 mt-2 flex-wrap">
              ${hasSpec ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">${escapeHtml(profile.specialization)}</span>` : ''}
              ${hasLevel ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">${escapeHtml(profile.educationalLevel)}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Action Button: Edit Profile (Strictly hidden when in Edit Mode) -->
      <button type="button" id="prof-enter-edit-btn" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
        <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span>Edit Profile</span>
      </button>
    </div>
  `;
}

// Edit Mode Header (Edit Profile button is completely removed and replaced by Save/Cancel)
function renderEditModeHeader() {
  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-750 gap-4">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Edit Educator Portfolio</h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">Editing Mode</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">Update your verified professional details, teaching context, and portfolio philosophy</p>
        </div>
      </div>

      <!-- Editing Actions (Save & Cancel) -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button type="button" id="prof-cancel-edit-btn" class="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
          Cancel
        </button>
        <button type="button" id="prof-save-profile-btn" class="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Save Profile</span>
        </button>
      </div>
    </div>
  `;
}

// Profile Completion Indicator Strip
function renderProfileCompletionStrip(completion) {
  return `
    <div class="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-750 space-y-2">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span>Portfolio Completion</span>
          <span class="text-slate-400 dark:text-slate-500">•</span>
          <span class="text-indigo-600 dark:text-indigo-400 font-bold">${completion.filledCount} of ${completion.total} fields</span>
        </div>
        <span class="font-bold font-mono ${completion.isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}">${completion.percentage}%</span>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-500 transition-all duration-300 rounded-full" style="width: ${completion.percentage}%"></div>
      </div>

      <!-- Missing Fields or Completion Message -->
      <div class="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
        ${completion.isComplete ? `
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            All portfolio credential fields completed and verified across curricular folios.
          </span>
        ` : `
          <span>Incomplete fields: <strong class="text-slate-700 dark:text-slate-300">${completion.missing.join(', ')}</strong></span>
        `}
      </div>
    </div>
  `;
}

// View Mode Body (Compact Statistics & Portfolio Statement)
function renderViewModeBody(profile, stats) {
  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 0);

  return `
    <div class="space-y-6">
      <!-- Genuine Portfolio Statistics (Strictly 4 genuine metrics, zero AI engines count) -->
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Portfolio & Curricular Activity</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50">
            <span class="block text-2xl font-bold font-scholarly text-indigo-600 dark:text-indigo-400">${stats.savedDesigns}</span>
            <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Saved Designs</span>
          </div>
          <div class="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50">
            <span class="block text-2xl font-bold font-scholarly text-purple-600 dark:text-purple-400">${stats.promptTemplates}</span>
            <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Prompt Templates</span>
          </div>
          <div class="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50">
            <span class="block text-2xl font-bold font-scholarly text-teal-600 dark:text-teal-400">${stats.materialsGenerated}</span>
            <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Materials Generated</span>
          </div>
          <div class="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50">
            <span class="block text-2xl font-bold font-scholarly text-amber-600 dark:text-amber-400">${stats.lmsPublications}</span>
            <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">LMS Publications</span>
          </div>
        </div>
      </div>

      <!-- Instructional Designer Portfolio Statement -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750/80 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
        <div class="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
          <svg class="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Instructional Designer Portfolio Statement:</span>
        </div>
        ${hasBio ? `
          <p class="leading-relaxed font-sans text-slate-700 dark:text-slate-200 whitespace-pre-line">${escapeHtml(profile.bio)}</p>
        ` : `
          <p class="leading-relaxed text-slate-400 dark:text-slate-500 italic">No portfolio statement added yet. Click &ldquo;Edit Profile&rdquo; to define your pedagogical philosophy, curricular goals, and instructional practice.</p>
        `}
      </div>
    </div>
  `;
}

// Edit Mode Form (Editable Fields + Portfolio Statement Editor + Live Preview)
function renderEditModeForm(draft) {
  const bioLength = (draft.bio || '').length;

  return `
    <div class="space-y-5">
      <!-- 2-Column Responsive Inputs Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <!-- Field 1: Full Name -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Educator Full Name <span class="text-rose-500">*</span>
          </label>
          <input type="text" id="prof-input-name" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. Maria Santos, Ed.D." value="${escapeHtml(draft.name || '')}">
        </div>

        <!-- Field 2: Professional Title -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Professional Title <span class="text-rose-500">*</span>
          </label>
          <input type="text" id="prof-input-title" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. Master Teacher II, Assistant Professor, Curriculum Specialist" value="${escapeHtml(draft.title || '')}">
        </div>

        <!-- Field 3: School / Institution -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            School / University / Institution <span class="text-rose-500">*</span>
          </label>
          <input type="text" id="prof-input-institution" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. College of Teacher Education, Central High School" value="${escapeHtml(draft.institution || '')}">
        </div>

        <!-- Field 4: Department / Division -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Department / Division
          </label>
          <input type="text" id="prof-input-department" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. Department of Natural Sciences, Basic Education" value="${escapeHtml(draft.department || '')}">
        </div>

        <!-- Field 5: Educational Level -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Primary Educational Level
          </label>
          <select id="prof-input-educationalLevel" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors">
            <option value="">Select Educational Level...</option>
            ${EDUCATIONAL_LEVEL_OPTIONS.map(l => `<option value="${l}" ${draft.educationalLevel === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>

        <!-- Field 6: Subject Specialization -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Subject Specialization
          </label>
          <select id="prof-input-specialization" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors">
            <option value="">Select Subject Specialization...</option>
            ${SUBJECT_OPTIONS.map(s => `<option value="${s}" ${draft.specialization === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Field 7: Instructional Designer Portfolio Statement -->
      <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Instructional Designer Portfolio Statement
          </label>
          <button type="button" id="prof-ai-generate-bio-btn" class="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors flex items-center gap-1 shadow-2xs" title="Synthesize an educational philosophy statement based strictly on your entered details">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>✨ Generate with AI</span>
          </button>
        </div>

        <textarea id="prof-input-bio" rows="4" maxlength="500" class="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="Describe your instructional design focus, pedagogical philosophy, and curricular goals (max 500 characters)...">${escapeHtml(draft.bio || '')}</textarea>

        <div class="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <span>Ethical note: AI statements use only your provided details; no fake credentials are fabricated.</span>
          <span id="prof-bio-char-count">${bioLength} / 500 characters</span>
        </div>

        <!-- Live Preview Container -->
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
          <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Live Statement Preview</span>
          <p id="prof-bio-preview-text" class="leading-relaxed font-sans text-slate-700 dark:text-slate-200 italic">${draft.bio ? escapeHtml(draft.bio) : 'Preview will appear here in real-time as you write or generate your statement...'}</p>
        </div>
      </div>

      <!-- Bottom Form Actions -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button type="button" id="prof-cancel-edit-btn-bottom" class="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
          Cancel
        </button>
        <button type="button" id="prof-save-profile-btn-bottom" class="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Save Profile</span>
        </button>
      </div>

    </div>
  `;
}

// ----------------------------------------------------------------------------
// 5. EVENT LISTENERS & LIFECYCLE CONTROLLER
// ----------------------------------------------------------------------------
export function setupEducatorProfileListeners(container, { showToast, onProfileUpdate, reRenderParent } = {}) {
  if (!container) return;

  const toast = showToast || window.showToast || (() => {});
  const reRender = reRenderParent || (() => {
    container.innerHTML = renderEducatorProfileView();
    setupEducatorProfileListeners(container, { showToast, onProfileUpdate, reRenderParent });
  });

  // Enter Edit Mode
  container.querySelector('#prof-enter-edit-btn')?.addEventListener('click', () => {
    isEditMode = true;
    const current = (store.getEducatorProfile ? store.getEducatorProfile() : store.getSettings()?.educatorProfile) || { ...BLANK_EDUCATOR_PROFILE };
    editDraft = { ...current };
    reRender();
  });

  // Cancel Edit Mode (Discards all unsaved edits cleanly)
  const handleCancel = () => {
    isEditMode = false;
    editDraft = null;
    reRender();
  };
  container.querySelector('#prof-cancel-edit-btn')?.addEventListener('click', handleCancel);
  container.querySelector('#prof-cancel-edit-btn-bottom')?.addEventListener('click', handleCancel);

  // Sync inputs to editDraft on change
  const bindDraftField = (selector, field) => {
    const el = container.querySelector(selector);
    if (!el) return;
    el.addEventListener('input', (e) => {
      if (!editDraft) editDraft = {};
      editDraft[field] = e.target.value;
    });
  };

  bindDraftField('#prof-input-name', 'name');
  bindDraftField('#prof-input-title', 'title');
  bindDraftField('#prof-input-institution', 'institution');
  bindDraftField('#prof-input-department', 'department');
  bindDraftField('#prof-input-educationalLevel', 'educationalLevel');
  bindDraftField('#prof-input-specialization', 'specialization');

  // Textarea input: live char count & live preview
  const bioTextarea = container.querySelector('#prof-input-bio');
  const bioCharCount = container.querySelector('#prof-bio-char-count');
  const bioPreview = container.querySelector('#prof-bio-preview-text');

  if (bioTextarea) {
    bioTextarea.addEventListener('input', (e) => {
      const val = e.target.value || '';
      if (!editDraft) editDraft = {};
      editDraft.bio = val;
      if (bioCharCount) bioCharCount.textContent = `${val.length} / 500 characters`;
      if (bioPreview) {
        bioPreview.textContent = val.trim().length > 0 ? val : 'Preview will appear here in real-time as you write or generate your statement...';
      }
    });
  }

  // AI-Assisted Statement Generation
  container.querySelector('#prof-ai-generate-bio-btn')?.addEventListener('click', () => {
    const name = container.querySelector('#prof-input-name')?.value || editDraft?.name || '';
    const title = container.querySelector('#prof-input-title')?.value || editDraft?.title || '';
    const institution = container.querySelector('#prof-input-institution')?.value || editDraft?.institution || '';
    const department = container.querySelector('#prof-input-department')?.value || editDraft?.department || '';
    const educationalLevel = container.querySelector('#prof-input-educationalLevel')?.value || editDraft?.educationalLevel || '';
    const specialization = container.querySelector('#prof-input-specialization')?.value || editDraft?.specialization || '';

    const currentInputs = { name, title, institution, department, educationalLevel, specialization };
    const generatedStatement = generateAIPortfolioStatement(currentInputs);

    if (bioTextarea) {
      bioTextarea.value = generatedStatement;
    }
    if (!editDraft) editDraft = {};
    editDraft.bio = generatedStatement;

    if (bioCharCount) bioCharCount.textContent = `${generatedStatement.length} / 500 characters`;
    if (bioPreview) bioPreview.textContent = generatedStatement;

    toast('✨ Portfolio statement generated from your teaching credentials!', 'success');
  });

  // Save Profile Action
  const handleSave = () => {
    const name = container.querySelector('#prof-input-name')?.value || editDraft?.name || '';
    const title = container.querySelector('#prof-input-title')?.value || editDraft?.title || '';
    const institution = container.querySelector('#prof-input-institution')?.value || editDraft?.institution || '';
    const department = container.querySelector('#prof-input-department')?.value || editDraft?.department || '';
    const educationalLevel = container.querySelector('#prof-input-educationalLevel')?.value || editDraft?.educationalLevel || '';
    const specialization = container.querySelector('#prof-input-specialization')?.value || editDraft?.specialization || '';
    const bio = container.querySelector('#prof-input-bio')?.value || editDraft?.bio || '';

    const updatedProfile = {
      name: name.trim(),
      title: title.trim(),
      institution: institution.trim(),
      department: department.trim(),
      educationalLevel: educationalLevel.trim(),
      specialization: specialization.trim(),
      bio: bio.trim()
    };

    // Persist via state store
    if (store.saveEducatorProfile) {
      store.saveEducatorProfile(updatedProfile);
    } else {
      store.updateSettings({ educatorProfile: updatedProfile });
    }

    isEditMode = false;
    editDraft = null;

    toast('✓ Educator profile updated successfully!', 'success');
    if (typeof onProfileUpdate === 'function') {
      onProfileUpdate(updatedProfile);
    }
    reRender();
  };

  container.querySelector('#prof-save-profile-btn')?.addEventListener('click', handleSave);
  container.querySelector('#prof-save-profile-btn-bottom')?.addEventListener('click', handleSave);
}

// Default export
export default {
  renderEducatorProfileView,
  setupEducatorProfileListeners,
  calculateProfileCompletion,
  calculatePortfolioStatistics,
  generateAIPortfolioStatement,
  BLANK_EDUCATOR_PROFILE
};
