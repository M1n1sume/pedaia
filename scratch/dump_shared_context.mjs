import fs from 'fs';

const sc = fs.readFileSync('public/js/views/sharedContext.js', 'utf8');
console.log(sc);
