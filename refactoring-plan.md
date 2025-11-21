# MixFan 重构计划

## 组件拆分

### 1. 布局组件

- `AppHeader.vue` - 顶部导航栏
- `AppFooter.vue` - 页脚

### 2. 功能组件

- `ComposeBox.vue` - 发布框组件
- `TimelineFilter.vue` - 时间线筛选器
- `UserProfile.vue` - 用户信息展示
- `PostCard.vue` - 统一的帖子卡片
  - `MastodonPostContent.vue` - Mastodon 特定内容渲染
  - `FanfouPostContent.vue` - 饭否特定内容渲染
- `MediaAttachment.vue` - 媒体附件组件
- `LoadMore.vue` - 加载更多按钮

## Composables 拆分

### 1. 认证相关

- `useAuth.js` - 处理认证逻辑

### 2. 时间线相关

- `useTimeline.js` - 处理时间线加载和合并逻辑

### 3. 发布相关

- `useCompose.js` - 处理消息发布逻辑

### 4. 主题相关

- `useTheme.js` - 处理主题切换逻辑

## 工具函数拆分

- `formatters.js` - 格式化函数（如时间格式化）
- `helpers.js` - 通用辅助函数（如安全获取属性）

## 重构步骤

1. 创建基础目录结构
2. 提取 Composables
3. 创建基础组件
4. 重构主 App.vue 文件
5. 调整样式结构

## 目录结构

```
src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   ├── compose/
│   │   ├── ComposeBox.vue
│   │   └── MediaUpload.vue
│   ├── timeline/
│   │   ├── TimelineFilter.vue
│   │   ├── PostCard.vue
│   │   ├── MastodonPostContent.vue
│   │   ├── FanfouPostContent.vue
│   │   ├── MediaAttachment.vue
│   │   └── LoadMore.vue
│   └── user/
│       └── UserProfile.vue
├── composables/
│   ├── useAuth.js
│   ├── useTimeline.js
│   ├── useCompose.js
│   └── useTheme.js
├── utils/
│   ├── formatters.js
│   └── helpers.js
├── assets/
│   └── styles/
│       ├── base.css
│       └── components.css
└── App.vue
```
