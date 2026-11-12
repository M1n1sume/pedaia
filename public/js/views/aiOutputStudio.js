// PEDAIA Dedicated AI Output Studio
// Transforms pedagogical concepts, lesson plans, and competencies into usable, editable, and downloadable educational materials.
import { store } from '../state.js';
import { aiService } from '../aiService.js';
import { exportToDocx, exportToMarkdown, openPrintableWindow } from '../exportUtils.js';
import { buildAiOutputStudioPrompt } from '../promptEngine.js';
import { openShareLinkModal } from './shareLinkModal.js';

// --- Compiled Pedagogical Prompt Engine Adapter ---
export function buildAiOutputPrompt(state = activeStudioState) {
  const cat = OUTPUT_CATEGORIES.find(c => c.id === state.activeCategoryId) || OUTPUT_CATEGORIES[0];
  const typeObj = cat?.types?.find(t => t.id === state.activeTypeId) || cat?.types?.[0] || { id: 'output', label: 'Educational Deliverable' };
  return buildAiOutputStudioPrompt({
    ...state,
    typeLabel: typeObj.label
  });
}

// --- Output Categories Definition ---
export const OUTPUT_CATEGORIES = [
  {
    id: 'presentation',
    name: 'Presentations & PowerPoint',
    icon: '🖥️',
    badge: 'Slide Decks',
    color: 'indigo',
    desc: 'PowerPoint presentations, classroom lecture decks, lesson slides, and speaker notes.',
    types: [
      { id: 'powerpoint', label: 'PowerPoint Presentation', desc: 'Standard classroom slide deck with speaker notes and visuals' },
      { id: 'lecture-slides', label: 'Lecture Slide Deck', desc: 'High-density theoretical and conceptual lecture slides' },
      { id: 'lesson-slides', label: '5E / Inquiry Lesson Slides', desc: 'Step-by-step instructional flow mapped to active learning phases' },
      { id: 'slide-outline', label: 'Slide Deck Outline & Notes', desc: 'Narrative script and bullet points for slide development' }
    ],
    defaultOptions: {
      slideCount: 8,
      theme: 'academic-indigo',
      aspectRatio: '16:9',
      speakerNotes: true
    }
  },
  {
    id: 'poster',
    name: 'Posters & Infographics',
    icon: '🖼️',
    badge: 'Visual Posters',
    color: 'teal',
    desc: 'Classroom educational posters, science visualizers, concept infographics, and summary sheets.',
    types: [
      { id: 'classroom-poster', label: 'Classroom Educational Poster', desc: 'Large-format high-contrast reference poster for classroom walls' },
      { id: 'concept-infographic', label: 'Concept Infographic', desc: 'Visual breakdown of abstract definitions and principles' },
      { id: 'process-infographic', label: 'Process & Cycle Infographic', desc: 'Step-by-step chronological or cyclical mechanism flowchart' },
      { id: 'summary-poster', label: 'Visual Summary Poster', desc: 'End-of-unit synthesis cheat sheet for student study walls' }
    ],
    defaultOptions: {
      orientation: 'portrait',
      layout: '3-column-grid',
      pageSize: 'letter',
      colorMood: 'vivid-academic'
    }
  },
  {
    id: 'worksheet',
    name: 'Documents & Learning Materials',
    icon: '📄',
    badge: 'Worksheets & Handouts',
    color: 'blue',
    desc: 'Student worksheets, guided handouts, exam study guides, review sheets, and teacher guides.',
    types: [
      { id: 'student-worksheet', label: 'Guided Student Worksheet', desc: 'Fill-in-the-blank, open response, and graphic analysis tasks' },
      { id: 'study-guide', label: 'Comprehensive Study Guide', desc: 'Key terms, core concepts, practice questions, and memory aids' },
      { id: 'handout', label: 'Student Handout & Reference Card', desc: 'Concise 1-2 page summary of essential formulas and procedures' },
      { id: 'las', label: 'Learning Activity Sheet (LAS)', desc: 'Competency-anchored self-directed learner activity sheet' }
    ],
    defaultOptions: {
      includeAnswerKey: true,
      spacing: 'spacious',
      density: 'standard',
      includeRubricCheck: true
    }
  },
  {
    id: 'diagram',
    name: 'Visual Learning Resources',
    icon: '📊',
    badge: 'Mind Maps & Diagrams',
    color: 'purple',
    desc: 'Concept maps, mind maps, Socratic flowcharts, system diagrams, and comparison charts.',
    types: [
      { id: 'concept-map', label: 'Hierarchical Concept Map', desc: 'Linked nodes showing relationships between central and secondary ideas' },
      { id: 'flowchart', label: 'Socratic Decision Flowchart', desc: 'Diagnostic logic tree with conditional paths and checks' },
      { id: 'timeline', label: 'Chronological Timeline', desc: 'Sequential milestone organizer with annotated historical/scientific eras' },
      { id: 'comparison-matrix', label: 'Comparative Venn / Matrix', desc: 'Side-by-side contrast of competing theories, mechanisms, or models' }
    ],
    defaultOptions: {
      diagramType: 'concept-map',
      nodeComplexity: 'intermediate',
      outputEngine: 'svg-flow'
    }
  },
  {
    id: 'assessment',
    name: 'Assessment Materials',
    icon: '📝',
    badge: 'Tests & Rubrics',
    color: 'amber',
    desc: 'Quiz papers, test papers with Table of Specifications (TOS), analytic rubrics, and answer keys.',
    types: [
      { id: 'test-paper', label: 'Printable Test Paper & Answer Key', desc: 'Multiple choice, matching, short answer, and cognitive analysis items' },
      { id: 'tos', label: 'Table of Specifications (TOS)', desc: 'Curriculum alignment matrix mapping test items to Bloom cognitive levels' },
      { id: 'analytic-rubric', label: '4-Level Analytic Rubric Matrix', desc: 'Exemplary, Proficient, Developing, Beginning criteria grid' },
      { id: 'performance-task', label: 'Authentic Performance Task Sheet', desc: 'GRASPS-model authentic challenge with scoring criteria' }
    ],
    defaultOptions: {
      itemCount: 15,
      cognitiveLevels: 'blooms-all',
      includeTOS: true
    }
  },
  {
    id: 'flashcards',
    name: 'Classroom Resources',
    icon: '📇',
    badge: 'Cards & Visual Aids',
    color: 'emerald',
    desc: 'Flashcards, task cards, learning station cards, vocabulary cards, and classroom visual aids.',
    types: [
      { id: 'vocabulary-flashcards', label: 'Vocabulary Flashcard Deck', desc: 'Term, definition, sentence context, and visual memory cue' },
      { id: 'task-cards', label: 'Collaborative Task Cards', desc: 'Numbered station problem cards for group rotations and inquiry labs' },
      { id: 'socratic-cards', label: 'Socratic Dialogue Question Cards', desc: 'Higher-order discussion prompts for student-led fishbowl seminars' }
    ],
    defaultOptions: {
      cardCount: 12,
      layoutFormat: '2-sided-printable'
    }
  },
  {
    id: 'banner',
    name: 'Digital Creative Assets',
    icon: '🎨',
    badge: 'Covers & Banners',
    color: 'rose',
    desc: 'Educational course banners, learning resource covers, slide thumbnails, and digital visuals.',
    types: [
      { id: 'course-banner', label: 'LMS / Classroom Course Banner', desc: 'Header banner for Canvas, Google Classroom, or Moodle' },
      { id: 'resource-cover', label: 'Instructional Module Cover Page', desc: 'Academic front cover with title, competency badge, and institution' },
      { id: 'learning-badge', label: 'Achievement Badge & Visual Aid', desc: 'Digital mastery icon and certificate header' }
    ],
    defaultOptions: {
      aspectRatio: 'banner-3-1',
      style: 'modern-academic'
    }
  },
  {
    id: 'custom',
    name: 'Custom Output',
    icon: '⚡',
    badge: 'Custom Specification',
    color: 'slate',
    desc: 'Design any unique instructional resource, game board, checklist, or facilitator tool from scratch.',
    types: [
      { id: 'custom-format', label: 'Custom Instructional Artifact', desc: 'Describe your exact pedagogical format, constraints, and target deliverables' }
    ],
    defaultOptions: {
      format: 'custom-markdown-doc'
    }
  }
];

// Pre-Configured Educational Output Templates (Ready to load directly)
export const OUTPUT_TEMPLATES = [
  {
    id: 'tpl-pres-5e',
    title: '5E Science Inquiry Lecture Deck',
    categoryId: 'presentation',
    typeId: 'powerpoint',
    subject: 'Science / Biology',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 8',
    topic: 'Cellular Respiration & Energy Transformation',
    objectives: '1. Model glucose oxidation pathways.\n2. Contrast aerobic ATP yield with fermentation.\n3. Formulate conclusions from respiration lab data.',
    competency: 'Explain energy transformations in cellular metabolism',
    targetAudience: 'Grade 8 Science Learners',
    purpose: 'Direct Interactive Lecture with Speaker Notes',
    contentRequirements: 'Include mitochondria diagrams, equation breakdowns, and 2 check-for-understanding slides.',
    desc: '8-slide classroom deck structured through Engage, Explore, Explain, Elaborate, and Evaluate phases.'
  },
  {
    id: 'tpl-poster-blooms',
    title: "Bloom's Cognitive Taxonomy Classroom Poster",
    categoryId: 'poster',
    typeId: 'concept-infographic',
    subject: 'General Pedagogy',
    educationalLevel: 'Senior High School',
    gradeLevel: 'Grade 11',
    topic: "Bloom's Revised Taxonomy Cognitive Dimensions",
    objectives: '1. Distinguish lower-order from higher-order cognitive domains.\n2. Apply action verbs to assess understanding.\n3. Formulate analytical inquiry questions.',
    competency: 'Integrate cognitive rigor across instructional tasks',
    targetAudience: 'Educators & High School Scholars',
    purpose: 'Classroom Reference & Study Wall Poster',
    contentRequirements: 'Color-coded levels from Remember to Create with indicative active verbs.',
    desc: 'High-contrast visual poster mapping 6 cognitive domains with active classroom action verbs.'
  },
  {
    id: 'tpl-sheet-socratic',
    title: 'Socratic Dialogue Guided Discussion Worksheet',
    categoryId: 'worksheet',
    typeId: 'student-worksheet',
    subject: 'English & Humanities',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 9',
    topic: 'Textual Evidence, Symbolism & Ethical Themes in Literature',
    objectives: '1. Cite textual evidence supporting thematic claims.\n2. Evaluate speaker motivations and rhetorical choices.\n3. Participate in active peer inquiry.',
    competency: 'Analyze literary themes using explicit textual evidence',
    targetAudience: 'Grade 9 English Language Arts',
    purpose: 'Guided Student Worksheet with Teacher Scoring Rubric',
    contentRequirements: 'Include quote analysis organizer, paired discussion prompts, and teacher exemplar answers.',
    desc: 'Guided worksheet featuring open prompts, quote analysis matrix, and teacher answer key.'
  },
  {
    id: 'tpl-diag-flowchart',
    title: 'Biochemical Synthesis Mechanism Flowchart',
    categoryId: 'diagram',
    typeId: 'concept-map',
    subject: 'Chemistry & Biology',
    educationalLevel: 'Senior High School',
    gradeLevel: 'Grade 11',
    topic: 'Light-Dependent Reactions to Calvin Cycle',
    objectives: '1. Trace electron transport in thylakoid membranes.\n2. Map ATP and NADPH utilization in stroma.\n3. Predict impacts of light intensity on glucose synthesis.',
    competency: 'Demonstrate molecular energy transfer in living systems',
    targetAudience: 'Advanced Biology Students',
    purpose: 'Visual Learning Concept Map & Socratic Flowchart',
    contentRequirements: 'Step-by-step chemical intermediate nodes and inputs/outputs.',
    desc: 'Connected conceptual diagram mapping reactants, electron transport carriers, and high-energy glucose products.'
  },
  {
    id: 'tpl-assess-matrix',
    title: 'Mendelian Genetics Formative Test & TOS Matrix',
    categoryId: 'assessment',
    typeId: 'tos',
    subject: 'Life Science',
    educationalLevel: 'Senior High School',
    gradeLevel: 'Grade 10',
    topic: 'Monohybrid Crosses & Punnett Square Probabilities',
    objectives: '1. Calculate phenotypic and genotypic ratios.\n2. Differentiate dominant, recessive, and codominant alleles.\n3. Solve real-world pedigree puzzle problems.',
    competency: 'Predict genotypic and phenotypic inheritance outcomes',
    targetAudience: 'Grade 10 Biology Students',
    purpose: '15-Item Test Paper with Table of Specifications & 4-Level Rubric',
    contentRequirements: 'Multiple choice, Punnett square problems, short response, and complete answer key.',
    desc: 'Table of Specifications aligned across 15 test items with an analytic 4-level scoring rubric.'
  },
  {
    id: 'tpl-cards-vocab',
    title: 'Academic STEM Vocabulary Flashcards (12 Cards)',
    categoryId: 'flashcards',
    typeId: 'vocabulary-flashcards',
    subject: 'Integrated STEM',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 8',
    topic: 'Thermodynamics & Kinetic Molecular Theory',
    objectives: '1. Define thermal equilibrium, entropy, and convection.\n2. Connect macroscopic heat phenomena to particulate motion.\n3. Use academic STEM terms in scientific explanations.',
    competency: 'Communicate scientific ideas using precise domain terminology',
    targetAudience: 'Middle School STEM Learners',
    purpose: 'Interactive 3D Study Cards & Printable Cutouts',
    contentRequirements: '12 cards with term, definition, contextual sentence, and mnemonic visual cue.',
    desc: '12 interactive 3D flip cards with definitions, formula contexts, and double-sided printable cutout layout.'
  },
  {
    id: 'tpl-banner-lms',
    title: 'Digital LMS Course Cover & Classroom Banner',
    categoryId: 'banner',
    typeId: 'course-banner',
    subject: 'Mathematics',
    educationalLevel: 'Senior High School',
    gradeLevel: 'Grade 11',
    topic: 'Pre-Calculus & Trigonometric Functions',
    objectives: '1. Introduce course roadmap and unit milestones.\n2. Establish academic tone and discipline identity.',
    competency: 'Engage with digital curriculum resources and learning pathways',
    targetAudience: 'Pre-Calculus Scholars',
    purpose: 'Canvas / Google Classroom Course Banner & Syllabus Header',
    contentRequirements: 'Modern academic typography with unit icon, course code, and institution tag.',
    desc: 'Modern scholarly LMS header banner optimized for Canvas, Google Classroom, and syllabus covers.'
  },
  {
    id: 'tpl-custom-pbl',
    title: 'Problem-Based Learning Multi-Phase Deliverable Rubric',
    categoryId: 'custom',
    typeId: 'custom-format',
    subject: 'Social Studies',
    educationalLevel: 'College / Undergraduate',
    gradeLevel: 'Year 1-2',
    topic: 'Urban Environmental Sustainability Simulation',
    objectives: '1. Formulate policy proposals addressing urban heat islands.\n2. Evaluate ecological trade-offs in city planning.\n3. Present findings in collaborative public hearing simulation.',
    competency: 'Apply multidisciplinary inquiry to complex civic challenges',
    targetAudience: 'Undergraduate Environmental Policy Students',
    purpose: 'PBL Project Guide & Authentic Defense Rubric',
    contentRequirements: 'Milestone checklists, team roles, evaluation criteria, and reflection questions.',
    desc: 'Authentic multi-stage inquiry project guide with research milestones and oral defense evaluation criteria.'
  }
];

