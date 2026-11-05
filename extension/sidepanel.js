// PEDAIA Browser Extension — Side Panel Controller (Universal Manifest V3)

const DEFAULT_WEB_URL = 'http://localhost:3000';

async function getPedaiaUrl() {
  try {
    const data = await chrome.storage.local.get(['pedaiaUrl']);
    return data.pedaiaUrl || DEFAULT_WEB_URL;
  } catch {
    return DEFAULT_WEB_URL;
  }
}

let lastGeneratedPlan = '';
let lastGeneratedQuestions = '';

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initCapture();
  initGenerators();
  initLMS();
  await checkActiveClip();

  // Listen for storage changes from context menu while side panel is active
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.activeClip && changes.activeClip.newValue) {
      applyClip(changes.activeClip.newValue);
    }
  });

  // Launch studio in full tab button
  const launchBtn = document.getElementById('sp-launch-tab-btn');
  if (launchBtn) {
    launchBtn.addEventListener('click', async () => {
      const webUrl = await getPedaiaUrl();
      chrome.tabs.create({ url: webUrl });
    });
  }
});

// --- Tab Navigation ---
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const views = {
    'quick-planner': document.getElementById('tab-quick-planner-view'),
    'quick-questions': document.getElementById('tab-quick-questions-view'),
    'lms-push': document.getElementById('tab-lms-push-view'),
    'full-view': document.getElementById('tab-full-view')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      Object.keys(views).forEach(k => {
        if (views[k]) {
          views[k].style.display = (k === target) ? (k === 'full-view' ? 'block' : 'block') : 'none';
        }
      });

      if (target === 'full-view') {
        const iframe = document.getElementById('sp-full-iframe');
        if (iframe && (iframe.src === 'about:blank' || !iframe.src)) {
          getPedaiaUrl().then(url => { iframe.src = url; });
        }
      }
    });
  });
}

// --- Active Tab Text Capture ---
function initCapture() {
  const captureBtn = document.getElementById('sp-capture-page-btn');
  if (!captureBtn) return;

  captureBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      const selected = results?.[0]?.result?.trim();
      if (selected) {
        applyClip({ text: selected, title: tab.title, url: tab.url });
        pulseButton(captureBtn, 'Captured!');
      } else {
        // Fallback: use tab title if no selection
        const cleanedTitle = (tab.title || '').split(/[-|–]/)[0].trim();
        if (cleanedTitle) {
          applyClip({ text: cleanedTitle, title: tab.title, url: tab.url });
          pulseButton(captureBtn, 'Page Topic Set!');
        }
      }
    } catch (err) {
      console.warn('Capture failed:', err);
    }
  });
}

function pulseButton(btn, text) {
  const original = btn.innerHTML;
  btn.textContent = text;
  btn.style.borderColor = '#10B981';
  btn.style.color = '#34D399';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.borderColor = '';
    btn.style.color = '';
  }, 1500);
}

async function checkActiveClip() {
  try {
    const data = await chrome.storage.local.get(['activeClip']);
    if (data.activeClip) {
      applyClip(data.activeClip);
    }
  } catch (e) {
    console.warn(e);
  }
}

function applyClip(clip) {
  if (!clip || !clip.text) return;
  const topicInput = document.getElementById('sp-topic-input');
  const qTopicInput = document.getElementById('sp-q-topic-input');

  if (topicInput && !topicInput.value) {
    topicInput.value = clip.text;
  }
  if (qTopicInput && !qTopicInput.value) {
    qTopicInput.value = clip.text;
  }

  // If specific target studio was requested
  if (clip.targetStudio === 'questioning') {
    const qTab = document.querySelector('[data-tab="quick-questions"]');
    if (qTab) qTab.click();
  }
}

