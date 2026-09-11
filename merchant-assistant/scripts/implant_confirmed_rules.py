"""Implant confirmed V7 merchant rules into page specs and element annotations.

The rule document is the source of truth for the confirmed decisions. This
script keeps the existing generated detail, adds an explicit page-scoped rule
block, snapshots current assets, and refreshes the offline HTML annotation
payload used when the review server is unavailable.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ANNOTATOR = ROOT / "prototype-annotator"
ANNOTATIONS = ANNOTATOR / "annotations.json"
PAGE_SPECS = ROOT / "prototype-specs" / "current"
LITE_SPECS = ANNOTATOR / "specs" / "current"
HISTORY = ANNOTATOR / "history"


RULES = {
    "prototype_demo": [
        "本原型演示中，点击“登录”后直接进入工作台，用于模拟登录后的下一环节。",
        "本原型演示不校验手机号格式、账号是否注册或密码是否正确；手机号为空时使用演示账号标识继续进入工作台。",
        "本原型演示中，点击“完成注册”后直接进入商户资料提交页，用于模拟注册后的下一环节。",
        "注册演示不校验手机号格式、账号是否注册、密码或确认密码；手机号为空时使用演示账号标识继续进入商户资料提交页。",
        "该演示跳转规则仅适用于当前原型交互，不代表正式环境的账号安全校验和账号状态限制。",
    ],
    "governance": [
        "本规则文档只记录已确认规则；后续新增或改变的规则需单独确认后追加新版本或变更记录。",
        "产品说明书不因每次规则或原型修改自动生成；仅在用户明确要求时更新。",
    ],
    "priority": [
        "用户最新明确确认的规则优先于历史方案和默认建议。",
        "运营后台已确认的业务事实优先于商户输入；商户最新确认的信息可以覆盖平台整理的旧资料。",
        "AI 只能解析、筛选、分类和优化表达，不得改变事实、数字、时间、地址、价格等业务含义。",
        "展示规则、操作规则、数据留存规则和状态迁移规则分别执行，不以页面视觉表现替代业务规则。",
    ],
    "account": [
        "一个手机号对应一个商户账号和一个门店；当前账号只管理与其绑定的一个门店。",
        "运营后台停用账号、账号审核不通过时禁止登录。",
        "连续 180 天未使用由系统自动限制账号并禁止登录；商户可联系平台申请恢复。",
        "账号被停用或限制后，已登录设备在下一次请求时校验状态并使登录态失效。",
        "账号被停用或限制后不要求设备立即主动退出；下一次请求失效后才清除当前登录态。",
        "失效后禁止继续保存或提交，并提示：`账号已停用，请联系平台`。",
        "退出登录清除当前设备登录态、本地草稿和未提交知识编辑内容；不影响服务端已提交、审核中或已生效内容。",
    ],
    "qualification": [
        "资质审核中可查看和编辑门店信息、回答游客问题、导入自己的知识材料和修改密码。",
        "资质审核状态为“需修改”时仍可登录，仅限制重新提交资质资料，其他已开放功能继续可用。",
        "资质审核与 AI 内容合规审核相对独立，互不影响。",
    ],
    "onboarding_store": [
        "首次提交资料页分为商户资料和门店资料两个连续区块，商户完成两部分资料后才能提交。",
        "商户资料区保留营业执照、经营许可证、法人身份证正反面、联系人姓名和联系人电话字段。",
        "门店资料区沿用门店信息页字段：门店名称、详细地址、门头照、商户简介为必填；特色菜介绍、商户电话、美团门店链接为非必填。",
        "门店资料与商户资料使用同一次提交，提交成功后统一进入审核流程。",
        "门店资料区标题使用“门店资料”。",
    ],
    "knowledge": [
        "知识库最终只有“经营信息”和“游客问答”两个页签；知识来源为平台整理的经营信息、商户回答的游客问答、商户通过“添加我的知识”导入或补充的内容。",
        "“添加我的知识”提交后由 AI 将资料拆分为多个内容片段，只挑选可归入“经营信息”或“游客问答”的片段入库。",
        "无法归入两类的片段直接过滤，不进入知识库，不新增第三类；同一份资料允许部分片段进入审核、部分片段被过滤。",
        "如果整份资料都没有可入库内容，不生成知识库记录，并提示：`未识别到可归入经营信息或游客问答的内容，请重新提交`。",
        "AI 对可入库片段只能在“经营信息”和“游客问答”中二选一，不提供商户手动切换入口；分类错误时只能删除本次内容或重新提交。",
        "审核中的内容不显示在知识库页签中，也不对游客可见；AI 合规审核通过后立即进入 AI 判定的对应页签并可供用户端使用。",
        "仅执行 AI 合规审核，不设置运营后台人工内容审核；审核不通过时不入库并允许删除或重新提交，审核失败时不自动放行并允许重试。",
    ],
    "ai_draft": [
        "AI 建议修改只优化表达，不改变事实和分类。",
        "点击“我自己修改”后内容只在当前页面临时保留，不写入本地草稿；离开页面、关闭页面或退出登录后丢失，草稿不对游客可见。",
        "离开页面但未点击保存时当前编辑内容丢失；取消或关闭不提交未确认内容。",
        "未提交的编辑内容只存在当前页面，不形成服务端知识记录。",
    ],
    "version": [
        "同一事实的优先级为：商户最新确认可覆盖平台旧资料，运营后台人工结论高于商户输入，AI 只能改写表达不能改变事实。",
        "已生效内容被修改时，审核期间继续使用旧版本；新版本审核通过后立即替换旧版本并删除旧版本。",
        "新版本审核不通过或失败时继续使用旧版本，并删除未通过或失败的新版本；商户端默认只展示最新生效版本，不提供旧版本查看入口。",
        "旧版本不长期保留，仅在新版本审核期间临时保留以保证游客端内容连续可用。",
        "平台整理的经营信息默认长期有效，不因时间经过自动过期，也不自动生成周期性重确认任务。",
    ],
    "store_fields": [
        "必填字段为门店名称、详细地址、门头照、商户简介。",
        "非必填字段为特色菜介绍、商户电话、美团门店链接；为空时显示“未填写”，不阻断其他字段保存。",
    ],
    "meituan": [
        "商户手动录入自己的“美团门店链接”；允许标准 `http://` 或 `https://` URL，不限制域名必须是美团。",
        "不要求必须是美团小程序链接；`javascript:`、`data:`、`ftp:` 等非 http/https 协议不允许保存。",
        "空值允许保存；URL 格式错误或协议不是 http/https 时禁止保存并提示修正。",
        "商户未填写链接时，用户端隐藏跳转按钮；普通 http/https 链接使用应用内网页打开，可识别深链时尝试跳转对应小程序。",
        "链接失效、无法打开或无法识别时提示：`店铺建设中`。",
    ],
    "workbench": [
        "工作台待补充任务提交后统一变为“已完成”并从待补充列表隐藏；提交结果保留在服务端。",
        "已提交任务不在工作台重复编辑，需要修改时从知识库或门店信息页进入。",
        "工作台的导入入口不提供“链接地址”选项；“添加知识内容”统一更名为“添加我的知识”。",
        "导入入口上方居中展示：`补充我的知识内容，让 AI 更好的推介您的产品`；知识补充提示为：`AI 分析后，建议补充以下信息`。",
        "经营洞察提示为：`以上信息基于顾客真实反馈智能生成，为了让AI更好的推荐商品，请到知识补充板块进行信息补足，或者添加你的知识`。",
    ],
    "ui_changes": [
        "门店信息移除“推荐商品/套餐”页签；“美团门店地址”统一更名为“美团门店链接”。",
        "知识库移除“知识内容管理”页签，仅保留“经营信息”和“游客问答”。",
        "登录页“首次使用？”入口文案改为“立即注册”，并移除入口前的扫码图标。",
    ],
}


PAGE_RULE_KEYS = {
    "P15": ["knowledge", "ai_draft", "version", "priority"],
    "P16": ["account", "qualification"],
    "P17": ["knowledge", "ai_draft", "version", "priority"],
    "P18": ["knowledge", "ai_draft", "workbench", "priority"],
    "P19": ["knowledge", "ai_draft", "version", "priority"],
    "P20": ["account", "prototype_demo", "ui_changes"],
    "P21": ["qualification", "account"],
    "P22": ["qualification", "account", "store_fields", "meituan"],
    "P23": ["qualification", "account"],
    "P24": ["qualification", "account", "onboarding_store"],
    "P25": ["account", "governance"],
    "P26": ["account", "prototype_demo"],
    "P27": ["store_fields", "meituan", "ui_changes", "version", "priority"],
    "P28": ["store_fields"],
    "P29": ["workbench", "knowledge", "version", "priority", "governance"],
    "P03": ["version", "qualification", "priority"],
    "P10": ["knowledge", "version", "priority"],
    "P11": ["knowledge", "version", "priority"],
    "P12": ["knowledge", "version", "priority"],
    "P13": ["knowledge", "version", "priority"],
    "P14": ["knowledge", "version", "priority"],
    "P01": ["version", "priority"],
    "P02": ["version", "priority"],
    "P04": ["version", "priority"],
    "P05": ["version", "priority"],
    "P06": ["version", "priority"],
    "P07": ["version", "priority"],
    "P08": ["version", "priority"],
    "P09": ["version", "priority"],
}

SLUG_TO_PAGE = {
    "assistant-item": "P15",
    "change-password": "P16",
    "knowledge": "P19",
    "knowledge-import": "P18",
    "knowledge-import-relations": "P17",
    "login": "P20",
    "merchant-profile": "P22",
    "merchant-profile-correction": "P21",
    "onboarding": "P24",
    "onboarding-success": "P23",
    "personal-center": "P25",
    "register": "P26",
    "store-info": "P27",
    "store-product-add": "P28",
    "workbench": "P29",
}


def stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def rule_block(page_key: str) -> str:
    lines = ["## V7 已确认规则", "", "以下规则直接继承《V7商户端规则定义文档-20260831.md》，用于页面元素验收：", ""]
    seen: set[str] = set()
    for key in PAGE_RULE_KEYS.get(page_key, []):
        for rule in RULES[key]:
            if rule not in seen:
                lines.append(f"- {rule}")
                seen.add(rule)
    return "\n".join(lines).rstrip() + "\n"


def replace_or_append(text: str, block: str) -> str:
    pattern = re.compile(r"\n## V7 已确认规则\n[\s\S]*?(?=\n## |\Z)")
    if pattern.search(text):
        return pattern.sub("\n" + block.rstrip(), text, count=1)
    return text.rstrip() + "\n\n" + block


def snapshot(path: Path, history_root: Path, label: str) -> None:
    if not path.exists():
        return
    target = history_root / path.stem
    target.mkdir(parents=True, exist_ok=True)
    (target / f"{label}.before-rule-implant{path.suffix}").write_text(path.read_text(encoding="utf-8"), encoding="utf-8")


def update_specs(now: str) -> int:
    changed = 0
    spec_history = ROOT / "prototype-specs" / "history"
    lite_history = ANNOTATOR / "specs" / "history"
    for spec_root, history_root, key_from_path in (
        (PAGE_SPECS, spec_history, lambda p: SLUG_TO_PAGE.get(p.stem)),
        (LITE_SPECS, lite_history, lambda p: p.stem if p.stem.startswith("P") else None),
    ):
        for path in sorted(spec_root.glob("*.md")):
            page_key = key_from_path(path)
            if not page_key or not PAGE_RULE_KEYS.get(page_key):
                continue
            before = path.read_text(encoding="utf-8")
            after = replace_or_append(before, rule_block(page_key))
            if page_key == "P26":
                after = after.replace(
                    "录入或修改当前字段；提交前校验必填性和格式，失败时保留输入并提示修正。",
                    "原型演示点击“完成注册”后直接进入商户资料提交页；不校验手机号、密码、确认密码或重复注册状态。",
                )
            if page_key == "P20":
                after = after.replace("扫码注册", "立即注册")
            if page_key == "P24":
                after = after.replace("提交门店资料", "门店资料")
            if after == before:
                continue
            snapshot(path, history_root, now)
            path.write_text(after, encoding="utf-8")
            changed += 1
    return changed


def update_annotations(now: str) -> int:
    data = json.loads(ANNOTATIONS.read_text(encoding="utf-8"))
    before = ANNOTATIONS.read_text(encoding="utf-8")
    annotations = data.get("annotations", [])
    retained_annotations = [item for item in annotations if item.get("id") != "ANN-P25-002"]
    count = len(annotations) - len(retained_annotations)
    data["annotations"] = retained_annotations
    for annotation in data.get("annotations", []):
        page_key = annotation.get("pageKey")
        if page_key not in PAGE_RULE_KEYS:
            continue
        marker = "## V7 已确认规则"
        existing = annotation.get("contentMarkdown") or ""
        block = rule_block(page_key)
        if marker in existing:
            existing = re.sub(r"\n## V7 已确认规则\n[\s\S]*?(?=\n## |\Z)", "\n" + block.rstrip(), existing, count=1)
        else:
            existing = existing.rstrip() + "\n\n" + block
        if annotation.get("id") == "ANN-P20-002":
            existing = existing.replace(
                "- 提交前校验字段格式和必填状态；校验失败时保留当前输入并明确提示修正。\n- 用户未完成必要输入时，不执行提交或状态变更。",
                "- 本原型演示点击“登录”后直接进入工作台，不校验手机号、账号或密码；手机号为空时使用演示账号标识继续。",
            )
        if annotation.get("id") == "ANN-P26-002":
            existing = existing.replace(
                "- 提交前校验字段格式和必填状态；校验失败时保留当前输入并明确提示修正。\n- 用户未完成必要输入时，不执行提交或状态变更。",
                "- 本原型演示点击“完成注册”后直接进入商户资料提交页，不校验手机号、密码、确认密码或重复注册状态。",
            )
        if page_key == "P20":
            existing = existing.replace("扫码注册", "立即注册")
            target = annotation.get("target") or {}
            if target.get("fallbackText"):
                target["fallbackText"] = target["fallbackText"].replace("扫码注册", "立即注册")
            bounds_hint = target.get("boundsHint")
            if isinstance(bounds_hint, dict) and bounds_hint.get("text"):
                bounds_hint["text"] = bounds_hint["text"].replace("扫码注册", "立即注册")
            if isinstance(annotation.get("evidence"), list):
                annotation["evidence"] = [
                    item.replace("扫码注册", "立即注册") if isinstance(item, str) else item
                    for item in annotation["evidence"]
                ]
        if page_key == "P24":
            existing = existing.replace("提交门店资料", "门店资料")
            if annotation.get("title"):
                annotation["title"] = annotation["title"].replace("提交门店资料", "门店资料")
            target = annotation.get("target") or {}
            if target.get("fallbackText"):
                target["fallbackText"] = target["fallbackText"].replace("提交门店资料", "门店资料")
            bounds_hint = target.get("boundsHint")
            if isinstance(bounds_hint, dict) and bounds_hint.get("text"):
                bounds_hint["text"] = bounds_hint["text"].replace("提交门店资料", "门店资料")
            if isinstance(annotation.get("evidence"), list):
                annotation["evidence"] = [
                    item.replace("提交门店资料", "门店资料") if isinstance(item, str) else item
                    for item in annotation["evidence"]
                ]
        if page_key == "P25":
            existing = existing.replace(
                "个人中心提供门店信息、商户资料、账号安全和退出登录入口。",
                "个人中心提供商户资料、账号安全和退出登录入口；门店信息统一在商户资料页维护。",
            )
            target = annotation.get("target") or {}
            if annotation.get("id") == "ANN-P25-001":
                annotation["title"] = "个人中心 · 页面介绍"
                page_text = "15:30 个人中心 商户资料 查看资料与审核进度 账号安全 修改登录密码 退出登录 知识库 AI问答 个人中心"
                target["fallbackText"] = page_text
                bounds_hint = target.get("boundsHint")
                if isinstance(bounds_hint, dict):
                    bounds_hint["text"] = page_text
                if isinstance(annotation.get("evidence"), list):
                    annotation["evidence"] = [
                        item.replace("门店信息 查看店铺已确认信息 ", "") if isinstance(item, str) else item
                        for item in annotation["evidence"]
                        if not (isinstance(item, str) and item.startswith("文档匹配：V7商户端规则定义文档-20260831.md -> 门店信息"))
                    ]
            if annotation.get("id") == "ANN-P25-003":
                target["selector"] = '[aria-label="查看商户资料"]'
                target["strategy"] = "aria"
                target["sourceElementId"] = "P25-E005"
                source = annotation.get("source")
                if isinstance(source, dict):
                    source["ref"] = "page-map:P25-E005"
                annotation["candidateId"] = "CAND-P25-005"
                if isinstance(annotation.get("evidence"), list):
                    annotation["evidence"] = [
                        item.replace("P25-E006", "P25-E005").replace(
                            "section > div > div:nth-of-type(2) > section > button:nth-of-type(2)",
                            '[aria-label="查看商户资料"]',
                        ) if isinstance(item, str) else item
                        for item in annotation["evidence"]
                    ]
                annotation["selectorQuality"] = {"level": "stable", "issues": []}
            if annotation.get("id") == "ANN-P25-004":
                target["sourceElementId"] = "P25-E010"
                source = annotation.get("source")
                if isinstance(source, dict):
                    source["ref"] = "page-map:P25-E010"
                annotation["candidateId"] = "CAND-P25-010"
        annotation["contentMarkdown"] = existing
        annotation["updatedAt"] = now
        count += 1
    store_annotation = {
        "id": "ANN-P22-007",
        "pageKey": "P22",
        "target": {
            "selector": "#store-information-title",
            "fallbackText": "门店信息",
            "strategy": "id",
            "boundsHint": {"text": "门店信息", "tag": "h2"},
        },
        "title": "门店信息",
        "contentMarkdown": """### 业务含义

