-- DEV/TEST-ONLY SCRIPT - NOT A MIGRATION.
--
-- Purpose: quickly swap one test account between six fake onboarding
-- profiles (A-F) so the generate-weekly-plan Edge Function can be exercised
-- against a range of inputs without re-doing the 9-screen onboarding flow
-- by hand each time.
--
-- This file is never run automatically (no Supabase CLI migration runner is
-- configured in this project - see supabase/migrations/*.sql headers). Run
-- it manually, on purpose, in Supabase Dashboard -> SQL Editor.
--
-- What it does:
--   1. Validates the target user already has an onboarding_responses row
--      (never inserts a new one - this is a test account you created
--      through the real app's sign-up + onboarding flow at least once).
--   2. Overwrites ONLY that user's onboarding_responses row with one of the
--      six fake profiles below, using the exact internal option values
--      defined in data/onboardingQuestions.ts (see the comment above each
--      profile for the source questions). Any field the profile doesn't
--      use is set to NULL, so nothing leaks over from a profile you loaded
--      previously.
--   3. Deletes that user's existing weekly_plans rows (plan_actions cascade
--      via `on delete cascade` from supabase/migrations/20260916190000_weekly_plans.sql)
--      so the next "Generate plan" call in the app genuinely regenerates
--      instead of returning the already-saved plan_number.
--   4. Prints which profile was loaded, and returns the updated row plus
--      the remaining weekly_plans count for that user so you can see it
--      worked before you leave the SQL Editor.
--
-- Scope/safety:
--   - Only ever touches the one user_id you set below (both the UPDATE and
--     the DELETE are scoped `where user_id = target_user_id`).
--   - No service-role key - run this as yourself in the SQL Editor, which
--     already has full table access there; it does not change or bypass
--     RLS, and defines no permanent function (everything lives inside one
--     throwaway `do $$ ... $$` block that stops existing once it finishes).
--   - Does not touch migrations, Edge Functions, RLS policies, or the Plan
--     UI - onboarding_responses and weekly_plans are just normal tables to
--     this script.
--
-- ============================================================================
-- >>> EDIT THESE TWO VALUES, THEN RUN THE WHOLE FILE <<<
-- ============================================================================
do $$
declare
  profile_name text := 'C';                                  -- 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  target_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- your test user's auth.users.id
  -- ==========================================================================

  row_exists boolean;
  updated_rows integer;

  v_primary_goal text;
  v_primary_goal_other text;
  v_activity_level text;
  v_barriers text[];
  v_barrier_other text;
  v_daily_time text;
  v_preferred_activities text[];
  v_activity_other text;
  v_habit_times text[];
  v_habit_time_other text;
  v_goal_specific_question text;
  v_goal_specific_answers text[];
  v_goal_specific_other text;
  v_constraints text[];
  v_constraints_detail text;
  v_additional_context text;
begin
  if target_user_id = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Set target_user_id to a real test user id before running this script.';
  end if;

  select exists (
    select 1 from public.onboarding_responses where user_id = target_user_id
  ) into row_exists;

  if not row_exists then
    raise exception
      'No onboarding_responses row for user %. This script only overwrites an existing row - complete onboarding once for this test account in the app first.',
      target_user_id;
  end if;

  -- Every field below uses the exact stable option `value`s from
  -- data/onboardingQuestions.ts (not the display labels), matching how
  -- lib/onboarding.ts's buildOnboardingRow() actually writes them.

  if profile_name = 'A' then
    -- Persona: low-energy beginner.
    -- Q1 primaryGoal=more_energy | Q2 currentActivity=hardly_at_all
    -- Q3 barriers=not_enough_time,caring_responsibilities | Q4 timeAvailable=five_to_ten_minutes
    -- Q5 activityPreferences=walking | Q6 whenItFits=during_the_day
    -- Q7 (more_energy branch) goalSpecific=afternoon
    -- Q8 constraints=caring_responsibilities
    v_primary_goal := 'more_energy';
    v_primary_goal_other := null;
    v_activity_level := 'hardly_at_all';
    v_barriers := array['not_enough_time', 'caring_responsibilities'];
    v_barrier_other := null;
    v_daily_time := 'five_to_ten_minutes';
    v_preferred_activities := array['walking'];
    v_activity_other := null;
    v_habit_times := array['during_the_day'];
    v_habit_time_other := null;
    v_goal_specific_question := 'more_energy';
    v_goal_specific_answers := array['afternoon'];
    v_goal_specific_other := null;
    v_constraints := array['caring_responsibilities'];
    v_constraints_detail := null;
    v_additional_context := 'My days are pretty unpredictable and I really don''t want to use a gym.';

  elsif profile_name = 'B' then
    -- Persona: existing gym user wanting strength.
    -- Q1 primaryGoal=feel_stronger | Q2 currentActivity=three_to_four_days
    -- Q3 barriers=not_knowing_what_to_do | Q4 timeAvailable=around_thirty_minutes
    -- Q5 activityPreferences=gym | Q6 whenItFits=after_work,weekends
    -- Q7 (feel_stronger branch, multi-select) goalSpecific=gym
    -- Q8 constraints=nothing_right_now
    v_primary_goal := 'feel_stronger';
    v_primary_goal_other := null;
    v_activity_level := 'three_to_four_days';
    v_barriers := array['not_knowing_what_to_do'];
    v_barrier_other := null;
    v_daily_time := 'around_thirty_minutes';
    v_preferred_activities := array['gym'];
    v_activity_other := null;
    v_habit_times := array['after_work', 'weekends'];
    v_habit_time_other := null;
    v_goal_specific_question := 'feel_stronger';
    v_goal_specific_answers := array['gym'];
    v_goal_specific_other := null;
    v_constraints := array['nothing_right_now'];
    v_constraints_detail := null;
    v_additional_context := 'I already go to the gym a few times a week but don''t really have structure to what I''m doing.';

  elsif profile_name = 'C' then
    -- Persona: busy nutrition user.
    -- Q1 primaryGoal=eat_better | Q2 currentActivity=one_to_two_days
    -- Q3 barriers=not_enough_time,work_schedule | Q4 timeAvailable=fifteen_to_twenty_minutes
    -- Q5 activityPreferences=walking | Q6 whenItFits=during_the_day,evening
    -- Q7 (eat_better branch, single-select) goalSpecific=busy_mornings_lunches
    --   (the "takeaways/convenience food" half of the persona is captured in
    --   additional_context below, since this branch only stores one value)
    -- Q8 constraints=work_shift_schedule
    v_primary_goal := 'eat_better';
    v_primary_goal_other := null;
    v_activity_level := 'one_to_two_days';
    v_barriers := array['not_enough_time', 'work_schedule'];
    v_barrier_other := null;
    v_daily_time := 'fifteen_to_twenty_minutes';
    v_preferred_activities := array['walking'];
    v_activity_other := null;
    v_habit_times := array['during_the_day', 'evening'];
    v_habit_time_other := null;
    v_goal_specific_question := 'eat_better';
    v_goal_specific_answers := array['busy_mornings_lunches'];
    v_goal_specific_other := null;
    v_constraints := array['work_shift_schedule'];
    v_constraints_detail := null;
    v_additional_context := 'I often end up buying lunch because I haven''t planned anything, and I want food that doesn''t take much thought.';

  elsif profile_name = 'D' then
    -- Persona: sleep/routine user.
    -- Q1 primaryGoal=sleep_better | Q2 currentActivity=one_to_two_days
    -- Q3 barriers=low_energy,work_schedule | Q4 timeAvailable=fifteen_to_twenty_minutes
    -- Q5 activityPreferences=walking,stretching_mobility | Q6 whenItFits=evening
    -- Q7 (sleep_better branch, single-select) goalSpecific=getting_to_bed_on_time
    --   (the "inconsistent schedule" half of the persona is captured in
    --   additional_context below, since this branch only stores one value)
    -- Q8 constraints=work_shift_schedule
    v_primary_goal := 'sleep_better';
    v_primary_goal_other := null;
    v_activity_level := 'one_to_two_days';
    v_barriers := array['low_energy', 'work_schedule'];
    v_barrier_other := null;
    v_daily_time := 'fifteen_to_twenty_minutes';
    v_preferred_activities := array['walking', 'stretching_mobility'];
    v_activity_other := null;
    v_habit_times := array['evening'];
    v_habit_time_other := null;
    v_goal_specific_question := 'sleep_better';
    v_goal_specific_answers := array['getting_to_bed_on_time'];
    v_goal_specific_other := null;
    v_constraints := array['work_shift_schedule'];
    v_constraints_detail := null;
    v_additional_context := 'My bedtime moves around a lot and I often end up staying up later than I meant to.';

  elsif profile_name = 'E' then
    -- Persona: unpredictable routine user.
    -- Q1 primaryGoal=routine | Q2 currentActivity=one_to_two_days
    -- Q3 barriers=motivation,work_schedule | Q4 timeAvailable=fifteen_to_twenty_minutes
    -- Q5 activityPreferences=walking,home_workouts | Q6 whenItFits=it_changes
    -- Q7 (routine branch, single-select) goalSpecific=schedule_changes_constantly
    -- Q8 constraints=work_shift_schedule
    v_primary_goal := 'routine';
    v_primary_goal_other := null;
    v_activity_level := 'one_to_two_days';
    v_barriers := array['motivation', 'work_schedule'];
    v_barrier_other := null;
    v_daily_time := 'fifteen_to_twenty_minutes';
    v_preferred_activities := array['walking', 'home_workouts'];
    v_activity_other := null;
    v_habit_times := array['it_changes'];
    v_habit_time_other := null;
    v_goal_specific_question := 'routine';
    v_goal_specific_answers := array['schedule_changes_constantly'];
    v_goal_specific_other := null;
    v_constraints := array['work_shift_schedule'];
    v_constraints_detail := null;
    v_additional_context := 'Some days are packed and some are really quiet, so fixed times are hard for me to stick to.';

  elsif profile_name = 'F' then
    -- Persona: general wellbeing / unsure beginner.
    -- Q1 primaryGoal=feel_better_overall | Q2 currentActivity=hardly_at_all
    -- Q3 barriers=not_knowing_what_to_do,motivation | Q4 timeAvailable=fifteen_to_twenty_minutes
    -- Q5 activityPreferences=not_sure_yet | Q6 whenItFits=it_changes
    -- Q7 (feel_better_overall branch, single-select) goalSpecific=not_sure
    -- Q8 constraints=nothing_right_now
    v_primary_goal := 'feel_better_overall';
    v_primary_goal_other := null;
    v_activity_level := 'hardly_at_all';
    v_barriers := array['not_knowing_what_to_do', 'motivation'];
    v_barrier_other := null;
    v_daily_time := 'fifteen_to_twenty_minutes';
    v_preferred_activities := array['not_sure_yet'];
    v_activity_other := null;
    v_habit_times := array['it_changes'];
    v_habit_time_other := null;
    v_goal_specific_question := 'feel_better_overall';
    v_goal_specific_answers := array['not_sure'];
    v_goal_specific_other := null;
    v_constraints := array['nothing_right_now'];
    v_constraints_detail := null;
    v_additional_context := 'I want to feel better day to day but I''m not really sure where to start.';

  else
    raise exception 'Unknown profile_name ''%''. Use one of: A, B, C, D, E, F.', profile_name;
  end if;

  update public.onboarding_responses
  set
    primary_goal = v_primary_goal,
    primary_goal_other = v_primary_goal_other,
    activity_level = v_activity_level,
    barriers = v_barriers,
    barrier_other = v_barrier_other,
    daily_time = v_daily_time,
    preferred_activities = v_preferred_activities,
    activity_other = v_activity_other,
    habit_times = v_habit_times,
    habit_time_other = v_habit_time_other,
    goal_specific_question = v_goal_specific_question,
    goal_specific_answers = v_goal_specific_answers,
    goal_specific_other = v_goal_specific_other,
    constraints = v_constraints,
    constraints_detail = v_constraints_detail,
    additional_context = v_additional_context,
    completed_at = now(),
    updated_at = now()
  where user_id = target_user_id;

  get diagnostics updated_rows = row_count;
  if updated_rows <> 1 then
    raise exception 'Expected to update exactly 1 onboarding_responses row, updated %.', updated_rows;
  end if;

  -- Force the next "Generate plan" call to regenerate from scratch.
  -- plan_actions rows are removed automatically via their
  -- `on delete cascade` foreign key to weekly_plans.
  delete from public.weekly_plans where user_id = target_user_id;

  raise notice 'Loaded test profile % for user % (goal=%, activity=%, time=%) - onboarding row updated, weekly_plans cleared.',
    profile_name, target_user_id, v_primary_goal, v_activity_level, v_daily_time;
end $$;

-- Confirmation query - shows the row this script just wrote, and proves
-- weekly_plans was cleared for this user. Uses `select ... limit 1` instead
-- of a hardcoded user id, so there's nothing to edit here.
select
  o.*,
  (select count(*) from public.weekly_plans wp where wp.user_id = o.user_id) as remaining_weekly_plans
from public.onboarding_responses o
order by o.updated_at desc
limit 1;
