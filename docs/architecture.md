# 系统架构文档

## 1. 架构概述

AI Blog 是 Node.js 静态站点生成器。一次 `npm run build` 执行完整管线：

```
配置加载 → 文章/页面解析 → 图片处理 → 模板渲染 → 文件生成 → SEO 生成
```

### 设计原则

- **零运行时框架** — 输出纯 HTML/CSS/JS，无 React/Vue 运行时依赖
- **约定优于配置** — 文件名即 slug，子目录即分类路径
- **主题与代码解耦** — 主题变量在 YAML 中，CSS 只含规则，JS 用 data-* 约定驱动
- **内容与构建分离** — 文章在 `content/`，构建逻辑在 `src/`

## 2. 目录结构

```
├── content/               # 用户内容
│   ├── posts/             # Markdown 文章（支持任意层级子目录）
│   ├── pages/             # 独立页面
│   └── assets/            # 静态资源（CSS / JS / 图片）
├── config/
│   ├── default.yml        # 站点配置
│   └── themes/            # 主题变量文件
│       └── cream.yml
├── templates/
│   ├── layouts/           # 页面模板（default 为全局布局包裹器）
│   └── partials/          # header / footer
├── src/
│   ├── index.js           # 主入口（AIBlog 类）
│   ├── core/              # 核心模块
│   │   ├── config-manager.js
│   │   ├── content-parser.js
│   │   ├── image-processor.js
│   │   ├── template-engine.js
│   │   ├── file-generator.js
│   │   └── plugin-manager.js
│   ├── plugins/           # 插件目录
│   │   ├── _draft.js      # _开头跳过
│   │   └── project-showcase.js
│   └── utils/
├── dist/                  # 编译输出（可直接部署）
└── docs/                  # 项目文档
```

## 3. 核心模块

### 3.1 配置管理器 `config-manager.js`

加载 `config/default.yml`，可选加载 `config/user.yml` 覆盖默认值。提供深层合并、`get(key)` / `set(key, value)` 接口。

### 3.2 内容解析器 `content-parser.js`

- 递归扫描 `content/posts/` 和 `content/pages/` 下所有 `.md` 文件
- 使用 `gray-matter` 解析 YAML Front Matter
- 使用 `markdown-it` 渲染 HTML（支持 GFM、锚点、目录）
- 自动生成 slug（保留中文，子目录名纳入 slug）
- 自动生成 URL（按 `posts.permalink` 格式）
- `tags` / `categories` 自动规范化为数组
- 日期三级回退：Front Matter date → 文件名 YYYY-MM-DD- 前缀 → 文件修改时间
- `processImagePaths()` 重写图片路径：相对路径 → 统一前缀，Windows 绝对路径 → SVG 占位

### 3.3 图片处理器 `image-processor.js`

- 外部 URL → 透传不处理
- `content/assets/` 下的图片 → 压缩、响应式裁剪、WebP 转换
- `content/posts/` 下的图片 → 透传原始文件，URL 保持目录结构
- 缺失图片 + Windows 绝对路径 → 内联 SVG 占位图，日志聚合汇总
- 自动 `decodeURIComponent()` 解码图片路径（兼容 Typora 百分号编码中文）
- 处理完调用 `summary()` 输出统计，不逐张刷屏

### 3.4 模板引擎 `template-engine.js`

- 使用 EJS 渲染
- `renderWithLayout()` 方法：先渲染内容模板，再包裹 `default.ejs` 全局布局
- `generateThemeCSS()` ：从 `config/themes/<name>.yml` 读取变量，生成 `:root {}` + `[data-theme="dark"] {}` CSS 块
- 支持 RSS feed 生成

### 3.5 文件生成器 `file-generator.js`

- `generate()` 入口：清理输出目录 → 按序生成所有页面 → 复制资源 → 输出统计
- 生成产物：首页（含分页）、文章/页面详情、归档、标签列表/单页、分类列表/单页、404、RSS
- `copyImages()` ：从 `content/assets/images/` 和 `content/posts/**/` 两处递归复制图片到 `dist/`

## 4. 模板渲染流程

```
renderWithLayout('post', data)
  ├── render('post', data)          # 渲染 post.ejs → 文章正文 HTML
  ├── prepareTemplateData(data)     # 注入 site/posts/themeCSS 等
  └── render('default', data)       # 将正文 HTML 作为 body 嵌入 default.ejs
       ├── header.ejs               #   导航（data-action 标记交互）
       ├── <%= body %>              #   文章正文
       └── footer.ejs               #   页脚
```

## 5. 主题系统

### 变量注入

