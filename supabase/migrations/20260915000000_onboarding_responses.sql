-- Onboarding persistence: one row per user, written once as a batch when
-- the user finishes the 9-screen onboarding intake (Screen 9: Skip / Build
-- my plan). See lib/onboarding.ts for the app-side write path.
--
-- This project has no Supabase CLI / migration runner configured yet, so
-- this file is not applied automatically. Run it manually in the Supabase
-- Dashboard SQL Editor (Project -> SQL Editor -> New query) before testing
-- end-to-end onboarding persistence.

create table if not exists public.onboarding_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,

  primary_goal text not null,
  primary_goal_other text,

  activity_level text not null,

  barriers text[] not null default '{}',
  barrier_other text,

  daily_time text not null,

  preferred_activities text[] not null default '{}',
  activity_other text,

  habit_times text[] not null default '{}',
  habit_time_other text,

  -- Which Question 7 branch was shown - the primary_goal value, since the
  -- branch is chosen 1:1 by primary goal (see data/onboardingQuestions.ts).
  goal_specific_question text not null,
  goal_specific_answers text[] not null default '{}',
  goal_specific_other text,

  constraints text[] not null default '{}',
  constraints_detail text,

  additional_context text,

  -- Single source of truth for "has this user finished onboarding" - no
  -- separate onboarding_complete boolean.
  completed_at timestamptz not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_responses enable row level security;

-- Authenticated users may only ever see/write their own row.
create policy "Users can view their own onboarding response"
  on public.onboarding_responses
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own onboarding response"
  on public.onboarding_responses
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own onboarding response"
  on public.onboarding_responses
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Explicit least-privilege grants - anon gets nothing, authenticated gets
-- only what the app needs (no delete).
revoke all on public.onboarding_responses from public;
revoke all on public.onboarding_responses from anon;
grant select, insert, update on public.onboarding_responses to authenticated;
