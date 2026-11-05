// PEDAIA Module 4: AI Differentiation Studio with Custom Profiles, Tiered Outputs & 5-State Workspace
import { renderGlobalContextForm } from './sharedContext.js';
import { buildDifferentiationStudioPrompt } from '../promptEngine.js';
import { store } from '../state.js';
import { aiService } from '../aiService.js';
import { openUniversalImportModal } from '../importUtils.js';
import { openUniversalExportModal, renderMarkdownToHtml } from '../exportUtils.js';
import { openAiSwitcherModal } from './aiSwitcherModal.js';

export const DIFFERENTIATION_FOCUS_AREAS = [
  'Learning Readiness',
  'Language Proficiency',
  'Learning Profiles',
  'Learner Interests',
  'Cognitive Pacing',
  'Universal Accessibility',
  'Prior Knowledge Schema',
  'Executive Function & Attention'
];

export const DIFFERENTIATION_DIMENSIONS = [
  { id: 'Content', label: 'Content', desc: 'What learners access (text complexity, models, glossaries)' },
  { id: 'Process', label: 'Process', desc: 'How learners make sense (graphic organizers, teacher pacing)' },
  { id: 'Product', label: 'Product', desc: 'How learners show mastery (flexible authentic artifacts)' },
  { id: 'Learning Environment', label: 'Environment', desc: 'Physical space, quiet zones, digital collaboration' },
  { id: 'Assessment', label: 'Assessment', desc: 'Equitable rubrics sharing identical core standards' }
];

export const DEFAULT_LEARNER_PROFILES = [
  { id: 'tier-1', name: 'Tier 1: Targeted Support', desc: 'Needs explicit sentence frames, visual organizers, and concrete worked examples' },
  { id: 'tier-2', name: 'Tier 2: Grade-Level Core', desc: 'Demonstrates expected grade-level proficiency and standard autonomy' },
  { id: 'tier-3', name: 'Tier 3: Advanced / Extension', desc: 'Ready for higher abstraction, open inquiry, and complex synthesis' },
  { id: 'ell', name: 'Multilingual / ELL Learners', desc: 'Developing academic English; benefits from bilingual glossaries and syntax stems' },
  { id: 'udl-sensory', name: 'Neurodivergent & Sensory', desc: 'Structured choices, reduced cognitive clutter, and chunked timelines' }
];

export const ADAPTATION_STRATEGIES = [
  'Scaffolding & Modeling',
  'Visual Organizers & Dual-Coding',
  'Sentence Frames & Word Banks',
  'Extension & Open Inquiry',
  'Flexible Peer Grouping',
  'Choice-Based Demonstrations',
  'Tiered Texts & Multi-Modalities',
  'Frequent Formative Checkpoints'
];

export const DIFF_OUTPUT_FORMATS = [
  'Comparison Table',
  'Separate Tiered Learning Plans',
  'Adapted Student Worksheets',
  'Teacher Facilitation Matrix',
  'Universal Design (UDL) Blueprint'
];

export function getInitialDifferentiationStudioState() {
  return {
    subject: 'English',
    customSubject: '',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 7',
    topic: 'Persuasive Writing & Identifying Logical Fallacies',
    competency: 'Analyze persuasive arguments and identify common fallacies in media and editorial texts.',
    learnerProfile: 'Class of 30 students; 5 ELL students needing vocabulary support, 4 advanced students needing collegiate extension.',
    duration: '60 minutes',
    modality: 'Face-to-Face',
    resources: ['Printed Materials', 'Projector'],
    customResources: 'Editorial clippings, highlighter pens, bilingual glossaries',
    differentiationFocus: ['Learning Readiness', 'Language Proficiency', 'Learning Profiles'],
    differentiationDimensions: ['Content', 'Process', 'Product'],
    learnerGroups: [
      'Tier 1: Targeted Support',
      'Tier 2: Grade-Level Core',
      'Tier 3: Advanced / Extension'
    ],
    customLearnerProfiles: [
      { name: 'Tier 1 Support Pod', needs: 'Sentence frames for claiming fallacy; paragraph with highlighted transition cues' },
      { name: 'Grade-Level Core Pod', needs: 'Standard editorial texts with two-column argument vs. fallacy chart' },
      { name: 'Advanced Extension Pod', needs: 'Unmarked political debates with subtle false dichotomy and straw man challenges' }
    ],
    commonObjective: 'All students will accurately identify at least two logical flaws in an editorial and explain why the reasoning is invalid, using evidence from the text.',
    specificLearnerNeeds: 'Some students confuse emotional appeal (pathos) with logical proof; multilingual learners need sentence frames to express critique.',
    adaptationStrategies: ['Scaffolding & Modeling', 'Visual Organizers & Dual-Coding', 'Sentence Frames & Word Banks', 'Extension & Open Inquiry'],
    outputFormat: 'Comparison Table',
    includeBeforeAfter: true,
    additionalRequirements: 'Avoid deficit framing; ensure Tier 1 support materials maintain the same high-status critical thinking challenge.'
  };
}

