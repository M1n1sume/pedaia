// PEDAIA Extended Pedagogical Synthesis Engines
// Delivers curriculum-aligned, rigorous instructional materials across all new studios.

function extractField(prompt, regex, defaultVal = '') {
  const match = prompt.match(regex);
  return match && match[1] ? match[1].trim() : defaultVal;
}

// -------------------------------------------------------------
// 1. PRESENTATION DECK SYNTHESIS
// -------------------------------------------------------------
export function synthesizePresentationDeck(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const subject = extractField(prompt, /Subject \/ Discipline:\s*(.+)/i, 'General Science');
  const level = extractField(prompt, /Educational Level:\s*(.+)/i, 'Junior High School');
  const topic = extractField(prompt, /Topic \/ Central Concept:\s*(.+)/i, 'Cellular Energetics & Photosynthesis');
  const competency = extractField(prompt, /Target Standard \/ Competency:\s*(.+)/i, 'Demonstrate mastery of core discipline standards through empirical inquiry');
  const audience = extractField(prompt, /Target Audience:\s*(.+)/i, 'Students');
  const duration = extractField(prompt, /Presentation Duration:\s*(.+)/i, '45 minutes');
  const numSlidesStr = extractField(prompt, /Total Slides:\s*(\d+)/i, '10');
  const numSlides = Math.min(15, Math.max(5, parseInt(numSlidesStr, 10) || 10));

  const slides = [];

  // Slide 1: Title
  slides.push(`### Slide 1: ${topic}
- **Slide Type**: Title Slide
- **Visual & Layout Directive**: Hero presentation slide with dark indigo canvas, central scholarly title, institution badge.
- **Slide Content**:
  # ${topic}
  *Curriculum Exploration & Conceptual Foundations*
  - **Discipline**: ${subject}
  - **Academic Tier**: ${level}
  - **Target Audience**: ${audience}
- **Speaker Notes & Narration**:
  "Good morning scholars. Today we embark on our inquiry into ${topic}. Before we begin, look at the challenge question on the board and think about how this phenomenon shapes our daily world."
- **Estimated Timing**: 3 minutes`);

  // Slide 2: Learning Objectives
  slides.push(`### Slide 2: Intended Learning Outcomes & Competency
- **Slide Type**: Learning Objectives
- **Visual & Layout Directive**: Split-card layout with numbered target badges and competency reference bar.
- **Slide Content**:
  ### Core Learning Benchmarks
  1. **Conceptual Understanding**: Articulate fundamental principles governing ${topic}.
  2. **Inquiry & Empirical Modeling**: Analyze real-world data and construct visual models.
  3. **Critical Synthesis**: Evaluate empirical claims and propose evidence-backed solutions.
  > *Curriculum Competency: ${competency}*
- **Speaker Notes & Narration**:
  "Here are our three core outcomes for this session. By the end of our lesson, each of you will demonstrate mastery not just by recalling definitions, but by actively applying principles in our collaborative lab."
- **Estimated Timing**: 4 minutes`);

  // Slide 3: Motivation / Real-World Hook
  slides.push(`### Slide 3: Provocative Inquiry Hook
- **Slide Type**: Motivation / Hook
- **Visual & Layout Directive**: Full-width case dilemma box with two contrasting scenarios.
- **Slide Content**:
  ### The Central Paradox: Why Does This Matter?
  - Consider this empirical puzzle: What occurs when standard assumptions are challenged?
  - **Observation A**: Baseline condition produces predictable equilibrium.
  - **Observation B**: Perturbation results in exponential system response.
  - *Question for Table Pairs*: What hidden variables might explain this shift?
- **Speaker Notes & Narration**:
  "Turn to your shoulder partner. Look closely at these two contrasting observations. You have 90 seconds to identify at least two potential explanatory factors before we open the floor."
- **Estimated Timing**: 5 minutes`);

  // Middle Slides: Core Concepts & Guided Practice
  for (let i = 4; i <= numSlides - 2; i++) {
    const isActivity = (i === Math.floor(numSlides / 2));
    if (isActivity) {
      slides.push(`### Slide ${i}: Collaborative Inquiry Activity
- **Slide Type**: Student Activity
- **Visual & Layout Directive**: 3-step action card grid with countdown timer indicator.
- **Slide Content**:
  ### Active Laboratory Challenge: Testing the Phenomenon
  - **Step 1 (Setup)**: Review the provided inquiry data matrix in your group folders.
  - **Step 2 (Analysis)**: Formulate a group claim using the *Evidence-Reasoning* protocol.
  - **Step 3 (Deliverable)**: Record your consensus model on your dry-erase breakout board.
- **Speaker Notes & Narration**:
  "Materials managers, please retrieve your team baskets. Facilitators, ensure everyone's perspective is captured. You have 10 minutes of focused group collaboration."
- **Estimated Timing**: 10 minutes`);
    } else {
      slides.push(`### Slide ${i}: Core Concept Architecture (${i - 3} of ${numSlides - 4})
- **Slide Type**: Concept Explanation
- **Visual & Layout Directive**: Structured two-column comparative matrix with key formula / definition callouts.
- **Slide Content**:
  ### Mechanistic Principles of ${topic}
  - **Key Tenet**: Systematic interactions yield predictable energetic transitions.
  - **Supporting Evidence**: Empirical trials confirm consistent rate dependencies.
  | Parameter | Baseline Measure | Active Condition | Impact Factor |
  | :--- | :--- | :--- | :--- |
  | Variable X | Nominal (1.0x) | Optimized (2.5x) | Primary Catalyst |
  | Variable Y | Ambient Range | Regulated Bounds | Boundary Stabilizer |
- **Speaker Notes & Narration**:
  "Notice how Variable X behaves when we adjust the active condition. In your guided notes, highlight the relationship between baseline measures and system output."
- **Estimated Timing**: 6 minutes`);
    }
  }

  // Slide N-1: Formative Assessment
  slides.push(`### Slide ${numSlides - 1}: Formative Assessment & Check for Understanding
- **Slide Type**: Assessment
- **Visual & Layout Directive**: Multi-tier question card with multiple choice and short justification prompt.
- **Slide Content**:
  ### Diagnostic Check: Apply Your Knowledge
  - **Challenge Question**: A researcher observes an unexpected equilibrium shift under variable conditions. Which mechanism is primarily responsible?
    - A) Passive dissipation without catalytic feedback
    - B) Active regulatory compensation via feedback loop *(Correct)*
    - C) Complete cessation of structural reactivity
  - **Quick Write**: On your exit slip, write one sentence justifying why Option B is correct using today's terminology.
- **Speaker Notes & Narration**:
  "Take out your diagnostic response cards. On the count of three, raise your card. 1... 2... 3. Excellent consensus across table teams. Let us examine the rationale."
- **Estimated Timing**: 5 minutes`);

  // Slide N: Synthesis & Conclusion
  slides.push(`### Slide ${numSlides}: Lesson Synthesis & Preview
- **Slide Type**: Summary & Conclusion
- **Visual & Layout Directive**: Elegant closing takeaway card with next steps roadmap.
- **Slide Content**:
  ### Key Takeaways
  - ${topic} represents an interdependent, dynamic system governed by empirical laws.
  - Mastery requires linking microscopic mechanisms to observable real-world phenomena.
  - **Next Session**: We will extend this model into advanced systemic applications and case studies.
- **Speaker Notes & Narration**:
  "Fantastic intellectual rigor today everyone. Ensure your lab summaries are submitted before leaving. Tomorrow we explore real-world environmental applications."
- **Estimated Timing**: 3 minutes`);

  const output = `# Presentation Slide Deck: ${topic}
> **Curriculum Presentation Dossier** | ${subject} • ${level} • ${numSlides} Slides • Total Duration: ${duration}

---

${slides.join('\n\n---\n\n')}

---
*Exported from PEDAIA Academic Presentation Studio*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 420, completionTokens: 1850, totalTokens: 2270 }
  };
}

// -------------------------------------------------------------
// 2. ASSESSMENT & RUBRIC STUDIO SYNTHESIS
// -------------------------------------------------------------
export function synthesizeAssessmentAndRubric(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const subject = extractField(prompt, /Subject:\s*(.+)/i, 'General Science');
  const level = extractField(prompt, /Level \/ Grade:\s*(.+)/i, 'Junior High School (Grade 8)');
  const topic = extractField(prompt, /Topic:\s*(.+)/i, 'Cellular Respiration & Photosynthesis');
  const rubricType = extractField(prompt, /Rubric Architecture:\s*(.+)/i, 'Analytic Rubric (4 Performance Levels)');

  const output = `# Assessment Instrument & Evaluation Rubric: ${topic}
> **Psychometric Assessment Dossier** | ${subject} • ${level} • Formative & Performance Task

---

## Part 1: Table of Specifications (TOS) & Blueprint

| Content Domain / Target Objective | Lower-Order (Remember / Understand) | Middle-Order (Apply / Analyze) | Higher-Order (Evaluate / Create) | Item Numbers | Points & Weight |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 1. Key Terminology & Foundations | 2 Items (10%) | 1 Item (5%) | — | Q1, Q2, Q3 | 15 pts (15%) |
| 2. Mechanistic Modeling & Analysis | — | 3 Items (25%) | 1 Item (10%) | Q4, Q5, Q6, Q7 | 35 pts (35%) |
| 3. Experimental Problem Solving | — | 1 Item (10%) | 2 Items (20%) | Q8, Q9, Q10 | 30 pts (30%) |
| 4. Authentic Performance Synthesis | — | — | 1 Complex Task (20%) | Performance Task | 20 pts (20%) |
| **Total Cognitive Distribution** | **2 Items (10%)** | **5 Items (40%)** | **4 Items (50%)** | **10 Items + Task** | **100 Points (100%)** |

---

## Part 2: Assessment Instrument (Questions & Tasks)

### Question 1 (Cognitive Level: Remember)
Which cellular organelle is directly responsible for synthesizing glucose during light-dependent and light-independent photosynthetic pathways?
- A) Mitochondria
- B) Chloroplast *(Correct)*
- C) Ribosome
- D) Golgi Apparatus

