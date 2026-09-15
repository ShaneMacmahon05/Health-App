import { create } from "zustand";

import { getStructuredQuestion, TOTAL_ONBOARDING_STEPS } from "@/data/onboardingQuestions";
import type { OnboardingAnswers, OtherTextField, StructuredAnswerField } from "@/types/onboarding";

const initialAnswers: OnboardingAnswers = {
  primaryGoal: [],
  primaryGoalOther: "",
  currentActivity: [],
  barriers: [],
  barriersOther: "",
  timeAvailable: [],
  activityPreferences: [],
  activityPreferencesOther: "",
  whenItFits: [],
  whenItFitsOther: "",
  goalSpecific: [],
  goalSpecificOther: "",
  constraints: [],
  constraintsOther: "",
  finalNote: "",
};

interface OnboardingStore {
  step: number;
  answers: OnboardingAnswers;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  selectOption: (field: StructuredAnswerField, value: string) => void;
  setOtherText: (field: OtherTextField, text: string) => void;
  setFinalNote: (text: string) => void;
  resetOnboarding: () => void;
}

// Ephemeral, in-progress onboarding answers only (per AGENTS.md's State
// Management Rules) - nothing here is the source of truth. The next task
// batches `answers` into a single Supabase write on final submit.
export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  step: 1,
  answers: initialAnswers,

  goToNextStep: () =>
    set((state) => ({ step: Math.min(state.step + 1, TOTAL_ONBOARDING_STEPS) })),

  goToPreviousStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

  selectOption: (field, value) => {
    const { answers, step } = get();
    const question = getStructuredQuestion(step, answers);
    const option = question.options.find((o) => o.value === value);
    if (!option) return;

    const current = answers[field];
    let next: string[];

    if (question.selectionType === "single") {
      next = [value];
    } else if (current.includes(value)) {
      // Tapping an already-selected option deselects it.
      next = current.filter((v) => v !== value);
    } else if (option.exclusive) {
      // Picking an exclusive option (e.g. "Nothing right now") clears everything else.
      next = [value];
    } else {
      const withoutExclusive = current.filter(
        (v) => !question.options.find((o) => o.value === v)?.exclusive
      );
      if (question.maxSelections && withoutExclusive.length >= question.maxSelections) {
        // Already at the limit - ignore the tap rather than silently swap a selection.
        next = withoutExclusive;
      } else {
        next = [...withoutExclusive, value];
      }
    }

    const updated: OnboardingAnswers = { ...answers, [field]: next };

    // If the option that revealed the free-text field is no longer selected,
    // the stale text is cleared so it's never submitted as active input.
    if (question.otherId) {
      const stillRevealed = next.some(
        (v) => question.options.find((o) => o.value === v)?.revealsText
      );
      if (!stillRevealed) {
        updated[question.otherId] = "";
      }
    }

    // Question 7's branch depends on the primary goal - if the goal changes
    // to a different branch, the previously answered goal-specific question
    // no longer applies, so it's cleared rather than silently carried over.
    if (field === "primaryGoal" && answers.primaryGoal[0] !== next[0]) {
      updated.goalSpecific = [];
      updated.goalSpecificOther = "";
    }

    set({ answers: updated });
  },

  setOtherText: (field, text) =>
    set((state) => ({ answers: { ...state.answers, [field]: text } })),

  setFinalNote: (text) => set((state) => ({ answers: { ...state.answers, finalNote: text } })),

  resetOnboarding: () => set({ step: 1, answers: initialAnswers }),
}));
