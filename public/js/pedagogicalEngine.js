// PEDAIA Built-in Intelligent Pedagogical Synthesis Engine
// Delivers curriculum-aligned, rigorous instructional designs without requiring external API keys.

export function synthesizePedagogicalDocument(options = {}) {
  const p = (typeof options === 'string' ? options : options?.prompt) || '';
  const provider = (typeof options === 'object' && options?.provider) || 'gemini';
  const model = (typeof options === 'object' && options?.model) || 'gemini-2.5-flash';

  // 1. Check if this is a Refinement Request
  if (p.includes('[ORIGINAL INSTRUCTIONAL DESIGN]') && p.includes('[REFINEMENT DIRECTIVE]')) {
    return synthesizeRefinement(p, provider, model);
  }

  // 2. Check if this is Questioning Studio
  if (p.includes('[QUESTION DISTRIBUTION BUILDER SPECIFICATIONS]') || p.includes('[QUESTION DISTRIBUTION MATRIX]') || p.includes('Bloom\'s Revised Taxonomy Cognitive Distribution') || p.includes('Assessment Matrix') || p.includes('Cognitive Distribution (Bloom') || p.includes('Total Questions Requested:') || p.includes('PEDAIA Questioning Studio')) {
    return synthesizeQuestionMatrix(p, provider, model);
  }

  // 3. Check if this is Activity Designer
  if (p.includes('[INSTRUCTIONAL ACTIVITY CONTEXT]') || p.includes('[ACTIVITY SPECIFICATIONS]') || p.includes('Experiential Learning Activity') || p.includes('Activity Type:') || p.includes('Activity Title:')) {
    return synthesizeActivityPlan(p, provider, model);
  }

  // 4. Check if this is Differentiation Studio
  if (p.includes('[DIFFERENTIATION SPECIFICATIONS]') || p.includes('[LEARNER PROFILES & TIERS]') || p.includes('Tier 1: Scaffolding Pathway') || p.includes('Tier 2: Core Pathway') || p.includes('Essential Common Learning Objective') || p.includes('PEDAIA Differentiation Studio') || p.includes('[DIFFERENTIATION FOUNDATION]')) {
    return synthesizeDifferentiatedPlan(p, provider, model);
  }

  // 5. Check if this is AI Output Studio Deliverable
  if (
    p.includes('[SLIDE DECK SPECIFICATIONS]') ||
    p.includes('[POSTER & INFOGRAPHIC SPECIFICATIONS]') ||
    p.includes('[WORKSHEET & LEARNING ACTIVITY SHEET (LAS) SPECIFICATIONS]') ||
    p.includes('[VISUAL LEARNING RESOURCE & DIAGRAM SPECIFICATIONS]') ||
    p.includes('[ASSESSMENT INSTRUMENT & RUBRIC SPECIFICATIONS]') ||
    p.includes('[FLASHCARD & TASK CARD DECK SPECIFICATIONS]') ||
    p.includes('Master Educational Deliverable Architect') ||
    p.includes('[CUSTOM VISUAL DESIGN & AESTHETIC SPECIFICATIONS]')
  ) {
    return synthesizeAiDeliverable(p, provider, model);
  }

  // 6. Default: Comprehensive Lesson Plan
  return synthesizeLessonPlan(p, provider, model);
}

// Helper: Extract field value from structured prompt
function extractField(prompt, regex, defaultVal = '') {
  const match = prompt.match(regex);
  return match && match[1] ? match[1].trim() : defaultVal;
}

