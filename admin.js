// Elk Rapids Film Festival - Admin Panel

(function () {
  'use strict';

  var ADMIN_PASS = 'erffadmin2026';
  var ADMIN_KEY = 'erff_admin_auth';
  var FILMS_KEY = 'erff_admin_films';
  var QUOTES_KEY = 'erff_admin_quotes';
  var CONTENT_KEY = 'erff_admin_content';
  var VOTES_KEY = 'erff_votes';
  var SUGGESTIONS_KEY = 'erff_suggestions';

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

  // --- Voting ---
  function initVotingPanel() {
    var votes = getVotes();
    var suggestions = getSuggestions();

    document.getElementById('vote-count').textContent = votes.length;
    document.getElementById('suggestion-count').textContent = suggestions.length;

    var votesContainer = document.getElementById('admin-votes-list');
    if (!votes.length) {
      votesContainer.innerHTML = '<p class="admin-empty">No votes yet.</p>';
    } else {
      votesContainer.innerHTML = votes.map(function (v) {
        return '<div class="admin-list-item">' +
          '<div class="admin-list-item-info">' +
            '<strong>' + escapeHtml(v.voterName) + '</strong> voted for <strong>' + escapeHtml(v.filmName) + '</strong>' +
            (v.comment ? '<br><small>"' + escapeHtml(v.comment) + '"</small>' : '') +
            '<br><small>' + new Date(v.timestamp).toLocaleDateString() + '</small>' +
          '</div>' +
        '</div>';
      }).join('');
    }

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
            '<br><small>By ' + escapeHtml(s.suggestedBy) + '</small>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  function getVotes() {
    try { return JSON.parse(localStorage.getItem(VOTES_KEY)) || []; }
    catch (e) { return []; }
  }

  function getSuggestions() {
    try { return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || []; }
    catch (e) { return []; }
  }

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
