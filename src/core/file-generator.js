const fs = require('fs-extra');
const path = require('path');

class FileGenerator {
  constructor(config) {
    this.config = config;
    this.outputDir = path.resolve(this.config.build.output);
  }

  async generate(posts, pages, pluginPages = []) {
    try {
      console.log('开始生成静态文件...');
      
      // 清理输出目录
      if (this.config.build.cleanOutput) {
        await this.cleanOutputDir();
      }
      
      // 确保输出目录存在
      await fs.ensureDir(this.outputDir);
      
      // 生成首页
      await this.generateIndex(posts);
      
      // 生成文章页
      await this.generatePosts(posts);
      
      // 生成独立页面
      await this.generatePages(pages);
      
      // 生成插件页面
      await this.generatePluginPages(pluginPages);
      
      // 生成归档页
      await this.generateArchive(posts);
      
      // 生成标签页
      await this.generateTags(posts);
      
      // 生成分类页
      await this.generateCategories(posts);
      
      // 生成404页面
      await this.generate404();
      
      // 生成RSS
      if (this.config.rss.enabled) {
        await this.generateRSS(posts);
      }
      
      // 复制静态资源
      await this.copyAssets();
      
      // 复制图片
      await this.copyImages();
      
      console.log(`静态文件生成完成: ${this.outputDir}`);
      
      return {
        success: true,
        outputDir: this.outputDir,
        posts: posts.length,
        pages: pages.length,
        pluginPages: pluginPages.length
      };
    } catch (error) {
      console.error('生成静态文件失败:', error.message);
      throw error;
    }
  }

  async cleanOutputDir() {
    try {
      if (await fs.pathExists(this.outputDir)) {
        await fs.remove(this.outputDir);
        console.log(`已清理输出目录: ${this.outputDir}`);
      }
    } catch (error) {
      console.error('清理输出目录失败:', error.message);
      throw error;
    }
  }

