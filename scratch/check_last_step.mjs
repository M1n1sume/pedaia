import fs from 'fs';

const lines = fs.readFileSync('C:/Users/johnp/.gemini/antigravity/brain/d14a4b31-48b6-4613-83cf-d3b9b471b1a2/.system_generated/logs/transcript.jsonl', 'utf8')
  .trim().split('\n');

const lastFew = lines.slice(-5);
for (const line of lastFew) {
  const parsed = JSON.parse(line);
  console.log('--- Step', parsed.step_index, parsed.source, parsed.type);
  if (parsed.content) console.log('Content:', parsed.content.slice(0, 300));
  if (parsed.media) console.log('Media:', JSON.stringify(parsed.media));
}
