// PEDAIA Structured Prompt Engineering Engine

/**
 * Generates an advanced, pedagogically aligned prompt for the AI Lesson Planner.
 * Supports framework-driven dynamic sequences (5E, UbD, 4A's, Direct Instruction, etc.)
 */
export function buildLessonPlannerPrompt(config) {
  const {
    subject = 'General Education',
    customSubject = '',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    topic = '',
    competency = '',
    learnerProfile = '',
    duration = '60 minutes',
    modality = 'Face-to-Face',
    resources = [],
    customResources = '',
    objectiveFramework = "Bloom's Revised Taxonomy",
    customObjectives = '',
    autoGenerateObjectives = true,
    instructionalModel = '5E Instructional Model',
    customInstructionalModel = '',
    lessonSequence = [],
    lessonStructure = [],
    teachingStrategies = [],
    assessmentTypes = [],
    outputFormat = 'Detailed Lesson Plan',
    additionalRequirements = ''
  } = config;

  const actualSubject = subject === 'Other' && customSubject ? customSubject : subject;
  const actualModel = instructionalModel === 'Custom Instructional Model' && customInstructionalModel ? customInstructionalModel : instructionalModel;
  const allResources = [...resources, customResources].filter(Boolean).join(', ') || 'Standard classroom materials';

  // Format the sequence phases cleanly
  let sequenceText = '';
  if (Array.isArray(lessonSequence) && lessonSequence.length > 0) {
    sequenceText = lessonSequence.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return `${idx + 1}. **${item.name || 'Phase ' + (idx + 1)}**: ${item.desc || 'Core instructional activity'}`;
      }
      return `${idx + 1}. **${item}**`;
    }).join('\n');
  } else if (Array.isArray(lessonStructure) && lessonStructure.length > 0) {
    sequenceText = lessonStructure.map((item, idx) => `${idx + 1}. **${item}**`).join('\n');
  } else {
    sequenceText = '1. Introduction & Objectives\n2. Hook & Motivation\n3. Modeling\n4. Guided Practice\n5. Independent Practice\n6. Assessment & Reflection';
  }

  let prompt = `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA, a master instructional design assistant and curriculum architect. Your mission is to construct a rigorous, pedagogically sound, and classroom-ready lesson plan tailored to the specified instructional context.

[EDUCATIONAL CONTEXT]
- Subject / Discipline: ${actualSubject}
- Educational Level: ${educationalLevel}
- Specific Grade / Course: ${gradeLevel || 'Standard Grade Level for this tier'}
- Curriculum Standard / Competency: ${competency || 'Curriculum-aligned mastery'}
- Unit / Topic: ${topic || 'Key Discipline Concepts'}
- Class Duration: ${duration}
- Teaching Modality: ${modality}
- Available Classroom Resources: ${allResources}
${learnerProfile ? `- Learner Profile & Classroom Dynamics: ${learnerProfile}` : '- Learner Profile: Heterogeneous group with diverse learning styles and readiness levels'}

[PEDAGOGICAL FRAMEWORK & ALIGNMENT ARCHITECTURE]
- Instructional Design Model: ${actualModel}
- Objective Formulation Framework: ${objectiveFramework}
${autoGenerateObjectives ? '- Objective Formulation Directive: Formulate 3 measurable, observable learning objectives spanning cognitive, psychomotor, and affective domains using active Bloom action verbs.' : `- Specific Intended Objectives: ${customObjectives}`}
- Primary Teaching Strategies: ${teachingStrategies.length ? teachingStrategies.join(', ') : 'Direct Modeling, Guided Inquiry, Collaborative Learning'}
- Assessment Strategies: ${assessmentTypes.length ? assessmentTypes.join(', ') : 'Formative checks throughout and summative exit ticket'}
- Target Output Format: ${outputFormat}

[INSTRUCTIONAL SEQUENCE & PROCEDURAL PHASES]
The lesson sequence must adhere strictly to the following framework progression:
${sequenceText}

[PEDAGOGICAL ALIGNMENT DIRECTIVE]
Ensure complete pedagogical alignment across:
1. Learning Objectives (Bloom's Taxonomy / SMART)
2. Teaching Strategies (explicit modeling, active inquiry, student voice)
3. Procedural Sequence (time allocations, scripted teacher cues, expected student responses)
4. Assessment Evidence (formative check questions and exit ticket that directly test the objectives)

[INSTRUCTIONAL OUTPUT REQUIREMENTS]
1. Header Block: Title, Subject, Grade Level, Time Allocation, Modality, Core Competency.
2. Learning Objectives: 3 measurable, aligned objectives with Bloom cognitive levels noted.
3. Materials & Preparation: Itemized checklist for teacher setup and student resources.
4. Procedural Sequence Table:
   - For every sequential phase, include:
     * Phase Name & Allocated Minutes
     * Teacher Script / Explicit Modeling (exact think-alouds and guided questioning)
     * Expected Student Actions & Collaborative Dialogue
     * Embedded Formative Check Questions
5. Differentiated Instruction: Actionable modifications for:
   - Tier 1 Scaffolding (struggling readers / foundational support)
   - Tier 2 Grade-Level Core
   - Tier 3 Advanced Extension / Challenge
   - Multilingual / ELL Accommodations (sentence frames, visual supports)
6. Assessment & Evaluation Rubric: Specific scoring criteria matching the objectives.
7. Post-Lesson Teacher Reflection / Metacognitive Prompts: 2-3 evaluative indicators to observe.

[QUALITY & TONE CRITERIA]
- Professional, academically credible, and classroom-ready.
- Provide concrete script examples, authentic question stems, and realistic student deliverables. Avoid placeholders or vague summaries.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS & PREFERENCES]\n${additionalRequirements}` : ''}`;

  return prompt.trim();
}

/**
 * Generates an advanced, structured prompt for the AI Activity Designer.
 * Supports progressive facilitation disclosure (Student instructions, teacher pacing, rubric, UDL, safety).
 */
export function buildActivityDesignerPrompt(config) {
  const {
    subject = 'General Education',
    customSubject = '',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    topic = '',
    competency = '',
    learnerProfile = '',
    duration = '45 minutes',
    modality = 'Face-to-Face',
    resources = [],
    activityType = 'Collaborative Learning',
    learningPurpose = [],
    groupingStructure = 'Small Groups',
    materialsNeeded = '',
    difficultyLevel = 'Moderate',
    studentOutput = 'Written Response',
    instructionStyle = 'Guided Inquiry',
    stepTimeBreakdown = '',
    // Progressive Facilitation Controls
    includeStudentInstructions = true,
    includeTeacherFacilitation = true,
    includeMaterialsChecklist = true,
    includePreparationTimeline = true,
    includeEvaluationRubric = true,
    includeAccessibilityUDL = true,
    includeSafetyConsiderations = false,
    customSafetyNotes = '',
    additionalRequirements = ''
  } = config;

  const actualSubject = subject === 'Other' && customSubject ? customSubject : subject;

  let prompt = `[ROLE & PERSONA]
