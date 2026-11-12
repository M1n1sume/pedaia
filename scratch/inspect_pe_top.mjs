import fs from 'fs';

const pe = fs.readFileSync('public/js/promptEngine.js', 'utf8');
const lines = pe.split('\n');
const idx = lines.findIndex(l => l.includes('buildAiOutputStudioPrompt'));
console.log(lines.slice(idx, idx + 45).join('\n'));
