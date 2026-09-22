import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { supabase } from "@/lib/supabase";

export default function AccountCreation() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const canSubmit = agreedToTerms && email.length > 0 && password.length > 0;

  const handleCreateAccount = async () => {
    setEmailError(null);
    setPasswordError(null);
    setTermsError(null);

    if (!agreedToTerms) {
      setTermsError("Please agree to the Terms and Privacy Policy to continue.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        setEmailError("That email is already registered.");
      } else if (error.message.toLowerCase().includes("password")) {
        setPasswordError(error.message);
      } else {
        setEmailError(error.message || "Something went wrong. Check your connection and try again.");
      }
      return;
    }

    router.push("/email-verification");
  };

  const handleComingSoon = (provider: string) => {
    Alert.alert("Coming soon", `${provider} sign-in will be available soon.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <View className="screen justify-center">
        <Text className="font-serif-semibold text-text-primary text-3xl text-center mb-8">
          Create your account
        </Text>

        <View className="mb-4">
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(null);
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
              borderColor: emailError ? "#4B6B60" : "#E7E0D6",
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#332E27",
              fontFamily: "Inter_400Regular",
            }}
          />
          {emailError ? (
            <Text className="font-sans text-accent text-sm mt-1.5">{emailError}</Text>
          ) : null}
        </View>

        <View className="mb-2">
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(null);
            }}
            placeholder="Password"
            placeholderTextColor="#8B8175"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={!loading}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: passwordError ? "#4B6B60" : "#E7E0D6",
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#332E27",
              fontFamily: "Inter_400Regular",
            }}
          />
          <Text className="font-sans text-text-secondary text-xs mt-1.5">
            At least 8 characters
          </Text>
          {passwordError ? (
            <Text className="font-sans text-accent text-sm mt-1">{passwordError}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          className="flex-row items-start mt-4 mb-1 min-h-11"
          onPress={() => {
            setAgreedToTerms((prev) => !prev);
            setTermsError(null);
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              borderWidth: 1.5,
              borderColor: "#4B6B60",
              backgroundColor: agreedToTerms ? "#4B6B60" : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              marginTop: 2,
            }}
          >
            {agreedToTerms ? (
              <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>✓</Text>
            ) : null}
          </View>
          <Text className="font-sans text-text-primary text-sm flex-1 flex-wrap">
            I agree to the{" "}
            <Text className="font-sans-medium text-accent">Terms</Text>
            {" "}and{" "}
            <Text className="font-sans-medium text-accent">Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {termsError ? (
          <Text className="font-sans text-accent text-sm mb-2">{termsError}</Text>
        ) : null}

        <TouchableOpacity
          className="btn--primary mt-6"
          onPress={handleCreateAccount}
          disabled={!canSubmit || loading}
          style={{ opacity: !canSubmit || loading ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="btn--primary__label">Create account</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center mt-8 mb-6">
          <View className="flex-1 h-px bg-border" />
          <Text className="font-sans text-text-secondary text-sm mx-3">
            or continue with
          </Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <TouchableOpacity
          onPress={() => handleComingSoon("Google")}
          style={{
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E7E0D6",
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text className="font-sans-medium text-text-primary text-base">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleComingSoon("Apple")}
          style={{
            backgroundColor: "#000000",
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="font-sans-medium text-white text-base">
            Continue with Apple
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-8 items-center justify-center min-h-11"
          onPress={() => router.push("/login")}
        >
          <Text className="font-sans text-text-secondary text-base">
            Already have an account?{" "}
            <Text className="font-sans-medium text-accent">Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
