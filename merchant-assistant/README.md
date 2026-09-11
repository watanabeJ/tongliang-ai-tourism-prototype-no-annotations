# V6 商户端经营助手方案原型

本目录继承 `merchant` 中已确认的商户端界面，后续经营助手方案只在本目录继续迭代，原目录不再调整。

## 启动

```powershell
node serve.js
```

也可以直接双击 `start.cmd`。

默认入口：`http://127.0.0.1:4187/`

商户通过运营二维码进入注册页，填写11位手机号并设置登录密码；注册成功后进入资料提交页。资料提交后再次使用手机号和密码登录会直接进入工作台。

原型中的运营二维码注册链接：`http://127.0.0.1:4187/register.html?channel=operation-qr`。

## 当前页面

- `login.html`：注册手机号与密码登录
- `register.html`：运营二维码商户注册页
- `onboarding.html`：首次提交商户资料
- `onboarding-success.html`：资料提交成功
- `workbench.html`：工作台
- 工作台 AI问答包含 `经营洞察`、`知识补充`、`添加知识内容` 三个页签；添加知识内容沿用独立导入、解析确认和 AI 审核提交流程
- `knowledge.html`：知识库（只读查看已确认内容）
- `knowledge-import.html`：导入授权材料并启动 AI 解析
- `knowledge-import-relations.html`：查看、编辑解析出的候选知识并提交 AI 审核
- `personal-center.html`：个人中心
- `store-info.html`：门店信息子页
- `store-product-add.html`：添加推荐商品/套餐子页
- `assistant-item.html`：通用单项处理页（信息核实、游客问题回答）
- `merchant-profile.html`：商户资料与审核进度
- `merchant-profile-correction.html`：历史兼容文件，当前商户资料页不再提供入口
- `change-password.html`：修改密码

主路径：`workbench.html`（AI问答） → 工作台内嵌核对列表 → `assistant-item.html` → `workbench.html`。底部主导航提供 `knowledge.html`（知识库）、`workbench.html`（AI问答）、`personal-center.html`（个人中心）三个入口。商户从工作台展开列表、选择一项处理，返回或提交后均回到工作台。

旧版独立经营助手和知识页面已移动到`archive-legacy-knowledge`，不参与当前运行路径。归档清单见该目录中的`README.md`。

审核退回状态可通过 `workbench.html?review=changes` 和 `merchant-profile.html?review=changes` 查看。
