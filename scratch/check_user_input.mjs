import fs from 'fs';

const lines = fs.readFileSync('C:/Users/johnp/.gemini/antigravity/brain/d14a4b31-48b6-4613-83cf-d3b9b471b1a2/.system_generated/logs/transcript.jsonl', 'utf8')
  .trim().split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  const parsed = JSON.parse(lines[i]);
  if (parsed.type === 'USER_INPUT') {
    console.log('Last USER_INPUT step:', parsed.step_index);
    console.log('Content:', parsed.content);
    console.log('Media:', parsed.media);
    break;
  }
}
