import fs from 'fs';

const lp = fs.readFileSync('public/js/views/lessonPlanner.js', 'utf8');
const lines = lp.split('\n');

lines.forEach((l, i) => {
  if (l.includes('model-card') || l.includes('strategy-chip') || l.includes('assessment-chip') || l.includes('format-card')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
