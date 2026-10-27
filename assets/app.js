(function () {
  'use strict';

  var CATEGORIES = {
    software: { label: '软件包', tagClass: 'tag--software', dotClass: 'dot--software' },
    doc: { label: '文档', tagClass: 'tag--doc', dotClass: 'dot--doc' },
    asset: { label: '素材', tagClass: 'tag--asset', dotClass: 'dot--asset' }
  };

  var PLATFORM_ORDER = ['Windows', 'macOS', 'Linux'];

  var ICONS = {
    Windows: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="5.2" height="5.2" rx="0.8"/><rect x="8.8" y="2" width="5.2" height="5.2" rx="0.8"/><rect x="2" y="8.8" width="5.2" height="5.2" rx="0.8"/><rect x="8.8" y="8.8" width="5.2" height="5.2" rx="0.8"/></svg>',
    macOS: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3" width="11" height="7.6" rx="1.2"/><path d="M1.5 12.6h13"/></svg>',
    Linux: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.6"/><path d="m5 6.2 2 1.8-2 1.8"/><path d="M8.6 10h2.6"/></svg>'
  };

  var FALLBACK_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8"/><path d="m5 7 3 3 3-3"/><path d="M2.5 13h11"/></svg>';

  var DOWNLOAD_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2.5v7.5"/><path d="m5 7.5 3 3 3-3"/><path d="M2.8 13h10.4"/></svg>';

  var grid = document.getElementById('grid');
  var empty = document.getElementById('empty');
  var stats = document.getElementById('stats');
  var overview = document.getElementById('overview');
  var platformsBox = document.getElementById('platforms');
  var platformPill = document.getElementById('platformPill');
  var searchInput = document.getElementById('search');
  var resetButton = document.getElementById('resetFilter');
  var toTopButton = document.getElementById('toTop');
  var appMain = document.getElementById('appMain');

  var items = (window.DOWNLOADS || []).filter(function (item) {
    return item && item.name && item.category && CATEGORIES[item.category];
  });

  items.sort(function (a, b) {
    return String(b.updated || '').localeCompare(String(a.updated || ''));
  });

  var activeCategory = 'all';
  var query = '';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function filesOf(item) {
    return Array.isArray(item.files) ? item.files : [];
  }

  function allFiles() {
    return items.reduce(function (list, item) {
      return list.concat(filesOf(item));
    }, []);
  }

  function platformIcon(platform) {
    return ICONS[platform] || FALLBACK_ICON;
  }

  function versionLabel(version) {
    if (!version) return '';
    var text = String(version);
    return /^v/i.test(text) ? text : 'v' + text;
  }

  function countFilesByCategory(category) {
    return items.reduce(function (sum, item) {
      return item.category === category ? sum + filesOf(item).length : sum;
    }, 0);
  }

  function countByCategory(category) {
    return items.filter(function (item) {
      return item.category === category;
    }).length;
  }

  function collectPlatforms() {
    var map = {};
    allFiles().forEach(function (file) {
      if (!file.platform) return;
      map[file.platform] = (map[file.platform] || 0) + 1;
    });

    var known = PLATFORM_ORDER.filter(function (name) {
      return map[name];
    });
    var others = Object.keys(map).filter(function (name) {
      return PLATFORM_ORDER.indexOf(name) === -1;
    }).sort();

    return known.concat(others).map(function (name) {
      return { name: name, count: map[name] };
    });
  }

  /* ---------- 卡片 ---------- */
  function fileRowHtml(file) {
    var url = file.url || '#';
    var isExternal = /^(?:https?:)?\/\//i.test(url);
    var linkAttrs = 'href="' + escapeHtml(url) + '"';
    linkAttrs += isExternal
      ? ' target="_blank" rel="noopener"'
      : ' download="' + escapeHtml(file.name || '') + '"';

    var platform = file.platform
      ? '<span class="platform">' + platformIcon(file.platform) + escapeHtml(file.platform) + '</span>'
      : '';

    return (
      '<div class="file-row">' +
        '<div class="file-info">' +
          platform +
          '<span class="file-name" title="' + escapeHtml(file.name || url) + '">' +
            escapeHtml(file.name || url) +
          '</span>' +
        '</div>' +
        '<a class="btn" ' + linkAttrs + '>' + DOWNLOAD_ICON + '下载</a>' +
      '</div>'
    );
  }

  function cardHtml(item) {
    var category = CATEGORIES[item.category];
    var files = filesOf(item);

    return (
      '<article class="card">' +
        '<div class="card-head">' +
          '<span class="tag ' + category.tagClass + '">' + escapeHtml(category.label) + '</span>' +
          (item.version ? '<span class="version">' + escapeHtml(versionLabel(item.version)) + '</span>' : '') +
        '</div>' +
        '<h3 class="card-title">' + escapeHtml(item.name) + '</h3>' +
        (item.desc ? '<p class="card-desc">' + escapeHtml(item.desc) + '</p>' : '') +
        '<div class="files">' + files.map(fileRowHtml).join('') + '</div>' +
        '<div class="card-foot">' +
          '<span>' + (item.updated ? '更新于 ' + escapeHtml(item.updated) : '') + '</span>' +
          '<span>' + files.length + ' 个文件</span>' +
        '</div>' +
      '</article>'
    );
  }

  function matches(item) {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (!query) return true;

    var haystack = [item.name, item.desc, item.version].concat(
      filesOf(item).map(function (file) {
        return [file.name, file.platform].join(' ');
      })
    ).join(' ').toLowerCase();

    return haystack.indexOf(query) !== -1;
  }

  function renderGrid() {
    var showcase = document.querySelector('.showcase');
    var tutorial = document.querySelector('.tutorial');
    var showShowcase = activeCategory === 'all' || activeCategory === 'asset';
    var showTutorial = activeCategory === 'all' || activeCategory === 'software' || activeCategory === 'tutorial';

    /* 图片素材只在大图展示区呈现，不在下载卡片中重复 */
    if (showcase) showcase.hidden = !showShowcase;
    if (tutorial) tutorial.hidden = !showTutorial;

    if (activeCategory === 'asset' || activeCategory === 'tutorial') {
      grid.hidden = true;
      grid.innerHTML = '';
      empty.hidden = true;
      return;
    }

    grid.hidden = false;

    var visible = items.filter(matches);

    grid.innerHTML = visible.map(cardHtml).join('');
    empty.hidden = visible.length > 0;

    if (!visible.length) {
      empty.textContent = query
        ? '没有找到与「' + query + '」匹配的资源，换个关键词试试。'
        : '该分类下暂无资源。';
    }
  }

  /* ---------- 顶部统计 ---------- */
  function renderStats() {
    var latest = items.reduce(function (max, item) {
      return item.updated && item.updated > max ? item.updated : max;
    }, '');

    var data = [
      { label: '资源总数', value: items.length },
      { label: '下载文件', value: allFiles().length },
      { label: '最近更新', value: latest || '—' }
    ];

    stats.innerHTML = data.map(function (item) {
      return (
        '<div class="stat">' +
          '<span class="stat-label">' + item.label + '</span>' +
          '<span class="stat-value">' + escapeHtml(item.value) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- 右侧：资源概览 ---------- */
  function renderOverview() {
    var rows = Object.keys(CATEGORIES).filter(function (key) {
      return countByCategory(key) > 0;
    }).map(function (key) {
      var category = CATEGORIES[key];
      return (
        '<button class="table-row" type="button" data-filter="' + key + '">' +
          '<span class="table-cat">' +
            '<span class="dot ' + category.dotClass + '"></span>' +
            escapeHtml(category.label) +
          '</span>' +
          '<span class="num">' + countByCategory(key) + '</span>' +
          '<span class="num">' + countFilesByCategory(key) + '</span>' +
        '</button>'
      );
    }).join('');

    overview.innerHTML =
      '<div class="table-head">' +
        '<span>分类</span><span>资源</span><span>文件</span>' +
      '</div>' + rows;
  }

  /* ---------- 右侧：平台支持 ---------- */
  function renderPlatforms() {
    var platforms = collectPlatforms();
    var max = platforms.reduce(function (top, item) {
      return Math.max(top, item.count);
    }, 0);

    platformPill.textContent = platforms.length + ' 个平台';

    platformsBox.innerHTML = platforms.map(function (item) {
      var width = max ? Math.round((item.count / max) * 100) : 0;
      return (
        '<div class="platform-item">' +
          '<div class="platform-top">' +
            '<span class="platform-name">' + platformIcon(item.name) + escapeHtml(item.name) + '</span>' +
            '<span class="platform-count">' + item.count + ' 个文件</span>' +
          '</div>' +
          '<div class="bar"><span style="width:' + width + '%"></span></div>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- 筛选联动 ---------- */
  function syncFilters() {
    var controls = document.querySelectorAll('[data-filter]');
    Array.prototype.forEach.call(controls, function (control) {
      var isActive = control.getAttribute('data-filter') === activeCategory;
      control.classList.toggle('is-active', isActive);
      control.setAttribute('aria-pressed', String(isActive));
    });
  }

  function setCategory(category) {
    activeCategory = category;
    syncFilters();
    renderGrid();
    scrollToTop();
  }

  function scrollToTop() {
    if (appMain.scrollHeight > appMain.clientHeight) {
      appMain.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-filter]'), function (control) {
    control.addEventListener('click', function () {
      var target = control.getAttribute('data-filter');
      if (target === activeCategory) return;
      setCategory(target);
    });
  });

  searchInput.addEventListener('input', function () {
    query = searchInput.value.trim().toLowerCase();
    renderGrid();
  });

  resetButton.addEventListener('click', function () {
    query = '';
    searchInput.value = '';
    setCategory('all');
  });

  toTopButton.addEventListener('click', scrollToTop);

  /* ---------- 图片预览 ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastShot = null;

  function openLightbox(shot) {
    var src = shot.getAttribute('href');
    if (!src) return;

    var image = shot.querySelector('img');
    lightboxImg.src = src;
    lightboxImg.alt = image ? image.alt : '';
    lastShot = shot;
    lightbox.hidden = false;
    document.body.classList.add('is-lightbox-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;

    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.body.classList.remove('is-lightbox-open');

    if (lastShot) {
      lastShot.focus();
      lastShot = null;
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.shot'), function (shot) {
    shot.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openLightbox(shot);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeLightbox();
  });

  renderStats();
  renderOverview();
  renderPlatforms();
  syncFilters();
  renderGrid();
})();
