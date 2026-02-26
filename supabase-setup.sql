-- ============================================
-- Elk Rapids Film Festival - Supabase Setup
-- ============================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Paste this entire script and click "Run"
-- ============================================

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  film_id TEXT NOT NULL,
  film_name TEXT NOT NULL,
  voter_name TEXT NOT NULL,
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  year TEXT DEFAULT '',
  reason TEXT DEFAULT '',
  suggested_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to read votes
CREATE POLICY "Allow public read votes"
  ON votes FOR SELECT
  USING (true);

-- Allow anyone (anon) to insert votes
CREATE POLICY "Allow public insert votes"
  ON votes FOR INSERT
  WITH CHECK (true);

-- Allow anyone (anon) to delete votes (for admin panel)
CREATE POLICY "Allow public delete votes"
  ON votes FOR DELETE
  USING (true);

-- Allow anyone (anon) to read suggestions
CREATE POLICY "Allow public read suggestions"
  ON suggestions FOR SELECT
  USING (true);

-- Allow anyone (anon) to insert suggestions
CREATE POLICY "Allow public insert suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (true);

-- Allow anyone (anon) to delete suggestions (for admin panel)
CREATE POLICY "Allow public delete suggestions"
  ON suggestions FOR DELETE
  USING (true);
