import type { OnboardingAnswers, OnboardingQuestionDef } from "@/types/onboarding";

export const TOTAL_ONBOARDING_STEPS = 9;

const SOMETHING_ELSE_LABEL = "Tell us in a few words";

const primaryGoalQuestion: OnboardingQuestionDef = {
  id: "primaryGoal",
  otherId: "primaryGoalOther",
  question: "What would you most like help with right now?",
  selectionType: "single",
  otherFieldLabel: "What would you like help with?",
  options: [
    { value: "more_energy", label: "Have more energy" },
    { value: "move_more", label: "Move more" },
    { value: "eat_better", label: "Eat better without overthinking it" },
    { value: "feel_stronger", label: "Feel stronger and fitter" },
    { value: "sleep_better", label: "Sleep better" },
    { value: "routine", label: "Get into a routine" },
    { value: "feel_better_overall", label: "Feel better overall" },
    { value: "something_else", label: "Something else", revealsText: true },
  ],
};

const currentActivityQuestion: OnboardingQuestionDef = {
  id: "currentActivity",
  question: "How active are you most weeks?",
  supportingText:
    "Activity can include walking, workouts, sport, classes, or other intentional movement.",
  selectionType: "single",
  options: [
    { value: "hardly_at_all", label: "Hardly at all" },
    { value: "one_to_two_days", label: "1–2 days" },
    { value: "three_to_four_days", label: "3–4 days" },
    { value: "five_plus_days", label: "5+ days" },
    { value: "varies_a_lot", label: "It varies a lot" },
  ],
};

const barriersQuestion: OnboardingQuestionDef = {
  id: "barriers",
  otherId: "barriersOther",
  question: "What usually gets in the way most?",
  selectionType: "multi",
  maxSelections: 2,
  otherFieldLabel: SOMETHING_ELSE_LABEL,
  options: [
    { value: "not_enough_time", label: "Not enough time" },
    { value: "low_energy", label: "Low energy" },
    { value: "motivation", label: "Motivation" },
    { value: "work_schedule", label: "Work schedule" },
    { value: "caring_responsibilities", label: "Family/caring responsibilities" },
    { value: "not_knowing_what_to_do", label: "Not knowing what to do" },
    { value: "something_physical", label: "Something physical" },
    { value: "nothing_in_particular", label: "Nothing in particular", exclusive: true },
    { value: "something_else", label: "Something else", revealsText: true },
  ],
};

const timeAvailableQuestion: OnboardingQuestionDef = {
  id: "timeAvailable",
  question: "How much time could you realistically give yourself on a normal day?",
  selectionType: "single",
  options: [
    { value: "five_to_ten_minutes", label: "5–10 minutes" },
    { value: "fifteen_to_twenty_minutes", label: "15–20 minutes" },
    { value: "around_thirty_minutes", label: "Around 30 minutes" },
    { value: "forty_five_plus_minutes", label: "45+ minutes" },
    { value: "depends_on_the_day", label: "It depends on the day" },
  ],
};

const activityPreferencesQuestion: OnboardingQuestionDef = {
  id: "activityPreferences",
  otherId: "activityPreferencesOther",
  question: "What kinds of activity do you actually enjoy or wouldn't mind doing?",
  selectionType: "multi",
  otherFieldLabel: SOMETHING_ELSE_LABEL,
  options: [
    { value: "walking", label: "Walking" },
    { value: "home_workouts", label: "Home workouts" },
    { value: "gym", label: "Gym" },
    { value: "classes", label: "Classes" },
    { value: "swimming", label: "Swimming" },
    { value: "cycling", label: "Cycling" },
    { value: "sport", label: "Sport" },
    { value: "stretching_mobility", label: "Stretching/mobility" },
    { value: "not_sure_yet", label: "I'm not sure yet", exclusive: true },
    { value: "something_else", label: "Something else", revealsText: true },
  ],
};

