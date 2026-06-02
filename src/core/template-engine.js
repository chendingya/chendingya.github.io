const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const yaml = require('js-yaml');

class TemplateEngine {
  constructor(config, pluginNav = []) {
    this.config = config;
    this.templatesDir = path.resolve('templates');
    this.layoutsDir = path.join(this.templatesDir, 'layouts');
    this.partialsDir = path.join(this.templatesDir, 'partials');
    this.themesDir = path.join(this.templatesDir, 'themes');
    this.configThemesDir = path.resolve('config/themes');
    this.pluginsDir = path.resolve('src/plugins');

    this.templateCache = new Map();
    this.theme = this.loadTheme();
    this.pluginNav = pluginNav;
  }

  loadTheme() {
    const themeName = this.config.theme || 'default';
    const themeFile = path.join(this.configThemesDir, `${themeName}.yml`);

    try {
      if (fs.pathExistsSync(themeFile)) {
        const raw = fs.readFileSync(themeFile, 'utf8');
        return yaml.load(raw);
      }
    } catch (e) {
      console.warn(`加载主题配置失败: ${themeFile}`, e.message);
    }
    return null;
  }

  generateThemeCSS() {
    if (!this.theme) return '';

    const t = this.theme;
    const collect = (obj) => {
      if (!obj) return [];
      return Object.entries(obj).map(([k, v]) => `${k}: ${v};`);
    };

    const css = [
      ...collect(t.fonts),
      ...collect(t.light),
      ...collect(t.accent),
      ...collect(t.layout),
      ...collect(t.space),
      ...collect(t.radius),
      ...collect(t.easing)
    ];

    let output = `:root {\n  ${css.join('\n  ')}\n}`;

    const darkCss = collect(t.dark);
    if (darkCss.length) {
      output += `\n\n[data-theme="dark"] {\n  ${darkCss.join('\n  ')}\n}`;
    }

    return output;
  }

  async render(templateName, data = {}) {
    try {
      const templateData = this.prepareTemplateData(data);
      const templateContent = await this.getTemplate(templateName);

      const rendered = ejs.render(templateContent, templateData, {
        filename: path.join(this.layoutsDir, `${templateName}.ejs`),
        root: this.templatesDir,
        views: [this.layoutsDir, this.partialsDir]
      });

      return rendered;
    } catch (error) {
      throw new Error(`渲染模板失败 ${templateName}: ${error.message}`);
    }
  }

  async renderWithLayout(templateName, data = {}) {
    try {
      const bodyContent = await this.render(templateName, data);
      const layoutData = {
        ...this.prepareTemplateData(data),
        body: bodyContent
      };
      const layoutContent = await this.getTemplate('default');
      const rendered = ejs.render(layoutContent, layoutData, {
        filename: path.join(this.layoutsDir, 'default.ejs'),
        root: this.templatesDir,
        views: [this.layoutsDir, this.partialsDir]
      });
      return rendered;
    } catch (error) {
      throw new Error(`渲染模板(含布局)失败 ${templateName}: ${error.message}`);
    }
  }

  async getTemplate(templateName, pluginDir = null) {
    // 检查缓存
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }
    
    // 查找顺序：插件模板 → 主题模板 → 默认模板
    let templatePath = null;
    
    // 1. 如果有插件目录，先查找插件自带模板
    if (pluginDir) {
      const pluginTemplatePath = path.join(pluginDir, 'templates', `${templateName}.ejs`);
      if (await fs.pathExists(pluginTemplatePath)) {
        templatePath = pluginTemplatePath;
      }
    }
    
    // 2. 尝试从主题目录加载
    if (!templatePath) {
      const themeTemplatePath = path.join(this.themesDir, this.config.theme, 'layouts', `${templateName}.ejs`);
      if (await fs.pathExists(themeTemplatePath)) {
        templatePath = themeTemplatePath;
      }
    }
    
    // 3. 使用默认模板
    if (!templatePath) {
      templatePath = path.join(this.layoutsDir, `${templateName}.ejs`);
    }
    
