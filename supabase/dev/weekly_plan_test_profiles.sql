-- DEV/TEST-ONLY SCRIPT - NOT A MIGRATION.
--
-- Purpose: quickly swap one test account between six fake onboarding-v2
-- profiles (A-F) so the generate-weekly-plan Edge Function (weekly-plan-v4)
-- can be exercised against a range of inputs without re-doing the full
-- adaptive onboarding intake by hand each time.
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
--      six fake profiles below, using the exact stable option `value`s
--      defined in data/onboardingQuestions.ts (the current onboarding-v2
--      adaptive intake - see SCREEN_SPECS_onboarding_v2.md section 5), the
--      same values lib/onboarding.ts's buildOnboardingRow() writes from the
--      real app. Any onboarding-v2 field the profile doesn't use is set to
--      NULL (or, for the handful of not-null array columns, an empty
--      array), matching clearInapplicableBranches()'s "never a stale
--      leftover value" contract, so nothing leaks over from a profile you
--      loaded previously.
--   3. Sets completed_at (and updated_at) so the row reads as a completed
--      onboarding, exactly as Screen 5b's save does.
--   4. Deletes that user's existing weekly_plans rows (plan_actions cascade
--      via `on delete cascade` from supabase/migrations/20260916190000_weekly_plans.sql)
--      so the next "Generate plan" call in the app genuinely regenerates
--      instead of returning the already-saved plan_number.
--   5. Prints which profile was loaded, and returns the updated row plus
--      the remaining weekly_plans count for that user so you can see it
--      worked before you leave the SQL Editor.
--
-- This script intentionally does NOT touch the five legacy fixed-flow
-- columns (preferred_activities, activity_other, goal_specific_question,
-- goal_specific_answers, goal_specific_other). They still exist on
-- onboarding_responses (now nullable - see
-- supabase/migrations/20260919120000_onboarding_legacy_columns_nullable.sql)
-- but weekly-plan-v4's prompt.ts no longer reads them, and onboarding-v2's
-- lib/onboarding.ts no longer writes them - so this script leaves them
-- exactly as they were on the row it's overwriting.
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
  profile_name text := 'A';                                       -- 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  target_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- your test user's auth.users.id
  -- ==========================================================================

  row_exists boolean;
  updated_rows integer;

  v_primary_goal text;
  v_primary_goal_other text;
  v_focus_areas text[];
  v_existing_habits text[];
  v_existing_habits_other text;
  v_activity_level text;
  v_barriers text[];
  v_barrier_other text;
  v_daily_time text;
  v_habit_times text[];
  v_habit_time_other text;
  v_movement_fit text[];
  v_movement_fit_other text;
  v_strength_setup text;
  v_strength_equipment text[];
  v_strength_equipment_other text;
  v_strength_setup_other text;
  v_food_challenges text[];
  v_food_challenge_other text;
  v_sleep_challenges text[];
  v_sleep_challenge_other text;
  v_routine_challenges text[];
  v_routine_challenge_other text;
  v_stress_challenges text[];
  v_stress_challenge_other text;
  v_focus_discovery_signals text[];
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
  -- lib/onboarding.ts's buildOnboardingRow() actually writes them. Fields
  -- belonging to adaptive branches that this persona's focus_areas would
  -- never reach are left NULL, mirroring clearInapplicableBranches().

  if profile_name = 'A' then
    -- Persona: low-energy beginner.
    -- Q1 primaryGoal=more_energy
    -- Q2 focusAreas=everyday_movement,daily_routine
    -- Q3 existingHabits=just_getting_started (exclusive)
    -- Q4 activityLevel=hardly_at_all
    -- Q5 barriers=low_energy,struggle_to_keep_going
    -- Q6 dailyTime=five_to_ten_minutes
    -- Q7 habitTimes=changes_day_to_day (exclusive)
    -- Branch A (everyday_movement) movementFit=short_walks,movement_breaks
    -- Branch E (daily_routine) routineChallenges=getting_started,days_change_too_much
    -- Constraints=nothing_right_now (exclusive)
    v_primary_goal := 'more_energy';
    v_primary_goal_other := null;
    v_focus_areas := array['everyday_movement', 'daily_routine'];
    v_existing_habits := array['just_getting_started'];
    v_existing_habits_other := null;
    v_activity_level := 'hardly_at_all';
    v_barriers := array['low_energy', 'struggle_to_keep_going'];
    v_barrier_other := null;
    v_daily_time := 'five_to_ten_minutes';
    v_habit_times := array['changes_day_to_day'];
    v_habit_time_other := null;
    v_movement_fit := array['short_walks', 'movement_breaks'];
    v_movement_fit_other := null;
    v_strength_setup := null;
    v_strength_equipment := null;
    v_strength_equipment_other := null;
    v_strength_setup_other := null;
    v_food_challenges := null;
    v_food_challenge_other := null;
    v_sleep_challenges := null;
    v_sleep_challenge_other := null;
    v_routine_challenges := array['getting_started', 'days_change_too_much'];
    v_routine_challenge_other := null;
    v_stress_challenges := null;
    v_stress_challenge_other := null;
    v_focus_discovery_signals := null;
    v_constraints := array['nothing_right_now'];
    v_constraints_detail := null;
    v_additional_context := 'I''d rather start with something really small and manageable than something ambitious I know I won''t keep up.';

  elsif profile_name = 'B' then
    -- Persona: strength beginner who doesn't know what to do.
    -- Q1 primaryGoal=stronger_fitter (auto-requires focusAreas=strength_exercise)
    -- Q2 focusAreas=strength_exercise
    -- Q3 existingHabits=just_getting_started (no established strength routine)
    -- Q4 activityLevel=one_to_two_days
    -- Q5 barriers=not_knowing_what_to_do
    -- Q6 dailyTime=around_thirty_minutes
    -- Q7 habitTimes=after_work
    -- Branch B (strength_exercise) strengthSetup=home_with_equipment ->
    --   strengthEquipment follow-up screen shown -> dumbbells,resistance_bands
    -- Constraints=nothing_right_now (exclusive)
    v_primary_goal := 'stronger_fitter';
    v_primary_goal_other := null;
    v_focus_areas := array['strength_exercise'];
    v_existing_habits := array['just_getting_started'];
    v_existing_habits_other := null;
    v_activity_level := 'one_to_two_days';
    v_barriers := array['not_knowing_what_to_do'];
    v_barrier_other := null;
    v_daily_time := 'around_thirty_minutes';
    v_habit_times := array['after_work'];
    v_habit_time_other := null;
    v_movement_fit := null;
    v_movement_fit_other := null;
    v_strength_setup := 'home_with_equipment';
    v_strength_equipment := array['dumbbells', 'resistance_bands'];
    v_strength_equipment_other := null;
    v_strength_setup_other := null;
    v_food_challenges := null;
    v_food_challenge_other := null;
    v_sleep_challenges := null;
    v_sleep_challenge_other := null;
    v_routine_challenges := null;
    v_routine_challenge_other := null;
    v_stress_challenges := null;
    v_stress_challenge_other := null;
    v_focus_discovery_signals := null;
    v_constraints := array['nothing_right_now'];
    v_constraints_detail := null;
    v_additional_context := 'I''d rather follow a simple routine someone gives me than try to work out which exercises to do myself.';

  elsif profile_name = 'C' then
    -- Persona: busy food-planning profile.
    -- Q1 primaryGoal=eat_better (auto-requires focusAreas=food)
    -- Q2 focusAreas=food,daily_routine
    -- Q3 existingHabits=regular_meals
    -- Q4 activityLevel=three_to_four_days (not a major issue for this persona)
    -- Q5 barriers=not_enough_time,work_schedule
    -- Q6 dailyTime=fifteen_to_twenty_minutes
    -- Q7 habitTimes=day_lunch,after_work
    -- Branch C (food) foodChallenges=lunch_during_day,planning
    -- Branch E (daily_routine) routineChallenges=finding_time
    -- Constraints=nothing_right_now (exclusive; no constraint fits this persona)
    v_primary_goal := 'eat_better';
    v_primary_goal_other := null;
    v_focus_areas := array['food', 'daily_routine'];
    v_existing_habits := array['regular_meals'];
    v_existing_habits_other := null;
    v_activity_level := 'three_to_four_days';
    v_barriers := array['not_enough_time', 'work_schedule'];
    v_barrier_other := null;
    v_daily_time := 'fifteen_to_twenty_minutes';
    v_habit_times := array['day_lunch', 'after_work'];
    v_habit_time_other := null;
    v_movement_fit := null;
    v_movement_fit_other := null;
    v_strength_setup := null;
    v_strength_equipment := null;
    v_strength_equipment_other := null;
    v_strength_setup_other := null;
    v_food_challenges := array['lunch_during_day', 'planning'];
    v_food_challenge_other := null;
    v_sleep_challenges := null;
    v_sleep_challenge_other := null;
    v_routine_challenges := array['finding_time'];
    v_routine_challenge_other := null;
    v_stress_challenges := null;
    v_stress_challenge_other := null;
    v_focus_discovery_signals := null;
    v_constraints := array['nothing_right_now'];
    v_constraints_detail := null;
    v_additional_context := 'I want food decisions to take less thought during the day, especially around lunch.';

  elsif profile_name = 'D' then
    -- Persona: sleep-focused profile.
    -- Q1 primaryGoal=sleep_better (auto-requires focusAreas=sleep)
    -- Q2 focusAreas=sleep,daily_routine
    -- Q3 existingHabits=just_getting_started (deliberately NOT sleep_routine -
    --   variable shift work means nothing feels consistent right now)
    -- Q4 activityLevel=varies_a_lot (not specified by the persona brief;
    --   chosen as the value most consistent with variable shift work)
    -- Q5 barriers=work_schedule
    -- Q6 dailyTime=fifteen_to_twenty_minutes
    -- Q7 habitTimes=evening
    -- Branch D (sleep) sleepChallenges=bedtime_delay,schedule_changes
    --   (deliberately NOT phone_tv - this persona tests whether the AI
    --   invents phone/screen use as an unstated cause)
    -- Branch E (daily_routine) routineChallenges=days_change_too_much
    -- Constraints=work_shift_schedule
    v_primary_goal := 'sleep_better';
    v_primary_goal_other := null;
    v_focus_areas := array['sleep', 'daily_routine'];
    v_existing_habits := array['just_getting_started'];
    v_existing_habits_other := null;
    v_activity_level := 'varies_a_lot';
    v_barriers := array['work_schedule'];
    v_barrier_other := null;
    v_daily_time := 'fifteen_to_twenty_minutes';
    v_habit_times := array['evening'];
    v_habit_time_other := null;
    v_movement_fit := null;
    v_movement_fit_other := null;
    v_strength_setup := null;
    v_strength_equipment := null;
    v_strength_equipment_other := null;
    v_strength_setup_other := null;
    v_food_challenges := null;
    v_food_challenge_other := null;
    v_sleep_challenges := array['bedtime_delay', 'schedule_changes'];
    v_sleep_challenge_other := null;
    v_routine_challenges := array['days_change_too_much'];
    v_routine_challenge_other := null;
    v_stress_challenges := null;
    v_stress_challenge_other := null;
    v_focus_discovery_signals := null;
    v_constraints := array['work_shift_schedule'];
    v_constraints_detail := null;
    v_additional_context := 'My shift times vary from week to week, so a fixed sleep schedule isn''t really possible for me right now.';

  elsif profile_name = 'E' then
    -- Persona: unpredictable routine.
    -- Q1 primaryGoal=more_consistent (auto-requires focusAreas=daily_routine)
    -- Q2 focusAreas=daily_routine,everyday_movement
    -- Q3 existingHabits=walking_regularly (some walking, when it happens)
    -- Q4 activityLevel=varies_a_lot
    -- Q5 barriers=struggle_to_keep_going,work_schedule
    -- Q6 dailyTime=depends_on_day
    -- Q7 habitTimes=changes_day_to_day (exclusive)
    -- Branch A (everyday_movement) movementFit=short_walks,existing_routine
    -- Branch E (daily_routine) routineChallenges=days_change_too_much,one_miss_derails
    -- Constraints=work_shift_schedule
    v_primary_goal := 'more_consistent';
    v_primary_goal_other := null;
    v_focus_areas := array['daily_routine', 'everyday_movement'];
    v_existing_habits := array['walking_regularly'];
    v_existing_habits_other := null;
    v_activity_level := 'varies_a_lot';
    v_barriers := array['struggle_to_keep_going', 'work_schedule'];
    v_barrier_other := null;
    v_daily_time := 'depends_on_day';
    v_habit_times := array['changes_day_to_day'];
    v_habit_time_other := null;
    v_movement_fit := array['short_walks', 'existing_routine'];
    v_movement_fit_other := null;
    v_strength_setup := null;
    v_strength_equipment := null;
    v_strength_equipment_other := null;
    v_strength_setup_other := null;
    v_food_challenges := null;
    v_food_challenge_other := null;
    v_sleep_challenges := null;
    v_sleep_challenge_other := null;
    v_routine_challenges := array['days_change_too_much', 'one_miss_derails'];
    v_routine_challenge_other := null;
    v_stress_challenges := null;
    v_stress_challenge_other := null;
    v_focus_discovery_signals := null;
    v_constraints := array['work_shift_schedule'];
    v_constraints_detail := null;
    v_additional_context := 'A rigid weekly schedule doesn''t really work for me - my days change too much for fixed times or fixed days.';

  elsif profile_name = 'F' then
    -- Persona: unsure beginner / discovery.
    -- Q1 primaryGoal=feel_better_overall
    -- Q2 focusAreas=not_sure (exclusive - replaces the six normal branches
    --   with the discovery branch)
    -- Q3 existingHabits=just_getting_started (exclusive)
    -- Q4 activityLevel=hardly_at_all
    -- Q5 barriers=not_knowing_what_to_do
    -- Q6 dailyTime=fifteen_to_twenty_minutes
    -- Q7 habitTimes=changes_day_to_day (exclusive)
    -- Discovery branch focusDiscoverySignals=low_energy,movement_uncertain
    -- No focus-specific branch fields populated (not_sure skips all six)
    -- Constraints=nothing_right_now (exclusive)
    v_primary_goal := 'feel_better_overall';
    v_primary_goal_other := null;
    v_focus_areas := array['not_sure'];
    v_existing_habits := array['just_getting_started'];
    v_existing_habits_other := null;
    v_activity_level := 'hardly_at_all';
    v_barriers := array['not_knowing_what_to_do'];
    v_barrier_other := null;
    v_daily_time := 'fifteen_to_twenty_minutes';
    v_habit_times := array['changes_day_to_day'];
    v_habit_time_other := null;
    v_movement_fit := null;
    v_movement_fit_other := null;
    v_strength_setup := null;
    v_strength_equipment := null;
    v_strength_equipment_other := null;
    v_strength_setup_other := null;
    v_food_challenges := null;
    v_food_challenge_other := null;
    v_sleep_challenges := null;
    v_sleep_challenge_other := null;
    v_routine_challenges := null;
    v_routine_challenge_other := null;
    v_stress_challenges := null;
    v_stress_challenge_other := null;
    v_focus_discovery_signals := array['low_energy', 'movement_uncertain'];
    v_constraints := array['nothing_right_now'];
    v_constraints_detail := null;
    v_additional_context := 'I''m not really sure yet what would actually work for me or what I''d be able to stick with.';

  else
    raise exception 'Unknown profile_name ''%''. Use one of: A, B, C, D, E, F.', profile_name;
  end if;

  update public.onboarding_responses
  set
    primary_goal = v_primary_goal,
    primary_goal_other = v_primary_goal_other,
    focus_areas = v_focus_areas,
    existing_habits = v_existing_habits,
    existing_habits_other = v_existing_habits_other,
    activity_level = v_activity_level,
    barriers = v_barriers,
    barrier_other = v_barrier_other,
    daily_time = v_daily_time,
    habit_times = v_habit_times,
    habit_time_other = v_habit_time_other,
    movement_fit = v_movement_fit,
    movement_fit_other = v_movement_fit_other,
    strength_setup = v_strength_setup,
    strength_equipment = v_strength_equipment,
    strength_equipment_other = v_strength_equipment_other,
    strength_setup_other = v_strength_setup_other,
    food_challenges = v_food_challenges,
    food_challenge_other = v_food_challenge_other,
    sleep_challenges = v_sleep_challenges,
    sleep_challenge_other = v_sleep_challenge_other,
    routine_challenges = v_routine_challenges,
    routine_challenge_other = v_routine_challenge_other,
    stress_challenges = v_stress_challenges,
    stress_challenge_other = v_stress_challenge_other,
    focus_discovery_signals = v_focus_discovery_signals,
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

  raise notice 'Loaded test profile % for user % (goal=%, focus_areas=%, activity=%, time=%) - onboarding row updated, weekly_plans cleared.',
    profile_name, target_user_id, v_primary_goal, v_focus_areas, v_activity_level, v_daily_time;
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
