// Elk Rapids Film Festival - Animations & Interactions

(function () {
  'use strict';

  // --- Password Gate ---
  var PASSCODE = 'filmfest2026';
  var SESSION_KEY = 'erff_authenticated';

  function initLoginGate() {
    var gate = document.getElementById('login-gate');
    var content = document.getElementById('site-content');
    var form = document.getElementById('login-form');
    var input = document.getElementById('login-password');
    var error = document.getElementById('login-error');

    if (!gate || !content || !form) return;

    // Check if already authenticated this session
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      unlockSite(gate, content, false);
      return;
    }

    // Focus the password input
    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();

      if (value === PASSCODE) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        unlockSite(gate, content, true);
      } else {
        error.hidden = false;
        // Re-trigger shake animation
        error.style.animation = 'none';
        error.offsetHeight; // force reflow
        error.style.animation = '';
        input.value = '';
        input.focus();
      }
    });
  }

  function unlockSite(gate, content, animate) {
    content.classList.remove('site-content--locked');
    if (animate) {
      gate.classList.add('login-gate--hidden');
    } else {
      gate.style.display = 'none';
    }
  }

  // Scroll-triggered fade-in for timeline items
  function initScrollAnimations() {
    var items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  // Smooth scroll for nav links
  function initSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // Parallax effect on hero
  function initHeroParallax() {
    var hero = document.querySelector('.hero-content');
    if (!hero) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrolled = window.pageYOffset;
          if (scrolled < window.innerHeight) {
            hero.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
            hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.6;
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Stagger timeline items for a cascading effect
  function staggerTimeline() {
    var items = document.querySelectorAll('.timeline-item');
    items.forEach(function (item, i) {
      item.style.transitionDelay = (i * 0.05) + 's';
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    initLoginGate();
    staggerTimeline();
    initScrollAnimations();
    initSmoothScroll();
    initHeroParallax();
  });
})();
