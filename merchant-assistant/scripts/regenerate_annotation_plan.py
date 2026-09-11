"""Rebuild the V7 merchant page specs and annotations from confirmed rules."""
from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LITE = ROOT / "prototype-annotator"
PAGE_MAP = LITE / "page-map.json"
ANNOTATIONS = LITE / "annotations.json"
RULES = ROOT.parent / "V7商户端规则定义文档-20260831.md"
PRODUCT_SPEC = ROOT.parents[1] / "产品说明书" / "产品说明书-商户端-20260831-v1.md"
ITERATION_LOG = ROOT / "V7商户端迭代记录-20260831.md"


CURRENT_CONTENT = {
    "P15": ("处理内容", "处理 AI问答中的单条经营信息确认或游客问题补充任务。", [
        "商户可直接确认 AI 展示的内容准确，也可进入编辑态修改后提交。",
        "选择“不适用”必须二次确认；确认后任务标记为已完成并从知识补充任务列表隐藏。",
        "未点击提交就离开页面时，本次编辑丢失，不形成草稿，也不对游客可见。",
    ]),
    "P16": ("修改密码", "验证当前密码并设置新的登录密码。", [
        "当前密码、新密码、确认新密码均为必填；两次新密码必须一致。",
        "修改成功后显示结果弹窗，并提供返回个人中心的入口。",
        "账号在下一次请求时被判定停用或受限，禁止提交并提示联系平台。",
    ]),
    "P17": ("解析内容确认", "确认 AI 从导入资料中拆分出的知识片段，再提交 AI 合规审核。", [
        "AI 只保留可归入“经营信息”或“游客问答”的片段，其余片段过滤，不新增第三类。",
        "分类由 AI 完全决定且只能二选一；商户不能手动换类，分类错误时删除本次内容或重新提交。",
        "同一资料允许部分片段提交审核、部分片段过滤；整份资料无可入库内容时提示重新提交。",
        "确认提交后逐片段执行 AI 合规审核；审核中、不通过或失败的内容不进入知识库。",
    ]),
    "P18": ("添加知识内容", "通过独立页面导入商户自有知识材料并启动 AI 解析。", [
        "仅支持“拍照/图片”和“本地文件”，不提供链接地址输入。",
        "开始解析前必须确认授权声明；未授权不得解析。",
        "解析完成后进入“解析内容确认”页，由商户确认后再提交 AI 合规审核。",
        "未提交内容仅存在当前页面，离开、关闭或退出登录后清除。",
    ]),
    "P19": ("知识库", "集中查看当前已生效的经营信息和游客问答。", [
        "底部“知识库”是已生效知识的查看与维护入口，页面只保留“经营信息”和“游客问答”两个页签。",
        "经营信息来源包括平台整理的经营资料，以及“添加我的知识”中被 AI 归为经营信息并审核通过的片段；平台整理的经营信息默认长期有效。",
        "游客问答来源包括商户回答的游客问题，以及“添加我的知识”中被 AI 归为游客问答并审核通过的片段。",
        "审核中、不通过、失败的内容均不显示；AI 审核通过后立即进入对应页签并可供用户端使用。",
        "修改已生效内容时旧版本继续生效；新版本通过后替换并删除旧版本，不通过或失败则继续使用旧版本。",
    ]),
    "P20": ("登录", "使用手机号和密码进入商户端，并提供注册和联系平台入口。", [
        "页面顶部仅展示居中的“欢迎登录商户平台”标题，不展示封面图片、品牌角标或宣传说明文案。",
        "正式规则下，停用、审核不通过或连续 180 天未使用的账号禁止登录；长期未使用账号可联系平台恢复。",
        "未注册账号登录时禁止进入商户端，并提示注册。",
        "当前原型为演示流程，点击“登录”直接进入下一环节，不做字段验证；该行为不代表正式安全规则。",
        "一个手机号只对应一个商户账号和一个门店。",
    ]),
    "P21": ("补充商户资料", "在资质状态为“需修改”时查看审核意见并重新提交指定材料。", [
        "“需修改”状态仍可登录并使用其他功能，仅当前资质资料需要重新提交。",
        "页面按审核意见重新上传经营许可证，提交后返回审核中状态。",
        "资质审核与知识内容的 AI 合规审核相互独立。",
    ]),
    "P22": ("商户资料", "查看资质审核进度，并维护联系人、证件和绑定门店资料。", [
        "资质审核中仍可查看和编辑门店信息、回答游客问题、导入知识及修改密码。",
        "资质状态为“需修改”时，页面以只读方式展示“审核意见”和具体原因“经营许可证模糊，请重传”。",
        "审核意见区域不可点击，不打开补充资料子页面；原独立补充资料页不再作为当前流程入口。",
        "联系人姓名和电话可联合编辑，两项均必填；保存后电话脱敏展示。",
        "门店名称、详细地址、门头照、商户简介必填；特色菜介绍、商户电话、美团门店链接非必填。",
        "美团门店链接为空可保存；非空仅允许标准 http/https URL，格式错误时禁止保存。",
        "当前账号只维护绑定的一个门店，不提供门店切换。",
    ]),
    "P23": ("资料已提交", "确认商户与门店资料已经提交，并进入工作台继续使用。", [
        "提交后资质进入审核中，但商户仍可正常使用已开放功能。",
        "资质审核与 AI 内容审核独立，进入工作台不代表资质审核已经通过。",
    ]),
    "P24": ("提交商户资料", "注册后一次性提交商户资质、联系人和门店资料。", [
        "经营资料包括营业执照、经营许可证；法人资料包括身份证正反面；联系人姓名和电话必填。",
        "营业执照、经营许可证、法人身份证正反面和门头照均支持拍照或从相册选择；单个文件大小不得超过 2M。",
        "文件超过 2M 时本次选择无效，恢复未上传状态并提示“文件大小不能超过2M”；必填图片未上传时不可提交。",
        "门店名称、详细地址、门头照、商户简介必填；特色菜介绍、商户电话、美团门店链接非必填。",
        "美团门店链接非空时仅允许 http/https URL。",
        "商户资料与门店资料一次提交，成功后进入个人中心的商户资料页查看审核进度；数据同时提交至运营平台，由运营人员进行资质人工审核。",
    ]),
    "P25": ("个人中心", "提供商户资料、账号安全和退出登录三项账户管理入口。", [
        "底部“个人中心”聚合当前商户账号的资料、审核和安全设置。",
        "“商户资料”用于查看资质审核进度，并维护联系人和门店信息；不再单独提供门店信息入口。",
        "“账号安全”进入修改密码页面。",
        "退出登录清除当前设备登录态、本地草稿和未提交知识编辑，不影响服务端已提交、审核中或已生效数据。",
    ]),
    "P26": ("注册", "创建手机号绑定的单商户、单门店账号。", [
        "正式规则中一个手机号只对应一个商户账号和一个门店。",
        "手机号为必填项，只允许输入 11 位数字；不足或超过 11 位、包含非数字字符时均不得完成注册。",
        "设置密码和确认密码均为必填项；密码长度为 6–20 位，确认密码必须与设置密码完全一致。",
        "当前原型为演示流程，点击“完成注册”直接进入资料提交页，不做字段验证。",
        "“返回登录”不创建账号并回到登录页。",
    ]),
    "P27": ("门店信息", "兼容入口，用与商户资料页一致的行内方式维护门店字段。", [
        "必填字段为门店名称、详细地址、门头照、商户简介；非必填字段为特色菜介绍、商户电话、美团门店链接。",
        "点击铅笔进入单字段编辑；保存通过后更新展示，取消或离开不保留本次输入。",
        "美团门店链接允许为空；非空仅允许 http/https URL。用户端为空时隐藏按钮，无法打开时提示“店铺建设中”。",
        "个人中心不再展示本页入口，门店资料统一从商户资料页维护；本页仅作兼容保留。",
    ]),
    "P28": ("添加商品/套餐", "录入商品或套餐的名称、图片、简介、价格和详情链接。", [
        "页面字段均为必填，保存前校验完整性和链接格式。",
        "保存成功或取消后返回门店信息兼容页。",
        "当前知识库结构已移除商品/套餐页签，本页仅保留为现有兼容流程。",
    ]),
    "P29": ("AI问答", "通过经营洞察、知识补充和添加我的知识三个页签改善 AI 对门店的介绍能力。", [
        "底部“AI问答”承载经营洞察、知识补充任务和知识导入流程。",
        "经营洞察由顾客真实反馈经 AI 分析生成，用于识别游客关注点和经营信息缺口。",
        "知识补充由 AI 分析现有知识库缺口生成任务；提交后任务变为已完成并从知识补充任务列表隐藏。",
        "添加我的知识仅支持拍照/图片和本地文件；授权后由 AI 解析、筛选、二选一分类并逐片段执行合规审核。",
        "AI 只能优化表达，不能改变事实、数字、时间、地址、价格或分类。",
    ]),
}