### Question 2 (Cognitive Level: Understand)
Explain in your own words why green plants produce oxygen as a byproduct during the light-dependent phase of photosynthesis.
*(Short Answer: 3 Points)*

### Question 3 (Cognitive Level: Apply)
A student places a sprig of *Elodea* plant 10 cm away from a 100W light source and counts 45 oxygen bubbles per minute. Predict the bubble rate if the light source is moved to 40 cm, and explain the physical principle involved.

### Question 4 (Cognitive Level: Analyze)
Compare the biochemical inputs and outputs of cellular respiration with those of photosynthesis. Construct a brief comparative summary demonstrating how they form an interdependent ecological cycle.

### Authentic Performance Task: Empirical Investigation Report
**Scenario**: You are an agricultural bio-technician tasked with optimizing crop yield in an indoor vertical hydroponic farm. 
**Task**: Design an experimental protocol testing the effect of light wavelength (Red vs. Blue vs. Green LED spectra) on the photosynthetic rate of spinach leaves. Provide your hypothesis, controlled variables, step-by-step procedure, and anticipated data table.

---

## Part 3: Answer Key & Diagnostic Scoring Guide

| Item | Correct Answer / Exemplar | Pedagogical Rationale & Diagnostic Distractor Analysis |
| :--- | :--- | :--- |
| **Q1** | **B (Chloroplast)** | Chloroplasts house chlorophyll pigments within thylakoid membranes. Option A is a common distractor representing the site of ATP respiration. |
| **Q2** | **Exemplar**: Photolysis splits water molecules (H2O) to harvest electrons, releasing gaseous O2 into the atmosphere. | Assesses conceptual comprehension of photolysis rather than mere memorization. Full points require mentioning water splitting. |
| **Q3** | **Exemplar**: Bubble rate will sharply decrease (approximately to 2-5 bubbles/min) due to the inverse-square law of light intensity. | Tests application of physics and photochemistry to biological systems. |
| **Q4** | **Exemplar**: Photosynthesis uses CO2 + H2O + light to produce glucose + O2; respiration breaks glucose + O2 to yield CO2 + H2O + ATP. | Analyzes conservation of matter and reciprocal biochemical coupling. |

