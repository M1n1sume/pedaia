// PEDAIA Central State Management with LocalStorage Persistence
import { INITIAL_SAVED_DESIGNS, INITIAL_PROMPT_TEMPLATES } from './sampleData.js';
import { applyThemeMode, getThemeMode, getResolvedTheme, THEME_MODES } from './palette.js';

const STORAGE_KEYS = {
  DESIGNS: 'pedaia_saved_designs_v1',
  TEMPLATES: 'pedaia_prompt_templates_v1',
  SETTINGS: 'pedaia_settings_v1',
  ACTIVE_BUILDER_STATE: 'pedaia_active_builder_state_v1',
  USER_PROFILES: 'pedaia_user_profiles_v1',
  ACTIVE_USER: 'pedaia_active_user_id_v1',
  MATERIALS_GENERATED: 'pedaia_materials_generated_count',
  PROJECTS: 'pedaia_projects_v1',
  CHECKLISTS: 'pedaia_checklists_v1',
  CURRICULUM_MAPS: 'pedaia_curriculum_maps_v1',
  REFLECTIONS: 'pedaia_reflections_v1',
  WEEKLY_SCHEDULES: 'pedaia_weekly_schedules_v1',
  STANDARDS: 'pedaia_curriculum_standards_v1'
};

export const BLANK_EDUCATOR_PROFILE = Object.freeze({
  name: '',
  title: '',
  institution: '',
  department: '',
  educationalLevel: '',
  specialization: '',
  bio: '',
  email: '',
  avatarUrl: ''
});

