import fs from 'fs';

const modalCode = fs.readFileSync('public/js/views/userAccountModal.js', 'utf8');
console.log('userAccountModal.js length:', modalCode.length);
console.log(modalCode.slice(0, 1500));
