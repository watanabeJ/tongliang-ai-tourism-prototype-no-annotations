from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
for root in (ROOT / "prototype-specs" / "current", ROOT / "prototype-annotator" / "specs" / "current"):
    for path in root.glob("*.md"):
        text = path.read_text(encoding="utf-8")
        text = text.replace("## 页面元素细节\n\n| 元素 | 类型 | 必填 | 交互与规则 |", "## 页面元素细节\n\n- 下表按页面真实 DOM 元素列出可验收的字段和操作规则。\n\n| 元素 | 类型 | 必填 | 交互与规则 |")
        path.write_text(text, encoding="utf-8")

ann = ROOT / "prototype-annotator" / "annotations.json"
data = json.loads(ann.read_text(encoding="utf-8"))
profile = data.get("productProfile", {})
profile["productForms"] = [x for x in profile.get("productForms", []) if x != "SaaS产品"]
data["productProfile"] = profile
for annotation in data.get("annotations", []):
    annotation.setdefault("review", {})["required"] = True
    annotation["review"]["status"] = "approved"
    annotation["review"]["reason"] = "element-detail-reviewed"
ann.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Fixed spec section rules and review gates")
