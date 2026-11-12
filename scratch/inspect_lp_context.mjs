import fs from 'fs';

const lp = fs.readFileSync('public/js/views/lessonPlanner.js', 'utf8');
const lines = lp.split('\n');
console.log(lines.slice(950, 995).join('\n'));
