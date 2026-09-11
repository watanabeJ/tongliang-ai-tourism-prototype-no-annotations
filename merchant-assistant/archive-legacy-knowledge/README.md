# 旧方案页面归档

本目录存放 V6 商户端方案调整后不再参与当前主流程的页面。文件仅用于历史方案追溯，不作为当前原型入口。

## 归档页面

- `assistant.html`：旧版独立经营助手任务列表
- `knowledge.html`：旧版知识板块
- `information-confirm.html`、`information-edit.html`：旧版营业时间确认与修改
- `address-confirm.html`、`address-edit.html`：旧版到店地址确认与修改
- `question-answer.html`、`question-family.html`、`question-parking.html`、`question-booking.html`：旧版游客问题回答页
- `knowledge-detail.html`、`knowledge-detail-hours.html`、`knowledge-detail-family.html`、`knowledge-detail-address.html`：旧版知识详情页

## 当前替代路径

`workbench.html` → 工作台内嵌待补充/已完成列表 → `assistant-item.html` → `workbench.html`

归档页中的相对资源引用可能不再适合直接运行，需要回看时可将页面移回上级目录或调整资源路径。