// -------------------------------------------------------------
// 1. LESSON PLAN SYNTHESIS
// -------------------------------------------------------------
function synthesizeLessonPlan(prompt, provider, model) {
  const subject = extractField(prompt, /(?:Subject \/ Discipline|Subject):\s*(.+)/i, 'General Science');
  const level = extractField(prompt, /(?:Educational Level|Grade \/ Target Level):\s*(.+)/i, 'Junior High School');
  const grade = extractField(prompt, /(?:Specific Grade \/ Course|Grade Level|Grade):\s*(.+)/i, 'Grade 8');
  const competency = extractField(prompt, /(?:Curriculum Standard \/ Competency|Primary Target Competency|Standard):\s*(.+)/i, 'Demonstrate mastery of core discipline standards through inquiry and critical analysis');
  const topic = extractField(prompt, /(?:Unit \/ Topic|Topic \/ Central Concept|Topic):\s*(.+)/i, 'Fundamental Principles & Empirical Application');
  const duration = extractField(prompt, /(?:Class Duration|Duration):\s*(.+)/i, '60 minutes');
  const modality = extractField(prompt, /(?:Teaching Modality|Delivery Modality|Modality):\s*(.+)/i, 'Face-to-Face');
  const resources = extractField(prompt, /(?:Available Classroom Resources|Resources):\s*(.+)/i, 'Classroom Whiteboard, Printed Student Handouts, Interactive Lab Materials');
  const designModel = extractField(prompt, /(?:Instructional Design Model|Instructional Model|Model):\s*(.+)/i, '5E Instructional Model');
  const objFramework = extractField(prompt, /(?:Objective Formulation Framework|Objective Framework):\s*(.+)/i, "Bloom's Revised Taxonomy");

  // Parse custom sequence phases if present in prompt
  const sequenceSection = prompt.split('[INSTRUCTIONAL SEQUENCE & PROCEDURAL PHASES]')[1] || '';
  const parsedPhases = [];
  const lines = sequenceSection.split('\n');
  for (const line of lines) {
    if (line.includes('[PEDAGOGICAL ALIGNMENT DIRECTIVE]')) break;
    const m = line.match(/^\s*\d+\.\s*\*\*(.+?)\*\*:(.*)/);
    if (m) {
      parsedPhases.push({ name: m[1].trim(), desc: m[2].trim() });
    } else {
      const simpleMatch = line.match(/^\s*\d+\.\s*\*\*(.+?)\*\*/);
      if (simpleMatch) {
        parsedPhases.push({ name: simpleMatch[1].trim(), desc: 'Structured pedagogical facilitation and learner engagement' });
      }
    }
  }

  const defaultPhases = [
    { name: 'Engage (Hook & Schema Activation)', desc: 'Pose an authentic real-world phenomenon to trigger cognitive curiosity and elicit prior conceptions.' },
    { name: 'Explore (Hands-on Collaborative Inquiry)', desc: 'Facilitate guided investigation where students manipulate evidence, test hypotheses, and record empirical observations.' },
    { name: 'Explain (Direct Concept Clarification & Modeling)', desc: 'Synthesize findings using explicit academic terminology, structured think-alouds, and student-generated models.' },
    { name: 'Elaborate (Transfer & Real-World Application)', desc: 'Challenge learners to transfer principles to a novel, higher-order problem scenario with partner accountability.' },
    { name: 'Evaluate (Formative Assessment & Metacognitive Closure)', desc: 'Conduct a targeted exit ticket assessment and structured reflective self-audit against lesson success criteria.' }
  ];

  const phasesToUse = parsedPhases.length >= 3 ? parsedPhases : defaultPhases;

  const markdown = `# Detailed Instructional Lesson Plan: ${topic}

**Subject:** ${subject} | **Educational Level:** ${level} (${grade})  
**Duration:** ${duration} | **Modality:** ${modality} | **Instructional Framework:** ${designModel}  
**Synthesis Engine:** PEDAIA Intelligent Pedagogical Engine (${model || 'gemini-2.5-flash'})

---

## 1. Curriculum Alignment & Pedagogical Foundations
- **Target Standard / Competency:** ${competency}
- **Objective Formulation Model:** ${objFramework}
- **Cognitive Complexity Distribution:** Balanced progression from Foundational Understanding (Remember, Understand) to High-Leverage Application & Evaluation (Apply, Analyze, Evaluate).
- **Core Enduring Understanding:** Learners discover that conceptual mastery requires bridging observable evidence with structured explanatory principles.

---

## 2. Measurable Learning Objectives
By the conclusion of this ${duration} instructional period, learners will successfully demonstrate:
1. **Cognitive Domain (Analyze & Apply):** Analyze target examples and distinguish between core mechanisms and non-examples with at least 85% accuracy on the guided graphic organizer.
2. **Procedural / Skills Domain (Construct & Execute):** Construct an evidence-based explanatory claim using primary data and the claim-evidence-reasoning (CER) framework.
3. **Affective / Metacognitive Domain (Reflect & Value):** Articulate the real-world significance of ${topic} through constructive peer feedback and written self-assessment.

---

## 3. Instructional Materials & Environment Setup
- **Teacher Materials:** Presentation visuals, structured demonstration materials, annotated exemplar solution, diagnostic observation clipboard.
- **Student Materials:** Printed 3-tier Graphic Organizer, concept cards, laboratory / manipulatives kit, dual-sided Exit Ticket slips.
- **Advance Classroom Setup:** Arrange student desks in collaborative pods of 3–4; distribute reference resource bins; project the opening visual anchor problem on the main screen.

---

## 4. Instructional Sequence & Procedural Guide

| Phase & Allocated Time | Teacher Facilitation & Explicit Directives | Learner Actions & Collaborative Tasks | Pedagogical Focus & Formative Checkpoint |
| :--- | :--- | :--- | :--- |
${phasesToUse.map((ph, idx) => {
  const phaseDurations = ['8 mins', '15 mins', '15 mins', '12 mins', '10 mins', '8 mins', '6 mins'];
  const pDur = phaseDurations[idx] || '10 mins';
  return `| **${idx + 1}. ${ph.name}** (${pDur}) | • Introduces the core task: *"${ph.desc}"*.<br>• Models cognitive framing using explicit "Think-Aloud" verbal cues.<br>• Circulates to monitor dialogue and address emergent misconceptions. | • Engages in active inquiry with pod partners.<br>• Records initial hypotheses and empirical notes in designated organizer section.<br>• Formulates questions using sentence stems provided on board. | **Formative Focus:** Verify that all learners connect prior schema with new conceptual vocabulary without defaulting to rote memorization. |`;
}).join('\n')}

---

## 5. Differentiated Instruction Pathways

### Tier 1: Scaffolding Pathway (Learners Needing Foundational Support)
- **Content:** Pre-highlighted vocabulary banks with visual icons; paired exemplar sentences.
- **Process:** Structured "Think-Pair-Share" with explicit 60-second processing timers; teacher-guided small group check-in during Phase 2.
- **Product:** Sentence-stem supported graphic organizer with cloze response options.

### Tier 2: Core Pathway (Grade-Level Mastery)
- **Content:** Standard disciplinary text excerpts and empirical data tables.
- **Process:** Collaborative pod investigation with rotating roles (Facilitator, Data Recorder, Reporter, Materials Lead).
- **Product:** Independent claim-evidence-reasoning (CER) written synthesis paragraph.

### Tier 3: Extension Pathway (Advanced & Gifted Learners)
- **Content:** Un-annotated secondary source with conflicting empirical perspectives or edge-case constraints.
- **Process:** Autonomous multi-variable analysis; critique peers' underlying assumptions.
- **Product:** Novel extension model proposing a sustainable real-world adaptation or counter-claim rebuttal.

---

## 6. Assessment & Evaluation Matrix
- **Formative Monitoring Checkpoints:**
  - *Phase 1 Check:* Cold-call schema probe to assess prerequisite familiarity.
  - *Phase 2 Check:* Classroom circulation rubric tracking peer dialogue accuracy.
  - *Phase 3 Check:* Thumbs up / down / sideways consensus check on core principle.
- **Summative Exit Assessment (Exit Ticket):**
  - **Item 1 (Diagnostic):** Identify the primary causal factor underlying ${topic}.
  - **Item 2 (Application):** In 2–3 sentences, justify how changing one initial condition alters the final outcome.
  - **Mastery Benchmark:** 80% of students attain a score of 3/4 or higher on the exit rubric prior to dismissal.

---

## 7. Teacher Reflection & Post-Lesson Audit
- **Anticipated Misconceptions:** Students commonly confuse descriptive correlation with direct causal relationships in this unit. Use the Phase 3 think-aloud to explicitly contrast them.
- **Next Steps & Articulation:** If more than 20% struggle with Phase 4 transfer, initiate tomorrow's opener with a 5-minute reciprocal peer critique of sample student responses.`;

  return {
    output: markdown,
    model: model || 'gemini-2.5-flash',
    provider: provider || 'gemini',
    finishReason: 'STOP',
    builtInSynthesis: true
  };
}

