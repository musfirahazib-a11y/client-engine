// Sticky nav — show once scrolled past the hero
const stickyNav = document.getElementById('stickyNav');
const hero = document.querySelector('.hero');

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    stickyNav.classList.toggle('show', !entry.isIntersecting);
  });
}, { threshold: 0.1 });
if (hero) heroObserver.observe(hero);

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));
