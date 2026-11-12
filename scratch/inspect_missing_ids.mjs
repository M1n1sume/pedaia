import fs from 'fs';

const app = fs.readFileSync('public/js/app.js', 'utf8');
const lines = app.split('\n');

const idsToCheck = [
  'about-modal-overlay',
  'close-about-modal-btn',
  'close-about-modal-btn-2',
  'quick-settings-btn',
  'header-about-btn',
  'quick-help-btn',
  'sidebar-file-hub-btn',
  'sidebar-educator-name',
  'sidebar-educator-inst',
  'dropdown-username-text',
  'dropdown-role-text',
  'menu-item-admin',
  'mobile-auth-action-btn'
];

for (const id of idsToCheck) {
  lines.forEach((l, i) => {
    if (l.includes(id)) {
      console.log(`Line ${i + 1}: ${l.trim()}`);
    }
  });
}