const whenItFitsQuestion: OnboardingQuestionDef = {
  id: "whenItFits",
  otherId: "whenItFitsOther",
  question: "When would healthy habits realistically fit into your life?",
  selectionType: "multi",
  otherFieldLabel: SOMETHING_ELSE_LABEL,
  options: [
    { value: "early_morning", label: "Early morning" },
    { value: "during_the_day", label: "During the day/lunch" },
    { value: "after_work", label: "After work" },
    { value: "evening", label: "Evening" },
    { value: "weekends", label: "Weekends" },
    // Exclusive: picking a specific daypart alongside "it changes day to day"
    // would be a contradictory signal, so treat it like the other catch-all options.
    { value: "it_changes", label: "It changes day to day", exclusive: true },
    { value: "something_else", label: "Something else", revealsText: true },
  ],
};

const constraintsQuestion: OnboardingQuestionDef = {
  id: "constraints",
  otherId: "constraintsOther",
  question: "Anything your plan should work around?",
  selectionType: "multi",
  otherFieldLabel: "Tell us anything that would help us plan around this",
  options: [
    { value: "nothing_right_now", label: "Nothing right now", exclusive: true },
    { value: "injury_or_mobility", label: "Injury/pain or mobility issue", revealsText: true },
    { value: "food_allergy", label: "Food allergy/intolerance", revealsText: true },
    { value: "dietary_preference", label: "Dietary preference", revealsText: true },
    { value: "work_shift_schedule", label: "Work/shift schedule", revealsText: true },
    { value: "caring_responsibilities", label: "Caring responsibilities", revealsText: true },
    { value: "something_else", label: "Something else", revealsText: true },
  ],
};

