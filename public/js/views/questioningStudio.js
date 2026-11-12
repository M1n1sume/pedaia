// PEDAIA Module 3: AI Questioning Studio with Precision Question Distribution Builder & 5-State Workspace
import { renderGlobalContextForm } from './sharedContext.js';
import { buildQuestioningStudioPrompt } from '../promptEngine.js';
import { store } from '../state.js';
import { aiService } from '../aiService.js';
import { openUniversalImportModal } from '../importUtils.js';
import { openUniversalExportModal, renderMarkdownToHtml } from '../exportUtils.js';
import { openAiSwitcherModal } from './aiSwitcherModal.js';

export const QUESTION_PURPOSES = [
  'Conceptual Understanding',
  'Critical Thinking',
  'Formative Assessment',
  'Socratic Dialogue',
  'Recall & Fluency',
  'Application & Problem Solving',
  'Summative Evaluation',
  'Metacognitive Reflection'
];

export const BLOOM_LEVELS = [
  { id: 'Remember', label: 'Remember', desc: 'Recall facts, definitions, formulas', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'Understand', label: 'Understand', desc: 'Explain ideas, summarize, interpret', color: 'border-sky-300 dark:border-sky-800' },
  { id: 'Apply', label: 'Apply', desc: 'Use knowledge in novel situations', color: 'border-emerald-300 dark:border-emerald-800' },
  { id: 'Analyze', label: 'Analyze', desc: 'Deconstruct components, error analysis', color: 'border-amber-300 dark:border-amber-800' },
  { id: 'Evaluate', label: 'Evaluate', desc: 'Justify decisions, critique evidence', color: 'border-orange-300 dark:border-orange-800' },
  { id: 'Create', label: 'Create', desc: 'Synthesize new designs or hypotheses', color: 'border-purple-300 dark:border-purple-800' }
];

export const QUESTION_TYPES = [
  'Multiple Choice',
  'Short Answer',
  'Scenario-Based',
  'Socratic Questions',
  'Problem-Based',
  'Open-Ended',
  'True or False',
  'Essay'
];

export const DISTRACTOR_QUALITIES = [
  { id: 'Diagnostic Misconception-Driven', label: 'Diagnostic Misconceptions', desc: 'Every distractor targets a documented student error or misconception' },
  { id: 'Subtle Near-Miss Plausibility', label: 'Subtle Near-Misses', desc: 'Plausible distinctions that challenge high-achieving students' },
  { id: 'Procedural & Computational Traps', label: 'Procedural Traps', desc: 'Common calculation mistakes (sign errors, inverted operations)' },
  { id: 'Standard Academic Options', label: 'Standard Options', desc: 'Balanced plausible alternatives with distinct concepts' }
];

export function getInitialQuestioningStudioState() {
  return {
    subject: 'Mathematics',
    customSubject: '',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 8',
    topic: 'Linear Equations and Slope-Intercept Form (y = mx + b)',
    competency: 'Illustrate linear equations in two variables, find slope and intercepts, and solve real-world problems.',
    learnerProfile: 'Class of 30 students; some struggling with negative slopes and graphing fractional runs.',
    duration: '45 minutes',
    modality: 'Face-to-Face',
    resources: ['Whiteboard', 'Printed Materials'],
    customResources: 'Graph paper, coordinate grid whiteboards',
    questionPurposes: ['Conceptual Understanding', 'Critical Thinking', 'Formative Assessment', 'Socratic Dialogue'],
    questionTypes: ['Multiple Choice', 'Short Answer', 'Scenario-Based', 'Socratic Questions'],
    numQuestions: 10,
    bloomsDistribution: {
      Remember: 1,
      Understand: 2,
      Apply: 2,
      Analyze: 2,
      Evaluate: 2,
      Create: 1
    },
    difficultyDistribution: {
      easy: '20%',
      medium: '50%',
      challenging: '30%'
    },
    distractorQuality: 'Diagnostic Misconception-Driven',
    includeAnswerKey: true,
    includeFollowUps: true,
    formatting: 'Organized by Cognitive Level',
    additionalRequirements: 'For multiple choice items, explicitly explain why each incorrect distractor diagnoses a specific misconception (e.g. inverted run/rise or misplaced negative sign).'
  };
}

let currentState = getInitialQuestioningStudioState();
let isPromptEditable = false;
let userEditedPrompt = null;