本区替代原“账号与安全”区块，直接维护当前账号绑定门店的资料。字段结构、视觉形态和行内编辑交互与门店信息页保持一致。

### 字段与必填性

| 字段 | 必填 | 维护方式 |
|---|---|---|
| 门店名称、详细地址、门头照、商户简介 | 是 | 点击铅笔后在当前行编辑。 |
| 特色菜介绍、商户电话、美团门店链接 | 否 | 点击铅笔后在当前行编辑；为空时显示“未填写”。 |

### 交互规则

- 点击字段右侧铅笔按钮，在当前行展开输入控件和“保存/取消”按钮。
- 保存成功后更新字段展示值并提示“已保存”；取消关闭编辑器且不保存本次输入。
- 非必填字段允许保存为空并显示“未填写”。美团门店链接非空时仅允许 `http://` 或 `https://` URL，错误协议或格式禁止保存。

### 权限与边界

- 一个手机号只绑定一个商户账号和一个门店，本区不提供门店切换。
- 资质审核中或“需修改”时，门店信息仍可查看和编辑；“需修改”仅限制重新提交资质资料。""",
        "devNotesMarkdown": None,
        "audienceMode": "product-review",
        "annotationType": "R",
        "kind": "rule",
        "dimension": "Field rule",
        "topics": ["business", "data", "interaction"],
        "priority": "high",
        "visible": True,
        "source": {"type": "prototype", "ref": "CAND-P22-STORE-EDITOR:merchant-profile.html#store-information-title"},
        "evidence": [
            "页面：merchant-profile.html",
            "元素：门店信息",
            "字段来源：store-info.html",
            "规则来源：V7商户端规则定义文档-20260831.md",
        ],
        "nextActions": ["点击铅笔应在当前行展开与 store-info.html 相同的编辑器。"],
        "dependencies": [],
        "risks": [],
        "openQuestions": ["待确认：后续门店信息页字段变更时，需同步更新本概览区。"],
        "candidateId": "CAND-P22-STORE-EDITOR",
        "selectorQuality": {"level": "stable", "issues": []},
        "maintenancePolicy": "annotation-owned",
        "createdBy": "ai",
        "review": {"required": True, "status": "approved", "reason": "user-confirmed-page-change"},
        "updatedAt": now,
    }
    existing_index = next((index for index, item in enumerate(data.get("annotations", [])) if item.get("id") == "ANN-P22-007"), None)
    if existing_index is None:
        data.setdefault("annotations", []).append(store_annotation)
        count += 1
    else:
        data["annotations"][existing_index] = store_annotation
    field_annotations = [
        ("008", "name", "门店名称", True, "文本输入；不能为空。"),
        ("009", "address", "详细地址", True, "文本输入；不能为空。"),
        ("010", "cover", "门头照", True, "图片选择；支持重新选择、删除和取消，删除后提示重新上传。"),
        ("011", "intro", "商户简介", True, "多行文本输入；不能为空。"),
        ("012", "specialty", "特色菜介绍", False, "多行文本输入；允许保存为空，空值显示“未填写”。"),
        ("013", "phone", "商户电话", False, "文本输入；允许保存为空，空值显示“未填写”。"),
        ("014", "meituanAddress", "美团门店链接", False, "链接输入；允许为空，非空时仅允许标准 http/https URL。"),
    ]
    for suffix, field_key, label, required, field_rule in field_annotations:
        annotation_id = f"ANN-P22-{suffix}"
        candidate_id = f"CAND-P22-STORE-{field_key.upper()}"
        field_annotation = {
            "id": annotation_id,
            "pageKey": "P22",
            "target": {
                "selector": f'[aria-label="修改{label}"]',
                "fallbackText": f"修改{label}",
                "strategy": "aria",
                "boundsHint": {"text": "", "tag": "button"},
            },
            "title": f"修改{label}",
            "contentMarkdown": f"""### 字段对象

