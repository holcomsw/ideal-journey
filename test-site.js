#!/usr/bin/env node
/**
 * Elk Rapids Film Festival — Site Validation Tests
 *
 * Run:  node test-site.js
 *
 * Tests HTML structure, CSS rules, JS logic, image references,
 * navigation consistency, and content correctness without any
 * external dependencies.
 */

var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var passed = 0;
var failed = 0;
var errors = [];

// ── Helpers ─────────────────────────────────────────────────

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log('  \x1b[32m✓\x1b[0m ' + label);
  } else {
    failed++;
    errors.push(label);
    console.log('  \x1b[31m✗\x1b[0m ' + label);
  }
}

function section(name) {
  console.log('\n\x1b[1m' + name + '\x1b[0m');
}

// ── Load files once ─────────────────────────────────────────

var indexHtml   = read('index.html');
var aboutHtml   = read('about.html');
var archiveHtml = read('archive.html');
var galleryHtml = read('gallery.html');
var quotesHtml  = read('quotes.html');
var voteHtml    = read('vote.html');
var scriptJs    = read('script.js');
var stylesCss   = read('styles.css');

var allPages = {
  'index.html':   indexHtml,
  'about.html':   aboutHtml,
  'archive.html': archiveHtml,
  'gallery.html': galleryHtml,
  'quotes.html':  quotesHtml,
  'vote.html':    voteHtml
};

// ═════════════════════════════════════════════════════════════
// 1. COUNTDOWN TIMER — THREE-PHASE LOGIC
// ═════════════════════════════════════════════════════════════
section('1. Countdown Timer');

assert(
  scriptJs.indexOf("VOTING_OPEN") !== -1 &&
  scriptJs.indexOf("new Date('2026-06-01T00:00:00')") !== -1,
  'VOTING_OPEN constant defined as June 1 2026'
);

assert(
  scriptJs.indexOf("VOTING_DEADLINE") !== -1 &&
  scriptJs.indexOf("new Date('2026-06-30T23:59:59')") !== -1,
  'VOTING_DEADLINE constant defined as June 30 2026'
);

assert(
  scriptJs.indexOf("FESTIVAL_START") !== -1 &&
  scriptJs.indexOf("new Date('2026-07-04T00:00:00')") !== -1,
  'FESTIVAL_START constant defined as July 4 2026'
);

assert(
  scriptJs.indexOf('now < VOTING_OPEN') !== -1,
  'Countdown has pre-voting phase (before June 1)'
);

assert(
  scriptJs.indexOf('now <= VOTING_DEADLINE') !== -1,
  'Countdown has active-voting phase (June 1–30)'
);

assert(
  scriptJs.indexOf('now < FESTIVAL_START') !== -1,
  'Countdown has post-voting / pre-festival phase'
);

assert(
  scriptJs.indexOf('Voting opens in') !== -1,
  'Shows "Voting opens in" label before June 1'
);

assert(
  scriptJs.indexOf('Voting closes in') !== -1,
  'Shows "Voting closes in" label during voting'
);

assert(
  scriptJs.indexOf('Festival begins in') !== -1,
  'Shows "Festival begins in" label after voting closes'
);

assert(
  stylesCss.indexOf('.countdown-phase-label') !== -1,
  'CSS has .countdown-phase-label styling'
);

// ═════════════════════════════════════════════════════════════
// 2. GALLERY PREVIEW — 6 UNIFORM FRAMES
// ═════════════════════════════════════════════════════════════
section('2. Gallery Preview (Home Page)');

// Count gallery-preview-item occurrences in index.html
var itemMatches = indexHtml.match(/gallery-preview-item"/g) || [];
assert(
  itemMatches.length === 6,
  'Exactly 6 gallery-preview-item elements on home page (found ' + itemMatches.length + ')'
);

assert(
  indexHtml.indexOf('gallery-preview-item--tall') === -1,
  'No tall variant classes in gallery HTML'
);

assert(
  stylesCss.indexOf('.gallery-preview-item--tall') === -1,
  'No .gallery-preview-item--tall CSS rule'
);

assert(
  stylesCss.indexOf('.gallery-preview-item {') !== -1 &&
  (function () {
    var m = stylesCss.match(/\.gallery-preview-item \{[^}]+\}/);
    return m && m[0].indexOf('aspect-ratio: 4/3') !== -1;
  })(),
  'Gallery items use aspect-ratio: 4/3'
);

assert(
  (function () {
    var m = stylesCss.match(/\.gallery-preview-item img \{[^}]+\}/);
    return m && m[0].indexOf('object-fit: cover') !== -1 &&
           m[0].indexOf('object-position: center') !== -1;
  })(),
  'Gallery images use object-fit: cover + object-position: center'
);

