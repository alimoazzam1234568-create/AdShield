const ids = ['enabled', 'privacy', 'cosmetic', 'annoyances', 'strictMode'];
const $ = (id) => document.getElementById(id);
let settings = {};

async function init() {
  settings = await chrome.storage.local.get({ enabled: true, privacy: true, cosmetic: true, annoyances: true, strictMode: false, blockedCount: 0 });
  ids.forEach((id) => { $(id).checked = Boolean(settings[id]); });
  renderStatus();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  $('site-name').textContent = tab?.title || tab?.url?.replace(/^https?:\/\//, '').split('/')[0] || 'This site';
  const stats = await chrome.runtime.sendMessage({ type: 'getTabStats', tabId: tab?.id });
  $('page-blocked').textContent = stats?.blocked ?? 0;
}

function renderStatus() {
  const active = settings.enabled;
  $('status-text').textContent = active ? 'Protection is active' : 'Protection is paused';
  $('status-dot').classList.toggle('off', !active);
  $('power').classList.toggle('off', !active);
  $('blocked-count').textContent = formatCount(settings.blockedCount || 0);
}

function formatCount(value) { return value > 999 ? `${(value / 1000).toFixed(1)}k` : value; }

async function save() {
  settings = { ...settings, ...Object.fromEntries(ids.map((id) => [id, $(id).checked])) };
  await chrome.storage.local.set(settings);
  await chrome.runtime.sendMessage({ type: 'settingsChanged', settings });
  renderStatus();
}

ids.forEach((id) => $(id).addEventListener('change', save));
$('power').addEventListener('click', async () => { $('enabled').checked = !$('enabled').checked; await save(); });
$('advanced-toggle').addEventListener('click', () => {
  const open = $('advanced-toggle').getAttribute('aria-expanded') === 'true';
  $('advanced-toggle').setAttribute('aria-expanded', String(!open));
  $('advanced-panel').hidden = open;
});
$('reset').addEventListener('click', async () => { settings.blockedCount = 0; await chrome.storage.local.set({ blockedCount: 0 }); renderStatus(); });
chrome.storage.onChanged.addListener((changes) => { if (changes.blockedCount) { settings.blockedCount = changes.blockedCount.newValue; renderStatus(); } });
init();
