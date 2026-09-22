// Fields that hold one or more selected option values (single-select
// questions still store a single-item array, same convention as before).
// Every structured onboarding question - including each adaptive
// focus-area branch - maps to exactly one of these.
export type OnboardingFieldId =
  | "primaryGoal"
  | "focusAreas"
  | "existingHabits"
  | "activityLevel"
  | "barriers"
  | "dailyTime"
  | "habitTimes"
  | "movementFit"
  | "strengthSetup"
  | "strengthEquipment"
  | "foodChallenges"
  | "sleepChallenges"
  | "routineChallenges"
  | "stressChallenges"
  | "focusDiscoverySignals"
  | "constraints";

// Fields that hold free text revealed by a specific option (a "Something
// else" catch-all, or a narrower reveal like the strength branch's
// equipment detail). Every question can reveal zero or more of these,
// declared per-option via OnboardingOption.reveals below.
export type OnboardingTextFieldId =
  | "primaryGoalOther"
  | "existingHabitsOther"
  | "barrierOther"
  | "habitTimeOther"
  | "movementFitOther"
  | "strengthEquipmentOther"
  | "strengthSetupOther"
  | "foodChallengeOther"
  | "sleepChallengeOther"
  | "routineChallengeOther"
  | "stressChallengeOther"
  | "constraintsDetail";

export interface OnboardingAnswers {
  primaryGoal: string[];
  primaryGoalOther: string;
  focusAreas: string[];
  existingHabits: string[];
  existingHabitsOther: string;
  activityLevel: string[];
  barriers: string[];
  barrierOther: string;
  dailyTime: string[];
  habitTimes: string[];
  habitTimeOther: string;
  movementFit: string[];
  movementFitOther: string;
  strengthSetup: string[];
  strengthEquipment: string[];
  strengthEquipmentOther: string;
  strengthSetupOther: string;
  foodChallenges: string[];
  foodChallengeOther: string;
  sleepChallenges: string[];
  sleepChallengeOther: string;
  routineChallenges: string[];
  routineChallengeOther: string;
  stressChallenges: string[];
  stressChallengeOther: string;
  focusDiscoverySignals: string[];
  constraints: string[];
  constraintsDetail: string;
  // Screen 5b's optional final free-text answer.
  additionalContext: string;
}

export type SelectionType = "single" | "multi";

export interface OnboardingOptionReveal {
  field: OnboardingTextFieldId;
  label: string;
  // "Something else" style fields must be non-blank before Next; narrower
  // reveals like the strength branch's equipment detail stay optional.
  required: boolean;
}

export interface OnboardingOption {
  value: string;
  label: string;
  // Selecting this option clears every other selection for the question
  // (and picking anything else clears this one) - e.g. "Nothing right now".
  exclusive?: boolean;
  // Selecting this option reveals a free-text field. Several options on the
  // same question may point at the same field (e.g. Constraints), in which
  // case one shared text box is shown while any of them is selected.
  reveals?: OnboardingOptionReveal;
}

export interface OnboardingQuestionDef {
  id: OnboardingFieldId;
  question: string;
  supportingText?: string;
  selectionType: SelectionType;
  maxSelections?: number;
  options: OnboardingOption[];
}

// Shape of the one-row-per-user `onboarding_responses` table in Supabase -
// the batched, camelCase `OnboardingAnswers` is converted into this on
// final submit. See lib/onboarding.ts. Fields for adaptive branches that
// weren't shown (wrong focus area, or the discovery branch not reached)
// are `null`, never a stale leftover array/string.
export interface OnboardingResponseRow {
  user_id: string;
  primary_goal: string;
  primary_goal_other: string | null;
  focus_areas: string[];
  existing_habits: string[];
  existing_habits_other: string | null;
  activity_level: string;
  barriers: string[];
  barrier_other: string | null;
  daily_time: string;
  habit_times: string[];
  habit_time_other: string | null;
  movement_fit: string[] | null;
  movement_fit_other: string | null;
  strength_setup: string | null;
  strength_equipment: string[] | null;
  strength_equipment_other: string | null;
  strength_setup_other: string | null;
  food_challenges: string[] | null;
  food_challenge_other: string | null;
  sleep_challenges: string[] | null;
  sleep_challenge_other: string | null;
  routine_challenges: string[] | null;
  routine_challenge_other: string | null;
  stress_challenges: string[] | null;
  stress_challenge_other: string | null;
  focus_discovery_signals: string[] | null;
  constraints: string[];
  constraints_detail: string | null;
  additional_context: string | null;
  completed_at: string;
}