assert(
  (function () {
    var m = stylesCss.match(/\.gallery-preview-grid \{[^}]+\}/);
    return m && m[0].indexOf('grid-template-columns: repeat(3, 1fr)') !== -1;
  })(),
  'Gallery grid is 3-column layout'
);

// ═════════════════════════════════════════════════════════════
// 3. ROTATING GALLERY IMAGES — ALL FILES EXIST
// ═════════════════════════════════════════════════════════════
section('3. Gallery Image Files');

var galleryImgMatch = scriptJs.match(/GALLERY_IMAGES\s*=\s*\[([\s\S]*?)\];/);
var galleryImages = [];
if (galleryImgMatch) {
  var raw = galleryImgMatch[1];
  var re = /'([^']+)'/g;
  var m;
  while ((m = re.exec(raw)) !== null) {
    galleryImages.push(m[1]);
  }
}

assert(galleryImages.length >= 50, 'GALLERY_IMAGES pool has 50+ images (found ' + galleryImages.length + ')');

var missingImages = galleryImages.filter(function (img) { return !fileExists(img); });
assert(
  missingImages.length === 0,
  'All GALLERY_IMAGES files exist on disk' +
  (missingImages.length > 0 ? ' — missing: ' + missingImages.join(', ') : '')
);

// Also check initial images in index.html
var initialImgs = (indexHtml.match(/gallery-preview-item[\s\S]*?src="([^"]+)"/g) || [])
  .map(function (s) { var m = s.match(/src="([^"]+)"/); return m ? m[1] : null; })
  .filter(Boolean);

var missingInitial = initialImgs.filter(function (img) { return !fileExists(img); });
assert(
  missingInitial.length === 0,
  'All initial gallery preview images exist' +
  (missingInitial.length > 0 ? ' — missing: ' + missingInitial.join(', ') : '')
);

// ═════════════════════════════════════════════════════════════
// 4. ARCHIVE — 2019 THEME IS "CHERNOBLY"
// ═════════════════════════════════════════════════════════════
section('4. Archive Content');

assert(
  archiveHtml.indexOf('Chernobly') !== -1,
  '2019 theme is "Chernobly"'
);

assert(
  archiveHtml.indexOf('Chernobyl') === -1,
  'No lingering "Chernobyl" misspelling in archive'
);

// Check all years 2014–2025 are present
for (var yr = 2014; yr <= 2025; yr++) {
  assert(
    archiveHtml.indexOf('data-year="' + yr + '"') !== -1,
    'Archive has year block for ' + yr
  );
}

// Check winners exist for each year
var winnerBlocks = (archiveHtml.match(/data-winner="true"/g) || []);
assert(
  winnerBlocks.length >= 12,
  'At least 12 festival winners marked (one per year, found ' + winnerBlocks.length + ')'
);

// ═════════════════════════════════════════════════════════════
// 5. NAVIGATION CONSISTENCY
// ═════════════════════════════════════════════════════════════
section('5. Navigation');

var expectedNavLinks = [
  { href: 'index.html',   label: 'Home' },
  { href: 'about.html',   label: 'Our Story' },
  { href: 'archive.html', label: 'Films' },
  { href: 'gallery.html', label: 'Gallery' },
  { href: 'quotes.html',  label: 'Quotes' },
  { href: 'vote.html',    label: 'Vote' }
];

Object.keys(allPages).forEach(function (pageName) {
  var html = allPages[pageName];
  expectedNavLinks.forEach(function (link) {
    // Skip self-link for index (it uses "Home" text only on other pages)
    if (pageName === 'index.html' && link.href === 'index.html') return;
    // Skip self-link with active class
    var hasLink = html.indexOf('href="' + link.href + '"') !== -1;
    assert(hasLink, pageName + ' has nav link to ' + link.href);
  });
});

// ═════════════════════════════════════════════════════════════
// 6. VOTING PAGE — NOMINEES & CONFIGURATION
// ═════════════════════════════════════════════════════════════
section('6. Voting Page');

var expectedNominees = [
  'mean-girls', 'bridesmaids', 'bad-moms',
  'devil-wears-prada', 'bottoms', 'clueless', 'girls-trip'
];

expectedNominees.forEach(function (id) {
  assert(
    voteHtml.indexOf('data-film-id="' + id + '"') !== -1,
    'Nominee present: ' + id
  );
});

assert(
  voteHtml.indexOf('Women in Film') !== -1,
  '2026 theme is "Women in Film"'
);

assert(
  voteHtml.indexOf('June 1') !== -1 && voteHtml.indexOf('30, 2026') !== -1,
  'Voting dates (June 1–30 2026) shown on page'
);

assert(
  voteHtml.indexOf('July 4') !== -1 && voteHtml.indexOf('11, 2026') !== -1,
  'Festival dates (July 4–11 2026) shown on page'
);

assert(
  voteHtml.indexOf('vote-countdown') !== -1,
  'Countdown element present in vote.html'
);

assert(
  scriptJs.indexOf('MAX_VOTES') !== -1 || scriptJs.indexOf('5 votes') !== -1,
  'Max votes limit (5) referenced in script'
);

// Each nominee has a vote button
expectedNominees.forEach(function (id) {
  var pattern = 'btn--vote" data-film-id="' + id + '"';
  assert(
    voteHtml.indexOf(pattern) !== -1,
    'Vote button for ' + id
  );
});

// ═════════════════════════════════════════════════════════════
// 7. PASSWORD GATE
// ═════════════════════════════════════════════════════════════
section('7. Password Gate');

assert(
  scriptJs.indexOf('60PercentOrange') !== -1,
  'Site passcode "60PercentOrange" is in script'
);

Object.keys(allPages).forEach(function (pageName) {
  assert(
    allPages[pageName].indexOf('login-overlay') !== -1 ||
    allPages[pageName].indexOf('login-gate') !== -1 ||
    allPages[pageName].indexOf('site-content--locked') !== -1,
    pageName + ' has password gate markup'
  );
});

// ═════════════════════════════════════════════════════════════
// 8. ROTATING QUOTES
// ═════════════════════════════════════════════════════════════
section('8. Rotating Quotes');

var quotesMatch = scriptJs.match(/var QUOTES\s*=\s*\[([\s\S]*?)\];/);
var quoteCount = 0;
if (quotesMatch) {
  quoteCount = (quotesMatch[1].match(/\{/g) || []).length;
}
assert(quoteCount >= 10, 'At least 10 rotating quotes defined (found ' + quoteCount + ')');

assert(
  indexHtml.indexOf('rotating-quote') !== -1,
  'Homepage has rotating-quote element'
);

var expectedQuoteFilms = ['Jaws', 'Step Brothers', 'Top Gun', 'Old School', 'Anchorman'];
expectedQuoteFilms.forEach(function (film) {
  assert(
    scriptJs.indexOf("attr: '" + film + "'") !== -1,
    'Quote from "' + film + '" in rotation'
  );
});

// ═════════════════════════════════════════════════════════════
// 9. CSS RESPONSIVE BREAKPOINTS
// ═════════════════════════════════════════════════════════════
section('9. Responsive Design');

assert(
  stylesCss.indexOf('@media') !== -1,
  'CSS contains media queries'
);

assert(
  stylesCss.indexOf('max-width: 800px') !== -1 || stylesCss.indexOf('max-width:800px') !== -1,
  'Tablet breakpoint at 800px'
);

assert(
  stylesCss.indexOf('max-width: 480px') !== -1 || stylesCss.indexOf('max-width:480px') !== -1,
  'Mobile breakpoint at 480px'
);

// Gallery responsive: should switch to 2-column at tablet
assert(
  (function () {
    // Look for .gallery-preview-grid with 2-col inside any media query
    var mediaBlocks = stylesCss.match(/@media[^{]*\{[\s\S]*?\n\}/g) || [];
    return mediaBlocks.some(function (block) {
      return block.indexOf('gallery-preview-grid') !== -1 &&
             block.indexOf('repeat(2, 1fr)') !== -1;
    });
  })(),
  'Gallery grid becomes 2-column at tablet breakpoint'
);

// ═════════════════════════════════════════════════════════════
// 10. TMDB POSTER INTEGRATION
// ═════════════════════════════════════════════════════════════
section('10. TMDB Integration');

assert(
  scriptJs.indexOf('TMDB_API_KEY') !== -1,
  'TMDB API key defined'
);

assert(
  scriptJs.indexOf('TMDB_IMAGE_BASE') !== -1 &&
  scriptJs.indexOf('image.tmdb.org') !== -1,
  'TMDB image base URL configured'
);

assert(
  scriptJs.indexOf('FILM_YEAR_MAP') !== -1,
  'FILM_YEAR_MAP lookup table exists'
);

assert(
  scriptJs.indexOf('POSTER_CACHE_KEY') !== -1,
  'Poster caching via localStorage'
);

// Check that nominees on vote page have TMDB data attributes
var tmdbDataCount = (voteHtml.match(/data-tmdb-title/g) || []).length;
assert(
  tmdbDataCount === 7,
  'All 7 nominees have data-tmdb-title attribute (found ' + tmdbDataCount + ')'
);

// ═════════════════════════════════════════════════════════════
// 11. SUPABASE CONFIGURATION
// ═════════════════════════════════════════════════════════════
section('11. Supabase Backend');

assert(
  scriptJs.indexOf('SUPABASE_URL') !== -1 &&
  scriptJs.indexOf('supabase.co') !== -1,
  'Supabase URL configured'
);

assert(
  scriptJs.indexOf('SUPABASE_KEY') !== -1,
  'Supabase anon key configured'
);

assert(
  scriptJs.indexOf("from('votes')") !== -1,
  'Votes table accessed'
);

assert(
  scriptJs.indexOf("from('voters')") !== -1,
  'Voters table accessed'
);

assert(
  scriptJs.indexOf("from('suggestions')") !== -1,
  'Suggestions table accessed'
);

assert(
  scriptJs.indexOf("from('settings')") !== -1,
  'Settings table accessed'
);

// ═════════════════════════════════════════════════════════════
// 12. GALLERY PAGE — YEAR FILTERS
// ═════════════════════════════════════════════════════════════
section('12. Gallery Page');

// 2015 has no photos in the gallery (second year, minimal documentation)
var galleryYears = [2014, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
galleryYears.forEach(function (y) {
  assert(
    galleryHtml.indexOf('data-year="' + y + '"') !== -1,
    'Gallery has filter/items for year ' + y
  );
});

assert(
  galleryHtml.indexOf('lightbox') !== -1 || scriptJs.indexOf('lightbox') !== -1,
  'Lightbox functionality present'
);

// ═════════════════════════════════════════════════════════════
// 13. MUSIC PLAYER
// ═════════════════════════════════════════════════════════════
section('13. Music Player');

assert(
  scriptJs.indexOf('youtube.com/iframe_api') !== -1 ||
  scriptJs.indexOf('YT.Player') !== -1,
  'YouTube iframe API integration'
);

assert(
  scriptJs.indexOf('PLhPh73eLkqauWtzllAGmkRreWZSC-m9OM') !== -1,
  'Festival playlist ID configured'
);

assert(
  scriptJs.indexOf('togglePlayPause') !== -1,
  'Play/pause toggle function exists'
);

// ═════════════════════════════════════════════════════════════
// 14. QUOTE CATEGORIES (quotes.html)
// ═════════════════════════════════════════════════════════════
section('14. Quote Wall');

var expectedCategories = [
  'Foundation', 'Wisdom', 'Top Gun', 'Ferrell', 'Old School'
];

expectedCategories.forEach(function (cat) {
  assert(
    quotesHtml.toLowerCase().indexOf(cat.toLowerCase()) !== -1,
    'Quote category present: ' + cat
  );
});

// ═════════════════════════════════════════════════════════════
// 15. FOUNDERS (about.html)
// ═════════════════════════════════════════════════════════════
section('15. About Page');

assert(
  aboutHtml.indexOf('founders') !== -1 || aboutHtml.indexOf('Founders') !== -1,
  'Founders section present'
);

var founderNames = ['Scott', 'Dan', 'Roscoe'];
founderNames.forEach(function (name) {
  assert(
    aboutHtml.indexOf(name) !== -1,
    'Founder "' + name + '" mentioned'
  );
});

assert(
  aboutHtml.indexOf('2014') !== -1,
  'Festival origin year (2014) referenced'
);

// ═════════════════════════════════════════════════════════════
// 16. HOMEPAGE STRUCTURE
// ═════════════════════════════════════════════════════════════
section('16. Homepage Structure');

var homeSections = [
  'hero',
  'stats-section',
  'origin',
  'rotating-quote',
  'gallery-preview',
  'footer'
];

homeSections.forEach(function (id) {
  assert(
    indexHtml.indexOf(id) !== -1,
    'Homepage has section: ' + id
  );
});

// ═════════════════════════════════════════════════════════════
// SUMMARY
// ═════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(55));
console.log('\x1b[1m  Results: ' + passed + ' passed, ' + failed + ' failed\x1b[0m');
console.log('═'.repeat(55));

if (failed > 0) {
  console.log('\n\x1b[31mFailing tests:\x1b[0m');
  errors.forEach(function (e) { console.log('  • ' + e); });
  process.exit(1);
} else {
  console.log('\n\x1b[32mAll tests passed!\x1b[0m\n');
  process.exit(0);
}
