// Test suite for AI Output Studio Visual Generation & Dual-Coding Layout
import assert from 'assert';
import {
  detectVisualCategory,
  generateEducationalVisual,
  getVisualCaption
} from '../public/js/visualGenerator.js';
import {
  parsePresentationSlides,
  parsePosterData,
  parseFlashcards,
  formatBulletWithBold
} from '../public/js/views/aiOutputStudio.js';
import { buildAiOutputStudioPrompt } from '../public/js/promptEngine.js';
import { synthesizeAiDeliverable } from '../public/js/pedagogicalEngine.js';

console.log('🧪 Starting AI Output Studio Visual Generation Test Suite...\n');

// 1. Test Domain Detection
console.log('1. Testing detectVisualCategory for diverse disciplines...');
assert.strictEqual(detectVisualCategory('Photosynthesis and Cellular Respiration', 'Biology'), 'biology');
assert.strictEqual(detectVisualCategory('Chemical Bonding and Molecular Geometry', 'Chemistry'), 'chemistry');
assert.strictEqual(detectVisualCategory('Newton Laws and Velocity Vectors', 'Physics'), 'physics');
assert.strictEqual(detectVisualCategory('Pythagorean Theorem and Trigonometry', 'Mathematics'), 'mathematics');
assert.strictEqual(detectVisualCategory('Supply, Demand and Market Equilibrium', 'Economics'), 'economics');
assert.strictEqual(detectVisualCategory('The American Revolution and World War II', 'History'), 'history');
assert.strictEqual(detectVisualCategory('Shakespearean Sonnets and Narrative Plot Structure', 'Literature'), 'literature');
assert.strictEqual(detectVisualCategory('Cloud Computing and Client-Server Architecture', 'Computer Science'), 'technology');
assert.strictEqual(detectVisualCategory('Leadership Principles', 'Management'), 'conceptual');
console.log('   ✓ detectVisualCategory successfully identified 9 academic domains!\n');

// 2. Test SVG Generation for Each Domain
console.log('2. Testing generateEducationalVisual across domains...');
const domains = [
  { topic: 'Cell Division (Mitosis)', subject: 'Biology' },
  { topic: 'Atomic Orbitals', subject: 'Chemistry' },
  { topic: 'Harmonic Wave Motion', subject: 'Physics' },
  { topic: 'Quadratic Coordinate Graph', subject: 'Mathematics' },
  { topic: 'Market Price Equilibrium', subject: 'Economics' },
  { topic: 'Industrial Revolution Timeline', subject: 'History' },
  { topic: 'Narrative Arc & Conflict', subject: 'Literature' },
  { topic: 'Microservices & API Gateways', subject: 'Computer Science' },
  { topic: 'Cognitive Learning Framework', subject: 'Education' }
];

for (const d of domains) {
  const svg = generateEducationalVisual({
    topic: d.topic,
    subject: d.subject,
    slideType: 'Explanation',
    slideIndex: 1,
    theme: {
      primary: '#4F46E5',
      secondary: '#06B6D4',
      bgDark: '#0F172A',
      cardDark: '#1E293B',
      textColor: '#FFFFFF',
      mutedTextColor: '#94A3B8'
    },
    width: 400,
    height: 240
  });

  assert.ok(svg.includes('<svg'), `SVG output missing <svg tag for ${d.topic}`);
  assert.ok(svg.includes('</svg>'), `SVG output missing </svg> tag for ${d.topic}`);
  assert.ok(svg.includes('viewBox="0 0 400 240"'), `SVG viewBox mismatch for ${d.topic}`);
}
console.log(`   ✓ Successfully generated vector SVGs for all ${domains.length} domain test cases!\n`);

// 3. Test Captions
console.log('3. Testing getVisualCaption...');
const caption1 = getVisualCaption('Cellular Respiration', 'Explanation', 1);
assert.ok(caption1 && caption1.includes('Fig 1:'), `Caption did not include figure tag: ${caption1}`);
console.log(`   ✓ Caption generated: "${caption1}"\n`);

