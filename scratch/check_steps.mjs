import fs from 'fs';

const lines = fs.readFileSync('C:/Users/johnp/.gemini/antigravity/brain/d14a4b31-48b6-4613-83cf-d3b9b471b1a2/.system_generated/logs/transcript.jsonl', 'utf8')
  .trim().split('\n');

for (let i = 7719; i < lines.length; i++) {
  const parsed = JSON.parse(lines[i]);
  if (parsed.type === 'USER_INPUT' || (parsed.media && parsed.media.length)) {
    console.log('Step', parsed.step_index, parsed.type, 'Content:', parsed.content, 'Media:', parsed.media);
  }
}
