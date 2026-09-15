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

import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

interface Props {
  step: number;
  totalSteps: number;
  value: string;
  submitting: boolean;
  error: string | null;
  onChangeText: (text: string) => void;
  onSkip: () => void;
  onBuildPlan: () => void;
  onRetry: () => void;
}

// The final onboarding screen (Screen 9). Unlike the structured questions,
// this one is optional free text with equal-weight Skip / Build my plan
// actions instead of Next/Back, so it gets its own small component rather
// than being folded into OnboardingQuestionScreen.
export function AnythingElseStep({
  step,
  totalSteps,
  value,
  submitting,
  error,
  onChangeText,
  onSkip,
  onBuildPlan,
  onRetry,
}: Props) {
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
            Anything else about your life right now?
          </Text>
          <Text className="font-sans text-text-secondary text-sm mb-5">
            Totally optional, but this helps shape your first plan.
          </Text>

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Type here"
            placeholderTextColor="#8B8175"
            multiline
            editable={!submitting}
            style={styles.textInput}
          />
        </ScrollView>

        <View style={styles.footer}>
          {error ? (
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-sans text-accent text-sm flex-1 mr-3">{error}</Text>
              <TouchableOpacity
                onPress={onRetry}
                disabled={submitting}
                activeOpacity={0.7}
                className="min-h-11 justify-center"
              >
                <Text className="font-sans-semibold text-accent text-sm">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.footerButtonRow}>
            <TouchableOpacity
              className="btn--secondary flex-1 mr-3"
              onPress={onSkip}
              disabled={submitting}
              activeOpacity={0.7}
              style={{ opacity: submitting ? 0.5 : 1 }}
            >
              <Text className="btn--secondary__label">Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="btn--primary flex-1"
              onPress={onBuildPlan}
              disabled={submitting}
              activeOpacity={0.7}
              style={{ opacity: submitting ? 0.5 : 1 }}
            >
              <Text className="btn--primary__label">Build my plan</Text>
            </TouchableOpacity>
          </View>
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
    minHeight: 140,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FAF6F0",
    borderTopWidth: 1,
    borderTopColor: "#E7E0D6",
  },
  footerButtonRow: {
    flexDirection: "row",
  },
});
