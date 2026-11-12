// PEDAIA Professional Instructional Design Atelier Dashboard View
import { store } from '../state.js';
import { openUniversalExportModal } from '../exportUtils.js';
import { openAuthModal } from './authModal.js';
import { openShareLinkModal } from './shareLinkModal.js';

export function renderDashboardView() {
  const designs = store.getDesigns();
  const templates = store.getTemplates();
  const outputs = store.getOutputs ? store.getOutputs() : [];
  const recentDesigns = designs.slice(0, 6);
  const recentOutputs = outputs.slice(0, 4);
  const featuredTemplates = templates.slice(0, 4);
  const user = store.getCurrentUser();
  const isAuthenticated = store.isAuthenticated();
  const isM1n1sumeUninitialized = !store.isM1n1sumeInitialized();

  // The most recent design to continue working on
  const mostRecentDesign = designs.length > 0 ? designs[0] : null;

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      
      <!-- =================================================================== -->
      <!-- USER AUTHENTICATION & ACCESS BARRIER / BANNER                       -->
      <!-- =================================================================== -->
      ${!isAuthenticated ? `
        <div class="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              🔐
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Account Access & Security</span>
              </div>
              <p class="text-[11.5px] text-slate-600 dark:text-slate-400 mt-0.5">
                Create an account or log in to save your personal pedagogical folios, AI outputs, and studio materials.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button id="dashboard-login-btn" class="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer">
              Log In
            </button>
            <button id="dashboard-signup-btn" class="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer">
              Create Account
            </button>
          </div>
        </div>
      ` : `
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full ${user.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
            <span class="text-slate-600 dark:text-slate-300">Logged in as <strong class="font-mono text-slate-900 dark:text-white">${user.username}</strong> (${user.role === 'admin' ? 'System Administrator' : 'Educator Workspace'})</span>
          </div>
          <div class="flex items-center gap-2">
            ${user.role === 'admin' ? `
              <button data-action="nav" data-dest="admin" class="px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-lg cursor-pointer">
                👑 Admin Console
              </button>
            ` : ''}
            <button id="dashboard-switch-account-btn" class="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer">
              Switch Account
            </button>
          </div>
        </div>
      `}
      
      <!-- =================================================================== -->
      <!-- 1. CREATE INSTRUCTIONAL DESIGN (Primary Hero & Quick-Start Hub)     -->
      <!-- =================================================================== -->
      <section class="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 sm:p-8 shadow-sm transition-colors">
        
        <!-- Subtle Scholarly Background Texture -->
        <div class="absolute right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.06] pointer-events-none select-none hidden lg:block">
          <svg width="280" height="280" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zM3.45 10.55L12 14.5l8.55-3.95L12 6.55 3.45 10.55zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
        </div>

        <div class="relative z-10 max-w-4xl">
          <div class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-mono uppercase tracking-wider text-[11px]">Instructional Design Studio</span>
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Standards-Aligned • Multi-Engine AI Gateway</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold font-scholarly text-slate-900 dark:text-white tracking-tight leading-snug mb-2">
            Create Purpose-Driven Instructional Designs
          </h1>

          <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-6 max-w-3xl">
            Translate pedagogical goals into publication-ready lesson plans, active learning experiences, Bloom's cognitive question banks, and Tomlinson-model differentiation tiers.
          </p>

          <!-- Create Quick-Launch Studio Buttons -->
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Launch Instructional Studio:
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              
              <button id="quick-launch-lp-btn" class="flex flex-col items-start p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 text-left transition-all group">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">📖</span>
                  <span class="text-xs font-bold text-indigo-900 dark:text-indigo-200 group-hover:text-indigo-700 dark:group-hover:text-white">Lesson Planner</span>
                </div>
                <span class="text-[11.5px] text-slate-600 dark:text-slate-400 leading-tight">5E, UbD, 4A's, Direct</span>
              </button>

              <button id="quick-launch-act-btn" class="flex flex-col items-start p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/80 text-left transition-all group">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">🔬</span>
                  <span class="text-xs font-bold text-teal-900 dark:text-teal-200 group-hover:text-teal-700 dark:group-hover:text-white">Activity Designer</span>
                </div>
                <span class="text-[11.5px] text-slate-600 dark:text-slate-400 leading-tight">Labs, Socratic, Sims</span>
              </button>

              <button id="quick-launch-quest-btn" class="flex flex-col items-start p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/80 text-left transition-all group">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">💡</span>
                  <span class="text-xs font-bold text-amber-900 dark:text-amber-200 group-hover:text-amber-700 dark:group-hover:text-white">Question Studio</span>
                </div>
                <span class="text-[11.5px] text-slate-600 dark:text-slate-400 leading-tight">Bloom's Matrix & Distractors</span>
              </button>

              <button id="quick-launch-diff-btn" class="flex flex-col items-start p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-800/80 text-left transition-all group">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">⚖️</span>
                  <span class="text-xs font-bold text-purple-900 dark:text-purple-200 group-hover:text-purple-700 dark:group-hover:text-white">Differentiation</span>
                </div>
                <span class="text-[11.5px] text-slate-600 dark:text-slate-400 leading-tight">Tiered Scaffolding & ELL</span>
              </button>

              <button id="quick-launch-output-btn" class="flex flex-col items-start p-3 rounded-xl bg-violet-50/80 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-200/80 dark:border-violet-800/80 text-left transition-all group">
                <div class="flex items-center gap-1.5 mb-1 w-full">
                  <span class="text-lg">🎨</span>
                  <span class="text-xs font-bold text-violet-900 dark:text-violet-200 group-hover:text-violet-700 dark:group-hover:text-white">AI Output Studio</span>
                  <span class="ml-auto px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-600 text-white uppercase">New</span>
                </div>
                <span class="text-[11.5px] text-slate-600 dark:text-slate-400 leading-tight">Slides, Posters, Cards</span>
              </button>

            </div>

            <!-- Dedicated Output Studio Hero Callout -->
            <div class="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 border border-indigo-200/80 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">🎨</span>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-indigo-950 dark:text-white">AI Output Studio</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-600 text-white uppercase">Dedicated</span>
                  </div>
                  <span class="text-[11.5px] text-slate-600 dark:text-slate-300">Generate PowerPoint presentations, classroom posters, worksheets, flashcards & diagrams</span>
                </div>
              </div>
              <button data-action="nav" data-dest="ai-output-studio" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0 shadow-2xs flex items-center gap-1.5">
                <span>Launch Output Studio →</span>
              </button>
            </div>
          </div>

        </div>

      </section>

      <!-- =================================================================== -->
      <!-- 2. CONTINUE WORKING (Active / In-Progress Design)                   -->
      <!-- =================================================================== -->
      ${mostRecentDesign ? `
        <section class="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                ⏱️
              </div>
              <div>
                <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Continue Working</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Resume your most recently modified instructional design dossier</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">Last touched: ${formatDate(mostRecentDesign.updatedAt || mostRecentDesign.createdAt)}</span>
              <button id="view-all-designs-header-btn" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                All Designs (${designs.length}) →
              </button>
            </div>
          </div>

          <div class="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1.5 max-w-2xl">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full border ${getCategoryPillStyle(mostRecentDesign.category)}">
                  ${escapeHtml(mostRecentDesign.categoryLabel || mostRecentDesign.category)}
                </span>
                ${renderStatusPill(mostRecentDesign.status, mostRecentDesign.rubricScore)}
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${mostRecentDesign.visibility === 'public' || mostRecentDesign.isPublic ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/30'}">${mostRecentDesign.visibility === 'public' || mostRecentDesign.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">• ${escapeHtml(mostRecentDesign.subject || 'General')}</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">• ${escapeHtml(mostRecentDesign.educationalLevel || '')}</span>
              </div>
              
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors" id="recent-active-title" data-design-id="${mostRecentDesign.id}">
                ${escapeHtml(mostRecentDesign.title)}
              </h3>

              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                ${escapeHtml((mostRecentDesign.output || mostRecentDesign.generatedOutput || mostRecentDesign.promptText || 'No content generated yet.').slice(0, 220) + '...')}
              </p>
            </div>

            <div class="flex items-center gap-2.5 shrink-0">
              <button class="open-workspace-btn px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5" data-design-id="${mostRecentDesign.id}">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span>Resume Design Studio</span>
              </button>

              <button class="quick-export-recent-btn px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl transition-colors border border-slate-200 dark:border-slate-700" data-design-id="${mostRecentDesign.id}" title="Export Document">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              <button class="quick-share-recent-btn px-3 py-2 text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 rounded-xl transition-colors border border-violet-200 dark:border-violet-800 cursor-pointer shadow-2xs flex items-center gap-1.5" data-design-id="${mostRecentDesign.id}" title="Share Direct Link">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </section>
      ` : `
        <section class="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm text-center">
          <div class="max-w-md mx-auto space-y-2 py-4">
            <span class="text-3xl">📝</span>
            <h3 class="text-base font-bold text-slate-800 dark:text-white">Start Your First Curriculum Dossier</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Choose one of the specialized instructional studios above to generate your first standards-aligned plan.</p>
          </div>
        </section>
      `}

      <!-- =================================================================== -->
      <!-- 3. RECENT CURRICULAR DESIGNS (Dossiers List with Real Status)       -->
      <!-- =================================================================== -->
      <section class="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm transition-colors">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Recent Curricular Dossiers</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Your instructional designs with verified application lifecycle states</p>
          </div>
          <button id="view-all-designs-btn" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>View All (${designs.length})</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          ${recentDesigns.length === 0 ? `
            <div class="py-10 text-center">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-2.5">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No Instructional Designs Yet</p>
              <p class="text-[11.5px] text-slate-500 dark:text-slate-400">Launch any studio above to design and save your first curriculum artifact.</p>
            </div>
          ` : recentDesigns.map(d => `
            <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryPillStyle(d.category)}">
                    ${escapeHtml(d.categoryLabel || d.category)}
                  </span>
                  ${renderStatusPill(d.status, d.rubricScore)}
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.visibility === 'public' || d.isPublic ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20'}">${d.visibility === 'public' || d.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">• ${escapeHtml(d.subject || 'General')}</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">• ${escapeHtml(d.educationalLevel || '')}</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer recent-design-title" data-design-id="${d.id}">
                  ${escapeHtml(d.title)}
                </h3>
              </div>

              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span class="text-xs text-slate-400 dark:text-slate-500 hidden md:inline">
                  ${formatDate(d.updatedAt || d.createdAt)}
                </span>
                
                <button class="open-workspace-btn px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1" data-design-id="${d.id}">
                  <span>Open</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button class="quick-export-btn p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-design-id="${d.id}" title="Export">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- 4. INSTRUCTIONAL DESIGN & OUTPUT STUDIOS (Detailed Modules)         -->
      <!-- =================================================================== -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white uppercase tracking-tight">Instructional Design & Output Studios</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Specialized ateliers engineered for targeted pedagogical planning and tangible educational deliverables</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          <!-- Studio 1: Lesson Planner -->
          <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-5 shadow-2xs hover:border-indigo-400 transition-all flex flex-col justify-between group">
            <div>
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span class="text-[11px] font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold tracking-wider">Module I</span>
              <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white mt-0.5 mb-1.5">AI Lesson Planner</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Dynamic sequence mapping for 5E, 4A's, UbD, and Direct Instruction with reorderable components and teacher scripts.
              </p>
            </div>
            <button data-action="nav" data-dest="lesson-planning" class="w-full py-2 px-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              <span>Open Lesson Studio</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Studio 2: Activity Designer -->
          <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-5 shadow-2xs hover:border-teal-400 transition-all flex flex-col justify-between group">
            <div>
              <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span class="text-[11px] font-mono uppercase text-teal-600 dark:text-teal-400 font-bold tracking-wider">Module II</span>
              <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white mt-0.5 mb-1.5">AI Activity Designer</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Active learning dynamics with teacher facilitation scripts, materials checklists, prep timelines, rubrics, and safety protocols.
              </p>
            </div>
            <button data-action="nav" data-dest="activity-design" class="w-full py-2 px-3 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              <span>Open Activity Studio</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Studio 3: Questioning Studio -->
          <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-5 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between group">
            <div>
              <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-[11px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold tracking-wider">Module III</span>
              <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white mt-0.5 mb-1.5">AI Questioning Studio</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Precise Bloom's Distribution Builder across 6 cognitive levels, auto-balance, diagnostic distractors, and answer keys.
              </p>
            </div>
            <button data-action="nav" data-dest="questioning" class="w-full py-2 px-3 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              <span>Open Question Studio</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Studio 4: Differentiation Studio -->
          <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-5 shadow-2xs hover:border-purple-400 transition-all flex flex-col justify-between group">
            <div>
              <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <span class="text-[11px] font-mono uppercase text-purple-600 dark:text-purple-400 font-bold tracking-wider">Module IV</span>
              <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white mt-0.5 mb-1.5">Differentiation Studio</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Custom non-PII learner pods, shared essential objectives, tiered activity scaffolds, and before-and-after comparisons.
              </p>
            </div>
            <button data-action="nav" data-dest="differentiation" class="w-full py-2 px-3 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              <span>Open Differentiation</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Studio 5: AI Output Studio -->
          <div class="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-750 p-5 shadow-2xs hover:border-violet-400 dark:hover:border-violet-500 transition-all flex flex-col justify-between group">
            <div>
              <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-3 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[11px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold tracking-wider">Module V</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-600 text-white uppercase">New</span>
              </div>
              <h3 class="text-base font-bold font-scholarly text-slate-900 dark:text-white mt-0.5 mb-1.5">AI Output Studio</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Generate production-ready educational deliverables: PowerPoint decks, classroom posters, worksheets, flashcards, concept maps & rubrics.
              </p>
            </div>
            <button data-action="nav" data-dest="ai-output-studio" class="w-full py-2 px-3 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              <span>Open Output Studio</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

        </div>
      </section>

      <!-- =================================================================== -->
      <!-- RECENT EDUCATIONAL DELIVERABLES (AI Outputs if any exist)            -->
      <!-- =================================================================== -->
      ${recentOutputs.length > 0 ? `
        <section class="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm transition-colors">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🎨</span>
              <div>
                <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Recent Educational Deliverables</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Classroom-ready outputs generated in AI Output Studio</p>
              </div>
            </div>
            <button id="view-all-outputs-btn" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>Output Studio (${outputs.length})</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
            ${recentOutputs.map(out => `
              <div class="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/40 hover:border-violet-400 dark:hover:border-violet-600 transition-all flex flex-col justify-between group cursor-pointer recent-output-card" data-output-id="${out.id}">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                      ${escapeHtml(out.subTypeName || out.subType || out.categoryName || 'Deliverable')}
                    </span>
                    <span class="text-[10.5px] text-slate-400">${formatDate(out.updatedAt || out.createdAt)}</span>
                  </div>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    ${escapeHtml(out.title || 'Untitled Output')}
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    ${escapeHtml(out.topic || out.prompt || 'Ready for classroom use')}
                  </p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span class="text-[10px] text-slate-400 font-mono uppercase">${escapeHtml(out.subject || 'Curriculum')}</span>
                  <span class="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open in Studio →
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- =================================================================== -->
      <!-- 5. RECOMMENDED PROMPT TEMPLATES (Curated Repertoire)                -->
      <!-- =================================================================== -->
      <section class="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 p-6 shadow-sm transition-colors">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="text-base font-bold font-scholarly text-slate-900 dark:text-white">Recommended Prompt Templates</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Pre-configured pedagogical templates that populate studio settings directly</p>
          </div>
          <button id="view-all-templates-btn" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>Browse Library (${templates.length})</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          ${featuredTemplates.map(t => `
            <div class="p-4 rounded-xl border border-slate-200/90 dark:border-slate-750 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/40 transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryPillStyle(t.categoryKey || t.category)}">
                    ${escapeHtml(t.category)}
                  </span>
                  <span class="text-[11px] text-slate-400 truncate max-w-[100px]">${escapeHtml(t.subjectApplicability || t.subject)}</span>
                </div>
                <h3 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 leading-snug">
                  ${escapeHtml(t.title)}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  ${escapeHtml(t.description)}
                </p>
              </div>

              <button class="load-template-direct-btn w-full py-1.5 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5" data-template-id="${t.id}">
                <span>Load into Studio</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      </section>

    </div>
  `;
}

function renderStatusPill(status, rubricScore) {
  switch (status) {
    case 'Draft':
      return `<span class="status-pill-draft inline-flex items-center gap-1"><svg class="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg><span>Draft • WIP Locked</span></span>`;
    case 'Prompt Saved':
      return `<span class="status-pill-prompt-saved inline-flex items-center gap-1"><svg class="w-2.5 h-2.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg><span>Prompt Saved • WIP Locked</span></span>`;
    case 'Output Generated':
      return `<span class="status-pill-output-generated inline-flex items-center gap-1"><svg class="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg><span>Output Ready • WIP Locked</span></span>`;
    case 'Reviewed':
      return `<span class="status-pill-reviewed inline-flex items-center gap-1"><svg class="w-2.5 h-2.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg><span>Reviewed ${rubricScore ? `(${rubricScore}/7)` : ''} • WIP Locked</span></span>`;
    case 'Completed':
      return `<span class="status-pill-completed inline-flex items-center gap-1"><svg class="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>✓ Completed • Unlocked</span></span>`;
    default:
      return `<span class="status-pill-draft inline-flex items-center gap-1"><svg class="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg><span>${escapeHtml(status || 'Draft')} • WIP Locked</span></span>`;
  }
}

function getCategoryPillStyle(cat) {
  switch (cat) {
    case 'lesson-planning':
    case 'Lesson Planning':
      return 'category-pill-lp';
    case 'activity-design':
    case 'Activity Design':
      return 'category-pill-ad';
    case 'questioning':
    case 'Questioning':
      return 'category-pill-q';
    case 'differentiation':
    case 'Differentiation':
      return 'category-pill-diff';
    case 'assessment-design':
    case 'Assessment Design':
      return 'category-pill-assessment';
    case 'classroom-management':
    case 'Classroom Management':
      return 'category-pill-classroom';
    default:
      return 'category-pill-default';
  }
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
    .replace(/"/g, '&quot;');
}

export function setupDashboardListeners(container, navigateTo, showToast = null) {
  // Authentication Actions
  container.querySelector('#dashboard-login-btn')?.addEventListener('click', () => {
    openAuthModal({ defaultTab: 'login', showToast, onSuccess: () => navigateTo('dashboard') });
  });
  container.querySelector('#dashboard-signup-btn')?.addEventListener('click', () => {
    openAuthModal({ defaultTab: 'signup', showToast, onSuccess: () => navigateTo('dashboard') });
  });
  container.querySelector('#dashboard-switch-account-btn')?.addEventListener('click', () => {
    openAuthModal({ showToast, onSuccess: () => navigateTo('dashboard') });
  });

  // Quick Launch Studio Buttons in Hero
  container.querySelector('#quick-launch-lp-btn')?.addEventListener('click', () => navigateTo('lesson-planning'));
  container.querySelector('#quick-launch-act-btn')?.addEventListener('click', () => navigateTo('activity-design'));
  container.querySelector('#quick-launch-quest-btn')?.addEventListener('click', () => navigateTo('questioning'));
  container.querySelector('#quick-launch-diff-btn')?.addEventListener('click', () => navigateTo('differentiation'));
  container.querySelector('#quick-launch-output-btn')?.addEventListener('click', () => navigateTo('ai-output-studio'));

  // View All buttons
  container.querySelector('#view-all-designs-header-btn')?.addEventListener('click', () => navigateTo('designs'));
  container.querySelector('#view-all-designs-btn')?.addEventListener('click', () => navigateTo('designs'));
  container.querySelector('#view-all-templates-btn')?.addEventListener('click', () => navigateTo('prompt-library'));
  container.querySelector('#view-all-outputs-btn')?.addEventListener('click', () => navigateTo('ai-output-studio'));

  // Recent AI Output cards
  container.querySelectorAll('.recent-output-card').forEach(card => {
    card.addEventListener('click', () => {
      const outputId = card.getAttribute('data-output-id');
      navigateTo('ai-output-studio', outputId);
    });
  });

  // Studio module cards
  container.querySelectorAll('[data-action="nav"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.getAttribute('data-dest');
      if (dest) navigateTo(dest);
    });
  });

  // Recent Designs Click / Resume Button
  container.querySelectorAll('.open-workspace-btn, .recent-design-title, #recent-active-title').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-design-id');
      if (id) {
        const design = store.getDesignById(id);
        if (design && design.category) {
          // Route to the appropriate studio or workspace
          navigateTo('workspace', id);
        } else {
          navigateTo('workspace', id);
        }
      }
    });
  });

  // Quick Export recent design
  container.querySelectorAll('.quick-export-recent-btn, .quick-export-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-design-id');
      const design = store.getDesignById(id);
      if (design) {
        openUniversalExportModal(design, { showToast: showToast || (() => {}) });
      }
    });
  });

  // Quick Share recent design
  container.querySelectorAll('.quick-share-recent-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-design-id');
      const design = store.getDesignById(id);
      if (design) {
        openShareLinkModal({ item: design, type: 'design', showToast });
      }
    });
  });

  // Load Template direct button
  container.querySelectorAll('.load-template-direct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.getAttribute('data-template-id');
      const template = store.getTemplates().find(t => t.id === templateId);
      if (!template) return;

      const cfg = template.defaultConfig || {};
      const catKey = template.categoryKey || '';
      const cat = template.category || '';

      if (catKey === 'lesson-planning' || cat === 'Lesson Planning') {
        store.setLessonPlannerState({
          subject: cfg.subject || 'General Education',
          educationalLevel: cfg.educationalLevel || 'Senior High School',
          gradeLevel: cfg.gradeLevel || 'Grade 11',
          topic: cfg.topic || template.title,
          competency: cfg.competency || template.description,
          framework: cfg.framework || '5E Model',
          duration: cfg.duration || '60 Minutes',
          depthLevel: cfg.depthLevel || 'Moderate',
          pedagogicalEmphasis: cfg.pedagogicalEmphasis || 'Inquiry-Based Learning',
          promptText: template.promptText || ''
        });
        if (showToast) showToast(`Loaded "${template.title}" into Lesson Planner`, 'success');
        navigateTo('lesson-planning');
      } else if (catKey === 'activity-design' || cat === 'Activity Design') {
        store.setActivityDesignerState({
          subject: cfg.subject || 'General Education',
          educationalLevel: cfg.educationalLevel || 'Senior High School',
          gradeLevel: cfg.gradeLevel || 'Grade 11',
          topic: cfg.topic || template.title,
          competency: cfg.competency || template.description,
          activityType: cfg.activityType || 'Collaborative Learning',
          groupingStructure: cfg.groupingStructure || 'Small Groups',
          duration: cfg.duration || '45 Minutes',
          difficultyLevel: cfg.difficultyLevel || 'Moderate',
          promptText: template.promptText || ''
        });
        if (showToast) showToast(`Loaded "${template.title}" into Activity Designer`, 'success');
        navigateTo('activity-design');
      } else if (catKey === 'questioning' || cat === 'Questioning') {
        store.setQuestioningStudioState({
          subject: cfg.subject || 'General Education',
          educationalLevel: cfg.educationalLevel || 'Senior High School',
          gradeLevel: cfg.gradeLevel || 'Grade 11',
          topic: cfg.topic || template.title,
          competency: cfg.competency || template.description,
          questionCount: cfg.questionCount || 6,
          includeAnswerKey: true,
          includeDistractors: true,
          promptText: template.promptText || ''
        });
        if (showToast) showToast(`Loaded "${template.title}" into Questioning Studio`, 'success');
        navigateTo('questioning');
      } else if (catKey === 'differentiation' || cat === 'Differentiation') {
        store.setDifferentiationStudioState({
          subject: cfg.subject || 'General Education',
          educationalLevel: cfg.educationalLevel || 'Senior High School',
          gradeLevel: cfg.gradeLevel || 'Grade 11',
          topic: cfg.topic || template.title,
          competency: cfg.competency || template.description,
          differentiationBasis: cfg.differentiationBasis || 'Readiness Level',
          promptText: template.promptText || ''
        });
        if (showToast) showToast(`Loaded "${template.title}" into Differentiation Studio`, 'success');
        navigateTo('differentiation');
      } else {
        store.setLessonPlannerState({
          topic: template.title,
          promptText: template.promptText || ''
        });
        navigateTo('lesson-planning');
      }
    });
  });
}
