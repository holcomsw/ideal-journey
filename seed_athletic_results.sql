-- ============================================================
-- Brady Holcomb — Athletic Results — Seed Data
-- ============================================================
-- Extracted from athletic.net profile screenshot (May 2026).
--
-- HOW TO USE:
--   1. Run athletic_supabase_schema.sql FIRST to create the table
--   2. Paste this file into Supabase → SQL Editor → Run
--
-- ⚠️  REVIEW BEFORE RUNNING:
--   Rows marked with -- ⚠️  LOW CONFIDENCE have uncertain times
--   or dates. Correct them before inserting.
--
-- Dates marked "APPROX" are estimated from season order.
-- Meet names are NULL — fill in after confirming with athletic.net.
-- ============================================================

-- Clear existing data (remove this line if you want to append)
-- DELETE FROM athletic_results WHERE athlete_name = 'Brady Holcomb';

INSERT INTO athletic_results
  (athlete_name, sport, event, meet_name, meet_date, result, result_seconds,
   placement, team, grade, season_year, source)
VALUES

-- ── TRACK — Spring 2026 (most recent) ──────────────────────

('Brady Holcomb', 'track', '400 Meters',
  NULL, '2026-05-09', '1:11.34', 71.34,
  9, NULL, '8th', 2026, 'image_extraction'),

('Brady Holcomb', 'track', '400 Meters',
  NULL, '2026-05-09', '1:11.37', 71.37,
  5, NULL, '8th', 2026, 'image_extraction'),

('Brady Holcomb', 'track', '400 Meters',
  NULL, '2026-04-19', '1:10.31', 70.31,  -- APPROX date
  9, NULL, '8th', 2026, 'image_extraction'),

-- ⚠️  LOW CONFIDENCE: event name unclear — may be 800 Meters, not 400
('Brady Holcomb', 'track', '400 Meters',
  NULL, '2026-04-19', '2:02.12', 122.12, -- APPROX date; verify event & placement
  8, NULL, '8th', 2026, 'image_extraction'),

('Brady Holcomb', 'track', '400 Meters',
  NULL, '2026-04-13', '1:13.57', 73.57,  -- APPROX date
  25, NULL, '8th', 2026, 'image_extraction'),

('Brady Holcomb', 'track', '1600 Meters',
  NULL, '2026-04-01', '6:08.24', 368.24, -- APPROX date
  28, NULL, '8th', 2026, 'image_extraction'),

-- ── CROSS COUNTRY — Fall 2025 ───────────────────────────────

('Brady Holcomb', 'cross_country', '2 Miles Boys',
  NULL, '2025-10-15', '13:07.50', 787.50, -- APPROX date
  47, NULL, '7th', 2025, 'image_extraction'),

('Brady Holcomb', 'cross_country', '2 Miles Boys (7th & 8th Grades)',
  NULL, '2025-10-01', '14:53.58', 893.58, -- APPROX date
  62, NULL, '7th', 2025, 'image_extraction'),

('Brady Holcomb', 'cross_country', '1.5 Miles THFR Varsity Boys',
  NULL, '2025-09-15', '10:36.40', 636.40, -- APPROX date
  101, NULL, '7th', 2025, 'image_extraction'),

-- Track or XC — 1000m event; verify sport
('Brady Holcomb', 'track', '1000 Meters THFR Grade Boys',
  NULL, '2025-05-01', '6:29', 389.0,      -- APPROX date; confirm if track or XC
  19, NULL, '7th', 2025, 'image_extraction'),

('Brady Holcomb', 'cross_country', '2 Miles 7th and 8th Grade',
  NULL, '2025-09-10', '14:04.22', 844.22, -- APPROX date
  113, NULL, '7th', 2025, 'image_extraction'),

('Brady Holcomb', 'cross_country', '2 Miles Varsity',
  NULL, '2025-09-05', '14:07.07', 847.07, -- APPROX date; Chicago, IL
  47, NULL, '7th', 2025, 'image_extraction'),

-- Relay — result is likely team total, not individual split
('Brady Holcomb', 'cross_country', '1.0 Mile Middle School Relay',
  NULL, '2025-09-01', '10:22.38', 622.38, -- APPROX date; RELAY — verify
  9, NULL, '7th', 2025, 'image_extraction'),

-- ── CROSS COUNTRY — Fall 2024 ───────────────────────────────

('Brady Holcomb', 'cross_country', '2 Miles',
  NULL, '2024-10-15', '16:17.5', 977.5,   -- APPROX date; placement unknown
  NULL, NULL, '6th', 2024, 'image_extraction'),

-- ⚠️  LOW CONFIDENCE: time may be 14:01 not 11:01 — please verify before inserting
-- ('Brady Holcomb', 'cross_country', '2 Miles Boys Varsity (7th & 8th Grade)',
--   NULL, '2024-10-10', '14:01', 841.0,
--   120, NULL, '6th', 2024, 'image_extraction'),

('Brady Holcomb', 'cross_country', '1.5 Miles THFR Varsity Boys',
  NULL, '2024-09-20', '11:34.8', 694.8,   -- APPROX date
  120, NULL, '6th', 2024, 'image_extraction'),

('Brady Holcomb', 'cross_country', '2 Miles 7th & 8th Grade',
  NULL, '2024-09-15', '17:07.76', 1027.76, -- APPROX date
  125, NULL, '6th', 2024, 'image_extraction'),

('Brady Holcomb', 'cross_country', '2 Miles 7th & 8th Grade',
  NULL, '2024-09-10', '17:07', 1027.0,    -- APPROX date
  123, NULL, '6th', 2024, 'image_extraction'),

-- ⚠️  LOW CONFIDENCE: 10:22 for 2 miles seems too fast — may be relay or misread
-- ('Brady Holcomb', 'cross_country', '2 Miles Sectional Race',
--   NULL, '2024-10-25', '10:22.20', 622.20,
--   34, NULL, '6th', 2024, 'image_extraction'),

('Brady Holcomb', 'cross_country', '2 Miles JV Open',
  NULL, '2024-09-05', '17:02.78', 1022.78, -- APPROX date
  134, NULL, '6th', 2024, 'image_extraction'),

-- ⚠️  LOW CONFIDENCE: 11:40 for 1.0 mile seems like a relay team time — verify
-- ('Brady Holcomb', 'cross_country', '1.0 Mile',
--   NULL, '2024-09-01', '11:40', 700.0,
--   102, NULL, '6th', 2024, 'image_extraction'),

('Brady Holcomb', 'cross_country', '1.5 Miles Open',
  NULL, '2024-08-25', '12:09.23', 729.23, -- APPROX date; possibly earliest entry
  78, NULL, '6th', 2024, 'image_extraction');

-- ── Verify ─────────────────────────────────────────────────
SELECT
  sport,
  season_year,
  event,
  meet_date,
  result,
  result_seconds,
  placement
FROM athletic_results
WHERE athlete_name = 'Brady Holcomb'
ORDER BY meet_date DESC;
