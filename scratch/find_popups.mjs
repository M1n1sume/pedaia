import fs from 'fs';

const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

function findTerms(terms) {
  lines.forEach((l, idx) => {
    for (const t of terms) {
      if (l.toLowerCase().includes(t.toLowerCase())) {
        console.log(`${idx + 1}: ${l.trim()}`);
        break;
      }
    }
  });
}

console.log('--- Searching for popups / dropdowns in index.html ---');
findTerms(['extension', 'theme', 'model-selector', 'dropdown']);
