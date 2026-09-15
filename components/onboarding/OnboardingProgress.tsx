import { Text, View } from "react-native";

interface Props {
  step: number;
  total: number;
}

// Progress bar width is calculated at runtime, so per the Style Exception
// Rules in AGENTS.md this uses an inline style rather than a NativeWind class.
export function OnboardingProgress({ step, total }: Props) {
  return (
    <View className="mb-6">
      <Text className="font-sans-medium text-text-secondary text-sm">
        {step} of {total}
      </Text>
      <View
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: "#E7E0D6",
          marginTop: 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: "#4B6B60",
            width: `${(step / total) * 100}%`,
          }}
        />
      </View>
    </View>
  );
}
