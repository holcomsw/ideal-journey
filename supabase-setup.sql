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

-- ============================================
-- Voter Accounts & Voting Config (v2)
-- ============================================
-- Run this AFTER the initial setup above.
-- It adds individual voter accounts, a settings
-- table for test mode / voting dates, and links
-- votes to authenticated voters.
-- ============================================

-- Voters table
CREATE TABLE IF NOT EXISTS voters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Settings table (key-value for voting config)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('test_mode', 'false'),
  ('voting_open_date', '2026-06-01'),
  ('voting_close_date', '2026-06-30')
ON CONFLICT (key) DO NOTHING;

-- Add voter_id to existing votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_id UUID REFERENCES voters(id);

-- Enable RLS on new tables
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Voters policies
CREATE POLICY "Allow public read voters"
  ON voters FOR SELECT USING (true);
CREATE POLICY "Allow public insert voters"
  ON voters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update voters"
  ON voters FOR UPDATE USING (true);
CREATE POLICY "Allow public delete voters"
  ON voters FOR DELETE USING (true);

-- Settings policies
CREATE POLICY "Allow public read settings"
  ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert settings"
  ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update settings"
  ON settings FOR UPDATE USING (true);

-- Vote limit trigger: max 5 votes per voter, no duplicate film votes
CREATE OR REPLACE FUNCTION check_vote_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voter_id IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM votes WHERE voter_id = NEW.voter_id) >= 5 THEN
      RAISE EXCEPTION 'Vote limit reached (5 max)';
    END IF;
    IF EXISTS (SELECT 1 FROM votes WHERE voter_id = NEW.voter_id AND film_id = NEW.film_id) THEN
      RAISE EXCEPTION 'Already voted for this film';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_vote_limit
  BEFORE INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION check_vote_limit();
