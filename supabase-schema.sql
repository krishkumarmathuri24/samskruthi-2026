-- =====================================================
-- SAMSKRUTHI 2026 - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── EVENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  category       TEXT,
  description    TEXT,
  event_date     TIMESTAMPTZ NOT NULL,
  venue          TEXT,
  capacity       INTEGER DEFAULT 500,
  tickets_booked INTEGER DEFAULT 0,
  duration       TEXT DEFAULT '2 hours',
  emoji          TEXT DEFAULT '🎵',
  is_active      BOOLEAN DEFAULT TRUE,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can read events
CREATE POLICY "Events are publicly readable" ON public.events
  FOR SELECT USING (TRUE);

-- Only admins can write events
CREATE POLICY "Admins can insert events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to increment tickets_booked atomically
CREATE OR REPLACE FUNCTION increment_tickets(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET tickets_booked = tickets_booked + 1, updated_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── TICKETS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_code TEXT UNIQUE NOT NULL,
  status      TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  checked_in  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can book tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── NOTIFICATIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ─── USER ACTIVITY LOGS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all logs" ON public.user_activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── CONTACT MESSAGES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  replied    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert contact messages  
CREATE POLICY "Anyone can submit contact forms" ON public.contact_messages
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can read contact messages" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── SEED DATA ───────────────────────────────────────────
INSERT INTO public.events (title, category, description, event_date, venue, capacity, tickets_booked, duration, emoji) VALUES
  ('Battle of Bands',   'Music',      'Live band competition with top college bands from across the country.',          '2026-08-15T18:00:00+05:30', 'Main Stage',    2000, 1230, '3 hours',  '🎸'),
  ('Dance War',         'Dance',      'Solo, duo, and group dance competition across classical and contemporary styles.','2026-08-15T14:00:00+05:30', 'Dance Arena',    800,  540, '4 hours',  '💃'),
  ('Code Storm',        'Tech',       '24-hour hackathon with exciting problem statements and industry mentors.',       '2026-08-16T09:00:00+05:30', 'Tech Hub',       400,  320, '24 hours', '💻'),
  ('Rangoli Royale',    'Art',        'Traditional art competition showcasing intricate designs and creativity.',       '2026-08-16T10:00:00+05:30', 'Art Pavilion',   200,   87, '3 hours',  '🎨'),
  ('Stand-up Nite',     'Comedy',     'Comedy night featuring student comedians and special celebrity guest.',          '2026-08-16T20:00:00+05:30', 'Comedy Club',    600,  590, '2 hours',  '🎤'),
  ('Fashion Fiesta',    'Fashion',    'Runway fashion show celebrating cultural couture and modern design.',            '2026-08-17T16:00:00+05:30', 'Fashion Hall',  1000,  720, '2 hours',  '👗'),
  ('Slam Poetry',       'Literature', 'Express yourself through powerful spoken word performances.',                   '2026-08-15T16:00:00+05:30', 'Literary Lounge', 300, 120, '2 hours',  '📖'),
  ('Cricket Clash',     'Sports',     'Inter-college T20 cricket tournament with massive prize money.',                '2026-08-15T08:00:00+05:30', 'Sports Ground', 5000, 2300, '8 hours',  '🏏')
ON CONFLICT DO NOTHING;

-- ─── MAKE YOURSELF ADMIN ─────────────────────────────────
-- After signing in, run this with your user ID:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
