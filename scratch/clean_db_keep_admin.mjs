// Clean test users while preserving M1n1sume
import * as db from '../serverDb.js';

const users = db.readJson('users.json', []);
const admin = users.find(u => u && u.username && u.username.toLowerCase() === 'm1n1sume');

if (admin) {
  db.writeJson('users.json', [admin]);
  console.log('Cleaned users.json, preserved M1n1sume.');
}

db.writeJson('sessions.json', {});
db.writeJson('designs.json', []);
db.writeJson('outputs.json', []);
db.writeJson('profiles.json', {});
console.log('Reset test sessions, designs, outputs, and profiles.');
