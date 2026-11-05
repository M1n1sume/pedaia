// PEDAIA Shared Educator Context Components and Options

export const SUBJECT_OPTIONS = [
  'Science',
  'Mathematics',
  'English',
  'Filipino',
  'Social Studies',
  'History',
  'Literature',
  'Language Education',
  'Physical Education',
  'Music',
  'Arts',
  'Technology and Livelihood Education',
  'Computer Science',
  'Business Education',
  'Psychology',
  'Higher Education',
  'Professional Training',
  'Interdisciplinary',
  'Other'
];

export const EDUCATIONAL_LEVEL_OPTIONS = [
  'Kindergarten',
  'Elementary',
  'Junior High School',
  'Senior High School',
  'Undergraduate',
  'Graduate Studies',
  'Adult Education',
  'Professional Development',
  'Other'
];

export const DURATION_OPTIONS = [
  '5 minutes',
  '10 minutes',
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '60 minutes',
  '90 minutes',
  'Custom'
];

export const MODALITY_OPTIONS = [
  { id: 'Face-to-Face', label: 'Face-to-Face', icon: 'users', desc: 'Physical classroom interaction' },
  { id: 'Online Synchronous', label: 'Online Sync', icon: 'video', desc: 'Real-time virtual live session' },
  { id: 'Online Asynchronous', label: 'Online Async', icon: 'clock', desc: 'Self-paced LMS delivery' },
  { id: 'Hybrid', label: 'Hybrid', icon: 'shuffle', desc: 'Concurrent in-person & online' },
  { id: 'Blended Learning', label: 'Blended', icon: 'layers', desc: 'Combined classroom & digital tasks' }
];

export const RESOURCE_OPTIONS = [
  'Projector',
  'Computer',
  'Internet Access',
  'Printed Materials',
  'Whiteboard',
  'Laboratory Equipment',
  'Mobile Devices',
  'Learning Management System',
  'Educational Videos',
  'None'
];

export function renderGlobalContextForm(state, prefix = 'ctx') {
  const isOtherSubject = state.subject === 'Other';
  const isCustomDuration = state.duration === 'Custom' || !DURATION_OPTIONS.slice(0, -1).includes(state.duration);

  return `
    <div class="space-y-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Educator & Classroom Context</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Universal pedagogical parameters across teaching designs</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="${prefix}-import-source-btn" class="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 transition-colors shadow-2xs" title="Import syllabus, curriculum standards, or reference text from any file">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Import Source File</span>
          </button>
          <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">Step 1 of 3</span>
        </div>
      </div>

      <!-- Subject & Educational Level -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject or Discipline <span class="text-rose-500">*</span></label>
          <select id="${prefix}-subject" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors">
            ${SUBJECT_OPTIONS.map(s => `<option value="${s}" ${state.subject === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          ${isOtherSubject ? `
            <input type="text" id="${prefix}-customSubject" class="mt-2 w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none" placeholder="Enter custom subject..." value="${escapeHtml(state.customSubject || '')}">
          ` : ''}
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Educational Level <span class="text-rose-500">*</span></label>
          <select id="${prefix}-educationalLevel" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors">
            ${EDUCATIONAL_LEVEL_OPTIONS.map(l => `<option value="${l}" ${state.educationalLevel === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Grade Level / Course & Topic -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade Level or Course Name</label>
          <input type="text" id="${prefix}-gradeLevel" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. Grade 8, Grade 10, BS Biology 2nd Year" value="${escapeHtml(state.gradeLevel || '')}">
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lesson / Activity Topic <span class="text-rose-500">*</span></label>
          <input type="text" id="${prefix}-topic" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. Photosynthesis, Linear Equations, World War II" value="${escapeHtml(state.topic || '')}">
        </div>
      </div>

      <!-- Curriculum Competency / Learning Standard -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Curriculum Competency / Standard / Course Outcome</label>
        <textarea id="${prefix}-competency" rows="2" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="Enter the curriculum competency, course outcome, or intended learning standard...">${escapeHtml(state.competency || '')}</textarea>
      </div>

      <!-- Learner Profile -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Learner Profile & Classroom Characteristics</label>
        <input type="text" id="${prefix}-learnerProfile" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. 35 students, mixed reading readiness, 4 multilingual learners, high enthusiasm" value="${escapeHtml(state.learnerProfile || '')}">
      </div>

      <!-- Duration Selection Buttons -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Class / Instructional Duration</label>
        <div class="flex flex-wrap gap-1.5" id="${prefix}-duration-group">
          ${DURATION_OPTIONS.map(d => {
            const isSelected = state.duration === d || (d === 'Custom' && isCustomDuration);
            return `
              <button type="button" data-val="${d}" class="duration-btn text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'}">
                ${d}
              </button>
            `;
          }).join('')}
        </div>
        ${isCustomDuration ? `
          <input type="text" id="${prefix}-customDuration" class="mt-2 w-48 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none" placeholder="e.g. 75 minutes, 2 hours" value="${escapeHtml(state.customDuration || state.duration || '')}">
        ` : ''}
      </div>

      <!-- Teaching Modality (Cards) -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Teaching Modality</label>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2" id="${prefix}-modality-group">
          ${MODALITY_OPTIONS.map(m => {
            const isSelected = state.modality === m.id;
            return `
              <button type="button" data-val="${m.id}" class="modality-card p-2.5 text-left rounded-xl border transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-2xs ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-650'}">
                <div class="text-xs font-bold">${m.label}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${m.desc}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Available Resources (Multi-select Chips) -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Available Classroom Resources</label>
        <div class="flex flex-wrap gap-1.5" id="${prefix}-resources-group">
          ${RESOURCE_OPTIONS.map(r => {
            const isSelected = (state.resources || []).includes(r);
            return `
              <button type="button" data-val="${r}" class="resource-chip text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 font-medium' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}">
                ${isSelected ? '✓ ' : '+ '}${r}
              </button>
            `;
          }).join('')}
        </div>
        <input type="text" id="${prefix}-customResources" class="mt-2 w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none" placeholder="Additional specific resources (e.g. 10 iPads, microscope sets, butcher paper)..." value="${escapeHtml(state.customResources || '')}">
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
