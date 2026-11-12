import fs from 'fs';

const suite = fs.readFileSync('scratch/audit_suite.mjs', 'utf8');
const lines = suite.split('\n');
const idx = lines.findIndex(l => l.includes('Step 1: Testing Server Endpoints'));
console.log(lines.slice(idx, idx + 40).join('\n'));
