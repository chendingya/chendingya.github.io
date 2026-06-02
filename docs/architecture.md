# 系统架构设计文档

## 1. 架构概述

AI Blog是一个静态站点生成器，将Markdown文件转换为可部署到GitHub Pages的静态HTML网站。系统采用模块化设计，核心流程包括：内容解析、图片处理、模板渲染和文件生成。

## 2. 目录结构设计

```
ai-blog/
├── src/                    # 源代码目录
│   ├── core/              # 核心模块
│   ├── plugins/           # 插件系统（可选）
│   └── utils/             # 工具函数
├── templates/             # HTML模板目录
│   ├── layouts/           # 布局模板
│   ├── partials/          # 局部模板（头部、导航、页脚）
│   └── themes/            # 主题目录
├── content/               # 内容目录（用户创建）
│   ├── posts/             # Markdown文章
│   ├── pages/             # 独立页面（关于、友链等）
│   └── assets/            # 静态资源（图片、CSS、JS）
├── config/                # 配置文件目录
│   └── default.yml        # 默认配置
├── dist/                  # 输出目录（生成的静态文件）
├── docs/                  # 文档
├── package.json           # 项目配置
└── README.md              # 项目说明
```

## 3. 核心模块设计

### 3.1 配置管理器（Config Manager）
- **职责**：加载和管理配置文件（default.yml, 用户自定义配置）。
- **输入**：配置文件路径。
- **输出**：合并后的配置对象。
- **关键配置项**：
  - `site.title`：站点标题
  - `site.description`：站点描述
  - `site.author`：作者信息
  - `site.baseURL`：部署基础URL（如`https://username.github.io/repo`）
  - `theme`：主题名称
  - `build.output`：输出目录（默认`dist`）
  - `markdown`：Markdown解析选项

### 3.2 内容解析器（Content Parser）
- **职责**：扫描内容目录，解析Markdown文件和front matter。
- **输入**：内容目录路径。
- **输出**：文章列表，每篇文章包含：
  - `metadata`：front matter解析的元数据
  - `content`：Markdown原始内容
  - `filePath`：文件路径
  - `slug`：URL slug
- **依赖**：
  - `gray-matter`：解析YAML front matter
  - `markdown-it`或`remark`：Markdown解析（支持GFM）

### 3.3 图片处理器（Image Processor）
- **职责**：优化图片，生成响应式图片。
- **输入**：图片路径（本地或URL）。
- **输出**：优化后的图片文件，HTML图片标签（带`srcset`和`sizes`）。
- **功能**：
  - 压缩图片（JPEG、PNG、WebP）
  - 生成多种尺寸（如320w、640w、1024w）
  - 懒加载支持（添加`loading="lazy"`）
  - 生成模糊占位符（可选）
- **依赖**：`sharp`（图片处理库）

### 3.4 模板引擎（Template Engine）
- **职责**：将内容和数据渲染到HTML模板中。
- **输入**：模板文件、数据对象（文章内容、配置等）。
- **输出**：完整的HTML页面。
- **模板语言**：EJS、Handlebars或Nunjucks（选择一种）。
- **功能**：
  - 布局继承（layouts）
  - 局部模板（partials）
  - 辅助函数（helpers）：日期格式化、标签链接等

### 3.5 文件生成器（File Generator）
- **职责**：将渲染后的HTML写入输出目录，并复制静态资源。
- **输入**：渲染后的HTML内容、静态资源路径。
- **输出**：输出目录中的文件结构。
- **功能**：
  - 创建输出目录结构
  - 写入HTML文件
  - 复制CSS、JS、图片等静态资源
  - 生成RSS feed（可选）

## 4. 构建流程

```
开始
  ↓
加载配置（Config Manager）
  ↓
扫描内容目录（Content Parser）
  ↓
解析Markdown文件和front matter
  ↓
处理图片（Image Processor）
  ↓
应用模板（Template Engine）
  ↓
生成HTML文件（File Generator）
  ↓
复制静态资源
  ↓
生成RSS feed（可选）
  ↓
结束
```

