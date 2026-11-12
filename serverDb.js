// PEDAIA Server-Side Database & Authentication Subsystem
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

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

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(filename) {
  ensureDataDir();
  return path.join(DATA_DIR, filename);
}

export function readJson(filename, defaultValue = null) {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Server DB] Error reading ${filename}:`, err.message);
    return defaultValue;
  }
}

export function writeJson(filename, data) {
  const filePath = getFilePath(filename);
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`[Server DB] Error writing ${filename}:`, err.message);
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
    // Fallback direct write
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error(`[Server DB] Direct write failed for ${filename}:`, e.message);
      return false;
    }
  }
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken() {
  return 'sess_' + crypto.randomBytes(32).toString('hex');
}

export function hashPassword(password, salt) {
  if (!password || !salt) throw new Error('Password and salt are required.');
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
  try {
    const computed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// Initialize and ensure Admin M1n1sume exists
export function initDb() {
  ensureDataDir();
  const users = readJson('users.json', []);
  const adminIndex = users.findIndex(u => u && u.username && u.username.toLowerCase() === 'm1n1sume');
  if (adminIndex === -1) {
    users.push({
      id: 'usr_m1n1sume',
      username: 'M1n1sume',
      email: '',
      role: 'admin',
      passwordHash: null,
      salt: generateSalt(),
      isInitialized: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    });
    writeJson('users.json', users);
  }

  // Ensure sessions, designs, outputs, profiles, activity logs, and email notifications exist
  if (!fs.existsSync(getFilePath('sessions.json'))) writeJson('sessions.json', {});
  if (!fs.existsSync(getFilePath('designs.json'))) writeJson('designs.json', []);
  if (!fs.existsSync(getFilePath('outputs.json'))) writeJson('outputs.json', []);
  if (!fs.existsSync(getFilePath('profiles.json'))) writeJson('profiles.json', {});
  if (!fs.existsSync(getFilePath('activity_logs.json'))) writeJson('activity_logs.json', []);
  if (!fs.existsSync(getFilePath('email_notifications.json'))) writeJson('email_notifications.json', []);
}

// User Registration
export function registerUser({ username, email, password, confirmPassword }) {
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

  // Strictly enforce reserved administrator account
  if (cleanUsername.toLowerCase() === 'm1n1sume') {
    throw new Error('The username "M1n1sume" is reserved for the designated administrator. Please log in using the Log In form.');
  }

  if (!email || typeof email !== 'string') {
    throw new Error('Email address is required.');
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || typeof password !== 'string') {
    throw new Error('Password is required.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (password !== confirmPassword) {
    throw new Error('Password and Confirm Password do not match.');
  }

  const users = readJson('users.json', []);

  // Check unique username
  const usernameTaken = users.some(u => u && u.username && u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (usernameTaken) {
    throw new Error(`The username "${cleanUsername}" is already registered. Please choose another or log in.`);
  }

  // Check unique email
  const emailTaken = users.some(u => u && u.email && u.email.toLowerCase() === cleanEmail);
  if (emailTaken) {
    throw new Error(`An account with the email "${cleanEmail}" already exists. Please log in.`);
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const now = new Date().toISOString();
  const newUser = {
    id: 'usr_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    username: cleanUsername,
    email: cleanEmail,
    role: 'educator',
    passwordHash,
    salt,
    isInitialized: true,
    createdAt: now,
    lastLogin: now
  };

  users.push(newUser);
  writeJson('users.json', users);

  // Initialize strictly blank Educator Profile (never auto-populate from login credentials)
  const profiles = readJson('profiles.json', {});
  profiles[newUser.id] = { ...BLANK_EDUCATOR_PROFILE };
  writeJson('profiles.json', profiles);

  // Create session
  const token = generateToken();
  const sessions = readJson('sessions.json', {});
  sessions[token] = {
    userId: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    createdAt: now
  };
  writeJson('sessions.json', sessions);

  return {
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    },
    token
  };
}

// User Login (handles both standard users and M1n1sume password setup)
export function loginUser({ identifier, password, isFirstTimeAdmin, masterPassword, confirmMasterPassword }) {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('Username or email is required.');
  }
  const cleanId = identifier.trim().toLowerCase();
  const users = readJson('users.json', []);

  const user = users.find(u => 
    (u.username && u.username.toLowerCase() === cleanId) || 
    (u.email && u.email.toLowerCase() === cleanId)
  );

  if (!user) {
    throw new Error(`Account "${identifier.trim()}" not found. Please verify your credentials or create an account.`);
  }

  // Special handling for Administrator M1n1sume
  if (user.username.toLowerCase() === 'm1n1sume') {
    // If M1n1sume has not yet established a password
    if (!user.isInitialized || !user.passwordHash) {
      if (isFirstTimeAdmin) {
        if (!masterPassword || typeof masterPassword !== 'string' || masterPassword.length < 6) {
          throw new Error('Master administrator password must be at least 6 characters.');
        }
        if (masterPassword !== confirmMasterPassword) {
          throw new Error('Master password and confirmation do not match.');
        }

        const salt = generateSalt();
        const passwordHash = hashPassword(masterPassword, salt);
        user.passwordHash = passwordHash;
        user.salt = salt;
        user.isInitialized = true;
        user.lastLogin = new Date().toISOString();
        writeJson('users.json', users);

        const token = generateToken();
        const sessions = readJson('sessions.json', {});
        sessions[token] = {
          userId: user.id,
          username: user.username,
          email: user.email || '',
          role: 'admin',
          createdAt: user.lastLogin
        };
        writeJson('sessions.json', sessions);

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email || '',
            role: 'admin'
          },
          token,
          isFirstTimeSetup: true
        };
      } else {
        // Signal to login modal that first-time password setup is required
        return {
          success: false,
          requiresMasterPasswordSetup: true,
          username: user.username,
          message: 'Welcome M1n1sume. Please establish your master administrator password to initialize your account.'
        };
      }
    }
  }

  // Standard password verification
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required.');
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    recordActivity({
      type: 'USER_LOGIN',
      userId: user.id,
      username: user.username,
      details: { status: 'FAILED', reason: 'Incorrect password' }
    });
    throw new Error('Incorrect password. Please verify your credentials.');
  }

  user.lastLogin = new Date().toISOString();
  writeJson('users.json', users);

  recordActivity({
    type: 'USER_LOGIN',
    userId: user.id,
    username: user.username,
    details: { status: 'SUCCESS', role: user.role }
  });

  const token = generateToken();
  const sessions = readJson('sessions.json', {});
  sessions[token] = {
    userId: user.id,
    username: user.username,
    email: user.email || '',
    role: user.role,
    createdAt: user.lastLogin
  };
  writeJson('sessions.json', sessions);

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email || '',
      role: user.role
    },
    token
  };
}

// User Logout
export function logoutUser(token) {
  if (!token) return { success: true };
  const sessions = readJson('sessions.json', {});
  if (sessions[token]) {
    delete sessions[token];
    writeJson('sessions.json', sessions);
  }
  return { success: true };
}

// User Password Update
export function changeUserPassword({ userId, oldPassword, newPassword }) {
  if (!userId) throw new Error('User ID is required.');
  if (!oldPassword) throw new Error('Current password is required.');
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const users = readJson('users.json', []);
  const user = users.find(u => u && u.id === userId);
  if (!user) throw new Error('User account not found.');

  if (user.passwordHash && user.salt) {
    const isValid = verifyPassword(oldPassword, user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Current password does not match.');
    }
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(newPassword, salt);
  user.passwordHash = passwordHash;
  user.salt = salt;
  user.isInitialized = true;
  user.updatedAt = new Date().toISOString();

  writeJson('users.json', users);
  return { success: true };
}

// Auth Session Verification
export function getUserByToken(token) {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.substring(7).trim() : token.trim();
  const sessions = readJson('sessions.json', {});
  const session = sessions[cleanToken];
  if (!session) return null;

  const users = readJson('users.json', []);
  const user = users.find(u => u && u.id === session.userId);
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email || '',
    role: user.role,
    token: cleanToken
  };
}

// Personal Designs Data Management (Per-User Isolation Enforced)
export function getUserDesigns(userId) {
  if (!userId) return [];
  const designs = readJson('designs.json', []);
  return designs.filter(d => d && d.userId === userId);
}

// Work In Progress (WIP) and Private Project Access Control Policy:
// 1. Projects that are still Work In Progress (Draft, Prompt Saved, Output Ready, Reviewed) are strictly locked to others.
// 2. Projects set to Private are strictly restricted to the author only.
// 3. Projects that are Completed AND marked Public can be accessed and viewed by other educators.
export function getDesignById(designId, requesterUserId) {
  const designs = readJson('designs.json', []);
  const design = designs.find(d => d.id === designId);
  if (!design) return null;

  const isOwner = !design.userId || design.userId === requesterUserId;
  const isCompleted = design.status === 'Completed';
  const isPublic = design.visibility === 'public' || design.isPublic === true;

  let isAdmin = false;
  if (requesterUserId) {
    const users = readJson('users.json', []);
    const user = users.find(u => u.id === requesterUserId);
    if (user && user.role === 'admin') isAdmin = true;
  }

  // Owner and Admin always have full access
  if (isOwner || isAdmin) {
    return design;
  }

  // If another person tries to access a project that is still Work In Progress (Draft, Prompt Saved, Output Ready, Reviewed):
  if (!isCompleted) {
    throw new Error('PROJECT_LOCKED_WIP: This project is currently work in progress and locked. Other people cannot access it until it reaches the Completed stage.');
  }

  // If another person tries to access a Completed project that is set to Private:
  if (!isPublic) {
    throw new Error('PROJECT_PRIVATE: This project is set to Private by its author. Only the author can access it.');
  }

  return design;
}

export function saveUserDesign(userId, design) {
  if (!userId) throw new Error('Authenticated user session required to save designs.');
  const designs = readJson('designs.json', []);
  const cleanId = design.id || ('des-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'));
  const now = new Date().toISOString();

  const visibility = design.visibility !== undefined
    ? design.visibility
    : (design.isPublic !== undefined ? (design.isPublic ? 'public' : 'private') : 'private');
  const isPublic = visibility === 'public';

  const existingIndex = designs.findIndex(d => d.id === cleanId);
  if (existingIndex >= 0) {
    // Enforce data isolation: cannot overwrite another user's design!
    if (designs[existingIndex].userId !== userId) {
      throw new Error('Access denied: You do not have permission to modify this design.');
    }
    const currentVis = designs[existingIndex].visibility || (designs[existingIndex].isPublic ? 'public' : 'private');
    const resolvedVis = design.visibility !== undefined ? design.visibility : (design.isPublic !== undefined ? (design.isPublic ? 'public' : 'private') : currentVis);

    designs[existingIndex] = {
      ...designs[existingIndex],
      ...design,
      visibility: resolvedVis,
      isPublic: resolvedVis === 'public',
      id: cleanId,
      userId,
      updatedAt: now
    };
  } else {
    const cleanDesign = {
      ...design,
      id: cleanId,
      userId,
      visibility,
      isPublic,
      createdAt: design.createdAt || now,
      updatedAt: now,
      versionHistory: design.versionHistory || [
        {
          timestamp: now,
          output: design.output || '',
          note: 'Initial generation'
        }
      ]
    };
    designs.unshift(cleanDesign);
  }

  writeJson('designs.json', designs);

  // Telemetry: Record output / project creation
  try {
    const users = readJson('users.json', []);
    const author = users.find(u => u.id === userId);
    recordActivity({
      type: design.output ? 'OUTPUT_CREATED' : 'PROJECT_SAVED',
      userId,
      username: author ? author.username : 'Educator',
      details: {
        designId: cleanId,
        title: design.title || 'Instructional Design',
        stage: design.status || 'Draft',
        visibility: isPublic ? 'public' : 'private'
      }
    });

    // Milestone Trigger: If project reached Completed, dispatch milestone email update
    if (design.status === 'Completed' && design.emailNotifications?.enabled !== false && design.emailNotifications?.onStageChange !== false) {
      sendProjectEmailUpdate({
        userId,
        designId: cleanId,
        eventType: 'STAGE_COMPLETED',
        details: { stage: 'Completed' }
      });
    }
  } catch (logErr) {
    console.warn('[Server DB] Activity record for design save error:', logErr.message);
  }

  return designs.find(d => d.id === cleanId);
}

export function deleteUserDesign(userId, designId) {
  if (!userId) throw new Error('Authentication required.');
  const designs = readJson('designs.json', []);
  const target = designs.find(d => d.id === designId);
  if (!target) return { success: true };
  if (target.userId !== userId) {
    throw new Error('Access denied: You do not have permission to delete this design.');
  }

  const updated = designs.filter(d => d.id !== designId);
  writeJson('designs.json', updated);
  return { success: true };
}

// Personal AI Generated Outputs Data Management (Per-User Isolation Enforced)
export function getUserOutputs(userId) {
  if (!userId) return [];
  const outputs = readJson('outputs.json', []);
  return outputs.filter(o => o && o.userId === userId);
}

export function saveUserOutput(userId, output) {
  if (!userId) throw new Error('Authenticated user session required to save outputs.');
  const outputs = readJson('outputs.json', []);
  const cleanId = output.id || ('out-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'));
  const now = new Date().toISOString();

  const existingIndex = outputs.findIndex(o => o.id === cleanId);
  if (existingIndex >= 0) {
    if (outputs[existingIndex].userId !== userId) {
      throw new Error('Access denied: You do not have permission to modify this output.');
    }
    outputs[existingIndex] = {
      ...outputs[existingIndex],
      ...output,
      id: cleanId,
      userId,
      updatedAt: now
    };
  } else {
    const cleanOutput = {
      ...output,
      id: cleanId,
      userId,
      createdAt: output.createdAt || now,
      updatedAt: now
    };
    outputs.unshift(cleanOutput);
  }

  writeJson('outputs.json', outputs);

  // Telemetry: Record output made
  try {
    const users = readJson('users.json', []);
    const author = users.find(u => u.id === userId);
    recordActivity({
      type: existingIndex >= 0 ? 'OUTPUT_MODIFIED' : 'OUTPUT_CREATED',
      userId,
      username: author ? author.username : 'Educator',
      details: {
        outputId: cleanId,
        title: output.title || output.topic || 'Educational Output',
        outputType: output.type || output.format || 'AI Material',
        designId: output.designId || null
      }
    });

    // Email trigger: if tied to a project, dispatch output email notification
    if (output.designId) {
      const designs = readJson('designs.json', []);
      const design = designs.find(d => d.id === output.designId);
      if (design && design.emailNotifications?.enabled !== false && design.emailNotifications?.onOutputGenerated !== false) {
        sendProjectEmailUpdate({
          userId,
          designId: design.id,
          eventType: 'OUTPUT_GENERATED',
          details: {
            outputTitle: output.title || output.topic || 'Curricular Artifact',
            outputType: output.type || 'Lesson Output'
          }
        });
      }
    }
  } catch (outLogErr) {
    console.warn('[Server DB] Activity record for output save error:', outLogErr.message);
  }

  return outputs.find(o => o.id === cleanId);
}

export function deleteUserOutput(userId, outputId) {
  if (!userId) throw new Error('Authentication required.');
  const outputs = readJson('outputs.json', []);
  const target = outputs.find(o => o.id === outputId);
  if (!target) return { success: true };
  if (target.userId !== userId) {
    throw new Error('Access denied: You do not have permission to delete this output.');
  }

  const updated = outputs.filter(o => o.id !== outputId);
  writeJson('outputs.json', updated);
  return { success: true };
}

// Educator Profile Management (Strict separation from login credentials)
export function getUserProfile(userId) {
  if (!userId) return { ...BLANK_EDUCATOR_PROFILE };
  const profiles = readJson('profiles.json', {});
  return profiles[userId] || { ...BLANK_EDUCATOR_PROFILE };
}

export function saveUserProfile(userId, profileData) {
  if (!userId) throw new Error('Authentication required to save profile.');
  const profiles = readJson('profiles.json', {});
  const current = profiles[userId] || { ...BLANK_EDUCATOR_PROFILE };

  // Only update profile fields; never touch login credentials
  const updatedProfile = {
    ...current,
    name: typeof profileData.name === 'string' ? profileData.name.trim() : current.name,
    title: typeof profileData.title === 'string' ? profileData.title.trim() : current.title,
    institution: typeof profileData.institution === 'string' ? profileData.institution.trim() : current.institution,
    department: typeof profileData.department === 'string' ? profileData.department.trim() : current.department,
    educationalLevel: typeof profileData.educationalLevel === 'string' ? profileData.educationalLevel.trim() : current.educationalLevel,
    specialization: typeof profileData.specialization === 'string' ? profileData.specialization.trim() : current.specialization,
    bio: typeof profileData.bio === 'string' ? profileData.bio.trim() : current.bio,
    email: typeof profileData.email === 'string' ? profileData.email.trim() : current.email,
    avatarUrl: typeof profileData.avatarUrl === 'string' ? profileData.avatarUrl.trim() : current.avatarUrl
  };

  profiles[userId] = updatedProfile;
  writeJson('profiles.json', profiles);
  return updatedProfile;
}

// Admin User Directory
export function listAllUsers(adminUserId) {
  const users = readJson('users.json', []);
  const requester = users.find(u => u.id === adminUserId);
  if (!requester || requester.role !== 'admin') {
    throw new Error('Access denied: Administrator privileges required.');
  }

  return users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email || '',
    role: u.role,
    isInitialized: u.isInitialized !== false,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }));
}

// ============================================================================
// Activity Telemetry & Audit Logs (Admin-Only Telemetry)
// Takes note of those who accessed the website, logged in, or made outputs
// ============================================================================

export function recordActivity({ type, userId = null, username = null, details = {}, ip = '127.0.0.1', userAgent = '' }) {
  try {
    const logs = readJson('activity_logs.json', []);
    const id = 'act_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
    
    // Resolve clean username if not explicitly passed
    let resolvedUsername = username;
    if (!resolvedUsername && userId) {
      const users = readJson('users.json', []);
      const user = users.find(u => u.id === userId);
      resolvedUsername = user ? user.username : 'User';
    } else if (!resolvedUsername) {
      resolvedUsername = 'Guest Visitor';
    }

    const entry = {
      id,
      type: type || 'WEBSITE_ACCESS',
      userId: userId || null,
      username: resolvedUsername,
      details: details || {},
      ip: ip || '127.0.0.1',
      userAgent: userAgent || '',
      timestamp: new Date().toISOString()
    };

    logs.unshift(entry);
    // Keep last 1500 records to prevent file bloat
    if (logs.length > 1500) {
      logs.length = 1500;
    }
    writeJson('activity_logs.json', logs);
    return entry;
  } catch (err) {
    console.error('[Server DB] Error recording activity:', err.message);
    return null;
  }
}

export function getActivityLogs({ adminUserId, type = 'ALL', search = '', limit = 100, offset = 0 }) {
  if (!adminUserId) throw new Error('Administrator privileges required.');
  const users = readJson('users.json', []);
  const admin = users.find(u => u && u.id === adminUserId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Access denied: Administrator privileges required.');
  }

  const logs = readJson('activity_logs.json', []);
  
  // Calculate summary telemetry metrics
  const totalVisits = logs.filter(l => l.type === 'WEBSITE_ACCESS').length;
  const uniqueVisitorIps = new Set(logs.filter(l => l.type === 'WEBSITE_ACCESS').map(l => l.ip)).size;
  const totalLogins = logs.filter(l => l.type === 'USER_LOGIN' && l.details?.status !== 'FAILED').length;
  const totalOutputs = logs.filter(l => l.type === 'OUTPUT_CREATED' || l.type === 'OUTPUT_MODIFIED' || l.type === 'PROJECT_SAVED').length;
  const totalEmails = logs.filter(l => l.type === 'EMAIL_SENT' || l.type === 'EMAIL_UPDATE_SENT').length;

  let filtered = logs;
  if (type && type !== 'ALL') {
    if (type === 'WEBSITE_ACCESS') {
      filtered = filtered.filter(l => l.type === 'WEBSITE_ACCESS');
    } else if (type === 'USER_LOGIN') {
      filtered = filtered.filter(l => l.type === 'USER_LOGIN' || l.type === 'USER_LOGOUT');
    } else if (type === 'OUTPUT_CREATED') {
      filtered = filtered.filter(l => l.type === 'OUTPUT_CREATED' || l.type === 'OUTPUT_MODIFIED' || l.type === 'PROJECT_SAVED');
    } else if (type === 'EMAIL_SENT') {
      filtered = filtered.filter(l => l.type === 'EMAIL_SENT' || l.type === 'EMAIL_UPDATE_SENT');
    } else {
      filtered = filtered.filter(l => l.type === type);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(l => {
      const matchUser = l.username && l.username.toLowerCase().includes(q);
      const matchIp = l.ip && l.ip.toLowerCase().includes(q);
      const matchType = l.type && l.type.toLowerCase().includes(q);
      const matchDetails = l.details ? JSON.stringify(l.details).toLowerCase().includes(q) : false;
      return matchUser || matchIp || matchType || matchDetails;
    });
  }

  const paginated = filtered.slice(offset, offset + limit);

  return {
    logs: paginated,
    total: filtered.length,
    stats: {
      totalVisits,
      uniqueVisitors: uniqueVisitorIps,
      totalLogins,
      totalOutputs,
      totalEmails,
      totalEvents: logs.length
    }
  };
}

export function clearActivityLogs(adminUserId) {
  if (!adminUserId) throw new Error('Administrator privileges required.');
  const users = readJson('users.json', []);
  const admin = users.find(u => u && u.id === adminUserId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Access denied: Administrator privileges required.');
  }

  writeJson('activity_logs.json', []);
  recordActivity({
    type: 'ADMIN_PURGE',
    userId: admin.id,
    username: admin.username,
    details: { action: 'Activity logs purged by administrator' }
  });
  return { success: true };
}

// ============================================================================
// Project Email Notifications & Updates Engine
// Gives educators rich, automated and on-demand email updates for their projects
// ============================================================================

export function sendProjectEmailUpdate({ userId, designId, eventType = 'PROJECT_UPDATE', details = {}, customRecipient = null }) {
  if (!userId) throw new Error('Authentication required to send project email.');
  const designs = readJson('designs.json', []);
  const design = designs.find(d => d.id === designId);
  if (!design) throw new Error('Project design not found.');

  const users = readJson('users.json', []);
  const requester = users.find(u => u.id === userId);
  if (!requester) throw new Error('User account not found.');
  if (design.userId !== userId && requester.role !== 'admin') {
    throw new Error('Access denied: You can only send email updates for your own projects.');
  }

  const profiles = readJson('profiles.json', {});
  const userProfile = profiles[design.userId] || {};
  const projectAuthor = users.find(u => u.id === design.userId) || requester;
  
  const recipientEmail = customRecipient || 
    design.notificationEmail || 
    userProfile.email || 
    projectAuthor.email;

  if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
    throw new Error('No valid recipient email address found for this project.');
  }

  const now = new Date().toISOString();
  const emailId = 'eml_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
  
  let subject = `[PEDAIA] Project Update: "${design.title || 'Instructional Design'}"`;
  let headline = `Project Update: ${design.title || 'Instructional Design'}`;
  let messageBody = details.message || 'An educational update is ready for your project.';

  if (eventType === 'OUTPUT_GENERATED') {
    subject = `[PEDAIA] ✨ New AI Educational Output Ready for "${design.title || 'Instructional Design'}"`;
    headline = `✨ New Educational Material Generated`;
    messageBody = details.outputTitle 
      ? `A new educational output "${details.outputTitle}" (${details.outputType || 'Curricular Artifact'}) has been generated for your project.`
      : `New instructional materials have been generated and added to your project dossier.`;
  } else if (eventType === 'STAGE_COMPLETED') {
    subject = `[PEDAIA] 🎉 Milestone Reached: "${design.title || 'Instructional Design'}" is Completed!`;
    headline = `🎉 Project Marked as Completed`;
    messageBody = `Congratulations! Your instructional design project has successfully completed its pedagogical review and is marked as Completed.`;
  } else if (eventType === 'STAGE_CHANGED') {
    subject = `[PEDAIA] 📌 Stage Progress: "${design.title || 'Instructional Design'}" moved to ${details.stage || 'Next Stage'}`;
    headline = `📌 Stage Milestone: ${details.stage || 'Updated'}`;
    messageBody = `Your project stage has been advanced to "${details.stage}".`;
  } else if (eventType === 'VISIBILITY_CHANGED') {
    subject = `[PEDAIA] 🔒 Project Visibility Updated for "${design.title || 'Instructional Design'}"`;
    headline = `🔒 Project Visibility: ${details.visibility === 'public' ? 'Public (Community Access)' : 'Private (Confidential Author Access)'}`;
    messageBody = `Your project visibility was changed to ${details.visibility === 'public' ? 'Public' : 'Private'}.`;
  }

  const snippet = design.output 
    ? (design.output.length > 300 ? design.output.substring(0, 300) + '...' : design.output)
    : 'Instructional design materials ready for classroom deployment.';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); padding: 24px 28px; color: #ffffff; }
        .logo { font-size: 18px; font-weight: 800; letter-spacing: 0.05em; }
        .content { padding: 28px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
        .badge-stage { background-color: #e0e7ff; color: #3730a3; }
        .snippet-box { background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 14px; border-radius: 8px; font-size: 13px; font-style: italic; color: #334155; margin: 16px 0; }
        .meta-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; }
        .meta-table td { padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
        .meta-table td:first-child { color: #64748b; font-weight: 600; width: 35%; }
        .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">⚡ PEDAIA INSTRUCTIONAL DESIGN STUDIO</div>
          <h2 style="margin: 8px 0 0 0; font-size: 20px;">${headline}</h2>
        </div>
        <div class="content">
          <p style="font-size: 14px; margin-top: 0;">Hello <strong>${projectAuthor.username}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5;">${messageBody}</p>
          
          <table class="meta-table">
            <tr><td>Project Title:</td><td><strong>${design.title || 'Untitled Design'}</strong></td></tr>
            <tr><td>Subject / Field:</td><td>${design.subject || 'Interdisciplinary'}</td></tr>
            <tr><td>Grade / Level:</td><td>${design.gradeLevel || 'Standard'}</td></tr>
            <tr><td>Current Stage:</td><td><span class="badge badge-stage">${design.status || 'Draft'}</span></td></tr>
            <tr><td>Visibility:</td><td>${design.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</td></tr>
          </table>

          <div class="snippet-box">
            <strong>Preview:</strong><br/>
            ${snippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
            Log in to your PEDAIA account anytime to inspect, export, refine, or present this instructional design.
          </p>
        </div>
        <div class="footer">
          Dispatched by PEDAIA Project Notification Engine • ${new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
        </div>
      </div>
    </body>
    </html>
  `;

  const emailRecord = {
    id: emailId,
    designId,
    designTitle: design.title || 'Untitled Design',
    userId: design.userId,
    recipientEmail,
    eventType,
    subject,
    headline,
    messageBody,
    htmlBody,
    status: 'delivered',
    sentAt: now
  };

  const emails = readJson('email_notifications.json', []);
  emails.unshift(emailRecord);
  if (emails.length > 500) emails.length = 500;
  writeJson('email_notifications.json', emails);

  // Record in activity logs so it appears in the Admin tab!
  recordActivity({
    type: 'EMAIL_SENT',
    userId: design.userId,
    username: projectAuthor.username,
    details: {
      recipient: recipientEmail,
      designId,
      designTitle: design.title,
      eventType,
      subject
    }
  });

  return {
    success: true,
    email: {
      id: emailId,
      recipientEmail,
      subject,
      headline,
      sentAt: now
    }
  };
}

