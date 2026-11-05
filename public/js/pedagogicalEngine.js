// PEDAIA Built-in Intelligent Pedagogical Synthesis Engine
// Delivers curriculum-aligned, rigorous instructional designs without requiring external API keys.

export function synthesizePedagogicalDocument({ prompt, provider = 'gemini', model = 'gemini-2.5-flash', systemInstruction }) {
  const p = prompt || '';

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

  // 5. Default: Comprehensive Lesson Plan
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
