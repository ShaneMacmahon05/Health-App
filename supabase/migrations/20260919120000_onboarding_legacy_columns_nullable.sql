-- Legacy onboarding columns must allow NULL.
--
-- The five legacy fixed-flow columns (preferred_activities, activity_other,
-- goal_specific_question, goal_specific_answers, goal_specific_other) were
-- intentionally kept in 20260918120000_onboarding_intake_v2.sql, not
-- dropped, because the currently deployed generate-weekly-plan Edge
-- Function still reads them. But onboarding-v2 (see lib/onboarding.ts) no
-- longer writes values to any of them, and three of the five
-- (preferred_activities, goal_specific_question, goal_specific_answers)
-- were still "not null" from the original schema - so the very first
-- real onboarding-v2 save failed with:
--   null value in column "goal_specific_question" of relation
--   "onboarding_responses" violates not-null constraint
--
-- This migration only relaxes that constraint. It keeps all five columns
-- (still temporary, still pending removal in a later cleanup migration
-- once generate-weekly-plan is updated to the onboarding-v2 schema) and
-- does not touch any onboarding-v2 column, RLS policy, grant, or
-- application code.

alter table public.onboarding_responses
  alter column preferred_activities drop not null,
  alter column activity_other drop not null,
  alter column goal_specific_question drop not null,
  alter column goal_specific_answers drop not null,
  alter column goal_specific_other drop not null;
