const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  });
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealItems = document.querySelectorAll('.intro-grid, .experience-grid, .edition-grid, .memory-strip, .photo-grid, .album-grid, .video-grid, .next-content');
  revealItems.forEach((item) => item.classList.add('reveal-in'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

// Mesure interne minimale : totaux quotidiens de pages/sections, sans cookie ni donnée de formulaire.
const statsEndpoint = (window.NDAJE_SIGNUP_CONFIG || {}).webAppUrl || '';
const isStatsEndpoint = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec\/?$/.test(statsEndpoint);
const activeTabId = (window.crypto && crypto.randomUUID)
  ? crypto.randomUUID()
  : String(Date.now()) + Math.random().toString(36).slice(2);

function sendSiteSignal(values) {
  if (!isStatsEndpoint) return;
  const payload = new URLSearchParams(values);
  try {
    if (navigator.sendBeacon) navigator.sendBeacon(statsEndpoint, payload);
    else fetch(statsEndpoint, { method: 'POST', body: payload, mode: 'no-cors', keepalive: true });
  } catch (_) {
    // Les statistiques ne doivent jamais bloquer l’utilisation du site.
  }
}

function currentSection() {
  const fragment = window.location.hash.replace(/^#/, '');
  if (fragment && document.getElementById(fragment)) return fragment.slice(0, 60);
  return window.location.pathname.split('/').pop() || 'accueil';
}

function recordSectionVisit(section) {
  sendSiteSignal({ action: 'visit', section: section || 'accueil' });
}

if (isStatsEndpoint) {
  recordSectionVisit(currentSection());
  const pingPresence = () => sendSiteSignal({ action: 'presence', visitor_id: activeTabId });
  pingPresence();
  window.setInterval(() => {
    if (document.visibilityState === 'visible') pingPresence();
  }, 30000);

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) recordSectionVisit(anchor.getAttribute('href').slice(1));
  });
}

const registrationForm = document.querySelector('#registration-form');
if (registrationForm) {
  registrationForm.addEventListener('submit', (event) => {
    const status = registrationForm.querySelector('.registration-status');
    const endpoint = (window.NDAJE_SIGNUP_CONFIG || {}).webAppUrl || '';
    const isAppsScriptUrl = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec\/?$/.test(endpoint);

    if (!isAppsScriptUrl) {
      event.preventDefault();
      status.textContent = 'La passerelle Google Sheets doit être déployée et configurée avant l’ouverture des pré-inscriptions.';
      return;
    }

    registrationForm.action = endpoint;
    registrationForm.method = 'post';
    registrationForm.enctype = 'application/x-www-form-urlencoded';
    registrationForm.target = '_blank';
    status.textContent = 'Une page de confirmation va s’ouvrir après l’envoi.';
  });
}
