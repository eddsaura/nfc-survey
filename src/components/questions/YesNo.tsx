import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

interface YesNoProps {
  question: string;
  value: "yes" | "no" | null;
  onSelect: (value: "yes" | "no") => void;
}

export function YesNo({ question, value, onSelect }: YesNoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        {question}
      </Text>
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: value === "yes" ? "#34C759" : isDark ? "#2C2C2E" : "#E5E5EA",
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          onPress={() => onSelect("yes")}
        >
          <Text
            style={[
              styles.buttonText,
              { color: value === "yes" ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            Yes
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: value === "no" ? "#FF3B30" : isDark ? "#2C2C2E" : "#E5E5EA",
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          onPress={() => onSelect("no")}
        >
          <Text
            style={[
              styles.buttonText,
              { color: value === "no" ? "#FFFFFF" : isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            No
          </Text>
        </Pressable>
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
