(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var bar = document.querySelector('.filter-bar');
    if (!bar) return;
    var mode = bar.getAttribute('data-filter-mode');
    var tabs = Array.prototype.slice.call(bar.querySelectorAll('.filter-tab'));

    function setActive(key) {
      tabs.forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-cat') === key);
      });
      document.querySelectorAll('.category-list a[data-cat], .category-list a[data-news]').forEach(function (a) {
        var k = a.getAttribute('data-cat') || a.getAttribute('data-news');
        a.parentNode.classList.toggle('active', k === key);
      });
    }

    if (mode === 'products') {
      var blocks = Array.prototype.slice.call(document.querySelectorAll('.cat-block'));
      var LIMIT = 2;
      function applyProducts(key, noScroll) {
        blocks.forEach(function (b) {
          var isAll = key === 'all';
          b.hidden = !(isAll || b.getAttribute('data-cat') === key);
          var cards = b.querySelectorAll('.product-card');
          for (var i = 0; i < cards.length; i++) {
            cards[i].style.display = (isAll && i >= LIMIT) ? 'none' : '';
          }
          var more = b.querySelector('.cat-more');
          if (more) more.style.display = isAll ? 'flex' : 'none';
        });
        setActive(key);
        if (key !== 'all' && !noScroll) {
          var el = document.getElementById('productList') || document.querySelector('.products-main');
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
      }
      tabs.forEach(function (t) {
        t.addEventListener('click', function () { applyProducts(t.getAttribute('data-cat')); });
      });
      document.querySelectorAll('[data-goto]').forEach(function (b) {
        b.addEventListener('click', function () { applyProducts(b.getAttribute('data-goto')); });
      });
      document.querySelectorAll('.category-list a[data-cat]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          applyProducts(a.getAttribute('data-cat'));
        });
      });
      var h = (location.hash || '').replace('#', '');
      applyProducts(h && document.getElementById(h) && h !== 'productList' ? h : 'all', true);
    }

    if (mode === 'news') {
      var cards = Array.prototype.slice.call(document.querySelectorAll('.news-card[data-cat]'));
      var moreBtn = document.getElementById('loadMoreBtn');
      var shown = 6, key = 'all';
      function applyNews(reset) {
        if (reset) shown = 6;
        var vis = cards.filter(function (c) { return key === 'all' || c.getAttribute('data-cat') === key; });
        cards.forEach(function (c) { c.hidden = true; });
        vis.forEach(function (c, i) { c.hidden = i >= shown; });
        var wrap = moreBtn ? moreBtn.parentNode : null;
        if (wrap) wrap.hidden = vis.length <= shown;
        if (moreBtn) moreBtn.innerHTML = '加载更多资讯（还有 ' + Math.max(vis.length - shown, 0) + ' 篇）<i class="fas fa-chevron-down"></i>';
        setActive(key);
      }
      tabs.forEach(function (t) {
        t.addEventListener('click', function () { key = t.getAttribute('data-cat'); applyNews(true); });
      });
      document.querySelectorAll('.category-list a[data-news]').forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); key = a.getAttribute('data-news'); applyNews(true); });
      });
      if (moreBtn) moreBtn.addEventListener('click', function () { shown += 6; applyNews(false); });
      applyNews(true);
    }
  });
})();
