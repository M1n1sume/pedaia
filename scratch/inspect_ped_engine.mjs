import fs from 'fs';

const code = fs.readFileSync('public/js/pedagogicalEngine.js', 'utf8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('academic-indigo') || l.includes('theme') || l.includes('color') || l.includes('pptx')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
