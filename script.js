/**
 * CONSULTA GIOVANILE DI CASTRONUOVO DI SANT'ANDREA
 * JavaScript principale del sito (Versione Corretta)
 */

(() => {
  "use strict";

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const header = $(".header");
  const menu = $("#nav-menu") || $(".nav-menu");
  const hamburger = $("#hamburger") || $(".hamburger");
  const backToTop = $("#backToTop");
  const loader = $("#site-loader");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ========================================
     1. ANNO AUTOMATICO NEL FOOTER
  ======================================== */

  const year = $("#currentYear");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ========================================
     2. LOADER INIZIALE E REVEAL HERO (HOME)
  ======================================== */

  const revealHero = () => {
    const hero = $("#hero") || $(".hero") || $("#home");
    if (hero) {
      hero.classList.add("hero-is-visible");
    }
  };

  if (loader) {
    document.documentElement.classList.add("cg-loading");
    let loaderClosed = false;

    const hideLoader = () => {
      if (loaderClosed) return;
      loaderClosed = true;

      loader.classList.add("is-hidden");
      loader.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("cg-loading");

      window.setTimeout(() => {
        loader.remove();
        document.documentElement.classList.add("cg-ready");
        revealHero(); // FIX: Rende visibile l'elemento #hero/home corretto
      }, reduceMotion ? 0 : 400);
    };

    if (document.readyState === "complete") {
      window.setTimeout(hideLoader, reduceMotion ? 0 : 350);
    } else {
      window.addEventListener("load", () => {
        window.setTimeout(hideLoader, reduceMotion ? 0 : 450);
      }, { once: true });
    }

    // Evita che il loader rimanga bloccato in caso di risorse lente.
    window.setTimeout(hideLoader, 2500);
  } else {
    document.documentElement.classList.add("cg-ready");
    revealHero();
  }

  /* ========================================
     3. NAVBAR DINAMICA ALLO SCROLL
  ======================================== */

  let scrollScheduled = false;

  function updateScroll() {
    const scrollY = window.scrollY;

    if (header) {
      header.classList.toggle("scrolled", scrollY > 35);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollY > 450);
    }

    scrollScheduled = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        window.requestAnimationFrame(updateScroll);
        scrollScheduled = true;
      }
    },
    { passive: true }
  );

  updateScroll();

  /* ========================================
     4. MENU MOBILE
  ======================================== */

  function openMenu() {
    if (!menu || !hamburger) return;

    menu.classList.add("active", "is-open");
    hamburger.classList.add("active", "is-open");

    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Chiudi menu");

    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    if (!menu || !hamburger) return;

    menu.classList.remove("active", "is-open");
    hamburger.classList.remove("active", "is-open");

    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Apri menu");

    document.body.classList.remove("menu-open");
  }

  if (hamburger && menu) {
    hamburger.setAttribute("aria-expanded", "false");

    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Chiude il menu quando si seleziona una voce.
    $$('a[href^="#"]', menu).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Chiude il menu cliccando fuori.
    document.addEventListener("click", (event) => {
      if (
        hamburger.getAttribute("aria-expanded") === "true" &&
        !menu.contains(event.target) &&
        !hamburger.contains(event.target)
      ) {
        closeMenu();
      }
    });

    // Tasto ESC.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    // Chiude il menu passando alla visualizzazione desktop.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  /* ========================================
     5. SCORRIMENTO MORBIDO
  ======================================== */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      const headerHeight = header
        ? header.getBoundingClientRect().height
        : 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: reduceMotion ? "auto" : "smooth"
      });

      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }
    });
  });

  /* ========================================
     6. PULSANTE TORNA IN ALTO
  ======================================== */

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }

  /* ========================================
     7. EVIDENZIAZIONE SEZIONE NEL MENU
  ======================================== */

  const navLinks = $$("#nav-menu a[href^='#'], .nav-menu a[href^='#']");

  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");

      return href && href.length > 1
        ? document.querySelector(href)
        : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const currentId = `#${entry.target.id}`;

          navLinks.forEach((link) => {
            if (link.getAttribute("href") === currentId) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* ========================================
     8. ANIMAZIONI DELLE SEZIONI
  ======================================== */

  const revealElements = $$(
    [
      ".section-title",
      ".section-heading",
      ".point-card",
      ".organigramma-card",
      ".mission-panel",
      ".mission-card",
      ".activity-card",
      ".empty-state",
      ".news-card",
      ".news-placeholder",
      ".external-card",
      ".faq-item",
      ".contact-email",
      ".contact-card",
      ".quick-strip-inner > a"
    ].join(",")
  );

  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("cg-script-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element, index) => {
      element.classList.add("cg-reveal");

      element.style.setProperty(
        "--cg-reveal-delay",
        `${(index % 4) * 70}ms`
      );

      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-revealed");
    });
  }

  /* ========================================
     9. FAQ A FISARMONICA
  ======================================== */

  const faqItems = $$(".faq-item");

  function setFaqState(item, shouldOpen) {
    const button = $(".faq-question", item);
    const answer = $(".faq-answer", item);

    if (!button || !answer) return;

    const icon = $("i", button);

    item.classList.toggle("active", shouldOpen);

    button.setAttribute("aria-expanded", String(shouldOpen));

    answer.style.maxHeight = shouldOpen
      ? `${answer.scrollHeight}px`
      : "0px";

    answer.style.opacity = shouldOpen ? "1" : "0";

    if (icon) {
      icon.classList.toggle("fa-plus", !shouldOpen);
      icon.classList.toggle("fa-minus", shouldOpen);
    }
  }

  faqItems.forEach((item) => {
    const button = $(".faq-question", item);
    const answer = $(".faq-answer", item);

    if (!button || !answer) return;

    const initiallyOpen =
      item.classList.contains("active") ||
      button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(initiallyOpen));

    answer.style.maxHeight = initiallyOpen
      ? `${answer.scrollHeight}px`
      : "0px";

    answer.style.opacity = initiallyOpen ? "1" : "0";

    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";

      faqItems.forEach((otherItem) => {
        setFaqState(
          otherItem,
          otherItem === item && willOpen
        );
      });
    });
  });

  window.addEventListener("resize", () => {
    faqItems.forEach((item) => {
      const button = $(".faq-question", item);
      const answer = $(".faq-answer", item);

      if (
        button &&
        answer &&
        button.getAttribute("aria-expanded") === "true"
      ) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });

  /* ========================================
     10. LIGHTBOX GALLERIA (Se presente)
  ======================================== */

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightbox-image");
  const lightboxClose = $(".lightbox-close");

  const closeLightbox = () => {
    if (!lightbox) return;

    lightbox.classList.remove("active", "is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    if (lightboxImage) {
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
    }
  };

  if (lightbox && lightboxImage) {
    lightbox.setAttribute("aria-hidden", "true");

    $$(".gallery-item img, .gallery-image img").forEach((image) => {
      image.style.cursor = "zoom-in";

      image.addEventListener("click", () => {
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || "Immagine della galleria";
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
      });
    });

    lightboxClose?.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  /* ========================================
     11. LINK ESTERNI PLACEHOLDER
  ======================================== */

  const placeholderMessages = {
    INSERISCI_LINK_GOOGLE_FORMS:
      "Il collegamento ai sondaggi Google Forms non è ancora stato inserito.",

    INSERISCI_LINK_PAGINA_COMUNE:
      "Il collegamento alla pagina del Comune non è ancora stato inserito.",

    INSERISCI_LINK_GOOGLE_DRIVE:
      "Il collegamento alla galleria Google Drive non è ancora stato inserito."
  };

  $$('a[href^="INSERISCI_LINK_"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const href = link.getAttribute("href");

      window.alert(
        placeholderMessages[href] ||
          "Questo collegamento deve essere configurato prima della pubblicazione."
      );
    });
  });

  /* ========================================
     12. OTTIMIZZAZIONE IMMAGINI
  ======================================== */

  $$("img").forEach((img) => {
    if (
      !img.hasAttribute("fetchpriority") &&
      !img.hasAttribute("loading") &&
      !img.closest("#hero")
    ) {
      img.setAttribute("loading", "lazy");
    }

    if (!img.hasAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }
  });

  /* ========================================
     13. APERTURA DIRETTA DA ANCORA URL
  ======================================== */

  if (window.location.hash) {
    window.addEventListener(
      "load",
      () => {
        const target = document.querySelector(window.location.hash);

        if (!target) return;

        const headerHeight = header
          ? header.getBoundingClientRect().height
          : 0;

        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "auto"
        });
      },
      { once: true }
    );
  }
})();
