import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderSlide') || l.includes('slide-viewer') || l.includes('activeSlideIndex')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
