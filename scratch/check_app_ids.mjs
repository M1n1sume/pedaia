import fs from 'fs';

const html = fs.readFileSync('public/index.html', 'utf8');
const app = fs.readFileSync('public/js/app.js', 'utf8');

// Find all document.getElementById in app.js
const idMatches = [...app.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const uniqueIds = [...new Set(idMatches)];

console.log(`Checking ${uniqueIds.length} getElementById references in app.js against index.html:`);

let missingInHtml = [];
for (const id of uniqueIds) {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missingInHtml.push(id);
  }
}

if (missingInHtml.length === 0) {
  console.log('✓ All getElementById targets in app.js exist in index.html!');
} else {
  console.log('IDs in app.js not found in index.html (may be rendered in views):', missingInHtml);
}
