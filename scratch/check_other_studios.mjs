import fs from 'fs';
const files = ['activityDesigner.js', 'questioningStudio.js', 'differentiationStudio.js'];
files.forEach(f => {
  const c = fs.readFileSync('public/js/views/' + f, 'utf8');
  const count = (c.match(/openUniversalImportModal/g) || []).length;
  console.log(`${f}: ${count} occurrences`);
});
