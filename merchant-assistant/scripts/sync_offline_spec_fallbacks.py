"""Embed each current page spec in static HTML for reliable file:// viewing.

The normal local server dynamically injects the same data. Keeping a physical
fallback lets an external browser render the requirement view even when the
prototype is opened directly from the filesystem. Editing still requires the
local server because the save API is intentionally HTTP-only.
"""
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPECS = ROOT / "prototype-specs" / "current"
MARKER = "<!-- proto-spec-annotator-viewer:start -->"
PATTERN = re.compile(
    r'<script type="application/json" data-proto-spec-markdown="([^"]+)">[\s\S]*?</script>\s*',
    re.I,
)


def main() -> None:
    updated = 0
    skipped: list[str] = []
    for html_path in sorted(ROOT.glob("*.html")):
        source = html_path.read_text(encoding="utf-8")
        key_match = re.search(r'const pageKey = "([^"]+)";', source)
        if not key_match or MARKER not in source:
            skipped.append(html_path.name)
            continue
        page_key = key_match.group(1)
        spec_path = SPECS / f"{page_key}.md"
        if not spec_path.exists():
            skipped.append(html_path.name)
            continue
        payload = json.dumps(spec_path.read_text(encoding="utf-8"), ensure_ascii=False).replace("<", "\\u003c")
        script = f'<script type="application/json" data-proto-spec-markdown="{page_key}">{payload}</script>\n'
        source = PATTERN.sub("", source)
        source = source.replace(MARKER, script + MARKER, 1)
        html_path.write_text(source, encoding="utf-8")
        updated += 1
    print(f"Offline requirement fallbacks synced: {updated}; skipped: {', '.join(skipped) or 'none'}")


if __name__ == "__main__":
    main()
