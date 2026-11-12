import fs from 'fs';
import path from 'path';

function searchCalls(funcName) {
  console.log(`\n--- Calls to ${funcName} ---`);
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory() && ent.name !== 'node_modules' && ent.name !== '.git' && ent.name !== 'scratch') {
        walk(full);
      } else if (ent.name.endsWith('.js')) {
        const text = fs.readFileSync(full, 'utf8');
        if (text.includes(funcName)) {
          console.log(`Used in: ${full}`);
        }
      }
    }
  }
  walk('public/js');
}

searchCalls('openUniversalImportModal');
searchCalls('openUniversalExportModal');
searchCalls('openUserAccountModal');
