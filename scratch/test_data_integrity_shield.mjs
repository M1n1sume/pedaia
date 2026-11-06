import { store } from '../public/js/state.js';

// Setup Mock LocalStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

console.log('=== RUNNING COMPREHENSIVE DATA INTEGRITY & CODE UPDATE SHIELD TESTS ===\n');

// --- Test 1: User creates projects and enters personal educator profile ---
console.log('1. User creates custom projects and personal profile info:');
store.init();

const project1 = store.saveProject({
  title: 'Advanced Thermodynamics & Entropy Unit',
  subject: 'Physics',
  gradeLevel: 'Grade 11',
  topic: 'Second Law of Thermodynamics',
  customEducatorNote: 'Special hands-on heat engine lab required'
});

const design1 = store.saveDesign({
  title: 'Heat Engine Efficiency Socratic Lab Guide',
  subject: 'Physics',
  category: 'activity-design',
  output: '# Heat Engine Lab\nProcedure and observations...'
});

const profile1 = store.saveEducatorProfile({
  name: 'Dr. Arthur Pendelton',
  title: 'Head of Physics Department',
  institution: 'Apex STEM Academy',
  department: 'Natural Sciences',
  specialization: 'Thermodynamics & Statistical Mechanics',
  bio: '20+ years designing inquiry-based physics curriculum for secondary and higher ed.'
});

console.log('   - Project saved:', project1.id, project1.title);
console.log('   - Design saved:', design1.id, design1.title);
console.log('   - Profile saved:', profile1.name, profile1.institution);

// --- Test 2: Code update / Website redeployment simulation ---
console.log('\n2. Simulating subsequent code updates & website redeployments:');
// Re-run init() as occurs when a user visits the updated website code
store.init();

const projectsAfterUpdate = store.getProjects();
const designsAfterUpdate = store.getDesigns();
const profileAfterUpdate = store.getEducatorProfile();

const projectSurvived = projectsAfterUpdate.length === 1 && projectsAfterUpdate[0].title === 'Advanced Thermodynamics & Entropy Unit';
const projectCustomFieldSurvived = projectsAfterUpdate[0].customEducatorNote === 'Special hands-on heat engine lab required';
const designSurvived = designsAfterUpdate.length === 1 && designsAfterUpdate[0].title === 'Heat Engine Efficiency Socratic Lab Guide';
const profileSurvived = profileAfterUpdate.name === 'Dr. Arthur Pendelton' && profileAfterUpdate.institution === 'Apex STEM Academy';

console.log('   - Projects preserved across code updates:', projectSurvived ? '✓ PASS' : '✗ FAIL');
console.log('   - Custom educator fields preserved:', projectCustomFieldSurvived ? '✓ PASS' : '✗ FAIL');
console.log('   - Designs preserved across code updates:', designSurvived ? '✓ PASS' : '✗ FAIL');
console.log('   - Profile info preserved across code updates:', profileSurvived ? '✓ PASS' : '✗ FAIL');

if (!projectSurvived || !projectCustomFieldSurvived || !designSurvived || !profileSurvived) {
  throw new Error('Code update disrupted or reset user projects or info!');
}

// --- Test 3: Self-Healing from Safety Vault upon Corrupted Storage Read ---
console.log('\n3. Testing Self-Healing Recovery from Vault on Storage Glitch:');
// Simulate accidental corrupted string in projects store
localStorage.setItem('pedaia_projects_v1', '{malformed_json_corrupted_during_browser_crash:');

const recoveredProjects = store.getProjects();
console.log('   - Recovered projects count:', recoveredProjects.length);
console.log('   - Recovered project title:', recoveredProjects[0]?.title);
const vaultRecoverySuccess = recoveredProjects.length === 1 && recoveredProjects[0].title === 'Advanced Thermodynamics & Entropy Unit';
console.log('   - Self-healing vault restored user project:', vaultRecoverySuccess ? '✓ PASS' : '✗ FAIL');

if (!vaultRecoverySuccess) {
  throw new Error('Failed to recover user project from integrity vault!');
}

// --- Test 4: Schema Extension (New properties added in future code) ---
console.log('\n4. Testing Additive Non-Destructive Schema Evolution:');
// User updates project with a new field introduced in future versions
const updatedProject = store.saveProject({
  id: project1.id,
  title: project1.title,
  newFutureFeatureField: 'AI Alignment Matrix v2.0'
});

const refetchedProject = store.getProjects().find(p => p.id === project1.id);
const futureFieldPreserved = refetchedProject.newFutureFeatureField === 'AI Alignment Matrix v2.0';
const originalFieldsPreserved = refetchedProject.customEducatorNote === 'Special hands-on heat engine lab required';

console.log('   - New future schema field added safely:', futureFieldPreserved ? '✓ PASS' : '✗ FAIL');
console.log('   - Original user fields retained intact:', originalFieldsPreserved ? '✓ PASS' : '✗ FAIL');

if (!futureFieldPreserved || !originalFieldsPreserved) {
  throw new Error('Schema evolution disrupted existing user fields!');
}

console.log('\n======================================================');
console.log('🎉 ALL DATA INTEGRITY & CODE PROTECTION TESTS PASSED!');
console.log('======================================================\n');
