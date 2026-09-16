import { supabase } from "@/lib/supabase";
import type { OnboardingAnswers, OnboardingResponseRow } from "@/types/onboarding";

function toNullable(text: string): string | null {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Converts the ephemeral Zustand onboarding answers into the DB row shape.
// goal_specific_question records which Question 7 branch was shown - since
// that branch is chosen 1:1 by primaryGoal (see data/onboardingQuestions.ts'
// goalSpecificQuestions map), the primary goal value itself is already the
// stable machine-readable id for "which question this is," so it's reused
// here rather than inventing a second identifier.
export function buildOnboardingRow(
  userId: string,
  answers: OnboardingAnswers
): OnboardingResponseRow {
  return {
    user_id: userId,
    primary_goal: answers.primaryGoal[0] ?? "",
    primary_goal_other: toNullable(answers.primaryGoalOther),
    activity_level: answers.currentActivity[0] ?? "",
    barriers: answers.barriers,
    barrier_other: toNullable(answers.barriersOther),
    daily_time: answers.timeAvailable[0] ?? "",
    preferred_activities: answers.activityPreferences,
    activity_other: toNullable(answers.activityPreferencesOther),
    habit_times: answers.whenItFits,
    habit_time_other: toNullable(answers.whenItFitsOther),
    goal_specific_question: answers.primaryGoal[0] ?? "",
    goal_specific_answers: answers.goalSpecific,
    goal_specific_other: toNullable(answers.goalSpecificOther),
    constraints: answers.constraints,
    constraints_detail: toNullable(answers.constraintsOther),
    additional_context: toNullable(answers.finalNote),
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
