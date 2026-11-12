import fs from 'fs';

const modalCode = fs.readFileSync('public/js/views/userAccountModal.js', 'utf8');
console.log(modalCode);
