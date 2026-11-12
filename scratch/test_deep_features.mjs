import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🧪 RUNNING DEEP FEATURE & ERROR DETECTION SUITE...\n');

let failedTests = [];

// -------------------------------------------------------------
// Test 1: Mock DOM & View Render Checks
// -------------------------------------------------------------
console.log('--- Test 1: View Render Functions & HTML Output ---');

// Setup minimal global mock DOM
globalThis.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; },
  clear() { this.data = {}; }
};

globalThis.window = {
  localStorage: globalThis.localStorage,
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {}
};

globalThis.document = {
  documentElement: {
    getAttribute() { return 'light'; },
    setAttribute() {},
    classList: { add() {}, remove() {}, contains() { return false; } }
  },
  body: {
    appendChild() {},
    removeChild() {},
    insertAdjacentHTML() {}
  },
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() {
    return {
      style: {},
      classList: { add() {}, remove() {} },
      appendChild() {},
      setAttribute() {},
      addEventListener() {}
    };
  }
};

const viewsToTest = [
  { name: 'Dashboard', path: '../public/js/views/dashboard.js', fn: 'renderDashboardView' },
  { name: 'LessonPlanner', path: '../public/js/views/lessonPlanner.js', fn: 'renderLessonPlannerView' },
  { name: 'ActivityDesigner', path: '../public/js/views/activityDesigner.js', fn: 'renderActivityDesignerView' },
  { name: 'QuestioningStudio', path: '../public/js/views/questioningStudio.js', fn: 'renderQuestioningStudioView' },
  { name: 'DifferentiationStudio', path: '../public/js/views/differentiationStudio.js', fn: 'renderDifferentiationStudioView' },
  { name: 'AiOutputStudio', path: '../public/js/views/aiOutputStudio.js', fn: 'renderAiOutputStudioView' },
  { name: 'OutputWorkspace', path: '../public/js/views/outputWorkspace.js', fn: 'renderOutputWorkspaceView' },
  { name: 'MyDesigns', path: '../public/js/views/myDesigns.js', fn: 'renderMyDesignsView' },
  { name: 'PromptLibrary', path: '../public/js/views/promptLibrary.js', fn: 'renderPromptLibraryView' },
  { name: 'Settings', path: '../public/js/views/settings.js', fn: 'renderSettingsView' },
  { name: 'AdminDashboard', path: '../public/js/views/adminDashboard.js', fn: 'renderAdminDashboardView' },
  { name: 'EducatorProfile', path: '../public/js/views/educatorProfile.js', fn: 'renderEducatorProfileView' },
  { name: 'SharedViewer', path: '../public/js/views/sharedViewer.js', fn: 'renderSharedView' }
];