ELEMENTS = {
    "P15": [
        (".assistant-item-actions[data-item-choice-actions]", "内容确认方式", "A", "选择“准确并提交”会直接提交当前内容；选择“需要修改”进入编辑态。未提交前离开页面，本次输入立即丢失。"),
        (".assistant-item-actions[data-item-submit-actions]", "修改后提交", "A", "编辑完成后点击“提交”才写入服务端并进入后续 AI 处理；提交成功后任务标记为已完成并从知识补充任务列表隐藏。"),
    ],
    "P16": [
        ("[data-password-form]", "密码字段与校验", "R", "当前密码、新密码、确认新密码均必填；两次新密码必须一致。显示密码按钮只切换可见性，不修改字段值。"),
        ("[data-password-form] footer .button.primary", "确认修改密码", "A", "校验通过后更新密码并显示成功弹窗；失败时保留输入并给出原因。账号状态在本次请求校验失败时禁止提交。"),
    ],
    "P17": [
        (".knowledge-relations-card", "AI 拆分与分类结果", "HITL", "AI 将资料拆成多个片段，只保留可归入“经营信息”或“游客问答”的内容并二选一分类。无法归类的片段过滤，商户不能手动换类；商户在提交审核前确认片段内容。"),
        ("[data-confirm-knowledge-relations]", "提交 AI 合规审核", "A", "提交当前确认片段逐条进入 AI 合规审核。通过后立即进入对应知识页签；不通过或失败均不入库，失败可重试。"),
    ],
    "P18": [
        (".knowledge-import-choice-grid", "导入方式", "R", "仅支持拍照/图片和本地文件，不支持链接地址。选择资料后在“本次资料”区域展示待解析文件。"),
        (".knowledge-import-section:nth-of-type(3)", "授权声明", "R", "开始解析前必须勾选授权声明，未授权时不得上传解析或进入下一步。"),
        ("[data-start-knowledge-processing]", "开始解析", "AI", "点击后由 AI 解析并拆分资料；整份资料没有可入库内容时提示“未识别到可归入经营信息或游客问答的内容，请重新提交”。"),
        ("#knowledge-parse-title", "解析状态", "S", "解析过程中显示进度；完成后提供“查看 AI 解析内容”入口。关闭或离开页面不保留未提交内容。"),
    ],
    "P19": [
        ('button[data-route="knowledge"]', "知识库模块总览", "C", "底部“知识库”是已生效知识的统一查看与维护入口。页面仅展示经营信息和游客问答；审核中、不通过或失败内容不显示。"),
        ('button[data-knowledge-tab="facts"]', "经营信息", "DATA", "数据来源：平台整理的经营信息，以及“添加我的知识”中被 AI 归为经营信息并审核通过的片段。平台资料默认长期有效；商户最新确认可覆盖平台旧资料。"),
        ('button[data-knowledge-tab="qa"]', "游客问答", "DATA", "数据来源：商户直接回答的游客问题，以及“添加我的知识”中被 AI 归为游客问答并审核通过的片段。审核通过后立即显示并可供用户端使用。"),
    ],
    "P20": [
        ("[data-login-form] .button.primary", "登录", "A", "当前原型点击后直接进入下一环节，不做字段验证。正式环境仍需校验账号状态：停用、审核不通过或连续 180 天未使用时禁止登录。未注册账号登录，提示注册。"),
        ('[data-route="register"]', "立即注册", "J", "进入创建商户账号页面。一个手机号只允许绑定一个商户账号和一个门店。"),
        ('[data-open-modal="help-modal"]', "联系平台", "A", "登录遇到问题或长期未使用受限时，通过此入口查看平台联系方式并申请恢复。"),
    ],
    "P21": [
        ('[aria-label="重新上传经营许可证"]', "重新上传资料", "R", "只补充审核意见明确要求修改的资质材料；“需修改”状态不限制门店维护、游客问答、知识导入或修改密码。"),
        ("[data-correction-form] .button.primary", "重新提交审核", "A", "材料选择完成后重新提交资质审核并进入审核中状态；资质审核不影响独立的 AI 内容审核。"),
    ],
    "P22": [
        ("[data-review-label]", "资质审核状态", "S", "展示审核中、需修改等状态。审核中可正常使用全部已开放功能；需修改仍可登录。需修改时直接显示只读审核意见“经营许可证模糊，请重传”，该区域不可点击且不打开补充资料子页面。"),
        ("[data-profile-contact]", "联系人与电话", "R", "联系人姓名和电话允许联合修改且均必填。保存后展示最新姓名，电话按前三位、四个星号、后四位脱敏。"),
        ("#store-information-title", "门店信息字段组", "R", "本区与门店信息页使用相同的行内维护方式。必填：门店名称、详细地址、门头照、商户简介；非必填：特色菜介绍、商户电话、美团门店链接。"),
        ('[data-store-field="meituanAddress"]', "美团门店链接", "R", "允许为空；非空仅允许标准 http/https URL，其他协议或错误格式禁止保存。用户端未填写时隐藏按钮，无法打开时提示“店铺建设中”。"),
    ],
    "P23": [
        ('[data-route="workbench"]', "进入工作台", "J", "进入 AI问答模块继续使用。此时资质仍可处于审核中，进入工作台不代表资质已经审核通过。"),
    ],
    "P24": [
        ("[data-onboarding-form] .section-block:nth-of-type(1)", "商户资质资料", "R", "营业执照、经营许可证、法人身份证正反面、联系人姓名和联系人电话均需随首次资料提交一并提供。四类证件图片均支持拍照或从相册选择，单个文件不得超过 2M；超限时本次选择无效并提示“文件大小不能超过2M”。"),
        (".onboarding-store-section", "门店资料", "R", "必填：门店名称、详细地址、门头照、商户简介；非必填：特色菜介绍、商户电话、美团门店链接。门头照支持拍照或从相册选择，文件不得超过 2M；超限或未上传时不可提交。"),
        ('[aria-label="美团门店链接"]', "美团门店链接校验", "R", "字段可空；非空仅允许 http:// 或 https:// URL，格式错误时禁止提交。"),
        ("[data-onboarding-form] .button.primary", "统一提交资料", "A", "商户资质、联系人和门店资料一次提交。必填项完整且格式正确后进入个人中心的商户资料页，并展示资质审核进度。同时数据会提交到运营平台，由运营人员进行资质人工审核。"),
    ],
    "P25": [
        ('button[data-route="personal"]', "个人中心模块总览", "C", "底部“个人中心”统一承载商户资料、账号安全和退出登录；门店信息不再单列入口，统一在商户资料内维护。"),
        ('[aria-label="查看商户资料"]', "商户资料", "J", "进入商户资料页查看资质审核进度、证件、联系人，并维护当前账号绑定门店的全部字段。"),
        ('button[data-route="changePassword"]', "账号安全", "J", "进入修改密码页面。资质审核中或需修改时仍可使用该功能。"),
        ("[data-logout]", "退出登录", "A", "清除当前设备登录态、本地草稿和未提交知识编辑；不影响服务端已提交、审核中或已生效内容。"),
    ],
    "P26": [
        ("[data-register-form] .button.primary", "完成注册", "A", "当前原型点击后直接进入资料提交页，不做字段验证。正式环境中，手机号必填且只能为 11 位数字；设置密码和确认密码均必填，密码长度为 6–20 位，确认密码必须与设置密码完全一致。校验失败时禁止注册、保留当前输入并提示对应字段。一个手机号仍只允许绑定一个商户账号和一个门店。"),
        ('button[data-route="login"]', "返回登录", "J", "返回登录页，不提交当前未完成的注册输入。"),
    ],
    "P27": [
        (".store-info-content", "门店字段维护", "R", "所有字段采用行内编辑。必填字段不可保存为空；非必填字段允许清空并显示“未填写”；取消或离开不保留未保存输入。"),
        ('[data-store-field="cover"]', "门头照", "A", "门头照为必填图片字段，支持重新选择和删除；删除后必须重新上传有效图片才能满足必填要求。"),
        ('[data-store-field="meituanAddress"]', "美团门店链接", "R", "允许为空；非空仅允许 http/https URL。用户端未填写时隐藏跳转按钮，链接失效或无法打开时提示“店铺建设中”。"),
    ],
    "P28": [
        ("[data-store-product-add-form]", "商品/套餐字段", "R", "商品名称、图片、简介、价格和详情链接均为必填；提交前校验完整性、价格格式和链接格式。"),
        ("[data-store-product-add-form] .button.primary", "保存商品/套餐", "A", "校验通过后保存并返回门店信息兼容页；失败时保留当前输入并提示修正。"),
    ],
    "P29": [
        ('button[data-route="workbench"]', "AI问答模块总览", "C", "底部“AI问答”包含经营洞察、知识补充、添加我的知识三个页签，用于发现知识缺口、补充事实并提升 AI 推荐准确性。"),
        ('button[data-workbench-tab="insight"]', "经营洞察", "AI", "数据来自顾客真实反馈，经 AI 汇总分析后展示关注点和经营洞察。结果用于提示商户补充知识，不自动改写已生效事实。"),
        ('button[data-workbench-tab="supplement"]', "知识补充", "AI", "AI 根据现有知识库缺口生成待确认经营信息和待回答游客问题。提交后任务变为已完成并从列表隐藏。"),
        ('button[data-workbench-tab="import"]', "添加我的知识", "AI", "仅支持图片和本地文件。授权后 AI 解析并拆分，只挑选可归入经营信息或游客问答的片段，再逐条执行 AI 合规审核。"),
    ],
}


