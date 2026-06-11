const fs = require('fs-extra');
const path = require('path');

class PluginManager {
  constructor(config) {
    this.config = config;
    this.pluginsDir = path.resolve('src/plugins');
    this.plugins = [];
    this.pluginPages = [];
    this.pluginNav = [];
    this.pluginAssets = { css: [], js: [], static: [] };
  }

  // ==================== 生命周期钩子 ====================

  async hook(name, ...args) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        try {
          await Promise.resolve(plugin[name](...args));
        } catch (e) {
          console.warn(`插件 ${plugin.name} 的钩子 ${name}() 执行失败: ${e.message}`);
        }
      }
    }
  }

  async afterInit(config) { await this.hook('afterInit', config); }
  async beforeParse() { await this.hook('beforeParse'); }
  async processPost(post) { await this.hook('processPost', post); }
  async processPage(page) { await this.hook('processPage', page); }
  async afterParse(posts, pages) { await this.hook('afterParse', posts, pages); }
  async beforeBuild() { await this.hook('beforeBuild'); }
  async afterBuild(outputDir) { await this.hook('afterBuild', outputDir); }
  async devStart() { await this.hook('devStart'); }

  // ==================== 插件加载 ====================

  async loadPlugins() {
    try {
      const pluginsConfig = this.config.plugins || {};
      const enabledList = pluginsConfig.enabled || [];
      const disabledList = pluginsConfig.disabled || [];
      const pluginConfigs = pluginsConfig.config || {};

      if (!await fs.pathExists(this.pluginsDir)) {
        console.log('插件目录不存在，跳过加载');
        return;
      }

      const files = await this.getPluginFiles(this.pluginsDir);

      for (const file of files) {
        const pluginName = path.basename(file, '.js');

        if (enabledList.length > 0 && !enabledList.includes(pluginName)) {
          console.log(`插件 ${pluginName} 未在启用列表中，跳过`);
          continue;
        }
        if (disabledList.includes(pluginName)) {
          console.log(`插件 ${pluginName} 在禁用列表中，跳过`);
          continue;
        }

        try {
          const plugin = require(file);

          if (!plugin.name) {
            console.warn(`插件 ${file} 缺少 name 字段，跳过`);
            continue;
          }
          if (!plugin.pages) {
            console.warn(`插件 ${plugin.name} 缺少 pages() 方法，跳过`);
            continue;
          }

          const pluginDir = path.dirname(file);
          const pluginConfig = pluginConfigs[pluginName] || {};
          const resolvedAssets = this.resolveAssets(plugin, pluginDir);

          this.plugins.push({
            ...plugin,
            filePath: file,
            dir: pluginDir,
            config: pluginConfig,
            assets: resolvedAssets
          });

          this.collectAssets(resolvedAssets);

          console.log(`已加载插件: ${plugin.name}`);
        } catch (error) {
          console.warn(`加载插件 ${file} 失败: ${error.message}`);
        }
      }

      // 收集插件页面和导航
      await this.collectPages();
      this.collectNavigation();

      console.log(`共加载 ${this.plugins.length} 个插件，${this.pluginPages.length} 个插件页面`);
    } catch (error) {
      console.error('加载插件失败:', error.message);
    }
  }

  // ==================== 静态资源 ====================

  resolveAssets(plugin, pluginDir) {
    const assets = plugin.assets || {};
    const resolved = { css: [], js: [], static: [] };

    for (const type of ['css', 'js', 'static']) {
      const items = assets[type] || [];
      for (const item of (Array.isArray(items) ? items : [items])) {
        const srcPath = path.resolve(pluginDir, item);
        const relPath = `plugins/${plugin.name}/${item}`;
        resolved[type].push({ src: srcPath, dest: relPath });
      }
    }

    return resolved;
  }

  collectAssets(resolvedAssets) {
    for (const type of ['css', 'js', 'static']) {
      this.pluginAssets[type].push(...resolvedAssets[type]);
    }
  }

  getAssets() {
    return this.pluginAssets;
  }

  getInjectedCSSLinks() {
    if (this.pluginAssets.css.length === 0) return '';
    return this.pluginAssets.css
      .map(a => `<link rel="stylesheet" href="/${a.dest.replace(/\\/g, '/')}">`)
      .join('\n    ');
  }

  getInjectedJSScripts() {
    if (this.pluginAssets.js.length === 0) return '';
    return this.pluginAssets.js
      .map(a => `<script src="/${a.dest.replace(/\\/g, '/')}" defer></script>`)
      .join('\n    ');
  }

  // ==================== 页面收集 ====================

  async collectPages() {
    this.pluginPages = [];

    for (const plugin of this.plugins) {
      try {
        const pages = await Promise.resolve(plugin.pages());

        if (!Array.isArray(pages)) {
          console.warn(`插件 ${plugin.name} 的 pages() 未返回数组，跳过`);
          continue;
        }

        for (const page of pages) {
          if (!page.url) {
            console.warn(`插件 ${plugin.name} 的页面缺少 url，跳过`);
            continue;
          }

          let url = page.url;
          if (!url.startsWith('/')) url = '/' + url;
          if (!url.endsWith('/')) url = url + '/';

          let resolvedContent = page.content || null;

          if (page.contentFile) {
            const filePath = path.resolve(plugin.dir, page.contentFile);
            try {
              if (await fs.pathExists(filePath)) {
                resolvedContent = await fs.readFile(filePath, 'utf8');
              } else {
                console.warn(`插件 ${plugin.name} 的 contentFile 不存在: ${filePath}`);
              }
            } catch (e) {
              console.warn(`插件 ${plugin.name} 读取 contentFile 失败: ${e.message}`);
            }
          }

          if (!resolvedContent && !page.template) {
            console.warn(`插件 ${plugin.name} 的页面 ${url} 缺少 content/contentFile/template，跳过`);
            continue;
          }

          this.pluginPages.push({
            ...page,
            url,
            content: resolvedContent,
            pluginName: plugin.name,
            pluginDir: plugin.dir
          });
        }
      } catch (error) {
        console.warn(`插件 ${plugin.name} 的 pages() 调用失败: ${error.message}`);
      }
    }
  }

  collectNavigation() {
    this.pluginNav = [];

    for (const plugin of this.plugins) {
      if (!plugin.navigation) continue;

      try {
        const navItems = plugin.navigation();

        if (!Array.isArray(navItems)) {
          console.warn(`插件 ${plugin.name} 的 navigation() 未返回数组，跳过`);
          continue;
        }

        for (const item of navItems) {
          if (!item.title || !item.url) {
            console.warn(`插件 ${plugin.name} 的导航条目缺少 title 或 url，跳过`);
            continue;
          }

          let url = item.url;
          if (!url.startsWith('/')) url = '/' + url;
          if (!url.endsWith('/')) url = url + '/';

          this.pluginNav.push({ title: item.title, url });
        }
      } catch (error) {
        console.warn(`插件 ${plugin.name} 的 navigation() 调用失败: ${error.message}`);
      }
    }
  }

  // ==================== 虚拟内容源 ====================

  async collectDataSource() {
    const dataMap = {};
    for (const plugin of this.plugins) {
      if (typeof plugin.dataSource === 'function') {
        try {
          const data = await Promise.resolve(plugin.dataSource());
          dataMap[plugin.name] = data;
          console.log(`插件 ${plugin.name} 的数据源加载成功`);
        } catch (e) {
          console.warn(`插件 ${plugin.name} 的 dataSource() 失败: ${e.message}`);
        }
      }
    }
    return dataMap;
  }

  // ==================== 查询接口 ====================

  getPages() { return this.pluginPages; }
  getNavigation() { return this.pluginNav; }
  getPlugin(name) { return this.plugins.find(p => p.name === name) || null; }
  getPluginConfig(name) { const p = this.getPlugin(name); return p ? p.config : {}; }

  async getPluginFiles(dir) {
    const files = [];
    if (!await fs.pathExists(dir)) return files;

    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (item.endsWith('.js') && !item.startsWith('_')) {
        files.push(fullPath);
      }
    }
    return files;
  }
}

module.exports = PluginManager;
