import fs from 'fs';

const lines = fs.readFileSync('C:/Users/johnp/.gemini/antigravity/brain/d14a4b31-48b6-4613-83cf-d3b9b471b1a2/.system_generated/logs/transcript.jsonl', 'utf8')
  .trim().split('\n');

for (let i = Math.max(0, lines.length - 20); i < lines.length; i++) {
  const parsed = JSON.parse(lines[i]);
  console.log(`[${i}] Step ${parsed.step_index} | ${parsed.source} | ${parsed.type}`);
  if (parsed.content) console.log('  Content:', parsed.content.slice(0, 120));
  if (parsed.media) console.log('  Media:', parsed.media);
}
