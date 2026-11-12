import fs from 'fs';

function findFileMatches(file, term) {
  const c = fs.readFileSync(file, 'utf8');
  if (c.includes(term)) console.log(`Found "${term}" in ${file}`);
}

const files = fs.readdirSync('public/js/views').map(f => 'public/js/views/' + f);
files.push('public/js/views/sharedContext.js');
files.forEach(f => {
  findFileMatches(f, 'model');
});