export function getProjectEmailNotifications({ userId, designId }) {
  if (!userId) return [];
  const emails = readJson('email_notifications.json', []);
  return emails.filter(e => e && e.userId === userId && (!designId || e.designId === designId));
}

export function getAllEmailNotifications(adminUserId) {
  if (!adminUserId) throw new Error('Administrator privileges required.');
  const users = readJson('users.json', []);
  const admin = users.find(u => u && u.id === adminUserId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Access denied: Administrator privileges required.');
  }
  return readJson('email_notifications.json', []);
}

export function saveProjectNotificationSettings(userId, designId, settings = {}) {
  if (!userId) throw new Error('Authentication required.');
  const designs = readJson('designs.json', []);
  const design = designs.find(d => d.id === designId);
  if (!design) throw new Error('Design not found.');
  if (design.userId !== userId) throw new Error('Access denied: Not design owner.');

  design.notificationEmail = typeof settings.notificationEmail === 'string' ? settings.notificationEmail.trim() : design.notificationEmail;
  design.emailNotifications = {
    enabled: settings.enabled !== undefined ? Boolean(settings.enabled) : true,
    onOutputGenerated: settings.onOutputGenerated !== undefined ? Boolean(settings.onOutputGenerated) : true,
    onStageChange: settings.onStageChange !== undefined ? Boolean(settings.onStageChange) : true,
    onVisibilityChange: settings.onVisibilityChange !== undefined ? Boolean(settings.onVisibilityChange) : false
  };

  writeJson('designs.json', designs);
  return design;
}