export const DEFAULT_PROVIDERS = {
  gemini: { apiKey: '', model: 'gemini-2.5-flash' },
  openai: { apiKey: '', model: 'gpt-4o' },
  anthropic: { apiKey: '', model: 'claude-3-7-sonnet-20250219' },
  deepseek: { apiKey: '', model: 'deepseek-reasoner' },
  perplexity: { apiKey: '', model: 'sonar-pro' },
  xai: { apiKey: '', model: 'grok-2-1212' },
  groq: { apiKey: '', model: 'llama-3.3-70b-versatile' },
  cerebras: { apiKey: '', model: 'llama-3.3-70b' },
  together: { apiKey: '', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
  mistral: { apiKey: '', model: 'mistral-large-latest' },
  cohere: { apiKey: '', model: 'command-r-plus-08-2024' },
  ollama: { endpoint: 'http://localhost:11434', model: 'llama3.2' },
  lmstudio: { endpoint: 'http://localhost:1234/v1', model: 'local-model' },
  openrouter: { apiKey: '', model: 'anthropic/claude-3.5-sonnet' },
  custom: { endpoint: 'http://localhost:1234/v1', apiKey: '', model: 'default' }
};

const DEFAULT_SETTINGS = {
  themeMode: 'system',
  theme: 'system',
  activeProvider: 'gemini',
  apiKey: '',
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  providers: DEFAULT_PROVIDERS,
  educatorProfile: { ...BLANK_EDUCATOR_PROFILE }
};

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Ensure designs exist in localStorage
    if (!localStorage.getItem(STORAGE_KEYS.DESIGNS)) {
      localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(INITIAL_SAVED_DESIGNS));
    }
    // Ensure templates exist
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_PROMPT_TEMPLATES));
    }
    // Ensure settings exist
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload);
      } catch (e) {
        console.error('State subscriber error:', e);
      }
    }
  }

  // --- Designs ---
  getDesigns() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DESIGNS);
      return data ? JSON.parse(data) : INITIAL_SAVED_DESIGNS;
    } catch (e) {
      console.error('Failed to parse saved designs:', e);
      return INITIAL_SAVED_DESIGNS;
    }
  }

  getDesignById(id) {
    const list = this.getDesigns();
    return list.find(d => d.id === id) || null;
  }

  saveDesign(design) {
    const list = this.getDesigns();
    const existingIndex = list.findIndex(d => d.id === design.id);
    const now = new Date().toISOString();

    const cleanDesign = {
      ...design,
      updatedAt: now,
      createdAt: design.createdAt || now,
      versionHistory: design.versionHistory || [
        {
          timestamp: now,
          output: design.output,
          note: 'Initial generation'
        }
      ]
    };

    if (existingIndex >= 0) {
      list[existingIndex] = cleanDesign;
    } else {
      list.unshift(cleanDesign);
    }

    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(list));
    this.notify('designsUpdated', { list, activeId: cleanDesign.id });
    return cleanDesign;
  }

  updateDesign(id, updates) {
    const list = this.getDesigns();
    const index = list.findIndex(d => d.id === id);
    if (index === -1) return null;

    const current = list[index];
    const now = new Date().toISOString();

    // If output changed, record into version history
    let versionHistory = current.versionHistory || [];
    if (updates.output && updates.output !== current.output) {
      versionHistory = [
        {
          timestamp: now,
          output: current.output,
          note: updates.refinementNote || 'Revision prior to update'
        },
        ...versionHistory
      ].slice(0, 10); // keep last 10 versions
    }

    const updated = {
      ...current,
      ...updates,
      versionHistory,
      updatedAt: now
    };

    list[index] = updated;
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(list));
    this.notify('designsUpdated', { list, updatedId: id });
    return updated;
  }

  deleteDesign(id) {
    let list = this.getDesigns();
    list = list.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(list));
    this.notify('designsUpdated', { list, deletedId: id });
    return true;
  }

  duplicateDesign(id) {
    const original = this.getDesignById(id);
    if (!original) return null;

    const copy = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'design-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: `${original.title} (Copy)`,
      status: 'Draft', // Duplicates start as Draft per workflow
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveDesign(copy);
  }

  archiveDesign(id) {
    return this.updateDesign(id, { isArchived: true, status: 'Archived' });
  }

  unarchiveDesign(id) {
    const design = this.getDesignById(id);
    const restoredStatus = (design && design.output) ? 'Output Generated' : 'Draft';
    return this.updateDesign(id, { isArchived: false, status: restoredStatus });
  }

  revertDesignVersion(id, versionIndex) {
    const design = this.getDesignById(id);
    if (!design || !design.versionHistory || !design.versionHistory[versionIndex]) return null;
    const targetVersion = design.versionHistory[versionIndex];
    return this.updateDesign(id, {
      output: targetVersion.output,
      refinementNote: `Reverted to snapshot from ${new Date(targetVersion.timestamp).toLocaleString()}`
    });
  }

  // --- Templates ---
  getTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return data ? JSON.parse(data) : INITIAL_PROMPT_TEMPLATES;
    } catch (e) {
      return INITIAL_PROMPT_TEMPLATES;
    }
  }

  saveTemplate(template) {
    const list = this.getTemplates();
    const clean = {
      ...template,
      id: template.id || 'tmpl-' + Date.now()
    };
    list.unshift(clean);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list));
    this.notify('templatesUpdated', { list });
    return clean;
  }

  deleteTemplate(id) {
    let list = this.getTemplates();
    list = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list));
    this.notify('templatesUpdated', { list });
  }

  // --- Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      const mergedProviders = { ...DEFAULT_PROVIDERS };
      if (parsed.providers && typeof parsed.providers === 'object') {
        for (const [k, v] of Object.entries(parsed.providers)) {
          mergedProviders[k] = { ...(DEFAULT_PROVIDERS[k] || {}), ...v };
        }
      }
      // Migrate legacy root apiKey
      if (parsed.apiKey && (!mergedProviders.gemini || !mergedProviders.gemini.apiKey)) {
        mergedProviders.gemini = {
          apiKey: parsed.apiKey,
          model: parsed.model || 'gemini-2.5-flash'
        };
      }

      // Respect strict blank default requirement: purge legacy sample identity
      let educatorProfile = parsed.educatorProfile;
      if (educatorProfile && educatorProfile.name === 'Dr. Maria Santos') {
        educatorProfile = { ...BLANK_EDUCATOR_PROFILE };
      } else if (!educatorProfile) {
        educatorProfile = { ...BLANK_EDUCATOR_PROFILE };
      }

      // Check user-isolated profile store for active user
      const activeUid = this.getCurrentUserId();
      const isolatedProfile = this.getEducatorProfile(activeUid);
      if (isolatedProfile) {
        educatorProfile = isolatedProfile;
      }

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        educatorProfile,
        activeProvider: parsed.activeProvider || 'gemini',
        providers: mergedProviders
      };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(partial) {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify('settingsUpdated', updated);
    return updated;
  }

  // --- Protected Multi-User Educator Profile System ---
  getCurrentUserId() {
    try {
      let uid = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (!uid) {
        uid = 'usr_default';
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, uid);
      }
      return uid;
    } catch {
      return 'usr_default';
    }
  }

  switchUser(userId) {
    if (!userId || typeof userId !== 'string') return;
    const cleanId = userId.trim();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, cleanId);
    const profile = this.getEducatorProfile(cleanId);
    this.notify('userSwitched', { userId: cleanId, profile });
    this.notify('profileUpdated', profile);
    return profile;
  }

  getEducatorProfile(userId) {
    const targetUid = userId || this.getCurrentUserId();
    try {
      const allProfilesStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
      const allProfiles = allProfilesStr ? JSON.parse(allProfilesStr) : {};
      const userProfile = allProfiles[targetUid];

      if (userProfile && typeof userProfile === 'object') {
        // Sanitize legacy placeholder if present
        if (userProfile.name === 'Dr. Maria Santos') {
          return { ...BLANK_EDUCATOR_PROFILE };
        }
        return {
          ...BLANK_EDUCATOR_PROFILE,
          ...userProfile
        };
      }

      // Legacy fallback ONLY for the default user if no profile was saved yet
      if (targetUid === 'usr_default' && !allProfiles['usr_default']) {
        const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (settingsStr) {
          const parsed = JSON.parse(settingsStr);
          if (parsed.educatorProfile && parsed.educatorProfile.name && parsed.educatorProfile.name !== 'Dr. Maria Santos') {
            return {
              ...BLANK_EDUCATOR_PROFILE,
              ...parsed.educatorProfile
            };
          }
        }
      }

      // Default for any new user: 100% blank profile (Section 8.A)
      return { ...BLANK_EDUCATOR_PROFILE };
    } catch {
      return { ...BLANK_EDUCATOR_PROFILE };
    }
  }

  saveEducatorProfile(profileData, userId) {
    const targetUid = userId || this.getCurrentUserId();
    const cleanProfile = {
      ...BLANK_EDUCATOR_PROFILE,
      ...(profileData || {})
    };

    // Trim string fields
    for (const key of Object.keys(cleanProfile)) {
      if (typeof cleanProfile[key] === 'string') {
        cleanProfile[key] = cleanProfile[key].trim();
      }
    }

    try {
      const allProfilesStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
      const allProfiles = allProfilesStr ? JSON.parse(allProfilesStr) : {};
      allProfiles[targetUid] = cleanProfile;
      localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(allProfiles));

      // Synchronize with settings for backward compatibility ONLY if targetUid is active user
      if (targetUid === this.getCurrentUserId()) {
        const currentSettings = this.getSettings();
        currentSettings.educatorProfile = cleanProfile;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(currentSettings));
        this.notify('settingsUpdated', currentSettings);
      }

      this.notify('profileUpdated', cleanProfile);
      return cleanProfile;
    } catch (e) {
      console.error('Failed to save educator profile:', e);
      return cleanProfile;
    }
  }

  resetEducatorProfile(userId) {
    const targetUid = userId || this.getCurrentUserId();
    return this.saveEducatorProfile({ ...BLANK_EDUCATOR_PROFILE }, targetUid);
  }

  // --- Dynamic Genuine Statistics Tracking ---
  getGeneratedMaterialsCount() {
    try {
      const designs = this.getDesigns();
      // Count total actual versions created across all designs
      const designVersions = designs.reduce((sum, d) => {
        const hist = (d.versionHistory && Array.isArray(d.versionHistory)) ? d.versionHistory.length : 0;
        return sum + Math.max(1, hist + 1);
      }, 0);
      const tracked = parseInt(localStorage.getItem(STORAGE_KEYS.MATERIALS_GENERATED) || '0', 10);
      return Math.max(designVersions, tracked);
    } catch {
      return this.getDesigns().length;
    }
  }

  recordMaterialGenerated() {
    try {
      const current = this.getGeneratedMaterialsCount();
      const next = current + 1;
      localStorage.setItem(STORAGE_KEYS.MATERIALS_GENERATED, next.toString());
      return next;
    } catch {
      return 0;
    }
  }

  getActiveProvider() {
    const settings = this.getSettings();
    return settings.activeProvider || 'gemini';
  }

  setActiveProvider(providerId, modelId) {
    const settings = this.getSettings();
    const provConfig = settings.providers[providerId] || {};
    const nextModel = modelId || provConfig.model || settings.model;
    return this.updateSettings({
      activeProvider: providerId,
      model: nextModel
    });
  }

  getProviderSettings(providerId) {
    const settings = this.getSettings();
    return settings.providers?.[providerId] || DEFAULT_PROVIDERS[providerId] || {};
  }

  updateProviderSettings(providerId, config) {
    const settings = this.getSettings();
    const updatedProviders = {
      ...(settings.providers || DEFAULT_PROVIDERS),
      [providerId]: {
        ...(settings.providers?.[providerId] || DEFAULT_PROVIDERS[providerId] || {}),
        ...config
      }
    };
    return this.updateSettings({
      providers: updatedProviders,
      // If updating active provider, sync root apiKey / model if relevant
      ...(settings.activeProvider === providerId ? {
        apiKey: config.apiKey !== undefined ? config.apiKey : settings.apiKey,
        model: config.model !== undefined ? config.model : settings.model
      } : {})
    });
  }

  // --- Unified Appearance & Theme Management ---
  getThemeMode() {
    const s = this.getSettings();
    return s.themeMode || s.theme || getThemeMode();
  }

  getResolvedTheme() {
    return getResolvedTheme(this.getThemeMode());
  }

  getTheme() {
    // Returns resolved 'light' or 'dark' for backward compatibility
    return this.getResolvedTheme();
  }

  setThemeMode(mode) {
    const result = applyThemeMode(mode);
    this.updateSettings({ themeMode: result.mode, theme: result.mode });
    this.notify('themeChanged', result);
    return result;
  }

  setTheme(theme) {
    return this.setThemeMode(theme).resolved;
  }

  toggleTheme() {
    const current = this.getThemeMode();
    let next = 'dark';
    if (current === 'dark') next = 'light';
    else if (current === 'light') next = 'system';
    else next = 'dark';
    return this.setThemeMode(next);
  }

  // --- Connected Instructional Design Projects & Workflows ---
  getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        // Initialize with default demo project linked to first saved design
        const designs = this.getDesigns();
        const baseDesign = designs[0] || {};
        const defaultProject = [{
          id: 'proj-demo-1',
          title: baseDesign.title ? `${baseDesign.title} [Complete Instructional Package]` : 'Cell Biology & Photosynthesis Unit Package',
          subject: baseDesign.subject || 'Science',
          educationalLevel: baseDesign.educationalLevel || 'Junior High School',
          gradeLevel: baseDesign.gradeLevel || 'Grade 8',
          topic: baseDesign.topic || 'Photosynthesis & Cellular Respiration',
          competency: baseDesign.competency || 'Demonstrate mastery of core discipline standards through inquiry and critical analysis',
          sourceDesignId: baseDesign.id || null,
          status: 'In Progress',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resources: [
            { type: 'lesson-plan', id: baseDesign.id || 'res-1', title: baseDesign.title || 'Master 5E Lesson Plan', status: 'Completed' },
            { type: 'presentation', id: 'res-2', title: 'Interactive Slide Deck (12 Slides)', status: 'Draft' },
            { type: 'worksheet', id: 'res-3', title: 'Guided Inquiry Handout & Vocabulary Sheet', status: 'Completed' },
            { type: 'assessment', id: 'res-4', title: 'Formative Assessment Matrix & Rubric', status: 'Draft' },
            { type: 'script', id: 'res-5', title: 'Teacher Facilitation Dialogue & Socratic Stems', status: 'Pending' },
            { type: 'checklist', id: 'res-6', title: 'Lab Supplies & Instructional Checklist', status: 'Completed' }
          ]
        }];
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultProject));
        return defaultProject;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveProject(project) {
    const list = this.getProjects();
    const cleanProject = {
      ...project,
      id: project.id || 'proj-' + Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: project.createdAt || new Date().toISOString()
    };
    const idx = list.findIndex(p => p.id === cleanProject.id);
    if (idx >= 0) list[idx] = cleanProject;
    else list.unshift(cleanProject);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
    this.notify('projectsUpdated', { list, activeId: cleanProject.id });
    return cleanProject;
  }

  deleteProject(id) {
    let list = this.getProjects();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
    this.notify('projectsUpdated', { list });
  }

  // --- Instructional Organizer & Checklists ---
  getChecklists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      if (!data) {
        const defaultLists = [
          {
            id: 'chk-1',
            title: 'Master Lesson Preparation Checklist',
            category: 'Lesson Preparation',
            priority: 'High',
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
            notes: 'Essential checks prior to launching active inquiry sessions',
            items: [
              { id: 'item-1', text: 'Print and collate student inquiry worksheets and lab guides', completed: true },
              { id: 'item-2', text: 'Verify audio-visual projector and digital presentation slides', completed: true },
              { id: 'item-3', text: 'Prepare manipulative lab stations and glassware kits', completed: false },
              { id: 'item-4', text: 'Review differentiated scaffolding cards for Tier 1 learners', completed: false },
              { id: 'item-5', text: 'Post Socratic inquiry questions and discussion norms on classroom board', completed: true }
            ]
          },
          {
            id: 'chk-2',
            title: 'Classroom Supplies & Materials Checklist',
            category: 'Classroom Supplies',
            priority: 'Medium',
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
            notes: 'Physical inventory needed for hands-on activities',
            items: [
              { id: 'item-21', text: 'Dry-erase markers and whiteboard erasers', completed: true },
              { id: 'item-22', text: 'Chart paper and multi-colored index cards', completed: true },
              { id: 'item-23', text: 'Colored sticky notes for exit ticket reflection', completed: false }
            ]
          }
        ];
        localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(defaultLists));
        return defaultLists;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveChecklist(checklist) {
    const list = this.getChecklists();
    const cleanList = {
      ...checklist,
      id: checklist.id || 'chk-' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    const idx = list.findIndex(c => c.id === cleanList.id);
    if (idx >= 0) list[idx] = cleanList;
    else list.unshift(cleanList);
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(list));
    this.notify('checklistsUpdated', { list, activeId: cleanList.id });
    return cleanList;
  }

  toggleChecklistItem(listId, itemId) {
    const list = this.getChecklists();
    const targetList = list.find(l => l.id === listId);
    if (!targetList) return;
    const item = targetList.items.find(i => i.id === itemId);
    if (!item) return;
    item.completed = !item.completed;
    targetList.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(list));
    this.notify('checklistsUpdated', { list, updatedListId: listId });
    return targetList;
  }

  deleteChecklist(id) {
    let list = this.getChecklists();
    list = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(list));
    this.notify('checklistsUpdated', { list });
  }

  // --- Curriculum & Competency Maps ---
  getCurriculumMaps() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRICULUM_MAPS);
      if (!data) {
        const defaultMaps = [{
          id: 'cmap-1',
          title: 'Integrated Science Curriculum & Pacing Guide (Quarter 1)',
          subject: 'Science',
          educationalLevel: 'Junior High School',
          gradeLevel: 'Grade 8',
          term: 'Quarter 1',
          updatedAt: new Date().toISOString(),
          rows: [
            { week: 'Week 1-2', unit: 'Unit 1: Cell Structure & Function', competency: 'Differentiate plant and animal cell structures and organelles', objective: 'Identify key organelles through microscopic observation', activity: 'Hands-on Microscope Wet Mount Lab', assessment: 'Formative Lab Diagram & Organelle Quiz', time: '10 Hours' },
            { week: 'Week 3-4', unit: 'Unit 1: Cellular Energetics', competency: 'Explain the coupled mechanisms of photosynthesis and respiration', objective: 'Model chemical equation transitions using molecular kits', activity: 'Photosynthesis Leaf Disk Floating Experiment', assessment: 'Rubric-Scored Experimental Lab Report', time: '10 Hours' },
            { week: 'Week 5-6', unit: 'Unit 2: Heredity & Genetics', competency: 'Predict phenotypic outcomes using Mendelian monohybrid crosses', objective: 'Construct and solve Punnett squares for dominant/recessive traits', activity: 'Genetics Dragon Breeding Simulation', assessment: 'Performance Task: Genetic Trait Case Study', time: '10 Hours' },
            { week: 'Week 7-8', unit: 'Unit 2: Genetic Diversity', competency: 'Explain how meiosis contributes to species genetic variation', objective: 'Compare chromosome segregation in mitosis vs meiosis', activity: 'Kinesthetic Pipe Cleaner Meiosis Dance', assessment: 'Quarterly Summative Assessment', time: '10 Hours' }
          ]
        }];
        localStorage.setItem(STORAGE_KEYS.CURRICULUM_MAPS, JSON.stringify(defaultMaps));
        return defaultMaps;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveCurriculumMap(map) {
    const list = this.getCurriculumMaps();
    const cleanMap = {
      ...map,
      id: map.id || 'cmap-' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    const idx = list.findIndex(m => m.id === cleanMap.id);
    if (idx >= 0) list[idx] = cleanMap;
    else list.unshift(cleanMap);
    localStorage.setItem(STORAGE_KEYS.CURRICULUM_MAPS, JSON.stringify(list));
    this.notify('curriculumMapsUpdated', { list, activeId: cleanMap.id });
    return cleanMap;
  }

  deleteCurriculumMap(id) {
    let list = this.getCurriculumMaps();
    list = list.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.CURRICULUM_MAPS, JSON.stringify(list));
    this.notify('curriculumMapsUpdated', { list });
  }

  // --- Teaching Reflections (Gibbs / Schön / What? So What? Now What?) ---
  getReflections() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      if (!data) {
        const defaultReflections = [{
          id: 'refl-1',
          title: 'Reflection on 5E Photosynthesis Inquiry Lab',
          framework: "Gibbs' Reflective Cycle",
          subject: 'Science',
          gradeLevel: 'Grade 8',
          createdAt: new Date().toISOString(),
          description: 'Students conducted the floating leaf disk assay. High engagement observed during the Explore phase.',
          feelings: 'Satisfied with student inquiry depth, but noticed pacing became rushed during the Explain synthesis.',
          evaluation: 'What worked well: Collaborative peer data recording. What needed improvement: Transition timing from lab benches to whole-group whiteboard dialogue.',
          analysis: 'Scaffolding the data capture table beforehand would give learners 10 extra minutes for collective sense-making.',
          conclusion: 'Students achieved the core objective but needed more guided question prompts to articulate their empirical claims.',
          actionPlan: 'Provide pre-printed graphic organizers and establish a 5-minute audible chime timer for the Elaborate phase.'
        }];
        localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(defaultReflections));
        return defaultReflections;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveReflection(refl) {
    const list = this.getReflections();
    const cleanRefl = {
      ...refl,
      id: refl.id || 'refl-' + Date.now(),
      createdAt: refl.createdAt || new Date().toISOString()
    };
    const idx = list.findIndex(r => r.id === cleanRefl.id);
    if (idx >= 0) list[idx] = cleanRefl;
    else list.unshift(cleanRefl);
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list));
    this.notify('reflectionsUpdated', { list, activeId: cleanRefl.id });
    return cleanRefl;
  }

  deleteReflection(id) {
    let list = this.getReflections();
    list = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list));
    this.notify('reflectionsUpdated', { list });
  }

  // --- Weekly Teaching Planner & Schedule ---
  getWeeklySchedule() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_SCHEDULES);
      if (!data) {
        const defaultSchedule = {
          weekTitle: 'Current Instructional Week',
          days: {
            'Monday': [
              { time: '08:00 - 09:00', subject: 'Grade 8 Science', topic: 'Photosynthesis 5E Model (Engage & Explore)', room: 'Lab 201', designId: null },
              { time: '10:00 - 11:00', subject: 'Grade 10 Biology', topic: 'Genetics Monohybrid Cross Modeling', room: 'Room 304', designId: null }
            ],
            'Tuesday': [
              { time: '08:00 - 09:00', subject: 'Grade 8 Science', topic: 'Photosynthesis 5E Model (Explain & Elaborate)', room: 'Lab 201', designId: null },
              { time: '13:00 - 14:00', subject: 'Faculty Mentorship', topic: 'Instructional Design & UDL Review', room: 'Conference Hall', designId: null }
            ],
            'Wednesday': [
              { time: '09:00 - 10:00', subject: 'Grade 8 Science', topic: 'Photosynthesis Formative Assessment & Quiz', room: 'Lab 201', designId: null },
              { time: '11:00 - 12:00', subject: 'Grade 10 Biology', topic: 'Pedigree Analysis Collaborative Jigsaw', room: 'Room 304', designId: null }
            ],
            'Thursday': [
              { time: '08:00 - 09:00', subject: 'Grade 8 Science', topic: 'Cellular Respiration Hook & Micro-Inquiry', room: 'Lab 201', designId: null },
              { time: '14:00 - 15:30', subject: 'Curriculum Committee', topic: 'Quarter 2 Standards & Competency Mapping', room: 'CTE Faculty Lounge', designId: null }
            ],
            'Friday': [
              { time: '08:30 - 10:00', subject: 'Grade 8 & 10 Science', topic: 'Integrated Inquiry Showcase & Reflection', room: 'Auditorium', designId: null },
              { time: '11:00 - 12:00', subject: 'Office Hours', topic: 'Differentiated Learning Support & Consultations', room: 'Faculty Office', designId: null }
            ]
          }
        };
        localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULES, JSON.stringify(defaultSchedule));
        return defaultSchedule;
      }
      return JSON.parse(data);
    } catch {
      return { weekTitle: 'Current Week', days: {} };
    }
  }

  saveWeeklySchedule(schedule) {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULES, JSON.stringify(schedule));
    this.notify('weeklyScheduleUpdated', schedule);
    return schedule;
  }

  // --- Curriculum Standards & Competencies Library ---
  getStandards() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STANDARDS);
      if (!data) {
        const defaultStandards = [
          { code: 'SCI-JHS-01', subject: 'Science', level: 'Junior High School', grade: 'Grade 8', domain: 'Living Things and Their Environment', description: 'Demonstrate an understanding of how cells function as the basic structural and functional units of life.' },
          { code: 'SCI-JHS-02', subject: 'Science', level: 'Junior High School', grade: 'Grade 8', domain: 'Living Things and Their Environment', description: 'Differentiate plant and animal cells according to the presence or absence of certain organelles.' },
          { code: 'SCI-JHS-03', subject: 'Science', level: 'Junior High School', grade: 'Grade 8', domain: 'Energy & Ecosystems', description: 'Explain how photosynthetic organisms produce their own food through light-dependent and Calvin cycle reactions.' },
          { code: 'MATH-JHS-01', subject: 'Mathematics', level: 'Junior High School', grade: 'Grade 8', domain: 'Patterns and Algebra', description: 'Formulate, solve, and graph linear equations in two variables using slope-intercept form.' },
          { code: 'ENG-JHS-01', subject: 'English', level: 'Junior High School', grade: 'Grade 7', domain: 'Reading Comprehension', description: 'Identify main ideas, supporting details, and author rhetorical purposes in academic informational texts.' },
          { code: 'FIL-SHS-01', subject: 'Filipino', level: 'Senior High School', grade: 'Grade 11', domain: 'Pagbasa at Pagsusuri', description: 'Nasusuri ang iba’t ibang uri ng binasang teksto ayon sa kaugnayan nito sa sarili, pamilya, komunidad, bansa at daigdig.' }
        ];
        localStorage.setItem(STORAGE_KEYS.STANDARDS, JSON.stringify(defaultStandards));
        return defaultStandards;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveStandard(std) {
    const list = this.getStandards();
    const cleanStd = { ...std, id: std.id || 'std-' + Date.now() };
    const idx = list.findIndex(s => s.code === cleanStd.code || s.id === cleanStd.id);
    if (idx >= 0) list[idx] = cleanStd;
    else list.unshift(cleanStd);
    localStorage.setItem(STORAGE_KEYS.STANDARDS, JSON.stringify(list));
    this.notify('standardsUpdated', { list });
    return cleanStd;
  }

  // --- Export & Reset ---
  exportAllData() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      designs: this.getDesigns(),
      templates: this.getTemplates(),
      settings: this.getSettings()
    }, null, 2);
  }

  importAllData(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.designs)) {
        localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(parsed.designs));
      }
      if (Array.isArray(parsed.templates)) {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(parsed.templates));
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }
      this.notify('dataImported', null);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(INITIAL_SAVED_DESIGNS));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_PROMPT_TEMPLATES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    this.notify('dataReset', null);
  }
}

export const store = new StateStore();
