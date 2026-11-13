import assert from 'assert';
import { synthesizePedagogicalDocument } from '../public/js/pedagogicalEngine.js';
import { buildAiOutputStudioPrompt } from '../public/js/promptEngine.js';
import {
  resolveDesignTheme,
  parsePresentationSlides,
  parsePosterData,
  parseDiagramData,
  parseFlashcards,
  generateTeacherAnswerKey
} from '../public/js/views/aiOutputStudio.js';

console.log('🧪 RUNNING AI OUTPUT STUDIO SPECIFIC INTEGRATION TESTS...\n');

// 1. Test Theme Resolution
console.log('--- Test 1: Design Theme Resolution ---');
const presetTheme = resolveDesignTheme({ theme: 'modern-stem' });
assert.strictEqual(presetTheme.name, 'Modern STEM');
assert.ok(presetTheme.primary.includes('#'), 'Modern STEM has valid primary hex');

const customTheme = resolveDesignTheme({
  theme: 'custom',
  customPrimaryColor: '#FF5733',
  customSecondaryColor: '#33FF57',
  customBackgroundColor: 'warm-parchment',
  typographyStyle: 'scholarly-serif'
});
assert.strictEqual(customTheme.primary, '#FF5733');
assert.strictEqual(customTheme.secondary, '#33FF57');
assert.strictEqual(customTheme.bgDark, '#FDFBF7');
assert.strictEqual(customTheme.cardDark, '#FAF7F2');
assert.ok(customTheme.fontFamily.includes('Newsreader'), 'Custom font pairing reflected');
console.log('  ✓ Preset and Custom Design Theme resolution verified cleanly.');

// 2. Test All 6 Deliverables with Diverse Non-Biology Topics
console.log('\n--- Test 2: AI Output Deliverable Synthesis for Diverse Disciplines ---');

const testCases = [
  {
    category: 'presentation',
    type: 'slide-deck-5e',
    subject: 'World History',
    topic: 'Causes of World War I',
    gradeLevel: 'Grade 10',
    competency: 'Analyze militarism, alliances, imperialism, and nationalism (MAIN)',
    specCheck: '[SLIDE DECK SPECIFICATIONS]'
  },
  {
    category: 'poster',
    type: 'infographic-poster',
    subject: 'Mathematics',
    topic: 'Pythagorean Theorem & Trigonometric Ratios',
    gradeLevel: 'Grade 9',
    competency: 'Apply geometric relationships to solve right-triangle problems',
    specCheck: '[POSTER & INFOGRAPHIC SPECIFICATIONS]'
  },
  {
    category: 'worksheet',
    type: 'guided-worksheet',
    subject: 'English Literature',
    topic: 'Shakespearean Sonnet Structure & Iambic Pentameter',
    gradeLevel: 'Grade 11',
    competency: 'Analyze poetic rhythm, volta, and rhyming schemes',
    specCheck: '[WORKSHEET & LEARNING ACTIVITY SHEET (LAS) SPECIFICATIONS]'
  },
  {
    category: 'diagram',
    type: 'concept-map',
    subject: 'Computer Science',
    topic: 'Client-Server HTTP Request Lifecycle',
    gradeLevel: 'Grade 12',
    competency: 'Explain asynchronous web architecture and status protocols',
    specCheck: '[VISUAL LEARNING RESOURCE & DIAGRAM SPECIFICATIONS]'
  },
  {
    category: 'flashcards',
    type: 'study-flashcards',
    subject: 'Economics',
    topic: 'Supply, Demand, and Price Elasticity',
    gradeLevel: 'Grade 11',
    competency: 'Model market equilibrium and consumer responsiveness',
    specCheck: '[FLASHCARD & TASK CARD DECK SPECIFICATIONS]'
  },
  {
    category: 'assessment',
    type: 'rubric-matrix',
    subject: 'Chemistry',
    topic: 'Stoichiometry & Limiting Reactants',
    gradeLevel: 'Grade 10',
    competency: 'Calculate theoretical yield and identify limiting reagents',
    specCheck: '[ASSESSMENT INSTRUMENT & RUBRIC SPECIFICATIONS]'
  }
];

