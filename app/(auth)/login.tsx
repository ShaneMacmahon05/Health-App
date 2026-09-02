import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF6F0" }}>
      <View className="screen justify-center items-center">
        <Text className="font-serif-semibold text-text-primary text-2xl text-center">
          Login — coming soon
        </Text>

        <TouchableOpacity
          className="mt-8 items-center justify-center min-h-11"
          onPress={() => router.back()}
        >
          <Text className="font-sans-medium text-accent text-base">Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
