import fs from 'fs';

const studios = [
  'public/js/views/lessonPlanner.js',
  'public/js/views/activityDesigner.js',
  'public/js/views/questioningStudio.js',
  'public/js/views/differentiationStudio.js'
];

for (const file of studios) {
  const code = fs.readFileSync(file, 'utf8');
  console.log(`\nChecking shared options listeners in ${file}:`);
  console.log('  duration-btn listener:', code.includes('duration-btn'));
  console.log('  modality-card listener:', code.includes('modality-card'));
  console.log('  resource-chip listener:', code.includes('resource-chip'));
}
