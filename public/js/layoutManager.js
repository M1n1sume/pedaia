// PEDAIA Device & Screen Layout Manager
// Automatically adapts layout based on screen resolution and device type,
// anchors layout to the left, prevents button cutoffs, and provides manual fit controls.

import { store } from './state.js';

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
  const dropdown = document.getElementById('header-screen-fit-dropdown');
  const wrapper = document.getElementById('header-screen-fit-wrapper');

  if (btn && dropdown) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
      if (!dropdown.classList.contains('hidden')) {
        const curMode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
        const curScale = store.getUiScale ? store.getUiScale() : 100;
        updateScreenFitDropdownUI(curMode, curScale);
      }
    });

    document.addEventListener('click', (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // Layout mode buttons click
  document.querySelectorAll('.screen-layout-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode && store.setLayoutMode) {
        store.setLayoutMode(mode);
        const curScale = store.getUiScale ? store.getUiScale() : 100;
        applyLayoutMode(mode, curScale);
        if (window.showToast) {
          const names = {
            auto: '⚡ Smart Device Adaptive',
            left: '⬅️ Left-Aligned (Wide Canvas)',
            compact: '💻 Laptop & Scaled Screen Fit',
            centered: '🎯 Centered Atelier'
          };
          window.showToast(`Layout adjusted to ${names[mode] || mode}`, 'info');
        }
      }
    });
  });

  // Scale buttons click
  document.querySelectorAll('.scale-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = Number(btn.getAttribute('data-scale'));
      if (scale && store.setUiScale) {
        store.setUiScale(scale);
        const curMode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
        applyLayoutMode(curMode, scale);
        if (window.showToast) {
          window.showToast(`Display scale set to ${scale}%`, 'info');
        }
      }
    });
  });
}

// =========================================================================
// MOBILE ANIMATED HEADER ROTATOR
// Alternates smoothly between Account Actions and Studio Tools on Mobile
// =========================================================================

export function initHeaderRotator() {
  if (typeof document === 'undefined') return;

  const rotator = document.getElementById('header-mobile-rotator');
  if (!rotator) return;

  const slideAuth = document.getElementById('mobile-slide-auth');
  const slideTools = document.getElementById('mobile-slide-tools');
  const toggle = document.getElementById('header-rotator-toggle');
  const pills = toggle ? toggle.querySelectorAll('.rotator-pill') : [];

  if (!slideAuth || !slideTools) return;

  let currentSlide = 0; // 0: Auth Actions, 1: Studio Tools
  let autoTimer = null;
  let isInteracting = false;
  let interactionResumeTimer = null;
  const ROTATION_INTERVAL = 5500; // 5.5 seconds per slide rotation

  const isMobile = () => window.innerWidth <= 640;

  function setSlide(index) {
    const prevSlide = currentSlide;
    currentSlide = index % 2;

    const slides = [slideAuth, slideTools];
    slides.forEach((slide, idx) => {
      if (idx === currentSlide) {
        slide.classList.remove('exiting');
        slide.classList.add('active');
      } else if (idx === prevSlide && idx !== currentSlide) {
        slide.classList.remove('active');
        slide.classList.add('exiting');
        setTimeout(() => slide.classList.remove('exiting'), 450);
      } else {
        slide.classList.remove('active', 'exiting');
      }
    });

    // Update indicator micro-pills
    pills.forEach((pill, idx) => {
      const isActive = idx === currentSlide;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function nextSlide() {
    // Halt auto-rotation if dropdown popovers are open or user is currently interacting
    const screenFitDropdown = document.getElementById('header-screen-fit-dropdown');
    const userDropdown = document.getElementById('header-user-dropdown');
    const isDropdownOpen = (screenFitDropdown && !screenFitDropdown.classList.contains('hidden')) ||
                          (userDropdown && !userDropdown.classList.contains('hidden'));

    if (isDropdownOpen || isInteracting || !isMobile()) {
      return;
    }

    setSlide(currentSlide === 0 ? 1 : 0);
  }

  function startTimer() {
    stopTimer();
    if (isMobile()) {
      autoTimer = setInterval(nextSlide, ROTATION_INTERVAL);
    }
  }

  function stopTimer() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function pauseInteraction(resumeDelay = 6500) {
    isInteracting = true;
    stopTimer();
    clearTimeout(interactionResumeTimer);
    interactionResumeTimer = setTimeout(() => {
      isInteracting = false;
      startTimer();
    }, resumeDelay);
  }

  // Toggle button click (manual jump between slides)
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      pauseInteraction(8000);
      const targetPill = e.target.closest('.rotator-pill');
      if (targetPill) {
        const slideName = targetPill.getAttribute('data-slide');
        setSlide(slideName === 'tools' ? 1 : 0);
      } else {
        setSlide(currentSlide === 0 ? 1 : 0);
      }
    });
  }

  // Touch and pointer listeners: pause on hover / touch so user is never interrupted
  rotator.addEventListener('mouseenter', () => pauseInteraction(5000));
  rotator.addEventListener('touchstart', () => pauseInteraction(7500), { passive: true });
  rotator.addEventListener('focusin', () => pauseInteraction(8000));

  // Touch swipe support: swipe left/right across rotator flips slides
  let touchStartX = 0;
  let touchStartY = 0;
  rotator.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  rotator.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) > 28 && Math.abs(deltaX) > Math.abs(deltaY)) {
        pauseInteraction(8000);
        if (deltaX < 0) {
          // Swiped left -> Studio Tools
          setSlide(1);
        } else {
          // Swiped right -> Account
          setSlide(0);
        }
      }
    }
  }, { passive: true });

  // Keyboard accessibility / focus listeners
  const signupBtn = document.getElementById('header-signup-btn');
  const loginBtn = document.getElementById('header-login-btn');
  const screenFitBtn = document.getElementById('header-screen-fit-btn');
  const settingsBtn = document.getElementById('header-settings-btn');

  [signupBtn, loginBtn].forEach(btn => {
    btn?.addEventListener('focus', () => {
      setSlide(0);
      pauseInteraction(8000);
    });
  });

  [screenFitBtn, settingsBtn].forEach(btn => {
    btn?.addEventListener('focus', () => {
      setSlide(1);
      pauseInteraction(8000);
    });
  });

  // Handle window resizing
  window.addEventListener('resize', () => {
    if (isMobile()) {
      if (!autoTimer && !isInteracting) startTimer();
    } else {
      stopTimer();
    }
  });

  // Initialize on Slide 0 (Auth: Log In & Create Account immediately visible)
  setSlide(0);
  startTimer();

  // Expose global rotator API for testing or external controls
  window.headerRotator = {
    setSlide,
    next: () => setSlide(currentSlide === 0 ? 1 : 0),
    getCurrentSlide: () => currentSlide,
    pause: () => pauseInteraction(20000),
    resume: () => { isInteracting = false; startTimer(); }
  };
}

export function initLayoutManager() {
  if (typeof window === 'undefined') return;

  window.applyLayoutMode = applyLayoutMode;

  const initialMode = store.getLayoutMode ? store.getLayoutMode() : 'auto';
  const initialScale = store.getUiScale ? store.getUiScale() : 100;

  applyLayoutMode(initialMode, initialScale);
  setupScreenFitListeners();
  initHeaderRotator();

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

export default {
  LAYOUT_MODES,
  UI_SCALES,
  getDeviceProfile,
  applyLayoutMode,
  setupScreenFitListeners,
  initHeaderRotator,
  initLayoutManager
};
};
