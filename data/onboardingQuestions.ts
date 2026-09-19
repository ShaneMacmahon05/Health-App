import type {
  OnboardingAnswers,
  OnboardingFieldId,
  OnboardingOption,
  OnboardingQuestionDef,
  OnboardingTextFieldId,
} from "@/types/onboarding";

const SOMETHING_ELSE = "Something else";
const SOMETHING_ELSE_LABEL = "Tell us in a few words";

// Question 1 - Primary outcome. Answering this can auto-select a focus area
// on Question 2 (see REQUIRED_FOCUS_AREA_BY_GOAL below).
const primaryGoalQuestion: OnboardingQuestionDef = {
  id: "primaryGoal",
  question: "What would make the biggest difference to how you feel right now?",
  selectionType: "single",
  options: [
    { value: "more_energy", label: "Have more energy" },
    { value: "stronger_fitter", label: "Feel stronger and fitter" },
    { value: "eat_better", label: "Eat better without overthinking it" },
    { value: "sleep_better", label: "Sleep better" },
    { value: "more_consistent", label: "Feel more consistent and in control" },
    { value: "feel_better_overall", label: "Feel better overall" },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "primaryGoalOther", label: "What would you most like to improve?", required: true },
    },
  ],
};

// Question 1 -> Question 2: where the mapping is obvious, the matching
// focus area is preselected, required, and counts toward the max of 3.
export const REQUIRED_FOCUS_AREA_BY_GOAL: Partial<Record<string, string>> = {
  eat_better: "food",
  sleep_better: "sleep",
  stronger_fitter: "strength_exercise",
  more_consistent: "daily_routine",
};

// Question 2 - Focus areas. Permissions for what the coach may consider,
// not quotas - selecting an area never forces an action from it.
const focusAreasQuestion: OnboardingQuestionDef = {
  id: "focusAreas",
  question: "Which parts of your routine would you be open to working on?",
  supportingText:
    "Choose up to 3. You won't necessarily get a goal for every area — this just helps us understand what could work for you.",
  selectionType: "multi",
  maxSelections: 3,
  options: [
    { value: "everyday_movement", label: "Walking & everyday movement" },
    { value: "strength_exercise", label: "Strength & exercise" },
    { value: "food", label: "Food" },
    { value: "sleep", label: "Sleep" },
    { value: "daily_routine", label: "Daily routine" },
    { value: "stress_downtime", label: "Stress & downtime" },
    { value: "not_sure", label: "I'm not sure — help me decide", exclusive: true },
  ],
};

// Question 3 - What's already working, so the plan builds on it rather
// than presenting it as a new recommendation.
const existingHabitsQuestion: OnboardingQuestionDef = {
  id: "existingHabits",
  question: "What's already working for you, if anything?",
  supportingText: "Select anything that already feels manageable or fairly consistent.",
  selectionType: "multi",
  options: [
    { value: "walking_regularly", label: "Walking regularly" },
    { value: "gym_strength", label: "Going to the gym / strength training" },
    { value: "home_workouts", label: "Home workouts" },
    { value: "sport_classes", label: "Sport or exercise classes" },
    { value: "meal_prep", label: "Preparing some meals ahead" },
    { value: "regular_meals", label: "Eating fairly regular meals" },
    { value: "sleep_routine", label: "A sleep routine that usually works" },
    { value: "downtime_breaks", label: "Taking breaks / making time to unwind" },
    { value: "just_getting_started", label: "I'm just getting started / nothing feels consistent yet", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "existingHabitsOther", label: "What's already working for you?", required: true },
    },
  ],
};

// Question 4 - Current activity, so the plan doesn't over- or under-shoot.
const activityLevelQuestion: OnboardingQuestionDef = {
  id: "activityLevel",
  question: "How active are you most weeks?",
  supportingText: "Activity can include walking, workouts, sport, classes, or other intentional movement.",
  selectionType: "single",
  options: [
    { value: "hardly_at_all", label: "Hardly at all" },
    { value: "one_to_two_days", label: "1–2 days" },
    { value: "three_to_four_days", label: "3–4 days" },
    { value: "five_plus_days", label: "5+ days" },
    { value: "varies_a_lot", label: "It varies a lot" },
  ],
};