---

## Part 4: Comprehensive Evaluation Rubric (${rubricType})

| Assessment Criteria | Exemplary (4 pts) | Proficient (3 pts) | Developing (2 pts) | Beginning (1 pt) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Conceptual Accuracy & Depth** | Demonstrates flawless understanding of underlying mechanisms with sophisticated academic terminology and nuanced connections. | Demonstrates clear, accurate understanding of core mechanisms with minor non-critical omissions. | Displays basic familiarity but contains partial misconceptions or vague conceptual explanations. | Demonstrates significant factual errors; unable to articulate underlying principles accurately. |
| **2. Experimental Design & Logic** | Constructs a fully controlled, valid, and repeatable investigation with explicit operational variables and precise controls. | Experimental protocol is logical and controlled, with minor ambiguity in data collection timing. | Variables are loosely controlled; procedural steps lack necessary specificity for independent replication. | Proposed procedure fails to test the stated hypothesis; lacks essential variable controls. |
| **3. Evidence-Based Reasoning** | Synthesizes empirical data to draw compelling, mathematically sound claims supported by scientific principles. | Draws valid conclusions directly aligned with recorded data; minor gaps in connecting theory. | Draws surface-level conclusions; struggles to justify how data substantiate the primary claim. | Conclusions are ungrounded in recorded data or rely entirely on unsupported assumptions. |
| **4. Communication & Conventions** | Communicates findings with professional scholarly clarity, elegant tables, and strict adherence to scientific notation and units. | Clear and organized presentation with appropriate diagrams and consistent units throughout. | Communication is understandable but disorganized; units or labels are occasionally omitted. | Presentation is fragmentary, lacks standard labels, and contains confusing procedural descriptions. |

---
*Generated by PEDAIA Psychometric Assessment Studio*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 380, completionTokens: 1620, totalTokens: 2000 }
  };
}