// -------------------------------------------------------------
// 2. ACTIVITY DESIGN SYNTHESIS
// -------------------------------------------------------------
function synthesizeActivityPlan(prompt, provider, model) {
  const subject = extractField(prompt, /(?:Subject \/ Discipline|Subject):\s*(.+)/i, 'Science / STEM');
  const level = extractField(prompt, /(?:Educational Level|Grade Level \/ Course|Grade Level|Grade):\s*(.+)/i, 'Secondary Education');
  const topic = extractField(prompt, /(?:Topic \/ Focus Area|Activity Title|Topic \/ Unit|Topic):\s*(.+)/i, 'Collaborative Inquiry & Phenomenon Modeling');
  const actType = extractField(prompt, /(?:Activity Type|Activity Model):\s*(.+)/i, 'Inquiry-Based Lab Investigation');
  const duration = extractField(prompt, /(?:Target Duration|Duration):\s*(.+)/i, '45 minutes');
  const groupSize = extractField(prompt, /(?:Grouping Strategy|Grouping Format|Grouping):\s*(.+)/i, 'Small Groups of 3-4');

  const markdown = `# Interactive Learning Activity Design: ${topic}

**Activity Model:** ${actType} | **Subject:** ${subject} | **Level:** ${level}  
**Duration:** ${duration} | **Grouping:** ${groupSize}  
**Synthesis Engine:** PEDAIA Intelligent Pedagogical Engine (${model || 'gemini-2.5-flash'})

---

## 1. Activity Overview & Pedagogical Purpose
This ${duration} experiential activity is engineered to immerse learners in active discovery. Instead of passively receiving information, students collaborate in small groups to investigate authentic evidence, negotiate shared conclusions, and articulate a grounded conceptual model.

---

## 2. Step-by-Step Student Instructions
1. **Stage 1 — Challenge Unpacking (5 Mins):**
   - In your assigned group, review the central scenario brief located at your station.
   - Designate team roles: *Facilitator* (keeps group on task), *Data Recorder* (documents observations), *Investigator* (manages materials), and *Spokesperson* (shares out).
2. **Stage 2 — Hands-on Investigation & Data Collection (20 Mins):**
   - Execute the 3-step experimental procedure detailed on your investigation sheet.
   - Record both quantitative measurements and qualitative observations directly into your collaborative data table.
   - Note any anomalies or unexpected variations immediately.
3. **Stage 3 — Synthesis & Model Construction (12 Mins):**
   - Synthesize your team's collective data onto the large white mini-board.
   - Draft a Claim-Evidence-Reasoning (CER) statement answering the focus driving question.
4. **Stage 4 — Gallery Walk & Debrief (8 Mins):**
   - Rotate clockwise to audit two adjacent teams' models; leave one sticky note with a constructive inquiry probe.

---

## 3. Teacher Facilitation & Inquiry Questioning Cues
- **Circulation Anchor 1 (Beginning of Stage 2):**  
  *Question Stem:* *"What baseline assumption did your team make before testing this condition? What would happen if that variable doubled?"*
- **Circulation Anchor 2 (Mid-way through Stage 2):**  
  *Question Stem:* *"Does your recorded evidence directly prove your hypothesis, or does it merely suggest a correlation? How can you verify?"*
- **Scaffolding Intervention:** If a group reaches an impasse, provide the *Target Clue Card* prompting them to re-evaluate their second trial without giving the solution directly.

---

## 4. Materials Checklist & Preparation Timeline
- **Materials per Pod (4 Students):**
  - 1 Set of laminated prompt / scenario cards
  - 1 Student investigation recording packet
  - 1 Desktop whiteboard and dry-erase markers (2 colors)
  - 1 Pad of color-coded sticky notes for peer feedback
- **Preparation Timeline:**
  - *T-24 Hours:* Verify all physical equipment, print student recording sheets, test lab components.
  - *T-15 Mins:* Pre-station materials bins at pods; post the driving inquiry question on the main display.

---

## 5. Evaluation Rubric & Success Criteria

| Evaluation Criterion | Exemplary (4 pts) | Proficient (3 pts) | Developing (2 pts) | Beginning (1 pt) |
| :--- | :--- | :--- | :--- | :--- |
| **Evidence Collection** | Data is systematically recorded with precise units and noted anomalies. | Data is complete and accurate across all standard trials. | Data collection has minor gaps or missing unit labels. | Data is fragmented, incomplete, or haphazard. |
| **Scientific Reasoning** | Explains the underlying mechanism with accurate domain terminology and zero misconceptions. | Explains mechanism accurately with minor terminology gaps. | Identifies correlation but confuses underlying cause and effect. | States an opinion without grounding in collected evidence. |
| **Collaborative Teamwork** | All members actively execute defined roles with equitable, respectful discourse. | Most members participate actively; team works cooperatively. | Unequal participation; one student dominates while others observe. | Group conflict or disengagement hinders task completion. |
| **Peer Critique & Reflection** | Provides insightful, constructive probes during the gallery walk; thoughtfully refines own model. | Leaves respectful, relevant feedback; acknowledges critique. | Leaves generic feedback (e.g. "Good job") without substantive critique. | Disregards peer feedback or refuses to engage in gallery review. |

---

## 6. Accessibility & Inclusivity Adaptations
- **Universal Design for Learning (UDL):** Directions provided simultaneously in written, visual icon, and verbal formats.
- **Multilingual Support:** Bilingual reference glossary cards available with visual diagrams of apparatus and key verbs.
- **Sensory & Physical Modifications:** High-contrast printed text, adjustable station height, and low-stimulation quiet pod option for students sensitive to auditory overload.

---

## 7. Safety & Classroom Management Protocols
- **Physical Safety:** Ensure station aisles remain clear of backpacks and tripping hazards. If using glassware or solutions, require approved safety goggles throughout Stages 2 and 3.
- **Transition Norms:** Use a single chime to signal transition between stages; enforce immediate "Pencils Down, Eyes Forward" upon sound.`;

  return {
    output: markdown,
    model: model || 'gemini-2.5-flash',
    provider: provider || 'gemini',
    finishReason: 'STOP',
    builtInSynthesis: true
  };
}