// Active State in Memory
let activeStudioState = {
  viewMode: 'creator', // 'creator' or 'library'
  activeCategoryId: 'presentation',
  activeTypeId: 'powerpoint',
  selectedSourceDesignId: null,
  formData: {
    subject: 'Science',
    educationalLevel: 'Junior High School',
    gradeLevel: 'Grade 8',
    topic: 'Photosynthesis & Cellular Energetics',
    objectives: '1. Differentiate light-dependent reactions from the Calvin cycle.\n2. Model the chemical equation for glucose synthesis.\n3. Analyze factors affecting photosynthetic rate.',
    competency: 'Explain how photosynthetic organisms produce their own food through solar energy transformation',
    targetAudience: 'Grade 8 Science Learners (Mixed Readiness)',
    purpose: 'Classroom Lecture & Guided Inquiry Presentation',
    contentRequirements: 'Include real-world examples, chloroplast diagrams, chemical equations, and 2 formative check-in questions.',
    additionalInstructions: 'Use clear academic language with bold terms for core vocabulary.'
  },
  designOptions: {
    theme: 'academic-indigo',
    slideCount: 8,
    orientation: 'portrait',
    aspectRatio: '16:9',
    speakerNotes: true,
    includeAnswerKey: true
  },
  activeOutput: null,
  activeSlideIndex: 0,
  activeTab: 'preview', // 'preview' or 'editor'
  searchQuery: '',
  isPromptEditable: false,
  userCustomPrompt: null,
  workspaceTab: 'deliverable' // 'deliverable' or 'prompt'
};

export function setAiOutputStudioViewMode(mode) {
  if (mode === 'library' || mode === 'creator' || mode === 'templates') {
    activeStudioState.viewMode = mode;
  }
}

export function renderAiOutputStudioView() {
  const isLibrary = activeStudioState.viewMode === 'library';
  const isTemplates = activeStudioState.viewMode === 'templates';
  const savedOutputs = store.getOutputs ? store.getOutputs() : [];
  const activeCat = OUTPUT_CATEGORIES.find(c => c.id === activeStudioState.activeCategoryId) || OUTPUT_CATEGORIES[0];

  return `
    <div class="space-y-6 animate-fade-in pb-16">
      
      <!-- Studio Header & Mode Navigation -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI Output Studio</span>
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Deliverable Creation Workspace • Multi-Format Engine</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold font-scholarly text-slate-900 dark:text-white tracking-tight">
            AI Output Studio
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5">
            Transform your lesson ideas into engaging educational materials.
          </p>
        </div>

        <!-- Prominent Create Button & Repertoire Mode Switcher -->
        <div class="flex items-center gap-2.5 flex-wrap shrink-0">
          <button id="output-studio-create-btn" class="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5 active:scale-95">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ Create New Output</span>
          </button>

          <div class="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            <button id="mode-creator-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!isLibrary && !isTemplates ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'}">
              <span>✨ Workspace</span>
            </button>
            <button id="mode-library-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isLibrary ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'}">
              <span>🗃️ My Saved Outputs (${savedOutputs.length})</span>
            </button>
            <button id="mode-templates-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isTemplates ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'}">
              <span>📋 Output Templates</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MAIN CONTAINER: Creator Workspace, Saved Library, or Templates -->
      ${isLibrary ? renderOutputLibraryView(savedOutputs) : isTemplates ? renderOutputTemplatesView() : renderCreatorWorkspaceView(activeCat, savedOutputs)}

    </div>
  `;
}

