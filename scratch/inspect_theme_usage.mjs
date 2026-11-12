import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('designOptions.theme') || l.includes('theme ===') || l.includes('colors') || l.includes('PptxGenJS') || l.includes('downloadPowerPointPresentation')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
