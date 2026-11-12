// PEDAIA Central State Management with Multi-Tier Permanent Vault Persistence
import { INITIAL_SAVED_DESIGNS, INITIAL_PROMPT_TEMPLATES } from './sampleData.js';
import { applyThemeMode, getThemeMode, getResolvedTheme, THEME_MODES } from './palette.js';
import { hashPassword, verifyPassword, generateSalt } from './cryptoUtils.js';
import {
  ensurePersistentStorage,
  mirrorToVault,
  selfHealFromVault,
  exportPermanentBackupVault,
  restorePermanentBackupVault
} from './pedaiaVault.js';

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
  INTEGRITY_VAULT: 'pedaia_integrity_vault_v1',
  OUTPUTS: 'pedaia_ai_outputs_v1',
  AUTH_USERS: 'pedaia_auth_users_v1',
  AUTH_SESSION: 'pedaia_auth_session_v1',
  ADMIN_AUDIT: 'pedaia_admin_audit_v1'
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
  layoutMode: 'auto', // 'auto' | 'left' | 'compact' | 'centered'
  uiScale: 100, // 90 | 95 | 100 | 105
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

    // Permanent Data Vault Self-Healing: Restores any data touched by website updates
    selfHealFromVault(this, STORAGE_KEYS).catch(() => {});

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

    // Safety: ensure AI outputs store exists without disrupting educator outputs
    if (localStorage.getItem(STORAGE_KEYS.OUTPUTS) === null) {
      const fromVault = this.recoverFromVault(STORAGE_KEYS.OUTPUTS);
      localStorage.setItem(STORAGE_KEYS.OUTPUTS, JSON.stringify(Array.isArray(fromVault) ? fromVault : []));
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTPUTS) || '[]');
        if (Array.isArray(existing) && existing.length > 0) {
          this.recordVaultSnapshot(STORAGE_KEYS.OUTPUTS, existing);
        }
      } catch {}
    }

    // Ensure templates exist
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_PROMPT_TEMPLATES));
    }
    // Ensure settings exist
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }

    // Initialize Auth Store & Admin M1n1sume
    this.initAuthStore();
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

  // =========================================================================
  // --- Authentication, Multi-User, and Administrative Atelier Subsystem ---
  // =========================================================================

  initAuthStore() {
    if (typeof localStorage === 'undefined') return;
    try {
      const rawUsers = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
      let users = rawUsers ? JSON.parse(rawUsers) : null;
      if (!users || typeof users !== 'object' || Array.isArray(users)) {
        users = {};
      }

      // Seed Administrator M1n1sume if not yet existing
      if (!users['usr_m1n1sume']) {
        users['usr_m1n1sume'] = {
          id: 'usr_m1n1sume',
          username: 'M1n1sume',
          role: 'admin',
          passwordHash: null,
          salt: generateSalt(),
          isInitialized: false,
          createdAt: new Date().toISOString(),
          lastLogin: null
        };
        localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
        this.recordVaultSnapshot(STORAGE_KEYS.AUTH_USERS, users);
      }

      // Restore session if active
      const rawSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);
          if (session && session.userId && users[session.userId]) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, session.userId);
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Auth store init warning:', e);
    }
  }

  getAuthUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
      if (!raw) return {};
      const users = JSON.parse(raw);
      return (users && typeof users === 'object') ? users : {};
    } catch {
      return {};
    }
  }

  getAuthSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (!raw) return null;
      const session = JSON.parse(raw);
      return (session && session.userId) ? session : null;
    } catch {
      return null;
    }
  }

  getCurrentUser() {
    const session = this.getAuthSession();
    if (!session) return null;
    const users = this.getAuthUsers();
    const user = users[session.userId];
    return {
      userId: session.userId,
      username: session.username,
      role: session.role || 'educator',
      isInitialized: user ? user.isInitialized !== false : true,
      loginTime: session.loginTime
    };
  }

  isAuthenticated() {
    const session = this.getAuthSession();
    return Boolean(session && session.userId);
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return Boolean(user && (user.role === 'admin' || user.username?.toLowerCase() === 'm1n1sume'));
  }

  isM1n1sumeInitialized() {
    const users = this.getAuthUsers();
    const admin = users['usr_m1n1sume'];
    return Boolean(admin && admin.isInitialized && admin.passwordHash);
  }

  async setupAdminPassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Master password is required.');
    }
    const cleanPass = password.trim();
    if (cleanPass.length < 4) {
      throw new Error('Master administrator password must be at least 4 characters.');
    }

    const users = this.getAuthUsers();
    let admin = users['usr_m1n1sume'];
    if (!admin) {
      admin = {
        id: 'usr_m1n1sume',
        username: 'M1n1sume',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
    }

    const salt = generateSalt();
    const hash = await hashPassword(cleanPass, salt);
    admin.passwordHash = hash;
    admin.salt = salt;
    admin.isInitialized = true;
    admin.lastLogin = new Date().toISOString();
    users['usr_m1n1sume'] = admin;

    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
    this.recordVaultSnapshot(STORAGE_KEYS.AUTH_USERS, users);

    const session = {
      userId: admin.id,
      username: admin.username,
      role: 'admin',
      token: 'sess_' + Date.now(),
      loginTime: admin.lastLogin
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, admin.id);
    mirrorToVault('auth_users', users);
    mirrorToVault('auth_session', { key: 'current_session', ...session });

    this.recordAdminAudit('ADMIN_PASSWORD_INITIALIZED', { username: 'M1n1sume' });
    this.notify('sessionChanged', session);
    this.notify('userSwitched', { userId: admin.id, username: admin.username, role: 'admin' });
    return { success: true, user: admin, session };
  }

  async syncServerData(token) {
    if (!token) return;
    try {
      // 1. Sync Educator Profile non-destructively
      const profRes = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profRes.ok) {
        const pData = await profRes.json();
        const currentUid = this.getCurrentUserId();
        const allProfilesStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
        const allProfiles = allProfilesStr ? JSON.parse(allProfilesStr) : {};
        const localProfile = allProfiles[currentUid] || {};

        const hasLocalData = Object.values(localProfile).some(v => v && typeof v === 'string' && v.trim().length > 0);
        const hasServerData = pData.profile && Object.values(pData.profile).some(v => v && typeof v === 'string' && v.trim().length > 0);

        let resolvedProfile = pData.profile || {};
        if (hasLocalData && !hasServerData) {
          resolvedProfile = localProfile;
          // Re-hydrate server profile
          fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(localProfile)
          }).catch(() => {});
        } else if (pData.profile) {
          resolvedProfile = { ...localProfile, ...pData.profile };
        }
        allProfiles[currentUid] = resolvedProfile;
        localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(allProfiles));
        this.recordVaultSnapshot(STORAGE_KEYS.USER_PROFILES, allProfiles);
        mirrorToVault('user_profiles', allProfiles);
        this.notify('profileUpdated', resolvedProfile);
      }

      // 2. Sync Designs non-destructively (never wipe local designs!)
      const desRes = await fetch('/api/designs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (desRes.ok) {
        const dData = await desRes.json();
        const activeUid = this.getCurrentUserId();
        const localDesigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS) || '[]');
        
        const designMap = new Map();
        for (const d of localDesigns) {
          if (d && d.id) designMap.set(d.id, d);
        }

        const missingOnServer = [];
        if (Array.isArray(dData.designs)) {
          for (const sd of dData.designs) {
            if (sd && sd.id) {
              const existing = designMap.get(sd.id);
              if (!existing) {
                designMap.set(sd.id, sd);
              } else {
                const serverTime = new Date(sd.updatedAt || 0).getTime();
                const localTime = new Date(existing.updatedAt || 0).getTime();
                if (serverTime >= localTime) {
                  designMap.set(sd.id, { ...existing, ...sd });
                }
              }
            }
          }
          for (const d of localDesigns) {
            if (d && d.id && (d.userId === activeUid || !d.userId)) {
              if (!dData.designs.some(sd => sd.id === d.id)) {
                missingOnServer.push(d);
              }
            }
          }
        }

        const combined = Array.from(designMap.values());
        localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(combined));
        this.recordVaultSnapshot(STORAGE_KEYS.DESIGNS, combined);
        mirrorToVault('designs', combined);
        this.notify('designsUpdated', { list: this.getDesigns() });

        // Auto-rehydrate server with missing local designs if server was reset
        if (missingOnServer.length > 0 && token) {
          for (const d of missingOnServer) {
            fetch('/api/designs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(d)
            }).catch(() => {});
          }
        }
      }

      // 3. Sync AI Outputs non-destructively (never wipe local outputs!)
      const outRes = await fetch('/api/outputs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (outRes.ok) {
        const oData = await outRes.json();
        const activeUid = this.getCurrentUserId();
        const localOutputs = JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTPUTS) || '[]');
        
        const outputMap = new Map();
        for (const o of localOutputs) {
          if (o && o.id) outputMap.set(o.id, o);
        }

        const missingOutputsOnServer = [];
        if (Array.isArray(oData.outputs)) {
          for (const so of oData.outputs) {
            if (so && so.id) {
              const existing = outputMap.get(so.id);
              if (!existing) {
                outputMap.set(so.id, so);
              } else {
                const serverTime = new Date(so.updatedAt || 0).getTime();
                const localTime = new Date(existing.updatedAt || 0).getTime();
                if (serverTime >= localTime) {
                  outputMap.set(so.id, { ...existing, ...so });
                }
              }
            }
          }
          for (const o of localOutputs) {
            if (o && o.id && (o.userId === activeUid || !o.userId)) {
              if (!oData.outputs.some(so => so.id === o.id)) {
                missingOutputsOnServer.push(o);
              }
            }
          }
        }

        const combinedOutputs = Array.from(outputMap.values());
        localStorage.setItem(STORAGE_KEYS.OUTPUTS, JSON.stringify(combinedOutputs));
        this.recordVaultSnapshot(STORAGE_KEYS.OUTPUTS, combinedOutputs);
        mirrorToVault('outputs', combinedOutputs);
        this.notify('outputsUpdated', { list: this.getOutputs() });

        // Auto-rehydrate server with missing local outputs if server was reset
        if (missingOutputsOnServer.length > 0 && token) {
          for (const o of missingOutputsOnServer) {
            fetch('/api/outputs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(o)
            }).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.warn('[PEDAIA State] Background sync completed with notice:', e.message);
    }
  }

  async registerUser(arg1, arg2, arg3, arg4) {
    let options;
    if (typeof arg1 === 'object' && arg1 !== null) {
      options = arg1;
    } else {
      options = { username: arg1, password: arg2, email: arg3, confirmPassword: arg4 || arg2 };
    }
    const { username, email = '', password, confirmPassword = password } = options;

    if (!username || typeof username !== 'string') {
      throw new Error('Username is required.');
    }
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      throw new Error('Username must be between 3 and 30 characters.');
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      throw new Error('Username may only contain letters, numbers, underscores, hyphens, and periods.');
    }

    // Reserved administrator username cannot be registered via standard registration
    if (cleanUsername.toLowerCase() === 'm1n1sume') {
      throw new Error('The username "M1n1sume" is reserved for the designated administrator. Please log in using the Log In form.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      throw new Error('Password and Confirm Password do not match.');
    }

    // Attempt backend server registration
    let serverRes = null;
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, email, password, confirmPassword })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Registration failed.');
      }
      serverRes = data;
    } catch (apiErr) {
      if (apiErr.message && !apiErr.message.includes('fetch') && !apiErr.message.includes('Failed to fetch')) {
        throw apiErr;
      }
      console.warn('[PEDAIA State] Backend register unreachable, using local storage:', apiErr.message);
    }

    const userId = serverRes?.user?.id || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
    const token = serverRes?.token || ('sess_' + Date.now());
    const role = serverRes?.user?.role || 'educator';

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    const newUser = {
      id: userId,
      username: cleanUsername,
      email: email ? email.trim().toLowerCase() : '',
      role,
      passwordHash: hash,
      salt,
      isInitialized: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const users = this.getAuthUsers();
    users[newUser.id] = newUser;
    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
    this.recordVaultSnapshot(STORAGE_KEYS.AUTH_USERS, users);

    // Initialize Educator Profile: STRICTLY 100% BLANK for new users!
    const newProfile = { ...BLANK_EDUCATOR_PROFILE };
    this.saveEducatorProfile(newProfile, newUser.id);

    const session = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      token,
      loginTime: newUser.lastLogin
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, newUser.id);
    mirrorToVault('auth_users', users);
    mirrorToVault('auth_session', { key: 'current_session', ...session });

    this.recordAdminAudit('USER_REGISTERED', { userId: newUser.id, username: newUser.username });
    this.notify('sessionChanged', session);
    this.notify('userSwitched', { userId: newUser.id, username: newUser.username, role: newUser.role });
    return { success: true, user: newUser, session };
  }

  async loginUser(arg1, arg2) {
    let options;
    if (typeof arg1 === 'object' && arg1 !== null) {
      options = arg1;
    } else {
      options = { identifier: arg1, password: arg2 };
    }
    const { identifier, username, password, isFirstTimeAdmin, masterPassword, confirmMasterPassword } = options;
    const cleanId = (identifier || username || '').trim();

    if (!cleanId) {
      throw new Error('Username or email is required.');
    }

    // Try backend authentication first
    let serverRes = null;
    let backendAuthError = null;
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          password,
          isFirstTimeAdmin,
          masterPassword,
          confirmMasterPassword
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        backendAuthError = data.message || 'Authentication failed.';
      } else {
        serverRes = data;
      }
    } catch (apiErr) {
      backendAuthError = apiErr.message;
      console.warn('[PEDAIA State] Backend login unreachable, checking local vault verification:', apiErr.message);
    }

    if (serverRes) {
      if (serverRes.requiresMasterPasswordSetup) {
        return {
          success: false,
          requiresMasterPasswordSetup: true,
          username: serverRes.username || 'M1n1sume',
          message: serverRes.message
        };
      }

      const session = {
        userId: serverRes.user.id,
        username: serverRes.user.username,
        email: serverRes.user.email || '',
        role: serverRes.user.role || 'educator',
        token: serverRes.token,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, serverRes.user.id);

      // Cache user locally and mirror to permanent vault
      const users = this.getAuthUsers();
      users[serverRes.user.id] = {
        id: serverRes.user.id,
        username: serverRes.user.username,
        email: serverRes.user.email || '',
        role: serverRes.user.role,
        isInitialized: true,
        lastLogin: session.loginTime
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
      mirrorToVault('auth_users', users);
      mirrorToVault('auth_session', { key: 'current_session', ...session });

      // Fetch educator profile and designs from server in background
      this.syncServerData(serverRes.token);

      this.recordAdminAudit('USER_LOGGED_IN', { userId: serverRes.user.id, username: serverRes.user.username });
      this.notify('sessionChanged', session);
      this.notify('userSwitched', { userId: serverRes.user.id, username: serverRes.user.username, role: session.role });
      return { success: true, user: serverRes.user, session };
    }

    // Local fallback for offline/isolated usage or post-deploy server container resets
    const users = this.getAuthUsers();
    const user = Object.values(users).find(u => 
      u && (
        (u.username && u.username.toLowerCase() === cleanId.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
      )
    );

    if (!user) {
      throw new Error(backendAuthError || `Account "${cleanId}" not found. Please verify your credentials or create an account.`);
    }

    // Special check for M1n1sume first-time initialization
    if (user.username.toLowerCase() === 'm1n1sume' && (!user.isInitialized || !user.passwordHash)) {
      if (isFirstTimeAdmin) {
        return await this.setupAdminPassword(masterPassword || password);
      }
      return {
        success: false,
        requiresMasterPasswordSetup: true,
        username: user.username,
        message: 'Welcome M1n1sume. Please create your master administrator password to initialize your account.'
      };
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Incorrect password. Please try again.');
    }

    user.lastLogin = new Date().toISOString();
    users[user.id] = user;
    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));

    const session = {
      userId: user.id,
      username: user.username,
      email: user.email || '',
      role: user.role || 'educator',
      token: 'sess_' + Date.now(),
      loginTime: user.lastLogin
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, user.id);

    // Auto-rehydrate server with user account if server was reset after website update
    try {
      const rehResp = await fetch('/api/vault/rehydrate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          profile: this.getEducatorProfile(user.id)
        })
      });
      if (rehResp.ok) {
        const rehData = await rehResp.json();
        if (rehData.token) {
          session.token = rehData.token;
          localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
        }
      }
    } catch (rehErr) {
      console.warn('[PEDAIA Vault] Server rehydration notice:', rehErr.message);
    }

    mirrorToVault('auth_users', users);
    mirrorToVault('auth_session', { key: 'current_session', ...session });

    // Sync any designs and outputs back to server
    if (session.token && !session.token.startsWith('sess_')) {
      this.syncServerData(session.token);
    }

    this.recordAdminAudit('USER_LOGGED_IN', { userId: user.id, username: user.username });
    this.notify('sessionChanged', session);
    this.notify('userSwitched', { userId: user.id, username: user.username, role: session.role });
    return { success: true, user, session };
  }

  logoutUser() {
    const session = this.getAuthSession();
    const prevUsername = session?.username;
    if (session && session.token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.token}` }
      }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, 'usr_guest');

    this.recordAdminAudit('USER_LOGGED_OUT', { username: prevUsername });
    this.notify('sessionChanged', null);
    this.notify('userSwitched', { userId: 'usr_guest', username: 'Guest' });
    return { success: true };
  }

  async changePassword({ oldPassword, newPassword }) {
    const session = this.getAuthSession();
    if (!session || !session.userId) {
      throw new Error('You must be signed in to change your password.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    // Call backend API if session token is available
    if (session.token) {
      try {
        const resp = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify({ oldPassword, newPassword })
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.message || 'Failed to update password.');
        }
      } catch (err) {
        if (err.message && !err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
          throw err;
        }
        console.warn('[PEDAIA Auth] Change password API unreachable, falling back to local vault:', err.message);
      }
    }

    const users = this.getAuthUsers();
    const user = users[session.userId];
    if (user && user.passwordHash && user.salt) {
      const isValid = await verifyPassword(oldPassword, user.passwordHash, user.salt);
      if (!isValid && !session.token) {
        throw new Error('Current password does not match.');
      }
      const newSalt = generateSalt();
      const newHash = await hashPassword(newPassword, newSalt);
      user.salt = newSalt;
      user.passwordHash = newHash;
      users[user.id] = user;
      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
      this.recordVaultSnapshot(STORAGE_KEYS.AUTH_USERS, users);
    }

    this.recordAdminAudit('PASSWORD_CHANGED', { userId: session.userId, username: session.username });
    return { success: true };
  }

  recordAdminAudit(action, details = {}) {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_AUDIT);
      const audit = raw ? JSON.parse(raw) : [];
      audit.unshift({
        id: 'aud-' + Date.now(),
        action,
        details,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUDIT, JSON.stringify(audit.slice(0, 50)));
    } catch {}
  }

  getAdminAuditLogs() {
    if (!this.isAdmin()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_AUDIT);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getAllUsersForAdmin() {
    if (!this.isAdmin()) return [];
    const users = this.getAuthUsers();
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILES) || '{}');
    const allDesigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS) || '[]');
    const allOutputs = JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTPUTS) || '[]');

    return Object.values(users).map(u => {
      const p = profiles[u.id] || {};
      const userDesigns = allDesigns.filter(d => d.userId === u.id);
      const userOutputs = allOutputs.filter(o => o.userId === u.id);
      return {
        id: u.id,
        username: u.username,
        role: u.role || 'educator',
        isInitialized: u.isInitialized !== false,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        profileName: p.name || '',
        institution: p.institution || '',
        designsCount: userDesigns.length,
        outputsCount: userOutputs.length
      };
    });
  }

  async fetchAdminActivity({ type = 'ALL', search = '', limit = 100, offset = 0 } = {}) {
    const session = this.getAuthSession();
    if (!session || !session.token || !this.isAdmin()) {
      return { logs: this.getAdminAuditLogs(), total: 0, stats: { totalVisits: 0, uniqueVisitors: 0, totalLogins: 0, totalOutputs: 0, totalEmails: 0 } };
    }

    try {
      const q = new URLSearchParams({ type, search, limit: String(limit), offset: String(offset) });
      const resp = await fetch(`/api/admin/activity?${q.toString()}`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch admin telemetry');
      return await resp.json();
    } catch (e) {
      console.warn('[PEDAIA Telemetry] Using local audit fallback:', e.message);
      return { logs: this.getAdminAuditLogs(), total: 0, stats: { totalVisits: 0, uniqueVisitors: 0, totalLogins: 0, totalOutputs: 0, totalEmails: 0 } };
    }
  }

  async clearAdminActivity() {
    const session = this.getAuthSession();
    if (!session || !session.token || !this.isAdmin()) return false;
    try {
      const resp = await fetch('/api/admin/activity/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  async sendProjectEmailUpdate(designId, { eventType = 'PROJECT_UPDATE', recipient = null, details = {} } = {}) {
    const session = this.getAuthSession();
    if (!session || !session.token) {
      throw new Error('Please sign in to send project email updates.');
    }

    const resp = await fetch(`/api/projects/${designId}/notify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`
      },
      body: JSON.stringify({ eventType, recipient, details })
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.message || 'Failed to dispatch email update.');
    }
    return data;
  }

  async getProjectEmailHistory(designId) {
    const session = this.getAuthSession();
    if (!session || !session.token) return [];
    try {
      const resp = await fetch(`/api/projects/${designId}/notifications`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      const data = await resp.json();
      return data.notifications || [];
    } catch {
      return [];
    }
  }

  async saveProjectNotificationSettings(designId, settings) {
    const session = this.getAuthSession();
    if (!session || !session.token) {
      const design = this.getDesignById(designId);
      if (design) {
        design.notificationEmail = settings.notificationEmail;
        design.emailNotifications = settings;
        this.saveDesign(design);
      }
      return design;
    }

    const resp = await fetch(`/api/projects/${designId}/notification-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`
      },
      body: JSON.stringify(settings)
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Failed to save settings.');
    return data.design;
  }

  // --- Designs ---
  getDesigns() {
    const activeUid = this.getCurrentUserId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DESIGNS);
      let list = [];
      if (!data) {
        const fromVault = this.recoverFromVault(STORAGE_KEYS.DESIGNS);
        list = Array.isArray(fromVault) ? fromVault.filter(d => d && !String(d.id || '').startsWith('sample-')) : [];
      } else {
        const parsed = JSON.parse(data);
        list = Array.isArray(parsed) ? parsed.filter(d => d && !String(d.id || '').startsWith('sample-')) : [];
      }
      return list.filter(d => !d.userId || d.userId === activeUid);
    } catch (e) {
      console.warn('Non-destructive recovery for saved designs:', e);
      const fromVault = this.recoverFromVault(STORAGE_KEYS.DESIGNS);
      return Array.isArray(fromVault) ? fromVault.filter(d => !d.userId || d.userId === activeUid) : [];
    }
  }

  getDesignById(id) {
    if (!id) return null;
    const activeUid = this.getCurrentUserId();
    const isAdmin = this.isAdmin();

    let allList = [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DESIGNS);
      if (data) {
        allList = JSON.parse(data);
      }
      if (!Array.isArray(allList) || allList.length === 0) {
        const fromVault = this.recoverFromVault(STORAGE_KEYS.DESIGNS);
        allList = Array.isArray(fromVault) ? fromVault : [];
      }
    } catch {
      const fromVault = this.recoverFromVault(STORAGE_KEYS.DESIGNS);
      allList = Array.isArray(fromVault) ? fromVault : [];
    }

    const design = allList.find(d => d && d.id === id);
    if (!design) return null;

    const isOwner = !design.userId || design.userId === activeUid;
    const isCompleted = design.status === 'Completed';
    const isPublic = design.visibility === 'public' || design.isPublic === true;

    // Access evaluation for non-owners and non-admins:
    if (!isOwner && !isAdmin) {
      // 1. If still Work In Progress (not Completed), locked!
      if (!isCompleted) {
        return {
          ...design,
          isLockedToViewer: true,
          lockReason: 'PROJECT_LOCKED_WIP',
          output: '', // Blank out secret WIP content from unauthorized viewer
          rawPrompt: ''
        };
      }
      // 2. If Completed but Private, locked!
      if (!isPublic) {
        return {
          ...design,
          isLockedToViewer: true,
          lockReason: 'PROJECT_PRIVATE',
          output: '', // Blank out confidential private content
          rawPrompt: ''
        };
      }
    }

    return {
      ...design,
      isLockedToViewer: false,
      visibility: isPublic ? 'public' : 'private',
      isPublic
    };
  }

  getCompletedDesigns() {
    let allList = [];
    const activeUid = this.getCurrentUserId();
    const isAdmin = this.isAdmin();
    try {
      allList = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS) || '[]');
      if (!Array.isArray(allList)) allList = [];
    } catch {
      allList = [];
    }
    return allList.filter(d => d && d.status === 'Completed' && (d.visibility === 'public' || d.isPublic || d.userId === activeUid || isAdmin));
  }

  isProjectLockedToOthers(design) {
    if (!design) return false;
    const isCompleted = design.status === 'Completed';
    const isPublic = design.visibility === 'public' || design.isPublic === true;
    return !isCompleted || !isPublic;
  }

  setDesignStatus(id, newStatus) {
    return this.updateDesign(id, { status: newStatus });
  }

  setDesignVisibility(id, visibility) {
    const isPub = visibility === 'public';
    return this.updateDesign(id, { visibility: isPub ? 'public' : 'private', isPublic: isPub });
  }

  toggleDesignVisibility(id) {
    const design = this.getDesignById(id);
    if (!design) return null;
    const currentVis = design.visibility || (design.isPublic ? 'public' : 'private');
    const newVis = currentVis === 'public' ? 'private' : 'public';
    return this.setDesignVisibility(id, newVis);
  }

  isProjectPrivate(design) {
    if (!design) return true;
    return design.visibility !== 'public' && !design.isPublic;
  }

  saveDesign(design) {
    const activeUid = this.getCurrentUserId();
    let allList = [];
    try {
      allList = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS) || '[]');
      if (!Array.isArray(allList)) allList = [];
    } catch {
      allList = [];
    }

    const cleanId = design.id || ('des-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));
    const existingIndex = allList.findIndex(d => d.id === cleanId);
    const now = new Date().toISOString();

    const visibility = design.visibility !== undefined
      ? design.visibility
      : (design.isPublic !== undefined ? (design.isPublic ? 'public' : 'private') : 'private');
    const isPublic = visibility === 'public';

    const cleanDesign = {
      ...design,
      id: cleanId,
      userId: design.userId || activeUid,
      visibility,
      isPublic,
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
      allList[existingIndex] = { ...allList[existingIndex], ...cleanDesign };
    } else {
      allList.unshift(cleanDesign);
    }

    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(allList));
    this.recordVaultSnapshot(STORAGE_KEYS.DESIGNS, allList);
    mirrorToVault('designs', allList);
    this.notify('designsUpdated', { list: this.getDesigns(), activeId: cleanDesign.id });

    // Sync to backend server if session exists
    const session = this.getAuthSession();
    if (session && session.token) {
      fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(cleanDesign)
      }).catch(e => console.warn('[State] Server design sync notice:', e.message));
    }

    return cleanDesign;
  }

  updateDesign(id, updates) {
    let allList = [];
    try {
      allList = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS) || '[]');
      if (!Array.isArray(allList)) allList = [];
    } catch {
      allList = [];
    }
    const index = allList.findIndex(d => d.id === id);
    if (index === -1) return null;

    const current = allList[index];
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

    let visibility = current.visibility || (current.isPublic ? 'public' : 'private');
    if (updates.visibility !== undefined) {
      visibility = updates.visibility;
    } else if (updates.isPublic !== undefined) {
      visibility = updates.isPublic ? 'public' : 'private';
    }
    const isPublic = visibility === 'public';

    const updated = {
      ...current,
      ...updates,
      visibility,
      isPublic,
      versionHistory,
      updatedAt: now
    };

    allList[index] = updated;
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(allList));
    this.recordVaultSnapshot(STORAGE_KEYS.DESIGNS, allList);
    this.notify('designsUpdated', { list: this.getDesigns(), updatedId: id });

    // Sync updated design to server if session exists
    const session = this.getAuthSession();
    if (session && session.token) {
      fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(updated)
      }).catch(e => console.warn('[State] Server design update sync notice:', e.message));
    }

    return updated;
  }

  deleteDesign(id) {
    let allList = [];
    try {
      allList = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS) || '[]');
      if (!Array.isArray(allList)) allList = [];
    } catch {
      allList = [];
    }
    allList = allList.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(allList));
    this.recordVaultSnapshot(STORAGE_KEYS.DESIGNS, allList);
    this.notify('designsUpdated', { list: this.getDesigns(), deletedId: id });

    // Sync deletion to server
    const session = this.getAuthSession();
    if (session && session.token) {
      fetch(`/api/designs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.token}` }
      }).catch(e => console.warn('[State] Server design delete notice:', e.message));
    }

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

  // --- Public Shared Links Integration ---
  async shareItem(item, type = 'design') {
    if (!item || !item.id) return null;
    const cleanId = String(item.id).trim();

    // Mark locally as shared
    if (type === 'design') {
      this.updateDesign(cleanId, { isShared: true, sharedAt: new Date().toISOString() });
    } else if (type === 'output') {
      const out = this.getOutputById(cleanId);
      if (out) {
        this.saveOutput({ ...out, isShared: true, sharedAt: new Date().toISOString() });
      }
    }

    const currentAuthor = this.getCurrentUser()?.username || 'PEDAIA Educator';

    // Broadcast to server if online
    try {
      await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          type,
          authorName: currentAuthor
        })
      });
    } catch (err) {
      console.warn('[PEDAIA] Offline link share registration:', err);
    }

    const origin = window.location.origin;
    const pathname = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    return {
      shareId: cleanId,
      url: `${origin}${pathname}#share/${cleanId}`,
      presentationUrl: `${origin}${pathname}#share/${cleanId}?mode=presentation`,
      embedUrl: `${origin}${pathname}#share/${cleanId}?mode=embed`
    };
  }

  async fetchSharedItem(id) {
    if (!id) return null;
    const cleanId = String(id).trim();

    // 1. Check local designs
    const localDesign = this.getDesignById(cleanId);
    if (localDesign) {
      return {
        id: localDesign.id,
        type: 'design',
        title: localDesign.title,
        subject: localDesign.subject,
        gradeLevel: localDesign.gradeLevel || localDesign.educationalLevel,
        category: localDesign.categoryLabel || localDesign.category || 'Instructional Design',
        authorName: localDesign.authorName || 'PEDAIA Educator',
        item: localDesign
      };
    }

    // 2. Check local outputs
    const localOutput = this.getOutputById(cleanId);
    if (localOutput) {
      return {
        id: localOutput.id,
        type: 'output',
        title: localOutput.title || localOutput.topic,
        subject: localOutput.subject,
        gradeLevel: localOutput.gradeLevel || localOutput.educationalLevel,
        category: localOutput.category || localOutput.outputType || 'Learning Resource',
        authorName: localOutput.authorName || 'PEDAIA Educator',
        item: localOutput
      };
    }

    // 3. Fetch from Server
    try {
      const res = await fetch(`/api/share/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.share) {
          return data.share;
        }
      }
    } catch (err) {
      console.warn('[PEDAIA] Failed to fetch shared item from server:', err);
    }

    return null;
  }

  importSharedItemToStudio(sharedItem, type = 'design') {
    if (!sharedItem) return null;
    const currentUid = this.getCurrentUserId();
    const now = new Date().toISOString();

    if (type === 'design' || (!type && !String(sharedItem.id).startsWith('out-'))) {
      const newId = 'des_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const clonedDesign = {
        ...sharedItem,
        id: newId,
        userId: currentUid,
        title: sharedItem.title ? (sharedItem.title.includes('(Copy)') ? sharedItem.title : `${sharedItem.title} (Imported)`) : 'Imported Instructional Design',
        status: 'Output Generated',
        visibility: 'private',
        isPublic: false,
        createdAt: now,
        updatedAt: now,
        importedFrom: sharedItem.id,
        versionHistory: [
          {
            timestamp: now,
            output: sharedItem.output || '',
            note: `Imported from shared link (${sharedItem.authorName || 'Educator'})`
          }
        ]
      };
      return this.saveDesign(clonedDesign);
    } else {
      const newId = 'out-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const clonedOutput = {
        ...sharedItem,
        id: newId,
        userId: currentUid,
        title: sharedItem.title ? `${sharedItem.title} (Imported)` : 'Imported Learning Resource',
        createdAt: now,
        updatedAt: now,
        importedFrom: sharedItem.id
      };
      return this.saveOutput(clonedOutput);
    }
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
      const session = this.getAuthSession();
      if (session && session.userId) {
        return session.userId;
      }
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
      mirrorToVault('user_profiles', allProfiles);

      // Synchronize with settings for backward compatibility ONLY if targetUid is active user
      if (targetUid === this.getCurrentUserId()) {
        const currentSettings = this.getSettings();
        currentSettings.educatorProfile = cleanProfile;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(currentSettings));
        this.notify('settingsUpdated', currentSettings);
      }

      this.notify('profileUpdated', cleanProfile);

      // Sync to backend server
      const session = this.getAuthSession();
      if (session && session.token && targetUid === session.userId) {
        fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify(cleanProfile)
        }).catch(e => console.warn('[State] Server profile sync notice:', e.message));
      }

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

  // --- Device Layout & Screen Fit System ---
  getLayoutMode() {
    const s = this.getSettings();
    return s.layoutMode || 'auto';
  }

  setLayoutMode(mode) {
    const validModes = ['auto', 'left', 'compact', 'centered'];
    const cleanMode = validModes.includes(mode) ? mode : 'auto';
    this.updateSettings({ layoutMode: cleanMode });
    this.notify('layoutChanged', { mode: cleanMode, scale: this.getUiScale() });
    return cleanMode;
  }

  getUiScale() {
    const s = this.getSettings();
    return s.uiScale !== undefined ? Number(s.uiScale) : 100;
  }

  setUiScale(scale) {
    const num = [90, 95, 100, 105].includes(Number(scale)) ? Number(scale) : 100;
    this.updateSettings({ uiScale: num });
    this.notify('layoutChanged', { mode: this.getLayoutMode(), scale: num });
    return num;
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

  // --- Dedicated AI Output Studio Outputs & Materials ---
  getOutputs() {
    const activeUid = this.getCurrentUserId();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OUTPUTS);
      let list = [];
      if (!data) {
        const fromVault = this.recoverFromVault(STORAGE_KEYS.OUTPUTS);
        list = Array.isArray(fromVault) ? fromVault : [];
      } else {
        const parsed = JSON.parse(data);
        list = Array.isArray(parsed) ? parsed : [];
      }
      return list.filter(o => !o.userId || o.userId === activeUid);
    } catch {
      const fromVault = this.recoverFromVault(STORAGE_KEYS.OUTPUTS);
      return Array.isArray(fromVault) ? fromVault.filter(o => !o.userId || o.userId === activeUid) : [];
    }
  }

  getOutputById(id) {
    const list = this.getOutputs();
    return list.find(o => o.id === id) || null;
  }

  saveOutput(output) {
    const activeUid = this.getCurrentUserId();
    let allList = [];
    try {
      allList = JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTPUTS) || '[]');
      if (!Array.isArray(allList)) allList = [];
    } catch {
      allList = [];
    }

    const cleanId = output.id || ('out-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));
    const now = new Date().toISOString();
    const cleanOutput = {
      ...output,
      id: cleanId,
      userId: output.userId || activeUid,
      updatedAt: now,
      createdAt: output.createdAt || now
    };
    const idx = allList.findIndex(o => o.id === cleanId);
    if (idx >= 0) {
      allList[idx] = { ...allList[idx], ...cleanOutput };
    } else {
      allList.unshift(cleanOutput);
    }
    localStorage.setItem(STORAGE_KEYS.OUTPUTS, JSON.stringify(allList));
    this.recordVaultSnapshot(STORAGE_KEYS.OUTPUTS, allList);
    mirrorToVault('outputs', allList);
    this.recordMaterialGenerated();
    this.notify('outputsUpdated', { list: this.getOutputs(), activeId: cleanOutput.id });

    // Sync to backend server
    const session = this.getAuthSession();
    if (session && session.token) {
      fetch('/api/outputs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(cleanOutput)
      }).catch(e => console.warn('[State] Server output sync notice:', e.message));
    }

    return cleanOutput;
  }

  deleteOutput(id) {
    let allList = [];
    try {
      allList = JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTPUTS) || '[]');
      if (!Array.isArray(allList)) allList = [];
    } catch {
      allList = [];
    }
    allList = allList.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.OUTPUTS, JSON.stringify(allList));
    this.recordVaultSnapshot(STORAGE_KEYS.OUTPUTS, allList);
    mirrorToVault('outputs', allList);
    this.notify('outputsUpdated', { list: this.getOutputs() });

    // Sync deletion to server
    const session = this.getAuthSession();
    if (session && session.token) {
      fetch(`/api/outputs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.token}` }
      }).catch(e => console.warn('[State] Server output delete notice:', e.message));
    }
  }

  duplicateOutput(id) {
    const original = this.getOutputById(id);
    if (!original) return null;
    const copy = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.saveOutput(copy);
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

  // --- Permanent Data Vault: Full Export & Restore ---
  exportAllData() {
    return exportPermanentBackupVault(this);
  }

  async importAllData(jsonStrOrFile) {
    try {
      const res = await restorePermanentBackupVault(this, jsonStrOrFile, STORAGE_KEYS);
      this.notify('dataImported', res);
      return res;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.OUTPUTS, JSON.stringify([]));
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
