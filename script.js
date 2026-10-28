/* ============================================================
   CONSULTA GIOVANILE DI CASTRONUOVO DI SANT'ANDREA (PZ)
   JavaScript principale
   ============================================================ */

'use strict';

(() => {
  function init() {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) =>
      Array.from(root.querySelectorAll(selector));

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

    /* ==========================================================
       MENU MOBILE
    ========================================================== */

    const header = $('.header');
    const hamburger = $('#hamburger') || $('.hamburger');
    const navMenu = $('#nav-menu') || $('.nav-menu');
    const backToTop = $('#backToTop');

    const navLinks = $$('.nav-menu a[href^="#"]');

    function closeMenu() {
      hamburger?.classList.remove('active');
      hamburger?.setAttribute('aria-expanded', 'false');
      hamburger?.setAttribute('aria-label', 'Apri menu');

      navMenu?.classList.remove('active');
      document.body.classList.remove('menu-open');
    }

    function openMenu() {
      if (!hamburger || !navMenu) return;

      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Chiudi menu');

      navMenu.classList.add('active');
      document.body.classList.add('menu-open');
    }

    hamburger?.addEventListener('click', () => {
      const isOpen =
        hamburger.getAttribute('aria-expanded') === 'true';

      isOpen ? closeMenu() : openMenu();
    });

    navLinks.forEach(link => {
      link.addEventListener('click', event => {
        const href = link.getAttribute('href');

        if (href && href.length > 1) {
          const target = document.getElementById(href.slice(1));

          if (target) {
            event.preventDefault();

            target.scrollIntoView({
              behavior: scrollBehavior,
              block: 'start'
            });

            if (window.history?.replaceState) {
              window.history.replaceState(null, '', href);
            }
          }
        }

        closeMenu();
      });
    });

    document.addEventListener('click', event => {
      if (!hamburger || !navMenu) return;

      const isOpen =
        hamburger.getAttribute('aria-expanded') === 'true';

      if (
        isOpen &&
        !navMenu.contains(event.target) &&
        !hamburger.contains(event.target)
      ) {
        closeMenu();
      }
    });

    /* ==========================================================
       HEADER E PULSANTE TORNA IN ALTO
    ========================================================== */

    let scrollTicking = false;

    function updateScrollUI() {
      header?.classList.toggle('scrolled', window.scrollY > 24);
      backToTop?.classList.toggle('visible', window.scrollY > 450);

      scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (scrollTicking) return;

      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }, { passive: true });

    updateScrollUI();

    backToTop?.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: scrollBehavior
      });
    });

    /* ==========================================================
       SEZIONE ATTIVA NEL MENU
    ========================================================== */

    const sections = $$('main section[id]');

    if (
      'IntersectionObserver' in window &&
      sections.length &&
      navLinks.length
    ) {
      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          navLinks.forEach(link => {
            const active =
              link.getAttribute('href') === `#${entry.target.id}`;

            link.classList.toggle('active', active);

            if (active) {
              link.setAttribute('aria-current', 'location');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      }, {
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
      });

      sections.forEach(section => sectionObserver.observe(section));
    }

    /* ==========================================================
       ANIMAZIONI ALLO SCORRIMENTO
    ========================================================== */

    const revealSelectors = [
      '.section-title',
      '.mission-card',
      '.timeline-item',
      '.event-card',
      '.survey-card',
      '.news-card',
      '.gallery-item',
      '.contact-card',
      '.person-card',
      '.participation-card',
      '.document-row',
      '.quick-card'
    ].join(',');

    const revealElements = $$(revealSelectors);

    if (
      !reduceMotion &&
      'IntersectionObserver' in window &&
      revealElements.length
    ) {
      revealElements.forEach(element => {
        element.classList.add('reveal');
      });

      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('show');
          revealObserver.unobserve(entry.target);
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
      });

      revealElements.forEach(element => {
        revealObserver.observe(element);
      });
    }

    /* ==========================================================
       FAQ A FISARMONICA
    ========================================================== */

    const faqItems = $$('.faq-item');

    faqItems.forEach((item, index) => {
      const question = $('.faq-question', item);
      const answer = $('.faq-answer', item);

      if (!question || !answer) return;

      if (!answer.id) {
        answer.id = `faq-answer-${index + 1}`;
      }

      question.type = 'button';
      question.setAttribute('aria-controls', answer.id);

      const setAnswerState = shouldOpen => {
        item.classList.toggle('active', shouldOpen);

        question.setAttribute(
          'aria-expanded',
          String(shouldOpen)
        );

        answer.style.maxHeight = shouldOpen
          ? `${answer.scrollHeight}px`
          : '0px';
      };

      setAnswerState(item.classList.contains('active'));

      question.addEventListener('click', () => {
        const shouldOpen = !item.classList.contains('active');

        faqItems.forEach(other => {
          const otherQuestion = $('.faq-question', other);
          const otherAnswer = $('.faq-answer', other);

          other.classList.remove('active');

          otherQuestion?.setAttribute('aria-expanded', 'false');

          if (otherAnswer) {
            otherAnswer.style.maxHeight = '0px';
          }
        });

        setAnswerState(shouldOpen);
      });
    });

    window.addEventListener('resize', () => {
      $$('.faq-item.active .faq-answer').forEach(answer => {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      });
    }, { passive: true });

    /* ==========================================================
       LIGHTBOX GALLERIA
    ========================================================== */

    const lightbox = $('#lightbox');
    const lightboxImage = $('#lightbox-image');
    const lightboxClose = $('.lightbox-close');

    let previousFocus = null;

    function lightboxIsOpen() {
      return Boolean(
        lightbox?.classList.contains('active')
      );
    }

    function closeLightbox() {
      if (!lightbox || !lightboxImage) return;

      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');

      lightboxImage.removeAttribute('src');
      document.body.style.overflow = '';

      previousFocus?.focus?.();
    }

    function openLightbox(image) {
      if (!lightbox || !lightboxImage) return;

      previousFocus = document.activeElement;

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || 'Immagine ingrandita';

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');

      document.body.style.overflow = 'hidden';
      lightboxClose?.focus();
    }

    $$('.gallery-item').forEach(item => {
      const image = item.matches('img')
        ? item
        : $('img', item);

      if (!image) return;

      if (!item.matches('button, a')) {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
      }

      item.setAttribute(
        'aria-label',
        image.alt
          ? `Ingrandisci: ${image.alt}`
          : 'Ingrandisci immagine'
      );

      item.addEventListener('click', event => {
        if (item.matches('a')) {
          event.preventDefault();
        }

        openLightbox(image);
      });

      item.addEventListener('keydown', event => {
        if (
          (event.key === 'Enter' || event.key === ' ') &&
          !item.matches('button, a')
        ) {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    lightboxClose?.addEventListener('click', closeLightbox);

    lightbox?.addEventListener('click', event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeMenu();

        if (lightboxIsOpen()) {
          closeLightbox();
        }
      }
    });

    /* ==========================================================
       PRIVACY E PREFERENZE COOKIE
    ========================================================== */

    const CONSENT_KEY =
      'consulta_giovanile_cookie_preferences_v1';

    const cookieBanner = $('#cookieBanner');
    const acceptCookies = $('#acceptCookies');
    const rejectCookies = $('#rejectCookies');
    const preferencesButton = $('#preferencesCookies');
    const preferencesPanel = $('#cookiePreferences');
    const analyticsCheckbox = $('#analyticsConsent');
    const savePreferences = $('#saveCookiePreferences');

    let savedConsent = null;

    try {
      savedConsent = JSON.parse(
        window.localStorage.getItem(CONSENT_KEY) || 'null'
      );
    } catch {
      savedConsent = null;
    }

    function hideCookieBanner() {
      if (!cookieBanner) return;

      cookieBanner.classList.remove('active');
      cookieBanner.hidden = true;
    }

    function showCookieBanner() {
      if (!cookieBanner) return;

      cookieBanner.hidden = false;
      cookieBanner.classList.add('active');
    }

    function setPreferencesPanel(open) {
      if (preferencesPanel) {
        preferencesPanel.hidden = !open;
      }

      preferencesButton?.setAttribute(
        'aria-expanded',
        String(open)
      );
    }

    function storeConsent(allowAnalytics) {
      const consent = {
        necessary: true,
        analytics: Boolean(allowAnalytics),
        updatedAt: new Date().toISOString()
      };

      try {
        window.localStorage.setItem(
          CONSENT_KEY,
          JSON.stringify(consent)
        );
      } catch {
        // Il sito continua a funzionare anche senza localStorage.
      }

      savedConsent = consent;

      hideCookieBanner();
      setPreferencesPanel(false);

      // Questo script non carica strumenti di tracciamento.
      // Gli eventuali servizi esterni vanno configurati separatamente.
    }

    if (analyticsCheckbox) {
      analyticsCheckbox.checked = Boolean(savedConsent?.analytics);
    }

    if (cookieBanner && !savedConsent) {
      window.setTimeout(showCookieBanner, 500);
    }

    acceptCookies?.addEventListener('click', () => {
      if (analyticsCheckbox) {
        analyticsCheckbox.checked = true;
      }

      storeConsent(true);
    });

    rejectCookies?.addEventListener('click', () => {
      if (analyticsCheckbox) {
        analyticsCheckbox.checked = false;
      }

      storeConsent(false);
    });

    preferencesButton?.addEventListener('click', () => {
      const opening =
        !preferencesPanel || preferencesPanel.hidden;

      setPreferencesPanel(opening);

      if (analyticsCheckbox) {
        analyticsCheckbox.checked =
          Boolean(savedConsent?.analytics);
      }
    });

    savePreferences?.addEventListener('click', () => {
      storeConsent(Boolean(analyticsCheckbox?.checked));
    });

    $$('[data-open-cookie-settings]').forEach(button => {
      button.addEventListener('click', () => {
        showCookieBanner();
        setPreferencesPanel(true);

        if (analyticsCheckbox) {
          analyticsCheckbox.checked =
            Boolean(savedConsent?.analytics);
        }
      });
    });

    /* ==========================================================
       ANNO AUTOMATICO NEL FOOTER
    ========================================================== */

    const yearElement = $('#currentYear');

    if (yearElement) {
      yearElement.textContent = String(
        new Date().getFullYear()
      );
    }

    /* ==========================================================
       OTTIMIZZAZIONE IMMAGINI
    ========================================================== */

    $$('img').forEach(image => {
      if (
        !image.hasAttribute('loading') &&
        !image.closest('.hero')
      ) {
        image.loading = 'lazy';
      }

      if (!image.hasAttribute('decoding')) {
        image.decoding = 'async';
      }
    });

    /* ==========================================================
       LINK ESTERNI E COLLEGAMENTI SEGNA POSTO
    ========================================================== */

    $$('a[target="_blank"]').forEach(link => {
      const relValues = new Set(
        (link.getAttribute('rel') || '')
          .split(/\s+/)
          .filter(Boolean)
      );

      relValues.add('noopener');
      relValues.add('noreferrer');

      link.setAttribute(
        'rel',
        Array.from(relValues).join(' ')
      );
    });

    $$('a[href="#"]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();

        if (link.hasAttribute('data-placeholder-notice')) {
          const label = (
            link.innerText ||
            link.getAttribute('aria-label') ||
            'Collegamento'
          ).trim();

          window.alert(
            `${label}: questo collegamento deve essere configurato prima della pubblicazione.`
          );
        }
      });
    });

    // Verifica che i PDF collegati siano presenti in:
    // assets/documenti/
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
      once: true
    });
  } else {
    init();
  }
})();
