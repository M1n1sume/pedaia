// Test loading the full dependency graph of public/js/app.js
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  dispatchEvent: () => {},
  addEventListener: () => {},
  scrollTo: () => {},
  location: { hash: '' }
};
global.document = {
  getElementById: (id) => ({
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    style: {},
    setAttribute: () => {},
    appendChild: () => {},
    remove: () => {}
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  documentElement: {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    setAttribute: () => {},
    style: {}
  },
  body: {
    appendChild: () => {}
  }
};

try {
  console.log('Importing public/js/app.js...');
  const app = await import('../public/js/app.js');
  console.log('app.js imported successfully!', Object.keys(app));
} catch (err) {
  console.error('FATAL ERROR importing app.js:', err);
}
