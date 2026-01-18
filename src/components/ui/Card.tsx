import { View, StyleSheet, ViewStyle } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: "none" | "small" | "medium" | "large";
}

const paddingValues = {
  none: 0,
  small: 12,
  medium: 16,
  large: 24,
};

export function Card({ children, style, padding = "medium" }: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
          padding: paddingValues[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