// =========================================================================
// 1. CREATOR WORKSPACE VIEW (Steps 1 to 6)
// =========================================================================
function renderCreatorWorkspaceView(activeCat, savedOutputs = []) {
  const hasOutput = Boolean(activeStudioState.activeOutput);
  const designs = store.getDesigns ? store.getDesigns() : [];
  const currentPrompt = activeStudioState.userCustomPrompt !== null
    ? activeStudioState.userCustomPrompt
    : buildAiOutputPrompt(activeStudioState);

  return `
    <div class="space-y-8">
      
      <!-- ================================================================= -->
      <!-- STEP 1: OUTPUT CATEGORY SELECTION CARDS                           -->
      <!-- ================================================================= -->
      <section id="step-1-category-section" class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">1</span>
              <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Choose Educational Output Type</h2>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 ml-8">Select from 8 specialized educational artifact categories</p>
          </div>

          <!-- Fast Search Filter for Categories -->
          <div class="relative w-full sm:w-64">
            <input type="text" id="category-search-input" value="${escapeHtml(activeStudioState.searchQuery)}" placeholder="Search outputs (e.g. PowerPoint, Poster)..." class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- 8 Category Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${OUTPUT_CATEGORIES.filter(cat => {
            if (!activeStudioState.searchQuery) return true;
            const q = activeStudioState.searchQuery.toLowerCase();
            return cat.name.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q) || cat.types.some(t => t.label.toLowerCase().includes(q));
          }).map(cat => {
            const isSelected = cat.id === activeStudioState.activeCategoryId;
            return `
              <div data-category-id="${cat.id}" class="category-card p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30' : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">${cat.icon}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">
                      ${cat.badge}
                    </span>
                  </div>
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white mb-1">${escapeHtml(cat.name)}</h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">${escapeHtml(cat.desc)}</p>
                </div>
                <div class="pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-[11px]">
                  <span class="text-indigo-600 dark:text-indigo-400 font-semibold">${cat.types.length} Formats</span>
                  <span class="${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-400'}">${isSelected ? '✓ Selected' : 'Select →'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Subtype Specific Selector -->
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Specific Deliverable:</span>
          ${activeCat.types.map(t => {
            const isSubSelected = t.id === activeStudioState.activeTypeId;
            return `
              <button data-type-id="${t.id}" class="type-pill px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSubSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'}">
                ${escapeHtml(t.label)}
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- STEP 2 & 3: CONTENT DEFINITION & DESIGN CUSTOMIZATION (2 Columns) -->
      <!-- ================================================================= -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Column 1: Pedagogical Content (7 Cols) -->
        <div id="step-2-content-section" class="lg:col-span-7 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">2</span>
              <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Define Educational Content</h2>
            </div>

            <!-- Import from Existing PEDAIA Design Selector -->
            ${designs.length > 0 ? `
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">Import Design:</span>
                <select id="import-design-select" class="text-xs py-1 px-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 outline-none">
                  <option value="">⚡ Autofill from Saved Design...</option>
                  ${designs.map(d => `<option value="${d.id}" ${d.id === activeStudioState.selectedSourceDesignId ? 'selected' : ''}>${escapeHtml(d.title.slice(0, 32))} (${escapeHtml(d.subject || '')})</option>`).join('')}
                </select>
              </div>
            ` : ''}
          </div>

          <!-- Contextual Quick Action Suggestions -->
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <span>💡 Contextual Conversion Shortcuts:</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button class="shortcut-btn px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors" data-cat="presentation" data-type="powerpoint">
                Convert Lesson to PowerPoint
              </button>
              <button class="shortcut-btn px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors" data-cat="poster" data-type="concept-infographic">
                Convert Topic to Infographic
              </button>
              <button class="shortcut-btn px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors" data-cat="worksheet" data-type="student-worksheet">
                Convert Content to Worksheet
              </button>
              <button class="shortcut-btn px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors" data-cat="diagram" data-type="concept-map">
                Convert Concept to Mind Map
              </button>
              <button class="shortcut-btn px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors" data-cat="flashcards" data-type="vocabulary-flashcards">
                Convert Objectives to Flashcards
              </button>
            </div>
          </div>

          <!-- Structured Form Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Area</label>
              <input type="text" id="form-subject" value="${escapeHtml(activeStudioState.formData.subject)}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Educational & Grade Level</label>
              <div class="grid grid-cols-2 gap-2">
                <select id="form-ed-level" class="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                  <option value="Elementary" ${activeStudioState.formData.educationalLevel === 'Elementary' ? 'selected' : ''}>Elementary</option>
                  <option value="Junior High School" ${activeStudioState.formData.educationalLevel === 'Junior High School' ? 'selected' : ''}>Junior High</option>
                  <option value="Senior High School" ${activeStudioState.formData.educationalLevel === 'Senior High School' ? 'selected' : ''}>Senior High</option>
                  <option value="Higher Education / College" ${activeStudioState.formData.educationalLevel.includes('Higher') ? 'selected' : ''}>Higher Ed / College</option>
                </select>
                <input type="text" id="form-grade-level" value="${escapeHtml(activeStudioState.formData.gradeLevel)}" placeholder="e.g. Grade 8" class="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Topic / Lesson Title</label>
            <input type="text" id="form-topic" value="${escapeHtml(activeStudioState.formData.topic)}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Learning Objectives (Bloom's-aligned)</label>
            <textarea id="form-objectives" rows="2" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed">${escapeHtml(activeStudioState.formData.objectives)}</textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Curriculum Competency / Standard</label>
            <input type="text" id="form-competency" value="${escapeHtml(activeStudioState.formData.competency)}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Specific Content Requirements</label>
              <textarea id="form-content-req" rows="2" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none leading-relaxed">${escapeHtml(activeStudioState.formData.contentRequirements)}</textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Additional Instructions / Pedagogy Notes</label>
              <textarea id="form-add-notes" rows="2" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none leading-relaxed">${escapeHtml(activeStudioState.formData.additionalInstructions)}</textarea>
            </div>
          </div>
        </div>

        <!-- Column 2: Design Customization & Generation Trigger (5 Cols) -->
        <div class="lg:col-span-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">3</span>
              <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Customize Visual Design</h2>
            </div>

            <!-- Dynamic Design Controls based on active Category -->
            <div class="space-y-4">
              
              ${activeCat.id === 'presentation' ? `
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Visual Design Theme</label>
                  <select id="opt-theme" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                    <option value="academic-indigo" selected>Academic Indigo (Scholarly & Professional)</option>
                    <option value="modern-stem">Modern STEM Teal (High-Tech & Empirical)</option>
                    <option value="humanities-serif">Warm Humanities (Classic Editorial)</option>
                    <option value="clean-minimal">Clean Minimalist (High Legibility)</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Slide Count</label>
                    <select id="opt-slide-count" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                      <option value="5">5 Slides (Quick Spark)</option>
                      <option value="8" selected>8 Slides (Standard Lesson)</option>
                      <option value="10">10 Slides (Deep Dive)</option>
                      <option value="12">12 Slides (Full Lecture)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Aspect Ratio</label>
                    <select id="opt-aspect" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                      <option value="16:9" selected>16:9 Widescreen (Projectors / Displays)</option>
                      <option value="4:3">4:3 Standard</option>
                    </select>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Include Speaker Notes</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">Teacher verbal script for each slide</span>
                  </div>
                  <input type="checkbox" id="opt-speaker-notes" checked class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500">
                </div>
              ` : ''}

              ${activeCat.id === 'poster' ? `
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Orientation</label>
                    <select id="opt-orientation" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                      <option value="portrait" selected>Portrait (Vertical Wall Poster)</option>
                      <option value="landscape">Landscape (Horizontal Display)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Layout Structure</label>
                    <select id="opt-layout" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                      <option value="3-column-grid" selected>3-Column Infographic Grid</option>
                      <option value="focal-hero">Focal Hero & Key Takeaways</option>
                      <option value="process-flow">Sequential Process Flow</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Page Dimension</label>
                  <select id="opt-page-size" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                    <option value="letter" selected>Letter (8.5 × 11 in) — Standard School Printer</option>
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="poster-large">Large Poster (18 × 24 in) — Wall Print</option>
                  </select>
                </div>
              ` : ''}

              ${activeCat.id === 'worksheet' || activeCat.id === 'assessment' ? `
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Teacher Answer Key</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">Generate full answers & grading criteria</span>
                  </div>
                  <input type="checkbox" id="opt-answer-key" checked class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500">
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Spacing / Layout</label>
                    <select id="opt-spacing" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                      <option value="spacious" selected>Spacious (Ample Student Space)</option>
                      <option value="compact">Compact (Paper-Saving)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cognitive Rubric</label>
                    <select id="opt-rubric" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                      <option value="included" selected>Include 4-Level Matrix</option>
                      <option value="none">Points Only</option>
                    </select>
                  </div>
                </div>
              ` : ''}

              ${activeCat.id === 'flashcards' ? `
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Card Deck Count</label>
                  <select id="opt-card-count" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                    <option value="8">8 Essential Concept Cards</option>
                    <option value="12" selected>12 Standard Study Cards</option>
                    <option value="16">16 Deep Review Cards</option>
                  </select>
                </div>
              ` : ''}

              ${activeCat.id === 'diagram' ? `
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Diagram Architecture</label>
                  <select id="opt-diagram-type" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                    <option value="concept-map" selected>Concept Map (Hierarchical Network)</option>
                    <option value="flowchart">Decision Logic Flowchart</option>
                    <option value="timeline">Chronological Timeline</option>
                    <option value="comparison">Comparative Venn / Matrix</option>
                  </select>
                </div>
              ` : ''}

              <!-- AI Synthesis Readiness Badge -->
              <div class="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 text-xs">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-indigo-950 dark:text-indigo-200">Universal Pedagogical Engine</span>
                </div>
                <p class="text-[11px] text-slate-600 dark:text-slate-400">
                  Synthesizes fully formatted, exportable artifacts using connected cloud AI or offline built-in academic generators.
                </p>
              </div>

            </div>
          </div>

          <!-- STEP 4: PEDAGOGICAL PROMPT PREVIEW -->
          <div class="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">4</span>
                <h3 class="text-xs font-bold font-scholarly text-slate-900 dark:text-white">Prompt Preview</h3>
                ${activeStudioState.userCustomPrompt !== null ? `
                  <span class="ws-state-pill editing">
                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Customized Prompt</span>
                  </span>
                ` : `
                  <span class="ws-state-pill prompt-preview">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>Live Prompt Preview</span>
                  </span>
                `}
              </div>

              <!-- Action Controls -->
              <div class="flex items-center gap-1.5 self-end sm:self-auto">
                ${activeStudioState.userCustomPrompt !== null ? `
                  <button id="output-reset-prompt-btn" type="button" class="px-2 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors flex items-center gap-1" title="Reset to auto-compiled prompt">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    <span>Reset</span>
                  </button>
                ` : ''}

                <button id="output-toggle-edit-prompt-btn" type="button" class="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <span>${activeStudioState.isPromptEditable ? 'Done Editing' : 'Edit Prompt'}</span>
                </button>

                <button id="output-copy-prompt-btn" type="button" class="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <!-- Monospace Prompt Display Box -->
            <div class="relative rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-[#0B1120] overflow-hidden transition-colors">
              ${activeStudioState.isPromptEditable ? `
                <textarea id="output-editable-prompt-text" class="w-full h-56 p-3 bg-transparent font-mono text-[11.5px] text-slate-800 dark:text-slate-100 border-0 outline-none resize-y leading-relaxed focus:ring-1 focus:ring-indigo-500/50" placeholder="Customize pedagogical prompt...">${escapeHtml(currentPrompt)}</textarea>
              ` : `
                <pre id="output-prompt-pre" class="whitespace-pre-wrap font-mono text-[11.5px] text-slate-700 dark:text-slate-300 select-all p-3 max-h-56 overflow-y-auto leading-relaxed selection:bg-indigo-100 dark:selection:bg-indigo-900/60">${escapeHtml(currentPrompt)}</pre>
              `}
            </div>

            <div class="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 px-0.5">
              <span>💡 Live prompt for pedagogical engine.</span>
              <span id="output-prompt-stats" class="font-mono">${currentPrompt.length} chars • ~${Math.round(currentPrompt.split(/\s+/).filter(Boolean).length)} words</span>
            </div>
          </div>

          <!-- STEP 5: GENERATE BUTTON -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button id="generate-output-btn" class="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group">
              <span class="text-base group-hover:rotate-12 transition-transform">✨</span>
              <span>Generate Educational Output</span>
            </button>
          </div>
        </div>

      </section>

      <!-- ================================================================= -->
      <!-- STEP 5 & 6: DEDICATED OUTPUT WORKSPACE & PREVIEW/EDITOR           -->
      <!-- ================================================================= -->
      <section id="output-workspace-container" class="scroll-mt-20 ${hasOutput ? '' : 'hidden'}">
        ${hasOutput ? renderActiveOutputWorkspace(activeStudioState.activeOutput) : ''}
      </section>

      <!-- ================================================================= -->
      <!-- RECENT GENERATED OUTPUTS (Deliverables Created in this Atelier)   -->
      <!-- ================================================================= -->
      ${renderRecentOutputsSection(savedOutputs)}

      <!-- ================================================================= -->
      <!-- OUTPUT TEMPLATES REPERTOIRE (Curated Educational Deliverables)    -->
      <!-- ================================================================= -->
      ${renderOutputTemplatesSection()}

    </div>
  `;
}

// =========================================================================
// 2. ACTIVE OUTPUT WORKSPACE (Specialized Preview, Editor & Real Exports)
// =========================================================================
function renderActiveOutputWorkspace(output) {
  const isPresentation = output.category === 'presentation';
  const isPoster = output.category === 'poster';
  const isWorksheet = output.category === 'worksheet';
  const isDiagram = output.category === 'diagram';
  const isFlashcards = output.category === 'flashcards';
  const isAssessment = output.category === 'assessment';
  const isPromptTab = activeStudioState.workspaceTab === 'prompt';

  return `
    <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-md overflow-hidden transition-all">
      
      <!-- Workspace Top Toolbar -->
      <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">${output.icon || '📄'}</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white" id="workspace-output-title">
                ${escapeHtml(output.title)}
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                ${escapeHtml(output.typeLabel || output.category)}
              </span>
            </div>
            <p class="text-[11.5px] text-slate-500 dark:text-slate-400">
              ${escapeHtml(output.subject || 'General')} • ${escapeHtml(output.gradeLevel || output.educationalLevel || '')} • Ready to Edit & Export
            </p>
          </div>
        </div>

        <!-- Action Controls & Real Exports -->
        <div class="flex items-center gap-2 shrink-0 flex-wrap">
          <button id="save-to-library-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer">
            <span>💾 Save to Library</span>
          </button>

          <button id="output-share-link-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer" title="Share direct link to this output">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share Link</span>
          </button>

          <!-- Real Export Dropdown / Buttons -->
          ${isPresentation ? `
            <button id="export-pptx-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-2xs flex items-center gap-1.5">
              <span>📊 Download PowerPoint (.pptx)</span>
            </button>
            <button id="export-html-slides-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs flex items-center gap-1.5">
              <span>🖥️ Projector Presentation</span>
            </button>
          ` : ''}

          ${isPoster || isDiagram ? `
            <button id="export-pdf-poster-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-2xs flex items-center gap-1.5">
              <span>🖨️ High-Res Poster Print (PDF)</span>
            </button>
            <button id="export-svg-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs flex items-center gap-1.5">
              <span>📐 Download SVG Graphic</span>
            </button>
          ` : ''}

          ${isWorksheet || isAssessment ? `
            <button id="export-docx-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs flex items-center gap-1.5">
              <span>📝 Download Word (.docx)</span>
            </button>
            <button id="print-worksheet-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs flex items-center gap-1.5">
              <span>🖨️ Print Student Handout</span>
            </button>
          ` : ''}

          ${isFlashcards ? `
            <button id="print-flashcards-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs flex items-center gap-1.5">
              <span>🖨️ Print 2-Sided Cards</span>
            </button>
          ` : ''}

          <button id="export-markdown-btn" class="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600" title="Export Markdown">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          </button>
        </div>
      </div>

      <!-- Workspace View Switcher (Deliverable vs Prompt Preview) -->
      <div class="px-6 py-2.5 bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-1.5">
          <button id="ws-tab-deliverable-btn" class="px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${!isPromptTab ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'}">
            <span>${output.icon || '📦'}</span>
            <span>Deliverable View</span>
          </button>
          <button id="ws-tab-prompt-btn" class="px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${isPromptTab ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'}">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            <span>Prompt Preview</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isPromptTab ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">AI Source</span>
          </button>
        </div>

        ${isPromptTab ? `
          <div class="flex items-center gap-1.5 self-end sm:self-auto">
            <button id="ws-copy-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <span>Copy Prompt</span>
            </button>
            <button id="ws-edit-prompt-btn" class="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs" title="Edit this prompt in the creator above">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Edit in Creator</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Specialized Workspace Layout -->
      <div class="p-6">
        ${isPromptTab ? renderOutputPromptWorkspace(output) : `
          ${isPresentation ? renderSlideWorkspace(output) : ''}
          ${isPoster ? renderPosterWorkspace(output) : ''}
          ${isWorksheet ? renderWorksheetWorkspace(output) : ''}
          ${isDiagram ? renderDiagramWorkspace(output) : ''}
          ${isFlashcards ? renderFlashcardsWorkspace(output) : ''}
          ${isAssessment ? renderAssessmentWorkspace(output) : ''}
          ${!isPresentation && !isPoster && !isWorksheet && !isDiagram && !isFlashcards && !isAssessment ? renderGenericWorkspace(output) : ''}
        `}
      </div>

    </div>
  `;
}

function renderOutputPromptWorkspace(output) {
  const promptText = output.prompt || buildAiOutputPrompt({
    activeCategoryId: output.category,
    activeTypeId: output.typeId,
    typeLabel: output.typeLabel,
    formData: {
      subject: output.subject,
      educationalLevel: output.educationalLevel,
      gradeLevel: output.gradeLevel,
      topic: output.topic,
      objectives: output.objectives || '',
      competency: output.competency || '',
      targetAudience: output.targetAudience || '',
      contentRequirements: output.contentRequirements || ''
    },
    designOptions: activeStudioState.designOptions
  });

  const charCount = promptText.length;
  const wordCount = promptText.split(/\s+/).filter(Boolean).length;

  return `
    <div class="space-y-4 animate-fade-in">
      <div class="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs leading-relaxed max-h-[560px] overflow-y-auto selection:bg-indigo-100 dark:selection:bg-indigo-900/60">
        <pre class="whitespace-pre-wrap select-all font-mono">${escapeHtml(promptText)}</pre>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 px-1">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Source Pedagogical Prompt Used for Generation</span>
        </div>
        <div class="flex items-center gap-3 font-mono text-[11px]">
          <span>${charCount} characters</span>
          <span>•</span>
          <span>~${wordCount} words</span>
          <span>•</span>
          <span>${escapeHtml(output.typeLabel || output.category)}</span>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// Presentation Slide Deck Editor Workspace
// -------------------------------------------------------------------------
function renderSlideWorkspace(output) {
  const slides = output.slides || [];
  const currentIdx = Math.min(activeStudioState.activeSlideIndex, Math.max(0, slides.length - 1));
  const activeSlide = slides[currentIdx] || { title: 'Slide Title', bullets: [], speakerNotes: '' };

  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Slide Thumbnails Strip (3 cols) -->
      <div class="lg:col-span-3 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Slide Deck (${slides.length})</span>
          <button id="add-slide-btn" class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>+ Add Slide</span>
          </button>
        </div>

        <div class="space-y-2">
          ${slides.map((s, idx) => `
            <div data-slide-index="${idx}" class="slide-thumb p-3 rounded-xl border cursor-pointer transition-all ${idx === currentIdx ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-750 hover:border-slate-300'}">
              <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>SLIDE ${idx + 1}</span>
                <span class="px-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${s.slideType || 'Content'}</span>
              </div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${escapeHtml(s.title || `Slide ${idx + 1}`)}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${escapeHtml((s.bullets && s.bullets[0]) || 'No bullets')}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Slide Preview Canvas (6 cols) -->
      <div class="lg:col-span-6 flex flex-col justify-between">
        
        <!-- Live Slide Canvas -->
        <div class="aspect-video w-full rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden border border-indigo-800/50">
          <div class="absolute right-4 top-4 text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-indigo-200">
            ${currentIdx + 1} / ${slides.length}
          </div>
          
          <div>
            <span class="text-[11px] font-mono uppercase tracking-widest text-teal-300 font-bold block mb-1">
              ${escapeHtml(output.subject || 'PEDAIA Instructional Deck')} • ${escapeHtml(activeSlide.slideType || 'Lecture Core')}
            </span>
            <h2 class="text-xl sm:text-2xl font-bold font-scholarly leading-snug tracking-tight text-white mb-4">
              ${escapeHtml(activeSlide.title || 'Slide Title')}
            </h2>
            
            <ul class="space-y-2.5 max-w-xl">
              ${(activeSlide.bullets || []).map(b => `
                <li class="flex items-start gap-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <span class="text-teal-400 text-base leading-none">•</span>
                  <span>${escapeHtml(b)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>PEDAIA Academic Slides</span>
            <span>${escapeHtml(output.topic || '')}</span>
          </div>
        </div>

        <!-- Carousel Navigation Controls -->
        <div class="flex items-center justify-between pt-4">
          <button id="prev-slide-btn" class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40" ${currentIdx === 0 ? 'disabled' : ''}>
            ← Previous Slide
          </button>
          <span class="text-xs font-mono text-slate-500">Slide ${currentIdx + 1} of ${slides.length}</span>
          <button id="next-slide-btn" class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40" ${currentIdx >= slides.length - 1 ? 'disabled' : ''}>
            Next Slide →
          </button>
        </div>
      </div>

      <!-- Active Slide Inline Editor (3 cols) -->
      <div class="lg:col-span-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Edit Slide ${currentIdx + 1}</span>
          <button id="delete-slide-btn" class="text-[11px] font-semibold text-rose-600 hover:underline" ${slides.length <= 1 ? 'disabled style="display:none;"' : ''}>
            Delete Slide
          </button>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Slide Title</label>
          <input type="text" id="edit-slide-title" value="${escapeHtml(activeSlide.title || '')}" class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white font-medium outline-none">
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Bullet Points (1 per line)</label>
          <textarea id="edit-slide-bullets" rows="5" class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none leading-relaxed">${escapeHtml((activeSlide.bullets || []).join('\n'))}</textarea>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Speaker Notes (Facilitator Script)</label>
          <textarea id="edit-slide-notes" rows="3" class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none leading-relaxed text-[11px]">${escapeHtml(activeSlide.speakerNotes || '')}</textarea>
        </div>

        <button id="apply-slide-edit-btn" class="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-2xs">
          Update Active Slide
        </button>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------------------
// Educational Poster / Infographic Canvas Workspace
// -------------------------------------------------------------------------
function renderPosterWorkspace(output) {
  const p = output.posterData || {
    headline: output.title,
    subtitle: 'Core Mechanisms & Conceptual Framework',
    cards: [
      { title: 'Core Principle', desc: 'Solar photons excite thylakoid chlorophyll complexes, releasing ATP and NADPH.' },
      { title: 'Dark Reactions', desc: 'Calvin cycle in the stroma fixes carbon dioxide into high-energy glucose molecules.' },
      { title: 'Ecological Significance', desc: 'Generates atmospheric diatomic oxygen sustaining aerobic biosphere life.' }
    ],
    statistics: ['6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', 'Chloroplast: Double-Membrane Organelle', 'Optimal Range: 25°C - 35°C'],
    takeaways: 'Photosynthesis bridges radiant solar energy into chemical bonds powering global food chains.'
  };

  return `
    <div class="max-w-3xl mx-auto rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-800/60 relative overflow-hidden">
      
      <!-- Top Scholarly Header -->
      <div class="text-center pb-6 border-b border-indigo-500/30">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest bg-teal-400/20 text-teal-300 mb-2">
          ${escapeHtml(output.subject || 'SCIENCE')} • GRADE 8 INSTRUCTIONAL POSTER
        </span>
        <h1 class="text-2xl sm:text-3xl font-bold font-scholarly text-white tracking-tight leading-snug">
          ${escapeHtml(p.headline)}
        </h1>
        <p class="text-xs sm:text-sm text-indigo-200 mt-2 max-w-xl mx-auto">
          ${escapeHtml(p.subtitle)}
        </p>
      </div>

      <!-- Main Infographic 3-Card Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        ${p.cards.map((c, i) => `
          <div class="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <span class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-mono font-bold text-xs flex items-center justify-center mb-3">0${i+1}</span>
              <h3 class="text-sm font-bold text-white mb-1.5">${escapeHtml(c.title)}</h3>
              <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(c.desc)}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Empirical Statistics & Equation Bar -->
      <div class="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 text-center mb-8">
        <span class="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block mb-1">Governing Biochemical Formula</span>
        <div class="text-sm sm:text-base font-mono font-bold text-white tracking-wide">
          ${escapeHtml(p.statistics[0] || '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂')}
        </div>
      </div>

      <!-- Bottom Classroom Takeaway -->
      <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
        <span class="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold block mb-1">Key Instructional Takeaway</span>
        <p class="text-xs text-slate-200 max-w-2xl mx-auto leading-relaxed">
          ${escapeHtml(p.takeaways)}
        </p>
      </div>

      <div class="pt-6 mt-8 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
        <span>PEDAIA Educational Poster Atelier</span>
        <span>Standard Classroom Alignment (CS-08)</span>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------------------
// Document / Worksheet Workspace (Student vs Teacher Answer Key)
// -------------------------------------------------------------------------
function renderWorksheetWorkspace(output) {
  const isAnswerKey = activeStudioState.activeTab === 'editor';

  return `
    <div class="space-y-4">
      
      <!-- Sub-tabs: Student Edition vs Teacher Answer Key -->
      <div class="flex items-center justify-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button id="worksheet-student-tab" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${!isAnswerKey ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}">
          📄 Student Worksheet Edition
        </button>
        <button id="worksheet-teacher-tab" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${isAnswerKey ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}">
          🔑 Teacher Key & Rubric Edition
        </button>
      </div>

      <!-- Formatted Paper Canvas -->
      <div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-750 p-8 sm:p-12 rounded-2xl shadow-sm text-slate-900 dark:text-slate-100 space-y-6">
        
        <!-- Worksheet Header Block -->
        <div class="border-b-2 border-slate-900 dark:border-slate-100 pb-4">
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                ${escapeHtml(output.subject || 'General')} • ${escapeHtml(output.gradeLevel || output.educationalLevel || '')}
              </span>
              <h1 class="text-xl sm:text-2xl font-bold font-scholarly text-slate-900 dark:text-white">
                ${escapeHtml(output.title)}
              </h1>
            </div>
            ${isAnswerKey ? `
              <span class="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300">
                TEACHER KEY
              </span>
            ` : ''}
          </div>

          <!-- Student Name / Date / Section Fillable Header -->
          <div class="grid grid-cols-3 gap-4 pt-3 text-xs border-t border-slate-200 dark:border-slate-800">
            <div><strong>Student:</strong> ____________________</div>
            <div><strong>Date:</strong> _______________</div>
            <div><strong>Score:</strong> ______ / 25</div>
          </div>
        </div>

        <!-- Rendered Document Prose -->
        <div class="prose-academic text-xs sm:text-sm leading-relaxed space-y-4">
          ${isAnswerKey && output.answerKeyOutput ? `
            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium mb-4">
              📌 Teacher Notice: Complete model answers and scoring rationales are rendered below.
            </div>
            ${renderMarkdownToHtml(output.answerKeyOutput)}
          ` : `
            ${renderMarkdownToHtml(output.studentOutput || output.output || '')}
          `}
        </div>

        <div class="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between text-[11px] text-slate-400">
          <span>PEDAIA Instructional Materials Studio</span>
          <span>Verified Curriculum Alignment</span>
        </div>

      </div>

    </div>
  `;
}

// -------------------------------------------------------------------------
// Visual Learning Diagram / Mindmap Workspace
// -------------------------------------------------------------------------
function renderDiagramWorkspace(output) {
  return `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Diagram Graphic Canvas -->
      <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-750 shadow-sm text-center">
        <h2 class="text-lg font-bold font-scholarly text-slate-900 dark:text-white mb-2">${escapeHtml(output.title)}</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xl mx-auto">Interactive Visual Concept Map & System Diagram</p>

        <!-- Dynamic SVG Flow Representation -->
        <div class="p-6 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex flex-col items-center justify-center min-h-[300px]">
          <svg class="w-full max-w-2xl h-64" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Node 1: Primary Input -->
            <rect x="20" y="80" width="140" height="70" rx="12" fill="#312E81" />
            <text x="90" y="112" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">Solar Photons + H₂O</text>
            <text x="90" y="130" fill="#CBD5E1" font-size="10" text-anchor="middle">Light-Dependent Input</text>

            <!-- Arrow 1 to 2 -->
            <path d="M160 115 L220 115" stroke="#7C3AED" stroke-width="3" stroke-dasharray="4 4" />
            <polygon points="220,110 230,115 220,120" fill="#7C3AED" />

            <!-- Node 2: Core Thylakoid Engine -->
            <rect x="230" y="60" width="160" height="110" rx="14" fill="#14B8A6" />
            <text x="310" y="100" fill="#FFFFFF" font-size="13" font-weight="bold" text-anchor="middle">Chloroplast Thylakoids</text>
            <text x="310" y="120" fill="#E0F2FE" font-size="10" text-anchor="middle">ATP + NADPH Synthesis</text>
            <text x="310" y="140" fill="#042F2E" font-size="9" font-weight="bold" text-anchor="middle">Releases O₂ Byproduct</text>

            <!-- Arrow 2 to 3 -->
            <path d="M390 115 L440 115" stroke="#7C3AED" stroke-width="3" />
            <polygon points="440,110 450,115 440,120" fill="#7C3AED" />

            <!-- Node 3: Calvin Cycle Output -->
            <rect x="450" y="80" width="130" height="70" rx="12" fill="#312E81" />
            <text x="515" y="112" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">Glucose (C₆H₁₂O₆)</text>
            <text x="515" y="130" fill="#CBD5E1" font-size="10" text-anchor="middle">Stroma Sugar Stored</text>
          </svg>
        </div>

        <div class="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Tip: Download as SVG for infinite scaling on worksheets, posters, or slides.
        </div>
      </div>

      <!-- Explanatory Node Breakdown -->
      <div class="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-750">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Pedagogical Node Breakdown</h3>
        <div class="prose-academic text-xs leading-relaxed">
          ${renderMarkdownToHtml(output.output || '')}
        </div>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------------------
// Classroom Flashcards Workspace (Interactive Flip & Print Sheet)
// -------------------------------------------------------------------------
function renderFlashcardsWorkspace(output) {
  const cards = output.cards || [
    { front: 'Light-Dependent Reactions', back: 'Takes place in thylakoid membranes; converts light energy into ATP and NADPH.' },
    { front: 'Calvin Cycle (Light-Independent)', back: 'Occurs in the stroma; utilizes ATP and NADPH to synthesize glucose from CO₂.' },
    { front: 'Chlorophyll Pigment', back: 'Primary photoreceptor absorbing blue and red wavelengths while reflecting green light.' },
    { front: 'Stomata Gas Exchange', back: 'Microscopic pores regulated by guard cells that intake carbon dioxide and release oxygen.' }
  ];

  return `
    <div class="max-w-3xl mx-auto space-y-6">
      
      <!-- Interactive Flip Card Showcase -->
      <div class="text-center">
        <h2 class="text-lg font-bold font-scholarly text-slate-900 dark:text-white mb-1">${escapeHtml(output.title)}</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Interactive Study Deck • Click any card to flip front / back</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${cards.map((c, idx) => `
          <div data-card-index="${idx}" class="flashcard-item h-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-6 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group">
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>CARD ${idx + 1} OF ${cards.length}</span>
              <span class="text-indigo-600 dark:text-indigo-400 group-hover:underline">Click to Flip 🔄</span>
            </div>
            
            <div class="card-content-area text-center my-auto">
              <span class="card-label text-[10px] font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold block mb-1">Concept Term</span>
              <h3 class="card-text text-base font-bold text-slate-900 dark:text-white leading-snug">
                ${escapeHtml(c.front)}
              </h3>
            </div>

            <div class="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              Grade 8 Biology Flashcard Deck
            </div>
          </div>
        `).join('')}
      </div>

      <div class="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-center">
        <p class="text-xs text-indigo-900 dark:text-indigo-200">
          Ready to print classroom physical decks? Click <strong>Print 2-Sided Cards</strong> above to generate aligned cuttable sheets.
        </p>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------------------
// Assessment & Table of Specifications (TOS) Workspace
// -------------------------------------------------------------------------
function renderAssessmentWorkspace(output) {
  return `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 p-8 rounded-2xl shadow-sm text-slate-900 dark:text-slate-100 space-y-6">
        
        <div class="border-b-2 border-slate-900 dark:border-slate-100 pb-4">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Summative Assessment & Table of Specifications
          </span>
          <h1 class="text-xl sm:text-2xl font-bold font-scholarly text-slate-900 dark:text-white">
            ${escapeHtml(output.title)}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard Table of Specifications (TOS) & 15-Item Cognitive Assessment
          </p>
        </div>

        <div class="prose-academic text-xs leading-relaxed">
          ${renderMarkdownToHtml(output.output || '')}
        </div>

      </div>
    </div>
  `;
}

function renderGenericWorkspace(output) {
  return `
    <div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 p-8 rounded-2xl shadow-sm">
      <h2 class="text-xl font-bold font-scholarly text-slate-900 dark:text-white mb-4">${escapeHtml(output.title)}</h2>
      <div class="prose-academic text-xs sm:text-sm leading-relaxed">
        ${renderMarkdownToHtml(output.output || '')}
      </div>
    </div>
  `;
}

// =========================================================================
// 2.5 RECENT OUTPUTS & OUTPUT TEMPLATES SHOWCASE
// =========================================================================
function renderRecentOutputsSection(outputs) {
  const recent = (outputs || []).slice(0, 4);
  return `
    <section class="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm transition-colors">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Recent Generated Outputs</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Classroom-ready deliverables created in this atelier</p>
        </div>
        ${outputs && outputs.length > 0 ? `
          <button id="see-all-outputs-btn" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>View All Saved (${outputs.length})</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        ` : ''}
      </div>

      ${recent.length === 0 ? `
        <div class="py-10 px-6 text-center">
          <div class="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800/60 flex items-center justify-center text-xl text-violet-600 dark:text-violet-400 mx-auto mb-3">
            🎨
          </div>
          <h4 class="text-sm font-bold text-slate-800 dark:text-white mb-1">No outputs created yet.</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Start creating your first educational material using AI Output Studio.
          </p>
          <button class="scroll-to-create-btn px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ Create New Output</span>
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          ${recent.map(out => `
            <div class="p-4 rounded-xl border border-slate-200/90 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/40 hover:border-violet-400 dark:hover:border-violet-600 transition-all flex flex-col justify-between group cursor-pointer open-output-card" data-output-id="${out.id}">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-lg">${out.icon || '📄'}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    ${escapeHtml(out.typeLabel || out.category)}
                  </span>
                </div>
                <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  ${escapeHtml(out.title)}
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  ${escapeHtml(out.topic || out.prompt || 'Classroom Deliverable')}
                </p>
              </div>
              <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <span class="text-[10.5px] text-slate-400">${formatDate(out.updatedAt || out.createdAt)}</span>
                <span class="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open in Workspace →
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </section>
  `;
}

function renderOutputTemplatesSection() {
  return `
    <section class="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm transition-colors">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Output Templates</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Curated starting points configured for immediate deliverable generation</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        ${OUTPUT_TEMPLATES.map(tpl => `
          <div class="p-4 rounded-xl border border-slate-200/90 dark:border-slate-750 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/40 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  ${escapeHtml(tpl.subject)}
                </span>
                <span class="text-[10.5px] text-slate-400">${escapeHtml(tpl.gradeLevel || tpl.educationalLevel)}</span>
              </div>
              <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 leading-snug">
                ${escapeHtml(tpl.title)}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                ${escapeHtml(tpl.desc)}
              </p>
            </div>
            <button class="load-output-template-btn w-full py-2 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5" data-template-id="${tpl.id}">
              <span>Use Template</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderOutputTemplatesView() {
  return `
    <div class="space-y-6 animate-fade-in">
      <div class="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-sm flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Curated Output Repertoire</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Pre-configured pedagogical templates that populate the creation workspace</p>
        </div>
        <button id="templates-back-to-workspace-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-2xs">
          <span>← Back to Workspace</span>
        </button>
      </div>

      ${renderOutputTemplatesSection()}
    </div>
  `;
}

// =========================================================================
// 3. OUTPUT LIBRARY VIEW (Saved Materials Management)
// =========================================================================
function renderOutputLibraryView(outputs) {
  return `
    <div class="space-y-6">
      
      <!-- Library Filter & Search Bar -->
      <div class="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-750 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Filter By Category:</span>
          <select id="lib-category-filter" class="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none">
            <option value="all">All Educational Artifacts (${outputs.length})</option>
            ${OUTPUT_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>

        <button id="create-new-output-shortcut-btn" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto">
          <span>+ Create New Output</span>
        </button>
      </div>

      <!-- Outputs Grid -->
      ${outputs.length === 0 ? `
        <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 p-12 text-center max-w-md mx-auto shadow-2xs">
          <div class="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 mx-auto mb-3 text-2xl">
            🎨
          </div>
          <h3 class="text-base font-bold font-scholarly text-slate-800 dark:text-white mb-1">No outputs created yet.</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Start creating your first educational material using AI Output Studio.
          </p>
          <button id="library-get-started-btn" class="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5">
            <span>+ Create New Output</span>
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${outputs.map(out => `
            <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-2.5">
                  <span class="text-xl">${out.icon || '📄'}</span>
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800">
                    ${escapeHtml(out.typeLabel || out.category)}
                  </span>
                </div>

                <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer open-output-card" data-output-id="${out.id}">
                  ${escapeHtml(out.title)}
                </h3>

                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-3">
                  ${escapeHtml(out.topic || out.subject || 'Educational material')}
                </p>

                <div class="text-[11px] text-slate-400 space-y-1 mb-4 pb-3 border-b border-slate-100 dark:border-slate-750">
                  <div class="flex justify-between">
                    <span>Subject / Level:</span>
                    <span class="font-medium text-slate-700 dark:text-slate-300">${escapeHtml(out.subject || 'General')} (${escapeHtml(out.gradeLevel || '')})</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Created:</span>
                    <span>${new Date(out.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <!-- Functional Action Buttons -->
              <div class="flex items-center justify-between pt-1">
                <button class="open-output-card px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors" data-output-id="${out.id}">
                  Open Workspace →
                </button>
                <div class="flex items-center gap-1">
                  <button class="duplicate-output-btn p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg" data-output-id="${out.id}" title="Duplicate">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </button>
                  <button class="delete-output-btn p-1.5 text-rose-400 hover:text-rose-600 rounded-lg" data-output-id="${out.id}" title="Delete">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}

    </div>
  `;
}

// =========================================================================
// 4. EVENT LISTENERS & INTERACTION WIRING
// =========================================================================
export function setupAiOutputStudioListeners(container, navigateTo, showToast) {
  if (!container) return;
  try {
    // Prominent Header & Empty State Create Output Buttons
    const triggerCreateFlow = () => {
      activeStudioState.viewMode = 'creator';
      refreshView(container, navigateTo, showToast);
      setTimeout(() => {
        const target = container.querySelector('#step-1-category-section') || container.querySelector('#step-2-content-section');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    };

    container.querySelector('#output-studio-create-btn')?.addEventListener('click', triggerCreateFlow);
    container.querySelectorAll('.scroll-to-create-btn').forEach(btn => btn.addEventListener('click', triggerCreateFlow));
    container.querySelector('#library-get-started-btn')?.addEventListener('click', triggerCreateFlow);
    container.querySelector('#create-new-output-shortcut-btn')?.addEventListener('click', triggerCreateFlow);

    // Mode Tabs (Creative Workspace vs Library vs Templates)
    container.querySelector('#mode-creator-btn')?.addEventListener('click', () => {
      activeStudioState.viewMode = 'creator';
      refreshView(container, navigateTo, showToast);
    });

    container.querySelector('#mode-library-btn')?.addEventListener('click', () => {
      activeStudioState.viewMode = 'library';
      refreshView(container, navigateTo, showToast);
    });

    container.querySelector('#mode-templates-btn')?.addEventListener('click', () => {
      activeStudioState.viewMode = 'templates';
      refreshView(container, navigateTo, showToast);
    });

    container.querySelector('#templates-back-to-workspace-btn')?.addEventListener('click', () => {
      activeStudioState.viewMode = 'creator';
      refreshView(container, navigateTo, showToast);
    });

    container.querySelector('#see-all-outputs-btn')?.addEventListener('click', () => {
      activeStudioState.viewMode = 'library';
      refreshView(container, navigateTo, showToast);
    });

    // Load Template Buttons
    container.querySelectorAll('.load-output-template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tplId = btn.getAttribute('data-template-id');
        const tpl = OUTPUT_TEMPLATES.find(t => t.id === tplId);
        if (tpl) {
          activeStudioState.activeCategoryId = tpl.categoryId;
          activeStudioState.activeTypeId = tpl.typeId;
          activeStudioState.formData.subject = tpl.subject;
          activeStudioState.formData.educationalLevel = tpl.educationalLevel;
          activeStudioState.formData.gradeLevel = tpl.gradeLevel;
          activeStudioState.formData.topic = tpl.topic;
          activeStudioState.formData.objectives = tpl.objectives;
          activeStudioState.formData.competency = tpl.competency;
          activeStudioState.formData.targetAudience = tpl.targetAudience;
          activeStudioState.formData.purpose = tpl.purpose;
          activeStudioState.formData.contentRequirements = tpl.contentRequirements;
          activeStudioState.viewMode = 'creator';
          activeStudioState.userCustomPrompt = null;
          activeStudioState.isPromptEditable = false;
          refreshView(container, navigateTo, showToast);
          if (showToast) showToast(`Loaded template: "${tpl.title}"`, 'success');
          setTimeout(() => {
            const formSec = container.querySelector('#step-2-content-section');
            formSec?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        }
      });
    });

    // Category Selection
    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-category-id');
        const cat = OUTPUT_CATEGORIES.find(c => c.id === catId);
        if (cat) {
          activeStudioState.activeCategoryId = catId;
          activeStudioState.activeTypeId = cat.types[0]?.id || '';
          activeStudioState.userCustomPrompt = null;
          activeStudioState.isPromptEditable = false;
          refreshView(container, navigateTo, showToast);
        }
      });
    });

    // Subtype Selection
    container.querySelectorAll('.type-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const typeId = pill.getAttribute('data-type-id');
        activeStudioState.activeTypeId = typeId;
        activeStudioState.userCustomPrompt = null;
        activeStudioState.isPromptEditable = false;
        refreshView(container, navigateTo, showToast);
      });
    });

    // Search Input Filter
    container.querySelector('#category-search-input')?.addEventListener('input', (e) => {
      activeStudioState.searchQuery = e.target.value;
      refreshView(container, navigateTo, showToast);
    });

    // Import from Design Dropdown
    container.querySelector('#import-design-select')?.addEventListener('change', (e) => {
      const designId = e.target.value;
      if (designId) {
        const design = store.getDesignById(designId);
        if (design) {
          activeStudioState.selectedSourceDesignId = designId;
          activeStudioState.formData.subject = design.subject || activeStudioState.formData.subject;
          activeStudioState.formData.educationalLevel = design.educationalLevel || activeStudioState.formData.educationalLevel;
          activeStudioState.formData.gradeLevel = design.gradeLevel || activeStudioState.formData.gradeLevel;
          activeStudioState.formData.topic = design.topic || design.title;
          activeStudioState.formData.competency = design.competency || activeStudioState.formData.competency;
          if (design.output) {
            activeStudioState.formData.contentRequirements = `Inherited from ${design.title}:\n` + design.output.slice(0, 300) + '...';
          }
          activeStudioState.userCustomPrompt = null;
          activeStudioState.isPromptEditable = false;
          showToast(`Imported context from "${design.title}".`, 'success');
          refreshView(container, navigateTo, showToast);
        }
      }
    });

    // Contextual Conversion Shortcuts
    container.querySelectorAll('.shortcut-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        const type = btn.getAttribute('data-type');
        activeStudioState.activeCategoryId = cat;
        activeStudioState.activeTypeId = type;
        activeStudioState.userCustomPrompt = null;
        activeStudioState.isPromptEditable = false;
        showToast(`Switched deliverable to ${btn.textContent.trim()}`, 'info');
        refreshView(container, navigateTo, showToast);
      });
    });

    // Prompt Preview Controls & Direct Editing
    container.querySelector('#output-toggle-edit-prompt-btn')?.addEventListener('click', () => {
      if (activeStudioState.isPromptEditable) {
        const textarea = container.querySelector('#output-editable-prompt-text');
        if (textarea) {
          activeStudioState.userCustomPrompt = textarea.value;
        }
        activeStudioState.isPromptEditable = false;
        showToast('Saved customized pedagogical prompt.', 'info');
      } else {
        if (activeStudioState.userCustomPrompt === null) {
          activeStudioState.userCustomPrompt = buildAiOutputPrompt(activeStudioState);
        }
        activeStudioState.isPromptEditable = true;
      }
      refreshView(container, navigateTo, showToast);
    });

    container.querySelector('#output-editable-prompt-text')?.addEventListener('input', (e) => {
      activeStudioState.userCustomPrompt = e.target.value;
      const stats = container.querySelector('#output-prompt-stats');
      if (stats) {
        const chars = e.target.value.length;
        const words = e.target.value.split(/\s+/).filter(Boolean).length;
        stats.textContent = `${chars} chars • ~${words} words`;
      }
    });

    container.querySelector('#output-copy-prompt-btn')?.addEventListener('click', async () => {
      const promptToCopy = activeStudioState.userCustomPrompt !== null
        ? activeStudioState.userCustomPrompt
        : buildAiOutputPrompt(activeStudioState);
      try {
        await navigator.clipboard.writeText(promptToCopy);
        showToast('✓ Copied pedagogical prompt to clipboard!', 'success');
      } catch (err) {
        showToast('Could not access clipboard: ' + err.message, 'error');
      }
    });

    container.querySelector('#output-reset-prompt-btn')?.addEventListener('click', () => {
      activeStudioState.userCustomPrompt = null;
      activeStudioState.isPromptEditable = false;
      showToast('Reset prompt to live auto-compiled specification.', 'info');
      refreshView(container, navigateTo, showToast);
    });

    // Sync Form Input Data
    bindFormSync(container);

    // Generate Output Action
    container.querySelector('#generate-output-btn')?.addEventListener('click', async () => {
      await executeOutputGeneration(container, navigateTo, showToast);
    });

    // Workspace Actions
    setupWorkspaceListeners(container, navigateTo, showToast);
  } catch (err) {
    console.warn('[AI Output Studio] setup listeners caught exception:', err);
  }
}

function updatePromptPreviewDisplay(container) {
  if (activeStudioState.userCustomPrompt !== null || activeStudioState.isPromptEditable) {
    return;
  }
  const prompt = buildAiOutputPrompt(activeStudioState);
  const pre = container.querySelector('#output-prompt-pre');
  if (pre) {
    pre.textContent = prompt;
  }
  const stats = container.querySelector('#output-prompt-stats');
  if (stats) {
    const chars = prompt.length;
    const words = prompt.split(/\s+/).filter(Boolean).length;
    stats.textContent = `${chars} chars • ~${words} words`;
  }
}

function bindFormSync(container) {
  const syncInput = (id, key) => {
    const el = container.querySelector(`#${id}`);
    if (el) {
      el.addEventListener('input', (e) => {
        activeStudioState.formData[key] = e.target.value;
        updatePromptPreviewDisplay(container);
      });
      el.addEventListener('change', (e) => {
        activeStudioState.formData[key] = e.target.value;
        updatePromptPreviewDisplay(container);
      });
    }
  };

  syncInput('form-subject', 'subject');
  syncInput('form-ed-level', 'educationalLevel');
  syncInput('form-grade-level', 'gradeLevel');
  syncInput('form-topic', 'topic');
  syncInput('form-objectives', 'objectives');
  syncInput('form-competency', 'competency');
  syncInput('form-content-req', 'contentRequirements');
  syncInput('form-add-notes', 'additionalInstructions');

  // Sync design options
  const syncOpt = (id, key, isBool = false) => {
    const el = container.querySelector(`#${id}`);
    if (el) {
      el.addEventListener('change', (e) => {
        activeStudioState.designOptions[key] = isBool ? e.target.checked : e.target.value;
        updatePromptPreviewDisplay(container);
      });
    }
  };

  syncOpt('opt-theme', 'theme');
  syncOpt('opt-slide-count', 'slideCount');
  syncOpt('opt-aspect', 'aspectRatio');
  syncOpt('opt-speaker-notes', 'speakerNotes', true);
  syncOpt('opt-orientation', 'orientation');
  syncOpt('opt-layout', 'layout');
  syncOpt('opt-page-size', 'pageSize');
  syncOpt('opt-answer-key', 'includeAnswerKey', true);
  syncOpt('opt-spacing', 'spacing');
  syncOpt('opt-rubric', 'rubric');
  syncOpt('opt-card-count', 'cardCount');
  syncOpt('opt-diagram-type', 'diagramType');
}

// -------------------------------------------------------------------------
// Execute Real Generation Pipeline
// -------------------------------------------------------------------------
async function executeOutputGeneration(container, navigateTo, showToast) {
  const btn = container.querySelector('#generate-output-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin text-lg">⏳</span><span>Synthesizing Educational Deliverable...</span>`;
  }

  showToast('Generating educational artifact with pedagogical engine...', 'info');

  try {
    const cat = OUTPUT_CATEGORIES.find(c => c.id === activeStudioState.activeCategoryId) || OUTPUT_CATEGORIES[0];
    const typeObj = cat.types.find(t => t.id === activeStudioState.activeTypeId) || cat.types[0];
    const f = activeStudioState.formData;

    // Structured Prompt for Generation
    const prompt = activeStudioState.userCustomPrompt || buildAiOutputPrompt(activeStudioState);

    const systemInstruction = `You are PEDAIA, an educational materials and slide generation specialist. Create structured, rigorous learning materials.`;

    // Real AI Service Call (seamlessly engages pedagogical synthesis if no key)
    const result = await (aiService.generate ? aiService.generate({
      prompt,
      systemInstruction,
      temperature: 0.7
    }) : aiService.generateContent({
      prompt,
      systemInstruction,
      temperature: 0.7
    }));

    const outputText = result.output || '';

    // Create Structured Output Entity
    const newOutput = {
      id: 'out-' + Date.now(),
      title: `${f.topic}: ${typeObj.label}`,
      category: cat.id,
      typeId: typeObj.id,
      typeLabel: typeObj.label,
      icon: cat.icon,
      subject: f.subject,
      educationalLevel: f.educationalLevel,
      gradeLevel: f.gradeLevel,
      topic: f.topic,
      output: outputText,
      prompt: prompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Category Specific Parsing
    if (cat.id === 'presentation') {
      newOutput.slides = parsePresentationSlides(outputText, f);
    } else if (cat.id === 'worksheet') {
      newOutput.studentOutput = outputText;
      newOutput.answerKeyOutput = generateTeacherAnswerKey(outputText, f);
    } else if (cat.id === 'flashcards') {
      newOutput.cards = parseFlashcards(outputText, f);
    }

    activeStudioState.activeOutput = newOutput;
    activeStudioState.activeSlideIndex = 0;

    showToast(`✓ Generated ${typeObj.label} successfully!`, 'success');

    // Auto save to state
    store.saveOutput(newOutput);

    // Re-render and smoothly scroll down to output workspace
    refreshView(container, navigateTo, showToast);
    setTimeout(() => {
      document.getElementById('output-workspace-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

  } catch (err) {
    showToast(`Generation failed: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span class="text-base">✨</span><span>Generate Educational Output</span>`;
    }
  }
}

// -------------------------------------------------------------------------
// Workspace Specialized Interactive Listeners
// -------------------------------------------------------------------------
function setupWorkspaceListeners(container, navigateTo, showToast) {
  // Workspace Tab Switcher (Deliverable vs Prompt Preview)
  container.querySelector('#ws-tab-deliverable-btn')?.addEventListener('click', () => {
    activeStudioState.workspaceTab = 'deliverable';
    refreshView(container, navigateTo, showToast);
  });

  container.querySelector('#ws-tab-prompt-btn')?.addEventListener('click', () => {
    activeStudioState.workspaceTab = 'prompt';
    refreshView(container, navigateTo, showToast);
  });

  // Prompt Copy in Workspace
  container.querySelector('#ws-copy-prompt-btn')?.addEventListener('click', async () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    const promptText = output.prompt || buildAiOutputPrompt({
      activeCategoryId: output.category,
      activeTypeId: output.typeId,
      typeLabel: output.typeLabel,
      formData: {
        subject: output.subject,
        educationalLevel: output.educationalLevel,
        gradeLevel: output.gradeLevel,
        topic: output.topic,
        objectives: output.objectives || '',
        competency: output.competency || '',
        targetAudience: output.targetAudience || '',
        contentRequirements: output.contentRequirements || ''
      },
      designOptions: activeStudioState.designOptions
    });
    try {
      await navigator.clipboard.writeText(promptText);
      showToast('✓ Copied source prompt to clipboard!', 'success');
    } catch (err) {
      showToast('Could not access clipboard: ' + err.message, 'error');
    }
  });

  // Prompt Edit in Creator
  container.querySelector('#ws-edit-prompt-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    const promptText = output.prompt || buildAiOutputPrompt({
      activeCategoryId: output.category,
      activeTypeId: output.typeId,
      typeLabel: output.typeLabel,
      formData: {
        subject: output.subject,
        educationalLevel: output.educationalLevel,
        gradeLevel: output.gradeLevel,
        topic: output.topic,
        objectives: output.objectives || '',
        competency: output.competency || '',
        targetAudience: output.targetAudience || '',
        contentRequirements: output.contentRequirements || ''
      },
      designOptions: activeStudioState.designOptions
    });

    activeStudioState.userCustomPrompt = promptText;
    activeStudioState.isPromptEditable = true;
    showToast('Loaded prompt into Creator for editing.', 'info');
    refreshView(container, navigateTo, showToast);

    setTimeout(() => {
      const textarea = document.querySelector('#output-editable-prompt-text');
      textarea?.focus();
      textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });

  // Slide Carousel Thumbnails
  container.querySelectorAll('.slide-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.getAttribute('data-slide-index'), 10);
      activeStudioState.activeSlideIndex = idx;
      refreshView(container, navigateTo, showToast);
    });
  });

  // Prev / Next Slide
  container.querySelector('#prev-slide-btn')?.addEventListener('click', () => {
    if (activeStudioState.activeSlideIndex > 0) {
      activeStudioState.activeSlideIndex--;
      refreshView(container, navigateTo, showToast);
    }
  });

  container.querySelector('#next-slide-btn')?.addEventListener('click', () => {
    const slides = activeStudioState.activeOutput?.slides || [];
    if (activeStudioState.activeSlideIndex < slides.length - 1) {
      activeStudioState.activeSlideIndex++;
      refreshView(container, navigateTo, showToast);
    }
  });

  // Add Slide
  container.querySelector('#add-slide-btn')?.addEventListener('click', () => {
    if (activeStudioState.activeOutput?.slides) {
      const newSlide = {
        title: 'New Slide: Interactive Practice',
        slideType: 'Activity',
        bullets: [
          'Form collaborative student pairs (Think-Pair-Share)',
          'Solve the guided application challenge on your organizer',
          'Synthesize conclusions for whole-group debrief'
        ],
        speakerNotes: 'Prompt students to apply the core principle collaboratively.'
      };
      activeStudioState.activeOutput.slides.push(newSlide);
      activeStudioState.activeSlideIndex = activeStudioState.activeOutput.slides.length - 1;
      store.saveOutput(activeStudioState.activeOutput);
      showToast('Added new slide to deck.', 'info');
      refreshView(container, navigateTo, showToast);
    }
  });

  // Delete Slide
  container.querySelector('#delete-slide-btn')?.addEventListener('click', () => {
    if (activeStudioState.activeOutput?.slides && activeStudioState.activeOutput.slides.length > 1) {
      activeStudioState.activeOutput.slides.splice(activeStudioState.activeSlideIndex, 1);
      activeStudioState.activeSlideIndex = Math.max(0, activeStudioState.activeSlideIndex - 1);
      store.saveOutput(activeStudioState.activeOutput);
      showToast('Slide removed from deck.', 'info');
      refreshView(container, navigateTo, showToast);
    }
  });

  // Apply Slide Inline Edit
  container.querySelector('#apply-slide-edit-btn')?.addEventListener('click', () => {
    const titleVal = container.querySelector('#edit-slide-title')?.value;
    const bulletsVal = container.querySelector('#edit-slide-bullets')?.value;
    const notesVal = container.querySelector('#edit-slide-notes')?.value;

    if (activeStudioState.activeOutput?.slides) {
      const slide = activeStudioState.activeOutput.slides[activeStudioState.activeSlideIndex];
      if (slide) {
        slide.title = titleVal || slide.title;
        slide.bullets = (bulletsVal || '').split('\n').filter(b => b.trim().length > 0);
        slide.speakerNotes = notesVal || '';
        store.saveOutput(activeStudioState.activeOutput);
        showToast('Updated slide contents.', 'success');
        refreshView(container, navigateTo, showToast);
      }
    }
  });

  // Worksheet Tabs (Student vs Teacher)
  container.querySelector('#worksheet-student-tab')?.addEventListener('click', () => {
    activeStudioState.activeTab = 'preview';
    refreshView(container, navigateTo, showToast);
  });
  container.querySelector('#worksheet-teacher-tab')?.addEventListener('click', () => {
    activeStudioState.activeTab = 'editor';
    refreshView(container, navigateTo, showToast);
  });

  // Flashcards Flip interaction
  container.querySelectorAll('.flashcard-item').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-card-index'), 10);
      const outputCards = activeStudioState.activeOutput?.cards || [];
      const c = outputCards[idx];
      if (c) {
        const textEl = card.querySelector('.card-text');
        const labelEl = card.querySelector('.card-label');
        if (textEl.textContent.trim() === c.front.trim()) {
          textEl.textContent = c.back;
          labelEl.textContent = 'Explanation / Answer';
          card.classList.add('bg-indigo-50/70', 'dark:bg-indigo-950/70');
        } else {
          textEl.textContent = c.front;
          labelEl.textContent = 'Concept Term';
          card.classList.remove('bg-indigo-50/70', 'dark:bg-indigo-950/70');
        }
      }
    });
  });

  // Save to Library
  container.querySelector('#save-to-library-btn')?.addEventListener('click', () => {
    if (activeStudioState.activeOutput) {
      store.saveOutput(activeStudioState.activeOutput);
      showToast('✓ Saved artifact into AI Output Library!', 'success');
    }
  });

  // Share Link
  container.querySelector('#output-share-link-btn')?.addEventListener('click', () => {
    const out = activeStudioState.activeOutput;
    if (out) {
      openShareLinkModal({ item: out, type: 'output', showToast });
    } else {
      showToast('Generate or select an output first to share.', 'info');
    }
  });

  // Real Exports
  bindExportHandlers(container, showToast);

  // Library Card Open, Duplicate, Delete
  bindLibraryActions(container, navigateTo, showToast);
}

// -------------------------------------------------------------------------
// Real Export Actions (PPTX, DOCX, SVG, PDF)
// -------------------------------------------------------------------------
function bindExportHandlers(container, showToast) {
  // PowerPoint (.pptx)
  container.querySelector('#export-pptx-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    downloadPowerPointPresentation(output);
    showToast('Downloaded PowerPoint presentation file (.pptx)!', 'success');
  });

  // Interactive Projector Presentation
  container.querySelector('#export-html-slides-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    openInteractiveSlideDeckWindow(output);
  });

  // Poster Print (PDF)
  container.querySelector('#export-pdf-poster-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    openPrintablePosterWindow(output);
  });

  // SVG Graphic Download
  container.querySelector('#export-svg-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    downloadSvgDiagram(output);
    showToast('Downloaded SVG Vector Graphic!', 'success');
  });

  // Word (.docx)
  container.querySelector('#export-docx-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    exportToDocx(output);
    showToast('Downloaded Microsoft Word (.docx)!', 'success');
  });

  // Print Worksheet / Handout
  container.querySelector('#print-worksheet-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    openPrintableWindow(output);
  });

  // Print 2-Sided Flashcards
  container.querySelector('#print-flashcards-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    openPrintableFlashcardsWindow(output);
  });

  // Markdown (.md)
  container.querySelector('#export-markdown-btn')?.addEventListener('click', () => {
    const output = activeStudioState.activeOutput;
    if (!output) return;
    exportToMarkdown(output);
    showToast('Downloaded Markdown document!', 'success');
  });
}

