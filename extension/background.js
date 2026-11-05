// PEDAIA Browser Extension — Background Service Worker (Universal Manifest V3: Chrome, Edge, Firefox, Brave, Opera)

const DEFAULT_WEB_URL = 'http://localhost:3000';

async function getPedaiaUrl() {
  try {
    const data = await chrome.storage.local.get(['pedaiaUrl']);
    return data.pedaiaUrl || DEFAULT_WEB_URL;
  } catch {
    return DEFAULT_WEB_URL;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  // Set side panel behavior to open on action if configured
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }

  // Create Context Menus
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'pedaia-root',
      title: 'PEDAIA Instructional Studio',
      contexts: ['selection', 'page']
    });

    chrome.contextMenus.create({
      id: 'pedaia-lesson-planner',
      parentId: 'pedaia-root',
      title: 'Create Lesson Plan from Selection',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'pedaia-questions',
      parentId: 'pedaia-root',
      title: 'Generate Bloom\'s Questions from Selection',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'pedaia-activity',
      parentId: 'pedaia-root',
      title: 'Design Experiential Activity from Concept',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'pedaia-differentiate',
      parentId: 'pedaia-root',
      title: 'Differentiate Selected Curriculum Standard',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'pedaia-open-panel',
      parentId: 'pedaia-root',
      title: 'Open PEDAIA in Side Panel',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'pedaia-open-full',
      parentId: 'pedaia-root',
      title: 'Launch Full PEDAIA Studio ↗',
      contexts: ['all']
    });
  });
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText || '';
  const pageUrl = tab ? tab.url : '';
  const pageTitle = tab ? tab.title : '';

  const webUrl = await getPedaiaUrl();

  if (info.menuItemId === 'pedaia-open-full') {
    // Open full studio in tab
    chrome.tabs.create({ url: webUrl });
    return;
  }

  // Store clipped text into extension storage so Side Panel or Popup can pick it up immediately
  const clipData = {
    text: selectedText,
    url: pageUrl,
    title: pageTitle,
    targetStudio: getTargetStudio(info.menuItemId),
    timestamp: Date.now()
  };

  await chrome.storage.local.set({ activeClip: clipData });

  // Open the Chrome Side Panel if available
  if (chrome.sidePanel && tab && tab.windowId) {
    try {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } catch {
      // Fallback: open in new tab with hash
      const hash = getStudioHash(info.menuItemId);
      chrome.tabs.create({ url: `${webUrl}/#${hash}` });
    }
  } else {
    const hash = getStudioHash(info.menuItemId);
    chrome.tabs.create({ url: `${webUrl}/#${hash}` });
  }
});

// Keyboard Commands
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === 'open_side_panel' && chrome.sidePanel && tab && tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  }
});

function getTargetStudio(menuId) {
  switch (menuId) {
    case 'pedaia-lesson-planner': return 'lesson-planning';
    case 'pedaia-questions': return 'questioning';
    case 'pedaia-activity': return 'activity-design';
    case 'pedaia-differentiate': return 'differentiation';
    default: return 'lesson-planning';
  }
}

function getStudioHash(menuId) {
  switch (menuId) {
    case 'pedaia-lesson-planner': return 'lesson-planning';
    case 'pedaia-questions': return 'questioning';
    case 'pedaia-activity': return 'activity-design';
    case 'pedaia-differentiate': return 'differentiation';
    default: return 'dashboard';
  }
}
