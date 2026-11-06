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

  // Ensure sessions, designs, outputs, and profiles exist
  if (!fs.existsSync(getFilePath('sessions.json'))) writeJson('sessions.json', {});
  if (!fs.existsSync(getFilePath('designs.json'))) writeJson('designs.json', []);
  if (!fs.existsSync(getFilePath('outputs.json'))) writeJson('outputs.json', []);
  if (!fs.existsSync(getFilePath('profiles.json'))) writeJson('profiles.json', {});
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
    throw new Error('Incorrect password. Please verify your credentials.');
  }

  user.lastLogin = new Date().toISOString();
  writeJson('users.json', users);

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

export function saveUserDesign(userId, design) {
  if (!userId) throw new Error('Authenticated user session required to save designs.');
  const designs = readJson('designs.json', []);
  const cleanId = design.id || ('des-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'));
  const now = new Date().toISOString();

  const existingIndex = designs.findIndex(d => d.id === cleanId);
  if (existingIndex >= 0) {
    // Enforce data isolation: cannot overwrite another user's design!
    if (designs[existingIndex].userId !== userId) {
      throw new Error('Access denied: You do not have permission to modify this design.');
    }
    designs[existingIndex] = {
      ...designs[existingIndex],
      ...design,
      id: cleanId,
      userId,
      updatedAt: now
    };
  } else {
    const cleanDesign = {
      ...design,
      id: cleanId,
      userId,
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
