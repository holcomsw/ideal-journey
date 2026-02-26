// Elk Rapids Film Festival - Admin Panel

(function () {
  'use strict';

  var ADMIN_PASS = 'erffadmin2026';
  var ADMIN_KEY = 'erff_admin_auth';
  var FILMS_KEY = 'erff_admin_films';
  var QUOTES_KEY = 'erff_admin_quotes';
  var GALLERY_KEY = 'erff_admin_gallery';
  var CONTENT_KEY = 'erff_admin_content';
  var VOTES_KEY = 'erff_votes';
  var SUGGESTIONS_KEY = 'erff_suggestions';

  // --- Supabase Client ---
  var SUPABASE_URL = 'https://mafzshadraujlyndvfwv.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZnpzaGFkcmF1amx5bmR2Znd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjk2OTksImV4cCI6MjA4NzY0NTY5OX0.S0YIkmbnGxyAxG46ZO250jFsMph8rElB4mkfhF-uyYA';
  var sb = null;

  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // --- Auth ---
  function initAdminAuth() {
    var loginEl = document.getElementById('admin-login');
    var dashboard = document.getElementById('admin-dashboard');
    var form = document.getElementById('admin-login-form');
    var input = document.getElementById('admin-password');
    var error = document.getElementById('admin-login-error');

    if (sessionStorage.getItem(ADMIN_KEY) === 'true') {
      loginEl.hidden = true;
      dashboard.hidden = false;
      initDashboard();
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value.trim() === ADMIN_PASS) {
        sessionStorage.setItem(ADMIN_KEY, 'true');
        loginEl.hidden = true;
        dashboard.hidden = false;
        initDashboard();
      } else {
        error.hidden = false;
        input.value = '';
        input.focus();
      }
    });
  }

  function initDashboard() {
    initTabs();
    initFilmsPanel();
    initVotingPanel();
    initGalleryPanel();
    initQuotesPanel();
    initContentPanel();

    document.getElementById('admin-logout').addEventListener('click', function () {
      sessionStorage.removeItem(ADMIN_KEY);
      location.reload();
    });
  }

  // --- Tabs ---
  function initTabs() {
    var tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = this.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('admin-tab--active'); });
        this.classList.add('admin-tab--active');
        document.querySelectorAll('.admin-panel').forEach(function (p) { p.hidden = true; });
        document.getElementById('panel-' + target).hidden = false;
      });
    });
  }

  // --- Films ---
  function getFilms() {
    try { return JSON.parse(localStorage.getItem(FILMS_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveFilms(films) {
    localStorage.setItem(FILMS_KEY, JSON.stringify(films));
  }

  function initFilmsPanel() {
    var addBtn = document.getElementById('add-film-btn');
    var cancelBtn = document.getElementById('cancel-film-btn');
    var formSection = document.getElementById('film-form-section');
    var form = document.getElementById('film-form');

    addBtn.addEventListener('click', function () {
      document.getElementById('film-form-title').textContent = 'Add New Film';
      form.reset();
      document.getElementById('film-edit-id').value = '';
      formSection.hidden = false;
    });

    cancelBtn.addEventListener('click', function () {
      formSection.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var films = getFilms();
      var editId = document.getElementById('film-edit-id').value;
      var film = {
        id: editId || Date.now().toString(),
        title: document.getElementById('film-title').value.trim(),
        year: document.getElementById('film-year-input').value.trim(),
        director: document.getElementById('film-director').value.trim(),
        runtime: document.getElementById('film-runtime').value.trim(),
        synopsis: document.getElementById('film-synopsis').value.trim(),
        themeFit: document.getElementById('film-theme-fit').value.trim(),
        festivalYear: document.getElementById('film-festival-year').value.trim(),
        winner: document.getElementById('film-winner').checked
      };

      if (editId) {
        films = films.map(function (f) { return f.id === editId ? film : f; });
      } else {
        films.push(film);
      }

      saveFilms(films);
      formSection.hidden = true;
      renderFilmsList();
    });

    renderFilmsList();
  }

  function renderFilmsList() {
    var films = getFilms();
    var container = document.getElementById('films-list');

    if (!films.length) {
      container.innerHTML = '<p class="admin-empty">No films added yet.</p>';
      return;
    }

    container.innerHTML = films.map(function (f) {
      return '<div class="admin-list-item">' +
        '<div class="admin-list-item-info">' +
          '<strong>' + escapeHtml(f.title) + '</strong>' +
          (f.winner ? ' <span class="admin-badge admin-badge--gold">Winner</span>' : '') +
          '<br><small>' + escapeHtml([f.year, f.director, f.runtime].filter(Boolean).join(' · ')) + '</small>' +
          (f.festivalYear ? '<br><small>Festival: ' + escapeHtml(f.festivalYear) + '</small>' : '') +
        '</div>' +
        '<div class="admin-list-item-actions">' +
          '<button class="admin-btn-sm" onclick="window.editFilm(\'' + f.id + '\')">Edit</button>' +
          '<button class="admin-btn-sm admin-btn-sm--danger" onclick="window.deleteFilm(\'' + f.id + '\')">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.editFilm = function (id) {
    var films = getFilms();
    var film = films.find(function (f) { return f.id === id; });
    if (!film) return;

    document.getElementById('film-form-title').textContent = 'Edit Film';
    document.getElementById('film-edit-id').value = film.id;
    document.getElementById('film-title').value = film.title || '';
    document.getElementById('film-year-input').value = film.year || '';
    document.getElementById('film-director').value = film.director || '';
    document.getElementById('film-runtime').value = film.runtime || '';
    document.getElementById('film-synopsis').value = film.synopsis || '';
    document.getElementById('film-theme-fit').value = film.themeFit || '';
    document.getElementById('film-festival-year').value = film.festivalYear || '';
    document.getElementById('film-winner').checked = film.winner || false;
    document.getElementById('film-form-section').hidden = false;
  };

  window.deleteFilm = function (id) {
    if (!confirm('Delete this film?')) return;
    var films = getFilms().filter(function (f) { return f.id !== id; });
    saveFilms(films);
    renderFilmsList();
  };

  // --- Voting (Supabase-powered) ---

  function fetchVotes(callback) {
    if (sb) {
      sb.from('votes').select('*').order('created_at', { ascending: true })
        .then(function (result) {
          if (result.error) {
            console.warn('Supabase votes fetch error:', result.error.message);
            callback(getLocalVotes());
          } else {
            callback((result.data || []).map(function (row) {
              return {
                id: row.id,
                filmId: row.film_id,
                filmName: row.film_name,
                voterName: row.voter_name,
                comment: row.comment || '',
                timestamp: row.created_at
              };
            }));
          }
        });
    } else {
      callback(getLocalVotes());
    }
  }

  function fetchSuggestions(callback) {
    if (sb) {
      sb.from('suggestions').select('*').order('created_at', { ascending: true })
        .then(function (result) {
          if (result.error) {
            console.warn('Supabase suggestions fetch error:', result.error.message);
            callback(getLocalSuggestions());
          } else {
            callback((result.data || []).map(function (row) {
              return {
                id: row.id,
                title: row.title,
                year: row.year || '',
                reason: row.reason || '',
                suggestedBy: row.suggested_by,
                timestamp: row.created_at
              };
            }));
          }
        });
    } else {
      callback(getLocalSuggestions());
    }
  }

  function getLocalVotes() {
    try { return JSON.parse(localStorage.getItem(VOTES_KEY)) || []; }
    catch (e) { return []; }
  }

  function getLocalSuggestions() {
    try { return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || []; }
    catch (e) { return []; }
  }

  function initVotingPanel() {
    renderVotingDashboard();

    // Export CSV
    document.getElementById('export-votes-btn').addEventListener('click', function () {
      fetchVotes(function (votes) {
        if (!votes.length) { alert('No votes to export.'); return; }
        var csv = 'Voter,Film,Comment,Date\n' + votes.map(function (v) {
          return '"' + (v.voterName || '').replace(/"/g, '""') + '","' +
            (v.filmName || '').replace(/"/g, '""') + '","' +
            (v.comment || '').replace(/"/g, '""') + '","' +
            (v.timestamp || '') + '"';
        }).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'erff-votes-' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    });

    // Clear all votes
    document.getElementById('clear-votes-btn').addEventListener('click', function () {
      if (!confirm('Are you sure you want to clear ALL votes? This cannot be undone.')) return;
      if (sb) {
        // Delete all rows from Supabase votes table
        sb.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
          .then(function (result) {
            if (result.error) {
              console.warn('Supabase delete error:', result.error.message);
            }
            localStorage.removeItem(VOTES_KEY);
            renderVotingDashboard();
          });
      } else {
        localStorage.removeItem(VOTES_KEY);
        renderVotingDashboard();
      }
    });
  }

  function renderVotingDashboard() {
    fetchVotes(function (votes) {
      fetchSuggestions(function (suggestions) {
        document.getElementById('vote-count').textContent = votes.length;
        document.getElementById('vote-total-count').textContent = votes.length;
        document.getElementById('suggestion-count').textContent = suggestions.length;

        // Build vote tally with bar chart
        var tallyContainer = document.getElementById('admin-vote-tally');
        if (!votes.length) {
          tallyContainer.innerHTML = '<p class="admin-empty">No votes yet. The tally will appear here as votes come in.</p>';
        } else {
          var tally = {};
          votes.forEach(function (v) {
            var key = v.filmName || ('Film ' + v.filmId);
            tally[key] = (tally[key] || 0) + 1;
          });
          var sorted = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; });
          var maxVotes = tally[sorted[0]];

          tallyContainer.innerHTML = sorted.map(function (name, i) {
            var count = tally[name];
            var pct = Math.round((count / maxVotes) * 100);
            var isLeader = i === 0;
            return '<div class="admin-tally-row">' +
              '<div class="admin-tally-name">' + escapeHtml(name) +
                (isLeader ? ' <span class="admin-badge admin-badge--gold">Leading</span>' : '') +
              '</div>' +
              '<div class="admin-tally-bar-wrap">' +
                '<div class="admin-tally-bar" style="width:' + pct + '%;background:' +
                  (isLeader ? 'var(--color-gold)' : 'var(--color-lake)') + '"></div>' +
              '</div>' +
              '<div class="admin-tally-count">' + count + ' vote' + (count !== 1 ? 's' : '') + '</div>' +
            '</div>';
          }).join('');
        }

        // Individual votes list
        var votesContainer = document.getElementById('admin-votes-list');
        if (!votes.length) {
          votesContainer.innerHTML = '<p class="admin-empty">No votes yet.</p>';
        } else {
          votesContainer.innerHTML = votes.map(function (v) {
            return '<div class="admin-list-item">' +
              '<div class="admin-list-item-info">' +
                '<strong>' + escapeHtml(v.voterName) + '</strong> voted for <strong>' + escapeHtml(v.filmName) + '</strong>' +
                (v.comment ? '<br><small style="font-style:italic;">"' + escapeHtml(v.comment) + '"</small>' : '') +
                '<br><small>' + new Date(v.timestamp).toLocaleString() + '</small>' +
              '</div>' +
              '<div class="admin-list-item-actions">' +
                '<button class="admin-btn-sm admin-btn-sm--danger" onclick="window.deleteVote(\'' + v.id + '\')">Remove</button>' +
              '</div>' +
            '</div>';
          }).join('');
        }

        // Suggestions list
        var suggestionsContainer = document.getElementById('admin-suggestions-list');
        if (!suggestions.length) {
          suggestionsContainer.innerHTML = '<p class="admin-empty">No suggestions yet.</p>';
        } else {
          suggestionsContainer.innerHTML = suggestions.map(function (s) {
            return '<div class="admin-list-item">' +
              '<div class="admin-list-item-info">' +
                '<strong>' + escapeHtml(s.title) + '</strong>' +
                (s.year ? ' (' + escapeHtml(s.year) + ')' : '') +
                '<br><small>' + escapeHtml(s.reason) + '</small>' +
                '<br><small>By ' + escapeHtml(s.suggestedBy) + ' &middot; ' + new Date(s.timestamp).toLocaleString() + '</small>' +
              '</div>' +
              '<div class="admin-list-item-actions">' +
                '<button class="admin-btn-sm admin-btn-sm--danger" onclick="window.deleteSuggestion(\'' + s.id + '\')">Remove</button>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      });
    });
  }

  window.deleteVote = function (id) {
    if (!confirm('Remove this vote?')) return;
    if (sb) {
      sb.from('votes').delete().eq('id', id)
        .then(function (result) {
          if (result.error) {
            console.warn('Supabase delete vote error:', result.error.message);
          }
          renderVotingDashboard();
        });
    } else {
      // Fallback: delete by index from localStorage
      var votes = getLocalVotes();
      var idx = votes.findIndex(function (v) { return v.id === id; });
      if (idx !== -1) votes.splice(idx, 1);
      localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
      renderVotingDashboard();
    }
  };

  window.deleteSuggestion = function (id) {
    if (!confirm('Remove this suggestion?')) return;
    if (sb) {
      sb.from('suggestions').delete().eq('id', id)
        .then(function (result) {
          if (result.error) {
            console.warn('Supabase delete suggestion error:', result.error.message);
          }
          renderVotingDashboard();
        });
    } else {
      var suggestions = getLocalSuggestions();
      var idx = suggestions.findIndex(function (s) { return s.id === id; });
      if (idx !== -1) suggestions.splice(idx, 1);
      localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
      renderVotingDashboard();
    }
  };

  // --- Gallery ---
  function getGalleryItems() {
    try { return JSON.parse(localStorage.getItem(GALLERY_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveGalleryItems(items) {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
  }

  function initGalleryPanel() {
    var addBtn = document.getElementById('add-gallery-btn');
    var cancelBtn = document.getElementById('cancel-gallery-btn');
    var formSection = document.getElementById('gallery-form-section');
    var form = document.getElementById('gallery-form');

    addBtn.addEventListener('click', function () {
      document.getElementById('gallery-form-title').textContent = 'Add Gallery Item';
      form.reset();
      document.getElementById('gallery-edit-id').value = '';
      formSection.hidden = false;
    });

    cancelBtn.addEventListener('click', function () {
      formSection.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var items = getGalleryItems();
      var editId = document.getElementById('gallery-edit-id').value;
      var item = {
        id: editId || Date.now().toString(),
        caption: document.getElementById('gallery-caption').value.trim(),
        year: document.getElementById('gallery-year-input').value.trim(),
        type: document.getElementById('gallery-type').value,
        url: document.getElementById('gallery-url').value.trim()
      };

      if (editId) {
        items = items.map(function (g) { return g.id === editId ? item : g; });
      } else {
        items.push(item);
      }

      saveGalleryItems(items);
      formSection.hidden = true;
      renderGalleryList();
    });

    renderGalleryList();
  }

  function renderGalleryList() {
    var items = getGalleryItems();
    var container = document.getElementById('gallery-list');

    if (!items.length) {
      container.innerHTML = '<p class="admin-empty">No gallery items added yet.</p>';
      return;
    }

    container.innerHTML = items.map(function (g) {
      return '<div class="admin-list-item">' +
        '<div class="admin-list-item-info">' +
          '<strong>' + escapeHtml(g.caption) + '</strong>' +
          ' <span class="admin-badge">' + escapeHtml(g.type) + '</span>' +
          (g.year ? '<br><small>Year: ' + escapeHtml(g.year) + '</small>' : '') +
          (g.url ? '<br><small>URL: ' + escapeHtml(g.url) + '</small>' : '') +
        '</div>' +
        '<div class="admin-list-item-actions">' +
          '<button class="admin-btn-sm" onclick="window.editGalleryItem(\'' + g.id + '\')">Edit</button>' +
          '<button class="admin-btn-sm admin-btn-sm--danger" onclick="window.deleteGalleryItem(\'' + g.id + '\')">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.editGalleryItem = function (id) {
    var items = getGalleryItems();
    var item = items.find(function (g) { return g.id === id; });
    if (!item) return;

    document.getElementById('gallery-form-title').textContent = 'Edit Gallery Item';
    document.getElementById('gallery-edit-id').value = item.id;
    document.getElementById('gallery-caption').value = item.caption || '';
    document.getElementById('gallery-year-input').value = item.year || '';
    document.getElementById('gallery-type').value = item.type || 'photo';
    document.getElementById('gallery-url').value = item.url || '';
    document.getElementById('gallery-form-section').hidden = false;
  };

  window.deleteGalleryItem = function (id) {
    if (!confirm('Delete this gallery item?')) return;
    var items = getGalleryItems().filter(function (g) { return g.id !== id; });
    saveGalleryItems(items);
    renderGalleryList();
  };

  // --- Quotes ---
  function getQuotes() {
    try { return JSON.parse(localStorage.getItem(QUOTES_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveQuotes(quotes) {
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
  }

  function initQuotesPanel() {
    var addBtn = document.getElementById('add-quote-btn');
    var cancelBtn = document.getElementById('cancel-quote-btn');
    var formSection = document.getElementById('quote-form-section');
    var form = document.getElementById('quote-form');

    addBtn.addEventListener('click', function () {
      document.getElementById('quote-form-title').textContent = 'Add New Quote';
      form.reset();
      document.getElementById('quote-edit-id').value = '';
      formSection.hidden = false;
    });

    cancelBtn.addEventListener('click', function () {
      formSection.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var quotes = getQuotes();
      var editId = document.getElementById('quote-edit-id').value;
      var quote = {
        id: editId || Date.now().toString(),
        text: document.getElementById('quote-text-input').value.trim(),
        person: document.getElementById('quote-person-input').value.trim(),
        film: document.getElementById('quote-film-input').value.trim(),
        year: document.getElementById('quote-year-input').value.trim()
      };

      if (editId) {
        quotes = quotes.map(function (q) { return q.id === editId ? quote : q; });
      } else {
        quotes.push(quote);
      }

      saveQuotes(quotes);
      formSection.hidden = true;
      renderQuotesList();
    });

    renderQuotesList();
  }

  function renderQuotesList() {
    var quotes = getQuotes();
    var container = document.getElementById('admin-quotes-list');

    if (!quotes.length) {
      container.innerHTML = '<p class="admin-empty">No quotes added yet.</p>';
      return;
    }

    container.innerHTML = quotes.map(function (q) {
      return '<div class="admin-list-item">' +
        '<div class="admin-list-item-info">' +
          '<strong>"' + escapeHtml(q.text) + '"</strong>' +
          '<br><small>' + escapeHtml([q.person, q.film, q.year].filter(Boolean).join(' · ')) + '</small>' +
        '</div>' +
        '<div class="admin-list-item-actions">' +
          '<button class="admin-btn-sm" onclick="window.editQuote(\'' + q.id + '\')">Edit</button>' +
          '<button class="admin-btn-sm admin-btn-sm--danger" onclick="window.deleteQuote(\'' + q.id + '\')">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.editQuote = function (id) {
    var quotes = getQuotes();
    var quote = quotes.find(function (q) { return q.id === id; });
    if (!quote) return;

    document.getElementById('quote-form-title').textContent = 'Edit Quote';
    document.getElementById('quote-edit-id').value = quote.id;
    document.getElementById('quote-text-input').value = quote.text || '';
    document.getElementById('quote-person-input').value = quote.person || '';
    document.getElementById('quote-film-input').value = quote.film || '';
    document.getElementById('quote-year-input').value = quote.year || '';
    document.getElementById('quote-form-section').hidden = false;
  };

  window.deleteQuote = function (id) {
    if (!confirm('Delete this quote?')) return;
    var quotes = getQuotes().filter(function (q) { return q.id !== id; });
    saveQuotes(quotes);
    renderQuotesList();
  };

  // --- Content ---
  function initContentPanel() {
    var form = document.getElementById('content-form');
    var content = getContent();

    if (content) {
      document.getElementById('content-year').value = content.year || '2026';
      document.getElementById('content-theme').value = content.theme || 'Theme TBA';
      document.getElementById('content-start-date').value = content.startDate || 'July 4';
      document.getElementById('content-end-date').value = content.endDate || 'July 11';
      document.getElementById('content-announcement').value = content.announcement || '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        year: document.getElementById('content-year').value.trim(),
        theme: document.getElementById('content-theme').value.trim(),
        startDate: document.getElementById('content-start-date').value.trim(),
        endDate: document.getElementById('content-end-date').value.trim(),
        announcement: document.getElementById('content-announcement').value.trim()
      };
      localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
      alert('Settings saved!');
    });
  }

  function getContent() {
    try { return JSON.parse(localStorage.getItem(CONTENT_KEY)); }
    catch (e) { return null; }
  }

  // --- Util ---
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Init
  document.addEventListener('DOMContentLoaded', initAdminAuth);
})();