# Use selectors already verified by the prototype scanner. The list order matches
# each page's ELEMENTS entries and keeps sourceElementId traceability intact.
TARGET_ELEMENT_IDS = {
    "P15": ["P15-E007", "P15-E009"],
    "P16": ["P16-E006", "P16-E013"],
    "P17": ["P17-E006", "P17-E015"],
    "P18": ["P18-E006", "P18-E012", "P18-E014", "P18-E016"],
    "P19": ["P19-E024", "P19-E005", "P19-E006"],
    "P20": ["P20-E010", "P20-E011", "P20-E012"],
    "P21": ["P21-E008", "P21-E010"],
    "P22": ["P22-E006", "P22-E013", "P22-E019", "P22-E046"],
    "P23": ["P23-E005"],
    "P24": ["P24-E007", "P24-E019", "P24-E026", "P24-E028"],
    "P25": ["P25-E011", "P25-E005", "P25-E006", "P25-E007"],
    "P26": ["P26-E012", "P26-E013"],
    "P27": ["P27-E007", "P27-E015", "P27-E032"],
    "P28": ["P28-E006", "P28-E012"],
    "P29": ["P29-E039", "P29-E006", "P29-E007", "P29-E008"],
}


ANCHOR_BY_ELEMENT_ID = {
    "P15-E007": "content-confirm", "P15-E009": "content-submit",
    "P17-E006": "ai-parsed-content", "P17-E015": "submit-ai-review",
    "P18-E006": "import-methods", "P18-E012": "import-authorization", "P18-E014": "start-import-analysis",
    "P19-E024": "knowledge-module", "P19-E005": "knowledge-facts-tab", "P19-E006": "knowledge-qa-tab",
    "P20-E010": "login-submit", "P20-E011": "register-entry", "P20-E012": "login-help",
    "P22-E006": "profile-review-status",
    "P23-E005": "enter-workbench",
    "P24-E007": "merchant-qualification", "P24-E019": "store-profile", "P24-E028": "onboarding-submit",
    "P25-E011": "personal-module", "P25-E006": "account-security", "P25-E007": "logout",
    "P26-E012": "register-submit", "P26-E013": "back-to-login",
    "P28-E012": "save-product",
    "P29-E039": "workbench-module", "P29-E006": "insight-tab", "P29-E007": "supplement-tab", "P29-E008": "import-tab",
}


