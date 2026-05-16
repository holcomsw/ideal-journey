#!/usr/bin/env python3
"""
Athletic.net Scraper for Brady Holcomb
=======================================
Logs into athletic.net and scrapes Brady Holcomb's cross country
and track & field results, then writes brady_results.json.

SETUP (run once on your local machine):
  pip install playwright beautifulsoup4
  playwright install chromium

RUN:
  python3 scrape_athletic_net.py

OPTIONAL — push results to Supabase:
  SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=your-anon-key \
  python3 scrape_athletic_net.py
"""

import json
import os
import re
import sys
from datetime import datetime

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup

# ── Configuration ──────────────────────────────────────────────
EMAIL = "edholcomb1@gmail.com"
PASSWORD = "hoxwef-diczeM-xirca8"
ATHLETE_ID = "23740536"
ATHLETE_NAME = "Brady Holcomb"
OUTPUT_FILE = "brady_results.json"
BASE_URL = "https://www.athletic.net"
PROFILE_BASE = f"{BASE_URL}/profile/{ATHLETE_ID}"

# ── Helpers ────────────────────────────────────────────────────

def time_to_seconds(time_str):
    """Convert '16:42.3' or '1:02:15' to a float of seconds."""
    if not time_str:
        return None
    s = str(time_str).strip()
    m = re.match(r'^(\d+):(\d+):(\d+\.?\d*)$', s)     # H:MM:SS
    if m:
        return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    m = re.match(r'^(\d+):(\d+\.?\d*)$', s)            # MM:SS.s
    if m:
        return int(m.group(1)) * 60 + float(m.group(2))
    try:
        return float(s)
    except ValueError:
        return None


def extract_season_year(text):
    """Pull a 4-digit year from a date or season string."""
    m = re.search(r'\b(20\d{2})\b', str(text))
    return int(m.group(1)) if m else None


# ── Scraping ───────────────────────────────────────────────────

def intercept_and_scrape(page, url, label):
    """
    Navigate to `url`, capture every JSON API response from athletic.net,
    and return (api_captures, rendered_html).
    """
    api_captures = []

    def on_response(response):
        if 'athletic.net' not in response.url:
            return
        ct = response.headers.get('content-type', '')
        if 'json' not in ct:
            return
        try:
            body = response.json()
            api_captures.append({'url': response.url, 'data': body})
            print(f"    [API] {response.url}")
        except Exception:
            pass

    page.on('response', on_response)
    print(f"  → {url}")
    try:
        page.goto(url, wait_until='networkidle', timeout=30000)
    except PlaywrightTimeout:
        print("    (networkidle timeout — continuing)")
    page.wait_for_timeout(3000)   # extra time for React to finish rendering
    html = page.content()
    page.remove_listener('response', on_response)
    print(f"    {len(html):,} bytes HTML  |  {len(api_captures)} API response(s)")
    return api_captures, html


def parse_html(html, sport):
    """
    Best-effort HTML parsing of a rendered athletic.net profile page.
    Returns a list of raw row dicts for later processing.
    """
    soup = BeautifulSoup(html, 'html.parser')
    rows = []

    # ── Strategy 1: embedded JSON in <script> tags ──
    for script in soup.find_all('script'):
        text = script.string or ''
        # Look for window.__INITIAL_STATE__, __NEXT_DATA__, or similar
        for pat in [
            r'window\.__(?:INITIAL_STATE|NEXT_DATA|PAGE_PROPS|DATA)__\s*=\s*(\{.*?\});',
            r'"(?:results|performances|entries)"\s*:\s*(\[.*?\])',
        ]:
            for raw in re.findall(pat, text, re.DOTALL):
                try:
                    data = json.loads(raw)
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict):
                                rows.append({'sport': sport, 'source': 'script_json', **item})
                    elif isinstance(data, dict):
                        rows.append({'sport': sport, 'source': 'script_json', **data})
                except json.JSONDecodeError:
                    pass

    # ── Strategy 2: HTML tables ──
    for table in soup.find_all('table'):
        headers = [th.get_text(strip=True) for th in table.find_all('th')]
        for tr in table.find_all('tr'):
            cells = [td.get_text(strip=True) for td in tr.find_all('td')]
            if not cells:
                continue
            entry = {'sport': sport, 'source': 'html_table', 'cells': cells}
            for i, h in enumerate(headers):
                if i < len(cells) and h:
                    entry[h.lower().replace(' ', '_')] = cells[i]
            rows.append(entry)

    # ── Strategy 3: React result cards ──
    for el in soup.select('[class*="Result"],[class*="result"],[class*="Performance"],[data-testid]'):
        text = el.get_text(separator=' | ', strip=True)
        if text and len(text) > 8:
            rows.append({
                'sport': sport,
                'source': 'html_card',
                'text': text,
                'classes': ' '.join(el.get('class', [])),
            })

    return rows


