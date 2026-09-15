import { useState } from "react";
import { useRouter } from "expo-router";

import { AnythingElseStep } from "@/components/onboarding/AnythingElseStep";
import { OnboardingQuestionScreen } from "@/components/onboarding/OnboardingQuestionScreen";
import { getStructuredQuestion, TOTAL_ONBOARDING_STEPS } from "@/data/onboardingQuestions";
import { saveOnboardingResponses } from "@/lib/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = useOnboardingStore((s) => s.step);
  const answers = useOnboardingStore((s) => s.answers);
  const goToNextStep = useOnboardingStore((s) => s.goToNextStep);
  const goToPreviousStep = useOnboardingStore((s) => s.goToPreviousStep);
  const selectOption = useOnboardingStore((s) => s.selectOption);
  const setOtherText = useOnboardingStore((s) => s.setOtherText);
  const setFinalNote = useOnboardingStore((s) => s.setFinalNote);
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);

  // Shared by both Skip and Build my plan - they save the exact same
  // structured batch, differing only in whether finalNote is empty. Zustand
  // stays untouched (and the screen stays put) until the save actually
  // succeeds, so a failure never silently marks onboarding complete or
  // loses answers.
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

  if (step === TOTAL_ONBOARDING_STEPS) {
    return (
      <AnythingElseStep
        step={step}
        totalSteps={TOTAL_ONBOARDING_STEPS}
        value={answers.finalNote}
        submitting={submitting}
        error={error}
        onChangeText={setFinalNote}
        onSkip={finishOnboarding}
        onBuildPlan={finishOnboarding}
        onRetry={finishOnboarding}
      />
    );
  }

  const question = getStructuredQuestion(step, answers);

  return (
    <OnboardingQuestionScreen
      question={question}
      step={step}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      selected={answers[question.id]}
      otherText={question.otherId ? answers[question.otherId] : ""}
      canGoBack={step > 1}
      onSelect={(value) => selectOption(question.id, value)}
      onOtherTextChange={(text) => {
        if (question.otherId) {
          setOtherText(question.otherId, text);
        }
      }}
      onNext={goToNextStep}
      onBack={goToPreviousStep}
    />
  );
}
