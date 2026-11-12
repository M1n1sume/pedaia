import fs from 'fs';

const code = fs.readFileSync('public/js/promptEngine.js', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('buildAiOutputStudioPrompt'));
console.log(lines.slice(idx, idx + 100).join('\n'));