def normalize_api_record(item, sport):
    """
    Convert a raw API dict into a clean record for Supabase / JSON output.
    athletic.net field names vary; this tries many common patterns.
    """
    def pick(*keys):
        for k in keys:
            v = item.get(k)
            if v is not None and v != '':
                return v
        return None

    result_str = pick('result', 'time', 'mark', 'Time', 'Mark', 'Result')
    return {
        'athlete_name': ATHLETE_NAME,
        'sport': sport,
        'event': pick('event', 'eventName', 'EventName', 'event_name'),
        'meet_name': pick('meetName', 'meet', 'MeetName', 'meet_name', 'Meet'),
        'meet_date': pick('date', 'meetDate', 'Date', 'meet_date'),
        'result': result_str,
        'result_seconds': time_to_seconds(result_str) if result_str else None,
        'placement': pick('place', 'Place', 'finish', 'Finish', 'position'),
        'team': pick('team', 'Team', 'school', 'School'),
        'grade': pick('grade', 'Grade', 'gradeLevel'),
        'season_year': extract_season_year(
            pick('year', 'season', 'seasonYear') or
            pick('date', 'meetDate', 'Date') or ''
        ),
        '_raw': item,
    }


# ── Main scraper ───────────────────────────────────────────────

def run_scraper():
    raw = {
        'athlete': ATHLETE_NAME,
        'athlete_id': ATHLETE_ID,
        'scraped_at': datetime.now().isoformat(),
        'login_success': False,
        'cross_country': {'api': [], 'html_rows': []},
        'track': {'api': [], 'html_rows': []},
        'feed': {'api': [], 'html_rows': []},
    }

    with sync_playwright() as p:
        print('\n' + '=' * 60)
        print('  Athletic.net Scraper — Brady Holcomb')
        print('=' * 60)

        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        ctx = browser.new_context(
            user_agent=(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/120.0.0.0 Safari/537.36'
            ),
            viewport={'width': 1280, 'height': 900},
        )
        page = ctx.new_page()

        try:
            # ── Step 1: Login ──────────────────────────────────
            print('\n── STEP 1: Login ─────────────────────────────')
            page.goto(f'{BASE_URL}/login', wait_until='networkidle', timeout=20000)
            print(f'  Page: {page.title()!r}  ({page.url})')

            email_sel = 'input[type="email"], input[name="email"], input[placeholder*="Email" i]'
            pw_sel = 'input[type="password"]'
            submit_sel = (
                'button[type="submit"], '
                'button:has-text("Sign In"), '
                'button:has-text("Log In"), '
                'button:has-text("Continue")'
            )

            try:
                page.wait_for_selector(email_sel, timeout=10000)
                page.fill(email_sel, EMAIL)
                page.fill(pw_sel, PASSWORD)
                print('  Credentials filled in')
                page.click(submit_sel)
                page.wait_for_load_state('networkidle', timeout=15000)
                page.wait_for_timeout(2000)
            except PlaywrightTimeout:
                # Save debug artifacts if login UI not found
                with open('debug_login.html', 'w') as f:
                    f.write(page.content())
                page.screenshot(path='debug_login.png')
                print('  Login form not found — saved debug_login.html / debug_login.png')

            current = page.url
            print(f'  Post-login URL: {current}')
            if 'login' not in current.lower():
                raw['login_success'] = True
                print('  Login successful!')
            else:
                raw['login_success'] = False
                print('  Warning: still on login page — proceeding anyway')
                err = page.query_selector('.error, [class*="error" i], .alert')
                if err:
                    print(f'  Server message: {err.inner_text()!r}')

            # Save page screenshot for debugging
            page.screenshot(path='debug_after_login.png')

            # ── Step 2: Cross Country ──────────────────────────
            print('\n── STEP 2: Cross Country ─────────────────────')
            xc_api, xc_html = intercept_and_scrape(
                page, f'{PROFILE_BASE}/cross-country', 'cross_country'
            )
            with open('debug_xc.html', 'w') as f:
                f.write(xc_html)
            raw['cross_country']['api'] = xc_api
            raw['cross_country']['html_rows'] = parse_html(xc_html, 'cross_country')

            # ── Step 3: Track & Field ──────────────────────────
            print('\n── STEP 3: Track & Field ─────────────────────')
            tf_api, tf_html = intercept_and_scrape(
                page, f'{PROFILE_BASE}/track-and-field', 'track'
            )
            with open('debug_tf.html', 'w') as f:
                f.write(tf_html)
            raw['track']['api'] = tf_api
            raw['track']['html_rows'] = parse_html(tf_html, 'track')

            # ── Step 4: Main feed (bonus) ──────────────────────
            print('\n── STEP 4: Profile feed ──────────────────────')
            feed_api, feed_html = intercept_and_scrape(
                page, f'{PROFILE_BASE}/feed', 'feed'
            )
            with open('debug_feed.html', 'w') as f:
                f.write(feed_html)
            raw['feed']['api'] = feed_api
            raw['feed']['html_rows'] = parse_html(feed_html, 'feed')

        except Exception as exc:
            print(f'\n  ERROR: {exc}')
            try:
                page.screenshot(path='debug_error.png')
            except Exception:
                pass
            raw['error'] = str(exc)
        finally:
            browser.close()

    return raw