You are PEDAIA, an active learning specialist and experiential educational activity designer. You design engaging, purposeful, and contextually rich learning activities that cultivate deep conceptual understanding and student agency.

[EDUCATIONAL CONTEXT]
- Subject / Discipline: ${actualSubject}
- Educational Level: ${educationalLevel}
- Grade Level / Course: ${gradeLevel || 'Standard for level'}
- Topic: ${topic || 'Key Concept'}
- Learning Competency / Standard: ${competency || 'Curriculum mastery'}
- Activity Duration: ${duration}
- Teaching Modality: ${modality}
${learnerProfile ? `- Learner Characteristics: ${learnerProfile}` : ''}

[ACTIVITY DESIGN SPECIFICATIONS]
- Activity Type: ${activityType}
- Core Learning Purpose: ${learningPurpose.length ? learningPurpose.join(', ') : 'Conceptual Understanding, Collaboration, Critical Thinking'}
- Grouping Arrangement: ${groupingStructure}
- Instruction Delivery Style: ${instructionStyle}
- Cognitive Challenge Level: ${difficultyLevel}
- Expected Student Deliverable: ${studentOutput}
${materialsNeeded ? `- Specific Materials & Setup: ${materialsNeeded}` : '- Materials: Readily accessible classroom/digital resources'}
${stepTimeBreakdown ? `- Step Time Allocation Notes: ${stepTimeBreakdown}` : ''}

[STRUCTURED OUTPUT REQUIREMENTS]
1. Activity Title & Catchy Hook: Professional, memorable title and brief summary.
2. Targeted Learning Objectives: 1-2 observable competencies achieved through this activity.
3. Logistics & Space Setup: Room configuration and division of collaborative team roles.
4. Phase-by-Phase Procedures:
   - Step 1: Priming & Problem Framing (Allocated minutes + teacher opening script)
   - Step 2: Student Exploration / Execution (Clear instructions, group interaction norms)
   - Step 3: Synthesis, Cross-Team Sharing or Presentation
   - Step 4: Reflection & Debrief

${includeStudentInstructions ? `5. Student-Facing Handout & Protocol:
   - Formulate a clear, direct, and engaging set of step-by-step instructions written directly to the student in second-person ("You will..."). Include accountable talk sentence stems.` : ''}