// Question 7 depends on the primary goal picked in Question 1 - one deeper,
// goal-specific question per branch. Keyed by primaryGoalQuestion option values.
const goalSpecificQuestions: Record<string, OnboardingQuestionDef> = {
  more_energy: {
    id: "goalSpecific",
    otherId: "goalSpecificOther",
    question: "When do you tend to feel most drained?",
    selectionType: "single",
    otherFieldLabel: SOMETHING_ELSE_LABEL,
    options: [
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" },
      { value: "most_of_the_day", label: "Most of the day" },
      { value: "it_varies", label: "It varies" },
      { value: "something_else", label: "Something else", revealsText: true },
    ],
  },
  move_more: {
    id: "goalSpecific",
    otherId: "goalSpecificOther",
    question: "What would make moving more easiest to fit in?",
    selectionType: "single",
    otherFieldLabel: SOMETHING_ELSE_LABEL,
    options: [
      { value: "short_walks", label: "Short walks" },
      { value: "longer_walks", label: "Longer walks" },
      { value: "short_movement_breaks", label: "Short movement breaks" },
      { value: "home_exercise", label: "Home exercise" },
      { value: "gym_classes", label: "Gym/classes" },
      { value: "with_someone_else", label: "Doing something with someone else" },
      { value: "not_sure_yet", label: "Not sure yet" },
      { value: "something_else", label: "Something else", revealsText: true },
    ],
  },
  eat_better: {
    id: "goalSpecific",
    otherId: "goalSpecificOther",
    question: "What tends to make eating well hardest?",
    selectionType: "single",
    otherFieldLabel: SOMETHING_ELSE_LABEL,
    options: [
      { value: "planning_meals", label: "Planning meals" },
      { value: "busy_mornings_lunches", label: "Busy mornings/lunches" },
      { value: "snacking", label: "Snacking" },
      { value: "takeaways_convenience", label: "Takeaways/convenience food" },
      { value: "getting_enough_protein", label: "Getting enough protein" },
      { value: "evening_eating", label: "Evening eating" },
      { value: "not_sure", label: "Not sure" },
      { value: "something_else", label: "Something else", revealsText: true },
    ],
  },
  // The only goal-specific branch that's multi-select - it's realistic to have
  // access to more than one kind of equipment/setup at once.
  feel_stronger: {
    id: "goalSpecific",
    question: "What exercise setup do you have access to?",
    selectionType: "multi",
    options: [
      { value: "gym", label: "Gym" },
      { value: "dumbbells_bands_at_home", label: "Dumbbells/bands at home" },
      { value: "bodyweight_only", label: "Bodyweight only" },
      { value: "classes_sport", label: "Classes/sport" },
      { value: "a_mix", label: "A mix" },
      { value: "nothing_right_now", label: "Nothing right now", exclusive: true },
    ],
  },
  sleep_better: {
    id: "goalSpecific",
    otherId: "goalSpecificOther",
    question: "What tends to be hardest around sleep?",
    selectionType: "single",
    otherFieldLabel: SOMETHING_ELSE_LABEL,
    options: [
      { value: "getting_to_bed_on_time", label: "Getting to bed on time" },
      { value: "falling_asleep", label: "Falling asleep" },
      { value: "waking_during_the_night", label: "Waking during the night" },
      { value: "inconsistent_schedule", label: "An inconsistent schedule" },
      { value: "not_enough_time_to_sleep", label: "Not giving myself enough time to sleep" },
      { value: "not_sure", label: "Not sure" },
      { value: "something_else", label: "Something else", revealsText: true },
    ],
  },
  routine: {
    id: "goalSpecific",
    otherId: "goalSpecificOther",
    question: "When does your routine usually fall apart?",
    selectionType: "single",
    otherFieldLabel: SOMETHING_ELSE_LABEL,
    options: [
      { value: "mornings", label: "Mornings" },
      { value: "during_the_workday", label: "During the workday" },
      { value: "after_work", label: "After work" },
      { value: "evenings", label: "Evenings" },
      { value: "weekends", label: "Weekends" },
      { value: "schedule_changes_constantly", label: "My schedule changes constantly" },
      { value: "something_else", label: "Something else", revealsText: true },
    ],
  },
  feel_better_overall: {
    id: "goalSpecific",
    otherId: "goalSpecificOther",
    question: "If we started with one area, which would you choose?",
    selectionType: "single",
    otherFieldLabel: SOMETHING_ELSE_LABEL,
    options: [
      { value: "movement", label: "Movement" },
      { value: "food", label: "Food" },
      { value: "energy", label: "Energy" },
      { value: "sleep", label: "Sleep" },
      { value: "routine", label: "Routine" },
      { value: "stress_wellbeing", label: "Stress/wellbeing" },
      { value: "not_sure", label: "I'm not sure" },
      { value: "something_else", label: "Something else", revealsText: true },
    ],
  },
  something_else: {
    id: "goalSpecific",
    question: "Which area is closest to what you'd like help with?",
    selectionType: "single",
    options: [
      { value: "movement", label: "Movement" },
      { value: "food", label: "Food" },
      { value: "energy", label: "Energy" },
      { value: "strength_fitness", label: "Strength/fitness" },
      { value: "sleep", label: "Sleep" },
      { value: "routine", label: "Routine" },
      { value: "wellbeing", label: "Wellbeing" },
      { value: "none_of_these", label: "None of these" },
    ],
  },
};

export function getStructuredQuestion(
  step: number,
  answers: OnboardingAnswers
): OnboardingQuestionDef {
  switch (step) {
    case 1:
      return primaryGoalQuestion;
    case 2:
      return currentActivityQuestion;
    case 3:
      return barriersQuestion;
    case 4:
      return timeAvailableQuestion;
    case 5:
      return activityPreferencesQuestion;
    case 6:
      return whenItFitsQuestion;
    case 7: {
      const goal = answers.primaryGoal[0];
      return goalSpecificQuestions[goal] ?? goalSpecificQuestions.something_else;
    }
    case 8:
      return constraintsQuestion;
    default:
      throw new Error(`No structured onboarding question for step ${step}`);
  }
}

export function isStructuredQuestionAnswered(
  step: number,
  answers: OnboardingAnswers
): boolean {
  const question = getStructuredQuestion(step, answers);
  return answers[question.id].length > 0;
}