# ── Clean records ──────────────────────────────────────────────

def build_clean_records(raw):
    """Flatten all API captures into normalized Supabase-ready records."""
    records = []
    for sport_key, sport_label in [('cross_country', 'cross_country'), ('track', 'track'), ('feed', 'feed')]:
        for capture in raw.get(sport_key, {}).get('api', []):
            data = capture.get('data', {})
            items = []
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                for v in data.values():
                    if isinstance(v, list):
                        items.extend(v)
            for item in items:
                if isinstance(item, dict):
                    records.append(normalize_api_record(item, sport_label))
    return records


# ── Supabase upload (optional) ─────────────────────────────────

def upload_to_supabase(records):
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    if not supabase_url or not supabase_key:
        print('\n  (Skipping Supabase upload — SUPABASE_URL / SUPABASE_KEY not set)')
        return

    try:
        from supabase import create_client
    except ImportError:
        print('\n  (Skipping Supabase — run: pip install supabase)')
        return

    client = create_client(supabase_url, supabase_key)
    clean = [{k: v for k, v in r.items() if k != '_raw'} for r in records]
    print(f'\n── Uploading {len(clean)} records to Supabase ─────────')
    resp = client.table('athletic_results').upsert(clean).execute()
    print(f'  Upserted {len(resp.data)} rows')


# ── Entry point ────────────────────────────────────────────────

def main():
    print('=' * 60)
    print('  Brady Holcomb — Athletic.net Results Scraper')
    print('=' * 60)

    raw = run_scraper()
    clean = build_clean_records(raw)

    output = {
        'athlete': ATHLETE_NAME,
        'athlete_id': ATHLETE_ID,
        'scraped_at': raw['scraped_at'],
        'login_success': raw.get('login_success', False),
        'summary': {
            'xc_api': len(raw.get('cross_country', {}).get('api', [])),
            'xc_html': len(raw.get('cross_country', {}).get('html_rows', [])),
            'track_api': len(raw.get('track', {}).get('api', [])),
            'track_html': len(raw.get('track', {}).get('html_rows', [])),
            'feed_api': len(raw.get('feed', {}).get('api', [])),
            'clean_records': len(clean),
        },
        'clean_records': clean,
        'raw': raw,
    }

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2, default=str)

    print('\n' + '=' * 60)
    s = output['summary']
    print(f'  Saved → {OUTPUT_FILE}')
    print(f'  Login success:    {output["login_success"]}')
    print(f'  XC API captures:  {s["xc_api"]}   HTML rows: {s["xc_html"]}')
    print(f'  Track API:        {s["track_api"]}   HTML rows: {s["track_html"]}')
    print(f'  Feed API:         {s["feed_api"]}')
    print(f'  Clean records:    {s["clean_records"]}')
    print('=' * 60)

    if s['clean_records'] == 0:
        print('\n  No structured records extracted yet.')
        print('  Check the debug_*.html files — they show exactly what')
        print('  athletic.net returned. The raw API responses are also')
        print('  stored in brady_results.json under .raw.*.api')
        print('  Open an issue or share those files to refine the parser.')
    else:
        upload_to_supabase(clean)

    return output


if __name__ == '__main__':
    main()
