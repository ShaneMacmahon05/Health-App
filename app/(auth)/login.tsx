import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import type { AuthError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { getOnboardingStatus } from "@/lib/onboarding";

type LoginErrorKind = "credentials" | "network" | "unconfirmed" | "onboarding-lookup";

interface LoginError {
  kind: LoginErrorKind;
  message: string;
}

// Maps a signInWithPassword failure to the one generic message it's safe to
// show. Never surfaces a raw Supabase error string, and never reveals
// whether an email is registered.
function describeSignInError(error: AuthError): LoginError {
  if (isAuthRetryableFetchError(error)) {
    return {
      kind: "network",
      message: "Can't connect right now. Check your connection and try again.",
    };
  }

  if (error.code === "email_not_confirmed") {
    return {
      kind: "unconfirmed",
      message: "Please verify your email before logging in.",
    };
  }

  return {
    kind: "credentials",
    message: "That email or password isn't right.",
  };
}

export default function Login() {
  const router = useRouter();
  const { resetSuccess } = useLocalSearchParams<{ resetSuccess?: string }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  // After a successful sign-in, Supabase's row is the only source of truth
  // for whether onboarding is done - a failed lookup must never be treated
  // as "incomplete," so it gets its own retryable error state instead.
  const routeAfterSignIn = async () => {
    const result = await getOnboardingStatus();
    setLoading(false);

    if (result.status === "complete") {
      router.replace("/plan");
      return;
    }

    if (result.status === "incomplete") {
      router.replace("/onboarding");
      return;
    }

    setError({
      kind: "onboarding-lookup",
      message: "We couldn't check your account. Check your connection and try again.",
    });
  };

  const handleLogin = async () => {
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(describeSignInError(signInError));
      return;
    }

    await routeAfterSignIn();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="screen justify-center">
        <Text className="font-serif-semibold text-text-primary text-3xl text-center mb-8">
          Log in
        </Text>

        {resetSuccess ? (
          <Text className="font-sans text-accent text-sm text-center mb-4">
            Password updated. Log in with your new password.
          </Text>
        ) : null}

        <View className="mb-4">
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
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

        <View className="mb-2">
          <View style={{ position: "relative", justifyContent: "center" }}>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              placeholder="Password"
              placeholderTextColor="#8B8175"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              editable={!loading}
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E7E0D6",
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingRight: 64,
                paddingVertical: 14,
                fontSize: 16,
                color: "#332E27",
                fontFamily: "Inter_400Regular",
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              disabled={loading}
              style={{
                position: "absolute",
                right: 4,
                minWidth: 44,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="font-sans-medium text-accent text-sm">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <Text className="font-sans text-accent text-sm mt-1 mb-2">{error.message}</Text>
        ) : null}

        {error?.kind === "onboarding-lookup" ? (
          <TouchableOpacity
            className="items-center justify-center min-h-11 mb-2"
            onPress={() => {
              setError(null);
              setLoading(true);
              routeAfterSignIn();
            }}
          >
            <Text className="font-sans-medium text-accent text-base">Try again</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          className="mt-2 items-start justify-center min-h-11"
          onPress={() => router.push("/forgot-password")}
        >
          <Text className="font-sans-medium text-accent text-base">Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="btn--primary mt-6"
          onPress={handleLogin}
          disabled={!canSubmit}
          style={{ opacity: !canSubmit ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="btn--primary__label">Log in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-8 items-center justify-center min-h-11"
          onPress={() => router.push("/account-creation")}
        >
          <Text className="font-sans text-text-secondary text-base">
            Don&apos;t have an account?{" "}
            <Text className="font-sans-medium text-accent">Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