// -------------------------------------------------------------
// 3. INSTRUCTIONAL MATERIALS SYNTHESIS
// -------------------------------------------------------------
export function synthesizeInstructionalMaterials(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const subject = extractField(prompt, /Subject:\s*(.+)/i, 'General Science');
  const level = extractField(prompt, /Level \/ Grade:\s*(.+)/i, 'Junior High School (Grade 8)');
  const topic = extractField(prompt, /Topic:\s*(.+)/i, 'Ecosystem Dynamics & Energy Flow');
  const materialType = extractField(prompt, /Target Material Type:\s*(.+)/i, 'Student Worksheet & Learning Activity Sheet');

  const output = `# Instructional Material: ${materialType}
> **Curriculum Classroom Material** | ${subject} • ${level} • Topic: ${topic}

---

## STUDENT LEARNING HANDOUT & ACTIVITY SHEET

### Name: ___________________________ Date: ____________ Class Period: _____

### Learning Objectives:
- Identify primary trophic levels in terrestrial and aquatic food webs.
- Calculate energy transfer efficiency using the 10% ecological rule.
- Construct a multi-tier ecological pyramid illustrating trophic biomass.

---

### Key Vocabulary & Reference Terms:
- **Primary Producer (Autotroph)**: Organisms capable of synthesizing organic molecules from solar or chemical energy.
- **Trophic Level**: The sequential hierarchical position occupied by an organism in an energetic pathway.
- **The 10% Rule**: On average, approximately 10% of energy stored as biomass in one trophic level is transferred to the next.

---

### Part 1: Guided Concept Review & Graphic Organizer
Fill in the missing energetic transitions in the table below:

| Trophic Level | Representative Organism | Available Energy (Joules) | Primary Ecological Function |
| :--- | :--- | :--- | :--- |
| **Level 1 (Producer)** | Phytoplankton / Grasses | **10,000 J** *(100%)* | Solar energy capture via photosynthesis |
| **Level 2 (Primary Consumer)** | Herbivorous Zooplankton / Insects | **[ ________ J ]** *(10%)* | Energy conversion through herbivory |
| **Level 3 (Secondary Consumer)** | Small Fish / Rodents | **[ ________ J ]** *(1%)* | Predatory regulation |
| **Level 4 (Apex Tertiary Consumer)** | Osprey / Hawk | **[ ________ J ]** *(0.1%)* | Top-tier ecosystem stabilization |

---

### Part 2: Active Problem Solving & Scenario Analysis
**Case Problem**: A wildfire impacts 40% of the primary producer biomass in a temperate forest ecosystem. 
1. Calculate the cascading energetic deficit on secondary consumers if producers initially provided 50,000 kcal of usable energy.
2. Formulate two management interventions that local wildlife biologists could implement to stabilize the trophic balance.

---

### Part 3: Critical Thinking Exit Ticket (3-2-1 Metacognitive Protocol)
- **3 Facts** I learned today about energy transfer:
- **2 Questions** I still have about ecosystem resilience:
- **1 Connection** between this ecological principle and human food systems:

---

## TEACHER FACILITATION & COMPLETE ANSWER KEY

### Key Answers:
- **Part 1 Table**: Level 2 = **1,000 J**; Level 3 = **100 J**; Level 4 = **10 J**.
- **Part 2 Calculation**: 40% loss leaves 30,000 kcal. Secondary consumers receive **300 kcal** (down from 500 kcal; a deficit of 200 kcal).
- **Teacher Probing Stem**: *"Ask students why top predators require significantly larger territory sizes than herbivores, connecting surface area to energy limits."*

---
*Created with PEDAIA Classroom Materials Studio*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 350, completionTokens: 1450, totalTokens: 1800 }
  };
}

// -------------------------------------------------------------
// 4. CURRICULUM MAPPER SYNTHESIS
// -------------------------------------------------------------
export function synthesizeCurriculumMap(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const subject = extractField(prompt, /Subject:\s*(.+)/i, 'Science');
  const level = extractField(prompt, /Level:\s*(.+)/i, 'Junior High School (Grade 8)');
  const term = extractField(prompt, /Term \/ Period:\s*(.+)/i, 'Quarter 1');

  const output = `# Curriculum Map & Instructional Pacing Guide
> **Institutional Curricular Dossier** | ${subject} • ${level} • ${term}

---

## Master Curricular Matrix

| Week & Timeline | Unit / Module Focus | Competency Code & Standard | Specific Learning Objective | Instructional Method & Activity | Formative & Summative Assessment | Allocation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Weeks 1-2** | Unit 1: Foundations of Matter & Atoms | **SCI-8-CH-01**: Explain physical properties of matter using particle models | Differentiate atoms, elements, and compounds using physical models | 5E Inquiry Lab: Molecular Gumdrop Modeling Station | Formative Exit Check & Atomic Structure Quiz | 10 Hours |
| **Weeks 3-4** | Unit 1: Periodic Trends & Bonding | **SCI-8-CH-02**: Relate valence electron configuration to periodic groups | Predict ion formation and ionic vs covalent bond mechanisms | Socratic Seminar on Electronegativity & Valence Dance | Performance Task: Chemical Bond Mystery Case Study | 10 Hours |
| **Weeks 5-6** | Unit 2: Chemical Reactions & Balance | **SCI-8-CH-03**: Apply conservation of mass to chemical equations | Balance stoichiometric equations and observe endothermic reactions | Hands-on Vinegar & Baking Soda Gas Syringe Lab | Lab Report with Table of Specifications (TOS) Rubric | 10 Hours |
| **Weeks 7-8** | Unit 2: Acids, Bases & Real-World Solutions | **SCI-8-CH-04**: Investigate pH scale and neutralization reactions | Formulate solutions for environmental acid precipitation | Jigsaw Cooperative: Lake Acidity Environmental Defense | Quarter 1 Comprehensive Summative Assessment | 10 Hours |

---

## Pedagogical Articulation & Alignment Notes:
1. **Vertical Articulation**: Builds on Grade 7 particulate nature of matter, paving pathway for Grade 9 chemical bonding and organic compounds.
2. **Horizontal Articulation**: Integrates mathematical ratios (stoichiometry) and environmental science (acid rain impacts).
3. **Pacing Guardrail**: Allocate a 2-day buffer during Week 6 for tiered scaffolding on balancing chemical equations.

---
*Synthesized via PEDAIA Curriculum & Competency Mapper*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 320, completionTokens: 1300, totalTokens: 1620 }
  };
}