HTML_ANCHORS = {
    "assistant-item.html": [
        ("data-item-accurate", 'data-item-accurate data-ann="content-confirm"'),
        ("data-item-submit>", 'data-item-submit data-ann="content-submit">'),
    ],
    "knowledge-import-relations.html": [
        ('<h2>知识内容 <span', '<h2 data-ann="ai-parsed-content">知识内容 <span'),
        ("data-confirm-knowledge-relations>", 'data-confirm-knowledge-relations data-ann="submit-ai-review">'),
    ],
    "knowledge-import.html": [
        ("<h2>导入授权材料</h2>", '<h2 data-ann="import-methods">导入授权材料</h2>'),
        ("<h2>授权声明</h2>", '<h2 data-ann="import-authorization">授权声明</h2>'),
        ("data-start-knowledge-processing>", 'data-start-knowledge-processing data-ann="start-import-analysis">'),
    ],
    "knowledge.html": [
        ('data-knowledge-tab="facts">', 'data-knowledge-tab="facts" data-ann="knowledge-facts-tab">'),
        ('data-knowledge-tab="qa">', 'data-knowledge-tab="qa" data-ann="knowledge-qa-tab">'),
        ('data-route="knowledge" aria-current="page">', 'data-route="knowledge" data-ann="knowledge-module" aria-current="page">'),
    ],
    "login.html": [
        ('type="submit">登录</button>', 'type="submit" data-ann="login-submit">登录</button>'),
        ('data-route="register?channel=operation-qr"><span>立即注册</span></button>', 'data-route="register?channel=operation-qr" data-ann="register-entry"><span>立即注册</span></button>'),
        ('data-open-modal="help-modal">', 'data-open-modal="help-modal" data-ann="login-help">'),
    ],
    "merchant-profile.html": [
        ("<h2>审核进度</h2>", '<h2 data-ann="profile-review-status">审核进度</h2>'),
    ],
    "onboarding-success.html": [
        ('data-enter-workbench>进入工作台</button>', 'data-enter-workbench data-ann="enter-workbench">进入工作台</button>'),
    ],
    "onboarding.html": [
        ("<h2>经营资料</h2>", '<h2 data-ann="merchant-qualification">经营资料</h2>'),
        ("<h2>门店资料</h2>", '<h2 data-ann="store-profile">门店资料</h2>'),
        ('type="submit" disabled>提交资料并查看审核进度</button>', 'type="submit" data-ann="onboarding-submit" disabled>提交资料并查看审核进度</button>'),
    ],
    "personal-center.html": [
        ('data-route="changePassword">', 'data-route="changePassword" data-ann="account-security">'),
        ('data-logout>退出登录</button>', 'data-logout data-ann="logout">退出登录</button>'),
        ('data-route="personal" aria-current="page">', 'data-route="personal" data-ann="personal-module" aria-current="page">'),
    ],
    "register.html": [
        ('type="submit">完成注册</button>', 'type="submit" data-ann="register-submit">完成注册</button>'),
        ('data-route="login">返回登录</button>', 'data-route="login" data-ann="back-to-login">返回登录</button>'),
    ],
    "store-product-add.html": [
        ('type="submit">保存商品/套餐</button>', 'type="submit" data-ann="save-product">保存商品/套餐</button>'),
    ],
    "workbench.html": [
        ('data-workbench-tab="insight">', 'data-workbench-tab="insight" data-ann="insight-tab">'),
        ('data-workbench-tab="supplement">', 'data-workbench-tab="supplement" data-ann="supplement-tab">'),
        ('data-workbench-tab="import">', 'data-workbench-tab="import" data-ann="import-tab">'),
        ('data-route="workbench" aria-current="page">', 'data-route="workbench" data-ann="workbench-module" aria-current="page">'),
    ],
}


