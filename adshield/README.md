# AdShield — Clean, Private Browsing

AdShield is a self-contained Chrome Manifest V3 privacy shield designed to behave like a lightweight Brave-style blocker. It uses Chrome's built-in Declarative Net Request engine, so blocking decisions happen in the browser without sending browsing history to a remote server.

## Features

- Display, video, pop-up, and common ad-network blocking.
- Converted EasyList and EasyPrivacy coverage for broad international ad and tracker protection.
- Optional privacy shield for analytics and tracking domains.
- Redirect defense for common pop-under, link-shortener, clickunder, and ad-navigation networks.
- Local protection against suspicious ad links and pop-under calls from page scripts.
- Local cosmetic cleanup for empty ad containers.
- One-click global pause/resume.
- Advanced strict mode toggle and local blocked-request counter.
- No remote code, no analytics, no account, no external service, and no sync storage.
- Content Security Policy by default through Manifest V3.

## Install locally in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this `adshield` folder.
5. Pin AdShield from the puzzle-piece menu for quick access.

## Project structure

- `manifest.json` — MV3 extension configuration.
- `background.js` — settings and ruleset lifecycle.
- `rules/` — static network blocking lists, including redirect defense.
- `vendor/` — source subscriptions used to regenerate the converted rules.
- `tools/convert_filters.py` — reproducible ABP-to-MV3 conversion script.
- `content/cosmetics.js` — optional page-local cleanup.
- `popup/` — popup UI and controls.

## Security notes

The extension does not use `eval`, remote scripts, injected frames, or a web server. The `declarativeNetRequest` rules are static JSON and the popup stores preferences only in `chrome.storage.local`. Redirect blocking is deliberately domain-based so normal navigation remains usable; no blocker can guarantee every ad on every site because websites change and some ads are first-party. For a production release, audit and maintain the domain lists, add automated rule validation, and consider requesting only the minimum host permissions needed for the chosen distribution model.

The bundled subscriptions were downloaded from the official EasyList project on 8 November 2026. Regenerate them periodically with the same sources because ad networks and filter lists change.
