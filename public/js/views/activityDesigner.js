// PEDAIA Module 2: AI Activity Designer with Progressive Facilitation Controls & 5-State Workspace
import { renderGlobalContextForm } from './sharedContext.js';
import { buildActivityDesignerPrompt } from '../promptEngine.js';
import { store } from '../state.js';
import { aiService } from '../aiService.js';
import { openUniversalImportModal } from '../importUtils.js';
import { openUniversalExportModal, renderMarkdownToHtml } from '../exportUtils.js';
import { openAiSwitcherModal } from './aiSwitcherModal.js';

export const ACTIVITY_TYPES = [
  { id: 'Collaborative Learning', name: 'Collaborative Learning', desc: 'Team-based peer problem solving' },
  { id: 'Inquiry-Based Activity', name: 'Inquiry-Based', desc: 'Hands-on question-driven exploration' },
  { id: 'Problem-Solving', name: 'Problem-Solving', desc: 'Analyzing complex real-world dilemmas' },
  { id: 'Simulation', name: 'Simulation', desc: 'Kinesthetic or digital model operations' },
  { id: 'Case Study', name: 'Case Study', desc: 'Deep dive into historical or clinical scenarios' },
  { id: 'Role-Playing', name: 'Role-Playing', desc: 'Perspective-taking and immersive scenarios' },
  { id: 'Debate', name: 'Debate', desc: 'Structured evidentiary argumentation' },
  { id: 'Educational Game', name: 'Educational Game', desc: 'Gamified review or competitive discovery' },
  { id: 'Laboratory Activity', name: 'Lab Experiment', desc: 'Scientific method & hypothesis testing' },
  { id: 'Creative Project', name: 'Creative Project', desc: 'Synthesizing novel artifacts & designs' },
  { id: 'Hands-On Activity', name: 'Hands-On Task', desc: 'Manipulative kinesthetic engagement' },
  { id: 'Performance Task', name: 'Performance Task', desc: 'Authentic real-world execution' }
];

export const LEARNING_PURPOSES = [
  'Conceptual Understanding',
  'Skill Development',
  'Critical Thinking',
  'Creativity',
  'Collaboration',
  'Communication',
  'Application',
  'Problem-Solving',
  'Knowledge Retention'
];

export const GROUPING_STRUCTURES = [
  'Small Groups (3-4 students)',
  'Pair / Turn-and-Talk',
  'Individual Autonomous',
  'Whole Class Socratic Circle',
  'Flexible Jigsaw Groups'
];

export const DIFFICULTY_LEVELS = [
  'Introductory (Foundational schema)',
  'Moderate (Grade-level mastery)',
  'Challenging (Higher-order synthesis)',
  'Progressive (Tiered difficulty)'
];

export const STUDENT_OUTPUTS = [
  'Written Response',
  'Oral Presentation',
  'Physical or Digital Model',
  'Poster / Visual Synthesis',
  'Collaborative Worksheet',
  'Performance / Role-Play',
  'Problem Solution Brief'
];

export const INSTRUCTION_STYLES = [
  'Guided Inquiry (Facilitator-coached)',
  'Student-Led Autonomous',
  'Teacher-Led Modeling',
  'Collaborative Sprints'
];

