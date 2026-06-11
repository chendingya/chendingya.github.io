// AI Blog 脚本 — 与 HTML/CSS 通过 data-* 约定解耦
// HTML 负责结构 / CSS 负责样式 / JS 只控制行为
(function () {
  'use strict';

  // ═══════════ 暗色模式 ═══════════
  var STORAGE_KEY = 'theme';
  var html = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  (function initTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    applyTheme(saved || getSystemTheme());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  })();

  // ═══════════ 主题切换 (data-action 约定) ═══════════
  var themeBtn = document.querySelector('[data-action="toggle-theme"]');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ═══════════ 移动端菜单 (data-action / data-target 约定) ═══════════
  var menuBtn = document.querySelector('[data-action="toggle-menu"]');
  var mainNav = document.querySelector('[data-target="main-nav"]');

  if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () { mainNav.classList.remove('open'); });
    });

    document.addEventListener('click', function (e) {
      if (!mainNav.contains(e.target) && !menuBtn.contains(e.target)) {
        mainNav.classList.remove('open');
      }
    });
  }

  // ═══════════ 阅读进度条 (HTML 中已存在 .reading-progress) ═══════════
  var progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var pct = Math.min((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100);
          progressBar.style.width = pct + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ═══════════ 返回顶部 (HTML 中已存在 .back-to-top) ═══════════
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    var tickingTop = false;
    window.addEventListener('scroll', function () {
      if (!tickingTop) {
        requestAnimationFrame(function () {
          backToTop.classList.toggle('show', window.pageYOffset > 400);
          tickingTop = false;
        });
        tickingTop = true;
      }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ═══════════ 代码复制 (.copy-code-btn 约定) ═══════════
  document.querySelectorAll('pre').forEach(function (pre) {
    if (pre.querySelector('.copy-code-btn')) return;

    pre.style.position = 'relative';
    var btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');

    btn.addEventListener('click', function () {
      var text = (pre.querySelector('code') || pre).textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = '已复制'; btn.classList.add('copied');
          setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
        }).catch(function () { btn.textContent = '失败'; setTimeout(function () { btn.textContent = '复制'; }, 1500); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); btn.textContent = '已复制'; btn.classList.add('copied'); }
        catch (e) { btn.textContent = '失败'; }
        document.body.removeChild(ta);
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
      }
    });

    pre.appendChild(btn);
  });

  // ═══════════ 目录点击 ═══════════
  document.querySelectorAll('.toc-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ═══════════ 图片懒加载 ═══════════
  if ('IntersectionObserver' in window) {
    var imgObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
          imgObs.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) { imgObs.observe(img); });
  }

  // ═══════════ 头部滚动阴影 ═══════════
  var header = document.querySelector('.site-header');
  if (header) {
    var tickingH = false;
    window.addEventListener('scroll', function () {
      if (!tickingH) {
        requestAnimationFrame(function () {
          header.classList.toggle('scrolled', window.scrollY > 10);
          tickingH = false;
        });
        tickingH = true;
      }
    }, { passive: true });
  }

  // ═══════════ 外部链接安全处理 ═══════════
  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

})();
