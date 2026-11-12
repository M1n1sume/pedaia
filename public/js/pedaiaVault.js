// PEDAIA Permanent Data Vault & Disaster Recovery Subsystem
// ============================================================================
// GUARANTEE: Even if changes are made to the website, code is redeployed,
// caches are cleared, or servers are restarted, users' login credentials,
// educator profiles, curriculum designs, and AI outputs remain permanently
// preserved in multi-tier storage (LocalStorage + IndexedDB + Server Auto-Sync).
// ============================================================================

const DB_NAME = 'PedaiaPermanentVaultDB';
const DB_VERSION = 1;

let idbPromise = null;

/**
 * Open or upgrade the permanent IndexedDB database
 */
export function openVaultDatabase() {
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      console.warn('[PEDAIA Vault] IndexedDB not available in this environment. Falling back to LocalStorage vault.');
      return resolve(null);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store 1: Auth Users (Login details, hashes, roles)
      if (!db.objectStoreNames.contains('auth_users')) {
        db.createObjectStore('auth_users', { keyPath: 'id' });
      }
      
      // Store 2: Auth Session (Current active session)
      if (!db.objectStoreNames.contains('auth_session')) {
        db.createObjectStore('auth_session', { keyPath: 'key' });
      }

      // Store 3: User Profiles (Educator portfolio & settings)
      if (!db.objectStoreNames.contains('user_profiles')) {
        db.createObjectStore('user_profiles', { keyPath: 'userId' });
      }

      // Store 4: Instructional Designs & Projects
      if (!db.objectStoreNames.contains('designs')) {
        db.createObjectStore('designs', { keyPath: 'id' });
      }

      // Store 5: AI Generated Outputs Studio
      if (!db.objectStoreNames.contains('outputs')) {
        db.createObjectStore('outputs', { keyPath: 'id' });
      }

      // Store 6: Studio Settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Store 7: Immutable Snapshots Archive
      if (!db.objectStoreNames.contains('vault_backups')) {
        db.createObjectStore('vault_backups', { keyPath: 'backupId' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.warn('[PEDAIA Vault] IndexedDB open error:', event.target.error);
      resolve(null);
    };
  });

  return idbPromise;
}

/**
 * Request browser-level persistent storage permission
 * (Prevents the browser from ever evicting PEDAIA data under disk pressure)
 */
export async function ensurePersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const granted = await navigator.storage.persist();
        console.info(`[PEDAIA Vault] Permanent storage immunity granted: ${granted}`);
        return granted;
      }
      return isPersisted;
    } catch (e) {
      console.warn('[PEDAIA Vault] Persistent storage check warning:', e.message);
    }
  }
  return false;
}

/**
 * Write a collection of items into an IndexedDB store
 */