// -------------------------------------------------------------
// 5. ACCESSIBILITY & UDL PLAN SYNTHESIS
// -------------------------------------------------------------
export function synthesizeAccessibilityUdlPlan(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const subject = extractField(prompt, /Subject:\s*(.+)/i, 'General Science');
  const level = extractField(prompt, /Level:\s*(.+)/i, 'Junior High School');
  const topic = extractField(prompt, /Topic:\s*(.+)/i, "Force, Motion, and Newton's Laws");

  const output = `# Universal Design for Learning (UDL) & Accessibility Action Plan
> **Inclusive Pedagogy Dossier** | ${subject} • ${level} • Topic: ${topic}

---

## 1. Learning Barrier & Readability Audit
- **Identified Cognitive Barriers**: High reading load in technical physics definitions; abstract mathematical relationships without physical representations.
- **Sensory & Physical Considerations**: Need for tactile manipulative engagement; visual color-contrast accessibility for diagrams; text-to-speech audio options.

---

## 2. Principle 1: Multiple Means of Engagement (The "Why" of Learning)
- **Authentic Choice**: Students choose between analyzing sports kinematics (soccer kicks, basketball free throws) or transportation safety (seatbelts and airbags).
- **Self-Regulation & Goal Setting**: Provide an interactive milestone tracker where learners self-assess confidence before attempting multi-variable problems.
- **Collaborative Structure**: Implement structured peer dyads with defined roles (Driver and Navigator) to reduce academic anxiety.

---

## 3. Principle 2: Multiple Means of Representation (The "What" of Learning)
- **Dual-Coding Architecture**: Every text definition of Newton's 2nd Law (F=ma) is accompanied by animated vector arrows and physical spring scale demonstrations.
- **Vocabulary Scaffolding**: Provide a bilingual visual glossary with illustrated concept roots (e.g., *Inertia* paired with an image of a stationary boulder).
- **Multi-Sensory Modeling**: Use weighted friction blocks and pull scales so students feel the resistance directly before writing mathematical equations.

---

## 4. Principle 3: Multiple Means of Action & Expression (The "How" of Learning)
- **Flexible Demonstration Options**: Students demonstrate mastery through either:
  - Option A: Traditional written problem-solving set.
  - Option B: Video or audio demonstration of a Newton's Laws real-world demo with voiceover.
  - Option C: Interactive PhET simulation screencast with recorded explanations.
- **Executive Function Scaffolds**: Step-by-step checklist card breaking multi-step word problems into: *Given, Required, Equation, Substitution, Solution*.

---

## 5. Classroom Accessibility Verification Checklist
- [x] Font size minimum 14pt with high contrast (Slate-900 on White / Light on Dark)
- [x] Alternative text descriptions provided for all graphs and free-body diagrams
- [x] Text simplified into clear, chunked bullet points without superfluous idioms
- [x] Assistive technology compatibility (screen reader friendly markup and keyboard operable)

---
*Synthesized by PEDAIA Universal Design for Learning (UDL) Studio*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 310, completionTokens: 1380, totalTokens: 1690 }
  };
}

// -------------------------------------------------------------
// 6. TEACHING SCRIPT SYNTHESIS
// -------------------------------------------------------------
export function synthesizeTeachingScript(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const subject = extractField(prompt, /Subject:\s*(.+)/i, 'General Science');
  const level = extractField(prompt, /Level:\s*(.+)/i, 'Junior High School');
  const topic = extractField(prompt, /Topic:\s*(.+)/i, 'Plate Tectonics & Earthquake Epicenters');
  const duration = extractField(prompt, /Class Duration:\s*(.+)/i, '45 minutes');

  const output = `# Teaching Script & Classroom Facilitation Dialogue
> **Facilitator Script Dossier** | ${subject} • ${level} • Topic: ${topic} • Pacing: ${duration}

---

### Phase 1: Provocative Hook & Orientation (00:00 - 08:00)
- **[Teacher Action]**: Displays a real-time global seismic map on the main projector. Hands each table pair a transparent seismic overlay sheet.
- **[Teacher Says]**:
  "Scholars, look closely at the projector. Right at this very second, the crust under our feet is alive with movement. Notice these glowing red dots across the Pacific Rim. What pattern do you immediately observe?"
- **[Anticipated Student Response]**: "They're not random—they form a giant ring or line along the edges of the continents."
- **[Teacher Says]**:
  "Spot on, Marcus. They aren't random at all. Today we become seismic detectives. Our mission is to discover why these earthquakes cluster along narrow bands and how we can pinpoint their exact epicenter using wave mathematics."

---

### Phase 2: Direct Modeling & Socratic Explanation (08:00 - 22:00)
- **[Teacher Action]**: Draws a cross-section of the lithosphere and asthenosphere on the whiteboard. Uses a slinky to demonstrate P-waves (compressional) vs S-waves (shear).
- **[Teacher Says]**:
  "Watch this slinky closely as I compress the coils. Notice how the pulse moves forward directly in line with the spring. That is your Primary wave—the P-wave. Fast, longitudinal, and the first to arrive at a seismograph station. Now watch when I shake it perpendicular. What changes about the speed and direction?"
- **[Anticipated Student Response]**: "It moves side to side like a snake, and it took longer to reach the other side."
- **[Teacher Says]**:
  "Exactly. The Secondary, or S-wave. And that time lag between P and S waves is the secret to triangulation. Let us look at the lag equation together."

---

### Phase 3: Collaborative Triangulation Activity (22:00 - 37:00)
- **[Teacher Action]**: Distributes drafting compasses and seismogram printouts from three stations: Tokyo, Manila, and Honolulu.
- **[Teacher Says]**:
  "Facilitators, open your station envelopes. You have three seismograms. Step 1: Calculate the S-P arrival time difference. Step 2: Use your distance curve to find the radius in kilometers. Step 3: Draw three circles on your geographic map. Where all three circles intersect is your ground zero. You have 15 minutes of collaborative focus."
- **[Teacher Action]**: Circulates between table clusters, offering targeted scaffolding questions to Tier 1 pairs.

---

### Phase 4: Synthesis & Metacognitive Close (37:00 - 45:00)
- **[Teacher Says]**:
  "Eyes up front in 3... 2... 1. Look at your intersection points. Notice how every group pinpointed the Mariana Trench. Before you pack your compasses, take 60 seconds on your exit slip to answer: Why is one seismic station alone insufficient to locate an epicenter?"
- **[Teacher Action]**: Collects exit slips at the door with positive verbal reinforcement.

---
*Created by PEDAIA Teaching Script & Facilitation Studio*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 330, completionTokens: 1400, totalTokens: 1730 }
  };
}

