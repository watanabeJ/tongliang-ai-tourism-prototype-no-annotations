---
specSchemaVersion: 2
storageFormat: "markdown"
pageKey: "negative-feedback"
version: 1
pageName: "负面反馈"
pageType: "详情页"
pageShape: "移动端页面"
sourceType: "ai-reviewed"
overwriteProtected: false
specId: "negative-feedback-spec"
batchId: "spec-batch-20260903-142246"
lastGeneratedAt: "2026-09-03T14:22:46+08:00"
lastManualEditedAt: null
generationMode: "model"
aiReviewRequired: false
aiReviewStatus: "completed"
---

# 负面反馈

## 页面摘要

汇总从用户对话中识别出的负面反馈，展示当前时间范围内的总量、相对上期变化、分类占比和重点关注结论。

## 【数据来源】规则说明

1. 负面反馈全部来源于用户对话内容，不来源于商户填报或人工新建记录。
2. 系统从对话文本中识别负向表达，并以负面反馈条数作为总量口径。
3. 页面仅展示聚合统计和运营建议，不展示具体用户对话原文。

## 【时间范围】交互规则说明

1. 默认选中“今日”。
2. 切换“今日”“本周”“本月”“全部”后，同步刷新负面反馈总量、上期对比、分类占比和重点关注文案。
3. 今日、本周、本月分别与对应上一周期比较；全部展示平台累计反馈口径。

## 【负面分类】显示规则说明

1. 饼图按停车不便、接驳等待、餐饮价格和其他四类展示占比。
2. 图例同步展示分类名称和百分比，各分类占比合计为 100%。
3. 分类占比随时间范围切换而更新。

## 【重点关注】显示规则说明

1. 重点关注区域展示当前时间范围内最需要跟进的负面类别及建议。
2. 点击顶部返回按钮回到运营总览。