for (const v of viewsToTest) {
  try {
    const mod = await import(v.path);
    assert(typeof mod[v.fn] === 'function', `${v.name} does not export ${v.fn}`);
    const html = mod[v.fn]();
    assert(typeof html === 'string', `${v.name}.${v.fn} did not return a string`);
    assert(html.length > 50, `${v.name}.${v.fn} returned suspiciously short HTML (${html.length} chars)`);
    console.log(`  ✓ ${v.name} rendered cleanly (${html.length} chars)`);
  } catch (err) {
    console.error(`  ❌ Error in ${v.name}:`, err.message);
    failedTests.push(`View Render ${v.name}: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Test 2: Prompt Engine Robustness & Edge Cases
// -------------------------------------------------------------
console.log('\n--- Test 2: Prompt Engine Robustness (Null/Empty/Custom Inputs) ---');
import {
  buildLessonPlannerPrompt,
  buildActivityDesignerPrompt,
  buildQuestioningStudioPrompt,
  buildDifferentiationStudioPrompt,
  buildAiOutputStudioPrompt
} from '../public/js/promptEngine.js';

const promptTests = [
  { name: 'LessonPlanner (empty config)', fn: () => buildLessonPlannerPrompt({}) },
  { name: 'LessonPlanner (populated config)', fn: () => buildLessonPlannerPrompt({
      subject: 'Science',
      topic: 'Photosynthesis',
      educationalLevel: 'Junior High School',
      instructionalModel: '5E Instructional Model',
      lessonSequence: [{ name: 'Engage', desc: 'Hook' }, { name: 'Explore', desc: 'Lab' }],
      teachingStrategies: ['Think-Pair-Share'],
      assessmentTypes: ['Exit Ticket']
  }) },
  { name: 'ActivityDesigner (empty config)', fn: () => buildActivityDesignerPrompt({}) },
  { name: 'ActivityDesigner (populated config)', fn: () => buildActivityDesignerPrompt({
      subject: 'Math',
      topic: 'Quadratic Equations',
      activityType: 'Inquiry-Based Activity',
      groupingStructure: 'Pairs',
      difficultyLevel: 'Intermediate',
      learningPurpose: ['Problem Solving']
  }) },
  { name: 'QuestioningStudio (empty config)', fn: () => buildQuestioningStudioPrompt({}) },
  { name: 'QuestioningStudio (populated config)', fn: () => buildQuestioningStudioPrompt({
      subject: 'History',
      topic: 'Renaissance',
      bloomsDistribution: { remember: 2, understand: 3, apply: 2, analyze: 2, evaluate: 1, create: 1 },
      questionTypes: ['Multiple Choice with Diagnostic Distractors']
  }) },
  { name: 'DifferentiationStudio (empty config)', fn: () => buildDifferentiationStudioPrompt({}) },
  { name: 'DifferentiationStudio (populated config)', fn: () => buildDifferentiationStudioPrompt({
      subject: 'English',
      topic: 'Argumentative Writing',
      differentiationDimensions: ['Content', 'Process'],
      adaptationStrategies: ['Sentence Frames', 'Visual Organizers']
  }) },
  { name: 'AiOutputStudio (empty config)', fn: () => buildAiOutputStudioPrompt({}) },
  { name: 'AiOutputStudio (custom theme palette)', fn: () => buildAiOutputStudioPrompt({
      activeCategoryId: 'presentation',
      designOptions: {
        theme: 'custom',
        customPrimaryColor: '#7C3AED',
        customSecondaryColor: '#EC4899',
        customBackgroundColor: 'dark-slate',
        typographyStyle: 'modern-sans',
        layoutDensity: 'spacious',
        visualStyle: 'modern-flat',
        customVisualDirectives: 'Futuristic aesthetic with soft neon accents'
      }
  }) }
];

for (const pt of promptTests) {
  try {
    const res = pt.fn();
    assert(typeof res === 'string' && res.length > 50, `${pt.name} failed to produce valid prompt string`);
    console.log(`  ✓ ${pt.name} passed (${res.length} chars)`);
  } catch (e) {
    console.error(`  ❌ Error in ${pt.name}:`, e.message);
    failedTests.push(`Prompt Engine ${pt.name}: ${e.message}`);
  }
}

// -------------------------------------------------------------
// Test 3: Export Engine Functions & Formats
// -------------------------------------------------------------
console.log('\n--- Test 3: Export Engine Generators ---');
import {
  exportToDocx,
  exportToMarkdown,
  exportToPlainText,
  exportToHtml,
  exportToJson,
  exportToCsv,
  exportToRtf,
  exportToLatex,
  exportToXml,
  exportToCanvasHtml,
  exportToCanvasQti,
  exportToGoogleClassroomFormat
} from '../public/js/exportUtils.js';

const sampleDesign = {
  id: 'test-design-123',
  title: 'Photosynthesis & Cellular Respiration',
  subject: 'Science',
  educationalLevel: 'Junior High School',
  topic: 'Energetics',
  content: '## Learning Objectives\n- Understand light reaction\n- Model Calvin cycle\n\n## Activities\n1. Leaf disc assay',
  metadata: {
    duration: '60 minutes',
    modality: 'Face-to-Face',
    resources: ['Microscopes', 'Beakers']
  }
};

const exportTests = [
  { name: 'Markdown Export', fn: () => exportToMarkdown(sampleDesign, false) },
  { name: 'Plain Text Export', fn: () => exportToPlainText(sampleDesign, false) },
  { name: 'HTML Export', fn: () => exportToHtml(sampleDesign, false) },
  { name: 'JSON Export', fn: () => exportToJson(sampleDesign, false) },
  { name: 'CSV Export', fn: () => exportToCsv(sampleDesign, false) },
  { name: 'RTF Export', fn: () => exportToRtf(sampleDesign, false) },
  { name: 'LaTeX Export', fn: () => exportToLatex(sampleDesign, false) },
  { name: 'XML Export', fn: () => exportToXml(sampleDesign, false) },
  { name: 'Canvas LMS HTML', fn: () => exportToCanvasHtml(sampleDesign, false) },
  { name: 'Canvas Quiz QTI', fn: () => exportToCanvasQti(sampleDesign, false) },
  { name: 'Google Classroom Format', fn: () => exportToGoogleClassroomFormat(sampleDesign, false) }
];

for (const et of exportTests) {
  try {
    const res = et.fn();
    assert(res !== null && res !== undefined, `${et.name} returned null/undefined`);
    console.log(`  ✓ ${et.name} generated successfully`);
  } catch (err) {
    console.error(`  ❌ Error in ${et.name}:`, err.message);
    failedTests.push(`Export ${et.name}: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Test 4: Universal File Importer Parser
// -------------------------------------------------------------
console.log('\n--- Test 4: Universal File Importer Parser ---');
import { parseAnyFile } from '../public/js/importUtils.js';

const mockFileJson = {
  name: 'curriculum.json',
  size: 150,
  text: async () => JSON.stringify({
    title: 'Cellular Biology',
    subject: 'Science',
    topic: 'Cell Structure',
    competency: 'Identify organelles and their functions'
  })
};

const mockFileMd = {
  name: 'lesson_plan.md',
  size: 200,
  text: async () => `---
title: World War II
subject: History
gradeLevel: Grade 10
---
# Lesson on WWII
Analyze the causes and consequences of WWII.`
};

const mockFileCsv = {
  name: 'standards.csv',
  size: 100,
  text: async () => `Grade,Subject,Standard\nGrade 8,Mathematics,Solve linear equations`
};

try {
  const parsedJson = await parseAnyFile(mockFileJson);
  assert(parsedJson.text || parsedJson.title, 'Failed to parse JSON file');
  console.log('  ✓ JSON file parsing verified');

  const parsedMd = await parseAnyFile(mockFileMd);
  assert(parsedMd.text && parsedMd.text.includes('WWII'), 'Failed to parse Markdown file');
  console.log('  ✓ Markdown file parsing verified');

  const parsedCsv = await parseAnyFile(mockFileCsv);
  assert(parsedCsv.text && parsedCsv.text.includes('linear equations'), 'Failed to parse CSV file');
  console.log('  ✓ CSV file parsing verified');
} catch (e) {
  console.error('  ❌ Error in File Importer:', e.message);
  failedTests.push(`File Importer: ${e.message}`);
}

// -------------------------------------------------------------
// Test 5: Database Operations & Edge Cases
// -------------------------------------------------------------
console.log('\n--- Test 5: Server Database Integrity & Operations ---');
import * as db from '../serverDb.js';

try {
  // Ensure DB initialized
  db.initDb();

  // Test user list
  const usersJson = db.readJson('users.json', []);
  const admin = usersJson.find(u => u.username && u.username.toLowerCase() === 'm1n1sume');
  assert(admin, 'Admin m1n1sume must be present');
  assert.strictEqual(admin.role, 'admin');

  // Verify listAllUsers as admin
  const users = db.listAllUsers(admin.id);
  assert(Array.isArray(users), 'listAllUsers must return an array');

  // Test design queries
  const userDesigns = db.getUserDesigns(admin.id);
  assert(Array.isArray(userDesigns), 'getUserDesigns must return an array');

  // Test outputs queries
  const userOutputs = db.getUserOutputs(admin.id);
  assert(Array.isArray(userOutputs), 'getUserOutputs must return an array');

  // Test profile retrieval
  const profile = db.getUserProfile(admin.id);
  assert(profile !== null && typeof profile === 'object', 'getUserProfile must return an object');

  // Test activity logs
  const logsResult = db.getActivityLogs({ adminUserId: admin.id, limit: 10 });
  assert(logsResult && Array.isArray(logsResult.logs), 'getActivityLogs must return an object with a logs array');

  console.log('  ✓ Server DB user, design, output, and activity operations verified cleanly');
} catch (e) {
  console.error('  ❌ Error in Server DB:', e.message);
  failedTests.push(`Server DB: ${e.message}`);
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n======================================================');
if (failedTests.length === 0) {
  console.log('🎉 ALL FEATURE TESTS PASSED! ZERO ERRORS DETECTED.');
} else {
  console.error(`❌ ${failedTests.length} TESTS FAILED:`, failedTests);
}
console.log('======================================================');
