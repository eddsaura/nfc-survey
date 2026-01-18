import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

interface MultipleChoiceProps {
  question: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
}

export function MultipleChoice({
  question,
  options,
  value,
  onSelect,
}: MultipleChoiceProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        {question}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: value === option
                  ? "#007AFF"
                  : isDark
                    ? "#2C2C2E"
                    : "#F2F2F7",
                borderColor: value === option ? "#007AFF" : "transparent",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={() => onSelect(option)}
          >
            <View
              style={[
                styles.radio,
                {
                  borderColor: value === option ? "#FFFFFF" : isDark ? "#48484A" : "#C7C7CC",
                  backgroundColor: value === option ? "#FFFFFF" : "transparent",
                },
              ]}
            >
              {value === option && <View style={styles.radioInner} />}
            </View>
            <Text
              style={[
                styles.optionText,
                { color: value === option ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