// 4. Test Presentation Slide Parsing with Visual SVGs
console.log('4. Testing parsePresentationSlides with visual generation...');
const mockSlideRaw = `
# Slide 1: Introduction to Cellular Respiration
- High-energy glucose input converted into cellular ATP
- Glycolysis initiates anaerobic breakdown in cytoplasm
Visual: Diagram of Mitochondria Matrix and Cristae
Speaker Note: Welcome students and introduce the biochemical energy transfer.

# Slide 2: The Krebs Citric Acid Cycle
- Acetyl CoA enters cyclical enzymatic reactions
- Releases carbon dioxide and charges NADH carriers
Visual: Circular metabolic cycle schematic
Speaker Note: Guide students through each enzymatic step.

# Slide 3: Oxidative Phosphorylation & ATP Yield
- Electron transport chain creates proton gradient
- ATP synthase synthesizes 30-32 net ATP molecules
Visual: Inner mitochondrial membrane schematic
Speaker Note: Summarize the total bioenergetic net gain.
`;

const parsedSlides = parsePresentationSlides(mockSlideRaw, {
  topic: 'Cellular Respiration',
  subject: 'Biology'
});

assert.strictEqual(parsedSlides.length, 3);
assert.strictEqual(parsedSlides[0].visualCaption, 'Diagram of Mitochondria Matrix and Cristae');
assert.ok(parsedSlides[0].visualSvg && parsedSlides[0].visualSvg.includes('<svg'), 'Slide 1 visualSvg missing');
assert.strictEqual(parsedSlides[1].visualCaption, 'Circular metabolic cycle schematic');
assert.ok(parsedSlides[1].visualSvg && parsedSlides[1].visualSvg.includes('<svg'), 'Slide 2 visualSvg missing');
console.log('   ✓ parsePresentationSlides parsed visual directives and attached SVG diagrams!\n');

// 5. Test Fallback Slide Deck Generation with Visuals
console.log('5. Testing parsePresentationSlides fallback with visual generation...');
const fallbackSlides = parsePresentationSlides('', {
  topic: 'Newtonian Dynamics',
  subject: 'Physics'
});
assert.strictEqual(fallbackSlides.length, 5);
fallbackSlides.forEach((s, idx) => {
  assert.ok(s.visualCaption, `Fallback slide ${idx + 1} missing caption`);
  assert.ok(s.visualSvg && s.visualSvg.includes('<svg'), `Fallback slide ${idx + 1} missing visualSvg`);
  assert.ok(s.bullets.length <= 3, `Fallback slide ${idx + 1} has more than 3 bullets`);
});
console.log('   ✓ All fallback presentation slides have visuals and adhere to concise bullet limit!\n');

// 6. Test Poster Data Parsing with Hero Visual & Pillar SVGs
console.log('6. Testing parsePosterData with hero visual and pillar diagrams...');
const mockPosterText = `
# Photosynthesis: The Living Engine
Subtitle: Converting Solar Photons into Chemical Bond Energy

### Pillar 1: Light-Dependent Reactions
- Thylakoid membrane photon absorption
- Water photolysis releasing molecular oxygen

### Pillar 2: The Calvin Cycle
- Stroma carbon fixation via Rubisco
- Triose phosphate synthesis

### Pillar 3: Ecological Energy Transfer
- Primary productivity sustaining global food webs
- Biogeochemical oxygen and carbon balancing
`;

const posterData = parsePosterData(mockPosterText, {
  topic: 'Photosynthesis',
  subject: 'Biology'
});