// ============================================================================
// PERMANENT DATA VAULT & RE-HYDRATION SYSTEM
// ============================================================================

/**
 * Re-hydrates or synchronizes a user account from client vault.
 * Ensures that if a server was redeployed or wiped, user accounts are restored.
 */
export function restoreOrSyncUser({ user, profile }) {
  if (!user || !user.username) {
    throw new Error('User data required for vault restoration.');
  }
  const users = readJson('users.json', []);
  const cleanUsername = user.username.trim();
  let existingIndex = users.findIndex(u => 
    (u.id && user.id && u.id === user.id) ||
    (u.username && u.username.toLowerCase() === cleanUsername.toLowerCase())
  );

  let targetUser = null;
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...users[existingIndex],
      lastLogin: now,
      ...(user.passwordHash ? { passwordHash: user.passwordHash } : {}),
      ...(user.salt ? { salt: user.salt } : {}),
      ...(user.role ? { role: user.role } : {})
    };
    targetUser = users[existingIndex];
  } else {
    targetUser = {
      id: user.id || ('usr_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex')),
      username: cleanUsername,
      email: user.email ? user.email.trim().toLowerCase() : '',
      role: user.role || 'educator',
      passwordHash: user.passwordHash || null,
      salt: user.salt || generateSalt(),
      isInitialized: user.isInitialized !== false,
      createdAt: user.createdAt || now,
      lastLogin: now
    };
    users.push(targetUser);
  }

  writeJson('users.json', users);

  if (profile && typeof profile === 'object') {
    saveUserProfile(targetUser.id, profile);
  }

  const token = generateToken();
  const sessions = readJson('sessions.json', {});
  sessions[token] = {
    userId: targetUser.id,
    username: targetUser.username,
    email: targetUser.email || '',
    role: targetUser.role,
    createdAt: now
  };
  writeJson('sessions.json', sessions);

  recordActivity({
    type: 'USER_RESTORED_FROM_VAULT',
    userId: targetUser.id,
    username: targetUser.username,
    details: { reason: 'Permanent vault re-hydration after website update' }
  });

  return {
    success: true,
    token,
    user: {
      id: targetUser.id,
      username: targetUser.username,
      email: targetUser.email || '',
      role: targetUser.role
    }
  };
}

