/*
  # User Tracking, Admin, and Custom Audio Schema

  ## New Tables

  ### profiles
  - Linked to auth.users, stores display name and admin flag
  - `id` (uuid, FK to auth.users)
  - `display_name` (text)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamptz)

  ### daily_completions
  - Records each completed session per user per day
  - `id` (uuid PK)
  - `user_id` (uuid, FK to auth.users)
  - `session_key` ('morning' | 'night')
  - `date` (date) - calendar date of the completion
  - `practices_completed` (int) - how many practices finished
  - `minutes_completed` (int)
  - `cancelled` (boolean, default false) - was it cancelled
  - `cancelled_at` (timestamptz, nullable)
  - `completed_at` (timestamptz)

  ### custom_audio
  - Stores custom voice/ambient URLs per practice module
  - `id` (uuid PK)
  - `session_key` (text)
  - `practice_name` (text)
  - `audio_type` ('voice' | 'ambient')
  - `label` (text) - display name
  - `url` (text) - public URL to audio file
  - `created_by` (uuid, FK to auth.users)
  - `created_at` (timestamptz)

  ### admin_settings
  - Key-value store for admin-configurable UI settings
  - `key` (text PK)
  - `value` (jsonb)
  - `updated_by` (uuid, FK to auth.users)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own data
  - Admins can read all data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Daily completions table
CREATE TABLE IF NOT EXISTS daily_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  practices_completed integer NOT NULL DEFAULT 0,
  minutes_completed integer NOT NULL DEFAULT 0,
  cancelled boolean NOT NULL DEFAULT false,
  cancelled_at timestamptz,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON daily_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON daily_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON daily_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all completions"
  ON daily_completions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Custom audio table
CREATE TABLE IF NOT EXISTS custom_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL,
  practice_name text NOT NULL,
  audio_type text NOT NULL CHECK (audio_type IN ('voice', 'ambient')),
  label text NOT NULL DEFAULT '',
  url text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read custom audio"
  ON custom_audio FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert custom audio"
  ON custom_audio FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Admins can update custom audio"
  ON custom_audio FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Admins can delete custom audio"
  ON custom_audio FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date ON daily_completions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_key ON daily_completions(user_id, session_key);
CREATE INDEX IF NOT EXISTS idx_custom_audio_session ON custom_audio(session_key, practice_name);