“{label}”为{'必填' if required else '非必填'}门店字段。{field_rule}

### 交互规则

- 点击右侧铅笔按钮，在当前字段下方展开与门店信息页一致的编辑器。
- 点击“保存”时校验当前字段；通过后更新展示值、关闭编辑器并提示“已保存”。
- 点击“取消”关闭编辑器，不保存本次输入，当前展示值保持不变。

### 状态与边界

- 资质审核中或“需修改”时仍可维护该字段。
- 账号在下一次请求校验为停用或受限时，禁止继续保存或提交。""",
            "devNotesMarkdown": None,
            "audienceMode": "product-review",
            "annotationType": "A",
            "kind": "interaction",
            "dimension": "Field editing",
            "topics": ["business", "interaction", "data"],
            "priority": "high" if required else "medium",
            "visible": True,
            "source": {"type": "prd", "ref": f"{candidate_id}:user-browser-comment-20260903"},
            "evidence": [
                "页面：merchant-profile.html",
                f"元素：修改{label}",
                "交互参照：store-info.html",
                "规则来源：V7商户端规则定义文档-20260831.md",
            ],
            "nextActions": [],
            "dependencies": [],
            "risks": [],
            "openQuestions": [],
            "candidateId": candidate_id,
            "selectorQuality": {"level": "stable", "issues": []},
            "maintenancePolicy": "annotation-owned",
            "createdBy": "ai",
            "review": {"required": True, "status": "approved", "reason": "user-confirmed-inline-editing"},
            "updatedAt": now,
        }
        field_index = next((index for index, item in enumerate(data.get("annotations", [])) if item.get("id") == annotation_id), None)
        if field_index is None:
            data.setdefault("annotations", []).append(field_annotation)
            count += 1
        else:
            data["annotations"][field_index] = field_annotation
    contact_annotation = {
        "id": "ANN-P22-015",
        "pageKey": "P22",
        "target": {
            "selector": '[aria-label="修改联系人和电话"]',
            "fallbackText": "修改联系人和电话",
            "strategy": "aria",
            "boundsHint": {"text": "", "tag": "button"},
        },
        "title": "修改联系人和电话",
        "contentMarkdown": """### 字段对象

