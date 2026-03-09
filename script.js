// Elk Rapids Film Festival - Animations & Interactions

(function () {
  'use strict';

  // --- Cleanup Tracking (for SPA navigation) ---
  var activeIntervals = [];
  var activeObservers = [];
  var heroScrollHandler = null;

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
      // Build music player UI and create YouTube player synchronously
      // within the user's click gesture so autoplay is allowed by the browser
      initMusicPlayer();
      createYouTubePlayer();
      setupAutoplayFallback();
      initSPANavigation();
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

    activeObservers.push(observer);
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

    // Remove previous scroll handler if any
    if (heroScrollHandler) {
      window.removeEventListener('scroll', heroScrollHandler);
    }

    var ticking = false;
    heroScrollHandler = function () {
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
    };
    window.addEventListener('scroll', heroScrollHandler);
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
    var quoteInterval = setInterval(function () {
      index = (index + 1) % QUOTES.length;
      quoteEl.style.opacity = '0';
      setTimeout(function () {
        quoteEl.querySelector('p').textContent = QUOTES[index].text;
        if (attrEl) attrEl.innerHTML = '&mdash; ' + QUOTES[index].attr;
        quoteEl.style.opacity = '1';
      }, 500);
    }, 8000);
    activeIntervals.push(quoteInterval);
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
    var countdownInterval = setInterval(update, 1000);
    activeIntervals.push(countdownInterval);
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
        return !item.classList.contains('hidden');
      });
    }

    function pauseLightboxVideo() {
      var vid = document.getElementById('lightbox-video');
      if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
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
      pauseLightboxVideo();
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    function updateLightboxContent() {
      var item = visibleItems[currentIndex];
      var isVideo = item.getAttribute('data-type') === 'video';
      var caption = item.querySelector('.masonry-caption span');
      var lightboxImg = document.getElementById('lightbox-img');
      var lightboxVid = document.getElementById('lightbox-video');
      var captionEl = document.getElementById('lightbox-caption');

      // Always pause any playing video first
      pauseLightboxVideo();

      if (isVideo) {
        var vid = item.querySelector('video');
        if (lightboxImg) lightboxImg.style.display = 'none';
        if (lightboxVid && vid) {
          lightboxVid.src = vid.src;
          lightboxVid.style.display = 'block';
          lightboxVid.load();
        }
      } else {
        var img = item.querySelector('img');
        if (lightboxVid) lightboxVid.style.display = 'none';
        if (lightboxImg && img) {
          lightboxImg.style.display = 'block';
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || '';
        }
      }

      if (captionEl) captionEl.textContent = caption ? caption.textContent : '';
    }

    function navigate(dir) {
      currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
      updateLightboxContent();
    }

    // Click handlers
    items.forEach(function (item) {
      item.addEventListener('click', function () {
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
  // YouTube playlist for background music with a compact play/pause button.
  // The video iframe is hidden; only audio is heard.

  var MUSIC_PREFS_KEY = 'erff_music_prefs';
  var YOUTUBE_PLAYLIST_ID = 'PLhPh73eLkqauWtzllAGmkRreWZSC-m9OM';
  var musicPlayerEl = null;
  var ytPlayer = null;
  var musicIsPlaying = false;
  var ytAPIReady = false;
  var ytAPIReadyResolve;
  var ytAPIPromise = new Promise(function (resolve) { ytAPIReadyResolve = resolve; });

  // Set the global callback before the API script loads
  window.onYouTubeIframeAPIReady = function () {
    ytAPIReady = true;
    ytAPIReadyResolve();
  };

  function preloadYouTubeAPI() {
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  function getMusicPrefs() {
    try { return JSON.parse(localStorage.getItem(MUSIC_PREFS_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveMusicPrefs(prefs) {
    localStorage.setItem(MUSIC_PREFS_KEY, JSON.stringify(prefs));
  }

  function updatePlayPauseIcon() {
    var btn = document.getElementById('music-play-btn');
    if (!btn) return;
    if (musicIsPlaying) {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>';
      btn.title = 'Pause';
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
      btn.title = 'Play';
    }
  }

  function updateSongTitle() {
    var titleEl = document.getElementById('music-song-title');
    if (!titleEl || !ytPlayer || typeof ytPlayer.getVideoData !== 'function') return;
    var data = ytPlayer.getVideoData();
    titleEl.textContent = data && data.title ? data.title : 'Festival Soundtrack';
  }

  function togglePlayPause() {
    if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;
    var state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      musicIsPlaying = false;
    } else {
      ytPlayer.playVideo();
      musicIsPlaying = true;
    }
    updatePlayPauseIcon();
    saveMusicPrefs({ playing: musicIsPlaying });
  }

  function buildMusicPlayerUI() {
    if (window.location.pathname.indexOf('admin') !== -1) return null;

    var el = document.createElement('div');
    el.className = 'music-player';
    el.id = 'music-player';

    el.innerHTML =
      '<button class="music-skip-btn" id="music-prev-btn" title="Previous">' +
        '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="4" y="5" width="3" height="14" fill="currentColor"/><polygon points="20,5 9,12 20,19" fill="currentColor"/></svg>' +
      '</button>' +
      '<button class="music-play-btn" id="music-play-btn" title="Play">' +
        '<svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>' +
      '</button>' +
      '<button class="music-skip-btn" id="music-next-btn" title="Next">' +
        '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="17" y="5" width="3" height="14" fill="currentColor"/><polygon points="4,5 15,12 4,19" fill="currentColor"/></svg>' +
      '</button>' +
      '<div class="music-player-info">' +
        '<span class="music-player-label">Festival Soundtrack</span>' +
        '<span class="music-song-title" id="music-song-title"></span>' +
      '</div>' +
      '<div class="music-player-iframe-wrap" aria-hidden="true">' +
        '<div id="youtube-player"></div>' +
      '</div>';

    document.body.appendChild(el);
    return el;
  }

  function createYouTubePlayer() {
    if (ytPlayer) return;
    if (!document.getElementById('youtube-player')) return;

    function doCreate() {
      if (ytPlayer) return;
      ytPlayer = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        playerVars: {
          listType: 'playlist',
          list: YOUTUBE_PLAYLIST_ID,
          autoplay: 1,
          loop: 1,
          controls: 0
        },
        events: {
          onReady: function () {
            var prefs = getMusicPrefs();
            if (prefs.playing === false) {
              ytPlayer.pauseVideo();
              musicIsPlaying = false;
            } else {
              ytPlayer.playVideo();
              musicIsPlaying = true;
            }
            updatePlayPauseIcon();
            updateSongTitle();
          },
          onStateChange: function (e) {
            musicIsPlaying = (e.data === YT.PlayerState.PLAYING);
            updatePlayPauseIcon();
            if (e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.PAUSED) {
              updateSongTitle();
            }
          }
        }
      });
    }

    if (ytAPIReady) {
      doCreate();
    } else {
      ytAPIPromise.then(doCreate);
    }
  }

  function setupAutoplayFallback() {
    var fallbackApplied = false;

    function onFirstInteraction() {
      if (fallbackApplied) return;
      fallbackApplied = true;

      document.removeEventListener('click', onFirstInteraction, true);
      document.removeEventListener('touchstart', onFirstInteraction, true);
      document.removeEventListener('keydown', onFirstInteraction, true);

      if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;

      var prefs = getMusicPrefs();
      if (prefs.playing === false) return;

      var state = ytPlayer.getPlayerState();
      if (state !== YT.PlayerState.PLAYING) {
        ytPlayer.playVideo();
      }
    }

    document.addEventListener('click', onFirstInteraction, true);
    document.addEventListener('touchstart', onFirstInteraction, true);
    document.addEventListener('keydown', onFirstInteraction, true);
  }

  function initMusicPlayer() {
    if (document.getElementById('music-player')) return; // Already initialized
    if (window.location.pathname.indexOf('admin') !== -1) return;
    if (sessionStorage.getItem(SESSION_KEY) !== 'true') return;

    musicPlayerEl = buildMusicPlayerUI();
    if (!musicPlayerEl) return;

    // Show the player after a short delay
    setTimeout(function () {
      musicPlayerEl.classList.add('music-player--visible');
    }, 800);

    // Wire up play/pause and skip buttons
    document.getElementById('music-play-btn').addEventListener('click', togglePlayPause);
    document.getElementById('music-prev-btn').addEventListener('click', function () {
      if (ytPlayer && typeof ytPlayer.previousVideo === 'function') {
        ytPlayer.previousVideo();
      }
    });
    document.getElementById('music-next-btn').addEventListener('click', function () {
      if (ytPlayer && typeof ytPlayer.nextVideo === 'function') {
        ytPlayer.nextVideo();
      }
    });
  }

  // --- SPA Navigation ---
  // Intercept internal links to swap page content without a full reload,
  // keeping the music player alive across page transitions.

  function cleanupPageFeatures() {
    activeIntervals.forEach(function (id) { clearInterval(id); });
    activeIntervals = [];
    activeObservers.forEach(function (obs) { obs.disconnect(); });
    activeObservers = [];
    if (heroScrollHandler) {
      window.removeEventListener('scroll', heroScrollHandler);
      heroScrollHandler = null;
    }
  }

  function reinitPageFeatures() {
    cleanupPageFeatures();
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
  }

  function updateActiveNavLink(href) {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var linkHref = link.getAttribute('href');
      if (linkHref === href) {
        link.classList.add('nav-link--active');
      } else {
        link.classList.remove('nav-link--active');
      }
    });
  }

  function loadSupabaseSDK(callback) {
    if (window.supabase && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      if (callback) callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = function () {
      if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      }
      if (callback) callback();
    };
    document.head.appendChild(script);
  }

  function navigateToPage(href, isPopState) {
    fetch(href)
      .then(function (response) { return response.text(); })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var newContent = doc.getElementById('site-content');
        if (!newContent) {
          window.location.href = href;
          return;
        }

        var current = document.getElementById('site-content');
        current.innerHTML = newContent.innerHTML;
        current.classList.remove('site-content--locked');

        // Hide the login gate (user is already authenticated)
        var gate = document.getElementById('login-gate');
        if (gate) gate.style.display = 'none';

        document.title = doc.title;
        updateActiveNavLink(href);

        if (!isPopState) {
          history.pushState({ page: href }, '', href);
        }

        window.scrollTo(0, 0);

        // Load Supabase if navigating to vote page
        if (href.indexOf('vote') !== -1 && (!window.supabase || !supabase)) {
          loadSupabaseSDK(function () {
            reinitPageFeatures();
          });
        } else {
          reinitPageFeatures();
        }
      })
      .catch(function () {
        window.location.href = href;
      });
  }

  var spaInitialized = false;
  function initSPANavigation() {
    if (spaInitialized) return;
    if (sessionStorage.getItem(SESSION_KEY) !== 'true') return;
    spaInitialized = true;

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;
      // Only intercept internal .html links
      if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (href.indexOf('admin') !== -1) return;
      if (!href.endsWith('.html')) return;

      e.preventDefault();
      navigateToPage(href);
    });

    window.addEventListener('popstate', function () {
      var path = window.location.pathname;
      var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
      navigateToPage(page, true);
    });
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

    // Pre-load YouTube API so it's ready when user logs in
    preloadYouTubeAPI();

    // For returning visitors (already authenticated), start music immediately.
    // For fresh visitors, music starts in unlockSite() after login gesture.
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      initMusicPlayer();
      createYouTubePlayer();
      setupAutoplayFallback();
    }

    // Enable SPA navigation for persistent music playback
    initSPANavigation();
  });
})();
