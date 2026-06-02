---
title: "欢迎使用AI Blog"
date: 2026-06-02
author: "Your Name"
tags: ["博客", "AI", "入门"]
categories: ["教程"]
description: "这是你的第一篇博客文章，了解如何使用AI Blog系统。"
image: "/assets/images/welcome.jpg"
---

# 欢迎使用AI Blog

恭喜！你已经成功安装了AI Blog系统。这是一个将Markdown转换为静态HTML页面的个人博客系统。

## 快速开始

### 1. 创建文章

在 `content/posts` 目录下创建一个新的Markdown文件，例如 `my-first-post.md`。文件名将用作URL slug。

### 2. 添加Front Matter

每个Markdown文件都需要YAML front matter，用于设置文章元数据：

```yaml
---
title: "文章标题"
date: 2026-06-02
author: "作者名"
tags: ["标签1", "标签2"]
categories: ["分类"]
description: "文章描述"
image: "文章封面图路径（可选）"
---
```

### 3. 编写内容

使用标准Markdown语法编写内容。支持以下特性：

- **粗体**、*斜体*、~~删除线~~
- [链接](https://example.com)
- 图片：`![图片描述](图片路径)`
- 代码块（支持语法高亮）
- 表格
- 列表（有序和无序）

## 图片处理

系统会自动处理图片：

1. **优化**：压缩图片，减少文件大小
2. **响应式**：生成多种尺寸，适配不同设备
3. **懒加载**：提升页面加载速度

### 本地图片

将图片放在 `content/assets/images` 目录下，然后在Markdown中引用：

```markdown
![示例图片](/assets/images/example.jpg)
```

### 外部图片

也可以使用外部图片URL：

```markdown
![外部图片](https://example.com/image.jpg)
```

## 代码高亮

系统支持代码语法高亮：

```javascript
function hello() {
  console.log("Hello, AI Blog!");
}
```

```python
def hello():
    print("Hello, AI Blog!")
```

## 表格

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown转HTML | ✅ | 核心功能 |
| 图片优化 | ✅ | 自动压缩和响应式 |
| 代码高亮 | ✅ | 支持多种语言 |
| 暗色模式 | ✅ | 自动切换 |
| RSS生成 | ✅ | 可选功能 |

## 下一步

1. 修改 `config/default.yml` 配置文件
2. 创建更多文章
3. 自定义主题样式
4. 部署到GitHub Pages

## 部署到GitHub Pages

1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择部署分支（通常是 `main` 或 `gh-pages`）
4. 等待构建完成，访问你的博客！

## 获取帮助

如有问题，请查看文档或提交Issue。

---

*本文由AI Blog系统自动生成。*
