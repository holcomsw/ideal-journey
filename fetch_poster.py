#!/usr/bin/env python3
"""
TMDB Movie Poster Fetcher
=========================
This script demonstrates how the TMDB (The Movie Database) API works
to search for movies and download their poster images.

HOW THE TMDB API WORKS:
-----------------------
1. SEARCH: Call /search/movie with a query string and optional year
   -> Returns a list of matching movies with metadata including poster_path

2. GET DETAILS (optional): Call /movie/{id} for a specific movie
   -> Returns full details including poster_path, backdrop_path, etc.

3. BUILD IMAGE URL: Combine three parts:
   - Base URL:    https://image.tmdb.org/t/p/
   - Size:        w500 (options: w92, w154, w185, w342, w500, w780, original)
   - Poster path: /lxM6kqilAdpdhqUl2biYp5frUxE.jpg (from API response)

   Full URL: https://image.tmdb.org/t/p/w500/lxM6kqilAdpdhqUl2biYp5frUxE.jpg

4. DOWNLOAD: Fetch the image from that URL and save it locally
"""

import urllib.request
import urllib.parse
import json
import os
import sys

# ── Configuration ──────────────────────────────────────────────
API_KEY = "38a3eb613cba6a0465ff12b05dfa966b"
BASE_API_URL = "https://api.themoviedb.org/3"
BASE_IMAGE_URL = "https://image.tmdb.org/t/p"
POSTER_SIZE = "w500"  # Good balance of quality and file size
OUTPUT_DIR = "images/posters"

def search_movie(title, year=None):
    """
    STEP 1: Search for a movie by title.

    API Endpoint: GET /search/movie
    Docs: https://developer.themoviedb.org/reference/search-movie

    Parameters:
      - api_key: Your TMDB API key
      - query: The movie title to search for
      - year: (optional) Filter by release year for more accurate results

    Returns: List of matching movies with id, title, poster_path, etc.
    """
    params = {
        "api_key": API_KEY,
        "query": title,
    }
    if year:
        params["year"] = year

    url = f"{BASE_API_URL}/search/movie?{urllib.parse.urlencode(params)}"

    print(f"\n📡 API CALL: GET {url}")
    print(f"   (Searching for '{title}' released in {year})\n")

    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())

    return data


def download_poster(poster_path, output_filename):
    """
    STEP 2: Download the poster image from TMDB's image CDN.

    Image URL format: {BASE_IMAGE_URL}/{SIZE}/{POSTER_PATH}
    Example: https://image.tmdb.org/t/p/w500/lxM6kqilAdpdhqUl2biYp5frUxE.jpg

    Available sizes:
      - w92    (tiny thumbnail)
      - w154   (small)
      - w185   (medium-small)
      - w342   (medium)
      - w500   (good for web display) ← We use this
      - w780   (large)
      - original (full resolution, can be very large)
    """
    image_url = f"{BASE_IMAGE_URL}/{POSTER_SIZE}{poster_path}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    print(f"🖼️  IMAGE URL: {image_url}")
    print(f"   Downloading to: {output_path}\n")

    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    req = urllib.request.Request(image_url)
    with urllib.request.urlopen(req) as response:
        image_data = response.read()

    with open(output_path, "wb") as f:
        f.write(image_data)

    size_kb = len(image_data) / 1024
    print(f"   ✅ Downloaded! File size: {size_kb:.1f} KB")

    return output_path


def main():
    movie_title = "Jaws"
    movie_year = 1975
    output_filename = "jaws-1975.jpg"

    print("=" * 60)
    print("  TMDB Movie Poster Fetcher - Test Run")
    print("=" * 60)
    print(f"\n  Movie:  {movie_title} ({movie_year})")
    print(f"  Output: {OUTPUT_DIR}/{output_filename}")
    print(f"  Size:   {POSTER_SIZE}")

    # ── Step 1: Search for the movie ──
    print("\n" + "─" * 60)
    print("STEP 1: Searching TMDB for the movie...")
    print("─" * 60)

    data = search_movie(movie_title, movie_year)

    total_results = data.get("total_results", 0)
    print(f"   Found {total_results} result(s)")

    if total_results == 0:
        print("   ❌ No movies found!")
        sys.exit(1)

    # The first result is usually the best match
    movie = data["results"][0]

    print(f"\n   🎬 Best Match:")
    print(f"      Title:        {movie['title']}")
    print(f"      TMDB ID:      {movie['id']}")
    print(f"      Release Date: {movie.get('release_date', 'N/A')}")
    print(f"      Rating:       {movie.get('vote_average', 'N/A')}/10")
    print(f"      Poster Path:  {movie.get('poster_path', 'N/A')}")

    poster_path = movie.get("poster_path")
    if not poster_path:
        print("   ❌ No poster available for this movie!")
        sys.exit(1)

    # ── Step 2: Download the poster ──
    print("\n" + "─" * 60)
    print("STEP 2: Downloading poster image...")
    print("─" * 60 + "\n")

    output_path = download_poster(poster_path, output_filename)

    # ── Summary ──
    print("\n" + "=" * 60)
    print("  ✅ SUCCESS!")
    print("=" * 60)
    print(f"\n  Movie:       {movie['title']} ({movie.get('release_date', '')[:4]})")
    print(f"  TMDB ID:     {movie['id']}")
    print(f"  Poster Path: {poster_path}")
    print(f"  Image URL:   {BASE_IMAGE_URL}/{POSTER_SIZE}{poster_path}")
    print(f"  Saved To:    {output_path}")
    print()

    return poster_path


if __name__ == "__main__":
    main()
