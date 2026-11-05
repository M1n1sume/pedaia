// PEDAIA Universal Export Utilities
// Supports exporting instructional materials to ANY file type:
// Word (.doc / .docx), PDF, Markdown (.md), Plain Text (.txt), HTML (.html),
// JSON (.json), CSV (.csv), RTF (.rtf), LaTeX (.tex), XML (.xml), and arbitrary custom extensions.

export function exportToPrintablePDF(design) {
  openPrintableWindow(design);
}

export function openPrintableWindow(design) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable view.');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(design.title || 'Instructional Design')} — PEDAIA</title>
  <style>
    body { background: #FFFFFF; color: #0F172A; padding: 40px; max-width: 900px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; line-height: 1.6; }
    .print-header { border-bottom: 2px solid #312E81; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { background: #EEF2FF; color: #312E81; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; display: inline-block; margin-right: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12.5px; }
    th { background: #F1F5F9; border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; font-weight: 700; color: #0F172A; }
    td { border: 1px solid #CBD5E1; padding: 8px 10px; vertical-align: top; }
    tr:nth-child(even) td { background: #F8FAFC; }
    blockquote { border-left: 4px solid #7C3AED; background: #F5F3FF; padding: 10px 14px; margin: 12px 0; font-style: italic; }
    h1 { font-size: 22px; color: #312E81; margin: 16px 0 8px; font-family: serif; }
    h2 { font-size: 17px; color: #312E81; margin: 18px 0 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
    h3 { font-size: 14.5px; color: #334155; margin: 14px 0 6px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; display: flex; gap: 10px;">
    <button onclick="window.print()" style="background:#312E81; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Print / Save as PDF</button>
    <button onclick="window.close()" style="background:#E2E8F0; color:#334155; padding:8px 16px; border:none; border-radius:6px; cursor:pointer;">Close</button>
  </div>
  <div class="print-header">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:800; color:#312E81; font-size:20px; letter-spacing:-0.5px;">PEDAIA</span>
      <span style="color:#64748B; font-size:11px;">AI-Powered Instructional Design Studio</span>
    </div>
    <h1 style="font-size:22px; color:#312E81; margin:8px 0;">${escapeHtml(design.title)}</h1>
    <div style="margin-top:8px;">
      <span class="badge">${escapeHtml(design.subject || 'General')}</span>
      <span class="badge">${escapeHtml(design.educationalLevel || '')} ${escapeHtml(design.gradeLevel || '')}</span>
      <span class="badge">${escapeHtml(design.categoryLabel || design.category || '')}</span>
      <span class="badge">${escapeHtml(design.duration || '')}</span>
    </div>
  </div>
  <div class="prose-academic">
    ${renderMarkdownToHtml(design.output || '')}
  </div>
  <footer style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center;">
    Designed with PEDAIA • Reviewed and Verified for Pedagogical Practice
  </footer>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportToDocx(design) {
  const cleanTitle = getSafeFilename(design.title);
  const renderedHtml = renderMarkdownToHtml(design.output || '');

  const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(design.title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #1E293B; }
    h1 { font-size: 18pt; color: #312E81; border-bottom: 2pt solid #7C3AED; padding-bottom: 6pt; margin-top: 16pt; }
    h2 { font-size: 14pt; color: #312E81; margin-top: 14pt; }
    h3 { font-size: 12pt; color: #334155; margin-top: 10pt; }
    table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 10pt; }
    th { background-color: #F1F5F9; color: #0F172A; font-weight: bold; border: 1pt solid #CBD5E1; padding: 6pt; text-align: left; }
    td { border: 1pt solid #CBD5E1; padding: 6pt; vertical-align: top; }
    tr:nth-child(even) td { background-color: #F8FAFC; }
    blockquote { border-left: 3pt solid #7C3AED; background-color: #F5F3FF; padding: 8pt; margin: 10pt 0; }
    .doc-meta { background: #F8FAFC; border: 1pt solid #E2E8F0; padding: 10pt; margin-bottom: 16pt; font-size: 10pt; }
  </style>
</head>
<body>
  <div style="font-size: 9pt; color: #64748B; text-align: right; margin-bottom: 8pt;">PEDAIA — AI-Powered Instructional Design Studio</div>
  <h1>${escapeHtml(design.title)}</h1>
  <div class="doc-meta">
    <p><strong>Subject:</strong> ${escapeHtml(design.subject || 'N/A')} &nbsp;|&nbsp; <strong>Level:</strong> ${escapeHtml(design.educationalLevel || 'N/A')} ${escapeHtml(design.gradeLevel || '')}</p>
    <p><strong>Category:</strong> ${escapeHtml(design.categoryLabel || design.category || 'N/A')} &nbsp;|&nbsp; <strong>Modality:</strong> ${escapeHtml(design.modality || 'Face-to-Face')} &nbsp;|&nbsp; <strong>Duration:</strong> ${escapeHtml(design.duration || 'N/A')}</p>
    ${design.competency ? `<p><strong>Curriculum Standard:</strong> ${escapeHtml(design.competency)}</p>` : ''}
  </div>
  ${renderedHtml}
  <hr style="margin-top: 30pt; border: 0; border-top: 1pt solid #CBD5E1;">
  <p style="font-size: 8.5pt; color: #94A3B8; text-align: center;">Generated and verified via PEDAIA • Instructional Material For Educational Practice</p>
</body>
</html>`;

  triggerDownload(new Blob(['\ufeff', docContent], { type: 'application/msword;charset=utf-8' }), `${cleanTitle}.doc`);
}

export function exportToMarkdown(design) {
  const cleanTitle = getSafeFilename(design.title);
  const content = `---\n` +
    `title: "${design.title}"\n` +
    `subject: "${design.subject || ''}"\n` +
    `level: "${design.educationalLevel || ''} ${design.gradeLevel || ''}"\n` +
    `category: "${design.categoryLabel || design.category || ''}"\n` +
    `duration: "${design.duration || ''}"\n` +
    `modality: "${design.modality || ''}"\n` +
    `verified: ${design.status === 'Verified'}\n` +
    `date: "${new Date().toISOString()}"\n` +
    `generator: "PEDAIA AI-Powered Instructional Design Studio"\n` +
    `---\n\n` +
    `# ${design.title}\n\n` +
    `> **Subject:** ${design.subject || ''} | **Level:** ${design.educationalLevel || ''} ${design.gradeLevel || ''}\n` +
    `> **Category:** ${design.categoryLabel || design.category || ''} | **Duration:** ${design.duration || ''} | **Modality:** ${design.modality || ''}\n\n` +
    `---\n\n` +
    `${design.output || ''}\n\n` +
    `---\n*Exported from PEDAIA — AI-Powered Instructional Design Studio on ${new Date().toLocaleDateString()}*`;

  triggerDownload(new Blob([content], { type: 'text/markdown;charset=utf-8' }), `${cleanTitle}.md`);
}

export function exportToPlainText(design) {
  const cleanTitle = getSafeFilename(design.title);
  let text = `${design.title.toUpperCase()}\n` +
    `PEDAIA — AI-Powered Instructional Design Studio\n` +
    `================================================================================\n` +
    `Subject:           ${design.subject || 'N/A'}\n` +
    `Educational Level: ${design.educationalLevel || 'N/A'} ${design.gradeLevel || ''}\n` +
    `Category:          ${design.categoryLabel || design.category || 'N/A'}\n` +
    `Duration:          ${design.duration || 'N/A'}\n` +
    `Modality:          ${design.modality || 'Face-to-Face'}\n` +
    `Curriculum Target: ${design.competency || 'N/A'}\n` +
    `================================================================================\n\n` +
    stripMarkdownToPlainText(design.output || '');

  triggerDownload(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${cleanTitle}.txt`);
}

export function exportToHtml(design) {
  const cleanTitle = getSafeFilename(design.title);
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(design.title)} — PEDAIA</title>
  <style>
    :root { --primary: #312E81; --secondary: #7C3AED; --navy: #312E81; --bg: #F8FAFC; --surface: #FFFFFF; --text: #334155; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif; line-height: 1.65; color: var(--text); background: var(--bg); margin: 0; padding: 40px 20px; }
    .container { max-width: 860px; margin: 0 auto; background: var(--surface); padding: 48px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
    .header-bar { border-bottom: 2px solid var(--primary); padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 13px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
    h1 { color: var(--navy); font-size: 26px; margin: 10px 0; font-family: "Newsreader", Georgia, serif; }
    .meta-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .tag { background: #EEF2FF; color: var(--primary); font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th, td { border: 1px solid #CBD5E1; padding: 10px 12px; text-align: left; }
    th { background: #F1F5F9; font-weight: 700; color: var(--navy); }
    tr:nth-child(even) td { background: #F8FAFC; }
    blockquote { border-left: 4px solid var(--secondary); background: #F5F3FF; margin: 16px 0; padding: 12px 18px; border-radius: 0 8px 8px 0; font-style: italic; }
    h2 { color: var(--navy); margin-top: 28px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; font-size: 19px; }
    h3 { color: #1E293B; margin-top: 20px; font-size: 16px; }
    footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div class="brand">PEDAIA • AI-Powered Instructional Design Studio</div>
      <h1>${escapeHtml(design.title)}</h1>
      <div class="meta-tags">
        <span class="tag">Subject: ${escapeHtml(design.subject || 'General')}</span>
        <span class="tag">Level: ${escapeHtml(design.educationalLevel || '')} ${escapeHtml(design.gradeLevel || '')}</span>
        <span class="tag">Category: ${escapeHtml(design.categoryLabel || design.category || '')}</span>
        <span class="tag">Duration: ${escapeHtml(design.duration || 'N/A')}</span>
        <span class="tag">Status: ${escapeHtml(design.status || 'Draft')}</span>
      </div>
    </div>
    <div class="content">
      ${renderMarkdownToHtml(design.output || '')}
    </div>
    <footer>
      Created & Verified with PEDAIA • Academic Learning Atelier • ${new Date().toLocaleDateString()}
    </footer>
  </div>
</body>
</html>`;

  triggerDownload(new Blob([htmlContent], { type: 'text/html;charset=utf-8' }), `${cleanTitle}.html`);
}

export function exportToJson(design) {
  const cleanTitle = getSafeFilename(design.title);
  const jsonPayload = JSON.stringify(design, null, 2);
  triggerDownload(new Blob([jsonPayload], { type: 'application/json;charset=utf-8' }), `${cleanTitle}.json`);
}

export function exportToCsv(design) {
  const cleanTitle = getSafeFilename(design.title);
  const rows = [
    ['Field', 'Value'],
    ['Title', design.title || ''],
    ['Category', design.categoryLabel || design.category || ''],
    ['Subject', design.subject || ''],
    ['Educational Level', design.educationalLevel || ''],
    ['Grade Level', design.gradeLevel || ''],
    ['Curriculum Competency', design.competency || ''],
    ['Duration', design.duration || ''],
    ['Modality', design.modality || ''],
    ['Status', design.status || ''],
    ['Review Score', `${design.reviewScore || 0}/7`],
    ['Created Date', design.createdAt || ''],
    ['Full Instructional Content', (design.output || '').replace(/"/g, '""')]
  ];

  const csvString = rows.map(r => `"${r[0]}","${r[1]}"`).join('\r\n');
  triggerDownload(new Blob(['\ufeff', csvString], { type: 'text/csv;charset=utf-8' }), `${cleanTitle}.csv`);
}

export function exportToRtf(design) {
  const cleanTitle = getSafeFilename(design.title);
  const plainText = stripMarkdownToPlainText(design.output || '')
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par\n');

  const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fswiss\\fcharset0 Calibri;}}
{\\colortbl;\\red79\\green70\\blue229;\\red23\\green37\\blue84;\\red100\\green116\\blue139;}
\\viewkind4\\uc1\\pard\\f0\\fs28\\b\\cf2 ${escapeRtf(design.title)}\\b0\\par
\\fs18\\cf3 PEDAIA Instructional Design Studio • Subject: ${escapeRtf(design.subject || 'General')} • Level: ${escapeRtf(design.educationalLevel || '')}\\par
\\cf1 ____________________________________________________________________\\cf0\\par\\par
\\fs20
${plainText}
\\par\\par\\cf3\\fs16 Generated with PEDAIA • Verified for Instructional Practice\\par
}`;

  triggerDownload(new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' }), `${cleanTitle}.rtf`);
}

export function exportToLatex(design) {
  const cleanTitle = getSafeFilename(design.title);
  const latexBody = (design.output || '')
    .replace(/\\/g, '\\textbackslash ')
    .replace(/#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde ')
    .replace(/\^/g, '\\textasciicircum ');

  const latexContent = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{booktabs}
\\usepackage{xcolor}

\\title{\\textbf{${design.title.replace(/[_#$&%]/g, '\\$&')}}}
\\author{PEDAIA Instructional Studio}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Instructional design for \\textbf{${(design.subject || 'General').replace(/[_#$&%]/g, '\\$&')}} at the \\textbf{${(design.educationalLevel || '').replace(/[_#$&%]/g, '\\$&')}} level.
Category: ${(design.categoryLabel || design.category || '').replace(/[_#$&%]/g, '\\$&')} | Duration: ${(design.duration || '').replace(/[_#$&%]/g, '\\$&')}
\\end{abstract}

\\section*{Instructional Plan}
${latexBody}

\\vfill
\\footnotesize\\noindent Generated with \\textbf{PEDAIA} (AI-Powered Instructional Design Studio).
\\end{document}
`;

  triggerDownload(new Blob([latexContent], { type: 'application/x-latex;charset=utf-8' }), `${cleanTitle}.tex`);
}

export function exportToXml(design) {
  const cleanTitle = getSafeFilename(design.title);
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<instructionalDesign xmlns="urn:pedaia:edtech:v1" id="${escapeXml(design.id || 'design-0')}">
  <metadata>
    <title>${escapeXml(design.title)}</title>
    <category id="${escapeXml(design.category || '')}">${escapeXml(design.categoryLabel || design.category || '')}</category>
    <discipline>${escapeXml(design.subject || '')}</discipline>
    <educationalLevel>${escapeXml(design.educationalLevel || '')}</educationalLevel>
    <gradeLevel>${escapeXml(design.gradeLevel || '')}</gradeLevel>
    <competencyStandard>${escapeXml(design.competency || '')}</competencyStandard>
    <duration>${escapeXml(design.duration || '')}</duration>
    <modality>${escapeXml(design.modality || '')}</modality>
    <status>${escapeXml(design.status || 'Draft')}</status>
    <reviewScore max="7">${design.reviewScore || 0}</reviewScore>
    <createdAt>${escapeXml(design.createdAt || '')}</createdAt>
    <updatedAt>${escapeXml(design.updatedAt || '')}</updatedAt>
  </metadata>
  <content format="markdown">
    <![CDATA[
${design.output || ''}
    ]]>
  </content>
</instructionalDesign>`;

  triggerDownload(new Blob([xmlContent], { type: 'application/xml;charset=utf-8' }), `${cleanTitle}.xml`);
}

export function exportToCustomFile(design, extension = 'txt', customMime = 'text/plain') {
  let cleanExt = extension.trim().replace(/^\./, '').toLowerCase() || 'txt';
  const cleanTitle = getSafeFilename(design.title);
  const content = design.output || '';
  triggerDownload(new Blob([content], { type: `${customMime};charset=utf-8` }), `${cleanTitle}.${cleanExt}`);
}

// LMS & Classroom Export Functions
export async function exportToCanvasHtml(design) {
  const { lmsService } = await import('./lmsService.js');
  const cleanTitle = getSafeFilename(design.title);
  const html = lmsService.formatForCanvasPage(design);
  triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), `${cleanTitle}_canvas_module.html`);
}

export async function exportToCanvasQti(design) {
  const { lmsService } = await import('./lmsService.js');
  const cleanTitle = getSafeFilename(design.title);
  const xml = lmsService.formatForCanvasQTI(design);
  triggerDownload(new Blob([xml], { type: 'application/xml;charset=utf-8' }), `${cleanTitle}_canvas_quiz.qti.xml`);
}

export async function exportToGoogleClassroomFormat(design) {
  const { lmsService } = await import('./lmsService.js');
  const cleanTitle = getSafeFilename(design.title);
  const text = lmsService.formatForGoogleClassroom(design);
  triggerDownload(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${cleanTitle}_google_classroom.txt`);
}

export async function openGoogleClassroomWebShare(design) {
  const { lmsService } = await import('./lmsService.js');
  const shareUrl = lmsService.generateGoogleClassroomShareUrl(design);
  window.open(shareUrl, '_blank', 'width=650,height=700');
}

/**
 * Interactive Universal Export Modal.
 * Allows educators to choose from standard formats, LMS packages, or specify ANY custom file extension!
 */
export function openUniversalExportModal(design) {
  if (!design) return;

  const modalHtml = `
    <div id="universal-export-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col space-y-4">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Universal File Exporter</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Export "${escapeHtml(design.title)}" in any document or data format</p>
            </div>
          </div>
          <button id="close-export-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Format Grid -->
        <div class="space-y-3">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Choose Standard Document Format:</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="export-format-options">
            
            <button type="button" data-format="docx" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Word (.doc)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">MS Word & Office Open</span>
            </button>

            <button type="button" data-format="pdf" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">PDF / Print</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Printable high-res layout</span>
            </button>

            <button type="button" data-format="md" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Markdown (.md)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">GFM with YAML metadata</span>
            </button>

            <button type="button" data-format="html" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Web Page (.html)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Standalone styled page</span>
            </button>

            <button type="button" data-format="txt" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-slate-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Plain Text (.txt)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Clean unformatted text</span>
            </button>

            <button type="button" data-format="json" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">JSON (.json)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Complete data structure</span>
            </button>

            <button type="button" data-format="csv" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-teal-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">CSV Sheet (.csv)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Excel & Sheets compatible</span>
            </button>

            <button type="button" data-format="rtf" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Rich Text (.rtf)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Universal WordPad / Pages</span>
            </button>

            <button type="button" data-format="tex" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">LaTeX (.tex)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Academic paper typesetting</span>
            </button>

          </div>
        </div>

        <!-- LMS & Digital Classroom Formats -->
        <div class="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">LMS & Digital Classroom Platforms:</label>
            <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Canvas & Classroom Ready</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="lms-export-options">
            
            <button type="button" data-lms-format="canvas-html" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-[#E13F2B]"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Canvas LMS Page (.html)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Styled with Instructure callout & table classes</span>
            </button>

            <button type="button" data-lms-format="canvas-qti" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-[#E13F2B]"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Canvas Quiz Package (QTI XML)</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Standard QTI 2.1 quiz import package</span>
            </button>

            <button type="button" data-lms-format="google-text" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-850 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-[#0F9D58]"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Google Classroom Coursework</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Formatted student directives & rubric criteria</span>
            </button>

            <button type="button" data-lms-format="google-share" class="p-3 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-indigo-500 dark:hover:border-indigo-400 bg-emerald-50/50 dark:bg-emerald-950/30 text-left transition-all group">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-[#0F9D58]"></span>
                <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300 group-hover:text-emerald-900 dark:group-hover:text-emerald-200">1-Click Share to Classroom</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block">Direct official Google Classroom web share</span>
            </button>

          </div>
        </div>

        <!-- Custom Arbitrary File Extension Section -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-850/60 space-y-2">
          <label class="block text-xs font-bold text-slate-900 dark:text-white">Or Export with Any Custom File Extension</label>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Need a specialized format like <code>.qmd</code>, <code>.rst</code>, <code>.org</code>, <code>.prompt</code>, <code>.yaml</code>, or institutional extensions? Specify below:</p>
          <div class="flex items-center gap-2 pt-1">
            <div class="relative flex-1">
              <span class="absolute left-3 top-2 text-xs font-mono text-slate-400">.</span>
              <input type="text" id="custom-ext-input" placeholder="e.g. qmd, rst, org, prompt" class="w-full text-xs font-mono pl-6 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none">
            </div>
            <button id="download-custom-ext-btn" class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors shrink-0">
              Export File
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  const existing = document.getElementById('universal-export-modal-overlay');
  if (existing) existing.remove();

  const c = document.createElement('div');
  c.innerHTML = modalHtml;
  document.body.appendChild(c.firstElementChild);

  const modal = document.getElementById('universal-export-modal-overlay');
  const close = () => modal.remove();

  document.getElementById('close-export-modal-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.querySelectorAll('#export-format-options button').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      close();
      switch (format) {
        case 'docx': exportToDocx(design); break;
        case 'pdf': exportToPrintablePDF(design); break;
        case 'md': exportToMarkdown(design); break;
        case 'txt': exportToPlainText(design); break;
        case 'html': exportToHtml(design); break;
        case 'json': exportToJson(design); break;
        case 'csv': exportToCsv(design); break;
        case 'rtf': exportToRtf(design); break;
        case 'tex': exportToLatex(design); break;
      }
    });
  });

  modal.querySelectorAll('#lms-export-options button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lmsFormat = btn.getAttribute('data-lms-format');
      close();
      switch (lmsFormat) {
        case 'canvas-html': exportToCanvasHtml(design); break;
        case 'canvas-qti': exportToCanvasQti(design); break;
        case 'google-text': exportToGoogleClassroomFormat(design); break;
        case 'google-share': openGoogleClassroomWebShare(design); break;
      }
    });
  });

  document.getElementById('download-custom-ext-btn').addEventListener('click', () => {
    const ext = document.getElementById('custom-ext-input').value.trim();
    if (ext) {
      close();
      exportToCustomFile(design, ext);
    }
  });
}

// Helper: Download Trigger
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getSafeFilename(title) {
  return (title || 'Instructional_Design')
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'Instructional_Design';
}

function stripMarkdownToPlainText(md) {
  if (!md) return '';
  return md
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\>\s+/gm, '')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '• ')
    .replace(/\|/g, '  ')
    .replace(/---\s*/g, '--------------------------------------------------\n');
}

function escapeRtf(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Markdown to HTML Parser
export function renderMarkdownToHtml(markdown) {
  if (!markdown) return '';
  let html = markdown;

  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Tables
  html = html.replace(/((?:^\|.+?\|(?:\r?\n|$))+)/gm, (tableBlock) => {
    const rawLines = tableBlock.trim().split(/\r?\n/).filter(l => l.trim().startsWith('|'));
    if (rawLines.length === 0) return tableBlock;

    const rows = [];
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      const content = line.replace(/^\|/, '').replace(/\|$/, '');
      const cells = content.split('|').map(c => c.trim());
      
      // Skip markdown table delimiter row (e.g. |:---|:---|)
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }
      
      if (rows.length === 0) {
        rows.push(`<thead><tr>${cells.map(c => `<th>${c}</th>`).join('')}</tr></thead>`);
      } else {
        rows.push(`<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`);
      }
    }

    if (rows.length > 0) {
      const thead = rows[0].startsWith('<thead>') ? rows[0] : '';
      const tbodyRows = rows[0].startsWith('<thead>') ? rows.slice(1) : rows;
      const tbody = tbodyRows.length > 0 ? `<tbody>${tbodyRows.join('')}</tbody>` : '';
      return `<div class="overflow-x-auto my-4"><table class="w-full">${thead}${tbody}</table></div>\n`;
    }
    return tableBlock;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr>');

  // Bold & Italics
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Inline Code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Unordered Lists
  html = html.replace(/^\s*[-*]\s+\[ \]\s+(.*$)/gim, '<li class="flex items-center gap-2"><input type="checkbox" disabled class="rounded text-indigo-600"> <span>$1</span></li>');
  html = html.replace(/^\s*[-*]\s+\[x\]\s+(.*$)/gim, '<li class="flex items-center gap-2"><input type="checkbox" checked disabled class="rounded text-indigo-600"> <span>$1</span></li>');
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');

  // Ordered Lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');

  // Wrap consecutive <li> into <ul>
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul class="my-2 space-y-1">$1</ul>');

  // Paragraphs
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(b => {
    b = b.trim();
    if (!b) return '';
    if (b.startsWith('<h') || b.startsWith('<table') || b.startsWith('<div') || b.startsWith('<ul') || b.startsWith('<ol') || b.startsWith('<blockquote') || b.startsWith('<hr')) {
      return b;
    }
    return `<p>${b.replace(/\n/g, '<br>')}</p>`;
  }).join('\n\n');

  return html;
}
