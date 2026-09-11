---
specSchemaVersion: 2
storageFormat: "markdown"
pageKey: "activity-detail"
version: 1
pageName: "活动详情"
pageType: "详情页"
pageShape: "移动端页面"
sourceType: "ai-reviewed"
overwriteProtected: false
specId: "activity-detail-spec"
batchId: "spec-batch-20260902-093754"
lastGeneratedAt: "2026-09-02T09:37:54+08:00"
lastManualEditedAt: "2026-09-02T09:45:00+08:00"
generationMode: "manual"
aiReviewRequired: false
aiReviewStatus: "completed"
---

# 活动详情

## 页面摘要

展示由首页轮播或对话传入的活动图片、名称、简介和场次提示，并提供预约入口的原型反馈。

## 二级承载面

- 微信小程序控制区：仅为页面壳层展示。
- 预约入口：点击后显示“已为您打开活动预约入口”的轻量反馈，不生成正式预约记录。

## 【活动信息】规则说明

- 页面默认展示“铜梁龙舞展演”、活动现场图片和活动简介。
- URL 参数 name、image、intro 存在时，分别替换名称、图片和简介；缺少参数时沿用默认内容。
- 场次文案提示“活动安排以当日场次为准，建议提前预约并预留到场时间”，不承诺实时场次或库存。

## 【页面导航】交互规则说明

- 点击“返回”回到 plan.html，不新增历史会话。
- 活动详情不提供地图、心愿单或购买入口。

## 【预约活动】交互规则说明

- 点击“预约活动”只显示原型 Toast 反馈。
- 未接入正式预约服务前，不写入预约状态、订单或支付记录。

## 状态与异常

- 图片加载失败时保留活动名称、简介和预约入口，使用现有图片占位策略。
- 缺少活动名称或简介时使用页面默认文案。
- 正式场次、库存和预约结果由服务端提供后，才可作为可验收能力。

## 待确认

- 正式预约服务接入后，需要补充场次选择、名额校验和取消规则。