// AI Workspace State: 'preview' | 'generating' | 'output' | 'editing' | 'error'
let workspaceState = 'preview';
let generatedOutput = '';
let activeGeneratedDesignId = null;
let lastErrorMessage = '';

export function setQuestioningStudioState(newState) {
  currentState = { ...currentState, ...newState };
}

export function renderQuestioningStudioView() {
  const generatedPrompt = userEditedPrompt !== null ? userEditedPrompt : buildQuestioningStudioPrompt(currentState);
  const activeAi = aiService.getActiveProviderStatus();
  
  // Calculate current sum of Bloom's distribution
  const dist = currentState.bloomsDistribution || {};
  const currentDistSum = Object.values(dist).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
  const totalRequested = parseInt(currentState.numQuestions, 10) || 10;
  const isDistributionBalanced = currentDistSum === totalRequested;

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- Studio Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <h1 class="pedaia-page-title text-slate-900 dark:text-white">AI Questioning Studio</h1>
              <p class="pedaia-helper text-slate-500 dark:text-slate-400">Precision Question Distribution Builder across Bloom's levels, difficulty, and diagnostic distractors</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button id="q-reset-btn" class="px-3.5 py-1.5 pedaia-label text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5">
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
        <!-- LEFT PANEL: QUESTION BUILDER (7 Cols)                             -->
        <!-- ================================================================= -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Shared Context Form -->
          ${renderGlobalContextForm(currentState, 'q')}

          <!-- Section 2: QUESTION DISTRIBUTION BUILDER -->
          <div class="space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="pedaia-section-heading text-slate-900 dark:text-white">Question Distribution Builder</h3>
                  <p class="pedaia-helper text-slate-500 dark:text-slate-400">Total count must equal the sum of Bloom's cognitive levels</p>
                </div>
              </div>
              
              <!-- Total Questions Counter Input -->
              <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Count:</label>
                <input type="number" id="q-total-count-input" min="3" max="50" class="w-14 text-xs font-bold text-center p-1 rounded-lg border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-amber-500 outline-none" value="${totalRequested}">
              </div>
            </div>

            <!-- Bloom's Cognitive Level Distribution Matrix -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="pedaia-label text-slate-700 dark:text-slate-300">Bloom's Revised Taxonomy Allocation</label>
                
                <!-- Live Validation Pill -->
                <div class="flex items-center gap-2">
                  ${isDistributionBalanced ? `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      <span>Balanced (${currentDistSum}/${totalRequested})</span>
                    </span>
                  ` : `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                      <svg class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      <span>Mismatch: ${currentDistSum} of ${totalRequested}</span>
                    </span>
                    <button type="button" id="q-auto-balance-btn" class="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors">
                      Auto-Balance
                    </button>
                  `}
                </div>
              </div>

              <!-- 6 Bloom Level Sliders / Numerical Steppers -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="q-blooms-inputs-container">
                ${BLOOM_LEVELS.map(lvl => {
                  const count = dist[lvl.id] !== undefined ? dist[lvl.id] : 1;
                  return `
                    <div class="p-3 rounded-xl border ${lvl.color} bg-slate-50/60 dark:bg-slate-850/60 flex items-center justify-between gap-3 shadow-2xs">
                      <div class="min-w-0">
                        <div class="text-xs font-bold text-slate-900 dark:text-white">${lvl.label}</div>
                        <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${lvl.desc}</div>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" class="bloom-dec-btn w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 flex items-center justify-center text-xs" data-level="${lvl.id}">
                          -
                        </button>
                        <input type="number" min="0" max="30" class="bloom-count-input w-10 text-xs font-bold text-center p-1 rounded-lg border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none" data-level="${lvl.id}" value="${count}">
                        <button type="button" class="bloom-inc-btn w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 flex items-center justify-center text-xs" data-level="${lvl.id}">
                          +
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Difficulty Distribution -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-2">Cognitive Difficulty Breakdown</label>
              <div class="grid grid-cols-3 gap-2 text-center text-xs">
                <div class="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <span class="block font-bold text-emerald-800 dark:text-emerald-300">Easy / Foundational</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">${currentState.difficultyDistribution.easy}</span>
                </div>
                <div class="p-2.5 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/50 dark:bg-sky-950/30">
                  <span class="block font-bold text-sky-800 dark:text-sky-300">Grade-Level Intermediate</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">${currentState.difficultyDistribution.medium}</span>
                </div>
                <div class="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30">
                  <span class="block font-bold text-purple-800 dark:text-purple-300">Challenging / Advanced</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">${currentState.difficultyDistribution.challenging}</span>
                </div>
              </div>
            </div>

            <!-- Question Formats Selection (Chips) -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Question Formats to Include</label>
              <div class="flex flex-wrap gap-1.5" id="q-types-group">
                ${QUESTION_TYPES.map(t => {
                  const isSelected = (currentState.questionTypes || []).includes(t);
                  return `
                    <button type="button" data-val="${t}" class="q-type-chip text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected ? 'bg-amber-600 text-white border-amber-600 font-semibold' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}">
                      ${isSelected ? '✓ ' : '+ '}${t}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Distractor Quality Specifications -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Distractor Quality Specification</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="q-distractor-group">
                ${DISTRACTOR_QUALITIES.map(d => {
                  const isSelected = currentState.distractorQuality === d.id;
                  return `
                    <button type="button" data-val="${d.id}" class="distractor-card p-2.5 text-left rounded-xl border transition-all ${isSelected ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-650'}">
                      <div class="text-xs font-bold">${d.label}</div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${d.desc}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Rigor Options (Answer Key & Probing Follow-ups) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 cursor-pointer">
                <input type="checkbox" id="q-includeAnswerKey" class="rounded text-amber-600 focus:ring-amber-500" ${currentState.includeAnswerKey ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Provide Model Answer Key</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Includes pedagogical rationales</span>
                </div>
              </label>

              <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 cursor-pointer">
                <input type="checkbox" id="q-includeFollowUps" class="rounded text-amber-600 focus:ring-amber-500" ${currentState.includeFollowUps ? 'checked' : ''}>
                <div>
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Probing Metacognitive Follow-ups</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Scripted teacher follow-up questions</span>
                </div>
              </label>
            </div>

            <!-- Additional Requirements -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Additional Assessment Preferences</label>
              <textarea id="q-additionalRequirements" rows="2" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-amber-500 outline-none transition-colors" placeholder="e.g. Include word problems with real-world budget constraints, avoid calculator-dependent numbers...">${escapeHtml(currentState.additionalRequirements || '')}</textarea>
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
                ${getWorkspaceStateBadge(workspaceState)}
              </div>
              
              <!-- Tab Switcher -->
              <div class="flex items-center gap-1">
                ${generatedOutput ? `
                  <button id="q-tab-output-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'output' || workspaceState === 'editing' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Output
                  </button>
                  <button id="q-tab-preview-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'preview' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Prompt
                  </button>
                ` : `
                  <button id="q-toggle-edit-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    ${isPromptEditable ? 'Done Editing' : 'Edit Prompt'}
                  </button>
                  <button id="q-copy-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 bg-amber-50 dark:bg-amber-950/60 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </button>
                `}
              </div>
            </div>

            <!-- Workspace Body according to State -->
            ${renderQuestioningWorkspaceBody(workspaceState, generatedPrompt, generatedOutput, activeAi)}

            <!-- Panel Actions Footer -->
            <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
              
              <!-- Active AI Engine Indicator & Quick Switcher -->
              <div class="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span class="text-slate-600 dark:text-slate-300 truncate">AI Engine: <strong>${activeAi.name}</strong> <span class="font-mono text-[11px] text-slate-400">(${activeAi.model})</span> • <span class="text-amber-600 dark:text-amber-400 font-semibold">Ready</span></span>
                </div>
                <button type="button" id="q-switch-ai-engine-btn" class="text-amber-600 dark:text-amber-400 font-semibold hover:underline shrink-0 text-xs">
                  <span>Switch AI</span>
                </button>
              </div>

              <!-- Main Generation Action Button -->
              <div class="flex items-center gap-2">
                <button id="q-generate-output-btn" class="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2" ${workspaceState === 'generating' ? 'disabled' : ''}>
                  ${workspaceState === 'generating' ? `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Synthesizing Question Matrix...</span>
                  ` : `
                    <svg class="w-4 h-4 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>${generatedOutput ? 'Re-Synthesize Questions' : 'Generate Questioning Matrix'}</span>
                  `}
                </button>
              </div>

              <!-- Secondary Actions -->
              <div class="flex items-center gap-2 pt-1">
                <button id="q-save-template-btn" class="flex-1 py-2 px-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save to Library</span>
                </button>

                ${activeGeneratedDesignId ? `
                  <button id="q-open-canvas-btn" class="flex-1 py-2 px-3 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Full Canvas</span>
                  </button>
                ` : `
                  <button id="q-refresh-prompt-btn" title="Re-compile prompt from form" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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

function getWorkspaceStateBadge(state) {
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
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Question Matrix Generated</span>
        </span>
      `;
    case 'editing':
      return `
        <span class="ws-state-pill editing">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Editing Matrix</span>
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
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Prompt Preview</span>
        </span>
      `;
  }
}

function renderQuestioningWorkspaceBody(state, prompt, output, activeAi) {
  if (state === 'generating') {
    return `
      <div class="p-8 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 text-center space-y-4 min-h-[420px] flex flex-col items-center justify-center border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div class="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto animate-pulse">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-1">Synthesizing Question Matrix...</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Calibrating ${currentState.numQuestions} items across 6 Bloom cognitive levels and diagnostic distractor rationales</p>
        </div>
        <div class="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mx-auto mt-2">
          <div class="bg-amber-600 dark:bg-amber-500 h-1.5 rounded-full animate-pulse" style="width: 80%"></div>
        </div>
      </div>
    `;
  }

  if (state === 'output') {
    return `
      <div class="flex flex-col">
        <!-- Output Toolbar -->
        <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-600 dark:text-slate-300">Generated Assessment Items</span>
          <div class="flex items-center gap-1.5">
            <button id="q-edit-output-btn" class="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded hover:bg-slate-200 transition-colors">
              Edit Markdown
            </button>
            <button id="q-copy-output-btn" class="px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 rounded hover:bg-amber-50 transition-colors">
              Copy
            </button>
            <button id="q-export-output-btn" class="px-2 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors">
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
        <div class="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
          <span class="font-semibold text-amber-800 dark:text-amber-300">Markdown Editor</span>
          <div class="flex items-center gap-1.5">
            <button id="q-cancel-edit-output-btn" class="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white">
              Cancel
            </button>
            <button id="q-save-output-edits-btn" class="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded">
              Save Edits
            </button>
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200/80 dark:border-slate-800 transition-colors">
          <textarea id="q-output-markdown-textarea" class="w-full h-[460px] bg-transparent text-slate-800 dark:text-slate-100 font-mono text-xs border-0 outline-none resize-none leading-relaxed">${escapeHtml(output)}</textarea>
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
          <button id="q-error-switch-ai-btn" class="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 rounded-lg">
            Switch AI Engine
          </button>
          <button id="q-error-copy-prompt-btn" class="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg">
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
        <textarea id="q-editable-prompt-text" class="w-full h-96 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-[13.5px] border-0 focus:outline-none resize-none leading-relaxed selection:bg-amber-100 dark:selection:bg-amber-900/60">${escapeHtml(prompt)}</textarea>
      ` : `
        <pre class="whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-200 select-all selection:bg-amber-100 dark:selection:bg-amber-900/60">${escapeHtml(prompt)}</pre>
      `}
    </div>
  `;
}

export function setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings) {
  const updatePromptDisplay = () => {
    userEditedPrompt = null;
    const prompt = buildQuestioningStudioPrompt(currentState);
    const pre = container.querySelector('pre');
    if (pre) pre.textContent = prompt;
    const textarea = container.querySelector('#q-editable-prompt-text');
    if (textarea) textarea.value = prompt;
  };

  // Tab buttons: Prompt vs Output
  container.querySelector('#q-tab-preview-btn')?.addEventListener('click', () => {
    workspaceState = 'preview';
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#q-tab-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Edit raw output markdown
  container.querySelector('#q-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'editing';
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#q-cancel-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#q-save-output-edits-btn')?.addEventListener('click', () => {
    const textarea = container.querySelector('#q-output-markdown-textarea');
    if (textarea) {
      generatedOutput = textarea.value;
      if (activeGeneratedDesignId) {
        store.updateDesign(activeGeneratedDesignId, {
          output: generatedOutput,
          refinementNote: 'Manual edits saved in questioning studio'
        });
      }
      showToast('Output edits saved successfully!', 'success');
      workspaceState = 'output';
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    }
  });

  // Copy output
  container.querySelector('#q-copy-output-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedOutput);
      showToast('Questions copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy output.', 'error');
    }
  });

  // Export output
  container.querySelector('#q-export-output-btn')?.addEventListener('click', () => {
    openUniversalExportModal({
      title: `Questioning Bank: ${currentState.topic || 'Curriculum Assessment'}`,
      markdown: generatedOutput,
      subject: currentState.subject,
      gradeLevel: currentState.gradeLevel,
      showToast
    });
  });

  // Open full Refinement Canvas
  container.querySelector('#q-open-canvas-btn')?.addEventListener('click', () => {
    if (activeGeneratedDesignId) {
      navigateToWorkspace(activeGeneratedDesignId);
    }
  });

  // Switch Active AI Engine
  container.querySelector('#q-switch-ai-engine-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        container.innerHTML = renderQuestioningStudioView();
        setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  // Error state buttons
  container.querySelector('#q-error-switch-ai-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        workspaceState = 'preview';
        container.innerHTML = renderQuestioningStudioView();
        setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  container.querySelector('#q-error-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildQuestioningStudioPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Compiled prompt copied! Paste into any AI model.', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Reset Studio Button
  container.querySelector('#q-reset-btn')?.addEventListener('click', () => {
    if (confirm('Reset the Questioning Studio to default inputs?')) {
      currentState = getInitialQuestioningStudioState();
      workspaceState = 'preview';
      generatedOutput = '';
      activeGeneratedDesignId = null;
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
      showToast('Questioning Studio reset to defaults.', 'info');
    }
  });

  // Import Source File (Syllabus, Quiz Source, Text, etc.)
  container.querySelector('#q-import-source-btn')?.addEventListener('click', () => {
    openUniversalImportModal({
      showToast,
      onAction: (action, data) => {
        if (action === 'save-to-designs' || action === 'open-workspace') {
          navigateToWorkspace('workspace', data.designId);
        } else {
          if (data.title) currentState.topic = data.title;
          if (data.subject && data.subject !== 'Interdisciplinary') currentState.subject = data.subject;
          if (data.text) {
            currentState.competency = `Questions derived from: ${data.filename || data.title}`;
          }
          container.innerHTML = renderQuestioningStudioView();
          setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
          showToast(`Loaded "${data.filename || data.title}" into Questioning Studio!`, 'success');
        }
      }
    });
  });

  // Total Question Count Input
  container.querySelector('#q-total-count-input')?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      currentState.numQuestions = val;
      updatePromptDisplay();
    }
  });

  container.querySelector('#q-total-count-input')?.addEventListener('change', () => {
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Auto-Balance Button
  container.querySelector('#q-auto-balance-btn')?.addEventListener('click', () => {
    const total = parseInt(currentState.numQuestions, 10) || 10;
    const levels = BLOOM_LEVELS.map(l => l.id);
    const basePerLevel = Math.floor(total / levels.length);
    const remainder = total % levels.length;

    const newDist = {};
    levels.forEach((lvl, i) => {
      newDist[lvl] = basePerLevel + (i < remainder ? 1 : 0);
    });
    currentState.bloomsDistribution = newDist;
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    showToast(`Balanced ${total} questions evenly across 6 Bloom levels.`, 'success');
  });

  // Steppers for Bloom Levels
  container.querySelectorAll('#q-blooms-inputs-container .bloom-inc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = btn.getAttribute('data-level');
      currentState.bloomsDistribution[lvl] = (parseInt(currentState.bloomsDistribution[lvl], 10) || 0) + 1;
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  container.querySelectorAll('#q-blooms-inputs-container .bloom-dec-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = btn.getAttribute('data-level');
      const cur = parseInt(currentState.bloomsDistribution[lvl], 10) || 0;
      if (cur > 0) {
        currentState.bloomsDistribution[lvl] = cur - 1;
        container.innerHTML = renderQuestioningStudioView();
        setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  container.querySelectorAll('#q-blooms-inputs-container .bloom-count-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const lvl = e.target.getAttribute('data-level');
      const val = Math.max(0, parseInt(e.target.value, 10) || 0);
      currentState.bloomsDistribution[lvl] = val;
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Question Types Chips
  container.querySelectorAll('#q-types-group .q-type-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      const list = currentState.questionTypes || [];
      if (list.includes(val)) {
        currentState.questionTypes = list.filter(x => x !== val);
      } else {
        currentState.questionTypes = [...list, val];
      }
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Distractor Quality Selection
  container.querySelectorAll('#q-distractor-group .distractor-card').forEach(btn => {
    btn.addEventListener('click', () => {
      currentState.distractorQuality = btn.getAttribute('data-val');
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Answer Key & Follow-up Toggles
  container.querySelector('#q-includeAnswerKey')?.addEventListener('change', (e) => {
    currentState.includeAnswerKey = e.target.checked;
    updatePromptDisplay();
  });

  container.querySelector('#q-includeFollowUps')?.addEventListener('change', (e) => {
    currentState.includeFollowUps = e.target.checked;
    updatePromptDisplay();
  });

  // Additional Requirements
  container.querySelector('#q-additionalRequirements')?.addEventListener('input', (e) => {
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

  bindInput('q-subject', 'subject');
  bindInput('q-customSubject', 'customSubject');
  bindInput('q-educationalLevel', 'educationalLevel');
  bindInput('q-gradeLevel', 'gradeLevel');
  bindInput('q-topic', 'topic');
  bindInput('q-competency', 'competency');
  bindInput('q-learnerProfile', 'learnerProfile');
  bindInput('q-customDuration', 'customDuration');
  bindInput('q-customResources', 'customResources');

  // Re-render if subject changes to/from 'Other'
  container.querySelector('#q-subject')?.addEventListener('change', () => {
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Toggle Edit Prompt
  container.querySelector('#q-toggle-edit-prompt-btn')?.addEventListener('click', () => {
    if (isPromptEditable) {
      const textarea = container.querySelector('#q-editable-prompt-text');
      if (textarea) userEditedPrompt = textarea.value;
      isPromptEditable = false;
    } else {
      isPromptEditable = true;
    }
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Copy Prompt Button
  container.querySelector('#q-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildQuestioningStudioPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Structured assessment prompt copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Save to Prompt Library Button
  container.querySelector('#q-save-template-btn')?.addEventListener('click', () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildQuestioningStudioPrompt(currentState);
    const name = window.prompt('Enter a title for this assessment template:', `Question Bank: ${currentState.topic || 'Subject Assessment'}`);
    if (name) {
      store.saveTemplate({
        name,
        title: name,
        category: 'Questioning',
        categoryKey: 'questioning',
        description: `Taxonomy question bank for ${currentState.subject} with ${currentState.distractorQuality} distractors.`,
        educationalLevels: currentState.educationalLevel,
        subjectApplicability: currentState.subject,
        previewText: prompt.slice(0, 150) + '...',
        defaultConfig: JSON.parse(JSON.stringify(currentState)),
        promptText: prompt
      });
      showToast('Template saved to Prompt Library!', 'success');
    }
  });

  // Re-compile prompt button
  container.querySelector('#q-refresh-prompt-btn')?.addEventListener('click', () => {
    userEditedPrompt = null;
    updatePromptDisplay();
    showToast('Prompt re-compiled from inputs.', 'info');
  });

  // Generate Output Button
  container.querySelector('#q-generate-output-btn')?.addEventListener('click', async () => {
    // Validate distribution before generation
    const dist = currentState.bloomsDistribution || {};
    const sum = Object.values(dist).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
    const total = parseInt(currentState.numQuestions, 10) || 10;
    if (sum !== total) {
      if (confirm(`Bloom's question distribution (${sum}) does not match requested total (${total}). Would you like to auto-balance the questions across the 6 levels before generating?`)) {
        const levels = BLOOM_LEVELS.map(l => l.id);
        const base = Math.floor(total / levels.length);
        const rem = total % levels.length;
        const newDist = {};
        levels.forEach((l, i) => { newDist[l] = base + (i < rem ? 1 : 0); });
        currentState.bloomsDistribution = newDist;
      }
    }

    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildQuestioningStudioPrompt(currentState);

    // Direct generation with built-in AI synthesis (zero required keys)
    workspaceState = 'generating';
    container.innerHTML = renderQuestioningStudioView();
    setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);

    try {
      const result = await aiService.generate({ prompt });
      generatedOutput = result.output;

      const newDesign = {
        id: 'design-' + Date.now(),
        title: `Question Matrix: ${currentState.topic || 'Assessment Matrix'}`,
        category: 'questioning',
        categoryLabel: 'Questioning Studio',
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
      showToast('Questioning matrix synthesized successfully!', 'success');
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
    } catch (err) {
      workspaceState = 'error';
      lastErrorMessage = err.message || 'Generation failed.';
      showToast(lastErrorMessage, 'error');
      container.innerHTML = renderQuestioningStudioView();
      setupQuestioningStudioListeners(container, navigateToWorkspace, showToast, openSettings);
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
