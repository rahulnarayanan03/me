(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navLinksContainer = document.querySelector('[data-nav-links]');
  const header = document.querySelector('.site-header');
  const navPill = document.querySelector('.nav-pill');
  const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
  let lockedSectionId = null;
  const copyButton = document.querySelector('[data-copy-email]');
  const yearTarget = document.querySelector('[data-current-year]');
  const themeColour = document.querySelector('meta[name="theme-color"]');

  // Treat a real phone as a phone even when the browser requests a wide
  // "desktop site" viewport. This mirrors the responsive strategy used on the
  // RNSH product site and avoids falling back to the hamburger menu on phones.
  const uaDataMobile = navigator.userAgentData?.mobile === true;
  const mobileUA = /Android|iPhone|iPod|Windows Phone|Mobile/i.test(navigator.userAgent || '');
  const hasTouch = (navigator.maxTouchPoints || 0) > 0;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches === true;
  const screenShortSide = Math.min(
    Number(window.screen?.width) || window.innerWidth,
    Number(window.screen?.height) || window.innerHeight
  );
  const isPhoneDevice = uaDataMobile || mobileUA || (hasTouch && coarsePointer && screenShortSide <= 900);
  root.classList.toggle('phone-device', isPhoneDevice);

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
    link.addEventListener('click', (event) => {
      setMenuOpen(false);
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        lockedSectionId = href.slice(1);
        navLinks.forEach((navLink) => {
          const isActive = navLink.getAttribute('href') === href;
          navLink.classList.toggle('active', isActive);
          if (isActive) navLink.setAttribute('aria-current', 'true');
          else navLink.removeAttribute('aria-current');
        });
        requestAnimationFrame(positionNavPill);

        // On desktop, keep the deliberate end-of-page Contact landing used to
        // separate Contact from Documents. On a real phone, use the normal
        // anchor position instead so the Contact heading lands directly below
        // the two-row glass navigation like every other section.
        if (href === '#contact' && !isPhoneDevice) {
          event.preventDefault();
          history.replaceState(null, '', '#contact');
          window.scrollTo({
            top: document.documentElement.scrollHeight - window.innerHeight,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Keep the section explicitly chosen from the navigation highlighted during
  // the browser's smooth anchor scroll. Release that lock as soon as the user
  // deliberately scrolls again, so normal scroll-spy behaviour resumes.
  const releaseNavigationLock = () => {
    if (!lockedSectionId) return;
    lockedSectionId = null;
    updateActiveNavigation();
  };

  window.addEventListener('wheel', releaseNavigationLock, { passive: true });
  window.addEventListener('touchstart', releaseNavigationLock, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
      releaseNavigationLock();
    }
  });

  const positionNavPill = () => {
    if (!navPill || !navLinksContainer) return;

    const navStyle = window.getComputedStyle(navLinksContainer);
    const pillStyle = window.getComputedStyle(navPill);
    if (navStyle.display === 'none' || pillStyle.display === 'none') {
      navPill.style.opacity = '0';
      return;
    }

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
    let activeSection = lockedSectionId
      ? document.getElementById(lockedSectionId)
      : null;

    if (!activeSection) {
      homepageSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= headerOffset) {
          activeSection = section;
        }
      });

      // Start the Documents navigation state at the Availability block at the
      // end of the resume. This gives Documents a meaningful scroll range before
      // its cards appear and makes the transition back from Contact unambiguous.
      const distanceFromBottom = Math.max(
        0,
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight)
      );
      const contactSection = document.getElementById('contact');
      const documentsSection = document.getElementById('documents');
      const documentsTrigger = document.getElementById('documents-activation-point');
      const contactActivationZone = 32;

      if (documentsSection && documentsTrigger && documentsTrigger.getBoundingClientRect().top <= headerOffset) {
        activeSection = documentsSection;
      }

      // On phones, Contact should remain active for the entire Contact section,
      // not only at the absolute bottom of the page. Once the Contact section's
      // top edge passes the same navigation marker used by every other section,
      // keep Contact highlighted until the user scrolls back above that point.
      // Desktop keeps the small bottom-of-page Contact zone used by the wider layout.
      if (contactSection) {
        if (isPhoneDevice) {
          if (contactSection.getBoundingClientRect().top <= headerOffset) {
            activeSection = contactSection;
          }
        } else if (distanceFromBottom <= contactActivationZone) {
          activeSection = contactSection;
        }
      }
    }

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
    if (isPhoneDevice || window.innerWidth > 900) setMenuOpen(false);
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

  // Prefer the native LinkedIn app on phones. Android receives an explicit
  // app intent with a normal HTTPS fallback; iOS uses LinkedIn's HTTPS
  // universal link in the same tab so the OS can hand it to the app.
  document.querySelectorAll('a[href*="linkedin.com/in/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isPhoneDevice || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const webUrl = link.href;
      event.preventDefault();

      if (/Android/i.test(navigator.userAgent || '')) {
        const url = new URL(webUrl);
        const intentPath = `${url.host}${url.pathname}${url.search}${url.hash}`;
        const fallback = encodeURIComponent(webUrl);
        window.location.href = `intent://${intentPath}#Intent;scheme=https;package=com.linkedin.android;S.browser_fallback_url=${fallback};end`;
        return;
      }

      // On iPhone/iPad, same-tab HTTPS navigation gives Universal Links the
      // best chance to open LinkedIn directly when the user has the app.
      link.removeAttribute('target');
      window.location.href = webUrl;
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
