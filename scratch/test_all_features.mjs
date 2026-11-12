import fs from 'fs';
import path from 'path';

console.log('=== PEDAIA COMPREHENSIVE ALL-FEATURE & ERROR AUDIT ===\n');

// 1. Verify every view module exports render and setup listeners
const views = [
  { name: 'activityDesigner.js', render: 'renderActivityDesignerView', setup: 'setupActivityDesignerListeners' },
  { name: 'adminDashboard.js', render: 'renderAdminDashboardView', setup: 'setupAdminDashboardListeners' },
  { name: 'aiOutputStudio.js', render: 'renderAiOutputStudioView', setup: 'setupAiOutputStudioListeners' },
  { name: 'aiSwitcherModal.js', func: 'openAiSwitcherModal' },
  { name: 'authModal.js', func: 'openAuthModal' },
  { name: 'commandPalette.js', func: 'openCommandPalette' },
  { name: 'dashboard.js', render: 'renderDashboardView', setup: 'setupDashboardListeners' },
  { name: 'differentiationStudio.js', render: 'renderDifferentiationStudioView', setup: 'setupDifferentiationStudioListeners' },
  { name: 'educatorProfile.js', render: 'renderEducatorProfileView', setup: 'setupEducatorProfileListeners' },
  { name: 'educatorReview.js', render: 'renderEducatorReviewView', setup: 'setupEducatorReviewListeners' },
  { name: 'extensionModal.js', func: 'openExtensionModal' },
  { name: 'lessonPlanner.js', render: 'renderLessonPlannerView', setup: 'setupLessonPlannerListeners' },
  { name: 'myDesigns.js', render: 'renderMyDesignsView', setup: 'setupMyDesignsListeners' },
  { name: 'outputWorkspace.js', render: 'renderOutputWorkspaceView', setup: 'setupOutputWorkspaceListeners' },
  { name: 'paletteModal.js', func: 'openPaletteModal' },
  { name: 'promptLibrary.js', render: 'renderPromptLibraryView', setup: 'setupPromptLibraryListeners' },
  { name: 'publishLmsModal.js', func: 'openPublishLmsModal' },
  { name: 'questioningStudio.js', render: 'renderQuestioningStudioView', setup: 'setupQuestioningStudioListeners' },
  { name: 'screenFitModal.js', func: 'openScreenFitModal' },
  { name: 'settings.js', render: 'renderSettingsView', setup: 'setupSettingsListeners' },
  { name: 'sharedContext.js', render: 'renderGlobalContextForm', setup: 'setupGlobalContextListeners' },
  { name: 'sharedViewer.js', render: 'renderSharedViewerView' },
  { name: 'shareLinkModal.js', func: 'openShareLinkModal' },
  { name: 'userAccountModal.js', func: 'openUserAccountModal' }
];

let errors = [];

for (const v of views) {
  const filePath = path.join('public', 'js', 'views', v.name);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing view file: ${filePath}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (v.render && !content.includes(`export function ${v.render}`) && !content.includes(`export const ${v.render}`)) {
    errors.push(`${v.name} missing expected render export: ${v.render}`);
  }
  if (v.setup && !content.includes(`export function ${v.setup}`) && !content.includes(`export const ${v.setup}`)) {
    errors.push(`${v.name} missing expected setup export: ${v.setup}`);
  }
  if (v.func && !content.includes(`export function ${v.func}`) && !content.includes(`export const ${v.func}`)) {
    errors.push(`${v.name} missing expected modal/func export: ${v.func}`);
  }
}

if (errors.length === 0) {
  console.log(`✓ All ${views.length} view modules have proper exports!`);
} else {
  console.error(`✗ View export issues:`, errors);
}