```
config/themes/cream.yml  →  templateEngine.generateThemeCSS()  →  <style> 内联块
```

CSS 变量在 `<head>` 中内联注入，优先级高于外部 `style.css`。变量名直接使用 YAML key：

```yaml
light:
  --bg-cream: "#FEFAF6"      # 生成 :root { --bg-cream: #FEFAF6; }
dark:
  --bg-cream: "#1A1614"      # 生成 [data-theme="dark"] { --bg-cream: #1A1614; }
accent:
  --accent-coral: "#FF6B6B"   # 生成 :root { --accent-coral: #FF6B6B; }
```

### 换主题流程

1. 复制 `config/themes/cream.yml` → 新文件名
2. 修改变量值
3. 修改 `config/default.yml` 中 `theme` 字段
4. `npm run build`

## 6. JS ↔ HTML 解耦

通过 `data-*` 属性约定实现零 ID 硬编码：

| 模板 | 属性 | JS 选择器 |
|------|------|----------|
| `<button data-action="toggle-theme">` | 触发主题切换 | `[data-action="toggle-theme"]` |
| `<button data-action="toggle-menu">` | 触发移动菜单 | `[data-action="toggle-menu"]` |
| `<nav data-target="main-nav">` | 菜单容器 | `[data-target="main-nav"]` |
| `<div class="reading-progress">` | 进度条 | `.reading-progress` |
| `<button class="back-to-top">` | 返回顶部 | `.back-to-top` |

DOM 节点在模板中声明，JS 只做类名切换和事件绑定，不创建新节点。

## 7. 图片处理流程

```
Markdown img src
  ├── http(s)://     → 透传
  ├── C:\Users\...   → SVG 占位图（Typora 遗留路径）
  ├── /xxx/yy.png    → 先查 content/assets/ 再查 content/posts/
  └── rel/yy.png     → 相对 md 文件解析
       ├── 找到     → 透传原始文件到 dist/（保持目录结构）
       └── 未找到   → SVG 占位图
```

## 8. 永久链接

默认格式 `/posts/:slug/`，其中 slug 由文件路径减去日期前缀后生成，子目录名保留：

```
content/posts/23-服务端/ch01-intro.md  →  /posts/23-服务端/ch01-intro/
content/posts/hello.md                 →  /posts/hello/
```

可通过 `posts.permalink` 配置自定义格式，支持 `:year` `:month` `:day` `:slug` 占位符。

## 9. 插件系统

### 9.1 设计目标

插件系统解决"博客不仅仅是 Markdown 文章"的问题。通过插件可以注入：
- **独立功能页面**（画廊、项目展示、友链列表等），带专属 CSS/JS
- **动态数据**（GitHub 仓库列表、豆瓣书单、Twitter 时间线等）
- **内容增强**（给文章加标记、修改元数据等）
- **导航扩展**（自动在菜单中注册新入口）

### 9.2 架构概览

```
config/default.yml                      ← 插件级配置 (plugins.config)
       │
       ▼
PluginManager.loadPlugins()
  ├── 扫描 src/plugins/*.js（跳过 _开头 文件）
  ├── 校验 name + pages() 必须存在
  ├── 注入插件级配置 → this.config
  ├── 解析 assets 声明 → CSS/JS/Static 映射
  ├── collectPages() → 收集页面描述
  └── collectNavigation() → 收集导航条目
       │
       ▼
AIBlog.build()
  ├── pluginManager.beforeBuild()        ← 构建前钩子
  ├── pluginManager.beforeParse()        ← 解析前钩子
  ├── pluginManager.processPost(post)    ← 逐篇文章处理
  ├── pluginManager.processPage(page)    ← 逐页面处理
  ├── pluginManager.afterParse(posts,pages) ← 解析后钩子
  ├── pluginManager.collectDataSource()  ← 加载虚拟数据源
  ├── FileGenerator.generatePluginPages()  ← 生成 dist/<url>/index.html
  ├── FileGenerator.copyPluginAssets()   ← 复制插件 CSS/JS 到 dist
  │       ├── 注入到 default.ejs <head>  (pluginCSS)
  │       └── 注入到 default.ejs <body>  (pluginJS)
  └── pluginManager.afterBuild(dist)     ← 构建后钩子
```

### 9.3 插件接口（完整）