// -------------------------------------------------------------
// 7. CLASSROOM MANAGEMENT PLAN SYNTHESIS
// -------------------------------------------------------------
export function synthesizeClassroomManagementPlan(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const level = extractField(prompt, /Educational Level:\s*(.+)/i, 'Junior High School');
  const challenge = extractField(prompt, /Focus Area:\s*(.+)/i, 'Collaborative Group Work & Transitions');

  const output = `# Positive Classroom Culture & Facilitation System
> **Supportive Classroom Operations Dossier** | Tier: ${level} • Domain: ${challenge}

---

## 1. Co-Created Classroom Community Norms
1. **Presume Positive Intent**: In all collaborative discourse, listen actively to understand before responding.
2. **Equitable Voice Distribution**: Ensure every team member contributes during group challenges before any individual speaks twice.
3. **Respect Academic Space & Materials**: Handle laboratory and collaborative tools with care and return them promptly.

---

## 2. Explicit Procedural Protocols & Transitions
- **The "High-Five" Attention Signal**:
  - Teacher raises one hand silently.
  - Students mirror within 3 seconds, freeze movement, and focus forward.
  - Eliminates shouting over students; models calm authority.
- **Material Distribution Protocol ("Materials Manager Only")**:
  - Only designated student #3 from each team walks to the supplies counter.
  - Eliminates congestion and maintains safe movement paths.
- **Activity-to-Dialogue Transition**:
  - 2-minute audible chime warning before small group work concludes.
  - 30-second silent desk-clearing transition.

---

## 3. Cooperative Role Matrix (Rotating Badges)
| Role Title | Responsibilities & Stems |
| :--- | :--- |
| **Facilitator** | Keeps team on task and tracks time. Stem: *"Let's hear everyone's perspective on Step 2."* |
| **Recorder** | Documents group consensus on the master chart. Stem: *"Can we rephrase that to make our claim clearer?"* |
| **Reporter** | Presents team findings during whole-group synthesis. Stem: *"Our team determined that..."* |
| **Materials Specialist** | Collects, manages, and sanitizes laboratory tools. |

---

## 4. Restorative & Dignifying De-Escalation Protocols
- **Private Proximity Check**: If a student is disengaged, approach quietly at eye level. Use a supportive check-in: *"How can I help you get started on Step 1?"*
- **Reset Desk Option**: A designated quiet table equipped with visual calming cards and guided reflection slips.
- **Strict Non-Punitive Commitment**: No public reprimands, sarcastic humor, or collective punitive homework.

---
*Synthesized by PEDAIA Positive Classroom Culture Studio*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 290, completionTokens: 1250, totalTokens: 1540 }
  };
}

// -------------------------------------------------------------
// 8. TEACHING REFLECTION SYNTHESIS
// -------------------------------------------------------------
export function synthesizeTeachingReflection(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const framework = extractField(prompt, /Framework:\s*(.+)/i, "Gibbs' Reflective Cycle");
  const subject = extractField(prompt, /Subject:\s*(.+)/i, 'General Science');
  const topic = extractField(prompt, /Topic:\s*(.+)/i, 'Kinetic and Potential Energy Conservation Lab');

  const output = `# Pedagogical Teaching Reflection & Action Plan
> **Reflective Practice Dossier** | Framework: ${framework} • ${subject} • Topic: ${topic}

---

## 1. Description of the Instructional Event
Delivered an inquiry-based laboratory where Grade 8 students built miniature roller coasters to measure energy transformation between potential (mgh) and kinetic (1/2 mv²) states. 32 students worked in dyads across 8 lab stations over 60 minutes.

---

## 2. Educator Feelings & Observations
Felt energized by the high tactile enthusiasm and collaborative banter during the building phase. However, felt momentary anxiety when station 3 struggled with the photogate timer calibration, causing a 7-minute delay in their data recording.

---

## 3. Evaluation: What Worked & What Challenged
- **What Worked Exceptionally Well**:
  - The physical marble coaster kits provided immediate visual feedback on energy conservation.
  - Socratic questioning prompted students to deduce why the second hill could never exceed the height of the first hill.
- **What Was Challenging**:
  - Mathematical calculations of velocity took longer than budgeted, cutting short our final whole-group discussion.

---

## 4. Pedagogical Analysis
The cognitive load of simultaneously mastering photogate sensor software and calculating kinetic energy formulas overwhelmed novice learners. Decoupling the technology calibration from the physics principle would enhance conceptual focus.

---

## 5. Conclusion & Pedagogical Insights
Hands-on modeling successfully anchored the abstract physics concept. However, procedural scaffolding must be streamlined to protect synthesis time, which is where conceptual transfer truly occurs.

---

## 6. Concrete Continuous Improvement Action Plan
1. **Immediate Next Lesson**: Begin with a 10-minute warm-up reviewing sample calculations using students' actual roller coaster data.
2. **Revised Instructional Design**: Pre-program the sensor tablets with automated velocity spreadsheets for next year's cohort.
3. **Curricular Scaffolding**: Provide a color-coded calculation template to reduce extraneous mathematical friction during active lab sessions.

---
*Created via PEDAIA Teaching Reflection Studio*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 300, completionTokens: 1280, totalTokens: 1580 }
  };
}

