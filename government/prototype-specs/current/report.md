---
specSchemaVersion: 2
storageFormat: "markdown"
pageKey: "report"
version: 2
pageName: "运行报告"
pageType: "报告页"
pageShape: "移动端页面"
sourceType: "ai-reviewed"
overwriteProtected: false
specId: "report-spec"
batchId: "spec-batch-20260903-142246"
lastGeneratedAt: "2026-09-03T14:22:46+08:00"
lastManualEditedAt: "2026-09-04T17:42:50+08:00"
generationMode: "model"
aiReviewRequired: false
aiReviewStatus: "completed"
---

# 运行报告

## 页面摘要

把当前时间范围内的新增用户、新增商户和热点问题汇总为指标，并由 AI 生成辅助运营判断的文字报告。

## 【时间范围】交互规则说明

1. 默认选中“今日”。
2. 切换“今日”“本周”“本月”“全部”后，同步刷新三项指标、报告标题和报告正文。
3. “全部”时间范围的标题显示为“平台运行报告”，其他范围显示为对应周期运行报告。

## 【报告指标】显示规则说明

1. 三项报告指标均随当前时间范围同步更新，具体口径如下表。

| 指标 | 口径 |
|---|---|
| 新增用户 | 当前时间范围内的新增用户数量 |
| 新增商户 | 当前时间范围内的新增商户数量 |
| 热点问题 | 来自用户提问中对问题主题的提问次数；本日超过 5 次、本周超过 20 次、本月超过 50 次定义为热点问题 |

## 【AI 运行报告】规则说明

1. AI 综合当前时间范围的三项指标和热点分类生成文字总结。
2. 热点分析来源于用户提问中对问题主题的提问次数。
3. 报告正文随时间范围同步切换，不提供手动编辑入口。
4. AI 总结仅用于辅助运营判断，不作为正式处置结论。

## 【页面导航】交互规则说明

1. 点击顶部返回按钮回到运营总览。
