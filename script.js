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
      // Start music on fresh login after the gate animation
      setTimeout(initMusicPlayer, 1200);
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
    { text: 'Even when I\'m far from the water, the lessons of Elk Lake continue to guide me, helping me navigate life. It is, and will always be, my (up) North Star.', attr: 'Katie' },
    { text: 'You\'re gonna need a bigger boat.', attr: 'Jaws' },
    { text: 'Did we just become best friends? / Yup!', attr: 'Step Brothers' },
    { text: 'I feel the need\u2026 the need for speed!', attr: 'Top Gun' },
    { text: 'The Dude abides.', attr: 'The Big Lebowski' },
    { text: '60% of the time, it works every time.', attr: 'Anchorman' },
    { text: 'If you ain\'t first, you\'re last.', attr: 'Talladega Nights' },
    { text: 'Blue, you\'re my boy!', attr: 'Old School' },
    { text: 'So you\'re telling me there\'s a chance!', attr: 'Dumb and Dumber' },
    { text: 'Talk to me, Goose.', attr: 'Top Gun: Maverick' },
    { text: 'You touched my heart.', attr: 'Barb and Star Go to Vista Del Mar' }
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

  // --- Supabase Client ---
  var SUPABASE_URL = 'https://mafzshadraujlyndvfwv.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZnpzaGFkcmF1amx5bmR2Znd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjk2OTksImV4cCI6MjA4NzY0NTY5OX0.S0YIkmbnGxyAxG46ZO250jFsMph8rElB4mkfhF-uyYA';
  var supabase = null;

  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  // --- Voting System ---
  var VOTES_KEY = 'erff_votes';
  var SUGGESTIONS_KEY = 'erff_suggestions';
  var VOTING_DEADLINE = new Date('2026-06-30T23:59:59');

  // Fetch votes from Supabase, fall back to localStorage
  function getVotes(callback) {
    if (supabase) {
      supabase.from('votes').select('*').order('created_at', { ascending: true })
        .then(function (result) {
          if (result.error) {
            console.warn('Supabase fetch error:', result.error.message);
            callback(getLocalVotes());
          } else {
            // Map Supabase rows to match existing format
            var votes = (result.data || []).map(function (row) {
              return {
                id: row.id,
                filmId: row.film_id,
                filmName: row.film_name,
                voterName: row.voter_name,
                comment: row.comment || '',
                timestamp: row.created_at
              };
            });
            callback(votes);
          }
        });
    } else {
      callback(getLocalVotes());
    }
  }

  function getLocalVotes() {
    try { return JSON.parse(localStorage.getItem(VOTES_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveVote(vote, callback) {
    // Always save to localStorage as backup
    var localVotes = getLocalVotes();
    localVotes.push(vote);
    localStorage.setItem(VOTES_KEY, JSON.stringify(localVotes));

    if (supabase) {
      supabase.from('votes').insert({
        film_id: vote.filmId,
        film_name: vote.filmName,
        voter_name: vote.voterName,
        comment: vote.comment || ''
      }).then(function (result) {
        if (result.error) {
          console.warn('Supabase insert error:', result.error.message);
        }
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
  }

  // Fetch suggestions from Supabase, fall back to localStorage
  function getSuggestions(callback) {
    if (supabase) {
      supabase.from('suggestions').select('*').order('created_at', { ascending: true })
        .then(function (result) {
          if (result.error) {
            console.warn('Supabase fetch error:', result.error.message);
            callback(getLocalSuggestions());
          } else {
            var suggestions = (result.data || []).map(function (row) {
              return {
                id: row.id,
                title: row.title,
                year: row.year || '',
                reason: row.reason || '',
                suggestedBy: row.suggested_by,
                timestamp: row.created_at
              };
            });
            callback(suggestions);
          }
        });
    } else {
      callback(getLocalSuggestions());
    }
  }

  function getLocalSuggestions() {
    try { return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveSuggestion(suggestion, callback) {
    // Always save to localStorage as backup
    var localSuggestions = getLocalSuggestions();
    localSuggestions.push(suggestion);
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(localSuggestions));

    if (supabase) {
      supabase.from('suggestions').insert({
        title: suggestion.title,
        year: suggestion.year || '',
        reason: suggestion.reason || '',
        suggested_by: suggestion.suggestedBy
      }).then(function (result) {
        if (result.error) {
          console.warn('Supabase insert error:', result.error.message);
        }
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
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
        }, function () {
          closeModal('vote-modal');
          showConfirmation(name, filmName);
        });
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
        }, function () {
          writeinForm.reset();
          var success = document.getElementById('writein-success');
          if (success) {
            success.hidden = false;
            setTimeout(function () { success.hidden = true; }, 3000);
          }
          renderSuggestions();
        });

        // Send email notification to festival admin
        var subject = encodeURIComponent('ERFF Film Suggestion: ' + title + (year ? ' (' + year + ')' : ''));
        var body = encodeURIComponent(
          'New film suggestion for the Elk Rapids Film Festival!\n\n' +
          'Film: ' + title + (year ? ' (' + year + ')' : '') + '\n' +
          'Why it fits the theme: ' + reason + '\n' +
          'Suggested by: ' + name + '\n' +
          'Date: ' + new Date().toLocaleString()
        );
        var mailLink = document.createElement('a');
        mailLink.href = 'mailto:holcomsw@me.com?subject=' + subject + '&body=' + body;
        mailLink.click();
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
    var container = document.getElementById('suggestions-container');
    var list = document.getElementById('suggestions-list');
    if (!container || !list) return;

    getSuggestions(function (suggestions) {
      if (!suggestions.length) {
        list.hidden = true;
        return;
      }
      list.hidden = false;
      container.innerHTML = suggestions.map(function (s) {
        return '<div class="suggestion-item">' +
          '<h4>' + escapeHtml(s.title) + (s.year ? ' (' + escapeHtml(s.year) + ')' : '') + '</h4>' +
          '<p>' + escapeHtml(s.reason) + '</p>' +
          '<p class="suggestion-by">Suggested by ' + escapeHtml(s.suggestedBy) + '</p>' +
          '</div>';
      }).join('');
    });
  }

  function renderResults() {
    var container = document.getElementById('results-container');
    if (!container) return;

    getVotes(function (votes) {
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
    });
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

  // --- Quote Wall ---
  function initQuoteWall() {
    // Quote wall now uses category-based layout; no filters needed
  }

  // --- Gallery & Lightbox ---
  function initGallery() {
    var filterBtns = document.querySelectorAll('.gallery-filter-btn');
    var items = document.querySelectorAll('.masonry-item');
    var lightbox = document.getElementById('lightbox');
    if (!filterBtns.length || !items.length) return;

    // Year filtering
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var year = this.getAttribute('data-year');
        filterBtns.forEach(function (b) { b.classList.remove('gallery-filter-btn--active'); });
        this.classList.add('gallery-filter-btn--active');

        items.forEach(function (item) {
          if (year === 'all' || item.getAttribute('data-year') === year) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });

    // Lightbox
    if (!lightbox) return;

    var currentIndex = 0;
    var visibleItems = [];

    function getVisibleItems() {
      return Array.prototype.filter.call(items, function (item) {
        return !item.classList.contains('hidden') && item.getAttribute('data-type') === 'photo';
      });
    }

    function openLightbox(index) {
      visibleItems = getVisibleItems();
      if (index < 0 || index >= visibleItems.length) return;
      currentIndex = index;
      updateLightboxContent();
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    function updateLightboxContent() {
      var item = visibleItems[currentIndex];
      var caption = item.querySelector('.masonry-caption span');
      var captionEl = document.getElementById('lightbox-caption');
      if (captionEl) captionEl.textContent = caption ? caption.textContent : '';
    }

    function navigate(dir) {
      currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
      updateLightboxContent();
    }

    // Click handlers
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        if (this.getAttribute('data-type') === 'video') return;
        visibleItems = getVisibleItems();
        var idx = visibleItems.indexOf(this);
        if (idx !== -1) openLightbox(idx);
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { navigate(-1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { navigate(1); });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- TMDB Movie Poster Loader ---
  // Dynamically fetches movie poster images from The Movie Database (TMDB) API
  // and replaces placeholder SVGs in the Films Archive page.
  //
  // HOW IT WORKS:
  // 1. Finds all film cards on the archive page
  // 2. Reads the movie title from each card
  // 3. Searches TMDB API for that movie
  // 4. Gets the poster_path from the API response
  // 5. Builds the image URL: https://image.tmdb.org/t/p/w500/{poster_path}
  // 6. Replaces the SVG placeholder with an <img> tag

  var TMDB_API_KEY = '38a3eb613cba6a0465ff12b05dfa966b';
  var TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  var TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
  var POSTER_CACHE_KEY = 'erff_poster_cache';

  // Map of film titles to their specific release years for accurate TMDB lookup.
  // This avoids matching remakes or sequels with the same name.
  var FILM_YEAR_MAP = {
    'Old School': 2003,
    'The Other Guys': 2010,
    'Step Brothers': 2008,
    'Anchorman': 2004,
    'Wedding Crashers': 2005,
    'Talladega Nights: The Ballad of Ricky Bobby': 2006,
    'Talladega Nights': 2006,
    'Road House': 1989,
    'Breakfast Club': 1985,
    'Heathers': 1988,
    'Back to the Future': 1985,
    'Vacation': 1983,
    'Axel F': 2024,
    'Say Anything': 1989,
    'Walk Hard': 2007,
    'School of Rock': 2003,
    'Caddy Shack': 1980,
    'Caddyshack': 1980,
    'Wet Hot American Summer': 2001,
    'The Big Lebowski': 1998,
    'Top Gun: Maverick': 2022,
    'Rushmore': 1998,
    'Book Smart': 2019,
    'Booksmart': 2019,
    'Wedding Singer': 1998,
    'Forgetting Sarah Marshall': 2008,
    'Jaws': 1975,
    'Raiders of the Lost Ark': 1981,
    'American Pie': 1999,
    "We're the Millers": 2013,
    'Jumanji': 1995,
    'Bridesmaids': 2011,
    'Barb and Star Go to Vista Del Mar': 2021,
    'Masterminds': 2016,
    'Top Gun': 1986,
    'Princess Bride': 1987,
    'Tommy Boy': 1995,
    'Beverly Hills Cop': 1984,
    'Cocktail': 1988,
    'Eurovision': 2020,
    'Days of Thunder': 1990,
    'Dumb and Dumber': 1994,
    'Pop Star': 2016,
    'Hot Tub Time Machine': 2010,
    'The 40-Year-Old Virgin': 2005,
    'What About Bob?': 1991,
    'Something About Mary': 1998,
    'Airplane': 1980,
    'Bad Moms': 2016,
    'Soul Plane': 2004,
    'Mike and Dave Need Wedding Dates': 2016,
    'Blockers': 2018,
    'Big': 1988,
    'Office Space': 1999,
    'Tropic Thunder': 2008,
    "Ferris Bueller's Day Off": 1986,
    'Superbad': 2007,
    'Neighbors': 2014,
    'The Hangover': 2009,
    'Mean Girls': 2004,
    'The Devil Wears Prada': 2006,
    'Bottoms': 2023,
    'Clueless': 1995,
    'Girls Trip': 2017
  };

  // Some titles need an alternate search query to match TMDB's catalog
  var TMDB_SEARCH_OVERRIDES = {
    'Anchorman': 'Anchorman The Legend of Ron Burgundy',
    'Breakfast Club': 'The Breakfast Club',
    'Vacation': 'National Lampoons Vacation',
    'Axel F': 'Beverly Hills Cop Axel F',
    'Walk Hard': 'Walk Hard The Dewey Cox Story',
    'Caddy Shack': 'Caddyshack',
    'Book Smart': 'Booksmart',
    'Wedding Singer': 'The Wedding Singer',
    'Princess Bride': 'The Princess Bride',
    'Eurovision': 'Eurovision Song Contest The Story of Fire Saga',
    'Pop Star': 'Popstar Never Stop Never Stopping',
    'Something About Mary': 'Theres Something About Mary',
    'Airplane': 'Airplane!',
    'Talladega Nights': 'Talladega Nights The Ballad of Ricky Bobby'
  };

  function getPosterCache() {
    try {
      return JSON.parse(localStorage.getItem(POSTER_CACHE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function savePosterCache(cache) {
    try {
      localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(cache));
    } catch (e) { /* ignore storage errors */ }
  }

  function fetchTMDBPoster(title, callback) {
    var cache = getPosterCache();
    var cacheKey = title.toLowerCase().trim();

    // Return cached result if available
    if (cache[cacheKey]) {
      callback(cache[cacheKey]);
      return;
    }

    var searchTitle = TMDB_SEARCH_OVERRIDES[title] || title;
    var year = FILM_YEAR_MAP[title] || '';
    var url = TMDB_SEARCH_URL + '?api_key=' + TMDB_API_KEY +
              '&query=' + encodeURIComponent(searchTitle) +
              (year ? '&year=' + year : '');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            var posterUrl = TMDB_IMAGE_BASE + data.results[0].poster_path;
            cache[cacheKey] = posterUrl;
            savePosterCache(cache);
            callback(posterUrl);
          }
        } catch (e) {
          console.warn('TMDB parse error for "' + title + '":', e);
        }
      } else if (xhr.status === 429) {
        // Rate limited - retry after a delay
        setTimeout(function () { fetchTMDBPoster(title, callback); }, 2000);
      }
    };
    xhr.send();
  }

  function initTMDBPosters() {
    var filmCards = document.querySelectorAll('.archive-film');
    if (!filmCards.length) return;

    // Stagger API calls to respect TMDB rate limits (~40 requests/10 seconds)
    var delay = 0;
    var STAGGER_MS = 250; // 4 requests per second

    filmCards.forEach(function (card) {
      var titleEl = card.querySelector('.archive-film-title');
      if (!titleEl) return;

      var title = titleEl.textContent.trim();
      var placeholder = card.querySelector('.archive-poster-placeholder');
      if (!placeholder) return;

      // Check if already loaded from cache (instant)
      var cache = getPosterCache();
      var cacheKey = title.toLowerCase().trim();
      if (cache[cacheKey]) {
        replacePlaceholder(placeholder, cache[cacheKey], title);
        return;
      }

      // Stagger uncached requests
      setTimeout(function () {
        fetchTMDBPoster(title, function (posterUrl) {
          replacePlaceholder(placeholder, posterUrl, title);
        });
      }, delay);
      delay += STAGGER_MS;
    });
  }

  function replacePlaceholder(placeholder, posterUrl, title) {
    var img = document.createElement('img');
    img.alt = title + ' movie poster';
    img.loading = 'lazy';
    img.onload = function () {
      placeholder.style.display = 'none';
    };
    img.onerror = function () {
      // If image fails to load, remove img and keep the SVG placeholder visible
      if (img.parentNode) img.parentNode.removeChild(img);
    };
    placeholder.parentNode.insertBefore(img, placeholder);
    img.src = posterUrl;
  }

  // --- Vote Page TMDB Poster Loader ---
  // Loads posters for nominee cards on the Vote page using data-tmdb-title
  // and data-tmdb-year attributes on .nominee-poster elements.
  function initVotePosters() {
    var posters = document.querySelectorAll('.nominee-poster[data-tmdb-title]');
    if (!posters.length) return;

    var delay = 0;
    var STAGGER_MS = 250;

    posters.forEach(function (posterEl) {
      var title = posterEl.getAttribute('data-tmdb-title');
      var year = posterEl.getAttribute('data-tmdb-year');
      if (!title) return;

      var placeholder = posterEl.querySelector('.nominee-poster-placeholder');
      if (!placeholder) return;

      // Check cache first
      var cache = getPosterCache();
      var cacheKey = title.toLowerCase().trim();
      if (cache[cacheKey]) {
        replaceNomineePlaceholder(posterEl, placeholder, cache[cacheKey], title);
        return;
      }

      // Stagger API requests
      setTimeout(function () {
        var searchTitle = TMDB_SEARCH_OVERRIDES[title] || title;
        var searchYear = FILM_YEAR_MAP[title] || year || '';
        var url = TMDB_SEARCH_URL + '?api_key=' + TMDB_API_KEY +
                  '&query=' + encodeURIComponent(searchTitle) +
                  (searchYear ? '&year=' + searchYear : '');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) return;
          if (xhr.status === 200) {
            try {
              var data = JSON.parse(xhr.responseText);
              if (data.results && data.results.length > 0 && data.results[0].poster_path) {
                var posterUrl = TMDB_IMAGE_BASE + data.results[0].poster_path;
                cache[cacheKey] = posterUrl;
                savePosterCache(cache);
                replaceNomineePlaceholder(posterEl, placeholder, posterUrl, title);
              }
            } catch (e) {
              console.warn('TMDB parse error for "' + title + '":', e);
            }
          }
        };
        xhr.send();
      }, delay);
      delay += STAGGER_MS;
    });
  }

  function replaceNomineePlaceholder(posterEl, placeholder, posterUrl, title) {
    var img = document.createElement('img');
    img.alt = title + ' movie poster';
    img.loading = 'lazy';
    img.onload = function () {
      placeholder.style.display = 'none';
    };
    img.onerror = function () {
      if (img.parentNode) img.parentNode.removeChild(img);
    };
    posterEl.insertBefore(img, placeholder);
    img.src = posterUrl;
  }

  // --- Music Player ---
  // Background YouTube playlist player using the IFrame API.
  // Auto-starts after login, remembers user preferences across pages.

  var MUSIC_PREFS_KEY = 'erff_music_prefs';
  var PLAYLIST_ID = 'PLhPh73eLkqat9kNMN7xL_LmHNm2Sv1Eok';
  var ytPlayer = null;
  var musicPlayerEl = null;
  var musicReady = false;

  function getMusicPrefs() {
    try { return JSON.parse(localStorage.getItem(MUSIC_PREFS_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveMusicPrefs(prefs) {
    localStorage.setItem(MUSIC_PREFS_KEY, JSON.stringify(prefs));
  }

  function buildMusicPlayerUI() {
    // Don't show on admin page
    if (window.location.pathname.indexOf('admin') !== -1) return null;

    var el = document.createElement('div');
    el.className = 'music-player';
    el.id = 'music-player';
    el.innerHTML =
      '<div class="music-player-info">' +
        '<span class="music-player-label">Festival Soundtrack</span>' +
        '<span class="music-player-status" id="music-status">Loading...</span>' +
      '</div>' +
      '<div class="music-player-controls">' +
        '<button class="music-player-btn" id="music-play-btn" title="Play / Pause">' +
          '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
        '</button>' +
        '<button class="music-player-btn" id="music-mute-btn" title="Mute / Unmute">' +
          '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>' +
        '</button>' +
        '<input type="range" class="music-player-volume" id="music-volume" min="0" max="100" value="30" title="Volume">' +
      '</div>';

    document.body.appendChild(el);

    // Hidden container for YouTube iframe
    // Use off-screen positioning instead of opacity:0 / tiny size to avoid
    // browser throttling of invisible media elements.
    var ytContainer = document.createElement('div');
    ytContainer.id = 'yt-player';
    ytContainer.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:200px;height:200px;overflow:hidden;pointer-events:none;';
    document.body.appendChild(ytContainer);

    return el;
  }

  function initMusicPlayer() {
    // Only run on public pages (not admin)
    if (window.location.pathname.indexOf('admin') !== -1) return;

    // Only show if user is authenticated
    if (sessionStorage.getItem(SESSION_KEY) !== 'true') return;

    musicPlayerEl = buildMusicPlayerUI();
    if (!musicPlayerEl) return;

    // Load YouTube IFrame API
    if (!window.YT) {
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    } else {
      onYTReady();
    }

    // Wire up controls
    document.getElementById('music-play-btn').addEventListener('click', togglePlay);
    document.getElementById('music-mute-btn').addEventListener('click', toggleMute);
    document.getElementById('music-volume').addEventListener('input', function () {
      if (!ytPlayer || !musicReady) return;
      var vol = parseInt(this.value, 10);
      ytPlayer.setVolume(vol);
      var prefs = getMusicPrefs();
      prefs.volume = vol;
      if (vol > 0) prefs.muted = false;
      saveMusicPrefs(prefs);
      updateMuteIcon(vol === 0);
    });
  }

  // YouTube IFrame API calls this global function when ready
  window.onYouTubeIframeAPIReady = function () {
    onYTReady();
  };

  function onYTReady() {
    if (!document.getElementById('yt-player')) return;

    // Load playlist directly via playerVars — this mirrors how YouTube's own
    // embed code works and is the most reliable method.
    // mute:1 is required for Chrome's autoplay policy to allow autoplay.
    ytPlayer = new YT.Player('yt-player', {
      height: '200',
      width: '200',
      playerVars: {
        listType: 'playlist',
        list: PLAYLIST_ID,
        autoplay: 1,
        mute: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  }

  var musicLoadTimer = null;
  var musicLoadAttempt = 0;

  function onPlayerReady(event) {
    musicReady = true;
    var prefs = getMusicPrefs();
    var vol = prefs.volume !== undefined ? prefs.volume : 30;

    ytPlayer.setVolume(vol);
    document.getElementById('music-volume').value = vol;

    // Player starts muted via playerVars (mute:1). Apply user preference.
    if (prefs.muted === false) {
      ytPlayer.unMute();
      updateMuteIcon(false);
    } else {
      updateMuteIcon(true);
    }

    // Show the player UI
    setTimeout(function () {
      musicPlayerEl.classList.add('music-player--visible');
    }, 500);

    // The playlist should load automatically via playerVars.
    // Set a fallback timer in case it doesn't start playing.
    musicLoadTimer = setTimeout(tryNextLoadStrategy, 6000);
  }

  function tryNextLoadStrategy() {
    musicLoadAttempt++;
    var state;
    try { state = ytPlayer.getPlayerState(); } catch (e) { state = -1; }

    // Already playing or paused by user — nothing to do
    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.PAUSED) return;

    if (musicLoadAttempt === 1) {
      // Fallback 1: loadPlaylist with object syntax (required for playlist IDs)
      console.log('[Music] Fallback 1: loadPlaylist with object syntax');
      updateStatus('Retrying...');
      try {
        ytPlayer.loadPlaylist({
          list: PLAYLIST_ID,
          listType: 'playlist',
          index: 0,
          startSeconds: 0
        });
      } catch (e) {
        console.warn('[Music] loadPlaylist failed:', e);
      }
      musicLoadTimer = setTimeout(tryNextLoadStrategy, 6000);
    } else if (musicLoadAttempt === 2) {
      // Fallback 2: cuePlaylist then playVideo after a delay
      console.log('[Music] Fallback 2: cuePlaylist + playVideo');
      updateStatus('Retrying...');
      try {
        ytPlayer.cuePlaylist({
          list: PLAYLIST_ID,
          listType: 'playlist',
          index: 0
        });
      } catch (e) {}
      setTimeout(function () {
        try { ytPlayer.playVideo(); } catch (e) {}
      }, 2000);
      musicLoadTimer = setTimeout(tryNextLoadStrategy, 8000);
    } else {
      // All strategies exhausted
      console.warn('[Music] All loading strategies failed. The playlist may be private or not embeddable.');
      updateStatus('Unavailable');
    }
  }

  function onPlayerStateChange(event) {
    if (!musicReady) return;
    var state = event.data;
    var prefs = getMusicPrefs();

    // Clear the fallback timer once we get a meaningful state
    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.CUED) {
      if (musicLoadTimer) {
        clearTimeout(musicLoadTimer);
        musicLoadTimer = null;
      }
    }

    if (state === YT.PlayerState.PLAYING) {
      updatePlayIcon(true);

      // Apply user prefs after playlist starts
      if (prefs.paused) {
        ytPlayer.pauseVideo();
        return;
      }

      // Restore volume and mute state
      var vol = prefs.volume !== undefined ? prefs.volume : 30;
      ytPlayer.setVolume(vol);
      if (prefs.muted === false) {
        ytPlayer.unMute();
        updateMuteIcon(false);
      }

      // Save track index for cross-page resume
      try {
        prefs.trackIndex = ytPlayer.getPlaylistIndex();
        prefs.paused = false;
        saveMusicPrefs(prefs);
      } catch (e) {}
      updateTrackInfo();

      // Enable looping on the playlist
      try { ytPlayer.setLoop(true); } catch (e) {}
    } else if (state === YT.PlayerState.PAUSED) {
      updatePlayIcon(false);
      updateStatus('Paused');
    } else if (state === YT.PlayerState.BUFFERING) {
      updateStatus('Loading...');
    } else if (state === YT.PlayerState.ENDED) {
      // Restart playlist from beginning if loop didn't catch it
      try {
        ytPlayer.playVideoAt(0);
      } catch (e) {
        ytPlayer.playVideo();
      }
    } else if (state === YT.PlayerState.CUED) {
      // Playlist is cued and ready - start playing
      if (!prefs.paused) {
        try { ytPlayer.playVideo(); } catch (e) {}
      } else {
        updatePlayIcon(false);
        updateStatus('Paused');
      }
    }
  }

  var musicErrorRetries = 0;

  function onPlayerError(event) {
    var code = event && event.data;
    console.warn('[Music] YouTube player error:', code);

    // Error codes: 2=bad param, 5=HTML5 error, 100=not found, 101/150=embed blocked
    if (code === 101 || code === 150) {
      // Embed-blocked track — skip to next
      if (musicErrorRetries < 5) {
        musicErrorRetries++;
        try { ytPlayer.nextVideo(); } catch (e) {}
        return;
      }
    }

    if (musicErrorRetries < 3) {
      musicErrorRetries++;
      // Retry loading the playlist with object syntax after a delay
      setTimeout(function () {
        try {
          ytPlayer.loadPlaylist({
            list: PLAYLIST_ID,
            listType: 'playlist',
            index: 0,
            startSeconds: 0
          });
        } catch (e) {
          updateStatus('Unavailable');
        }
      }, 2000);
    } else {
      if (musicLoadTimer) {
        clearTimeout(musicLoadTimer);
        musicLoadTimer = null;
      }
      updateStatus('Unavailable');
    }
  }

  function togglePlay() {
    if (!ytPlayer || !musicReady) return;
    var prefs = getMusicPrefs();
    var state = ytPlayer.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      prefs.paused = true;
    } else {
      ytPlayer.playVideo();
      prefs.paused = false;
      // On first real play, unmute if it was auto-muted
      if (prefs.muted === undefined) {
        ytPlayer.unMute();
        prefs.muted = false;
        updateMuteIcon(false);
      }
    }
    saveMusicPrefs(prefs);
  }

  function toggleMute() {
    if (!ytPlayer || !musicReady) return;
    var prefs = getMusicPrefs();

    if (ytPlayer.isMuted()) {
      ytPlayer.unMute();
      prefs.muted = false;
      updateMuteIcon(false);
      // If paused, also start playing
      if (ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
        ytPlayer.playVideo();
        prefs.paused = false;
      }
    } else {
      ytPlayer.mute();
      prefs.muted = true;
      updateMuteIcon(true);
    }
    saveMusicPrefs(prefs);
  }

  function updatePlayIcon(isPlaying) {
    var btn = document.getElementById('music-play-btn');
    if (!btn) return;
    if (isPlaying) {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
      btn.title = 'Pause';
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      btn.title = 'Play';
    }
  }

  function updateMuteIcon(isMuted) {
    var btn = document.getElementById('music-mute-btn');
    if (!btn) return;
    if (isMuted) {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
      btn.title = 'Unmute';
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
      btn.title = 'Mute';
    }
  }

  function updateTrackInfo() {
    if (!ytPlayer || !musicReady) return;
    try {
      var data = ytPlayer.getVideoData();
      var title = data && data.title ? data.title : 'Playing';
      // Trim long titles
      if (title.length > 30) title = title.substring(0, 28) + '...';
      updateStatus(title);
    } catch (e) {
      updateStatus('Playing');
    }
  }

  function updateStatus(text) {
    var el = document.getElementById('music-status');
    if (el) el.textContent = text;
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
    initGallery();
    initQuoteWall();
    initTMDBPosters();
    initVotePosters();

    // Start music player after a short delay to let the page settle
    setTimeout(initMusicPlayer, 800);
  });
})();
