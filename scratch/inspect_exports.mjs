import fs from 'fs';

function findExports(file) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/export\s+(?:async\s+)?(?:function|const|let|var)\s+([a-zA-Z0-9_]+)/g)];
  console.log(`Exports in ${file}:`, matches.map(m => m[1]));
}

findExports('public/js/views/educatorReview.js');
findExports('public/js/views/sharedViewer.js');
findExports('public/js/views/shareLinkModal.js');
