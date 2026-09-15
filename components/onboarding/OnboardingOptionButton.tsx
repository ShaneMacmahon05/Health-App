import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

// Pressed/selected-state styling on a TouchableOpacity uses StyleSheet per
// AGENTS.md's Style Exception Rules. Selection is shown with a checkmark and
// border/weight change, not colour alone, per the accessibility rules.
export function OnboardingOptionButton({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E0D6",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: "#4B6B60",
    borderWidth: 1.5,
    backgroundColor: "#E4EBE8",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#8B8175",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxSelected: {
    borderColor: "#4B6B60",
    backgroundColor: "#4B6B60",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#332E27",
  },
  labelSelected: {
    fontFamily: "Inter_600SemiBold",
  },
});
