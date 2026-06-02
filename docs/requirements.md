# 需求文档

## 1. 项目概述

**项目名称**：AI Blog  
**项目目标**：将 Markdown 文章编译为纯静态 HTML 博客，部署到 GitHub Pages 等免费托管平台。  
**技术栈**：Node.js + EJS + markdown-it + sharp + browser-sync

## 2. 功能清单

### 2.1 内容管理

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 转 HTML | ✅ | GFM 标准，支持代码高亮、锚点、目录 |
| YAML Front Matter | ✅ | title/date/author/tags/categories/description |
| 子目录分类 | ✅ | `content/posts/` 下任意层级，中文目录名保留在 URL |
| tags/categories | ✅ | 自动规范化为数组，单值或多值均兼容 |
| 独立页面 | ✅ | `content/pages/` 目录 |
| 文章分页 | ✅ | 首页按 `posts.perPage` 分页 |

### 2.2 主题与样式

| 功能 | 状态 | 说明 |
|------|------|------|
| 主题系统 | ✅ | YAML 变量文件 + 构建时注入 CSS 变量 |
| 暗色模式 | ✅ | 手动切换 + 系统偏好检测 + localStorage 记忆 |
| 响应式设计 | ✅ | 1440px / 1024px / 768px / 480px 断点 |
| 代码高亮 | ⚠️ | markdown-it 基础高亮，需引入 highlight.js/prism 完善 |
| 文章目录 | ✅ | 自动从标题生成可折叠 TOC |
| 打印样式 | ✅ | 隐藏导航/页脚，优化排版 |
| 减少动画 | ✅ | `prefers-reduced-motion` 适配 |

### 2.3 图片处理

| 功能 | 状态 | 说明 |
|------|------|------|
| 响应式图片 | ✅ | 多尺寸裁剪 + srcset / sizes |
| WebP 转换 | ✅ | 自动生成 WebP 格式 |
| 图片压缩 | ✅ | sharp 压缩，可调节质量 |
| 懒加载 | ✅ | `loading="lazy"` |
| 文章图片 | ✅ | 同级同名文件夹下的图片自动复制到 dist |
| Typora 绝对路径 | ✅ | 自动识别并替换为 SVG 占位图 |
| 缺失图片 | ✅ | 内联 SVG 占位 + 聚合日志 |

### 2.4 导航与页面

| 功能 | 状态 | 说明 |
|------|------|------|
| 首页文章列表 | ✅ | 卡片式布局，按日期倒序 |
| 归档页 | ✅ | 按年/月分组 |
| 标签页 | ✅ | 标签云 + 单标签文章列表 |
| 分类页 | ✅ | 分类卡片 + 单分类文章列表 |
| 404 页面 | ✅ | 自定义错误页 |
| RSS 订阅 | ✅ | `feed.xml` |
| sitemap | ✅ | `sitemap.xml` |
| robots.txt | ✅ | 自动生成 |

### 2.5 交互

| 功能 | 状态 | 说明 |
|------|------|------|
| 返回顶部 | ✅ | 滚动超过 400px 显示 |
| 阅读进度条 | ✅ | 页面顶部 3px 渐变色条 |
| 代码复制 | ✅ | 代码块右上角复制按钮 |
| 移动端菜单 | ✅ | 汉堡菜单 + 外部点击关闭 |
| 外部链接 | ✅ | 自动 `target="_blank"` |

### 2.6 部署

| 功能 | 状态 | 说明 |
|------|------|------|
| GitHub Pages | ✅ | dist/ 直接推送部署 |
| Vercel / Netlify | ✅ | 自定义输出目录 |
| 开发服务器 | ✅ | browser-sync 热更新 localhost:3000 |

## 3. 架构约定

### 3.1 主题与代码解耦

- 主题变量存储在 `config/themes/` YAML 文件中
- `style.css` **不含** `:root` 变量块，只含规则
- 构建时从 YAML 生成 CSS 变量内联注入页面
- 换主题仅需创建/修改 YAML，不改任何 CSS/JS 文件

### 3.2 JS ↔ HTML 解耦

- 模板使用 `data-action` / `data-target` 标记交互元素
- JS 通过 `querySelector('[data-action]')` 查找
- 不在 JS 中硬编码 ID
- DOM 节点在模板中声明，JS 不创建新节点

### 3.3 图片路径约定

- 文章图片放在 md 文件同级的**同名文件夹**下
- URL 使用相对路径引用：`![alt](post-name/image.png)`
- 编译时自动复制到 dist 并保持目录结构

## 4. 待实现

| 功能 | 优先级 |
|------|--------|
| 评论系统集成（Giscus / Disqus） | 低 |
| 全文搜索 | 低 |
| 多语言支持 | 低 |
| 图片自动上传 CDN | 低 |
| 插件系统 | ✅ | 自定义页面注入 + 导航自动合并，见 `src/plugins/` |
