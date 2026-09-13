/* ============================================================
   Shared chrome: masthead, nav, footer, theme, global search
   ============================================================ */

window.DYLAN = window.DYLAN || {};

(function () {
  'use strict';

  const PRIMARY = [
    ['biography.html', 'Life'],
    ['timeline.html', 'Timeline'],
    ['discography.html', 'Records'],
    ['songs.html', 'Songs'],
    ['tours.html', 'Tours'],
    ['stories.html', 'Stories']
  ];

  const MORE = [
    ['quiz.html', 'Quiz'],
    ['interviews.html', 'Interviews'],
    ['quotes.html', 'Quotes'],
    ['style.html', 'Style'],
    ['people.html', 'People'],
    ['covers.html', 'Covers'],
    ['library.html', 'Library'],
    ['honors.html', 'Honors'],
    ['resources.html', 'Resources']
  ];

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  DYLAN.esc = esc;

  /* ---------- theme ---------- */

  function initTheme() {
    let t = null;
    // Key bumped when dark became the default, so a "light" saved under the
    // old system-preference behaviour doesn't silently override it.
    try { t = localStorage.getItem('dylan-theme-2'); } catch (e) { /* storage blocked */ }
    // Dark is the default and the stylesheet already paints it, so only a
    // stored preference for light actually changes anything here.
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  }

  function toggleTheme() {
    const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', now);
    try { localStorage.setItem('dylan-theme-2', now); } catch (e) { /* ignore */ }
    const b = document.getElementById('theme-btn');
    if (b) b.textContent = now === 'dark' ? '☀' : '☾';
  }

  initTheme();

  /* ---------- chrome ---------- */

  function currentPage() {
    let p = location.pathname.split('/').pop();
    if (p === '') return 'index.html';
    // Cloudflare Pages serves /timeline, not /timeline.html — it 308s the
    // extension away. The nav's hrefs keep the .html (they have to work from
    // the filesystem and from GitHub Pages too), so without this the two
    // never matched and no nav item was ever highlighted on the live site.
    if (p.indexOf('.') === -1) p += '.html';
    return p;
  }

  function navHTML(active) {
    const link = ([href, label]) =>
      `<a href="${href}"${href === active ? ' class="active"' : ''}>${label}</a>`;
    const moreActive = MORE.some(([h]) => h === active);
    return `
      <header class="masthead">
        <div class="masthead-inner">
          <a class="brand" href="index.html">
            <span class="brand-name">Bob Dylan</span>
            <span class="brand-sub">A Fan's Guide</span>
          </a>
          <nav class="nav" id="nav">
            ${PRIMARY.map(link).join('')}
            <div class="dropdown${moreActive ? ' active-parent' : ''}">
              <button class="drop-btn${moreActive ? ' active' : ''}" id="more-btn" aria-expanded="false">More <span aria-hidden="true">▾</span></button>
              <div class="drop-menu" id="more-menu">${MORE.map(link).join('')}</div>
            </div>
          </nav>
          <div class="nav-tools">
            <button class="icon-btn" id="search-btn" title="Search everything (press /)" aria-label="Search">⌕</button>
            <button class="icon-btn" id="theme-btn" title="Toggle light / dark" aria-label="Toggle theme">☾</button>
            <button class="icon-btn nav-toggle" id="nav-btn" aria-label="Menu">☰</button>
          </div>
        </div>
      </header>`;
  }

  function footerHTML() {
    const col = (title, items) =>
      `<div><h4>${title}</h4><ul>${items.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
    return `
      <footer class="footer">
        <div class="wrap">
          <div class="footer-grid">
            ${col('The Work', [['discography.html', 'Discography'], ['songs.html', 'Song index'], ['covers.html', 'Great covers'], ['tours.html', 'Touring history']])}
            ${col('The Life', [['biography.html', 'Biography'], ['timeline.html', 'Timeline'], ['people.html', 'People'], ['honors.html', 'Awards & honors']])}
            ${col('The Words', [['interviews.html', 'Interviews'], ['quotes.html', 'Quotations'], ['stories.html', 'Stories & legends'], ['library.html', 'Books & films'], ['quiz.html', 'Monthly quiz']])}
            ${col('Elsewhere', [['resources.html', 'Fan resources'], ['https://www.bobdylan.com/', 'bobdylan.com'], ['https://www.bobdylancenter.com/', 'Bob Dylan Center'], ['https://www.bobdylan.com/on-tour/', 'Tour dates']])}
          </div>
          <div class="colophon">
            <span>An independent, non-commercial fan guide. Not affiliated with Bob Dylan, his management, or Columbia Records.</span>
            <span>Compiled 2026 &middot; <a href="resources.html">Sources &amp; corrections</a></span>
          </div>
        </div>
      </footer>
      <button class="to-top" id="to-top" aria-label="Back to top">↑</button>`;
  }

  /* ---------- global search ---------- */

  const SOURCES = [
    { key: 'albums',     label: 'Record',    page: 'discography.html', title: d => d.title, sub: d => `${d.year} · ${d.type}`, text: d => [d.title, d.note, d.type, d.year, (d.key || []).join(' ')].join(' ') },
    { key: 'songs',      label: 'Song',      page: 'songs.html',       title: d => d.title, sub: d => `${d.year} · ${d.album}`, text: d => [d.title, d.album, d.note, d.year].join(' ') },
    { key: 'timeline',   label: 'Event',     page: 'timeline.html',    title: d => d.title, sub: d => d.date,                  text: d => [d.title, d.date, d.body].join(' ') },
    { key: 'quotes',     label: 'Quote',     page: 'quotes.html',      title: d => '“' + d.text.slice(0, 70) + (d.text.length > 70 ? '…' : '') + '”', sub: d => d.source, text: d => [d.text, d.source, d.topic].join(' ') },
    { key: 'stories',    label: 'Story',     page: 'stories.html',     title: d => d.title, sub: d => d.when,                  text: d => [d.title, d.when, d.body].join(' ') },
    { key: 'interviews', label: 'Interview', page: 'interviews.html',  title: d => d.title, sub: d => `${d.date} · ${d.outlet}`, text: d => [d.title, d.outlet, d.date, d.body, d.quote].join(' ') },
    { key: 'people',     label: 'Person',    page: 'people.html',      title: d => d.name,  sub: d => d.role,                  text: d => [d.name, d.role, d.note].join(' ') },
    { key: 'books',      label: 'Book',      page: 'library.html',     title: d => d.title, sub: d => `${d.author} · ${d.year}`, text: d => [d.title, d.author, d.note].join(' ') },
    { key: 'films',      label: 'Film',      page: 'library.html',     title: d => d.title, sub: d => `${d.year} · ${d.director}`, text: d => [d.title, d.director, d.note].join(' ') },
    { key: 'covers',     label: 'Cover',     page: 'covers.html',      title: d => `${d.artist} — ${d.song}`, sub: d => d.year, text: d => [d.artist, d.song, d.note].join(' ') },
    { key: 'looks',      label: 'Style',     page: 'style.html',       title: d => d.title, sub: d => d.years,                 text: d => [d.title, d.years, d.summary, (d.items || []).map(i => i.what + ' ' + i.detail).join(' ')].join(' ') },
    { key: 'honors',     label: 'Honor',     page: 'honors.html',      title: d => d.award, sub: d => d.year,                  text: d => [d.award, d.year, d.note].join(' ') },
    { key: 'tours',      label: 'Tour',      page: 'tours.html',       title: d => d.name,  sub: d => d.years,                 text: d => [d.name, d.years, d.note].join(' ') }
  ];

  function searchAll(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const out = [];
    SOURCES.forEach(src => {
      const rows = DYLAN[src.key];
      if (!Array.isArray(rows)) return;
      rows.forEach(d => {
        let hay;
        try { hay = src.text(d).toLowerCase(); } catch (e) { return; }
        if (!terms.every(t => hay.indexOf(t) !== -1)) return;
        let score = 0;
        let t0;
        try { t0 = String(src.title(d)).toLowerCase(); } catch (e) { t0 = ''; }
        terms.forEach(t => { if (t0.indexOf(t) !== -1) score += 10; });
        if (t0.indexOf(terms[0]) === 0) score += 15;
        out.push({ score, label: src.label, page: src.page, title: src.title(d), sub: src.sub(d) });
      });
    });
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 60);
  }

  function overlayHTML() {
    return `
      <div class="search-overlay" id="search-overlay" hidden>
        <div class="search-panel" role="dialog" aria-label="Search the guide">
          <input type="search" id="global-q" class="search-box" placeholder="Search records, songs, stories, quotes, people…" autocomplete="off" spellcheck="false">
          <div class="search-results" id="global-results">
            <p class="search-hint">Type to search across every page of the guide. <kbd>Esc</kbd> to close.</p>
          </div>
        </div>
      </div>`;
  }

  function renderResults(q) {
    const box = document.getElementById('global-results');
    if (!q.trim()) {
      box.innerHTML = '<p class="search-hint">Type to search across every page of the guide. <kbd>Esc</kbd> to close.</p>';
      return;
    }
    const hits = searchAll(q);
    if (!hits.length) {
      box.innerHTML = `<p class="search-hint">Nothing found for “${esc(q)}”.</p>`;
      return;
    }
    box.innerHTML = hits.map(h => `
      <a class="search-hit" href="${h.page}">
        <span class="hit-label">${esc(h.label)}</span>
        <span class="hit-title">${esc(h.title)}</span>
        <span class="hit-sub">${esc(h.sub)}</span>
      </a>`).join('');
  }

  function openSearch() {
    const o = document.getElementById('search-overlay');
    o.hidden = false;
    document.body.style.overflow = 'hidden';
    const i = document.getElementById('global-q');
    i.focus();
    i.select();
  }

  function closeSearch() {
    document.getElementById('search-overlay').hidden = true;
    document.body.style.overflow = '';
  }

  /* ---------- boot ---------- */

  DYLAN.chrome = function () {
    const active = currentPage();
    document.body.insertAdjacentHTML('afterbegin', navHTML(active));
    document.body.insertAdjacentHTML('beforeend', footerHTML() + overlayHTML());

    document.getElementById('theme-btn').textContent =
      document.documentElement.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
    document.getElementById('theme-btn').addEventListener('click', toggleTheme);

    document.getElementById('nav-btn').addEventListener('click', () =>
      document.getElementById('nav').classList.toggle('open'));

    const moreBtn = document.getElementById('more-btn');
    const moreMenu = document.getElementById('more-menu');
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = moreMenu.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => {
      moreMenu.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('search-btn').addEventListener('click', openSearch);
    document.getElementById('search-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'search-overlay') closeSearch();
    });
    let t;
    document.getElementById('global-q').addEventListener('input', (e) => {
      clearTimeout(t);
      const v = e.target.value;
      t = setTimeout(() => renderResults(v), 90);
    });

    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (e.key === 'Escape') closeSearch();
      if (e.key === '/' && !typing) { e.preventDefault(); openSearch(); }
    });

    const top = document.getElementById('to-top');
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      top.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
  };

  /* ---------- listen links ---------- */

  const SP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12"/><path d="M6.2 9.4c3.6-1 8-0.7 11.2 1.2M7 12.6c3-0.8 6.6-0.5 9.3 1.1M7.7 15.7c2.4-0.6 5.3-0.4 7.5 0.9" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>';
  const YT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4.5" width="22" height="15" rx="4.2"/><path d="M10 8.6l5.6 3.4L10 15.4z" fill="#fff"/></svg>';

  /* Build Spotify + YouTube buttons for a record or a song.
     o = { title, artist (default Bob Dylan), kind: 'album'|'track', spotify: <verified id> }
     A verified Spotify album id produces a direct link; otherwise both platforms
     get a scoped search, which always resolves and never rots. */
  DYLAN.music = function (o) {
    const artist = o.artist || 'Bob Dylan';
    const clean = String(o.title).replace(/[“”"]/g, '').trim();
    if (!clean) return '';
    const isAlbum = o.kind === 'album';
    const label = artist === 'Bob Dylan' ? clean : artist + ' — ' + clean;

    // Don't repeat the artist when the title already carries it ("Bob Dylan at Budokan")
    const query = clean.toLowerCase().indexOf(artist.toLowerCase()) !== -1
      ? clean
      : artist + ' ' + clean;

    const spHref = o.spotify
      ? 'https://open.spotify.com/album/' + o.spotify
      : 'https://open.spotify.com/search/' + encodeURIComponent(query) +
        (isAlbum ? '/albums' : '/tracks');
    const spTitle = o.spotify ? 'Open “' + label + '” on Spotify' : 'Find “' + label + '” on Spotify';

    const ytHref = 'https://www.youtube.com/results?search_query=' +
      encodeURIComponent(query + (isAlbum ? ' full album' : ''));
    const ytTitle = 'Find “' + label + '” on YouTube';

    const compact = !!o.compact;
    const btn = (cls, href, tip, icon, text, isSearch) =>
      '<a class="lbtn ' + cls + '" href="' + esc(href) + '" target="_blank"' +
        ' rel="noopener noreferrer" title="' + esc(tip) + '" aria-label="' + esc(tip) + '">' +
        icon + (compact ? '' : '<span>' + text + '</span>') +
        (isSearch && !compact ? '<i aria-hidden="true">⌕</i>' : '') + '</a>';

    return '<div class="listen' + (compact ? ' compact' : '') + '">' +
      btn('sp' + (o.spotify ? ' exact' : ''), spHref, spTitle, SP_ICON, 'Spotify', !o.spotify) +
      btn('yt', ytHref, ytTitle, YT_ICON, 'YouTube', true) +
      '</div>';
  };

  /* ---------- shared list helpers ---------- */

  DYLAN.filterList = function (opts) {
    const { data, mount, render, searchFields, facetField, facetAll = 'All',
            countNoun = 'entries', onRender } = opts;
    const root = document.querySelector(mount);
    if (!root) return;

    const facets = facetField
      ? [facetAll].concat(Array.from(new Set(data.map(d => d[facetField]).filter(Boolean))))
      : null;

    root.innerHTML = `
      <div class="toolbar">
        <input type="search" class="search-input f-q" placeholder="Filter ${countNoun}…" autocomplete="off">
        ${facets ? `<div class="chips f-chips">${facets.map((f, i) =>
          `<button class="chip${i === 0 ? ' on' : ''}" data-f="${esc(f)}">${esc(f)}</button>`).join('')}</div>` : ''}
        <span class="result-count f-count"></span>
      </div>
      <div class="f-out"></div>`;

    const out = root.querySelector('.f-out');
    const count = root.querySelector('.f-count');
    let q = '', facet = facetAll;

    function apply() {
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      const rows = data.filter(d => {
        if (facet !== facetAll && d[facetField] !== facet) return false;
        if (!terms.length) return true;
        const hay = searchFields.map(f => {
          const v = d[f];
          return Array.isArray(v) ? v.join(' ') : (v || '');
        }).join(' ').toLowerCase();
        return terms.every(t => hay.indexOf(t) !== -1);
      });
      count.textContent = rows.length + ' ' + countNoun;
      out.innerHTML = rows.length ? render(rows) : `<p class="empty">Nothing matches that.</p>`;
      // lets a page rebuild anything derived from the output — the timeline's
      // era rail has to follow whatever the filter left on screen
      if (onRender) onRender(rows, out);
    }

    root.querySelector('.f-q').addEventListener('input', e => { q = e.target.value; apply(); });
    if (facets) {
      root.querySelector('.f-chips').addEventListener('click', e => {
        const b = e.target.closest('.chip');
        if (!b) return;
        facet = b.dataset.f;
        root.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
        apply();
      });
    }
    apply();
  };
})();
