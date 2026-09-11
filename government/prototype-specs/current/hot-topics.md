---
specSchemaVersion: 2
storageFormat: "markdown"
pageKey: "hot-topics"
version: 2
pageName: "热点问题"
pageType: "详情页"
pageShape: "移动端页面"
sourceType: "ai-reviewed"
overwriteProtected: false
specId: "hot-topics-spec"
batchId: "spec-batch-20260903-142246"
lastGeneratedAt: "2026-09-03T14:22:46+08:00"
lastManualEditedAt: "2026-09-04T17:42:50+08:00"
generationMode: "model"
aiReviewRequired: false
aiReviewStatus: "completed"
---

# 热点问题

## 页面摘要

汇总用户提问中被集中询问的问题，展示当前时间范围内的提问次数、分类占比和热点说明。

## 【数据来源】规则说明

1. 热点问题数据来源于用户提问中对某些问题的提问次数，不来源于商户填报或人工新建记录。
2. 系统按问题主题统计提问次数；本日超过 5 次、本周超过 20 次、本月超过 50 次时，定义为热点问题。
3. 页面仅展示聚合统计和热点结论，不展示具体用户提问原文。

## 【时间范围】交互规则说明

1. 默认选中“今日”。
2. 切换“今日”“本周”“本月”“全部”后，同步刷新热点问题提问次数、分类占比和热点说明。
3. “全部”展示平台运行以来累计识别的问题提及次数。

## 【热点分类】显示规则说明

1. 饼图按停车与接驳、火龙演出时间、亲子游路线三类展示占比。
2. 图例同步展示分类名称和百分比，各分类占比合计为 100%。
3. 分类占比随时间范围切换而更新。

## 【热点说明】显示规则说明

1. 热点说明按当前时间范围概括关注度最高及其次的主题。
2. 点击顶部返回按钮回到运营总览。
