#!/usr/bin/env python3
"""
TMDB Batch Movie Poster Downloader
===================================
Downloads movie poster images for all Elk Rapids Film Festival films
using The Movie Database (TMDB) API.

USAGE:
    python3 fetch_all_posters.py

This will download all 62 movie posters to images/posters/ as JPG files.
Each file is named: movie-title-year.jpg (e.g., jaws-1975.jpg)

HOW THE TMDB API WORKS:
-----------------------
1. SEARCH endpoint: GET /search/movie?query=Jaws&year=1975
   Returns JSON with results[0].poster_path = "/lxM6kqil..."

2. IMAGE CDN: https://image.tmdb.org/t/p/w500{poster_path}
   Returns the actual poster image in the specified size.

REQUIREMENTS:
    - Python 3.6+
    - No external dependencies (uses only standard library)
    - A valid TMDB API key (get free at https://www.themoviedb.org/settings/api)
"""

import urllib.request
import urllib.parse
import json
import os
import sys
import time
import re

# ── Configuration ──────────────────────────────────────────────
API_KEY = "38a3eb613cba6a0465ff12b05dfa966b"
BASE_API_URL = "https://api.themoviedb.org/3"
BASE_IMAGE_URL = "https://image.tmdb.org/t/p"
POSTER_SIZE = "w500"  # 500px wide - good for web display
OUTPUT_DIR = "images/posters"

# Rate limiting: TMDB allows ~40 requests per 10 seconds
REQUEST_DELAY = 0.3  # seconds between API calls

# ── Film Database ──────────────────────────────────────────────
# All 62 films from the Elk Rapids Film Festival (2014-2025)
# Format: (display_title, search_query, release_year, festival_year)
# search_query is used when the display title differs from TMDB's catalog

FILMS = [
    # 2025 - Will Ferrell Classics
    ("Old School", None, 2003, 2025),
    ("The Other Guys", None, 2010, 2025),
    ("Step Brothers", None, 2008, 2025),
    ("Anchorman", "Anchorman The Legend of Ron Burgundy", 2004, 2025),
    ("Wedding Crashers", None, 2005, 2025),
    ("Talladega Nights: The Ballad of Ricky Bobby", None, 2006, 2025),

    # 2024 - 1980s Cinema
    ("Road House", None, 1989, 2024),
    ("Breakfast Club", "The Breakfast Club", 1985, 2024),
    ("Heathers", None, 1988, 2024),
    ("Back to the Future", None, 1985, 2024),
    ("Vacation", "National Lampoons Vacation", 1983, 2024),
    ("Axel F", "Beverly Hills Cop Axel F", 2024, 2024),
    ("Say Anything", None, 1989, 2024),

    # 2023 - Yacht Rock
    ("Walk Hard", "Walk Hard The Dewey Cox Story", 2007, 2023),
    ("School of Rock", None, 2003, 2023),
    ("Caddy Shack", "Caddyshack", 1980, 2023),
    ("Wet Hot American Summer", None, 2001, 2023),

    # 2022
    ("The Big Lebowski", None, 1998, 2022),
    ("Top Gun: Maverick", None, 2022, 2022),
    ("Rushmore", None, 1998, 2022),
    ("Book Smart", "Booksmart", 2019, 2022),
    ("Wedding Singer", "The Wedding Singer", 1998, 2022),
    ("Forgetting Sarah Marshall", None, 2008, 2022),

    # 2021 Summer
    ("Jaws", None, 1975, 2021),
    ("Raiders of the Lost Ark", None, 1981, 2021),
    ("American Pie", None, 1999, 2021),
    ("We're the Millers", None, 2013, 2021),
    ("Jumanji", None, 1995, 2021),
    ("Bridesmaids", None, 2011, 2021),

    # 2021 Winter
    ("Barb and Star Go to Vista Del Mar", None, 2021, 2021),
    ("Masterminds", None, 2016, 2021),

    # 2020 Summer - Tom Cruise Introduction
    ("Top Gun", None, 1986, 2020),
    ("Princess Bride", "The Princess Bride", 1987, 2020),
    ("Tommy Boy", None, 1995, 2020),
    ("Beverly Hills Cop", None, 1984, 2020),
    ("Cocktail", None, 1988, 2020),
    ("Eurovision", "Eurovision Song Contest The Story of Fire Saga", 2020, 2020),
    ("Days of Thunder", None, 1990, 2020),

    # 2020 Winter
    ("Dumb and Dumber", None, 1994, 2020),
    ("Pop Star", "Popstar Never Stop Never Stopping", 2016, 2020),

    # 2019
    ("Hot Tub Time Machine", None, 2010, 2019),
    ("The 40-Year-Old Virgin", None, 2005, 2019),
    ("What About Bob?", None, 1991, 2019),
    ("Something About Mary", "Theres Something About Mary", 1998, 2019),
    ("Airplane", "Airplane!", 1980, 2019),
    ("Bad Moms", None, 2016, 2019),
    ("Soul Plane", None, 2004, 2019),

    # 2018
    ("Mike and Dave Need Wedding Dates", None, 2016, 2018),
    ("Blockers", None, 2018, 2018),
    ("Big", None, 1988, 2018),
    ("Office Space", None, 1999, 2018),

    # 2017
    ("Tropic Thunder", None, 2008, 2017),
    ("Ferris Bueller's Day Off", None, 1986, 2017),

    # 2016
    ("Superbad", None, 2007, 2016),

    # 2015
    ("Neighbors", None, 2014, 2015),
    ("The Hangover", None, 2009, 2015),
]