def now_values() -> tuple[str, str]:
    local = datetime.now().astimezone()
    return local.strftime("%Y%m%d-%H%M%S"), local.isoformat(timespec="seconds")


def page_body(title: str, summary: str, rules: list[str], archived: bool = False) -> str:
    if archived:
        return f"""# {title}\n\n## 页面摘要\n\n本页为 V6 知识流程的历史兼容页面，不属于当前 V7 商户端主流程。\n\n## 交互规则\n\n- 保留页面仅用于历史记录、旧链接兼容和方案追溯。\n- V7 当前知识库只使用“经营信息”和“游客问答”，AI问答只使用“经营洞察 / 知识补充 / 添加我的知识”。\n\n## 状态与异常\n\n- 本页不作为新增需求、研发实现或验收入口；如与 V7 规则冲突，以《V7商户端规则定义文档-20260831.md》为准。\n\n## 待确认\n\n- 无。本页已明确为归档兼容页面。\n"""
    bullets = "\n".join(f"- {item}" for item in rules)
    return f"""# {title}\n\n## 页面摘要\n\n{summary}\n\n## 页面结构\n\n- 页面内容、字段、按钮和状态以当前原型为准。\n- 页面级说明用于整体理解；元素级标注只覆盖关键规则、AI 处理、状态和主操作。\n\n## 交互规则\n\n{bullets}\n\n## 状态与异常\n\n- 账号停用或受限后，已登录设备在下一次请求时失效，禁止继续保存或提交，并提示“账号已停用，请联系平台”。\n- 未提交的知识编辑不形成服务端记录；离开页面、关闭页面或退出登录后不保留。\n- 本页规则与旧产品说明冲突时，以《V7商户端规则定义文档-20260831.md》和用户最新确认内容为准。\n\n## 待确认\n\n- 无。本页规则均来自当前原型和已确认的 V7 商户端规则。\n"""


