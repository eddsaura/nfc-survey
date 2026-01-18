import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

interface RatingScaleProps {
  question: string;
  min?: number;
  max?: number;
  value: number | null;
  onRate: (value: number) => void;
}

export function RatingScale({
  question,
  min = 1,
  max = 5,
  value,
  onRate,
}: RatingScaleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        {question}
      </Text>
      <View style={styles.ratingContainer}>
        {ratings.map((rating) => (
          <Pressable
            key={rating}
            style={({ pressed }) => [
              styles.ratingButton,
              {
                backgroundColor: value === rating
                  ? "#FFD60A"
                  : isDark
                    ? "#2C2C2E"
                    : "#F2F2F7",
                transform: [{ scale: pressed ? 0.9 : 1 }],
              },
            ]}
            onPress={() => onRate(rating)}
          >
            <Text
              style={[
                styles.ratingText,
                { color: value === rating ? "#000000" : isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              {rating}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
          {min}
        </Text>
        <Text style={[styles.label, { color: isDark ? "#8E8E93" : "#6E6E73" }]}>
          {max}
        </Text>
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
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
  },
});
