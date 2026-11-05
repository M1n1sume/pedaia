// PEDAIA LMS Publishing & Direct Linking Modal
// Allows educators to link and publish instructional designs directly to Canvas LMS or Google Classroom.

import { lmsService, SAMPLE_CANVAS_COURSES, SAMPLE_GOOGLE_COURSES } from '../lmsService.js';

export function openPublishLmsModal(design, showToast, openSettings) {
  if (!design) return;

  const existing = document.getElementById('publish-lms-modal-overlay');
  if (existing) existing.remove();

  let activePlatform = 'canvas'; // 'canvas' | 'google'
  let canvasCourses = SAMPLE_CANVAS_COURSES;
  let googleCourses = SAMPLE_GOOGLE_COURSES;
  let activeTab = 'configure'; // 'configure' | 'preview'

  const settings = lmsService.getSettings();

  const modalHtml = `
    <div id="publish-lms-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col space-y-4 max-h-[92vh] transition-colors">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Publish to LMS & Digital Classroom</h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Direct Linking
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Deploy "${escapeHtml(design.title)}" directly to student-facing platforms</p>
            </div>
          </div>
          <button id="close-publish-lms-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Platform Selector Tabs -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl" id="lms-platform-pills">
          <button type="button" class="lms-pill-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs border border-indigo-200/50 dark:border-indigo-800/50" data-platform="canvas">
            <div class="w-3 h-3 rounded-full bg-[#E13F2B]"></div>
            <span>Canvas LMS (Instructure)</span>
          </button>
          <button type="button" class="lms-pill-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" data-platform="google">
            <div class="w-3 h-3 rounded-full bg-[#0F9D58]"></div>
            <span>Google Classroom</span>
          </button>
        </div>

        <!-- Modal Body: Configure vs Preview Tabs -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs">
          <div class="flex gap-4">
            <button id="lms-tab-configure-btn" class="pb-2 font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400">
              1. Publication Parameters
            </button>
            <button id="lms-tab-preview-btn" class="pb-2 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
              2. Student-Facing Preview
            </button>
          </div>

          <div class="text-[11px] text-slate-400 flex items-center gap-1.5 pb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Zero Setup Ready</span>
          </div>
        </div>

        <!-- Step 1: Configuration View -->
        <div id="lms-configure-view" class="space-y-3.5 overflow-y-auto pr-1 flex-1">
          
          <!-- Course Selection -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Classroom / Course
              </label>
              <button id="lms-open-settings-shortcut" class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Configure LMS Token & Accounts
              </button>
            </div>
            <select id="lms-course-select" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:border-indigo-500 outline-none">
              ${canvasCourses.map(c => `
                <option value="${c.id}">${c.name} (${c.code || c.section || 'Active Course'})</option>
              `).join('')}
            </select>
          </div>

          <!-- Content Type & Destination Object -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Destination Item Type
              </label>
              <select id="lms-content-type-select" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:border-indigo-500 outline-none">
                <option value="page">Canvas Module Page (Structured Content)</option>
                <option value="assignment">Canvas Student Assignment (Graded Portal)</option>
                <option value="quiz">Canvas Quiz / Assessment (QTI 2.1 Package)</option>
                <option value="discussion">Canvas Class Discussion Topic</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Publication Status
              </label>
              <select id="lms-publish-status-select" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:border-indigo-500 outline-none">
                <option value="published">Publish Immediately (Students can see)</option>
                <option value="draft">Save as Draft (Unpublished to students)</option>
              </select>
            </div>
          </div>

          <!-- Title & Points -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Item Title</label>
              <input type="text" id="lms-item-title-input" value="${escapeHtml(design.title)}" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none font-medium">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Points / Max Score</label>
              <input type="number" id="lms-item-points-input" value="100" min="0" max="500" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none font-medium">
            </div>
          </div>

          <!-- Feature Highlights Card -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-xs space-y-1.5">
            <div class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span id="lms-info-title">Canvas LMS Native Formatting Included</span>
            </div>
            <p id="lms-info-desc" class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              PEDAIA transforms your instructional design into Canvas-compliant HTML with styled callout boxes, responsive course tables, and structured objectives ready for student interaction.
            </p>
          </div>

        </div>

        <!-- Step 2: Student-Facing Preview View (Initially Hidden) -->
        <div id="lms-preview-view" class="hidden flex-1 overflow-y-auto max-h-[360px] border border-slate-200 dark:border-slate-750 rounded-xl p-4 bg-white dark:bg-slate-850 font-sans text-xs">
          <div id="lms-live-preview-content"></div>
        </div>

        <!-- Success Result Banner (Initially Hidden) -->
        <div id="lms-success-card" class="hidden p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span id="lms-success-title">Successfully Linked and Synchronized!</span>
          </div>
          <p id="lms-success-details" class="text-[11px] text-emerald-700 dark:text-emerald-300"></p>
          <div class="pt-1 flex gap-2">
            <a id="lms-success-open-link" href="#" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs">
              <span>Open in LMS / Classroom</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
            <button id="lms-copy-formatted-btn" class="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold">
              Copy Formatted Code
            </button>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <button id="lms-download-package-btn" class="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span id="lms-download-btn-label">Download Canvas HTML</span>
            </button>

            <button id="lms-web-share-btn" class="hidden px-3 py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              <span>1-Click Classroom Share</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button id="close-publish-lms-bottom-btn" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl">
              Cancel
            </button>
            <button id="lms-submit-publish-btn" class="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span id="lms-submit-btn-label">Publish to Canvas LMS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHtml;
  document.body.appendChild(container.firstElementChild);

  const modal = document.getElementById('publish-lms-modal-overlay');
  const close = () => modal?.remove();

  document.getElementById('close-publish-lms-modal-btn')?.addEventListener('click', close);
  document.getElementById('close-publish-lms-bottom-btn')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  const courseSelect = modal.querySelector('#lms-course-select');
  const contentTypeSelect = modal.querySelector('#lms-content-type-select');
  const publishBtnLabel = modal.querySelector('#lms-submit-btn-label');
  const downloadBtnLabel = modal.querySelector('#lms-download-btn-label');
  const webShareBtn = modal.querySelector('#lms-web-share-btn');
  const infoTitle = modal.querySelector('#lms-info-title');
  const infoDesc = modal.querySelector('#lms-info-desc');
  const previewContainer = modal.querySelector('#lms-live-preview-content');

  // Switch between Canvas and Google Classroom
  function updatePlatformUI() {
    modal.querySelectorAll('.lms-pill-btn').forEach(btn => {
      const p = btn.getAttribute('data-platform');
      if (p === activePlatform) {
        btn.className = 'lms-pill-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs border border-indigo-200/50 dark:border-indigo-800/50';
      } else {
        btn.className = 'lms-pill-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      }
    });

    if (activePlatform === 'canvas') {
      courseSelect.innerHTML = canvasCourses.map(c => `
        <option value="${c.id}">${c.name} (${c.code || 'Active Course'})</option>
      `).join('');

      contentTypeSelect.innerHTML = `
        <option value="page">Canvas Module Page (Structured Content)</option>
        <option value="assignment">Canvas Student Assignment (Graded Portal)</option>
        <option value="quiz">Canvas Quiz / Assessment (QTI 2.1 Package)</option>
        <option value="discussion">Canvas Class Discussion Topic</option>
      `;

      publishBtnLabel.textContent = 'Publish to Canvas LMS';
      downloadBtnLabel.textContent = 'Download Canvas HTML';
      webShareBtn.classList.add('hidden');
      infoTitle.textContent = 'Canvas LMS Native Formatting Included';
      infoDesc.textContent = 'PEDAIA transforms your instructional design into Canvas-compliant HTML with styled callout boxes, responsive course tables, and structured objectives ready for student interaction.';
    } else {
      courseSelect.innerHTML = googleCourses.map(c => `
        <option value="${c.id}">${c.name} (${c.section || c.code || 'Classroom'})</option>
      `).join('');

      contentTypeSelect.innerHTML = `
        <option value="assignment">Classwork Assignment (With Student Instructions)</option>
        <option value="material">Classwork Material (Curriculum Reference)</option>
        <option value="announcement">Class Stream Announcement</option>
      `;

      publishBtnLabel.textContent = 'Publish to Google Classroom';
      downloadBtnLabel.textContent = 'Download Classroom Text';
      webShareBtn.classList.remove('hidden');
      infoTitle.textContent = 'Google Classroom Direct Share Active';
      infoDesc.textContent = 'Directly deploy assignments to your Google Classroom coursework stream, complete with student deliverables, materials checklist, and scoring rubric.';
    }

    renderPreview();
  }

  function renderPreview() {
    if (activePlatform === 'canvas') {
      const isAssignment = contentTypeSelect.value === 'assignment';
      const isQuiz = contentTypeSelect.value === 'quiz';
      if (isQuiz) {
        previewContainer.innerHTML = `
          <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Canvas Quiz Package (QTI 2.1 XML)</span>
              <span class="text-[10px] bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded text-indigo-700">Standards-Compliant</span>
            </div>
            <pre class="text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap">${escapeHtml(lmsService.formatForCanvasQTI(design).slice(0, 1200))}...</pre>
          </div>
        `;
      } else if (isAssignment) {
        previewContainer.innerHTML = lmsService.formatForCanvasAssignment(design);
      } else {
        previewContainer.innerHTML = lmsService.formatForCanvasPage(design);
      }
    } else {
      previewContainer.innerHTML = `
        <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">G</div>
            <span class="font-bold text-slate-900 dark:text-white">Google Classroom Assignment Preview</span>
          </div>
          <pre class="text-[12px] font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">${escapeHtml(lmsService.formatForGoogleClassroom(design))}</pre>
        </div>
      `;
    }
  }

  // Event Listeners for platform pill buttons
  modal.querySelectorAll('.lms-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activePlatform = btn.getAttribute('data-platform');
      updatePlatformUI();
    });
  });

  contentTypeSelect.addEventListener('change', () => {
    if (activePlatform === 'canvas' && contentTypeSelect.value === 'quiz') {
      downloadBtnLabel.textContent = 'Download QTI Quiz (.xml)';
    } else if (activePlatform === 'canvas') {
      downloadBtnLabel.textContent = 'Download Canvas HTML';
    }
    renderPreview();
  });

  // Tab switching: Configure vs Preview
  const tabConfigBtn = modal.querySelector('#lms-tab-configure-btn');
  const tabPreviewBtn = modal.querySelector('#lms-tab-preview-btn');
  const configView = modal.querySelector('#lms-configure-view');
  const previewView = modal.querySelector('#lms-preview-view');

  tabConfigBtn?.addEventListener('click', () => {
    activeTab = 'configure';
    tabConfigBtn.className = 'pb-2 font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400';
    tabPreviewBtn.className = 'pb-2 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200';
    configView?.classList.remove('hidden');
    previewView?.classList.add('hidden');
  });

  tabPreviewBtn?.addEventListener('click', () => {
    activeTab = 'preview';
    tabPreviewBtn.className = 'pb-2 font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400';
    tabConfigBtn.className = 'pb-2 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200';
    configView?.classList.add('hidden');
    previewView?.classList.remove('hidden');
    renderPreview();
  });

  // 1-Click Google Classroom Share button
  webShareBtn?.addEventListener('click', () => {
    const shareUrl = lmsService.generateGoogleClassroomShareUrl(design);
    window.open(shareUrl, '_blank', 'width=650,height=700');
    if (showToast) showToast('Opened Google Classroom Share window!', 'info');
  });

  // Download Canvas HTML or QTI package
  modal.querySelector('#lms-download-package-btn')?.addEventListener('click', () => {
    if (activePlatform === 'canvas') {
      if (contentTypeSelect.value === 'quiz') {
        const qtiXml = lmsService.formatForCanvasQTI(design);
        downloadBlob(qtiXml, `${getSafeFilename(design.title)}_canvas_quiz.qti.xml`, 'application/xml');
        if (showToast) showToast('Downloaded Canvas QTI Quiz package!', 'success');
      } else {
        const html = lmsService.formatForCanvasPage(design);
        downloadBlob(html, `${getSafeFilename(design.title)}_canvas_page.html`, 'text/html');
        if (showToast) showToast('Downloaded Canvas HTML module page!', 'success');
      }
    } else {
      const text = lmsService.formatForGoogleClassroom(design);
      downloadBlob(text, `${getSafeFilename(design.title)}_classroom_assignment.txt`, 'text/plain');
      if (showToast) showToast('Downloaded Google Classroom assignment text!', 'success');
    }
  });

  // Settings shortcut
  modal.querySelector('#lms-open-settings-shortcut')?.addEventListener('click', () => {
    close();
    if (openSettings) openSettings('lms');
  });

  // Submit Publishing
  modal.querySelector('#lms-submit-publish-btn')?.addEventListener('click', async () => {
    const submitBtn = modal.querySelector('#lms-submit-publish-btn');
    const courseId = courseSelect.value;
    const contentType = contentTypeSelect.value;
    const title = modal.querySelector('#lms-item-title-input')?.value.trim() || design.title;
    const points = parseInt(modal.querySelector('#lms-item-points-input')?.value, 10) || 100;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        <span>Synchronizing with ${activePlatform === 'canvas' ? 'Canvas...' : 'Classroom...'}</span>
      `;
    }

    try {
      let result;
      if (activePlatform === 'canvas') {
        result = await lmsService.publishToCanvas({
          courseId,
          contentType,
          title,
          pointsPossible: points,
          design
        });
      } else {
        result = await lmsService.publishToGoogleClassroom({
          courseId,
          postType: contentType,
          title,
          maxPoints: points,
          design
        });
      }

      // Show success card
      const successCard = modal.querySelector('#lms-success-card');
      const successTitle = modal.querySelector('#lms-success-title');
      const successDetails = modal.querySelector('#lms-success-details');
      const openLink = modal.querySelector('#lms-success-open-link');

      successTitle.textContent = `Successfully Published to ${result.platform}!`;
      successDetails.innerHTML = `<strong>Course:</strong> ${result.courseName} • <strong>Item:</strong> ${escapeHtml(title)} • <strong>Mode:</strong> ${result.mode}`;
      openLink.href = result.url;
      successCard.classList.remove('hidden');

      if (showToast) {
        showToast(`Linked and published "${title}" to ${result.platform}!`, 'success');
      }

      // Copy formatted button inside success card
      modal.querySelector('#lms-copy-formatted-btn').onclick = async () => {
        const textToCopy = activePlatform === 'canvas' ? lmsService.formatForCanvasPage(design) : lmsService.formatForGoogleClassroom(design);
        await navigator.clipboard.writeText(textToCopy);
        if (showToast) showToast('LMS code copied to clipboard!', 'success');
      };

    } catch (err) {
      if (showToast) showToast(`Publishing note: ${err.message}`, 'info');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>Published ✓</span>
      `;
    }
  });

  // Initial render
  updatePlatformUI();
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getSafeFilename(title) {
  return (title || 'Instructional_Design')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
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