/**
 * Non-destructive bidirectional sync for designs and outputs.
 * Never deletes any user records. Merges preserving all items.
 */
export function syncAllVaultData({ userId, designs = [], outputs = [], profile = null }) {
  if (!userId) throw new Error('Authentication required for vault synchronization.');

  let designsMerged = 0;
  let outputsMerged = 0;

  // 1. Merge Designs
  if (Array.isArray(designs) && designs.length > 0) {
    const serverDesigns = readJson('designs.json', []);
    const designMap = new Map();
    for (const d of serverDesigns) if (d && d.id) designMap.set(d.id, d);

    for (const d of designs) {
      if (d && d.id) {
        if (d.userId && d.userId !== userId && !designMap.has(d.id)) {
          continue;
        }
        const existing = designMap.get(d.id);
        if (!existing) {
          designMap.set(d.id, { ...d, userId: d.userId || userId });
          designsMerged++;
        } else if (existing.userId === userId || !existing.userId) {
          const incomingTime = new Date(d.updatedAt || 0).getTime();
          const serverTime = new Date(existing.updatedAt || 0).getTime();
          if (incomingTime >= serverTime) {
            designMap.set(d.id, { ...existing, ...d, userId });
            designsMerged++;
          }
        }
      }
    }
    writeJson('designs.json', Array.from(designMap.values()));
  }

  // 2. Merge Outputs
  if (Array.isArray(outputs) && outputs.length > 0) {
    const serverOutputs = readJson('outputs.json', []);
    const outputMap = new Map();
    for (const o of serverOutputs) if (o && o.id) outputMap.set(o.id, o);

    for (const o of outputs) {
      if (o && o.id) {
        if (o.userId && o.userId !== userId && !outputMap.has(o.id)) {
          continue;
        }
        const existing = outputMap.get(o.id);
        if (!existing) {
          outputMap.set(o.id, { ...o, userId: o.userId || userId });
          outputsMerged++;
        } else if (existing.userId === userId || !existing.userId) {
          const incomingTime = new Date(o.updatedAt || 0).getTime();
          const serverTime = new Date(existing.updatedAt || 0).getTime();
          if (incomingTime >= serverTime) {
            outputMap.set(o.id, { ...existing, ...o, userId });
            outputsMerged++;
          }
        }
      }
    }
    writeJson('outputs.json', Array.from(outputMap.values()));
  }

  // 3. Merge Profile
  if (profile && typeof profile === 'object') {
    saveUserProfile(userId, profile);
  }

  return {
    success: true,
    designsMerged,
    outputsMerged
  };
}

