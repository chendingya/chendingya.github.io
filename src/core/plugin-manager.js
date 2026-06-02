const fs = require('fs-extra');
const path = require('path');

class PluginManager {
  constructor(config) {
    this.config = config;
    this.pluginsDir = path.resolve('src/plugins');
    this.plugins = [];
    this.pluginPages = [];
    this.pluginNav = [];
  }

  async loadPlugins() {
    try {
      const pluginsConfig = this.config.plugins || {};
      const enabledList = pluginsConfig.enabled || [];
      const disabledList = pluginsConfig.disabled || [];

      // 确保 plugins 目录存在
      if (!await fs.pathExists(this.pluginsDir)) {
        console.log('插件目录不存在，跳过加载');
        return;
      }

      // 扫描所有 .js 文件
      const files = await this.getPluginFiles(this.pluginsDir);

      for (const file of files) {
        const pluginName = path.basename(file, '.js');

        // 检查启用/禁用配置
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

          // 验证插件接口
          if (!plugin.name) {
            console.warn(`插件 ${file} 缺少 name 字段，跳过`);
            continue;
          }
          if (!plugin.pages) {
            console.warn(`插件 ${plugin.name} 缺少 pages() 方法，跳过`);
            continue;
          }

          this.plugins.push({
            ...plugin,
            filePath: file,
            dir: path.dirname(file)
          });

          console.log(`已加载插件: ${plugin.name}`);
        } catch (error) {
          console.warn(`加载插件 ${file} 失败: ${error.message}`);
          // 单个插件失败不阻断整个构建
        }
      }

      // 收集插件页面和导航
      await this.collectPages();
      this.collectNavigation();

      console.log(`共加载 ${this.plugins.length} 个插件，${this.pluginPages.length} 个插件页面`);
    } catch (error) {
      console.error('加载插件失败:', error.message);
      // 插件加载失败不阻断构建
    }
  }

  async collectPages() {
    this.pluginPages = [];

    for (const plugin of this.plugins) {
      try {
        // pages() 可以是 sync 或 async
        const pages = await Promise.resolve(plugin.pages());

        if (!Array.isArray(pages)) {
          console.warn(`插件 ${plugin.name} 的 pages() 未返回数组，跳过`);
          continue;
        }

        for (const page of pages) {
          // 验证页面描述必须字段
          if (!page.url) {
            console.warn(`插件 ${plugin.name} 的页面缺少 url，跳过`);
            continue;
          }

          // 规范化 URL：确保以 / 开头和结尾
          let url = page.url;
          if (!url.startsWith('/')) url = '/' + url;
          if (!url.endsWith('/')) url = url + '/';

          this.pluginPages.push({
            ...page,
            url,
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

          // 规范化 URL
          let url = item.url;
          if (!url.startsWith('/')) url = '/' + url;
          if (!url.endsWith('/')) url = url + '/';

          this.pluginNav.push({
            title: item.title,
            url
          });
        }
      } catch (error) {
        console.warn(`插件 ${plugin.name} 的 navigation() 调用失败: ${error.message}`);
      }
    }
  }

  getPages() {
    return this.pluginPages;
  }

  getNavigation() {
    return this.pluginNav;
  }

  async getPluginFiles(dir) {
    const files = [];

    if (!await fs.pathExists(dir)) {
      return files;
    }

    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);

      // 只处理 .js 文件，不支持 .mjs
      if (item.endsWith('.js') && !item.startsWith('_')) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

module.exports = PluginManager;