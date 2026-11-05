// PEDAIA Universal File Import Engine
// Capable of reading, parsing, and extracting instructional content from ANY file type:
// .txt, .md, .docx, .pdf, .json, .csv, .tsv, .html, .xml, .rtf, .tex, .yaml, and arbitrary binaries/custom files.

import { store } from './state.js';

/**
 * Parses any uploaded File object into an instructional payload.
 * @param {File} file 
 * @returns {Promise<{ filename: string, extension: string, size: number, type: string, text: string, rawDataUrl?: string, metadata: object, isBackup?: boolean }>}
 */
export async function parseAnyFile(file) {
  const filename = file.name;
  const extension = (filename.includes('.') ? filename.split('.').pop() : '').toLowerCase();
  const size = file.size;
  const mimeType = file.type || 'application/octet-stream';

  return new Promise((resolve, reject) => {
    // 1. Text-based files & known textual formats
    const textExtensions = [
      'txt', 'md', 'markdown', 'html', 'htm', 'xml', 'csv', 'tsv', 'json',
      'rtf', 'tex', 'latex', 'rst', 'qmd', 'yaml', 'yml', 'ini', 'env',
      'sh', 'py', 'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'sql', 'log',
      'java', 'c', 'cpp', 'h', 'php', 'rb', 'prompt'
    ];

    if (textExtensions.includes(extension) || mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawText = e.target.result;
          let parsedText = rawText;
          let isBackup = false;
          let metadata = { detectedFormat: extension.toUpperCase() };

          // Specific handling for JSON
          if (extension === 'json' || mimeType === 'application/json') {
            try {
              const parsedJson = JSON.parse(rawText);
              if (parsedJson.designs && Array.isArray(parsedJson.designs)) {
                isBackup = true;
                metadata.backupDesignCount = parsedJson.designs.length;
                metadata.backupTemplateCount = (parsedJson.templates || []).length;
                parsedText = `# PEDAIA Backup Archive\n\nContains ${parsedJson.designs.length} instructional designs and ${(parsedJson.templates || []).length} prompt templates.\n\n` +
                  parsedJson.designs.map(d => `### ${d.title}\n- **Subject:** ${d.subject}\n- **Level:** ${d.educationalLevel}\n- **Category:** ${d.categoryLabel || d.category}\n`).join('\n');
              } else if (parsedJson.output && parsedJson.title) {
                parsedText = parsedJson.output;
                metadata.title = parsedJson.title;
                metadata.subject = parsedJson.subject;
                metadata.category = parsedJson.category;
              } else {
                parsedText = '```json\n' + JSON.stringify(parsedJson, null, 2) + '\n```';
              }
            } catch (err) {
              // keep as raw text
            }
          }

          // Specific handling for CSV / TSV
          if (extension === 'csv' || extension === 'tsv') {
            parsedText = convertDelimitedToMarkdownTable(rawText, extension === 'tsv' ? '\t' : ',');
          }

          // Specific handling for HTML
          if (extension === 'html' || extension === 'htm') {
            parsedText = extractTextFromHtml(rawText);
          }

          resolve({
            filename,
            extension,
            size,
            type: mimeType,
            text: parsedText,
            metadata,
            isBackup
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
      return;
    }

    // 2. Microsoft Word Document (.docx)
    if (extension === 'docx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const extractedText = await extractTextFromDocx(arrayBuffer);
          resolve({
            filename,
            extension,
            size,
            type: mimeType,
            text: extractedText,
            metadata: { detectedFormat: 'Microsoft Word Document (.docx)' }
          });
        } catch (err) {
          // Fallback to text string extraction
          resolve({
            filename,
            extension,
            size,
            type: mimeType,
            text: `# ${filename}\n\n*Extracted from Word Document:*\n\n` + extractAsciiStrings(e.target.result),
            metadata: { detectedFormat: 'Word Document (Binary Parsed)' }
          });
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Word document.'));
      reader.readAsArrayBuffer(file);
      return;
    }

    // 3. PDF Document (.pdf) or Any Binary/Arbitrary File Type
    const binaryReader = new FileReader();
    binaryReader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const readableStrings = extractAsciiStrings(arrayBuffer);
        const dataUrlReader = new FileReader();
        dataUrlReader.onload = (ev) => {
          resolve({
            filename,
            extension: extension || 'bin',
            size,
            type: mimeType,
            text: readableStrings.length > 100 
              ? `# Imported File: ${filename}\n\n**File Details:** ${size} bytes • MIME: ${mimeType}\n\n---\n\n### Extracted Text Content:\n\n${readableStrings}`
              : `# Imported File: ${filename}\n\n**File Details:** ${size} bytes • MIME: ${mimeType}\n\n*Binary file imported successfully. Content has been attached as an instructional resource.*`,
            rawDataUrl: ev.target.result,
            metadata: {
              detectedFormat: extension.toUpperCase() || 'Binary File',
              isBinary: true
            }
          });
        };
        dataUrlReader.readAsDataURL(file);
      } catch (err) {
        reject(err);
      }
    };
    binaryReader.onerror = () => reject(new Error('Failed to read file.'));
    binaryReader.readAsArrayBuffer(file);
  });
}

