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

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
      return false;
    }
  }

  function softScrollTo(target) {
    var behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: behavior });
      return;
    }
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: behavior, block: 'start' });
    }
  }

  function softScrollToHash(hash) {
    if (!hash || hash === '#') {
      softScrollTo(0);
      return;
    }
    var id = hash.replace(/^#/, '');
    var el = document.getElementById(id);
    if (el) softScrollTo(el);
    else softScrollTo(0);
  }

  function isHomeHref(href) {
    return href === '/' || href === '/index.html' || href === 'index.html';
  }

  function getHashTarget(href) {
    if (!href) return null;
    if (href.charAt(0) === '#') return href;
    try {
      var u = new URL(href, location.origin);
      if (u.origin !== location.origin) return null;
      var path = u.pathname.replace(/\/$/, '') || '/';
      var here = location.pathname.replace(/\/$/, '') || '/';
      var onHomePath =
        path === '/' || path === '/index.html' || path.endsWith('/index.html');
      var currentlyHome =
        here === '/' || here === '/index.html' || here.endsWith('/index.html') || isHome;
      if (u.hash && onHomePath && currentlyHome) return u.hash;
      if (u.hash && path === here) return u.hash;
    } catch (err) {}
    return null;
  }

  function stripModalExtras(root) {
    if (!root) return;
    root.querySelectorAll('.cta-band').forEach(function (el) {
      var parent = el.parentElement;
      el.remove();
      if (
        parent &&
        parent !== root &&
        !parent.querySelector(
          'h1, h2, h3, p, details, ul, ol, article, .grid, .form-card, .callout, .prose'
        )
      ) {
        var grand = parent.parentElement;
        parent.remove();
        if (
          grand &&
          grand !== root &&
          (grand.matches('section.band, .band, section') || grand.classList.contains('band')) &&
          !grand.querySelector(
            'h1, h2, h3, p, details, ul, ol, article, .grid, .form-card, .callout, .prose'
          )
        ) {
          grand.remove();
        }
      }
    });
  }

  function renderContent(html, page) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var main = doc.querySelector('#main') || doc.querySelector('main');
    if (!main) {
      bodyEl.innerHTML = '<p class="page-modal__error">Sorry, this page could not be loaded.</p>';
      titleEl.textContent = 'Unavailable';
      return;
    }
    stripModalExtras(main);
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

  function goHomeAndScroll(hash) {
    if (isHome) {
      closeModal();
      softScrollToHash(hash || '#');
      return;
    }
    location.href = hash && hash !== '#' ? '/#' + hash.replace(/^#/, '') : '/';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;

    var href = a.getAttribute('href') || '';

    // Soft scroll: same-page / home hash targets (form CTAs, skip link, etc.)
    var hash = getHashTarget(href);
    if (hash) {
      e.preventDefault();
      setMenuOpen(false);
      closeModal();
      // Allow modal close paint, then scroll
      requestAnimationFrame(function () {
        softScrollToHash(hash);
      });
      try {
        history.pushState(null, '', hash === '#' ? location.pathname : hash);
      } catch (err) {}
      return;
    }

    if (!isNavOrFooterLink(a)) return;

    // Footer / nav Home → soft scroll to top
    if (isHomeHref(href)) {
      e.preventDefault();
      setMenuOpen(false);
      goHomeAndScroll('#');
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
      } else if (location.hash) {
        // Soft-land on hash after load (e.g. /#form)
        requestAnimationFrame(function () {
          softScrollToHash(location.hash);
        });
      }
    } catch (err) {}
  }
})();
