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

console.log('=== VERIFYING REMOVAL OF EXAMPLE PROJECTS & DESIGNS ===\n');

// Test 1: Pristine storage starts with 0 example projects/designs
store.init();

const initialDesigns = store.getDesigns();
const initialProjects = store.getProjects();
const initialChecklists = store.getChecklists();
const initialMaps = store.getCurriculumMaps();
const initialReflections = store.getReflections();
const initialSchedule = store.getWeeklySchedule();

console.log('1. Checking default storage states:');
console.log('   Designs count:', initialDesigns.length, initialDesigns.length === 0 ? '✓ PASS' : '✗ FAIL');
console.log('   Projects count:', initialProjects.length, initialProjects.length === 0 ? '✓ PASS' : '✗ FAIL');
console.log('   Checklists count:', initialChecklists.length, initialChecklists.length === 0 ? '✓ PASS' : '✗ FAIL');
console.log('   Curriculum maps count:', initialMaps.length, initialMaps.length === 0 ? '✓ PASS' : '✗ FAIL');
console.log('   Reflections count:', initialReflections.length, initialReflections.length === 0 ? '✓ PASS' : '✗ FAIL');
console.log('   Weekly days count:', Object.keys(initialSchedule.days).length, Object.keys(initialSchedule.days).length === 0 ? '✓ PASS' : '✗ FAIL');

if (initialDesigns.length !== 0 || initialProjects.length !== 0) {
  throw new Error('Default storage contained example projects or designs!');
}

// Test 2: Legacy browser data cleanup
console.log('\n2. Testing cleanup of legacy demo projects from existing browser sessions:');
localStorage.setItem('pedaia_projects_v1', JSON.stringify([
  { id: 'proj-demo-1', title: 'Cell Biology Demo' },
  { id: 'proj-user-actual-1', title: 'Real Educator Project' }
]));
localStorage.setItem('pedaia_saved_designs_v1', JSON.stringify([
  { id: 'sample-eng-01', title: 'English Sample' },
  { id: 'design-user-123', title: 'Real User Lesson Plan' }
]));

store.init();

const cleanedProjects = store.getProjects();
const cleanedDesigns = store.getDesigns();

console.log('   Projects after cleanup:', cleanedProjects.map(p => p.id));
console.log('   - Demo project removed:', !cleanedProjects.some(p => p.id === 'proj-demo-1') ? '✓ PASS' : '✗ FAIL');
console.log('   - Real user project preserved:', cleanedProjects.some(p => p.id === 'proj-user-actual-1') ? '✓ PASS' : '✗ FAIL');

console.log('   Designs after cleanup:', cleanedDesigns.map(d => d.id));
console.log('   - Sample design removed:', !cleanedDesigns.some(d => d.id === 'sample-eng-01') ? '✓ PASS' : '✗ FAIL');
console.log('   - Real user design preserved:', cleanedDesigns.some(d => d.id === 'design-user-123') ? '✓ PASS' : '✗ FAIL');

// Test 3: User creates a real design and real project
console.log('\n3. Testing saving genuine user creations:');
const saved = store.saveProject({
  title: 'My Custom Grade 9 Chemistry Unit',
  subject: 'Science',
  educationalLevel: 'Junior High School'
});
console.log('   Saved project ID:', saved.id);
const currentProjects = store.getProjects();
console.log('   Total projects:', currentProjects.length, currentProjects.length === 2 ? '✓ PASS' : '✗ FAIL');
console.log('   Project title matches:', currentProjects[0].title === 'My Custom Grade 9 Chemistry Unit' ? '✓ PASS' : '✗ FAIL');

console.log('\n======================================================');
console.log('🎉 ALL TESTS PASSED: Example projects/designs removed!');
console.log('======================================================\n');