export function getInitialActivityDesignerState() {
  return {
    subject: 'Social Studies',
    customSubject: '',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 9',
    topic: 'Sustainable Cities and Urban Planning',
    competency: 'Propose viable solutions to municipal environmental challenges through sustainable urban design.',
    learnerProfile: '28 students with diverse creative strengths; good access to digital tablets and craft materials.',
    duration: '45 minutes',
    modality: 'Face-to-Face',
    resources: ['Printed Materials', 'Projector', 'Whiteboard'],
    customResources: 'Butcher paper, colored markers, municipal budget sheets',
    activityType: 'Simulation',
    learningPurpose: ['Problem-Solving', 'Collaboration', 'Critical Thinking', 'Application'],
    groupingStructure: 'Small Groups (3-4 students)',
    materialsNeeded: 'Town map printouts, eco-budget constraint cards, role badges (Mayor, Urban Planner, Citizen Advocate, Fiscal Officer).',
    difficultyLevel: 'Moderate (Grade-level mastery)',
    studentOutput: 'Physical or Digital Model',
    instructionStyle: 'Guided Inquiry (Facilitator-coached)',
    stepTimeBreakdown: '5m hook, 10m scenario briefing, 20m design sprint, 10m rapid gallery pitch.',
    // Progressive Disclosure Facilitation Controls
    includeStudentInstructions: true,
    includeTeacherFacilitation: true,
    includeMaterialsChecklist: true,
    includePreparationTimeline: true,
    includeEvaluationRubric: true,
    includeAccessibilityUDL: true,
    includeSafetyConsiderations: false,
    customSafetyNotes: '',
    additionalRequirements: 'Ensure each student in the group has an active, non-redundant responsibility during the town hall pitch.'
  };
}

let currentState = getInitialActivityDesignerState();
let isPromptEditable = false;
let userEditedPrompt = null;

// AI Workspace State: 'preview' | 'generating' | 'output' | 'editing' | 'error'
let workspaceState = 'preview';
let generatedOutput = '';
let activeGeneratedDesignId = null;
let lastErrorMessage = '';

export function setActivityDesignerState(newState) {
  currentState = { ...currentState, ...newState };
}

