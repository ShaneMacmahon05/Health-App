import { useState } from "react";
import { useRouter } from "expo-router";

import { AnythingElseStep } from "@/components/onboarding/AnythingElseStep";
import { OnboardingQuestionScreen } from "@/components/onboarding/OnboardingQuestionScreen";
import { getStructuredQuestion, TOTAL_ONBOARDING_STEPS } from "@/data/onboardingQuestions";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const step = useOnboardingStore((s) => s.step);
  const answers = useOnboardingStore((s) => s.answers);
  const goToNextStep = useOnboardingStore((s) => s.goToNextStep);
  const goToPreviousStep = useOnboardingStore((s) => s.goToPreviousStep);
  const selectOption = useOnboardingStore((s) => s.selectOption);
  const setOtherText = useOnboardingStore((s) => s.setOtherText);
  const setFinalNote = useOnboardingStore((s) => s.setFinalNote);

  // Kept isolated from the question screens above so the next task can swap
  // this out for a real Supabase batch-save + plan-generation call without
  // touching any onboarding UI.
  const finishOnboarding = async () => {
    setSubmitting(true);
    router.replace("/plan");
  };

  if (step === TOTAL_ONBOARDING_STEPS) {
    return (
      <AnythingElseStep
        step={step}
        totalSteps={TOTAL_ONBOARDING_STEPS}
        value={answers.finalNote}
        submitting={submitting}
        onChangeText={setFinalNote}
        onSkip={finishOnboarding}
        onBuildPlan={finishOnboarding}
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
