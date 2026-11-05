// PEDAIA Browser Extension — Popup Controller (Universal)

const DEFAULT_WEB_URL = 'http://localhost:3000'; // Default local / hosted URL

async function getPedaiaUrl() {
  try {
    const data = await chrome.storage.local.get(['pedaiaUrl']);
    return data.pedaiaUrl || DEFAULT_WEB_URL;
  } catch {
    return DEFAULT_WEB_URL;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const clipTextEl = document.getElementById('clip-text');
  const clipCountEl = document.getElementById('clip-count');

  // Load existing clip if available
  const stored = await chrome.storage.local.get(['activeClip']);
  if (stored.activeClip && stored.activeClip.text) {
    clipTextEl.textContent = stored.activeClip.text;
    clipCountEl.textContent = `${stored.activeClip.text.length} chars captured`;
  }

  // Capture selection on active tab
  document.getElementById('capture-selection-btn').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      const selected = results?.[0]?.result?.trim();
      if (selected) {
        clipTextEl.textContent = selected;
        clipCountEl.textContent = `${selected.length} chars captured`;
        await chrome.storage.local.set({
          activeClip: {
            text: selected,
            url: tab.url,
            title: tab.title,
            timestamp: Date.now()
          }
        });
      } else {
        clipTextEl.textContent = `No active selection. Highlight text on "${tab.title?.slice(0, 30)}..." and click again.`;
      }
    } catch (err) {
      clipTextEl.textContent = `Capture note: ${err.message}`;
    }
  });

  // Clip to Lesson Plan
  document.getElementById('clip-to-lesson-btn').addEventListener('click', () => {
    openStudio('lesson-planning');
  });

  // Quick navigation buttons
  document.getElementById('nav-lp-btn').addEventListener('click', () => openStudio('lesson-planning'));
  document.getElementById('nav-qs-btn').addEventListener('click', () => openStudio('questioning'));
  document.getElementById('nav-ad-btn').addEventListener('click', () => openStudio('activity-design'));
  document.getElementById('nav-diff-btn').addEventListener('click', () => openStudio('differentiation'));

  // Open Full Studio
  document.getElementById('open-full-app-btn').addEventListener('click', async () => {
    const webUrl = await getPedaiaUrl();
    chrome.tabs.create({ url: webUrl });
  });

  // Dock Side Panel
  document.getElementById('open-sidepanel-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && chrome.sidePanel) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
      window.close();
    } else {
      const webUrl = await getPedaiaUrl();
      chrome.tabs.create({ url: webUrl });
    }
  });
});

async function openStudio(studioRoute) {
  const webUrl = await getPedaiaUrl();
  chrome.tabs.create({ url: `${webUrl}/#${studioRoute}` });
}