```js
module.exports = {
  name: 'my-plugin',           // 必填 — 插件标识符

  // ========== 页面生成（必填） ==========
  pages() {
    return [{
      url: '/my-page/',        // 必填 — 页面路径
      title: '页面标题',        // SEO 标题
      description: '描述',      // SEO 描述
      bodyClass: 'my-page',    // <body> 附加 class

      // 内容来源三选一：
      content: '<h2>Hello</h2>',           // ① 内联 HTML
      contentFile: 'my-page.html',          // ② 外部 HTML（相对插件目录）
      template: 'my-template',              // ③ EJS 模板名
      templateData: { extra: 'data' }       //    传入模板的额外数据
    }];
  },

  // ========== 生命周期钩子（全部可选） ==========
  afterInit(config) {},         // 配置加载、插件加载完成后
  beforeBuild() {},             // 构建开始前
  beforeParse() {},             // 解析文章/页面前
  processPost(post) {},         // 每篇文章解析后（可 mutate post.metadata）
  processPage(page) {},         // 每个页面解析后（可 mutate page.metadata）
  afterParse(posts, pages) {},  // 所有文章/页面解析后
  afterBuild(outputDir) {},     // 构建完成后
  devStart() {},                // 开发服务器启动后

  // ========== 导航注入（可选） ==========
  navigation() {
    return [{ title: '页面名', url: '/my-page/' }];
  },

  // ========== 静态资源（可选） ==========
  assets: {
    css: ['style.css'],         // 自动复制到 dist/plugins/<name>/ 并注入 <link>
    js: ['script.js'],          // 自动复制并注入 <script defer>
    static: ['images/']         // 自动复制整个目录
  },

  // ========== 虚拟数据源（可选，支持 async） ==========
  async dataSource() {
    // 返回的数据注入到模板 dataSources.<插件名>
    return { repos: [...] };
  }
};
```

### 9.4 生命周期钩子执行顺序

```
afterInit(config)
    ↓
beforeBuild()
    ↓
beforeParse()
    ↓
processPost(post) × N       ← 每篇文章逐一调用
processPage(page) × N       ← 每个页面逐一调用
    ↓
afterParse(posts, pages)
    ↓
collectDataSource()         ← 加载虚拟数据源
    ↓
[图片处理、模板渲染、文件生成]
    ↓
afterBuild(outputDir)
    ↓
devStart()                  ← 仅 dev 模式
```

- 所有钩子均为**可选实现**，不存在不影响运行
- 单个插件的钩子报错**不阻断构建**，仅输出 warn
- `processPost` / `processPage` 可直接修改 `post.metadata` / `page.metadata`

### 9.5 插件级配置

`config/default.yml` 中定义，构建时注入到插件的 `this.config`：

```yaml
plugins:
  enabled: []                    # 空 = 全部加载；填入名称 = 白名单模式
  disabled: []                   # 黑名单，优先级高于 enabled
  config:                        # 插件级配置（key = 插件 name）
    project-showcase:
      title: "项目展示"
      maxProjects: 12
    gallery:
      apiKey: "xxx"
```

在插件中通过 `this.config` 读取：
```js
pages() {
  const cfg = this.config;  // { title: "项目展示", maxProjects: 12 }
}
```

### 9.6 模板查找顺序

```
1. src/plugins/<name>/templates/<template>.ejs   （插件自带）
2. templates/themes/<theme>/layouts/<template>.ejs （主题模板）
3. templates/layouts/<template>.ejs              （默认模板）
```

### 9.7 静态资源注入

插件声明的 `assets` 在构建时自动处理：

```
src/plugins/gallery/style.css     → dist/plugins/gallery/style.css
src/plugins/gallery/script.js     → dist/plugins/gallery/script.js
src/plugins/gallery/images/       → dist/plugins/gallery/images/
```

同时自动注入到 `default.ejs`：
```html
<head>
  <!-- 自动注入 -->
  <link rel="stylesheet" href="/plugins/gallery/style.css">
</head>
<body>
  <!-- 自动注入 -->
  <script src="/plugins/gallery/script.js" defer></script>
</body>
```

### 9.8 虚拟数据源

`dataSource()` 返回的数据注入到所有页面模板的 `dataSources` 变量：

```js
// 插件
async dataSource() {
  const res = await fetch('https://api.github.com/users/chendingya/repos');
  return { repos: await res.json() };
}
```

```ejs
<!-- 任意模板中 -->
<% if (dataSources['my-plugin'] && dataSources['my-plugin'].repos) { %>
  <% dataSources['my-plugin'].repos.forEach(function(repo) { %>
    <div><%= repo.name %> — ★ <%= repo.stargazers_count %></div>
  <% }) %>
<% } %>
```

### 9.9 文件命名规则

- `.js` 文件 — 有效插件（不支持 `.mjs`）
- `_` 开头文件 — 跳过不加载（如 `_draft.js`）
- 非 JS 文件 — 忽略（HTML/CSS 通过 `contentFile` / `assets` 引用）