let currentState = getInitialDifferentiationStudioState();
let isPromptEditable = false;
let userEditedPrompt = null;

// AI Workspace State: 'preview' | 'generating' | 'output' | 'editing' | 'error'
let workspaceState = 'preview';
let generatedOutput = '';
let activeGeneratedDesignId = null;
let lastErrorMessage = '';

export function setDifferentiationStudioState(newState) {
  currentState = { ...currentState, ...newState };
}

export function renderDifferentiationStudioView() {
  const generatedPrompt = userEditedPrompt !== null ? userEditedPrompt : buildDifferentiationStudioPrompt(currentState);
  const activeAi = aiService.getActiveProviderStatus();

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- Studio Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <div>
              <h1 class="pedaia-page-title text-slate-900 dark:text-white">AI Differentiation Studio</h1>
              <p class="pedaia-helper text-slate-500 dark:text-slate-400">Multi-tiered equity planning, common learning objectives, custom profiles, and zero-PII privacy</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button id="diff-reset-btn" class="px-3.5 py-1.5 pedaia-label text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5">
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
        <!-- LEFT PANEL: DIFFERENTIATION BUILDER (7 Cols)                      -->
        <!-- ================================================================= -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Shared Context -->
          ${renderGlobalContextForm(currentState, 'diff')}

          <!-- Section 2: Pedagogical Differentiation Architecture -->
          <div class="space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-2xs">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 class="pedaia-section-heading text-slate-900 dark:text-white">Essential Common Objective & Tiers</h3>
                  <p class="pedaia-helper text-slate-500 dark:text-slate-400">Non-negotiable core standard with multi-tiered pathways</p>
                </div>
              </div>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">Step 2 of 3</span>
            </div>

            <!-- Essential Common Learning Objective -->
            <div class="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
              <label class="pedaia-label block text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Essential Common Learning Objective (For ALL Learners)</span>
              </label>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">The unifying, non-negotiable benchmark that every learner strives toward regardless of their tier.</p>
              <textarea id="diff-commonObjective" rows="2" class="w-full text-xs p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-purple-500 outline-none transition-colors" placeholder="e.g. All students will evaluate two conflicting historical claims and articulate how author bias influences evidence selection.">${escapeHtml(currentState.commonObjective || '')}</textarea>
            </div>

            <!-- Custom Learner Profiles / Groups Builder -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <label class="pedaia-label text-slate-700 dark:text-slate-300">Designated Learner Profiles & Groups</label>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Define asset-based strengths and accommodations (strictly non-PII)</p>
                </div>
                <button type="button" id="diff-add-profile-btn" class="px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>Add Group Profile</span>
                </button>
              </div>

              <!-- Profile Cards List -->
              <div class="space-y-2" id="diff-profiles-container">
                ${(currentState.customLearnerProfiles || []).map((prof, idx) => `
                  <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/60 dark:bg-slate-850/60 shadow-2xs space-y-1.5" data-idx="${idx}">
                    <div class="flex items-center justify-between gap-2">
                      <input type="text" class="profile-name-input text-xs font-bold text-slate-900 dark:text-white bg-transparent border-0 border-b border-transparent focus:border-purple-500 focus:outline-none p-0.5 flex-1" value="${escapeHtml(prof.name)}" placeholder="Group name (e.g. Tier 1 Support)...">
                      <button type="button" class="profile-remove-btn text-slate-400 hover:text-rose-600 p-1 rounded" data-idx="${idx}" title="Remove Profile">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <input type="text" class="profile-needs-input w-full text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-purple-500 focus:outline-none p-0.5" value="${escapeHtml(prof.needs || '')}" placeholder="Specific scaffolds, text modifications, or enrichment extensions...">
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Differentiation Dimensions (Content, Process, Product) -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Targeted Differentiation Dimensions</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" id="diff-dimensions-group">
                ${DIFFERENTIATION_DIMENSIONS.slice(0, 3).map(dim => {
                  const isChecked = (currentState.differentiationDimensions || []).includes(dim.id);
                  return `
                    <label class="p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isChecked ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200'}">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-bold">${dim.label}</span>
                        <input type="checkbox" data-val="${dim.id}" class="dimension-checkbox rounded text-purple-600 focus:ring-purple-500" ${isChecked ? 'checked' : ''}>
                      </div>
                      <span class="text-[10.5px] text-slate-500 dark:text-slate-400">${dim.desc}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Adaptation Strategies (Chips) -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Adaptation & Scaffolding Strategies</label>
              <div class="flex flex-wrap gap-1.5" id="diff-strategies-group">
                ${ADAPTATION_STRATEGIES.map(s => {
                  const isSelected = (currentState.adaptationStrategies || []).includes(s);
                  return `
                    <button type="button" data-val="${s}" class="strategy-chip text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected ? 'bg-purple-600 text-white border-purple-600 font-semibold' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}">
                      ${isSelected ? '✓ ' : '+ '}${s}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Before-and-After Pedagogical Comparison Toggle -->
            <label class="flex items-center justify-between p-3 rounded-xl border border-purple-100 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 cursor-pointer">
              <div class="flex items-center gap-2">
                <span class="text-base">⚖️</span>
                <div>
                  <span class="text-xs font-bold text-slate-900 dark:text-white block">Generate Before-and-After Pedagogical Comparison</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Shows universal baseline task vs. tiered differentiated plan</span>
                </div>
              </div>
              <input type="checkbox" id="diff-includeBeforeAfter" class="rounded text-purple-600 focus:ring-purple-500" ${currentState.includeBeforeAfter ? 'checked' : ''}>
            </label>

          </div>

          <!-- Section 3: Privacy & Output Specifications -->
          <div class="space-y-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            
            <!-- Ethical Privacy Guarantee Banner -->
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-start gap-3">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white block">FERPA & Pedagogical Privacy Assurance</span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  PEDAIA processes only instructional profiles, cognitive readiness tiers, and learning styles. No student names, grades, or identifying student data are transmitted or stored.
                </span>
              </div>
            </div>

            <!-- Output Format -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Differentiated Output Architecture</label>
              <select id="diff-outputFormat" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-purple-500 outline-none">
                ${DIFF_OUTPUT_FORMATS.map(f => `<option value="${f}" ${currentState.outputFormat === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>

            <!-- Specific Learner Needs Textarea -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Specific Classroom Accommodations & Misconceptions</label>
              <textarea id="diff-specificLearnerNeeds" rows="2" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-purple-500 outline-none transition-colors" placeholder="Note any specific language hurdles, prerequisite gaps, or extension avenues...">${escapeHtml(currentState.specificLearnerNeeds || '')}</textarea>
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
                ${getDiffWorkspaceBadge(workspaceState)}
              </div>
              
              <!-- Tab Switcher -->
              <div class="flex items-center gap-1">
                ${generatedOutput ? `
                  <button id="diff-tab-output-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'output' || workspaceState === 'editing' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Output
                  </button>
                  <button id="diff-tab-preview-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Prompt
                  </button>
                ` : `
                  <button id="diff-toggle-edit-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    ${isPromptEditable ? 'Done Editing' : 'Edit Prompt'}
                  </button>
                  <button id="diff-copy-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-900 bg-purple-50 dark:bg-purple-950/60 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </button>
                `}
              </div>
            </div>

            <!-- Workspace Body according to State -->
            ${renderDiffWorkspaceBody(workspaceState, generatedPrompt, generatedOutput, activeAi)}

            <!-- Panel Actions Footer -->
            <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
              
              <!-- Active AI Engine Indicator & Quick Switcher -->
              <div class="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span class="text-slate-600 dark:text-slate-300 truncate">AI Engine: <strong>${activeAi.name}</strong> <span class="font-mono text-[11px] text-slate-400">(${activeAi.model})</span> • <span class="text-purple-600 dark:text-purple-400 font-semibold">Ready</span></span>
                </div>
                <button type="button" id="diff-switch-ai-engine-btn" class="text-purple-600 dark:text-purple-400 font-semibold hover:underline shrink-0 text-xs">
                  <span>Switch AI</span>
                </button>
              </div>

              <!-- Main Generation Action Button -->
              <div class="flex items-center gap-2">
                <button id="diff-generate-output-btn" class="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2" ${workspaceState === 'generating' ? 'disabled' : ''}>
                  ${workspaceState === 'generating' ? `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Synthesizing Differentiated Matrix...</span>
                  ` : `
                    <svg class="w-4 h-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>${generatedOutput ? 'Re-Synthesize Differentiated Plan' : 'Generate Differentiated Plan'}</span>
                  `}
                </button>
              </div>

              <!-- Secondary Actions -->
              <div class="flex items-center gap-2 pt-1">
                <button id="diff-save-template-btn" class="flex-1 py-2 px-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save to Library</span>
                </button>

                ${activeGeneratedDesignId ? `
                  <button id="diff-open-canvas-btn" class="flex-1 py-2 px-3 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200 dark:border-purple-800/60 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Full Canvas</span>
                  </button>
                ` : `
                  <button id="diff-refresh-prompt-btn" title="Re-compile prompt from inputs" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 transition-colors">
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

function getDiffWorkspaceBadge(state) {
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
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Differentiation Plan Generated</span>
        </span>
      `;
    case 'editing':
      return `
        <span class="ws-state-pill editing">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Editing Plan</span>
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
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Prompt Preview</span>
        </span>
      `;
  }
}

function renderDiffWorkspaceBody(state, prompt, output, activeAi) {
  if (state === 'generating') {
    return `
      <div class="p-8 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 text-center space-y-4 min-h-[420px] flex flex-col items-center justify-center border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div class="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto animate-pulse">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-1">Synthesizing Differentiated Plan...</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Aligning common standard across Tier 1 scaffolding, Tier 2 core, and Tier 3 extension pathways</p>
        </div>
        <div class="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mx-auto mt-2">
          <div class="bg-purple-600 dark:bg-purple-500 h-1.5 rounded-full animate-pulse" style="width: 78%"></div>
        </div>
      </div>
    `;
  }

  if (state === 'output') {
    return `
      <div class="flex flex-col">
        <!-- Output Toolbar -->
        <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-600 dark:text-slate-300">Generated Tiered Plan</span>
          <div class="flex items-center gap-1.5">
            <button id="diff-edit-output-btn" class="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded hover:bg-slate-200 transition-colors">
              Edit Markdown
            </button>
            <button id="diff-copy-output-btn" class="px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-400 hover:text-purple-900 rounded hover:bg-purple-50 transition-colors">
              Copy
            </button>
            <button id="diff-export-output-btn" class="px-2 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors">
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
        <div class="px-4 py-2 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs">
          <span class="font-semibold text-purple-700 dark:text-purple-300">Markdown Editor</span>
          <div class="flex items-center gap-1.5">
            <button id="diff-cancel-edit-output-btn" class="px-2 py-1 text-xs text-slate-500 hover:text-slate-800">
              Cancel
            </button>
            <button id="diff-save-output-edits-btn" class="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded">
              Save Edits
            </button>
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200/80 dark:border-slate-800 transition-colors">
          <textarea id="diff-output-markdown-textarea" class="w-full h-[460px] bg-transparent text-slate-800 dark:text-slate-100 font-mono text-xs border-0 outline-none resize-none leading-relaxed">${escapeHtml(output)}</textarea>
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
          <button id="diff-error-switch-ai-btn" class="px-3 py-1.5 text-xs font-semibold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 rounded-lg">
            Switch AI Engine
          </button>
          <button id="diff-error-copy-prompt-btn" class="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg">
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
        <textarea id="diff-editable-prompt-text" class="w-full h-96 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-[13.5px] border-0 focus:outline-none resize-none leading-relaxed selection:bg-purple-100 dark:selection:bg-purple-900/60">${escapeHtml(prompt)}</textarea>
      ` : `
        <pre class="whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-200 select-all selection:bg-purple-100 dark:selection:bg-purple-900/60">${escapeHtml(prompt)}</pre>
      `}
    </div>
  `;
}

export function setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings) {
  const updatePromptDisplay = () => {
    userEditedPrompt = null;
    const prompt = buildDifferentiationStudioPrompt(currentState);
    const pre = container.querySelector('pre');
    if (pre) pre.textContent = prompt;
    const textarea = container.querySelector('#diff-editable-prompt-text');
    if (textarea) textarea.value = prompt;
  };

  // Tab buttons: Prompt vs Output
  container.querySelector('#diff-tab-preview-btn')?.addEventListener('click', () => {
    workspaceState = 'preview';
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#diff-tab-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Edit raw output markdown
  container.querySelector('#diff-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'editing';
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#diff-cancel-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#diff-save-output-edits-btn')?.addEventListener('click', () => {
    const textarea = container.querySelector('#diff-output-markdown-textarea');
    if (textarea) {
      generatedOutput = textarea.value;
      if (activeGeneratedDesignId) {
        store.updateDesign(activeGeneratedDesignId, {
          output: generatedOutput,
          refinementNote: 'Manual edits saved in differentiation studio'
        });
      }
      showToast('Output edits saved successfully!', 'success');
      workspaceState = 'output';
      container.innerHTML = renderDifferentiationStudioView();
      setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    }
  });

  // Copy output
  container.querySelector('#diff-copy-output-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedOutput);
      showToast('Differentiated plan copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy output.', 'error');
    }
  });

  // Export output
  container.querySelector('#diff-export-output-btn')?.addEventListener('click', () => {
    openUniversalExportModal({
      title: `Differentiation Plan: ${currentState.topic || 'Curriculum Differentiation'}`,
      markdown: generatedOutput,
      subject: currentState.subject,
      gradeLevel: currentState.gradeLevel,
      showToast
    });
  });

  // Open full Refinement Canvas
  container.querySelector('#diff-open-canvas-btn')?.addEventListener('click', () => {
    if (activeGeneratedDesignId) {
      navigateToWorkspace(activeGeneratedDesignId);
    }
  });

  // Switch Active AI Engine
  container.querySelector('#diff-switch-ai-engine-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        container.innerHTML = renderDifferentiationStudioView();
        setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  // Error state buttons
  container.querySelector('#diff-error-switch-ai-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        workspaceState = 'preview';
        container.innerHTML = renderDifferentiationStudioView();
        setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  container.querySelector('#diff-error-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildDifferentiationStudioPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Compiled prompt copied! Paste into any AI model.', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Reset Studio Button
  container.querySelector('#diff-reset-btn')?.addEventListener('click', () => {
    if (confirm('Reset Differentiation Studio to defaults?')) {
      currentState = getInitialDifferentiationStudioState();
      workspaceState = 'preview';
      generatedOutput = '';
      activeGeneratedDesignId = null;
      container.innerHTML = renderDifferentiationStudioView();
      setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
      showToast('Differentiation Studio reset to defaults.', 'info');
    }
  });

  // Add Custom Profile Button
  container.querySelector('#diff-add-profile-btn')?.addEventListener('click', () => {
    const nextIdx = (currentState.customLearnerProfiles || []).length + 1;
    currentState.customLearnerProfiles.push({
      name: `Custom Learner Pod ${nextIdx}`,
      needs: 'Specify readiness modifications and scaffolds...'
    });
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Custom Profile Name & Needs Inputs
  container.querySelectorAll('#diff-profiles-container .profile-name-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const row = e.target.closest('[data-idx]');
      const idx = parseInt(row.getAttribute('data-idx'), 10);
      if (currentState.customLearnerProfiles[idx]) {
        currentState.customLearnerProfiles[idx].name = e.target.value;
        updatePromptDisplay();
      }
    });
  });

  container.querySelectorAll('#diff-profiles-container .profile-needs-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const row = e.target.closest('[data-idx]');
      const idx = parseInt(row.getAttribute('data-idx'), 10);
      if (currentState.customLearnerProfiles[idx]) {
        currentState.customLearnerProfiles[idx].needs = e.target.value;
        updatePromptDisplay();
      }
    });
  });

  container.querySelectorAll('#diff-profiles-container .profile-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (currentState.customLearnerProfiles.length <= 1) {
        showToast('At least one learner profile must be maintained.', 'warning');
        return;
      }
      currentState.customLearnerProfiles.splice(idx, 1);
      container.innerHTML = renderDifferentiationStudioView();
      setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Common Objective Textarea
  container.querySelector('#diff-commonObjective')?.addEventListener('input', (e) => {
    currentState.commonObjective = e.target.value;
    updatePromptDisplay();
  });

  // Differentiation Dimensions Checkboxes
  container.querySelectorAll('#diff-dimensions-group .dimension-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const checkedDims = [];
      container.querySelectorAll('#diff-dimensions-group .dimension-checkbox:checked').forEach(c => {
        checkedDims.push(c.getAttribute('data-val'));
      });
      currentState.differentiationDimensions = checkedDims;
      updatePromptDisplay();
    });
  });

  // Strategies Chips
  container.querySelectorAll('#diff-strategies-group .strategy-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      const list = currentState.adaptationStrategies || [];
      if (list.includes(val)) {
        currentState.adaptationStrategies = list.filter(x => x !== val);
      } else {
        currentState.adaptationStrategies = [...list, val];
      }
      container.innerHTML = renderDifferentiationStudioView();
      setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Before-and-After Toggle
  container.querySelector('#diff-includeBeforeAfter')?.addEventListener('change', (e) => {
    currentState.includeBeforeAfter = e.target.checked;
    updatePromptDisplay();
  });

  // Output Format Select
  container.querySelector('#diff-outputFormat')?.addEventListener('change', (e) => {
    currentState.outputFormat = e.target.value;
    updatePromptDisplay();
  });

  // Specific Needs Textarea
  container.querySelector('#diff-specificLearnerNeeds')?.addEventListener('input', (e) => {
    currentState.specificLearnerNeeds = e.target.value;
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

  bindInput('diff-subject', 'subject');
  bindInput('diff-customSubject', 'customSubject');
  bindInput('diff-educationalLevel', 'educationalLevel');
  bindInput('diff-gradeLevel', 'gradeLevel');
  bindInput('diff-topic', 'topic');
  bindInput('diff-competency', 'competency');
  bindInput('diff-learnerProfile', 'learnerProfile');
  bindInput('diff-customDuration', 'customDuration');
  bindInput('diff-customResources', 'customResources');

  // Re-render if subject changes to/from 'Other'
  container.querySelector('#diff-subject')?.addEventListener('change', () => {
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Toggle Edit Prompt
  container.querySelector('#diff-toggle-edit-prompt-btn')?.addEventListener('click', () => {
    if (isPromptEditable) {
      const textarea = container.querySelector('#diff-editable-prompt-text');
      if (textarea) userEditedPrompt = textarea.value;
      isPromptEditable = false;
    } else {
      isPromptEditable = true;
    }
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Copy Prompt
  container.querySelector('#diff-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildDifferentiationStudioPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Differentiated instruction prompt copied!', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Save to Library
  container.querySelector('#diff-save-template-btn')?.addEventListener('click', () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildDifferentiationStudioPrompt(currentState);
    const name = window.prompt('Enter a title for this differentiation template:', `Differentiation: ${currentState.topic || 'Subject Tiers'}`);
    if (name) {
      store.saveTemplate({
        name,
        title: name,
        category: 'Differentiation',
        categoryKey: 'differentiation',
        description: `Multi-tiered scaffolding and extension matrix for ${currentState.subject}.`,
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
  container.querySelector('#diff-refresh-prompt-btn')?.addEventListener('click', () => {
    userEditedPrompt = null;
    updatePromptDisplay();
    showToast('Prompt re-compiled from inputs.', 'info');
  });

  // Generate Output
  container.querySelector('#diff-generate-output-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildDifferentiationStudioPrompt(currentState);

    // Direct generation with built-in AI synthesis (zero required keys)
    workspaceState = 'generating';
    container.innerHTML = renderDifferentiationStudioView();
    setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);

    try {
      const result = await aiService.generate({ prompt });
      generatedOutput = result.output;

      const newDesign = {
        id: 'design-' + Date.now(),
        title: `Differentiation Plan: ${currentState.topic || 'Tiered Learning Matrix'}`,
        category: 'differentiation',
        categoryLabel: 'Differentiation Studio',
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
      showToast('Differentiated matrix synthesized successfully!', 'success');
      container.innerHTML = renderDifferentiationStudioView();
      setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    } catch (err) {
      workspaceState = 'error';
      lastErrorMessage = err.message || 'Generation failed.';
      showToast(lastErrorMessage, 'error');
      container.innerHTML = renderDifferentiationStudioView();
      setupDifferentiationStudioListeners(container, navigateToWorkspace, showToast, openSettings);
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
