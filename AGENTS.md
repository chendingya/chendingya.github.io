# AGENTS.md

AI Blog — EJS 静态博客生成器。详细文档见 `docs/architecture.md` 和 `README.md`。

## 命令

```bash
npm install --ignore-scripts && npm rebuild   # Windows: Defender 会拦截 browser-sync postinstall
npm run build                                  # 完整编译 → dist/
npm run dev                                    # http://localhost:3000 热更新
```

## 架构关键点

### 模板渲染流程

`template-engine.js` 的 `renderWithLayout()` 是入口 — 先渲染内容模板，再包裹 `default.ejs`。**永远不要**在 `index.ejs`/`post.ejs` 等子模板中 `<%- include(...) %>` header/footer，它们由 `default.ejs` 统一注入。

### CSS 变量来源

`style.css` **不含** `:root` 变量块。变量由 `config/themes/cream.yml` 定义，`template-engine.generateThemeCSS()` 在构建时生成内联 `<style>` 注入页面。修改变量 → 改 YAML 即可，不要往 `style.css` 里加 `:root`。

### JS ↔ HTML 解耦

模板用 `data-action`/`data-target` 标记交互元素，`main.js` 用属性选择器查找。**不要**用 ID 选择器（`#themeToggle`、`#menuToggle` 等已废弃）。

DOM 节点（进度条、返回顶部按钮）在 `default.ejs` 中声明，`main.js` 只做显隐控制，不创建新节点。

### 图片路径

- 文章图片放 md 文件同级的**同名子文件夹**：`content/posts/技术/react-intro/react-intro/image.png`
- 构建时自动复制到 `dist/` 保持目录结构
- Typora 绝对路径（`C:\Users\...`）自动识别为占位图
- 缺失图片用内联 SVG 占位，日志聚合为一行汇总

### 永久链接

默认 `/posts/:slug/`。slug 由文件路径减去 posts 目录前缀 + 日期前缀生成，子目录名保留。配置在 `config/default.yml` 的 `posts.permalink`。

### Front Matter 规范

`tags`/`categories` 在 `content-parser.js` 中自动规范化为数组。单值 `tags: 教程` 和数组 `tags: [教程]` 等价。

## Windows 特别注意事项

- `npm install` 加 `--ignore-scripts`，否则 browser-sync 的 postinstall 被 Defender 拦截报 EPERM
- `npm run clean` 用 `rm -rf`，Windows 上需 Git Bash 或 WSL；PowerShell 替代：`Remove-Item -Recurse -Force dist`
- 构建时 EPERM on rmdir → 先杀残留 node 进程：`Get-Process node \| Stop-Process -Force`

## 主题定制

1. 复制 `config/themes/cream.yml` → 新文件
2. 修改 YAML 中的 CSS 变量值
3. 改 `config/default.yml` 中 `theme: "新文件名"`
4. `npm run build`

YAML key 即 CSS 变量名（如 `--bg-cream`、`--space-md`），不要改前缀规则。
