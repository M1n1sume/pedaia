// PEDAIA Device & Screen Layout Manager
// Automatically adapts layout based on screen resolution and device type,
// anchors layout to the left, prevents button cutoffs, and provides manual fit controls.

import { store } from './state.js';
import { openScreenFitModal } from './views/screenFitModal.js';

export const LAYOUT_MODES = {
  AUTO: 'auto',
  LEFT: 'left',
  COMPACT: 'compact',
  CENTERED: 'centered'
};

export const UI_SCALES = [90, 95, 100, 105];

export function getDeviceProfile() {
  if (typeof window === 'undefined') {
    return { type: 'desktop', label: 'Desktop Display', width: 1440, height: 900, dpr: 1 };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  if (width < 640) {
    return { type: 'mobile', label: `Mobile Phone (${width}×${height})`, width, height, dpr };
  } else if (width < 1024) {
    return { type: 'tablet', label: `Tablet Device (${width}×${height})`, width, height, dpr };
  } else if (width <= 1440) {
    return { type: 'laptop', label: `Laptop / Scaled Screen (${width}×${height})`, width, height, dpr };
  } else if (width <= 1920) {
    return { type: 'desktop', label: `Desktop Monitor (${width}×${height})`, width, height, dpr };
  } else {
    return { type: 'ultrawide', label: `Ultra-Wide Screen (${width}×${height})`, width, height, dpr };
  }
}

export function applyLayoutMode(mode, scale) {
  if (typeof document === 'undefined') return;

  const validModes = Object.values(LAYOUT_MODES);
  const cleanMode = validModes.includes(mode) ? mode : LAYOUT_MODES.AUTO;
  const validScale = [90, 95, 100, 105].includes(Number(scale)) ? Number(scale) : 100;

  const root = document.documentElement;
  root.setAttribute('data-layout-mode', cleanMode);
  root.setAttribute('data-ui-scale', String(validScale));

  // Determine resolved layout
  let resolvedLayout = cleanMode;
  if (cleanMode === LAYOUT_MODES.AUTO) {
    const dev = getDeviceProfile();
    if (dev.type === 'laptop' || dev.width <= 1440) {
      resolvedLayout = 'left';
    } else {
      resolvedLayout = 'left'; // Default to left-weighted to avoid giant centered void and right-side cutoffs
    }
  }

  root.setAttribute('data-resolved-layout', resolvedLayout);

  // Apply UI scale via CSS zoom or scale custom property
  const scaleRatio = validScale / 100;
  if (root.style && typeof root.style.setProperty === 'function') {
    root.style.setProperty('--pedaia-ui-scale', String(scaleRatio));
  }
  if (document.body) {
    if (validScale !== 100) {
      document.body.style.zoom = String(scaleRatio);
    } else {
      document.body.style.zoom = '';
    }
  }

  // Update header screen fit indicators if present
  updateScreenFitDropdownUI(cleanMode, validScale);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pedaia-layout-changed', {
      detail: { mode: cleanMode, resolved: resolvedLayout, scale: validScale }
    }));
  }
}

function updateScreenFitDropdownUI(currentMode, currentScale) {
  if (typeof document === 'undefined') return;

  const dev = getDeviceProfile();
  const resBadge = document.getElementById('screen-fit-res-badge');
  const devText = document.getElementById('screen-fit-detected-device');
  const scaleVal = document.getElementById('screen-fit-scale-val');
  const headerLabel = document.getElementById('header-screen-fit-label');

  if (resBadge) resBadge.textContent = `${dev.width}×${dev.height}`;
  if (devText) devText.textContent = dev.label;
  if (scaleVal) scaleVal.textContent = `${currentScale}%`;

  if (headerLabel) {
    if (currentMode === 'left') headerLabel.textContent = 'Left-Fit';
    else if (currentMode === 'compact') headerLabel.textContent = 'Compact';
    else if (currentMode === 'centered') headerLabel.textContent = 'Centered';
    else headerLabel.textContent = 'Auto-Fit';
  }

  // Highlight active layout option card
  document.querySelectorAll('.screen-layout-opt-btn').forEach(btn => {
    const m = btn.getAttribute('data-mode');
    const isAct = (m === currentMode);
    const check = btn.querySelector('.layout-check');

    if (isAct) {
      btn.classList.add('border-indigo-600', 'bg-indigo-50/70', 'dark:bg-indigo-950/60', 'ring-1', 'ring-indigo-500/40');
      btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800');
      if (check) check.classList.remove('hidden');
    } else {
      btn.classList.remove('border-indigo-600', 'bg-indigo-50/70', 'dark:bg-indigo-950/60', 'ring-1', 'ring-indigo-500/40');
      btn.classList.add('border-slate-200', 'dark:border-slate-700');
      if (check) check.classList.add('hidden');
    }
  });

  // Highlight active scale button
  document.querySelectorAll('.scale-opt-btn').forEach(btn => {
    const s = Number(btn.getAttribute('data-scale'));
    const isAct = (s === currentScale);
    if (isAct) {
      btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
      btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-200');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
      btn.classList.add('bg-white', 'dark:bg-slate-800');
    }
  });
}

export function setupScreenFitListeners() {
  if (typeof document === 'undefined') return;

  const btn = document.getElementById('header-screen-fit-btn');
  const mobileBtn = document.getElementById('mobile-sidebar-screen-fit-btn');

  const handleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openScreenFitModal({ showToast: window.showToast });
  };

  btn?.addEventListener('click', handleOpen);
  mobileBtn?.addEventListener('click', handleOpen);
}

export function setupMobileHeaderScroll() {
  if (typeof document === 'undefined') return;
  const masthead = document.getElementById('top-masthead');
  if (!masthead) return;

  // Enable mouse wheel horizontal scrolling when content overflows on mobile widths
  masthead.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0 && masthead.scrollWidth > masthead.clientWidth) {
      masthead.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  // When auth buttons are tapped or focused, ensure they smoothly scroll into full view
  const signupBtn = document.getElementById('header-signup-btn');
  const loginBtn = document.getElementById('header-login-btn');
  [signupBtn, loginBtn].forEach(btn => {
    btn?.addEventListener('focus', () => {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    });
  });
}

export function initLayoutManager() {
  if (typeof window === 'undefined') return;

  window.applyLayoutMode = applyLayoutMode;

  const initialMode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
  const initialScale = store.getUiScale ? store.getUiScale() : 100;

  applyLayoutMode(initialMode, initialScale);
  setupScreenFitListeners();
  setupMobileHeaderScroll();

  // Listen for store layoutChanged
  if (store.subscribe) {
    store.subscribe((evt, payload) => {
      if (evt === 'layoutChanged' && payload) {
        applyLayoutMode(payload.mode, payload.scale);
      }
    });
  }

  // Handle browser window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const mode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
      const scale = store.getUiScale ? store.getUiScale() : 100;
      applyLayoutMode(mode, scale);
    }, 150);
  });
}

export { openScreenFitModal };

export default {
  LAYOUT_MODES,
  UI_SCALES,
  getDeviceProfile,
  applyLayoutMode,
  setupScreenFitListeners,
  openScreenFitModal,
  initLayoutManager
};
