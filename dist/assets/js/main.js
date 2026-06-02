// AI Blog 脚本 — 暗色模式 / 导航 / 阅读进度 / 代码复制 / 返回顶部
(function () {
  'use strict';

  // ================ 暗色模式 ================
  const STORAGE_KEY = 'theme';
  const DARK_CLASS = 'dark';
  const html = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    applyTheme(saved || getSystemTheme());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(current);
  }

  initTheme();

  // ================ 主题切换按钮 ================
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // ================ 移动端菜单 ================
  var menuBtn = document.getElementById('menuToggle');
  var nav = document.getElementById('siteNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });

    // 点击外部关闭
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  // ================ 阅读进度条 ================
  var progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        var scrollTop = window.pageYOffset;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          progressBar.style.width = Math.min((scrollTop / docHeight) * 100, 100) + '%';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ================ 返回顶部按钮 ================
  var backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', '返回顶部');
  backToTop.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  document.body.appendChild(backToTop);

  var tickingTop = false;
  window.addEventListener('scroll', function () {
    if (!tickingTop) {
      requestAnimationFrame(function () {
        if (window.pageYOffset > 400) {
          backToTop.classList.add('show');
        } else {
          backToTop.classList.remove('show');
        }
        tickingTop = false;
      });
      tickingTop = true;
    }
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ================ 代码复制按钮 ================
  function addCopyButtons() {
    document.querySelectorAll('pre').forEach(function (pre) {
      if (pre.querySelector('.copy-code-btn')) return;

      pre.style.position = 'relative';
      var btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.textContent = '复制';
      btn.setAttribute('aria-label', '复制代码');

      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;

        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '已复制';
            btn.classList.add('copied');
            setTimeout(function () {
              btn.textContent = '复制';
              btn.classList.remove('copied');
            }, 2000);
          }).catch(function () {
            btn.textContent = '失败';
            setTimeout(function () { btn.textContent = '复制'; }, 1500);
          });
        } else {
          // 降级方案
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            btn.textContent = '已复制';
            btn.classList.add('copied');
          } catch (e) {
            btn.textContent = '失败';
          }
          document.body.removeChild(ta);
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 2000);
        }
      });

      pre.appendChild(btn);
    });
  }

  addCopyButtons();

  // ================ 目录点击 ================
  document.querySelectorAll('.toc-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var id = this.getAttribute('href');
      if (!id) return;
      var target = document.querySelector(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ================ 图片懒加载 ================
  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      imgObserver.observe(img);
    });
  }

  // ================ 头部滚动阴影 ================
  var header = document.querySelector('.site-header');
  if (header) {
    var tickingHeader = false;
    window.addEventListener('scroll', function () {
      if (!tickingHeader) {
        requestAnimationFrame(function () {
          header.classList.toggle('scrolled', window.scrollY > 10);
          tickingHeader = false;
        });
        tickingHeader = true;
      }
    }, { passive: true });
  }

  // ================ 外部链接安全处理 ================
  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

})();