${includeTeacherFacilitation ? `6. Teacher Facilitation & Pacing Guide:
   - Exact timestamped pacing cues.
   - 3 specific probing questions the teacher can ask while circulating to deepen conceptual rigor.
   - Anticipated student roadblocks or misconceptions and exact corrective teacher interventions.` : ''}

${includeMaterialsChecklist ? `7. Materials & Equipment Checklist:
   - Separate list for Teacher Materials vs. Student Team Materials.` : ''}

${includePreparationTimeline ? `8. Preparation & Setup Timeline:
   - What to prepare 24 hours before class, 15 minutes before the bell, and post-activity cleanup protocol.` : ''}

${includeEvaluationRubric ? `9. Assessment Criteria & Scoring Rubric:
   - 3-level analytic scoring rubric (Exemplary, Proficient, Developing) across 3 key criteria.` : ''}

${includeAccessibilityUDL ? `10. Accessibility & Universal Design for Learning (UDL) Accommodations:
   - Multiple means of Engagement (choice, relevance).
   - Multiple means of Representation (visuals, graphic organizers, dual-coding).
   - Multiple means of Action & Expression (oral, written, diagrammatic).` : ''}

${includeSafetyConsiderations ? `11. Safety Protocols & Risk Mitigation:
   - Explicit lab, physical, ergonomic, or digital safety rules.
   - Hazard prevention and teacher supervision checklist.
   ${customSafetyNotes ? `Specific Safety Notes: ${customSafetyNotes}` : ''}` : ''}

12. Adaptations & Extensions: How to modify for varying pacing without lowering academic expectations.

${additionalRequirements ? `[ADDITIONAL REQUIREMENTS & CONSTRAINTS]\n${additionalRequirements}` : ''}`;

  return prompt.trim();
}

/**
 * Generates an advanced, structured prompt for the AI Questioning Studio.
 * Includes Question Distribution Builder across Bloom's levels, difficulty, format, and distractor quality.
 */
export function buildQuestioningStudioPrompt(config) {
  const {
    subject = 'General Education',
    customSubject = '',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    topic = '',
    competency = '',
    learnerProfile = '',
    duration = '45 minutes',
    modality = 'Face-to-Face',
    questionPurposes = [],
    cognitiveLevels = [],
    questionTypes = [],
    numQuestions = '10',
    difficultyLevel = 'Mixed',
    // Question Distribution Builder
    bloomsDistribution = {
      Remember: 1,
      Understand: 2,
      Apply: 2,
      Analyze: 2,
      Evaluate: 2,
      Create: 1
    },
    difficultyDistribution = {
      easy: '20%',
      medium: '50%',
      challenging: '30%'
    },
    distractorQuality = 'Diagnostic Misconception-Driven',
    includeAnswerKey = true,
    includeFollowUps = true,
    formatting = 'Organized by Cognitive Level',
    additionalRequirements = ''
  } = config;

  const actualSubject = subject === 'Other' && customSubject ? customSubject : subject;

  // Format Bloom's Distribution breakdown
  const distEntries = Object.entries(bloomsDistribution || {});
  const distText = distEntries.length > 0
    ? distEntries.map(([lvl, count]) => `  - ${lvl}: ${count} question(s)`).join('\n')
    : '  - Balanced across all 6 levels (Remember to Create)';

  let prompt = `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA, a senior assessment architect and Socratic questioning specialist. You design purposeful, cognitively rigorous questions that diagnose misconceptions, stimulate higher-order thinking, and evaluate student mastery.

[EDUCATIONAL CONTEXT]
- Subject / Discipline: ${actualSubject}
- Educational Level: ${educationalLevel}
- Grade Level / Course: ${gradeLevel || 'Standard Grade Level'}
- Topic / Unit: ${topic || 'Core Subject Matter'}
- Curriculum Competency: ${competency || 'Curricular Learning Standard'}
${learnerProfile ? `- Learner Context: ${learnerProfile}` : ''}

