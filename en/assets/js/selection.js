/* ============================================================
   型号查询 / Bearing Selection — 读取 window.HT_QUERY_DATA 渲染
   ============================================================ */
(function () {
  var DATA = window.HT_QUERY_DATA || [];
  var EN = window.HT_QUERY_LANG === 'en';
  var CONTACT = window.HT_QUERY_CONTACT || (EN ? 'contact-en.html' : 'contact.html');
  var T = EN ? {
    model: 'Bearing Model', phModel: 'e.g. 22205', search: 'Search',
    range: 'Dimension Range', bore: 'Bore d', od: 'Outer D', wid: 'Width B',
    min: 'Min', max: 'Max', inqH: 'Inquiry', viewTip: 'View product', nores: 'No matching models found. Please contact us for the full catalogue.',
    contact: CONTACT, inqTip: 'Inquiry',
    unit: 'mm', count: 'model(s)', countPrefix: 'Found',
    prev: 'Prev', next: 'Next', pageOf: 'Page', seriesUnit: 'series'
  } : {
    model: '轴承型号', phModel: '请输入型号，如 22205', search: '搜索',
    range: '范围尺寸', bore: '内径 d', od: '外径 D', wid: '宽度 B',
    min: '最小', max: '最大', inqH: '询价', viewTip: '查看产品', nores: '没有找到匹配的型号，请联系客服获取完整产品样本。',
    contact: CONTACT, inqTip: '询价',
    unit: 'mm', count: '个型号', countPrefix: '共找到',
    prev: '上一页', next: '下一页', pageOf: '第', seriesUnit: '个系列'
  };

  function col(fields, title) {
    var groups = fields.filter(function (g) { return (g.title || '').indexOf('尺寸') > -1 || /dimension/i.test(g.title || ''); });
    var pool = groups.length ? groups : fields;
    for (var i = 0; i < pool.length; i++) {
      for (var j = 0; j < pool[i].children.length; j++) {
        if (pool[i].children[j].title.trim() === title) return pool[i].children[j].dataIndex;
      }
    }
    return null;
  }

  function num(v) { var n = parseFloat(v); return isNaN(n) ? null : n; }

  /* ---- 结果分页：每个系列一个表格块，按页渲染，避免一次铺满整页 ---- */
  var BLOCKS = [], TOTAL = 0, RPAGE = 1, RPAGES = 1;
  var RPER_DESK = 3, RPER_SM = 1;          /* 每页显示的系列数：桌面 3、手机 1 */

  function rper() { return (window.innerWidth <= 768) ? RPER_SM : RPER_DESK; }

  function injectResultCss() {
    if (document.getElementById('ht-result-pager-css')) return;
    var css =
      '.q-pager{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:20px 0 6px;font-size:13px;color:var(--text-light)}\n' +
      '.q-pg{min-width:32px;height:32px;padding:0 10px;border:1px solid var(--border-color);background:#fff;' +
      'color:var(--text-dark);border-radius:6px;font-size:13px;cursor:pointer;transition:all .18s}\n' +
      '.q-pg:hover:not(:disabled){border-color:var(--primary-color);color:var(--primary-color)}\n' +
      '.q-pg.active{background:var(--primary-color);border-color:var(--primary-color);color:#fff;font-weight:600}\n' +
      '.q-pg:disabled{opacity:.45;cursor:not-allowed}\n' +
      '.q-dots{padding:0 2px;color:var(--text-light)}\n' +
      '.q-info{margin-left:6px;color:var(--text-light);font-size:13px}\n' +
      '.q-info b{color:var(--secondary-color)}\n' +
      '@media (max-width:768px){.q-pg{min-width:30px;height:30px;padding:0 8px}.q-info{width:100%;margin-left:0}}';
    var st = document.createElement('style');
    st.id = 'ht-result-pager-css';
    st.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(st);
  }

  /* 渲染当前页结果 */
  function paint() {
    var per = rper();
    RPAGES = Math.ceil(BLOCKS.length / per) || 1;
    if (RPAGE > RPAGES) RPAGE = RPAGES;
    if (RPAGE < 1) RPAGE = 1;
    var from = (RPAGE - 1) * per, to = Math.min(from + per, BLOCKS.length);

    var counter = '<p style="color:var(--text-light);font-size:14px;margin:0 0 14px">' +
      '<i class="fas fa-magnifying-glass" style="color:var(--primary-color)"></i> ' +
      (TOTAL > 0 ? T.countPrefix + ' <b style="color:var(--secondary-color)">' + TOTAL + '</b> ' + T.count : T.nores) + '</p>';

    var pager = '';
    if (RPAGES > 1) {
      var nums = '';
      function b(n) {
        return '<button type="button" class="q-pg' + (n === RPAGE ? ' active' : '') + '" data-p="' + n + '">' + n + '</button>';
      }
      if (RPAGES <= 7) {
        for (var i = 1; i <= RPAGES; i++) nums += b(i);
      } else {
        var s = Math.max(2, RPAGE - 2), e = Math.min(RPAGES - 1, RPAGE + 2);
        nums += b(1);
        if (s > 2) nums += '<span class="q-dots">…</span>';
        for (var j = s; j <= e; j++) nums += b(j);
        if (e < RPAGES - 1) nums += '<span class="q-dots">…</span>';
        nums += b(RPAGES);
      }
      pager = '<div class="q-pager">' +
        '<button type="button" class="q-pg" data-p="' + (RPAGE - 1) + '"' + (RPAGE <= 1 ? ' disabled' : '') + '>' + T.prev + '</button>' +
        nums +
        '<button type="button" class="q-pg" data-p="' + (RPAGE + 1) + '"' + (RPAGE >= RPAGES ? ' disabled' : '') + '>' + T.next + '</button>' +
        '<span class="q-info">' + T.pageOf + ' <b>' + RPAGE + '</b>/' + RPAGES + ' · ' + BLOCKS.length + ' ' + T.seriesUnit + '</span>' +
        '</div>';
    }
    document.getElementById('queryResult').innerHTML = counter + BLOCKS.slice(from, to).join('') + pager;
  }

  function render() {
    var kw = (document.getElementById('qModel').value || '').trim().toLowerCase();
    var g = function (id) { return num(document.getElementById(id).value); };
    var dmin = g('qDmin'), dmax = g('qDmax'), omin = g('qOmin'), omax = g('qOmax'), wmin = g('qWmin'), wmax = g('qWmax');
    var hasDim = [dmin, dmax, omin, omax, wmin, wmax].some(function (x) { return x !== null; });

    BLOCKS = []; TOTAL = 0;

    DATA.forEach(function (p) {
      var dK = col(p.fields, 'd'), oK = col(p.fields, 'D'), wK = col(p.fields, 'B');
      /* 推力轴承没有 B 列、高度列为 H：只有同时有 d、D 列时才把 H 视同宽度，避免带座外形尺寸里的 H（座高）被误当宽度 */
      if (wK === null && dK !== null && oK !== null) wK = col(p.fields, 'H');
      var rows = p.rows.filter(function (r) {
        if (kw) {
          var hit = false;
          for (var k in r) { if (typeof r[k] === 'string' && r[k].toLowerCase().indexOf(kw) > -1) { hit = true; break; } }
          if (!hit) return false;
        }
        if (hasDim) {
          /* 按实际有的维度过滤：只对用户填了、且该系列没有该列的维度排除整系列；用户只填内径时，有 d 列即可参与筛选 */
          var d, o, w;
          if (dmin !== null || dmax !== null) {
            if (dK === null) return false;
            d = num(r[dK]);
            if (d === null) return false;
            if (dmin !== null && d < dmin) return false;
            if (dmax !== null && d > dmax) return false;
          }
          if (omin !== null || omax !== null) {
            if (oK === null) return false;
            o = num(r[oK]);
            if (o === null) return false;
            if (omin !== null && o < omin) return false;
            if (omax !== null && o > omax) return false;
          }
          if (wmin !== null || wmax !== null) {
            if (wK === null) return false;
            w = num(r[wK]);
            if (w === null) return false;
            if (wmin !== null && w < wmin) return false;
            if (wmax !== null && w > wmax) return false;
          }
        }
        return true;
      });
      if (!rows.length) return;
      TOTAL += rows.length;

      /* 两级表头（首列询价） */
      var cols = [];
      p.fields.forEach(function (g2) {
        g2.children.forEach(function (c) {
          cols.push({ g: (g2.title || '').replace(/\n/g, '').trim(), t: c.title.trim(), k: c.dataIndex });
        });
      });
      /* 型号组列（点击跳转产品页） */
      var modelCols = {};
      p.fields.forEach(function (g2) {
        if (/型号|Model|轴承代号/i.test(g2.title || '')) g2.children.forEach(function (c) { modelCols[c.dataIndex] = true; });
      });
      var pUrl = p.url || '';
      var th1 = '<th rowspan="2" style="width:52px">' + T.inqH + '</th>';
      var th2 = '';
      var i = 0;
      while (i < cols.length) {
        var j = i;
        while (j + 1 < cols.length && cols[j + 1].g === cols[i].g) j++;
        var span = j - i + 1;
        if (span > 1) { th1 += '<th colspan="' + span + '">' + cols[i].g + '</th>'; for (var k2 = i; k2 <= j; k2++) th2 += '<th>' + cols[k2].t + '</th>'; }
        else { th1 += '<th rowspan="2">' + (cols[i].g || cols[i].t) + '</th>'; }
        i = j + 1;
      }
      var body = rows.map(function (r) {
        /* 询盘链接只带真正的型号：首列属于型号组且值非空、非占位符时才拼 ?model；否则直接链联系页，绝不拿尺寸数字当型号 */
        var firstVal = (cols.length && r[cols[0].k] !== undefined && r[cols[0].k] !== null) ? String(r[cols[0].k]).trim() : '';
        var inqHref = (cols.length && modelCols[cols[0].k] && firstVal !== '' && firstVal !== '-' && firstVal !== '—') ? T.contact + '?model=' + encodeURIComponent(firstVal) : T.contact;
        var tds = '<td><a href="' + inqHref + '" title="' + T.inqTip + '"><i class="fas fa-envelope" style="font-size:16px"></i></a></td>';
        cols.forEach(function (c) {
          var v = (r[c.k] !== undefined ? r[c.k] : '');
          if (modelCols[c.k] && pUrl && v) {
            v = '<a href="' + pUrl + '" title="' + T.viewTip + '" style="font-weight:600">' + v + '</a>';
          }
          tds += '<td>' + v + '</td>';
        });
        return '<tr>' + tds + '</tr>';
      }).join('');

      BLOCKS.push('<div class="query-block">' +
        '<div class="query-block-title"><i class="fas fa-table-cells"></i> ' + p.name +
        (EN ? '' : ' <span style="color:var(--text-light);font-weight:400;font-size:13px">（' + rows.length + ' 个匹配型号）</span>') + '</div>' +
        '<div class="spec-scroll" style="overflow-x:auto;border:1px solid var(--border-color);border-radius:8px">' +
        '<table class="specs-table" style="min-width:820px;margin:0;border:0"><thead><tr>' + th1 + '</tr>' +
        (th2 ? '<tr>' + th2 + '</tr>' : '') + '</thead><tbody>' + body + '</tbody></table></div></div>');
    });

    RPAGE = 1;
    paint();
  }

  function init() {
    injectResultCss();
    ['qModelSearch', 'qRangeSearch'].forEach(function (id) {
      var b = document.getElementById(id); if (b) b.addEventListener('click', render);
    });
    var m = document.getElementById('qModel');
    if (m) m.addEventListener('keydown', function (e) { if (e.key === 'Enter') render(); });
    var pre = new URLSearchParams(location.search).get('model');
    if (pre && m) { m.value = pre; }

    /* 结果分页点击（委托，重绘后依然有效） */
    var res = document.getElementById('queryResult');
    if (res) {
      res.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.q-pg') : null;
        if (!b) return;
        var v = parseInt(b.getAttribute('data-p'), 10);
        if (!v || v === RPAGE) return;
        RPAGE = v; paint();
        if (res.scrollIntoView) res.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    /* 屏宽变化时按新每页数量重排 */
    var rt = null;
    window.addEventListener('resize', function () {
      if (rt) clearTimeout(rt);
      rt = setTimeout(paint, 200);
    });

    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();


/* ============================================================
   分类 + 数字翻页型号选择器
   大类标签（调心滚子 / 调心球 / 角接触 / 四点接触）+ 型号平铺 + 页码
   不改动上面的查询逻辑，只提供快速定位入口
   ============================================================ */
(function () {
  var DATA = window.HT_QUERY_DATA || [];
  var EN = window.HT_QUERY_LANG === 'en';
  var PER_PAGE = 12;                        /* 每页固定展示数量（桌面，压低整块高度） */
  var PER_PAGE_SM = 8;                      /* 手机端每页数量，避免单页过长 */
  function narrow() { return window.innerWidth <= 768; }
  function perPage() { return narrow() ? PER_PAGE_SM : PER_PAGE; }

  var TXT = EN ? {
    title: 'Pick from catalogue', filterPh: 'Search model or series', total: 'Total',
    all: 'All', prev: 'Prev', next: 'Next',
    info: 'models', perPage: 'per page', pageOf: 'Page',
    none: 'No model matches. Try another keyword or another category.'
  } : {
    title: '从型号库选择', filterPh: '搜索型号或系列名称', total: '共',
    all: '全部', prev: '上一页', next: '下一页',
    info: '个型号', perPage: '每页', pageOf: '第',
    none: '没有匹配的型号，换个关键字或切换分类试试。'
  };

  /* 分类：按系列名关键字归类，未命中的进「其他」 */
  var CATS = [
    { key: 'srb', re: /spherical\s*roller|调心滚子/i, en: 'Spherical Roller', zh: '调心滚子轴承' },
    { key: 'sab', re: /self[-\s]?aligning|调心球/i,    en: 'Self-Aligning Ball', zh: '调心球轴承' },
    { key: 'acb', re: /angular\s*contact|角接触/i,     en: 'Angular Contact', zh: '角接触球轴承' },
    { key: 'fpc', re: /four\s*point|四点/i,            en: 'Four Point Contact', zh: '四点接触球轴承' },
    { key: 'dgb', re: /deep\s*groove|深沟/i,           en: 'Deep Groove Ball', zh: '深沟球轴承' },
    { key: 'cyr', re: /cylindrical|圆柱/i,            en: 'Cylindrical Roller', zh: '圆柱滚子轴承' },
    { key: 'tar', re: /tapered|圆锥/i,                en: 'Tapered Roller', zh: '圆锥滚子轴承' },
    { key: 'pbi', re: /pillow|insert|带座|内嵌/i,      en: 'Pillow Block & Insert', zh: '带座与内嵌轴承' },
    { key: 'ndr', re: /needle|滚针/i,             en: 'Needle Roller', zh: '滚针轴承' },
    { key: 'lnr', re: /linear|直线/i,              en: 'Linear Ball', zh: '直线球轴承' }
  ];
  var OTHER = { key: 'other', en: 'Other', zh: '其他' };

  function catName(c) { return EN ? c.en : c.zh; }

  /* ---- 1. 样式（幂等注入，沿用站点 CSS 变量） ---- */
  function injectCss() {
    if (document.getElementById('ht-sel-picker-css')) return;
    var css =
      '.ht-picker{margin:0 0 16px;padding:0 0 16px;border-bottom:1px dashed var(--border-color)}\n' +
      '.ht-picker-search{margin-bottom:12px}\n' +
      '.ht-picker-search .query-input{width:300px}\n' +
      '.ht-cat-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}\n' +
      '.ht-cat{padding:6px 15px;border:1px solid var(--border-color);background:#fff;border-radius:20px;' +
      'font-size:13px;color:var(--text-dark);cursor:pointer;transition:all .18s;line-height:1.5}\n' +
      '.ht-cat:hover{border-color:var(--primary-color);color:var(--primary-color)}\n' +
      '.ht-cat.active{background:var(--primary-color);border-color:var(--primary-color);color:#fff;font-weight:600}\n' +
      '.ht-cat em{font-style:normal;opacity:.7;margin-left:5px;font-size:12px}\n' +
      '.ht-chip-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px}\n' +
      '.ht-chip{padding:8px 10px;border:1px solid var(--border-color);background:#fff;border-radius:6px;' +
      'font-size:13px;color:var(--text-dark);cursor:pointer;text-align:center;transition:all .15s;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.5}\n' +
      '.ht-chip:hover{border-color:var(--primary-color);color:var(--primary-color);background:#f6f9fd}\n' +
      '.ht-chip.active{background:var(--primary-color);border-color:var(--primary-color);color:#fff;font-weight:600}\n' +
      '.ht-picker .ht-pager-wrap{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:13px;color:var(--text-light)}\n' +
      '.ht-pg-btn{min-width:32px;height:32px;padding:0 10px;border:1px solid var(--border-color);background:#fff;' +
      'color:var(--text-dark);border-radius:6px;font-size:13px;cursor:pointer;transition:all .18s}\n' +
      '.ht-pg-btn:hover:not(:disabled){border-color:var(--primary-color);color:var(--primary-color)}\n' +
      '.ht-pg-btn.active{background:var(--primary-color);border-color:var(--primary-color);color:#fff;font-weight:600}\n' +
      '.ht-pg-btn:disabled{opacity:.45;cursor:not-allowed}\n' +
      '.ht-pg-dots{padding:0 2px;color:var(--text-light)}\n' +
      '.ht-pg-info{margin-left:6px;color:var(--text-light);font-size:13px}\n' +
      '.ht-pg-info b{color:var(--secondary-color)}\n' +
      '.ht-picker-empty{padding:6px 2px 14px;font-size:13px;color:var(--text-light)}\n' +
      '@media (max-width:1100px){.ht-chip-grid{grid-template-columns:repeat(4,1fr)}}\n' +
      '@media (max-width:768px){\n' +
      '  .ht-picker-search .query-input{width:100%!important}\n' +
      '  .ht-chip-grid{grid-template-columns:repeat(2,1fr)}\n' +
      '  .ht-cat{padding:5px 12px;font-size:12px}\n' +
      '  .ht-picker .ht-pager-wrap{width:100%;row-gap:10px}\n' +
      '  .ht-pg-btn{min-width:30px;height:30px;padding:0 8px}\n' +
      '  .ht-pg-info{width:100%;margin-left:0}\n' +
      '}';
    var st = document.createElement('style');
    st.id = 'ht-sel-picker-css';
    st.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---- 2. 型号索引：编号 + 系列名 + 分类 ---- */
  function buildIndex() {
    var seen = {}, list = [];
    DATA.forEach(function (p) {
      var mKeys = [];
      (p.fields || []).forEach(function (g) {
        if (/型号|Model|轴承代号/i.test(g.title || '')) {
          (g.children || []).forEach(function (c) { mKeys.push(c.dataIndex); });
        }
      });
      /* 该系列规格表没有型号列（表头存在但无子列）时跳过，避免把内径 d 当成型号 */
      if (!mKeys.length) return;
      var name = p.name || '';
      var cat = OTHER.key;
      for (var i = 0; i < CATS.length; i++) { if (CATS[i].re.test(name)) { cat = CATS[i].key; break; } }
      (p.rows || []).forEach(function (r) {
        mKeys.forEach(function (k) {
          var v = (r[k] === undefined || r[k] === null) ? '' : String(r[k]).trim();
          if (!v || seen[v]) return;
          if (!/[0-9A-Za-z\u4e00-\u9fa5]/.test(v)) return;   /* 跳过 "-" "—" 等占位值 */
          seen[v] = true;
          list.push({ model: v, series: name, cat: cat });
        });
      });
    });
    list.sort(function (a, b) { return a.model.localeCompare(b.model, 'en', { numeric: true }); });
    return list;
  }

  /* ---- 3. 分类 + 分页选择器 ---- */
  function initPicker() {
    var panel = document.querySelector('.query-panel');
    var input = document.getElementById('qModel');
    if (!panel || !input) return;

    injectCss();

    var INDEX = buildIndex();
    if (!INDEX.length) return;

    /* 只显示有数据的分类 */
    var counts = {};
    INDEX.forEach(function (it) { counts[it.cat] = (counts[it.cat] || 0) + 1; });
    var CAT_LIST = [{ key: 'all', en: TXT.all, zh: TXT.all }];
    CATS.forEach(function (c) { if (counts[c.key]) CAT_LIST.push(c); });
    if (counts[OTHER.key]) CAT_LIST.push(OTHER);

    var curCat = 'all';
    var kw = '';
    var filtered = INDEX.slice();
    var page = 1, pages = 1;
    var picked = '';

    var box = document.createElement('div');
    box.className = 'ht-picker';
    box.innerHTML =
      '<div class="query-row ht-picker-search">' +
      '  <span class="query-label">' + TXT.title + '</span>' +
      '  <input id="htSelFilter" class="query-input" type="text" autocomplete="off" placeholder="' + TXT.filterPh + '">' +
      '</div>' +
      '<div class="ht-cat-row" id="htSelCats"></div>' +
      '<div class="ht-chip-grid" id="htSelGrid"></div>' +
      '<div class="ht-pager-wrap">' +
      '  <button type="button" class="ht-pg-btn" id="htSelPrev">' + TXT.prev + '</button>' +
      '  <span id="htSelNums" class="ht-pg-nums"></span>' +
      '  <button type="button" class="ht-pg-btn" id="htSelNext">' + TXT.next + '</button>' +
      '  <span class="ht-pg-info" id="htSelInfo"></span>' +
      '</div>' +
      '<div class="ht-picker-empty" id="htSelEmpty" style="display:none"></div>';
    /* 上下布局：型号库在查询面板内最上方，下面是型号/尺寸查询行 */
    var old = panel.querySelector('.ht-picker');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var firstRow = panel.querySelector('.query-row');
    if (firstRow) { panel.insertBefore(box, firstRow); }
    else { panel.appendChild(box); }

    var elFilter = document.getElementById('htSelFilter');
    var elCats = document.getElementById('htSelCats');
    var elGrid = document.getElementById('htSelGrid');
    var elNums = document.getElementById('htSelNums');
    var elPrev = document.getElementById('htSelPrev');
    var elNext = document.getElementById('htSelNext');
    var elInfo = document.getElementById('htSelInfo');
    var elEmpty = document.getElementById('htSelEmpty');

    function renderCats() {
      var html = '';
      CAT_LIST.forEach(function (c) {
        var n = ('all' === c.key) ? INDEX.length : (counts[c.key] || 0);
        html += '<button type="button" class="ht-cat' + (c.key === curCat ? ' active' : '') +
          '" data-c="' + c.key + '">' + catName(c) + '<em>' + n + '</em></button>';
      });
      elCats.innerHTML = html;
    }

    function renderNums() {
      var html = '';
      function btn(n) {
        return '<button type="button" class="ht-pg-btn' + (n === page ? ' active' : '') +
          '" data-p="' + n + '">' + n + '</button>';
      }
      var maxNum = narrow() ? 5 : 9;
      if (pages <= maxNum) {
        for (var i = 1; i <= pages; i++) html += btn(i);
      } else if (narrow()) {
        /* 手机端：首页 … 当前±1 … 末页，保证一行放得下 */
        var s2 = Math.max(2, page - 1), e2 = Math.min(pages - 1, page + 1);
        html += btn(1);
        if (s2 > 2) html += '<span class="ht-pg-dots">…</span>';
        for (var k = s2; k <= e2; k++) html += btn(k);
        if (e2 < pages - 1) html += '<span class="ht-pg-dots">…</span>';
        html += btn(pages);
      } else {
        var start = Math.max(2, page - 2), end = Math.min(pages - 1, page + 2);
        html += btn(1);
        if (start > 2) html += '<span class="ht-pg-dots">…</span>';
        for (var j = start; j <= end; j++) html += btn(j);
        if (end < pages - 1) html += '<span class="ht-pg-dots">…</span>';
        html += btn(pages);
      }
      elNums.innerHTML = html;
      elPrev.disabled = (page <= 1);
      elNext.disabled = (page >= pages);
    }

    function renderGrid() {
      pages = Math.ceil(filtered.length / perPage()) || 1;
      if (page > pages) page = pages;
      if (!filtered.length) {
        elGrid.innerHTML = '';
        elGrid.style.display = 'none';
        elEmpty.style.display = '';
        elEmpty.textContent = TXT.none;
      } else {
        elGrid.style.display = '';
        elEmpty.style.display = 'none';
        var pp = perPage();
        var from = (page - 1) * pp, to = Math.min(from + pp, filtered.length);
        var html = '';
        for (var i = from; i < to; i++) {
          var it = filtered[i];
          html += '<button type="button" class="ht-chip' + (it.model === picked ? ' active' : '') +
            '" data-m="' + it.model.replace(/"/g, '&quot;') + '" title="' +
            it.model + (it.series ? ' · ' + it.series : '') + '">' + it.model + '</button>';
        }
        elGrid.innerHTML = html;
      }
      elInfo.innerHTML = TXT.total + ' <b>' + filtered.length + '</b> ' + TXT.info +
        ' · ' + TXT.perPage + ' ' + perPage() + ' · ' + TXT.pageOf + ' <b>' + page + '</b>/' + pages;
      renderNums();
    }

    function goPage(n) {
      pages = Math.ceil(filtered.length / perPage()) || 1;
      if (n < 1) n = 1;
      if (n > pages) n = pages;
      page = n;
      renderGrid();
    }

    function apply() {
      var k = kw.toLowerCase();
      filtered = INDEX.filter(function (it) {
        if (curCat !== 'all' && it.cat !== curCat) return false;
        if (!k) return true;
        return it.model.toLowerCase().indexOf(k) > -1 || it.series.toLowerCase().indexOf(k) > -1;
      });
      goPage(1);
    }

    /* 事件委托 */
    elCats.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.ht-cat') : null;
      if (!b) return;
      curCat = b.getAttribute('data-c');
      elFilter.value = ''; kw = '';          /* 切分类即清空关键字，避免两套条件互相干扰 */
      renderCats(); apply();
    });
    elNums.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.ht-pg-btn') : null;
      if (!b || !b.getAttribute('data-p')) return;
      goPage(parseInt(b.getAttribute('data-p'), 10));
    });
    elPrev.addEventListener('click', function () { goPage(page - 1); });
    elNext.addEventListener('click', function () { goPage(page + 1); });

    /* 点型号 → 回填原型号输入框 → 沿用原查询逻辑 */
    elGrid.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.ht-chip') : null;
      if (!b) return;
      var v = b.getAttribute('data-m') || '';
      if (!v) return;
      picked = v;
      input.value = v;
      var btn = document.getElementById('qModelSearch');
      if (btn) btn.click();
      var res = document.getElementById('queryResult');
      if (res && res.scrollIntoView) res.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var all = elGrid.querySelectorAll('.ht-chip');
      for (var i = 0; i < all.length; i++) all[i].className = 'ht-chip' + (all[i] === b ? ' active' : '');
    });

    var timer = null;
    elFilter.addEventListener('input', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        kw = (elFilter.value || '').trim();
        if (kw && curCat !== 'all') { curCat = 'all'; renderCats(); }  /* 关键字搜索默认全库 */
        apply();
      }, 150);
    });

    var rt = null;
    window.addEventListener('resize', function () {
      if (rt) clearTimeout(rt);
      rt = setTimeout(function () { goPage(page); }, 200);
    });

    renderCats();
    renderGrid();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPicker); else initPicker();
})();