/**
 * Extracts readable textual XML from DOCX ZIP array buffer.
 */
async function extractTextFromDocx(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  // Scan for word/document.xml in ZIP
  let textContent = '';

  // Look for XML tags in the buffer
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const fullStr = decoder.decode(bytes);

  // Search for XML paragraphs <w:p>
  const paragraphMatches = fullStr.match(/<w:p(?:\s|>).*?<\/w:p>/g);
  if (paragraphMatches && paragraphMatches.length > 0) {
    const paragraphs = [];
    for (const p of paragraphMatches) {
      // extract text nodes <w:t>...</w:t>
      const textMatches = p.match(/<w:t(?:\s|>)[^>]*>(.*?)<\/w:t>/g);
      if (textMatches) {
        const pText = textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
        if (pText.trim()) paragraphs.push(pText.trim());
      }
    }
    if (paragraphs.length > 0) {
      return paragraphs.join('\n\n');
    }
  }

  // Fallback to ASCII text chunk extraction
  return extractAsciiStrings(arrayBuffer);
}

/**
 * Extracts readable strings from any arbitrary binary ArrayBuffer.
 */
function extractAsciiStrings(arrayBuffer, minLength = 4) {
  const bytes = new Uint8Array(arrayBuffer);
  let result = [];
  let currentWord = '';

  for (let i = 0; i < bytes.length && result.length < 500; i++) {
    const b = bytes[i];
    // ASCII printable range: space (32) to ~ (126), plus newline and tab
    if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
      currentWord += String.fromCharCode(b);
    } else {
      if (currentWord.trim().length >= minLength) {
        // filter out common binary noise
        const cleaned = currentWord.trim();
        if (/^[a-zA-Z0-9\s.,!?:;'"()\[\]\-_+=/\\%$#@*]{4,}$/.test(cleaned)) {
          result.push(cleaned);
        }
      }
      currentWord = '';
    }
  }

  if (currentWord.trim().length >= minLength) {
    result.push(currentWord.trim());
  }

  return result.join('\n');
}

/**
 * Converts CSV/TSV table text into clean Markdown table.
 */
function convertDelimitedToMarkdownTable(text, delimiter = ',') {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return '';

  const parseRow = (line) => {
    // Regex to handle quoted strings with commas
    const pattern = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
    const row = [];
    let match;
    while ((match = pattern.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      row.push((val || '').trim().replace(/\|/g, '\\|'));
    }
    return row;
  };

  const rows = lines.map(parseRow);
  if (rows.length === 0) return text;

  const header = rows[0];
  const separator = header.map(() => '---');
  const body = rows.slice(1);

  let md = `| ${header.join(' | ')} |\n| ${separator.join(' | ')} |\n`;
  for (const r of body) {
    // pad row if shorter than header
    while (r.length < header.length) r.push('');
    md += `| ${r.slice(0, header.length).join(' | ')} |\n`;
  }
  return md;
}

/**
 * Strips HTML tags and preserves readable headings and lists.
 */
function extractTextFromHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  if (!body) return html.replace(/<[^>]+>/g, '');

  let md = '';
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) md += text + ' ';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        const level = '#'.repeat(parseInt(tag[1], 10));
        md += `\n\n${level} ${node.textContent.trim()}\n\n`;
      } else if (tag === 'p') {
        md += `\n\n${node.textContent.trim()}\n\n`;
      } else if (tag === 'li') {
        md += `\n- ${node.textContent.trim()}`;
      } else if (tag === 'blockquote') {
        md += `\n\n> ${node.textContent.trim()}\n\n`;
      } else if (tag === 'tr') {
        const cells = Array.from(node.querySelectorAll('th, td')).map(c => c.textContent.trim());
        if (cells.length > 0) md += `| ${cells.join(' | ')} |\n`;
      } else if (['script', 'style', 'head', 'meta'].includes(tag)) {
        // skip
      } else {
        node.childNodes.forEach(walk);
      }
    }
  };

  walk(body);
  return md.trim() || body.textContent.trim();
}

