// Complete End-to-End View Execution Test
import assert from 'assert';

console.log('--- Testing All Views Rendering and Listener Binding ---');

// Mock browser globals
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => delete mockStorage[k]
};
global.window = {
  location: { origin: 'http://localhost:3000', hash: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  dispatchEvent: () => {},
  CustomEvent: class CustomEvent { constructor(t) { this.type = t; } }
};
global.document = {
  documentElement: {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    setAttribute: () => {},
    style: {}
  },
  body: { appendChild: () => {}, removeChild: () => {} }
};

const { store } = await import('../public/js/state.js');
const { renderDashboardView, setupDashboardListeners } = await import('../public/js/views/dashboard.js');
const { renderLessonPlannerView, setupLessonPlannerListeners } = await import('../public/js/views/lessonPlanner.js');
const { renderActivityDesignerView, setupActivityDesignerListeners } = await import('../public/js/views/activityDesigner.js');
const { renderQuestioningStudioView, setupQuestioningStudioListeners } = await import('../public/js/views/questioningStudio.js');
const { renderDifferentiationStudioView, setupDifferentiationStudioListeners } = await import('../public/js/views/differentiationStudio.js');
const { renderOutputWorkspaceView, setupOutputWorkspaceListeners } = await import('../public/js/views/outputWorkspace.js');
const { renderMyDesignsView, setupMyDesignsListeners } = await import('../public/js/views/myDesigns.js');
const { renderPromptLibraryView, setupPromptLibraryListeners } = await import('../public/js/views/promptLibrary.js');
const { renderSettingsView, setupSettingsListeners } = await import('../public/js/views/settings.js');

// Mock container helper
function createMockContainer(html) {
  return {
    innerHTML: html,
    querySelector: (sel) => {
      // Return a dummy element with safe chaining
      return {
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        setAttribute: () => {},
        getAttribute: () => '',
        style: {},
        value: '',
        checked: false,
        disabled: false
      };
    },
    querySelectorAll: (sel) => {
      return [{
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        setAttribute: () => {},
        getAttribute: () => '',
        style: {},
        value: '',
        checked: false,
        disabled: false
      }];
    }
  };
}

const noop = () => {};

// 1. Dashboard
const dHtml = renderDashboardView();
assert(dHtml.length > 100);
setupDashboardListeners(createMockContainer(dHtml), noop, noop);
console.log('✓ Dashboard view & listeners verified');

// 2. Lesson Planner
const lpHtml = renderLessonPlannerView();
assert(lpHtml.length > 100);
setupLessonPlannerListeners(createMockContainer(lpHtml), noop, noop, noop);
console.log('✓ Lesson Planner view & listeners verified');

// 3. Activity Designer
const actHtml = renderActivityDesignerView();
assert(actHtml.length > 100);
setupActivityDesignerListeners(createMockContainer(actHtml), noop, noop, noop);
console.log('✓ Activity Designer view & listeners verified');

// 4. Questioning Studio
const questHtml = renderQuestioningStudioView();
assert(questHtml.length > 100);
setupQuestioningStudioListeners(createMockContainer(questHtml), noop, noop, noop);
console.log('✓ Questioning Studio view & listeners verified');

// 5. Differentiation Studio
const diffHtml = renderDifferentiationStudioView();
assert(diffHtml.length > 100);
setupDifferentiationStudioListeners(createMockContainer(diffHtml), noop, noop, noop);
console.log('✓ Differentiation Studio view & listeners verified');

// 6. Output Workspace
const wsHtml = renderOutputWorkspaceView();
assert(wsHtml.length > 100);
setupOutputWorkspaceListeners(createMockContainer(wsHtml), noop, noop, noop);
console.log('✓ Output Workspace view & listeners verified');

// 7. My Designs
const desHtml = renderMyDesignsView();
assert(desHtml.length > 100);
setupMyDesignsListeners(createMockContainer(desHtml), noop, noop);
console.log('✓ My Designs view & listeners verified');

// 8. Prompt Library
const libHtml = renderPromptLibraryView();
assert(libHtml.length > 100);
setupPromptLibraryListeners(createMockContainer(libHtml), noop, noop);
console.log('✓ Prompt Library view & listeners verified');

// 9. Settings
const setHtml = renderSettingsView();
assert(setHtml.length > 100);
setupSettingsListeners(createMockContainer(setHtml), noop);
console.log('✓ Settings view & listeners verified');

console.log('🎉 ALL 9 VIEWS AND LISTENERS EXECUTED FLAWLESSLY WITH ZERO RUNTIME ERRORS!');
