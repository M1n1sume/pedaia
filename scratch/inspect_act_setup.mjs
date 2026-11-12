import fs from 'fs';

const act = fs.readFileSync('public/js/views/activityDesigner.js', 'utf8');
const lines = act.split('\n');
console.log('--- Imports in activityDesigner.js ---');
console.log(lines.slice(0, 15).join('\n'));
console.log('--- act-types-group and context listeners ---');
const idx = lines.findIndex(l => l.includes('act-types-group'));
console.log(lines.slice(idx - 5, idx + 50).join('\n'));
