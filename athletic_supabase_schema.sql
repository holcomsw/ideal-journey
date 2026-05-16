-- ============================================================
-- Brady Holcomb — Athletic Results — Supabase Schema
-- ============================================================
-- Run this in your Supabase Dashboard:
--   Project → SQL Editor → paste → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS athletic_results (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_name   TEXT        NOT NULL DEFAULT 'Brady Holcomb',
  sport          TEXT        NOT NULL,       -- 'cross_country' or 'track'
  event          TEXT,                       -- '5000m XC', '100 Meters', 'High Jump', …
  meet_name      TEXT,
  meet_date      DATE,
  result         TEXT,                       -- raw display value, e.g. '16:42.3' or '5-08'
  result_seconds NUMERIC,                   -- converted to seconds for sorting / graphing
  placement      INTEGER,                   -- finish position
  team           TEXT,
  grade          TEXT,                      -- '9th', '10th', …
  season_year    INTEGER,                   -- e.g. 2024
  source         TEXT,                      -- 'api', 'html_table', 'html_card', …
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE athletic_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public leaderboard / website display)
CREATE POLICY "public read athletic_results"
  ON athletic_results FOR SELECT
  USING (true);

-- Allow service-role / anon inserts from the scraper
CREATE POLICY "public insert athletic_results"
  ON athletic_results FOR INSERT
  WITH CHECK (true);

-- Allow updates (for re-runs that correct data)
CREATE POLICY "public update athletic_results"
  ON athletic_results FOR UPDATE
  USING (true);

-- Allow deletes (for admin cleanup)
CREATE POLICY "public delete athletic_results"
  ON athletic_results FOR DELETE
  USING (true);

-- ── Helpful indexes ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_athletic_sport  ON athletic_results (sport);
CREATE INDEX IF NOT EXISTS idx_athletic_year   ON athletic_results (season_year);
CREATE INDEX IF NOT EXISTS idx_athletic_event  ON athletic_results (event);
CREATE INDEX IF NOT EXISTS idx_athletic_result ON athletic_results (result_seconds);
