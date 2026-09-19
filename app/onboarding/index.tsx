import { useState } from "react";
import { useRouter } from "expo-router";

import { AnythingElseStep } from "@/components/onboarding/AnythingElseStep";
import { OnboardingQuestionScreen } from "@/components/onboarding/OnboardingQuestionScreen";
import { getOnboardingScreens, getQuestionForField } from "@/data/onboardingQuestions";
import { saveOnboardingResponses } from "@/lib/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = useOnboardingStore((s) => s.stepIndex);
  const answers = useOnboardingStore((s) => s.answers);
  const goToNextStep = useOnboardingStore((s) => s.goToNextStep);
  const goToPreviousStep = useOnboardingStore((s) => s.goToPreviousStep);
  const selectOption = useOnboardingStore((s) => s.selectOption);
  const setOtherText = useOnboardingStore((s) => s.setOtherText);
  const setAdditionalContext = useOnboardingStore((s) => s.setAdditionalContext);
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);

  // The screen list depends on focus areas (Question 2), so it's recomputed
  // from the current answers every render rather than using a fixed total -
  // per SCREEN_SPECS.md, the flow branches and has no fixed question count.
  const screens = getOnboardingScreens(answers);
  const totalSteps = screens.length + 1;

  // Shared by both Skip and Build my plan - they save the exact same
  // structured batch, differing only in whether additionalContext is
  // empty. Zustand stays untouched (and the screen stays put) until the
  // save actually succeeds, so a failure never silently marks onboarding
  // complete or loses answers.
  const finishOnboarding = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: saveError } = await saveOnboardingResponses(answers);

    if (saveError) {
      setSubmitting(false);
      setError(saveError);
      return;
    }

    resetOnboarding();
    router.replace("/plan");
  };

  if (stepIndex >= screens.length) {
    return (
      <AnythingElseStep
        step={stepIndex + 1}
        totalSteps={totalSteps}
        value={answers.additionalContext}
        submitting={submitting}
        error={error}
        onChangeText={setAdditionalContext}
        onBack={goToPreviousStep}
        onSkip={finishOnboarding}
        onBuildPlan={finishOnboarding}
        onRetry={finishOnboarding}
      />
    );
  }

  const fieldId = screens[stepIndex];
  const question = getQuestionForField(fieldId, answers);

  return (
    <OnboardingQuestionScreen
      question={question}
      answers={answers}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      canGoBack={stepIndex > 0}
      onSelect={(value) => selectOption(fieldId, value)}
      onTextChange={setOtherText}
      onNext={goToNextStep}
      onBack={goToPreviousStep}
    />
  );
}