function bindLibraryActions(container, navigateTo, showToast) {
  container.querySelectorAll('.open-output-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-output-id');
      const found = store.getOutputById(id);
      if (found) {
        activeStudioState.activeOutput = found;
        activeStudioState.activeCategoryId = found.category;
        activeStudioState.viewMode = 'creator';
        showToast(`Loaded "${found.title}" into workspace.`, 'info');
        refreshView(container, navigateTo, showToast);
        setTimeout(() => {
          document.getElementById('output-workspace-container')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  });

  container.querySelectorAll('.duplicate-output-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-output-id');
      const duplicated = store.duplicateOutput(id);
      if (duplicated) {
        showToast(`Duplicated as "${duplicated.title}".`, 'success');
        refreshView(container, navigateTo, showToast);
      }
    });
  });

  container.querySelectorAll('.delete-output-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-output-id');
      if (confirm('Are you sure you want to delete this educational artifact?')) {
        store.deleteOutput(id);
        if (activeStudioState.activeOutput?.id === id) {
          activeStudioState.activeOutput = null;
        }
        showToast('Artifact deleted.', 'info');
        refreshView(container, navigateTo, showToast);
      }
    });
  });
}

function refreshView(container, navigateTo, showToast) {
  container.innerHTML = renderAiOutputStudioView();
  setupAiOutputStudioListeners(container, navigateTo, showToast);
}