[QUESTION DISTRIBUTION BUILDER SPECIFICATIONS]
- Total Questions Requested: ${numQuestions}
- Exact Cognitive Distribution (Bloom's Revised Taxonomy):
${distText}
- Difficulty Distribution:
  * Easy / Foundational: ${difficultyDistribution.easy || '20%'}
  * Medium / Grade-Level: ${difficultyDistribution.medium || '50%'}
  * Challenging / Advanced: ${difficultyDistribution.challenging || '30%'}
- Question Formats to Include: ${questionTypes.length ? questionTypes.join(', ') : 'Multiple Choice, Short Answer, Scenario-Based, Socratic Discussion'}
- Distractor Quality Specification: ${distractorQuality} (Ensure distractors represent authentic, documented student misconceptions rather than arbitrary trivial errors)
- Question Purpose: ${questionPurposes.length ? questionPurposes.join(', ') : 'Conceptual Understanding, Critical Thinking, Formative Assessment'}
- Structural Organization: ${formatting}
- Answer Key & Rationales: ${includeAnswerKey ? 'YES — detailed model answers and pedagogical rationale for correct and distractor choices' : 'NO'}
- Follow-Up & Probing Stems: ${includeFollowUps ? 'YES — teacher metacognitive probing questions for each item' : 'NO'}

[OUTPUT STRUCTURE]
For each numbered question item, format systematically:
1. Question Number & Item Stem (clear, unambiguous, aligned with standard)
2. Cognitive Level (Bloom's Revised Taxonomy) & Difficulty Level
3. Item Format (e.g., Scenario-based, Multiple Choice with options A-D, Short Answer)
${includeAnswerKey ? `4. Correct Answer & Pedagogical Rationale:
   - Identify the correct response and explain the conceptual reasoning.
   - For Multiple Choice, explicitly explain why each distractor diagnoses a specific misconception.` : ''}
${includeFollowUps ? `5. Teacher Probing Follow-Up Question:
   - Provide a targeted follow-up question to push student metacognition deeper.` : ''}

[PEDAGOGICAL RIGOR STANDARDS]
- Direct Alignment: Every single question must test the stated competency: "${competency || topic}".
- No Recall Traps: Avoid trivial trivia; emphasize conceptual depth and real-world application.
- Distractor Diagnostic Value: Incorrect options must help the teacher diagnose why the student stumbled.

${additionalRequirements ? `[ADDITIONAL CONSTRAINTS & REQUIREMENTS]\n${additionalRequirements}` : ''}`;

  return prompt.trim();
}

/**
 * Generates an advanced, structured prompt for the AI Differentiation Studio.
 * Supports custom learner groups, common standards, tiered outputs, before/after comparisons, and non-PII privacy.
 */
export function buildDifferentiationStudioPrompt(config) {
  const {
    subject = 'General Education',
    customSubject = '',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    topic = '',
    competency = '',
    learnerProfile = '',
    duration = '60 minutes',
    modality = 'Face-to-Face',
    differentiationFocus = [],
    differentiationDimensions = [],
    learnerGroups = [],
    customLearnerProfiles = [],
    customLearnerGroup = '',
    adaptationStrategies = [],
    outputFormat = 'Comparison Table',
    commonObjective = '',
    specificLearnerNeeds = '',
    includeBeforeAfter = true,
    additionalRequirements = ''
  } = config;

  const actualSubject = subject === 'Other' && customSubject ? customSubject : subject;
  const allGroups = [...learnerGroups, customLearnerGroup].filter(Boolean);

  // Format custom profiles if available
  let profilesText = '';
  if (Array.isArray(customLearnerProfiles) && customLearnerProfiles.length > 0) {
    profilesText = customLearnerProfiles.map(p => `  - **${p.name}**: ${p.description || p.needs || 'Specific scaffolding required'}`).join('\n');
  } else if (allGroups.length > 0) {
    profilesText = allGroups.map(g => `  - **${g}**`).join('\n');
  } else {
    profilesText = '  - **Tier 1 (Scaffolding)**: Learners needing targeted conceptual and linguistic support\n  - **Tier 2 (Grade-Level Core)**: On-grade learners meeting standard proficiency\n  - **Tier 3 (Extension)**: Advanced learners ready for higher-order inquiry and challenge';
  }

  let prompt = `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA, an inclusive pedagogy and Universal Design for Learning (UDL) specialist. You construct differentiated instructional frameworks that honor learner variability without diluting academic rigor or stereotyping students.

[PRIVACY & ETHICAL GUARANTEE]
Notice: This prompt adheres to strict privacy standards. Only non-PII pedagogical traits, readiness tiers, and learning preferences are processed—zero student identifying information.

[EDUCATIONAL CONTEXT]
- Subject / Discipline: ${actualSubject}
- Educational Level: ${educationalLevel}
- Grade Level / Course: ${gradeLevel || 'Standard Grade Level'}
- Topic: ${topic || 'Key Curriculum Topic'}
- Curriculum Standard / Competency: ${competency || 'Curriculum Competency'}
- Class Duration: ${duration}
- Teaching Modality: ${modality}
${learnerProfile ? `- General Classroom Context: ${learnerProfile}` : ''}

[DIFFERENTIATION SPECIFICATIONS]
- Essential Common Learning Objective (The non-negotiable benchmark that ALL learners work toward):
  "${commonObjective || competency || 'Deep conceptual mastery of ' + topic}"
- Primary Differentiation Focus: ${differentiationFocus.length ? differentiationFocus.join(', ') : 'Learning Readiness, Learning Profiles, Language Proficiency'}
- Targeted Dimensions: ${differentiationDimensions.length ? differentiationDimensions.join(', ') : 'Content, Process, Product'}
- Designated Learner Profiles / Groups:
${profilesText}
- Key Adaptation Strategies Employed: ${adaptationStrategies.length ? adaptationStrategies.join(', ') : 'Scaffolding, Visual Supports, Extension Tasks, Flexible Grouping'}
${specificLearnerNeeds ? `- Specific Classroom Needs & Accommodations: ${specificLearnerNeeds}` : ''}
- Preferred Output Format: ${outputFormat}

[INSTRUCTIONAL OUTPUT REQUIREMENTS]
1. Essential Common Learning Objective: Unifying benchmark that all tiers work toward.
2. Asset-Based Profile Breakdown: Characterization of each group's cognitive strengths and targeted support requirements (strictly non-deficit language).
${includeBeforeAfter ? `3. Before-and-After Pedagogical Comparison:
   - Baseline Activity: A standard, un-differentiated classroom task on this topic.
   - Transformed Differentiated Strategy: How the tiered pathways unlock equitable access for all learners.` : ''}
4. Differentiated Matrix (${outputFormat}):
   - Dimension 1: Content (Tiered text complexity, representations, vocabulary scaffolding).
   - Dimension 2: Process (Varying degrees of teacher prompting, graphic organizers, collaborative formats).
   - Dimension 3: Product / Assessment (Flexible ways students demonstrate identical core mastery).
5. Separate Tiered Activity Plans:
   - Provide concrete, distinctive instructional instructions for:
     * Tier 1: Scaffolded activity protocol and sentence frames
     * Tier 2: Core grade-level activity protocol
     * Tier 3: Extension challenge / autonomous inquiry protocol
6. Shared Assessment Criteria:
   - Equitable scoring rubric showing how diverse student products demonstrate the same core standard.
7. Teacher Facilitation & Small-Group Management:
   - Pacing suggestions and concurrent group management tips to ensure psychological safety.

[INCLUSIVE DESIGN GUIDELINE]
Maintain the exact same essential learning objective for all students while varying the pathways, supports, and expressions.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS & PREFERENCES]\n${additionalRequirements}` : ''}`;

  return prompt.trim();
}