## 5. 数据流设计

### 5.1 文章数据流
```
Markdown文件 → 解析front matter → 解析Markdown内容 → 图片处理 → 模板渲染 → HTML文件
```

### 5.2 配置数据流
```
default.yml + 用户配置.yml → 合并配置 → 传递给各模块
```

### 5.3 静态资源数据流
```
content/assets/ → 复制到dist/assets/（可能经过优化处理）
```

## 6. 关键设计决策

### 6.1 Markdown解析器选择
- **推荐**：`markdown-it`（灵活、插件丰富）或`remark`（AST友好）。
- **理由**：支持GFM、代码高亮、表格等特性。

### 6.2 图片处理策略
- **构建时处理**：在构建阶段生成优化后的图片，避免运行时开销。
- **响应式图片**：生成多种尺寸，使用`srcset`和`sizes`属性。
- **懒加载**：默认启用，提升首屏加载速度。

### 6.3 模板系统
- **推荐**：EJS（简单易学）或Nunjucks（功能更强大）。
- **理由**：与JavaScript生态系统集成良好，学习成本低。

### 6.4 主题系统
- **实现**：通过CSS变量和主题目录实现主题切换。
- **结构**：每个主题包含`style.css`和可选的`templates/`目录。

## 7. 技术栈

### 7.1 核心依赖
- **运行时**：Node.js 16+
- **构建工具**：npm scripts
- **Markdown解析**：`markdown-it` + 插件
- **图片处理**：`sharp`
- **模板引擎**：`ejs` 或 `nunjucks`
- **YAML解析**：`gray-matter`、`js-yaml`

### 7.2 开发依赖
- **代码规范**：ESLint
- **测试框架**：Jest
- **本地服务器**：`browser-sync` 或 `live-server`

## 8. 扩展性考虑

### 8.1 插件系统（可选）
- 支持自定义插件扩展功能（如自定义Markdown语法、新的页面类型）。
- 插件接口：`plugin(config, content) => processedContent`。

### 8.2 自定义主题
- 主题目录结构标准化，允许用户创建自定义主题。
- 提供主题开发文档。

## 9. 部署架构

### 9.1 GitHub Pages部署
```
用户推送代码到GitHub
  ↓
GitHub Actions触发构建
  ↓
运行构建脚本（npm run build）
  ↓
生成静态文件到dist/目录
  ↓
部署到GitHub Pages
```

### 9.2 本地开发
```
用户运行本地开发服务器（npm run dev）
  ↓
监视文件变化
  ↓
自动重新构建
  ↓
实时预览（BrowserSync）
```

## 10. 性能优化策略

### 10.1 构建性能
- **增量构建**：只处理修改过的文件。
- **并行处理**：图片处理等耗时任务并行执行。
- **缓存**：缓存已处理的图片和解析结果。

### 10.2 运行时性能
- **图片优化**：压缩、现代格式、响应式。
- **CSS/JS压缩**：生产环境压缩静态资源。
- **关键CSS内联**：首屏关键CSS内联到HTML。

## 11. 安全考虑

### 11.1 内容安全
- **XSS防护**：Markdown解析时转义HTML标签（可配置）。
- **外部链接**：添加`rel="noopener noreferrer"`。

### 11.2 构建安全
- **依赖安全**：定期更新依赖，使用`npm audit`检查漏洞。

## 12. 监控与日志

### 12.1 构建日志
- 输出构建过程中的详细日志（文件数量、处理时间等）。
- 错误处理：捕获并显示友好的错误信息。

### 12.2 性能监控（可选）
- 生成构建报告（文件大小、图片优化率等）。

## 13. 未来扩展

### 13.1 可能的功能扩展
- 多语言支持（i18n）
- 搜索功能（客户端搜索）
- 评论系统集成（Disqus、Gitalk等）
- 自动部署脚本（GitHub Actions模板）

### 13.2 性能扩展
- CDN集成
- Service Worker支持（离线访问）
