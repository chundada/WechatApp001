# 瘦身搭档 - Slim Partner

一个基于 UniApp + Vue3 + TypeScript 开发的微信小程序，帮助用户记录减肥体重、打卡记录，并支持与微信好友进行比赛和对比。

## ✨ 功能特性

### 📊 体重管理
- 记录每日体重，自动计算变化趋势
- 生成体重变化图表，直观展示减肥进度
- 设定目标体重，追踪完成进度

### 🏆 挑战群
- 创建减肥挑战群，邀请好友一起挑战
- 通过群号加入已有挑战群
- 群成员专属排行榜，互相激励
- 只有群友能看到彼此的减肥信息

### 👥 好友系统
- 查看微信好友的减肥进度
- 与好友进行体重对比
- 好友排行榜，激励竞争

### 📅 打卡记录
- 每日打卡，记录减肥历程
- 连续打卡奖励，保持积极性
- 打卡日历，查看历史记录

### 🏅 成就系统
- 多种成就徽章可解锁
- 减重成就：减重5kg、10kg等
- 打卡成就：连续打卡7天、30天等
- 目标成就：达到目标体重

### 🎨 Apple 风格 UI
- 深色主题设计，护眼舒适
- 精致的渐变色彩和圆角设计
- 流畅的动画交互效果

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0+ | 跨平台小程序框架 |
| Vue | 3.4+ | 渐进式 JavaScript 框架 |
| TypeScript | 5.3+ | 类型安全的 JavaScript |
| Pinia | 2.1+ | Vue 状态管理库 |
| SCSS | 1.70+ | CSS 预处理器 |
| Vite | 5.0+ | 下一代前端构建工具 |
| 微信云开发 | - | 后端服务与数据库 |

## 🚀 快速开始

### 前置条件

- Node.js >= 18.0.0
- 微信开发者工具
- Git

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5
```

### 构建生产版本

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

### 在微信开发者工具中预览

1. 执行 `npm run dev:mp-weixin`
2. 打开微信开发者工具
3. 选择「导入项目」
4. 选择 `dist/dev/mp-weixin` 目录
5. 填写 AppID（或使用测试号）

## 📁 项目结构

```
slim-partner/
├── cloudfunctions/          # 微信云函数
│   └── login/               # 登录函数
├── src/
│   ├── pages/               # 页面组件
│   │   ├── index/           # 首页（打卡、数据概览）
│   │   ├── record/          # 体重记录
│   │   ├── chart/           # 数据统计图表
│   │   ├── friends/         # 好友对比
│   │   ├── competition/     # 挑战赛
│   │   ├── achievements/    # 成就系统
│   │   └── profile/         # 个人中心
│   ├── stores/              # Pinia 状态管理
│   │   ├── user.ts          # 用户状态
│   │   ├── friends.ts       # 好友状态
│   │   └── groups.ts        # 群组状态
│   ├── styles/              # 全局样式
│   │   └── global.scss      # Apple 风格主题变量
│   ├── static/              # 静态资源
│   ├── App.vue              # 应用入口
│   ├── main.ts              # 主入口文件
│   ├── pages.json           # 页面路由配置
│   └── manifest.json        # 应用配置
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎯 使用指南

### 1. 注册登录

首次打开小程序时，系统会自动调用微信登录，获取用户信息。

### 2. 设置目标

在「个人中心」设置目标体重和开始体重。

### 3. 记录体重

点击「记录」页面，输入当日体重，系统自动计算变化。

### 4. 创建挑战群

在「挑战赛」页面创建新挑战，分享群号给好友。

### 5. 加入挑战群

在「挑战赛」页面输入群号，加入好友创建的挑战群。

## 📱 页面预览

| 页面 | 说明 |
|------|------|
| 🏠 首页 | 今日打卡、体重概览、快捷入口 |
| 📝 记录 | 添加体重记录、历史记录列表 |
| 📊 图表 | 体重趋势折线图、统计数据 |
| 👥 好友 | 好友排行榜、对比分析 |
| 🏆 挑战 | 创建/参与挑战赛、挑战进度 |
| 🎖️ 成就 | 成就徽章、解锁进度 |
| 👤 我的 | 个人资料、目标设置、设置 |

## 🔧 配置说明

### 微信云开发配置

在 `src/App.vue` 中配置云开发环境 ID：

```typescript
uni.cloud.init({
  env: 'your-cloud-env-id'
})
```

### 小程序配置

在 `src/manifest.json` 中配置小程序 AppID：

```json
{
  "mp-weixin": {
    "appid": "your-app-id"
  }
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [https://github.com/chundada/WechatApp001/issues](https://github.com/chundada/WechatApp001/issues)

---

**💪 坚持减肥，遇见更好的自己！**
