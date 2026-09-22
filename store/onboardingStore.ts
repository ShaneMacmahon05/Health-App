import { create } from "zustand";

import {
  clearInapplicableBranches,
  getOnboardingScreens,
  getQuestionForField,
  REQUIRED_FOCUS_AREA_BY_GOAL,
} from "@/data/onboardingQuestions";
import type { OnboardingAnswers, OnboardingFieldId, OnboardingTextFieldId } from "@/types/onboarding";

const initialAnswers: OnboardingAnswers = {
  primaryGoal: [],
  primaryGoalOther: "",
  focusAreas: [],
  existingHabits: [],
  existingHabitsOther: "",
  activityLevel: [],
  barriers: [],
  barrierOther: "",
  dailyTime: [],
  habitTimes: [],
  habitTimeOther: "",
  movementFit: [],
  movementFitOther: "",
  strengthSetup: [],
  strengthEquipment: [],
  strengthEquipmentOther: "",
  strengthSetupOther: "",
  foodChallenges: [],
  foodChallengeOther: "",
  sleepChallenges: [],
  sleepChallengeOther: "",
  routineChallenges: [],
  routineChallengeOther: "",
  stressChallenges: [],
  stressChallengeOther: "",
  focusDiscoverySignals: [],
  constraints: [],
  constraintsDetail: "",
  additionalContext: "",
};

// If the primary goal changes to/from one that requires a focus area
// (SCREEN_SPECS.md Question 2's "Required mapping from Question 1"), moves
// that required area in/out of focusAreas and clears any adaptive-branch
// answers the new selection no longer supports.
function applyRequiredFocusArea(
  answers: OnboardingAnswers,
  oldGoal: string | undefined,
  newGoal: string | undefined
): OnboardingAnswers {
  const oldRequired = oldGoal ? REQUIRED_FOCUS_AREA_BY_GOAL[oldGoal] : undefined;
  const newRequired = newGoal ? REQUIRED_FOCUS_AREA_BY_GOAL[newGoal] : undefined;

  if (oldRequired === newRequired) return answers;

  let focusAreas = answers.focusAreas.filter((area) => area !== oldRequired);

  if (newRequired) {
    // A forced focus area is a real selection, so it's incompatible with
    // the exclusive "not sure" option, same as picking any other area.
    focusAreas = focusAreas.filter((area) => area !== "not_sure");
    if (!focusAreas.includes(newRequired)) {
      if (focusAreas.length >= 3) {
        // Already at the max - make room for the newly-required area rather
        // than silently exceeding the limit of 3.
        focusAreas = focusAreas.slice(0, 2);
      }
      focusAreas = [...focusAreas, newRequired];
    }
  }

  return clearInapplicableBranches({ ...answers, focusAreas });
}

interface OnboardingStore {
  stepIndex: number;
  answers: OnboardingAnswers;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  selectOption: (field: OnboardingFieldId, value: string) => void;
  setOtherText: (field: OnboardingTextFieldId, text: string) => void;
  setAdditionalContext: (text: string) => void;
  resetOnboarding: () => void;
}

// Ephemeral, in-progress onboarding answers only (per AGENTS.md's State
// Management Rules) - nothing here is the source of truth. lib/onboarding.ts
// batches `answers` into a single Supabase write on final submit.
export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  stepIndex: 0,
  answers: initialAnswers,

  goToNextStep: () =>
    set((state) => {
      const lastIndex = getOnboardingScreens(state.answers).length;
      return { stepIndex: Math.min(state.stepIndex + 1, lastIndex) };
    }),

  goToPreviousStep: () => set((state) => ({ stepIndex: Math.max(state.stepIndex - 1, 0) })),

  selectOption: (field, value) => {
    const { answers } = get();
    const question = getQuestionForField(field, answers);
    const option = question.options.find((o) => o.value === value);
    if (!option) return;

    // The focus area required by the current primary goal can't be
    // deselected directly, and can't be wiped out by picking the exclusive
    // "not sure" option either - it only changes if the primary goal
    // changes.
    if (field === "focusAreas") {
      const requiredArea = answers.primaryGoal[0]
        ? REQUIRED_FOCUS_AREA_BY_GOAL[answers.primaryGoal[0]]
        : undefined;
      const hasRequiredArea = !!requiredArea && answers.focusAreas.includes(requiredArea);
      if (hasRequiredArea && (value === requiredArea || option.exclusive)) {
        return;
      }
    }

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

    // If the option that revealed a free-text field is no longer selected -
    // and no other selected option on this question shares that same field
    // (e.g. Constraints, where several options share one text box) - the
    // stale text is cleared so it's never submitted as active input.
    for (const opt of question.options) {
      if (!opt.reveals || next.includes(opt.value)) continue;
      const stillRevealed = next.some(
        (v) => question.options.find((o) => o.value === v)?.reveals?.field === opt.reveals!.field
      );
      if (!stillRevealed) {
        updated[opt.reveals.field] = "";
      }
    }

    if (field === "primaryGoal" && answers.primaryGoal[0] !== next[0]) {
      set({ answers: applyRequiredFocusArea(updated, answers.primaryGoal[0], next[0]) });
      return;
    }

    if (field === "focusAreas" || field === "strengthSetup") {
      set({ answers: clearInapplicableBranches(updated) });
      return;
    }

    set({ answers: updated });
  },

  setOtherText: (field, text) =>
    set((state) => ({ answers: { ...state.answers, [field]: text } })),

  setAdditionalContext: (text) =>
    set((state) => ({ answers: { ...state.answers, additionalContext: text } })),

  resetOnboarding: () => set({ stepIndex: 0, answers: initialAnswers }),
}));
