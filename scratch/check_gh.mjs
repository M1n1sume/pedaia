import fs from 'fs';
import path from 'path';

const dirs = [
  'C:\\Users\\johnp\\AppData\\Local\\GitHubDesktop',
  'C:\\Users\\johnp\\AppData\\Local\\GitHubDesktop\\bin'
];

dirs.forEach(d => {
  try {
    if (fs.existsSync(d)) {
      console.log('Dir:', d, fs.readdirSync(d));
    } else {
      console.log('Not found:', d);
    }
  } catch (err) {
    console.error('Error reading dir', d, err.message);
  }
});
