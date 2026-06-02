const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class ConfigManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.config = {};
    this.defaultConfigPath = path.join(projectRoot, 'config', 'default.yml');
    this.userConfigPath = path.join(projectRoot, 'config', 'user.yml');
  }

  async load() {
    try {
      // 加载默认配置
      const defaultConfig = await this.loadConfigFile(this.defaultConfigPath);
      
      // 加载用户配置（如果存在）
      let userConfig = {};
      if (await fs.pathExists(this.userConfigPath)) {
        userConfig = await this.loadConfigFile(this.userConfigPath);
      }
      
      // 合并配置（用户配置覆盖默认配置）
      this.config = this.mergeConfigs(defaultConfig, userConfig);
      
      // 设置默认值
      this.setDefaults();
      
      return this.config;
    } catch (error) {
      throw new Error(`加载配置失败: ${error.message}`);
    }
  }

  async loadConfigFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return yaml.load(content) || {};
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key]) && userConfig[key] !== null) {
        merged[key] = this.mergeConfigs(merged[key] || {}, userConfig[key]);
      } else {
        merged[key] = userConfig[key];
      }
    }
    
    return merged;
  }

  setDefaults() {
    // 站点默认值
    this.config.site = this.config.site || {};
    this.config.site.title = this.config.site.title || 'AI Blog';
    this.config.site.description = this.config.site.description || '一个由AI驱动的个人博客';
    this.config.site.author = this.config.site.author || 'Anonymous';
    this.config.site.baseURL = this.config.site.baseURL || 'http://localhost:3000';
    this.config.site.language = this.config.site.language || 'zh-CN';
    
    // 构建默认值
    this.config.build = this.config.build || {};
    this.config.build.output = this.config.build.output || 'dist';
    this.config.build.cleanOutput = this.config.build.cleanOutput !== false;
    
    // Markdown默认值
    this.config.markdown = this.config.markdown || {};
    this.config.markdown.gfm = this.config.markdown.gfm !== false;
    this.config.markdown.highlight = this.config.markdown.highlight !== false;
    this.config.markdown.highlightTheme = this.config.markdown.highlightTheme || 'github';
    
    // 图片处理默认值
    this.config.images = this.config.images || {};
    this.config.images.optimize = this.config.images.optimize !== false;
    this.config.images.responsive = this.config.images.responsive !== false;
    this.config.images.sizes = this.config.images.sizes || [320, 640, 1024];
    this.config.images.lazyLoad = this.config.images.lazyLoad !== false;
    this.config.images.quality = this.config.images.quality || 80;
    this.config.images.webp = this.config.images.webp !== false;
    
    // 文章默认值
    this.config.posts = this.config.posts || {};
    this.config.posts.dir = this.config.posts.dir || 'content/posts';
    this.config.posts.perPage = this.config.posts.perPage || 10;
    this.config.posts.toc = this.config.posts.toc !== false;
    this.config.posts.permalink = this.config.posts.permalink || '/posts/:slug/';
    
    // 页面默认值
    this.config.pages = this.config.pages || {};
    this.config.pages.dir = this.config.pages.dir || 'content/pages';
    
    // 静态资源默认值
    this.config.assets = this.config.assets || {};
    this.config.assets.dir = this.config.assets.dir || 'content/assets';
    this.config.assets.minify = this.config.assets.minify !== false;
    
    // 导航默认值
    this.config.navigation = this.config.navigation || [
      { title: '首页', url: '/' },
      { title: '文章', url: '/posts/' },
      { title: '关于', url: '/about/' }
    ];
    
    // 社交链接默认值
    this.config.social = this.config.social || {};
    
    // 友情链接默认值
    this.config.links = this.config.links || [];
    
    // 评论默认值
    this.config.comments = this.config.comments || {};
    this.config.comments.enabled = this.config.comments.enabled || false;
    
    // RSS默认值
    this.config.rss = this.config.rss || {};
    this.config.rss.enabled = this.config.rss.enabled !== false;
    this.config.rss.limit = this.config.rss.limit || 20;
    
    // 主题默认值
    this.config.theme = this.config.theme || 'default';
  }

  get(key, defaultValue) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  set(key, value) {
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  getAll() {
    return { ...this.config };
  }

  async saveUserConfig() {
    try {
      await fs.ensureDir(path.dirname(this.userConfigPath));
      const yamlContent = yaml.dump(this.config);
      await fs.writeFile(this.userConfigPath, yamlContent, 'utf8');
    } catch (error) {
      throw new Error(`保存用户配置失败: ${error.message}`);
    }
  }
}

module.exports = ConfigManager;