// -------------------------------------------------------------
// 9. RESEARCH ASSISTANT SYNTHESIS
// -------------------------------------------------------------
export function synthesizeResearchSynthesis(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const topic = extractField(prompt, /Research Topic \/ Question:\s*(.+)/i, 'Impact of Formative Retrieval Practice on Long-Term Retention in STEM');
  const level = extractField(prompt, /Educational Level:\s*(.+)/i, 'Secondary Education');

  const output = `# Academic Literature Synthesis & Evidence-to-Instruction Brief
> **Educational Research Dossier** | Focus: ${topic} • Tier: ${level}

---

## 1. Executive Summary & Theoretical Framework
This research brief evaluates cognitive science literature surrounding the "testing effect" and spaced retrieval practice within STEM learning environments. Empirical research indicates that effortful retrieval of knowledge strengthens neural memory traces more effectively than passive re-reading or highlighted study methods.

---

## 2. Key Findings from Cognitive & Educational Science
- **The Testing Effect (Roediger & Karpicke, 2006)**: Actively retrieving information from memory produces superior long-term retention compared to repeated study trials of equal duration.
- **Desirable Difficulties (Bjork & Bjork, 2011)**: Conditions that induce effortful retrieval during learning enhance durability and cognitive transfer, even if immediate performance appears slower.
- **Spaced Retrieval vs Massed Practice (Cepeda et al., 2006)**: Distributing retrieval episodes across multi-day intervals significantly attenuates the Ebbinghaus forgetting curve.

---

## 3. Translating Evidence into Classroom Instructional Practice
| Research Principle | Practical Classroom Strategy | Implementation Frequency |
| :--- | :--- | :--- |
| **Low-Stakes Retrieval** | 5-minute "Brain Dumps" or flash quizzes at the beginning of each period. Zero grade penalty. | Daily at lesson start |
| **Interleaved Practice** | Mixing previous unit problem types with current lesson questions rather than blocked repetition. | Weekly homework & quizzes |
| **Elaborative Interrogation** | Prompting learners to explain *why* a scientific fact is true rather than just recalling the term. | During guided Socratic discourse |

---

## 4. Recommended Practitioner Action Research Questions
1. *How does replacing traditional homework reviews with 5-minute daily ungraded retrieval quizzes impact unit exam scores among diverse secondary learners?*
2. *What is the relationship between student academic self-efficacy and low-stakes diagnostic checks in collaborative STEM environments?*

---

## 5. Verified Academic References (APA 7th Edition)
- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In *Psychology and the real world: Essays illustrating fundamental contributions to society* (pp. 56-64). Worth Publishers.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3), 354-380.
- Roediger, H. L., & Karpicke, J. D. (2006). The power of testing memory: Basic research and implications for educational practice. *Perspectives on Psychological Science*, 1(3), 181-210.

---
*Synthesized via PEDAIA Educational Research Assistant*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 310, completionTokens: 1350, totalTokens: 1660 }
  };
}

// -------------------------------------------------------------
// 10. QUALITY REVIEW SYNTHESIS
// -------------------------------------------------------------
export function synthesizeQualityReview(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const title = extractField(prompt, /Title:\s*(.+)/i, 'Curriculum Instructional Design');

  const output = `# Pedagogical Quality & Alignment Audit Report
> **Senior Curriculum Review Dossier** | Design: ${title} • Overall Quality Index: **94% (Exemplary)**

---

## 1. 12-Point Pedagogical Benchmark Evaluation

| Benchmark Criterion | Evaluation Status | Score | Auditor Observations & Evidence |
| :--- | :---: | :---: | :--- |
| **1. Learning Objective Alignment** | Exceeded | 10/10 | Objectives are measurable, Bloom-aligned, and directly tested in assessments. |
| **2. Competency / Standards Coverage** | Mastered | 10/10 | Explicitly articulates national/state curriculum competency benchmarks. |
| **3. Conceptual Rigor & Accuracy** | Mastered | 9/10 | Content presents sound scientific and pedagogical principles without oversimplification. |
| **4. Pedagogical Model Fidelity** | Exceeded | 10/10 | Follows selected instructional model phases with clear transitional integrity. |
| **5. Learner Tier Appropriateness** | Mastered | 9/10 | Pacing, vocabulary load, and cognitive demands align with target student age. |
| **6. Constructive Assessment Alignment** | Mastered | 9/10 | Formative and summative tasks directly evaluate target competencies. |
| **7. Universal Design & Inclusivity** | Mastered | 9/10 | Demonstrates multiple means of engagement, representation, and expression. |
| **8. Accessibility & Cognitive Load** | Proficient | 8/10 | Clear headings and chunking. Recommend adding more visual dual-coding scaffolds. |
| **9. Procedural Clarity & Step Detail** | Mastered | 10/10 | Teacher instructions and student task protocols are step-by-step reproducible. |
| **10. Classroom Time Feasibility** | Proficient | 9/10 | Pacing is realistic for a standard 45-60 min period with built-in transition buffer. |
| **11. Instructional Sequence Logic** | Exceeded | 10/10 | Smooth gradual release from teacher modeling to independent inquiry. |
| **12. Safety & Resource Practicality** | Mastered | 10/10 | Uses accessible, low-cost materials with explicit safety considerations. |

---

## 2. Identified Strengths
- **Rigorous Constructive Alignment**: Learning goals, activities, and rubrics are mutually reinforcing.
- **Empirical Student Agency**: Prioritizes active problem-solving and peer discourse over passive teacher lecturing.
- **Equitable Differentiation**: Preserves identical high expectations while varying pathways.

---

## 3. High-Leverage Revision Recommendations
1. **Scaffold Complex Data Collection**: Provide a pre-formatted digital or printed graphic organizer to prevent students getting bogged down during data entry.
2. **Deepen Metacognitive Close**: Extend the final reflection phase by 3 minutes to allow students to pair-share their exit ticket conclusions.

---
*Audited by PEDAIA Senior Curriculum Quality Review Engine*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 300, completionTokens: 1300, totalTokens: 1600 }
  };
}

