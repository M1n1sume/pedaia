import assert from 'assert';

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
  scrollTo: () => {}
};
global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

try {
  const { renderAiOutputStudioView, setupAiOutputStudioListeners } = await import('../public/js/views/aiOutputStudio.js');
  console.log('Rendering AiOutputStudio...');
  const html = renderAiOutputStudioView();
  console.log('Rendered successfully! Length:', html.length);
  assert.ok(html.includes('AI Output Studio'));
} catch (err) {
  console.error('ERROR rendering AiOutputStudio:', err);
}