// Question 5 - Main barriers, so the plan reduces the friction itself.
const barriersQuestion: OnboardingQuestionDef = {
  id: "barriers",
  question: "What usually gets in the way most?",
  selectionType: "multi",
  maxSelections: 2,
  options: [
    { value: "not_enough_time", label: "Not enough time" },
    { value: "low_energy", label: "Low energy" },
    { value: "motivation", label: "Motivation" },
    { value: "work_schedule", label: "Work schedule" },
    { value: "caring_responsibilities", label: "Family/caring responsibilities" },
    { value: "not_knowing_what_to_do", label: "Not knowing what to do" },
    { value: "struggle_to_keep_going", label: "I start well but struggle to keep it going" },
    { value: "nothing_in_particular", label: "Nothing in particular", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "barrierOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// Question 6 - Realistic time, to constrain duration/complexity/fallback.
const dailyTimeQuestion: OnboardingQuestionDef = {
  id: "dailyTime",
  question: "How much time could you realistically give yourself on a normal day?",
  selectionType: "single",
  options: [
    { value: "five_to_ten_minutes", label: "5–10 minutes" },
    { value: "fifteen_to_twenty_minutes", label: "15–20 minutes" },
    { value: "around_thirty_minutes", label: "Around 30 minutes" },
    { value: "forty_five_plus_minutes", label: "45+ minutes" },
    { value: "depends_on_day", label: "It depends on the day" },
  ],
};

// Question 7 - When habits fit, for realistic dayparts/timing strategies.
const habitTimesQuestion: OnboardingQuestionDef = {
  id: "habitTimes",
  question: "When would healthy habits realistically fit into your life?",
  selectionType: "multi",
  options: [
    { value: "early_morning", label: "Early morning" },
    { value: "day_lunch", label: "During the day / lunch" },
    { value: "after_work", label: "After work" },
    { value: "evening", label: "Evening" },
    { value: "weekends", label: "Weekends" },
    { value: "changes_day_to_day", label: "It changes day to day", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "habitTimeOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// Adaptive branch A - Walking & everyday movement.
const movementFitQuestion: OnboardingQuestionDef = {
  id: "movementFit",
  question: "What would make it easiest to move more?",
  selectionType: "multi",
  maxSelections: 2,
  options: [
    { value: "short_walks", label: "Short walks" },
    { value: "longer_walks", label: "Longer walks" },
    { value: "movement_breaks", label: "Short movement breaks" },
    { value: "existing_routine", label: "Moving more during things I'm already doing" },
    { value: "with_someone", label: "Doing something with someone else" },
    { value: "more_structured", label: "Something more structured" },
    { value: "not_sure", label: "I'm not sure yet", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "movementFitOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// Adaptive branch B - Strength & exercise.
const strengthSetupQuestion: OnboardingQuestionDef = {
  id: "strengthSetup",
  question: "Which best describes your current exercise setup?",
  selectionType: "single",
  options: [
    { value: "want_to_start", label: "I want to start and need a simple starting point" },
    { value: "home_no_equipment", label: "I exercise at home with no equipment" },
    { value: "home_with_equipment", label: "I exercise at home with some equipment" },
    { value: "gym_no_structure", label: "I use a gym but don't have much structure" },
    { value: "gym_with_programme", label: "I use a gym and already follow a programme" },
    { value: "classes_sport", label: "Classes or sport are my main exercise" },
    { value: "mixed_setup", label: "A mix of these" },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "strengthSetupOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// strengthSetup answers that need the follow-up equipment screen below.
// "home_no_equipment" is included deliberately: the plan shouldn't assume
// bodyweight-only just because the user didn't think of what they have as
// "equipment" - that path gets an explicit "Nothing / bodyweight only"
// option instead of an assumption.
const STRENGTH_SETUP_VALUES_NEEDING_EQUIPMENT = ["home_no_equipment", "home_with_equipment"];

function needsStrengthEquipmentScreen(strengthSetup: string[]): boolean {
  return strengthSetup.some((value) => STRENGTH_SETUP_VALUES_NEEDING_EQUIPMENT.includes(value));
}

const STRENGTH_EQUIPMENT_CORE_OPTIONS: OnboardingOption[] = [
  { value: "dumbbells", label: "Dumbbells" },
  { value: "resistance_bands", label: "Resistance bands" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "bench", label: "Bench" },
  { value: "barbell_weights", label: "Barbell / weights" },
];

const STRENGTH_EQUIPMENT_OTHER_OPTION: OnboardingOption = {
  value: "other",
  label: SOMETHING_ELSE,
  reveals: { field: "strengthEquipmentOther", label: SOMETHING_ELSE_LABEL, required: true },
};

const STRENGTH_EQUIPMENT_NOTHING_OPTION: OnboardingOption = {
  value: "nothing_bodyweight",
  label: "Nothing / bodyweight only",
  exclusive: true,
};

// Adaptive branch B's follow-up - a proper screen of its own (not an inline
// reveal) since equipment materially changes what the plan can suggest.
// Shown only when strengthSetup needs it (see above). Only the
// home-no-equipment path offers "Nothing / bodyweight only": the
// home-with-equipment path already implies there's something.
function buildStrengthEquipmentQuestion(strengthSetup: string[] = []): OnboardingQuestionDef {
  const options = strengthSetup.includes("home_no_equipment")
    ? [...STRENGTH_EQUIPMENT_CORE_OPTIONS, STRENGTH_EQUIPMENT_NOTHING_OPTION, STRENGTH_EQUIPMENT_OTHER_OPTION]
    : [...STRENGTH_EQUIPMENT_CORE_OPTIONS, STRENGTH_EQUIPMENT_OTHER_OPTION];

  return {
    id: "strengthEquipment",
    question: "What equipment do you have access to?",
    supportingText: "Select anything you could realistically use.",
    selectionType: "multi",
    options,
  };
}

// Adaptive branch C - Food.
const foodChallengesQuestion: OnboardingQuestionDef = {
  id: "foodChallenges",
  question: "Where does eating well tend to get hardest?",
  selectionType: "multi",
  maxSelections: 2,
  options: [
    { value: "busy_mornings", label: "Busy mornings" },
    { value: "lunch_during_day", label: "Lunch during work / the day" },
    { value: "afternoon_snacking", label: "Afternoon snacking" },
    { value: "planning", label: "Planning what to eat" },
    { value: "takeaway_convenience", label: "Takeaways or convenience food" },
    { value: "evening_eating", label: "Evening eating" },
    { value: "meals_not_filling", label: "Meals don't keep me full" },
    { value: "not_sure_what_to_choose", label: "I don't really know what to choose" },
    { value: "not_sure", label: "I'm not sure", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "foodChallengeOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// Adaptive branch D - Sleep.
const sleepChallengesQuestion: OnboardingQuestionDef = {
  id: "sleepChallenges",
  question: "What usually gets in the way of sleep going how you'd like?",
  selectionType: "multi",
  maxSelections: 2,
  options: [
    { value: "bedtime_delay", label: "I don't get to bed when I mean to" },
    { value: "phone_tv", label: "Phone or TV keeps me up" },
    { value: "falling_asleep", label: "I struggle to fall asleep" },
    { value: "waking_during_night", label: "I wake during the night" },
    { value: "schedule_changes", label: "My sleep schedule changes a lot" },
    { value: "not_enough_sleep_time", label: "I don't give myself enough time to sleep" },
    { value: "not_sure", label: "I'm not sure what's getting in the way", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "sleepChallengeOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// Adaptive branch E - Daily routine.
const routineChallengesQuestion: OnboardingQuestionDef = {
  id: "routineChallenges",
  question: "What usually makes routines fall apart for you?",
  selectionType: "multi",
  maxSelections: 2,
  options: [
    { value: "getting_started", label: "Getting started" },
    { value: "remembering", label: "Remembering to do it" },
    { value: "finding_time", label: "Finding the time" },
    { value: "days_change_too_much", label: "My days change too much" },
    { value: "motivation", label: "Motivation" },
    { value: "too_much_at_once", label: "I try to change too much at once" },
    { value: "one_miss_derails", label: "I miss one day and fall out of it" },
    { value: "not_sure", label: "I'm not sure", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "routineChallengeOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// Adaptive branch F - Stress & downtime.
const stressChallengesQuestion: OnboardingQuestionDef = {
  id: "stressChallenges",
  question: "What tends to feel hardest on busy weeks?",
  selectionType: "multi",
  maxSelections: 2,
  options: [
    { value: "time_for_self", label: "Finding any time for myself" },
    { value: "switching_off", label: "Switching off at the end of the day" },
    { value: "taking_breaks", label: "Remembering to take breaks" },
    { value: "everything_piles_up", label: "Feeling like everything piles up" },
    { value: "healthy_habits_drop", label: "Keeping healthy habits going" },
    { value: "not_sure", label: "I'm not sure", exclusive: true },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: { field: "stressChallengeOther", label: SOMETHING_ELSE_LABEL, required: true },
    },
  ],
};

// Discovery branch - shown instead of the six branches above when "I'm not
// sure - help me decide" was selected on Question 2.
const focusDiscoverySignalsQuestion: OnboardingQuestionDef = {
  id: "focusDiscoverySignals",
  question: "If you're not sure where to start, what sounds most like you right now?",
  supportingText: "Choose up to 2. It's fine if you're still not sure.",
  selectionType: "multi",
  maxSelections: 2,
  options: [
    { value: "low_energy", label: "I feel low on energy" },
    { value: "movement_uncertain", label: "I want to move more but don't know what I'd enjoy" },
    { value: "food_complicated", label: "Food feels more complicated than it should" },
    { value: "sleep_routine_inconsistent", label: "My sleep or routine feels inconsistent" },
    { value: "days_hard_to_organise", label: "My days feel hard to organise" },
    { value: "needs_downtime", label: "I could use more downtime" },
    { value: "still_not_sure", label: "None of these / I'm still not sure", exclusive: true },
  ],
};

// Final structured screen - Constraints. Every reveal here is optional: the
// selected constraint itself is useful even without elaboration.
const constraintsQuestion: OnboardingQuestionDef = {
  id: "constraints",
  question: "Anything your plan should work around?",
  selectionType: "multi",
  options: [
    { value: "nothing_right_now", label: "Nothing right now", exclusive: true },
    {
      value: "physical_constraint",
      label: "Injury/pain or mobility issue",
      reveals: {
        field: "constraintsDetail",
        label: "Tell us anything that would help us plan around this",
        required: false,
      },
    },
    {
      value: "food_allergy_intolerance",
      label: "Food allergy/intolerance",
      reveals: {
        field: "constraintsDetail",
        label: "Tell us anything that would help us plan around this",
        required: false,
      },
    },
    {
      value: "dietary_preference",
      label: "Dietary preference",
      reveals: {
        field: "constraintsDetail",
        label: "Tell us anything that would help us plan around this",
        required: false,
      },
    },
    {
      value: "work_shift_schedule",
      label: "Work/shift schedule",
      reveals: {
        field: "constraintsDetail",
        label: "Tell us anything that would help us plan around this",
        required: false,
      },
    },
    {
      value: "caring_responsibilities",
      label: "Family/caring responsibilities",
      reveals: {
        field: "constraintsDetail",
        label: "Tell us anything that would help us plan around this",
        required: false,
      },
    },
    {
      value: "other",
      label: SOMETHING_ELSE,
      reveals: {
        field: "constraintsDetail",
        label: "Tell us anything that would help us plan around this",
        required: false,
      },
    },
  ],
};

const QUESTIONS_BY_FIELD: Record<Exclude<OnboardingFieldId, "strengthEquipment">, OnboardingQuestionDef> = {
  primaryGoal: primaryGoalQuestion,
  focusAreas: focusAreasQuestion,
  existingHabits: existingHabitsQuestion,
  activityLevel: activityLevelQuestion,
  barriers: barriersQuestion,
  dailyTime: dailyTimeQuestion,
  habitTimes: habitTimesQuestion,
  movementFit: movementFitQuestion,
  strengthSetup: strengthSetupQuestion,
  foodChallenges: foodChallengesQuestion,
  sleepChallenges: sleepChallengesQuestion,
  routineChallenges: routineChallengesQuestion,
  stressChallenges: stressChallengesQuestion,
  focusDiscoverySignals: focusDiscoverySignalsQuestion,
  constraints: constraintsQuestion,
};

// strengthEquipment is the one screen whose options depend on a previous
// answer (strengthSetup), so it's built on the fly from `answers` rather
// than looked up statically like every other screen.
export function getQuestionForField(
  field: OnboardingFieldId,
  answers?: OnboardingAnswers
): OnboardingQuestionDef {
  if (field === "strengthEquipment") {
    return buildStrengthEquipmentQuestion(answers?.strengthSetup);
  }
  return QUESTIONS_BY_FIELD[field];
}

// Fixed order the adaptive branches appear in when more than one focus area
// is selected (SCREEN_SPECS.md, "Adaptive focus-area questions").
export const FOCUS_AREA_BRANCH_ORDER: { area: string; field: OnboardingFieldId }[] = [
  { area: "everyday_movement", field: "movementFit" },
  { area: "strength_exercise", field: "strengthSetup" },
  { area: "food", field: "foodChallenges" },
  { area: "sleep", field: "sleepChallenges" },
  { area: "daily_routine", field: "routineChallenges" },
  { area: "stress_downtime", field: "stressChallenges" },
];

const ALL_BRANCH_FIELDS: OnboardingFieldId[] = [
  "movementFit",
  "strengthSetup",
  "foodChallenges",
  "sleepChallenges",
  "routineChallenges",
  "stressChallenges",
  "focusDiscoverySignals",
];

const BRANCH_OTHER_FIELDS: Partial<Record<OnboardingFieldId, OnboardingTextFieldId[]>> = {
  movementFit: ["movementFitOther"],
  strengthSetup: ["strengthSetupOther"],
  foodChallenges: ["foodChallengeOther"],
  sleepChallenges: ["sleepChallengeOther"],
  routineChallenges: ["routineChallengeOther"],
  stressChallenges: ["stressChallengeOther"],
};

function applicableBranchFields(focusAreas: string[]): Set<OnboardingFieldId> {
  if (focusAreas.includes("not_sure")) {
    return new Set<OnboardingFieldId>(["focusDiscoverySignals"]);
  }
  const applicable = new Set<OnboardingFieldId>();
  for (const branch of FOCUS_AREA_BRANCH_ORDER) {
    if (focusAreas.includes(branch.area)) applicable.add(branch.field);
  }
  return applicable;
}

// Given the current focus-area selection, returns the full ordered list of
// onboarding screens (Questions 1-7, then one adaptive branch per selected
// focus area - or the single discovery branch - then Constraints). The
// final optional free-text screen isn't included here: it always follows
// this list and isn't tied to an answer field. Recomputed fresh from
// `answers` every time rather than cached, since only Question 2 (or a
// Question 1 change that forces a focus area) ever changes it.
export function getOnboardingScreens(answers: OnboardingAnswers): OnboardingFieldId[] {
  const screens: OnboardingFieldId[] = [
    "primaryGoal",
    "focusAreas",
    "existingHabits",
    "activityLevel",
    "barriers",
    "dailyTime",
    "habitTimes",
  ];

  if (answers.focusAreas.includes("not_sure")) {
    screens.push("focusDiscoverySignals");
  } else {
    for (const branch of FOCUS_AREA_BRANCH_ORDER) {
      if (!answers.focusAreas.includes(branch.area)) continue;
      screens.push(branch.field);
      if (branch.field === "strengthSetup" && needsStrengthEquipmentScreen(answers.strengthSetup)) {
        screens.push("strengthEquipment");
      }
    }
  }

  screens.push("constraints");
  return screens;
}

// Resets every adaptive-branch answer (and its free text) that the current
// focus-area selection no longer supports, so stale answers from a focus
// area the user has since deselected - or from before they picked "I'm not
// sure" - never reach the final save. Also clears the strengthEquipment
// follow-up (and its custom text) whenever strengthSetup no longer needs it -
// either because the whole strength_exercise branch was cleared above, or
// because the user went Back and changed their strengthSetup answer to one
// that doesn't need the equipment screen. Safe to call any time; a no-op for
// branches that are still applicable.
export function clearInapplicableBranches(answers: OnboardingAnswers): OnboardingAnswers {
  const applicable = applicableBranchFields(answers.focusAreas);
  const updated: OnboardingAnswers = { ...answers };

  for (const field of ALL_BRANCH_FIELDS) {
    if (applicable.has(field)) continue;
    updated[field] = [];
    for (const otherField of BRANCH_OTHER_FIELDS[field] ?? []) {
      updated[otherField] = "";
    }
  }

  if (!needsStrengthEquipmentScreen(updated.strengthSetup)) {
    updated.strengthEquipment = [];
    updated.strengthEquipmentOther = "";
  }

  return updated;
}