/**
 * 5. AI Presentation & Slide Generator Prompt Builder
 */
export function buildPresentationGeneratorPrompt(config = {}) {
  const {
    subject = 'General Education',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    topic = '',
    competency = '',
    objectives = '',
    targetAudience = 'Students',
    numSlides = 10,
    duration = '45 minutes',
    modality = 'Face-to-Face',
    presentationStyle = 'Interactive Academic',
    visualStyle = 'Clean Pedagogical',
    contentDensity = 'Balanced',
    includeSpeakerNotes = true,
    sourceLessonPlan = '',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Academic Presentation Architect. Construct an engaging, highly structured, and pedagogy-first slide presentation deck for educators.

[EDUCATIONAL & PRESENTATION CONTEXT]
- Subject / Discipline: ${subject}
- Educational Level: ${educationalLevel} ${gradeLevel ? '(' + gradeLevel + ')' : ''}
- Topic / Central Concept: ${topic || 'Key Discipline Concepts'}
- Target Standard / Competency: ${competency || 'Curricular Mastery'}
- Learning Objectives: ${objectives || 'Demonstrate deep conceptual and analytical understanding'}
- Target Audience: ${targetAudience}
- Total Slides: ${numSlides}
- Presentation Duration: ${duration}
- Delivery Modality: ${modality}
- Presentation Style: ${presentationStyle}
- Visual Style / Tone: ${visualStyle}
- Content Density: ${contentDensity}
${sourceLessonPlan ? `\n[SOURCE LESSON PLAN FOR CONVERSION]\n${sourceLessonPlan}` : ''}

[SLIDE STRUCTURE SPECIFICATIONS]
Structure the presentation into ${numSlides} discrete slides with clear markdown tags:
Each slide must include:
### Slide [Number]: [Slide Title]
- **Slide Type**: (Title, Learning Objectives, Hook/Motivation, Concept Explanation, Examples, Activity, Discussion, Assessment, or Summary)
- **Visual & Layout Directive**: (Clean academic suggestions, diagrams, tables, or split cards)
- **Slide Content**: (Structured bullet points, key equations, concepts, or quote blocks)
${includeSpeakerNotes ? `- **Speaker Notes & Narration**: (Comprehensive word-for-word teacher script, discussion prompts, and transition cues)` : ''}
- **Estimated Timing**: (Minutes allocated for this slide)

[OUTPUT REQUIREMENTS]
Ensure the slide sequence follows an authentic pedagogical arc. Every slide must contain editable text and actionable speaker notes.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 6. AI Assessment & Rubric Studio Prompt Builder
 */
export function buildAssessmentRubricPrompt(config = {}) {
  const {
    subject = 'General Education',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    topic = '',
    competency = '',
    assessmentType = 'Formative & Performance Task',
    itemCount = 10,
    rubricType = 'Analytic Rubric (4 Performance Levels)',
    includeAnswerKey = true,
    includeBlueprintTOS = true,
    scoringMethod = 'Weighted Points Scale',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Psychometric and Assessment Design Specialist. Construct a balanced, standards-aligned assessment blueprint, item set, and scoring rubric.

[EDUCATIONAL ASSESSMENT CONTEXT]
- Subject: ${subject}
- Level / Grade: ${educationalLevel} ${gradeLevel ? '(' + gradeLevel + ')' : ''}
- Topic: ${topic || 'Curriculum Concepts'}
- Competency / Outcome: ${competency || 'Core Standard Mastery'}
- Assessment Archetype: ${assessmentType}
- Target Items / Tasks: ${itemCount} items
- Rubric Architecture: ${rubricType}
- Scoring Methodology: ${scoringMethod}

[ASSESSMENT SPECIFICATIONS]
${includeBlueprintTOS ? `1. Table of Specifications (TOS) & Blueprint:
   - Matrix showing Objective, Bloom's Cognitive Level (Remember/Understand, Apply/Analyze, Evaluate/Create), Item Number, and Point Weighting.` : ''}
2. Assessment Instrument / Question Items:
   - Clearly formatted assessment questions (Multiple Choice with diagnostic distractors, Scenario-Based Problems, or Authentic Performance Tasks).
${includeAnswerKey ? `3. Answer Key & Teacher Scoring Guide:
   - Correct answers with step-by-step pedagogical rationales and student misconception diagnoses.` : ''}
4. Comprehensive Rubric Matrix:
   - Formatted Markdown table containing Criteria, Point Values, and explicit descriptive qualitative indicators across 4 performance levels (Exemplary, Proficient, Developing, Beginning).
5. Student-Facing Task Instructions & Accommodations.
${additionalRequirements ? `\n[ADDITIONAL REQUIREMENTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 7. AI Instructional Materials Studio Prompt Builder
 */
export function buildInstructionalMaterialsPrompt(config = {}) {
  const {
    subject = 'General Education',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    topic = '',
    competency = '',
    materialType = 'Student Worksheet & Learning Activity Sheet',
    difficulty = 'Grade-Level Benchmark',
    length = '2-3 Pages',
    includeAnswerKey = true,
    includeTeacherGuide = true,
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Classroom Materials Specialist. Create publication-quality, classroom-ready instructional materials.

[MATERIAL CONTEXT]
- Subject: ${subject}
- Level / Grade: ${educationalLevel} ${gradeLevel ? '(' + gradeLevel + ')' : ''}
- Topic: ${topic || 'Key Concepts'}
- Competency / Objective: ${competency || 'Core Standard'}
- Target Material Type: ${materialType}
- Difficulty: ${difficulty}
- Target Length: ${length}

[MATERIAL STRUCTURE]
1. Student Material Section:
   - Title, Header Metadata, Learning Objectives, Vocabulary / Word Bank.
   - Part 1: Guided Concept Review & Graphic Organizer.
   - Part 2: Hands-on / Written Application Exercises.
   - Part 3: Critical Thinking / Synthesis Challenge & Exit Ticket.
${includeAnswerKey ? `2. Teacher Answer Key & Diagnostic Guide:\n   - Complete solutions, exemplar student responses, and common errors to watch for.` : ''}
${includeTeacherGuide ? `3. Pedagogical Teacher Facilitation Tips:\n   - Implementation instructions, time breakdown, and UDL scaffolding notes.` : ''}
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 8. AI Curriculum & Competency Mapper Prompt Builder
 */
export function buildCurriculumMapperPrompt(config = {}) {
  const {
    subject = 'General Education',
    educationalLevel = 'Junior High School',
    gradeLevel = '',
    term = 'Quarter 1',
    numUnits = 4,
    competencies = '',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Curriculum Architect. Construct a multi-week curriculum map, competency progression guide, and instructional pacing matrix.

[CURRICULUM CONTEXT]
- Subject: ${subject}
- Level: ${educationalLevel} ${gradeLevel ? '(' + gradeLevel + ')' : ''}
- Term / Period: ${term}
- Units to Cover: ${numUnits} units
- Input Competencies: ${competencies || 'Standard National / State Curriculum Sequence'}

[MAPPING MATRIX SPECIFICATIONS]
Generate a complete, structured Markdown Curriculum Matrix table with columns:
| Week & Timeframe | Unit / Central Topic | Curriculum Competency & Code | Specific Learning Objective | Core Instructional Strategy / Activity | Formative & Summative Assessment | Essential Resources |
Include:
1. Pacing & Time Allocation Analysis.
2. Vertical & Horizontal Articulation Notes.
3. Diagnostic Gaps & Redundancy Checks.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 9. AI Learning Accessibility & UDL Studio Prompt Builder
 */
export function buildAccessibilityUdlPrompt(config = {}) {
  const {
    subject = 'General Education',
    educationalLevel = 'Junior High School',
    topic = '',
    competency = '',
    existingMaterial = '',
    udlDimensions = ['Engagement', 'Representation', 'Action and Expression'],
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Universal Design for Learning (UDL) and Accessibility Auditor. Evaluate learning materials and generate inclusive adaptations.

[CONTEXT]
- Subject: ${subject} | Level: ${educationalLevel} | Topic: ${topic}
- Core Competency: ${competency}
- UDL Focus: ${udlDimensions.join(', ')}
${existingMaterial ? `\n[TARGET MATERIAL TO AUDIT & ADAPT]\n${existingMaterial}` : ''}

[UDL AUDIT & DESIGN OUTPUT]
1. Readability & Learning Barrier Audit:
   - Identify linguistic, cognitive, sensory, or physical barriers in typical lessons on this topic.
2. Principle 1 — Multiple Means of Engagement:
   - Interest hooks, authentic choice, self-regulation, and collaborative scaffolds.
3. Principle 2 — Multiple Means of Representation:
   - Dual-coding, multi-sensory formats (visual/auditory/tactile), vocabulary clarification, and concept chunking.
4. Principle 3 — Multiple Means of Action & Expression:
   - Alternative response modalities, executive function scaffolds, and adaptive tools.
5. UDL Implementation Checklist for the Classroom.
${additionalRequirements ? `\n[ADDITIONAL REQUIREMENTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 10. AI Teaching Script & Facilitation Studio Prompt Builder
 */
export function buildTeachingScriptPrompt(config = {}) {
  const {
    subject = 'General Education',
    educationalLevel = 'Junior High School',
    topic = '',
    scriptType = 'Full Lesson Facilitation Script',
    duration = '45 minutes',
    tone = 'Supportive & Socratic',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Master Teacher Facilitator. Craft a natural, age-appropriate, highly engaging classroom teaching script.

[SCRIPT CONTEXT]
- Subject: ${subject} | Level: ${educationalLevel} | Topic: ${topic}
- Script Archetype: ${scriptType}
- Class Duration: ${duration}
- Instructional Tone: ${tone}

[SCRIPT SPECIFICATIONS]
Structure the script into clear conversational phases:
1. Opening Hook & Objective Orientation (Teacher talk, provocative opening question, anticipated student responses).
2. Direct Concept Explanation (Analogies, whiteboard notes, checking for understanding stems).
3. Guided Discussion & Socratic Questioning Flow (Teacher probing questions, branching student answers, redirect prompts).
4. Activity Transition & Group Work Instructions (Clear physical directives, noise level norms).
5. Lesson Closing & Synthesis (Student metacognitive reflection, wrap-up statements).
Include explicit [Teacher Action], [Teacher Says], and [Expected Student Response] markup.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 11. AI Classroom Management & Facilitation Studio Prompt Builder
 */
export function buildClassroomManagementPrompt(config = {}) {
  const {
    educationalLevel = 'Junior High School',
    setting = 'Physical Classroom',
    classSize = '30-35 Students',
    challengeType = 'Group Work Transitions & Discussion Norms',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Positive Classroom Culture Specialist. Formulate respectful, inclusive, and non-punitive classroom management systems.

[CLASSROOM CONTEXT]
- Educational Level: ${educationalLevel}
- Physical Setting: ${setting}
- Class Size: ${classSize}
- Focus Area: ${challengeType}

[MANAGEMENT SYSTEM OUTPUT]
1. Core Behavioral Norms & Co-Created Agreements (Positive, clear, action-oriented).
2. Explicit Procedural Protocols & Transitions (Step-by-step routines for starting, material distribution, transitions, and dismissal).
3. Cooperative Group Work Norms & Role Assignments (Roles: Facilitator, Recorder, Reporter, Materials Manager).
4. Restorative & De-escalation Strategies (Positive redirection cues, non-verbal signals, calm-down routines).
5. Family & Student Communication Stems.
Strict Rule: Use supportive, non-punitive, and dignifying strategies.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 12. AI Teaching Reflection Studio Prompt Builder
 */
export function buildTeachingReflectionPrompt(config = {}) {
  const {
    framework = "Gibbs' Reflective Cycle",
    subject = 'General Education',
    topic = '',
    lessonNotes = '',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Reflective Practice Mentor. Facilitate an in-depth teaching reflection and instructional continuous improvement action plan.

[REFLECTION CONTEXT]
- Framework: ${framework}
- Subject: ${subject} | Topic: ${topic}
${lessonNotes ? `- Educator Classroom Observations:\n${lessonNotes}` : ''}

[REFLECTIVE STRUCTURE (${framework})]
1. Description of the Lesson & Context
2. Feelings & Teacher Reactions
3. Evaluation (What worked well vs what was challenging)
4. Pedagogical Analysis (Why did things occur this way? Cognitive/engagement factors)
5. Conclusion & Pedagogical Insights
6. Concrete Action Plan for Future Instruction (Immediate changes, revised activities, follow-up scaffolding)
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 13. AI Research & Resource Assistant Prompt Builder
 */
export function buildResearchAssistantPrompt(config = {}) {
  const {
    researchTopic = '',
    educationalLevel = 'General Education',
    inquiryFocus = 'Empirical Evidence & Best Practices',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Academic Research Specialist. Synthesize educational research, pedagogical literature, and evidence-based instructional strategies.

[RESEARCH TOPIC]
- Research Topic / Question: ${researchTopic}
- Educational Level: ${educationalLevel}
- Inquiry Focus: ${inquiryFocus}

[RESEARCH SYNTHESIS OUTPUT]
1. Executive Research Overview & Key Conceptual Foundations.
2. Key Pedagogical Findings from Cognitive & Educational Science.
3. Translating Research into Classroom Practice (Actionable instructional strategies).
4. Recommended Investigation Questions for Teacher Action Research.
5. APA 7th Edition Reference Formats (Strictly formatted references, verified educational theory citations).
Strict Rule: Do not fabricate fake authors, fake DOI numbers, or fictional empirical data.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 14. AI Quality Review & Alignment Checker Prompt Builder
 */
export function buildQualityReviewPrompt(config = {}) {
  const {
    designTitle = '',
    designContent = '',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Senior Curriculum Quality Auditor. Evaluate the provided instructional design against 12 rigorous pedagogical benchmarks.

[TARGET INSTRUCTIONAL DESIGN]
Title: ${designTitle}
Content:
${designContent}

[QUALITY REVIEW CRITERIA]
Evaluate and score across:
1. Learning Objective Alignment
2. Curriculum Competency Alignment
3. Content Accuracy & Conceptual Rigor
4. Pedagogical Model Appropriateness
5. Learner-Level Feasibility
6. Assessment Alignment (Constructive Alignment)
7. Inclusivity & Universal Design (UDL)
8. Accessibility & Cognitive Load
9. Procedural Clarity & Step Details
10. Classroom Time Pacing
11. Instructional Sequence Logic
12. Resource Availability & Safety

Provide:
- Strengths Identified
- Potential Vulnerabilities or Pedagogical Gaps
- Concrete Revision Recommendations
- Overall Alignment Index (Percentage).
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}

/**
 * 15. Instructional Organizer Checklist Generator Prompt Builder
 */
export function buildOrganizerChecklistPrompt(config = {}) {
  const {
    checklistType = 'Lesson Preparation Checklist',
    topic = '',
    subject = '',
    sourceContent = '',
    additionalRequirements = ''
  } = config;

  return `[ROLE & PEDAGOGICAL PERSONA]
You are PEDAIA's Classroom Operations Organizer. Generate a comprehensive, chronological, and actionable checklist for educators.

[CONTEXT]
- Checklist Type: ${checklistType}
- Topic: ${topic} | Subject: ${subject}
${sourceContent ? `\n[SOURCE INSTRUCTIONAL CONTEXT]\n${sourceContent}` : ''}

[CHECKLIST REQUIREMENTS]
Provide a structured list of actionable tasks grouped by:
1. Advance Preparation (2-3 days prior)
2. Day-of Setup (30 minutes prior)
3. During-Class Execution Milestones
4. Post-Class Follow-up & Assessment Collection
Format each item with clear checkbox markdown:
- [ ] [Task Title]: Detailed directive and required materials.
${additionalRequirements ? `\n[ADDITIONAL CONSTRAINTS]\n${additionalRequirements}` : ''}`.trim();
}
