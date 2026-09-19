import { clearInapplicableBranches } from "@/data/onboardingQuestions";
import { supabase } from "@/lib/supabase";
import type { OnboardingAnswers, OnboardingResponseRow } from "@/types/onboarding";

function toNullableText(text: string): string | null {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableArray(values: string[]): string[] | null {
  return values.length > 0 ? values : null;
}

// Converts the ephemeral Zustand onboarding answers into the DB row shape.
// Runs clearInapplicableBranches() defensively one more time here (the
// store already clears stale branch answers as the user navigates) so a
// branch the current focus areas don't support is always saved as null,
// never a leftover value from an earlier selection.
export function buildOnboardingRow(userId: string, rawAnswers: OnboardingAnswers): OnboardingResponseRow {
  const answers = clearInapplicableBranches(rawAnswers);

  return {
    user_id: userId,
    primary_goal: answers.primaryGoal[0] ?? "",
    primary_goal_other: toNullableText(answers.primaryGoalOther),
    focus_areas: answers.focusAreas,
    existing_habits: answers.existingHabits,
    existing_habits_other: toNullableText(answers.existingHabitsOther),
    activity_level: answers.activityLevel[0] ?? "",
    barriers: answers.barriers,
    barrier_other: toNullableText(answers.barrierOther),
    daily_time: answers.dailyTime[0] ?? "",
    habit_times: answers.habitTimes,
    habit_time_other: toNullableText(answers.habitTimeOther),
    movement_fit: toNullableArray(answers.movementFit),
    movement_fit_other: toNullableText(answers.movementFitOther),
    strength_setup: answers.strengthSetup[0] ?? null,
    strength_equipment: toNullableArray(answers.strengthEquipment),
    strength_equipment_other: toNullableText(answers.strengthEquipmentOther),
    strength_setup_other: toNullableText(answers.strengthSetupOther),
    food_challenges: toNullableArray(answers.foodChallenges),
    food_challenge_other: toNullableText(answers.foodChallengeOther),
    sleep_challenges: toNullableArray(answers.sleepChallenges),
    sleep_challenge_other: toNullableText(answers.sleepChallengeOther),
    routine_challenges: toNullableArray(answers.routineChallenges),
    routine_challenge_other: toNullableText(answers.routineChallengeOther),
    stress_challenges: toNullableArray(answers.stressChallenges),
    stress_challenge_other: toNullableText(answers.stressChallengeOther),
    focus_discovery_signals: toNullableArray(answers.focusDiscoverySignals),
    constraints: answers.constraints,
    constraints_detail: toNullableText(answers.constraintsDetail),
    additional_context: toNullableText(answers.additionalContext),
    completed_at: new Date().toISOString(),
  };
}

// Saves the complete onboarding batch for the signed-in user. Upserts on
// user_id (the table's primary key) so retrying after a network failure
// updates the same row instead of creating a duplicate. Returns a plain
// error string rather than throwing, so the calling screen can show it
// inline and offer Retry without losing any onboarding answers.
export async function saveOnboardingResponses(
  answers: OnboardingAnswers
): Promise<{ error: string | null }> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You need to be signed in to save your answers." };
  }

  const row = buildOnboardingRow(user.id, answers);

  const { error } = await supabase
    .from("onboarding_responses")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export type OnboardingStatus =
  | { status: "complete" }
  | { status: "incomplete" }
  | { status: "error"; error: string };

// Supabase is the source of truth for onboarding completion - a user is
// complete only when their own onboarding_responses row exists with a
// non-null completed_at. Do not use AsyncStorage/Zustand as this flag.
//
// Returns a tri-state result rather than a boolean: a failed auth/DB lookup
// is a distinct "error" state from a genuine "incomplete," so callers (e.g.
// Login) can retry instead of silently routing a lookup failure into
// onboarding.
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { status: "error", error: userError.message };
  }

  if (!user) {
    return { status: "error", error: "You need to be signed in." };
  }

  const { data, error } = await supabase
    .from("onboarding_responses")
    .select("completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { status: "error", error: error.message };
  }

  return data?.completed_at ? { status: "complete" } : { status: "incomplete" };
}
