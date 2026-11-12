import fs from 'fs';
const ad = fs.readFileSync('public/js/views/activityDesigner.js', 'utf8');
const lines = ad.split('\n');
lines.forEach((l, i) => {
  if (l.includes('State =') || l.includes('State.') || l.includes('setupActivityDesignerListeners')) {
    console.log(`activityDesigner.js:${i+1}: ${l.trim()}`);
  }
});
