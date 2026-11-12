import fs from 'fs';

const lp = fs.readFileSync('public/js/views/lessonPlanner.js', 'utf8');
const lines = lp.split('\n');
console.log(lines.slice(800, 950).join('\n'));
