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
import type { OnboardingQuestionDef } from "@/types/onboarding";

interface Props {
  question: OnboardingQuestionDef;
  step: number;
  totalSteps: number;
  selected: string[];
  otherText: string;
  canGoBack: boolean;
  onSelect: (value: string) => void;
  onOtherTextChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// The single reusable screen for every structured onboarding question
// (Questions 1-8, including whichever branch of Question 7 applies). Screen
// 9 has different actions/behaviour and gets its own component.
export function OnboardingQuestionScreen({
  question,
  step,
  totalSteps,
  selected,
  otherText,
  canGoBack,
  onSelect,
  onOtherTextChange,
  onNext,
  onBack,
}: Props) {
  const showOtherField = useMemo(
    () => selected.some((value) => question.options.find((o) => o.value === value)?.revealsText),
    [selected, question.options]
  );

  const canContinue = selected.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="screen"
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <OnboardingProgress step={step} total={totalSteps} />

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
                label={option.label}
                selected={selected.includes(option.value)}
                onPress={() => onSelect(option.value)}
              />
            ))}
          </View>

          {showOtherField && question.otherFieldLabel ? (
            <View className="mt-2 mb-2">
              <Text className="font-sans-medium text-text-primary text-sm mb-2">
                {question.otherFieldLabel}
              </Text>
              <TextInput
                value={otherText}
                onChangeText={onOtherTextChange}
                placeholder="Type here"
                placeholderTextColor="#8B8175"
                multiline
                style={styles.textInput}
              />
            </View>
          ) : null}
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