assert.ok(posterData.heroVisualSvg && posterData.heroVisualSvg.includes('<svg'), 'Poster heroVisualSvg missing');
assert.strictEqual(posterData.cards.length, 3);
posterData.cards.forEach((c, i) => {
  assert.ok(c.visualSvg && c.visualSvg.includes('<svg'), `Poster card ${i + 1} missing visualSvg`);
});
console.log('   ✓ parsePosterData attached hero visual infographic and 3 pillar mini-diagrams!\n');

// 7. Test Flashcards Parsing with Visual SVGs
console.log('7. Testing parseFlashcards with visual generation...');
const mockFlashcardText = `
- **Card 1 - FRONT:** Mitochondria
  - **Card 1 - BACK:** The double-membraned eukaryotic organelle responsible for aerobic cellular respiration.
- **Card 2 - FRONT:** ATP Synthase
  - **Card 2 - BACK:** Enzymatic rotary motor driven by proton electrochemical gradients.
- **Card 3 - FRONT:** Glycolysis
  - **Card 3 - BACK:** Cytosolic ten-step anaerobic pathway yielding 2 net pyruvate molecules.
`;

const flashcards = parseFlashcards(mockFlashcardText, {
  topic: 'Cellular Respiration',
  subject: 'Biology'
});

assert.strictEqual(flashcards.length, 3);
flashcards.forEach((c, i) => {
  assert.ok(c.visualSvg && c.visualSvg.includes('<svg'), `Flashcard ${i + 1} missing visualSvg`);
});
console.log('   ✓ parseFlashcards attached visual illustrations to all flashcards!\n');

// 8. Test Bullet Bold Keyword Formatter
console.log('8. Testing formatBulletWithBold...');
assert.strictEqual(formatBulletWithBold('**Input:** 6CO2 and 6H2O'), '<strong>Input:</strong> 6CO2 and 6H2O');
assert.strictEqual(formatBulletWithBold('Enzymatic Catalysis: Accelerates reaction rate'), '<strong>Enzymatic Catalysis:</strong> Accelerates reaction rate');
assert.strictEqual(formatBulletWithBold('Primary threshold limit is exceeded'), '<strong>Primary threshold</strong> limit is exceeded');
console.log('   ✓ formatBulletWithBold formats keywords cleanly!\n');

// 9. Test Prompt Engine Mandates
console.log('9. Testing buildAiOutputStudioPrompt for visual-first instructions...');
const prompt = buildAiOutputStudioPrompt({
  activeCategoryId: 'presentation',
  activeTypeId: 'deck-16-9',
  typeLabel: 'Interactive Widescreen Deck (16:9)',
  formData: {
    topic: 'Plate Tectonics',
    subject: 'Geology',
    educationalLevel: 'Grade 9',
    gradeLevel: 'Grade 9'
  }
});
assert.ok(prompt.includes('Visual-First Pedagogy Mandate'), 'Prompt missing Visual-First mandate');
assert.ok(prompt.includes('Visual: [Visual illustration spec]'), 'Prompt missing Visual: directive specification');
assert.ok(prompt.includes('exactly 2 to 3 bite-sized bullet points'), 'Prompt missing 2-3 concise bullets constraint');
console.log('   ✓ Prompt engine enforces visual-first dual coding instructions!\n');

// 10. Test Pedagogical Engine Slide Synthesis
console.log('10. Testing synthesizeAiDeliverable for visual directives and concise slides...');
const synthRes = synthesizeAiDeliverable(prompt, 'gemini', 'gemini-2.5-flash');
const synth = synthRes.output;

assert.ok(synth.includes('Visual:** High-impact hero visual diagram') || synth.includes('Visual: High-impact hero visual diagram'), 'Synthesized presentation missing Visual: directive');
assert.ok(synth.includes('Title Slide'), 'Synthesized presentation missing structured slide metadata');
console.log('   ✓ Pedagogical engine synthesizes visual-first concise slide content!\n');

console.log('🎉 ALL 10 TEST SUITES PASSED WITH 100% SUCCESS! Visual-First AI Output Studio verified.\n');
