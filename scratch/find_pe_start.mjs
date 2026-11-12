import fs from 'fs';

const pe = fs.readFileSync('public/js/promptEngine.js', 'utf8');
const lines = pe.split('\n');
const start = lines.findIndex(l => l.includes('export function buildAiOutputStudioPrompt'));
console.log(`Start line: ${start + 1}`);
console.log(lines.slice(start, start + 30).join('\n'));
