import { sql } from "../db";

/**
 * Creates all database tables if they don't already exist.
 * Run inside a createServerFn handler when DATABASE_URL is available.
 */
export async function createTables() {
  const db = sql();

  await db`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    subscription_status TEXT NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT
  )`;

  await db`CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('Foundation', 'Work', 'Structure', 'Finances', 'Mindset', 'Career', 'Family', 'Vision')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    icon_name TEXT
  )`;

  await db`CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    reflection_prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
    action_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`;

  await db`CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, lesson_id)
  )`;

  await db`CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT,
    duration_days INTEGER NOT NULL DEFAULT 7
  )`;

  await db`CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    enrolled BOOLEAN NOT NULL DEFAULT true,
    current_streak INTEGER NOT NULL DEFAULT 0,
    last_checkin_at TIMESTAMPTZ,
    UNIQUE(user_id, challenge_id)
  )`;

  await db`CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('spreadsheet', 'worksheet', 'guide', 'prompt_library')),
    download_url TEXT NOT NULL DEFAULT ''
  )`;

  await db`CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    category TEXT,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await db`CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
}