// --- Quick Generation Engines (Zero Key Required) ---
function initGenerators() {
  // 1. Quick Lesson Planner
  const genLessonBtn = document.getElementById('sp-generate-lesson-btn');
  const lessonOutputCard = document.getElementById('sp-lesson-output-card');
  const lessonOutput = document.getElementById('sp-lesson-output');
  const copyLessonBtn = document.getElementById('sp-copy-lesson-btn');

  if (genLessonBtn) {
    genLessonBtn.addEventListener('click', async () => {
      const topic = document.getElementById('sp-topic-input')?.value.trim() || 'Core Curriculum Concept';
      const subject = document.getElementById('sp-subject-input')?.value.trim() || 'General Studies';
      const grade = document.getElementById('sp-grade-input')?.value.trim() || 'Secondary';
      const model = document.getElementById('sp-model-select')?.value || '5E Instructional Model';

      genLessonBtn.disabled = true;
      genLessonBtn.textContent = 'Synthesizing Aligned Plan...';

      try {
        const plan = await generateLessonPlan({ topic, subject, grade, model });
        lastGeneratedPlan = plan;
        if (lessonOutput) lessonOutput.textContent = plan;
        if (lessonOutputCard) lessonOutputCard.style.display = 'block';
      } catch (err) {
        if (lessonOutput) lessonOutput.textContent = `Error: ${err.message}`;
      } finally {
        genLessonBtn.disabled = false;
        genLessonBtn.textContent = 'Generate Aligned Lesson Architecture';
      }
    });
  }

  if (copyLessonBtn) {
    copyLessonBtn.addEventListener('click', () => {
      if (lastGeneratedPlan) {
        navigator.clipboard.writeText(lastGeneratedPlan);
        pulseButton(copyLessonBtn, 'Copied!');
      }
    });
  }

  // 2. Bloom's Taxonomy Questions
  const genQBtn = document.getElementById('sp-generate-q-btn');
  const qOutputCard = document.getElementById('sp-q-output-card');
  const qOutput = document.getElementById('sp-q-output');
  const copyQBtn = document.getElementById('sp-copy-q-btn');

  if (genQBtn) {
    genQBtn.addEventListener('click', async () => {
      const topic = document.getElementById('sp-q-topic-input')?.value.trim() || 'Curriculum Competency';
      const countMode = document.getElementById('sp-q-count-select')?.value || '6';

      genQBtn.disabled = true;
      genQBtn.textContent = 'Calibrating Cognitive Levels...';

      try {
        const questions = await generateBloomQuestions({ topic, countMode });
        lastGeneratedQuestions = questions;
        if (qOutput) qOutput.textContent = questions;
        if (qOutputCard) qOutputCard.style.display = 'block';
      } catch (err) {
        if (qOutput) qOutput.textContent = `Error: ${err.message}`;
      } finally {
        genQBtn.disabled = false;
        genQBtn.textContent = 'Synthesize Calibrated Assessment Items';
      }
    });
  }

  if (copyQBtn) {
    copyQBtn.addEventListener('click', () => {
      if (lastGeneratedQuestions) {
        navigator.clipboard.writeText(lastGeneratedQuestions);
        pulseButton(copyQBtn, 'Copied!');
      }
    });
  }
}

