import fs from 'node:fs';
import path from 'node:path';

const indexPath = path.join(process.cwd(), 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const startTag = '  <header id="top-masthead"';
const endTag = '        <!-- Mobile Drawer Toggle -->';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate start or end tag in public/index.html');
  process.exit(1);
}

const newHeaderContent = `  <header id="top-masthead" class="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/80 transition-colors shadow-2xs overflow-x-auto scrollbar-none">
    
    <div class="masthead-inner w-full max-w-full px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
      
      <!-- Left: Brand Logo & Quick Search -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <div class="flex items-center gap-2.5 cursor-pointer select-none group" id="brand-logo-btn" title="PEDAIA Design Studio">
          <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-xs border border-indigo-100 dark:border-indigo-900/60 group-hover:scale-105 transition-transform">
            <img src="./favicon.svg" alt="PEDAIA" class="w-full h-full object-cover">
          </div>
          <div class="flex flex-col">
            <span class="text-base sm:text-lg font-bold font-scholarly tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-none">
              PEDAIA
            </span>
            <span class="text-[9px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold leading-none mt-0.5 hidden 2xl:inline">
              Studio
            </span>
          </div>
        </div>

        <div class="h-5 w-px bg-slate-200 dark:bg-slate-700/80 hidden sm:block"></div>

        <!-- Command Palette Trigger (Clean, Compact & Spacious) -->
        <button id="header-command-palette-btn" class="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700/90 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 text-xs transition-all shadow-2xs group cursor-pointer" title="Studio Command Palette (Ctrl+K)">
          <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors hidden xl:inline">Search...</span>
          <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 shadow-2xs">Ctrl K</kbd>
        </button>
      </div>

      <!-- Center: Atelier Studio Switcher (Unified with Home, spacious & responsive) -->
      <nav class="hidden lg:flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-xs font-semibold shrink min-w-0 gap-1" id="header-studio-switcher" aria-label="Instructional Studios">
        <button data-nav="dashboard" class="nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-all whitespace-nowrap cursor-pointer" title="Instructional Design Studio Dashboard">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </button>

        <button data-nav="lesson-planning" class="nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-all whitespace-nowrap cursor-pointer" title="Lesson Planner (5E, UbD, 4A's, Direct Instruction)">
          <span class="text-xs">📖</span>
          <span>Planner</span>
        </button>

        <button data-nav="activity-design" class="nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-all whitespace-nowrap cursor-pointer" title="Activity Designer (Experiential Labs & Problem-Solving Tasks)">
          <span class="text-xs">🔬</span>
          <span>Activity</span>
        </button>

        <button data-nav="questioning" class="nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-all whitespace-nowrap cursor-pointer" title="Questioning Studio (Bloom's Taxonomy Cognitive Matrix)">
          <span class="text-xs">💡</span>
          <span>Questions</span>
        </button>

        <button data-nav="differentiation" class="nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-all whitespace-nowrap cursor-pointer" title="Differentiation Studio (Tiered Scaffolding & Learner Profiles)">
          <span class="text-xs">⚖️</span>
          <span class="hidden xl:inline">Differentiation</span>
          <span class="xl:hidden">Diff</span>
        </button>

        <!-- AI Output Studio with Dedicated Wrapper -->
        <div id="header-output-studio-wrapper" class="flex items-center">
          <button data-nav="ai-output-studio" id="nav-ai-output-studio" class="nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-violet-700 dark:text-violet-300 hover:text-violet-900 dark:hover:text-white hover:bg-violet-100/50 dark:hover:bg-violet-900/40 transition-all font-bold cursor-pointer whitespace-nowrap" title="AI Output Studio — Generate PowerPoint, Posters, Worksheets, Flashcards & Diagrams">
            <span class="text-xs">🎨</span>
            <span>AI Output</span>
            <span class="px-1.5 py-0.5 rounded-full text-[8.5px] font-mono bg-violet-600 text-white uppercase font-bold tracking-wider leading-none shadow-2xs">New</span>
          </button>
        </div>

        <!-- Admin Only Tab (Strictly visible only when authenticated as Administrator) -->
        <button data-nav="admin" id="nav-admin-tab" class="hidden nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-all font-bold cursor-pointer whitespace-nowrap" title="Admin Console & Activity Telemetry">
          <span class="text-xs">👑</span>
          <span>Admin</span>
        </button>
      </nav>

      <!-- Right: Work Assets, AI Status, Utility Dock & Auth Actions -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <!-- Work Assets Sub-group: Designs, Library, Import -->
        <div class="flex items-center gap-1">
          <button data-nav="designs" class="nav-item hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer" title="My Instructional Designs">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span>Designs</span>
          </button>

          <button data-nav="prompt-library" class="nav-item hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer" title="Prompt Library">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span>Library</span>
          </button>

          <!-- Universal File Hub Button (Import / Export) -->
          <button id="header-file-hub-btn" class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-2xs cursor-pointer" title="Universal File Hub: Import or Export any file type">
            <svg class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="hidden 2xl:inline">Import</span>
          </button>
        </div>

        <div class="h-5 w-px bg-slate-200 dark:bg-slate-700/80 hidden sm:block"></div>

        <!-- Live AI Status Pill & Switcher -->
        <button id="header-api-status-btn" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-750 transition-colors shadow-2xs shrink-0 cursor-pointer" title="Click to Switch AI Engine">
          <span class="w-2 h-2 rounded-full bg-slate-300 shrink-0" id="header-api-status-dot"></span>
          <span class="text-slate-700 dark:text-slate-200 font-semibold text-xs leading-none" id="header-api-status-text">AI</span>
        </button>

        <div class="h-5 w-px bg-slate-200 dark:bg-slate-700/80 hidden md:block"></div>

        <!-- Grouped Utility Controls Dock (Theme, Fit, Ext, Settings) -->
        <div id="header-utility-dock" class="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 gap-1 shadow-2xs">
          <!-- Appearance Switcher (Light / Dark / System) -->
          <button id="header-palette-btn" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Appearance Settings (Light / Dark / System)">
            <span class="w-2.5 h-2.5 rounded-full ring-2 ring-black/10 dark:ring-white/20 shrink-0 bg-indigo-600 dark:bg-indigo-400" id="header-palette-dot"></span>
            <span class="hidden" id="header-palette-name">System</span>
          </button>

          <!-- Screen Fit & Device Layout Button -->
          <div class="relative shrink-0 hidden md:block" id="header-screen-fit-wrapper">
            <button id="header-screen-fit-btn" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="Adjust website layout for your device (Left-aligned, Auto-fit, or Compact)">
              <svg class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="hidden" id="header-screen-fit-label">Auto-Fit</span>
            </button>
          </div>

          <!-- Browser Extension Button -->
          <button id="header-extension-btn" class="hidden 2xl:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer" title="PEDAIA Browser Extension (Chrome, Edge, Firefox, Brave, Opera)">
            <span class="text-xs">🧩</span>
          </button>

          <!-- Studio Settings Button -->
          <button id="header-settings-btn" data-nav="settings" data-tab="ai-providers" class="nav-item w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer" title="Studio Settings & AI Catalog">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div class="h-5 w-px bg-slate-200 dark:bg-slate-700/80"></div>

        <!-- Unauthenticated Top-Right Actions: Log In & Create Account Buttons -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap whitespace-nowrap" id="header-auth-buttons">
          <button id="header-login-btn" class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap" title="Log In to PEDAIA">
            <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Log In</span>
          </button>
          <button id="header-signup-btn" class="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-2xs hover:shadow-indigo-500/25 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap" title="Create your PEDAIA Account">
            <svg class="w-3.5 h-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span class="hidden sm:inline">Create Account</span><span class="sm:hidden">Sign Up</span>
          </button>
        </div>

        <!-- Authenticated Account Menu (Opens Pop-up Modal) -->
        <div class="relative shrink-0 hidden" id="header-user-menu-wrapper">
          <button id="header-user-btn" class="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-750 transition-all shadow-2xs group cursor-pointer" title="User Account, Security & Profile">
            <div class="w-6 h-6 rounded bg-indigo-950 border border-indigo-400/30 overflow-hidden shadow-2xs shrink-0 flex items-center justify-center" id="header-user-avatar">
              <img src="./favicon.svg" alt="Avatar" class="w-full h-full object-cover">
            </div>
            <div class="flex items-center gap-1.5 hidden sm:flex">
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-mono" id="header-username-display">Educator</span>
              <span id="header-role-badge" class="hidden px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Admin</span>
            </div>
            <svg class="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Educator Profile Button (Preserved for compatibility) -->
        <button id="header-profile-btn" data-nav="settings" data-tab="general" class="hidden nav-item" title="Educator Profile">
          <span id="header-educator-name">Profile</span>
          <span id="header-educator-avatar"></span>
        </button>

        <!-- Hidden desktop page title element for state persistence -->
        <span id="header-page-title" class="hidden"></span>
`;

html = html.substring(0, startIndex) + newHeaderContent + html.substring(endIndex);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated public/index.html with modern spacious header markup.');
