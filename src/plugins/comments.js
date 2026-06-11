module.exports = {
  name: 'comments',

  pages() {
    return [
      {
        url: '/comments/',
        title: '留言',
        description: '留言',
        bodyClass: 'comments-page',
        template: 'gbook-list',
        templateData: { editorMode: false }
      }
    ];
  },

  navigation() {
    return [
      { title: '留言', url: '/comments/' }
    ];
  },

  assets: {
    css: ['comments-assets/style.css'],
    js: ['comments-assets/editor.js']
  },

  async dataSource() {
    const cfg = this.config || {};
    const gistId = cfg.gistId || '';
    if (!gistId) return { notes: [], error: '未配置 gistId' };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'ai-blog' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const gist = await res.json();
      const files = gist.files || {};

      const notes = Object.entries(files)
        .filter(([, f]) => f.language === 'Markdown' || f.filename.endsWith('.md'))
        .map(([name, f]) => ({
          name,
          content: f.content || '',
          raw_url: f.raw_url,
          size: f.size
        }))
        .sort((a, b) => b.name.localeCompare(a.name));

      return { notes, gistId, updated: gist.updated_at };
    } catch (e) {
      return { notes: [], error: e.message, gistId };
    }
  }
};
