import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type ScreenState = "checking-link" | "invalid-link" | "form";

// The recovery `code` is one-time-use, so the exchange must only ever run
// once per link, even though this effect can re-run under React 19 strict
// remounting.
export default function SetNewPassword() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();

  const [screenState, setScreenState] = useState<ScreenState>(() =>
    code ? "checking-link" : "invalid-link"
  );
  const exchangeAttempted = useRef(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!code || exchangeAttempted.current) return;
    exchangeAttempted.current = true;

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      setScreenState(error ? "invalid-link" : "form");
    });
  }, [code]);

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMismatch =
    confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword;
  const canSubmit =
    password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword && !loading;

  const handleUpdatePassword = async () => {
    if (!canSubmit) return;

    setErrorMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setErrorMessage(
        isAuthRetryableFetchError(error)
          ? "Can't connect right now. Check your connection and try again."
          : "We couldn't update your password. Please try again."
      );
      return;
    }

    // The spec requires ending back at Login rather than leaving her signed
    // in on the recovery session updateUser() just used.
    await supabase.auth.signOut();
    setLoading(false);
    router.replace({ pathname: "/login", params: { resetSuccess: "1" } });
  };

  if (screenState === "checking-link") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="screen justify-center items-center">
          <ActivityIndicator color="#4B6B60" />
        </View>
      </SafeAreaView>
    );
  }

  if (screenState === "invalid-link") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="screen justify-center items-center">
          <Text className="font-serif-semibold text-text-primary text-2xl text-center mb-3">
            This link has expired
          </Text>
          <Text className="font-sans text-text-secondary text-base text-center mb-8">
            Password reset links only work once and don&apos;t last long. Request a new one
            to continue.
          </Text>
          <TouchableOpacity
            className="btn--primary"
            onPress={() => router.replace("/forgot-password")}
          >
            <Text className="btn--primary__label">Send a new link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-6 items-center justify-center min-h-11"
            onPress={() => router.replace("/login")}
          >
            <Text className="font-sans-medium text-accent text-base">Back to log in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="screen justify-center">
        <Text className="font-serif-semibold text-text-primary text-3xl text-center mb-8">
          Set new password
        </Text>

        <View className="mb-4">
          <View style={{ position: "relative", justifyContent: "center" }}>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage(null);
              }}
              placeholder="New password"
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
          <Text className="font-sans text-text-secondary text-xs mt-1.5">
            At least 8 characters
          </Text>
          {passwordTooShort ? (
            <Text className="font-sans text-accent text-sm mt-1">
              Password must be at least 8 characters.
            </Text>
          ) : null}
        </View>

        <View className="mb-2">
          <View style={{ position: "relative", justifyContent: "center" }}>
            <TextInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMessage(null);
              }}
              placeholder="Confirm new password"
              placeholderTextColor="#8B8175"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showConfirmPassword}
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
              onPress={() => setShowConfirmPassword((prev) => !prev)}
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
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
          {passwordsMismatch ? (
            <Text className="font-sans text-accent text-sm mt-1.5">
              Passwords don&apos;t match.
            </Text>
          ) : null}
        </View>

        {errorMessage ? (
          <Text className="font-sans text-accent text-sm mt-1 mb-2">{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          className="btn--primary mt-6"
          onPress={handleUpdatePassword}
          disabled={!canSubmit}
          style={{ opacity: !canSubmit ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="btn--primary__label">Update password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