联系人姓名和联系人电话为商户资料中的必填字段，允许商户在当前页面直接修改。

### 交互规则

- 点击联系人行右侧铅笔，在当前行展开“联系人姓名”和“联系人电话”两个输入框。
- 点击“保存”时校验两项均不为空；任一为空时禁止保存并提示“请填写联系人和电话”。
- 保存成功后关闭编辑器并提示“联系人信息已保存”。
- 点击“取消”关闭编辑器、恢复上次保存值，不保存本次输入。

### 展示与数据

- 姓名展示最新保存值。
- 电话保存完整输入值，本页按前三位、四个星号、后四位脱敏展示。
- 保存后当前页面及再次进入时回显最新联系人信息。""",
        "devNotesMarkdown": None,
        "audienceMode": "product-review",
        "annotationType": "A",
        "kind": "interaction",
        "dimension": "Field editing",
        "topics": ["business", "interaction", "data"],
        "priority": "high",
        "visible": True,
        "source": {"type": "prd", "ref": "CAND-P22-CONTACT:user-browser-comment-20260903"},
        "evidence": [
            "页面：merchant-profile.html",
            "元素：联系人",
            "用户要求：联系人和电话允许修改",
            "规则来源：首次资料提交中的联系人姓名和联系人电话字段",
        ],
        "nextActions": [],
        "dependencies": [],
        "risks": [],
        "openQuestions": [],
        "candidateId": "CAND-P22-CONTACT",
        "selectorQuality": {"level": "stable", "issues": []},
        "maintenancePolicy": "annotation-owned",
        "createdBy": "ai",
        "review": {"required": True, "status": "approved", "reason": "user-confirmed-contact-editing"},
        "updatedAt": now,
    }
    contact_index = next((index for index, item in enumerate(data.get("annotations", [])) if item.get("id") == "ANN-P22-015"), None)
    if contact_index is None:
        data.setdefault("annotations", []).append(contact_annotation)
        count += 1
    else:
        data["annotations"][contact_index] = contact_annotation
    HISTORY.mkdir(parents=True, exist_ok=True)
    backup_dir = HISTORY / f"{now}-before-rule-implant"
    backup_dir.mkdir(parents=True, exist_ok=True)
    (backup_dir / "annotations.json").write_text(before, encoding="utf-8")
    ANNOTATIONS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count


def refresh_html_snapshots(data: dict) -> int:
    pages_by_name = {
        str(page.get("path", "")).replace("\\", "/").rsplit("/", 1)[-1]: str(page.get("pageKey"))
        for page in data.get("pages", [])
        if page.get("path") and page.get("pageKey")
    }
    changed = 0
    for html in ROOT.glob("*.html"):
        source = html.read_text(encoding="utf-8")
        start = source.find('<script id="prototype-annotations-data" type="application/json">')
        if start < 0:
            continue
        content_start = source.find("\n", start) + 1
        end = source.find("</script>", content_start)
        if end < 0:
            continue
        page_key = pages_by_name.get(html.name)
        if page_key:
            snapshot_data = dict(data)
            snapshot_data["pages"] = [p for p in data.get("pages", []) if p.get("pageKey") == page_key]
            snapshot_data["annotations"] = [a for a in data.get("annotations", []) if a.get("pageKey") == page_key]
            snapshot_data["surfaces"] = [s for s in data.get("surfaces", []) if s.get("pageKey") == page_key]
        else:
            snapshot_data = data
        payload = json.dumps(snapshot_data, ensure_ascii=False, indent=2)
        updated = source[:content_start] + payload + "\n" + source[end:]
        if updated != source:
            html.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


def write_coverage() -> Path:
    path = ROOT / "annotation-rule-coverage.md"
    lines = [
        "# V7 商户端规则标注覆盖清单",
        "",
        "来源：`V7商户端规则定义文档-20260831.md`。本清单列出规则在页面级说明和元素级标注中的植入位置。",
        "",
        "| 规则域 | 覆盖页面 | 载体 |",
        "|---|---|---|",
    ]
    for key, pages in (
        ("账号与登录状态", ["P20", "P25", "P26"]),
        ("资质审核与 AI 审核", ["P17", "P18", "P19", "P21", "P22", "P23", "P24"]),
        ("知识来源、分类与审核", ["P17", "P18", "P19", "P29"]),
        ("AI 建议、草稿与留存", ["P17", "P18", "P19", "P25", "P29"]),
        ("来源优先级、版本与有效期", ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10", "P11", "P12", "P13", "P14", "P17", "P19", "P27", "P29"]),
        ("门店字段与美团链接", ["P27", "P28"]),
        ("V7 页面结构与文案变更", ["P18", "P19", "P27", "P29"]),
        ("规则与产品说明书治理", ["P25", "P29"]),
    ):
        lines.append(f"| {key} | {', '.join(pages)} | 页面级 `prototype-specs/current/*.md`、Page Specs Lite `prototype-annotator/specs/current/*.md`、对应元素级 `annotations.json` |")
    lines.extend(["", "验收要求：规则文档中的已确认条目必须以明确、可测试的句子出现在对应页面说明或元素标注中；未确认事项不得新增为既定规则。", ""])
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def main() -> None:
    now = stamp()
    spec_count = update_specs(now)
    ann_count = update_annotations(now)
    data = json.loads(ANNOTATIONS.read_text(encoding="utf-8"))
    html_count = refresh_html_snapshots(data)
    coverage = write_coverage()
    print(f"Updated specs: {spec_count}; annotations: {ann_count}; HTML snapshots: {html_count}")
    print(f"Coverage: {coverage}")


if __name__ == "__main__":
    main()
