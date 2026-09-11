---
specSchemaVersion: 2
storageFormat: "markdown"
pageKey: "login"
version: 1
pageName: "政府端登录"
pageType: "表单页"
pageShape: "移动端页面"
sourceType: "ai-reviewed"
overwriteProtected: false
specId: "login-spec"
batchId: "spec-batch-20260903-142246"
lastGeneratedAt: "2026-09-03T14:22:46+08:00"
lastManualEditedAt: null
generationMode: "model"
aiReviewRequired: false
aiReviewStatus: "completed"
---

# 政府端登录

## 页面摘要

面向政府端用户提供账号密码登录入口，登录成功后进入运营总览。

## 【字段输入】规则说明

1. 账号和密码均为必填项，字段约束如下表。

| 字段 | 形态 | 必填 | 说明 |
|---|---|---|---|
| 账号 | 单行文本输入 | 是 | 默认填入演示账号 `gov-demo`，提交前去除首尾空格。 |
| 密码 | 密码输入 | 是 | 默认填入演示密码 `123456`，输入内容以密码形态展示，提交前去除首尾空格。 |

## 【登录提交】交互规则说明

1. 点击登录或在表单内提交时校验账号与密码。
2. 演示账号和密码匹配时写入当前会话登录标记，并跳转至运营总览。
3. 账号或密码不匹配时停留当前页，并提示“账号或密码不正确”。
4. 错误提示约 2 秒后自动隐藏，用户输入仍保留在表单中。

## 【页面提示】显示规则说明

1. 页面提示用户使用分配好的政府端账号密码登录。
2. 当前原型中的其他功能页允许直接打开，不会强制校验登录状态。
