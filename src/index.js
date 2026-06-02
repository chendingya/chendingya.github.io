const fs = require('fs-extra');
const path = require('path');
const ConfigManager = require('./core/config-manager');
const ContentParser = require('./core/content-parser');
const ImageProcessor = require('./core/image-processor');
const TemplateEngine = require('./core/template-engine');
const FileGenerator = require('./core/file-generator');

class AIBlog {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.config = null;
    this.configManager = null;
    this.contentParser = null;
    this.imageProcessor = null;
    this.templateEngine = null;
    this.fileGenerator = null;
  }

  async init() {
    try {
      console.log('初始化 AI Blog...');
      
      // 加载配置
      this.configManager = new ConfigManager(this.projectRoot);
      this.config = await this.configManager.load();
      
      // 初始化核心模块
      this.contentParser = new ContentParser(this.config);
      this.imageProcessor = new ImageProcessor(this.config);
      this.templateEngine = new TemplateEngine(this.config);
      this.fileGenerator = new FileGenerator(this.config);
      
      console.log('AI Blog 初始化完成');
      return this.config;
    } catch (error) {
      console.error('初始化失败:', error.message);
      throw error;
    }
  }

  async build() {
    try {
      console.log('开始构建博客...');
      
      // 初始化
      await this.init();
      
      // 解析文章
      const posts = await this.parsePosts();
      console.log(`解析了 ${posts.length} 篇文章`);
      
      // 解析页面
      const pages = await this.parsePages();
      console.log(`解析了 ${pages.length} 个页面`);
      
      // 处理图片
      await this.processImages(posts, pages);
      
      // 生成静态文件
      const result = await this.fileGenerator.generate(posts, pages);
      
      // 生成额外的SEO文件
      await this.generateSEOFiles(posts, pages);
      
      console.log('博客构建完成!');
      return result;
    } catch (error) {
      console.error('构建失败:', error.message);
      throw error;
    }
  }

  async parsePosts() {
    try {
      const postsDir = path.resolve(this.config.posts.dir);
      
      if (!await fs.pathExists(postsDir)) {
        console.log('文章目录不存在，跳过解析');
        return [];
      }
      
      return await this.contentParser.parseDirectory(postsDir);
    } catch (error) {
      console.error('解析文章失败:', error.message);
      throw error;
    }
  }

  async parsePages() {
    try {
      const pagesDir = path.resolve(this.config.pages.dir);
      
      if (!await fs.pathExists(pagesDir)) {
        console.log('页面目录不存在，跳过解析');
        return [];
      }
      
      return await this.contentParser.parseDirectory(pagesDir);
    } catch (error) {
      console.error('解析页面失败:', error.message);
      throw error;
    }
  }

  async processImages(posts, pages) {
    try {
      console.log('处理图片...');
      
      // 处理文章中的图片
      for (const post of posts) {
        post.htmlContent = await this.imageProcessor.processContentImages(
          post.htmlContent,
          post.filePath
        );
      }
      
      // 处理页面中的图片
      for (const page of pages) {
        page.htmlContent = await this.imageProcessor.processContentImages(
          page.htmlContent,
          page.filePath
        );
      }
      
      console.log('图片处理完成');
      this.imageProcessor.summary();
    } catch (error) {
      console.error('处理图片失败:', error.message);
      throw error;
    }
  }

  async generateSEOFiles(posts, pages) {
    try {
      console.log('生成SEO文件...');
      
      // 生成sitemap
      await this.fileGenerator.generateSitemap(posts, pages);
      
      // 生成robots.txt
      await this.fileGenerator.generateRobotsTxt();
      
      console.log('SEO文件生成完成');
    } catch (error) {
      console.error('生成SEO文件失败:', error.message);
      throw error;
    }
  }

  async dev() {
    try {
      console.log('启动开发服务器...');
      
      // 初始化
      await this.init();
      
      // 构建
      await this.build();
      
      // 启动文件监视
      await this.watchFiles();
      
      // 启动本地服务器
      await this.startDevServer();
      
    } catch (error) {
      console.error('启动开发服务器失败:', error.message);
      throw error;
    }
  }

  async watchFiles() {
    try {
      const chokidar = require('chokidar');
      
      // 监视内容目录
      const contentDir = path.resolve('content');
      const templatesDir = path.resolve('templates');
      const configDir = path.resolve('config');
      
      const watcher = chokidar.watch([contentDir, templatesDir, configDir], {
        ignored: /(^|[\/\\])\../, // 忽略隐藏文件
        persistent: true
      });
      
      watcher.on('change', async (filePath) => {
        console.log(`文件变化: ${filePath}`);
        
        try {
          // 重新构建
          await this.build();
          console.log('重新构建完成');
        } catch (error) {
          console.error('重新构建失败:', error.message);
        }
      });
      
      console.log('文件监视已启动');
    } catch (error) {
      console.error('启动文件监视失败:', error.message);
      throw error;
    }
  }

  async startDevServer() {
    try {
      const browserSync = require('browser-sync');
      
      const bs = browserSync.create();
      
      bs.init({
        server: {
          baseDir: this.config.build.output,
          index: 'index.html'
        },
        port: 3000,
        open: false,
        notify: false,
        ui: false
      });
      
      console.log('开发服务器已启动: http://localhost:3000');
    } catch (error) {
      console.error('启动开发服务器失败:', error.message);
      throw error;
    }
  }

  async clean() {
    try {
      console.log('清理构建文件...');
      
      const outputDir = path.resolve(this.config.build.output);
      
      if (await fs.pathExists(outputDir)) {
        await fs.remove(outputDir);
        console.log(`已清理: ${outputDir}`);
      }
      
      console.log('清理完成');
    } catch (error) {
      console.error('清理失败:', error.message);
      throw error;
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'build';
  
  const blog = new AIBlog();
  
  try {
    switch (command) {
      case 'build':
        await blog.build();
        break;
      case 'dev':
        await blog.dev();
        break;
      case 'clean':
        await blog.init();
        await blog.clean();
        break;
      default:
        console.log(`
AI Blog - 静态博客生成器

用法:
  node src/index.js <命令>

命令:
  build   构建博客 (默认)
  dev     启动开发服务器
  clean   清理构建文件

示例:
  node src/index.js build
  node src/index.js dev
  node src/index.js clean
        `);
    }
  } catch (error) {
    console.error('执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = AIBlog;