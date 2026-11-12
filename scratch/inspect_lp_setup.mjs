import fs from 'fs';

const lp = fs.readFileSync('public/js/views/lessonPlanner.js', 'utf8');
const lines = lp.split('\n');
console.log('--- Imports in lessonPlanner.js ---');
console.log(lines.slice(0, 20).join('\n'));
console.log('--- setupLessonPlannerListeners start ---');
const idx = lines.findIndex(l => l.includes('function setupLessonPlannerListeners'));
console.log(lines.slice(idx, idx + 40).join('\n'));
