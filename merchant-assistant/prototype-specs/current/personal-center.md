---
specSchemaVersion: 2
storageFormat: "markdown"
pageKey: "personal-center"
version: 2
pageName: "铜梁旅游商户端 - 个人中心"
pageType: "业务页面"
pageShape: "移动端页面"
sourceType: "ai-reviewed"
overwriteProtected: false
specId: "personal-center-spec"
batchId: "v7-annotation-replan-20260904-104747"
lastGeneratedAt: "2026-09-04T10:47:47+08:00"
lastManualEditedAt: null
aiReviewRequired: false
aiReviewStatus: "completed"
---

# 个人中心

## 页面摘要

提供商户资料、账号安全和退出登录三项账户管理入口。

## 页面结构

- 页面内容、字段、按钮和状态以当前原型为准。
- 页面级说明用于整体理解；元素级标注只覆盖关键规则、AI 处理、状态和主操作。

## 交互规则

- 底部“个人中心”聚合当前商户账号的资料、审核和安全设置。
- “商户资料”用于查看资质审核进度，并维护联系人和门店信息；不再单独提供门店信息入口。
- “账号安全”进入修改密码页面。
- 退出登录清除当前设备登录态、本地草稿和未提交知识编辑，不影响服务端已提交、审核中或已生效数据。

## 状态与异常

- 账号停用或受限后，已登录设备在下一次请求时失效，禁止继续保存或提交，并提示“账号已停用，请联系平台”。
- 未提交的知识编辑不形成服务端记录；离开页面、关闭页面或退出登录后不保留。
- 本页规则与旧产品说明冲突时，以《V7商户端规则定义文档-20260831.md》和用户最新确认内容为准。

## 待确认

- 无。本页规则均来自当前原型和已确认的 V7 商户端规则。
