import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

export default function ResultsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000000" : "#F2F2F7" }]}>
      <Text style={[styles.text, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        Results Screen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});
