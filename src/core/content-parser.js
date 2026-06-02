const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItToc = require('markdown-it-toc-done-right');

class ContentParser {
  constructor(config) {
    this.config = config;
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: this.config.markdown.highlight ? this.highlightCode.bind(this) : false
    });
    
    // 添加锚点插件
    this.md.use(markdownItAnchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '#',
      permalinkClass: 'header-anchor'
    });
    
    // 添加目录插件
    this.md.use(markdownItToc, {
      containerClass: 'table-of-contents',
      listType: 'ul',
      listClass: 'toc-list',
      itemClass: 'toc-item',
      linkClass: 'toc-link'
    });
  }

  highlightCode(str, lang) {
    // 简单的代码高亮实现，后续可以集成highlight.js或prism
    const escapedStr = this.md.utils.escapeHtml(str);
    if (lang) {
      return `<pre><code class="language-${lang}">${escapedStr}</code></pre>`;
    }
    return `<pre><code>${escapedStr}</code></pre>`;
  }

  async parseFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return this.parseContent(content, filePath);
    } catch (error) {
      throw new Error(`解析文件失败 ${filePath}: ${error.message}`);
    }
  }

  parseContent(content, filePath) {
    // 解析front matter
    const { data: metadata, content: markdownContent } = matter(content);
    
    // 生成slug
    const slug = this.generateSlug(filePath, metadata);
    
    // 生成URL
    const url = this.generateUrl(slug, metadata);
    
    // 解析Markdown内容
    const htmlContent = this.md.render(markdownContent);
    
    // 提取目录
    const toc = this.extractToc(markdownContent);
    
    // 处理图片路径
    const processedContent = this.processImagePaths(htmlContent, filePath);
    
    return {
      metadata: {
        ...metadata,
        slug,
        url,
        filePath,
        fileName: path.basename(filePath),
        date: metadata.date ? new Date(metadata.date) : new Date(),
        tags: metadata.tags || [],
        categories: metadata.categories || [],
        description: metadata.description || '',
        image: metadata.image || '',
        author: metadata.author || this.config.site.author
      },
      content: markdownContent,
      htmlContent: processedContent,
      toc,
      filePath,
      slug,
      url
    };
  }

  generateSlug(filePath, metadata) {
    // 如果metadata中有slug，使用它
    if (metadata.slug) {
      return metadata.slug;
    }
    
    // 从文件名生成slug
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // 移除日期前缀（如果存在）
    const datePrefixRegex = /^\d{4}-\d{2}-\d{2}-/;
    const slug = fileName.replace(datePrefixRegex, '');
    
    // 转换为URL友好的格式
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  generateUrl(slug, metadata) {
    // 如果metadata中有permalink，使用它
    if (metadata.permalink) {
      return metadata.permalink;
    }
    
    // 使用配置的permalink格式
    const date = metadata.date ? new Date(metadata.date) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let permalink = this.config.posts.permalink || '/:year/:month/:day/:slug/';
    
    permalink = permalink
      .replace(':year', year)
      .replace(':month', month)
      .replace(':day', day)
      .replace(':slug', slug);
    
    return permalink;
  }

  extractToc(content) {
    // 提取标题生成目录
    const headings = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[#*`]/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        headings.push({
          level,
          text,
          id
        });
      }
    }
    
    return headings;
  }

  processImagePaths(htmlContent, filePath) {
    // 处理图片路径，将相对路径转换为绝对路径
    const fileDir = path.dirname(filePath);
    const postsDir = path.resolve(this.config.posts.dir);
    
    return htmlContent.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/g, (match, before, src, after) => {
      // 如果是外部URL，直接返回
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
        return match;
      }
      
      // 如果是绝对路径，转换为相对于posts目录的路径
      if (src.startsWith('/')) {
        return `<img${before}src="${src}"${after}>`;
      }
      
      // 相对路径处理
      const absolutePath = path.resolve(fileDir, src);
      const relativePath = path.relative(postsDir, absolutePath);
      const newSrc = '/' + relativePath.replace(/\\/g, '/');
      
      return `<img${before}src="${newSrc}"${after}>`;
    });
  }

  async parseDirectory(dirPath) {
    try {
      const files = await this.getMarkdownFiles(dirPath);
      const posts = [];
      
      for (const file of files) {
        const post = await this.parseFile(file);
        posts.push(post);
      }
      
      // 按日期排序（最新的在前）
      posts.sort((a, b) => b.metadata.date - a.metadata.date);
      
      return posts;
    } catch (error) {
      throw new Error(`解析目录失败 ${dirPath}: ${error.message}`);
    }
  }

  async getMarkdownFiles(dirPath) {
    const files = [];
    
    if (!await fs.pathExists(dirPath)) {
      return files;
    }
    
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        // 递归处理子目录
        const subFiles = await this.getMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (stat.isFile() && /\.(md|markdown)$/i.test(item)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  generateExcerpt(content, maxLength = 200) {
    // 生成摘要
    const plainText = content
      .replace(/#+\s+/g, '') // 移除标题标记
      .replace(/[*_`]/g, '') // 移除强调标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 提取链接文本
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // 移除图片
      .replace(/\n+/g, ' ') // 替换换行为空格
      .trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    // 截断到完整单词
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }
}

module.exports = ContentParser;