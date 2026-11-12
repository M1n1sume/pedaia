import fs from 'fs';

const checks = [
  { file: 'public/js/views/lessonPlanner.js', id: 'lp-import-source-btn' },
  { file: 'public/js/views/activityDesigner.js', id: 'act-import-source-btn' },
  { file: 'public/js/views/questioningStudio.js', id: 'q-import-source-btn' },
  { file: 'public/js/views/differentiationStudio.js', id: 'diff-import-source-btn' },
  { file: 'public/js/views/aiOutputStudio.js', id: 'output-import-file-btn' },
  { file: 'public/js/views/outputWorkspace.js', id: 'ws-import-file-btn' },
  { file: 'public/js/views/myDesigns.js', id: 'designs-import-file-btn' }
];

for (const { file, id } of checks) {
  const code = fs.readFileSync(file, 'utf8');
  if (code.includes(id)) {
    console.log(`✓ ${id} found in ${file}`);
  } else {
    console.error(`✗ Missing ${id} in ${file}`);
  }
}
