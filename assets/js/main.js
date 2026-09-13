(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navLinksContainer = document.querySelector('[data-nav-links]');
  const header = document.querySelector('.site-header');
  const navPill = document.querySelector('.nav-pill');
  const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const copyButton = document.querySelector('[data-copy-email]');
  const yearTarget = document.querySelector('[data-current-year]');
  const themeColour = document.querySelector('meta[name="theme-color"]');

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem('rn-theme');
  } catch {
    storedTheme = null;
  }

  root.dataset.theme = storedTheme || root.dataset.theme || 'dark';

  const updateThemeControl = () => {
    if (!themeButton) return;

    const isDark = root.dataset.theme === 'dark';
    const icon = themeButton.querySelector('.theme-icon');
    const label = themeButton.querySelector('.theme-label');

    if (icon) icon.textContent = isDark ? '☀' : '☾';
    if (label) label.textContent = isDark ? 'Light' : 'Dark';

    themeButton.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );

    if (themeColour) {
      themeColour.setAttribute('content', isDark ? '#07111f' : '#f5f8fc');
    }
  };

  updateThemeControl();

  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';

    try {
      localStorage.setItem('rn-theme', root.dataset.theme);
    } catch {
      // The theme still applies for the current page when storage is blocked.
    }

    updateThemeControl();
  });

  const setMenuOpen = (open) => {
    if (!menuButton || !navLinksContainer) return;
    navLinksContainer.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => {
    setMenuOpen(!navLinksContainer?.classList.contains('open'));
  });

  document.addEventListener('click', (event) => {
    if (!navLinksContainer?.classList.contains('open')) return;
    if (header?.contains(event.target)) return;
    setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  navLinksContainer?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  const positionNavPill = () => {
    if (!navPill || window.innerWidth <= 900) return;

    const activeLink = navLinks.find((link) => link.classList.contains('active'));
    if (!activeLink || window.scrollY < 80) {
      navPill.style.opacity = '0';
      return;
    }

    const navRect = navLinksContainer.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    navPill.style.width = `${linkRect.width}px`;
    navPill.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
    navPill.style.opacity = '1';
  };

  const homepageSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const updateActiveNavigation = () => {
    if (!homepageSections.length) return;

    const headerOffset = (header?.getBoundingClientRect().bottom || 70) + 28;
    let activeSection = null;

    homepageSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= headerOffset) {
        activeSection = section;
      }
    });

    // The final section cannot always physically reach the activation line
    // because there is no content below it. Treat the bottom of the page as
    // being inside the final navigation section so Contact highlights reliably.
    const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atPageBottom) activeSection = homepageSections[homepageSections.length - 1];

    navLinks.forEach((link) => {
      const isActive = activeSection && link.getAttribute('href') === `#${activeSection.id}`;
      link.classList.toggle('active', Boolean(isActive));
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    positionNavPill();
  };

  const sidebarLinks = [...document.querySelectorAll('.case-sidebar a[href^="#"]')];
  const caseSections = sidebarLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const updateCaseNavigation = () => {
    if (!caseSections.length) return;

    const marker = (header?.getBoundingClientRect().bottom || 70) + 120;
    let active = caseSections[0];

    caseSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) active = section;
    });

    sidebarLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${active.id}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const updateOnScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 12);
    updateActiveNavigation();
    updateCaseNavigation();
  };

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenuOpen(false);
    updateActiveNavigation();
    updateCaseNavigation();
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealObserver = !reducedMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -7% 0px'
      })
    : null;

  document.querySelectorAll('.reveal').forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add('visible');
  });

  document.querySelectorAll('.project-card').forEach((card) => {
    const link = card.querySelector('.card-link');
    if (!link) return;

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', `${card.querySelector('h3')?.textContent || 'Project'} case study`);

    const openCard = () => {
      window.location.href = link.href;
    };

    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      openCard();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCard();
      }
    });
  });

  copyButton?.addEventListener('click', async () => {
    const email = copyButton.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(email);
      const original = copyButton.textContent;
      copyButton.textContent = 'Email copied';
      setTimeout(() => { copyButton.textContent = original; }, 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  if (yearTarget) yearTarget.textContent = new Date().getFullYear();

  updateOnScroll();
})();