// --- Built-In Pedagogical Engine Logic ---
async function generateLessonPlan({ topic, subject, grade, model }) {
  // Try server first if reachable
  try {
    const webUrl = await getPedaiaUrl();
    const res = await fetch(`${webUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioType: 'lesson-planning',
        prompt: `Generate a structured lesson plan for topic "${topic}", subject "${subject}", grade level "${grade}" using the ${model}.`,
        parameters: { topic, subject, grade, model }
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.output) return data.output;
    }
  } catch {
    // Fall through to offline pedagogical synthesizer
  }

  // Offline / zero-dependency pedagogical synthesis
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  
  if (model.includes('5E')) {
    return `# PEDAIA INSTRUCTIONAL DESIGN — 5E LESSON PLAN
Topic: ${topic}
Subject: ${subject} | Grade Level: ${grade}
Framework: 5E Instructional Model (Bybee et al.)
Generated: ${dateStr} (PEDAIA Studio Extension)

---

## I. LEARNING OBJECTIVES (ABCD / Bloom-Aligned)
1. Cognitive: Students will analyze the fundamental mechanisms of ${topic} and explain core relationships with 85% accuracy.
2. Psychomotor/Procedural: Students will construct a conceptual model or diagram illustrating ${topic} during collaborative exploration.
3. Affective/Metacognitive: Students will reflect on how ${topic} manifests in authentic real-world contexts and ethical decision-making.

---

## II. 5E INSTRUCTIONAL SEQUENCE

### 1. ENGAGE (8 Minutes)
- Hook / Provocative Phenomenon: Present a brief counter-intuitive demonstration or real-world problem involving ${topic}.
- Activating Prior Knowledge: Conduct a 2-minute "Think-Pair-Share" around: "Where have you encountered instances of ${topic} before?"
- Formative Diagnostic: Collect quick whiteboard responses to gauge misconceptions before inquiry begins.

### 2. EXPLORE (15 Minutes)
- Collaborative Task: In teams of 3–4, learners investigate structured evidence, hands-on manipulatives, or guided primary data on ${topic}.
- Student Role: Gathering observations, identifying patterns, recording inquiries.
- Teacher Facilitation: Circulating with guiding questions ("What patterns do you notice when...?", "Why might this occur?"), resisting the urge to provide direct answers.

### 3. EXPLAIN (12 Minutes)
- Learner Synthesis: Groups present their initial findings and claim-evidence-reasoning (CER) statements.
- Teacher Clarification: Introduce formal scientific/academic terminology for ${topic}. Directly connect student vernacular to academic concepts.
- Anchor Concept: Synthesize the central principle onto the shared board/slide.

### 4. ELABORATE (10 Minutes)
- Transfer Challenge: Apply the newly understood concept of ${topic} to a novel, unstudied scenario or cross-curricular problem.
- Differentiation:
  - Scaffolding (Tier 1): Sentence starters and conceptual flowchart.
  - Extension (Tier 3): Multi-variable case study requiring students to predict non-linear outcomes.

### 5. EVALUATE (5 Minutes)
- Formative Assessment: 3-item exit ticket evaluating:
  1. Recall/Definition of key term.
  2. Application of ${topic} in a short vignette.
  3. Metacognitive: "The clearest point today was... and the muddiest point is..."

---

## III. MATERIALS & ACCESSIBILITY
- High-contrast visuals and captions for multi-modal accessibility (UDL).
- Collaborative role cards (Facilitator, Scribe, Timekeeper, Presenter).
- Digital copy available for screen readers and LMS integration.`;
  }

  // Generic framework synthesis (UbD or 4As or Direct Instruction)
  return `# PEDAIA INSTRUCTIONAL DESIGN SPECIFICATION
Topic: ${topic}
Subject: ${subject} | Target: ${grade}
Framework: ${model}
Synthesized via: PEDAIA Chrome Extension Companion

---

## I. DESIRED RESULTS & ESSENTIAL QUESTIONS
- Essential Question: How does understanding "${topic}" empower us to solve complex real-world challenges?
- Transfer Goal: Independently evaluate evidence and propose substantiated claims regarding ${topic}.
- Key Knowledge: Principles, vocabulary, and standard operational definitions of ${topic}.

---

## II. ASSESSMENT EVIDENCE
- Performance Task: Authentic scenario where students take on the role of an expert analyzing ${topic}.
- Formative Checks: Warm-up retrieval, guided check-for-understanding questions, and concluding exit slip.
- Success Criteria: Clear 4-level analytic rubric covering Accuracy, Synthesis, and Communication.

---

## III. LEARNING SEQUENCE
1. Orientation & Objective Sharing (5 min): Clarify relevance and success criteria.
2. Explicit Modeling & Demonstration (10 min): "I Do" phase demonstrating mastery of ${topic}.
3. Guided Practice & Coaching (15 min): "We Do" phase with partner collaboration and immediate feedback.
4. Independent Construction (15 min): "You Do" individual synthesis task.
5. Reflection & Closure (5 min): Self-assessment against stated learning outcomes.`;
}

async function generateBloomQuestions({ topic, countMode }) {
  const levels = [
    { name: 'Remember', verb: 'Recall / Define', q: `What is the primary definition and core characteristic of ${topic}?`, ans: `Key standard definition and baseline vocabulary terms.` },
    { name: 'Understand', verb: 'Explain / Paraphrase', q: `In your own words, explain how the mechanism of ${topic} works.`, ans: `Demonstrates conceptual grasp without verbatim rote repetition.` },
    { name: 'Apply', verb: 'Implement / Calculate', q: `Given a real-world scenario involving ${topic}, predict the immediate outcome if one key factor changes.`, ans: `Applies known principles to a concrete novel case.` },
    { name: 'Analyze', verb: 'Distinguish / Deconstruct', q: `Compare and contrast ${topic} with a related concept. What are the key structural distinctions?`, ans: `Identifies underlying constituent components and logical relationships.` },
    { name: 'Evaluate', verb: 'Critique / Justify', q: `Critique the effectiveness of common approaches to ${topic}. Which criterion is most decisive?`, ans: `Defends a judgment based on verifiable standards and evidence.` },
    { name: 'Create', verb: 'Design / Propose', q: `Design an innovative solution or conceptual model that leverages ${topic} to address a modern problem.`, ans: `Synthesizes elements into an original, coherent framework.` }
  ];

  let selected = levels;
  if (countMode === '4') {
    selected = levels.slice(2); // Higher order
  } else if (countMode === '3') {
    selected = levels.slice(0, 3); // Foundational
  }

  let output = `BLOOM'S REVISED TAXONOMY QUESTION MATRIX
Competency / Topic: ${topic}
Synthesized by: PEDAIA Chrome Companion
Total Items: ${selected.length} Calibrated Questions\n\n`;

  selected.forEach((lvl, idx) => {
    output += `### Item ${idx + 1} [Bloom Level: ${lvl.name.toUpperCase()} — ${lvl.verb}]\n`;
    output += `Question: ${lvl.q}\n`;
    output += `Answer Key / Target Criteria: ${lvl.ans}\n`;
    output += `Distractor / Quality Rationale: Evaluates whether learner can distinguish surface-level intuition from rigorous pedagogical reasoning.\n\n`;
  });

  return output;
}

