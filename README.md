# PEDAIA — AI-Powered Instructional Design Studio
> *"Design Better Learning. Teach with Purpose."*  
> Alternative Tagline: *"Your Intelligent Partner in Instructional Design."*

---

## 1. Executive Summary

**PEDAIA (Pedagogical Design Assistant with Artificial Intelligence)** is an advanced, scholarly instructional design studio engineered for pre-service teachers, in-service educators, university faculty, curriculum specialists, and instructional coaches.

Rather than offering an unstructured chatbot, PEDAIA provides a rigorous, guided workbench where educators structure pedagogical parameters, review live dynamic prompt compilations, and generate publication-ready curriculum folios with zero required API keys out-of-the-box.

---

## 2. Core Modules & Pedagogical Studios

### 📘 Module 1: AI Lesson Planner
- **Pedagogical Models:** 5E Model (Engage, Explore, Explain, Elaborate, Evaluate), 4A's (Activity, Analysis, Abstraction, Application), Understanding by Design (UbD), Direct Instruction, Inquiry-Based Learning, Problem-Based Learning (PBL), Project-Based Learning, Flipped Classroom, and Gradual Release of Responsibility (I Do, We Do, You Do).
- **Taxonomies:** Bloom's Revised Taxonomy, SMART Objectives, and Competency-Based standards.
- **Customization:** Reorderable phases, customizable time allocations, and multimodal teaching adaptations.
- **Output Types:** Detailed Lesson Plan, Semi-Detailed, Tabular Matrix, Narrative Script, and Teacher's Guide.

### 🔬 Module 2: AI Activity Designer
- **Activity Archetypes:** Hands-On Inquiry Labs, Socratic Fishbowl Debates, Problem-Based Learning (PBL) Scenarios, Kinesthetic Simulations, Role-Playing, Case Studies, and Jigsaw Cooperatives.
- **Cognitive Purpose:** Conceptual Understanding, Critical Thinking, Collaborative Problem Solving, and Metacognitive Reflection.
- **Student Artifacts:** Scientific Models, Portfolios, Socratic Defenses, Written Briefs, and Digital Products.

### ❓ Module 3: AI Questioning Studio
- **Cognitive Depth:** Rigorous distribution across all 6 levels of **Bloom's Revised Taxonomy** (Remember, Understand, Apply, Analyze, Evaluate, Create).
- **Item Formats:** Multiple Choice with diagnostic distractor explanations, Scenario-Based dilemmas, Socratic inquiry questions, and Rubric-backed performance prompts.
- **Psychometrics:** Answer keys with pedagogical rationales and teacher probing stems.

### 🧩 Module 4: AI Differentiation Studio
- **Universal Design for Learning (UDL):** Tomlinson's differentiation model across **Content**, **Process**, **Product**, **Environment**, and **Assessment**.
- **Equitable Tiering:** Tier 1 (Scaffolding Pathway), Tier 2 (Core Benchmark Pathway), and Tier 3 (Advanced Intellectual Extension).
- **Core Equity Principle:** Preserves the **same essential learning objective** for all learners while varying sensory modalities, linguistic scaffolds, and demonstration formats.

---

## 3. Advanced Studio Features

1. **Global Studio Command Palette (`Ctrl+K` / `Cmd+K`):**
   - Instant spotlight modal providing keyboard-first fuzzy search across studios, 15 AI providers, saved designs, templates, and theme toggles.
2. **Scholarly Curriculum Folio & Academic Masthead:**
   - Formal institutional header with verifiable design reference IDs (`REF-XXXXXX`), Newsreader editorial serif typography, and an academic metadata grid.
3. **Live Pedagogical Quality & Alignment Scorecard:**
   - Real-time Bloom's taxonomy cognitive distribution meter (LOCS, MOCS, HOCS), UDL triple-check status (Representation, Expression, Engagement), and curriculum standard alignment metrics.
4. **Distraction-Free "Focus Folio" Mode:**
   - Toggle between the split-screen studio workbench and a centered, clean reading manuscript with instant printable PDF generation.
5. **Multi-Format Export Engine:**
   - Export curriculum dossiers in 8 publication formats: Markdown (.md), Plain Text (.txt), Word / Office HTML (.doc), JSON Backup (.json), CSV Matrix (.csv), Rich Text (.rtf), Academic LaTeX (.tex), and Curricular XML (.xml).
6. **LMS & Classroom Packaging:**
   - Native Common Cartridge packaging for Canvas LMS and one-click deep link sharing to Google Classroom.
7. **Cross-Browser Extension:**
   - Manifest V3 extension (Chrome, Edge, Brave, Firefox) for opening PEDAIA in popups or side panels while reviewing syllabi or grading online.
8. **15 AI Provider Integrations:**
   - Built-in offline intelligent synthesis engine (zero API keys needed), plus optional cloud connectors for Google Gemini, OpenAI, Anthropic Claude, Mistral, Groq, Cohere, DeepSeek, OpenRouter, Perplexity, Together AI, Ollama, and custom endpoints.

---

## 4. Quick Start & Installation

### Prerequisites
- Node.js (version 18 or higher)

### Setup & Run
```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/pedaia.git
cd pedaia

# 2. Start the local server
npm start
# or: node server.js
```
The studio will launch at:
```
http://localhost:3000
```

### Running Automated Test Suites
```bash
node scratch/audit_suite.mjs
node scratch/test_export_utils.mjs
node scratch/test_prompt_and_synthesis.mjs
node scratch/test_pro_elevation.mjs
node scratch/test_extension.cjs
node scratch/test_all_views_e2e.mjs
```

---

## 5. Technology Stack

- **Frontend:** Vanilla ES Modules, Tailwind CSS, Heroicons, Google Fonts (Inter, Plus Jakarta Sans, Newsreader).
- **Backend:** Node.js HTTP microserver (`server.js`) with static streaming, API proxies, and LMS packaging.
- **Browser Extension:** Manifest V3 cross-browser extension with responsive popup and side panel interfaces.
- **Brand Identity:** Primary Indigo (`#312E81`), Secondary Violet (`#7C3AED`), Accent Teal (`#14B8A6`).

---

## 6. License & Citation

Distributed under the **MIT License**.

If utilizing PEDAIA for academic research or curriculum design publications, please cite:
> PEDAIA Studio. (2026). *PEDAIA: Pedagogical Design Assistant with Artificial Intelligence*. College of Teacher Education Curricular Dossier.
