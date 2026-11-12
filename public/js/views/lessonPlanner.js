// PEDAIA Module 1: AI Lesson Planner with Dynamic Pedagogical Alignment & 5-State Workspace
import { renderGlobalContextForm, setupGlobalContextListeners } from './sharedContext.js';
import { buildLessonPlannerPrompt } from '../promptEngine.js';
import { store } from '../state.js';
import { aiService } from '../aiService.js';
import { openUniversalImportModal } from '../importUtils.js';
import { openUniversalExportModal, renderMarkdownToHtml } from '../exportUtils.js';
import { openAiSwitcherModal } from './aiSwitcherModal.js';

export const INSTRUCTIONAL_MODELS = [
  { id: '5E Instructional Model', name: '5E Model', desc: 'Engage, Explore, Explain, Elaborate, Evaluate' },
  { id: "4A's Model", name: "4A's Model", desc: 'Activity, Analysis, Abstraction, Application' },
  { id: 'Direct Instruction', name: 'Direct Instruction', desc: 'Review, Presentation, Guided Practice, Independent Practice, Assessment' },
  { id: 'Understanding by Design (UbD)', name: 'UbD Backward Design', desc: 'Stage 1 Desired Results, Stage 2 Evidence, Stage 3 Plan' },
  { id: 'Inquiry-Based Learning', name: 'Inquiry-Based', desc: 'Questioning, Investigation, Synthesis, Reflection' },
  { id: 'Problem-Based Learning', name: 'Problem-Based (PBL)', desc: 'Problem Presentation, Collaborative Inquiry, Solution, Debrief' },
  { id: 'Gradual Release of Responsibility', name: 'Gradual Release', desc: 'I Do, We Do, You Do Together, You Do Alone' },
  { id: 'Flipped Classroom', name: 'Flipped Classroom', desc: 'Pre-class review, in-class active inquiry, peer synthesis' },
  { id: 'Project-Based Learning', name: 'Project-Based', desc: 'Entry launch, sustained prototyping, public exhibition, reflection' },
  { id: 'Custom Instructional Model', name: 'Custom Model', desc: 'Fully educator-defined sequence without rigid templates' }
];