// --- LMS Linking & Sharing ---
function initLMS() {
  const canvasBtn = document.getElementById('sp-lms-canvas-btn');
  const googleBtn = document.getElementById('sp-lms-google-btn');
  const statusEl = document.getElementById('sp-lms-status');

  if (canvasBtn) {
    canvasBtn.addEventListener('click', async () => {
      const plan = lastGeneratedPlan || lastGeneratedQuestions || 'PEDAIA Aligned Instructional Design';
      const topic = document.getElementById('sp-topic-input')?.value || 'Instructional Module';
      const webUrl = await getPedaiaUrl();

      if (statusEl) {
        statusEl.innerHTML = `<strong>Canvas Direct:</strong> Formatted module for Canvas LMS. Opening PEDAIA Canvas Publisher...`;
      }

      // Open PEDAIA web app Canvas integration modal
      chrome.tabs.create({ url: `${webUrl}/#lesson-planning?openLms=canvas&topic=${encodeURIComponent(topic)}` });
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      const topic = document.getElementById('sp-topic-input')?.value || 'PEDAIA Instructional Design';
      const webUrl = await getPedaiaUrl();
      const shareUrl = encodeURIComponent(`${webUrl}`);
      const classroomUrl = `https://classroom.google.com/share?url=${shareUrl}&title=${encodeURIComponent(topic)}`;

      if (statusEl) {
        statusEl.innerHTML = `<strong>Google Classroom:</strong> Opening Google Classroom 1-Click Assignment Share...`;
      }

      chrome.tabs.create({ url: classroomUrl });
    });
  }
}