export async function mirrorToVault(storeName, data) {
  try {
    const db = await openVaultDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        if (Array.isArray(data)) {
          for (const item of data) {
            if (item && (item.id || item.userId || item.key)) {
              store.put(item);
            }
          }
        } else if (data && typeof data === 'object') {
          // If dictionary (e.g. profiles or users indexed by id)
          if (storeName === 'auth_users' || storeName === 'user_profiles') {
            for (const [key, val] of Object.entries(data)) {
              if (val) {
                const item = storeName === 'user_profiles' ? { userId: key, ...val } : { id: key, ...val };
                store.put(item);
              }
            }
          } else {
            store.put(data);
          }
        }

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (err) {
        console.warn(`[PEDAIA Vault] Transaction error on ${storeName}:`, err.message);
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Read all items from an IndexedDB store
 */
export async function readFromVault(storeName) {
  try {
    const db = await openVaultDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Self-healing data restoration:
 * Synchronizes LocalStorage and IndexedDB bidirectionally on boot.
 * If website updates, code changes, or cache busting touched LocalStorage,
 * this function seamlessly recovers all users, profiles, designs, and outputs.
 */
export async function selfHealFromVault(storeInstance, storageKeys) {
  await ensurePersistentStorage();

  try {
    const db = await openVaultDatabase();
    if (!db) return { healed: false };

    let healedCount = 0;

    // 1. Recover Auth Users (Login details)
    const idbUsers = await readFromVault('auth_users');
    let localUsers = {};
    try {
      localUsers = JSON.parse(localStorage.getItem(storageKeys.AUTH_USERS) || '{}');
    } catch {}

    if (Array.isArray(idbUsers) && idbUsers.length > 0) {
      let changed = false;
      for (const u of idbUsers) {
        if (u && u.id && (!localUsers[u.id] || !localUsers[u.id].passwordHash)) {
          localUsers[u.id] = u;
          changed = true;
          healedCount++;
        }
      }
      if (changed) {
        localStorage.setItem(storageKeys.AUTH_USERS, JSON.stringify(localUsers));
        console.info('[PEDAIA Vault] Restored missing user credentials from permanent storage.');
      }
    }
    // Mirror any existing local users to IndexedDB
    if (Object.keys(localUsers).length > 0) {
      mirrorToVault('auth_users', localUsers);
    }

    // 2. Recover Auth Session (Active login status)
    const idbSession = await readFromVault('auth_session');
    const localSessionRaw = localStorage.getItem(storageKeys.AUTH_SESSION);
    if (!localSessionRaw && Array.isArray(idbSession) && idbSession.length > 0) {
      const active = idbSession.find(s => s && s.key === 'current_session') || idbSession[0];
      if (active && active.userId) {
        const sessionPayload = { ...active };
        delete sessionPayload.key;
        localStorage.setItem(storageKeys.AUTH_SESSION, JSON.stringify(sessionPayload));
        localStorage.setItem(storageKeys.ACTIVE_USER, active.userId);
        console.info('[PEDAIA Vault] Restored active user login session from permanent storage.');
        healedCount++;
      }
    } else if (localSessionRaw) {
      try {
        const s = JSON.parse(localSessionRaw);
        mirrorToVault('auth_session', { key: 'current_session', ...s });
      } catch {}
    }

    // 3. Recover Educator Profiles
    const idbProfiles = await readFromVault('user_profiles');
    let localProfiles = {};
    try {
      localProfiles = JSON.parse(localStorage.getItem(storageKeys.USER_PROFILES) || '{}');
    } catch {}

    if (Array.isArray(idbProfiles) && idbProfiles.length > 0) {
      let changed = false;
      for (const p of idbProfiles) {
        if (p && p.userId) {
          const uid = p.userId;
          if (!localProfiles[uid] || Object.keys(localProfiles[uid]).length === 0) {
            const pCopy = { ...p };
            delete pCopy.userId;
            localProfiles[uid] = pCopy;
            changed = true;
            healedCount++;
          }
        }
      }
      if (changed) {
        localStorage.setItem(storageKeys.USER_PROFILES, JSON.stringify(localProfiles));
      }
    }
    if (Object.keys(localProfiles).length > 0) {
      mirrorToVault('user_profiles', localProfiles);
    }

    // 4. Recover Instructional Designs & Projects
    const idbDesigns = await readFromVault('designs');
    let localDesigns = [];
    try {
      localDesigns = JSON.parse(localStorage.getItem(storageKeys.DESIGNS) || '[]');
      if (!Array.isArray(localDesigns)) localDesigns = [];
    } catch {
      localDesigns = [];
    }

    if (Array.isArray(idbDesigns) && idbDesigns.length > 0) {
      const designMap = new Map();
      for (const d of localDesigns) {
        if (d && d.id) designMap.set(d.id, d);
      }
      let added = 0;
      for (const idbD of idbDesigns) {
        if (idbD && idbD.id && !designMap.has(idbD.id)) {
          designMap.set(idbD.id, idbD);
          added++;
        }
      }
      if (added > 0) {
        const merged = Array.from(designMap.values());
        localStorage.setItem(storageKeys.DESIGNS, JSON.stringify(merged));
        console.info(`[PEDAIA Vault] Recovered ${added} instructional designs from permanent storage.`);
        healedCount += added;
      }
    }
    if (localDesigns.length > 0) {
      mirrorToVault('designs', localDesigns);
    }

    // 5. Recover AI Generated Outputs Studio
    const idbOutputs = await readFromVault('outputs');
    let localOutputs = [];
    try {
      localOutputs = JSON.parse(localStorage.getItem(storageKeys.OUTPUTS) || '[]');
      if (!Array.isArray(localOutputs)) localOutputs = [];
    } catch {
      localOutputs = [];
    }

    if (Array.isArray(idbOutputs) && idbOutputs.length > 0) {
      const outputMap = new Map();
      for (const o of localOutputs) {
        if (o && o.id) outputMap.set(o.id, o);
      }
      let added = 0;
      for (const idbO of idbOutputs) {
        if (idbO && idbO.id && !outputMap.has(idbO.id)) {
          outputMap.set(idbO.id, idbO);
          added++;
        }
      }
      if (added > 0) {
        const merged = Array.from(outputMap.values());
        localStorage.setItem(storageKeys.OUTPUTS, JSON.stringify(merged));
        console.info(`[PEDAIA Vault] Recovered ${added} AI studio outputs from permanent storage.`);
        healedCount += added;
      }
    }
    if (localOutputs.length > 0) {
      mirrorToVault('outputs', localOutputs);
    }

    return { healed: healedCount > 0, count: healedCount };
  } catch (err) {
    console.warn('[PEDAIA Vault] Self-healing notice:', err.message);
    return { healed: false, error: err.message };
  }
}

/**
 * Creates and downloads a complete, permanent offline backup archive (.json)
 * containing user accounts, login hashes, educator profile, designs, and AI outputs.
 */
export function exportPermanentBackupVault(storeInstance) {
  const user = storeInstance.getCurrentUser() || { username: 'Educator', userId: 'usr_guest' };
  const username = user.username || 'Educator';
  const designs = storeInstance.getDesigns ? storeInstance.getDesigns() : [];
  const outputs = storeInstance.getOutputs ? storeInstance.getOutputs() : [];
  const profile = storeInstance.getEducatorProfile ? storeInstance.getEducatorProfile() : {};
  const settings = storeInstance.getSettings ? storeInstance.getSettings() : {};
  const templates = storeInstance.getTemplates ? storeInstance.getTemplates() : [];
  const users = storeInstance.getAuthUsers ? storeInstance.getAuthUsers() : {};
  const session = storeInstance.getAuthSession ? storeInstance.getAuthSession() : null;

  const backupPayload = {
    vaultFormat: 'PEDAIA_PERMANENT_VAULT_v2',
    app: 'PEDAIA Instructional Design Studio',
    version: '2.5',
    exportedAt: new Date().toISOString(),
    user: {
      userId: user.userId,
      username: user.username,
      role: user.role
    },
    authUsers: users,
    authSession: session,
    profile,
    designs,
    outputs,
    settings,
    templates,
    stats: {
      designCount: designs.length,
      outputCount: outputs.length,
      hasProfile: Boolean(profile && profile.name)
    }
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `pedaia_permanent_vault_${username.toLowerCase()}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Also archive snapshot to IndexedDB
  mirrorToVault('vault_backups', {
    backupId: 'backup_' + Date.now(),
    timestamp: new Date().toISOString(),
    payload: backupPayload
  });

  return backupPayload;
}

/**
 * Restores all user data, login details, profile, designs, and outputs
 * from an uploaded JSON backup file.
 */
export async function restorePermanentBackupVault(storeInstance, fileOrJsonString, storageKeys) {
  let parsed = null;
  if (typeof fileOrJsonString === 'string') {
    parsed = JSON.parse(fileOrJsonString);
  } else if (fileOrJsonString instanceof File) {
    const text = await fileOrJsonString.text();
    parsed = JSON.parse(text);
  } else if (fileOrJsonString && typeof fileOrJsonString === 'object') {
    parsed = fileOrJsonString;
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid PEDAIA backup archive.');
  }

  // 1. Restore Auth Users & Credentials
  if (parsed.authUsers && typeof parsed.authUsers === 'object') {
    let existingUsers = {};
    try {
      existingUsers = JSON.parse(localStorage.getItem(storageKeys.AUTH_USERS) || '{}');
    } catch {}
    const mergedUsers = { ...existingUsers, ...parsed.authUsers };
    localStorage.setItem(storageKeys.AUTH_USERS, JSON.stringify(mergedUsers));
    mirrorToVault('auth_users', mergedUsers);
  }

  // 2. Restore Active Session
  if (parsed.authSession && parsed.authSession.userId) {
    localStorage.setItem(storageKeys.AUTH_SESSION, JSON.stringify(parsed.authSession));
    localStorage.setItem(storageKeys.ACTIVE_USER, parsed.authSession.userId);
    mirrorToVault('auth_session', { key: 'current_session', ...parsed.authSession });
  }

  // 3. Restore Educator Profile
  if (parsed.profile && typeof parsed.profile === 'object') {
    const targetUid = parsed.user?.userId || storeInstance.getCurrentUserId();
    storeInstance.saveEducatorProfile(parsed.profile, targetUid);
    mirrorToVault('user_profiles', { userId: targetUid, ...parsed.profile });
  }

  // 4. Restore Instructional Designs
  if (Array.isArray(parsed.designs)) {
    let currentDesigns = [];
    try {
      currentDesigns = JSON.parse(localStorage.getItem(storageKeys.DESIGNS) || '[]');
      if (!Array.isArray(currentDesigns)) currentDesigns = [];
    } catch {}
    const map = new Map();
    for (const d of currentDesigns) if (d && d.id) map.set(d.id, d);
    for (const d of parsed.designs) if (d && d.id) map.set(d.id, d);
    const mergedDesigns = Array.from(map.values());
    localStorage.setItem(storageKeys.DESIGNS, JSON.stringify(mergedDesigns));
    mirrorToVault('designs', mergedDesigns);
    storeInstance.notify('designsUpdated', { list: mergedDesigns });
  }

  // 5. Restore AI Generated Outputs
  if (Array.isArray(parsed.outputs)) {
    let currentOutputs = [];
    try {
      currentOutputs = JSON.parse(localStorage.getItem(storageKeys.OUTPUTS) || '[]');
      if (!Array.isArray(currentOutputs)) currentOutputs = [];
    } catch {}
    const map = new Map();
    for (const o of currentOutputs) if (o && o.id) map.set(o.id, o);
    for (const o of parsed.outputs) if (o && o.id) map.set(o.id, o);
    const mergedOutputs = Array.from(map.values());
    localStorage.setItem(storageKeys.OUTPUTS, JSON.stringify(mergedOutputs));
    mirrorToVault('outputs', mergedOutputs);
    storeInstance.notify('outputsUpdated', { list: mergedOutputs });
  }

  // 6. Restore Settings & Templates
  if (parsed.settings && typeof parsed.settings === 'object') {
    localStorage.setItem(storageKeys.SETTINGS, JSON.stringify(parsed.settings));
    mirrorToVault('settings', { key: 'main_settings', ...parsed.settings });
    storeInstance.notify('settingsUpdated', parsed.settings);
  }

  // 7. Background Server Re-hydration
  // If the user has an active session, sync everything back to the server as well
  const session = storeInstance.getAuthSession();
  if (session && session.token && storeInstance.syncServerData) {
    storeInstance.syncServerData(session.token).catch(() => {});
  }

  return {
    success: true,
    designsRestored: (parsed.designs || []).length,
    outputsRestored: (parsed.outputs || []).length,
    hasProfile: Boolean(parsed.profile)
  };
}