export const FRAMEWORK_SEQUENCES = {
  '5E Instructional Model': [
    { name: '1. Engage', desc: 'Hook curiosity, elicit prior knowledge, introduce discrepant phenomenon' },
    { name: '2. Explore', desc: 'Hands-on inquiry, collaborative observation, and active investigation' },
    { name: '3. Explain', desc: 'Student-led observations followed by formal academic concept modeling' },
    { name: '4. Elaborate', desc: 'Extend and apply learned concepts to novel real-world challenges' },
    { name: '5. Evaluate', desc: 'Formative mastery check, self-assessment, and exit reflection' }
  ],
  "4A's Model": [
    { name: '1. Activity', desc: 'Interactive experiential task to ground concrete observations' },
    { name: '2. Analysis', desc: 'Guided processing of student patterns, discrepancies, and findings' },
    { name: '3. Abstraction', desc: 'Formulating generalizations, theoretical principles, and key concepts' },
    { name: '4. Application', desc: 'Real-world problem solving and transfer of acquired competencies' }
  ],
  'Direct Instruction': [
    { name: '1. Review & Schema Activation', desc: 'Rapid check of prerequisite knowledge and lesson goals' },
    { name: '2. Presentation / Modeling (I Do)', desc: 'Explicit demonstration, worked examples, and think-alouds' },
    { name: '3. Guided Practice (We Do)', desc: 'Scaffolded pair exercises with immediate corrective feedback' },
    { name: '4. Independent Practice (You Do)', desc: 'Autonomous student task to build fluency and accuracy' },
    { name: '5. Assessment & Closure', desc: 'Exit ticket evaluation and consolidative summary' }
  ],
  'Understanding by Design (UbD)': [
    { name: 'Stage 1: Desired Results', desc: 'Enduring understandings, essential questions, and knowledge/skills goals' },
    { name: 'Stage 2: Assessment Evidence', desc: 'Authentic performance task (GRASPS) and formative assessment criteria' },
    { name: 'Stage 3: Learning Plan (WHERETO)', desc: 'Hooking learners, equipping them, rethinking ideas, and evaluating progress' }
  ],
  'Inquiry-Based Learning': [
    { name: '1. Question Formulation', desc: 'Provocative driving question and student hypothesis development' },
    { name: '2. Investigation & Evidence', desc: 'Data gathering, digital or laboratory research, and observation' },
    { name: '3. Synthesis & Reasoning', desc: 'Evaluating evidence, identifying claims, and building explanations' },
    { name: '4. Communication & Reflection', desc: 'Presenting conclusions and metacognitive inquiry reflection' }
  ],
  'Problem-Based Learning': [
    { name: '1. Problem Presentation', desc: 'Ill-structured authentic challenge and Need-to-Know brainstorm' },
    { name: '2. Collaborative Inquiry', desc: 'Division of tasks, resource interrogation, and strategy formulation' },
    { name: '3. Solution Formulation', desc: 'Designing, prototyping, and testing evidence-based interventions' },
    { name: '4. Presentation & Debrief', desc: 'Pitching solutions to authentic stakeholders and evaluative debrief' }
  ],
  'Gradual Release of Responsibility': [
    { name: '1. Focused Instruction (I Do)', desc: 'Teacher modeling, metacognitive think-aloud, and demonstration' },
    { name: '2. Guided Instruction (We Do)', desc: 'Teacher-led collaborative practice and probing dialogue' },
    { name: '3. Collaborative Learning (You Do Together)', desc: 'Peer problem solving, dialogue, and co-construction' },
    { name: '4. Independent Practice (You Do Alone)', desc: 'Individual student accountability and task completion' }
  ],
  'Flipped Classroom': [
    { name: '1. Pre-Class Review & Q&A', desc: 'Clarifying misconceptions from pre-assigned reading or media' },
    { name: '2. In-Class Active Workshop', desc: 'High-cognitive-demand collaborative tasks and case analysis' },
    { name: '3. Peer Critique & Synthesis', desc: 'Cross-team evaluation, defense of proposals, and teacher guidance' },
    { name: '4. Metacognitive Reflection', desc: 'Synthesizing key insights and setting subsequent learning targets' }
  ],
  'Project-Based Learning': [
    { name: '1. Project Launch & Driving Question', desc: 'Inspiring entry event, project brief, and rubric introduction' },
    { name: '2. Sustained Inquiry & Drafting', desc: 'Field research, expert interviews, and rapid prototyping' },
    { name: '3. Critique & Revision Cycles', desc: 'Formal peer feedback protocols (Tuning Protocol) and refinement' },
    { name: '4. Public Exhibition & Evaluation', desc: 'Showcasing work to real-world audience with evaluative defense' }
  ],
  'Custom Instructional Model': [
    { name: 'Phase 1: Orientation & Objectives', desc: 'Establish focus and clarify target competencies' },
    { name: 'Phase 2: Instructional Development', desc: 'Core teaching and student engagement sequence' },
    { name: 'Phase 3: Application & Deepening', desc: 'Hands-on execution and problem solving' },
    { name: 'Phase 4: Synthesis & Assessment', desc: 'Evaluation of mastery and reflective closure' }
  ]
};

export const TEACHING_STRATEGIES = [
  'Direct Modeling',
  'Guided Inquiry',
  'Collaborative Learning',
  'Discussion',
  'Demonstration',
  'Case-Based Learning',
  'Problem-Solving',
  'Experiential Learning',
  'Gamification',
  'Socratic Dialogue'
];

export const ASSESSMENT_TYPES = [
  'Diagnostic Check',
  'Formative Questioning',
  'Exit Ticket',
  'Summative Task',
  'Performance-Based Rubric',
  'Peer Assessment',
  'Self-Reflection',
  'Authentic Artifact'
];

export const OUTPUT_FORMATS = [
  { id: 'Detailed Lesson Plan', label: 'Detailed Lesson Plan', desc: 'Comprehensive step-by-step teacher/student dialogue and script' },
  { id: 'Semi-Detailed Lesson Plan', label: 'Semi-Detailed', desc: 'Clear procedure outline with core activities and questions' },
  { id: 'Brief Lesson Outline', label: 'Brief Outline', desc: 'High-level chronological roadmap for experienced instructors' },
  { id: 'Table Format', label: 'Table Format', desc: 'Tabular matrix with time, teacher, student roles' },
  { id: 'Narrative Format', label: 'Narrative Format', desc: 'Flowing pedagogical guide & instructional script' },
  { id: 'Teacher\'s Guide', label: 'Teacher\'s Guide', desc: 'Annotated pedagogical notes with pacing & tips' }
];

