import fs from 'fs';

function findExportsInFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n=== Export IDs in ${file} ===`);
  const matches = [...content.matchAll(/id=["']([a-zA-Z0-9_\-]+export[a-zA-Z0-9_\-]*)["']/gi)];
  matches.forEach(m => console.log('Found ID:', m[1]));
}

findExportsInFile('public/js/views/outputWorkspace.js');
findExportsInFile('public/js/views/aiOutputStudio.js');
findExportsInFile('public/js/views/myDesigns.js');
findExportsInFile('public/js/views/dashboard.js');
