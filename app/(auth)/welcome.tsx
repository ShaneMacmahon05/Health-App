import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { APP_NAME } from "@/constants/app";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="screen justify-center items-center pt-6 pb-24">
        <Text className="font-serif-semibold text-text-primary text-4xl text-center">
          {APP_NAME}
        </Text>
        <Text className="font-sans text-text-secondary text-lg text-center mt-3">
          A weekly plan built around your real life
        </Text>

        <View className="w-full mt-12">
          <TouchableOpacity
            className="btn--primary"
            onPress={() => router.push("/account-creation")}
          >
            <Text className="btn--primary__label">Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 items-center justify-center min-h-11"
            onPress={() => router.push("/login")}
          >
            <Text className="font-sans-medium text-accent text-base">Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
