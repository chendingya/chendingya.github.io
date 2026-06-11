/* === GitHub Repos 页面客户端 JS === */
(function () {
  'use strict';

  var sortBtn = document.querySelector('[data-action="sort-repos"]');
  if (!sortBtn) return;

  var list = document.querySelector('.repos-list');
  var sorted = false;

  sortBtn.addEventListener('click', function () {
    var cards = Array.from(list.querySelectorAll('.repo-card'));
    cards.sort(function (a, b) {
      var starsA = parseInt(a.getAttribute('data-stars')) || 0;
      var starsB = parseInt(b.getAttribute('data-stars')) || 0;
      return sorted ? 0 : starsB - starsA;
    });

    cards.forEach(function (card) { return list.appendChild(card); });

    sortBtn.textContent = sorted ? '★ 排序' : '↻ 还原';
    sorted = !sorted;
  });
})();
