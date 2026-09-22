-- Onboarding intake v2: migrates public.onboarding_responses from the old
-- fixed 9-question flow to the new adaptive intake defined in
-- SCREEN_SPECS.md (primary outcome -> up to 3 focus areas -> what's
-- already working -> activity/barriers/time/habit-times -> one adaptive
-- question per selected focus area, or a discovery branch -> constraints
-- -> optional final note).
--
-- This ALTERs the existing one-row-per-user table in place rather than
-- creating a second onboarding system - user_id, completed_at, created_at,
-- updated_at, and every RLS policy/grant from
-- 20260915000000_onboarding_responses.sql are preserved unchanged. Columns
-- that keep the same meaning under the new spec (primary_goal,
-- primary_goal_other, activity_level, barriers, barrier_other, daily_time,
-- habit_times, habit_time_other, constraints, constraints_detail,
-- additional_context) are untouched.
--
-- ADDITIVE ONLY - this migration adds the new onboarding-v2 columns and
-- does not drop, rename, or otherwise alter any existing column, row, RLS
-- policy, or grant. In particular it deliberately KEEPS the five legacy
-- columns the old fixed-flow onboarding used (preferred_activities,
-- activity_other, goal_specific_question, goal_specific_answers,
-- goal_specific_other), because the currently deployed
-- generate-weekly-plan Edge Function still selects them - dropping them
-- now would break live plan generation before that function has its own
-- new-schema update. Those five columns should be removed in a later
-- cleanup migration, and only after the new-schema version of that Edge
-- Function has been deployed and tested successfully.
--
-- This project has no Supabase CLI / migration runner configured yet, so
-- this file is not applied automatically. Run it manually in the Supabase
-- Dashboard SQL Editor (Project -> SQL Editor -> New query), after
-- 20260915000000_onboarding_responses.sql and 20260916190000_weekly_plans.sql.

alter table public.onboarding_responses
  -- Question 2: up to 3 focus areas - permissions for what the coach may
  -- consider, not a quota. Always present (min 1), so not null like the
  -- other required array columns below.
  add column if not exists focus_areas text[] not null default '{}',

  -- Question 3: what's already working, so the plan builds on existing
  -- habits instead of presenting them as new.
  add column if not exists existing_habits text[] not null default '{}',
  add column if not exists existing_habits_other text,

  -- Adaptive focus-area branches (Question 7's old single goal-specific
  -- branch is replaced by up to three of these, one per selected focus
  -- area). Nullable, and left null whenever that focus area - or the
  -- discovery branch - was not selected/shown, never a stale leftover
  -- value from a different selection.
  add column if not exists movement_fit text[],
  add column if not exists movement_fit_other text,

  add column if not exists strength_setup text,
  add column if not exists strength_equipment text[],
  add column if not exists strength_equipment_other text,
  add column if not exists strength_setup_other text,

  add column if not exists food_challenges text[],
  add column if not exists food_challenge_other text,

  add column if not exists sleep_challenges text[],
  add column if not exists sleep_challenge_other text,

  add column if not exists routine_challenges text[],
  add column if not exists routine_challenge_other text,

  add column if not exists stress_challenges text[],
  add column if not exists stress_challenge_other text,

  -- Discovery branch, shown only when "I'm not sure - help me decide" was
  -- selected on Question 2 instead of the six branches above.
  add column if not exists focus_discovery_signals text[];

-- TEMPORARY - legacy columns from the old fixed-flow onboarding
-- (preferred_activities, activity_other, goal_specific_question,
-- goal_specific_answers, goal_specific_other) are intentionally RETAINED
-- here, not dropped. The app no longer writes them (see
-- lib/onboarding.ts), but the currently deployed generate-weekly-plan Edge
-- Function still reads them for every plan generation. Drop them in a
-- follow-up cleanup migration only once that function has been updated to
-- the new onboarding-v2 schema and that update has been deployed and
-- tested successfully - not before.
