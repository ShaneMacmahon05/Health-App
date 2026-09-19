import { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingOptionButton } from "@/components/onboarding/OnboardingOptionButton";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { REQUIRED_FOCUS_AREA_BY_GOAL } from "@/data/onboardingQuestions";
import type { OnboardingAnswers, OnboardingQuestionDef, OnboardingTextFieldId } from "@/types/onboarding";

interface Props {
  question: OnboardingQuestionDef;
  answers: OnboardingAnswers;
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  onSelect: (value: string) => void;
  onTextChange: (field: OnboardingTextFieldId, text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// The single reusable screen for every structured onboarding question -
// Questions 1-7, whichever adaptive focus-area branch(es) apply, and
// Constraints. The final optional free-text screen has different
// actions/behaviour and gets its own component (AnythingElseStep).
export function OnboardingQuestionScreen({
  question,
  answers,
  stepIndex,
  totalSteps,
  canGoBack,
  onSelect,
  onTextChange,
  onNext,
  onBack,
}: Props) {
  const selected = answers[question.id];

  // Question 2 only: the focus area forced by the primary goal is shown as
  // required and can't be tapped off (enforced in the store).
  const requiredFocusArea =
    question.id === "focusAreas" && answers.primaryGoal[0]
      ? REQUIRED_FOCUS_AREA_BY_GOAL[answers.primaryGoal[0]]
      : undefined;

  // One text box per distinct revealed field among the currently-selected
  // options - several options can share one field (e.g. Constraints).
  const activeReveals = useMemo(() => {
    const seen = new Set<OnboardingTextFieldId>();
    const reveals: { field: OnboardingTextFieldId; label: string }[] = [];
    for (const option of question.options) {
      if (option.reveals && selected.includes(option.value) && !seen.has(option.reveals.field)) {
        seen.add(option.reveals.field);
        reveals.push({ field: option.reveals.field, label: option.reveals.label });
      }
    }
    return reveals;
  }, [question.options, selected]);

  const canContinue = useMemo(() => {
    if (selected.length === 0) return false;
    for (const option of question.options) {
      if (!option.reveals?.required || !selected.includes(option.value)) continue;
      const text = answers[option.reveals.field];
      if (!text || text.trim().length === 0) return false;
    }
    return true;
  }, [selected, question.options, answers]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="screen"
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <OnboardingProgress step={stepIndex + 1} total={totalSteps} />

          <Text className="font-serif-semibold text-text-primary text-2xl mb-2">
            {question.question}
          </Text>
          {question.supportingText ? (
            <Text className="font-sans text-text-secondary text-sm mb-5">
              {question.supportingText}
            </Text>
          ) : (
            <View className="mb-3" />
          )}

          <View>
            {question.options.map((option) => (
              <OnboardingOptionButton
                key={option.value}
                label={requiredFocusArea === option.value ? `${option.label} (required)` : option.label}
                selected={selected.includes(option.value)}
                onPress={() => onSelect(option.value)}
              />
            ))}
          </View>

          {activeReveals.map((reveal) => (
            <View key={reveal.field} className="mt-2 mb-2">
              <Text className="font-sans-medium text-text-primary text-sm mb-2">{reveal.label}</Text>
              <TextInput
                value={answers[reveal.field]}
                onChangeText={(text) => onTextChange(reveal.field, text)}
                placeholder="Type here"
                placeholderTextColor="#8B8175"
                multiline
                style={styles.textInput}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          {canGoBack ? (
            <TouchableOpacity className="btn--secondary flex-1 mr-3" onPress={onBack} activeOpacity={0.7}>
              <Text className="btn--secondary__label">Back</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            className="btn--primary flex-1"
            onPress={onNext}
            disabled={!canContinue}
            activeOpacity={0.7}
            style={{ opacity: canContinue ? 1 : 0.5 }}
          >
            <Text className="btn--primary__label">Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E0D6",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#332E27",
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FAF6F0",
    borderTopWidth: 1,
    borderTopColor: "#E7E0D6",
  },
});