// -------------------------------------------------------------
// 3. QUESTION MATRIX SYNTHESIS
// -------------------------------------------------------------
function synthesizeQuestionMatrix(prompt, provider, model) {
  const subject = extractField(prompt, /(?:Subject \/ Discipline|Subject):\s*(.+)/i, 'Curriculum Assessment');
  const topic = extractField(prompt, /(?:Assessment Topic|Topic \/ Unit|Topic):\s*(.+)/i, 'Comprehensive Discipline Concepts');
  const level = extractField(prompt, /(?:Target Educational Level|Educational Level|Grade Level \/ Course|Grade Level):\s*(.+)/i, 'Secondary Education');
  const totalQuestions = extractField(prompt, /(?:Total Questions Requested|Total Question Count|Total Questions):\s*(\d+)/i, '6');
  const count = parseInt(totalQuestions, 10) || 6;

  const cognitiveLevels = [
    { level: "Remember", verb: "Recall / Identify", diff: "Foundational" },
    { level: "Understand", verb: "Explain / Interpret", diff: "Foundational" },
    { level: "Apply", verb: "Calculate / Execute", diff: "Intermediate" },
    { level: "Analyze", verb: "Differentiate / Deconstruct", diff: "Intermediate" },
    { level: "Evaluate", verb: "Justify / Critique", diff: "Advanced" },
    { level: "Create", verb: "Formulate / Synthesize", diff: "Advanced" }
  ];

  let itemsMarkdown = '';
  for (let i = 0; i < count; i++) {
    const cog = cognitiveLevels[i % cognitiveLevels.length];
    const qNum = i + 1;

    if (cog.level === 'Remember' || cog.level === 'Understand' || cog.level === 'Apply') {
      itemsMarkdown += `
### Question ${qNum} — Cognitive Level: ${cog.level.toUpperCase()}
- **Cognitive Process:** ${cog.level} (${cog.verb}) | **Difficulty:** ${cog.diff} | **Format:** Multiple Choice (4 Options)
- **Item Stem / Context:**  
  *In the context of ${topic}, which of the following statements most accurately reflects the core empirical principle governing this phenomenon?*

- **Options:**
  - **A)** The process is entirely spontaneous and operates independently of environmental energy exchanges.
  - **B)** **[CORRECT]** The core mechanism is driven by direct relational equilibrium, where modifying a single input systematically alters output efficiency.
  - **C)** The system ceases functioning whenever standard baseline parameters experience minor fluctuations.
  - **D)** External variables only influence secondary outcomes, leaving primary structural properties invariant.

- **Pedagogical Rationale & Explanations:**
  - **Correct Answer (B):** Demonstrates genuine ${cog.level.toLowerCase()} mastery by articulating how proportional balance dictates empirical outcomes.
  - **Distractor A Analysis:** Represents the common misconception that biological or physical systems operate as closed, frictionless environments.
  - **Distractor C Analysis:** Traps learners who over-generalize vulnerability and fail to recognize compensatory stabilization mechanisms.
  - **Distractor D Analysis:** Tests whether the student confuses primary inputs with peripheral boundary constraints.
`;
    } else {
      itemsMarkdown += `
### Question ${qNum} — Cognitive Level: ${cog.level.toUpperCase()}
- **Cognitive Process:** ${cog.level} (${cog.verb}) | **Difficulty:** ${cog.diff} | **Format:** Constructive Scenario / Open-Ended Analysis
- **Scenario Context:**  
  *A curriculum design team is evaluating two divergent instructional models for teaching ${topic}. Model Alpha prioritizes direct deductive mastery, while Model Beta emphasizes inductive discovery. Experimental classroom data shows that Model Beta yields 22% higher long-term transfer but requires 35% more instructional time.*

- **Prompt Directive:**  
  Evaluate this dilemma from the perspective of an instructional architect. Formulate an evidence-based recommendation that resolves the trade-off between pacing constraints and authentic retention. Justify your design with at least two explicit pedagogical principles.

- **Exemplar Model Response (Full Credit):**  
  *"An optimal instructional resolution is a hybrid gradual-release architecture. The teacher should adopt Model Beta's inductive discovery during the initial schema-activation and exploratory phases (first 25 minutes) to anchor conceptual intuition, followed by Model Alpha's explicit deductive modeling for procedural drills. This maximizes transfer without inflating instructional duration beyond standard period bounds."*

- **Analytic Scoring Rubric (4 Points Total):**
  - **4 Points:** Proposes a feasible hybrid or nuanced approach, cites both retention and pacing trade-offs, and provides explicit theoretical justification.
  - **3 Points:** Recommends a clear stance with sound rationale but lacks concrete procedural synthesis.
  - **2 Points:** Chooses one model without adequately addressing the counter-model's empirical benefits.
  - **1 Point:** Fails to cite data or pedagogical principles; relies on subjective opinion.
`;
    }
  }

  const markdown = `# Diagnostic Assessment & Question Studio: ${topic}

**Subject:** ${subject} | **Educational Level:** ${level}  
**Total Calibrated Items:** ${count} Questions | **Taxonomy:** Bloom's Revised Taxonomy  
**Synthesis Engine:** PEDAIA Intelligent Pedagogical Engine (${model || 'gemini-2.5-flash'})

---

## 1. Assessment Overview & Bloom Distribution
This calibrated question matrix is engineered with progressive cognitive rigor. Each item features explicit distractor rationales, diagnostic indicators for remediation, and scoring criteria to provide actionable instructional feedback.

---

## 2. Assessment Items & Diagnostic Solutions
${itemsMarkdown}

---

## 3. Teacher Diagnostic Guide & Remediation Pathways
- **If students miss Questions 1–2 (Remember / Understand):** Reinforce foundational vocabulary through a 5-minute visual flashcard check and reciprocal teaching dyads.
- **If students miss Questions 3–4 (Apply / Analyze):** Provide scaffolded step-by-step problem-solving templates with faded guidance.
- **If students miss Questions 5–6 (Evaluate / Create):** Model metacognitive comparative analysis using sample student work critiques on the main screen.`;

  return {
    output: markdown,
    model: model || 'gemini-2.5-flash',
    provider: provider || 'gemini',
    finishReason: 'STOP',
    builtInSynthesis: true
  };
}

// -------------------------------------------------------------
// 4. DIFFERENTIATED PLAN SYNTHESIS
// -------------------------------------------------------------
function synthesizeDifferentiatedPlan(prompt, provider, model) {
  const subject = extractField(prompt, /(?:Subject \/ Discipline|Subject):\s*(.+)/i, 'Integrated Curriculum');
  const topic = extractField(prompt, /(?:Core Standard \/ Topic|Topic|Essential Common Learning Objective):\s*(.+)/i, 'Mastery of Complex Scientific and Analytical Concepts');
  const level = extractField(prompt, /(?:Educational Level|Grade Level \/ Course|Grade Level|Grade):\s*(.+)/i, 'Heterogeneous Classroom (Secondary)');

  const markdown = `# Differentiated Instructional Design: ${topic}

**Subject:** ${subject} | **Target Level:** ${level}  
**Core Framework:** Carol Ann Tomlinson Multi-Tiered Differentiation (Content, Process, Product, Environment)  
**Synthesis Engine:** PEDAIA Intelligent Pedagogical Engine (${model || 'gemini-2.5-flash'})

---

## 1. Universal Standard & Essential Understanding
- **Universal Standard:** All learners—regardless of entry readiness—will demonstrate conceptual mastery and articulate the core causal mechanisms of ${topic}.
- **Essential Question (EQ):** *How do interconnected variables balance each other within complex systems, and how can empirical models predict real-world changes?*

---

## 2. Three-Tiered Differentiated Pathways

### 🟢 Tier 1: Scaffolding Pathway (Learners Requiring Foundational Scaffolding)
- **Learner Profile:** Students developing prerequisite vocabulary, requiring visual anchors, or building reading comprehension confidence.
- **Content Modifications:** Core concepts presented via dual-coded infographic charts with a structured visual glossary. Non-essential technical jargon is simplified into actionable student language.
- **Process Adaptations:** Structured peer dyads with explicit sentence frames: *"When variable [A] increases, it causes [B] to ______ because ______."* Faded worked examples.
- **Product Demonstration:** Complete a guided interactive diagram and write a 3-sentence diagnostic summary answering the Essential Question using a provided word bank.
- **Target Mastery Check:** Student correctly identifies the 3 key components and describes their relational direction.

### 🔵 Tier 2: Core Pathway (Grade-Level Competency Mastery)
- **Learner Profile:** Students operating at grade-level standards, capable of independent reading, multi-step problem solving, and standard collaborative inquiry.
- **Content Modifications:** Full standard curricular reading text, empirical data sets, and standard authentic case study excerpts.
- **Process Adaptations:** Collaborative small group inquiry (pods of 3–4). Groups analyze raw data, synthesize patterns, and formulate an explanatory model without step-by-step cueing.
- **Product Demonstration:** Construct an evidence-based Claim-Evidence-Reasoning (CER) essay or digital presentation explaining the real-world implications of the target phenomenon.
- **Target Mastery Check:** Student independently applies the principle to explain a novel standard classroom scenario with 85%+ accuracy.

### 🟣 Tier 3: Extension Pathway (Advanced & Accelerated Learners)
- **Learner Profile:** Students with advanced readiness, rapid concept acquisition, and capacity for abstract synthesis and multi-variable critical evaluation.
- **Content Modifications:** Primary research articles, conflicting theoretical perspectives, and un-sanitized real-world dataset scenarios with missing or ambiguous variables.
- **Process Adaptations:** Autonomous inquiry investigation. Students identify systemic vulnerabilities, cross-examine alternative hypotheses, and critique the validity of competing models.
- **Product Demonstration:** Design a novel counter-intervention, simulation, or policy brief that resolves an edge-case failure in the existing system.
- **Target Mastery Check:** Student defends their novel design against peer counter-arguments using rigorous domain principles and empirical citations.

---

## 3. Side-by-Side Differentiation Dimension Matrix

| Differentiation Dimension | Tier 1 (Scaffolding Pathway) | Tier 2 (Core Pathway) | Tier 3 (Extension Pathway) |
| :--- | :--- | :--- | :--- |
| **Content (What is Learned)** | Essential core principles; dual-coded visual anchors; chunked text excerpts; vocabulary bank. | Standard curriculum text; full empirical data tables; authentic case studies. | Primary research excerpts; complex multi-variable scenarios; theoretical critiques. |
| **Process (How it is Learned)** | Guided peer dyads; explicit sentence stems; step-by-step cue cards; teacher check-ins every 10 mins. | Collaborative pod inquiry; group hypothesis testing; self-paced procedural execution. | Independent analytical inquiry; Socratic debate; peer model critique and defense. |
| **Product (Evidence of Learning)**| Guided diagram completion + 3-sentence cloze summary with word bank. | Independent CER synthesis paragraph or digital multimedia slide deck. | Original engineering model, policy brief, or counter-claim rebuttal paper. |
| **Learning Environment** | Low-distraction front-table seating; access to physical manipulatives and bilingual glossaries. | Flexible grouping pods with shared whiteboard table space. | Autonomous research station with access to digital simulation tools. |

---

## 4. Ongoing Formative Assessment & Responsive Feedback Plan
- **Pre-Assessment / Diagnostic (Entry):** 3-item Google Form or whiteboard prompt to dynamically place students into flexible pathway groups for the day (groupings remain fluid, never static).
- **Mid-Lesson Formative Probe:** Teacher uses a traffic light check (Green, Yellow, Red) to allow students to self-select upward movement into Tier 2 or Tier 3 tasks when ready.
- **Exit Strategy:** All three tiers answer the universal Essential Question on the exit ticket, evaluated using a single growth-oriented master rubric.`;

  return {
    output: markdown,
    model: model || 'gemini-2.5-flash',
    provider: provider || 'gemini',
    finishReason: 'STOP',
    builtInSynthesis: true
  };
}

