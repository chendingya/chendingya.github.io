module.exports = {
  name: 'project-showcase',

  // 插件级配置由 config/default.yml 的 plugins.config.project-showcase 注入
  // 通过 this.config 访问

  // 生命周期钩子：初始化后
  afterInit(config) {
    console.log(`[project-showcase] 插件已初始化，站点标题: ${config.site.title}`);
  },

  // 生命周期钩子：构建完成后
  afterBuild(outputDir) {
    console.log(`[project-showcase] 构建完成，输出目录: ${outputDir}`);
  },

  // 生命周期钩子：处理文章
  processPost(post) {
    // 示例：给每篇文章加个标记，可被模板使用
    post.metadata.pluginProcessed = true;
  },

  // 页面定义
  pages() {
    // this.config 即为插件级配置（来自 default.yml）
    const cfg = this.config || {};
    const title = cfg.title || '项目展示';

    return [{
      url: '/projects/',
      title,
      description: '我的项目作品集',
      bodyClass: 'projects-page',
      contentFile: 'projects.html',
      // templateData 可传递插件配置到 EJS 模板
      templateData: {
        pluginConfig: cfg
      }
    }];
  },

  // 静态资源注入：CSS/JS 文件自动复制到 dist/ 并注入页面
  assets: {
    // css: ['style.css'],    // 取消注释后自动加载 src/plugins/project-showcase/style.css
    // js: ['script.js'],     // 取消注释后自动加载 src/plugins/project-showcase/script.js
    // static: ['images/'],   // 取消注释后自动复制整个 images 目录
  },

  // 虚拟数据源：异步获取动态数据，注入到模板 dataSources
  async dataSource() {
    // 示例：返回 GitHub 项目列表（实际可对接 GitHub API）
    const repos = [
      { name: 'ai-blog', desc: '基于 Node.js + EJS 的静态博客生成器', stars: 0, url: 'https://github.com/chendingya/ai-blog' }
    ];
    return { repos };
  },

  // 导航注入
  navigation() {
    return [{ title: '项目', url: '/projects/' }];
  }
};
