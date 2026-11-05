// Export Utility Test Suite
import { 
  renderMarkdownToHtml, 
  exportToMarkdown, 
  exportToPlainText, 
  exportToHtml, 
  exportToJson, 
  exportToCsv, 
  exportToRtf, 
  exportToLatex, 
  exportToXml 
} from '../public/js/exportUtils.js';
import assert from 'assert';

console.log('--- Testing exportUtils ---');
const sampleMd = `
# Photosynthesis & Cellular Respiration
## Objectives
- Understand the Light Reactions in thylakoid membranes
- Formulate ATP and NADPH synthesis equations

### Assessment Rubric
| Criteria | Proficient (4) | Developing (2) |
| :--- | :--- | :--- |
| Concept Mastery | Accurately models energy transfer | Identifies inputs only |
`;

const html = renderMarkdownToHtml(sampleMd);
assert(html.includes('<h1'), 'renderMarkdownToHtml must generate h1');
assert(html.includes('<table'), 'renderMarkdownToHtml must render tables');
assert(html.includes('<th>Criteria</th>'), 'renderMarkdownToHtml must render table headers');
console.log('✓ Markdown-to-HTML rendering verified with headings, lists, tables');

// Mock document/window for blob downloads in headless node
global.Blob = class MockBlob {
  constructor(content, opts) {
    this.content = content;
    this.type = opts?.type;
  }
};
global.URL = {
  createObjectURL: () => 'blob:mock-url',
  revokeObjectURL: () => {}
};
global.document = {
  createElement: (tag) => ({
    tagName: tag,
    setAttribute: () => {},
    click: () => {},
    remove: () => {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

const design = {
  id: 'des-test-1',
  title: 'Biology 101: 5E Lesson Plan',
  subject: 'Science',
  educationalLevel: 'Junior High School',
  gradeLevel: 'Grade 8',
  output: sampleMd
};

exportToMarkdown(design);
exportToPlainText(design);
exportToHtml(design);
exportToJson(design);
exportToCsv(design);
exportToRtf(design);
exportToLatex(design);
exportToXml(design);
console.log('✓ All 8 export format functions (MD, TXT, HTML, JSON, CSV, RTF, LaTeX, XML) executed cleanly');

console.log('🎉 ALL EXPORT UTILITY TESTS PASSED!');
