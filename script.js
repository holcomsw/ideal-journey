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

  // --- Rotating Quotes (Homepage) ---
  var QUOTES = [
    { text: 'Who knew watching Jaws on the lake could be so terrifyingly perfect?', attr: 'Elk Rapids Film Festival, 2018' },
    { text: 'This is what summer is all about.', attr: 'Elk Rapids Film Festival' },
    { text: 'I can\'t believe they let us rent an entire theater for this.', attr: 'Elk Rapids Film Festival' },
    { text: 'The yacht rock screening was peak cinema. Fight me.', attr: 'Elk Rapids Film Festival, 2022' },
    { text: 'Sixteen years later and the wives still roll their eyes. But they never miss a screening.', attr: 'Elk Rapids Film Festival' },
    { text: 'There\'s no better place to watch a movie than on a lake in Michigan.', attr: 'Elk Rapids Film Festival' }
  ];

  function initRotatingQuotes() {
    var quoteEl = document.getElementById('rotating-quote');
    if (!quoteEl) return;

    var attrEl = quoteEl.nextElementSibling;
    var index = Math.floor(Math.random() * QUOTES.length);

    // Set initial random quote
    quoteEl.querySelector('p').textContent = QUOTES[index].text;
    if (attrEl) attrEl.innerHTML = '&mdash; ' + QUOTES[index].attr;

    // Rotate every 8 seconds
    setInterval(function () {
      index = (index + 1) % QUOTES.length;
      quoteEl.style.opacity = '0';
      setTimeout(function () {
        quoteEl.querySelector('p').textContent = QUOTES[index].text;
        if (attrEl) attrEl.innerHTML = '&mdash; ' + QUOTES[index].attr;
        quoteEl.style.opacity = '1';
      }, 500);
    }, 8000);
  }

  // --- Voting System ---
  var VOTES_KEY = 'erff_votes';
  var SUGGESTIONS_KEY = 'erff_suggestions';
  var VOTING_DEADLINE = new Date('2026-06-30T23:59:59');

  function getVotes() {
    try { return JSON.parse(localStorage.getItem(VOTES_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveVote(vote) {
    var votes = getVotes();
    votes.push(vote);
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  }

  function getSuggestions() {
    try { return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveSuggestion(suggestion) {
    var suggestions = getSuggestions();
    suggestions.push(suggestion);
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  }

  function isVotingOpen() {
    return new Date() <= VOTING_DEADLINE;
  }

  function initVotingCountdown() {
    var el = document.getElementById('vote-countdown');
    if (!el) return;

    function update() {
      var now = new Date();
      var diff = VOTING_DEADLINE - now;

      if (diff <= 0) {
        el.innerHTML = '<p style="color: var(--color-gold-light); font-weight: 600;">Voting has closed!</p>';
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((diff % (1000 * 60)) / 1000);

      el.innerHTML =
        '<div class="countdown-unit"><span class="countdown-number">' + days + '</span><span class="countdown-label">Days</span></div>' +
        '<div class="countdown-unit"><span class="countdown-number">' + hours + '</span><span class="countdown-label">Hours</span></div>' +
        '<div class="countdown-unit"><span class="countdown-number">' + minutes + '</span><span class="countdown-label">Min</span></div>' +
        '<div class="countdown-unit"><span class="countdown-number">' + seconds + '</span><span class="countdown-label">Sec</span></div>';
    }

    update();
    setInterval(update, 1000);
  }

  function initVotingSystem() {
    var voteOpen = document.getElementById('vote-open');
    var voteClosed = document.getElementById('vote-closed');
    if (!voteOpen) return;

    initVotingCountdown();

    if (!isVotingOpen()) {
      voteOpen.hidden = true;
      voteClosed.hidden = false;
      renderResults();
      return;
    }

    // Vote buttons
    document.querySelectorAll('.btn--vote').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filmId = this.getAttribute('data-film-id');
        var card = this.closest('.nominee-card');
        var filmName = card.querySelector('.nominee-title').textContent;
        openVoteModal(filmId, filmName);
      });
    });

    // Vote form submission
    var voteForm = document.getElementById('vote-form');
    if (voteForm) {
      voteForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var filmId = document.getElementById('vote-film-id').value;
        var name = document.getElementById('vote-name').value.trim();
        var comment = document.getElementById('vote-comment').value.trim();
        var card = document.querySelector('.nominee-card[data-film-id="' + filmId + '"]');
        var filmName = card ? card.querySelector('.nominee-title').textContent : '';

        saveVote({
          filmId: filmId,
          filmName: filmName,
          voterName: name,
          comment: comment,
          timestamp: new Date().toISOString()
        });

        closeModal('vote-modal');
        showConfirmation(name, filmName);
      });
    }

    // Modal close handlers
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function () {
        var modal = this.closest('.modal');
        if (modal) modal.hidden = true;
      });
    });

    document.querySelectorAll('.modal-close').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var modal = this.closest('.modal');
        if (modal) modal.hidden = true;
      });
    });

    var confirmClose = document.getElementById('confirmation-close');
    if (confirmClose) {
      confirmClose.addEventListener('click', function () {
        closeModal('vote-confirmation');
      });
    }

    // Write-in form
    var writeinForm = document.getElementById('writein-form');
    if (writeinForm) {
      writeinForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var title = document.getElementById('writein-title').value.trim();
        var year = document.getElementById('writein-year').value.trim();
        var reason = document.getElementById('writein-reason').value.trim();
        var name = document.getElementById('writein-name').value.trim();

        saveSuggestion({
          title: title,
          year: year,
          reason: reason,
          suggestedBy: name,
          timestamp: new Date().toISOString()
        });

        writeinForm.reset();
        var success = document.getElementById('writein-success');
        if (success) {
          success.hidden = false;
          setTimeout(function () { success.hidden = true; }, 3000);
        }

        renderSuggestions();
      });
    }

    renderSuggestions();
  }

  function openVoteModal(filmId, filmName) {
    var modal = document.getElementById('vote-modal');
    document.getElementById('vote-film-id').value = filmId;
    document.getElementById('modal-film-name').textContent = filmName;
    document.getElementById('vote-name').value = '';
    document.getElementById('vote-comment').value = '';
    modal.hidden = false;
    document.getElementById('vote-name').focus();
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.hidden = true;
  }

  function showConfirmation(name, filmName) {
    document.getElementById('confirmation-name').textContent = name;
    document.getElementById('confirmation-film').textContent = filmName;
    document.getElementById('vote-confirmation').hidden = false;
  }

  function renderSuggestions() {
    var suggestions = getSuggestions();
    var container = document.getElementById('suggestions-container');
    var list = document.getElementById('suggestions-list');
    if (!container || !list || !suggestions.length) return;

    list.hidden = false;
    container.innerHTML = suggestions.map(function (s) {
      return '<div class="suggestion-item">' +
        '<h4>' + escapeHtml(s.title) + (s.year ? ' (' + escapeHtml(s.year) + ')' : '') + '</h4>' +
        '<p>' + escapeHtml(s.reason) + '</p>' +
        '<p class="suggestion-by">Suggested by ' + escapeHtml(s.suggestedBy) + '</p>' +
        '</div>';
    }).join('');
  }

  function renderResults() {
    var votes = getVotes();
    var container = document.getElementById('results-container');
    if (!container) return;

    // Tally votes by film
    var tally = {};
    votes.forEach(function (v) {
      var key = v.filmName || ('Film ' + v.filmId);
      tally[key] = (tally[key] || 0) + 1;
    });

    // Sort by vote count
    var sorted = Object.keys(tally).sort(function (a, b) {
      return tally[b] - tally[a];
    });

    if (!sorted.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--color-text-light);">No votes were cast this year.</p>';
      return;
    }

    var maxVotes = tally[sorted[0]];

    container.innerHTML = sorted.map(function (name) {
      var count = tally[name];
      var pct = Math.round((count / maxVotes) * 100);
      return '<div class="result-bar">' +
        '<span class="result-name">' + escapeHtml(name) + '</span>' +
        '<div class="result-track"><div class="result-fill" style="width: ' + pct + '%"></div></div>' +
        '<span class="result-count">' + count + '</span>' +
        '</div>';
    }).join('');
  }

  // --- Archive Filters ---
  function initArchiveFilters() {
    var yearSelect = document.getElementById('archive-year-select');
    var searchInput = document.getElementById('archive-search');
    var winnersToggle = document.getElementById('winners-only');
    var noResults = document.getElementById('archive-no-results');
    if (!yearSelect || !searchInput) return;

    function applyFilters() {
      var year = yearSelect.value;
      var query = searchInput.value.trim().toLowerCase();
      var winnersOnly = winnersToggle && winnersToggle.checked;
      var yearBlocks = document.querySelectorAll('.archive-year-block');
      var anyVisible = false;

      yearBlocks.forEach(function (block) {
        var blockYear = block.getAttribute('data-year');
        var yearMatch = (year === 'all' || blockYear === year);

        if (!yearMatch) {
          block.classList.add('hidden');
          return;
        }

        var films = block.querySelectorAll('.archive-film');
        var anyFilmVisible = false;

        films.forEach(function (film) {
          var title = (film.querySelector('.archive-film-title') || {}).textContent || '';
          var note = (film.querySelector('.archive-film-note') || {}).textContent || '';
          var isWinner = film.getAttribute('data-winner') === 'true';
          var textMatch = !query || title.toLowerCase().indexOf(query) !== -1 || note.toLowerCase().indexOf(query) !== -1;
          var winnerMatch = !winnersOnly || isWinner;

          if (textMatch && winnerMatch) {
            film.classList.remove('hidden');
            anyFilmVisible = true;
          } else {
            film.classList.add('hidden');
          }
        });

        if (anyFilmVisible) {
          block.classList.remove('hidden');
          anyVisible = true;
        } else {
          block.classList.add('hidden');
        }
      });

      if (noResults) noResults.hidden = anyVisible;
    }

    yearSelect.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    if (winnersToggle) winnersToggle.addEventListener('change', applyFilters);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    initLoginGate();
    staggerTimeline();
    initScrollAnimations();
    initSmoothScroll();
    initHeroParallax();
    initRotatingQuotes();
    initVotingSystem();
    initArchiveFilters();
  });
})();
