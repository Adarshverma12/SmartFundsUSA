(function () {
  /* ===== Mobile hamburger ===== */
  var h = document.getElementById('hamburger');
  var m = document.getElementById('mobile-menu');
  function setMenuOpen(open) {
    if (!h || !m) return;
    m.style.display = open ? 'flex' : 'none';
    h.setAttribute('aria-expanded', open ? 'true' : 'false');
    h.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (h && m) {
    h.addEventListener('click', function () {
      setMenuOpen(m.style.display !== 'flex');
    });
  }

  /* ===== Page modal (nav + footer → homepage overlay) ===== */
  var cache = {};
  var lastFocus = null;
  var modal = null;
  var titleEl = null;
  var bodyEl = null;
  var isHome =
    document.body.classList.contains('page-home') ||
    /\/(index\.html)?$/.test(location.pathname) ||
    location.pathname === '' ||
    location.pathname === '/';

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'page-modal';
    modal.id = 'page-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="page-modal__backdrop" data-close="1"></div>' +
      '<div class="page-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="page-modal-title">' +
      '<div class="page-modal__head">' +
      '<h2 class="page-modal__title" id="page-modal-title">Loading…</h2>' +
      '<button type="button" class="page-modal__close" aria-label="Close" data-close="1">&times;</button>' +
      '</div>' +
      '<div class="page-modal__body" id="page-modal-body"></div>' +
      '</div>';
    document.body.appendChild(modal);
    titleEl = modal.querySelector('#page-modal-title');
    bodyEl = modal.querySelector('#page-modal-body');

    modal.addEventListener('click', function (e) {
      if (e.target.getAttribute('data-close') === '1') closeModal();
    });

    bodyEl.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (shouldOpenInModal(href)) {
        e.preventDefault();
        openPageModal(normalizePageUrl(href));
      }
    });

    return modal;
  }

  function normalizePageUrl(href) {
    try {
      var u = new URL(href, location.origin);
      return u.pathname.replace(/^\//, '') || 'index.html';
    } catch (err) {
      return String(href).replace(/^\//, '');
    }
  }

  function shouldOpenInModal(href) {
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (/^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0) return false;
    var path = normalizePageUrl(href).split('?')[0].split('#')[0];
    if (!path || path === '/' || path === 'index.html') return false;
    return /\.html$/i.test(path);
  }

  function isNavOrFooterLink(a) {
    return !!(a && a.closest('.nav-links, .mobile-menu, .footer-links'));
  }

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function setOpenQuery(page) {
    try {
      var url = new URL(location.href);
      if (page) url.searchParams.set('open', page);
      else url.searchParams.delete('open');
      history.pushState({ pageModal: page || null }, '', url.pathname + url.search + url.hash);
    } catch (err) {}
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    setOpenQuery(null);
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (err) {}
    }
  }

  function showModalShell(title) {
    ensureModal();
    titleEl.textContent = title || 'Loading…';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    var closeBtn = modal.querySelector('.page-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function renderContent(html, page) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var main = doc.querySelector('#main') || doc.querySelector('main');
    if (!main) {
      bodyEl.innerHTML = '<p class="page-modal__error">Sorry, this page could not be loaded.</p>';
      titleEl.textContent = 'Unavailable';
      return;
    }
    var h1 = main.querySelector('h1');
    titleEl.textContent = h1 ? h1.textContent.trim() : page;
    bodyEl.innerHTML = main.innerHTML;
    bodyEl.scrollTop = 0;
    // Reveal any .rv items inside modal immediately
    bodyEl.querySelectorAll('.rv').forEach(function (el) {
      el.classList.add('in');
    });
  }

  function openPageModal(page) {
    page = normalizePageUrl(page);
    if (!page || page === 'index.html') return;

    lastFocus = document.activeElement;
    setMenuOpen(false);
    showModalShell('Loading…');
    bodyEl.innerHTML = '<p class="page-modal__loading">Loading…</p>';
    setOpenQuery(page);

    if (cache[page]) {
      renderContent(cache[page], page);
      return;
    }

    var url = '/' + page.replace(/^\//, '');
    fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        cache[page] = html;
        if (!modal.classList.contains('is-open')) return;
        renderContent(html, page);
      })
      .catch(function () {
        bodyEl.innerHTML =
          '<p class="page-modal__error">Could not load this page. <a href="/' +
          page.replace(/^\//, '') +
          '">Open full page</a></p>';
        titleEl.textContent = 'Error';
      });
  }

  function goHomeAndOpen(page) {
    var target = '/?open=' + encodeURIComponent(normalizePageUrl(page));
    location.href = target;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    if (!isNavOrFooterLink(a)) return;

    var href = a.getAttribute('href') || '';

    // Footer / nav Home → stay on home (close modal if open)
    if (href === '/' || href === '/index.html' || href === 'index.html') {
      if (modal && modal.classList.contains('is-open')) {
        e.preventDefault();
        closeModal();
      }
      return;
    }

    if (!shouldOpenInModal(href)) return;

    e.preventDefault();
    var page = normalizePageUrl(href);

    if (isHome) {
      openPageModal(page);
    } else {
      goHomeAndOpen(page);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('popstate', function () {
    var params = new URLSearchParams(location.search);
    var page = params.get('open');
    if (page && isHome) openPageModal(page);
    else closeModal();
  });

  // Deep link: /?open=how-it-works.html
  if (isHome) {
    try {
      var openParam = new URLSearchParams(location.search).get('open');
      if (openParam && shouldOpenInModal(openParam)) {
        openPageModal(openParam);
      }
    } catch (err) {}
  }
})();
