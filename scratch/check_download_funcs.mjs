import fs from 'fs';
const aos = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = aos.split('\n');
lines.forEach((l, i) => {
  if (l.includes('downloadPowerPointPresentation') || l.includes('openInteractiveSlideDeckWindow') || l.includes('openPrintablePosterWindow') || l.includes('downloadSvgDiagram') || l.includes('openPrintableFlashcardsWindow')) {
    console.log(`aiOutputStudio.js:${i+1}: ${l.trim()}`);
  }
});
