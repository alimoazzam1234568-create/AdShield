(() => {
  const baseSelectors = [
    '[id*="ad-"]', '[id^="ad_"]', '[class*=" ad-"]', '[class^="ad-"]',
    '[class*="advert"]', '[class*="sponsor"]', '[data-ad-slot]', '[data-ad-client]',
    'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
    '.google-ad', '.adsbygoogle', '.ad-container', '.ad-wrapper', '.ad-banner'
  ];

  const hide = (strictMode) => {
    const selectors = strictMode ? baseSelectors.concat([
      '[aria-label*="advertisement" i]', '[data-testid*="ad" i]', '[data-ad-name]',
      '[class*="promoted"]', '[class*="sponsored"]'
    ]) : baseSelectors;
    try {
      document.querySelectorAll(selectors.join(',')).forEach((node) => {
        if (node instanceof HTMLElement && !node.dataset.adshieldHidden) {
          node.dataset.adshieldHidden = '1';
          node.style.setProperty('display', 'none', 'important');
        }
      });
    } catch (_) {}
  };

  const redirectHosts = /(?:adf\.ly|shorte\.st|bc\.vc|ouo\.io|linkvertise\.com|onclickads\.net|popads\.net|propellerads\.com|exdynsrv\.com|oclasrv\.com|trafficjunky\.net|juicyads\.com)$/i;
  const blockRedirectClicks = (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link) return;
    try {
      const url = new URL(link.href, location.href);
      if (redirectHosts.test(url.hostname)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    } catch (_) {}
  };

  const blockPopups = () => {
    const originalOpen = window.open;
    window.open = (...args) => {
      try {
        const target = args[0] ? new URL(String(args[0]), location.href) : null;
        if (target && redirectHosts.test(target.hostname)) return null;
      } catch (_) {}
      return originalOpen(...args);
    };
  };

  chrome.storage.local.get(['enabled', 'cosmetic', 'strictMode']).then(({ enabled = true, cosmetic = true, strictMode = false }) => {
    if (!enabled || !cosmetic) return;
    hide(strictMode);
    document.addEventListener('click', blockRedirectClicks, true);
    blockPopups();
    new MutationObserver(() => hide(strictMode)).observe(document.documentElement, { childList: true, subtree: true });
  });
})();
