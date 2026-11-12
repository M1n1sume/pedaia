import fs from 'fs';

const code = fs.readFileSync('public/js/exportUtils.js', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('function openUniversalExportModal'));
console.log(lines.slice(idx + 70, idx + 160).join('\n'));
