[AdShield.txt](https://github.com/user-attachments/files/34538859/AdShield.txt)
# AdShield

<p align="center">
  <strong>Brave-style ad and tracker protection for Google Chrome.</strong><br>
  Fast, local-first, and built on Chrome Manifest V3.
</p>

<p align="center">
  <img src="icons/icon-128.png" width="88" alt="AdShield shield logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white" alt="Chrome Manifest V3">
  <img src="https://img.shields.io/badge/Version-2.0.0-78D85B" alt="Version 2.0.0">
  <img src="https://img.shields.io/badge/Privacy-local--first-78D85B" alt="Local first privacy">
  <img src="https://img.shields.io/badge/Status-experimental-F4B942" alt="Experimental status">
</p>

AdShield is a privacy-focused Chrome extension that blocks advertising, trackers, pop-ups, pop-unders, and common redirect networks. It combines Chrome's native Declarative Net Request API with converted EasyList and EasyPrivacy filter coverage.

> AdShield is an independent project inspired by the protection model of privacy-focused browsers. It does not contain proprietary Brave code.

![AdShield popup preview](https://private-us-east-1.manuscdn.com/sessionFile/BEWomFzZSlfl7XGHlRs59w/sandbox/j5VDdNF407y2DHAyX01Nw2-images_1794118978382_na1fn_L2hvbWUvdWJ1bnR1L2Fkc2hpZWxkL2Fkc2hpZWxkLXBvcHVwLXByZXZpZXc.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQkVXb21GelpTbGZsN1hHSGxSczU5dy9zYW5kYm94L2o1VkRkTkY0MDd5MkRIQXlYMDFOdzItaW1hZ2VzXzE3OTQxMTg5NzgzODJfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyRmtjMmhwWld4a0wyRmtjMmhwWld4a0xYQnZjSFZ3TFhCeVpYWnBaWGMucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk2MDgzMjAwfX19XX0_&Key-Pair-Id=K2QY5QTL8JSY6C&Signature=MEQCIFsKuIs4jyqYNfJZ~u8yGU51JTAySZDpwCVrZqfQtuOWAiBsROO-NXYPoyYYJw3AIHZM8GmeraTMmXOnbKWiNzPoMw__)

## Contents

- [Highlights](#highlights)
- [Installation](#installation)
- [Using AdShield](#using-adshield)
- [Architecture](#architecture)
- [Development](#development)
- [Updating filter lists](#updating-filter-lists)
- [Privacy and security](#privacy-and-security)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Sources](#sources)

## Highlights

- **Broad network filtering** with 22,000 converted EasyList rules.
- **Tracker protection** with 7,000 converted EasyPrivacy rules.
- **Redirect defense** for known ad shorteners, clickunder networks, pop-under services, and suspicious navigation domains.
- **Cosmetic cleanup** for ad containers and empty placeholders left in page markup.
- **Local-first privacy** with no account, analytics, remote filtering server, or browsing-history upload.
- **Simple controls** with one-click pause/resume and separate protection layers.
- **Branded toolbar icon** with 16px, 32px, 48px, and 128px assets.

## Installation

### Install from a downloaded package

1. Download and extract the latest `adshield.zip` package.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted `adshield` directory.
6. Pin AdShield from Chrome's Extensions menu.

### Install from a Git clone

```bash
git clone <your-repository-url>
cd adshield
```

Then load the repository directory through `chrome://extensions` using the same **Load unpacked** steps above.

## Using AdShield

Open the toolbar popup to control the protection layers:

| Control | Behavior |
| --- | --- |
| **Ad blocking** | Enables the main EasyList and core ad rules. |
| **Privacy shield** | Enables EasyPrivacy tracker and analytics rules. |
| **Cosmetic cleanup** | Hides common ad containers and placeholders in page markup. |
| **Annoyance filter** | Enables redirect, pop-under, and clickunder protection. |
| **Strict mode** | Applies broader local cosmetic matching. |
| **Power button** | Pauses or resumes all network protection. |

Settings and the local blocked-request counter are stored with `chrome.storage.local`.

## Architecture

```text
Chrome page request
        │
        ▼
Declarative Net Request
        │
        ├── EasyList rules          → ads and ad servers
        ├── EasyPrivacy rules       → trackers and analytics
        ├── Redirect defense        → pop-unders and navigation redirects
        └── Core rules              → common high-confidence patterns
        │
        ▼
Local cosmetic script              → removes visible placeholders and pop-up behavior
```

### Repository layout

```text
adshield/
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Ruleset lifecycle, settings, and statistics
├── content/
│   └── cosmetics.js           # Cosmetic cleanup and local pop-up defense
├── icons/
│   ├── icon.svg               # Source shield logo
│   └── icon-*.png             # Chrome icon sizes
├── popup/
│   ├── popup.html              # Toolbar popup markup
│   ├── popup.css               # Popup styling
│   └── popup.js                 # Popup controls and statistics
├── rules/
│   ├── ads-core.json            # Core ad rules
│   ├── privacy-core.json        # Core privacy rules
│   ├── redirect-defense.json    # Redirect and pop-under rules
│   ├── easylist-dnr.json        # Converted EasyList rules
│   └── easyprivacy-dnr.json     # Converted EasyPrivacy rules
├── tools/
│   └── convert_filters.py       # ABP-to-MV3 conversion script
├── vendor/
│   ├── easylist.txt             # EasyList source snapshot
│   └── easyprivacy.txt          # EasyPrivacy source snapshot
└── validate.py                  # Local validation checks
```

## Development

No package manager or build server is required for the extension itself. The project uses plain JavaScript, CSS, JSON, and Python tooling.

Run the validation suite before loading changes into Chrome:

```bash
python3 validate.py
node --check background.js
node --check content/cosmetics.js
node --check popup/popup.js
python3 -m json.tool manifest.json >/dev/null
```

After changing extension files, open `chrome://extensions` and click **Reload** on AdShield.

## Updating filter lists

The bundled rules are generated snapshots. Refresh them periodically because advertising and tracking domains change continuously.

```bash
curl -L https://easylist.to/easylist/easylist.txt \
  -o vendor/easylist.txt

curl -L https://easylist.to/easylist/easyprivacy.txt \
  -o vendor/easyprivacy.txt

python3 tools/convert_filters.py \
  vendor/easylist.txt rules/easylist-dnr.json 22000

python3 tools/convert_filters.py \
  vendor/easyprivacy.txt rules/easyprivacy-dnr.json 7000

python3 validate.py
```

The converter intentionally supports a safe subset of Adblock Plus syntax that maps cleanly to Chrome's Declarative Net Request rules. Cosmetic-only and unsupported advanced filters are skipped rather than silently converted incorrectly.

## Privacy and security

AdShield is designed to operate locally:

- No user account is required.
- No browsing history is sent to a remote server.
- No analytics or telemetry is included.
- No remote JavaScript or remote extension code is loaded.
- No `eval`, injected remote frames, or extension web server is used.
- Filter rules are packaged with the extension.
- Settings are stored locally using `chrome.storage.local`.

The extension requests broad host access because an ad blocker must inspect requests across the pages where it is enabled. Review `manifest.json` before distributing the extension publicly.

## Known limitations

No browser extension can guarantee that every ad or redirect will be blocked. Websites can serve ads from their own first-party domain, generate rotating URLs, use service workers, or change their delivery technique faster than filter lists can be updated.

Chrome's extension APIs also limit interception after a navigation has already started. AdShield therefore combines network rules with page-level defenses, but some site-specific behavior may still require a custom rule or a temporary protection pause.

If a website breaks:

1. Disable **Strict mode**.
2. Disable **Privacy shield** temporarily.
3. Disable **Annoyance filter** if the problem is related to navigation.
4. Reload the page after changing a setting.

## Roadmap

- Add per-site allowlist controls.
- Add an in-popup “report missed ad” workflow.
- Add automated scheduled filter-list refresh for development builds.
- Expand cosmetic filter conversion coverage.
- Add end-to-end fixture pages for ad and redirect regression tests.

## Contributing

Contributions are welcome. Before opening a pull request:

1. Keep changes focused and explain the user-facing behavior.
2. Run the validation and syntax checks listed above.
3. Test the extension on at least one ordinary content site and one redirect-heavy site.
4. Avoid adding remote dependencies or telemetry.
5. Update this README when behavior, permissions, or build steps change.

For filter-list changes, include the source list, generation command, and the reason for the change in the pull request description.

## Sources

- [EasyList](https://github.com/easylist/easylist) — advertising filter list.
- [EasyList project website](https://easylist.to/) — official subscriptions and project information.
- [Chrome Declarative Net Request API](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest) — native browser request filtering API.
- [Chrome Extensions documentation](https://developer.chrome.com/docs/extensions/) — Manifest V3 extension platform documentation.

Review the source-list licenses and terms before redistributing AdShield or publishing it in the Chrome Web Store.