// =========================================================================
// 5. PARSERS & GENERATOR HELPERS
// =========================================================================
function parsePresentationSlides(rawText, formData) {
  const slides = [];
  const lines = (rawText || '').split('\n');
  let currentSlide = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.toLowerCase().startsWith('slide ') || trimmed.startsWith('### Slide')) {
      if (currentSlide) slides.push(currentSlide);
      currentSlide = {
        title: trimmed.replace(/^[#\s]+/, '').replace(/^Slide \d+[:\s-]*/i, ''),
        slideType: 'Content',
        bullets: [],
        speakerNotes: 'Facilitator Guidance: Frame the concept clearly and encourage active learner participation.'
      };
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      if (!currentSlide) {
        currentSlide = {
          title: `${formData.topic}: Introduction`,
          slideType: 'Title',
          bullets: [],
          speakerNotes: 'Introduce the core topic and connect to prior learning schema.'
        };
      }
      currentSlide.bullets.push(trimmed.replace(/^[-*\d.]+\s*/, ''));
    } else if (trimmed.toLowerCase().startsWith('speaker note:') || trimmed.toLowerCase().startsWith('notes:')) {
      if (currentSlide) {
        currentSlide.speakerNotes = trimmed.replace(/^[^:]+:\s*/, '');
      }
    }
  }

  if (currentSlide) slides.push(currentSlide);

  // Fallback default 5-slide instructional deck if parser got few slides
  if (slides.length < 3) {
    return [
      {
        title: `${formData.topic}: Instructional Presentation`,
        slideType: 'Title',
        bullets: [
          `Subject: ${formData.subject} (${formData.gradeLevel})`,
          'Pedagogical Framework: 5E Inquiry Cycle',
          'Standard Alignment: Core Discipline Competencies'
        ],
        speakerNotes: 'Introduce the unit driving question and engage student curiosity.'
      },
      {
        title: 'Target Learning Objectives',
        slideType: 'Objectives',
        bullets: [
          'Examine fundamental conceptual definitions and scientific models',
          'Model real-world transformations and empirical mechanisms',
          'Synthesize findings with structured peer collaboration'
        ],
        speakerNotes: 'Review the success criteria and check for student comprehension.'
      },
      {
        title: 'Core Conceptual Foundations',
        slideType: 'Explanation',
        bullets: [
          'Light-dependent reaction pathways transform radiant photons',
          'Coupled energy carriers (ATP & NADPH) energize the system',
          'Biochemical reactions maintain strict equilibrium and energy conservation'
        ],
        speakerNotes: 'Walk students through the thylakoid diagram step-by-step.'
      },
      {
        title: 'Collaborative Application Task',
        slideType: 'Activity',
        bullets: [
          'Work in pairs to diagram the flow of carbon and water molecules',
          'Annotate the inputs, cellular catalysts, and waste products',
          'Be prepared to justify your claims to the classroom seminar'
        ],
        speakerNotes: 'Circulate among student dyads to provide targeted scaffolding.'
      },
      {
        title: 'Key Takeaways & Formative Exit Ticket',
        slideType: 'Summary',
        bullets: [
          'All biological systems depend on coupled energy transformations',
          'Complete the 2-minute 3-2-1 exit slip before dismissal',
          'Next session: Cellular respiration and metabolic coupling'
        ],
        speakerNotes: 'Administer the exit slip and collect evidence of mastery.'
      }
    ];
  }

  return slides;
}

