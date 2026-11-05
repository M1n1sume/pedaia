// PEDAIA Responsible AI & Educator Review Interface
import { store } from '../state.js';

export const REVIEW_CRITERIA = [
  {
    id: 'objective-alignment',
    label: 'Learning Objective Alignment',
    description: 'Verify that all instructional activities, procedures, and questions directly target the stated curriculum competencies and objectives.'
  },
  {
    id: 'content-accuracy',
    label: 'Content Accuracy & Factuality',
    description: 'Ensure factual claims, historical assertions, formulas, scientific concepts, and vocabulary definitions are academically verified.'
  },
  {
    id: 'pedagogical-appropriateness',
    label: 'Pedagogical Appropriateness',
    description: 'Assess if pacing, cognitive load, instructional model, and transitions are developmentally suited for this specific grade and age group.'
  },
  {
    id: 'learner-inclusivity',
    label: 'Learner Inclusivity & Universal Design',
    description: 'Verify that materials avoid deficit stereotyping, provide equitable entry points, and accommodate diverse readiness and cultural contexts.'
  },
  {
    id: 'feasibility',
    label: 'Classroom Feasibility & Safety',
    description: 'Confirm that physical space, materials, lab safety, time constraints, and technology dependencies are realistically executable.'
  },
  {
    id: 'assessment-alignment',
    label: 'Assessment Alignment',
    description: 'Check that formative probes, rubrics, and exit tickets accurately assess the depth of mastery specified in the standards.'
  },
  {
    id: 'ethical-considerations',
    label: 'Ethical & Responsible Considerations',
    description: 'Examine sensitive themes, digital safety, intellectual integrity, and ensure materials foster respectful and critical inquiry.'
  }
];

export function renderReviewBanner(design) {
  const isReviewed = design.status === 'Reviewed' || design.status === 'Completed' || (design.reviewScore && design.reviewScore >= 6);
  const score = design.reviewScore || 0;

  return `
    <div class="rounded-xl border ${isReviewed ? 'border-emerald-200 dark:border-emerald-850 bg-emerald-50/70 dark:bg-emerald-950/40' : 'border-amber-200 dark:border-amber-850 bg-amber-50/70 dark:bg-amber-950/40'} p-4 my-4 transition-all">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="p-2 rounded-lg ${isReviewed ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'} mt-0.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-semibold text-sm ${isReviewed ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'}">
                ${isReviewed ? 'Educator Reviewed & Pedagogically Verified' : 'Pending Educator Quality Audit'}
              </h4>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium ${isReviewed ? 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200' : 'bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'}">
                ${score}/7 Criteria Verified
              </span>
            </div>
            <p class="text-xs ${isReviewed ? 'text-emerald-700 dark:text-emerald-300/90' : 'text-amber-700 dark:text-amber-300/90'} mt-0.5 max-w-2xl">
              AI-generated instructional materials are intended to support educator decision-making. Educators should audit, verify, and adapt all outputs before classroom implementation.
            </p>
          </div>
        </div>
        <button id="open-review-modal-btn" class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${isReviewed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'} transition-colors shadow-sm flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>${isReviewed ? 'Edit Review Checklist' : 'Conduct Educator Review'}</span>
        </button>
      </div>
    </div>
  `;
}

