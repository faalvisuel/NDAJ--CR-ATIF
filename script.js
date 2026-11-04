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
