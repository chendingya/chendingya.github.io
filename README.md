# AI Blog

基于 Node.js 的静态博客生成器。Markdown 写作，EJS 模板渲染，输出纯静态 HTML，部署到任意托管平台。

## 快速开始

```bash
npm install --ignore-scripts && npm rebuild    # Windows 需跳过 Defender 拦截
npm run build                                   # 编译 → dist/
npm run dev                                     # 预览 http://localhost:3000（热更新）
```

## 目录结构

```
content/
├── posts/                # 文章（支持任意层级子目录）
│   ├── 技术/             #   子目录名会保留在 URL 中
│   │   └── react.md
│   ├── 生活/
│   └── hello.md
├── pages/                # 独立页面
└── assets/               # 静态资源
    ├── css/style.css     #   样式规则（变量由主题注入）
    ├── js/main.js        #   交互脚本（data-* 约定驱动）
    └── images/           #   全局图片

config/
├── default.yml           # 站点配置
└── themes/
    └── cream.yml         # 主题变量（颜色/字体/间距/圆角）

templates/
├── layouts/              # 页面模板（default 为布局包裹器）
└── partials/             # header / footer 公用片段

src/core/                 # 构建核心
src/plugins/              # 插件（每个 .js 文件声明自定义页面）
dist/                     # 编译输出（可直接部署）
```

## 编写文章

在 `content/posts/` 下创建 `.md`：

```markdown
---
title: 文章标题
date: 2026-06-02
author: 作者名
tags: [标签1, 标签2]
categories: [分类1]
description: 摘要
---
正文内容（GFM 标准 Markdown）
```

- `title` 和 `date` 必填，其余可选
- `tags` / `categories` 支持数组 `[a, b]` 或单个值 `a`
- 文件名格式 `YYYY-MM-DD-slug.md`，日期前缀会被自动去除
- slug 默认为文件名去日期后的部分，也可在 Front Matter 中写 `slug: custom-slug`

### 文章图片

图片放在文章同级的**同名文件夹**下：

```
content/posts/技术/
├── react-intro.md
└── react-intro/
    └── screenshot.png
```

Markdown 中用相对路径：

```markdown
![截图](react-intro/screenshot.png)
```

编译时图片会自动复制到 `dist/` 并保持目录结构。Typora 的绝对路径（`C:\Users\...`）会被识别并替换为占位图。

## 配置

### 站点配置 `config/default.yml`

| 字段 | 类型 | 说明 |
|------|------|------|
| `site.title` | string | 博客名 |
| `site.description` | string | 站点描述（SEO + Hero 区域） |
| `site.author` | string | 默认作者 |
| `site.baseURL` | string | 部署域名，用于 RSS / sitemap / OG 标签 |
| `site.language` | string | HTML lang 属性 |
| `theme` | string | 主题名，对应 `config/themes/<name>.yml` |
| `navigation` | array | 导航菜单 |
| `social` | object | 社交链接（github / twitter / email） |
| `links` | array | 友链列表 |
| `posts.perPage` | number | 首页每页文章数（默认 10） |
| `posts.permalink` | string | URL 格式，默认 `/posts/:slug/` |
| `plugins.enabled` | array | 插件启用白名单（空=全部加载） |
| `plugins.disabled` | array | 插件禁用黑名单 |
| `markdown.highlight` | bool | 是否启用代码高亮 |

### 主题配置 `config/themes/cream.yml`

YAML 中的所有键直接对应 CSS 变量名，构建时注入页面 `<style>` 块。可修改的部分：

| 分组 | 包含变量 |
|------|---------|
| `fonts` | `--font-display` `--font-body` `--font-mono` |
| `light` | 浅色模式下所有颜色 + 阴影 + 品牌色 |
| `dark` | 暗色模式下对应变量 |
| `accent` | `--accent-coral` `--accent-amber` 等 9 个多巴胺点缀色 |
| `layout` | `--max-width` `--content-width` |
| `space` | `--space-xs` ~ `--space-3xl` |
| `radius` | `--radius-sm` ~ `--radius-xl` |
| `easing` | `--ease-out` `--ease-in-out` `--duration-fast/normal/slow` |

换主题：复制 `cream.yml` → 修改 → 在 `default.yml` 中改 `theme` 字段 → `npm run build`。

## 命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 完整编译到 `dist/` |
| `npm run dev` | 启动 browser-sync，文件变化自动重编译 |
| `npm run clean` | 删除 `dist/` |

## 架构约定

### 模板 ↔ JS 解耦

模板用 `data-*` 属性标记交互元素，JS 通过属性选择器查找：

| 属性 | 用途 |
|------|------|
| `data-action="toggle-theme"` | 暗色模式切换按钮 |
| `data-action="toggle-menu"` | 移动端菜单按钮 |
| `data-target="main-nav"` | 导航菜单容器 |

JS 只控制行为，不创建 DOM 节点。进度条和返回顶部按钮在模板中声明，JS 仅控制显隐。

### CSS ↔ 主题解耦

`style.css` 只含规则，不含 `:root` 变量块。CSS 变量由构建时从 `config/themes/*.yml` 生成内联 `<style>` 注入页面。换主题不需要改 CSS 文件。

### 图片策略

1. `content/assets/images/` → 全局图片（直接复制到 `dist/images/`）
2. `content/posts/**/*.{png,jpg,...}` → 文章图片（保持目录结构复制到 `dist/`）
3. 外部 URL → 透传
4. 缺失图片 → 内联 SVG 占位图

## 插件开发

在 `src/plugins/` 下创建 `.js` 文件即可注入自定义页面：

```js
module.exports = {
  name: 'my-plugin',
  pages() {
    return [{
      url: '/my-page/',
      title: '我的页面',
      description: '页面描述',
      bodyClass: 'my-page',
      content: '<h2>Hello</h2>'        // 内联 HTML
      // contentFile: 'my-page.html'    // 或从外部 HTML 文件加载
      // template: 'my-page',           // 或用 EJS 模板名
    }];
  },
  navigation() {
    return [{ title: '我的页面', url: '/my-page/' }];  // 自动追加到导航
  }
};
```

- `pages()` 支持 async，可用于动态数据获取
- 内容三种方式：`content`（内联 HTML）、`contentFile`（外部 HTML 文件路径，相对于插件目录）、`template`（EJS 模板名）
- `template` 模式优先查找插件自带 `templates/` 目录
- 单个插件错误不阻断构建
- 配置白名单/黑名单见 `config/default.yml` 的 `plugins` 段

## 部署

`dist/` 即完整静态站点，由 CI 自动编译部署：

- **GitHub Pages**：推送 `blog` 分支 → CI 自动编译 → 部署 `dist/` 到 `main` 分支 → Settings 中 Pages Source 选 `main / (root)`。详见 `.github/workflows/deploy.yml`
- **Vercel / Netlify**：指定输出目录为 `dist`
- **任意服务器**：`npm run build` 后复制 `dist/` 到 Web 根目录
