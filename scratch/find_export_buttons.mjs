import fs from 'fs';

function findExportButtons(file) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n=== Export occurrences in ${file} ===`);
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.toLowerCase().includes('export') || l.toLowerCase().includes('download') || l.toLowerCase().includes('pptx')) {
      if (l.includes('btn') || l.includes('button') || l.includes('click') || l.includes('addEventListener')) {
        console.log(`line ${i + 1}: ${l.trim()}`);
      }
    }
  });
}

findExportButtons('public/js/views/aiOutputStudio.js');
findExportButtons('public/js/views/myDesigns.js');
findExportButtons('public/js/views/dashboard.js');
