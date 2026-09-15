// Fields that hold one or more selected option values (single-select questions
// just store a single-item array). Every structured onboarding question maps
// to exactly one of these.
export type StructuredAnswerField =
  | "primaryGoal"
  | "currentActivity"
  | "barriers"
  | "timeAvailable"
  | "activityPreferences"
  | "whenItFits"
  | "goalSpecific"
  | "constraints";

// Fields that hold the free-text typed under a "Something else" (or similar)
// option. Only questions that can reveal a text field have one of these.
export type OtherTextField =
  | "primaryGoalOther"
  | "barriersOther"
  | "activityPreferencesOther"
  | "whenItFitsOther"
  | "goalSpecificOther"
  | "constraintsOther";

export interface OnboardingAnswers {
  primaryGoal: string[];
  primaryGoalOther: string;
  currentActivity: string[];
  barriers: string[];
  barriersOther: string;
  timeAvailable: string[];
  activityPreferences: string[];
  activityPreferencesOther: string;
  whenItFits: string[];
  whenItFitsOther: string;
  goalSpecific: string[];
  goalSpecificOther: string;
  constraints: string[];
  constraintsOther: string;
  finalNote: string;
}

export type SelectionType = "single" | "multi";

export interface OnboardingOption {
  value: string;
  label: string;
  // Selecting this option clears every other selection for the question
  // (and picking anything else clears this one) - e.g. "Nothing right now".
  exclusive?: boolean;
  // Selecting this option reveals the question's free-text field - e.g. "Something else".
  revealsText?: boolean;
}

export interface OnboardingQuestionDef {
  id: StructuredAnswerField;
  otherId?: OtherTextField;
  question: string;
  supportingText?: string;
  selectionType: SelectionType;
  maxSelections?: number;
  options: OnboardingOption[];
  otherFieldLabel?: string;
}