export function getInitialLessonPlannerState() {
  const defaultModel = '5E Instructional Model';
  return {
    subject: 'Science',
    customSubject: '',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 8',
    topic: 'Cellular Respiration and Photosynthesis',
    competency: 'Differentiate between photosynthesis and cellular respiration in terms of chemical inputs, energy conversion, and ecological role.',
    learnerProfile: 'Class of 32 students; heterogeneous reading levels; 4 students with visual learning accommodations.',
    duration: '60 minutes',
    modality: 'Face-to-Face',
    resources: ['Whiteboard', 'Printed Materials', 'Projector'],
    customResources: '',
    objectiveFramework: "Bloom's Revised Taxonomy",
    customObjectives: '',
    autoGenerateObjectives: true,
    instructionalModel: defaultModel,
    customInstructionalModel: '',
    lessonSequence: JSON.parse(JSON.stringify(FRAMEWORK_SEQUENCES[defaultModel])),
    teachingStrategies: ['Direct Modeling', 'Guided Inquiry', 'Collaborative Learning'],
    assessmentTypes: ['Formative Questioning', 'Exit Ticket'],
    outputFormat: 'Detailed Lesson Plan',
    additionalRequirements: 'Include explicit safety notes if handling lab materials, and provide a clear mnemonic for remembering the ATP cycle.'
  };
}

let currentState = getInitialLessonPlannerState();
let isPromptEditable = false;
let userEditedPrompt = null;

// AI Workspace Lifecycle State: 'preview' | 'generating' | 'output' | 'editing' | 'error'
let workspaceState = 'preview';
let generatedOutput = '';
let activeGeneratedDesignId = null;
let lastErrorMessage = '';

export function setLessonPlannerState(newState) {
  currentState = { ...currentState, ...newState };
  if (newState.instructionalModel && FRAMEWORK_SEQUENCES[newState.instructionalModel] && !newState.lessonSequence) {
    currentState.lessonSequence = JSON.parse(JSON.stringify(FRAMEWORK_SEQUENCES[newState.instructionalModel]));
  }
}

