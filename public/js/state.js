// PEDAIA Central State Management with LocalStorage Persistence
import { INITIAL_SAVED_DESIGNS, INITIAL_PROMPT_TEMPLATES } from './sampleData.js';
import { applyThemeMode, getThemeMode, getResolvedTheme, THEME_MODES } from './palette.js';

const STORAGE_KEYS = {
  DESIGNS: 'pedaia_saved_designs_v1',
  TEMPLATES: 'pedaia_prompt_templates_v1',
  SETTINGS: 'pedaia_settings_v1',
  ACTIVE_BUILDER_STATE: 'pedaia_active_builder_state_v1'
};

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
  educatorProfile: {
    name: 'Dr. Maria Santos',
    institution: 'College of Teacher Education',
    defaultSubject: 'Science',
    defaultLevel: 'Junior High School',
    defaultModality: 'Face-to-Face'
  }
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
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
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

  // --- Unified Brand System (Legacy Palette Compatibility) ---
  getColorPalette() {
    return 'default';
  }

  setColorPalette() {
    return 'default';
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
