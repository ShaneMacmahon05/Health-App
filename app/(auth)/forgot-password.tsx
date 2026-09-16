import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

const GENERIC_CONFIRMATION =
  "If an account exists for that email, we've sent a password reset link.";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const canSubmit = email.trim().length > 0 && !loading;

  const handleSendResetLink = async () => {
    if (!canSubmit) return;

    setNetworkError(false);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL("set-new-password"),
    });

    setLoading(false);

    // Supabase itself never reveals whether the email is registered - a
    // non-network error is shown as the same generic confirmation, not
    // branched on, so this screen can't leak that information either.
    if (error && isAuthRetryableFetchError(error)) {
      setNetworkError(true);
      return;
    }

    setConfirmed(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="screen justify-center">
        <Text className="font-serif-semibold text-text-primary text-3xl text-center mb-3">
          Forgot password?
        </Text>
        <Text className="font-sans text-text-secondary text-base text-center mb-8">
          Enter your email and we&apos;ll send you a link to reset your password.
        </Text>

        <View className="mb-2">
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setNetworkError(false);
            }}
            placeholder="Email"
            placeholderTextColor="#8B8175"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E7E0D6",
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#332E27",
              fontFamily: "Inter_400Regular",
            }}
          />
        </View>

        {networkError ? (
          <Text className="font-sans text-accent text-sm mt-1 mb-2">
            Can&apos;t connect right now. Check your connection and try again.
          </Text>
        ) : null}

        {confirmed ? (
          <Text className="font-sans text-accent text-sm mt-1 mb-2">
            {GENERIC_CONFIRMATION}
          </Text>
        ) : null}

        <TouchableOpacity
          className="btn--primary mt-6"
          onPress={handleSendResetLink}
          disabled={!canSubmit}
          style={{ opacity: !canSubmit ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="btn--primary__label">Send reset link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-8 items-center justify-center min-h-11"
          onPress={() => router.back()}
        >
          <Text className="font-sans-medium text-accent text-base">Back to log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
