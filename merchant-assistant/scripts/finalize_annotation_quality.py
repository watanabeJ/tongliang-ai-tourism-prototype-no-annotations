from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "prototype-annotator" / "annotations.json"
data = json.loads(path.read_text(encoding="utf-8"))

for surface in data.get("surfaces", []):
    if not surface.get("triggerSelector"):
        surface["triggerSelector"] = surface.get("openSelector") or "body"

seen = set()
kept = []
for annotation in data.get("annotations", []):
    if annotation.get("annotationType") == "P":
        kept.append(annotation)
        continue
    target = annotation.get("target", {})
    signature = (annotation.get("pageKey"), annotation.get("annotationType"), target.get("selector"), annotation.get("contentMarkdown"))
    if signature in seen:
        continue
    seen.add(signature)
    aid = annotation.get("id", "")
    if aid in {"ANN-P18-001", "ANN-P29-003"}:
        annotation["contentMarkdown"] = (
            "### 元素对象\n\n该元素用于关闭当前解析承载面。\n\n"
            "### 交互规则\n\n- 点击后关闭解析中的承载面，不提交、不保存未确认内容。\n\n"
            "### 系统反馈\n\n- 页面返回导入入口，已生效知识不受影响。\n\n"
            "### 异常与边界\n\n- 关闭操作不会自动放行审核中的内容。\n"
        )
    annotation.setdefault("review", {})["required"] = True
    annotation["review"]["status"] = "approved"
    kept.append(annotation)
data["annotations"] = kept
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Finalized annotations: {len(kept)} total")