export function renderLessonPlannerView() {
  const generatedPrompt = userEditedPrompt !== null ? userEditedPrompt : buildLessonPlannerPrompt(currentState);
  const activeAi = aiService.getActiveProviderStatus();

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      
      <!-- Studio Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <div>
              <h1 class="pedaia-page-title text-slate-900 dark:text-white">AI Lesson Planner</h1>
              <p class="pedaia-helper text-slate-500 dark:text-slate-400">Dynamic pedagogical frameworks, aligned sequential phases, and dual prompt/output studio</p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button id="lp-reset-btn" class="px-3.5 py-1.5 pedaia-label text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5" title="Reset all fields to default">
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
        <!-- LEFT PANEL: INSTRUCTIONAL DESIGN BUILDER (7 Cols)                  -->
        <!-- ================================================================= -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Section 1: Global Educator Context -->
          ${renderGlobalContextForm(currentState, 'lp')}

          <!-- Section 2: Pedagogical Framework & Dynamic Sequence -->
          <div class="space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 class="pedaia-section-heading text-slate-900 dark:text-white">Instructional Framework & Dynamic Sequence</h3>
                  <p class="pedaia-helper text-slate-500 dark:text-slate-400">Framework dynamically controls the available sequence phases</p>
                </div>
              </div>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">Step 2 of 3</span>
            </div>

            <!-- Instructional Model Cards -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="pedaia-label text-slate-700 dark:text-slate-300">Select Pedagogical Framework</label>
                <span class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Controls sequence structure</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="lp-models-group">
                ${INSTRUCTIONAL_MODELS.map(m => {
                  const isSelected = currentState.instructionalModel === m.id;
                  return `
                    <button type="button" data-val="${m.id}" class="model-card p-3 text-left rounded-xl border transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500 shadow-xs' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-650'}">
                      <div class="text-xs font-bold">${m.name}</div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${m.desc}</div>
                    </button>
                  `;
                }).join('')}
              </div>

              ${currentState.instructionalModel === 'Custom Instructional Model' ? `
                <div class="mt-3">
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Custom Framework Name</label>
                  <input type="text" id="lp-customInstructionalModel" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none" placeholder="e.g. Experiential Learning Cycle (Kolb), Socratic Seminar Sequence..." value="${escapeHtml(currentState.customInstructionalModel || '')}">
                </div>
              ` : ''}
            </div>

            <!-- DYNAMIC SEQUENCE REORDERABLE PHASES -->
            <div class="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750/80 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>Lesson Sequence Components (${currentState.lessonSequence?.length || 0})</span>
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Reorder, rename, or customize descriptions for each instructional phase</p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" id="lp-add-phase-btn" class="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <span>Add Phase</span>
                  </button>
                  <button type="button" id="lp-reset-sequence-btn" class="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200" title="Reset sequence to framework defaults">
                    Reset
                  </button>
                </div>
              </div>

              <!-- Sequence Phase Items List -->
              <div class="space-y-2" id="lp-sequence-container">
                ${(currentState.lessonSequence || []).map((phase, idx) => `
                  <div class="flex items-start gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs group" data-idx="${idx}">
                    <span class="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                      ${idx + 1}
                    </span>

                    <div class="flex-1 space-y-1">
                      <input type="text" class="phase-name-input w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:outline-none p-0.5" value="${escapeHtml(phase.name || '')}" placeholder="Phase title...">
                      <input type="text" class="phase-desc-input w-full text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:outline-none p-0.5" value="${escapeHtml(phase.desc || '')}" placeholder="Pedagogical focus & activities...">
                    </div>

                    <!-- Reorder and Delete Controls -->
                    <div class="flex items-center gap-1 shrink-0 pt-0.5">
                      <button type="button" class="phase-up-btn p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}" data-idx="${idx}" title="Move Up" ${idx === 0 ? 'disabled' : ''}>
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                      </button>
                      <button type="button" class="phase-down-btn p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded ${idx === (currentState.lessonSequence?.length - 1) ? 'opacity-30 cursor-not-allowed' : ''}" data-idx="${idx}" title="Move Down" ${idx === (currentState.lessonSequence?.length - 1) ? 'disabled' : ''}>
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                      <button type="button" class="phase-remove-btn p-1 text-slate-400 hover:text-rose-600 rounded" data-idx="${idx}" title="Remove Phase">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Learning Objectives Framework & Alignment -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="pedaia-label text-slate-700 dark:text-slate-300">Learning Objective Framework</label>
                <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs text-indigo-700 dark:text-indigo-400">
                  <input type="checkbox" id="lp-autoGenObjectives" class="rounded text-indigo-600 focus:ring-indigo-500" ${currentState.autoGenerateObjectives ? 'checked' : ''}>
                  <span class="font-medium text-xs">Auto-generate measurable objectives</span>
                </label>
              </div>
              <select id="lp-objectiveFramework" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors">
                <option value="Bloom's Revised Taxonomy" ${currentState.objectiveFramework === "Bloom's Revised Taxonomy" ? 'selected' : ''}>Bloom's Revised Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, Create)</option>
                <option value="SMART Objectives" ${currentState.objectiveFramework === "SMART Objectives" ? 'selected' : ''}>SMART Objectives (Specific, Measurable, Achievable, Relevant, Time-bound)</option>
                <option value="Competency-Based Objectives" ${currentState.objectiveFramework === "Competency-Based Objectives" ? 'selected' : ''}>Competency-Based / Outcome-Driven</option>
                <option value="Custom" ${currentState.objectiveFramework === "Custom" ? 'selected' : ''}>Custom Framework</option>
              </select>

              ${!currentState.autoGenerateObjectives ? `
                <div class="mt-2.5">
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Custom Measurable Objectives (One per line)</label>
                  <textarea id="lp-customObjectives" rows="3" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. By the end of the lesson, learners will be able to...">${escapeHtml(currentState.customObjectives || '')}</textarea>
                </div>
              ` : ''}
            </div>

            <!-- Teaching Strategies -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Teaching Strategies</label>
              <div class="flex flex-wrap gap-1.5" id="lp-strategies-group">
                ${TEACHING_STRATEGIES.map(s => {
                  const isSelected = (currentState.teachingStrategies || []).includes(s);
                  return `
                    <button type="button" data-val="${s}" class="strategy-chip text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 font-semibold' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}">
                      ${isSelected ? '✓ ' : '+ '}${s}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Assessment Strategies -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Assessment Strategies</label>
              <div class="flex flex-wrap gap-1.5" id="lp-assessments-group">
                ${ASSESSMENT_TYPES.map(a => {
                  const isSelected = (currentState.assessmentTypes || []).includes(a);
                  return `
                    <button type="button" data-val="${a}" class="assessment-chip text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 font-semibold' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}">
                      ${isSelected ? '✓ ' : '+ '}${a}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

          </div>

          <!-- Section 3: Output Specifications & Constraints -->
          <div class="space-y-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h3 class="pedaia-section-heading text-slate-900 dark:text-white">Output Specifications & Institutional Constraints</h3>
                  <p class="pedaia-helper text-slate-500 dark:text-slate-400">Document format and teacher preferences</p>
                </div>
              </div>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">Step 3 of 3</span>
            </div>

            <!-- Desired Output Format Cards -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1.5">Output Document Format</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="lp-format-group">
                ${OUTPUT_FORMATS.map(f => {
                  const isSelected = currentState.outputFormat === f.id;
                  return `
                    <button type="button" data-val="${f.id}" class="format-card p-2.5 text-left rounded-xl border transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500' : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-650'}">
                      <div class="text-xs font-bold">${f.label}</div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${f.desc}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Additional Requirements -->
            <div>
              <label class="pedaia-label block text-slate-700 dark:text-slate-300 mb-1">Additional Requirements, Preferences, or Institutional Notes</label>
              <textarea id="lp-additionalRequirements" rows="2.5" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition-colors" placeholder="Specify any unique school guidelines, institutional rubrics, vocabulary lists, or safety precautions...">${escapeHtml(currentState.additionalRequirements || '')}</textarea>
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
                ${getStateHeaderBadge(workspaceState)}
              </div>
              
              <!-- Tab Switcher (Prompt Preview vs Output) -->
              <div class="flex items-center gap-1">
                ${generatedOutput ? `
                  <button id="lp-tab-output-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'output' || workspaceState === 'editing' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Output
                  </button>
                  <button id="lp-tab-preview-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${workspaceState === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                    Prompt
                  </button>
                ` : `
                  <button id="lp-toggle-edit-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    ${isPromptEditable ? 'Done Editing' : 'Edit Prompt'}
                  </button>
                  <button id="lp-copy-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </button>
                `}
              </div>
            </div>

            <!-- Workspace Body depending on State -->
            ${renderWorkspaceBody(workspaceState, generatedPrompt, generatedOutput, activeAi)}

            <!-- Panel Actions Footer -->
            <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
              
              <!-- Active AI Engine Indicator & Quick Switcher -->
              <div class="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span class="text-slate-600 dark:text-slate-300 truncate">AI Engine: <strong>${activeAi.name}</strong> <span class="font-mono text-[11px] text-slate-400">(${activeAi.model})</span> • <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span></span>
                </div>
                <button type="button" id="lp-switch-ai-engine-btn" class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0 text-xs flex items-center gap-0.5">
                  <span>Switch AI</span>
                </button>
              </div>

              <!-- Main Generation Action Button -->
              <div class="flex items-center gap-2">
                <button id="lp-generate-output-btn" class="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2" ${workspaceState === 'generating' ? 'disabled' : ''}>
                  ${workspaceState === 'generating' ? `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Synthesizing Instructional Output...</span>
                  ` : `
                    <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>${generatedOutput ? 'Re-Synthesize Lesson Plan' : 'Generate Instructional Output'}</span>
                  `}
                </button>
              </div>

              <!-- Secondary Actions: Save Template & Canvas -->
              <div class="flex items-center gap-2 pt-1">
                <button id="lp-save-template-btn" class="flex-1 py-2 px-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save to Library</span>
                </button>

                ${activeGeneratedDesignId ? `
                  <button id="lp-open-canvas-btn" class="flex-1 py-2 px-3 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Full Canvas</span>
                  </button>
                ` : `
                  <button id="lp-refresh-prompt-btn" title="Re-compile prompt from current form inputs" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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

function getStateHeaderBadge(state) {
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
          <span>Generated Output</span>
        </span>
      `;
    case 'editing':
      return `
        <span class="ws-state-pill editing">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Editing Output</span>
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
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Prompt Preview</span>
        </span>
      `;
  }
}

function renderWorkspaceBody(state, prompt, output, activeAi) {
  if (state === 'generating') {
    return `
      <div class="p-8 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 text-center space-y-4 min-h-[420px] flex flex-col items-center justify-center border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto animate-pulse">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-1">Synthesizing Pedagogical Plan...</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Calibrating ${escapeHtml(currentState.instructionalModel)} phases and Bloom objectives</p>
        </div>
        <div class="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mx-auto mt-2">
          <div class="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full animate-pulse" style="width: 75%"></div>
        </div>
      </div>
    `;
  }

  if (state === 'output') {
    return `
      <div class="flex flex-col">
        <!-- Output Toolbar -->
        <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-600 dark:text-slate-300">Live Instructional Output</span>
          <div class="flex items-center gap-1.5">
            <button id="lp-edit-output-btn" class="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Edit Markdown
            </button>
            <button id="lp-copy-output-btn" class="px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
              Copy
            </button>
            <button id="lp-export-output-btn" class="px-2 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors">
              Export File
            </button>
          </div>
        </div>

        <!-- Rendered Output Content -->
        <div class="p-5 sm:p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 max-h-[520px] overflow-y-auto prose-academic leading-relaxed">
          ${renderMarkdownToHtml(output)}
        </div>
      </div>
    `;
  }

  if (state === 'editing') {
    return `
      <div class="flex flex-col">
        <div class="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
          <span class="font-semibold text-indigo-700 dark:text-indigo-300">Markdown Editor</span>
          <div class="flex items-center gap-1.5">
            <button id="lp-cancel-edit-output-btn" class="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white">
              Cancel
            </button>
            <button id="lp-save-output-edits-btn" class="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded">
              Save Edits
            </button>
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200/80 dark:border-slate-800 transition-colors">
          <textarea id="lp-output-markdown-textarea" class="w-full h-[460px] bg-transparent text-slate-800 dark:text-slate-100 font-mono text-xs border-0 outline-none resize-none leading-relaxed">${escapeHtml(output)}</textarea>
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
          ${lastErrorMessage || `Your current active engine (<strong>${escapeHtml(activeAi.name)}</strong>) requires an API key or active local connection. You can switch to free local Ollama or copy the compiled prompt.`}
        </p>
        <div class="flex items-center gap-2 pt-2">
          <button id="lp-error-switch-ai-btn" class="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-lg">
            Switch AI Engine
          </button>
          <button id="lp-error-copy-prompt-btn" class="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
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
        <textarea id="lp-editable-prompt-text" class="w-full h-96 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-[13.5px] border-0 focus:outline-none resize-none leading-relaxed selection:bg-indigo-100 dark:selection:bg-indigo-900/60">${escapeHtml(prompt)}</textarea>
      ` : `
        <pre class="whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-200 select-all selection:bg-indigo-100 dark:selection:bg-indigo-900/60">${escapeHtml(prompt)}</pre>
      `}
    </div>
  `;
}

export function setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings) {
  const updatePromptDisplay = () => {
    userEditedPrompt = null;
    const prompt = buildLessonPlannerPrompt(currentState);
    const pre = container.querySelector('pre');
    if (pre) pre.textContent = prompt;
    const textarea = container.querySelector('#lp-editable-prompt-text');
    if (textarea) textarea.value = prompt;
  };

  // Tab buttons: toggle between Prompt Preview and Output
  container.querySelector('#lp-tab-preview-btn')?.addEventListener('click', () => {
    workspaceState = 'preview';
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#lp-tab-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Edit raw output markdown
  container.querySelector('#lp-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'editing';
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#lp-cancel-edit-output-btn')?.addEventListener('click', () => {
    workspaceState = 'output';
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  container.querySelector('#lp-save-output-edits-btn')?.addEventListener('click', () => {
    const textarea = container.querySelector('#lp-output-markdown-textarea');
    if (textarea) {
      generatedOutput = textarea.value;
      if (activeGeneratedDesignId) {
        store.updateDesign(activeGeneratedDesignId, {
          output: generatedOutput,
          refinementNote: 'Manual edits saved in studio'
        });
      }
      showToast('Output edits saved successfully!', 'success');
      workspaceState = 'output';
      container.innerHTML = renderLessonPlannerView();
      setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
    }
  });

  // Copy output
  container.querySelector('#lp-copy-output-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedOutput);
      showToast('Instructional output copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy output.', 'error');
    }
  });

  // Export output
  container.querySelector('#lp-export-output-btn')?.addEventListener('click', () => {
    openUniversalExportModal({
      title: `Lesson Plan: ${currentState.topic || 'Curriculum Plan'}`,
      markdown: generatedOutput,
      subject: currentState.subject,
      gradeLevel: currentState.gradeLevel,
      showToast
    });
  });

  // Open full Refinement Canvas
  container.querySelector('#lp-open-canvas-btn')?.addEventListener('click', () => {
    if (activeGeneratedDesignId) {
      navigateToWorkspace(activeGeneratedDesignId);
    }
  });

  // Error state buttons
  container.querySelector('#lp-error-switch-ai-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        workspaceState = 'preview';
        container.innerHTML = renderLessonPlannerView();
        setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  container.querySelector('#lp-error-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildLessonPlannerPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Compiled prompt copied! You can paste into ChatGPT, Claude, or Gemini.', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Switch Active AI Engine
  container.querySelector('#lp-switch-ai-engine-btn')?.addEventListener('click', () => {
    openAiSwitcherModal({
      showToast,
      openSettings,
      onSwitch: () => {
        container.innerHTML = renderLessonPlannerView();
        setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  // Reset Studio Button
  container.querySelector('#lp-reset-btn')?.addEventListener('click', () => {
    if (confirm('Reset the Lesson Planner to default inputs?')) {
      currentState = getInitialLessonPlannerState();
      workspaceState = 'preview';
      generatedOutput = '';
      activeGeneratedDesignId = null;
      container.innerHTML = renderLessonPlannerView();
      setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
      showToast('Lesson Planner reset to default settings.', 'info');
    }
  });

  // Import Source File (Syllabus, Word, PDF, Text, etc.)
  container.querySelector('#lp-import-source-btn')?.addEventListener('click', () => {
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
            currentState.competency = `Aligned with syllabus: ${data.filename || data.title}`;
          }
          container.innerHTML = renderLessonPlannerView();
          setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
          showToast(`Loaded "${data.filename || data.title}" into Lesson Planner!`, 'success');
        }
      }
    });
  });

  // --- Dynamic Framework Sequence Listeners ---

  // Model Cards Selection
  container.querySelectorAll('#lp-models-group .model-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const modelId = btn.getAttribute('data-val');
      currentState.instructionalModel = modelId;
      // Auto-load framework sequence
      if (FRAMEWORK_SEQUENCES[modelId]) {
        currentState.lessonSequence = JSON.parse(JSON.stringify(FRAMEWORK_SEQUENCES[modelId]));
      }
      container.innerHTML = renderLessonPlannerView();
      setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
      showToast(`Loaded ${modelId} sequence phases.`, 'info');
    });
  });

  // Add Phase Button
  container.querySelector('#lp-add-phase-btn')?.addEventListener('click', () => {
    const nextIdx = (currentState.lessonSequence || []).length + 1;
    currentState.lessonSequence.push({
      name: `Phase ${nextIdx}: Custom Step`,
      desc: 'Define instructional strategy and student interaction'
    });
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Reset Sequence Button
  container.querySelector('#lp-reset-sequence-btn')?.addEventListener('click', () => {
    const def = FRAMEWORK_SEQUENCES[currentState.instructionalModel] || FRAMEWORK_SEQUENCES['5E Instructional Model'];
    currentState.lessonSequence = JSON.parse(JSON.stringify(def));
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
    showToast('Reset sequence to framework defaults.', 'info');
  });

  // Sequence Phase Inputs & Reorder / Delete Listeners
  container.querySelectorAll('#lp-sequence-container .phase-name-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const row = e.target.closest('[data-idx]');
      const idx = parseInt(row.getAttribute('data-idx'), 10);
      if (currentState.lessonSequence[idx]) {
        currentState.lessonSequence[idx].name = e.target.value;
        updatePromptDisplay();
      }
    });
  });

  container.querySelectorAll('#lp-sequence-container .phase-desc-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const row = e.target.closest('[data-idx]');
      const idx = parseInt(row.getAttribute('data-idx'), 10);
      if (currentState.lessonSequence[idx]) {
        currentState.lessonSequence[idx].desc = e.target.value;
        updatePromptDisplay();
      }
    });
  });

  container.querySelectorAll('#lp-sequence-container .phase-up-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (idx > 0) {
        const temp = currentState.lessonSequence[idx];
        currentState.lessonSequence[idx] = currentState.lessonSequence[idx - 1];
        currentState.lessonSequence[idx - 1] = temp;
        container.innerHTML = renderLessonPlannerView();
        setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  container.querySelectorAll('#lp-sequence-container .phase-down-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (idx < currentState.lessonSequence.length - 1) {
        const temp = currentState.lessonSequence[idx];
        currentState.lessonSequence[idx] = currentState.lessonSequence[idx + 1];
        currentState.lessonSequence[idx + 1] = temp;
        container.innerHTML = renderLessonPlannerView();
        setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
      }
    });
  });

  container.querySelectorAll('#lp-sequence-container .phase-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (currentState.lessonSequence.length <= 1) {
        showToast('At least one sequence phase must be retained.', 'warning');
        return;
      }
      currentState.lessonSequence.splice(idx, 1);
      container.innerHTML = renderLessonPlannerView();
      setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
    });
  });

  // Teaching Strategies Chips (In-place interactive selection)
  container.querySelectorAll('#lp-strategies-group .strategy-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.getAttribute('data-val');
      const list = currentState.teachingStrategies || [];
      if (list.includes(val)) {
        currentState.teachingStrategies = list.filter(x => x !== val);
      } else {
        currentState.teachingStrategies = [...list, val];
      }
      const isSelected = (currentState.teachingStrategies || []).includes(val);
      btn.className = `strategy-chip text-xs px-2.5 py-1 rounded-full border transition-all ${
        isSelected
          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
      }`;
      updatePromptDisplay();
    });
  });

  // Assessment Strategies Chips (In-place interactive selection)
  container.querySelectorAll('#lp-assessments-group .assessment-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.getAttribute('data-val');
      const list = currentState.assessmentTypes || [];
      if (list.includes(val)) {
        currentState.assessmentTypes = list.filter(x => x !== val);
      } else {
        currentState.assessmentTypes = [...list, val];
      }
      const isSelected = (currentState.assessmentTypes || []).includes(val);
      btn.className = `assessment-chip text-xs px-2.5 py-1 rounded-full border transition-all ${
        isSelected
          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
      }`;
      updatePromptDisplay();
    });
  });

  // Output Format Cards
  container.querySelectorAll('#lp-format-group .format-card').forEach(btn => {
    btn.addEventListener('click', () => {
      currentState.outputFormat = btn.getAttribute('data-val');
      container.querySelectorAll('#lp-format-group .format-card').forEach(b => {
        b.className = 'format-card p-2.5 text-left rounded-xl border transition-all border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-650';
      });
      btn.className = 'format-card p-2.5 text-left rounded-xl border transition-all border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500';
      updatePromptDisplay();
    });
  });

  // Objectives Auto-generation Toggle
  container.querySelector('#lp-autoGenObjectives')?.addEventListener('change', (e) => {
    currentState.autoGenerateObjectives = e.target.checked;
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Objective Framework Select
  container.querySelector('#lp-objectiveFramework')?.addEventListener('change', (e) => {
    currentState.objectiveFramework = e.target.value;
    updatePromptDisplay();
  });

  // Custom Objectives
  container.querySelector('#lp-customObjectives')?.addEventListener('input', (e) => {
    currentState.customObjectives = e.target.value;
    updatePromptDisplay();
  });

  // Additional Requirements
  container.querySelector('#lp-additionalRequirements')?.addEventListener('input', (e) => {
    currentState.additionalRequirements = e.target.value;
    updatePromptDisplay();
  });

  // Shared Global Context Listeners (Duration buttons, Modality cards, Resource chips, Inputs)
  setupGlobalContextListeners(container, currentState, 'lp', updatePromptDisplay);

  // Custom instructional model input if 'Custom Instructional Model' is active
  container.querySelector('#lp-customInstructionalModel')?.addEventListener('input', (e) => {
    currentState.customInstructionalModel = e.target.value;
    updatePromptDisplay();
  });

  // Re-render if subject changes to/from 'Other'
  container.querySelector('#lp-subject')?.addEventListener('change', () => {
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Copy Prompt Button
  container.querySelector('#lp-copy-prompt-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildLessonPlannerPrompt(currentState);
    try {
      await navigator.clipboard.writeText(prompt);
      showToast('Structured AI prompt copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy prompt.', 'error');
    }
  });

  // Toggle Edit Prompt
  container.querySelector('#lp-toggle-edit-prompt-btn')?.addEventListener('click', () => {
    if (isPromptEditable) {
      const textarea = container.querySelector('#lp-editable-prompt-text');
      if (textarea) userEditedPrompt = textarea.value;
      isPromptEditable = false;
    } else {
      isPromptEditable = true;
    }
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
  });

  // Save to Prompt Library Button
  container.querySelector('#lp-save-template-btn')?.addEventListener('click', () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildLessonPlannerPrompt(currentState);
    const name = window.prompt('Enter a title for this prompt template:', `Lesson Plan: ${currentState.topic || 'Curriculum Plan'}`);
    if (name) {
      store.saveTemplate({
        name,
        title: name,
        category: 'Lesson Planning',
        categoryKey: 'lesson-planning',
        description: `Custom ${currentState.instructionalModel} lesson plan template for ${currentState.subject}.`,
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
  container.querySelector('#lp-refresh-prompt-btn')?.addEventListener('click', () => {
    userEditedPrompt = null;
    updatePromptDisplay();
    showToast('Prompt re-compiled from inputs.', 'info');
  });

  // Generate Output Execution
  container.querySelector('#lp-generate-output-btn')?.addEventListener('click', async () => {
    const prompt = userEditedPrompt !== null ? userEditedPrompt : buildLessonPlannerPrompt(currentState);

    // Enter generating state directly with zero friction (built-in AI synthesis ready)
    workspaceState = 'generating';
    container.innerHTML = renderLessonPlannerView();
    setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);

    try {
      const result = await aiService.generate({ prompt });
      generatedOutput = result.output;

      // Save design with Output Generated status
      const newDesign = {
        id: 'design-' + Date.now(),
        title: `Lesson Plan: ${currentState.topic || 'Curriculum Plan'}`,
        category: 'lesson-planning',
        categoryLabel: 'Lesson Planning',
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
      showToast('Lesson plan synthesized successfully!', 'success');
      container.innerHTML = renderLessonPlannerView();
      setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
    } catch (err) {
      workspaceState = 'error';
      lastErrorMessage = err.message || 'Generation failed. Check your API key or connection.';
      showToast(lastErrorMessage, 'error');
      container.innerHTML = renderLessonPlannerView();
      setupLessonPlannerListeners(container, navigateToWorkspace, showToast, openSettings);
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