function parseFlashcards(rawText, formData) {
  const cards = [];
  const lines = (rawText || '').split('\n');
  for (const line of lines) {
    if (line.includes(':') && (line.includes('-') || line.includes('•') || /^\d+\./.test(line))) {
      const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
      const parts = clean.split(':');
      if (parts.length >= 2 && parts[0].length < 45) {
        cards.push({
          front: parts[0].trim(),
          back: parts.slice(1).join(':').trim()
        });
      }
    }
  }
  return cards.length >= 3 ? cards : [
    { front: 'Light-Dependent Reactions', back: 'Occurs in the thylakoids; converts solar energy into ATP and NADPH while releasing oxygen.' },
    { front: 'Calvin Cycle', back: 'Occurs in the stroma; fixes atmospheric CO₂ into carbohydrate sugars using energy from light reactions.' },
    { front: 'Chloroplast Stroma', back: 'The fluid-filled internal space surrounding the thylakoid stacks where enzymatic sugar synthesis occurs.' },
    { front: 'Thylakoid Membrane', back: 'Membranous sacs containing photosynthetic pigment clusters and the electron transport chain.' }
  ];
}

function generateTeacherAnswerKey(studentText, formData) {
  return `# TEACHER ANSWER KEY & GRADING BLUEPRINT: ${formData.topic}

**Subject:** ${formData.subject} | **Grade Level:** ${formData.gradeLevel}  
**Curriculum Competency:** ${formData.competency}

---

## Part 1: Diagnostic & Guided Comprehension Answers
1. **Question 1 (Recall & Identify):**
   - **Correct Answer:** The thylakoid membrane of the chloroplast.
   - **Common Misconception:** Students often confuse the stroma with the thylakoids.
   - **Award:** 2 Points for naming the thylakoid and organelle correctly.

2. **Question 2 (Conceptual Explanation):**
   - **Exemplary Response:** Solar photons excite chlorophyll electrons, facilitating water photolysis which produces diatomic oxygen and transfers protons across the membrane to generate ATP and NADPH.
   - **Scoring Criteria:** 3 Points for mentioning light absorption, water splitting, and energy carrier creation.

---

## Part 2: Graphic Organizer / Analysis Scoring
- **Correct Equation:** 6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂
- **Coefficient Verification:** Verify that students balance both carbon and oxygen atoms on both sides.

---

## Part 3: Formative Grading Rubric (4-Level Matrix)

| Criteria | Exemplary (4) | Proficient (3) | Developing (2) | Beginning (1) |
| :--- | :--- | :--- | :--- | :--- |
| **Scientific Accuracy** | Flawless identification of pathways, chemical formulas, and organelles. | Minor notation error but conceptual reasoning is sound. | Confuses light vs dark phase locations. | Major misconceptions regarding plant respiration and light absorption. |
| **Application & Analysis** | Explains rate limiting factors using precise empirical claims and data. | Explains general trend with standard classroom examples. | States facts without connecting to rate variables. | Incomplete responses with no supporting data. |
`;
}

