import fs from 'fs';

function inspectStudio(filename) {
  console.log(`\n========================================`);
  console.log(`Inspecting options in ${filename}`);
  console.log(`========================================`);
  const content = fs.readFileSync(filename, 'utf8');
  
  // Find data- attributes or buttons that look like options/pills/toggles
  const dataMatches = [...content.matchAll(/data-([a-zA-Z0-9_\-]+)=["']([^"']+)["']/g)];
  const dataKeys = new Set(dataMatches.map(m => m[1]));
  console.log('data-* attributes used:', [...dataKeys]);

  // Find pills / option classes
  const pillMatches = [...content.matchAll(/class=["'][^"']*(pill|option|chip|toggle|selectable|badge)[^"']*["']/gi)];
  console.log('Pill/option class occurrences:', pillMatches.length);

  // Look for event listeners in setupListeners or bindHandlers
  const listenerMatches = [...content.matchAll(/addEventListener\(['"]click['"]/g)];
  console.log('Total click event listeners:', listenerMatches.length);
}

inspectStudio('public/js/views/lessonPlanner.js');
inspectStudio('public/js/views/activityDesigner.js');
inspectStudio('public/js/views/questioningStudio.js');
inspectStudio('public/js/views/differentiationStudio.js');
