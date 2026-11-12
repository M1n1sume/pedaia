import fs from 'fs';

const act = fs.readFileSync('public/js/views/activityDesigner.js', 'utf8');
const lines = act.split('\n');
console.log(lines.slice(745, 830).join('\n'));
