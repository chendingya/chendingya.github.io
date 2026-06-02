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
│   └── core/              # 核心模块
│       ├── config-manager.js
│       ├── content-parser.js
│       ├── image-processor.js
│       ├── template-engine.js
│       └── file-generator.js
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

### 架构

插件系统允许通过 `src/plugins/` 下的 JS 文件注入自定义页面，构建时自动生成并注入导航菜单。

```
src/plugins/*.js → PluginManager.loadPlugins() → pages() + navigation()
    → FileGenerator.generatePluginPages() → dist/<url>/index.html
    → TemplateEngine.prepareTemplateData() → 合并 navigation
```

### 插件接口

每个插件 JS 文件导出：

- `name` — 必填，插件标识符
- `pages()` — 必填，返回页面描述数组（支持 async）
  - `url` — 永久链接路径（如 `/projects/`）
  - `title` / `description` — SEO 元数据
  - `content` — 原始 HTML，用 `page.ejs` + `default.ejs` 渲染
  - `template` — 自定义 EJS 模板名，优先查找插件自带模板
  - `templateData` — 传给 EJS 模板的数据
- `navigation()` — 可选，返回导航条目数组

### 模板查找顺序

```
1. src/plugins/<插件名>/templates/<名>.ejs   （插件自带）
2. templates/themes/<主题>/layouts/<名>.ejs   （主题模板）
3. templates/layouts/<名>.ejs                （默认模板）
```

### 配置

`config/default.yml` 中 `plugins` 段控制启用/禁用：

```yaml
plugins:
  enabled: []   # 空 = 全部加载
  disabled: []  # 排除列表
```

### 设计约束

- 插件页面始终套 `default.ejs` 布局
- 插件导航追加到 `navigation` 末尾，不覆盖手动配置
- `pages()` 可为 async 函数
- 单个插件错误不阻断构建
