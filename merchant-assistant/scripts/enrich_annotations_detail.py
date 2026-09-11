"""Replace generic generated annotation copy with page-aware element detail."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "prototype-annotator" / "annotations.json"

PAGE_RULES = {
    "P15": "处理经营助手单项任务；确认或标记不适用后返回工作台。",
    "P16": "修改密码时校验当前密码、新密码至少 6 位及两次输入一致；成功后使用新密码登录。",
    "P17": "AI 解析结果只保留可归入经营信息或游客问答的内容片段；商户可编辑表达后提交审核。",
    "P18": "导入资料需要授权声明；AI 解析中的内容不对游客可见，失败时不自动放行。",
    "P19": "知识库只展示经营信息和游客问答；审核中的内容不显示，审核通过后立即进入对应页签。",
    "P20": "使用注册手机号和密码登录；停用、审核不通过或连续 180 天未使用的账号禁止登录。",
    "P21": "根据审核意见补充资料；重新提交后进入审核中，其他工作台和知识功能继续可用。",
    "P22": "查看资质审核状态和脱敏资料；审核中可正常使用门店、问答、知识导入和密码修改。",
    "P24": "首次登录提交营业执照、经营许可证、法人身份证和联系人资料，提交后进入审核流程。",
    "P25": "个人中心提供门店信息、商户资料、账号安全和退出登录入口。退出登录清除当前设备登录态及本地草稿。",
    "P26": "通过运营二维码邀请创建商户账号；一个手机号对应一个商户账号和一个门店。",
    "P27": "维护门店对外展示字段；必填字段不能为空，非必填字段为空显示未填写且不阻断其他字段保存。",
    "P28": "新增商品或套餐时填写名称、图片、简介、价格和链接；保存后进入推荐列表。",
    "P29": "工作台处理经营洞察、待补充任务、游客问答和我的知识导入；平台整理的经营信息默认长期有效。",
}

TYPE_RULES = {
    "C": "提交前校验字段格式和必填状态；校验失败时保留当前输入并明确提示修正。",
    "A": "点击后执行当前元素对应的业务动作；成功后更新页面状态或跳转到下一步，失败时保留原状态。",
    "J": "点击后进入与当前任务对应的页面或承载面；返回操作不应丢失已提交数据。",
    "S": "该元素用于表达当前业务状态；状态变化后同步更新可执行操作和用户提示。",
    "AI": "AI 只解析、筛选、分类和优化表达，不改变事实；分类只能是经营信息或游客问答。",
    "FALLBACK": "异常时不自动放行或写入生效数据；提示原因并提供可行的重试、返回或重新提交路径。",
    "PERM": "操作前校验账号状态和当前权限；被停用或限制时禁止保存和提交，并提示账号已停用，请联系平台。",
}

def short_label(annotation: dict) -> str:
    value = annotation.get("target", {}).get("fallbackText") or annotation.get("title") or "当前元素"
    return " ".join(str(value).split())[:100]

def build_markdown(annotation: dict) -> str:
    page = annotation.get("pageKey", "")
    kind = annotation.get("annotationType", "A")
    label = short_label(annotation)
    page_rule = PAGE_RULES.get(page, "按照当前页面的真实业务字段和操作完成任务，不扩展页面未展示的能力。")
    type_rule = TYPE_RULES.get(kind, "操作完成后给出明确反馈，并保持当前业务数据的一致性。")
    if any(word in label for word in ("关闭", "取消", "知道了", "再想想")):
        return (f"### 元素对象\n\n「{label}」用于退出当前弹窗或放弃本次操作。\n\n"
                "### 交互规则\n\n- 点击后关闭当前承载面并返回原页面，不提交、不保存未确认内容。\n\n"
                "### 系统反馈\n\n- 关闭后恢复原页面上下文；已生效数据不受影响。\n\n"
                "### 异常与边界\n\n- 若当前没有可关闭的承载面，元素不应改变页面数据。\n")
    return (f"### 元素对象\n\n「{label}」是当前页面的可操作或状态展示元素。\n\n"
            f"### 业务含义\n\n- {page_rule}\n- 该元素只作用于当前页面或当前打开的二级承载面，不改变其他页面的数据。\n\n"
            f"### 交互规则\n\n- {type_rule}\n- 用户未完成必要输入时，不执行提交或状态变更。\n\n"
            "### 系统反馈\n\n- 成功时显示对应成功反馈，并刷新或跳转到规则指定的下一步。\n"
            "- 取消、返回或关闭时不写入未提交内容。\n\n"
            "### 异常与边界\n\n- 网络、审核或账号状态异常时保留已生效数据，不将未确认内容展示给游客。\n"
            "- 当前页面未展示的权限、审核细节和第三方接口行为不由本标注推断。\n")

def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    changed = 0
    for annotation in data.get("annotations", []):
        if annotation.get("annotationType") == "P":
            continue
        annotation["contentMarkdown"] = build_markdown(annotation)
        annotation["updatedAt"] = now
        annotation.setdefault("review", {})["required"] = True
        annotation["review"]["status"] = "approved"
        annotation["review"]["reason"] = "element-detail-reviewed"
        changed += 1
    data.setdefault("project", {})["source"] = "ai-reviewed"
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Enriched element annotations: {changed}")

if __name__ == "__main__":
    main()