    // 检查模板是否存在
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`模板不存在: ${templateName}`);
    }
    
    // 读取模板内容
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    // 缓存模板
    this.templateCache.set(templateName, templateContent);
    
    return templateContent;
  }

  prepareTemplateData(data) {
    // 合并手动配置的导航 + 插件注入的导航（插件追加到末尾）
    const baseNavigation = this.config.navigation || [];
    const mergedNavigation = [...baseNavigation, ...this.pluginNav];

    const templateData = {
      site: {
        title: this.config.site.title,
        description: this.config.site.description,
        author: this.config.site.author,
        baseURL: this.config.site.baseURL,
        language: this.config.site.language,
        logo: this.config.site.logo || '',
        favicon: this.config.site.favicon || '/favicon.ico',
        navigation: mergedNavigation,
        social: this.config.social || {},
        links: this.config.links || [],
        rss: this.config.rss || { enabled: false, limit: 20 },
        markdown: this.config.markdown || {}
      },
      page: {
        title: data.title || '',
        description: data.description || '',
        url: data.url || '',
        type: data.type || 'website',
        image: data.image || '',
        bodyClass: data.bodyClass || '',
        ...data.page
      },
      navigation: mergedNavigation,
      social: this.config.social || {},
      links: this.config.links || [],
      themeCSS: this.generateThemeCSS(),
      year: new Date().getFullYear(),
      ...data
    };

    return templateData;
  }

  async renderPost(post) {
    const data = {
      title: post.metadata.title,
      description: post.metadata.description,
      url: post.metadata.url,
      type: 'article',
      image: post.metadata.image,
      bodyClass: 'post-page',
      post: {
        ...post.metadata,
        content: post.htmlContent,
        toc: post.toc,
        excerpt: post.metadata.description || this.generateExcerpt(post.content)
      },
      content: post.htmlContent
    };
    
    return this.renderWithLayout('post', data);
  }

  async renderPage(page) {
    const data = {
      title: page.metadata.title,
      description: page.metadata.description,
      url: page.metadata.url,
      type: 'website',
      image: page.metadata.image,
      bodyClass: 'page',
      page: {
        ...page.metadata,
        content: page.htmlContent
      },
      content: page.htmlContent
    };
    
    return this.renderWithLayout('page', data);
  }

  async renderIndex(posts, currentPage = 1, totalPages = 1) {
    const data = {
      title: currentPage === 1 ? '' : `第 ${currentPage} 页`,
      description: this.config.site.description,
      url: currentPage === 1 ? '/' : `/page/${currentPage}/`,
      type: 'website',
      bodyClass: 'index-page',
      posts: posts.map(post => ({
        ...post.metadata,
        excerpt: post.metadata.description || this.generateExcerpt(post.content),
        url: post.metadata.url
      })),
      pagination: {
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        nextUrl: currentPage < totalPages ? `/page/${currentPage + 1}/` : null,
        prevUrl: currentPage > 1 ? (currentPage === 2 ? '/' : `/page/${currentPage - 1}/`) : null
      }
    };
    
    return this.renderWithLayout('index', data);
  }

  async renderArchive(posts) {
    // 按年月分组
    const archive = {};
    
    posts.forEach(post => {
      const date = new Date(post.metadata.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      if (!archive[year]) {
        archive[year] = {};
      }
      
      if (!archive[year][month]) {
        archive[year][month] = [];
      }
      
      archive[year][month].push({
        ...post.metadata,
        url: post.metadata.url
      });
    });
    
    const data = {
      title: '归档',
      description: `文章归档 - ${this.config.site.title}`,
      url: '/archive/',
      type: 'website',
      bodyClass: 'archive-page',
      archive
    };
    
    return this.renderWithLayout('archive', data);
  }

  async renderTags(tags) {
    const data = {
      title: '标签',
      description: `文章标签 - ${this.config.site.title}`,
      url: '/tags/',
      type: 'website',
      bodyClass: 'tags-page',
      tags
    };
    
    return this.renderWithLayout('tags', data);
  }

  async renderTagPage(tag, posts) {
    const data = {
      title: `标签: ${tag}`,
      description: `标签 ${tag} 下的文章 - ${this.config.site.title}`,
      url: `/tags/${tag}/`,
      type: 'website',
      bodyClass: 'tag-page',
      tag,
      posts: posts.map(post => ({
        ...post.metadata,
        excerpt: post.metadata.description || this.generateExcerpt(post.content),
        url: post.metadata.url
      }))
    };
    
    return this.renderWithLayout('tag', data);
  }

  async renderCategories(categories) {
    const data = {
      title: '分类',
      description: `文章分类 - ${this.config.site.title}`,
      url: '/categories/',
      type: 'website',
      bodyClass: 'categories-page',
      categories
    };
    
    return this.renderWithLayout('categories', data);
  }

  async renderCategoryPage(category, posts) {
    const data = {
      title: `分类: ${category}`,
      description: `分类 ${category} 下的文章 - ${this.config.site.title}`,
      url: `/categories/${category}/`,
      type: 'website',
      bodyClass: 'category-page',
      category,
      posts: posts.map(post => ({
        ...post.metadata,
        excerpt: post.metadata.description || this.generateExcerpt(post.content),
        url: post.metadata.url
      }))
    };
    
    return this.renderWithLayout('category', data);
  }

  async render404() {
    const data = {
      title: '页面未找到',
      description: '您访问的页面不存在',
      url: '/404.html',
      type: 'website',
      bodyClass: 'error-page'
    };
    return this.renderWithLayout('404', data);
  }

  async renderPluginPage(pageDesc) {
    // 插件页面有两种模式：
    // 1. content 模式：提供原始 HTML，用 page.ejs 包裹再套 default.ejs
    // 2. template 模式：指定 EJS 模板名，用 renderWithLayout 渲染

    if (pageDesc.template) {
      // template 模式：使用指定模板名渲染
      const data = {
        title: pageDesc.title || '',
        description: pageDesc.description || '',
        url: pageDesc.url,
        type: pageDesc.type || 'website',
        image: pageDesc.image || '',
        bodyClass: pageDesc.bodyClass || 'plugin-page',
        ...pageDesc.templateData
      };
      // 查找模板：优先从插件目录查找，再从全局模板查找
      const pluginDir = pageDesc.pluginDir || null;
      const templateContent = await this.getTemplate(pageDesc.template, pluginDir);

      // 渲染内容模板
      const templateData = this.prepareTemplateData(data);
      const bodyContent = ejs.render(templateContent, templateData, {
        filename: pluginDir
          ? path.join(pluginDir, 'templates', `${pageDesc.template}.ejs`)
          : path.join(this.layoutsDir, `${pageDesc.template}.ejs`),
        root: this.templatesDir,
        views: [this.layoutsDir, this.partialsDir, pluginDir ? path.join(pluginDir, 'templates') : '']
      });

      // 套 default.ejs 布局
      const layoutData = {
        ...this.prepareTemplateData(data),
        body: bodyContent
      };
      const layoutContent = await this.getTemplate('default');
      return ejs.render(layoutContent, layoutData, {
        filename: path.join(this.layoutsDir, 'default.ejs'),
        root: this.templatesDir,
        views: [this.layoutsDir, this.partialsDir]
      });
    } else {
      // content 模式：提供原始 HTML，用 page.ejs 包裹再套 default.ejs
      const data = {
        title: pageDesc.title || '',
        description: pageDesc.description || '',
        url: pageDesc.url,
        type: pageDesc.type || 'website',
        image: pageDesc.image || '',
        bodyClass: pageDesc.bodyClass || 'plugin-page',
        page: {
          ...pageDesc,
          content: pageDesc.content
        },
        content: pageDesc.content
      };
      return this.renderWithLayout('page', data);
    }
  }

  generateExcerpt(content, maxLength = 200) {
    // 生成摘要
    const plainText = content
      .replace(/<[^>]+>/g, '') // 移除HTML标签
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

  async generateRSS(posts) {
    const siteURL = this.config.site.baseURL;
    const feedURL = `${siteURL}/feed.xml`;
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${this.escapeXML(this.config.site.title)}</title>
    <description>${this.escapeXML(this.config.site.description)}</description>
    <link>${siteURL}</link>
    <atom:link href="${feedURL}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>${this.config.site.language}</language>`;
    
    // 添加文章
    const limit = this.config.rss.limit || 20;
    const postsToShow = posts.slice(0, limit);
    
    for (const post of postsToShow) {
      const postURL = `${siteURL}${post.metadata.url}`;
      const pubDate = new Date(post.metadata.date).toUTCString();
      const description = post.metadata.description || this.generateExcerpt(post.content);
      
      rss += `
    <item>
      <title>${this.escapeXML(post.metadata.title)}</title>
      <description>${this.escapeXML(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <link>${postURL}</link>
      <guid isPermaLink="true">${postURL}</guid>
    </item>`;
    }
    
    rss += `
  </channel>
</rss>`;
    
    return rss;
  }

  escapeXML(str) {
    if (!str) return '';
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

module.exports = TemplateEngine;