for (const tc of testCases) {
  const prompt = buildAiOutputStudioPrompt({
    activeCategoryId: tc.category,
    activeTypeId: tc.type,
    formData: {
      subject: tc.subject,
      topic: tc.topic,
      gradeLevel: tc.gradeLevel,
      competency: tc.competency
    },
    designOptions: {
      theme: 'custom',
      customPrimaryColor: '#4F46E5',
      customSecondaryColor: '#14B8A6'
    }
  });

  assert.ok(prompt.includes(tc.specCheck), `Prompt missing spec tag for ${tc.category}`);
  assert.ok(prompt.includes(tc.topic), `Prompt missing topic for ${tc.category}`);

  // Test Synthesis in Pedagogical Engine
  const res = synthesizePedagogicalDocument(prompt, 'offline', 'pedagogical-v2');
  const synthesized = res.output;
  assert.ok(synthesized.length > 200, `Synthesized output too short for ${tc.category}`);
  assert.ok(synthesized.includes(tc.topic), `Synthesized output did not contain requested topic: ${tc.topic}`);
  
  // Verify NO hardcoded biology fallbacks appear in non-biology topics!
  assert.ok(!synthesized.toLowerCase().includes('thylakoid'), `Found hardcoded "thylakoid" in ${tc.topic} output`);
  assert.ok(!synthesized.toLowerCase().includes('calvin cycle'), `Found hardcoded "calvin cycle" in ${tc.topic} output`);

  console.log(`  ✓ ${tc.category.toUpperCase()} (${tc.subject} - ${tc.topic}) synthesized with 100% topic fidelity (${synthesized.length} chars)`);
}

// 3. Test Parsers and Fallbacks for Dynamic Topic Relevance
console.log('\n--- Test 3: Parsers & Dynamic Fallback Integrity ---');

const dummyForm = {
  subject: 'Economics',
  topic: 'Supply and Demand Elasticity',
  gradeLevel: 'Grade 11',
  competency: 'Analyze price equilibrium and market shifts'
};

// A. Test Slide Parser (with empty string fallback)
const fallbackSlides = parsePresentationSlides('', dummyForm);
assert.ok(fallbackSlides.length >= 5, 'Fallback slides should have at least 5 slides');
assert.ok(fallbackSlides[0].title.includes(dummyForm.topic), 'Fallback slide 1 title should contain topic');
assert.ok(!JSON.stringify(fallbackSlides).includes('thylakoid'), 'Fallback slides should NOT contain thylakoid biology');
console.log(`  ✓ Presentation Parser fallback generates ${fallbackSlides.length} topic-specific slides without biology mocks.`);

// B. Test Poster Parser (with empty string fallback)
const fallbackPoster = parsePosterData('', dummyForm);
assert.strictEqual(fallbackPoster.headline, dummyForm.topic.toUpperCase());
assert.ok(fallbackPoster.cards.length === 3, 'Fallback poster should have 3 cards');
assert.ok(fallbackPoster.takeaways.includes(dummyForm.topic), 'Fallback poster takeaway should contain topic');
assert.ok(!JSON.stringify(fallbackPoster).includes('thylakoid'), 'Fallback poster should NOT contain thylakoid biology');
console.log('  ✓ Poster Parser fallback generates 3 topic-specific pillars and statistics without biology mocks.');

// C. Test Diagram Parser (with empty string fallback)
const fallbackDiagram = parseDiagramData('', dummyForm);
assert.ok(fallbackDiagram.node1.title.includes(dummyForm.topic), 'Node 1 title should contain topic');
assert.ok(fallbackDiagram.node2.desc.includes(dummyForm.topic), 'Node 2 desc should contain topic');
assert.ok(!JSON.stringify(fallbackDiagram).includes('thylakoid'), 'Fallback diagram should NOT contain thylakoid biology');
console.log('  ✓ Diagram Parser fallback generates 3 topic-specific nodes without biology mocks.');

// D. Test Flashcard Parser (with empty string fallback)
const fallbackCards = parseFlashcards('', dummyForm);
assert.ok(fallbackCards.length >= 4, 'Fallback flashcards should have at least 4 cards');
assert.ok(fallbackCards[0].front.includes(dummyForm.topic), 'Flashcard 1 should be about topic');
assert.ok(!JSON.stringify(fallbackCards).includes('thylakoid'), 'Fallback flashcards should NOT contain thylakoid biology');
console.log(`  ✓ Flashcard Parser fallback generates ${fallbackCards.length} topic-specific cards without biology mocks.`);

// E. Test Teacher Answer Key (with fallback)
const answerKey = generateTeacherAnswerKey('', dummyForm);
assert.ok(answerKey.includes(dummyForm.topic.toUpperCase()), 'Answer key should contain topic');
assert.ok(!answerKey.includes('6CO₂ + 6H₂O'), 'Answer key should NOT contain hardcoded photosynthesis equation');
console.log('  ✓ Teacher Answer Key generator generates topic-specific rubric & criteria without biology mocks.');

console.log('\n======================================================');
console.log('🎉 ALL AI OUTPUT STUDIO VERIFICATION TESTS PASSED!');
console.log('======================================================\n');
