import { View, Text, StyleSheet, TextInput as RNTextInput } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

interface TextInputQuestionProps {
  question: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}

export function TextInputQuestion({
  question,
  placeholder = "Enter your answer...",
  value,
  onChangeText,
  multiline = false,
}: TextInputQuestionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        {question}
      </Text>
      <RNTextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
            color: isDark ? "#FFFFFF" : "#000000",
            minHeight: multiline ? 100 : 48,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#636366" : "#8E8E93"}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});
