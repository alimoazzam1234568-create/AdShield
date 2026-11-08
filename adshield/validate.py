import json
from pathlib import Path

root = Path(__file__).parent
manifest = json.loads((root / 'manifest.json').read_text())
assert manifest['manifest_version'] == 3
assert manifest['background']['service_worker'] == 'background.js'
for path in ['background.js', 'content/cosmetics.js', 'popup/popup.html', 'popup/popup.css', 'popup/popup.js', 'rules/ads-core.json', 'rules/privacy-core.json', 'rules/redirect-defense.json']:
    assert (root / path).is_file(), path
for size in ['16', '32', '48', '128']:
    assert (root / 'icons' / f'icon-{size}.png').is_file(), f'icon-{size}.png'
for path in ['rules/ads-core.json', 'rules/privacy-core.json', 'rules/redirect-defense.json']:
    rules = json.loads((root / path).read_text())
    assert rules and all('id' in r and 'action' in r and 'condition' in r for r in rules)
    assert all(r['action']['type'] in {'block', 'redirect'} for r in rules)
print('AdShield validation passed')
