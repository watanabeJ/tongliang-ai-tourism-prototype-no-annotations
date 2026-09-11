"""Select actionable current-page candidates and append element inventories to specs."""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ANN_ROOT = ROOT / "prototype-annotator"
CURRENT_PAGES = {f"P{i}" for i in range(15, 30)}
DETAIL_DIMS = {
    "Primary action", "Flow and navigation", "Form and validation",
    "State and exception", "AI and automation", "Permission and risk",
    "Surface field", "Surface action", "Surface confirm", "Surface trigger",
}
FORCE_CANDIDATES = {"CAND-P23-005"}

def label(candidate: dict) -> str:
    value = candidate.get("fallbackText") or candidate.get("attrs", {}).get("aria-label") or candidate.get("tag") or "页面元素"
    return " ".join(str(value).split())[:80].replace("|", "\\|")

def detail(candidate: dict) -> str:
    dim = candidate.get("dimension")
    tag = candidate.get("tag", "")
    if dim == "Form and validation" or tag in {"input", "textarea", "select"}:
        return "录入或修改当前字段；提交前校验必填性和格式，失败时保留输入并提示修正。"
    if dim == "Flow and navigation":
        return "点击后进入对应页面或返回上级页面；不改变已提交数据。"
    if dim and dim.startswith("Surface"):
        return "仅在对应弹窗、抽屉或二级承载面打开时显示；完成、取消或关闭后返回原页面。"
    if dim == "AI and automation":
        return "触发 AI 解析、分类或审核；不改变事实，失败时不自动放行。"
    if dim == "Permission and risk":
        return "执行前校验账号状态和权限；不满足条件时禁止操作并提示原因。"
    return "点击后执行当前业务动作；成功后更新状态，失败时保留原状态并提示。"

def mark_reviewed(text: str) -> str:
    text = re.sub(r'^sourceType:\s*"[^"]+"', 'sourceType: "ai-reviewed"', text, flags=re.M)
    text = re.sub(r'^aiReviewRequired:\s*\w+', 'aiReviewRequired: false', text, flags=re.M)
    text = re.sub(r'^aiReviewStatus:\s*"[^"]+"', 'aiReviewStatus: "completed"', text, flags=re.M)
    if "aiReviewRequired:" not in text:
        text = text.replace("lastManualEditedAt: null", "lastManualEditedAt: null\naiReviewRequired: false\naiReviewStatus: \"completed\"")
    return text

def main() -> None:
    candidate_path = ANN_ROOT / "annotation-candidates.json"
    data = json.loads(candidate_path.read_text(encoding="utf-8"))
    selected = 0
    all_candidates = list(data.get("candidates", []))
    for page in data.get("pages", []):
        all_candidates.extend(page.get("candidates", []))
    for item in all_candidates:
        if item.get("pageKey") in CURRENT_PAGES and (item.get("dimension") in DETAIL_DIMS or item.get("candidateId") in FORCE_CANDIDATES):
            if not item.get("selected"):
                selected += 1
            item["selected"] = True
            item.pop("skipReason", None)
    candidate_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    grouped: dict[str, list[dict]] = {}
    for item in all_candidates:
        if item.get("pageKey") in CURRENT_PAGES and item.get("selected") and (item.get("dimension") in DETAIL_DIMS or item.get("candidateId") in FORCE_CANDIDATES):
            grouped.setdefault(item["pageKey"], []).append(item)

    registry = json.loads((ANN_ROOT / "specs" / "registry.json").read_text(encoding="utf-8"))
    stem_to_page = {Path(entry["path"]).stem: entry["pageKey"] for entry in registry["pages"] if "/" not in entry["path"].replace("\\", "/")}
    spec_root = ROOT / "prototype-specs" / "current"
    updated = 0
    for spec_path in spec_root.glob("*.md"):
        page_key = stem_to_page.get(spec_path.stem)
        items = grouped.get(page_key, [])
        if not items:
            continue
        text = mark_reviewed(spec_path.read_text(encoding="utf-8"))
        text = re.sub(r"\n## 页面元素细节[\s\S]*?(?=\n## |\Z)", "", text)
        rows, seen = [], set()
        for item in sorted(items, key=lambda x: (x.get("score", 0) * -1, x.get("candidateId", ""))):
            key = (item.get("selector"), item.get("dimension"))
            if key in seen:
                continue
            seen.add(key)
            required = "是" if item.get("attrs", {}).get("required") is not None or "*" in str(item.get("fallbackText", "")) else "否/不适用"
            rows.append(f"| {label(item)} | {item.get('annotationType', 'A')} | {required} | {detail(item)} |")
        section = ("\n\n## 页面元素细节\n\n"
                   "| 元素 | 类型 | 必填 | 交互与规则 |\n"
                   "|---|---|---|---|\n" + "\n".join(rows) + "\n")
        spec_path.write_text(text.rstrip() + section, encoding="utf-8")
        updated += 1
    lite_root = ANN_ROOT / "specs" / "current"
    for page_key, items in grouped.items():
        spec_path = lite_root / f"{page_key}.md"
        if not spec_path.exists():
            continue
        text = mark_reviewed(spec_path.read_text(encoding="utf-8"))
        text = re.sub(r"\n## 页面元素细节[\s\S]*?(?=\n## |\Z)", "", text)
        rows, seen = [], set()
        for item in sorted(items, key=lambda x: (x.get("score", 0) * -1, x.get("candidateId", ""))):
            key = (item.get("selector"), item.get("dimension"))
            if key in seen:
                continue
            seen.add(key)
            required = "是" if item.get("attrs", {}).get("required") is not None or "*" in str(item.get("fallbackText", "")) else "否/不适用"
            rows.append(f"| {label(item)} | {item.get('annotationType', 'A')} | {required} | {detail(item)} |")
        section = ("\n\n## 页面元素细节\n\n"
                   "| 元素 | 类型 | 必填 | 交互与规则 |\n"
                   "|---|---|---|---|\n" + "\n".join(rows) + "\n")
        spec_path.write_text(text.rstrip() + section, encoding="utf-8")
    print(f"Selected new candidates: {selected}; enriched specs: {updated}")

if __name__ == "__main__":
    main()