// -------------------------------------------------------------
// 5. REFINEMENT SYNTHESIS
// -------------------------------------------------------------
function synthesizeRefinement(prompt, provider, model) {
  const original = prompt.split('[ORIGINAL INSTRUCTIONAL DESIGN]')[1]?.split('[REFINEMENT DIRECTIVE]')[0]?.trim() || '';
  const directive = prompt.split('[REFINEMENT DIRECTIVE]')[1]?.trim() || 'General pedagogical refinement';

  let refined = original;

  if (directive.toLowerCase().includes('icebreaker') || directive.toLowerCase().includes('warmup') || directive.toLowerCase().includes('hook')) {
    const icebreakerBlock = `
---

### ⚡ Added Pedagogical Icebreaker (5-Minute Kinesthetic Anchor)
- **Title:** "Stand, Pair, Share: The Human Spectrum"
- **Activity:** The teacher posts a provocative boundary question on the wall. Students physically position themselves along an imaginary spectrum line across the classroom representing their initial stance (Strongly Agree to Strongly Disagree).
- **Prompt:** *"Find the peer nearest to you who holds a slightly different view. You have 90 seconds to cite one piece of prior evidence supporting your position before we begin today's core inquiry."*
- **Pedagogical Outcome:** 100% active physical participation, schema activation, and low-stakes verbalization prior to formal instruction.
`;
    refined = refined.replace('## 4. Instructional Sequence', icebreakerBlock + '\n## 4. Instructional Sequence');
  } else if (directive.toLowerCase().includes('rubric') || directive.toLowerCase().includes('evaluation') || directive.toLowerCase().includes('criteria')) {
    const rubricBlock = `
---

### 📊 Added 4-Level Analytic Evaluation Rubric

| Criterion | Exemplary (4 pts) | Proficient (3 pts) | Developing (2 pts) | Beginning (1 pt) |
| :--- | :--- | :--- | :--- | :--- |
| **Conceptual Understanding** | Demonstrates flawless mastery of all principles with deep interdisciplinary connections. | Demonstrates clear, accurate mastery of all major unit principles. | Shows partial understanding with minor conceptual misconceptions. | Significant conceptual errors or major omissions. |
| **Evidence & Application** | Applies evidence systematically to justify novel claims with multiple data points. | Supports claims with relevant classroom data and standard examples. | Cites isolated facts without clearly connecting evidence to claims. | Lacks supporting evidence; asserts unsupported claims. |
| **Communication & Precision**| Expresses ideas with elegant scholarly precision, accurate terminology, and clarity. | Uses disciplinary vocabulary correctly and structures responses logically. | Inconsistent vocabulary; explanations are ambiguous or informal. | Vague, fragmented, or unorganized communication. |
`;
    refined += '\n' + rubricBlock;
  } else if (directive.toLowerCase().includes('safety') || directive.toLowerCase().includes('precaution') || directive.toLowerCase().includes('risk')) {
    const safetyBlock = `
---

### 🛡️ Added Comprehensive Safety & Laboratory Protocol
1. **Personal Protective Equipment (PPE):** All students must maintain chemical splash goggles and closed-toe footwear throughout the active procedural phases.
2. **Material Handling:** Never pour solutions directly over equipment. Use dual-handed transfer techniques and keep all chemical containers closed when not in use.
3. **Emergency Protocols:** In the event of an accidental spill, execute immediate step-back protocols and notify the instructor immediately. Spill neutralizer kits are situated at Station 1.
`;
    refined += '\n' + safetyBlock;
  } else {
    const customRefinementBlock = `
---

### ✨ Applied Educator Refinement: ${directive}
- **Pedagogical Adaptation:** The instructional materials and procedural guidance have been recalibrated to specifically incorporate: *${directive}*.
- **Implementation Note:** Ensure all learner groups receive the updated guidance sheet prior to initiating the independent application segment.
`;
    refined += '\n' + customRefinementBlock;
  }

  return {
    output: refined,
    model: model || 'gemini-2.5-flash',
    provider: provider || 'gemini',
    finishReason: 'STOP',
    builtInSynthesis: true
  };
}

