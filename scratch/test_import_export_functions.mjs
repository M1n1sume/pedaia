import fs from 'fs';

console.log('Testing exportUtils & importUtils exports...');
const importUtilsCode = fs.readFileSync('public/js/importUtils.js', 'utf8');
const exportUtilsCode = fs.readFileSync('public/js/exportUtils.js', 'utf8');

const expectedImportFunctions = [
  'parseAnyFile',
  'openUniversalImportModal',
  'extractPedagogicalContext',
  'readDocxText',
  'readPdfText'
];

for (const fn of expectedImportFunctions) {
  if (importUtilsCode.includes(`export function ${fn}`) || importUtilsCode.includes(`export async function ${fn}`)) {
    console.log(`✓ importUtils exports ${fn}`);
  } else {
    console.error(`✗ Missing ${fn} in importUtils.js`);
  }
}

const expectedExportFunctions = [
  'exportToWord',
  'exportToMarkdown',
  'exportToPlainText',
  'exportToHtml',
  'exportToCanvasLmsHtml',
  'exportToGoogleClassroomFormat',
  'exportToJson',
  'exportToCsv',
  'exportToRtf',
  'exportToLatex',
  'exportToPdfPrint',
  'openUniversalExportModal'
];

for (const fn of expectedExportFunctions) {
  if (exportUtilsCode.includes(`export function ${fn}`) || exportUtilsCode.includes(`export async function ${fn}`)) {
    console.log(`✓ exportUtils exports ${fn}`);
  } else {
    console.error(`✗ Missing ${fn} in exportUtils.js`);
  }
}
