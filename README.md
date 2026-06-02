# AI Blog

基于 Node.js 的静态博客生成器，将 Markdown 文章编译为纯静态 HTML，部署到任意静态托管平台。

## 快速开始

```bash
npm install
npm run build     # 编译到 dist/
npm run dev       # 本地预览 http://localhost:3000
```

## 目录结构

```
content/posts/          # 写文章的地方（支持子目录分类）
  ├── 技术/
  │   └── react-intro.md
  ├── 生活/
  │   └── travel.md
  └── hello.md

content/pages/          # 独立页面（关于、友链等）
content/assets/         # 静态资源（CSS / JS / 图片）
config/
  ├── default.yml       # 站点配置
  └── themes/
      └── cream.yml     # 主题变量
templates/              # EJS 模板
src/                    # 构建脚本
dist/                   # 编译输出（可部署）
```

## 编写文章

在 `content/posts/` 下创建 `.md` 文件，顶部 Front Matter：

```markdown
---
title: 文章标题
date: 2026-06-02
author: 作者名
tags: [标签1, 标签2]
categories: [分类1]
description: 文章摘要
---
正文内容...
```

### 文章图片

推荐把图片放在文章同级的同名文件夹下：

```
content/posts/技术/
├── react-intro.md
└── react-intro/
    └── screenshot.png
```

Markdown 中写相对路径即可：

```markdown
![截图](react-intro/screenshot.png)
```

## 配置

### 站点配置 `config/default.yml`

| 字段 | 说明 |
|------|------|
| `site.title` | 博客名称 |
| `site.description` | 站点描述 |
| `site.author` | 默认作者 |
| `site.baseURL` | 部署域名 |
| `theme` | 主题名，对应 `config/themes/<name>.yml` |
| `navigation` | 导航菜单 |
| `social` | 社交链接（github/twitter/email） |
| `links` | 友链列表 |
| `posts.perPage` | 首页每页文章数 |
| `posts.permalink` | 文章 URL 格式，默认 `/posts/:slug/` |

### 主题配置 `config/themes/cream.yml`

所有 CSS 变量均可自由修改：颜色、字体、间距、圆角、过渡动画。

换主题只需复制一份 YAML 文件，修改变量值，然后在 `default.yml` 中改 `theme` 字段。

## 命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 编译输出到 `dist/` |
| `npm run dev` | 启动开发服务器，文件变化自动重编译 |
| `npm run clean` | 清理 `dist/` |

## 部署

`dist/` 目录即完整静态站点，可部署到：

- **GitHub Pages**：直接推送 `dist/` 到 `gh-pages` 分支
- **Vercel / Netlify**：指定输出目录为 `dist`
- **任意静态服务器**：复制 `dist/` 到服务器根目录
