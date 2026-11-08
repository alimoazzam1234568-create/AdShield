const DEFAULTS = {
  enabled: true,
  privacy: true,
  annoyances: true,
  cosmetic: true,
  strictMode: false,
  blockedCount: 0,
  installedAt: Date.now()
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(Object.keys(DEFAULTS));
  await chrome.storage.local.set({ ...DEFAULTS, ...existing });
  await applySettings({ ...DEFAULTS, ...existing });
});

chrome.runtime.onStartup.addListener(async () => {
  await applySettings(await chrome.storage.local.get(Object.keys(DEFAULTS)));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTabStats') {
    getTabStats(sender.tab?.id ?? message.tabId).then(sendResponse);
    return true;
  }
  if (message.type === 'settingsChanged') {
    applySettings(message.settings).then(() => sendResponse({ ok: true }));
    return true;
  }
});

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(async () => {
  const { blockedCount = 0 } = await chrome.storage.local.get('blockedCount');
  await chrome.storage.local.set({ blockedCount: blockedCount + 1 });
});

async function applySettings(settings) {
  const enabled = settings.enabled !== false;
  const privacy = settings.privacy !== false;
  const annoyances = settings.annoyances !== false;

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: [
      ...(enabled ? ['ads_core'] : []),
      ...(enabled && privacy ? ['privacy_core'] : []),
      ...(enabled && annoyances ? ['redirect_defense'] : []),
      ...(enabled ? ['easylist_dnr', 'easyprivacy_dnr'] : [])
    ],
    disableRulesetIds: [
      ...(enabled ? [] : ['ads_core', 'privacy_core', 'redirect_defense', 'easylist_dnr', 'easyprivacy_dnr']),
      ...(enabled && annoyances ? [] : ['redirect_defense']),
      ...(enabled && privacy ? [] : ['privacy_core', 'easyprivacy_dnr'])
    ]
  });

  await chrome.storage.local.set({ enabled, privacy, annoyances });
}

async function getTabStats(tabId) {
  if (!tabId) return { blocked: 0 };
  try {
    const matched = await chrome.declarativeNetRequest.getMatchedRules({ tabId });
    return { blocked: matched.rulesMatchedInfo?.length ?? 0 };
  } catch {
    return { blocked: 0 };
  }
}