/**
 * Export all data belonging to an authenticated user
 */
export function exportVaultData(userId) {
  if (!userId) throw new Error('Authentication required.');
  const profile = getUserProfile(userId);
  const designs = getUserDesigns(userId);
  const outputs = getUserOutputs(userId);
  const users = readJson('users.json', []);
  const user = users.find(u => u && u.id === userId);

  return {
    vaultFormat: 'PEDAIA_SERVER_VAULT_v2',
    exportedAt: new Date().toISOString(),
    user: user ? { id: user.id, username: user.username, email: user.email, role: user.role } : null,
    profile,
    designs,
    outputs
  };
}

/**
 * Public Shared Links System
 * Enables educators to generate and share direct links to designs and outputs.
 */
export function saveSharedItem(sharedData) {
  if (!sharedData || !sharedData.item || !sharedData.item.id) {
    throw new Error('Valid item with an id is required for sharing.');
  }
  const sharedList = readJson('shared_links.json', []);
  const cleanId = String(sharedData.item.id).trim();
  const now = new Date().toISOString();

  const entry = {
    id: cleanId,
    type: sharedData.type || (cleanId.startsWith('out-') ? 'output' : 'design'),
    title: sharedData.item.title || sharedData.item.topic || 'Instructional Learning Resource',
    subject: sharedData.item.subject || '',
    gradeLevel: sharedData.item.gradeLevel || sharedData.item.educationalLevel || '',
    category: sharedData.item.category || sharedData.item.outputType || 'Instructional Design',
    authorName: sharedData.authorName || 'PEDAIA Educator',
    item: sharedData.item,
    sharedAt: now,
    views: 0
  };

  const existingIdx = sharedList.findIndex(s => s && s.id === cleanId);
  if (existingIdx >= 0) {
    entry.views = sharedList[existingIdx].views || 0;
    sharedList[existingIdx] = entry;
  } else {
    sharedList.unshift(entry);
  }
  writeJson('shared_links.json', sharedList);

  // Also mark the original in designs.json or outputs.json as isShared if found
  try {
    const designs = readJson('designs.json', []);
    const dIdx = designs.findIndex(d => d && d.id === cleanId);
    if (dIdx >= 0) {
      designs[dIdx].isShared = true;
      writeJson('designs.json', designs);
    }
  } catch {}

  try {
    const outputs = readJson('outputs.json', []);
    const oIdx = outputs.findIndex(o => o && o.id === cleanId);
    if (oIdx >= 0) {
      outputs[oIdx].isShared = true;
      writeJson('outputs.json', outputs);
    }
  } catch {}

  return entry;
}

