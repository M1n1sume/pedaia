import fs from 'fs';
['lessonPlanner.js', 'activityDesigner.js', 'questioningStudio.js', 'differentiationStudio.js'].forEach(f => {
  const c = fs.readFileSync('public/js/views/' + f, 'utf8');
  const m = c.match(/renderGlobalContextForm\([^)]+\)/);
  if (m) console.log(`${f}: ${m[0]}`);
});