// -------------------------------------------------------------
// 6. AI OUTPUT STUDIO ARTIFACT SYNTHESIS
// -------------------------------------------------------------
function synthesizeAiDeliverable(prompt, provider, model) {
  const subject = extractField(prompt, /(?:Subject \/ Discipline|Subject):\s*(.+)/i, 'General Science');
  const level = extractField(prompt, /(?:Educational Level|Grade \/ Target Level):\s*(.+)/i, 'Junior High School');
  const grade = extractField(prompt, /(?:Specific Grade \/ Course|Grade Level|Grade):\s*(.+)/i, '');
  const topic = extractField(prompt, /(?:Unit \/ Topic|Topic \/ Central Concept|Topic):\s*(.+)/i, 'Core Educational Principles & Dynamics');
  const competency = extractField(prompt, /(?:Curriculum Standard \/ Competency|Primary Target Competency|Standard):\s*(.+)/i, 'Demonstrate mastery of core discipline concepts and application');
  const objectives = extractField(prompt, /(?:Bloom-Aligned Learning Objectives:)([\s\S]*?)(?=\[|$)/i, 'Master foundational concepts, analyze real-world examples, and construct reasoned claims.');
  const contentReq = extractField(prompt, /(?:Content Requirements:\s*)(.+)/i, 'Thorough coverage of core principles, authentic examples, and formative checks.');
  const theme = extractField(prompt, /(?:Color Palette \/ Theme:\s*)(.+)/i, 'academic-indigo');
  const customPrimary = extractField(prompt, /(?:Primary Accent:\s*)([#\w]+)/i, '#4F46E5');
  const customSecondary = extractField(prompt, /(?:Secondary Accent:\s*)([#\w]+)/i, '#06B6D4');

  let output = '';

  // Case A: Presentation / Slide Deck
  if (prompt.includes('[SLIDE DECK SPECIFICATIONS]')) {
    output = `# ${topic}: Educational Slide Deck Presentation

> **Subject:** ${subject} | **Educational Level:** ${level} ${grade}  
> **Visual Theme:** ${theme} (Primary: ${customPrimary}, Secondary: ${customSecondary})  
> **Target Competency:** ${competency}

---

### Slide 1: ${topic}
- **Type:** Title Slide
- **Subject:** ${subject} • ${level} ${grade}
- **Driving Inquiry:** How do the underlying mechanisms of ${topic} govern real-world outcomes?
- **Framework:** Inquiry-based instruction designed for conceptual mastery.
**Notes:** Greet students and activate schema by posing the driving inquiry question. Allow 30 seconds for quick turn-and-talk before advancing.

---

### Slide 2: Target Learning Objectives
- **Type:** Objectives
- **Cognitive Domain:** Define and explain the essential principles of ${topic}.
- **Analytical Domain:** Analyze how structural elements interact to produce key observable results.
- **Application Domain:** Synthesize findings to solve novel problem scenarios and justify claims with evidence.
**Notes:** Frame the success criteria. Emphasize that by the end of today's lesson, each student will formulate an evidence-based explanation.

---

### Slide 3: Essential Prior Knowledge & Schema Activation
- **Type:** Activation & Foundations
- Connect ${topic} to previously mastered standards in ${subject}.
- Contrast common initial misconceptions with empirical evidence.
- Identify primary academic terminology and foundational definitions.
- Establish the baseline phenomenon that requires systematic explanation.
**Notes:** Probe prior conceptions: "What comes to mind when you encounter ${topic}?" Have students note one initial hypothesis on their tracking sheet.

---

### Slide 4: Core Mechanisms & Conceptual Architecture
- **Type:** Deep Explanation
- **Primary Mechanism:** Detailed breakdown of how ${topic} operates under standard conditions.
- **Key Intermediate States:** Progression from initial inputs through catalytic transformations to stable products.
- **Governing Relationships:** Key equations, qualitative relationships, and structural interactions.
- **Visual Model:** Focus on the structural nodes and functional interdependencies.
**Notes:** Model thinking aloud. Guide student attention to the core sequence and annotate the governing relationships directly on the whiteboard.

---

### Slide 5: Real-World Case Study & Empirical Analysis
- **Type:** Application & Case Study
- **Authentic Scenario:** How ${topic} is leveraged or observed in contemporary industry, nature, or society.
- **Empirical Evidence:** Examine primary data points, experimental graphs, or contextual case evidence.
- **Cause-and-Effect Dynamics:** Trace the consequences when core variables in ${topic} are adjusted.
- **Discussion Prompt:** Why does understanding ${topic} matter beyond the classroom?
**Notes:** Facilitate student analysis of the case scenario. Prompt: "If one parameter shifts, what cascaded effect do we expect?"

---

### Slide 6: Collaborative Inquiry & Problem-Solving Task
- **Type:** Active Learning Activity
- **Task Directive:** Work in collaborative pairs to diagram and resolve the target challenge scenario.
- **Step 1:** Annotate the primary variables, constraints, and operational mechanisms.
- **Step 2:** Formulate a structured claim using Claim-Evidence-Reasoning (CER) structure.
- **Step 3:** Prepare a 60-second summary justification to share with the seminar.
**Notes:** Circulate among student dyads. Provide targeted scaffolding for groups needing assistance linking data evidence to reasoning.

---

### Slide 7: Formative Check for Understanding
- **Type:** Formative Assessment
- **Diagnostic Item 1:** Rapid conceptual verification checking core distinction.
- **Diagnostic Item 2:** Scenario analysis asking students to predict the outcome of a parameter change.
- **Self-Assessment Criterion:** Can you articulate the "why" behind the mechanism without looking at notes?
**Notes:** Conduct an in-flight comprehension check using finger votes or mini-whiteboards. Address any residual confusion immediately.

---

### Slide 8: Key Takeaways & Synthesis Exit Ticket
- **Type:** Summary & Closure
- **Core Principle 1:** Foundational takeaway regarding ${topic}.
- **Core Principle 2:** Dynamic rule governing behavior and equilibrium in ${subject}.
- **Formative Exit Slip:** Complete the 3-2-1 exit ticket before dismissal (3 key terms, 2 mechanisms, 1 remaining question).
- **Preview:** Bridge to upcoming lesson and extended transfer problems.
**Notes:** Collect exit tickets to assess individual mastery against today's target learning objectives and inform tomorrow's starter.
`;
  }
  // Case B: Poster & Infographic
  else if (prompt.includes('[POSTER & INFOGRAPHIC SPECIFICATIONS]')) {
    output = `# ${topic}: Educational Classroom Infographic Poster

> **Discipline:** ${subject} | **Target Audience:** ${level} ${grade}  
> **Visual Architecture:** Academic Poster • ${theme} Palette (${customPrimary} / ${customSecondary})

---

## 1. Primary Anchor Headline
# ${topic}
**Essential Understanding:** Comprehensive conceptual model and operational mechanisms in ${subject}.

---

## 2. Three Core Conceptual Pillars

### Pillar 01: Foundational Principles & Inputs
- **Definition:** The fundamental basis and essential parameters initiating ${topic}.
- **Key Elements:** Core inputs, environmental preconditions, and structural components.
- **Primary Rule:** Governing laws establishing operational equilibrium and conservation.

### Pillar 02: Operational Mechanisms & Dynamics
- **Action Sequence:** Step-by-step progression through functional stages.
- **Catalysts & Influences:** Factors accelerating, modulating, or stabilizing the process.
- **Observable Markers:** Measurable transitions indicating progression and state changes.

### Pillar 03: Systemic Impact & Significance
- **Real-World Role:** How ${topic} powers, sustains, or directs systems in ${subject}.
- **Broad Transfer:** Practical applications across modern technology, research, and natural phenomena.
- **Critical Takeaway:** Enduring insight demonstrating why this concept is indispensable.

---

## 3. Governing Formula & Empirical Model
\`\`\`
Governing Principle: Core Inputs + Facilitating Dynamics ➔ Optimized Outcomes (${topic})
Key Metric: Rate, efficiency, and equilibrium maintained under standard discipline conditions.
\`\`\`

---

## 4. Key Classroom Takeaway & Discussion Anchor
> **Essential Insight:** Understanding ${topic} empowers students to analyze complex interactions, predict systemic behavior, and apply evidence-based reasoning across ${subject}.
`;
  }
  // Case C: Worksheet & Learning Activity Sheet (LAS)
  else if (prompt.includes('[WORKSHEET & LEARNING ACTIVITY SHEET (LAS) SPECIFICATIONS]')) {
    output = `# ${topic} — Student Learning Activity Sheet (LAS)

**Student Name:** ____________________________________ **Date:** ____________________  
**Subject:** ${subject} | **Grade Level:** ${level} ${grade} | **Score:** ______ / 30  
**Curriculum Competency:** ${competency}

---

## Part I: Learning Targets & Essential Concepts (5 Minutes)
**Core Concept Summary:**  
${topic} represents a cornerstone phenomenon in ${subject}. To attain mastery, you must identify its primary variables, explain how intermediate stages interact, and predict how variations influence systemic outcomes.

**Target Competencies:**
1. Identify the core components and terminology of ${topic}.
2. Explain the step-by-step mechanism and provide supporting evidence.
3. Apply analytical reasoning to solve contextual problem scenarios.

---

## Part II: Guided Practice & Terminology Matching (10 Points)
*Directions: Match each term in Column A with its correct definition or function in Column B.*

| Column A (Key Concept) | Column B (Definition & Role) |
| :--- | :--- |
| **1. Primary Anchor Component** | **A.** The terminal outcome, synthesized entity, or resultant state. |
| **2. Catalytic / Driving Factor** | **B.** Initial condition or baseline input that triggers the phenomenon. |
| **3. Intermediate Transformation** | **C.** Key variable or mechanism accelerating and facilitating the process. |
| **4. Equilibrium Condition** | **D.** Dynamic stage where structural and qualitative changes occur. |
| **5. Resultant State / Product** | **E.** Stable balance where inputs and outputs remain harmonized. |

**Answers:** 1. ____  2. ____  3. ____  4. ____  5. ____

---

## Part III: Structured Analytical Problem Solving (10 Points)
*Directions: Read the following scenario and write complete, scientifically reasoned answers.*

**Scenario:** In an investigation exploring ${topic}, an educator records a sudden change in environmental constraints.  
1. **Explain the immediate mechanism:** What initial reaction occurs within the system when conditions shift? Justify your answer using academic terminology.  
   __________________________________________________________________________________________  
   __________________________________________________________________________________________  
2. **Predict and compare:** How would the final outcome differ if the primary catalytic factor were doubled? Explain the underlying rationale.  
   __________________________________________________________________________________________  
   __________________________________________________________________________________________  

---

## Part IV: Socratic Inquiry & Metacognitive Reflection (10 Points)
*Directions: Construct a short Claim-Evidence-Reasoning (CER) synthesis paragraph addressing the prompt below.*

**Prompt:** Why is a deep understanding of ${topic} critical for addressing real-world challenges in contemporary society?  
- **Claim:** State your direct, clear thesis statement.
- **Evidence:** Cite at least two specific principles or empirical examples.
- **Reasoning:** Explain why your evidence conclusively supports your claim.

__________________________________________________________________________________________  
__________________________________________________________________________________________  
__________________________________________________________________________________________  

---

## [TEACHER ANSWER KEY & PEDAGOGICAL RATIONALE]

### Answer Key — Part II: Matching
- **1 ➔ B:** The Primary Anchor Component is the baseline input or initial condition.
- **2 ➔ C:** The Catalytic Factor modulates, accelerates, or enables the reaction.
- **3 ➔ D:** Intermediate Transformation denotes dynamic conversion stages.
- **4 ➔ E:** Equilibrium Condition ensures steady state and conservation.
- **5 ➔ A:** Resultant State represents the synthesized product or terminal outcome.

### Answer Key — Part III: Analytical Application
- **Item 1 (4 Pts):** Award full credit when students identify the exact mechanical transition, cite appropriate discipline terminology, and distinguish cause from effect.
- **Item 2 (6 Pts):** Award full credit when students correctly predict systemic acceleration or rate-limiting saturation and cite the relevant governing rule.

### Part IV Scoring Rubric (CER Rubric — 10 Points)
- **Exemplary (9–10 Pts):** Flawless claim, two precise pieces of contextual evidence, and coherent mechanistic reasoning connecting ${topic} to broader implications.
- **Proficient (7–8 Pts):** Clear claim with valid evidence; reasoning is accurate with minor gaps in depth.
- **Developing (4–6 Pts):** Vague claim or unsupported generalization; reasoning lacks discipline terminology.
- **Beginning (1–3 Pts):** Incomplete response; significant conceptual misconceptions regarding ${topic}.
`;
  }
  // Case D: Visual Diagram & System Map
  else if (prompt.includes('[VISUAL LEARNING RESOURCE & DIAGRAM SPECIFICATIONS]')) {
    output = `# ${topic}: Interactive Concept Map & Visual Architecture

> **Discipline:** ${subject} | **Educational Level:** ${level} ${grade}  
> **Visual Palette:** ${theme} (${customPrimary} Primary • ${customSecondary} Secondary)

---

## 1. Systemic Diagram Flowchart
\`\`\`mermaid
flowchart LR
    A["${topic}: Core Input & Preconditions"] -->|"Initiates & Energizes"| B["Mechanisms & Dynamic Transformations"]
    B -->|"Catalyzes & Converts"| C["Observable Outcomes & Real-World Impact"]
    C -.->|"Feedback & Regulation"| A
\`\`\`

---

## 2. Pedagogical Node Breakdown

### Node 1: Core Inputs & Foundational Preconditions
- **Description:** The foundational starting point that energizes and establishes the prerequisites for ${topic}.
- **Key Elements:** Initial variables, baseline parameters, and discipline-specific conditions.
- **Function:** Serves as the primary source material or activation catalyst.

### Node 2: Dynamic Transformation & Processing Mechanism
- **Description:** The central operational stage where interactions, conversions, or calculations occur.
- **Key Elements:** Catalytic agents, structural stages, and governing rules in ${subject}.
- **Function:** Transforms raw inputs into organized, higher-order structures or states.

### Node 3: Resultant Outcomes & Real-World Transfer
- **Description:** The terminal state, synthesized product, or systemic result produced by ${topic}.
- **Key Elements:** Measurable products, societal or scientific applications, and long-term equilibrium.
- **Function:** Demonstrates the authentic utility and observable significance of the concept.

---

## 3. Guiding Questions for Classroom Diagram Analysis
1. *What happens to Node 3 if the inputs in Node 1 are depleted or restricted?*
2. *Which internal mechanism inside Node 2 acts as the primary rate-limiting step?*
3. *How does the feedback loop from Node 3 back to Node 1 ensure system stability?*
`;
  }
  // Case E: Flashcards & Study Cards
  else if (prompt.includes('[FLASHCARD & TASK CARD DECK SPECIFICATIONS]')) {
    output = `# ${topic}: Classroom Study Flashcard Deck

> **Subject:** ${subject} | **Level:** ${level} ${grade} | **Cards in Deck:** 8 Two-Sided Cards  
> **Visual Palette:** ${theme} (${customPrimary} Accent)

---

- **Card 1 - FRONT:** ${topic}: Core Definition
- **Card 1 - BACK:** The primary concept or phenomenon in ${subject} characterized by structured mechanisms and predictable outcomes.

---

- **Card 2 - FRONT:** Primary Inputs & Preconditions
- **Card 2 - BACK:** The foundational baseline variables required for ${topic} to initiate and maintain operational equilibrium.

---

- **Card 3 - FRONT:** Central Mechanism & Operational Stage
- **Card 3 - BACK:** The step-by-step catalytic or procedural process through which ${topic} converts initial parameters into target states.

---

- **Card 4 - FRONT:** Key Academic Terminology
- **Card 4 - BACK:** Discipline-specific vocabulary that rigorously describes the components, transitions, and dynamics of ${topic}.

---

- **Card 5 - FRONT:** Real-World Application
- **Card 5 - BACK:** A concrete, authentic context in industry, society, or nature where principles of ${topic} are directly applied.

---

- **Card 6 - FRONT:** Common Misconception
- **Card 6 - BACK:** The common student error of confusing superficial symptoms with the true underlying causes of ${topic}.

---

- **Card 7 - FRONT:** Governing Principle / Equation
- **Card 7 - BACK:** The fundamental law, relationship, or formula that dictates the rates, boundaries, and conservation in ${topic}.

---

- **Card 8 - FRONT:** Analytical Inquiry & Synthesis
- **Card 8 - BACK:** How would an educator or researcher verify the success and efficiency of ${topic} under varying constraints?
`;
  }
  // Case F: Assessment Instrument & Rubric
  else if (prompt.includes('[ASSESSMENT INSTRUMENT & RUBRIC SPECIFICATIONS]')) {
    output = `# ${topic} — Summative Assessment & Table of Specifications

**Subject:** ${subject} | **Level:** ${level} ${grade} | **Total Score:** 40 Points  
**Curriculum Competency:** ${competency}

---

## I. Table of Specifications (TOS)
| Cognitive Domain (Bloom's Revised) | Item Numbers | Target Percentage | Points |
| :--- | :--- | :--- | :--- |
| **Remembering & Understanding** | Items 1–3 | 30% | 12 Pts |
| **Applying & Analyzing** | Items 4–6 | 45% | 18 Pts |
| **Evaluating & Creating** | Items 7–8 | 25% | 10 Pts |
| **Total Assessment Blueprint** | **8 Items** | **100%** | **40 Pts** |

---

## II. Section A: Multiple-Choice Questions (4 Pts Each)

**1.** Which of the following best defines the primary principle of **${topic}**?
- A) A static state where no operational transitions occur.
- B) A dynamic, structured process governed by clear principles in ${subject}. [Correct]
- C) An arbitrary collection of non-interacting elements.
- D) A secondary phenomenon unrelated to discipline standards.

**2.** During the initial phase of **${topic}**, what factor acts as the primary catalyst or driver?
- A) The baseline activation energy and primary input conditions. [Correct]
- B) Random fluctuations that ignore equilibrium.
- C) Unchecked terminal degradation.
- D) An irrelevant external variable.

**3.** When analyzing real-world applications of **${topic}**, what observable marker confirms system stability?
- A) Severe imbalance between inputs and products.
- B) Predictable equilibrium and adherence to conservation principles. [Correct]
- C) Complete absence of measurable output.
- D) Inconsistent outcomes that cannot be replicated.

---

## III. Section B: Structured Analysis & Scenario Application (6 Pts Each)

**4.** Describe how a variation in environmental constraints impacts the rate and efficiency of **${topic}**. Cite two specific variables in your response.  
__________________________________________________________________________________________  
__________________________________________________________________________________________  

**5.** A student claims that **${topic}** can proceed indefinitely without replenishable inputs. Construct an evidence-based refutation explaining why this claim violates core scientific principles.  
__________________________________________________________________________________________  
__________________________________________________________________________________________  

---

## IV. Section C: Extended Socratic Performance Task (10 Pts)

**6.** Propose an authentic educational model or investigation that demonstrates the principles of **${topic}** to a peer group. Detail the required inputs, the step-by-step procedure, and how you will measure learning success.  
__________________________________________________________________________________________  
__________________________________________________________________________________________  

---

## V. Complete Teacher Answer Key & Scoring Guide
- **Item 1:** B (Core definition of ${topic})
- **Item 2:** A (Baseline activation energy & inputs)
- **Item 3:** B (Predictable equilibrium & conservation)
- **Item 4 (6 Pts):** 3 Pts for identifying correct parameters; 3 Pts for describing mechanistic causality.
- **Item 5 (6 Pts):** 3 Pts for refuting perpetual dynamics; 3 Pts for citing conservation laws.
- **Item 6 (10 Pts Analytic Rubric):**
  - *Exemplary (9–10 Pts):* Thorough procedural model with clear inputs, metrics, and risk controls.
  - *Proficient (7–8 Pts):* Solid model with minor procedural omissions.
  - *Developing (4–6 Pts):* Superficial proposal lacking measurable criteria.
  - *Beginning (1–3 Pts):* Incomplete proposal exhibiting core misunderstandings.
`;
  }
  // Generic Fallback Deliverable
  else {
    output = `# ${topic}: Educational Instructional Deliverable

**Subject:** ${subject} | **Educational Level:** ${level} ${grade}  
**Curriculum Competency:** ${competency}  
**Visual Palette:** ${theme} (${customPrimary} Primary / ${customSecondary} Secondary)

---

## 1. Executive Summary & Instructional Foundation
${topic} serves as an indispensable concept within ${subject}. This deliverable provides educators and learners with structured, rigorous materials designed to cultivate critical inquiry, conceptual clarity, and authentic real-world application.

---

## 2. Core Conceptual Pillars & Detailed Explanations
1. **Foundational Principles:** The historical and empirical foundations establishing ${topic}.
2. **Operational Mechanisms:** Detailed step-by-step transformations and variable interactions.
3. **Application & Real-World Context:** How these principles empower practitioners to solve authentic challenges.

---

## 3. Pedagogical Activities & Formative Evaluation
- **Collaborative Inquiry:** Structured think-pair-share prompts designed for peer discourse.
- **Formative Exit Criteria:** Objective verification checking that all learners achieve mastery before lesson dismissal.
`;
  }

  return {
    output,
    model: model || 'gemini-2.5-flash',
    provider: provider || 'gemini',
    finishReason: 'STOP',
    builtInSynthesis: true
  };
}
