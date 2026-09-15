import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

// Placeholder landing spot for onboarding to route into. The real Plan tab
// (plan display, AI generation, Supabase persistence) is a separate task -
// this only exists so the onboarding flow has somewhere real to finish.
export default function Plan() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="screen items-center justify-center">
        <ActivityIndicator color="#4B6B60" />
        <Text className="font-serif-semibold text-text-primary text-xl text-center mt-6">
          Building your plan for this week…
        </Text>
        <Text className="font-sans text-text-secondary text-sm text-center mt-3">
          Plan generation isn&apos;t built yet — this is a placeholder screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}