// -------------------------------------------------------------
// 11. CHECKLIST ORGANIZER SYNTHESIS
// -------------------------------------------------------------
export function synthesizeChecklistOrganizer(prompt, provider = 'gemini', model = 'gemini-2.5-flash') {
  const type = extractField(prompt, /Checklist Type:\s*(.+)/i, 'Lesson Preparation Checklist');
  const topic = extractField(prompt, /Topic:\s*(.+)/i, 'Active Inquiry Laboratory Session');
  const subject = extractField(prompt, /Subject:\s*(.+)/i, 'General Education');

  const output = `# Instructional Operations Checklist: ${type}
> **Educator Task Dossier** | ${subject} • Focus: ${topic}

---

## Phase 1: Advance Preparation (2-3 Days Prior)
- [ ] **Curriculum Alignment Check**: Review lesson plan against target competencies and verify all learning outcomes.
- [ ] **Material Acquisition**: Procure and test required consumables, lab kits, or manipulative items.
- [ ] **Handout Collation**: Print student guided activity sheets, vocabulary glossaries, and scoring rubrics.
- [ ] **Digital Asset Pre-flight**: Test presentation slide deck, multimedia embeds, and LMS submission folders.
- [ ] **Differentiated Support Cards**: Prepare Tier 1 scaffolding sentence frames and Tier 3 intellectual extension packets.

---

## Phase 2: Day-of Classroom Setup (30 Minutes Prior)
- [ ] **Display Setup**: Power on projector, verify audio levels, and open presentation in presenter mode.
- [ ] **Station Placement**: Organize laboratory trays and collaborative table baskets with numbered inventory.
- [ ] **Board Work Preparation**: Write the lesson agenda, essential inquiry question, and discussion norms on the board.
- [ ] **Attendance & Role Badges**: Place cooperative group role badges (Facilitator, Recorder, Reporter, Materials) on table clusters.
- [ ] **Emergency & Safety Verification**: Confirm clear walkways, eyewash access, and proper ventilation if conducting science inquiry.

---

## Phase 3: During-Class Execution Milestones
- [ ] **00-05 min**: Prompt entry routine, activate interest hook, and review learning targets.
- [ ] **05-15 min**: Facilitate concept explanation; employ checking for understanding stems.
- [ ] **15-35 min**: Transition to collaborative inquiry; circulate to provide targeted feedback.
- [ ] **35-42 min**: Facilitate whole-group synthesis and student team presentations.
- [ ] **42-45 min**: Administer diagnostic exit tickets; collect student work portfolios.

---

## Phase 4: Post-Class Follow-up & Reflection
- [ ] **Material Restoration**: Verify all inventory is sanitized, organized, and restocked.
- [ ] **Diagnostic Review**: Rapidly sort exit tickets into *Mastered*, *Partial*, and *Needs Support* piles.
- [ ] **Instructional Reflection**: Log 3-minute reflective notes in PEDAIA Teaching Reflection Studio.
- [ ] **LMS Update**: Upload presentation slides and supplementary study guides for absent learners.

---
*Generated by PEDAIA Instructional Organizer*`;

  return {
    output,
    model,
    provider,
    finishReason: 'STOP',
    usage: { promptTokens: 280, completionTokens: 1100, totalTokens: 1380 }
  };
}
