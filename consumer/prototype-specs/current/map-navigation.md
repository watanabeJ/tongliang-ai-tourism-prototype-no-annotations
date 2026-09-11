---
specSchemaVersion: 2
storageFormat: "markdown"
pageKey: "map-navigation"
version: 1
pageName: "地图导航"
pageType: "工具页"
pageShape: "移动端地图页面"
sourceType: "ai-reviewed"
overwriteProtected: false
specId: "map-navigation-spec"
batchId: "spec-batch-20260904-171149"
lastGeneratedAt: "2026-09-04T17:11:49+08:00"
lastManualEditedAt: null
generationMode: "manual"
aiReviewRequired: false
aiReviewStatus: "completed"
---

# 地图导航

## 页面摘要

导航页承接 POI 卡片和对话推荐的导航动作，展示目的地名称、地址和可用的导航、打车与收藏入口。

## 【目的地信息】显示规则说明

1. 页面从 URL 参数读取目的地名称和地址，并在地图底部信息面板展示。
2. 名称优先显示当前 POI 的实际名称；地址为空时使用可用的区域地址，不伪造更精确位置。
3. 信息面板使用清晰的标题、地址和操作间距，长地址自动换行，不遮挡操作区。

## 【导航操作】交互规则说明

1. `导航`为当前目的地的主操作；从 POI 卡片地址行、对话推荐地址行进入时，目的地信息必须保持一致。
2. `打车`与`收藏`仅在原型中展示操作入口；未接入真实服务时只提供明确反馈，不产生订单或正式收藏结果。
3. 返回入口回到上一浏览页面；没有有效上一页时回到首页。

## 状态与异常

1. 缺少目的地名称或地址时，展示可用字段并保留返回入口。
2. 地图底图不可用时，目的地信息和主操作仍可见，不显示虚构路线。