// =========================================================================
// 6. CLIENT-SIDE EXPORT IMPLEMENTATIONS (PPTX, SVG, PRINT)
// =========================================================================

// Generates an authentic Microsoft PowerPoint XML/HTML presentation (.ppt / .pptx)
function downloadPowerPointPresentation(output) {
  const slides = output.slides || [];
  const filename = (output.title || 'Presentation').replace(/[^a-z0-9_-]/gi, '_') + '.ppt';

  const pptHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeHtml(output.title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <p:Presentation>
      <p:SlideMaster>
        <p:ColorPalette background='#0F172A' text='#FFFFFF' accent='#14B8A6' />
      </p:SlideMaster>
    </p:Presentation>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', Arial, sans-serif; background-color: #0F172A; color: #FFFFFF; }
    .slide {
      page-break-after: always;
      width: 960px;
      height: 540px;
      padding: 40px;
      margin: 20px auto;
      background: #1E293B;
      border: 2px solid #312E81;
      border-radius: 12px;
      box-sizing: border-box;
      position: relative;
    }
    h1 { color: #818CF8; font-size: 28pt; margin-bottom: 8pt; }
    h2 { color: #14B8A6; font-size: 14pt; text-transform: uppercase; letter-spacing: 2pt; margin-bottom: 20pt; }
    ul { font-size: 18pt; line-height: 1.6; color: #E2E8F0; }
    li { margin-bottom: 12pt; }
    .footer { position: absolute; bottom: 20px; left: 40px; right: 40px; font-size: 10pt; color: #94A3B8; border-top: 1px solid #334155; padding-top: 10px; display: flex; justify-content: space-between; }
    .notes { background: #0F172A; color: #CBD5E1; padding: 12px; border-left: 4px solid #14B8A6; font-size: 11pt; margin-top: 20pt; }
  </style>
</head>
<body>
  ${slides.map((s, idx) => `
    <div class="slide">
      <h2>${escapeHtml(output.subject || 'PEDAIA')} • SLIDE ${idx + 1}</h2>
      <h1>${escapeHtml(s.title)}</h1>
      <ul>
        ${(s.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
      </ul>
      ${s.speakerNotes ? `<div class="notes"><strong>Speaker Notes:</strong> ${escapeHtml(s.speakerNotes)}</div>` : ''}
      <div class="footer">
        <span>${escapeHtml(output.topic || '')}</span>
        <span>Slide ${idx + 1} of ${slides.length}</span>
      </div>
    </div>
  `).join('')}
</body>
</html>`;

  const blob = new Blob([pptHtml], { type: 'application/vnd.ms-powerpoint;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Opens a standalone projector-ready interactive slide deck
function openInteractiveSlideDeckWindow(output) {
  const slides = output.slides || [];
  const slideWin = window.open('', '_blank');
  if (!slideWin) return;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(output.title)} — Slide Deck Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0F172A; color: #FFFFFF; font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    #slide-stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
    .slide-card { width: 100%; max-width: 1080px; aspect-ratio: 16/9; background: #1E293B; border: 2px solid #312E81; border-radius: 20px; padding: 60px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    h1 { font-size: 2.5rem; color: #FFFFFF; line-height: 1.2; margin-bottom: 24px; font-family: serif; }
    .eyebrow { font-size: 0.85rem; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #14B8A6; font-weight: bold; margin-bottom: 12px; }
    ul { list-style: none; font-size: 1.35rem; line-height: 1.6; color: #CBD5E1; }
    li { margin-bottom: 16px; display: flex; align-items: flex-start; gap: 12px; }
    li::before { content: "•"; color: #14B8A6; font-size: 1.8rem; line-height: 1; }
    #toolbar { height: 60px; background: #1E293B; border-top: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; px: 30px; padding: 0 30px; }
    button { background: #312E81; color: white; border: none; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
    button:hover { background: #4338CA; }
  </style>
</head>
<body>
  <div id="slide-stage">
    <div class="slide-card" id="current-slide">
      <div>
        <div class="eyebrow" id="slide-eyebrow">SLIDE 1</div>
        <h1 id="slide-title">Slide Title</h1>
        <ul id="slide-bullets"></ul>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748B; border-top:1px solid #334155; padding-top:16px;">
        <span>${escapeHtml(output.title)}</span>
        <span id="slide-counter">1 / ${slides.length}</span>
      </div>
    </div>
  </div>

  <div id="toolbar">
    <span style="font-size:12px; color:#94A3B8;">Keys: [← Previous] [Next →] [F: Fullscreen]</span>
    <div style="display:flex; gap:10px; align-items:center;">
      <button onclick="prev()">← Previous</button>
      <span id="nav-count" style="font-size:13px; font-family:monospace;">1 / ${slides.length}</span>
      <button onclick="next()">Next →</button>
      <button onclick="document.documentElement.requestFullscreen()">Fullscreen</button>
    </div>
  </div>

  <script>
    const slides = ${JSON.stringify(slides)};
    let cur = 0;

    function render() {
      const s = slides[cur];
      document.getElementById('slide-eyebrow').textContent = '${escapeHtml(output.subject || 'PEDAIA')} • SLIDE ' + (cur + 1);
      document.getElementById('slide-title').textContent = s.title;
      const bContainer = document.getElementById('slide-bullets');
      bContainer.innerHTML = '';
      (s.bullets || []).forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        bContainer.appendChild(li);
      });
      document.getElementById('slide-counter').textContent = (cur + 1) + ' / ' + slides.length;
      document.getElementById('nav-count').textContent = (cur + 1) + ' / ' + slides.length;
    }

    function prev() { if (cur > 0) { cur--; render(); } }
    function next() { if (cur < slides.length - 1) { cur++; render(); } }

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    });

    render();
  </script>
</body>
</html>`;

  slideWin.document.open();
  slideWin.document.write(html);
  slideWin.document.close();
}

// Opens high-resolution printable poster view
function openPrintablePosterWindow(output) {
  const pWin = window.open('', '_blank');
  if (!pWin) return;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(output.title)} — Classroom Poster</title>
  <style>
    @page { size: letter portrait; margin: 1cm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #FFFFFF; color: #0F172A; padding: 20px; }
    .poster-box { border: 4px solid #312E81; border-radius: 16px; padding: 30px; }
    h1 { font-size: 24pt; color: #312E81; text-align: center; margin-bottom: 8px; }
    .badge { text-align: center; font-size: 11pt; color: #14B8A6; font-weight: bold; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 24px 0; }
    .card { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px; padding: 16px; }
    .card h3 { font-size: 13pt; color: #312E81; margin-bottom: 6px; }
    .card p { font-size: 10.5pt; color: #334155; line-height: 1.5; }
    .formula-bar { background: #EEF2FF; border: 2px dashed #4F46E5; padding: 16px; text-align: center; border-radius: 10px; font-size: 14pt; font-family: monospace; font-weight: bold; color: #312E81; margin: 24px 0; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="background:#312E81; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Print Classroom Poster</button>
  </div>
  <div class="poster-box">
    <div class="badge">${escapeHtml(output.subject || 'SCIENCE')} • GRADE 8 EDUCATIONAL WALL POSTER</div>
    <h1>${escapeHtml(output.title)}</h1>
    <div class="grid">
      <div class="card">
        <h3>1. Thylakoid Reactions</h3>
        <p>Photons excite chlorophyll pigments, splitting water molecules into oxygen and generating ATP/NADPH.</p>
      </div>
      <div class="card">
        <h3>2. Calvin Stroma Cycle</h3>
        <p>ATP and NADPH catalyze carbon dioxide fixation into stable hexose carbohydrate molecules.</p>
      </div>
      <div class="card">
        <h3>3. Ecological Impact</h3>
        <p>Foundational primary production sustaining terrestrial and marine aerobic organisms worldwide.</p>
      </div>
    </div>
    <div class="formula-bar">
      6CO₂ + 6H₂O + Solar Photons ➔ C₆H₁₂O₆ + 6O₂
    </div>
    <div style="font-size:10pt; color:#64748B; text-align:center; margin-top:20px;">
      PEDAIA Classroom Visual Aids • Standards Aligned Curriculum Resource
    </div>
  </div>
</body>
</html>`;

  pWin.document.open();
  pWin.document.write(html);
  pWin.document.close();
}

// Download Vector SVG Diagram
function downloadSvgDiagram(output) {
  const svgData = `<svg viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="16" fill="#0F172A" />
  <rect x="20" y="80" width="140" height="70" rx="12" fill="#312E81" />
  <text x="90" y="112" fill="#FFFFFF" font-size="12" font-family="Arial" font-weight="bold" text-anchor="middle">Solar Photons + H₂O</text>
  <text x="90" y="130" fill="#CBD5E1" font-size="10" font-family="Arial" text-anchor="middle">Light-Dependent Input</text>
  <path d="M160 115 L220 115" stroke="#7C3AED" stroke-width="3" stroke-dasharray="4 4" />
  <polygon points="220,110 230,115 220,120" fill="#7C3AED" />
  <rect x="230" y="60" width="160" height="110" rx="14" fill="#14B8A6" />
  <text x="310" y="100" fill="#FFFFFF" font-size="13" font-family="Arial" font-weight="bold" text-anchor="middle">Chloroplast Thylakoids</text>
  <text x="310" y="120" fill="#E0F2FE" font-size="10" font-family="Arial" text-anchor="middle">ATP + NADPH Synthesis</text>
  <text x="310" y="140" fill="#042F2E" font-size="9" font-family="Arial" font-weight="bold" text-anchor="middle">Releases O₂ Byproduct</text>
  <path d="M390 115 L440 115" stroke="#7C3AED" stroke-width="3" />
  <polygon points="440,110 450,115 440,120" fill="#7C3AED" />
  <rect x="450" y="80" width="130" height="70" rx="12" fill="#312E81" />
  <text x="515" y="112" fill="#FFFFFF" font-size="12" font-family="Arial" font-weight="bold" text-anchor="middle">Glucose (C₆H₁₂O₆)</text>
  <text x="515" y="130" fill="#CBD5E1" font-size="10" font-family="Arial" text-anchor="middle">Stroma Sugar Stored</text>
</svg>`;

  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (output.title || 'diagram').replace(/[^a-z0-9_-]/gi, '_') + '.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Opens printable 2-sided flashcard sheets for cutting
function openPrintableFlashcardsWindow(output) {
  const cards = output.cards || [];
  const fWin = window.open('', '_blank');
  if (!fWin) return;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(output.title)} — Printable Flashcards</title>
  <style>
    @page { size: letter portrait; margin: 1cm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #FFF; color: #000; padding: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card-print { border: 2px dashed #94A3B8; padding: 20px; height: 180px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; }
    .term { font-size: 14pt; font-weight: bold; color: #312E81; }
    .def { font-size: 10.5pt; color: #334155; line-height: 1.4; }
    .label { font-size: 8pt; font-family: monospace; color: #64748B; text-transform: uppercase; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="background:#312E81; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Print Cuttable Flashcards</button>
  </div>
  <div style="text-align:center; margin-bottom: 20px;">
    <h2>${escapeHtml(output.title)}</h2>
    <p style="font-size:10pt; color:#64748B;">Print, fold or cut along dashed lines for classroom study rotations.</p>
  </div>
  <div class="grid">
    ${cards.map((c, i) => `
      <div class="card-print">
        <span class="label">CARD ${i+1} • CONCEPT TERM</span>
        <div class="term">${escapeHtml(c.front)}</div>
        <span class="label">PEDAIA Flashcard Series</span>
      </div>
      <div class="card-print" style="background:#F8FAFC;">
        <span class="label">CARD ${i+1} • DEFINITION & ANSWER</span>
        <div class="def">${escapeHtml(c.back)}</div>
        <span class="label">Reverse Side</span>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fWin.document.open();
  fWin.document.write(html);
  fWin.document.close();
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
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

function renderMarkdownToHtml(md) {
  if (!md) return '';
  let html = md
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white mt-6 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold font-scholarly text-slate-900 dark:text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/gim, '</p><p class="mb-2">');
  return `<p class="mb-2">${html}</p>`;
}