export function renderActivityDesignerView() {
  const generatedPrompt = userEditedPrompt !== null ? userEditedPrompt : buildActivityDesignerPrompt(currentState);
  const activeAi = aiService.getActiveProviderStatus();

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- Studio Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-teal-600 dark:text-teal-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </span>
            <div>
              <h1 class="pedaia-page-title text-slate-900 dark:text-white">AI Activity Designer</h1>
              <p class="pedaia-helper text-slate-500 dark:text-slate-400">Design experiential learning activities with progressive teacher facilitation, timelines, and safety protocols</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button id="act-reset-btn" class="px-3.5 py-1.5 pedaia-label text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Studio</span>
          </button>
        </div>
      </div>

      <!-- Main Two-Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- ================================================================= -->
        <!-- LEFT PANEL: ACTIVITY BUILDER (7 Cols)                             -->
        <!-- ================================================================= -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Shared Context -->
          ${renderGlobalContextForm(currentState, 'act')}

          <!-- Section 2: Specialized Activity Specifications -->
          <div class="space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-2xs">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <div>
                  <h3 class="pedaia-section-heading text-slate-900 dark:text-white">Activity Dynamics & Grouping</h3>
                  <p class="pedaia-helper text-slate-500 dark:text-slate-400">Activity formats, student deliverables, and pedagogical goals</p>
                </div>
              </div>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">Step 2 of 3</span>
            </div>

            <!-- Activity Type Selection Cards -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Activity Methodology</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="act-types-group">
                ${ACTIVITY_TYPES.map(t => {
                  const isSelected = currentState.activityType === t.id;
                  return `
                    <button type="button" data-val="${t.id}" class="act-type-card p-3 text-left rounded-xl border transition-all ${isSelected ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/60 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500 shadow-xs' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 hover:border-slate-300'}">
                      <div class="text-xs font-bold">${t.name}</div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${t.desc}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Grouping Structure & Cognitive Challenge -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Grouping Arrangement</label>
                <select id="act-groupingStructure" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-teal-500 outline-none">
                  ${GROUPING_STRUCTURES.map(g => `<option value="${g}" ${currentState.groupingStructure === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Cognitive Challenge Level</label>
                <select id="act-difficultyLevel" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-teal-500 outline-none">
                  ${DIFFICULTY_LEVELS.map(d => `<option value="${d}" ${currentState.difficultyLevel === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Learning Purposes (Chips) -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Core Learning Purposes</label>
              <div class="flex flex-wrap gap-1.5" id="act-purposes-group">
                ${LEARNING_PURPOSES.map(p => {
                  const isSelected = (currentState.learningPurpose || []).includes(p);
                  return `
                    <button type="button" data-val="${p}" class="purpose-chip text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected ? 'bg-teal-600 text-white border-teal-600 font-semibold' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}">
                      ${isSelected ? '✓ ' : '+ '}${p}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Deliverable & Facilitation Style -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Student Deliverable</label>
                <select id="act-studentOutput" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-teal-500 outline-none">
                  ${STUDENT_OUTPUTS.map(o => `<option value="${o}" ${currentState.studentOutput === o ? 'selected' : ''}>${o}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Instruction Delivery Style</label>
                <select id="act-instructionStyle" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-teal-500 outline-none">
                  ${INSTRUCTION_STYLES.map(s => `<option value="${s}" ${currentState.instructionStyle === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Step Time Allocation -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Pacing Breakdown & Minutes</label>
              <input type="text" id="act-stepTimeBreakdown" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-teal-500 outline-none" placeholder="e.g. 5m Hook, 15m Investigation, 15m Synthesis, 10m Debrief" value="${escapeHtml(currentState.stepTimeBreakdown || '')}">
            </div>

          </div>

          <!-- Section 3: PROGRESSIVE FACILITATION & SAFETY CONTROLS (Progressive Disclosure) -->
          <div class="space-y-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-2xs">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 class="pedaia-section-heading text-slate-900 dark:text-white">Facilitation, Rubrics & Safety Options</h3>
                  <p class="pedaia-helper text-slate-500 dark:text-slate-400">Progressive disclosure controls for instructional precision</p>
                </div>
              </div>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">Optional</span>
            </div>

            <!-- Toggles for Progressive Components -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 cursor-pointer">
                <input type="checkbox" id="act-opt-student-instructions" class="mt-0.5 rounded text-teal-600 focus:ring-teal-500" ${currentState.includeStudentInstructions ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Student-Facing Protocol</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Generates step-by-step instructions written directly to the student</span>
                </div>
              </label>

              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 cursor-pointer">
                <input type="checkbox" id="act-opt-teacher-facilitation" class="mt-0.5 rounded text-teal-600 focus:ring-teal-500" ${currentState.includeTeacherFacilitation ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Teacher Facilitation & Pacing</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Scripted probing stems, circulation cues, and intervention tips</span>
                </div>
              </label>

              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 cursor-pointer">
                <input type="checkbox" id="act-opt-materials-checklist" class="mt-0.5 rounded text-teal-600 focus:ring-teal-500" ${currentState.includeMaterialsChecklist ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Materials Checklist</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Itemized list for teacher and student teams</span>
                </div>
              </label>

              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 cursor-pointer">
                <input type="checkbox" id="act-opt-prep-timeline" class="mt-0.5 rounded text-teal-600 focus:ring-teal-500" ${currentState.includePreparationTimeline ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Preparation Timeline</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Pre-class setup (24h/15m before) and cleanup procedure</span>
                </div>
              </label>

              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 cursor-pointer">
                <input type="checkbox" id="act-opt-rubric" class="mt-0.5 rounded text-teal-600 focus:ring-teal-500" ${currentState.includeEvaluationRubric ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Scoring Rubric</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Analytic 3-tier scoring rubric with observable descriptors</span>
                </div>
              </label>

              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850/50 cursor-pointer">
                <input type="checkbox" id="act-opt-accessibility" class="mt-0.5 rounded text-teal-600 focus:ring-teal-500" ${currentState.includeAccessibilityUDL ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Accessibility & UDL</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Multiple means of representation, engagement, and expression</span>
                </div>
              </label>

            </div>

            <!-- Hands-On / Lab Safety Protocol Expansion -->
            <div class="p-3.5 rounded-xl border ${currentState.includeSafetyConsiderations ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900'} space-y-2">
              <label class="flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <span class="text-sm">⚠️</span>
                  <div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Hands-On & Lab Safety Considerations</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">Explicit hazard warnings, PPE requirements, and supervision rules</span>
                  </div>
                </div>
                <input type="checkbox" id="act-opt-safety" class="rounded text-amber-600 focus:ring-amber-500" ${currentState.includeSafetyConsiderations ? 'checked' : ''}>
              </label>

              ${currentState.includeSafetyConsiderations ? `
                <div class="pt-2">
                  <input type="text" id="act-customSafetyNotes" class="w-full text-xs p-2 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-amber-500 outline-none" placeholder="Specify any chemical, electrical, physical, or equipment safety notes..." value="${escapeHtml(currentState.customSafetyNotes || '')}">
                </div>
              ` : ''}
            </div>

            <!-- Specific Materials Needed -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Materials & Resource Checklist Notes</label>
              <textarea id="act-materialsNeeded" rows="2" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-teal-500 outline-none" placeholder="List specific physical or digital materials needed for this activity...">${escapeHtml(currentState.materialsNeeded || '')}</textarea>
            </div>

            <!-- Additional Requirements -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Additional Constraints & Preferences</label>
              <textarea id="act-additionalRequirements" rows="2" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-teal-500 outline-none" placeholder="Any specific classroom rules, timing constraints, or evaluation notes...">${escapeHtml(currentState.additionalRequirements || '')}</textarea>
            </div>

          </div>

        </div>

        <!-- ================================================================= -->
        <!-- RIGHT PANEL: AI WORKSPACE (5 Distinct States) (5 Cols Sticky)      -->
        <!-- ================================================================= -->
        <div class="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col transition-colors">
            
            <!-- Panel Header with State Pill -->
            <div class="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                ${getActivityWorkspaceBadge(workspaceState)}
              </div>
              
              <!-- Tab Switcher -->
              <div class="flex items-center gap-1">
                ${generatedOutput ? `
                  <button id="act-tab-output-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'output' || workspaceState === 'editing' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Output
                  </button>
                  <button id="act-tab-preview-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'preview' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Prompt
                  </button>
                ` : `
                  <button id="act-toggle-edit-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    ${isPromptEditable ? 'Done Editing' : 'Edit Prompt'}
                  </button>
                  <button id="act-copy-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 bg-teal-50 dark:bg-teal-950/60 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </button>
                `}
              </div>
            </div>

            <!-- Workspace Body according to State -->
            ${renderActivityWorkspaceBody(workspaceState, generatedPrompt, generatedOutput, activeAi)}

            <!-- Panel Actions Footer -->
            <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
              
              <!-- Active AI Engine Indicator & Quick Switcher -->
              <div class="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span class="text-slate-600 dark:text-slate-300 truncate">AI Engine: <strong>${activeAi.name}</strong> <span class="font-mono text-[11px] text-slate-400">(${activeAi.model})</span> • <span class="text-teal-600 dark:text-teal-400 font-semibold">Ready</span></span>
                </div>
                <button type="button" id="act-switch-ai-engine-btn" class="text-teal-600 dark:text-teal-400 font-semibold hover:underline shrink-0 text-xs">
                  <span>Switch AI</span>
                </button>
              </div>

              <!-- Main Generation Action Button -->
              <div class="flex items-center gap-2">
                <button id="act-generate-output-btn" class="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2" ${workspaceState === 'generating' ? 'disabled' : ''}>
                  ${workspaceState === 'generating' ? `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Synthesizing Activity Design...</span>
                  ` : `
                    <svg class="w-4 h-4 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>${generatedOutput ? 'Re-Synthesize Activity Plan' : 'Generate Activity Design'}</span>
                  `}
                </button>
              </div>

              <!-- Secondary Actions -->
              <div class="flex items-center gap-2 pt-1">
                <button id="act-save-template-btn" class="flex-1 py-2 px-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save to Library</span>
                </button>

                ${activeGeneratedDesignId ? `
                  <button id="act-open-canvas-btn" class="flex-1 py-2 px-3 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 border border-teal-200 dark:border-teal-800/60 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Full Canvas</span>
                  </button>
                ` : `
                  <button id="act-refresh-prompt-btn" title="Re-compile prompt from inputs" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                `}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  `;
}

function getActivityWorkspaceBadge(state) {
  switch (state) {
    case 'generating':
      return `
        <span class="ws-state-pill generating">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span>Synthesizing</span>
        </span>
      `;
    case 'output':
      return `
        <span class="ws-state-pill generated-output">
          <span class="w-2 h-2 rounded-full bg-teal-500"></span>
          <span>Activity Generated</span>
        </span>
      `;
    case 'editing':
      return `
        <span class="ws-state-pill editing">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Editing Activity</span>
        </span>
      `;
    case 'error':
      return `
        <span class="ws-state-pill error-state">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Setup Required</span>
        </span>
      `;
    case 'preview':
    default:
      return `
        <span class="ws-state-pill prompt-preview">
          <span class="w-2 h-2 rounded-full bg-teal-500"></span>
          <span>Prompt Preview</span>
        </span>
      `;
  }
}

function renderActivityWorkspaceBody(state, prompt, output, activeAi) {
  if (state === 'generating') {
    return `
      <div class="p-8 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 text-center space-y-4 min-h-[420px] flex flex-col items-center justify-center border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div class="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto animate-pulse">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-1">Synthesizing Experiential Activity...</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Structuring step-by-step facilitation, student prompts, rubrics, and safety checks</p>
        </div>
        <div class="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mx-auto mt-2">
          <div class="bg-teal-600 dark:bg-teal-500 h-1.5 rounded-full animate-pulse" style="width: 75%"></div>
        </div>
      </div>
    `;
  }

  if (state === 'output') {
    return `
      <div class="flex flex-col">
        <!-- Output Toolbar -->
        <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-600 dark:text-slate-300">Generated Activity Plan</span>
          <div class="flex items-center gap-1.5">
            <button id="act-edit-output-btn" class="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Edit Markdown
            </button>
            <button id="act-copy-output-btn" class="px-2 py-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 rounded hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors">
              Copy
            </button>
            <button id="act-export-output-btn" class="px-2 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors">
              Export File
            </button>
          </div>
        </div>

        <div class="p-5 sm:p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 max-h-[520px] overflow-y-auto prose-academic leading-relaxed">
          ${renderMarkdownToHtml(output)}
        </div>
      </div>
    `;
  }

  if (state === 'editing') {
    return `
      <div class="flex flex-col">
        <div class="px-4 py-2 bg-teal-50 dark:bg-teal-950/40 border-b border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs">
          <span class="font-semibold text-teal-700 dark:text-teal-300">Markdown Editor</span>
          <div class="flex items-center gap-1.5">
            <button id="act-cancel-edit-output-btn" class="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white">
              Cancel
            </button>
            <button id="act-save-output-edits-btn" class="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded">
              Save Edits
            </button>
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200/80 dark:border-slate-800 transition-colors">
          <textarea id="act-output-markdown-textarea" class="w-full h-[460px] bg-transparent text-slate-800 dark:text-slate-100 font-mono text-xs border-0 outline-none resize-none leading-relaxed">${escapeHtml(output)}</textarea>
        </div>
      </div>
    `;
  }

  if (state === 'error') {
    return `
      <div class="p-6 bg-white dark:bg-slate-900 text-center min-h-[420px] flex flex-col items-center justify-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 class="text-sm font-bold text-slate-900 dark:text-white">AI Engine Configuration Required</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          ${lastErrorMessage || `Your current active engine (<strong>${escapeHtml(activeAi.name)}</strong>) requires an active connection. You can switch to free local Ollama or copy the compiled prompt.`}
        </p>
        <div class="flex items-center gap-2 pt-2">
          <button id="act-error-switch-ai-btn" class="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 rounded-lg">
            Switch AI Engine
          </button>
          <button id="act-error-copy-prompt-btn" class="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
            Copy Prompt
          </button>
        </div>
      </div>
    `;
  }

  // Default: State 1 - Prompt Preview / Review
  return `
    <div class="p-4 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono text-[13.5px] leading-relaxed min-h-[420px] max-h-[500px] overflow-y-auto transition-colors">
      ${isPromptEditable ? `
        <textarea id="act-editable-prompt-text" class="w-full h-96 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-[13.5px] border-0 focus:outline-none resize-none leading-relaxed selection:bg-teal-100 dark:selection:bg-teal-900/60">${escapeHtml(prompt)}</textarea>
      ` : `
        <pre class="whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-200 select-all selection:bg-teal-100 dark:selection:bg-teal-900/60">${escapeHtml(prompt)}</pre>
      `}
    </div>
  `;
}

export function setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings) {
  const updatePromptDisplay = () => {
    userEditedPrompt = null;
    const prompt = buildActivityDesignerPrompt(currentState);
    const pre = container.querySelector('pre');
    if (pre) pre.textContent = prompt;
    const textarea = container.querySelector('#act-editable-prompt-text');
    if (textarea) textarea.value = prompt;
  };

  // Tab buttons: Prompt vs Output
  container.querySelector('#act-tab-preview-btn')?.addEventListener('click', () => {
    workspaceState = 'preview';
    container.innerHTML = renderActivityDesignerView();
    setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#act-tab-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderActivityDesignerView();
    setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Edit raw output markdown
  container.querySelector('#act-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'editing';
    container.innerHTML = renderActivityDesignerView();
    setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#act-cancel-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderActivityDesignerView();
    setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#act-save-output-edits-btn')?.addEventListener('click', () => {
    const textarea = container.querySelector('#act-output-markdown-textarea');
    if (textarea) {
      generatedOutput = textarea.value;
      if (activeGeneratedDesignId) {
        store.updateDesign(activeGeneratedDesignId, {
          output: generatedOutput,
          refinementNote: 'Manual edits saved in activity designer'
        });
      }
      showToast('Activity edits saved successfully!', 'success');
      workspaceState = 'output';
      container.innerHTML = renderActivityDesignerView();
      setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
    }
  });

  // Copy output
  container.querySelector('#act-copy-output-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedOutput);
      showToast('Activity design copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy output.', 'error');
    }
  });

  // Export output
  container.querySelector('#act-export-output-btn')?.addEventListener('click', () => {
    openUniversalExportModal({
      title: `Learning Activity: ${currentState.topic || 'Classroom Activity'}`,
      markdown: generatedOutput,
      subject: currentState.subject,
      gradeLevel: currentState.gradeLevel,
      showToast
    });
  });

  // Open full Refinement Canvas
  container.querySelector('#act-open-canvas-btn')?.addEventListener('click', () => {
    if (activeGeneratedDesignId) {
      navigateToWorkspace(activeGeneratedDesignId);
    }
  });

  // Switch Active AI Engine
  container.querySelector('#act-switch-ai-engine-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        container.innerHTML = renderActivityDesignerView();
        setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  // Error state buttons
  container.querySelector('#act-error-switch-ai-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        workspaceState = 'preview';
        container.innerHTML = renderActivityDesignerView();
        setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  container.querySelector('#act-error-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildActivityDesignerPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Compiled prompt copied! Paste into any AI model.', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Reset Studio Button
  container.querySelector('#act-reset-btn')?.addEventListener('click', () => {
    if (confirm('Reset Activity Designer to defaults?')) {
      currentState = getInitialActivityDesignerState();
      workspaceState = 'preview';
      generatedOutput = '';
      activeGeneratedDesignId = null;
      container.innerHTML = renderActivityDesignerView();
      setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
      showToast('Activity Designer reset to defaults.', 'info');
    }
  });

  // Import Source File
  container.querySelector('#act-import-source-btn')?.addEventListener('click', () => {
    openUniversalImportModal({
      showToast,
      onAction: (action, data) => {
        if (action === 'save-to-designs' || action === 'open-workspace') {
          navigateToWorkspace('workspace', data.designId);
        } else {
          if (data.title) currentState.topic = data.title;
          if (data.subject && data.subject !== 'Interdisciplinary') currentState.subject = data.subject;
          if (data.text) {
            currentState.additionalRequirements = data.text.slice(0, 3000);
            currentState.competency = `Adapted from reference material: ${data.filename || data.title}`;
          }
          container.innerHTML = renderActivityDesignerView();
          setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
          showToast(`Loaded "${data.filename || data.title}" into Activity Designer!`, 'success');
        }
      }
    });
  });

  // Activity Type Selection
  container.querySelectorAll('#act-types-group .act-type-card').forEach(btn => {
    btn.addEventListener('click', () => {
      currentState.activityType = btn.getAttribute('data-val');
      container.innerHTML = renderActivityDesignerView();
      setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Purposes Chips
  container.querySelectorAll('#act-purposes-group .purpose-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      const list = currentState.learningPurpose || [];
      if (list.includes(val)) {
        currentState.learningPurpose = list.filter(x => x !== val);
      } else {
        currentState.learningPurpose = [...list, val];
      }
      container.innerHTML = renderActivityDesignerView();
      setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Dropdown Selects
  const bindSelect = (id, prop) => {
    container.querySelector(`#${id}`)?.addEventListener('change', (e) => {
      currentState[prop] = e.target.value;
      updatePromptDisplay();
    });
  };

  bindSelect('act-groupingStructure', 'groupingStructure');
  bindSelect('act-difficultyLevel', 'difficultyLevel');
  bindSelect('act-studentOutput', 'studentOutput');
  bindSelect('act-instructionStyle', 'instructionStyle');

  // Progressive Disclosure Checkboxes
  const bindOpt = (id, prop) => {
    container.querySelector(`#${id}`)?.addEventListener('change', (e) => {
      currentState[prop] = e.target.checked;
      if (prop === 'includeSafetyConsiderations') {
        container.innerHTML = renderActivityDesignerView();
        setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
      } else {
        updatePromptDisplay();
      }
    });
  };

  bindOpt('act-opt-student-instructions', 'includeStudentInstructions');
  bindOpt('act-opt-teacher-facilitation', 'includeTeacherFacilitation');
  bindOpt('act-opt-materials-checklist', 'includeMaterialsChecklist');
  bindOpt('act-opt-prep-timeline', 'includePreparationTimeline');
  bindOpt('act-opt-rubric', 'includeEvaluationRubric');
  bindOpt('act-opt-accessibility', 'includeAccessibilityUDL');
  bindOpt('act-opt-safety', 'includeSafetyConsiderations');

  // Safety Notes
  container.querySelector('#act-customSafetyNotes')?.addEventListener('input', (e) => {
    currentState.customSafetyNotes = e.target.value;
    updatePromptDisplay();
  });

  // Materials & Additional Requirements Textareas
  container.querySelector('#act-materialsNeeded')?.addEventListener('input', (e) => {
    currentState.materialsNeeded = e.target.value;
    updatePromptDisplay();
  });

  container.querySelector('#act-stepTimeBreakdown')?.addEventListener('input', (e) => {
    currentState.stepTimeBreakdown = e.target.value;
    updatePromptDisplay();
  });

  container.querySelector('#act-additionalRequirements')?.addEventListener('input', (e) => {
    currentState.additionalRequirements = e.target.value;
    updatePromptDisplay();
  });

  // Context field bindings
  const bindInput = (id, prop) => {
    const el = container.querySelector(`#${id}`);
    if (el) {
      el.addEventListener('input', (e) => {
        currentState[prop] = e.target.value;
        updatePromptDisplay();
      });
      el.addEventListener('change', (e) => {
        currentState[prop] = e.target.value;
        updatePromptDisplay();
      });
    }
  };

  bindInput('act-subject', 'subject');
  bindInput('act-customSubject', 'customSubject');
  bindInput('act-educationalLevel', 'educationalLevel');
  bindInput('act-gradeLevel', 'gradeLevel');
  bindInput('act-topic', 'topic');
  bindInput('act-competency', 'competency');
  bindInput('act-learnerProfile', 'learnerProfile');
  bindInput('act-customDuration', 'customDuration');
  bindInput('act-customResources', 'customResources');

  // Re-render if subject changes to/from 'Other'
  container.querySelector('#act-subject')?.addEventListener('change', () => {
    container.innerHTML = renderActivityDesignerView();
    setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Toggle Edit Prompt
  container.querySelector('#act-toggle-edit-prompt-btn')?.addEventListener('click', () => {
    if (isPromptEditable) {
      const textarea = container.querySelector('#act-editable-prompt-text');
      if (textarea) userEditedPrompt = textarea.value;
      isPromptEditable = false;
    } else {
      isPromptEditable = true;
    }
    container.innerHTML = renderActivityDesignerView();
    setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Copy Prompt
  container.querySelector('#act-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildActivityDesignerPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Activity design prompt copied!', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Save to Library
  container.querySelector('#act-save-template-btn')?.addEventListener('click', () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildActivityDesignerPrompt(currentState);
    const name = window.prompt('Enter a title for this activity template:', `Activity: ${currentState.topic || 'Classroom Activity'}`);
    if (name) {
      store.saveTemplate({
        name,
        title: name,
        category: 'Activity Design',
        categoryKey: 'activity-design',
        description: `Active learning ${currentState.activityType} template for ${currentState.subject}.`,
        educationalLevels: currentState.educationalLevel,
        subjectApplicability: currentState.subject,
        previewText: prompt.slice(0, 150) + '...',
        defaultConfig: JSON.parse(JSON.stringify(currentState)),
        promptText: prompt
      });
      showToast('Template saved to Prompt Library!', 'success');
    }
  });

  // Re-compile prompt
  container.querySelector('#act-refresh-prompt-btn')?.addEventListener('click', () => {
    userEditedPrompt = null;
    updatePromptDisplay();
    showToast('Prompt re-compiled from inputs.', 'info');
  });

  // Generate Output
  container.querySelector('#act-generate-output-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildActivityDesignerPrompt(currentState);

    // Direct generation with built-in AI synthesis (zero required keys)
    workspaceState = 'generating';
    container.innerHTML = renderActivityDesignerView();
    setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);

    try {
      const result = await aiService.generate({ prompt });
      generatedOutput = result.output;

      const newDesign = {
        id: 'design-' + Date.now(),
        title: `Activity Design: ${currentState.topic || 'Active Inquiry Plan'}`,
        category: 'activity-design',
        categoryLabel: 'Activity Design',
        subject: currentState.subject,
        educationalLevel: currentState.educationalLevel,
        gradeLevel: currentState.gradeLevel,
        topic: currentState.topic,
        competency: currentState.competency,
        duration: currentState.duration,
        modality: currentState.modality,
        config: JSON.parse(JSON.stringify(currentState)),
        output: result.output,
        status: 'Output Generated',
        reviewScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.saveDesign(newDesign);
      activeGeneratedDesignId = newDesign.id;
      workspaceState = 'output';
      showToast('Activity synthesized successfully!', 'success');
      container.innerHTML = renderActivityDesignerView();
      setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
    } catch (err) {
      workspaceState = 'error';
      lastErrorMessage = err.message || 'Generation failed.';
      showToast(lastErrorMessage, 'error');
      container.innerHTML = renderActivityDesignerView();
      setupActivityDesignerListeners(container, navigateToWorkspace, showToast, openSettings);
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
