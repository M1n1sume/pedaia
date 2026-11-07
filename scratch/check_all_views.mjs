import fs from 'fs';
import path from 'path';

console.log('--- Deep Static & Behavioral Analysis of PEDAIA Codebase ---');

// 1. Check all JSON files in data/
const dataFiles = fs.readdirSync('./data');
dataFiles.forEach(f => {
  if (f.endsWith('.json')) {
    try {
      const content = fs.readFileSync(path.join('./data', f), 'utf-8');
      JSON.parse(content);
      console.log(`✓ data/${f} is valid JSON`);
    } catch (e) {
      console.error(`❌ data/${f} has JSON parse error:`, e.message);
    }
  }
});

// 2. Check all views for runtime export signatures
const views = [
  '../public/js/views/dashboard.js',
  '../public/js/views/lessonPlanner.js',
  '../public/js/views/activityDesigner.js',
  '../public/js/views/questioningStudio.js',
  '../public/js/views/differentiationStudio.js',
  '../public/js/views/aiOutputStudio.js',
  '../public/js/views/outputWorkspace.js',
  '../public/js/views/myDesigns.js',
  '../public/js/views/promptLibrary.js',
  '../public/js/views/settings.js',
  '../public/js/views/adminDashboard.js',
  '../public/js/views/authModal.js',
  '../public/js/views/paletteModal.js',
  '../public/js/views/extensionModal.js',
  '../public/js/views/screenFitModal.js',
  '../public/js/views/aiSwitcherModal.js',
  '../public/js/views/userAccountModal.js',
  '../public/js/views/commandPalette.js'
];

async function checkViews() {
  for (const v of views) {
    try {
      const mod = await import(v);
      console.log(`✓ Module ${path.basename(v)} imported successfully. Exports: ${Object.keys(mod).join(', ')}`);
    } catch (e) {
      console.error(`❌ Module ${v} failed to import:`, e);
    }
  }
}

checkViews();
