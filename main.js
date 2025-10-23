// ----- Active nav underline on scroll -----

// Grab all nav links and their target sections
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

// Measure navbar height so we account for it when detecting the active section
const navEl = document.querySelector('.top-navbar');
const NAV_H = navEl ? navEl.offsetHeight : 0;

// Helper: set the "active" class on the matching link
function setActive(id) {
  navLinks.forEach(a => {
    const isMatch = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('active', isMatch);
  });
}

// Observe when sections cross into view (adjusted for the sticky navbar)
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  },
  {
    root: null,
    // When top of section is just under the navbar, consider it active.
    // Bottom margin helps avoid rapid switching.
    rootMargin: `-${NAV_H + 8}px 0px -55% 0px`,
    threshold: 0
  }
);

// Start observing each section
sections.forEach(sec => observer.observe(sec));

// Also set the correct active link if user loads with a hash
if (location.hash) {
  setActive(location.hash.slice(1));
}

// Optional: keep active state when users click a link (instant feedback)
navLinks.forEach(a => {
  a.addEventListener('click', () => {
    const id = a.getAttribute('href').slice(1);
    setActive(id);
  });
});

// ----- Projects Modals (multiple) -----
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.project-card[data-target]');

  function openModalByTarget(targetValue) {
    const selector = targetValue.startsWith('#') ? targetValue : `#${targetValue}`;
    const modal = document.querySelector(selector);
    if (!modal) return;

    // GET *ALL* close elements (X button + backdrop)
    const closeEls = modal.querySelectorAll('[data-close-modal], .modal-close');

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
      closeEls.forEach(el => el.removeEventListener('click', closeModal));
    }

    function onEsc(e) { if (e.key === 'Escape') closeModal(); }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const focusEl = modal.querySelector('.modal-close');
    if (focusEl) focusEl.focus();

    document.addEventListener('keydown', onEsc);
    closeEls.forEach(el => el.addEventListener('click', closeModal));
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-target');
      if (target) openModalByTarget(target);
    });
  });
});

// Mobile nav toggle
const nav = document.querySelector('.top-navbar');
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelectorAll('.nav-links a');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close menu after navigating
  links.forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Ensure "Home" goes to absolute top (no extra space above)
const homeLink = document.querySelector('.nav-links a[href="#home"]');
if (homeLink) {
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    history.pushState(null, '', '#home'); // keep URL hash consistent
  });
}

// Smooth-scroll for all in-page section links (including #home)
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Read --nav-h from CSS (fallback to 95 if missing)
  const cssNavH = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
  const navOffset = parseInt(cssNavH || '95', 10) || 95;

  // Select all <a> with a hash that points to an ID on this page
  const sectionLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
    .filter(a => a.getAttribute('href').length > 1); // exclude just "#"

  sectionLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return; // let browser handle if no target

      e.preventDefault();

      // Close the mobile nav if it's open
      const nav = document.querySelector('.top-navbar');
      const toggle = document.querySelector('.nav-toggle');
      if (nav && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }

      // Compute target position minus fixed header offset
      const rectTop = targetEl.getBoundingClientRect().top;
      const absoluteTop = window.pageYOffset + rectTop;
      const scrollTop = Math.max(absoluteTop - navOffset, 0);

      if (prefersReduced) {
        window.scrollTo(0, scrollTop);
      } else {
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }

      // Update the URL hash without extra jump
      history.pushState(null, '', `#${targetId}`);
    });
  });
})();