export function getSharedItemById(id) {
  if (!id) return null;
  const cleanId = String(id).trim();

  // 1. Check shared_links.json first
  const sharedList = readJson('shared_links.json', []);
  const found = sharedList.find(s => s && s.id === cleanId);
  if (found) {
    try {
      found.views = (found.views || 0) + 1;
      writeJson('shared_links.json', sharedList);
    } catch {}
    return found;
  }

  // 2. Check designs.json (if isShared or isPublic or Completed)
  const designs = readJson('designs.json', []);
  const design = designs.find(d => d && d.id === cleanId);
  if (design && (design.isShared || design.isPublic || design.visibility === 'public')) {
    return {
      id: design.id,
      type: 'design',
      title: design.title,
      subject: design.subject,
      gradeLevel: design.gradeLevel || design.educationalLevel,
      category: design.category || 'Lesson Plan',
      authorName: design.authorName || 'PEDAIA Educator',
      item: design,
      sharedAt: design.updatedAt || design.createdAt,
      views: 1
    };
  }

  // 3. Check outputs.json (if isShared or match)
  const outputs = readJson('outputs.json', []);
  const output = outputs.find(o => o && o.id === cleanId);
  if (output) {
    return {
      id: output.id,
      type: 'output',
      title: output.title || output.topic || 'AI Learning Resource',
      subject: output.subject,
      gradeLevel: output.gradeLevel || output.educationalLevel,
      category: output.category || output.outputType || 'Learning Resource',
      authorName: output.authorName || 'PEDAIA Educator',
      item: output,
      sharedAt: output.updatedAt || output.createdAt,
      views: 1
    };
  }

  return null;
}
