module.exports = {
  name: 'github-repos',

  afterInit(config) {
    const username = config.social.github.split('/').pop() || 'unknown';
    console.log(`[github-repos] GitHub 用户: ${username}`);
  },

  pages() {
    return [{
      url: '/repos/',
      title: 'GitHub 仓库',
      description: '我的 GitHub 开源项目',
      bodyClass: 'repos-page',
      template: 'github-repos',
      templateData: { pluginName: 'github-repos' }
    }];
  },

  navigation() {
    return [{ title: '仓库', url: '/repos/' }];
  },

  assets: {
    css: ['github-repos-assets/style.css'],
    js: ['github-repos-assets/script.js']
  },

  async dataSource() {
    const username = 'chendingya';
    const apiURL = `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`;

    let repos = [];
    let error = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(apiURL, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'ai-blog' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        repos = await res.json();
      } else {
        error = `GitHub API 返回 ${res.status}`;
      }
    } catch (e) {
      error = e.message;
    }

    // API 挂了用静态示例
    if (error || repos.length === 0) {
      repos = [
        { name: 'ai-blog', description: '基于 Node.js + EJS 的静态博客生成器', language: 'JavaScript',
          stargazers_count: 0, forks_count: 0, html_url: 'https://github.com/chendingya/ai-blog',
          topics: ['blog', 'nodejs', 'ejs', 'static-site'] },
        { name: 'example-project', description: '示例项目 — GitHub API 暂时不可用', language: 'TypeScript',
          stargazers_count: 0, forks_count: 0, html_url: 'https://github.com/chendingya',
          topics: ['demo'] }
      ];
    }

    return { repos, error };
  }
};