def slugify(title):
    """Convert a movie title to a filename-safe slug."""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    return slug


def search_movie(title, search_query, year):
    """Search TMDB for a movie and return its poster_path."""
    query = search_query or title
    params = {
        "api_key": API_KEY,
        "query": query,
        "year": year,
    }
    url = f"{BASE_API_URL}/search/movie?{urllib.parse.urlencode(params)}"

    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())

        if data.get("results") and len(data["results"]) > 0:
            movie = data["results"][0]
            return {
                "id": movie["id"],
                "title": movie["title"],
                "poster_path": movie.get("poster_path"),
                "release_date": movie.get("release_date", ""),
            }
    except Exception as e:
        print(f"   API error: {e}")

    return None


def download_image(poster_path, output_path):
    """Download a poster image from TMDB's CDN."""
    url = f"{BASE_IMAGE_URL}/{POSTER_SIZE}{poster_path}"

    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = response.read()

        with open(output_path, "wb") as f:
            f.write(data)

        return len(data)
    except Exception as e:
        print(f"   Download error: {e}")
        return 0


def main():
    print("=" * 65)
    print("  Elk Rapids Film Festival - Batch Poster Downloader")
    print("  Using TMDB API (The Movie Database)")
    print("=" * 65)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Deduplicate films (some appear in multiple festival years)
    seen = set()
    unique_films = []
    for title, search_query, year, festival_year in FILMS:
        key = f"{title.lower()}_{year}"
        if key not in seen:
            seen.add(key)
            unique_films.append((title, search_query, year, festival_year))

    total = len(unique_films)
    print(f"\n  Total unique films to download: {total}")
    print(f"  Output directory: {OUTPUT_DIR}/")
    print(f"  Image size: {POSTER_SIZE}")
    print()

    success = 0
    failed = []
    skipped = 0

    for i, (title, search_query, year, festival_year) in enumerate(unique_films, 1):
        filename = f"{slugify(title)}-{year}.jpg"
        output_path = os.path.join(OUTPUT_DIR, filename)

        # Skip if already downloaded
        if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            print(f"  [{i:2d}/{total}] ⏭  {title} ({year}) — already exists")
            skipped += 1
            success += 1
            continue

        print(f"  [{i:2d}/{total}] 🔍 Searching: {title} ({year})...", end=" ", flush=True)

        # Search for the movie
        movie = search_movie(title, search_query, year)

        if not movie or not movie["poster_path"]:
            print("❌ Not found")
            failed.append(f"{title} ({year})")
            time.sleep(REQUEST_DELAY)
            continue

        # Download the poster
        size = download_image(movie["poster_path"], output_path)

        if size > 0:
            print(f"✅ {size/1024:.0f}KB → {filename}")
            success += 1
        else:
            print("❌ Download failed")
            failed.append(f"{title} ({year})")

        # Respect rate limits
        time.sleep(REQUEST_DELAY)

    # Summary
    print("\n" + "=" * 65)
    print(f"  COMPLETE: {success}/{total} posters downloaded")
    if skipped:
        print(f"  ({skipped} already existed, {success - skipped} newly downloaded)")
    if failed:
        print(f"\n  ❌ Failed ({len(failed)}):")
        for f in failed:
            print(f"     - {f}")
    print("=" * 65)


if __name__ == "__main__":
    main()
