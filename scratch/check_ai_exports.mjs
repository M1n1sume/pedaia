import fs from 'fs';
const aos = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = aos.split('\n');
lines.forEach((l, i) => {
  if (l.includes('export-pptx-btn') || l.includes('export-html-slides-btn') || l.includes('export-pdf-poster-btn') || l.includes('export-svg-btn') || l.includes('print-worksheet-btn')) {
    console.log(`aiOutputStudio.js:${i+1}: ${l.trim()}`);
  }
});
