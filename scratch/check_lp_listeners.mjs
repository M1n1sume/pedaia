import fs from 'fs';
const lp = fs.readFileSync('public/js/views/lessonPlanner.js', 'utf8');
const lines = lp.split('\n');
lines.forEach((l, i) => {
  if (l.includes('setupLessonPlannerListeners') || l.includes('addEventListener') || l.includes('openUniversalImportModal')) {
    console.log(`lessonPlanner.js:${i+1}: ${l.trim()}`);
  }
});
