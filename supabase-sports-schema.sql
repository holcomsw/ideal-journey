-- ============================================================
-- Brady Holcomb Sports Tracker — Supabase Schema
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor → Run
-- Run AFTER athletic_supabase_schema.sql
-- ============================================================

-- User profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username     TEXT UNIQUE,
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  athlete_name TEXT DEFAULT 'Brady Holcomb',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID REFERENCES auth.users NOT NULL,
  exercise_name          TEXT NOT NULL,
  workout_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  sets                   INTEGER,
  reps                   INTEGER,
  weight_lbs             NUMERIC,
  running_distance_miles NUMERIC,
  running_time_seconds   INTEGER,
  calories_burned        INTEGER,
  notes                  TEXT,
  mood                   INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy_level           INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Personal Records
CREATE TABLE IF NOT EXISTS personal_records (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users NOT NULL,
  sport          TEXT NOT NULL,
  event          TEXT NOT NULL,
  result         TEXT NOT NULL,
  result_seconds NUMERIC,
  achieved_at    DATE,
  meet_name      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sport, event)
);

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "own profile" ON profiles;
CREATE POLICY "own profile"
  ON profiles USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Workouts
DROP POLICY IF EXISTS "own workouts select"  ON workouts;
DROP POLICY IF EXISTS "own workouts insert"  ON workouts;
DROP POLICY IF EXISTS "own workouts update"  ON workouts;
DROP POLICY IF EXISTS "own workouts delete"  ON workouts;
CREATE POLICY "own workouts select" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own workouts insert" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own workouts update" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own workouts delete" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- Achievements
DROP POLICY IF EXISTS "own achievements select" ON achievements;
DROP POLICY IF EXISTS "own achievements insert" ON achievements;
CREATE POLICY "own achievements select" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own achievements insert" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Personal Records
DROP POLICY IF EXISTS "own prs select" ON personal_records;
DROP POLICY IF EXISTS "own prs insert" ON personal_records;
DROP POLICY IF EXISTS "own prs update" ON personal_records;
CREATE POLICY "own prs select" ON personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own prs insert" ON personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own prs update" ON personal_records FOR UPDATE USING (auth.uid() = user_id);

-- ── Storage bucket for avatars ──────────────────────────────
-- Run this separately if it fails (buckets may need UI setup):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ── Verify ─────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
