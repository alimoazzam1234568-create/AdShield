#!/usr/bin/env python3
"""Convert a practical, safe subset of ABP filter syntax into MV3 DNR rules."""
import json
import re
import sys
from pathlib import Path

RESOURCE_TYPES = {
    'document': 'main_frame', 'popup': 'main_frame', 'subdocument': 'sub_frame',
    'script': 'script', 'image': 'image', 'stylesheet': 'stylesheet',
    'object': 'object', 'xmlhttprequest': 'xmlhttprequest', 'font': 'font',
    'media': 'media', 'websocket': 'websocket', 'ping': 'ping', 'other': 'other'
}
SKIP_OPTIONS = {'badfilter', 'elemhide', 'generichide', 'genericblock', 'specifichide',
                'jsinject', 'webrtc', 'csp', 'header', 'removeparam', 'redirect',
                'redirect-rule', 'urltransform', 'denyallow', 'replace'}


def convert(path: Path, max_rules: int, start_id: int):
    rules = []
    seen = set()
    pending = []
    for raw in path.read_text(errors='ignore').splitlines():
        line = raw.strip()
        if not line or line.startswith(('!', '[', '#', '/')):
            continue
        exception = line.startswith('@@')
        if exception:
            line = line[2:]
        if '#' in line:
            continue
        pieces = line.split('$', 1)
        pattern = pieces[0]
        if not pattern or len(pattern) > 1800 or pattern.startswith('/'):
            continue
        options = pieces[1].split(',') if len(pieces) == 2 else []
        if any(opt.split('=')[0].lower() in SKIP_OPTIONS for opt in options):
            continue
        if any(opt.startswith('~') and opt[1:].split('=')[0] in RESOURCE_TYPES for opt in options):
            continue
        resource_types = []
        initiator_domains = []
        excluded_initiator_domains = []
        domain_type = None
        supported = True
        for opt in options:
            name, _, value = opt.partition('=')
            name = name.lower()
            if name in RESOURCE_TYPES:
                resource_types.append(RESOURCE_TYPES[name])
            elif name == 'third-party':
                domain_type = 'thirdParty'
            elif name == '~third-party':
                domain_type = 'firstParty'
            elif name == 'domain' and value:
                for domain in value.split('|'):
                    if domain.startswith('~'):
                        excluded_initiator_domains.append(domain[1:])
                    else:
                        initiator_domains.append(domain)
            elif name in {'important', 'match-case', 'generichide', 'genericblock'}:
                continue
            elif name.startswith('~') or name in {'first-party', 'strict1p', 'to=com', 'from=com'}:
                continue
            elif name:
                supported = False
        if not supported:
            continue
        # DNR urlFilter uses the same useful separator syntax for common ABP rules.
        key = (exception, pattern, tuple(resource_types), tuple(initiator_domains), tuple(excluded_initiator_domains), domain_type)
        if key in seen:
            continue
        seen.add(key)
        condition = {'urlFilter': pattern, 'resourceTypes': resource_types or ['main_frame', 'sub_frame', 'script', 'image', 'stylesheet', 'object', 'xmlhttprequest', 'font', 'media', 'websocket', 'ping', 'other']}
        if initiator_domains:
            condition['initiatorDomains'] = initiator_domains[:100]
        if excluded_initiator_domains:
            condition['excludedInitiatorDomains'] = excluded_initiator_domains[:100]
        if domain_type:
            condition['domainType'] = domain_type
        pending.append({'priority': 100 if exception else 1, 'action': {'type': 'allow' if exception else 'block'}, 'condition': condition})
    # Keep exceptions first so important allow rules survive the practical cap.
    pending.sort(key=lambda r: (0 if r['action']['type'] == 'allow' else 1, -r['priority']))
    for i, rule in enumerate(pending[:max_rules], start=start_id):
        rule['id'] = i
        rules.append(rule)
    return rules


def main():
    if len(sys.argv) != 4:
        raise SystemExit('usage: convert_filters.py INPUT OUTPUT MAX_RULES')
    source, output, cap = map(Path, sys.argv[1:]) if False else (Path(sys.argv[1]), Path(sys.argv[2]), int(sys.argv[3]))
    rules = convert(source, cap, 1)
    Path(output).write_text(json.dumps(rules, separators=(',', ':')) + '\n')
    print(f'{source.name}: wrote {len(rules)} rules to {output}')

if __name__ == '__main__':
    main()