def snapshot_file(source: Path, history_dir: Path, stamp: str) -> None:
    if not source.exists():
        return
    history_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, history_dir / f"{stamp}.before-overwrite{source.suffix}")


def write_specs(pages: list[dict], stamp: str, iso: str) -> None:
    lite_current = LITE / "specs" / "current"
    lite_history = LITE / "specs" / "history"
    full_current = ROOT / "prototype-specs" / "current"
    full_history = ROOT / "prototype-specs" / "history"
    lite_current.mkdir(parents=True, exist_ok=True)
    full_current.mkdir(parents=True, exist_ok=True)
    lite_registry = []
    full_registry = []
    for page in pages:
        key, path, title = page["pageKey"], page["path"], page["title"]
        if key in CURRENT_CONTENT:
            short_title, summary, rules = CURRENT_CONTENT[key]
            body = page_body(short_title, summary, rules)
            page_type = "业务页面"
        else:
            body = page_body(title.replace("铜梁旅游商户端 - ", ""), "", [], archived=True)
            page_type = "归档兼容页"
        lite_path = lite_current / f"{key}.md"
        snapshot_file(lite_path, lite_history / key, stamp)
        lite_front = f'''---\nspecSchemaVersion: 1\nstorageFormat: "markdown"\npageKey: "{key}"\nversion: 2\npageName: "{title}"\npageType: "{page_type}"\npageShape: "移动端页面"\npath: "{path.replace(chr(92), '/')}"\nroute: "/{path.replace(chr(92), '/')}"\nsourceType: "ai-reviewed"\noverwriteProtected: false\nlastGeneratedAt: "{iso}"\nlastManualEditedAt: null\ngenerationMode: "manual"\naiReviewRequired: false\naiReviewStatus: "completed"\n---\n\n'''
        lite_path.write_text(lite_front + body, encoding="utf-8")
        lite_registry.append({"pageKey": key, "pageName": title, "path": path, "route": f"/{path}", "specPath": f"prototype-annotator/specs/current/{key}.md", "sourceType": "ai-reviewed", "lastGeneratedAt": iso})
        if key not in CURRENT_CONTENT:
            continue
        slug = Path(path).stem
        full_path = full_current / f"{slug}.md"
        snapshot_file(full_path, full_history / slug, stamp)
        full_front = f'''---\nspecSchemaVersion: 2\nstorageFormat: "markdown"\npageKey: "{slug}"\nversion: 2\npageName: "{title}"\npageType: "{page_type}"\npageShape: "移动端页面"\nsourceType: "ai-reviewed"\noverwriteProtected: false\nspecId: "{slug}-spec"\nbatchId: "v7-annotation-replan-{stamp}"\nlastGeneratedAt: "{iso}"\nlastManualEditedAt: null\naiReviewRequired: false\naiReviewStatus: "completed"\n---\n\n'''
        full_path.write_text(full_front + body, encoding="utf-8")
        full_registry.append({"pageKey": slug, "pageName": title, "sourceFile": path, "routeHint": path})
    (LITE / "specs" / "registry.json").write_text(json.dumps({"specSchemaVersion": 1, "storageFormat": "markdown", "mode": "page-specs-lite", "historyPolicy": "latest-before-overwrite", "pages": lite_registry, "lastUpdated": iso}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "prototype-specs" / "registry.json").write_text(json.dumps({"specSchemaVersion": 2, "storageFormat": "markdown", "pages": full_registry, "lastUpdated": iso}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def annotation_type_meta(annotation_type: str) -> tuple[str, str, list[str]]:
    mapping = {
        "A": ("interaction", "Primary action", ["business", "interaction", "flow"]),
        "J": ("flow", "Page transition", ["business", "interaction", "flow"]),
        "R": ("rule", "Business rule", ["business", "field-rule", "state"]),
        "S": ("state", "State rule", ["business", "state", "exception"]),
        "AI": ("ai", "AI processing", ["business", "ai", "flow", "exception"]),
        "HITL": ("ai", "Human confirmation", ["business", "ai", "flow", "state"]),
        "DATA": ("data", "Data source", ["business", "data", "source"]),
        "C": ("note", "Module overview", ["business", "source", "flow"]),
    }
    return mapping[annotation_type]


def target_for(selector: str, title: str) -> dict:
    if selector.startswith("#"):
        strategy = "id"
    elif selector.startswith("[") or selector.startswith("button["):
        strategy = "data" if "data-" in selector else "aria"
    else:
        strategy = "path"
    return {"selector": selector, "fallbackText": title, "strategy": strategy, "boundsHint": {"text": title, "tag": "div"}}


def ensure_html_anchors() -> int:
    changed = 0
    for filename, replacements in HTML_ANCHORS.items():
        html_path = ROOT / filename
        source = html_path.read_text(encoding="utf-8")
        updated = source
        for needle, replacement in replacements:
            marker_start = replacement.find('data-ann="')
            if marker_start >= 0:
                marker_end = replacement.find('"', marker_start + len('data-ann="'))
                marker = replacement[marker_start:marker_end + 1]
                if marker in updated:
                    continue
            if replacement in updated:
                continue
            if needle not in updated:
                raise RuntimeError(f"Anchor insertion target not found in {filename}: {needle}")
            updated = updated.replace(needle, replacement, 1)
        if updated != source:
            html_path.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


def write_annotations(page_map: dict, stamp: str, iso: str) -> None:
    previous = json.loads(ANNOTATIONS.read_text(encoding="utf-8"))
    backup_dir = LITE / "history" / f"{stamp}-before-annotation-replan"
    backup_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ANNOTATIONS, backup_dir / "annotations.json")
    candidates_pages = []
    annotations = []
    for page in page_map["pages"]:
        key, title = page["pageKey"], page["title"]
        spec_ref = f"prototype-annotator/specs/current/{key}.md"
        page_elements = {item.get("elementId"): item for item in page.get("elements", [])}
        page_anchor = page_elements.get(f"{key}-E001", {"selector": "main", "strategy": "tag", "text": title, "tag": "main"})
        annotations.append({
            "id": f"ANN-{key}-001", "pageKey": key,
            "target": {"selector": page_anchor["selector"], "fallbackText": title, "strategy": page_anchor.get("strategy", "tag"), "sourceElementId": page_anchor.get("elementId"), "boundsHint": {"text": page_anchor.get("text", title), "tag": page_anchor.get("tag", "main")}},
            "title": f"{title.replace('铜梁旅游商户端 - ', '')} · 页面说明",
            "audienceMode": "product-review", "annotationType": "P", "kind": "note", "dimension": "Page overview",
            "topics": ["source", "business", "flow"], "priority": "high", "visible": True,
            "source": {"type": "page-spec", "ref": spec_ref}, "evidence": [f"页面：{page['path']}", f"页面说明：{spec_ref}"],
            "nextActions": [], "dependencies": [], "risks": [], "openQuestions": [],
            "specRef": spec_ref, "contentSource": {"type": "markdown-file", "ref": spec_ref, "format": "markdown"},
            "maintenancePolicy": "spec-owned", "createdBy": "ai", "review": {"required": True, "status": "approved", "reason": "user-confirmed-annotation-replan"}, "updatedAt": iso,
        })
        page_candidates = []
        for index, (selector, ann_title, ann_type, text) in enumerate(ELEMENTS.get(key, []), start=2):
            ann_id = f"ANN-{key}-{index:03d}"
            cand_id = f"CAND-{key}-{index:03d}"
            kind, dimension, topics = annotation_type_meta(ann_type)
            element_id = TARGET_ELEMENT_IDS[key][index - 2]
            scanned = page_elements[element_id]
            anchor = ANCHOR_BY_ELEMENT_ID.get(element_id)
            actual_selector = f'[data-ann="{anchor}"]' if anchor else scanned["selector"]
            actual_strategy = "data" if anchor else scanned.get("strategy", "path")
            target = {"selector": actual_selector, "fallbackText": scanned.get("text") or ann_title, "strategy": actual_strategy, "sourceElementId": element_id, "boundsHint": {"text": scanned.get("text") or ann_title, "tag": scanned.get("tag", "div")}}
            body = f"### 业务含义\n\n{text}\n\n### 字段规则\n\n- 必填性、默认值、选项来源和格式校验以本标注及页面说明为准；校验失败时保留当前输入并反馈原因。\n\n### 页面流转\n\n- 来源：当前页面或上游业务入口。\n- 目标：操作完成后按页面说明更新状态或进入下一步；取消或返回时回到原页面且不写入未确认内容。\n\n### 状态与异常\n\n- 操作失败时不得误写入或展示未确认内容；页面离开规则按当前页面说明执行。"
            annotations.append({
                "id": ann_id, "pageKey": key, "target": target, "title": ann_title,
                "contentMarkdown": body, "devNotesMarkdown": None, "audienceMode": "product-review", "annotationType": ann_type,
                "kind": kind, "dimension": dimension, "topics": topics, "priority": "high", "visible": True,
                "source": {"type": "mixed", "ref": f"{cand_id}:V7商户端规则定义文档-20260831.md"},
                "evidence": [f"selector：{actual_selector}", f"page-map：{element_id}", "规则来源：V7商户端规则定义文档-20260831.md", f"页面说明：{spec_ref}"],
                "nextActions": [], "dependencies": [], "risks": [], "openQuestions": [], "candidateId": cand_id,
                "selectorQuality": {"level": "stable" if actual_strategy in {"id", "aria", "data"} else "reviewed", "issues": []},
                "maintenancePolicy": "annotation-owned", "createdBy": "ai", "review": {"required": True, "status": "approved", "reason": "user-confirmed-annotation-replan"}, "updatedAt": iso,
            })
            page_candidates.append({
                "candidateId": cand_id, "pageKey": key, "elementId": element_id, "selector": actual_selector,
                "strategy": actual_strategy, "fallbackText": scanned.get("text") or ann_title, "annotationType": ann_type,
                "kind": kind, "dimension": dimension, "priority": "high", "reason": "按用户确认的模块、页签或关键业务规则保留。",
                "evidence": [f"页面：{page['path']}", "V7商户端规则定义文档-20260831.md"], "selected": True, "skipReason": None,
            })
        candidates_pages.append({"pageKey": key, "title": title, "path": page["path"], "route": page.get("route", f"/{page['path']}"), "candidates": page_candidates})
    rebuilt = {key: value for key, value in previous.items() if key not in {"annotations", "surfaces"}}
    rebuilt["annotations"] = annotations
    rebuilt["surfaces"] = []
    rebuilt["audienceMode"] = "product-review"
    ANNOTATIONS.write_text(json.dumps(rebuilt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    candidates = {
        "version": 1, "generatedAt": iso, "root": str(ROOT),
        "sources": {"pageMap": "page-map.json", "docs": [str(RULES), str(PRODUCT_SPEC)]},
        "pages": candidates_pages,
    }
    candidate_path = LITE / "annotation-candidates.json"
    if candidate_path.exists():
        shutil.copy2(candidate_path, backup_dir / "annotation-candidates.json")
    candidate_path.write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_log(iso: str) -> None:
    text = ITERATION_LOG.read_text(encoding="utf-8")
    heading = "### 页面说明与标注体系重构"
    if heading in text:
        return
    addition = f"""\n{heading}\n\n- 按 `{iso}` 的确认方案重新生成页面级需求说明和可视化标注。\n- 知识库、AI问答、个人中心分别在当前底部菜单保留一个模块总览标注，不在每页重复标注全部导航。\n- 知识库的“经营信息 / 游客问答”分别标注数据来源；AI问答的三个页签和个人中心的两个功能入口分别独立标注。\n- 所有页面保留一个 Markdown-first 页面说明入口；归档页面仅保留兼容说明，当前业务子页面按规则、AI、状态和主操作保留高价值标注。\n- 旧页面说明、旧 Page Specs Lite 和旧标注数据已在各自 history 目录留存覆盖前快照；产品说明书未随本次操作更新。\n"""
    marker = "\n## 后续记录规则"
    text = text.replace(marker, addition + marker) if marker in text else text + addition
    ITERATION_LOG.write_text(text, encoding="utf-8")


def main() -> None:
    stamp, iso = now_values()
    anchors_changed = ensure_html_anchors()
    page_map = json.loads(PAGE_MAP.read_text(encoding="utf-8"))
    write_specs(page_map["pages"], stamp, iso)
    write_annotations(page_map, stamp, iso)
    update_log(iso)
    print(f"Rebuilt {len(page_map['pages'])} Page Specs Lite files, {len(CURRENT_CONTENT)} full page specs, annotations, and {anchors_changed} HTML anchor files at {iso}.")


if __name__ == "__main__":
    main()
