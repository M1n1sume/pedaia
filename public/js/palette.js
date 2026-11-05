// PEDAIA Unified Official Brand Color System & Appearance Architecture
// Primary Brand Colors:
//   Primary Indigo:   #312E81 (Logo accents, primary navigation, main brand identity, primary buttons)
//   Secondary Violet: #7C3AED (Selected controls, focused elements, interactive highlights, active tabs)
//   Accent Teal:      #14B8A6 (Supporting accent, subtle visual emphasis, active learning)
//
// Dark Mode:
//   Main Background:  #0F172A
//   Surface:          #1E293B
//   Elevated Surface: #273449
//   Primary Text:     #F8FAFC
//   Secondary Text:   #CBD5E1
//   Muted Text:       #94A3B8
//   Border:           #334155
//
// Light Mode:
//   Main Background:  #F8FAFC
//   Surface:          #FFFFFF
//   Elevated Surface: #F1F5F9
//   Primary Text:     #0F172A
//   Secondary Text:   #334155
//   Muted Text:       #64748B
//   Border:           #E2E8F0
//
// Functional Colors:
//   Success: #10B981 | Warning: #F59E0B | Error: #EF4444 | Information: #38BDF8

export const PEDAIA_BRAND = {
  name: 'Official PEDAIA Brand System',
  primary: '#312E81',
  secondary: '#7C3AED',
  accent: '#14B8A6',
  primaryIndigo: '#312E81',
  secondaryViolet: '#7C3AED',
  accentTeal: '#14B8A6',
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    elevated: '#273449',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#334155'
  },
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    elevated: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    border: '#E2E8F0'
  },
  functional: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8'
  },
  studios: {
    lessonPlanner: { name: 'Lesson Planner', accent: '#312E81', tag: 'Indigo' },
    activityDesigner: { name: 'Activity Designer', accent: '#14B8A6', tag: 'Teal' },
    questioningStudio: { name: 'Questioning Studio', accent: '#F59E0B', tag: 'Amber' },
    differentiationStudio: { name: 'Differentiation Studio', accent: '#7C3AED', tag: 'Violet' }
  }
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Compatibility shim for legacy imports — maps to unified PEDAIA brand
export const PALETTES = {
  default: {
    id: 'default',
    name: 'PEDAIA Brand',
    tagline: 'Primary Indigo, Interactive Violet & Accent Teal',
    description: 'The official unified PEDAIA brand system.',
    primaryHex: '#312E81',
    secondaryHex: '#7C3AED',
    accentHex: '#14B8A6',
    hoverHex: '#4338CA',
    tintHex: '#EEF2FF',
    darkBg: '#0F172A',
    darkSurface: '#1E293B',
    darkBorder: '#334155',
    darkHeader: '#1E293B'
  }
};

/**
 * Get the currently configured theme mode ('light', 'dark', or 'system')
 */
export function getThemeMode() {
  try {
    const direct = localStorage.getItem('pedaia_theme_mode');
    if (direct && (direct === 'light' || direct === 'dark' || direct === 'system')) {
      return direct;
    }
    const saved = localStorage.getItem('pedaia_settings_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.themeMode) return parsed.themeMode;
      if (parsed.theme && (parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system')) {
        return parsed.theme;
      }
    }
    const legacyTheme = localStorage.getItem('pedaia_theme');
    if (legacyTheme === 'dark' || legacyTheme === 'light') return legacyTheme;
  } catch (e) {}
  return THEME_MODES.SYSTEM;
}

/**
 * Resolves the active theme ('light' or 'dark') based on user choice or OS system preference
 */
export function getResolvedTheme(mode = null) {
  const currentMode = mode || getThemeMode();
  if (currentMode === THEME_MODES.DARK) return 'dark';
  if (currentMode === THEME_MODES.LIGHT) return 'light';
  // System preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

let systemMediaListenerAttached = false;

/**
 * Applies the selected theme mode ('light', 'dark', or 'system')
 */
export function applyThemeMode(mode) {
  const validMode = (mode === 'dark' || mode === 'light') ? mode : THEME_MODES.SYSTEM;
  const resolved = getResolvedTheme(validMode);

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
      if (document.body) document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (document.body) document.body.classList.remove('dark');
    }
    root.setAttribute('data-theme-mode', validMode);

    // Ensure system media query listener is attached once
    if (typeof window !== 'undefined' && window.matchMedia && !systemMediaListenerAttached) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e) => {
        if (getThemeMode() === THEME_MODES.SYSTEM) {
          if (e.matches) {
            root.classList.add('dark');
            if (document.body) document.body.classList.add('dark');
          } else {
            root.classList.remove('dark');
            if (document.body) document.body.classList.remove('dark');
          }
          window.dispatchEvent(new CustomEvent('pedaia-theme-changed', {
            detail: { mode: 'system', resolved: e.matches ? 'dark' : 'light' }
          }));
        }
      };
      if (mql.addEventListener) {
        mql.addEventListener('change', handleSystemChange);
      } else if (mql.addListener) {
        mql.addListener(handleSystemChange);
      }
      systemMediaListenerAttached = true;
    }
  }

  try {
    localStorage.setItem('pedaia_theme_mode', validMode);
    localStorage.setItem('pedaia_theme', resolved);
  } catch (e) {}

  return { mode: validMode, resolved };
}

// Backward compatibility helpers
export function getCurrentPaletteId() {
  return 'default';
}

export function getCurrentPalette() {
  return PALETTES.default;
}

export function applyPalette() {
  // Re-apply current theme mode with unified brand system
  return applyThemeMode(getThemeMode());
}
