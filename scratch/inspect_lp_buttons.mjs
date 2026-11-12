import fs from 'fs';

const lp = fs.readFileSync('public/js/views/lessonPlanner.js', 'utf8');

// Find all elements with data-val or selectable buttons
const matches = [...lp.matchAll(/<button[^>]+(data-val|class="[^"]*(?:option|pill|select|btn)[^"]*")[^>]*>/g)];
console.log('--- Buttons in Lesson Planner ---');
matches.slice(0, 30).forEach(m => console.log(m[0].slice(0, 100)));
