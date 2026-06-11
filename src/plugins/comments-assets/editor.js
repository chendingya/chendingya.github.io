/* === 留言板客户端 === */
(function () {
  'use strict';

  var setupEl = document.getElementById('gbookSetup');
  if (!setupEl) return;

  var editorEl = document.getElementById('gbookEditor');
  var draftsEl = document.getElementById('gbookDrafts');
  var titleInput = document.getElementById('noteTitle');
  var editorTextarea = document.getElementById('noteEditor');
  var previewEl = document.getElementById('notePreview');
  var statusEl = document.getElementById('syncStatus');
  var tokenInput = document.getElementById('githubToken');
  var gistIdInput = document.getElementById('gistId');
  var isSecretCheck = document.getElementById('isSecret');
  var draftList = document.getElementById('draftList');

  var GIST_KEY = 'gb_gist_id';
  var TOKEN_KEY = 'gb_token';
  var DRAFT_KEY = 'gb_drafts';

  var token = localStorage.getItem(TOKEN_KEY) || '';
  var gistId = localStorage.getItem(GIST_KEY) || '';

  if (token && gistId) {
    showEditor();
  }

  if (tokenInput) tokenInput.value = token;
  if (gistIdInput) gistIdInput.value = gistId;

  document.getElementById('saveConfig').addEventListener('click', function () {
    token = tokenInput.value.trim();
    gistId = gistIdInput.value.trim();

    if (!token) { setStatus('请填写 Token', 'err'); return; }

    localStorage.setItem(TOKEN_KEY, token);
    if (gistId) localStorage.setItem(GIST_KEY, gistId);
    setStatus('OK', 'ok');
    showEditor();
    loadDrafts();
  });

  var previewTimer;
  editorTextarea.addEventListener('input', function () {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      previewEl.innerHTML = simpleMarkdown(editorTextarea.value);
    }, 300);
  });

  document.getElementById('saveDraft').addEventListener('click', function () {
    var title = titleInput.value.trim() || '匿名';
    var drafts = getDrafts();
    drafts.unshift({ title: title, content: editorTextarea.value, time: Date.now() });
    if (drafts.length > 20) drafts.length = 20;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    setStatus('已保存', 'ok');
    loadDrafts();
  });

  document.getElementById('publishNote').addEventListener('click', function () {
    var title = titleInput.value.trim() || '匿名';
    var content = editorTextarea.value.trim();
    if (!content) { setStatus('内容为空', 'err'); return; }

    setStatus('提交中...', '');
    var btn = this;
    btn.disabled = true;

    var filename = title.replace(/[\/\\:*?"<>|]/g, '') + '.md';
    var isSecret = isSecretCheck.checked;

    if (gistId) {
      var body = { files: {} };
      body.files[filename] = { content: content };
      fetch('https://api.github.com/gists/' + gistId, {
        method: 'PATCH',
        headers: {
          Authorization: 'token ' + token,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then(function (r) { if (r.ok) return r.json(); throw new Error('HTTP ' + r.status); })
        .then(function () {
          setStatus('已提交', 'ok');
          btn.disabled = false;
        })
        .catch(function (e) {
          setStatus('失败: ' + e.message, 'err');
          btn.disabled = false;
        });
    } else {
      fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: 'token ' + token,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'gbook',
          public: !isSecret,
          files: (function () { var f = {}; f[filename] = { content: content }; return f; })()
        })
      })
        .then(function (r) { if (r.ok) return r.json(); throw new Error('HTTP ' + r.status); })
        .then(function (gist) {
          gistId = gist.id;
          localStorage.setItem(GIST_KEY, gistId);
          setStatus('OK，Gist ID: ' + gistId + '，请记下此 ID 配置到 default.yml', 'ok');
          btn.disabled = false;
        })
        .catch(function (e) {
          setStatus('失败: ' + e.message, 'err');
          btn.disabled = false;
        });
    }
  });

  function showEditor() {
    setupEl.classList.add('hidden');
    editorEl.classList.remove('hidden');
    draftsEl.classList.remove('hidden');
    loadDrafts();
  }

  function setStatus(msg, cls) {
    statusEl.textContent = msg;
    statusEl.className = 'gbook-status';
    if (cls === 'ok') statusEl.classList.add('gbook-status--ok');
    if (cls === 'err') statusEl.classList.add('gbook-status--err');
  }

  function getDrafts() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]'); } catch (e) { return []; }
  }

  function loadDrafts() {
    var drafts = getDrafts();
    if (drafts.length === 0) { draftList.innerHTML = '<p class="gbook-hint">暂无草稿</p>'; return; }
    var html = '';
    drafts.forEach(function (d, i) {
      var time = new Date(d.time).toLocaleString('zh-CN');
      html += '<div class="draft-item"><span class="draft-item__title" data-idx="' + i + '">' + esc(d.title) + ' — ' + time + '</span><div class="draft-item__actions"><button data-idx="' + i + '" data-action="load-draft">加载</button><button data-idx="' + i + '" data-action="del-draft">删除</button></div></div>';
    });
    draftList.innerHTML = html;

    draftList.querySelectorAll('[data-action="load-draft"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = drafts[parseInt(this.getAttribute('data-idx'))];
        titleInput.value = d.title;
        editorTextarea.value = d.content;
        previewEl.innerHTML = simpleMarkdown(d.content);
      });
    });
    draftList.querySelectorAll('[data-action="del-draft"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        drafts.splice(parseInt(this.getAttribute('data-idx')), 1);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
        loadDrafts();
      });
    });
  }

  function esc(s) { return s.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function simpleMarkdown(md) {
    return md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^([^<\n].+)/gm, '<p>$1</p>')
      .replace(/<\/p>\n<p>/g, '</p><p>');
  }
})();
