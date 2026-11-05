// End-to-End Prompt & Synthesis Test
import { 
  buildLessonPlannerPrompt, 
  buildActivityDesignerPrompt, 
  buildQuestioningStudioPrompt, 
  buildDifferentiationStudioPrompt 
} from '../public/js/promptEngine.js';
import { synthesizePedagogicalDocument } from '../public/js/pedagogicalEngine.js';
import assert from 'assert';

console.log('--- Testing Prompt Engine & Built-in Pedagogical Synthesis ---');

// 1. Lesson Planner
const lpPrompt = buildLessonPlannerPrompt({
  subject: 'General Biology',
  educationalLevel: 'Junior High School',
  gradeLevel: 'Grade 8',
  competency: 'Investigate the cellular components and functions of plant and animal cells',
  topic: 'Plant vs Animal Cells & Organelle Specialization',
  duration: '60 minutes',
  modality: 'Face-to-Face',
  model: '5E Instructional Model'
});
assert(typeof lpPrompt === 'string' && lpPrompt.length > 100, 'Lesson planner prompt must be valid');
const lpDoc = synthesizePedagogicalDocument({ prompt: lpPrompt });
assert(lpDoc && lpDoc.output && lpDoc.output.includes('5E') && lpDoc.output.includes('Engage'), 'Lesson plan synthesis must contain 5E structure');
console.log('✓ Lesson Planner prompt and synthesis verified');

// 2. Activity Designer
const actPrompt = buildActivityDesignerPrompt({
  subject: 'Physics',
  educationalLevel: 'Senior High School',
  topic: 'Newtonian Mechanics & Momentum Conservation',
  activityType: 'Guided Inquiry Laboratory',
  modality: 'Hands-on Classroom'
});
assert(typeof actPrompt === 'string' && actPrompt.length > 100, 'Activity prompt must be valid');
const actDoc = synthesizePedagogicalDocument({ prompt: actPrompt });
assert(actDoc && actDoc.output && actDoc.output.length > 200, 'Activity synthesis must be valid');
console.log('✓ Activity Designer prompt and synthesis verified');

// 3. Questioning Studio
const questPrompt = buildQuestioningStudioPrompt({
  subject: 'History',
  topic: 'The Industrial Revolution & Socioeconomic Shifts',
  distribution: { remember: 2, understand: 2, apply: 2, analyze: 2, evaluate: 1, create: 1 }
});
assert(typeof questPrompt === 'string' && questPrompt.length > 100, 'Questioning prompt must be valid');
const questDoc = synthesizePedagogicalDocument({ prompt: questPrompt });
assert(questDoc && questDoc.output && questDoc.output.includes('Question'), 'Questioning synthesis must contain questions');
console.log('✓ Questioning Studio prompt and synthesis verified');

// 4. Differentiation Studio
const diffPrompt = buildDifferentiationStudioPrompt({
  subject: 'Mathematics',
  topic: 'Quadratic Equations & Parabolic Functions',
  tier1: 'Concrete Visual Scaffolds',
  tier2: 'Standard Algebraic Formulations',
  tier3: 'Real-world Trajectory Modeling'
});
assert(typeof diffPrompt === 'string' && diffPrompt.length > 100, 'Differentiation prompt must be valid');
const diffDoc = synthesizePedagogicalDocument({ prompt: diffPrompt });
assert(diffDoc && diffDoc.output && diffDoc.output.includes('Tier'), 'Differentiation synthesis must contain Tiered pathways');
console.log('✓ Differentiation Studio prompt and synthesis verified');

console.log('🎉 ALL PROMPT & SYNTHESIS PIPELINES VERIFIED SUCCESSFULLY!');
