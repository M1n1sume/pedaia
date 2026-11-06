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
  STANDARDS: 'pedaia_curriculum_standards_v1',
  INTEGRITY_VAULT: 'pedaia_integrity_vault_v1'
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
    if (typeof localStorage === 'undefined') return;

    // Safety: ensure designs store exists without ever disrupting user designs
    if (localStorage.getItem(STORAGE_KEYS.DESIGNS) === null) {
      const fromVault = this.recoverFromVault(STORAGE_KEYS.DESIGNS);
      localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(Array.isArray(fromVault) ? fromVault : []));
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS) || '[]');
        if (Array.isArray(existing)) {
          const cleaned = existing.filter(d => d && !String(d.id || '').startsWith('sample-'));
          if (cleaned.length !== existing.length) {
            localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(cleaned));
          }
          if (cleaned.length > 0) {
            this.recordVaultSnapshot(STORAGE_KEYS.DESIGNS, cleaned);
          }
        }
      } catch {}
    }

    // Safety: ensure projects store exists without ever disrupting user projects
    if (localStorage.getItem(STORAGE_KEYS.PROJECTS) === null) {
      const fromVault = this.recoverFromVault(STORAGE_KEYS.PROJECTS);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(Array.isArray(fromVault) ? fromVault : []));
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
        if (Array.isArray(existing)) {
          const cleaned = existing.filter(p => p && p.id !== 'proj-demo-1' && !p.isExample && !String(p.id || '').startsWith('proj-demo-'));
          if (cleaned.length !== existing.length) {
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(cleaned));
          }
          if (cleaned.length > 0) {
            this.recordVaultSnapshot(STORAGE_KEYS.PROJECTS, cleaned);
          }
        }
      } catch {}
    }

    // Safety: ensure user profiles store exists without disrupting educator information
    if (localStorage.getItem(STORAGE_KEYS.USER_PROFILES) === null) {
      const fromVault = this.recoverFromVault(STORAGE_KEYS.USER_PROFILES);
      if (fromVault) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(fromVault));
      }
    } else {
      try {
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILES) || '{}');
        if (profiles && Object.keys(profiles).length > 0) {
          this.recordVaultSnapshot(STORAGE_KEYS.USER_PROFILES, profiles);
        }
      } catch {}
    }

    // Clean up any legacy sample checklists, curriculum maps, and reflections
    try {
      const chkData = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      if (chkData) {
        const list = JSON.parse(chkData);
        if (Array.isArray(list)) {
          const cleaned = list.filter(c => c && c.id !== 'chk-1' && c.id !== 'chk-2');
          localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(cleaned));
        }
      }
    } catch {}

    try {
      const mapData = localStorage.getItem(STORAGE_KEYS.CURRICULUM_MAPS);
      if (mapData) {
        const list = JSON.parse(mapData);
        if (Array.isArray(list)) {
          const cleaned = list.filter(m => m && m.id !== 'cmap-1');
          localStorage.setItem(STORAGE_KEYS.CURRICULUM_MAPS, JSON.stringify(cleaned));
        }
      }
    } catch {}

    try {
      const reflData = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      if (reflData) {
        const list = JSON.parse(reflData);
        if (Array.isArray(list)) {
          const cleaned = list.filter(r => r && r.id !== 'refl-1');
          localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(cleaned));
        }
      }
    } catch {}

    // Ensure templates exist
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_PROMPT_TEMPLATES));
    }
    // Ensure settings exist
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // --- Data Integrity & Disaster Recovery Vault ---
  recordVaultSnapshot(collectionKey, data) {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INTEGRITY_VAULT);
      const vault = raw ? JSON.parse(raw) : {};
      vault[collectionKey] = {
        data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.INTEGRITY_VAULT, JSON.stringify(vault));
    } catch (e) {
      // Non-fatal safety snapshot warning
    }
  }

  recoverFromVault(collectionKey) {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INTEGRITY_VAULT);
      if (!raw) return null;
      const vault = JSON.parse(raw);
      if (vault && vault[collectionKey] && vault[collectionKey].data) {
        console.info(`[PEDAIA Integrity] Recovered ${collectionKey} from safety vault.`);
        return vault[collectionKey].data;
      }
    } catch {}
    return null;
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
      if (!data) {
        const fromVault = this.recoverFromVault(STORAGE_KEYS.DESIGNS);
        return Array.isArray(fromVault) ? fromVault.filter(d => d && !String(d.id || '').startsWith('sample-')) : [];
      }
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        return list.filter(d => d && !String(d.id || '').startsWith('sample-'));
      }
      return [];
    } catch (e) {
      console.warn('Non-destructive recovery for saved designs:', e);
      const fromVault = this.recoverFromVault(STORAGE_KEYS.DESIGNS);
      return Array.isArray(fromVault) ? fromVault : [];
    }
  }

  getDesignById(id) {
    const list = this.getDesigns();
    return list.find(d => d.id === id) || null;
  }

  saveDesign(design) {
    const list = this.getDesigns();
    const cleanId = design.id || ('des-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));
    const existingIndex = list.findIndex(d => d.id === cleanId);
    const now = new Date().toISOString();

    const cleanDesign = {
      ...design,
      id: cleanId,
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
      list[existingIndex] = { ...list[existingIndex], ...cleanDesign };
    } else {
      list.unshift(cleanDesign);
    }

    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(list));
    this.recordVaultSnapshot(STORAGE_KEYS.DESIGNS, list);
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
      this.recordVaultSnapshot(STORAGE_KEYS.USER_PROFILES, allProfiles);

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
        const fromVault = this.recoverFromVault(STORAGE_KEYS.PROJECTS);
        return Array.isArray(fromVault) ? fromVault.filter(p => p && p.id !== 'proj-demo-1' && !p.isExample && !String(p.id || '').startsWith('proj-demo-')) : [];
      }
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        return list.filter(p => p && p.id !== 'proj-demo-1' && !p.isExample && !String(p.id || '').startsWith('proj-demo-'));
      }
      return [];
    } catch {
      const fromVault = this.recoverFromVault(STORAGE_KEYS.PROJECTS);
      return Array.isArray(fromVault) ? fromVault : [];
    }
  }

  saveProject(project) {
    const list = this.getProjects();
    const cleanProject = {
      ...project,
      id: project.id || 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      updatedAt: new Date().toISOString(),
      createdAt: project.createdAt || new Date().toISOString()
    };
    const idx = list.findIndex(p => p.id === cleanProject.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...cleanProject };
    } else {
      list.unshift(cleanProject);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
    this.recordVaultSnapshot(STORAGE_KEYS.PROJECTS, list);
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
      if (!data) return [];
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        return list.filter(c => c && c.id !== 'chk-1' && c.id !== 'chk-2');
      }
      return [];
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
    this.recordVaultSnapshot(STORAGE_KEYS.CHECKLISTS, list);
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
      if (!data) return [];
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        return list.filter(m => m && m.id !== 'cmap-1');
      }
      return [];
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
      if (!data) return [];
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        return list.filter(r => r && r.id !== 'refl-1');
      }
      return [];
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
      if (!data) return { weekTitle: 'Current Instructional Week', days: {} };
      const parsed = JSON.parse(data);
      if (parsed && parsed.days && parsed.days['Monday'] && parsed.days['Monday'][0]?.topic?.includes('Photosynthesis 5E Model')) {
        return { weekTitle: 'Current Instructional Week', days: {} };
      }
      return parsed || { weekTitle: 'Current Instructional Week', days: {} };
    } catch {
      return { weekTitle: 'Current Instructional Week', days: {} };
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
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CURRICULUM_MAPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULES, JSON.stringify({ weekTitle: 'Current Instructional Week', days: {} }));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_PROMPT_TEMPLATES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    this.notify('dataReset', null);
  }
}

export const store = new StateStore();