/**
 * Opens the Universal File Import Modal Dialog.
 * @param {object} options
 * @param {(action: string, data: object) => void} options.onAction
 * @param {(msg: string, type: string) => void} options.showToast
 */
export function openUniversalImportModal({ onAction, showToast }) {
  const modalHtml = `
    <div id="universal-import-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col max-h-[92vh] space-y-4">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Universal File Importer</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Import curriculum documents, syllabi, Word files, PDFs, or data in any format</p>
            </div>
          </div>
          <button id="close-import-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Drag & Drop Zone -->
        <div id="import-dropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-850/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 group">
          <input type="file" id="universal-file-input" class="hidden">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </div>
          <p class="text-sm font-bold text-slate-800 dark:text-white">Choose any file or drag & drop here</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports Word (.docx), PDF (.pdf), Markdown (.md), Text (.txt), JSON, CSV/TSV, HTML, RTF, LaTeX, and custom curriculum files
          </p>
          <div class="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">.docx / .doc</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">.pdf / .txt</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">.md / .html</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">.json / .csv</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Any file (*.*)</span>
          </div>
        </div>

        <!-- File Parsed Preview Area (Initially Hidden) -->
        <div id="import-preview-section" class="hidden space-y-3 flex-1 overflow-y-auto">
          
          <!-- File Metadata Card -->
          <div class="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="p-2 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs" id="preview-ext-badge">DOC</span>
              <div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm" id="preview-file-name">filename.docx</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400" id="preview-file-details">12.4 KB • Detected Text Content</p>
              </div>
            </div>
            <button id="import-clear-file-btn" class="text-xs text-slate-400 hover:text-rose-600 font-medium">Clear</button>
          </div>

          <!-- Configuration Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Instructional Title</label>
              <input type="text" id="import-design-title" class="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject / Discipline</label>
              <input type="text" id="import-design-subject" value="Interdisciplinary" class="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
            </div>
          </div>

          <!-- Parsed Content Textarea -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Extracted Document Content</label>
              <span class="text-[10.5px] text-slate-400" id="preview-char-count">0 characters</span>
            </div>
            <textarea id="import-extracted-text" rows="7" class="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none leading-relaxed"></textarea>
          </div>

          <!-- Destination Target Selector -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Studio Destination / Action:</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="import-action-grid">
              
              <button type="button" data-action="save-to-designs" class="action-choice-btn p-2.5 rounded-xl border text-left border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-500 transition-all">
                <span class="text-xs font-bold text-slate-900 dark:text-white block">Save to My Designs</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Add to instructional library</span>
              </button>

              <button type="button" data-action="open-workspace" class="action-choice-btn p-2.5 rounded-xl border text-left border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-slate-300 transition-all">
                <span class="text-xs font-bold text-slate-900 dark:text-white block">Open in Workspace</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Edit & refine directly</span>
              </button>

              <button type="button" data-action="load-lesson-planner" class="action-choice-btn p-2.5 rounded-xl border text-left border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-slate-300 transition-all">
                <span class="text-xs font-bold text-slate-900 dark:text-white block">Lesson Planner</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Use as curriculum context</span>
              </button>

              <button type="button" data-action="load-activity-designer" class="action-choice-btn p-2.5 rounded-xl border text-left border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-slate-300 transition-all">
                <span class="text-xs font-bold text-slate-900 dark:text-white block">Activity Designer</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Adapt into active task</span>
              </button>

              <button type="button" data-action="load-questioning" class="action-choice-btn p-2.5 rounded-xl border text-left border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-slate-300 transition-all">
                <span class="text-xs font-bold text-slate-900 dark:text-white block">Questioning Studio</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Generate Bloom's items</span>
              </button>

              <button type="button" data-action="load-differentiation" class="action-choice-btn p-2.5 rounded-xl border text-left border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-slate-300 transition-all">
                <span class="text-xs font-bold text-slate-900 dark:text-white block">Differentiation</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Tier for diverse learners</span>
              </button>

            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button id="cancel-import-btn" class="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button id="execute-import-btn" disabled class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>Complete Import</span>
          </button>
        </div>

      </div>
    </div>
  `;

  const existing = document.getElementById('universal-import-modal-overlay');
  if (existing) existing.remove();

  const c = document.createElement('div');
  c.innerHTML = modalHtml;
  document.body.appendChild(c.firstElementChild);

  const modal = document.getElementById('universal-import-modal-overlay');
  const close = () => modal.remove();

  document.getElementById('close-import-modal-btn').addEventListener('click', close);
  document.getElementById('cancel-import-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  const dropzone = document.getElementById('import-dropzone');
  const fileInput = document.getElementById('universal-file-input');
  const previewSection = document.getElementById('import-preview-section');
  const executeBtn = document.getElementById('execute-import-btn');
  let currentParsedData = null;
  let selectedAction = 'save-to-designs';

  dropzone.addEventListener('click', () => fileInput.click());

  // Drag and drop handlers
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('border-indigo-600', 'bg-indigo-50/50', 'dark:bg-indigo-950/40');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-indigo-600', 'bg-indigo-50/50', 'dark:bg-indigo-950/40');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) processFile(files[0]);
  });

  async function processFile(file) {
    try {
      showToast(`Reading and parsing "${file.name}"...`, 'info');
      const parsed = await parseAnyFile(file);
      currentParsedData = parsed;

      // Populate preview
      document.getElementById('preview-ext-badge').textContent = (parsed.extension || 'FILE').toUpperCase();
      document.getElementById('preview-file-name').textContent = parsed.filename;
      document.getElementById('preview-file-details').textContent = `${(parsed.size / 1024).toFixed(1)} KB • Detected: ${parsed.metadata.detectedFormat || parsed.type}`;
      document.getElementById('import-design-title').value = parsed.metadata.title || parsed.filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      document.getElementById('import-design-subject').value = parsed.metadata.subject || 'Interdisciplinary';
      document.getElementById('import-extracted-text').value = parsed.text;
      document.getElementById('preview-char-count').textContent = `${parsed.text.length.toLocaleString()} characters`;

      previewSection.classList.remove('hidden');
      dropzone.classList.add('hidden');
      executeBtn.disabled = false;

      // If full backup detected, suggest restore
      if (parsed.isBackup) {
        if (confirm(`Detected full PEDAIA system backup with ${parsed.metadata.backupDesignCount} designs! Would you like to restore all designs and templates immediately?`)) {
          store.importAllData(parsed.text);
          close();
          showToast(`Restored ${parsed.metadata.backupDesignCount} designs from backup!`, 'success');
          if (onAction) onAction('backup-restored', {});
        }
      }
    } catch (err) {
      showToast(`Error reading file: ${err.message}`, 'error');
    }
  }

  // Clear file
  document.getElementById('import-clear-file-btn').addEventListener('click', () => {
    currentParsedData = null;
    previewSection.classList.add('hidden');
    dropzone.classList.remove('hidden');
    executeBtn.disabled = true;
    fileInput.value = '';
  });

  // Action choice buttons
  modal.querySelectorAll('.action-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.action-choice-btn').forEach(b => {
        b.classList.remove('border-indigo-600', 'bg-indigo-50/70', 'dark:bg-indigo-950/60', 'ring-1', 'ring-indigo-500');
        b.classList.add('border-slate-200', 'dark:border-slate-750', 'bg-white', 'dark:bg-slate-850');
      });
      btn.classList.remove('border-slate-200', 'dark:border-slate-750', 'bg-white', 'dark:bg-slate-850');
      btn.classList.add('border-indigo-600', 'bg-indigo-50/70', 'dark:bg-indigo-950/60', 'ring-1', 'ring-indigo-500');
      selectedAction = btn.getAttribute('data-action');
    });
  });

  // Execute button
  executeBtn.addEventListener('click', () => {
    if (!currentParsedData) return;

    const title = document.getElementById('import-design-title').value.trim() || currentParsedData.filename;
    const subject = document.getElementById('import-design-subject').value.trim() || 'Interdisciplinary';
    const text = document.getElementById('import-extracted-text').value;

    const newDesign = {
      id: 'design-' + Date.now(),
      title,
      category: 'lesson-planning',
      categoryLabel: 'Imported Material',
      subject,
      educationalLevel: 'Undergraduate',
      gradeLevel: 'College Level',
      topic: title,
      competency: `Curriculum standard imported from source file: ${currentParsedData.filename}`,
      duration: '60 minutes',
      modality: 'Face-to-Face',
      output: text,
      status: 'In Review',
      reviewScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      importedFrom: {
        filename: currentParsedData.filename,
        size: currentParsedData.size,
        type: currentParsedData.type
      }
    };

    if (selectedAction === 'save-to-designs' || selectedAction === 'open-workspace') {
      store.saveDesign(newDesign);
      showToast(`Imported "${title}" into My Instructional Designs!`, 'success');
      close();
      if (onAction) {
        onAction(selectedAction, { designId: newDesign.id, design: newDesign });
      }
    } else {
      // Sent to studio builder
      close();
      showToast(`Loaded "${currentParsedData.filename}" into Studio builder.`, 'info');
      if (onAction) {
        onAction(selectedAction, {
          title,
          subject,
          text,
          filename: currentParsedData.filename
        });
      }
    }
  });
}