  async generateIndex(posts) {
    try {
      // 生成分页
      const perPage = this.config.posts.perPage || 10;
      const totalPages = Math.ceil(posts.length / perPage);
      
      for (let page = 1; page <= totalPages; page++) {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const pagePosts = posts.slice(startIndex, endIndex);
        
        // 渲染页面
        const templateEngine = require('./template-engine');
        const engine = new templateEngine(this.config);
        const html = await engine.renderIndex(pagePosts, page, totalPages);
        
        // 确定输出路径
        let outputPath;
        if (page === 1) {
          outputPath = path.join(this.outputDir, 'index.html');
        } else {
          outputPath = path.join(this.outputDir, 'page', String(page), 'index.html');
        }
        
        // 写入文件
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, html, 'utf8');
        
        console.log(`已生成首页: ${outputPath}`);
      }
    } catch (error) {
      console.error('生成首页失败:', error.message);
      throw error;
    }
  }

  async generatePosts(posts) {
    try {
      const templateEngine = require('./template-engine');
      const engine = new templateEngine(this.config);
      
      for (const post of posts) {
        // 渲染文章
        const html = await engine.renderPost(post);
        
        // 确定输出路径
        const outputPath = path.join(this.outputDir, post.metadata.url, 'index.html');
        
        // 写入文件
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, html, 'utf8');
        
        console.log(`已生成文章: ${outputPath}`);
      }
    } catch (error) {
      console.error('生成文章失败:', error.message);
      throw error;
    }
  }

  async generatePages(pages) {
    try {
      const templateEngine = require('./template-engine');
      const engine = new templateEngine(this.config);
      
      for (const page of pages) {
        // 渲染页面
        const html = await engine.renderPage(page);
        
        // 确定输出路径
        const outputPath = path.join(this.outputDir, page.metadata.url, 'index.html');
        
        // 写入文件
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, html, 'utf8');
        
        console.log(`已生成页面: ${outputPath}`);
      }
    } catch (error) {
      console.error('生成页面失败:', error.message);
      throw error;
    }
  }

  async generatePluginPages(pluginPages) {
    try {
      const TemplateEngine = require('./template-engine');
      const engine = new TemplateEngine(this.config, this.pluginNav || []);
      
      for (const page of pluginPages) {
        // 渲染插件页面
        const html = await engine.renderPluginPage(page);
        
        // 确定输出路径：去掉开头的 /，生成 dist/<url>/index.html
        const urlPath = page.url.replace(/^\//, '');
        const outputPath = path.join(this.outputDir, urlPath, 'index.html');
        
        // 写入文件
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, html, 'utf8');
        
        console.log(`已生成插件页面: ${outputPath}`);
      }
    } catch (error) {
      console.error('生成插件页面失败:', error.message);
      throw error;
    }
  }

  async generateArchive(posts) {
    try {
      const templateEngine = require('./template-engine');
      const engine = new templateEngine(this.config);
      
      // 渲染归档页
      const html = await engine.renderArchive(posts);
      
      // 确定输出路径
      const outputPath = path.join(this.outputDir, 'archive', 'index.html');
      
      // 写入文件
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, html, 'utf8');
      
      console.log(`已生成归档页: ${outputPath}`);
    } catch (error) {
      console.error('生成归档页失败:', error.message);
      throw error;
    }
  }

  async generateTags(posts) {
    try {
      const templateEngine = require('./template-engine');
      const engine = new templateEngine(this.config);
      
      // 收集所有标签
      const tagsMap = new Map();
      
      for (const post of posts) {
        const tags = post.metadata.tags || [];
        for (const tag of tags) {
          if (!tagsMap.has(tag)) {
            tagsMap.set(tag, []);
          }
          tagsMap.get(tag).push(post);
        }
      }
      
      // 生成标签列表页
      const tags = Array.from(tagsMap.keys()).map(tag => ({
        name: tag,
        count: tagsMap.get(tag).length,
        url: `/tags/${tag}/`
      }));
      
      const tagsHtml = await engine.renderTags(tags);
      const tagsOutputPath = path.join(this.outputDir, 'tags', 'index.html');
      await fs.ensureDir(path.dirname(tagsOutputPath));
      await fs.writeFile(tagsOutputPath, tagsHtml, 'utf8');
      console.log(`已生成标签列表页: ${tagsOutputPath}`);
      
      // 生成每个标签的页面
      for (const [tag, tagPosts] of tagsMap) {
        const tagHtml = await engine.renderTagPage(tag, tagPosts);
        const tagOutputPath = path.join(this.outputDir, 'tags', tag, 'index.html');
        await fs.ensureDir(path.dirname(tagOutputPath));
        await fs.writeFile(tagOutputPath, tagHtml, 'utf8');
        console.log(`已生成标签页: ${tagOutputPath}`);
      }
    } catch (error) {
      console.error('生成标签页失败:', error.message);
      throw error;
    }
  }

  async generateCategories(posts) {
    try {
      const templateEngine = require('./template-engine');
      const engine = new templateEngine(this.config);
      
      // 收集所有分类
      const categoriesMap = new Map();
      
      for (const post of posts) {
        const categories = post.metadata.categories || [];
        for (const category of categories) {
          if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
          }
          categoriesMap.get(category).push(post);
        }
      }
      
      // 生成分类列表页
      const categories = Array.from(categoriesMap.keys()).map(category => ({
        name: category,
        count: categoriesMap.get(category).length,
        url: `/categories/${category}/`
      }));
      
      const categoriesHtml = await engine.renderCategories(categories);
      const categoriesOutputPath = path.join(this.outputDir, 'categories', 'index.html');
      await fs.ensureDir(path.dirname(categoriesOutputPath));
      await fs.writeFile(categoriesOutputPath, categoriesHtml, 'utf8');
      console.log(`已生成分类列表页: ${categoriesOutputPath}`);
      
      // 生成每个分类的页面
      for (const [category, categoryPosts] of categoriesMap) {
        const categoryHtml = await engine.renderCategoryPage(category, categoryPosts);
        const categoryOutputPath = path.join(this.outputDir, 'categories', category, 'index.html');
        await fs.ensureDir(path.dirname(categoryOutputPath));
        await fs.writeFile(categoryOutputPath, categoryHtml, 'utf8');
        console.log(`已生成分类页: ${categoryOutputPath}`);
      }
    } catch (error) {
      console.error('生成分类页失败:', error.message);
      throw error;
    }
  }

  async generate404() {
    try {
      const templateEngine = require('./template-engine');
      const engine = new templateEngine(this.config);
      
      // 渲染404页面
      const html = await engine.render404();
      
      // 确定输出路径
      const outputPath = path.join(this.outputDir, '404.html');
      
      // 写入文件
      await fs.writeFile(outputPath, html, 'utf8');
      
      console.log(`已生成404页面: ${outputPath}`);
    } catch (error) {
      console.error('生成404页面失败:', error.message);
      throw error;
    }
  }

  async generateRSS(posts) {
    try {
      const templateEngine = require('./template-engine');
      const engine = new templateEngine(this.config);
      
      // 生成RSS
      const rss = await engine.generateRSS(posts);
      
      // 确定输出路径
      const outputPath = path.join(this.outputDir, 'feed.xml');
      
      // 写入文件
      await fs.writeFile(outputPath, rss, 'utf8');
      
      console.log(`已生成RSS: ${outputPath}`);
    } catch (error) {
      console.error('生成RSS失败:', error.message);
      throw error;
    }
  }

  async copyAssets() {
    try {
      const assetsDir = path.resolve(this.config.assets.dir);
      
      if (!await fs.pathExists(assetsDir)) {
        console.log('静态资源目录不存在，跳过复制');
        return;
      }
      
      const outputAssetsDir = path.join(this.outputDir, 'assets');
      await fs.ensureDir(outputAssetsDir);
      
      // 复制所有静态资源
      await fs.copy(assetsDir, outputAssetsDir);
      
      console.log(`已复制静态资源: ${assetsDir} -> ${outputAssetsDir}`);
    } catch (error) {
      console.error('复制静态资源失败:', error.message);
      throw error;
    }
  }

  async copyImages() {
    try {
      const outputImagesDir = path.join(this.outputDir, 'images');
      await fs.ensureDir(outputImagesDir);

      // 1. 复制 assets/images/ → dist/images/
      const assetsImagesDir = path.resolve(this.config.assets.dir, 'images');
      if (await fs.pathExists(assetsImagesDir)) {
        await fs.copy(assetsImagesDir, outputImagesDir);
        console.log(`已复制资源图片: ${assetsImagesDir} -> ${outputImagesDir}`);
      }

      // 2. 复制 posts 目录下的图片到 dist（保持目录结构）
      const postsDir = path.resolve(this.config.posts.dir);
      const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];
      const copyPostsImages = async (dir) => {
        const items = await fs.readdir(dir, { withFileTypes: true });
        for (const item of items) {
          const srcPath = path.join(dir, item.name);
          if (item.isDirectory() && item.name !== 'images') {
            await copyPostsImages(srcPath);
          } else if (item.isFile() && imageExts.includes(path.extname(item.name).toLowerCase())) {
            const relPath = path.relative(postsDir, srcPath).replace(/\\/g, '/');
            const destPath = path.join(this.outputDir, relPath);
            await fs.ensureDir(path.dirname(destPath));
            await fs.copy(srcPath, destPath);
          }
        }
      };

      if (await fs.pathExists(postsDir)) {
        await copyPostsImages(postsDir);
      }

      console.log('已复制文章图片');
    } catch (error) {
      console.error('复制图片失败:', error.message);
      throw error;
    }
  }

  async generateSitemap(posts, pages, pluginPages = []) {
    try {
      const siteURL = this.config.site.baseURL;
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteURL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
      
      // 添加文章
      for (const post of posts) {
        const postURL = `${siteURL}${post.metadata.url}`;
        const lastmod = new Date(post.metadata.date).toISOString();
        
        sitemap += `
  <url>
    <loc>${postURL}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
      
      // 添加页面
      for (const page of pages) {
        const pageURL = `${siteURL}${page.metadata.url}`;
        
        sitemap += `
  <url>
    <loc>${pageURL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
      
      // 添加插件页面
      for (const page of pluginPages) {
        // 避免 baseURL 尾部 / 和 url 开头 / 拼接为双斜杠
        const pageURL = siteURL.replace(/\/$/, '') + page.url;
        
        sitemap += `
  <url>
    <loc>${pageURL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
      }
      
      sitemap += `
</urlset>`;
      
      // 写入文件
      const outputPath = path.join(this.outputDir, 'sitemap.xml');
      await fs.writeFile(outputPath, sitemap, 'utf8');
      
      console.log(`已生成sitemap: ${outputPath}`);
    } catch (error) {
      console.error('生成sitemap失败:', error.message);
      throw error;
    }
  }

  async generateRobotsTxt() {
    try {
      const siteURL = this.config.site.baseURL;
      
      const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${siteURL}/sitemap.xml`;
      
      // 写入文件
      const outputPath = path.join(this.outputDir, 'robots.txt');
      await fs.writeFile(outputPath, robotsTxt, 'utf8');
      
      console.log(`已生成robots.txt: ${outputPath}`);
    } catch (error) {
      console.error('生成robots.txt失败:', error.message);
      throw error;
    }
  }
}

module.exports = FileGenerator;