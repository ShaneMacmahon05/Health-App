import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { PlanAction, WeeklyPlan } from "@/types/plan";

// ============================================================================
// TEMPORARY DEV TEST SCREEN - this is NOT the real Plan tab.
//
// Its only job is to call the deployed generate-weekly-plan Edge Function
// once, on a manual button press, using the existing signed-in Supabase
// session, and dump the raw result so the backend can be sanity-checked
// before the real Plan UI (action cards, tap-to-reveal, "Ready for next
// week?", etc.) gets built. Delete/replace this whole file when that work
// starts - none of the layout/styling below is meant to be kept.
// ============================================================================

interface GenerateWeeklyPlanResponse {
  plan: WeeklyPlan;
  actions: PlanAction[];
}

type TestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: GenerateWeeklyPlanResponse }
  | { status: "error"; message: string };

// Reads the Edge Function's JSON error body off a FunctionsHttpError so the
// actual { error, code } it returned is visible here, not just "non-2xx".
async function describeInvokeError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      const detail = typeof body?.error === "string" ? body.error : JSON.stringify(body);
      return `HTTP ${error.context.status}${body?.code ? ` [${body.code}]` : ""}: ${detail}`;
    } catch {
      return `HTTP ${error.context.status}: ${error.message}`;
    }
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function Plan() {
  const [state, setState] = useState<TestState>({ status: "idle" });

  // supabase.functions.invoke automatically attaches the signed-in user's
  // JWT from the existing session - no manual token, no user_id, no
  // onboarding data. The Edge Function reads onboarding_responses itself
  // and is idempotent, so pressing this more than once just returns the
  // same saved plan 1 instead of generating (and charging for) another.
  async function handleGenerateTestPlan() {
    setState({ status: "loading" });

    const { data, error } = await supabase.functions.invoke<GenerateWeeklyPlanResponse>(
      "generate-weekly-plan"
    );

    if (error) {
      setState({ status: "error", message: await describeInvokeError(error) });
      return;
    }
    if (!data) {
      setState({ status: "error", message: "The function returned no data." });
      return;
    }
    setState({ status: "success", result: data });
  }

  const isLoading = state.status === "loading";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="screen" contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}>
        <Text className="font-serif-semibold text-text-primary text-xl mb-1">
          DEV TEST - Plan generation
        </Text>
        <Text className="font-sans text-text-secondary text-sm mb-6">
          Temporary test screen, not the real Plan tab. Press once - this calls the real AI.
        </Text>

        <TouchableOpacity
          className="btn--primary"
          style={isLoading ? { opacity: 0.6 } : undefined}
          onPress={handleGenerateTestPlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="btn--primary__label">Generate test plan</Text>
          )}
        </TouchableOpacity>

        {isLoading && (
          <Text className="font-sans text-text-secondary text-sm text-center mt-4">
            Generating… the first call can take a while (AI + reasoning).
          </Text>
        )}

        {state.status === "error" && (
          <View className="mt-6">
            <Text className="font-sans-medium text-text-primary text-base mb-1">Error</Text>
            <Text className="font-sans text-text-secondary text-sm">{state.message}</Text>
          </View>
        )}

        {state.status === "success" && (
          <View className="mt-6">
            <Text className="font-sans-medium text-text-primary text-base mb-1">
              Plan #{state.result.plan.plan_number} - {state.result.plan.status}
            </Text>
            <Text className="font-sans text-text-secondary text-xs mb-4">
              model: {state.result.plan.model} · prompt: {state.result.plan.prompt_version} · tokens
              in/out: {state.result.plan.input_tokens ?? "—"}/{state.result.plan.output_tokens ?? "—"}
            </Text>

            <Text className="font-sans text-text-primary text-sm mb-5">
              {state.result.plan.personalization_line}
            </Text>

            {state.result.actions.map((action, index) => (
              <View key={action.id} className="mb-5">
                <Text className="font-sans-semibold text-text-primary text-sm">
                  {index + 1}. [{action.category}] {action.title}
                </Text>
                <Text className="font-sans text-text-secondary text-xs mt-1">Target: {action.target}</Text>
                <Text className="font-sans text-text-primary text-sm mt-1">
                  Instructions: {action.instructions}
                </Text>
                <Text className="font-sans text-text-secondary text-xs mt-1">Why: {action.why}</Text>
                <Text className="font-sans text-text-secondary text-xs mt-1">
                  Fallback: {action.fallback}
                </Text>
                <Text className="font-sans text-text-secondary text-xs mt-1">
                  Success: {action.success_definition}
                </Text>
                <Text className="font-sans text-text-secondary text-xs mt-1">
                  Based on: {action.based_on.join(", ") || "—"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