export function openEducatorReviewModal(design, onSaveCallback) {
  const existingChecks = design.reviewChecks || {};
  const currentScore = design.reviewScore || Object.values(existingChecks).filter(Boolean).length;
  const currentNotes = design.reviewNotes || '';
  const currentStatus = design.status || 'Draft';

  const modalHtml = `
    <div id="review-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
        
        <!-- Modal Header -->
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-900 dark:text-white">Educator Review & Quality Verification</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Professional pedagogical audit prior to classroom deployment</p>
            </div>
          </div>
          <button id="close-review-modal-btn" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Informational Notice -->
        <div class="bg-blue-50/70 dark:bg-indigo-950/40 border-b border-blue-100 dark:border-indigo-900/50 p-4 px-6 flex items-start gap-2.5">
          <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <strong>Professional Mandate:</strong> AI-generated instructional materials are intended to support educator decision-making. Educators should review, verify, and adapt all outputs before classroom implementation. Do not assume content is fully accurate without teacher oversight.
          </p>
        </div>

        <!-- Modal Body (Checklist) -->
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verification Rubric Criteria</span>
            <button id="select-all-criteria-btn" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">Verify All Criteria</button>
          </div>

          <div class="space-y-3" id="review-criteria-list">
            ${REVIEW_CRITERIA.map((criterion, idx) => {
              const isChecked = existingChecks[criterion.id] !== undefined ? existingChecks[criterion.id] : (currentScore >= 7);
              return `
                <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-850 cursor-pointer transition-colors">
                  <input type="checkbox" id="check-${criterion.id}" data-criterion-id="${criterion.id}" class="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-650" ${isChecked ? 'checked' : ''}>
                  <div class="flex-1">
                    <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 block">${criterion.label}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">${criterion.description}</span>
                  </div>
                </label>
              `;
            }).join('')}
          </div>

          <!-- Educator Notes -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Educator Verification Notes & Adjustments</label>
            <textarea id="review-notes-input" rows="3" class="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Record classroom adaptations, student accommodation notes, or curricular considerations...">${currentNotes}</textarea>
          </div>

          <!-- Status Selector -->
          <div class="flex items-center justify-between pt-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Design Lifecycle State:</label>
            <div class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="radio" name="design-status" value="Draft" class="text-indigo-600" ${currentStatus === 'Draft' ? 'checked' : ''}>
                <span>Draft</span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="radio" name="design-status" value="Output Generated" class="text-indigo-600" ${currentStatus === 'Output Generated' ? 'checked' : ''}>
                <span>Output Ready</span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium cursor-pointer">
                <input type="radio" name="design-status" value="Reviewed" class="text-emerald-600" ${currentStatus === 'Reviewed' || currentStatus === 'Verified' ? 'checked' : ''}>
                <span>Reviewed (Passed Quality Audit)</span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 font-medium cursor-pointer">
                <input type="radio" name="design-status" value="Completed" class="text-indigo-600" ${currentStatus === 'Completed' ? 'checked' : ''}>
                <span>Completed</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-end gap-3 rounded-b-2xl">
          <button id="cancel-review-btn" class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors">
            Cancel
          </button>
          <button id="save-review-btn" class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors">
            Save Verification Audit
          </button>
        </div>

      </div>
    </div>
  `;

  // Append modal to DOM
  const existingModal = document.getElementById('review-modal-overlay');
  if (existingModal) existingModal.remove();

  const container = document.createElement('div');
  container.innerHTML = modalHtml;
  document.body.appendChild(container.firstElementChild);

  const modal = document.getElementById('review-modal-overlay');

  const close = () => {
    modal.remove();
  };

  document.getElementById('close-review-modal-btn').addEventListener('click', close);
  document.getElementById('cancel-review-btn').addEventListener('click', close);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Select all button
  document.getElementById('select-all-criteria-btn').addEventListener('click', () => {
    modal.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = true; });
    const reviewedRadio = modal.querySelector('input[value="Reviewed"]');
    if (reviewedRadio) reviewedRadio.checked = true;
  });

  // Save button
  document.getElementById('save-review-btn').addEventListener('click', () => {
    const checks = {};
    let score = 0;
    modal.querySelectorAll('input[data-criterion-id]').forEach(cb => {
      const id = cb.getAttribute('data-criterion-id');
      checks[id] = cb.checked;
      if (cb.checked) score++;
    });

    const notes = document.getElementById('review-notes-input').value.trim();
    const selectedStatus = modal.querySelector('input[name="design-status"]:checked')?.value || (score >= 6 ? 'Reviewed' : 'Draft');

    const updates = {
      reviewChecks: checks,
      reviewScore: score,
      reviewNotes: notes,
      status: selectedStatus
    };

    store.updateDesign(design.id, updates);
    close();

    if (onSaveCallback) onSaveCallback(updates);
  });
}
